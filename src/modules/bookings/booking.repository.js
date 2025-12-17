import pool from '../../config/database.js';

export async function createBooking({ userId, serviceId, date, time }) {
  const result = await pool.query(
    `INSERT INTO bookings (user_id, service_id, date, time)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, serviceId, date, time],
  );
  return result.rows[0];
}

// Проверка конфликта бронирований (двойное бронирование)
export async function checkBookingConflict(date, time, serviceId, excludeBookingId = null) {
  let query = `
    SELECT COUNT(*)::int AS count
    FROM bookings
    WHERE date = $1 
      AND time = $2 
      AND service_id = $3
      AND status IN ('pending', 'confirmed')
  `;
  const params = [date, time, serviceId];
  
  if (excludeBookingId) {
    query += ' AND id != $4';
    params.push(excludeBookingId);
  }
  
  const result = await pool.query(query, params);
  return result.rows[0].count > 0;
}

// Получить бронирование с деталями
export async function getBookingWithDetails(id) {
  const result = await pool.query(
    `SELECT b.*, 
            u.name AS user_name, 
            u.email AS user_email,
            u.phone AS user_phone,
            s.title AS service_title,
            s.price AS service_price,
            s.duration AS service_duration
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN services s ON s.id = b.service_id
     WHERE b.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

// Обновить статус с комментарием
export async function updateBookingStatusWithComment(id, status, adminComment, changedBy = null) {
  const result = await pool.query(
    `UPDATE bookings
     SET status = $1,
         admin_comment = $2
     WHERE id = $3
     RETURNING *`,
    [status, adminComment, id],
  );
  
  // Логируем изменение статуса
  if (result.rows[0]) {
    await pool.query(
      `INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, comment)
       SELECT id, status, $1, $2, $3
       FROM bookings
       WHERE id = $4`,
      [status, changedBy, adminComment, id],
    );
  }
  
  return result.rows[0] || null;
}

// Статистика бронирований для пользователя
export async function getUserBookingStats(userId) {
  const result = await pool.query(
    `SELECT 
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed'))::int AS active
     FROM bookings
     WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0];
}

// Статистика для админа
export async function getAdminStats() {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await pool.query(
    `SELECT 
      (SELECT COUNT(*)::int FROM bookings WHERE date = $1) AS today_bookings,
      (SELECT COUNT(*)::int FROM bookings WHERE status = 'pending') AS pending_bookings,
      (SELECT COUNT(*)::int FROM bookings WHERE status = 'confirmed') AS confirmed_bookings,
      (SELECT COALESCE(SUM(s.price), 0)::bigint 
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.status = 'completed') AS total_revenue,
      (SELECT COUNT(*)::int FROM bookings WHERE status = 'completed') AS completed_bookings
    `,
    [today],
  );
  return result.rows[0];
}

// Получить бронирования на сегодня
export async function getTodayBookings() {
  const today = new Date().toISOString().split('T')[0];
  const result = await pool.query(
    `SELECT b.*, 
            u.name AS user_name, 
            u.phone AS user_phone,
            s.title AS service_title,
            s.price AS service_price
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN services s ON s.id = b.service_id
     WHERE b.date = $1
     ORDER BY b.time ASC`,
    [today],
  );
  return result.rows;
}

// История статусов бронирования
export async function getBookingStatusHistory(bookingId) {
  const result = await pool.query(
    `SELECT h.*, u.name AS changed_by_name
     FROM booking_status_history h
     LEFT JOIN users u ON u.id = h.changed_by
     WHERE h.booking_id = $1
     ORDER BY h.created_at DESC`,
    [bookingId],
  );
  return result.rows;
}

export async function getUserBookings(userId) {
  const result = await pool.query(
    `SELECT b.*, s.title AS service_title
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     WHERE b.user_id = $1
     ORDER BY b.date DESC, b.time DESC`,
    [userId],
  );
  return result.rows;
}

export async function getAllBookings({ status }) {
  const params = [];
  let where = '';

  if (status) {
    params.push(status);
    where = 'WHERE b.status = $1';
  }

  const result = await pool.query(
    `SELECT b.*, u.name AS user_name, s.title AS service_title
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN services s ON s.id = b.service_id
     ${where}
     ORDER BY b.date DESC, b.time DESC`,
    params,
  );
  return result.rows;
}

export async function getBookingById(id) {
  const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function updateBookingStatus(id, status) {
  const result = await pool.query(
    `UPDATE bookings
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id],
  );
  return result.rows[0] || null;
}

export async function deleteBooking(id) {
  await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
}



