"""
Redis connection and caching utilities
"""
import hashlib
import json
from typing import Optional, Any
import redis.asyncio as redis
import msgpack

from app.core.config import get_settings

settings = get_settings()

# Redis connection pool
redis_pool = redis.ConnectionPool.from_url(
    settings.REDIS_URL,
    decode_responses=False,
)


async def get_redis() -> redis.Redis:
    """Get Redis connection"""
    return redis.Redis(connection_pool=redis_pool)


class CacheManager:
    """Multi-level cache manager"""
    
    # Cache TTL settings (in seconds)
    L1_TTL = 86400      # 24 hours - complete answers
    L2_TTL = 3600       # 1 hour - retrieval results
    L3_TTL = 604800     # 7 days - query embeddings
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    @staticmethod
    def _hash_key(content: str) -> str:
        """Generate MD5 hash for cache key"""
        return hashlib.md5(content.encode()).hexdigest()
    
    async def get_answer(self, query: str, history_hash: str = "") -> Optional[str]:
        """L1: Get cached complete answer"""
        key = f"chat:answer:{self._hash_key(query + history_hash)}"
        data = await self.redis.get(key)
        return data.decode() if data else None
    
    async def set_answer(self, query: str, answer: str, history_hash: str = ""):
        """L1: Cache complete answer"""
        key = f"chat:answer:{self._hash_key(query + history_hash)}"
        await self.redis.setex(key, self.L1_TTL, answer.encode())
    
    async def get_docs(self, query: str) -> Optional[list]:
        """L2: Get cached retrieval results"""
        key = f"chat:docs:{self._hash_key(query)}"
        data = await self.redis.get(key)
        return msgpack.unpackb(data) if data else None
    
    async def set_docs(self, query: str, docs: list):
        """L2: Cache retrieval results"""
        key = f"chat:docs:{self._hash_key(query)}"
        await self.redis.setex(key, self.L2_TTL, msgpack.packb(docs))
    
    async def get_embedding(self, text: str) -> Optional[list]:
        """L3: Get cached embedding"""
        key = f"embedding:query:{self._hash_key(text)}"
        data = await self.redis.get(key)
        return msgpack.unpackb(data) if data else None
    
    async def set_embedding(self, text: str, embedding: list):
        """L3: Cache embedding"""
        key = f"embedding:query:{self._hash_key(text)}"
        await self.redis.setex(key, self.L3_TTL, msgpack.packb(embedding))
    
    async def clear_all(self):
        """Clear all cache"""
        await self.redis.flushdb()


class CostMetrics:
    """API cost tracking using Redis counters"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    async def increment(self, metric: str, value: int = 1):
        """Increment counter"""
        from datetime import date
        today = date.today().isoformat()
        key = f"metrics:{metric}:daily:{today}"
        await self.redis.incrby(key, value)
        await self.redis.expire(key, 86400 * 30)  # 30 days expiry
    
    async def get_daily_stats(self, metric: str, days: int = 7) -> dict:
        """Get stats for last N days"""
        from datetime import date, timedelta
        stats = {}
        for i in range(days):
            d = (date.today() - timedelta(days=i)).isoformat()
            key = f"metrics:{metric}:daily:{d}"
            value = await self.redis.get(key)
            stats[d] = int(value) if value else 0
        return stats
    
    async def get_today_count(self, metric: str) -> int:
        """Get today's count"""
        from datetime import date
        key = f"metrics:{metric}:daily:{date.today().isoformat()}"
        value = await self.redis.get(key)
        return int(value) if value else 0
