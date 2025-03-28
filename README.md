# Perps Funding Fee Calculator([Link](https://btxlithium.github.io/perps-funding-fee-calculator/))

GITHUB ACTIONS:   <!-- LAST_UPDATED -->Funding Rate History Last Updated: 2025-03-29T22:16:05+08:00<!-- /LAST_UPDATED -->

![Workflow Status](https://github.com/btxLithium/perps-funding-fee-calculator/actions/workflows/funding_rate_history_update.yml/badge.svg)


<img src="assets/screenshot.png" alt="Funding Fee Calculator Screenshot" width="50%">


## Project Description

Funding fee expenses can vary significantly across different cryptocurrency exchanges when trading the same asset using perpetual contracts. This web app is designed to help traders calculate and compare funding fee costs or income over a specified period on Bitget and Binance.

在不同的加密货币交易所交易同一资产的永续合约时，资金费支出可能存在显著差异。这个Web App可以帮助计算与对比 Bitget 和 Binance 在特定时间内的资金费成本或收益。

## Automated Updates

The funding rate data is automatically updated daily at 22:00 (UTC+8) using GitHub Actions. The workflow:
1. Retrieves the latest funding rates from Binance and Bitget APIs
2. Adds only new data to the existing JSON files
3. Commits and pushes the changes back to the repository

## Structure

```
perps-funding-fee-calculator/
├ index.html                  
├ style.css                   
├ script.js                   # Logic for calculations
├ update_funding_rates_binance.py  # Script to update Binance funding rates data
├ update_funding_rates_bitget.py   # Script to update Bitget funding rates data
├ assets/                     
├ data/                       # Historical funding rate data
└ .github/
  └ workflows/              # GitHub Actions workflows
    └ funding_rate_history_update.yml  # Automated update workflow (runs daily at 22:00 UTC+8)
```

NOTE: `fetch_funding_rates_binance.py` and `fetch_funding_rates_bitget.py` are one-time scripts executed to fetch all historical funding rate data since February 18. 



## Donations

If you'd like to support my work, consider buy me a coffee:

- USDT or USDC Aptos:  
0x675422152a1dcb2eba3011a5f2901d9756ca7be872db10caa3a4dd7f25482e8e  
- USDT or USDC BNB Smart Chain:  
0xbe9c806a872c826fb817f8086aafa26a6104afac
