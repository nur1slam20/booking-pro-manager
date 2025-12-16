#!/bin/bash
echo "🔐 Тестирование Rate Limit для аутентификации"
echo "=============================================="
echo ""
echo "Попытка входа с неправильными данными 6 раз:"
echo ""

for i in {1..6}; do
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@example.com","password":"wrong"}' \
    -w "\n%{http_code}")
  
  STATUS=$(echo "$RESPONSE" | tail -1)
  MESSAGE=$(echo "$RESPONSE" | head -1 | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  
  if [ "$STATUS" = "429" ]; then
    echo "  ✅ Попытка $i: HTTP $STATUS - Rate limit сработал! $MESSAGE"
    break
  else
    echo "  Попытка $i: HTTP $STATUS - $MESSAGE"
  fi
  
  sleep 0.5
done

echo ""
echo "✅ Тест завершен!"
