const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
    console.log('Nouveau visiteur:', socket.id);

    socket.on('join-room', (data) => {
        const defaultAvatar = `https://api.dicebear.com/7.x/${data.gender === 'Homme' ? 'bottts' : 'avataaars'}/svg?seed=${data.username}`;
        
        users[socket.id] = { 
            id: socket.id, 
            name: data.username, 
            age: data.age,
            gender: data.gender,
            peerId: data.peerId, 
            avatar: data.photo || defaultAvatar
        };
        
        console.log(data.username + " a rejoint la session.");
        // On renvoie la liste à TOUT LE MONDE
        io.emit('update-users', Object.values(users));
    });

    socket.on('send-private-message', (data) => {
        const msg = { 
            fromId: socket.id, 
            sender: users[socket.id] ? users[socket.id].name : "Anonyme", 
            text: data.text, 
            type: data.type, 
            time: new Date().toLocaleTimeString() 
        };
        io.to(data.toSocketId).emit('receive-private-message', msg);
        socket.emit('receive-private-message', msg);
    });

    socket.on('disconnect', () => {
        if(users[socket.id]) console.log(users[socket.id].name + " est parti.");
        delete users[socket.id];
        io.emit('update-users', Object.values(users));
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log('SERVEUR BANËA ACTIF SUR PORT ' + PORT));
