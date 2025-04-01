import './style.css';
import { calculateFees } from './calculator';
import {
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
} from './utils';
import { generateResultHTML } from './result';

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

        // Format results for display
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

        // Prepare data for result display function
        const resultData = {
            formattedDate,
            cryptocurrency,
            positionValue,
            positionDirection,
            daysDifference,
            binanceData,
            formattedBinanceFee,
            formattedBinanceHighest,
            formattedBinanceLowest,
            bitgetData,
            formattedBitgetFee,
            formattedBitgetHighest,
            formattedBitgetLowest,
        };

        const resultHTML = generateResultHTML(resultData);
        setResultHTML(resultElement, resultHTML);

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