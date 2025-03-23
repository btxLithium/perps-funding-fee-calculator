import requests
import json
import os

def fetch_recent_funding_rates_bitget(symbol, page_size=5):
    """Fetch the most recent funding rates from Bitget API"""
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

def update_funding_rates(coin, symbol):
    """Update funding rates for a specific coin, adding only new data"""
    # File path for this coin's data
    filename = f"data/{coin.lower()}_funding_rates_bitget.json"
    
    # Load existing data if file exists
    existing_data = []
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    
    # Create a set of existing fundingRates for quick lookup
    existing_rates = {item.get('fundingRate') + item.get('settleTime'): True for item in existing_data}
    
    # Fetch recent data from API
    recent_data = fetch_recent_funding_rates_bitget(symbol)
    
    # Count how many new items we add
    added_count = 0
    
    # Add only new items to existing data
    for item in recent_data:
        # Create a unique key for each funding rate record
        key = item.get('fundingRate') + item.get('settleTime')
        if key not in existing_rates:
            existing_data.append(item)
            existing_rates[key] = True
            added_count += 1
    
    # Sort data by settleTime to maintain chronological order
    existing_data.sort(key=lambda x: x.get('settleTime', ''), reverse=True)
    
    # Save updated data back to file
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)
    
    return added_count

if __name__ == "__main__":
    symbols = {
        "BTC": "BTCUSDT_UMCBL",
        "ETH": "ETHUSDT_UMCBL",
        "LTC": "LTCUSDT_UMCBL"
    }
    
    for coin, symbol in symbols.items():
        added_count = update_funding_rates(coin, symbol)
        print(f"Updated {coin} funding rates: {added_count} new records added.")
