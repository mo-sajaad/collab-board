const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createTask,
  getUserTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", authMiddleware, createTask);

router.get("/", authMiddleware, getUserTasks);

router.get("/:id", authMiddleware, getTask);

router.put("/:id", authMiddleware, updateTask);

router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
