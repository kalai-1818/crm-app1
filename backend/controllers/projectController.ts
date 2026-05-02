import { Response } from 'express';
import Project from '../models/Project.ts';

export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await Project.find(req.query.leadId ? { leadId: req.query.leadId } : {});
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: any, res: Response) => {
  try {
    const project = await Project.update(req.params.id, req.body);
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
