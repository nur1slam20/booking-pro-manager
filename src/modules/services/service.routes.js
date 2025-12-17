import { Router } from 'express';
import {
  getServicesController,
  getServiceController,
  createServiceController,
  updateServiceController,
  deleteServiceController,
} from './service.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Получить список услуг
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Список услуг с пагинацией
 *   post:
 *     summary: Создать услугу (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price, duration]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: integer }
 *               duration: { type: integer }
 *     responses:
 *       201:
 *         description: Услуга создана
 */
router.get('/', getServicesController);
router.post('/', authMiddleware, roleMiddleware('admin'), createServiceController);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Получить услугу по ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные услуги
 *       404:
 *         description: Услуга не найдена
 *   put:
 *     summary: Обновить услугу (admin only)
 *     tags: [Services]
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
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: integer }
 *               duration: { type: integer }
 *     responses:
 *       200:
 *         description: Услуга обновлена
 *   delete:
 *     summary: Удалить услугу (admin only)
 *     tags: [Services]
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
 *         description: Услуга удалена
 */
router.get('/:id', getServiceController);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateServiceController);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteServiceController);

export default router;



