import { Response } from 'express';
import Lead from '../models/Lead.ts';
import Activity from '../models/Activity.ts';
import Proposal from '../models/Proposal.ts';
import Project from '../models/Project.ts';
import { sendNotification } from './notificationController.ts';
import { calculatePriority, getAutoAssignee, logActivity } from '../utils/intelligence.ts';

export const getLeads = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const allLeads = await Lead.find({ owner: req.user.id });

    const total = allLeads.length;
    const start = (page - 1) * limit;
    const paginatedLeads = allLeads.slice(start, start + limit);

    res.json({
      leads: paginatedLeads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createLead = async (req: any, res: Response) => {
  try {
    const { name, email, company, status, value, services } = req.body;
    
    // Auto Assignment logic
    const assigneeId = await getAutoAssignee() || req.user.id;
    
    // Smart Priority logic
    const priority = calculatePriority(value || 0, status || 'New');

    const lead = await Lead.create({
      name,
      email,
      company,
      status: status || 'New',
      pipelineStage: 'New',
      value: value || 0,
      priority,
      assignedAt: new Date(),
      owner: assigneeId,
      activityLogs: [{
        action: 'CREATED',
        timestamp: new Date().toISOString(),
        user: req.user.id
      }],
      comments: []
    });

    // AUTO-GENERATE PROPOSAL
    await Proposal.create({
      leadId: lead.id,
      services: services || [],
      pricing: {
        breakdown: (services || []).map((s: string) => ({ name: s, price: 0 })),
        total: value || 0
      },
      status: 'Draft'
    });

    // Log Activity
    await logActivity({
      lead: lead.id,
      user: req.user.id,
      type: 'CREATED',
      message: `Lead record initiated. Proposal draft generated automatically.`
    });

    if (assigneeId.toString() !== req.user.id.toString()) {
      await sendNotification({
        recipient: assigneeId,
        type: 'LEAD_ASSIGNED' as const,
        title: 'New Lead Assignment',
        message: `A new lead "${lead.name}" has been assigned to you.`,
        link: '/leads'
      });
    }

    res.status(201).json(lead);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const oldLead = await Lead.findOne({ _id: id, owner: req.user.id }) as any;
    
    if (!oldLead) return res.status(404).json({ message: 'Lead not found' });

    const changes: any = {};
    if (req.body.status && req.body.status !== oldLead.status) {
      changes.status = { from: oldLead.status, to: req.body.status };
      
      if (req.body.status === 'Converted') req.body.pipelineStage = 'Converted';
      else if (req.body.status === 'Contacted') req.body.pipelineStage = 'Qualified';
    }

    if (req.body.value || req.body.status) {
      req.body.priority = calculatePriority(
        req.body.value || oldLead.value,
        req.body.status || oldLead.status
      );
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ) as any;

    if (changes.status?.to === 'Converted') {
      await Project.create({
        name: `Project: ${lead.company || lead.name}`,
        leadId: id,
        status: 'Active'
      });

      await sendNotification({
        recipient: req.user.id,
        type: 'SYSTEM',
        title: 'Project Onboarded',
        message: `Lead ${lead.name} converted. Project workspace initialized.`,
        link: '/projects'
      });
    }

    if (changes.status) {
      const type = changes.status.to === 'Converted' ? 'CONVERTED' : 
                   changes.status.to === 'Rejected' ? 'REJECTED' : 'STATUS_UPDATED';
      
      await logActivity({
        lead: id,
        user: req.user.id,
        type,
        message: `Transition: ${changes.status.from} -> ${changes.status.to}`
      });
    }

    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addLeadComment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    const lead = await Lead.findOne({ _id: id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const comment = {
      text,
      userId: req.user.id,
      userName: req.user.name,
      timestamp: new Date().toISOString()
    };

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: id },
      { $push: { comments: comment } } as any,
      { new: true }
    );

    res.json(updatedLead);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeadActivities = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const activities = await Activity.find({ lead: id });
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOneAndDelete({ _id: id, owner: req.user.id });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
