import { Router } from 'express';
import {
  getMastersController,
  getMasterController,
  getMasterDetailsController,
  createMasterController,
  updateMasterController,
  deleteMasterController,
  addMasterToServiceController,
  removeMasterFromServiceController,
  updateMasterScheduleController,
  checkMasterAvailabilityController,
  getAvailableTimeSlotsController,
} from './master.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Masters
 *   description: Управление мастерами/специалистами
 */

/**
 * @swagger
 * /api/masters:
 *   get:
 *     summary: Получить список мастеров
 *     tags: [Masters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: integer
 *         description: Фильтр по услуге
 *     responses:
 *       200:
 *         description: Список мастеров
 *   post:
 *     summary: Создать мастера (admin only)
 *     tags: [Masters]
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
 *               photo: { type: string }
 *               bio: { type: string }
 *               experience: { type: integer }
 *     responses:
 *       201:
 *         description: Мастер создан
 */
router.get('/', getMastersController);
router.post('/', authMiddleware, roleMiddleware('admin'), createMasterController);

/**
 * @swagger
 * /api/masters/{id}:
 *   get:
 *     summary: Получить мастера по ID
 *     tags: [Masters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные мастера
 *   put:
 *     summary: Обновить мастера (admin only)
 *     tags: [Masters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Мастер обновлен
 *   delete:
 *     summary: Удалить мастера (admin only)
 *     tags: [Masters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Мастер удален
 */
router.get('/:id', getMasterController);
router.get('/:id/details', getMasterDetailsController);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateMasterController);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteMasterController);

/**
 * @swagger
 * /api/masters/{id}/services:
 *   post:
 *     summary: Добавить мастера к услуге (admin only)
 *     tags: [Masters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId]
 *             properties:
 *               serviceId: { type: integer }
 *   delete:
 *     summary: Удалить мастера из услуги (admin only)
 *     tags: [Masters]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/services', authMiddleware, roleMiddleware('admin'), addMasterToServiceController);
router.delete('/:id/services/:serviceId', authMiddleware, roleMiddleware('admin'), removeMasterFromServiceController);

/**
 * @swagger
 * /api/masters/{id}/schedule:
 *   put:
 *     summary: Обновить расписание мастера (admin only)
 *     tags: [Masters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 dayOfWeek: { type: integer }
 *                 startTime: { type: string }
 *                 endTime: { type: string }
 *                 isAvailable: { type: boolean }
 */
router.put('/:id/schedule', authMiddleware, roleMiddleware('admin'), updateMasterScheduleController);

/**
 * @swagger
 * /api/masters/{id}/availability:
 *   get:
 *     summary: Проверить доступность мастера
 *     tags: [Masters]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Статус доступности
 */
router.get('/:id/availability', checkMasterAvailabilityController);

/**
 * @swagger
 * /api/masters/{id}/time-slots:
 *   get:
 *     summary: Получить доступные временные слоты мастера
 *     tags: [Masters]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *         description: Длительность услуги в минутах
 *     responses:
 *       200:
 *         description: Список доступных слотов
 */
router.get('/:id/time-slots', getAvailableTimeSlotsController);

export default router;

