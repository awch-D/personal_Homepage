"""
Application configuration
"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://arno:password@localhost:5432/homepage"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # API Keys
    DASHSCOPE_API_KEY: str = ""
    LLM_API_BASE: str = "http://localhost:8317"
    LLM_API_KEY: str = ""
    
    # Admin
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = ""
    ADMIN_API_KEY: str = ""
    JWT_SECRET: str = "change-me-in-production"
    JWT_EXPIRE_HOURS: int = 24
    
    # Cost Limits
    DAILY_EMBEDDING_LIMIT: int = 1000
    DAILY_RERANK_LIMIT: int = 500
    DAILY_LLM_TOKEN_LIMIT: int = 100000
    MONTHLY_BUDGET_CNY: float = 50.0
    
    # Application
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
