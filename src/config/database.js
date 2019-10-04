const mariadb = require('mariadb')

//online
// let pool = mariadb.createPool({  
//   host: 'clover-resources.com',
//   port: '3306',
//   user: 'xupwlpoo_root',
//   password: 'n0madgen007',
//   database: 'xupwlpoo_dys',
// })

//offline
let pool = mariadb.createPool({
  host: '192.168.0.154',
  port: '3306',
  user: 'root',
  password: 'n0madgen007',
  database: 'dys',
})

// let pool = mariadb.createPool({
//   host: 'localhost',
//   port: '3306',
//   user: 'root',
//   password: 'n0madgen007',
//   database: 'dys',
// })

// let pool = mariadb.createPool({
//   host: '192.168.43.58',
//   port: '3306',
//   user: 'root',
//   password: 'n0madgen007',
//   database: 'dys',
// })

module.exports = pool