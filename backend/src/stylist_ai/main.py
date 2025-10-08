# backend/src/stylist_ai/main.py
from fastapi import FastAPI
from stylist_ai.api.router import api_router # <-- ДОБАВИТЬ ИМПОРТ

app = FastAPI(title="StylistAI API")

app.include_router(api_router, prefix="/api/v1") # <-- ДОБАВИТЬ ЭТУ СТРОКУ

@app.get("/")
def read_root():
    return {"message": "Welcome to StylistAI Backend"}
