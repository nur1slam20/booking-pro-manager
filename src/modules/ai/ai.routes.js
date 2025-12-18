import { Router } from 'express';
import { getRecommendationsController } from './ai.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     summary: Получить AI рекомендации на основе истории бронирований
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Рекомендации по услуге, мастеру и времени
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *                 master:
 *                   $ref: '#/components/schemas/Master'
 *                 time:
 *                   type: string
 *                   example: "10:00"
 *                 reason:
 *                   type: string
 *                 stats:
 *                   type: object
 */
router.get('/recommendations', authMiddleware, getRecommendationsController);

export default router;

