const app = require('./router').getServer()
const io = require('socket.io')(app)
var connected = {}

io.on('connection', socket => {
    
    // notice user connected and add to client & branch room
    socket.on('connected', msg => {
        socket.join([`client_${msg.clientId}`, `branch_${msg.branchId}`], () => {
            connected[msg.userId] = socket
            socket.broadcast.emit('connected', msg)
        })
    })

    //joining room (menu in this case)
    socket.on('join', msg => {
        console.log('join', msg)
        socket.join(`${msg.clientId}_${msg.branchId}_room_${msg.myroom}`)
    })
    
    //leaving room (menu in this case)
    socket.on('leave', msg => {
        console.log('leave', msg)
        socket.leave(`${msg.clientId}_${msg.branchId}_room_${msg.myroom}`)
    })

    socket.on('disconnect user', () => {
        // console.log('[Client disconnected]')
        socket.removeAllListeners()
    })

    socket.on('disconnect', () => {
        // console.log('[Client disconnected]')
    })

    return io
})

exports.io = io
exports.connected = connected