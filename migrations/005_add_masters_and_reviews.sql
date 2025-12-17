-- Миграция 005: Мастера, расписание, отзывы и AI рекомендации

-- 1. Таблица мастеров
CREATE TABLE IF NOT EXISTS masters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  photo TEXT, -- URL фото
  bio TEXT, -- Описание, опыт
  experience INTEGER DEFAULT 0, -- Опыт в годах
  rating DECIMAL(3,2) DEFAULT 0.00, -- Средний рейтинг (0.00 - 5.00)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Связь мастеров и услуг (many-to-many)
CREATE TABLE IF NOT EXISTS service_masters (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, master_id)
);

-- 3. Расписание мастеров (working hours)
CREATE TABLE IF NOT EXISTS master_schedules (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(master_id, day_of_week)
);

-- 4. Отзывы и рейтинги
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  master_id INTEGER REFERENCES masters(id) ON DELETE SET NULL,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE, -- Модерация админом
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id) -- Один отзыв на одно бронирование
);

-- 5. Добавляем master_id в bookings (если еще нет)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS master_id INTEGER REFERENCES masters(id) ON DELETE SET NULL;

-- 6. Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_masters_is_active ON masters(is_active);
CREATE INDEX IF NOT EXISTS idx_masters_rating ON masters(rating);
CREATE INDEX IF NOT EXISTS idx_service_masters_service_id ON service_masters(service_id);
CREATE INDEX IF NOT EXISTS idx_service_masters_master_id ON service_masters(master_id);
CREATE INDEX IF NOT EXISTS idx_master_schedules_master_id ON master_schedules(master_id);
CREATE INDEX IF NOT EXISTS idx_master_schedules_day ON master_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_reviews_master_id ON reviews(master_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_moderated ON reviews(is_moderated);
CREATE INDEX IF NOT EXISTS idx_bookings_master_id ON bookings(master_id);

-- 7. Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_masters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_masters_updated_at ON masters;
CREATE TRIGGER update_masters_updated_at
BEFORE UPDATE ON masters
FOR EACH ROW
EXECUTE FUNCTION update_masters_updated_at();

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_updated_at();

-- 8. Функция для автоматического пересчета рейтинга мастера
CREATE OR REPLACE FUNCTION update_master_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE masters
    SET rating = (
        SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
        FROM reviews
        WHERE master_id = COALESCE(NEW.master_id, OLD.master_id)
        AND is_moderated = TRUE
    )
    WHERE id = COALESCE(NEW.master_id, OLD.master_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_master_rating_on_review_insert ON reviews;
DROP TRIGGER IF EXISTS update_master_rating_on_review_update ON reviews;
DROP TRIGGER IF EXISTS update_master_rating_on_review_delete ON reviews;

CREATE TRIGGER update_master_rating_on_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
WHEN (NEW.is_moderated = TRUE)
EXECUTE FUNCTION update_master_rating();

CREATE TRIGGER update_master_rating_on_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.is_moderated = TRUE OR OLD.is_moderated = TRUE)
EXECUTE FUNCTION update_master_rating();

CREATE TRIGGER update_master_rating_on_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
WHEN (OLD.is_moderated = TRUE)
EXECUTE FUNCTION update_master_rating();

-- 9. Добавляем тестовых мастеров
INSERT INTO masters (name, photo, bio, experience, is_active) VALUES
  ('Александр Иванов', 'https://via.placeholder.com/200', 'Опытный барбер с 8-летним стажем. Специализация: классические и современные стрижки, работа с бородой.', 8, TRUE),
  ('Мария Петрова', 'https://via.placeholder.com/200', 'Стилист-колорист с 10-летним опытом. Работает с любыми типами волос и техниками окрашивания.', 10, TRUE),
  ('Дмитрий Сидоров', 'https://via.placeholder.com/200', 'Персональный тренер, сертифицированный специалист по силовым тренировкам и функциональному тренингу.', 5, TRUE),
  ('Анна Козлова', 'https://via.placeholder.com/200', 'Инструктор по йоге и пилатесу. Опыт работы 7 лет. Специализация: хатха-йога, виньяса-флоу.', 7, TRUE),
  ('Иван Смирнов', 'https://via.placeholder.com/200', 'Репетитор по математике и физике. Подготовка к ЕНТ, олимпиадам. Опыт 12 лет.', 12, TRUE),
  ('Елена Волкова', 'https://via.placeholder.com/200', 'Мастер маникюра и педикюра. Работает с гель-лаком, наращиванием, дизайном ногтей.', 6, TRUE)
ON CONFLICT DO NOTHING;

-- 10. Привязываем мастеров к услугам
-- Барбершоп (category_id: 1)
INSERT INTO service_masters (service_id, master_id)
SELECT s.id, m.id
FROM services s, masters m
WHERE s.category_id = 1 AND m.name IN ('Александр Иванов', 'Мария Петрова')
ON CONFLICT DO NOTHING;

-- Спорт (category_id: 2)
INSERT INTO service_masters (service_id, master_id)
SELECT s.id, m.id
FROM services s, masters m
WHERE s.category_id = 2 AND m.name IN ('Дмитрий Сидоров', 'Анна Козлова')
ON CONFLICT DO NOTHING;

-- Репетиторство (category_id: 4)
INSERT INTO service_masters (service_id, master_id)
SELECT s.id, m.id
FROM services s, masters m
WHERE s.category_id = 4 AND m.name = 'Иван Смирнов'
ON CONFLICT DO NOTHING;

-- Красота (category_id: 5)
INSERT INTO service_masters (service_id, master_id)
SELECT s.id, m.id
FROM services s, masters m
WHERE s.category_id = 5 AND m.name = 'Елена Волкова'
ON CONFLICT DO NOTHING;

-- 11. Добавляем расписание для мастеров (рабочие дни: понедельник-суббота, 9:00-18:00)
INSERT INTO master_schedules (master_id, day_of_week, start_time, end_time, is_available)
SELECT m.id, day, '09:00'::TIME, '18:00'::TIME, TRUE
FROM masters m, generate_series(1, 6) AS day -- 1=Monday, 6=Saturday
ON CONFLICT DO NOTHING;

