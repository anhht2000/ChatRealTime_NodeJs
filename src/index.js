require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const route = require('./router');

const server = require('http').Server(app);
const io = require("socket.io")(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resource','views'));

//nhung file tinh
app.use(express.static(path.join(__dirname, 'public')));
//socket
let arrayUser = [];
let arrUserid = [];

io.on('connection',function(socket){
    arrUserid.push(socket.id);
    socket.on("client_send_userName",function(data){
        if(arrayUser.includes(data)){
            // truyen xuong duy nhat thang gui len
            socket.emit("server_send_fail",data) 
        }
        else{
            arrayUser.push(data);
            socket.UserName = data
            //truyen thanh cong den moi nguowi
            io.sockets.emit("server_send_success",{data:data,id:socket.id})
            //truyen thanh cong den mot nguowi
            socket.emit("server_send_success-one",data) 
        }
    })
    socket.on("client_send_message",function(data){
        console.log(data);
        if(socket.Phong){
            io.sockets.in(socket.Phong).emit("server_send_message",{UserName:socket.UserName,mess:data,})
            return
        }
        io.sockets.emit("server_send_message",{UserName:socket.UserName,mess:data,})
    })
    socket.on("client_choc_user",function(data){
        io.to(data).emit("server_send_whoChoc",socket.UserName)
    })
    //logout
    socket.on("logout",function(){
        console.log(socket.id);
        socket.emit("server_send_logout_one",socket.id);
        socket.broadcast.emit("server_send_logout",socket.id);
    })
    //user entering
    socket.on("user_is_entering",function(){
        socket.broadcast.in(socket.Phong).emit("server_send_entering",socket.UserName);
    })
    socket.on("user_stop_enter",function(){
        socket.broadcast.in(socket.Phong).emit("server_send_stop");
    })
    //tao room
    socket.on("client_send_room",function(data){
        socket.join(data);
        socket.Phong = data;

        let arrRoom = [];
        for (let item of socket.adapter.rooms){
            if(arrUserid.includes(item[0])){
                continue;
            }
            else{
                arrRoom.push(item[0]);
            }
        }
        // vi sau khi join thi no se co san trong socket
        io.sockets.emit("server_send_listRoom",arrRoom);
        socket.emit("server_send_listRoom_one",data);
    })
    //tham gia phong khac
    socket.on("client_send_idRoom",function(data){
        socket.leave(socket.Phong);
        socket.join(data);
        socket.emit("server_send_listRoom_one",data);
    })
})

route(app);

server.listen(process.env.PORT || 3000);