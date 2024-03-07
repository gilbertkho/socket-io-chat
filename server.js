const express = require('express');
const app = express();
const server = require('http').createServer(app);

app.use(express.static('./src'));

app.get('/', async(req, res) => {
    return res.status(200).sendFile('index.js');
});

const io = require('socket.io')(server,{
    cors: {
        origin: ['http://localhost:3000'],
    },
});

io.on('connection', socket => {
    //console.log(socket.id);
    socket.on('send-message',(message, room) => {
        //io.emit('receive-message',message);
        //socket.broadcast.emit("receive-message", message);
        if(room === ''){
            //console.log('MASUK SINI');
            //broadcast message
            socket.broadcast.emit("receive-message", message);
        }
        else{
            //sending message privately to room
            //meet person to one room
            socket.to(room).emit("receive-message", message);
        }
    });

    //join room
    socket.on('join-room', (room) => {
        socket.join(room);
    })

    //typing status
    socket.on('typing', (room, status) => {
        console.log(room,status);
        if(room === ''){
            //console.log('MASUK SINI');
            //broadcast message
            socket.broadcast.emit("type-status", status);
        }
        else{
            //sending message privately to room
            //meet person to one room
            socket.to(room).emit("type-status", status);
        }
    })
});

server.listen(8080, () => {    
    console.log(`server started!`);
    //npm run devStart
    //console.log(process.env.PORT);
    //console.log(hostname.port);
    // console.log(`Listening to ${hostname.host}`)    
})