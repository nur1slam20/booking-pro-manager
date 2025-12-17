#!/bin/bash

# Скрипт для быстрого добавления услуг в production базу данных
# Использование: ./QUICK_ADD_SERVICES.sh YOUR_DATABASE_URL

if [ -z "$1" ]; then
  echo "❌ Ошибка: Не указан DATABASE_URL"
  echo ""
  echo "Использование:"
  echo "  ./QUICK_ADD_SERVICES.sh 'postgresql://user:pass@host:5432/dbname'"
  echo ""
  echo "Чтобы получить DATABASE_URL:"
  echo "  1. Откройте Render Dashboard: https://dashboard.render.com"
  echo "  2. Найдите вашу PostgreSQL базу данных"
  echo "  3. Откройте 'Connect' → 'External Connection String'"
  echo "  4. Скопируйте URL и используйте его здесь"
  exit 1
fi

export DATABASE_URL="$1"
echo "🔄 Добавление услуг в базу данных..."
npm run add-services

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Услуги успешно добавлены!"
  echo ""
  echo "Проверка:"
  curl -s https://booking-pro-api.onrender.com/api/services | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'Услуг в базе: {d.get(\"pagination\", {}).get(\"total\", 0)}')"
else
  echo ""
  echo "❌ Ошибка при добавлении услуг"
  exit 1
fi

