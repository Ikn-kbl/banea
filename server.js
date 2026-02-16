const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

let allUsers = [];

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        const newUser = { 
            id: socket.id, 
            name: data.username, 
            peerId: data.peerId 
        };
        allUsers.push(newUser);
        io.emit('update-users', allUsers);
    });

    // MESSAGE PRIVÉ : On envoie uniquement au destinataire (to) et à l'expéditeur
    socket.on('send-private-message', (data) => {
        const msgPayload = { sender: data.sender, text: data.text, fromId: socket.id };
        io.to(data.toSocketId).emit('receive-private-message', msgPayload);
        socket.emit('receive-private-message', msgPayload); 
    });

    socket.on('disconnect', () => {
        allUsers = allUsers.filter(u => u.id !== socket.id);
        io.emit('update-users', allUsers);
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log(`Serveur privé prêt sur ${PORT}`));
