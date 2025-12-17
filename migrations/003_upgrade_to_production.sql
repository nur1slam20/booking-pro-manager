-- Миграция 003: Upgrade to Production-Ready System
-- Добавляем поля для реального SaaS продукта

-- 1. Добавляем phone и updated_at в users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Добавляем is_active и updated_at в services
ALTER TABLE services 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. Добавляем admin_comment, updated_at и status_history в bookings
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS admin_comment TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 4. Создаем таблицу для истории статусов бронирований
CREATE TABLE IF NOT EXISTS booking_status_history (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON services(updated_at);
CREATE INDEX IF NOT EXISTS idx_bookings_updated_at ON bookings(updated_at);

-- 6. Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Функция для логирования изменений статуса
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NULL); -- changed_by можно получить из приложения
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Триггер для логирования изменений статуса
DROP TRIGGER IF EXISTS log_booking_status ON bookings;
CREATE TRIGGER log_booking_status
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_booking_status_change();

