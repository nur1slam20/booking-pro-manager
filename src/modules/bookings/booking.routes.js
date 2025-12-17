import { Router } from 'express';
import {
  createBookingController,
  getMyBookingsController,
  getAllBookingsController,
  updateBookingStatusController,
  deleteBookingController,
} from './booking.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Создать бронирование (user)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, date, time]
 *             properties:
 *               serviceId: { type: integer }
 *               date: { type: string, format: date }
 *               time: { type: string }
 *     responses:
 *       201:
 *         description: Бронирование создано
 *   get:
 *     summary: Получить все бронирования (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Список всех бронирований
 */
router.post('/', authMiddleware, createBookingController);
router.get('/', authMiddleware, roleMiddleware('admin'), getAllBookingsController);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Получить мои бронирования (user)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список бронирований текущего пользователя
 */
router.get('/my', authMiddleware, getMyBookingsController);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Обновить статус бронирования (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Статус обновлен
 *   delete:
 *     summary: Удалить бронирование
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Бронирование удалено
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateBookingStatusController);
router.delete('/:id', authMiddleware, deleteBookingController);

export default router;



