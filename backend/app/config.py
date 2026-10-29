import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    PROJECT_NAME: str = "PathFinder AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    # Security
    SECRET_KEY: str = "pathfinder_local_dev_key_secure_and_safe_for_testing_123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./pathfinder.db"

    # AI (Gemini)
    GEMINI_API_KEY: str = "mock_dev_key"
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Storage
    STORAGE_TYPE: str = "local"
    STORAGE_DIR: str = "./uploads"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # Integrations
    YOUTUBE_API_KEY: Optional[str] = None
    GOOGLE_CALENDAR_CLIENT_ID: Optional[str] = None
    GOOGLE_CALENDAR_CLIENT_SECRET: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    SENTRY_DSN: Optional[str] = None



settings = Settings()
