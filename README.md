# Perps Funding Fee Calculator([Link](https://btxlithium.github.io/perps-funding-fee-calculator/))

**GITHUB ACTIONS**:   <!-- LAST_UPDATED -->Funding rate history last updated at 2025-09-19 22:17:49 CST+0800<!-- /LAST_UPDATED -->.

![Workflow Status](https://github.com/btxLithium/perps-funding-fee-calculator/actions/workflows/funding_rate_history_update.yml/badge.svg)


<img src="screenshot.png" alt="Funding Fee Calculator Screenshot" width="50%">

## Project Description

Funding fee expenses can vary significantly across different cryptocurrency exchanges when trading the same asset using perpetual contracts. This web app is designed to calculate and compare funding fee costs or income over a specified period on Bitget and Binance.

在不同的加密货币交易所交易同一资产的永续合约时，资金费支出可能存在显著差异。本项目的 Web app 可以帮助计算与对比 Bitget 和 Binance 在特定时间内的资金费成本或收益。

## Automated Updates

The funding rate data is automatically updated daily at 22:00 (UTC+8) using GitHub Actions. The workflow:
1. Retrieves the latest funding rates from Binance and Bitget APIs
2. Adds only new data to the existing JSON files
3. Commits and pushes the changes back to the repository

## Running Locally

To run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/btxLithium/perps-funding-fee-calculator.git
    cd perps-funding-fee-calculator
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed.
    ```bash
    npm install
    ```

3.  **Start the development server:**
    This command will start the Vite development server and open the app in your default browser.
    ```bash
    npm run dev
    ```



## Project Structure

```
./
├── index.html                 
├── vite.config.ts             # Vite configuration file
├── tsconfig.json              # TypeScript compiler configuration
├── package.json               # Project dependencies and scripts
├── README.md                  
├── public/                    # Static assets served directly
│   ├── assets/                
│   └── data/                  # Historical funding rate data (JSON)
│       ├── btc_funding_rates_binance.json
│       ├── btc_funding_rates_bitget.json
│       └── ... (other crypto pairs)
├── src/                   
│   ├── main.ts                # Main application logic entry point
│   ├── calculator.ts          # Core fee calculation logic
│   ├── utils.ts               # Utility functions (DOM, API, formatting, types)
│   └── style.css            
├── update_funding_rates_*.py  # Python scripts for daily data updates (run by GitHub Actions)
├── historical_data_fetchers/  # Python scripts for initial historical data fetching
│   └── fetch_funding_rates_*.py
└── .github/
    └── workflows/             # GitHub Actions workflow definitions
        └── funding_rate_history_update.yml
```
NOTE: Scripts in `historical_data_fetchers` are one-time scripts executed to fetch all historical funding rate data since February 18.

## Donations

If you'd like to support my work, consider buy me a coffee:

- USDT or USDC Aptos:  
0x675422152a1dcb2eba3011a5f2901d9756ca7be872db10caa3a4dd7f25482e8e  
- USDT or USDC BNB Smart Chain:  
0xbe9c806a872c826fb817f8086aafa26a6104afac
