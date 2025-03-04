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


let exchangeRates = new Map();

async function fetchExchangeRates() {
    try {
        const keyResponse = await fetch('/api/key');
        const keyData = await keyResponse.json();
        const apiKey = keyData.apiKey;

        const response = await fetch(`http://data.fixer.io/api/latest?access_key=${apiKey}`);
        console.log(response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();


        for (const [currency, rate] of Object.entries(data.rates)) {
            exchangeRates.set(currency, rate);
        }
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
            if (currency !== "USD" && rates[currency] <= 10) {
            filteredRates[currency] = rates[currency];
            }
        }
    }
    return filteredRates;
}


function displayExchangeRates(rates) {
    if (typeof rates !== 'object' || rates === null) {
        console.error('Invalid input: rates should be an object.');
        return;
    }

    const ratesArray = Object.entries(rates);

    for (const [currency, rate] of ratesArray) {
        if (typeof currency !== 'string' || currency.length !== 3) {
            console.error(`Invalid currency code: ${currency}. Currency codes should be 3-letter strings.`);
            return;
        }
        if (typeof rate !== 'number' || rate <= 0) {
            console.error(`Invalid rate for ${currency}: ${rate}. Rates should be positive numbers greater than 0.`);
            return;
        }
    }

    ratesArray.sort((a, b) => a[1] - b[1]);

    const labels = ratesArray.map(rate => rate[0]);
    const data = ratesArray.map(rate => rate[1]);

    if (labels.length === 0 || data.length === 0) {
        console.error('No valid exchange rates to display.');
        return;
    }

    const ctx = document.getElementById('exchangeRatesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Exchange Rates for €1 EUR',
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

document.addEventListener('DOMContentLoaded', fetchExchangeRates);

// Use the stored exchange rates for conversion
document.getElementById('converter-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;


    if (isNaN(amount) || amount <= 0) {
        return document.getElementById('result').innerText = '0';    
    }

    try {
        const fromRate = exchangeRates.get(fromCurrency);
        const toRate = exchangeRates.get(toCurrency);
        const convertedAmount = (amount / fromRate) * toRate;
        const symbol = currencySymbols[toCurrency] || "";
        document.getElementById('result').innerText = `${symbol}${convertedAmount.toFixed(2)}`;
    } catch (error) {
        document.getElementById('result').innerText = `Error: ${error.message}`;
    }
});

document.getElementById('switchButton').addEventListener('click', function() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
});


//FOR TESTING
function printExchangeRates() {
    console.log('Exchange Rates:');
    exchangeRates.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });
}


//COMMENTS FORM
document.getElementById('feedbackForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const feedback = document.getElementById('feedback').value.trim();

    if (name.length === 0) {
        alert('Name is required.');
        return;
    }
    if (feedback.length === 0) {
        alert('Comment is required.');
        return;
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedFeedback = sanitizeInput(feedback);

    fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: sanitizedName, feedback: sanitizedFeedback })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Invalid Format or an error occurred while saving your feedback. Please try again later.');
            });
        }
        return response.text();
    })
    .then(data => {
        alert('Form submitted successfully');
        document.getElementById('formResponse').innerText = data;
    })
    .catch(error => {
        alert('Invalid Format or an error occurred while saving your feedback. Please try again later.');
        document.getElementById('formResponse').innerText = `Error: ${error.message}`;
    });
});

function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}