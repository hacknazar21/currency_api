const Pool = require('pg').Pool
const pool = new Pool({
    username: 'postgres',
    password: 'root',
    host: 'localhost',
    database: 'currency_api'
})


module.exports = pool
