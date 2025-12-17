import pool from '../../config/database.js';

export async function getAllCategories() {
  const result = await pool.query(
    `SELECT id, name, icon, description, created_at, updated_at
     FROM categories
     ORDER BY name ASC`,
  );
  return result.rows;
}

export async function getCategoryById(id) {
  const result = await pool.query(
    `SELECT id, name, icon, description, created_at, updated_at
     FROM categories
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function createCategory({ name, icon, description }) {
  const result = await pool.query(
    `INSERT INTO categories (name, icon, description)
     VALUES ($1, $2, $3)
     RETURNING id, name, icon, description, created_at, updated_at`,
    [name, icon, description],
  );
  return result.rows[0];
}

export async function updateCategory(id, { name, icon, description }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    params.push(name);
  }
  if (icon !== undefined) {
    updates.push(`icon = $${paramIndex++}`);
    params.push(icon);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(description);
  }

  if (updates.length === 0) {
    return getCategoryById(id);
  }

  params.push(id);
  const result = await pool.query(
    `UPDATE categories
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, name, icon, description, created_at, updated_at`,
    params,
  );
  return result.rows[0] || null;
}

export async function deleteCategory(id) {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

