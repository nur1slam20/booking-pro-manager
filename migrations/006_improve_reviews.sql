-- Миграция 006: Улучшения системы отзывов

-- 1. Добавляем поле для ответа на отзыв (от мастера или админа)
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS reply TEXT,
ADD COLUMN IF NOT EXISTS reply_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reply_at TIMESTAMP;

-- 2. Таблица для полезности отзывов (лайки/дизлайки)
CREATE TABLE IF NOT EXISTS review_helpful (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL, -- true = полезно, false = не полезно
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- Один пользователь может оценить один отзыв один раз
);

-- 3. Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_reviews_reply_by ON reviews(reply_by);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON review_helpful(user_id);

-- 4. Функция для подсчета полезности отзыва
CREATE OR REPLACE FUNCTION get_review_helpful_stats(review_id_param INTEGER)
RETURNS TABLE(helpful_count BIGINT, not_helpful_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE is_helpful = true)::BIGINT AS helpful_count,
    COUNT(*) FILTER (WHERE is_helpful = false)::BIGINT AS not_helpful_count
  FROM review_helpful
  WHERE review_id = review_id_param;
END;
$$ LANGUAGE plpgsql;

