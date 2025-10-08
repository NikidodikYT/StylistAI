# backend/src/stylist_ai/models/user.py
from sqlalchemy.orm import Mapped, mapped_column
from stylist_ai.db.base import Base

class User(Base):
    __tablename__ = "users"

    # Mapped[int] - связывает тип данных в Python (int) с типом в БД (INTEGER)
    # mapped_column - настраивает детали столбца в таблице
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    # В следующем шаге мы добавим сюда поле hashed_password: Mapped[str]
