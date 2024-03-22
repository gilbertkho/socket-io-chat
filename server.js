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
var serviceAccount = require("./muatmuat-10fda-firebase-adminsdk-l7z4g-a32a2fe127.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//directory for views in src
app.use(express.static('./src'));

app.get('/', async(req, res) => {
    hostUrl = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });

    console.log('HOST', hostUrl);

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
    //const projects = await fetchProjects(socket);
    //console.log(projects);
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
            getConnectedUsersInRoom(room, name);

            //get Token From device (still a static token taken from device)
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

    const getConnectedUsersInRoom = async (room, name) => {
        let userData = {
            socket_id: socket.id,
            room: room,
            name: name,
        }

        //console.log("CONNECTED USERS", userData);
        
        let check_users = false //not exist by name and room
        for(let i = 0; i < connectedUsers.length; i++){
            if(connectedUsers[i].room && connectedUsers[i].room != ''){
                if(connectedUsers[i].room  == room && connectedUsers[i].name == name){
                    check_users = true;
                }
            }
        }

        if(!check_users){
            //add user if user is not yet exist in room
            connectedUsers.push(userData);
        }

        //console.log('USERS', users);
        //console.log('total connected user ',connectedUsers);
        socket.to(room).emit('connected-users', connectedUsers);
        //console.log(connectedUsers);
    }

    socket.on('read-receipt', (room, name = '') => {
        //send back the connected users to client, to check if the other clients still in the room
        getConnectedUsersInRoom(room, name);
    });

    //join room
    socket.on('join-room', async (room, name = '') => {
        console.log('SOCKET ID CONNECT TO ROOM ',socket.id);
        console.log(room, name);
        socket.join(room)
        getConnectedUsersInRoom(room, name);
        let users = await io.in(room).fetchSockets();
        users = Array.from(users);
        //console.log('TOTAL USERS',Array.from(users));

        let cache = [];
        let str = JSON.stringify(users, function(key, value) {
            if (typeof value === "object" && value !== null) {
                if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // reset the cache

        socket.to(room).emit('user-connected', str, `${name} connected!`);
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
        getConnectedUsersInRoom(room, name);
    });

    socket.on('disconnect', () => {
        //console.log('JUMLAH ROOM DISCONNECT',socket.client);
        console.log('SOCKET ID DISCONNECT ',socket.id);
        if(connectedUsers.length > 0){
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

        //save file to folder with pic.png file name
        fs.writeFile("tmp/upload/pic.png", file, (err) => {
            callback({ message: err ? "failure" : "success" });
            if(err){
                //if error 
                console.log(err);
            }
            else{
                //if success
                let imageUrl = "http://localhost:8080/pic";
                socket.to(room).emit('getFile', imageUrl, name);
                console.log('file upload success');
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