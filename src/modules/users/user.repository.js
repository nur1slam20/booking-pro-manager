import pool from '../../config/database.js';

export async function findAllUsers() {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC',
  );
  return result.rows;
}

export async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] || null;
}

export async function deleteUserById(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}


