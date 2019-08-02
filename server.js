const router = require('./src/config/router')

router.start(1993).then(server => { console.log(`API berjalan pada port ${server.address().port}`) })        