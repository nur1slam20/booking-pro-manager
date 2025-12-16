# 🚀 Следующий шаг: Деплой Backend

## ✅ Что уже готово:

1. ✅ Backend код восстановлен и работает локально
2. ✅ Код загружен на GitHub: https://github.com/nur1slam20/booking-pro-manager
3. ✅ Все файлы для деплоя готовы (README.md, DEPLOYMENT.md)

## 📋 Теперь нужно задеплоить Backend на Render

### Шаг 1: Создать PostgreSQL базу данных на Render

1. Зайдите на [render.com](https://render.com) и войдите (или зарегистрируйтесь)
2. Нажмите **"New +"** → **"PostgreSQL"**
3. Заполните:
   - **Name**: `booking-pro-db`
   - **Database**: `booking_db`
   - **User**: `booking_user`
   - **Region**: `Frankfurt` (или ближайший к вам)
   - **PostgreSQL Version**: `16`
   - **Plan**: `Free`
4. Нажмите **"Create Database"**
5. **ВАЖНО**: Скопируйте **Internal Database URL** (будет нужен дальше)

### Шаг 2: Создать Web Service на Render

1. В Dashboard нажмите **"New +"** → **"Web Service"**
2. Подключите репозиторий: `nur1slam20/booking-pro-manager`
3. Заполните настройки:

   **Basic Settings:**
   - **Name**: `booking-pro-api`
   - **Environment**: `Node`
   - **Region**: тот же, что у базы (Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: оставьте пустым (`.`)

   **Build & Deploy:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Environment Variables** (добавьте все эти переменные):
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Internal Database URL из шага 1>
   JWT_SECRET=<сгенерируйте: openssl rand -hex 32>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. Нажмите **"Create Web Service"**

### Шаг 3: Выполнить миграции

После первого деплоя:

1. В Dashboard вашего Web Service откройте вкладку **"Shell"**
2. Выполните команду:
```bash
psql $DATABASE_URL -f migrations/001_create_tables.sql
```

### Шаг 4: Создать тестового админа

В том же Shell выполните:
```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin123456 npm run create-admin
```

---

## 🔍 Проверка деплоя

После успешного деплоя проверьте:

```bash
curl https://your-app-name.onrender.com/health
```

Должен вернуться:
```json
{"message":"API работает","timestamp":"..."}
```

---

## 📝 Генерация JWT_SECRET

Для генерации безопасного JWT_SECRET выполните в терминале:

```bash
openssl rand -hex 32
```

Скопируйте результат и используйте как значение `JWT_SECRET` в Render.

---

**Готовы продолжить деплой? Следуйте шагам выше! 🚀**

