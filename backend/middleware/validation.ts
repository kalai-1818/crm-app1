import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateLead = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    company: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    value: Joi.number().min(0).required(),
    status: Joi.string()
      .valid('New', 'Contacted', 'Converted', 'Rejected')
      .default('New'),
  });

  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateTask = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000).optional(),
    dueDate: Joi.string().optional(),
    priority: Joi.string().valid('High', 'Medium', 'Low').default('Medium'),
    status: Joi.string().valid('Todo', 'In Progress', 'Done').default('Todo'),
  });

  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};