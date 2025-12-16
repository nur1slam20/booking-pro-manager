import { Router } from 'express';
import { getUsersController, getUserController, deleteUserController } from './user.controller.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';

const router = Router();

// Все роуты только для admin
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/', getUsersController);
router.get('/:id', getUserController);
router.delete('/:id', deleteUserController);

export default router;


