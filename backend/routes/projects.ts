import express from 'express';
import { getProjects, updateProject } from '../controllers/projectController.ts';
import { protect } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', protect, getProjects);
router.put('/:id', protect, updateProject);

export default router;
