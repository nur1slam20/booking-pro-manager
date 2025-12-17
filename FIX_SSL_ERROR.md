# ✅ Решение ошибки "SSL/TLS required"

## Проблема

При выполнении команды добавления услуг возникала ошибка:
```
❌ Ошибка при добавлении услуг: SSL/TLS required
```

## Решение

Render требует SSL соединение для внешних подключений к базе данных. Нужно добавить параметр `?sslmode=require` к DATABASE_URL.

## ✅ Правильная команда:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require" npm run add-services
```

## 📝 Пример с вашим URL:

```bash
DATABASE_URL="postgresql://booking_user:suAISv5mCYyqsibVP6oMMSTRlnMG6x6F@dpg-d50oj6ffte5s73cs393g-a.frankfurt-postgres.render.com/booking_db_tpwg?sslmode=require" npm run add-services
```

## ✅ Результат:

Все 10 услуг успешно добавлены! Теперь они доступны на frontend.

---

**Важно:** Всегда используйте `?sslmode=require` при подключении к Render PostgreSQL извне!

