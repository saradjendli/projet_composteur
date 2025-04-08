const http = require('http');
const WebSocket = require('ws');

const PORT = 3000;
const TARGET_URL = 'wss://composteur.cielnewton.fr/api';
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjEwMzYyMjAwLCJleHBpcmVkIjp0cnVlfQ.RtGzTkBr5ogzyqrKmBrXdy5VoSlqF4D0V2m4dCzG8Mo";

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
    console.log("Connexion acceptée par le proxy.");

    const targetSocket = new WebSocket(TARGET_URL, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    targetSocket.on('open', () => {
        console.log("Connecté au serveur distant WebSocket.");
    });

    ws.on('message', (message) => {
        console.log('Message reçu du client :', message);
        targetSocket.send(message);
    });

    targetSocket.on('message', (message) => {
        console.log('Message reçu du serveur distant :', message);
        ws.send(message);
    });

    targetSocket.on('error', (error) => {
        console.error('Erreur du serveur distant :', error);
        ws.close();
    });

    ws.on('error', (error) => {
        console.error('Erreur WebSocket local :', error);
    });

    ws.on('close', () => {
        targetSocket.close();
        console.log("Connexion fermée par le client.");
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(PORT, () => {
    console.log(`Serveur Proxy WebSocket en écoute sur le port ${PORT}`);
});

