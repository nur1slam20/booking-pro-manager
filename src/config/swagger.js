import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking Manager PRO API',
      version: '1.0.0',
      description: 'REST API для системы онлайн-бронирования услуг',
      contact: {
        name: 'Booking Manager PRO Team',
      },
    },
    servers: [
      {
        url: 'https://booking-pro-api.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Иван Иванов' },
            email: { type: 'string', format: 'email', example: 'ivan@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Мужская стрижка' },
            description: { type: 'string', example: 'Профессиональная стрижка' },
            price: { type: 'integer', example: 1290 },
            duration: { type: 'integer', example: 35 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            service_id: { type: 'integer', example: 1 },
            date: { type: 'string', format: 'date', example: '2024-12-20' },
            time: { type: 'string', example: '14:00' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'rejected', 'cancelled'], example: 'pending' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Некорректные данные' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.js', './src/app.js'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

