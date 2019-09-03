// const server = require('restana/libs/turbo-http') // not support for api yet
// const compression = require('compression')
const queryParser = require('connect-query')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = require('restana')({
    logger: true,
    // server,
    // server: https.createServer({
    //     key: "./ssl/keys/ccd1f_1ac91_2a402f02d1fd324d4ff1ac28e5df6d05.key",
    //     cert: "./ssl/certs/_wildcard__dys_resources_com_c81f3_313a1_1597513948_128c689bcdf16dfc70145b7a7a3265f2.crt",
    // }),
})

app.use(cors())
app.use(queryParser())
app.use(bodyParser.json())
app.use(function (req, res, next) {
    req.io = require('./io').io
    req.connected = require('./io').connected
    next()
})

app.get('/', (req, res) => {
    res.send(`API is Working fine`)
})

// //==================== auth =====================
const auth = require('../model/auth');
app.get('/checkSession', auth.checkSession)
app.get('/getMenu', auth.getMenu)
app.get('/getMenuByToken', auth.getMenuByToken)
app.post('/in', auth.in)
app.put('/out', auth.out)

//==================== user =====================
const user = require('../model/user');
app.get('/user', user.get)
app.get('/user/:id', user.getById)
app.post('/user', user.create)
app.put('/user', user.update)
app.delete('/user/:id', user.delete)

//==================== akses user =====================
const privilege = require('../model/privilege');
app.get('/privilege', privilege.get)
app.get('/privilege/:id', privilege.getById)
app.put('/privilege', privilege.update)

//==================== department =====================
const department = require('../model/department');
app.get('/department', department.get)
app.get('/department/:id', department.getById)
app.post('/department', department.create)
app.put('/department', department.update)
app.delete('/department/:id', department.delete)

//==================== employment =====================
const employment = require('../model/employment');
app.get('/employment', employment.get)
app.get('/employment/:id', employment.getById)
app.post('/employment', employment.create)
app.put('/employment', employment.update)
app.delete('/employment/:id', employment.delete)

//==================== employee =====================
const employee = require('../model/employee');
app.get('/employee', employee.get)
app.get('/employee/:id', employee.getById)
app.post('/employee', employee.create)
app.put('/employee', employee.update)
app.delete('/employee/:id', employee.delete)

//==================== customer =====================
const customer = require('../model/customer');
app.get('/customer', customer.get)
app.get('/customer/:id', customer.getById)
app.post('/customer', customer.create)
app.put('/customer', customer.update)
app.delete('/customer/:id', customer.delete)

//==================== warehouse =====================
const warehouse = require('../model/warehouse');
app.get('/warehouse', warehouse.get)
app.get('/warehouse/:id', warehouse.getById)
app.post('/warehouse', warehouse.create)
app.put('/warehouse', warehouse.update)
app.delete('/warehouse/:id', warehouse.delete)

//==================== producttype =====================
const producttype = require('../model/producttype');
app.get('/producttype', producttype.get)
app.get('/producttype/:id', producttype.getById)
app.post('/producttype', producttype.create)
app.put('/producttype', producttype.update)
app.delete('/producttype/:id', producttype.delete)

//==================== product =====================
const product = require('../model/product');
app.get('/product', product.get)
app.get('/product/:id', product.getById)
app.post('/product', product.create)
app.put('/product', product.update)
app.delete('/product/:id', product.delete)

//==================== vendor =====================
const vendor = require('../model/vendor');
app.get('/vendor', vendor.get)
app.get('/vendor/:id', vendor.getById)
app.post('/vendor', vendor.create)
app.put('/vendor', vendor.update)
app.delete('/vendor/:id', vendor.delete)

module.exports = app