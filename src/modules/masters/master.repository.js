import pool from '../../config/database.js';

export async function getAllMasters({ page = 1, limit = 10, activeOnly = true, serviceId = null }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [limit, offset];
  let paramIndex = 3;

  if (activeOnly) {
    conditions.push('m.is_active = true');
  }

  if (serviceId) {
    conditions.push(`EXISTS (
      SELECT 1 FROM service_masters sm 
      WHERE sm.master_id = m.id AND sm.service_id = $${paramIndex++}
    )`);
    params.push(serviceId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT 
       m.id, 
       m.name, 
       m.photo, 
       m.bio, 
       m.experience, 
       m.rating, 
       m.is_active,
       m.created_at,
       m.updated_at,
       COUNT(DISTINCT sm.service_id) as services_count
     FROM masters m
     LEFT JOIN service_masters sm ON m.id = sm.master_id
     ${where}
     GROUP BY m.id
     ORDER BY m.rating DESC, m.name ASC
     LIMIT $1 OFFSET $2`,
    params,
  );
  return result.rows;
}

export async function countMasters(activeOnly = true, serviceId = null) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (activeOnly) {
    conditions.push('is_active = true');
  }

  if (serviceId) {
    conditions.push(`EXISTS (
      SELECT 1 FROM service_masters sm 
      WHERE sm.master_id = masters.id AND sm.service_id = $${paramIndex++}
    )`);
    params.push(serviceId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT COUNT(DISTINCT id)::int AS count FROM masters ${where}`;
  const result = await pool.query(query, params);
  return result.rows[0].count;
}

export async function getMasterById(id) {
  const result = await pool.query(
    `SELECT 
       m.id, 
       m.name, 
       m.photo, 
       m.bio, 
       m.experience, 
       m.rating, 
       m.is_active,
       m.created_at,
       m.updated_at,
       COUNT(DISTINCT sm.service_id) as services_count
     FROM masters m
     LEFT JOIN service_masters sm ON m.id = sm.master_id
     WHERE m.id = $1
     GROUP BY m.id`,
    [id],
  );
  return result.rows[0] || null;
}

export async function getMasterServices(masterId) {
  const result = await pool.query(
    `SELECT 
       s.id, 
       s.title, 
       s.description, 
       s.price, 
       s.duration,
       c.name as category_name,
       c.icon as category_icon
     FROM services s
     INNER JOIN service_masters sm ON s.id = sm.service_id
     LEFT JOIN categories c ON s.category_id = c.id
     WHERE sm.master_id = $1 AND s.is_active = true
     ORDER BY s.title`,
    [masterId],
  );
  return result.rows;
}

export async function getMasterSchedule(masterId) {
  const result = await pool.query(
    `SELECT 
       day_of_week, 
       start_time, 
       end_time, 
       is_available
     FROM master_schedules
     WHERE master_id = $1
     ORDER BY day_of_week`,
    [masterId],
  );
  return result.rows;
}

export async function createMaster({ name, photo, bio, experience, isActive = true }) {
  const result = await pool.query(
    `INSERT INTO masters (name, photo, bio, experience, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, photo, bio, experience, rating, is_active, created_at, updated_at`,
    [name, photo, bio, experience, isActive],
  );
  return result.rows[0];
}

export async function updateMaster(id, { name, photo, bio, experience, isActive }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    params.push(name);
  }
  if (photo !== undefined) {
    updates.push(`photo = $${paramIndex++}`);
    params.push(photo);
  }
  if (bio !== undefined) {
    updates.push(`bio = $${paramIndex++}`);
    params.push(bio);
  }
  if (experience !== undefined) {
    updates.push(`experience = $${paramIndex++}`);
    params.push(experience);
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    params.push(isActive);
  }

  if (updates.length === 0) {
    return getMasterById(id);
  }

  params.push(id);
  const result = await pool.query(
    `UPDATE masters
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, name, photo, bio, experience, rating, is_active, created_at, updated_at`,
    params,
  );
  return result.rows[0] || null;
}

export async function deleteMaster(id) {
  await pool.query('DELETE FROM masters WHERE id = $1', [id]);
}

export async function addMasterToService(masterId, serviceId) {
  const result = await pool.query(
    `INSERT INTO service_masters (master_id, service_id)
     VALUES ($1, $2)
     ON CONFLICT (service_id, master_id) DO NOTHING
     RETURNING id`,
    [masterId, serviceId],
  );
  return result.rows[0];
}

export async function removeMasterFromService(masterId, serviceId) {
  await pool.query(
    'DELETE FROM service_masters WHERE master_id = $1 AND service_id = $2',
    [masterId, serviceId],
  );
}

export async function updateMasterSchedule(masterId, schedules) {
  // Удаляем старое расписание
  await pool.query('DELETE FROM master_schedules WHERE master_id = $1', [masterId]);

  // Добавляем новое
  for (const schedule of schedules) {
    await pool.query(
      `INSERT INTO master_schedules (master_id, day_of_week, start_time, end_time, is_available)
       VALUES ($1, $2, $3, $4, $5)`,
      [masterId, schedule.dayOfWeek, schedule.startTime, schedule.endTime, schedule.isAvailable ?? true],
    );
  }

  return getMasterSchedule(masterId);
}

export async function checkMasterAvailability(masterId, date, time) {
  // Проверяем расписание
  const dayOfWeek = new Date(date).getDay();
  const schedule = await pool.query(
    `SELECT start_time, end_time, is_available
     FROM master_schedules
     WHERE master_id = $1 AND day_of_week = $2`,
    [masterId, dayOfWeek],
  );

  if (schedule.rows.length === 0 || !schedule.rows[0].is_available) {
    return { available: false, reason: 'Мастер не работает в этот день' };
  }

  const { start_time, end_time } = schedule.rows[0];
  const bookingTime = time.split(':').map(Number);
  const bookingMinutes = bookingTime[0] * 60 + bookingTime[1];
  
  // PostgreSQL TIME возвращается как строка "HH:MM:SS"
  const startParts = start_time.split(':').map(Number);
  const endParts = end_time.split(':').map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  if (bookingMinutes < startMinutes || bookingMinutes >= endMinutes) {
    return { available: false, reason: 'Время вне рабочих часов мастера' };
  }

  // Проверяем, нет ли уже бронирования на это время
  const existing = await pool.query(
    `SELECT id FROM bookings
     WHERE master_id = $1 AND date = $2 AND time = $3
     AND status IN ('pending', 'confirmed')`,
    [masterId, date, time],
  );

  if (existing.rows.length > 0) {
    return { available: false, reason: 'Это время уже занято' };
  }

  return { available: true };
}

export async function getAvailableTimeSlots(masterId, date, serviceDuration = 60) {
  // Получаем расписание мастера на этот день
  const dayOfWeek = new Date(date).getDay();
  const schedule = await pool.query(
    `SELECT start_time, end_time, is_available
     FROM master_schedules
     WHERE master_id = $1 AND day_of_week = $2`,
    [masterId, dayOfWeek],
  );

  if (schedule.rows.length === 0 || !schedule.rows[0].is_available) {
    return [];
  }

  const { start_time, end_time } = schedule.rows[0];
  const slots = [];

  // Получаем занятые слоты
  const booked = await pool.query(
    `SELECT time FROM bookings
     WHERE master_id = $1 AND date = $2
     AND status IN ('pending', 'confirmed')
     ORDER BY time`,
    [masterId, date],
  );

  const bookedTimes = new Set(booked.rows.map(r => r.time));

  // Генерируем слоты с интервалом serviceDuration минут
  // PostgreSQL TIME возвращается как строка "HH:MM:SS"
  const startParts = start_time.split(':').map(Number);
  const endParts = end_time.split(':').map(Number);
  
  let currentHour = startParts[0];
  let currentMin = startParts[1];
  const endHour = endParts[0];
  const endMin = endParts[1];

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Проверяем, что слот помещается в расписание
    const slotEndMin = currentMin + serviceDuration;
    const slotEndHour = currentHour + Math.floor(slotEndMin / 60);
    const slotEndMinFinal = slotEndMin % 60;
    
    if (slotEndHour < endHour || (slotEndHour === endHour && slotEndMinFinal <= endMin)) {
      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
    }

    // Переходим к следующему слоту
    currentMin += serviceDuration;
    currentHour += Math.floor(currentMin / 60);
    currentMin = currentMin % 60;
  }

  return slots;
}

