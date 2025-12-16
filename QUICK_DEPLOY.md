# ⚡ Быстрая шпаргалка для деплоя

## 🔑 Ваш JWT_SECRET:
```
22ddcd443115bb6c5dbe19a73e92470acea3d85b9a4f4ae37335f72a8cef4fcf
```

## 📝 Переменные окружения для Render:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<Internal Database URL из шага создания БД>
JWT_SECRET=22ddcd443115bb6c5dbe19a73e92470acea3d85b9a4f4ae37335f72a8cef4fcf
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 🎯 Быстрый чеклист:

- [ ] Создать PostgreSQL на Render
- [ ] Скопировать Internal Database URL
- [ ] Создать Web Service на Render
- [ ] Добавить все переменные окружения
- [ ] Дождаться успешного деплоя
- [ ] Выполнить миграции через Shell: `psql $DATABASE_URL -f migrations/001_create_tables.sql`
- [ ] Создать админа: `ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin123456 npm run create-admin`
- [ ] Проверить health check

## 📚 Подробная инструкция:
Смотрите файл `DEPLOY_STEP_BY_STEP.md`

