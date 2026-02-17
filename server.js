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
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}` 
        };
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-private-message', (data) => {
        const msg = { 
            fromId: socket.id, // ID de l'envoyeur (indispensable pour le filtrage)
            sender: users[socket.id].name, 
            text: data.text, 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        };
        
        // On envoie UNIQUEMENT au destinataire ciblé
        io.to(data.toSocketId).emit('receive-private-message', msg);
        // On renvoie à l'expéditeur pour confirmation
        socket.emit('receive-private-message', msg);
    });

    socket.on('end-call', (data) => {
        io.to(data.toSocketId).emit('call-ended-by-peer');
    });

    socket.on('propose-call', (data) => {
        io.to(data.toSocketId).emit('incoming-call-request', { 
            fromName: data.fromName, 
            fromPeerId: data.fromPeerId,
            fromSocketId: socket.id
        });
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update-users', Object.values(users));
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log('BANËA V90 - Private Security Enabled'));
