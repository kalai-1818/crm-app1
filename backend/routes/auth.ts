import express from 'express';
import { register, login, getMe, logout, refreshToken } from '../controllers/authController.ts';
import { protect } from '../middleware/auth.ts';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

export default router;