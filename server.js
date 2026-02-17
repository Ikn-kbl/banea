const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const users = new Map();

io.on('connection', (socket) => {
    socket.on('join', (user) => {
        users.set(socket.id, { ...user, id: socket.id });
        io.emit('roster', Array.from(users.values()));
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        io.emit('roster', Array.from(users.values()));
    });
});

http.listen(8080, () => console.log('CORE ENGINE ACTIVE'));
