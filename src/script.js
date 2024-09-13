const socket = io('http://192.168.9.100:8080');
//const socket = io('http://localhost:8080');

let connectedUsers = 0;

const showMessage = (message, name = '', info = '') => {
    let bubble = info ==  'client' ? 
    `<div class="msg flex flex-col gap-[4px] justify-start text-black m-[12px]">
        <div class="w-fit flex flex-col gap-[4px] p-[12px] rounded-t-[10px] rounded-br-[10px] bg-[#176CF7] text-[white]">
            <span class="font-[700] text-[12px]">${name}</span>
            ${message}
            <!-- <ul class="list-disc list-inside">
                <li>${message}</li>
            </ul> -->
            <div class="times text-[white] text-[10px] font-[500] w-full mt-[4px] text-right">
                ${new Date().getHours() + ':' + 
                (new Date().getMinutes().toString().length <= 1 ? 
                '0' + new Date().getMinutes() : new Date().getMinutes())}
            </div>
            <!-- <span class="times text-[white] text-[10px] font-[500]">${new Date().getHours() + ':' + new Date().getMinutes()}</span> -->
        </div>
    </div>`: 
    `<div class="msg flex flex-col gap-[4px] justify-end text-black m-[12px] items-end">
        <div class="w-fit flex flex-col gap-[4px] p-[12px] rounded-t-[10px] rounded-bl-[10px] bg-[#D1E2FD]">
            <span class="font-[700] text-[12px]">${name}</span>
            ${message}
            <!-- <ul class="msg-content list-disc list-inside ${connectedUsers > 1 ? 'read-receipt' : ''}">
                <li>${message}</li>
            </ul> -->
            <div class="times text-[#868686] text-[10px] font-[500] w-full mt-[4px]">
                ${new Date().getHours() + ':' + 
                (new Date().getMinutes().toString().length <= 1 ? 
                '0' + new Date().getMinutes() : new Date().getMinutes())}
            </div>
            <!-- <span class="times text-[#868686] text-[10px] font-[500]">${new Date().getHours() + ':' + new Date().getMinutes()}</span> -->
        </div>
    </div>`;

    if(!name  && !info) {
        bubble = `<div class="msg flex justify-center text-black">
            <div class="w-full text-center border border-black p-[10px] m-[15px]">
                ${message}
            </div>
        </div>`;
    }

    $('#chat-content').append(bubble);
    var elem = document.getElementById('chat-content');
    elem.scrollTop = elem.scrollHeight;
}

const showImage = (url, name = '', info, file = {type: 'IMAGE'}) => {
    let bubble = info ==  'client' ? 
    `<div class="msg flex justify-start text-black">
        <div class="w-fit flex flex-col gap-[4px] rounded-t-[10px] rounded-br-[10px] p-[10px] m-[15px] bg-[#176CF7] text-[white]">
            <span class="font-[700] text-[12px]">${name}</span>
            <!-- <img src="${url}"/> -->
            ${file.type === 'IMAGE' ?
                `<div class="bg-cover bg-center w-[150px] h-[150px]" style="background-image: url(${url});"/></div>`
                :
                `<div class="flex flex-col w-[100px] h-[100px] text-[10px] border-2 border-[white] border-dashed p-[4px] items-start justify-center overflow-hidden"/>
                    <span class='truncate'>${file.name}</span>
                    <span class='truncate'>${(file.size/1000000).toFixed(2)} MB</span>
                </div>`
            }
            <!-- <ul class="list-disc list-inside">
                <li><img src="${url}" onclick=""/></li>
            </ul> -->
            <div class="times text-[white] text-[10px] font-[500] w-full text-right">
                ${new Date().getHours() + ':' + 
                (new Date().getMinutes().toString().length <= 1 ? 
                '0' + new Date().getMinutes() : new Date().getMinutes())}
            </div>
            <!-- <span class="times text-[white] text-[10px] font-[500]">${new Date().getHours() + ':' + new Date().getMinutes()}</span> -->
        </div>
    </div>`: 
    `<div class="msg flex justify-end text-black">
        <div class="w-fit flex flex-col gap-[4px] rounded-t-[10px] rounded-bl-[10px] p-[10px] m-[15px] bg-[#D1E2FD]">
            <span class="font-[700] text-[12px]">${name}</span>
            <!-- <img src="${url}"/> -->
            ${file.type === 'IMAGE' ?
                `<div class="bg-cover bg-center w-[150px] h-[150px]" style="background-image: url(${url});"/></div>`
                :
                `<div class="flex flex-col w-[100px] h-[100px] text-[10px] border-2 border-[#868686] border-dashed p-[4px] items-start justify-center overflow-hidden"/>
                    <span class='truncate'>${file.name}</span>
                    <span class='truncate'>${(file.size/1000000).toFixed(2)} MB</span>
                </div>`
            }
            <!-- <ul class="msg-content list-disc list-inside ${connectedUsers > 1 ? 'read-receipt' : ''}">
                <li><img src="${url}"/></li>
            </ul> -->
            <div class="times text-[#868686] text-[10px] font-[500] w-full">
                ${new Date().getHours() + ':' + 
                (new Date().getMinutes().toString().length <= 1 ? 
                '0' + new Date().getMinutes() : new Date().getMinutes())}
            </div>
        </div>
    </div>`;

    if(!name  && !info) {
        bubble = `<div class="msg flex justify-center text-black">
            <div class="w-full text-center border border-black p-[10px] m-[15px]">
                ${message}
            </div>
        </div>`;
    }

    $('#chat-content').append(bubble);
    var elem = document.getElementById('chat-content');
    elem.scrollTop = elem.scrollHeight;
}

