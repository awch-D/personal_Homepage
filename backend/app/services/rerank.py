"""
Rerank service - Aliyun DashScope GTE-Rerank integration
"""
import httpx
from typing import List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

from app.core.config import get_settings
from app.core.redis import get_redis, CostMetrics

settings = get_settings()
logger = logging.getLogger(__name__)

DASHSCOPE_RERANK_URL = "https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank"


class RerankService:
    """Service for reranking documents using Aliyun DashScope"""
    
    def __init__(self):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.model = "gte-rerank"
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
    )
    async def _call_api(
        self, 
        query: str, 
        documents: List[str],
        top_n: int = 3
    ) -> List[Dict[str, Any]]:
        """Call DashScope rerank API with retry"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                DASHSCOPE_RERANK_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "input": {
                        "query": query,
                        "documents": documents,
                    },
                    "parameters": {
                        "top_n": top_n,
                        "return_documents": True,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
            
            if "output" not in data or "results" not in data["output"]:
                raise ValueError(f"Unexpected API response: {data}")
            
            return data["output"]["results"]
    
    async def rerank(
        self, 
        query: str, 
        documents: List[Dict[str, Any]], 
        top_n: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Rerank documents by relevance to query
        
        Args:
            query: Query text
            documents: List of documents with 'content' field
            top_n: Number of top results to return
        
        Returns:
            List of reranked documents with updated scores
        """
        if not documents:
            return []
        
        # Extract content for reranking
        contents = [doc["content"] for doc in documents]
        
        try:
            # Call rerank API
            results = await self._call_api(query, contents, top_n)
            
            # Track metrics
            redis_client = await get_redis()
            metrics = CostMetrics(redis_client)
            await metrics.increment("rerank")
            
            # Map back to original documents
            reranked = []
            for result in results:
                idx = result["index"]
                doc = documents[idx].copy()
                doc["rerank_score"] = result["relevance_score"]
                reranked.append(doc)
            
            logger.info(f"Reranked {len(documents)} -> {len(reranked)} docs")
            return reranked
            
        except Exception as e:
            # Fallback: return top-N original documents
            logger.warning(f"Rerank failed, using fallback: {e}")
            
            redis_client = await get_redis()
            metrics = CostMetrics(redis_client)
            await metrics.increment("rerank.fallback")
            
            return documents[:top_n]
    
    async def rerank_with_fallback(
        self, 
        query: str, 
        documents: List[Dict[str, Any]], 
        top_n: int = 3
    ) -> List[Dict[str, Any]]:
        """Rerank with graceful fallback"""
        return await self.rerank(query, documents, top_n)


# Singleton instance
rerank_service = RerankService()
