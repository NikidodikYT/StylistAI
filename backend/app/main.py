# app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1 import auth, wardrobe, ai
from app.db.session import create_db_and_tables
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Application startup ---")
    await create_db_and_tables()
    print("Database and services ready")
    yield
    print("--- Application shutdown ---")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Подключаем роутеры API v1
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])
app.include_router(
    wardrobe.router,
    prefix=settings.API_V1_STR + "/wardrobe",
    tags=["wardrobe"],
)
app.include_router(ai.router, prefix=settings.API_V1_STR + "/ai", tags=["ai"])


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
