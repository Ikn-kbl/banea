const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

let allUsers = [];

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        const newUser = { id: socket.id, name: data.username, peerId: data.peerId };
        allUsers.push(newUser);
        io.emit('update-users', allUsers);
    });

    socket.on('send-private-message', (data) => {
        io.to(data.toSocketId).emit('receive-private-message', { sender: data.sender, text: data.text });
        socket.emit('receive-private-message', { sender: data.sender, text: data.text });
    });

    // Signal d'appel envoyé au destinataire
    socket.on('propose-call', (data) => {
        io.to(data.toSocketId).emit('incoming-call-request', { fromName: data.fromName, fromPeerId: data.fromPeerId });
    });

    socket.on('disconnect', () => {
        allUsers = allUsers.filter(u => u.id !== socket.id);
        io.emit('update-users', allUsers);
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log(`Serveur prêt`));

