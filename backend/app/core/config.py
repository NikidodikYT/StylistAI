from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "StylistAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    POSTGRES_USER: str = "stylist"
    POSTGRES_PASSWORD: str = "password123"
    POSTGRES_DB: str = "stylist_db"
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    GEMINI_API_KEY: str = ""
    
    RAPIDAPI_KEY: str = ""
    PRICESCOUT_HOST: str = "pricescout.p.rapidapi.com"
    ASOS_HOST: str = "asos2.p.rapidapi.com"
    HM_HOST: str = "apidojo-hm-hennes-mauritz-v1.p.rapidapi.com"
    
    SCRAPER_API_KEY: str = ""
    
    SERPER_API_KEY: str = "05113a64bcdb41d032011a6e5fe556d3c467add7"

    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()