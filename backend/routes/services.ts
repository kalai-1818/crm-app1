import express from 'express';
import { getServices, createService } from '../controllers/serviceController.ts';
import { protect } from '../middleware/auth.ts';
import { authorize } from '../middleware/rbac.ts';

const router = express.Router();

router.get('/', protect, getServices);
router.post('/', protect, authorize('admin'), createService);

export default router;
