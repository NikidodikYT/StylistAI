from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from stylist_ai.db.session import get_db
from stylist_ai.crud.user import get_user_by_email, create_user, hash_password
from stylist_ai.schemas.user import UserCreate, UserOut

router = APIRouter()

@router.post("/", response_model=UserOut, status_code=201)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user_in.password)
    user = create_user(db, user_in.email, hashed)
    return user
