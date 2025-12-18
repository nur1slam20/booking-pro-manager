import { Router } from 'express';
import {
  getReviewsController,
  getReviewController,
  createReviewController,
  updateReviewController,
  deleteReviewController,
  getAverageRatingController,
} from './review.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Управление отзывами и рейтингами
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Получить список отзывов
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: masterId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список отзывов
 *   post:
 *     summary: Создать отзыв (user)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, rating]
 *             properties:
 *               bookingId: { type: integer }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Отзыв создан
 */
router.get('/', getReviewsController);
router.post('/', authMiddleware, createReviewController);

/**
 * @swagger
 * /api/reviews/average:
 *   get:
 *     summary: Получить средний рейтинг
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: masterId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Средний рейтинг
 */
router.get('/average', getAverageRatingController);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Получить отзыв по ID
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Отзыв
 *   put:
 *     summary: Обновить отзыв
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Отзыв обновлен
 *   delete:
 *     summary: Удалить отзыв
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Отзыв удален
 */
router.get('/:id', getReviewController);
router.put('/:id', authMiddleware, updateReviewController);
router.delete('/:id', authMiddleware, deleteReviewController);

/**
 * @swagger
 * /api/reviews/{id}/helpful:
 *   post:
 *     summary: Оценить полезность отзыва (user)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isHelpful]
 *             properties:
 *               isHelpful: { type: boolean }
 *     responses:
 *       200:
 *         description: Оценка добавлена
 */
router.post('/:id/helpful', authMiddleware, markReviewHelpfulController);
router.get('/:id/helpful', authMiddleware, getReviewHelpfulStatusController);

/**
 * @swagger
 * /api/reviews/rating-distribution:
 *   get:
 *     summary: Получить распределение рейтингов
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: masterId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Распределение рейтингов
 */
router.get('/rating-distribution', getRatingDistributionController);

export default router;

