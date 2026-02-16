const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

// Stockage des utilisateurs en mémoire
let allUsers = [];

io.on('connection', (socket) => {
    console.log('Connecté:', socket.id);

    socket.on('join-room', (data) => {
        // On enregistre l'utilisateur avec son nom et son PeerID (vidéo)
        const newUser = { 
            id: socket.id, 
            name: data.username, 
            peerId: data.peerId 
        };
        allUsers.push(newUser);
        
        // On envoie la liste mise à jour à TOUT LE MONDE
        io.emit('update-users', allUsers);
        console.log(data.username + " a rejoint le live");
    });

    socket.on('send-message', (data) => {
        // On renvoie le message à tout le monde immédiatement
        io.emit('receive-message', data);
    });

    socket.on('disconnect', () => {
        allUsers = allUsers.filter(u => u.id !== socket.id);
        io.emit('update-users', allUsers);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log(`Serveur actif sur port ${PORT}`));
