# bitget-perps-funding-fee-calculator
 
<img src="assets/screenshot.png" alt="Funding Fee Calculator Screenshot" width="50%">


## Project Description

This simple web app is designed to help traders calculate their funding fee costs or benifits over a specified period on Bitget.

## Structure

- `index.html`, `style.css`, `script.js`: Frontend web application
- `data/`: Contains historical funding rate data for different cryptocurrencies
- `update_funding_rates_binance.py`: Script to update Binance funding rate data
- `update_funding_rates_bitget.py`: Script to update Bitget funding rate data

## Automated Updates

The funding rate data is automatically updated daily at 22:00 (UTC+8) using GitHub Actions. The workflow:
1. Retrieves the latest funding rates from Binance and Bitget APIs
2. Adds only new data to the existing JSON files
3. Commits and pushes the changes back to the repository

You can also manually trigger the update workflow from the "Actions" tab in the GitHub repository.


## Donations

If you'd like to support my work, consider buy me a coffee:

- USDT or USDC Aptos:  
0x675422152a1dcb2eba3011a5f2901d9756ca7be872db10caa3a4dd7f25482e8e  
- USDT or USDC BNB Smart Chain:  
0xbe9c806a872c826fb817f8086aafa26a6104afac  