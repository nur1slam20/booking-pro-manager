import pool from '../../config/database.js';

export async function getServices({ page = 1, limit = 10, activeOnly = true, categoryId = null }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [limit, offset];
  let paramIndex = 3;
  
  if (activeOnly) {
    conditions.push('is_active = true');
  }
  
  if (categoryId) {
    conditions.push(`category_id = $${paramIndex++}`);
    params.push(categoryId);
  }
  
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const result = await pool.query(
    `SELECT 
       s.id, 
       s.title, 
       s.description, 
       s.price, 
       s.duration, 
       s.is_active, 
       s.category_id,
       c.name as category_name,
       c.icon as category_icon,
       s.created_at, 
       s.updated_at
     FROM services s
     LEFT JOIN categories c ON s.category_id = c.id
     ${where}
     ORDER BY s.id ASC
     LIMIT $1 OFFSET $2`,
    params,
  );
  return result.rows;
}

export async function countServices(activeOnly = true, categoryId = null) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  
  if (activeOnly) {
    conditions.push('is_active = true');
  }
  
  if (categoryId) {
    conditions.push(`category_id = $${paramIndex++}`);
    params.push(categoryId);
  }
  
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT COUNT(*)::int AS count FROM services ${where}`;
  const result = await pool.query(query, params);
  return result.rows[0].count;
}

export async function getServiceById(id) {
  const result = await pool.query(
    `SELECT 
       s.id, 
       s.title, 
       s.description, 
       s.price, 
       s.duration, 
       s.is_active, 
       s.category_id,
       c.name as category_name,
       c.icon as category_icon,
       s.created_at, 
       s.updated_at
     FROM services s
     LEFT JOIN categories c ON s.category_id = c.id
     WHERE s.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function createService({ title, description, price, duration, isActive = true, categoryId = null }) {
  const result = await pool.query(
    `INSERT INTO services (title, description, price, duration, is_active, category_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, description, price, duration, is_active, category_id, created_at, updated_at`,
    [title, description, price, duration, isActive, categoryId],
  );
  return result.rows[0];
}

export async function updateService(id, { title, description, price, duration, isActive, categoryId }) {
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
  if (categoryId !== undefined) {
    updates.push(`category_id = $${paramIndex++}`);
    params.push(categoryId);
  }

  if (updates.length === 0) {
    return getServiceById(id);
  }

  params.push(id);
  const result = await pool.query(
    `UPDATE services
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, title, description, price, duration, is_active, category_id, created_at, updated_at`,
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



