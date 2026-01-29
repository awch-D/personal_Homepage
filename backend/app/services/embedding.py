"""
Embedding service - Aliyun DashScope integration
"""
import httpx
from typing import List, Optional
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

from app.core.config import get_settings
from app.core.redis import get_redis, CacheManager, CostMetrics

settings = get_settings()
logger = logging.getLogger(__name__)

DASHSCOPE_EMBEDDING_URL = "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding"


class EmbeddingService:
    """Service for text embedding using Aliyun DashScope"""
    
    def __init__(self):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.model = "text-embedding-v3"
        self.dimension = 1024
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    async def _call_api(self, texts: List[str]) -> List[List[float]]:
        """Call DashScope embedding API with retry"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                DASHSCOPE_EMBEDDING_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "input": {"texts": texts},
                    "parameters": {"dimension": self.dimension},
                },
            )
            response.raise_for_status()
            data = response.json()
            
            if "output" not in data or "embeddings" not in data["output"]:
                raise ValueError(f"Unexpected API response: {data}")
            
            # Sort by index and extract embeddings
            embeddings = sorted(
                data["output"]["embeddings"], 
                key=lambda x: x["text_index"]
            )
            return [e["embedding"] for e in embeddings]
    
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text with caching"""
        redis_client = await get_redis()
        cache = CacheManager(redis_client)
        metrics = CostMetrics(redis_client)
        
        # Check cache first
        cached = await cache.get_embedding(text)
        if cached:
            logger.debug(f"Embedding cache hit for: {text[:50]}...")
            return cached
        
        # Call API
        logger.info(f"Calling embedding API for: {text[:50]}...")
        embeddings = await self._call_api([text])
        embedding = embeddings[0]
        
        # Cache result
        await cache.set_embedding(text, embedding)
        
        # Track metrics
        await metrics.increment("embedding")
        
        return embedding
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts (batch)"""
        if not texts:
            return []
        
        redis_client = await get_redis()
        metrics = CostMetrics(redis_client)
        
        # For batch, skip individual caching to simplify
        logger.info(f"Batch embedding {len(texts)} texts")
        embeddings = await self._call_api(texts)
        
        # Track metrics
        await metrics.increment("embedding", len(texts))
        
        return embeddings


# Singleton instance
embedding_service = EmbeddingService()
