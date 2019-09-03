const app = require('./src/config/router')

app.start('13131').then(server => { console.log(`API berjalan pada port ${server.address().port}`) })