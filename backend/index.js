const express = require('express');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();

const { prisma, connectDB } = require('./db/dbconfig.js');
const authRoutes = require('./routes/auth.js');
const messageRoutes = require('./routes/messages.js');
const teamRoutes= require('./routes/team.js')
const userRoutes= require('./routes/user.js')


connectDB();

require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/users", userRoutes);


// Middleware to protect routes
// const authenticateToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.sendStatus(401);
//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// User registration
// app.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await prisma.user.create({
//     data: { name, email, password: hashedPassword },
//   });
//   res.json(user);
// });

// User login
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await prisma.user.findUnique({ where: { email } });
//   if (user && await bcrypt.compare(password, user.password)) {
//     const token = jwt.sign({ id: user.id, email: user.email }, secretKey);
//     res.json({ token });
//   } else {
//     res.status(401).json({ error: 'Invalid credentials' });
//   }
// });

// Protected route example
// app.get('/profile', authenticateToken, async (req, res) => {
//   const user = await prisma.user.findUnique({ where: { id: req.user.id } });
//   res.json(user);
// });

// Create a new document
// app.post('/documents', authenticateToken, async (req, res) => {
//   const { title, content, type } = req.body;
//   const document = await prisma.document.create({
//     data: { title, content, type, userId: req.user.id },
//   });
//   res.json(document);
// });

// Get a single document
// app.get('/documents/:id', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const document = await prisma.document.findUnique({
//     where: { id: parseInt(id) },
//   });
//   res.json(document);
// });

// Update a document
// app.put('/documents/:id', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const { content, type } = req.body;
//   const document = await prisma.document.update({
//     where: { id: parseInt(id) },
//     data: { content, type },
//   });
//   await prisma.version.create({
//     data: { content, documentId: parseInt(id) },
//   });
//   res.json(document);
// });

// Get all documents for a user
// app.get('/documents', authenticateToken, async (req, res) => {
//   const documents = await prisma.document.findMany({
//     where: { userId: req.user.id },
//   });
//   res.json(documents);
// });

// // Get a single document
// app.get('/documents/:id', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const document = await prisma.document.findUnique({
//     where: { id: parseInt(id) },
//   });
//   res.json(document);
// });

// // Update a document
// app.put('/documents/:id', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const { content } = req.body;
//   const document = await prisma.document.update({
//     where: { id: parseInt(id) },
//     data: { content },
//   });
//   await prisma.version.create({
//     data: { content, documentId: parseInt(id) },
//   });
//   res.json(document);
// });

// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('join_document', (documentId) => {
//     socket.join(documentId);
//     console.log(`User joined document ${documentId}`);
//   });

//   socket.on('leave_document', (documentId) => {
//     socket.leave(documentId);
//     console.log(`User left document ${documentId}`);
//   });

//   socket.on('document_change', async ({ documentId, content }) => {
//     const document = await prisma.document.update({
//       where: { id: parseInt(documentId) },
//       data: { content },
//     });
//     await prisma.version.create({
//       data: { content, documentId: parseInt(documentId) },
//     });
//     io.to(documentId).emit('document_change', document);
//   });

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });

const server = app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000');
});


const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;

  // Adding a user to the online users map
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // Sending a message to a specific user
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to); 
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg); 
    }
  });
});

