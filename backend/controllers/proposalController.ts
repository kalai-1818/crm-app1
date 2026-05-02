import { Response } from 'express';
import Proposal from '../models/Proposal.ts';

export const getProposals = async (req: any, res: Response) => {
  try {
    const proposals = await Proposal.find(req.query.leadId ? { leadId: req.query.leadId } : {});
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProposalById = async (req: any, res: Response) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
