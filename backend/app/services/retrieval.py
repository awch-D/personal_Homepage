"""
Retrieval service - Vector search with pgvector
"""
from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.redis import get_redis, CacheManager
from app.services.embedding import embedding_service

logger = logging.getLogger(__name__)


class RetrievalService:
    """Service for vector similarity search"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def search(
        self, 
        query: str, 
        top_k: int = 10, 
        threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using vector similarity
        
        Args:
            query: Search query text
            top_k: Number of results to return
            threshold: Minimum similarity score (0-1)
        
        Returns:
            List of documents with content and similarity score
        """
        # Check cache first
        redis_client = await get_redis()
        cache = CacheManager(redis_client)
        
        cached_docs = await cache.get_docs(query)
        if cached_docs:
            logger.debug(f"Docs cache hit for: {query[:50]}...")
            return cached_docs
        
        # Get query embedding
        query_embedding = await embedding_service.embed_text(query)
        
        # Convert to string for SQL
        embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        
        # Vector similarity search using cosine distance
        # 1 - cosine_distance = cosine_similarity
        # Note: asyncpg requires positional params ($1, $2)
        sql = text(f"""
            SELECT 
                content,
                source_type,
                source_id,
                1 - (embedding <=> '{embedding_str}'::vector) as similarity
            FROM embeddings
            WHERE 1 - (embedding <=> '{embedding_str}'::vector) >= :threshold
            ORDER BY embedding <=> '{embedding_str}'::vector
            LIMIT :limit
        """)
        
        result = await self.db.execute(
            sql,
            {
                "threshold": threshold,
                "limit": top_k,
            }
        )
        
        rows = result.fetchall()
        
        docs = [
            {
                "content": row.content,
                "source_type": row.source_type,
                "source_id": row.source_id,
                "similarity": float(row.similarity),
            }
            for row in rows
        ]
        
        # Cache results
        if docs:
            await cache.set_docs(query, docs)
        
        logger.info(f"Retrieved {len(docs)} docs for: {query[:50]}...")
        return docs
    
    async def search_with_empty_fallback(
        self, 
        query: str, 
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Search with fallback message for empty results"""
        docs = await self.search(query, top_k)
        
        if not docs:
            logger.warning(f"No results found for: {query}")
            return [{
                "content": "抱歉，我没有找到与您问题相关的信息。您可以尝试问一些关于我的技能、项目经验或工作经历的问题。",
                "source_type": "fallback",
                "source_id": None,
                "similarity": 0.0,
            }]
        
        return docs
