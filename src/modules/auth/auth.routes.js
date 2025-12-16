import { Router } from 'express';
import { registerController, loginController, profileController } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/profile', authMiddleware, profileController);

export default router;


