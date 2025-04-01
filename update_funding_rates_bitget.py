import requests
import json
import os

# Get the absolute path of the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the project root (assuming the script is in a subdirectory like 'scripts')
# Adjust the number of '..' based on your actual script location relative to the project root
project_root = os.path.dirname(script_dir) # If script is in project_root/scripts/
# Or if the script is directly in the project root:
# project_root = script_dir

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
    # Construct the absolute path to the data file
    data_dir = os.path.join(project_root, "docs", "data")
    filename = os.path.join(data_dir, f"{coin.lower()}_funding_rates_bitget.json")

    # Ensure the target directory exists
    os.makedirs(data_dir, exist_ok=True) # Create directories if they don't exist

    # Load existing data if file exists
    existing_data = []
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: Could not decode JSON from {filename}. Starting with empty data.")
            existing_data = [] # Reset if file is corrupt
        except Exception as e:
            print(f"Error reading file {filename}: {e}")
            existing_data = []

    # Create a set of existing fundingRates for quick lookup
    # Ensure keys are strings and handle potential None values
    existing_rates = {}
    for item in existing_data:
        rate = item.get('fundingRate')
        time = item.get('settleTime')
        if rate is not None and time is not None:
             # Convert rate to string for consistent key format
             existing_rates[str(rate) + str(time)] = True


    # Fetch recent data from API
    recent_data = fetch_recent_funding_rates_bitget(symbol)

    # Count how many new items we add
    added_count = 0

    # Add only new items to existing data
    new_items_to_add = []
    for item in recent_data:
        rate = item.get('fundingRate')
        time = item.get('settleTime')
        # Check if item is valid and has necessary keys
        if rate is not None and time is not None:
            # Create a unique key for each funding rate record
            key = str(rate) + str(time) # Use string representation
            if key not in existing_rates:
                new_items_to_add.append(item)
                existing_rates[key] = True # Add to lookup immediately
                added_count += 1
        else:
            print(f"Skipping invalid item from API: {item}")

    # Append new items and sort data by settleTime
    # Append first to avoid sorting potentially large list repeatedly if only checking existence
    existing_data.extend(new_items_to_add)
    # Sort data by settleTime (as string comparison if necessary, or convert to comparable type if possible)
    existing_data.sort(key=lambda x: x.get('settleTime', ''), reverse=True)

    # Save updated data back to file
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
         print(f"Error writing file {filename}: {e}")
         # Handle the error appropriately, maybe return an error code or raise exception

    return added_count

if __name__ == "__main__":
    symbols = {
        "BTC": "BTCUSDT_UMCBL",
        "ETH": "ETHUSDT_UMCBL",
        "LTC": "LTCUSDT_UMCBL"
    }

    total_added = 0
    for coin, symbol in symbols.items():
        print(f"Updating {coin}...")
        added = update_funding_rates(coin, symbol)
        print(f"Updated {coin} funding rates: {added} new records added.")
        total_added += added
    print(f"\nTotal new records added across all coins: {total_added}")
