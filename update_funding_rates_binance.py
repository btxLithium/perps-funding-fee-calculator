import requests
import json
import os
import random
import time
import sys

def get_free_proxies():
    """获取免费代理列表"""
    try:
        # 从免费代理API获取代理
        proxy_sources = [
            "https://www.proxyscan.io/api/proxy?type=http,https&format=json&country=kr,jp,sg&limit=20",
            "https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc&filterUpTime=90&country=KR,JP,SG,HK&speed=fast"
        ]
        
        proxies = []
        for source in proxy_sources:
            try:
                response = requests.get(source, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    
                    # 解析第一个API的结果
                    if "proxyscan.io" in source:
                        for item in data:
                            ip = item.get("Ip")
                            port = item.get("Port")
                            if ip and port:
                                proxies.append(f"http://{ip}:{port}")
                    
                    # 解析第二个API的结果
                    elif "geonode.com" in source:
                        for item in data.get("data", []):
                            ip = item.get("ip")
                            port = item.get("port")
                            if ip and port:
                                proxies.append(f"http://{ip}:{port}")
            except Exception as e:
                print(f"Error fetching proxies from {source}: {e}")
                continue
        
        print(f"Found {len(proxies)} free proxies")
        return proxies
    except Exception as e:
        print(f"Error fetching proxy list: {e}")
        return []

def fetch_recent_funding_rates_binance(symbol, limit=5, max_retries=3):
    """获取币安最近的资金费率数据，尝试使用多个代理"""
    url = "https://fapi.binance.com/fapi/v1/fundingRate"
    params = {
        "symbol": symbol,
        "limit": limit
    }
    
    # 添加请求头以绕过地区限制
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        # 使用韩国IP地址段
        'X-Forwarded-For': f'175.223.{random.randint(1, 254)}.{random.randint(1, 254)}'
    }
    
    # 首先尝试不使用代理
    try:
        print("Trying without proxy...")
        response = requests.get(url, params=params, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        if isinstance(data, list):
            print("Successfully fetched data without proxy")
            return data
        print("Direct request failed, trying with proxies...")
    except Exception as e:
        print(f"Direct request error: {e}")
    
    # 获取免费代理列表
    proxies_list = get_free_proxies()
    
    # 如果没有找到代理，尝试几个固定的公开代理
    if not proxies_list:
        proxies_list = [
            "http://191.252.193.188:3128",
            "http://159.65.69.186:9300",
            "http://158.160.56.149:8080",
            "http://165.154.226.242:80",
            "http://43.153.52.224:80",
            "http://51.159.115.233:3128"
        ]
    
    # 使用不同的代理尝试
    for i, proxy in enumerate(proxies_list):
        if i >= max_retries:
            break
            
        try:
            print(f"Trying with proxy {i+1}/{min(max_retries, len(proxies_list))}: {proxy}")
            proxy_dict = {
                "http": proxy,
                "https": proxy
            }
            
            # 随机化X-Forwarded-For头
            headers['X-Forwarded-For'] = f'175.223.{random.randint(1, 254)}.{random.randint(1, 254)}'
            
            response = requests.get(
                url, 
                params=params, 
                headers=headers, 
                proxies=proxy_dict, 
                timeout=15
            )
            
            print(f"Status Code: {response.status_code}")
            data = response.json()
            
            if isinstance(data, list):
                print(f"Successfully fetched data using proxy: {proxy}")
                return data
            else:
                print(f"Proxy response error: {data}")
                
        except Exception as e:
            print(f"Proxy request error: {e}")
        
        # 避免请求过于频繁
        time.sleep(1)
    
    print("All proxy attempts failed")
    return []

def update_funding_rates(coin, symbol):
    """Update funding rates for a specific coin, adding only new data"""
    # File path for this coin's data
    filename = f"data/{coin.lower()}_funding_rates_binance.json"
    
    # Load existing data if file exists
    existing_data = []
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    
    # Create a set of existing fundingRates for quick lookup
    existing_rates = {item.get('fundingRate') + str(item.get('fundingTime')): True for item in existing_data}
    
    # Fetch recent data from API
    recent_data = fetch_recent_funding_rates_binance(symbol)
    
    # Count how many new items we add
    added_count = 0
    
    # Add only new items to existing data
    for item in recent_data:
        # Create a unique key for each funding rate record
        key = item.get('fundingRate') + str(item.get('fundingTime'))
        if key not in existing_rates:
            existing_data.append(item)
            existing_rates[key] = True
            added_count += 1
    
    # Sort data by fundingTime to maintain chronological order
    existing_data.sort(key=lambda x: x.get('fundingTime', ''), reverse=True)
    
    # Save updated data back to file
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)
    
    return added_count

if __name__ == "__main__":
    # 确保data目录存在
    os.makedirs("data", exist_ok=True)
    
    symbols = {
        "BTC": "BTCUSDT",
        "ETH": "ETHUSDT",
        "LTC": "LTCUSDT",
        "BNB": "BNBUSDT",
        "SOL": "SOLUSDT", 
        "XRP": "XRPUSDT",
        "DOGE": "DOGEUSDT",
        "ADA": "ADAUSDT"
    }
    
    success_count = 0
    total_count = len(symbols)
    
    print("Starting to update Binance funding rates...")
    
    for coin, symbol in symbols.items():
        try:
            print(f"\n{'='*40}")
            print(f"Processing {coin} ({symbol})...")
            added_count = update_funding_rates(coin, symbol)
            print(f"Updated {coin} funding rates: {added_count} new records added.")
            success_count += 1
        except Exception as e:
            print(f"Error updating {coin} funding rates: {e}")
    
    print(f"\n{'='*40}")
    print(f"Update completed. Successfully updated {success_count}/{total_count} symbols.")
    
    if success_count == 0:
        print("\nTROUBLESHOOTING:")
        print("1. The free proxies might be unreliable or blocked by Binance")
        print("2. Try running the script again later")
        print("3. Consider using a paid proxy service and manually setting it in the code")
        sys.exit(1)