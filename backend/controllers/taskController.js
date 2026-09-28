const pool = require("../config/db");

async function createTask(req, res) {
  const { title, description, due_date, status, priority, board_id, position } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !status) {
      return res.status(400).json({
        error: "Title and status are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, due_date, priority, status, position, creator_id, board_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, due_date, priority, status, position, userId, board_id]
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
      `SELECT * FROM tasks WHERE task_id = $1`,
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
  const { title, description, due_date, priority, board_id, status, position } =
    req.body;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid task ID required" });
    }

    // 1. Check existence and permissions using task_id
    const existing = await pool.query(
      `SELECT creator_id FROM tasks WHERE task_id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (existing.rows[0].creator_id !== userId) {
      return res.status(403).json({ error: "Forbidden: You do not own this task" });
    }

    // 2. Update with COALESCE so omitted fields keep their current DB values
    const result = await pool.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date    = CASE WHEN $3::text IS NOT NULL THEN $3::timestamptz ELSE due_date END,
           priority    = COALESCE($4, priority),
           board_id    = COALESCE($5, board_id),
           status      = COALESCE($6, status),
           position    = COALESCE($7, position),
           updated_at  = CURRENT_TIMESTAMP
       WHERE task_id = $8
       RETURNING *`,
      [
        title ?? null,
        description ?? null,
        due_date ?? null,
        priority ?? null,
        board_id ?? null,
        status ?? null,
        position ?? null,
        id,
      ]
    );

    return res.json({
      message: "Task updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in updateTask:", err);
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
       WHERE task_id = $1 AND creator_id = $2
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