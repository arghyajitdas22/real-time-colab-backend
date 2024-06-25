const express = require('express');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const secretKey = 'your_secret_key'; // Use a more secure secret key in production

app.use(bodyParser.json());

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  res.json(user);
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected route example
app.get('/profile', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
});

// Create a new document
app.post('/documents', authenticateToken, async (req, res) => {
  const { title, content, type } = req.body;
  const document = await prisma.document.create({
    data: { title, content, type, userId: req.user.id },
  });
  res.json(document);
});

// Get a single document
app.get('/documents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const document = await prisma.document.findUnique({
    where: { id: parseInt(id) },
  });
  res.json(document);
});

// Update a document
app.put('/documents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content, type } = req.body;
  const document = await prisma.document.update({
    where: { id: parseInt(id) },
    data: { content, type },
  });
  await prisma.version.create({
    data: { content, documentId: parseInt(id) },
  });
  res.json(document);
});

// Get all documents for a user
app.get('/documents', authenticateToken, async (req, res) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.user.id },
  });
  res.json(documents);
});

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

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join_document', (documentId) => {
    socket.join(documentId);
    console.log(`User joined document ${documentId}`);
  });

  socket.on('leave_document', (documentId) => {
    socket.leave(documentId);
    console.log(`User left document ${documentId}`);
  });

  socket.on('document_change', async ({ documentId, content }) => {
    const document = await prisma.document.update({
      where: { id: parseInt(documentId) },
      data: { content },
    });
    await prisma.version.create({
      data: { content, documentId: parseInt(documentId) },
    });
    io.to(documentId).emit('document_change', document);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server is running on http://localhost:8000');
});
