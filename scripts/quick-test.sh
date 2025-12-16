#!/bin/bash
echo "🧪 Быстрое тестирование API"
echo ""

# Тест 1: Health
echo "1. Health check:"
curl -s http://localhost:3000/health | grep -q "работает" && echo "   ✅ Работает" || echo "   ❌ Не работает"

# Тест 2: Services
echo "2. Получение услуг:"
SERVICES_COUNT=$(curl -s http://localhost:3000/api/services | grep -o '"id"' | wc -l)
echo "   ✅ Найдено услуг: $SERVICES_COUNT"

# Тест 3: Регистрация
echo "3. Регистрация пользователя:"
REGISTER=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test$(date +%s)@test.com\",\"password\":\"test123\"}")
echo $REGISTER | grep -q "успешно" && echo "   ✅ Успешно" || echo "   ❌ Ошибка"

# Тест 4: Логи
echo "4. Проверка логов:"
if [ -f logs/combined.log ]; then
  LOG_COUNT=$(wc -l < logs/combined.log)
  echo "   ✅ Логов записано: $LOG_COUNT строк"
else
  echo "   ⚠️ Файл логов еще не создан"
fi

if [ -f logs/error.log ]; then
  ERROR_COUNT=$(wc -l < logs/error.log)
  if [ $ERROR_COUNT -gt 0 ]; then
    echo "   ⚠️ Найдено ошибок: $ERROR_COUNT"
  else
    echo "   ✅ Ошибок нет"
  fi
fi

echo ""
echo "✅ Тестирование завершено!"
