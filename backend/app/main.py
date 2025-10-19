from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base

# Импорт всех моделей
from app.models.user import User  # noqa
from app.models.clothing import ClothingItem, AIAnalysis  # noqa

# Импорт всех роутеров
from app.api.v1 import auth, wardrobe, ai

# Импорт Gemini сервиса (ДОБАВИЛ ЭТО!)
from app.services.gemini_service import gemini_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered Fashion Stylist Backend API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение всех роутеров
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(wardrobe.router, prefix=f"{settings.API_V1_STR}/wardrobe", tags=["Wardrobe"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI"])

@app.on_event("startup")
async def startup():
    """Создание таблиц БД и инициализация AI при запуске"""
    # Создание таблиц
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")
    
    # Инициализация Gemini AI (ДОБАВИЛ ЭТО!)
    if settings.GEMINI_API_KEY:
        gemini_service.init_model(settings.GEMINI_API_KEY)
        print("✅ Gemini AI initialized")
    else:
        print("⚠️ GEMINI_API_KEY not set in .env - AI will be unavailable")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to StylistAI API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "StylistAI Backend"}
