const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        // Avatar 3D par défaut selon le sexe si pas de photo
        const avatarStyle = data.gender === 'Homme' ? 'bottts' : 'avataaars';
        users[socket.id] = { 
            id: socket.id, 
            name: data.username, 
            age: data.age,
            gender: data.gender,
            peerId: data.peerId, 
            avatar: data.photo || `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${data.username}`,
            blockedUsers: []
        };
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-private-message', (data) => {
        const dest = users[data.toSocketId];
        if (dest && dest.blockedUsers.includes(socket.id)) return; // Bloqué

        const msg = { 
            fromId: socket.id, 
            sender: users[socket.id].name, 
            text: data.text, 
            type: data.type || 'text', // text, image, ou voice
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        };
        io.to(data.toSocketId).emit('receive-private-message', msg);
        socket.emit('receive-private-message', msg);
    });

    socket.on('accept-chat', (data) => {
        io.to(data.fromId).emit('chat-accepted', { by: socket.id });
    });

    socket.on('block-user', (data) => {
        if(users[socket.id]) users[socket.id].blockedUsers.push(data.targetId);
    });

    socket.on('end-call', (data) => {
        io.to(data.toSocketId).emit('call-ended-by-peer');
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update-users', Object.values(users));
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log('BANËA V110 - Social & Media Enabled'));
