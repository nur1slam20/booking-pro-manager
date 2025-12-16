import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../src/config/database.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function createAdmin() {
  try {
    console.log('🔐 Создание администратора...');

    // Проверяем, существует ли уже админ
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [ADMIN_EMAIL]);
    if (existing.rows.length > 0) {
      console.log('⚠️  Администратор с таким email уже существует');
      process.exit(0);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Создаем админа
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role`,
      [ADMIN_NAME, ADMIN_EMAIL, hashedPassword],
    );

    const admin = result.rows[0];

    console.log('✅ Администратор успешно создан!');
    console.log('\n📋 Данные для входа:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n⚠️  ВАЖНО: Смените пароль после первого входа!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();

