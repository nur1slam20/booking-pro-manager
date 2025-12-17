// Swagger аннотации для Services routes
// Эти аннотации автоматически подхватываются swagger-jsdoc

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Управление услугами
 */

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
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество услуг на странице
 *     responses:
 *       200:
 *         description: Список услуг
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *   post:
 *     summary: Создать новую услугу (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: Мужская стрижка
 *               description:
 *                 type: string
 *                 example: Профессиональная стрижка
 *               price:
 *                 type: integer
 *                 example: 1290
 *               duration:
 *                 type: integer
 *                 example: 35
 *     responses:
 *       201:
 *         description: Услуга успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 */

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
 *         description: ID услуги
 *     responses:
 *       200:
 *         description: Данные услуги
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
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
 *         description: ID услуги
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               duration:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Услуга успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 *       404:
 *         description: Услуга не найдена
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
 *         description: ID услуги
 *     responses:
 *       204:
 *         description: Услуга успешно удалена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (требуется роль admin)
 *       404:
 *         description: Услуга не найдена
 */

