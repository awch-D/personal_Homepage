"""
Admin API endpoints
"""
from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import json

from app.core.config import get_settings
from app.core.auth import (
    verify_password, 
    create_access_token, 
    get_current_admin,
)
from app.services.captcha import captcha_service
from app.core.redis import get_redis, CacheManager
from app.services.cost_monitor import cost_monitor

settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])


# ==================== Models ====================

class LoginRequest(BaseModel):
    username: str
    password: str
    captcha_id: str
    captcha_code: str


@router.get("/captcha")
async def get_captcha():
    """Generate captcha"""
    captcha_id, code, image_base64 = captcha_service.generate()
    await captcha_service.save_code(captcha_id, code)
    # The image is already a data URI
    return {"captcha_id": captcha_id, "image": image_base64}


class LoginResponse(BaseModel):
    success: bool
    message: str


class AdminUser(BaseModel):
    username: str


# ==================== Auth Endpoints ====================

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response):
    """Admin login endpoint"""
    # Verify captcha first
    if not await captcha_service.verify(request.captcha_id, request.captcha_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )

    # Verify credentials
    if request.username != settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    if not settings.ADMIN_PASSWORD_HASH:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin password not configured",
        )
    
    if not verify_password(request.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Create token
    access_token = create_access_token(
        data={"sub": request.username},
        expires_delta=timedelta(hours=settings.JWT_EXPIRE_HOURS)
    )
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.JWT_EXPIRE_HOURS * 3600,
    )
    
    return LoginResponse(success=True, message="Login successful")


@router.post("/logout")
async def logout(response: Response):
    """Admin logout endpoint"""
    response.delete_cookie("access_token")
    return {"success": True, "message": "Logged out"}


@router.get("/me", response_model=AdminUser)
async def get_current_user(admin: dict = Depends(get_current_admin)):
    """Get current admin user"""
    return AdminUser(username=admin["username"])


# ==================== Dashboard Endpoints ====================

@router.get("/dashboard/overview")
async def get_dashboard_overview(admin: dict = Depends(get_current_admin)):
    """Get dashboard overview data"""
    data = await cost_monitor.get_dashboard_data()
    
    # Add cache stats
    redis_client = await get_redis()
    info = await redis_client.info("memory")
    
    daily_breakdown = data["daily"]["breakdown"]
    
    return {
        "total_requests": daily_breakdown.get("llm.requests", {}).get("count", 0),
        "total_tokens": daily_breakdown.get("llm.tokens", {}).get("count", 0),
        "total_cost": data["daily"]["total_cost"],
        "cache": {
            "memory_used": info.get("used_memory_human", "N/A"),
            "keys": await redis_client.dbsize(),
        }
    }


@router.get("/dashboard/metrics")
async def get_dashboard_metrics(
    days: int = 7,
    admin: dict = Depends(get_current_admin)
):
    """Get detailed metrics for last N days"""
    from app.core.redis import CostMetrics
    
    redis_client = await get_redis()
    metrics = CostMetrics(redis_client)
    
    result = {}
    for metric in ["embedding", "rerank", "llm.requests", "llm.tokens"]:
        result[metric] = await metrics.get_daily_stats(metric, days)
    
    return result


@router.get("/dashboard/health")
async def get_health_status(admin: dict = Depends(get_current_admin)):
    """Get system health status"""
    from sqlalchemy import text
    from app.core.database import engine
    
    health = {
        "database": "unknown",
        "redis": "unknown",
        "overall": "unknown",
    }
    
    # Check database
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health["database"] = "healthy"
    except Exception as e:
        health["database"] = f"unhealthy: {str(e)}"
    
    # Check Redis
    try:
        redis_client = await get_redis()
        await redis_client.ping()
        health["redis"] = "healthy"
    except Exception as e:
        health["redis"] = f"unhealthy: {str(e)}"
    
    # Overall status
    if health["database"] == "healthy" and health["redis"] == "healthy":
        health["overall"] = "healthy"
    else:
        health["overall"] = "degraded"
    
    return health


# ==================== Cache Management ====================

@router.post("/cache/clear")
async def clear_cache(
    cache_type: Optional[str] = None,
    admin: dict = Depends(get_current_admin)
):
    """
    Clear cache
    
    Args:
        cache_type: Optional type to clear (answers, docs, embeddings, all)
    """
    redis_client = await get_redis()
    
    if cache_type == "all" or cache_type is None:
        await redis_client.flushdb()
        return {"success": True, "message": "All cache cleared"}
    
    # Clear specific type
    pattern_map = {
        "answers": "chat:answer:*",
        "docs": "chat:docs:*",
        "embeddings": "embedding:*",
    }
    
    pattern = pattern_map.get(cache_type)
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid cache type: {cache_type}",
        )
    
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)
    
    return {
        "success": True, 
        "message": f"Cleared {len(keys)} keys matching {cache_type}"
    }
