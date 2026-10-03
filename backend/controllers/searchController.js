const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";



async function searchAll(req, res) {
    const { q } = req.query;
    const { userId } = req.user?.id;


    if (!q || !q.trim()) {
        return res.json({ boards: [], tasks: []});
    }


    const searchTerm = `%${q.trim()}%`


    try {
        const boardsQuery = `
        SELECT DISTINCT b.board_id, b.name, b.description, b.owner_id
        FROM boards b
        LEFT JOIN board_members bm ON b.board_id = bm.board_id
        WHERE (b.owner_id = $1 OR bm.user_id = $1)
            AND (b.name ILIKE $2 OR b.description ILIKE $2)
        LIMIT 5
        `;

        const tasksQuery = `
        SELECT DISTINCT
            t.task_id,
            t.title,
            t.description,
            t.status,
            t.board_id,
            b.name AS board_name
        FROM tasks t
        JOIN boards b ON t.board_id = b.board_id
        LEFT JOIN board_members bm ON b.board_id = bm.board_id
        WHERE (b.owner_id = $1 OR bm.user_id = $1)
            AND (t.title ILIKE $2 OR t.description ILIKE $2)
        LIMIT 10
        `;

        const [boardsResult, tasksResult] = await Promise.all([
            pool.query(boardsQuery, [userId, searchTerm]),
            pool.query(tasksQuery, [userId, searchTerm]),
        ]);

        return res.json({
            boards: boardsResult.rows,
            tasks: tasksResult.rows,
        })
    } catch (err) {
        console.error("Global search error:", err);
        return res.status(500).json({error: "Server error during search"})
    }
}

module.exports = { searchAll };