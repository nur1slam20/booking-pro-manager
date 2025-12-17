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

// Пользователь
router.post('/', authMiddleware, createBookingController);
router.get('/my', authMiddleware, getMyBookingsController);

// Админ
router.get('/', authMiddleware, roleMiddleware('admin'), getAllBookingsController);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateBookingStatusController);

// Удаление: пользователь может удалить своё, админ — любое
router.delete('/:id', authMiddleware, deleteBookingController);

export default router;



