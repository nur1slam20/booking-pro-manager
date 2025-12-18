import { Router } from 'express';
import {
  createBookingController,
  getMyBookingsController,
  getMyBookingStatsController,
  getAllBookingsController,
  getBookingDetailsController,
  updateBookingStatusController,
  deleteBookingController,
  getAdminStatsController,
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
router.get('/my', authMiddleware, getMyBookingsController);
router.get('/my/stats', authMiddleware, getMyBookingStatsController);
router.get('/:id', authMiddleware, getBookingDetailsController);

// Админ
router.get('/admin/stats', authMiddleware, roleMiddleware('admin'), getAdminStatsController);
router.get('/', authMiddleware, roleMiddleware('admin'), getAllBookingsController);
router.put('/:id/status', authMiddleware, roleMiddleware('admin'), updateBookingStatusController);

// Удаление/отмена: пользователь может отменить своё, админ — удалить любое
router.delete('/:id', authMiddleware, deleteBookingController);

export default router;



