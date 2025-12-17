import pool from '../../config/database.js';

export async function getReviews({ page = 1, limit = 10, masterId = null, serviceId = null, moderatedOnly = true }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [limit, offset];
  let paramIndex = 3;

  if (moderatedOnly) {
    conditions.push('r.is_moderated = true');
  }

  if (masterId) {
    conditions.push(`r.master_id = $${paramIndex++}`);
    params.push(masterId);
  }

  if (serviceId) {
    conditions.push(`r.service_id = $${paramIndex++}`);
    params.push(serviceId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT 
       r.id,
       r.booking_id,
       r.master_id,
       r.service_id,
       r.user_id,
       r.rating,
       r.comment,
       r.is_moderated,
       r.reply,
       r.reply_by,
       r.reply_at,
       r.created_at,
       r.updated_at,
       u.name as user_name,
       m.name as master_name,
       s.title as service_title,
       reply_user.name as reply_by_name,
       (SELECT COUNT(*)::int FROM review_helpful WHERE review_id = r.id AND is_helpful = true) as helpful_count,
       (SELECT COUNT(*)::int FROM review_helpful WHERE review_id = r.id AND is_helpful = false) as not_helpful_count
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     LEFT JOIN masters m ON r.master_id = m.id
     LEFT JOIN services s ON r.service_id = s.id
     LEFT JOIN users reply_user ON r.reply_by = reply_user.id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    params,
  );
  return result.rows;
}

export async function countReviews(masterId = null, serviceId = null, moderatedOnly = true) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (moderatedOnly) {
    conditions.push('is_moderated = true');
  }

  if (masterId) {
    conditions.push(`master_id = $${paramIndex++}`);
    params.push(masterId);
  }

  if (serviceId) {
    conditions.push(`service_id = $${paramIndex++}`);
    params.push(serviceId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT COUNT(*)::int AS count FROM reviews ${where}`;
  const result = await pool.query(query, params);
  return result.rows[0].count;
}

export async function getReviewById(id) {
  const result = await pool.query(
    `SELECT 
       r.id,
       r.booking_id,
       r.master_id,
       r.service_id,
       r.user_id,
       r.rating,
       r.comment,
       r.is_moderated,
       r.reply,
       r.reply_by,
       r.reply_at,
       r.created_at,
       r.updated_at,
       u.name as user_name,
       m.name as master_name,
       s.title as service_title,
       reply_user.name as reply_by_name,
       (SELECT COUNT(*)::int FROM review_helpful WHERE review_id = r.id AND is_helpful = true) as helpful_count,
       (SELECT COUNT(*)::int FROM review_helpful WHERE review_id = r.id AND is_helpful = false) as not_helpful_count
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     LEFT JOIN masters m ON r.master_id = m.id
     LEFT JOIN services s ON r.service_id = s.id
     LEFT JOIN users reply_user ON r.reply_by = reply_user.id
     WHERE r.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function getReviewByBookingId(bookingId) {
  const result = await pool.query(
    `SELECT * FROM reviews WHERE booking_id = $1`,
    [bookingId],
  );
  return result.rows[0] || null;
}

export async function createReview({ bookingId, masterId, serviceId, userId, rating, comment }) {
  const result = await pool.query(
    `INSERT INTO reviews (booking_id, master_id, service_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [bookingId, masterId, serviceId, userId, rating, comment],
  );
  return result.rows[0];
}

export async function updateReview(id, { rating, comment, isModerated, reply, replyBy }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (rating !== undefined) {
    updates.push(`rating = $${paramIndex++}`);
    params.push(rating);
  }
  if (comment !== undefined) {
    updates.push(`comment = $${paramIndex++}`);
    params.push(comment);
  }
  if (isModerated !== undefined) {
    updates.push(`is_moderated = $${paramIndex++}`);
    params.push(isModerated);
  }
  if (reply !== undefined) {
    updates.push(`reply = $${paramIndex++}`);
    params.push(reply);
    if (replyBy) {
      updates.push(`reply_by = $${paramIndex++}`);
      params.push(replyBy);
      updates.push(`reply_at = NOW()`);
    }
  }

  if (updates.length === 0) {
    return getReviewById(id);
  }

  params.push(id);
  const result = await pool.query(
    `UPDATE reviews
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    params,
  );
  return result.rows[0] || null;
}

export async function markReviewHelpful(reviewId, userId, isHelpful) {
  const result = await pool.query(
    `INSERT INTO review_helpful (review_id, user_id, is_helpful)
     VALUES ($1, $2, $3)
     ON CONFLICT (review_id, user_id) 
     DO UPDATE SET is_helpful = $3, created_at = NOW()
     RETURNING *`,
    [reviewId, userId, isHelpful],
  );
  return result.rows[0];
}

export async function getReviewHelpfulStatus(reviewId, userId) {
  const result = await pool.query(
    `SELECT is_helpful FROM review_helpful
     WHERE review_id = $1 AND user_id = $2`,
    [reviewId, userId],
  );
  return result.rows[0] || null;
}

export async function getReviewRatingDistribution(masterId = null, serviceId = null) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  conditions.push('is_moderated = true');

  if (masterId) {
    conditions.push(`master_id = $${paramIndex++}`);
    params.push(masterId);
  }

  if (serviceId) {
    conditions.push(`service_id = $${paramIndex++}`);
    params.push(serviceId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT 
       rating,
       COUNT(*)::int as count
     FROM reviews
     ${where}
     GROUP BY rating
     ORDER BY rating DESC`,
    params,
  );
  return result.rows;
}

export async function deleteReview(id) {
  await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
}

export async function getAverageRating(masterId = null, serviceId = null) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  conditions.push('is_moderated = true');

  if (masterId) {
    conditions.push(`master_id = $${paramIndex++}`);
    params.push(masterId);
  }

  if (serviceId) {
    conditions.push(`service_id = $${paramIndex++}`);
    params.push(serviceId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT 
       COALESCE(AVG(rating)::DECIMAL(3,2), 0.00) as average_rating,
       COUNT(*)::int as total_reviews
     FROM reviews
     ${where}`,
    params,
  );
  return result.rows[0];
}

