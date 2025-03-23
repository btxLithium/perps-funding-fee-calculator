document.getElementById('calcForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const startDateInput = document.getElementById('startDate').value;
    const position = parseFloat(document.getElementById('position').value);
    const resultElement = document.getElementById('result');
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    if (!startDateInput || isNaN(position)) {
        showToast("请输入有效的日期和持仓数量。");
        return;
    }

    // Show loading state
    submitButton.innerHTML = '<span class="material-icons spin">refresh</span> 计算中...';
    submitButton.disabled = true;
    resultElement.innerHTML = '<div class="loading"><span class="material-icons spin">refresh</span> 正在加载数据...</div>';

    const startDate = new Date(startDateInput);
    let totalFee = 0;

    // 从 GitHub 上获取数据文件的原始链接，请根据实际情况修改 URL
    const dataUrl = 'https://raw.githubusercontent.com/your-username/your-repo/your-branch/data/ltc_funding_rates.json';

    try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error('服务器响应错误: ' + response.status);
        }

        const rates = await response.json();

        // 假设数据是一个数组，每项格式如：{ "settleTime": "时间戳字符串", "fundingRate": "费率字符串", ... }
        let rateCount = 0;
        rates.forEach(item => {
            const settleTime = new Date(parseInt(item.settleTime));
            if (settleTime >= startDate) {
                const rate = parseFloat(item.fundingRate);
                totalFee += position * rate;
                rateCount++;
            }
        });

        // Format the date for display
        const formattedDate = formatDate(startDate);
        const formattedFee = totalFee.toFixed(8);

        // Success result with material design styling
        resultElement.innerHTML = `
            <div class="result-card">
                <div class="result-header">计算结果</div>
                <div class="result-details">
                    <p><strong>起始日期:</strong> ${formattedDate}</p>
                    <p><strong>持仓数量:</strong> ${position} LTC</p>
                    <p><strong>结算次数:</strong> ${rateCount} 次</p>
                    <p class="result-amount"><strong>总计资金费:</strong> ${formattedFee} USDT</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("数据获取失败：", error);
        resultElement.innerHTML = `
            <div class="error-message">
                <span class="material-icons">error</span>
                <p>数据加载失败，请稍后重试。</p>
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
    return date.toLocaleDateString('zh-CN', {
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
