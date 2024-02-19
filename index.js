const express = require('express')
const currencyRouter = require('./routes/currency.route')
const PORT = process.env.PORT || 8000

const app = express()
const currencyController = require('./controller/currency.controller')

// Run the function immediately when the script starts
const fetchCurrencies = currencyController.fetchCurrencies.bind(currencyController)
fetchCurrencies();


function callEveryHour() {
    setInterval(fetchCurrencies, 1000 * 60 * 60);
}

const nextDate = new Date();
if (nextDate.getMinutes() === 0) { // You can check for seconds here too
    callEveryHour()
} else {
    nextDate.setHours(nextDate.getHours() + 1);
    nextDate.setMinutes(0);
    nextDate.setSeconds(0);// I wouldn't do milliseconds too ;)

    const difference = nextDate - new Date();
    setTimeout(callEveryHour, difference);
}

app.use('/api', currencyRouter)

app.listen(PORT, () => {})
