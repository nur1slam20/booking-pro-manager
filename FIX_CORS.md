# 🔧 Исправление ошибки CORS

## ❌ Проблема:

```
Access-Control-Allow-Origin header has a value 'https://booking-pro-manager.vercel.app' 
that is not equal to the supplied origin 'https://booking-pro-manager-n8edt7m1f-nur1slam20s-projects.vercel.app'
```

**Причина:** В Render указан старый URL frontend, а Vercel дал другой URL.

---

## ✅ Решение:

### Шаг 1: Узнать правильный Frontend URL

Ваш реальный frontend URL: `https://booking-pro-manager-n8edt7m1f-nur1slam20s-projects.vercel.app`

### Шаг 2: Обновить FRONTEND_URL в Render

1. Откройте [dashboard.render.com](https://dashboard.render.com)
2. Найдите ваш Web Service: `booking-pro-api`
3. Перейдите в **"Environment"** (Environment Variables)
4. Найдите переменную `FRONTEND_URL`
5. Измените значение на: `https://booking-pro-manager-n8edt7m1f-nur1slam20s-projects.vercel.app`
6. Нажмите **"Save Changes"**
7. Render автоматически перезапустит сервис (подождите 1-2 минуты)

### Альтернатива: Разрешить все Vercel домены

Если хотите, чтобы работало для всех Vercel preview URLs, можно использовать:

**Вариант 1:** Указать основной домен (без префикса)
```
https://booking-pro-manager.vercel.app
```

**Вариант 2:** В коде разрешить все `*.vercel.app` домены (нужно будет обновить backend код)

---

## 🔍 Проверка backend:

Backend должен быть запущен. Проверьте:

```bash
curl https://booking-pro-api.onrender.com/health
```

Должен вернуться: `{"message":"API работает"...}`

---

## ✅ После исправления:

1. Обновите `FRONTEND_URL` в Render
2. Подождите 1-2 минуты (перезапуск)
3. Обновите страницу frontend (Ctrl+R)
4. Ошибка CORS должна исчезнуть!

---

**ВАЖНО:** Используйте **реальный URL**, который показан в ошибке: 
`https://booking-pro-manager-n8edt7m1f-nur1slam20s-projects.vercel.app`


