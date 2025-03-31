import requests
import json
import datetime

def fetch_funding_rates_binance(symbol, limit=10000, start_time=None):
    url = "https://fapi.binance.com/fapi/v1/fundingRate"
    params = {
        "symbol": symbol,
        "limit": limit, 
        "startTime": start_time
    }

    
    response = requests.get(url, params=params)
    data = response.json()
    if isinstance(data, list):
        return data
    else:
        print("Error fetching data:", data)
        return []

if __name__ == "__main__":
    symbols = {
        "BTC": "BTCUSDT",
        "ETH": "ETHUSDT",
        "LTC": "LTCUSDT"
    }
    
    start_time = 1739865600000  # Starting timestamp
    
    for coin, symbol in symbols.items():
        rates = fetch_funding_rates_binance(symbol, limit=1000, start_time=start_time)
        
        filename = f"data/{coin.lower()}_funding_rates_binance.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(rates, f, ensure_ascii=False, indent=2)
        print(f"History funding rates saved to {filename} ({len(rates)} records from timestamp {start_time}).")
