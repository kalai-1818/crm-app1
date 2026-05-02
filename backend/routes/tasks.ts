import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.ts';
import { protect } from '../middleware/auth.ts';
import { validate, taskSchemas } from '../middleware/validation.ts';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validate(taskSchemas.create), createTask);
router.put('/:id', validate(taskSchemas.create), updateTask);
router.delete('/:id', deleteTask);

export default router;
