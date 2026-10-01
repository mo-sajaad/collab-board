const pool = require("../config/db");

async function createBoard(req, res) {
  const { name, description } = req.body;
  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!name?.trim()) {
    return res.status(400).json({ error: "Board name is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const boardResult = await client.query(
      `INSERT INTO boards (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), description || null, ownerId]
    );

    const newBoard = boardResult.rows[0];

    await client.query(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [newBoard.board_id, ownerId]
    );

    await client.query("COMMIT");
    return res.status(201).json(newBoard);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating board:", err);
    return res.status(500).json({ error: "Failed to create board" });
  } finally {
    client.release();
  }
}


async function getUserBoards(req, res) {
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
        b.*,
        bm.role,
        COUNT(t.task_id) AS total_tasks,
        COUNT(CASE WHEN t.status = 'Done' THEN 1 END) AS completed_tasks,
        CASE 
          WHEN COUNT(t.task_id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN t.status = 'Done' THEN 1 END)::numeric / COUNT(t.task_id)) * 100)
        END AS progress
      FROM boards b
      JOIN board_members bm ON bm.board_id = b.board_id
      LEFT JOIN tasks t ON t.board_id = b.board_id
      WHERE bm.user_id = $1
      GROUP BY b.board_id, bm.role
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
      return res.status(401).json({ error: "Unauthorised" });
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
       ORDER BY position ASC`,
      [id]
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

    if (Number(board.rows[0].owner_id) !== Number(userId)) {
      return res.status(403).json({ error: "Only owner can update board" });
    }

    const result = await pool.query(
      `UPDATE boards
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE board_id = $3
       RETURNING *`,
      [name, description, id]
    );

    const updatedBoard = result.rows[0];

    const io = req.app.get("io");

    if (io) {
      io.to(`board_${boardId}`).emit("board_updated", updatedBoard)
    }

    return res.json({
      message: "Board updated successfully",
      data: updatedBoard,
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


    const boardCheck = await pool.query(
      `SELECT owner_id FROM boards WHERE board_id = $1`
    [id]);

    if (boardCheck.rows.lengtjh === 0) {
      return res.status(404).json({ error: "Board not found" })
    }

    const board = boardCheck.rows[0];
    
    if (Number(board.owner_id) !== Number(userId)) {
      return res.status(403).json({ error: "Only the board owner can delete this board" })
    }

    const result = await pool.query(
      `DELETE FROM boards WHERE board_id = $1 RETURNING *`,
      [id]
    );

    return res.json({
      message: "Board deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getBoardMembers(req, res) {
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
      `SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const members = await pool.query(
      `SELECT 
         bm.user_id, 
         bm.role, 
         u.email, 
         u.username 
       FROM board_members bm
       JOIN users u ON bm.user_id = u.user_id
       WHERE bm.board_id = $1`,
      [id]
    );

    return res.json(members.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


async function addBoardMember(req, res) {
  const { id } = req.params;
  const { email, role = "member" } = req.body;
  const ownerId = req.user?.id;

  try {
    // Email Validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Owner?
    const board = await pool.query(
      `SELECT * FROM boards WHERE board_id = $1`,
      [id]
    );

    if (board.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    if (Number(board.rows[0].owner_id) !== Number(ownerId)) {
      return res.status(403).json({ error: "Only the board owner can add members" });
    }

    // 3. Lookup Target User by Email
    const userResult = await pool.query(
      `SELECT user_id, email, username FROM users WHERE LOWER(email) = $1`,
      [trimmedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    const targetUser = userResult.rows[0];

    // 4. Prevent Owner from Adding Themselves
    if (Number(targetUser.user_id) === Number(ownerId)) {
      return res.status(400).json({ error: "You are already the owner of this board" });
    }

    // 5. Insert Target User into board_members
    const result = await pool.query(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (board_id, user_id) DO NOTHING
       RETURNING *`,
      [id, targetUser.user_id, role]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User is already a member of this board" });
    }

    return res.status(201).json({
      message: "Member added successfully",
      data: {
        ...result.rows[0],
        email: targetUser.email,
        username: targetUser.username,
      },
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
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const board = await pool.query(
      `SELECT * FROM boards WHERE board_id = $1`,
      [id]
    );

    if (board.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    if (Number(board.rows[0].owner_id) !== Number(ownerId)) {
      return res.status(403).json({ error: "Only owner can remove members" });
    }

    // Prevent owner from eemoving themselves
    if (Number(user_id) === Number(ownerId)) {
      return res.status(400).json({ error: "Board owner cannot be removed" });
    }

    const deleteResult = await pool.query(
      `DELETE FROM board_members
       WHERE board_id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "User is not a member of this board" });
    }

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
  getBoardMembers
};