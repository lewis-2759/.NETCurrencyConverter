const currencySymbols = {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "AUD": "A$",
    "CAD": "C$",
    "CHF": "CHF",
    "CNY": "¥",
    "SEK": "kr",
    "NZD": "NZ$",
    "MXN": "$",
    "SGD": "S$",
    "HKD": "HK$",
    "NOK": "kr",
    "KRW": "₩",
    "TRY": "₺",
    "INR": "₹",
    "RUB": "₽",
    "BRL": "R$",
    "ZAR": "R"
};

async function fetchExchangeRates() {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        let filteredRates = filterRates(data.rates);
        filteredRates = filterOutliers(filteredRates);
        displayExchangeRates(filteredRates);
    } catch (error) {
        document.getElementById('snapshot').innerText = `Error: ${error.message}`;
    }
}

function filterOutliers(rates) {
    const values = Object.values(rates);
    values.sort((a, b) => a - b);

    const q1 = values[Math.floor(values.length / 4)];
    const q3 = values[Math.ceil(values.length * (3 / 4))];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const filteredRates = {};
    for (const [currency, rate] of Object.entries(rates)) {
        if (rate >= lowerBound && rate <= upperBound) {
            filteredRates[currency] = rate;
        }
    }
    return filteredRates;
}

function filterRates(rates) {
    const filteredRates = {};
    for (const currency in rates) {
        if (currencySymbols.hasOwnProperty(currency)) {
            if(currency != "USD") {
            filteredRates[currency] = rates[currency];
            }
        }
    }
    return filteredRates;
}


function displayExchangeRates(rates) {
    // Convert rates object to an array of [currency, rate] pairs
    const ratesArray = Object.entries(rates);

    // Sort the array by rate values
    ratesArray.sort((a, b) => a[1] - b[1]);

    // Separate the sorted array back into labels and data arrays
    const labels = ratesArray.map(rate => rate[0]);
    const data = ratesArray.map(rate => rate[1]);

    const ctx = document.getElementById('exchangeRatesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Exchange Rates for $1 USD',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function fetchHistoricalData(fromCurrency, toCurrency) {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const response = await fetch(`https://api.exchangerate-api.com/v4/history/${fromCurrency}/${toCurrency}?start_at=${startDate.toISOString().split('T')[0]}&end_at=${endDate.toISOString().split('T')[0]}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Historical data:', data);
        displayHistoricalData(data.rates, toCurrency);
    } catch (error) {
        document.getElementById('historicalChart').innerText = `Error: ${error.message}`;
    }
}

function displayHistoricalData(rates, toCurrency) {
    const labels = Object.keys(rates).sort();
    const data = labels.map(date => rates[date][toCurrency]);
    const ctx = document.getElementById('historicalChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Exchange Rate for ${toCurrency} over the Last Month`,
                data: data,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchExchangeRates);

document.getElementById('converter-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    try {
        const response = await fetch(`/api/currency/convert?amount=${amount}&fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const symbol = currencySymbols[toCurrency] || "";
        document.getElementById('result').innerText = `${data.convertedAmount}`;
        await fetchHistoricalData(fromCurrency, toCurrency);
    } catch (error) {
        document.getElementById('result').innerText = `Error: ${error.message}`;
    }
});

document.getElementById('switchButton').addEventListener('click', function() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    // Swap the selected values
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
});
