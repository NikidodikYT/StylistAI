from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Теперь, благодаря __init__.py файлам, эти импорты сработают как надо
from stylist_ai import crud
from stylist_ai.schemas import User, UserCreate # <-- Вот здесь было главное исправление
from ..deps import get_db

router = APIRouter()

@router.post("/users/", response_model=User, status_code=201)
def create_new_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Эндпоинт для регистрации нового пользователя.
    """
    db_user = crud.user.get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким email уже существует.",
        )
    user = crud.user.create_user(db=db, user=user_in)
    return user
