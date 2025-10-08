# backend/src/stylist_ai/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from stylist_ai.core.config import settings

# "Движок" (Engine) - это сердце SQLAlchemy. Он управляет пулом подключений
# к базе данных. Мы создаем его один раз на все приложение.
# Аналогия: это как включить электростанцию для города.
engine = create_engine(str(settings.DATABASE_URL), pool_pre_ping=True)

# "Фабрика сессий" (SessionLocal). Каждый экземпляр SessionLocal будет
# отдельным "разговором" с базой данных.
# Аналогия: это как телефонный аппарат, который может сделать звонок на электростанцию.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
