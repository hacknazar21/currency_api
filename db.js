const Pool = require('pg').Pool
const pool = new Pool({
        user: 'currency_admin',
        password: 'a$N"7£>9R9&iO:j836GAA|',
        host: 'localhost',
        database: 'currency_api'
})

// {
//     username: 'admin',
//         password: 'admin',
//     host: 'localhost',
//     database: 'currency_api'
// }
// {
//     user: 'currency_admin',
//         password: 'a$N"7£>9R9&iO:j836GAA|',
//     host: 'localhost',
//     database: 'currency_api'
// }

module.exports = pool
