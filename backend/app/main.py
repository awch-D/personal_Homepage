"""
Personal Homepage + AI Agent Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.chat import router as chat_router
from app.api.admin import router as admin_router
from app.api.profile import router as profile_router

settings = get_settings()

app = FastAPI(
    title="Personal Homepage API",
    description="AI Agent powered personal homepage backend",
    version="1.0.0",
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(profile_router, prefix="/api/profile", tags=["profile"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/api")
async def root():
    """API root"""
    return {
        "message": "Personal Homepage API",
        "docs": "/api/docs" if settings.DEBUG else None,
    }
