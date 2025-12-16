import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorMiddleware } from './utils/error.js';
import logger from './utils/logger.js';

// Роутеры (будут созданы ниже)
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/users/user.routes.js';
import serviceRouter from './modules/services/service.routes.js';
import bookingRouter from './modules/bookings/booking.routes.js';

dotenv.config();

const app = express();

// Безопасность
app.use(helmet());

// CORS (по умолчанию разрешаем localhost фронт)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

// Rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Парсинг тела
app.use(express.json());

// Простое логирование запросов
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Health
app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'API работает',
    timestamp: new Date().toISOString(),
  });
});

// Информация об API
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Booking Manager PRO API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      services: '/api/services',
      bookings: '/api/bookings',
    },
  });
});

// Основные роуты
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/services', serviceRouter);
app.use('/api/bookings', bookingRouter);

// 404 для неизвестных роутов
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Маршрут не найден',
  });
});

// Централизованный обработчик ошибок
app.use(errorMiddleware);

export default app;


