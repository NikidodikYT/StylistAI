import httpx
from typing import List, Dict
from app.core.config import settings


class HMProvider:
    def __init__(self):
        self.base_url = "https://apidojo-hm-hennes-mauritz-v1.p.rapidapi.com"
        self.headers = {
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
            "X-RapidAPI-Host": settings.HM_HOST
        }
    
    async def search_products(
        self,
        query: str,
        max_results: int = 10,
        country: str = "us",
        lang: str = "en"
    ) -> List[Dict]:
        if not settings.RAPIDAPI_KEY:
            print("ERROR: RAPIDAPI_KEY not configured")
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/list",
                    headers=self.headers,
                    params={
                        "country": country,
                        "lang": lang,
                        "currentpage": 0,
                        "pagesize": max_results,
                        "categories": "ladies_all",
                        "concepts": "H&M HOME,DIVIDED,H&M MAN",
                        "q": query
                    },
                    timeout=15.0
                )
                
                print(f"H&M Response: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_results(data)
                else:
                    print(f"H&M error: {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"H&M error: {str(e)}")
            return []
    
    def _parse_results(self, data: Dict) -> List[Dict]:
        products = []
        results = data.get("results", [])
        
        for item in results:
            try:
                name = item.get("name", "Unknown")
                price_value = item.get("price", {}).get("value", 0)
                currency = item.get("price", {}).get("currencyIso", "USD")
                article_code = item.get("articleCode", "")
                
                product_url = ""
                if article_code:
                    product_url = f"https://www2.hm.com/en_us/productpage.{article_code}.html"
                
                images = item.get("images", [])
                image_url = ""
                if images:
                    image_url = images.get("url", "")
                    if image_url and not image_url.startswith("http"):
                        image_url = f"https:{image_url}"
                
                product = {
                    "name": name,
                    "price": float(price_value) if price_value else 0.0,
                    "currency": currency,
                    "url": product_url,
                    "image_url": image_url,
                    "brand": "H&M",
                    "marketplace": "hm"
                }
                products.append(product)
            except Exception as e:
                print(f"Error parsing H&M item: {e}")
                continue
        
        return products


hm_provider = HMProvider()