const express = require('express');
const WebSocket = require('ws');
const app = express();
const PORT = 3000;

// Databáze (simulace in-memory)
let users = [
  { name: "Jan", coffees: 3, lastCoffee: new Date().toLocaleString() },
  { name: "Petra", coffees: 1, lastCoffee: new Date().toLocaleString() },
];

let tasks = [
  { task: "Clean the coffee machine", assignedTo: null, completed: false },
  { task: "Refill milk", assignedTo: null, completed: false },
];

// Serve static frontend files
app.use(express.static('public'));

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send initial data to the client
  ws.send(JSON.stringify({ users, tasks }));
  
  // Handle incoming messages (e.g., new coffee entry or task update)
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'addCoffee') {
      const user = users.find(u => u.name === data.name);
      if (user) {
        user.coffees++;
        user.lastCoffee = new Date().toLocaleString();
      } else {
        users.push({ name: data.name, coffees: 1, lastCoffee: new Date().toLocaleString() });
      }
      // Broadcast updated data to all clients
      broadcastData();
    }

    if (data.type === 'assignTask') {
      const task = tasks.find(t => t.task === data.task);
      if (task && !task.assignedTo) {
        task.assignedTo = data.name;
      }
      // Broadcast updated data to all clients
      broadcastData();
    }

    if (data.type === 'completeTask') {
      const task = tasks.find(t => t.task === data.task);
      if (task) {
        task.completed = true;
      }
      // Broadcast updated data to all clients
      broadcastData();
    }
  });
});

// Broadcast updated data to all connected clients
function broadcastData() {
  const data = JSON.stringify({ users, tasks });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
