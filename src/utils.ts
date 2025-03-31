// Types
export interface FundingRateItem {
    fundingRate: string;
    fundingTime?: string; // For Binance
    settleTime?: string;  // For Bitget
}

export interface FeeData {
    totalFee: number;
    rateCount: number;
    highestFee: number | null;
    highestFeeTime: Date | null;
    lowestFee: number | null;
    lowestFeeTime: Date | null;
}

// DOM Utilities
export function getElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id) as T | null;
    if (!element) {
        throw new Error(`Element with ID '${id}' not found.`);
    }
    return element;
}

export function showToast(message: string): void {
    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.innerHTML = `<span class="material-icons">info</span>${message}`;
    document.body.appendChild(toastElement);

    // Force reflow to enable transition
    toastElement.offsetHeight;
    toastElement.classList.add('show');

    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toastElement);
        }, 300);
    }, 3000);
}

export function setResultHTML(element: HTMLDivElement, html: string): void {
    element.innerHTML = html;
}

export function setButtonState(button: HTMLButtonElement, text: string, disabled: boolean): void {
    button.innerHTML = text;
    button.disabled = disabled;
}

export function getFormValues(): { cryptocurrency: string; startDateInput: string; positionValue: number; positionDirection: string } {
    const cryptocurrencyElement = getElementById<HTMLSelectElement>('cryptocurrency');
    const startDateElement = getElementById<HTMLInputElement>('startDate');
    const positionValueElement = getElementById<HTMLInputElement>('positionValue');
    const positionDirectionElement = getElementById<HTMLSelectElement>('positionDirection');

    return {
        cryptocurrency: cryptocurrencyElement.value,
        startDateInput: startDateElement.value,
        positionValue: parseFloat(positionValueElement.value),
        positionDirection: positionDirectionElement.value
    };
}

export function setDefaultStartDate(): void {
    try {
        const startDateInput = getElementById<HTMLInputElement>('startDate');
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        startDateInput.value = formatDate(defaultStartDate);
    } catch (error) {
        console.error("Failed to set default start date:", error);
    }
}

// API Utilities
export async function fetchFundingRates(cryptocurrency: string): Promise<{ binanceRates: FundingRateItem[], bitgetRates: FundingRateItem[] }> {
    const binanceDataUrl = `data/${cryptocurrency.toLowerCase()}_funding_rates_binance.json`;
    const bitgetDataUrl = `data/${cryptocurrency.toLowerCase()}_funding_rates_bitget.json`;

    const [binanceResponse, bitgetResponse] = await Promise.all([
        fetch(binanceDataUrl),
        fetch(bitgetDataUrl)
    ]);

    if (!binanceResponse.ok) {
        throw new Error(`Binance data fetch error: ${binanceResponse.status} ${binanceResponse.statusText}`);
    }
    if (!bitgetResponse.ok) {
        throw new Error(`Bitget data fetch error: ${bitgetResponse.status} ${bitgetResponse.statusText}`);
    }

    const binanceRates: FundingRateItem[] = await binanceResponse.json();
    const bitgetRates: FundingRateItem[] = await bitgetResponse.json();

    return { binanceRates, bitgetRates };
}


// Formatting & Calculation Utilities
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function formatFee(fee: number | null): string {
    if (fee === null) return 'N/A';
    return fee.toFixed(6);
}

export function formatTimestampToUTC8(timestamp: Date | null): string {
    if (!timestamp) return 'N/A';
    // Add 8 hours for UTC+8
    return new Date(timestamp.getTime() + 8 * 3600000).toISOString().replace('T', ' ').substring(0, 16);
}

export function calculateDaysDifference(startDate: Date): number {
    const today = new Date();
    // Ensure we compare date parts only, ignoring time for day difference
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = Math.abs(todayDay.getTime() - startDay.getTime());
    // Add 1 because the difference should include the start day itself if comparing to today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function getFeeClass(value: number | null): string {
    if (value === null) return '';
    return value >= 0 ? 'fee-positive' : 'fee-negative';
}
