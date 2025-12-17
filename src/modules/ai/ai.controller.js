import { getRecommendationsService } from './ai.service.js';

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI рекомендации на основе истории бронирований
 */

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     summary: Получить AI рекомендации (user)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Рекомендации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: object
 *                   description: Рекомендуемая услуга
 *                 master:
 *                   type: object
 *                   description: Рекомендуемый мастер
 *                 time:
 *                   type: string
 *                   description: Рекомендуемое время
 */
export async function getRecommendationsController(req, res, next) {
  try {
    const recommendations = await getRecommendationsService(req.user.id);
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
}

