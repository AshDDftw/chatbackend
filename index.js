const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const messages = {};

// Listen for new connections
io.on('connection', (socket) => {
  // Extract username and room from query parameters
  const username = socket.handshake.query.username;
  const room = socket.handshake.query.room;

  // Join the specified room
  socket.join(room);

  // Initialize message history for the room if it doesn't exist
  if (!messages[room]) {
    messages[room] = [];
  }

  // Send existing messages to the newly connected client
  socket.emit('messageHistory', messages[room]);

  // Listen for new messages
  socket.on('message', (data) => {
    const message = {
      message: data.message,
      senderUsername: username,
      sentAt: Date.now()
    };

    console.log(message);

    // Save the message to the room's message history
    messages[room].push(message);

    // Broadcast the message to all clients in the room
    io.to(room).emit('message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`${username} disconnected from room ${room}`);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
