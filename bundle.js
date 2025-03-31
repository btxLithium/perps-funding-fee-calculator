var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
document.addEventListener('DOMContentLoaded', function () {
    var calcForm = document.getElementById('calcForm');
    calcForm.addEventListener('submit', handleSubmit);
});
function handleSubmit(e) {
    return __awaiter(this, void 0, void 0, function () {
        var cryptocurrencyElement, startDateElement, positionValueElement, positionDirectionElement, resultElement, submitButton, originalButtonText, cryptocurrency, startDateInput, positionValue, positionDirection, startDate, today, binanceDataUrl, bitgetDataUrl, _a, binanceResponse, bitgetResponse, binanceRates, bitgetRates, directionMultiplier, binanceData, bitgetData, formattedDate, formattedBinanceFee, formattedBitgetFee, formattedBinanceHighest, formattedBinanceLowest, formattedBitgetHighest, formattedBitgetLowest, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    cryptocurrencyElement = document.getElementById('cryptocurrency');
                    startDateElement = document.getElementById('startDate');
                    positionValueElement = document.getElementById('positionValue');
                    positionDirectionElement = document.getElementById('positionDirection');
                    resultElement = document.getElementById('result');
                    submitButton = e.target.querySelector('button[type="submit"]');
                    originalButtonText = submitButton.innerHTML;
                    cryptocurrency = cryptocurrencyElement.value;
                    startDateInput = startDateElement.value;
                    positionValue = parseFloat(positionValueElement.value);
                    positionDirection = positionDirectionElement.value;
                    if (!startDateInput || isNaN(positionValue)) {
                        showToast("Please enter a valid date and position value.");
                        return [2 /*return*/];
                    }
                    startDate = new Date(startDateInput);
                    today = new Date();
                    if (startDate >= today) {
                        showToast("Start date cannot be today or a future date. Please select a past date.");
                        return [2 /*return*/];
                    }
                    // Show loading state
                    submitButton.innerHTML = '<span class="material-icons spin">refresh</span> Calculating...';
                    submitButton.disabled = true;
                    resultElement.innerHTML = '<div class="loading"><span class="material-icons spin">refresh</span> Loading data...</div>';
                    binanceDataUrl = "data/".concat(cryptocurrency.toLowerCase(), "_funding_rates_binance.json");
                    bitgetDataUrl = "data/".concat(cryptocurrency.toLowerCase(), "_funding_rates_bitget.json");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, Promise.all([
                            fetch(binanceDataUrl),
                            fetch(bitgetDataUrl)
                        ])];
                case 2:
                    _a = _b.sent(), binanceResponse = _a[0], bitgetResponse = _a[1];
                    if (!binanceResponse.ok) {
                        throw new Error('Binance data fetch error: ' + binanceResponse.status);
                    }
                    if (!bitgetResponse.ok) {
                        throw new Error('Bitget data fetch error: ' + bitgetResponse.status);
                    }
                    return [4 /*yield*/, binanceResponse.json()];
                case 3:
                    binanceRates = _b.sent();
                    return [4 /*yield*/, bitgetResponse.json()];
                case 4:
                    bitgetRates = _b.sent();
                    directionMultiplier = positionDirection === 'long' ? 1 : -1;
                    binanceData = calculateFees(binanceRates, startDate, positionValue, directionMultiplier, true);
                    bitgetData = calculateFees(bitgetRates, startDate, positionValue, directionMultiplier, false);
                    formattedDate = formatDate(startDate);
                    formattedBinanceFee = formatFee(binanceData.totalFee);
                    formattedBitgetFee = formatFee(bitgetData.totalFee);
                    formattedBinanceHighest = binanceData.highestFee !== null ?
                        "".concat(formatFee(binanceData.highestFee), "<br>(").concat(formatTimestampToUTC8(binanceData.highestFeeTime), ")") : 'N/A';
                    formattedBinanceLowest = binanceData.lowestFee !== null ?
                        "".concat(formatFee(binanceData.lowestFee), "<br>(").concat(formatTimestampToUTC8(binanceData.lowestFeeTime), ")") : 'N/A';
                    formattedBitgetHighest = bitgetData.highestFee !== null ?
                        "".concat(formatFee(bitgetData.highestFee), "<br>(").concat(formatTimestampToUTC8(bitgetData.highestFeeTime), ")") : 'N/A';
                    formattedBitgetLowest = bitgetData.lowestFee !== null ?
                        "".concat(formatFee(bitgetData.lowestFee), "<br>(").concat(formatTimestampToUTC8(bitgetData.lowestFeeTime), ")") : 'N/A';
                    // Success result with table styling
                    resultElement.innerHTML = "\n            <div class=\"result-card\">\n                <div class=\"result-header\">Calculation Results</div>\n                <div class=\"result-details\">\n                    <p><strong>Start Date:</strong> ".concat(formattedDate, "</p>\n                    <p><strong>Cryptocurrency:</strong> ").concat(cryptocurrency, "</p>\n                    <p><strong>Position Value:</strong> ").concat(positionValue, " USDT</p>\n                    <p><strong>Position Direction:</strong> ").concat(positionDirection.charAt(0).toUpperCase() + positionDirection.slice(1), "</p>\n                    \n                    <table class=\"result-table\">\n                        <thead>\n                            <tr>\n                                <th>Exchange</th>\n                                <th>Days</th>\n                                <th>Total Funding Fee (USDT)</th>\n                                <th>Highest Single Fee Income (USDT)</th>\n                                <th>Highest Single Fee Expense (USDT)</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            <tr>\n                                <td><span class=\"exchange-logo\"><img src=\"assets/binance-icon-logo.png\" alt=\"Binance\" class=\"exchange-icon\"> Binance</span></td>\n                                <td>").concat(calculateDaysDifference(startDate), "</td>\n                                <td class=\"fee-amount ").concat(getFeeClass(binanceData.totalFee), "\">").concat(formattedBinanceFee, "</td>\n                                <td class=\"fee-amount ").concat(getFeeClass(binanceData.highestFee), "\">").concat(formattedBinanceHighest, "</td>\n                                <td class=\"fee-amount ").concat(getFeeClass(binanceData.lowestFee), "\">").concat(formattedBinanceLowest, "</td>\n                            </tr>\n                            <tr>\n                                <td><span class=\"exchange-logo\"><img src=\"assets/bitget-icon-logo.png\" alt=\"Bitget\" class=\"exchange-icon\"> Bitget</span></td>\n                                <td>").concat(calculateDaysDifference(startDate), "</td>\n                                <td class=\"fee-amount ").concat(getFeeClass(bitgetData.totalFee), "\">").concat(formattedBitgetFee, "</td>\n                                <td class=\"fee-amount ").concat(getFeeClass(bitgetData.highestFee), "\">").concat(formattedBitgetHighest, "</td>\n                                <td class=\"fee-amount ").concat(getFeeClass(bitgetData.lowestFee), "\">").concat(formattedBitgetLowest, "</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        ");
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    console.error("Data fetch failed:", error_1);
                    resultElement.innerHTML = "\n            <div class=\"error-message\">\n                <span class=\"material-icons\">error</span>\n                <p>Failed to load data, please try again later.</p>\n                <p class=\"error-details\">".concat(error_1 instanceof Error ? error_1.message : String(error_1), "</p>\n            </div>\n        ");
                    return [3 /*break*/, 7];
                case 6:
                    // Restore button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function calculateFees(rates, startDate, positionValue, directionMultiplier, isBinance) {
    var result = {
        totalFee: 0,
        rateCount: 0,
        highestFee: null,
        highestFeeTime: null,
        lowestFee: null,
        lowestFeeTime: null
    };
    rates.forEach(function (item) {
        // Binance uses fundingTime instead of settleTime
        var timeField = isBinance ? item.fundingTime : item.settleTime;
        if (!timeField)
            return;
        var settleTime = new Date(parseInt(timeField));
        if (settleTime >= startDate) {
            var rate = parseFloat(item.fundingRate);
            // Apply direction multiplier to the rate
            var adjustedRate = rate * directionMultiplier;
            var fee = positionValue * adjustedRate;
            result.totalFee += fee;
            result.rateCount++;
            // Track highest fee
            if (result.highestFee === null || fee > result.highestFee) {
                result.highestFee = fee;
                result.highestFeeTime = settleTime;
            }
            // Track lowest fee
            if (result.lowestFee === null || fee < result.lowestFee) {
                result.lowestFee = fee;
                result.lowestFeeTime = settleTime;
            }
        }
    });
    return result;
}
function showToast(message) {
    var toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.innerHTML = "<span class=\"material-icons\">info</span>".concat(message);
    document.body.appendChild(toastElement);
    // Force reflow to enable transition
    toastElement.offsetHeight;
    toastElement.classList.add('show');
    setTimeout(function () {
        toastElement.classList.remove('show');
        setTimeout(function () {
            document.body.removeChild(toastElement);
        }, 300);
    }, 3000);
}
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function formatFee(fee) {
    if (fee === null)
        return 'N/A';
    return fee.toFixed(6);
}
function formatTimestampToUTC8(timestamp) {
    if (!timestamp)
        return 'N/A';
    return new Date(timestamp.getTime() + 8 * 3600000).toISOString().replace('T', ' ').substring(0, 16);
}
function calculateDaysDifference(startDate) {
    var today = new Date();
    var diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
function getFeeClass(value) {
    if (value === null)
        return '';
    return value >= 0 ? 'fee-positive' : 'fee-negative';
}
