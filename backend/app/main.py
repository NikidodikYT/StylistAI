# app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

# ✅ STATIC: отдаём /uploads/... из папки uploads (в контейнере это /app/uploads)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routers
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])
app.include_router(wardrobe.router, prefix=settings.API_V1_STR + "/wardrobe", tags=["wardrobe"])
app.include_router(ai.router, prefix=settings.API_V1_STR + "/ai", tags=["ai"])


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
