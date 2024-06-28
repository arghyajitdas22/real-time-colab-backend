const express = require("express");
const socket = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const { prisma, connectDB } = require("./db/dbconfig.js");
const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/messages.js");
const teamRoutes = require("./routes/team.js");
const userRoutes = require("./routes/user.js");
const projectRoutes = require("./routes/project.js");

connectDB();

require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/users", userRoutes);
app.use("/api/project", projectRoutes);

const server = app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
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
