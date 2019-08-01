const mariadb = require('mariadb')
let pool = mariadb.createPool({  
  host: 'localhost',
  port: '3306',
  database: 'ds',
  user: 'root',
  password: 'n0madgen007'  
})

module.exports = pool