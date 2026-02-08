import logging
from typing import List, Dict, Optional, Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class HMProvider:
    """
    RapidAPI: apidojo-hm-hennes-mauritz-v1

    Фиксы:
    - 204 => [] (без json())
    - не навязываем ladies_all и concepts по умолчанию (часто даёт пусто)
    - fallback запрос, если первый пустой
    """

    def __init__(self):
        self.base_url = "https://apidojo-hm-hennes-mauritz-v1.p.rapidapi.com"
        self.headers = {
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
            "X-RapidAPI-Host": settings.HM_HOST,
        }
        self.enabled = True

    async def search_products(
        self,
        query: str,
        max_results: int = 10,
        country: str = "us",
        lang: str = "en",
    ) -> List[Dict]:
        if not settings.RAPIDAPI_KEY:
            logger.error("H&M: RAPIDAPI_KEY not configured")
            return []

        if not query or not query.strip():
            return []

        query = query.strip()

        params_primary = {
            "country": country,
            "lang": lang,
            "currentpage": 0,
            "pagesize": max_results,
            "q": query,
        }

        q_lower = query.lower()
        categories: Optional[str] = None
        concepts: Optional[str] = None

        if " men" in f" {q_lower}" or q_lower.endswith(" men") or "mens" in q_lower:
            categories = "men_all"
            concepts = "H&M MAN"
        elif " women" in f" {q_lower}" or q_lower.endswith(" women") or "womens" in q_lower:
            categories = "ladies_all"
            concepts = "DIVIDED"

        params_fallback = {
            "country": country,
            "lang": lang,
            "currentpage": 1,
            "pagesize": max_results,
            "q": query,
        }
        if categories:
            params_fallback["categories"] = categories
        if concepts:
            params_fallback["concepts"] = concepts

        async with httpx.AsyncClient() as client:
            products = await self._call_list(client, params_primary)
            if products:
                return products

            products = await self._call_list(client, params_fallback)
            return products

    async def _call_list(self, client: httpx.AsyncClient, params: Dict[str, Any]) -> List[Dict]:
        try:
            response = await client.get(
                f"{self.base_url}/products/list",
                headers=self.headers,
                params=params,
                timeout=15.0,
            )

            logger.info(f"H&M Response: {response.status_code} (params={self._safe_params_for_log(params)})")

            if response.status_code == 204:
                return []

            if response.status_code != 200:
                logger.warning(
                    f"H&M non-200: {response.status_code}; content-type={response.headers.get('content-type')}"
                )
                return []

            data = response.json()
            return self._parse_results(data)

        except httpx.TimeoutException:
            logger.warning("H&M: Request timeout")
            return []
        except Exception as e:
            logger.error(f"H&M error: {str(e)}", exc_info=True)
            return []

    def _parse_results(self, data: Dict) -> List[Dict]:
        products: List[Dict] = []

        results = data.get("results", []) or []
        for item in results:
            try:
                name = item.get("name", "Unknown")

                price = item.get("price") or {}
                price_value = price.get("value", 0)
                currency = price.get("currencyIso", "USD")

                article_code = item.get("articleCode", "")

                product_url = ""
                if article_code:
                    product_url = f"https://www2.hm.com/en_us/productpage.{article_code}.html"

                image_url = ""
                images = item.get("images") or []
                if isinstance(images, list) and images:
                    first = images[0] if isinstance(images[0], dict) else None
                    if first:
                        image_url = first.get("url") or first.get("baseUrl") or ""
                elif isinstance(images, dict):
                    image_url = images.get("url") or images.get("baseUrl") or ""

                if image_url and not image_url.startswith("http"):
                    if image_url.startswith("//"):
                        image_url = f"https:{image_url}"
                    else:
                        image_url = f"https://{image_url.lstrip('/')}"

                products.append(
                    {
                        "name": name,
                        "price": float(price_value) if price_value else 0.0,
                        "currency": currency,
                        "url": product_url,
                        "image_url": image_url,
                        "brand": "H&M",
                        "marketplace": "hm",
                        "rating": None,
                        "reviews_count": None,
                        "delivery": "",
                    }
                )

            except Exception as e:
                logger.error(f"Error parsing H&M item: {e}", exc_info=True)
                continue

        return products

    def _safe_params_for_log(self, params: Dict[str, Any]) -> Dict[str, Any]:
        out = dict(params)
        q = out.get("q")
        if isinstance(q, str) and len(q) > 80:
            out["q"] = q[:80] + "..."
        return out


hm_provider = HMProvider()
