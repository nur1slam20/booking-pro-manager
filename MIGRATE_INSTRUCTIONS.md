# 🚀 Инструкция: Выполнение миграций БЕЗ Shell (бесплатный план Render)

## ✅ Самый простой способ (через Node.js скрипт):

### Шаг 1: Получить External Database URL

1. В Render Dashboard откройте вашу PostgreSQL базу `booking-pro-db`
2. Перейдите в раздел **"Connections"**
3. Найдите **"External Connection String"**
4. **СКОПИРУЙТЕ** этот URL (он будет выглядеть как: `postgresql://user:password@host:port/database`)

### Шаг 2: Выполнить миграции локально

```bash
cd "/Users/nurislam/Desktop/Booking Pro Manager"

# Замените YOUR_EXTERNAL_URL на скопированный URL
npm run migrate "YOUR_EXTERNAL_URL"
```

Или через переменную окружения:

```bash
export DATABASE_URL="YOUR_EXTERNAL_URL"
npm run migrate
```

### Шаг 3: Создать админа

После выполнения миграций и деплоя backend:

**А) Сначала зарегистрируйте пользователя через API:**

```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123456"
  }'
```

**Б) Затем обновите роль на admin через SQL:**

```bash
# Используя тот же External Database URL
psql "YOUR_EXTERNAL_URL" -c "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';"
```

Или используйте онлайн SQL редактор (pgAdmin, DBeaver и т.д.)

---

## ✅ Альтернатива: Если нет psql, используйте Node.js скрипт

Можно создать простой скрипт для обновления роли:

```bash
node -e "
import('pg').then(({default: pkg}) => {
  const {Pool} = pkg;
  const pool = new Pool({connectionString: 'YOUR_EXTERNAL_URL'});
  pool.query(\"UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'\")
    .then(() => {console.log('✅ Роль обновлена'); pool.end();})
    .catch(err => {console.error('❌ Ошибка:', err.message); pool.end();});
});
"
```

---

## 📋 Полный чеклист:

- [ ] Получен External Database URL из Render
- [ ] Выполнены миграции через `npm run migrate "URL"`
- [ ] Backend задеплоен и работает
- [ ] Зарегистрирован пользователь через API
- [ ] Роль пользователя обновлена на `admin` через SQL

---

**Готово! Теперь у вас есть админ для работы с системой! 🎉**

