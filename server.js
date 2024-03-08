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

let connectedUsers = [];
io.on('connection', async (socket) => {
    //connectedUsers.push(socket);
    //console.log(socket);
    // const projects = await fetchProjects(socket);
    // console.log(projects);
    //console.log(socket.id);

    socket.on('send-message', (message, room, name = "") => {
        //io.emit('receive-message',message);
        //socket.broadcast.emit("receive-message", message);
        console.log('send-message', {
            message: message,
            room: room,
            name: name,
        });

        if(room === ''){
            //broadcast message to all connected user
            socket.broadcast.emit("receive-message", message, name);
        }
        else{
            //sending message privately to room
            //meet person to one room
            socket.to(room).emit("receive-message", message, name);
            getConnectedUsers(room, name);
        }
    });

    const getConnectedUsers = (room, name) => {
        let userData = {
            socket_id: socket.id,
            room: room,
            name: name,
        }

        //console.log("CONNECTED USERS", userData);

        let check_users = false //not exist
        for(let i = 0; i < connectedUsers.length; i++){
            if(connectedUsers[i].room && connectedUsers[i].room != ''){
                if(connectedUsers[i].room  == room && connectedUsers[i].name == name){
                    check_users = true;
                }
            }
        }

        if(!check_users){
            connectedUsers.push(userData);
        }
        socket.to(room).emit('connected-users', connectedUsers);


        //console.log(connectedUsers);
    }

    socket.on('read-receipt', (room, name = '') => {
        getConnectedUsers(room, name);
    });

    //join room
    socket.on('join-room', (room, name = '') => {
        console.log(room, name);
        socket.join(room);
        getConnectedUsers(room, name);
    });

    //typing status
    socket.on('typing', (room, name = '', status) => {
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
        getConnectedUsers(room, name);
    })

    socket.on('disconnect', () => {
        //console.log('JUMLAH ROOM DISCONNECT',socket.client);
        console.log(socket.id);
        if(connectedUsers.length > 0){
            let check_users = false;
            for(let i = 0; i < connectedUsers.length; i++){
                if(connectedUsers[i].socket_id == socket.id){
                    check_users = true;
                }
            }

            console.log('USER ARRAY', connectedUsers);
    
            let getDisconnectedIdx = connectedUsers.findIndex((con) => con.socket_id == socket.id);
            console.log('SOCKET ID ARRAY INDEX',getDisconnectedIdx);
            let room               = connectedUsers[getDisconnectedIdx].room;
    
            connectedUsers.splice(getDisconnectedIdx, 1);
            console.log('USERS LEFT : ',connectedUsers);
            socket.to(room).emit('disconnected-users', connectedUsers);
        }
        
        //getConnectedUsers();
        //var i = connectedUsers.indexOf(socket);
        //connectedUsers.splice(i,1);
    })
});

server.listen(8080, () => {    
    console.log(`server started!`);
    //npm run devStart
    //console.log(process.env.PORT);
    //console.log(hostname.port);
    // console.log(`Listening to ${hostname.host}`)    
})