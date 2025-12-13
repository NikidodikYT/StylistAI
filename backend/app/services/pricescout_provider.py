# app/services/pricescout_provider.py

import httpx
from typing import List, Dict

from app.core.config import settings


class PriceScoutProvider:
    """Провайдер для поиска товаров через PriceScout API (Myntra, FlipKart, Amazon India)."""

    def __init__(self) -> None:
        self.base_url = "https://pricescout.p.rapidapi.com"
        self.headers = {
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
            "X-RapidAPI-Host": settings.PRICESCOUT_HOST,
            "Content-Type": "application/json",
        }

    async def search_products(
        self,
        query: str,
        max_results: int = 10,
    ) -> List[Dict]:
        """
        Поиск товаров по запросу.

        Args:
            query: Поисковый запрос (например, "blue denim jacket").
            max_results: Максимум результатов.
        """
        if not settings.RAPIDAPI_KEY:
            print("ERROR: RAPIDAPI_KEY not configured")
            return []

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/search",
                    headers=self.headers,
                    json={
                        "query": query,
                        "limit": max_results,
                    },
                    timeout=15.0,
                )

            print(f"PriceScout Response Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                return self._parse_results(data)
            else:
                print(f"PriceScout API error: {response.status_code} - {response.text}")
                return []
        except httpx.TimeoutException:
            print("PriceScout: Request timeout")
            return []
        except Exception as e:
            print(f"PriceScout error: {str(e)}")
            return []

    def _parse_results(self, data: Dict) -> List[Dict]:
        """Парсинг и фильтрация ответа API."""
        products: List[Dict] = []

        # Пробуем разные структуры ответа
        items = (
            data.get("products", [])
            or data.get("results", [])
            or data.get("data", {}).get("products", [])
            or []
        )

        for item in items:
            try:
                name = (
                    item.get("title")
                    or item.get("name")
                    or item.get("productName")
                    or "Unknown"
                )

                # Цена
                raw_price = item.get("price") or item.get("currentPrice") or 0
                try:
                    price = float(raw_price) if raw_price else 0.0
                except (TypeError, ValueError):
                    price = 0.0

                currency = item.get("currency", "INR")
                url = item.get("url") or item.get("product_url") or item.get("link", "")
                image_url = (
                    item.get("image")
                    or item.get("image_url")
                    or item.get("imageUrl")
                    or ""
                )
                brand = item.get("brand", "")

                # Базовая фильтрация: без цены/картинки/URL не показываем
                if price <= 0 or not url or not image_url:
                    continue

                # Доп. фильтрация мусора вроде "1-48 of 177 results Sort by: Featured ..."
                name_lower = str(name).lower()
                junk_patterns = [
                    "results sort by",
                    "sort by: featured",
                    "buy products online at best price",
                    "all categories | flipkart.com",
                    "amazon.in :",
                ]
                if any(pattern in name_lower for pattern in junk_patterns):
                    continue

                product = {
                    "name": name,
                    "price": price,
                    "currency": currency,
                    "url": url,
                    "image_url": image_url,
                    "brand": brand,
                    "marketplace": "pricescout",
                }

                products.append(product)

            except Exception as e:
                print(f"Error parsing PriceScout item: {e}")
                continue

        return products


# Singleton
pricescout_provider = PriceScoutProvider()
