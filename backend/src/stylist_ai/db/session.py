import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Строка подключения к БД
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/postgres"
)

# Создание движка
engine = create_engine(DATABASE_URL)

# Фабрика сессий
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Session:
    """
    Зависимость FastAPI для получения сессии БД.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
