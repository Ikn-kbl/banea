const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        users[socket.id] = { 
            id: socket.id, 
            name: data.username, 
            age: data.age,
            gender: data.gender,
            peerId: data.peerId, 
            avatar: data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
            likes: 0
        };
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-like', (id) => {
        if(users[id]) { users[id].likes++; io.emit('update-users', Object.values(users)); }
    });

    socket.on('send-private-message', (data) => {
        const msg = { fromId: socket.id, sender: users[socket.id].name, text: data.text, type: data.type };
        io.to(data.toSocketId).emit('receive-private-message', msg);
        socket.emit('receive-private-message', msg);
    });

    socket.on('disconnect', () => { delete users[socket.id]; io.emit('update-users', Object.values(users)); });
});

http.listen(8080, () => console.log('BANËA - IZAN EDITION READY'));

