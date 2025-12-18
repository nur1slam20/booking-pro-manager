# Booking Manager PRO

Production-ready backend система для управления онлайн-бронированием услуг (барбершоп, спорт, репетиторство и т.д.)

##  Технологический стек

- **Node.js** - среда выполнения
- **Express** - веб-фреймворк
- **PostgreSQL** - реляционная база данных
- **JWT** - аутентификация
- **Bcrypt** - хеширование паролей
- **Joi** - валидация данных
- **Helmet** - безопасность HTTP заголовков
- **CORS** - поддержка кросс-доменных запросов
- **Winston** - профессиональное логирование
- **Express Rate Limit** - защита от DDoS и злоупотребления API
- **Swagger UI** - интерактивная документация API

##  Архитектура

Проект использует архитектуру **MVC + Services + Repository**:

```
src/
  config/          # Конфигурация БД
  middleware/      # Middleware (auth, role, validate)
  modules/         # Модули приложения
    auth/          # Аутентификация
    users/         # Управление пользователями
    services/      # Управление услугами
    bookings/      # Управление бронированиями
  utils/           # Утилиты (JWT, error handling)
  app.js           # Настройка Express приложения
  server.js        # Точка входа
```

##  Быстрый старт (Локальная разработка)

### Требования

- Node.js 18+
- PostgreSQL 12+
- npm или yarn

### Установка

1. **Клонируйте репозиторий** (или используйте текущую папку)

2. **Установите зависимости**
```bash
npm install
```

3. **Создайте файл `.env`** в корне проекта:
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/booking_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=booking_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (для CORS)
FRONTEND_URL=http://localhost:5173
```

4. **Создайте базу данных PostgreSQL**
```bash
createdb booking_db
```

5. **Выполните миграции**
```bash
psql -d booking_db -f migrations/001_create_tables.sql
```

6. **Создайте тестового админа** (опционально)
```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin123456 npm run create-admin
```

Или добавьте скрипт в `package.json`:
```json
"create-admin": "node scripts/create-admin.js"
```

7. **Запустите сервер**
```bash
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:3000`

### Проверка работы

```bash
# Health check
curl http://localhost:3000/health

# Информация об API
curl http://localhost:3000/
```

##  API Документация

### Основные эндпоинты

- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/profile` - Получить профиль текущего пользователя
- `GET /api/users` - Список всех пользователей (admin only)
- `GET /api/users/:id` - Получить пользователя по ID (admin only)
- `DELETE /api/users/:id` - Удалить пользователя (admin only)
- `GET /api/services` - Список услуг (с пагинацией)
- `GET /api/services/:id` - Получить услугу по ID
- `POST /api/services` - Создать услугу (admin only)
- `PUT /api/services/:id` - Обновить услугу (admin only)
- `DELETE /api/services/:id` - Удалить услугу (admin only)
- `POST /api/bookings` - Создать бронирование (user)
- `GET /api/bookings/my` - Мои бронирования (user)
- `GET /api/bookings` - Все бронирования (admin only)
- `PUT /api/bookings/:id` - Обновить статус бронирования (admin only)
- `DELETE /api/bookings/:id` - Удалить бронирование

### Примеры запросов

**Регистрация:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

**Вход:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

**Получить услуги:**
```bash
curl http://localhost:3000/api/services?page=1&limit=10
```

**Создать бронирование (требуется токен):**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "serviceId": 1,
    "date": "2024-12-20",
    "time": "14:00"
  }'
```

##  Роли и доступы

- **user** - обычный пользователь (может создавать бронирования, просматривать свои бронирования)
- **admin** - администратор (полный доступ ко всем ресурсам)

##  Деплой

Подробная инструкция по деплою находится в файле [DEPLOYMENT.md](./DEPLOYMENT.md)

### Быстрая ссылка на деплой

1. **Backend на Render/Railway**: Следуйте инструкциям в [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Frontend на Vercel/Netlify**: См. [DEPLOYMENT.md](./DEPLOYMENT.md)

### Production URLs

После деплоя обновите этот раздел:

- **Backend API**: `https://your-backend-url.onrender.com`
- **Frontend UI**: `https://your-frontend-url.vercel.app`
- **Swagger UI**: `https://your-backend-url.onrender.com/api-docs` (если настроен)

### Тестовые данные

**Admin аккаунт:**
- Email: `admin@example.com`
- Password: `admin123456` (смените после первого входа!)

##  Структура проекта

```
.
├── src/
│   ├── config/          # Конфигурация (database, swagger)
│   ├── middleware/      # Middleware (auth, role, validation)
│   ├── modules/         # Модули приложения
│   │   ├── auth/        # Аутентификация
│   │   ├── users/       # Управление пользователями
│   │   ├── services/    # Управление услугами
│   │   └── bookings/    # Управление бронированиями
│   ├── utils/           # Утилиты
│   ├── app.js           # Express app
│   └── server.js        # Точка входа
├── migrations/          # SQL миграции
├── scripts/             # Вспомогательные скрипты
├── logs/                # Логи (если используется файловое логирование)
└── frontend/            # Frontend приложение (React + Vite)

```

##  Тестирование

### Проверка API

```bash
# Health check
curl http://localhost:3000/health

# Информация об API
curl http://localhost:3000/

# Регистрация пользователя
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

##  Скрипты

- `npm run dev` - Запуск в режиме разработки (с nodemon)
- `npm start` - Запуск в production режиме
- `npm run lint` - Проверка кода через ESLint
- `npm run create-admin` - Создание администратора (требует добавления скрипта в package.json)

##  Переменные окружения

Обязательные переменные:

- `DATABASE_URL` - URL подключения к PostgreSQL
- `JWT_SECRET` - Секретный ключ для JWT токенов
- `PORT` - Порт сервера (по умолчанию 3000)

Опциональные:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Параметры БД (если не используется DATABASE_URL)
- `JWT_EXPIRES_IN` - Время жизни JWT токена (по умолчанию 7d)
- `FRONTEND_URL` - URL frontend приложения (для CORS)
- `NODE_ENV` - Окружение (development/production)

##  Решение проблем

### Ошибка подключения к базе данных

1. Убедитесь, что PostgreSQL запущен
2. Проверьте правильность параметров подключения в `.env`
3. Убедитесь, что база данных создана

### Ошибка "Требуется авторизация"

1. Убедитесь, что вы отправляете токен в заголовке `Authorization: Bearer <token>`
2. Проверьте, что токен не истек
3. Проверьте правильность `JWT_SECRET` в `.env`

##  Лицензия

MIT

##  Автор

Booking Manager PRO Team

---

**Удачной разработки! **


