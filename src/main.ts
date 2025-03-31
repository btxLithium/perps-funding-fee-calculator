import './style.css';
import { calculateFees } from './calculator';
import {
    FundingRateItem,
    FeeData,
    getElementById,
    showToast,
    setResultHTML,
    setButtonState,
    getFormValues,
    setDefaultStartDate,
    fetchFundingRates,
    formatDate,
    formatFee,
    formatTimestampToUTC8,
    calculateDaysDifference,
    getFeeClass
} from './utils';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const form = getElementById<HTMLFormElement>('calcForm');
        form.addEventListener('submit', handleSubmit);
        setDefaultStartDate(); // Set default start date using the utility function
    } catch (error) {
        console.error("Initialization failed:", error);
        // Optionally show an error to the user on the page
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.innerHTML = `<div class="error-message">Initialization failed. Please check the console.</div>`;
        }
    }
});

async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const resultElement = getElementById<HTMLDivElement>('result');
    const submitButton = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    if (!submitButton) {
        console.error("Submit button not found within the form.");
        showToast("An unexpected error occurred. Could not find the submit button.");
        return;
    }
    const originalButtonText = submitButton.innerHTML;

    try {
        const { cryptocurrency, startDateInput, positionValue, positionDirection } = getFormValues();

        if (!startDateInput || isNaN(positionValue)) {
            showToast("Please enter a valid date and position value.");
            return;
        }

        const startDate = new Date(startDateInput);
        const today = new Date();
        // Clear time part for comparison
        today.setHours(0, 0, 0, 0);
        const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());


        if (startDay >= today) {
            showToast("Start date must be before today. Please select a past date.");
            return;
        }

        // Show loading state
        setButtonState(submitButton, '<span class="material-icons spin">refresh</span> Calculating...', true);
        setResultHTML(resultElement, '<div class="loading"><span class="material-icons spin">refresh</span> Loading data...</div>');

        // Fetch data
        const { binanceRates, bitgetRates } = await fetchFundingRates(cryptocurrency);

        // Calculate fees
        const directionMultiplier = positionDirection === 'long' ? 1 : -1;
        const binanceData = calculateFees(binanceRates, startDate, positionValue, directionMultiplier, true);
        const bitgetData = calculateFees(bitgetRates, startDate, positionValue, directionMultiplier, false);

        // Format results
        const formattedDate = formatDate(startDate);
        const formattedBinanceFee = formatFee(binanceData.totalFee);
        const formattedBitgetFee = formatFee(bitgetData.totalFee);

        const formattedBinanceHighest = binanceData.highestFee !== null ?
            `${formatFee(binanceData.highestFee)}<br>(${formatTimestampToUTC8(binanceData.highestFeeTime)})` : 'N/A';
        const formattedBinanceLowest = binanceData.lowestFee !== null ?
            `${formatFee(binanceData.lowestFee)}<br>(${formatTimestampToUTC8(binanceData.lowestFeeTime)})` : 'N/A';

        const formattedBitgetHighest = bitgetData.highestFee !== null ?
            `${formatFee(bitgetData.highestFee)}<br>(${formatTimestampToUTC8(bitgetData.highestFeeTime)})` : 'N/A';
        const formattedBitgetLowest = bitgetData.lowestFee !== null ?
            `${formatFee(bitgetData.lowestFee)}<br>(${formatTimestampToUTC8(bitgetData.lowestFeeTime)})` : 'N/A';

        const daysDifference = calculateDaysDifference(startDate);

        // Display results
        setResultHTML(resultElement, `
            <div class="result-card">
                <div class="result-header">Calculation Results</div>
                <div class="result-details">
                    <p><strong>Start Date:</strong> ${formattedDate}</p>
                    <p><strong>Cryptocurrency:</strong> ${cryptocurrency}</p>
                    <p><strong>Position Value:</strong> ${positionValue} USDT</p>
                    <p><strong>Position Direction:</strong> ${positionDirection.charAt(0).toUpperCase() + positionDirection.slice(1)}</p>
                    <p><strong>Calculation Period:</strong> ${daysDifference} days</p>

                    <table class="result-table">
                        <thead>
                            <tr>
                                <th>Exchange</th>
                                <th>Total Funding Fee (USDT)</th>
                                <th>Highest Single Fee (Income/Expense)</th>
                                <th>Lowest Single Fee (Income/Expense)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="exchange-logo"><img src="assets/binance-icon-logo.png" alt="Binance" class="exchange-icon"> Binance</span></td>
                                <td class="fee-amount ${getFeeClass(binanceData.totalFee)}">${formattedBinanceFee}</td>
                                <td class="fee-amount ${getFeeClass(binanceData.highestFee)}">${formattedBinanceHighest}</td>
                                <td class="fee-amount ${getFeeClass(binanceData.lowestFee)}">${formattedBinanceLowest}</td>
                            </tr>
                            <tr>
                                <td><span class="exchange-logo"><img src="assets/bitget-icon-logo.png" alt="Bitget" class="exchange-icon"> Bitget</span></td>
                                <td class="fee-amount ${getFeeClass(bitgetData.totalFee)}">${formattedBitgetFee}</td>
                                <td class="fee-amount ${getFeeClass(bitgetData.highestFee)}">${formattedBitgetHighest}</td>
                                <td class="fee-amount ${getFeeClass(bitgetData.lowestFee)}">${formattedBitgetLowest}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="fee-explanation">Note: Positive fees represent income received, negative fees represent expenses paid.</p>
                </div>
            </div>
        `);

    } catch (error) {
        console.error("Calculation failed:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setResultHTML(resultElement, `
            <div class="error-message">
                <span class="material-icons">error</span>
                <p>Failed to calculate or load data. Please try again later.</p>
                <p class="error-details">Details: ${errorMessage}</p>
            </div>
        `);
        showToast(`Error: ${errorMessage}`); // Also show a toast for immediate feedback
    } finally {
        // Restore button state only if it was found initially
        if (submitButton) {
            setButtonState(submitButton, originalButtonText, false);
        }
    }
}
