const pool = require("../config/db");

async function createTask(req, res) {
  const { title, description, due_date, priority, board_id } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, due_date, priority, creator_id, board_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, due_date, priority, userId, board_id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create task" });
  }
}

async function getUserTasks(req, res) {
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tasks = await pool.query(
      `SELECT *
       FROM tasks
       WHERE creator_id = $1 OR assignee_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function getTask(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid task ID required" });
    }

    const result = await pool.query(
      `SELECT * FROM tasks WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function updateTask(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;
  const { title, description, due_date, priority, board_id } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid task ID required" });
    }

    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    const existing = await pool.query(
      `SELECT creator_id FROM tasks WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (existing.rows[0].creator_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           due_date = $3,
           priority = $4,
           board_id = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, due_date, priority, board_id, id]
    );

    return res.json({
      message: "Task updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function deleteTask(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid task ID required" });
    }

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND creator_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found or not allowed",
      });
    }

    return res.json({
      message: "Task deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createTask,
  getUserTasks,
  getTask,
  updateTask,
  deleteTask,
};