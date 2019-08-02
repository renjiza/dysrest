const router = require('./src/config/router')

router.start(1313).then(server => { console.log(`API berjalan pada port ${server.address().port}`) })        