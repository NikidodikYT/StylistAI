from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Создаём базовый класс для моделей
Base = declarative_base()

# Создаём асинхронный движок
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# Создаём фабрику сессий
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db():
    """Dependency для получения сессии БД"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_db_and_tables():
    """Создаёт все таблицы в базе данных"""
    from app.models import user, clothing, ai_analysis
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✓ Database tables created successfully")