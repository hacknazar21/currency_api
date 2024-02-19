const db = require("../db");
const rp = require('request-promise');
const parse = require('cheerio');
const fetch = require("node-fetch");

const banks = [{
    name: 'halyk',
    url: 'https://halykbank.kz/exchange-rates'
}, {
    name: 'jusan',
    url: 'https://jusan.kz/exchange-rates'
}, {
    name: 'bcc',
    url: 'https://www.bcc.kz/personal/savings/fx-exchange/'
}]

class CurrencyController {
    async createCurrency({sell, buy, currency, bank }) {
        const currencyValue = await db.query("SELECT * FROM currency where currency=$1 and bank=$2", [currency, bank])
        const updateCurrency = this.updateCurrency
        if(!currencyValue.rows[0]) await db.query(
            `INSERT INTO currency (currency, sell, buy, bank) values ($1, $2, $3, $4) RETURNING *`,
            [currency, sell, buy, bank]
        )
        else await updateCurrency({sell, buy, currency, bank})
    }
    async getCurrencies(req, res) {
        const currencies = await db.query("SELECT * FROM currency ORDER BY id")
        res.json(currencies.rows)
    }

    async getCurrency(req, res) {
        const id = req.params.id
        const currency = await db.query("SELECT * FROM currency where id=$1", [id])
        if(currency.rows[0])
            res.json(currency.rows[0])
        else res.sendStatus(404);
    }
    async updateCurrency({sell, buy, currency, bank}) {
        await db.query("UPDATE currency SET sell=$1, buy=$2 WHERE currency=$3 and bank=$4", [sell, buy, currency, bank])
    }

    async fetchCurrencies() {
        const createCurrency = this.createCurrency.bind(this)
        banks.map(async (bank) => {
            const bankName = bank.name;
            switch (bankName) {
                case "halyk":
                    const resp = await fetch('https://back.halykbank.kz/common/currency-history')
                    const json = await resp.json();
                    const currencies = [];
                    const privatePersons = json.data.currencyHistory[0].privatePersons;
                    for (const privatePersonsKey in json.data.currencyHistory[0].privatePersons) {
                        currencies.push({
                            sell: privatePersons[privatePersonsKey].sell,
                            buy: privatePersons[privatePersonsKey].buy,
                            currency: privatePersonsKey.replace('/KZT', '')
                        })
                    }
                    currencies.map(currency => createCurrency({...currency, bank: bankName}))
                    break;
                case "bcc":
                    rp(bank.url)
                        .then(function (html) {
                            const $ = parse.load(html)
                            const currencies = [];
                            const $currencies = $('div.mb-6.exchange-card-list>div.flex.items-center');
                            let i = 0, j = 0;
                            $currencies.map((index, currency) => {
                                const $currency = $(currency);
                                const currencyValue = $($currency).text().replace(/[^a-z0-9,.]/gi, '')
                                if(currencies[i]) {
                                    if(j === 0) {
                                        currencies[i] = {
                                            ...currencies[i],
                                            currency: currencyValue
                                        }
                                    } else if (j === 1) {
                                        currencies[i] = {
                                            ...currencies[i],
                                            buy: currencyValue
                                        }
                                    } else {
                                        currencies[i] = {
                                            ...currencies[i],
                                            sell: currencyValue
                                        }
                                    }
                                } else {
                                    currencies[i] = {
                                        currency: currencyValue
                                    }
                                }
                                if(++j === 3) {
                                    j = 0
                                    i++
                                }
                            })
                            currencies.map(currency => createCurrency({...currency, bank: bankName}))
                        })
                        .catch(function (err) {
                            console.log(err)
                        })
                    break;
                case "jusan":
                    const respJusan = await fetch('https://jusan.kz/currency/exchange')
                    const jsonJusan = await respJusan.json();
                    const currenciesJusan = [];
                    for (const jsonJusanElement of jsonJusan) {
                        if(jsonJusanElement.exchangeType === "2"){
                            if(jsonJusanElement.currencyFrom !== "USD" && jsonJusanElement.currencyFrom !== "RUB" && jsonJusanElement.currencyFrom !== "EUR")
                                currenciesJusan.push({
                                    sell: jsonJusanElement.saleSum,
                                    buy: jsonJusanElement.buyingSum,
                                    currency: jsonJusanElement.currencyFrom
                                })
                        } if(jsonJusanElement.exchangeType === "1"){
                            currenciesJusan.push({
                                sell: jsonJusanElement.saleSum,
                                buy: jsonJusanElement.buyingSum,
                                currency: jsonJusanElement.currencyFrom
                            })
                        }
                    }

                    currenciesJusan.map(currency => createCurrency({...currency, bank: bankName}))
                    break;
            }
            // rp(bank.url)
            //     .then(function (html) {
            //         const $ = parse.load(html)
            //         const currencies = [];
            //         const bankName = bank.name;
            //         switch (bank.name) {
            //             case "halyk":
            //                 const $currencies = $('div.flex.-gw.py-3.text-lg.font-bold');
            //                 // const $currencySell = $('.informer tr > td.sell');
            //                 // const $currencyName = $('.informer tr > td.currency');
            //                 $currencies.map((index, currency) => {
            //                     const $buy = $(currency);
            //                     console.log($($buy).text())
            //                     // if(currencies[index]) {
            //                     //     currencies[index] = {
            //                     //         ...currencies[index],
            //                     //         buy: $(currency).text()
            //                     //     }
            //                     // } else {
            //                     //     currencies.push({
            //                     //         buy: $(currency).text()
            //                     //     })
            //                     // }
            //                 })
            //                 console.log(currencies);
            //                 // $currencySell.map((index, currency) => {
            //                 //     if(currencies[index])
            //                 //         currencies[index] = {
            //                 //             ...currencies[index],
            //                 //             sell: $(currency).text()
            //                 //         }
            //                 // })
            //                 // $currencyName.map((index, currency) => {
            //                 //     if(currencies[index])
            //                 //         currencies[index] = {
            //                 //             ...currencies[index],
            //                 //             name: $(currency).text()
            //                 //         }
            //                 // })
            //                 break;
            //             case "bcc":
            //                 break;
            //             case "jusan":
            //                 break;
            //         }
            //         // currencies.map(currency => createCurrency({...currency, bank: bankName}))
            //     })
            //     .catch(function (err) {
            //         console.log(err)
            //     })
        })
    }
}

module.exports = new CurrencyController()
