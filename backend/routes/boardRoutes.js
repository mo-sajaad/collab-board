const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createBoard,
  getUserBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addBoardMember,
  removeBoardMember,
  getBoardTasks
} = require("../controllers/boardController");

router.post("/:id/members", authMiddleware, addBoardMember);
router.delete("/:id/members/:userId", authMiddleware, removeBoardMember);
router.get(":id/tasks", authMiddleware, getBoardTasks)

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, getUserBoards);
router.get("/:id", authMiddleware, getBoard);
router.put("/:id", authMiddleware, updateBoard);
router.delete("/:id", authMiddleware, deleteBoard);

module.exports = router;
