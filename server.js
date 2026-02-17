const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        users[socket.id] = { id: socket.id, name: data.name, peerId: data.peerId };
        io.emit('users', Object.values(users));
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('users', Object.values(users));
    });
});

http.listen(8080, () => console.log('SERVEUR BANËA OK SUR PORT 8080'));
