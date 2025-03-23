document.getElementById('calcForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const cryptocurrency = document.getElementById('cryptocurrency').value;
    const startDateInput = document.getElementById('startDate').value;
    const positionValue = parseFloat(document.getElementById('positionValue').value);
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
    let totalFee = 0;

    // Get the data file based on selected cryptocurrency
    const dataUrl = `data/${cryptocurrency.toLowerCase()}_funding_rates_binance.json`;

    try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error('Server response error: ' + response.status);
        }

        const rates = await response.json();

        // Assuming the data is an array, each item format: { "settleTime": "timestamp string", "fundingRate": "rate string", ... }
        let rateCount = 0;
        rates.forEach(item => {
            const settleTime = new Date(parseInt(item.settleTime));
            if (settleTime >= startDate) {
                const rate = parseFloat(item.fundingRate);
                totalFee += positionValue * rate;
                rateCount++;
            }
        });

        // Format the date for display
        const formattedDate = formatDate(startDate);
        const formattedFee = totalFee.toFixed(8);

        // Success result with material design styling
        resultElement.innerHTML = `
            <div class="result-card">
                <div class="result-header">Calculation Results</div>
                <div class="result-details">
                    <p><strong>Start Date:</strong> ${formattedDate}</p>
                    <p><strong>Cryptocurrency:</strong> ${cryptocurrency}</p>
                    <p><strong>Position Value:</strong> ${positionValue} USDT</p>
                    <p><strong>Settlement Count:</strong> ${rateCount}</p>
                    <p class="result-amount"><strong>Total Funding Fee:</strong> ${formattedFee} USDT</p>
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
