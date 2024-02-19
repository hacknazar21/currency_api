const Router = require('express')
const router = new Router()
const currencyController = require('../controller/currency.controller')
router.get('/currencies', currencyController.getCurrencies.bind(currencyController))
router.get('/currencies/:id', currencyController.getCurrency)

module.exports = router
