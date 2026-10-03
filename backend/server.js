const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

// Socket Handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_board", (boardId) => {
    socket.join(`board_${boardId}`);
    console.log(`Socket ${socket.id} joined board_${boardId}`);
  });

  socket.on("leave_board", (boardId) => {
    socket.leave(`board_${boardId}`);
    console.log(`Socket ${socket.id} left board_${boardId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected socket ${socket.id}`);
  });
});

// Routes
const authRoute = require("./routes/authRoutes");
const taskRoute = require("./routes/taskRoutes");
const boardRoute = require("./routes/boardRoutes");
const searchRoute = require("./routes/searchRoutes");

app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/boards", boardRoute);
app.use("/api/search", searchRoute);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});