const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getMessaging } = require("firebase-admin/messaging");
process.env.GOOGLE_APPLICATION_CREDENTIALS;

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const fs = require('node:fs'); //file system API
const url = require('url'); //url API
let hostUrl = '';

var admin = require("firebase-admin");
//get sevice account key from project setting in firebase
/*var serviceAccount = require("./muatmuat-10fda-firebase-adminsdk-l7z4g-a32a2fe127.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});*/

//directory for views in src
app.use(express.static('./src'));

app.get('/', async(req, res) => {
    hostUrl = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });

    console.log(hostUrl);

    return res.status(200).sendFile('index.js');
});

app.get('/pic', async(req, res) => {
    return res.status(200).sendFile('tmp/upload/pic.png', {root: '.'});
});

const io = require('socket.io')(server,{
    cors: {
        origin: ['http://localhost:3000'],
    },
});

let connectedUsers = [];
io.on('connection', async (socket) => {
    console.log('HOST URL', hostUrl);
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

            //get Token From device;
            const registrationToken = `cFUsz7s2Rd2E2W1D1BxFb1:APA91bH6DEwcFja-IPZp6SguXCt842zzLl0rbjP9NuLyJRClu_7tithuaBXjZJM8pq3oG-TG5NNAfZsP53IzaQyGG1VZa5mKWOoC8v66nxembKtSddFlE0brlK84GIZqsfywXXy6S51l` 

            const notificationMessage = {
                data: {
                    message: message
                },
                token: registrationToken
            };

            getMessaging().send(notificationMessage)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });

            console.log(notificationMessage);
        }
    });

    const getConnectedUsers = (room, name) => {
        let userData = {
            socket_id: socket.id,
            room: room,
            name: name,
        }

        //console.log("CONNECTED USERS", userData);

        let check_users = false //not exist by name
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
        socket.join(room)
        io.to(room).emit('user-connected', `${name} connected!`);
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
    });

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
    });

    //get uploaded file
    socket.on('upload', (room, name, file, callback) => {
        console.log('ROOM', room);
        //console.log('tesss');
        //console.log(file);
        file = Buffer.from(file,'base64');

        fs.writeFile("tmp/upload/pic.png", file, (err) => {
            //callback({ message: err ? "failure" : "success" });
            if(err){
                console.log(err);
            }
            else{
                let imageUrl = "http://localhost:8080/pic";
                socket.to(room).emit('getFile', imageUrl, name);
                console.log('MASUKK');
            }
        });
    })
});

server.listen(8080, () => { 
    console.log(`server started!`);
    //npm run devStart
    //console.log(process.env.PORT);
    //console.log(hostname.port);
    // console.log(`Listening to ${hostname.host}`)    
})