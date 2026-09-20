const express = require("express");
const cors = require("cors")
const app = express();

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
