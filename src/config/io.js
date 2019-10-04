const app = require('./router').getServer()
const io = require('socket.io')(app)
var connected = {}
var identifier = {}

io.on('connection', socket => {

    identifier[socket.id] = {
        clientId: null,
        branchId: null,
        userId: null,
        fullname: null,
    }
    // notice user connected and add to client & branch room
    socket.on('connected', msg => {        
        connected[msg.userId] = socket
        identifier[socket.id] = {
            clientId: msg.clientId,
            branchId: msg.branchId,
            userId: msg.userId,
            fullname: msg.fullname,
        }
        socket.join(`client_${msg.clientId}`)
        socket.join(`branch_${msg.branchId}`)        
        socket.in(`client_${msg.clientId}`).in(`branch_${msg.branchId}`).emit('connected', msg)
    })

    socket.on('disconnect', () => {
        let msg = identifier[socket.id]
        socket.broadcast.in(`client_${msg.clientId}`).in(`branch_${msg.branchId}`).emit('disconnected', msg)
        delete connected[msg.user]
        delete identifier[socket.id]
    })

    socket.on('logout', msgres => {
        let msg = identifier[socket.id]
        socket.broadcast.in(`client_${msg.clientId}`).in(`branch_${msg.branchId}`).emit('disconnected', msg)
        delete connected[msg.user]
        delete identifier[socket.id]
    })

    //joining room (menu in this case)
    socket.on('join', msg => {
        console.log('join', msg)
        socket.join(`room_${msg.clientId}_${msg.branchId}_${msg.myroom}`)
    })
    
    //leaving room (menu in this case)
    socket.on('leave', msg => {
        console.log('leave', msg)
        socket.leave(`room_${msg.clientId}_${msg.branchId}_${msg.myroom}`)
    })    

    return io
})

exports.io = io
exports.connected = connected