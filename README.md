# 💬 Real-Time Chat App

This is a secure, real-time chat application built using Node.js, Express, Socket.IO, and MongoDB. It supports JWT-based authentication for user login and registration, and offers features like global chat, private messaging, group chats, typing indicators, and online status. All chat history is saved in MongoDB for persistence. To run the project, clone the repository, install the dependencies using `npm install`, and create a `.env` file in the root directory with your MongoDB connection string and JWT secret as shown below:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Then start the server with `node server.js` and open [http://localhost:5000](http://localhost:5000) in your browser.

---

### 🛠️ Tools Used
- Node.js  
- Express.js  
- Socket.IO  
- MongoDB & Mongoose  
- Tailwind CSS  
- JSON Web Tokens (JWT)
