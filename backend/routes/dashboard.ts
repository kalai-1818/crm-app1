import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.ts';
import { protect } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', protect, getDashboardStats);

export default router;
