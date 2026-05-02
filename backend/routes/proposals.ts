import express from 'express';
import { getProposals, getProposalById } from '../controllers/proposalController.ts';
import { protect } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', protect, getProposals);
router.get('/:id', protect, getProposalById);

export default router;
