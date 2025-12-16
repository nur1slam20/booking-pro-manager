import pool from '../../config/database.js';

export async function getServices({ page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT id, title, description, price, duration, created_at
     FROM services
     ORDER BY id ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
}

export async function countServices() {
  const result = await pool.query('SELECT COUNT(*)::int AS count FROM services');
  return result.rows[0].count;
}

export async function getServiceById(id) {
  const result = await pool.query(
    `SELECT id, title, description, price, duration, created_at
     FROM services
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function createService({ title, description, price, duration }) {
  const result = await pool.query(
    `INSERT INTO services (title, description, price, duration)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, price, duration, created_at`,
    [title, description, price, duration],
  );
  return result.rows[0];
}

export async function updateService(id, { title, description, price, duration }) {
  const result = await pool.query(
    `UPDATE services
     SET title = $1,
         description = $2,
         price = $3,
         duration = $4
     WHERE id = $5
     RETURNING id, title, description, price, duration, created_at`,
    [title, description, price, duration, id],
  );
  return result.rows[0] || null;
}

export async function deleteService(id) {
  await pool.query('DELETE FROM services WHERE id = $1', [id]);
}


