const express = require('express');
const router = express.Router();
const { getMessages, postMessage } = require('../controllers/chatcontroller');
const auth = require('../middleware/authmiddleware');

// ✅ Protected routes (require JWT token)
router.get('/', auth, getMessages);   // Fetch messages (only for logged-in users)
router.post('/', auth, postMessage); // Post message (only for logged-in users)

module.exports = router;
