import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Используем DATABASE_URL из переменных окружения или аргумента командной строки
const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Ошибка: Не указан DATABASE_URL');
  console.log('\nИспользование:');
  console.log('  node scripts/run-migrations.js "postgresql://user:pass@host:port/db"');
  console.log('\nИли установите переменную окружения:');
  console.log('  export DATABASE_URL="postgresql://user:pass@host:port/db"');
  console.log('  node scripts/run-migrations.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigrations() {
  try {
    console.log('🔄 Подключение к базе данных...');
    
    // Проверка подключения
    await pool.query('SELECT NOW()');
    console.log('✅ Подключение установлено\n');

    // Читаем файл миграций
    const migrationPath = join(__dirname, '../migrations/001_create_tables.sql');
    console.log(`📄 Чтение файла миграций: ${migrationPath}`);
    const sql = readFileSync(migrationPath, 'utf8');

    // Выполняем миграции
    console.log('🚀 Выполнение миграций...\n');
    await pool.query(sql);

    console.log('✅ Миграции выполнены успешно!');
    
    // Проверяем созданные таблицы
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Созданные таблицы:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка при выполнении миграций:');
    console.error(error.message);
    if (error.code) {
      console.error(`Код ошибки: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();


