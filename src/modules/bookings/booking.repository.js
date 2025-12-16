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


