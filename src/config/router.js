// const server = require('restana/libs/turbo-http') // not support for api yet
// const compression = require('compression')
const queryParser = require('connect-query')
const bodyParser = require('body-parser')
const cors = require('cors')
const router = require('restana')({
    // server,
    logger: true
    // server: https.createServer({
    //     key: keys.serviceK ey,
    //     cert: keys.certificate
    // })
})

router.use(cors())
router.use(queryParser())
router.use(bodyParser.json())
// router.use(compression({level: 2, memLevel: 9}))


router.get('/', (req, res) => {
    res.send(`API is Working fine`)
})

//==================== auth =====================
const login = require('../model/login');
router.get('/checkSession', login.checkSession)
router.get('/getMenu', login.getMenu)
router.get('/getMenuByToken', login.getMenuByToken)
router.post('/in', login.in)
router.put('/out', login.out)

//==================== user & hak akses =====================
const user = require('../model/user');
router.get('/user', user.get)
router.get('/user/:id', user.getById)
router.post('/user', user.create)
router.put('/user', user.update)
router.delete('/user/:id', user.delete)

//product
// const product = require('../model/product');
// router.get('/product', product.get)
// router.get('/product/:id', product.getById)
// router.post('/product', product.create)
// router.put('/product', product.update)
// router.delete('/product/:id', product.delete)

module.exports = router