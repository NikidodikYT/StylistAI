from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "StylistAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    POSTGRES_USER: str = "stylist"
    POSTGRES_PASSWORD: str = "password123"
    POSTGRES_DB: str = "stylist_db"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI
    GEMINI_API_KEY: str = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # <-- ДОБАВИЛ ЭТО!


settings = Settings()
