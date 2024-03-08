const socket = io('http://localhost:8080');

let connectedUsers = 0;

const showMessage = (message, name = '', info) => {
    let bubble = info ==  'client' ? 
    `<div class="msg flex justify-end text-black">
        <div class="w-fit border border-black p-[10px] m-[15px]">
            ${name}
            <ul class="list-disc list-inside">
                <li>${message}</li>
            </ul>
        </div>
    </div>`: 
    `<div class="msg flex justify-start text-black">
        <div class="w-fit border border-black p-[10px] m-[15px]">
            ${name}
            <ul class="msg-content list-disc list-inside ${connectedUsers > 1 ? 'read-receipt' : ''}">
                <li>${message}</li>
            </ul>
        </div>
    </div>`;

    $('#chat-content').append(bubble);
    var elem = document.getElementById('chat-content');
    elem.scrollTop = elem.scrollHeight;
}

const showTypingStatus = (status, info) => {
    //console.log('brooo ajaa');
    let bubble = info ==  'client' ? 
    `<div class="typing flex justify-end text-black">
        <div class="w-fit border border-black p-[10px] m-[15px]">
            <img src="./typing.gif" width='100'>
        </div>
    </div>`: 
    `<div class="typing flex justify-start text-black">
        <div class="w-fit border border-black p-[10px] m-[15px]">
            <img src="./typing.gif" width='100'>
        </div>
    </div>`;

    if(status && $('.typing').length <= 0){
        $('#chat-content').append(bubble);
        var elem = document.getElementById('chat-content');
        elem.scrollTop = elem.scrollHeight;
    }
    else if(!status){
        $('.typing').remove();
    }
}

$("#join").on('click', function(){
    let name    = $('#name').val() ? $('#name').val() : '';
    let room    = $('#room').val();
    //console.log(room, name);
    socket.emit('join-room', room, name);
});

$('#send').on('click', function(){
    let name    = $('#name').val() ? $('#name').val() : '';
    let message = $('#message').val();
    let room    = $('#room').val();
    if(!message) return;
    showMessage(message, name, 'own');
    socket.emit("send-message", message, room, name);
    $('#message').val('');
});

const typing = (info) => {
    let name    = $('#name').val() ? $('#name').val() : '';
    let room    = $('#room').val();
    if(info === 'still'){
        socket.emit("typing", room, name, true);
    }
    else if(info ===  'done'){
        socket.emit("typing", room, name, false);
    }
}

let typingInterval;

$("#message").on('keyup', function(){
    typing('still');
    //console.log('key upp bro');
    clearTimeout(typingInterval);
    typingInterval = setTimeout(() => {
        typing('done');
    }, 2000)
});

socket.on('connect', () => {
    //showMessage(`You connected with id ${socket.id}`);
});

//get message
socket.on('receive-message', (message, name) => {
    //console.log(message, name);
    showMessage(message, name, 'client');
    console.log('users connected: ',connectedUsers);
    //showMessage(message, name, 'client');
    //document.getElementById('#chat-content').scrollTo(0);
});

//send type status
socket.on('type-status', (status) => {
    showTypingStatus(status, 'client');
    //console.log('tesss');
});

//get connected users
socket.on('connected-users', (users) => {
    if(users.length > 0){
        $(".msg-content").addClass('read-receipt');
        let name    = $('#name').val() ? $('#name').val() : '';
        let room    = $('#room').val();
        socket.emit('read-receipt', room, name);
        connectedUsers = users.length;
    }
    //console.log(users);
});

socket.on('disconnected-users', (users) => {
    connectedUsers = users.length;
    //console.log(users);
})