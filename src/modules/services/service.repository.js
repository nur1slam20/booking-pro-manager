import pool from '../../config/database.js';

export async function getServices({ page = 1, limit = 10, activeOnly = true }) {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [limit, offset];
  
  if (activeOnly) {
    where = 'WHERE is_active = true';
  }
  
  const result = await pool.query(
    `SELECT id, title, description, price, duration, is_active, created_at, updated_at
     FROM services
     ${where}
     ORDER BY id ASC
     LIMIT $1 OFFSET $2`,
    params,
  );
  return result.rows;
}

export async function countServices(activeOnly = true) {
  let query = 'SELECT COUNT(*)::int AS count FROM services';
  if (activeOnly) {
    query += ' WHERE is_active = true';
  }
  const result = await pool.query(query);
  return result.rows[0].count;
}

export async function getServiceById(id) {
  const result = await pool.query(
    `SELECT id, title, description, price, duration, is_active, created_at, updated_at
     FROM services
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function createService({ title, description, price, duration, isActive = true }) {
  const result = await pool.query(
    `INSERT INTO services (title, description, price, duration, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, price, duration, is_active, created_at, updated_at`,
    [title, description, price, duration, isActive],
  );
  return result.rows[0];
}

export async function updateService(id, { title, description, price, duration, isActive }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    params.push(title);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(description);
  }
  if (price !== undefined) {
    updates.push(`price = $${paramIndex++}`);
    params.push(price);
  }
  if (duration !== undefined) {
    updates.push(`duration = $${paramIndex++}`);
    params.push(duration);
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    params.push(isActive);
  }

  if (updates.length === 0) {
    return getServiceById(id);
  }

  params.push(id);
  const result = await pool.query(
    `UPDATE services
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, title, description, price, duration, is_active, created_at, updated_at`,
    params,
  );
  return result.rows[0] || null;
}

export async function toggleServiceActive(id) {
  const result = await pool.query(
    `UPDATE services
     SET is_active = NOT is_active
     WHERE id = $1
     RETURNING id, title, is_active`,
    [id],
  );
  return result.rows[0] || null;
}

export async function deleteService(id) {
  await pool.query('DELETE FROM services WHERE id = $1', [id]);
}



