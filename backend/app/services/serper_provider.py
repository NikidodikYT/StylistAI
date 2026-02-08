"""
Serper.dev - Google Shopping API provider.

Policy:
- Return ONLY product pages:
  1) Merchant product page (preferred) if it doesn't look like a search/listing URL
  2) Google Shopping product card (productLink) if it is /shopping/product/...
- Never return search/listing pages (store search, google search, etc.)
"""

import aiohttp
import logging
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class SerperProvider:
    """Google Shopping через Serper.dev"""
    BASE_URL = "https://google.serper.dev/shopping"

    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.enabled = bool(self.api_key)
        if not self.enabled:
            logger.warning("SERPER_API_KEY not configured, SerperProvider disabled")

    async def search(
        self,
        query: str,
        max_results: int = 10,
        country: str = "us",
        strict_mode: bool = True,  # оставлено для совместимости
    ) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []

        try:
            headers = {
                "X-API-KEY": self.api_key,
                "Content-Type": "application/json",
            }

            # Просим больше, потому что будем жестко фильтровать
            payload = {
                "q": f"{query} buy online",
                "gl": country,
                "hl": "en",
                "num": min(max_results * 4, 80),
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.BASE_URL,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=20),
                ) as response:
                    if response.status != 200:
                        text = await response.text()
                        logger.error(f"Serper error {response.status}: {text}")
                        return []
                    data = await response.json()

            products = self._parse_results_cards_only(data, max_results=max_results)
            logger.info(f"Serper cards-only: returned {len(products)} products")
            return products

        except Exception as e:
            logger.error(f"Serper search error: {e}", exc_info=True)
            return []

    def _parse_results_cards_only(self, data: Dict[str, Any], max_results: int) -> List[Dict[str, Any]]:
        products: List[Dict[str, Any]] = []
        shopping = data.get("shopping", []) or []

        for item in shopping:
            if len(products) >= max_results:
                break

            try:
                title = (item.get("title") or "").strip()
                if not title:
                    continue

                price = self._parse_price(item.get("price"))
                if price <= 0:
                    continue

                image_url = (item.get("imageUrl") or "").strip()
                if not image_url:
                    continue

                merchant_link = (item.get("link") or "").strip()
                product_link = (item.get("productLink") or "").strip()

                url = self._pick_best_url(merchant_link=merchant_link, product_link=product_link)
                if not url:
                    continue

                brand = item.get("source") or "Unknown"

                products.append(
                    {
                        "name": title,
                        "price": price,
                        "currency": "USD",
                        "url": url,
                        "image_url": image_url,
                        "brand": brand,
                        "marketplace": "google_shopping",
                        "rating": item.get("rating"),
                        "reviews_count": item.get("ratingCount"),
                        "delivery": item.get("delivery") or "",
                    }
                )
            except Exception as e:
                logger.warning(f"Serper parse error: {e}", exc_info=True)
                continue

        return products

    def _pick_best_url(self, merchant_link: str, product_link: str) -> str:
        # 1) merchant PDP если это не поисковая/листинговая страница
        if merchant_link and self._is_valid_product_page_url(merchant_link):
            return merchant_link

        # 2) fallback: google shopping product card
        if product_link and self._is_google_product_card_url(product_link):
            return product_link

        return ""

    def _is_google_product_card_url(self, url: str) -> bool:
        u = url.lower()
        # разрешаем только карточку товара в Google Shopping
        return ("google." in u) and ("/shopping/product/" in u)

    def _is_valid_product_page_url(self, url: str) -> bool:
        u = url.lower()

        # режем google search / google shopping search
        if "google.com/search" in u or "tbm=shop" in u:
            return False

        # режем страницы поиска магазинов (то, что ты называл "поиск товаров")
        bad = [
            "/search?",
            "/search/?",
            "/sr?",
            "keyword=",
            "searchterm=",
            # amazon/ebay/hm search patterns
            "/s?k=",
            "/sch/i.html",
            "search-results",
        ]
        return not any(p in u for p in bad)

    def _parse_price(self, price_str: Any) -> float:
        if price_str is None:
            return 0.0
        s = str(price_str)
        cleaned = "".join(c for c in s if c.isdigit() or c == ".")
        if not cleaned:
            return 0.0
        try:
            return float(cleaned)
        except ValueError:
            return 0.0


serper_provider = SerperProvider()
