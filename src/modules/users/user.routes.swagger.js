// Swagger аннотации для Users routes

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями (admin only)
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 */

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
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
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
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь успешно удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 *       404:
 *         description: Пользователь не найден
 */

