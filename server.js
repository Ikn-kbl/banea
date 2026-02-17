const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        // On crée un profil persistant
        users[socket.id] = { 
            id: socket.id, 
            uid: data.uid, // ID unique permanent
            name: data.username, 
            avatar: data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
            peerId: data.peerId
        };
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-message', (data) => {
        const payload = {
            fromUid: data.fromUid,
            text: data.text,
            type: data.type, // 'text' ou 'image'
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        io.to(data.toSocketId).emit('receive-message', payload);
        socket.emit('receive-message', payload); 
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update-users', Object.values(users));
    });
});

http.listen(8080, () => console.log('BANËA SOCIAL HUB - ACTIVE'));
