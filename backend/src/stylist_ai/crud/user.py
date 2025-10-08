# backend/src/stylist_ai/crud/user.py
from sqlalchemy.orm import Session

from stylist_ai.models.user import User # <-- ВОТ ОНО. ПРЯМОЙ ИМПОРТ МОДЕЛИ.
from stylist_ai.schemas import UserCreate
from stylist_ai.core.security import get_password_hash


def get_user_by_email(db: Session, email: str) -> User | None:
    """Ищет пользователя в БД по его email."""
    # Теперь мы используем 'User' напрямую
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    """Создает нового пользователя в БД."""
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
