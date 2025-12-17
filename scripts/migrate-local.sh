#!/bin/bash

# Скрипт для локального выполнения миграций
# Используйте External Database URL из Render

echo "🔄 Выполнение миграций локально..."

# Проверяем наличие URL базы данных
if [ -z "$1" ]; then
    echo "❌ Ошибка: Укажите External Database URL"
    echo ""
    echo "Использование:"
    echo "  ./scripts/migrate-local.sh 'postgresql://user:password@host:port/database'"
    echo ""
    echo "Где взять URL:"
    echo "  1. Откройте вашу PostgreSQL базу на Render"
    echo "  2. Найдите 'Connections' → 'External Connection String'"
    echo "  3. Скопируйте URL"
    exit 1
fi

DATABASE_URL=$1

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    echo "❌ Ошибка: psql не найден"
    echo "Установите PostgreSQL: https://www.postgresql.org/download/"
    exit 1
fi

# Выполняем миграции
echo "📦 Выполнение миграций..."
psql "$DATABASE_URL" -f migrations/001_create_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Миграции выполнены успешно!"
else
    echo "❌ Ошибка при выполнении миграций"
    exit 1
fi


