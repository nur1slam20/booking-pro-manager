-- Миграция 004: Добавление категорий услуг

-- Создаем таблицу категорий
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT, -- Иконка для категории (например, "💇", "⚽", "💻")
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем category_id в services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Создаем индекс для быстрого поиска по категориям
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Добавляем триггер для updated_at в categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_categories_updated_at();

-- Добавляем начальные категории
INSERT INTO categories (name, icon, description) VALUES
  ('Барбершоп', '💇', 'Стрижки, бритье, укладки'),
  ('Спорт', '⚽', 'Тренировки, фитнес, спортзал'),
  ('Компьютерный клуб', '💻', 'Игровые компьютеры, интернет'),
  ('Репетиторство', '📚', 'Обучение, подготовка к экзаменам'),
  ('Красота', '💅', 'Маникюр, педикюр, косметология'),
  ('Здоровье', '🏥', 'Массаж, физиотерапия, консультации')
ON CONFLICT (name) DO NOTHING;

