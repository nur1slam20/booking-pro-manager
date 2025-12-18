import { Router } from 'express';
import {
  getCategoriesController,
  getCategoryController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from './category.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Управление категориями услуг
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
 *   post:
 *     summary: Создать категорию (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               icon: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Категория создана
 */
router.get('/', getCategoriesController);
router.post('/', authMiddleware, roleMiddleware('admin'), createCategoryController);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Категория
 *   put:
 *     summary: Обновить категорию (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Категория обновлена
 *   delete:
 *     summary: Удалить категорию (admin only)
 *     tags: [Categories]
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
 *         description: Категория удалена
 */
router.get('/:id', getCategoryController);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateCategoryController);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCategoryController);

export default router;

