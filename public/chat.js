let socket;
let mySocketId = null;
let currentRoom = 'global';
let recipientSocketId = null;
let username = null;

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const userSelect = document.getElementById('user-select');
const chatContainer = document.getElementById('chat-container');

// Auth elements
const authForm = document.getElementById('auth-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const usernameInput = document.getElementById('auth-username');

// Logout UI elements
const currentUserDisplay = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');

// 🔐 Handle login
loginBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    username = data.username;
    localStorage.setItem('chat_username', username);
    currentUserDisplay.textContent = `👤 ${username}`;
    initSocket();
    authForm.classList.add('hidden');
    chatContainer.classList.remove('hidden');
  } else {
    alert(data.message || 'Login failed');
  }
});

// 🆕 Handle register
registerBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const regUsername = usernameInput.value.trim();

  if (!regUsername) {
    return alert('Username is required');
  }

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username: regUsername })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Registration successful! You can now log in.');
  } else {
    alert(data.message || 'Registration failed');
  }
});

// 🔓 Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('chat_username');
  window.location.reload();
});

// ✅ Socket logic
function initSocket() {
  username = localStorage.getItem('chat_username');
  const token = localStorage.getItem('token');

  if (!token || !username) {
    alert("You're not logged in!");
    return;
  }

  currentUserDisplay.textContent = `👤 ${username}`;

  socket = io({
    auth: { token }
  });

  socket.on('connect', () => {
    mySocketId = socket.id;
    socket.emit('setUsername', username);
    socket.emit('joinRoom', currentRoom);
  });

  socket.on('chatMessage', renderMessage);

  socket.on('userTyping', () => {
    typingIndicator.classList.remove('hidden');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      typingIndicator.classList.add('hidden');
    }, 2000);
  });

  socket.on('chatHistory', (history) => {
    messages.innerHTML = '';
    history.forEach(renderMessage);
  });

  socket.on('updateUserList', (users) => {
    userSelect.innerHTML = `
      <option value="global">🌍 Global Chat</option>
      <option value="group1">👥 Group 1</option>
      <option value="group2">👥 Group 2</option>
      <option disabled>──────────</option>
    `;
    users.forEach(({ id, name, online }) => {
      if (id !== mySocketId) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${online ? '🟢' : '⚫'} ${name}`;
        userSelect.appendChild(option);
      }
    });
  });
}

// ✅ Send chat message
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (message !== '') {
    socket.emit('chatMessage', {
      content: message,
      room: currentRoom,
      recipientId: recipientSocketId
    });
    input.value = '';
  }
});

// ✅ Typing
let typingTimeout;
input.addEventListener('input', () => {
  socket.emit('typing', currentRoom);
});

// ✅ Render message
function renderMessage(msg) {
  const isMine = msg.senderId === mySocketId;
  const item = document.createElement('div');
  item.innerHTML = `<strong>${isMine ? 'You' : msg.sender}</strong>: ${msg.content}`;
  item.className =
    (isMine ? 'self-end bg-blue-500 text-white' : 'self-start bg-gray-300 text-black') +
    ' px-4 py-2 rounded-xl max-w-xs break-words shadow';
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col';
  wrapper.appendChild(item);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

// ✅ Room or user change
userSelect.addEventListener('change', () => {
  const selected = userSelect.value;
  if (['global', 'group1', 'group2'].includes(selected)) {
    currentRoom = selected;
    recipientSocketId = null;
  } else {
    recipientSocketId = selected;
    currentRoom = [mySocketId, recipientSocketId].sort().join('-');
  }

  messages.innerHTML = '';
  socket.emit('joinRoom', currentRoom);
});
