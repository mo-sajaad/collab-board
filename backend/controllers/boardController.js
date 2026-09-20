const pool = require("../config/db");


async function createBoard(req, res) {
  const { name, description } = req.body;
  const ownerId = req.user?.id;

  try {
    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({ error: "Board name is required" });
    }

    const result = await pool.query(
      `INSERT INTO boards (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, ownerId]
    );


    await pool.query(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [result.rows[0].board_id, ownerId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create board" });
  }
}


async function getUserBoards(req, res) {
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT b.*
       FROM boards b
       JOIN board_members bm ON bm.board_id = b.board_id
       WHERE bm.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function getBoard(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid board ID required" });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM board_members
       WHERE board_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `SELECT * FROM boards WHERE board_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getBoardTasks(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid board ID required" });
    }

    const memberCheck = await pool.query(
      `SELECT 1 FROM board_members 
      WHERE board_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }
    const tasks = await pool.query(
      `SELECT * FROM tasks 
       WHERE board_id = $1 
       AND (creator_id = $2 OR assignee_id = $2)
       ORDER BY created_at DESC`,
      [id, userId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function updateBoard(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user?.id;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid board ID required" });
    }


    const board = await pool.query(
      `SELECT * FROM boards WHERE board_id = $1`,
      [id]
    );

    if (board.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    if (board.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Only owner can update board" });
    }

    const result = await pool.query(
      `UPDATE boards
       SET name = $1,
           description = $2
       WHERE board_id = $3
       RETURNING *`,
      [name, description, id]
    );

    return res.json({
      message: "Board updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function deleteBoard(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid board ID required" });
    }

    const result = await pool.query(
      `DELETE FROM boards
       WHERE board_id = $1 AND owner_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Board not found or not allowed",
      });
    }

    return res.json({
      message: "Board deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function addBoardMember(req, res) {
  const { id } = req.params;
  const { user_id, role = "member" } = req.body;
  const ownerId = req.user?.id;

  try {
    const board = await pool.query(
      `SELECT * FROM boards WHERE board_id = $1`,
      [id]
    );

    if (board.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    if (board.rows[0].owner_id !== ownerId) {
      return res.status(403).json({ error: "Only owner can add members" });
    }

    const result = await pool.query(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (board_id, user_id) DO NOTHING
       RETURNING *`,
      [id, user_id, role]
    );

    return res.json({
      message: "Member added",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function removeBoardMember(req, res) {
  const { id } = req.params;
  const { user_id } = req.body;
  const ownerId = req.user?.id;

  try {
    const board = await pool.query(
      `SELECT * FROM boards WHERE board_id = $1`,
      [id]
    );

    if (board.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    if (board.rows[0].owner_id !== ownerId) {
      return res.status(403).json({ error: "Only owner can remove members" });
    }

    await pool.query(
      `DELETE FROM board_members
       WHERE board_id = $1 AND user_id = $2`,
      [id, user_id]
    );

    return res.json({
      message: "Member removed successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createBoard,
  getUserBoards,
  getBoard,
  getBoardTasks,
  updateBoard,
  deleteBoard,
  addBoardMember,
  removeBoardMember,
};