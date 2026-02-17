const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        // Stockage du profil complet
        users[socket.id] = { 
            id: socket.id, 
            name: data.username, 
            age: data.age,
            gender: data.gender,
            peerId: data.peerId, 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}${data.age}` 
        };
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-private-message', (data) => {
        const msg = { 
            sender: users[socket.id].name, 
            text: data.text, 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        };
        io.to(data.toSocketId).emit('receive-private-message', { ...msg, fromId: socket.id });
        socket.emit('receive-private-message', { ...msg, fromId: socket.id });
    });

    socket.on('propose-call', (data) => {
        io.to(data.toSocketId).emit('incoming-call-request', { 
            fromName: data.fromName, 
            fromPeerId: data.fromPeerId 
        });
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update-users', Object.values(users));
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log('Server Profile Ready'));
