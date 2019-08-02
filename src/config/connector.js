const mariadb = require('mariadb')

// let pool = mariadb.createPool({  
//   host: 'dys-resources.com',
//   port: '3306',
//   user: 'xupwlpoo_root',
//   password: 'n0madgen007',
//   database: 'xupwlpoo_dys_resources',
// })

let pool = mariadb.createPool({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'n0madgen007',
  database: 'ds',
})

module.exports = pool