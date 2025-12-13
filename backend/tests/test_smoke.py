"""
Smoke-тесты для проверки базовой функциональности API.
Один TestClient на весь модуль — решает проблему с asyncpg/lifespan.
"""
import os
import sys
import uuid

import pytest
from starlette.testclient import TestClient

# Гарантируем, что корень проекта в sys.path
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app  # noqa: E402


# ============================================================
# ФИКСТУРА: один TestClient на весь модуль тестов
# ============================================================
@pytest.fixture(scope="module")
def client():
    """
    Создаём TestClient один раз для всего модуля.
    Это критично для async SQLAlchemy + asyncpg:
    при scope="function" каждый тест пересоздаёт lifespan,
    что вызывает 'another operation is in progress'.
    """
    with TestClient(app) as c:
        yield c


# ============================================================
# ХЕЛПЕРЫ
# ============================================================
def make_unique_email(base: str = "test@example.com") -> str:
    local, domain = base.split("@", 1)
    return f"{local}+{uuid.uuid4().hex[:8]}@{domain}"


def make_unique_username(base: str = "testuser") -> str:
    return f"{base}_{uuid.uuid4().hex[:8]}"


def register_and_login(client: TestClient) -> tuple[str, str]:
    """
    Регистрирует нового юзера и логинится.
    Возвращает (email, access_token).
    """
    email = make_unique_email("smoke@example.com")
    username = make_unique_username("smokeuser")
    password = "TestPassword123!"

    # Регистрация
    payload = {
        "email": email,
        "password": password,
        "username": username,
        "full_name": "Smoke Test User",
        "gender": "other",
        "age": 25,
        "style_preferences": "casual",
        "favorite_brands": "Test Brand",
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201, f"Register failed: {resp.text}"

    # Логин
    login_data = {
        "username": email,
        "password": password,
        "grant_type": "password",
    }
    resp = client.post("/api/v1/auth/login", data=login_data)
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    
    token = resp.json()["access_token"]
    return email, token


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ============================================================
# ТЕСТЫ
# ============================================================
class TestAuth:
    """Тесты авторизации."""

    def test_register_and_login(self, client: TestClient):
        """Проверяем регистрацию и логин."""
        email, token = register_and_login(client)
        assert token
        assert "@" in email

    def test_login_wrong_password(self, client: TestClient):
        """Неверный пароль должен давать 401."""
        # Сначала регистрируем
        email = make_unique_email("wrongpass@example.com")
        username = make_unique_username("wrongpass")
        
        payload = {
            "email": email,
            "password": "CorrectPassword123!",
            "username": username,
            "full_name": "Test User",
            "gender": "other",
            "age": 25,
        }
        resp = client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 201

        # Пробуем логин с неверным паролем
        login_data = {
            "username": email,
            "password": "WrongPassword999!",
            "grant_type": "password",
        }
        resp = client.post("/api/v1/auth/login", data=login_data)
        assert resp.status_code == 401


class TestWardrobe:
    """Тесты гардероба."""

    def test_unauthorized_access(self, client: TestClient):
        """Без токена должен быть 401."""
        resp = client.get("/api/v1/wardrobe/")
        assert resp.status_code == 401

    def test_crud_flow(self, client: TestClient):
        """Полный CRUD: загрузка → список → получение → удаление."""
        _, token = register_and_login(client)
        headers = auth_header(token)

        # 1) Загрузка вещи
        fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 100
        files = {"file": ("test.png", fake_png, "image/png")}
        params = {
            "category": "tshirt",
            "color": "black",
            "brand": "TestBrand",
            "description": "Test T-shirt",
        }
        resp = client.post(
            "/api/v1/wardrobe/upload",
            headers=headers,
            params=params,
            files=files,
        )
        assert resp.status_code == 201, f"Upload failed: {resp.text}"
        item = resp.json()
        item_id = item["id"]

        # 2) Список гардероба
        resp = client.get("/api/v1/wardrobe/", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert any(i["id"] == item_id for i in data["items"])

        # 3) Получение по ID
        resp = client.get(f"/api/v1/wardrobe/{item_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == item_id

        # 4) Удаление
        resp = client.delete(f"/api/v1/wardrobe/{item_id}", headers=headers)
        assert resp.status_code == 204

        # 5) После удаления — 404
        resp = client.get(f"/api/v1/wardrobe/{item_id}", headers=headers)
        assert resp.status_code == 404

    def test_upload_non_image_rejected(self, client: TestClient):
        """Загрузка не-картинки должна давать 400."""
        _, token = register_and_login(client)
        headers = auth_header(token)

        files = {"file": ("test.txt", b"not an image", "text/plain")}
        resp = client.post(
            "/api/v1/wardrobe/upload",
            headers=headers,
            files=files,
        )
        assert resp.status_code == 400


class TestHealthCheck:
    """Базовые проверки что сервер жив."""

    def test_docs_available(self, client: TestClient):
        """Swagger UI доступен."""
        resp = client.get("/docs")
        assert resp.status_code == 200

    def test_openapi_schema(self, client: TestClient):
        """OpenAPI схема отдаётся."""
        resp = client.get("/openapi.json")
        assert resp.status_code == 200
        assert "paths" in resp.json()
