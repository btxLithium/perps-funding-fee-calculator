import { FundingRateItem, FeeData } from './utils'; // Import types from utils

export function calculateFees(
    rates: FundingRateItem[],
    startDate: Date,
    positionValue: number,
    directionMultiplier: number,
    isBinance: boolean
): FeeData {
    const result: FeeData = {
        totalFee: 0,
        rateCount: 0,
        highestFee: null,
        highestFeeTime: null,
        lowestFee: null,
        lowestFeeTime: null
    };

    rates.forEach(item => {
        // Binance uses fundingTime, Bitget uses settleTime
        const timeField = isBinance ? item.fundingTime : item.settleTime;
        if (!timeField) return; // Skip if the relevant time field is missing

        const settleTime = new Date(parseInt(timeField)); // Assuming timeField is a string timestamp in milliseconds

        // Only include rates from the start date onwards
        if (settleTime >= startDate) {
            const rate = parseFloat(item.fundingRate);
            if (isNaN(rate)) return; // Skip if rate is not a valid number

            // If long (multiplier=1), pay positive rate, receive negative rate.
            // If short (multiplier=-1), pay negative rate, receive positive rate.
            const fee = directionMultiplier * positionValue * rate;

            result.totalFee += fee;
            result.rateCount++;

            // Track highest fee (most income or least expense)
            if (result.highestFee === null || fee > result.highestFee) {
                result.highestFee = fee;
                result.highestFeeTime = settleTime;
            }

            // Track lowest fee (most expense or least income)
            if (result.lowestFee === null || fee < result.lowestFee) {
                result.lowestFee = fee;
                result.lowestFeeTime = settleTime;
            }
        }
    });

    return result;
}
