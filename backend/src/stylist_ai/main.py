from fastapi import FastAPI
from stylist_ai.db.base import Base
from stylist_ai.db.session import engine
from stylist_ai.api.router import router

# Создание таблиц при старте
Base.metadata.create_all(bind=engine)

app = FastAPI(debug=True)
app.include_router(router)
