import { Router } from 'express';
import { getUsersController, getUserController, updateProfileController, deleteUserController } from './user.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

// Профиль пользователя (доступен всем авторизованным)
router.put('/profile', authMiddleware, updateProfileController);

// Все остальные роуты только для admin
router.use(authMiddleware, roleMiddleware('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 */
router.get('/', getUsersController);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (admin only)
 *     tags: [Users]
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
 *         description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
 *   delete:
 *     summary: Удалить пользователя (admin only)
 *     tags: [Users]
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
 *         description: Пользователь удален
 */
router.get('/:id', getUserController);
router.delete('/:id', deleteUserController);

export default router;



