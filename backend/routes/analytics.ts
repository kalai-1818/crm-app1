import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.ts';
import { protect } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', protect, getAnalytics);

export default router;
