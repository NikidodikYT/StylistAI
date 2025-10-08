# backend/src/stylist_ai/api/deps.py
from stylist_ai.db.session import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
