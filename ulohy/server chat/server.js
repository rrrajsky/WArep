const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Nastavení Express serveru
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Poskytování statických souborů (HTML, CSS, JS)
app.use(express.static('public'));

// Když se připojí nový klient
wss.on('connection', (ws) => {
    console.log('Nové připojení');
    
    // Zpráva od klienta
    ws.on('message', (message) => {
        console.log(`Přijatá zpráva: ${message}`);
        
        // Poslat zprávu všem připojeným klientům
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    
    // Uzavření připojení
    ws.on('close', () => {
        console.log('Připojení uzavřeno');
    });
});

// Spuštění serveru na portu 3000
server.listen(3000, () => {
    console.log('Server běží na http://localhost:3000');
});
