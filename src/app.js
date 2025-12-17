import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorMiddleware } from './utils/error.js';
import logger from './utils/logger.js';
import { specs, swaggerUi } from './config/swagger.js';

// Роутеры (будут созданы ниже)
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/users/user.routes.js';
import serviceRouter from './modules/services/service.routes.js';
import bookingRouter from './modules/bookings/booking.routes.js';

dotenv.config();

const app = express();

// Безопасность
app.use(helmet());

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      /^https:\/\/.*\.vercel\.app$/, // Разрешаем все Vercel preview URLs
    ].filter(Boolean);

    // Разрешаем запросы без origin (например, из Postman)
    if (!origin) return callback(null, true);

    // Проверяем, соответствует ли origin одному из разрешённых
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return origin === allowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Rate limit (смягчённый, пропускает публичные GET и health)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // увеличено, чтобы исключить ложные 429 при активном UI
  standardHeaders: true,
  legacyHeaders: false,
  // Пропускаем публичные GET (services, health, root)
  skip: (req) => {
    const openGet =
      req.method === 'GET' &&
      (req.path.startsWith('/api/services') ||
        req.path.startsWith('/health') ||
        req.path === '/');
    return openGet;
  },
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

// Swagger UI документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Booking Manager PRO API Documentation',
}));

// Информация об API
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Booking Manager PRO API',
    version: '1.0.0',
    documentation: '/api-docs',
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