const showTypingStatus = (status, info) => {
    //console.log('brooo ajaa');
    let bubble = info ==  'client' ? 
    `<div class="typing flex justify-start text-black m-[12px]">
        <div class="w-fit p-[4px] rounded-t-[10px] rounded-br-[10px] bg-[#176CF7]">
            <img style="background-image:url('./typing.gif')" width='100' height="50" class="bg-cover">
        </div>
    </div>`: 
    `<div class="typing flex justify-end text-black m-[12px]">
        <div class="w-fit p-[4px] rounded-t-[10px] rounded-br-[10px] bg-[#D1E2FD]">
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

let accordion = $(".accordion");
for(let i = 0; i < accordion.length; i++){
    $(".accordion").eq(i).on('click', function(){
        if($(this).attr('data-status') == "close"){
            $('.accordion').eq(i).find('.arrow').css({
                'transform' : 'rotate(90deg)'
            });
           $(this).attr("data-status", "open");
            let target = $(this).data('target');
            $(`${target}`).removeClass('hidden');
        }
        else if($(this).attr('data-status') == "open"){
            $('.accordion').eq(i).find('.arrow').css({
                'transform' : 'rotate(0)'
            });
            $(this).attr("data-status", "close");
            let target = $(this).data('target');
            $(`${target}`).addClass('hidden');
        }

        for(let j = 0; j < accordion.length; j++){
            if(j != i){
                if($(".accordion").eq(j).attr('data-status') == "open"){
                    $('.accordion').eq(j).find('.arrow').css({
                        'transform' : 'rotate(0)'
                    });
                    $('.accordion').eq(j).attr("data-status", "close");
                    let target = $('.accordion').eq(j).data('target');
                    $(`${target}`).addClass('hidden');
                }
            }
        }
    });
}

let chat_as = $(".chat-as");
for(let i = 0; i < chat_as.length; i++){
    $(".chat-as").eq(i).on('click', function(){
        if(!$(this).hasClass('selected-profile')){
            $(this).addClass('selected-profile');
            for(let j = 0; j < chat_as.length; j++){
                if(j != i){
                    $(".chat-as").eq(j).removeClass('selected-profile');
                }
            }

            let profile = $(this).data('profile');
            console.log('selected profile', profile);
            //run function for selected profile category based on selected profile

        }
    });
}

$("#chat-option-kategori").on('click', function(){
    if(!$("#chat-option-kategori").hasClass('selected-pill')){
        $("#chat-option-user").removeClass('selected-pill');
        $("#chat-option-kategori").addClass('selected-pill');
    }


    //run option kategori
});

$("#chat-option-user").on('click', function(){
    if(!$("#chat-option-user").hasClass('selected-pill')){
        $("#chat-option-kategori").removeClass('selected-pill');
        $("#chat-option-user").addClass('selected-pill');
    }

    //run option user
});

$("#attachment").on('click', function(){
    if($("#chat-attachment").hasClass('hidden')){
        $("#chat-attachment").removeClass('hidden');
        return;
    }

    $("#chat-attachment").addClass('hidden');
});

$('body').on('click', function(e){
    if(document.getElementById('chat-attachment').contains(e.target) || document.getElementById('attachment').contains(e.target)){
        console.log('chat-attachment clicked');
    }else{
        $("#chat-attachment").addClass('hidden');
    }
});

$('#file-pic').on('click', function(){
    $("#fileUpload").click();
});

$('#file-doc').on('click', function(){
    $("#fileUpload").click();
});


let savePreviousUser = [];

/*const showConnectedUser = (user) => {
    console.log(user);
    if(savePreviousUser.length == 0){
        savePreviousUser = user;
        $('#user-list').empty();
    
        let userList = "";
        user.forEach(us => {
            userList += `<div class="mt-[10px] me-[10px] p-[10px] border border-[black]">
                ${us.name}
            </div>`
        });
    
        $('#user-list').append(user);
    }
    else{
        let diff = true;
        for(let i = 0; i < savePreviousUser.length; i++){
            for(let j = 0; j < user.length; j++){
                diff = true;
                if(savePreviousUser[i].name == user[j].name && savePreviousUser[i].room == user[j].room){
                    diff = false;
                    j = user.length;
                    i = savePreviousUser.length;
                }
            }
        }

        if(diff){
            savePreviousUser = user;
            $('#user-list').empty();
    
            let userList = "";
            user.forEach(us => {
                userList += `<div class="mt-[10px] me-[10px] p-[10px] border border-[black]">
                    ${us.name}
                </div>`
            });
        
            $('#user-list').append(user);
        }
    }
}*/

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
    //!message || message === '' || message === '/n' ? console.log('ANJING'): console.log('KUCING');
    if(!message || message === '') return;
    else{
        showMessage(message, name, 'own');
        socket.emit("send-message", message, room, name);
        $('#message').val('');
    }
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

$("#message").on('keyup', function(e){
    typing('still');
    //console.log('key upp bro');
    clearTimeout(typingInterval);
    typingInterval = setTimeout(() => {
        typing('done');
    }, 1500)

    if(e.keyCode == 13){
        $("#send").click();
    }
});

//upload file function
$("#fileUpload").on('change', function(e){
    let files = e.target.files; //get files    
    
    let name    = $('#name').val();
    let room    = $('#room').val();
    let url     = URL.createObjectURL(files[0]);
    console.log(files[0]);
    let fileData = {
        fileName: files[0].name,
        fileSize: files[0].size,
    }
    console.log(fileData);
    //console.log(URL.createObjectURL(files[0]))
    
    //send file via socket with writeFileSync
    //socket.emit('upload', room, name, files[0], JSON.stringify(fileData));

    //send file via socket with writeFile
    if(files[0].size <= 5000000){ //upload file if less than equal 5 mb
        socket.emit('upload', room, name, files[0], JSON.stringify(fileData),(response) => {
            if(response.status === 'success'){
                showImage(url, name, 'own', response.type);
                console.log(response);
            }
        });
    }
    
    $("#chat-attachment").addClass('hidden');
    //console.log(files[0]);
});

socket.on('connect', () => {
    //showMessage(`You connected with id ${socket.id}`);
});

//get message
socket.on('receive-message', (message, name) => {
    //console.log(message, name);
    showMessage(message, name, 'client');
    console.log('users connected: ',connectedUsers);
    Notification.requestPermission().then(perm => {
        if(perm === "granted"){
            if(!name){
                return new Notification("Broadcast Message",{
                    "body": message
                });
            }

            return new Notification(name,{
                "body": message
            });
        }
    });
    $(".typing").remove();
    //showMessage(message, name, 'client');
    //document.getElementById('#chat-content').scrollTo(0);
});

//send type status
socket.on('type-status', (status) => {
    showTypingStatus(status, 'client');
    //console.log('tesss');
});


//get user connected message
socket.on('user-connected', (users, message) => {
    console.log(users);
    let userInRoom = JSON.parse(users);
    userInRoom = userInRoom.filter((ur) => {return ur.id});
    console.log(userInRoom);
    console.log(message);
    showMessage(message);
})

//get connected users
socket.on('connected-users', (users) => {
    if(users.length > 0){
        //if user is more than one, set the read receipt
        $(".msg-content").addClass('read-receipt');
        let name    = $('#name').val() ? $('#name').val() : '';
        let room    = $('#room').val();
        setTimeout(() => {
            //send read-receipt to server with 2 sec delay, to prevent load
            socket.emit('read-receipt', room, name);
        }, 2000);
        connectedUsers = users.length;
        //showConnectedUser(users);
    }
    console.log(users);
});

socket.on('disconnected-users', (users) => {
    connectedUsers = users.length;
    //console.log(users);
});

//get file function
socket.on('get_file', (url, name, type) => {
    console.log(url,name);
    showImage(url, name, 'client', type);
});

socket.on("connect_error", (err) => {

})
