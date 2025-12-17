// Swagger аннотации для Bookings routes

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Управление бронированиями
 */

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
 *             required:
 *               - serviceId
 *               - date
 *               - time
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2024-12-20'
 *               time:
 *                 type: string
 *                 example: '14:00'
 *     responses:
 *       201:
 *         description: Бронирование успешно создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
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
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список всех бронирований
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Не авторизован
 */

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
 *         description: ID бронирования
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, rejected, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Статус бронирования обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 *       404:
 *         description: Бронирование не найдено
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
 *         description: ID бронирования
 *     responses:
 *       204:
 *         description: Бронирование успешно удалено
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав (можно удалить только свое бронирование)
 *       404:
 *         description: Бронирование не найдено
 */

