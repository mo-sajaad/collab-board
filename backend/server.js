const express = require("express");
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express();

const server = http.createServer(app)

const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173",
    method: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_board", (boardId) => {
    socket.join(`board_${board_id}`);
    console.log(`Socket ${socket.id} joined board_${boardId}`);
  });


  socket.on("leave_board", (boardId) => {
    socket.leave(`board_${board_id}`);
    console.log(`Socket ${socket.id} left board_${boardId}`);
  });


  socket.on("disconnect", () => {
    console.log(`User disconnected socket ${socket.id}`);
  })
})



const authRoute = require("./routes/authRoutes");
const taskRoute = require("./routes/taskRoutes");
const boardRoute = require("./routes/boardRoutes");

app.use(cors())
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/boards", boardRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
