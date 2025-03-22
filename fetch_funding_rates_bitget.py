import requests
import json
import datetime

def fetch_funding_rates_bitget(symbol, page_size=100):
    url = "https://api.bitget.com/api/mix/v1/market/history-fundRate"
    params = {
        "symbol": symbol,
        "pageSize": page_size,
    }
    response = requests.get(url, params=params)
    data = response.json()
    if data.get('code') == "00000":
        return data.get('data', [])
    else:
        print("Error fetching data:", data)
        return []

if __name__ == "__main__":
    symbols = {
        "BTC": "BTCUSDT_UMCBL",
        "ETH": "ETHUSDT_UMCBL",
        "LTC": "LTCUSDT_UMCBL"
    }
    
    for coin, symbol in symbols.items():
        rates = fetch_funding_rates_bitget(symbol, page_size=200)
        
        filename = f"data/{coin.lower()}_funding_rates_bitget.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(rates, f, ensure_ascii=False, indent=2)
        print(f"History funding rates saved to {filename} (from timestamp 1739750400000).")
