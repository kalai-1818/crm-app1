import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { PIPELINE_STAGES } from '../constants/pipeline.ts';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map(i => i.message).join(', ');
      return res.status(400).json({ message });
    }
    next();
  };
};

export const authSchemas = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(100)
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const leadSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    company: Joi.string().allow('').optional(),
    status: Joi.string().valid('New', 'Contacted', 'Converted', 'Rejected').optional(),
    pipelineStage: Joi.string().valid(...PIPELINE_STAGES).optional(),
    value: Joi.number().min(0).optional(),
    services: Joi.array().optional(),
  }).options({ allowUnknown: true }),

  /** Partial updates — required for kanban moves and PATCH-style edits */
  update: Joi.object({
    name: Joi.string().min(1),
    email: Joi.string().email(),
    company: Joi.string().allow(''),
    status: Joi.string().valid('New', 'Contacted', 'Converted', 'Rejected'),
    pipelineStage: Joi.string().valid(...PIPELINE_STAGES),
    value: Joi.number().min(0),
    priority: Joi.string().valid('High', 'Medium', 'Low'),
    services: Joi.array(),
  })
    .min(1)
    .unknown(false),
};

export const taskSchemas = {
  create: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    status: Joi.string().valid('To Do', 'In Progress', 'In Review', 'Done').optional()
  }).options({ allowUnknown: true })
};