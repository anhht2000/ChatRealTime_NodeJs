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
app.use(express.static(path.join(__dirname, '\\public')));
//socket
let arrayUser = [];

io.on('connection',function(socket){
    console.log('Co nguoi vua ket noi ,id:'+socket.id);
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
        io.sockets.emit("server_send_message",{UserName:socket.UserName,mess:data,})
    })
    socket.on("client_choc_user",function(data){
        io.to(data).emit("server_send_whoChoc",socket.UserName)
    })
})

route(app);

server.listen(process.env.PORT ||3000);