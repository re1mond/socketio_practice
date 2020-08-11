const path = require('path')

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const chalk = require('chalk')
const uuid = require('uuid')

app.get('/', (req, res) => {
    res.redirect(uuid())
})

app.get('/:room', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

io.on('connection', (socket) => {
    console.log(chalk.bgGreen(" CONNECTION "), 
                `User ${socket.id} connected!`)
    
    socket.on("join-room", (roomID) => {
        socket.join(roomID)
        socket.to(roomID).broadcast.emit('user-joined', socket.id)    
    })

    socket.on('disconnecting', () => {
        const rooms = Object.keys(socket.rooms);
        console.log(rooms)
        //socket.emit('leave-group',)
    })

    socket.on('chat message', (roomID, msg) => {
        socket.to(roomID).emit('chat message', msg)
    })

  });



http.listen(1337, () => {
    console.log(chalk.bgBlue("\nListening on 1337 port"))
    console.log("http://localhost:1337/ \n")
})

