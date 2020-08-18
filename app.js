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

// Set the origins for request messagess
// io.origins("http://localhost:8080/")

io.on('connection', (socket) => {
    console.log(chalk.bgGreen.black(" CONNECTION "), 
                `Socket ${socket.id} connected.`)
    
    socket.on("join-room", (msg) => {
        console.log(msg)
        socket.join(msg.room)
        socket.to(msg.room).broadcast.emit('userJoined', msg, socket.id)    
    })

    socket.on("myData", (msg) => {
        let { connectedId } = msg
        delete msg.connectedId
        socket.to(connectedId).emit('myData', msg)
    })

    socket.on("ready", (msg) => {
        console.log(msg)
        let { room } = msg;
        io.to(room).emit('ready', msg.id)
    })

    socket.on('disconnecting', () => {
        const rooms = Object.keys(socket.rooms);
        io.to(rooms[1]).emit('chat message', "User left the chat...")
    })

    socket.on('chat message', (roomID, msg) => {
        io.to(roomID).emit('chat message', msg)
    })
  });


http.listen(1337, () => {
    console.log(chalk.bgGreen.black("\n Listening on 1337 port "))
    console.log("\n http://localhost:1337/ \n")
})

