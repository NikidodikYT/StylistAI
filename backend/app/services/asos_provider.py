import logging
from typing import List, Dict, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class AsosProvider:
    """Провайдер для поиска товаров через ASOS API (RapidAPI)."""

    def __init__(self):
        self.base_url = "https://asos2.p.rapidapi.com"
        self.headers = {
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
            "X-RapidAPI-Host": settings.ASOS_HOST,
        }

    async def search_products(
        self,
        query: str,
        max_results: int = 10,
        country: str = "US",
        currency: str = "USD",
        lang: str = "en-US",
        category_id: Optional[str] = None,
        sort: str = "relevance",
    ) -> List[Dict]:
        if not settings.RAPIDAPI_KEY:
            logger.error("ASOS: RAPIDAPI_KEY not configured")
            return []

        params = {
            "store": country,
            "offset": 0,
            "limit": max_results,
            "country": country,
            "sort": sort,
            "q": query,
            "currency": currency,
            "sizeSchema": "US",
            "lang": lang,
        }

        if category_id:
            params["categoryId"] = category_id

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/v2/list",
                    headers=self.headers,
                    params=params,
                    timeout=15.0,
                )

            logger.info(f"ASOS Response Status: {response.status_code}")

            if response.status_code != 200:
                logger.error(f"ASOS API error: {response.status_code} - {response.text}")
                return []

            data = response.json()
            return self._parse_results(data)

        except httpx.TimeoutException:
            logger.error("ASOS: Request timeout")
            return []
        except Exception as e:
            logger.error(f"ASOS error: {str(e)}", exc_info=True)
            return []

    def _parse_results(self, data: Dict) -> List[Dict]:
        products: List[Dict] = []
        items = data.get("products", []) or []

        for item in items:
            try:
                price_data = item.get("price", {}) or {}
                current_price = (price_data.get("current", {}) or {}).get("value", 0)
                currency = price_data.get("currency", "USD")

                image_url = item.get("imageUrl", "") or ""
                if image_url and not image_url.startswith("http"):
                    image_url = f"https://{image_url}"

                product_id = item.get("id", "")
                product_url = f"https://www.asos.com/us/prd/{product_id}" if product_id else ""

                products.append(
                    {
                        "name": item.get("name", "Unknown"),
                        "price": float(current_price) if current_price else 0.0,
                        "currency": currency,
                        "url": product_url,
                        "image_url": image_url,
                        "brand": item.get("brandName", "ASOS"),
                        "marketplace": "asos",
                        "rating": None,
                        "reviews_count": None,
                        "delivery": "",
                    }
                )
            except Exception as e:
                logger.error(f"Error parsing ASOS item: {e}", exc_info=True)
                continue

        return products


asos_provider = AsosProvider()
