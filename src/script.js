const socket = io('http://localhost:8080');

const showMessage = (message, info) => {
    let bubble = info ==  'client' ? 
    `<div class="msg flex justify-end text-black p-[10px] bg-slate-500 ">
            ${message}
    </div>`: 
    `<div class="msg flex justify-start text-black p-[10px] bg-slate-500 ">
            ${message}
    </div>`;

    $('#chat-content').append(bubble);
}

const showTypingStatus = (status, info) => {
    console.log('brooo ajaa');
    let bubble = info ==  'client' ? 
    `<div class="typing flex justify-end text-black p-[10px] bg-slate-500 ">
        <img src="./typing.gif" width='100'>
    </div>`: 
    `<div class="typing flex justify-start text-black p-[10px] bg-slate-500 ">
        <img src="./typing.gif" width='100'>
    </div>`;

    if(status && $('.typing').length <= 0){
        $('#chat-content').append(bubble);
    }
    else if(!status){
        $('.typing').remove();
    }
}

$("#join").on('click', function(){
    let room    = $('#room').val();
    socket.emit('join-room', room);
});

document.getElementById('send').addEventListener('click', function(){
    let message = document.getElementById('message').value;
    let room    = $('#room').val();
    if(!message) return;
    showMessage(message, 'own');
    socket.emit("send-message", message, room);
    document.getElementById('message').value = '';
    //console.log(socket);
});

const typing = (info) => {
    let room    = $('#room').val();
    if(info === 'still'){
        socket.emit("typing", room, true);
    }
    else if(info ===  'done'){
        socket.emit("typing", room, false);
    }
}

let typingInterval;

$("#message").on('keyup', function(){
    typing('still');
    console.log('key upp bro');
    clearTimeout(typingInterval);
    typingInterval = setTimeout(() => {
        typing('done');
    }, 2000)
});

socket.on('connect', () => {
    showMessage(`You connected with id ${socket.id}`);
});

socket.on('receive-message', message => {
    showMessage(message, 'client');
    document.getElementById('#chat-content').scrollTo(0);
});

socket.on('type-status', (status) => {
    showTypingStatus(status, 'client');
    console.log('tesss');
});