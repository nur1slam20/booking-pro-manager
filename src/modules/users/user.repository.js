import pool from '../../config/database.js';

export async function findAllUsers() {
  const result = await pool.query(
    'SELECT id, name, email, phone, role, created_at, updated_at FROM users ORDER BY id ASC',
  );
  return result.rows;
}

export async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] || null;
}

export async function updateUser(id, { name, phone }) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, phone = $2
     WHERE id = $3
     RETURNING id, name, email, phone, role, created_at, updated_at`,
    [name, phone, id],
  );
  return result.rows[0] || null;
}

export async function deleteUserById(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}



