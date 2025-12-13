"""
Serper.dev - Google Shopping API провайдер.
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
        strict_mode: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Поиск товаров через Serper.dev Google Shopping.
        
        strict_mode=True: только прямые ссылки на магазины
        strict_mode=False: fallback на поисковые ссылки если нет прямых
        """
        if not self.enabled:
            return []

        try:
            headers = {
                "X-API-KEY": self.api_key,
                "Content-Type": "application/json",
            }

            enhanced_query = f"{query} buy online"

            payload = {
                "q": enhanced_query,
                "gl": country,
                "hl": "en",
                "num": min(max_results * 2, 40),
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.BASE_URL,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as response:
                    if response.status != 200:
                        text = await response.text()
                        logger.error(f"Serper error {response.status}: {text}")
                        return []

                    data = await response.json()
                    
                    # Пробуем строгий режим
                    strict_products = self._parse_results(
                        data, max_results, strict=True
                    )
                    
                    if strict_products:
                        logger.info(
                            f"Serper strict mode: found {len(strict_products)} direct links"
                        )
                        return strict_products
                    
                    # Если strict_mode и ничего не нашли - возвращаем пусто
                    if strict_mode:
                        logger.warning("Serper strict mode: no direct links found")
                        return []
                    
                    # Fallback: разрешаем поисковые ссылки
                    logger.warning(
                        "Serper: no direct links, falling back to search URLs"
                    )
                    return self._parse_results(data, max_results, strict=False)

        except Exception as e:
            logger.error(f"Serper search error: {e}", exc_info=True)
            return []

    def _parse_results(
        self,
        data: Dict[str, Any],
        max_results: int,
        strict: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Парсинг ответа Serper.
        
        strict=True: только прямые URL магазинов
        strict=False: разрешаем Google Shopping search URLs
        """
        products: List[Dict[str, Any]] = []

        shopping = data.get("shopping", []) or []
        for item in shopping:
            if len(products) >= max_results:
                break

            try:
                title = item.get("title") or ""
                if not title:
                    continue

                price_raw = item.get("price", "0")
                price = self._parse_price(price_raw)
                if price <= 0:
                    continue

                # Приоритет: link (обычно прямой URL) > productLink
                direct_url = item.get("link") or item.get("productLink") or ""

                # В strict режиме - только реальные магазины
                if strict:
                    # Если google.com в URL или пусто - пробуем достать магазин
                    if not direct_url or "google.com" in direct_url:
                        source = item.get("source", "") or ""
                        direct_url = self._build_store_url(source, title)
                    
                    # Строгая проверка: никакого google.com
                    if not direct_url or "google.com" in direct_url:
                        continue
                else:
                    # Fallback режим: разрешаем поисковые URL
                    if not direct_url or "google.com/search" in direct_url:
                        source = item.get("source", "") or ""
                        direct_url = self._build_store_search_url(source, title)
                    
                    if not direct_url:
                        continue

                image_url = item.get("imageUrl") or ""
                if not image_url:
                    continue

                brand = item.get("source") or "Unknown"

                product: Dict[str, Any] = {
                    "name": title,
                    "price": price,
                    "currency": "USD",
                    "url": direct_url,
                    "image_url": image_url,
                    "brand": brand,
                    "marketplace": "google_shopping",
                    "rating": item.get("rating"),
                    "reviews_count": item.get("ratingCount"),
                    "delivery": item.get("delivery") or "",
                }

                products.append(product)

            except Exception as e:
                logger.warning(f"Serper parse error: {e}", exc_info=True)
                continue

        return products

    def _build_store_url(self, store: str, product_name: str) -> str:
        """
        Строит прямую ссылку на магазин (БЕЗ google.com fallback).
        Для strict режима.
        """
        import urllib.parse

        product_query = urllib.parse.quote_plus(product_name)
        store_lower = (store or "").lower()

        store_urls = {
            "amazon": f"https://www.amazon.com/s?k={product_query}",
            "ebay": f"https://www.ebay.com/sch/i.html?_nkw={product_query}",
            "nordstrom": f"https://www.nordstrom.com/sr?keyword={product_query}",
            "asos": f"https://www.asos.com/us/search/?q={product_query}",
            "h&m": f"https://www2.hm.com/en_us/search-results.html?q={product_query}",
            "zara": f"https://www.zara.com/us/en/search?searchTerm={product_query}",
            "uniqlo": f"https://www.uniqlo.com/us/en/search?q={product_query}",
            "nike": f"https://www.nike.com/w?q={product_query}",
            "macy": f"https://www.macys.com/shop/featured/{product_query}",
            "walmart": f"https://www.walmart.com/search?q={product_query}",
        }

        for key, url in store_urls.items():
            if key in store_lower:
                return url

        # НЕТ FALLBACK на google.com
        return ""

    def _build_store_search_url(self, store: str, product_name: str) -> str:
        """
        Строит ссылку: магазин если знаем, иначе Google Shopping.
        Для fallback режима.
        """
        import urllib.parse

        product_query = urllib.parse.quote_plus(product_name)
        store_lower = (store or "").lower()

        store_urls = {
            "amazon": f"https://www.amazon.com/s?k={product_query}",
            "ebay": f"https://www.ebay.com/sch/i.html?_nkw={product_query}",
            "nordstrom": f"https://www.nordstrom.com/sr?keyword={product_query}",
            "asos": f"https://www.asos.com/us/search/?q={product_query}",
            "h&m": f"https://www2.hm.com/en_us/search-results.html?q={product_query}",
            "zara": f"https://www.zara.com/us/en/search?searchTerm={product_query}",
            "uniqlo": f"https://www.uniqlo.com/us/en/search?q={product_query}",
            "nike": f"https://www.nike.com/w?q={product_query}",
            "macy": f"https://www.macys.com/shop/featured/{product_query}",
            "walmart": f"https://www.walmart.com/search?q={product_query}",
        }

        for key, url in store_urls.items():
            if key in store_lower:
                return url

        # FALLBACK на Google Shopping
        return f"https://www.google.com/search?tbm=shop&q={product_query}"

    def _parse_price(self, price_str: Any) -> float:
        """Парсит цену из строки."""
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
