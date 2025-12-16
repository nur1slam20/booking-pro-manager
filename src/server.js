import app from './app.js';
import dotenv from 'dotenv';
import pool from './config/database.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Тест подключения к БД
pool.query('SELECT NOW()')
  .then(() => {
    logger.info('✅ База данных подключена');
  })
  .catch((err) => {
    logger.error('❌ Ошибка подключения к базе данных:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  logger.info(` Сервер запущен на порту ${PORT}`);
  logger.info(` API доступен по адресу: http://localhost:${PORT}/api`);
  logger.info(` Health check: http://localhost:${PORT}/health`);
  logger.info(` Окружение: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM получен, завершение работы...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT получен, завершение работы...');
  await pool.end();
  process.exit(0);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (err) => {
  logger.error('Необработанное отклонение промиса:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Необработанное исключение:', err);
  process.exit(1);
});

