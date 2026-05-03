import express from 'express';
import { getLeads, createLead, updateLead, deleteLead, getLeadActivities, addLeadComment } from '../controllers/leadController.ts';
import { protect } from '../middleware/auth.ts';
import { validate, leadSchemas } from '../middleware/validation.ts';
import { authorize } from '../middleware/rbac.ts';

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.get('/:id/activities', getLeadActivities);
router.post('/:id/comments', addLeadComment);
router.post('/', validate(leadSchemas.create), createLead);
router.put('/:id', validate(leadSchemas.create), updateLead);
router.delete('/:id', authorize('admin'), deleteLead);

export default router;