import { FeeData } from './utils';

// Update the interface to match the actual data structure
interface ResultDisplayData {
    formattedDate: string;
    cryptocurrency: string;
    positionValue: number | string;
    positionDirection: string;
    daysDifference: number;
    binanceData: FeeData;
    formattedBinanceFee: string;
    formattedBinanceHighest: string;
    formattedBinanceLowest: string;
    bitgetData: FeeData;
    formattedBitgetFee: string;
    formattedBitgetHighest: string;
    formattedBitgetLowest: string;
}

// Function to determine the CSS class based on fee value
function getFeeClass(fee: number | null): string {
    if (fee === null) return '';
    return fee >= 0 ? 'income' : 'expense';
}

/**
 * Generates the HTML string for the results display card.
 * @param data - The data required to populate the result card.
 * @returns The HTML string for the result card.
 */
export function generateResultHTML(data: ResultDisplayData): string {
    const {
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
    } = data;

    return `
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
                            <th>Settled Funding Fee (USDT)</th>
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
                <p class="fee-explanation" style="font-size: 13px; color: gray;">Note: Positive fees represent income received, negative fees represent expenses paid.</p>
            </div>
        </div>
    `;
}
