import requests
import json
import os
import random
import sys

# Get the absolute path of the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the project root (assuming the script is in a subdirectory like 'scripts')
# Adjust the number of '..' based on your actual script location relative to the project root
project_root = os.path.dirname(script_dir) # If script is in project_root/scripts/
# Or if the script is directly in the project root:
# project_root = script_dir

def fetch_recent_funding_rates_binance(symbol, limit=50):
    """Fetch the most recent funding rates from Binance API"""
    url = "https://fapi.binance.com/fapi/v1/fundingRate"
    params = {
        "symbol": symbol,
        "limit": limit
    }

    # Using a generic user agent is usually sufficient. X-Forwarded-For might be ignored or flagged.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        # 'X-Forwarded-For': f'175.223.{random.randint(1, 254)}.{random.randint(1, 254)}' # Consider removing if not effective
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=15) # Increased timeout slightly
        print(f"Status Code for {symbol}: {response.status_code}")

        # Check if the status code indicates success
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"Successfully fetched {len(data)} records for {symbol}")
                return data
            else:
                # Handle potential API errors returned in JSON format
                print(f"Error fetching data for {symbol}: API returned non-list response: {data}")
                return []
        else:
            # Handle non-200 HTTP status codes
            print(f"Error fetching data for {symbol}: Received status code {response.status_code}. Response: {response.text}")
            return []

    except requests.exceptions.RequestException as e:
        print(f"Request error for {symbol}: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"JSON decoding error for {symbol}: {e}. Response text: {response.text}")
        return []
    except Exception as e: # Catch other potential exceptions
        print(f"An unexpected error occurred for {symbol}: {e}")
        return []


def update_funding_rates(coin, symbol):
    """Update funding rates for a specific coin, adding only new data"""
    # Construct the absolute path to the data file
    data_dir = os.path.join(project_root, "docs", "data")
    filename = os.path.join(data_dir, f"{coin.lower()}_funding_rates_binance.json")

    # Ensure the target directory exists
    os.makedirs(data_dir, exist_ok=True) # Create directories if they don't exist

    # Load existing data if file exists
    existing_data = []
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list): # Ensure data loaded is a list
                   print(f"Warning: Data in {filename} is not a list. Initializing as empty list.")
                   existing_data = []
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
        time = item.get('fundingTime')
        # Only add to lookup if both rate and time are present
        if rate is not None and time is not None:
             # Convert rate and time to string for consistent key format
             existing_rates[str(rate) + str(time)] = True


    # Fetch recent data from API
    recent_data = fetch_recent_funding_rates_binance(symbol)

    # Count how many new items we add
    added_count = 0

    # Add only new items to existing data
    new_items_to_add = []
    for item in recent_data:
        rate = item.get('fundingRate')
        time = item.get('fundingTime')
        # Check if item is valid and has necessary keys
        if rate is not None and time is not None:
            # Create a unique key for each funding rate record
            key = str(rate) + str(time) # Use string representation
            if key not in existing_rates:
                new_items_to_add.append(item)
                existing_rates[key] = True # Add to lookup immediately
                added_count += 1
        else:
             print(f"Skipping invalid item from API for {symbol}: {item}")

    # Append new items and sort data by fundingTime
    # Append first to avoid sorting potentially large list repeatedly if only checking existence
    existing_data.extend(new_items_to_add)
    # Sort data by fundingTime (which is a timestamp, so numerical sort works)
    existing_data.sort(key=lambda x: x.get('fundingTime', 0), reverse=True) # Use 0 as default for sorting robustness

    # Save updated data back to file
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
         print(f"Error writing file {filename}: {e}")
         # Optionally, re-raise the exception or return an indicator of failure
         # raise e
         return -1 # Indicate failure with a negative count, for example

    return added_count

if __name__ == "__main__":
    # The os.makedirs call is now inside update_funding_rates, so it's removed from here.
    # os.makedirs("data", exist_ok=True) # No longer needed here

    symbols = {
        "BTC": "BTCUSDT",
        "ETH": "ETHUSDT",
        "LTC": "LTCUSDT",
    }

    success_count = 0
    fail_count = 0
    total_added_records = 0
    total_symbols = len(symbols)

    print("Starting to update Binance funding rates...")

    for coin, symbol in symbols.items():
        print(f"\n{'='*40}")
        print(f"Processing {coin} ({symbol})...")
        try:
            added_count = update_funding_rates(coin, symbol)
            if added_count >= 0: # Check if update was successful (didn't return -1)
                print(f"Updated {coin} funding rates: {added_count} new records added.")
                total_added_records += added_count
                success_count += 1
            else:
                print(f"Failed to update {coin} funding rates (write error).")
                fail_count += 1
        except Exception as e:
            # Catch any unexpected errors during the process for a specific coin
            print(f"An unexpected error occurred while processing {coin}: {e}")
            fail_count += 1
            # Optionally add more specific error handling or logging here

    print(f"\n{'='*40}")
    print("Update process completed.")
    print(f"Successfully processed symbols: {success_count}/{total_symbols}")
    if fail_count > 0:
        print(f"Failed to process symbols: {fail_count}/{total_symbols}")
    print(f"Total new records added across all successfully updated symbols: {total_added_records}")

    # Binance API is tricky, here is a informative exit message based on success/failure
    # However, manually running this script with VPN on seems to always work fine
    
    if success_count == 0 and total_symbols > 0:
        print("\nWARNING: Failed to update funding rates for all symbols.")
        print("Possible reasons:")
        print("- Network connectivity issues.")
        print("- Binance API endpoint might be unreachable or blocked (regional restrictions).")
        sys.exit(1)
    elif fail_count > 0:
         print("\nWARNING: Some symbols could not be updated. Check logs above for errors.")
         sys.exit(1) 
    else:
        print("\nAll symbols updated successfully.")
        sys.exit(0) 