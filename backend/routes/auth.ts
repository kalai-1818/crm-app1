import express from 'express';
import { register, login, getMe, logout, refreshToken } from '../controllers/authController.ts';
import { protect } from '../middleware/auth.ts';
import { validate, authSchemas } from '../middleware/validation.ts';

const router = express.Router();

router.post('/register', validate(authSchemas.register), register);
router.post('/login', validate(authSchemas.login), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

export default router;
