from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.models.user import User
from app.models.clothing import ClothingItem, AIAnalysis
from app.api.v1 import auth, wardrobe, ai
from app.services.gemini_service import gemini_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered Fashion Stylist Backend API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(wardrobe.router, prefix=f"{settings.API_V1_STR}/wardrobe", tags=["Wardrobe"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")
    
    if settings.GEMINI_API_KEY:
        gemini_service.init_model(settings.GEMINI_API_KEY)
        print("Gemini AI initialized")
    else:
        print("GEMINI_API_KEY not set - AI unavailable")

@app.get("/")
async def root():
    return {
        "message": "Welcome to StylistAI API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "StylistAI Backend"}
