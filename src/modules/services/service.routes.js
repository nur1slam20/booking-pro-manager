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

router.get('/', getServicesController);
router.get('/:id', getServiceController);

// Дальше только admin
router.post('/', authMiddleware, roleMiddleware('admin'), createServiceController);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateServiceController);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteServiceController);

export default router;



