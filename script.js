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

    // Show loading state
    submitButton.innerHTML = '<span class="material-icons spin">refresh</span> Calculating...';
    submitButton.disabled = true;
    resultElement.innerHTML = '<div class="loading"><span class="material-icons spin">refresh</span> Loading data...</div>';

    const startDate = new Date(startDateInput);

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
            const settleTime = new Date(parseInt(item.settleTime));
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
            `${formatFee(binanceHighestFee)} (${formatDatetime(binanceHighestFeeTime)})` : 'N/A';
        const formattedBinanceLowest = binanceLowestFee !== null ?
            `${formatFee(binanceLowestFee)} (${formatDatetime(binanceLowestFeeTime)})` : 'N/A';

        const formattedBitgetHighest = bitgetHighestFee !== null ?
            `${formatFee(bitgetHighestFee)} (${formatDatetime(bitgetHighestFeeTime)})` : 'N/A';
        const formattedBitgetLowest = bitgetLowestFee !== null ?
            `${formatFee(bitgetLowestFee)} (${formatDatetime(bitgetLowestFeeTime)})` : 'N/A';

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
                                <th>Settlement Count</th>
                                <th>Total Funding Fee (USDT)</th>
                                <th>Highest Single Fee (USDT)</th>
                                <th>Lowest Single Fee (USDT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Binance</td>
                                <td>${binanceRateCount}</td>
                                <td class="fee-amount">${formattedBinanceFee}</td>
                                <td class="fee-amount">${formattedBinanceHighest}</td>
                                <td class="fee-amount">${formattedBinanceLowest}</td>
                            </tr>
                            <tr>
                                <td>Bitget</td>
                                <td>${bitgetRateCount}</td>
                                <td class="fee-amount">${formattedBitgetFee}</td>
                                <td class="fee-amount">${formattedBitgetHighest}</td>
                                <td class="fee-amount">${formattedBitgetLowest}</td>
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

// Helper function to format datetime
function formatDatetime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Helper function to format fee with sign
function formatFee(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(8)}`;
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
