import requests
import json
import os
import random

def fetch_recent_funding_rates_binance(symbol, limit=5):
    """Fetch the most recent funding rates from Binance API"""
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
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-CH-UA': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        # 使用的韩国IP地址段
        'X-Forwarded-For': f'175.223.{random.randint(1, 254)}.{random.randint(1, 254)}'
    }
    
    # 使用添加了头信息的请求
    response = requests.get(url, params=params, headers=headers)
    
    data = response.json()
    if isinstance(data, list):
        return data
    else:
        print("Error fetching data:", data)
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
    symbols = {
        "BTC": "BTCUSDT",
        "ETH": "ETHUSDT",
        "LTC": "LTCUSDT"
    }
    
    for coin, symbol in symbols.items():
        added_count = update_funding_rates(coin, symbol)
        print(f"Updated {coin} funding rates: {added_count} new records added.")