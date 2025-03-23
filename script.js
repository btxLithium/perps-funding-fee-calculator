document.getElementById('calcForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const cryptocurrency = document.getElementById('cryptocurrency').value;
    const startDateInput = document.getElementById('startDate').value;
    const positionValue = parseFloat(document.getElementById('positionValue').value);
    const positionDirection = document.getElementById('positionDirection').value;
    const resultElement = document.getElementById('result');
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    if (!startDateInput || isNaN(positionValue)) {
        showToast("Please enter a valid date and position value.");
        return;
    }

    const startDate = new Date(startDateInput);
    // 检查日期是否为当前日期或未来日期
    const today = new Date();

    if (startDate >= today) {
        showToast("Start date cannot be today or a future date. Please select a past date.");
        return;
    }

    // Show loading state
    submitButton.innerHTML = '<span class="material-icons spin">refresh</span> Calculating...';
    submitButton.disabled = true;
    resultElement.innerHTML = '<div class="loading"><span class="material-icons spin">refresh</span> Loading data...</div>';

    // Get both data files based on selected cryptocurrency
    const binanceDataUrl = `data/${cryptocurrency.toLowerCase()}_funding_rates_binance.json`;
    const bitgetDataUrl = `data/${cryptocurrency.toLowerCase()}_funding_rates_bitget.json`;

    try {
        // Fetch both data sources in parallel
        const [binanceResponse, bitgetResponse] = await Promise.all([
            fetch(binanceDataUrl),
            fetch(bitgetDataUrl)
        ]);

        if (!binanceResponse.ok) {
            throw new Error('Binance data fetch error: ' + binanceResponse.status);
        }
        if (!bitgetResponse.ok) {
            throw new Error('Bitget data fetch error: ' + bitgetResponse.status);
        }

        const binanceRates = await binanceResponse.json();
        const bitgetRates = await bitgetResponse.json();

        // Direction multiplier: long pays positive rates, short pays negative rates
        // So for long positions, we use the rate as is
        // For short positions, we invert the sign of the rate
        const directionMultiplier = positionDirection === 'long' ? 1 : -1;

        // Initialize variables for highest and lowest fees
        let binanceHighestFee = null;
        let binanceHighestFeeTime = null;
        let binanceLowestFee = null;
        let binanceLowestFeeTime = null;

        let bitgetHighestFee = null;
        let bitgetHighestFeeTime = null;
        let bitgetLowestFee = null;
        let bitgetLowestFeeTime = null;

        // Calculate for Binance
        let binanceTotalFee = 0;
        let binanceRateCount = 0;
        binanceRates.forEach(item => {
            // Binance uses fundingTime instead of settleTime
            const settleTime = new Date(parseInt(item.fundingTime));
            if (settleTime >= startDate) {
                const rate = parseFloat(item.fundingRate);
                // Apply direction multiplier to the rate
                const adjustedRate = rate * directionMultiplier;
                const fee = positionValue * adjustedRate;
                binanceTotalFee += fee;
                binanceRateCount++;

                // Track highest fee
                if (binanceHighestFee === null || fee > binanceHighestFee) {
                    binanceHighestFee = fee;
                    binanceHighestFeeTime = settleTime;
                }

                // Track lowest fee
                if (binanceLowestFee === null || fee < binanceLowestFee) {
                    binanceLowestFee = fee;
                    binanceLowestFeeTime = settleTime;
                }
            }
        });

        // Calculate for Bitget
        let bitgetTotalFee = 0;
        let bitgetRateCount = 0;
        bitgetRates.forEach(item => {
            const settleTime = new Date(parseInt(item.settleTime));
            if (settleTime >= startDate) {
                const rate = parseFloat(item.fundingRate);
                // Apply direction multiplier to the rate
                const adjustedRate = rate * directionMultiplier;
                const fee = positionValue * adjustedRate;
                bitgetTotalFee += fee;
                bitgetRateCount++;

                // Track highest fee
                if (bitgetHighestFee === null || fee > bitgetHighestFee) {
                    bitgetHighestFee = fee;
                    bitgetHighestFeeTime = settleTime;
                }

                // Track lowest fee
                if (bitgetLowestFee === null || fee < bitgetLowestFee) {
                    bitgetLowestFee = fee;
                    bitgetLowestFeeTime = settleTime;
                }
            }
        });

        // Format the date for display
        const formattedDate = formatDate(startDate);
        const formattedBinanceFee = formatFee(binanceTotalFee);
        const formattedBitgetFee = formatFee(bitgetTotalFee);

        // Format highest and lowest fees with timestamps
        const formattedBinanceHighest = binanceHighestFee !== null ?
            `${formatFee(binanceHighestFee)}<br>(${new Date(binanceHighestFeeTime.getTime() + 8 * 3600000).toISOString().replace('T', ' ').substring(0, 16)})` : 'N/A';
        const formattedBinanceLowest = binanceLowestFee !== null ?
            `${formatFee(binanceLowestFee)}<br>(${new Date(binanceLowestFeeTime.getTime() + 8 * 3600000).toISOString().replace('T', ' ').substring(0, 16)})` : 'N/A';

        const formattedBitgetHighest = bitgetHighestFee !== null ?
            `${formatFee(bitgetHighestFee)}<br>(${new Date(bitgetHighestFeeTime.getTime() + 8 * 3600000).toISOString().replace('T', ' ').substring(0, 16)})` : 'N/A';
        const formattedBitgetLowest = bitgetLowestFee !== null ?
            `${formatFee(bitgetLowestFee)}<br>(${new Date(bitgetLowestFeeTime.getTime() + 8 * 3600000).toISOString().replace('T', ' ').substring(0, 16)})` : 'N/A';

        // Get CSS class based on fee value (simplified)
        function getFeeClass(value) {
            return value >= 0 ? 'fee-positive' : 'fee-negative';
        }

        // Success result with table styling
        resultElement.innerHTML = `
            <div class="result-card">
                <div class="result-header">Calculation Results</div>
                <div class="result-details">
                    <p><strong>Start Date:</strong> ${formattedDate}</p>
                    <p><strong>Cryptocurrency:</strong> ${cryptocurrency}</p>
                    <p><strong>Position Value:</strong> ${positionValue} USDT</p>
                    <p><strong>Position Direction:</strong> ${positionDirection.charAt(0).toUpperCase() + positionDirection.slice(1)}</p>
                    
                    <table class="result-table">
                        <thead>
                            <tr>
                                <th>Exchange</th>
                                <th>Days</th>
                                <th>Total Funding Fee (USDT)</th>
                                <th>Highest Single Fee Income (USDT)</th>
                                <th>Highest Single Fee Expense (USDT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="exchange-logo"><img src="assets/binance-icon-logo.png" alt="Binance" class="exchange-icon"> Binance</span></td>
                                <td>${calculateDaysDifference(startDate)}</td>
                                <td class="fee-amount ${getFeeClass(binanceTotalFee)}">${formattedBinanceFee}</td>
                                <td class="fee-amount ${getFeeClass(binanceHighestFee)}">${formattedBinanceHighest}</td>
                                <td class="fee-amount ${getFeeClass(binanceLowestFee)}">${formattedBinanceLowest}</td>
                            </tr>
                            <tr>
                                <td><span class="exchange-logo"><img src="assets/bitget-icon-logo.png" alt="Bitget" class="exchange-icon"> Bitget</span></td>
                                <td>${calculateDaysDifference(startDate)}</td>
                                <td class="fee-amount ${getFeeClass(bitgetTotalFee)}">${formattedBitgetFee}</td>
                                <td class="fee-amount ${getFeeClass(bitgetHighestFee)}">${formattedBitgetHighest}</td>
                                <td class="fee-amount ${getFeeClass(bitgetLowestFee)}">${formattedBitgetLowest}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Data fetch failed:", error);
        resultElement.innerHTML = `
            <div class="error-message">
                <span class="material-icons">error</span>
                <p>Failed to load data, please try again later.</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    } finally {
        // Restore button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
});

// Helper function to format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Helper function to format fee with sign
function formatFee(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${Number(value.toFixed(5)).toString()}`;
}

// Helper function to calculate days from start date until today
function calculateDaysDifference(startDate) {
    const today = new Date();
    const differenceInTime = today.getTime() - startDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
}

// Toast message function
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="material-icons">info</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
