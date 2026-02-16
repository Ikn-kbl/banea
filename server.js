const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

let usersInRooms = {};

io.on('connection', (socket) => {
    console.log('Nouveau visiteur connectée id:', socket.id);

    socket.on('join-room', (data) => {
        const { room, username } = data;
        socket.join(room);
        
        if (!usersInRooms[room]) usersInRooms[room] = [];
        
        // On ajoute l'utilisateur
        const newUser = { id: socket.id, name: username };
        usersInRooms[room].push(newUser);

        console.log(`${username} est à ${room}`);

        // On envoie la liste mise à jour à tout le monde dans la ville
        io.to(room).emit('update-users', usersInRooms[room]);
    });

    socket.on('disconnect', () => {
        for (let room in usersInRooms) {
            usersInRooms[room] = usersInRooms[room].filter(u => u.id !== socket.id);
            io.to(room).emit('update-users', usersInRooms[room]);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));