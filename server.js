// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Required for Socket.IO

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves index.html and frontend files

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat-app')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ REST API - Auth Routes
app.use('/api/auth', require('./routes/auth')); // <-- This includes your login/register logic

// ✅ Setup Socket.IO with JWT authentication
require('./socket')(server); // socket.js handles the real-time chat

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
