# 🔧 Добавление услуг в Production базу данных

## Проблема

На production базе данных (Render) нет услуг. Frontend показывает "Услуги пока не добавлены".

## ✅ Решение

### Вариант 1: Через Render Dashboard (РЕКОМЕНДУЕТСЯ)

1. **Зайдите в Render Dashboard**: https://dashboard.render.com
2. Найдите вашу **PostgreSQL базу данных**
3. Откройте **"Connect"** → **"External Connection String"**
4. Скопируйте **External Database URL** (выглядит как `postgresql://user:pass@host:5432/dbname`)

5. **На вашем компьютере выполните:**

```bash
cd "/Users/nurislam/Desktop/Booking Pro Manager"

# Используйте ваш External Database URL из Render
DATABASE_URL="YOUR_EXTERNAL_DATABASE_URL_HERE" npm run add-services
```

Замените `YOUR_EXTERNAL_DATABASE_URL_HERE` на реальный URL из Render.

---

### Вариант 2: Через SQL напрямую (если есть psql)

```bash
# Подключитесь к production базе данных
psql "YOUR_EXTERNAL_DATABASE_URL_HERE" -f migrations/002_insert_test_data.sql
```

---

### Вариант 3: Через Render Shell (если доступен)

Если у вас есть доступ к Render Shell:

```bash
# В Render Shell
cd /opt/render/project/src
npm run add-services
```

**НО**: Render Shell доступен только на платных тарифах. Если у вас бесплатный тариф, используйте Вариант 1 или 2.

---

## 📋 После добавления

После выполнения команды проверьте:

```bash
curl https://booking-pro-api.onrender.com/api/services
```

Должно вернуться 10 услуг.

---

## 🚀 Быстрая команда (после получения URL)

```bash
cd "/Users/nurislam/Desktop/Booking Pro Manager"
DATABASE_URL="ВАШ_URL_ИЗ_RENDER" npm run add-services
```

**После этого услуги появятся на frontend!** ✅

