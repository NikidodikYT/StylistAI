import asyncio
import aiohttp

async def test():
    url = "https://search.wb.ru/exactmatch/ru/common/v4/search"
    params = {
        "appType": "1",
        "curr": "rub",
        "dest": "-1257786",
        "query": "брюки",  # Простой запрос
        "resultset": "catalog"
    }
    
    print("Testing Wildberries API...")
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
            print(f"Status: {response.status}")
            
            if response.status == 200:
                data = await response.json()
                products = data.get("data", {}).get("products", [])
                print(f"✅ Found {len(products)} products!")
                
                if products:
                    print(f"\nFirst product:")
                    print(f"  Name: {products[0].get('name')}")
                    print(f"  Price: {products[0].get('salePriceU', 0) // 100}₽")
                    print(f"  ID: {products[0].get('id')}")
            else:
                text = await response.text()
                print(f"❌ Error: {text[:200]}")

asyncio.run(test())
