"""
Cost monitoring and alerting service
"""
from datetime import date, timedelta
from typing import Dict, Any
import logging

from app.core.config import get_settings
from app.core.redis import get_redis, CostMetrics

settings = get_settings()
logger = logging.getLogger(__name__)

# Cost per API call (in CNY)
COST_TABLE = {
    "embedding": 0.0005,      # ~0.5元/千次
    "rerank": 0.003,          # ~3元/千次
    "llm.tokens": 0.000002,   # ~2元/百万token
    "llm.requests": 0.001,    # 估算每次请求成本
}


class CostMonitor:
    """Monitor and alert on API costs"""
    
    def __init__(self):
        self.daily_limit = settings.DAILY_EMBEDDING_LIMIT
        self.monthly_budget = settings.MONTHLY_BUDGET_CNY
    
    async def get_daily_cost(self) -> Dict[str, Any]:
        """Get today's cost breakdown"""
        redis_client = await get_redis()
        metrics = CostMetrics(redis_client)
        
        costs = {}
        total = 0.0
        
        for metric, unit_cost in COST_TABLE.items():
            count = await metrics.get_today_count(metric)
            cost = count * unit_cost
            costs[metric] = {
                "count": count,
                "cost": round(cost, 4),
            }
            total += cost
        
        return {
            "date": date.today().isoformat(),
            "breakdown": costs,
            "total_cost": round(total, 4),
            "daily_budget": round(self.monthly_budget / 30, 2),
        }
    
    async def get_monthly_cost(self) -> Dict[str, Any]:
        """Get current month's cost"""
        redis_client = await get_redis()
        
        total = 0.0
        days_in_month = 31
        keys = []
        metrics_list = list(COST_TABLE.keys())
        
        # Collect all keys for the current month
        for i in range(days_in_month):
            d = date.today() - timedelta(days=i)
            if d.month != date.today().month:
                break
            for metric in metrics_list:
                keys.append(f"metrics:{metric}:daily:{d.isoformat()}")
        
        if not keys:
            return {
                "month": date.today().strftime("%Y-%m"),
                "total_cost": 0.0,
                "budget": self.monthly_budget,
                "remaining": self.monthly_budget,
                "percentage": 0.0,
            }

        # Batch fetch from Redis
        values = await redis_client.mget(keys)
        
        # Calculate total
        for key, value in zip(keys, values):
            if value:
                # Extract metric from key: "metrics:{metric}:daily:..."
                metric = key.split(":")[1]
                unit_cost = COST_TABLE.get(metric, 0)
                total += int(value) * unit_cost
        
        return {
            "month": date.today().strftime("%Y-%m"),
            "total_cost": round(total, 2),
            "budget": self.monthly_budget,
            "remaining": round(self.monthly_budget - total, 2),
            "percentage": round((total / self.monthly_budget) * 100, 1) if self.monthly_budget > 0 else 0,
        }
    
    async def check_limits(self, monthly_stats: Dict[str, Any] = None) -> Dict[str, Any]:
        """Check if any limits are exceeded"""
        redis_client = await get_redis()
        metrics = CostMetrics(redis_client)
        
        warnings = []
        
        # Check embedding limit
        embedding_count = await metrics.get_today_count("embedding")
        if embedding_count >= settings.DAILY_EMBEDDING_LIMIT:
            warnings.append({
                "type": "embedding_limit",
                "message": f"Daily embedding limit reached: {embedding_count}/{settings.DAILY_EMBEDDING_LIMIT}",
                "severity": "high",
            })
        elif embedding_count >= settings.DAILY_EMBEDDING_LIMIT * 0.8:
            warnings.append({
                "type": "embedding_warning",
                "message": f"Approaching embedding limit: {embedding_count}/{settings.DAILY_EMBEDDING_LIMIT}",
                "severity": "medium",
            })
        
        # Check monthly budget
        monthly = monthly_stats or await self.get_monthly_cost()
        if monthly["percentage"] >= 100:
            warnings.append({
                "type": "budget_exceeded",
                "message": f"Monthly budget exceeded: {monthly['total_cost']}/{monthly['budget']} CNY",
                "severity": "critical",
            })
        elif monthly["percentage"] >= 80:
            warnings.append({
                "type": "budget_warning",
                "message": f"Approaching monthly budget: {monthly['percentage']}% used",
                "severity": "high",
            })
        
        return {
            "status": "critical" if any(w["severity"] == "critical" for w in warnings) else 
                     "warning" if warnings else "ok",
            "warnings": warnings,
        }
    
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get complete dashboard data"""
        # Optimize by getting data in one flow
        daily = await self.get_daily_cost()
        monthly = await self.get_monthly_cost()
        limits = await self.check_limits(monthly_stats=monthly)
        
        return {
            "daily": daily,
            "monthly": monthly,
            "limits": limits,
        }


# Singleton instance
cost_monitor = CostMonitor()
