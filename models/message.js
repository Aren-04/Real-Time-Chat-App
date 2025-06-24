const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },        // e.g., 'User-12345'
  senderId: { type: String, required: true },       // socket.id
  content: { type: String, required: true },
  room: { type: String, required: true }            // e.g., 'global'
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
