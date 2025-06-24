console.log("🧩 Socket.IO logic loaded");

const { Server } = require('socket.io');
const Message = require('./models/message');

module.exports = function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const users = {}; // socketId -> { name, online }

  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    // ✅ Set username
    socket.on('setUsername', (name) => {
      const username = name || `User${Math.floor(Math.random() * 10000)}`;
      users[socket.id] = { name: username, online: true };
      console.log(`👤 ${username} set for ${socket.id}`);
      sendUserList();
    });

    // ✅ Join room and send chat history
    socket.on('joinRoom', async (room) => {
      socket.join(room);
      console.log(`📥 ${socket.id} joined room: ${room}`);
      try {
        const history = await Message.find({ room }).sort({ createdAt: 1 }).limit(50);
        socket.emit('chatHistory', history.map(msg => ({
          sender: msg.sender,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: msg.createdAt
        })));
      } catch (err) {
        console.error(`❌ Failed to load history for room "${room}":`, err);
      }
    });

    // ✅ Handle chat messages
    socket.on('chatMessage', async ({ content, room }) => {
      const username = users[socket.id]?.name || 'Anonymous';
      const message = {
        sender: username,
        senderId: socket.id,
        content,
        room
      };

      try {
        await Message.create(message);
        io.to(room).emit('chatMessage', message);
        console.log(`💬 ${username} in [${room}]: ${content}`);
      } catch (err) {
        console.error('❌ Error saving message:', err);
      }
    });

    // ✅ Typing indicator
    socket.on('typing', (room) => {
      socket.to(room).emit('userTyping');
    });

    // ✅ Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔴 Disconnected: ${socket.id}`);
      if (users[socket.id]) {
        users[socket.id].online = false;
      }
      sendUserList();
    });

    // ✅ Send updated user list
    function sendUserList() {
      const userArray = Object.entries(users).map(([id, { name, online }]) => ({
        id,
        name,
        online
      }));
      io.emit('updateUserList', userArray);
    }
  });
};
