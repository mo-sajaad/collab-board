const pool = require('./db');

async function main() {
  try {
    // Example: Select all users
    const res = await pool.query('SELECT * FROM users');
    console.log(res.rows);
  } catch (err) {
    console.error('Database query error', err);
  } finally {
    // Close pool when done
    await pool.end();
  }
}

main();