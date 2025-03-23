document.getElementById('calcForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const startDateInput = document.getElementById('startDate').value;
    const position = parseFloat(document.getElementById('position').value);
    if (!startDateInput || isNaN(position)) {
        alert("请输入有效的日期和持仓数量。");
        return;
    }
    const startDate = new Date(startDateInput);
    let totalFee = 0;

    // 从 GitHub 上获取数据文件的原始链接，请根据实际情况修改 URL
    const dataUrl = 'https://raw.githubusercontent.com/your-username/your-repo/your-branch/data/ltc_funding_rates.json';
    try {
        const response = await fetch(dataUrl);
        const rates = await response.json();
        // 假设数据是一个数组，每项格式如：{ "settleTime": "时间戳字符串", "fundingRate": "费率字符串", ... }
        rates.forEach(item => {
            const settleTime = new Date(parseInt(item.settleTime));
            if (settleTime >= startDate) {
                const rate = parseFloat(item.fundingRate);
                totalFee += position * rate;
            }
        });
        document.getElementById('result').innerText = `从 ${startDateInput} 至今，总计资金费：${totalFee.toFixed(8)}（USDT）`;
    } catch (error) {
        console.error("数据获取失败：", error);
        document.getElementById('result').innerText = "数据加载失败，请稍后重试。";
    }
});
