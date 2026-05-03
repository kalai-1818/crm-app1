import express from 'express';
import { getLeads, createLead, updateLead, deleteLead, getLeadActivities, addLeadComment } from '../controllers/leadController.ts';
import { protect } from '../middleware/auth.ts';
import { validate, leadSchemas } from '../middleware/validation.ts';

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.get('/:id/activities', getLeadActivities);
router.post('/:id/comments', addLeadComment);
router.post('/', validate(leadSchemas.create), createLead);
router.put('/:id', validate(leadSchemas.update), updateLead);
router.delete('/:id', deleteLead);

export default router;