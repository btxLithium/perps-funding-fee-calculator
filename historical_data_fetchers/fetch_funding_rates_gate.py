import requests
import json
import datetime

def fetch_funding_rates_gate(contract, from_time=1739750400000):
    url = "https://api.gateio.ws/api/v4/futures/usdt/funding_rate_history"
    params = {
        "contract": contract,
        "from": from_time,
        "to": int(datetime.datetime.now().timestamp() * 1000)
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
        "BTC": "BTC_USDT",
        "ETH": "ETH_USDT",
        "LTC": "LTC_USDT"
    }
    
    from_timestamp = 1739750400000  # Starting timestamp as specified
    
    for coin, contract in symbols.items():
        rates = fetch_funding_rates_gate(contract, from_timestamp)
        
        filename = f"data/{coin.lower()}_funding_rates_gate.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(rates, f, ensure_ascii=False, indent=2)
        print(f"History funding rates saved to {filename} ({len(rates)} records).")
