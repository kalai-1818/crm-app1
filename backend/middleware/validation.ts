import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

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
    company: Joi.string().allow(''),
    status: Joi.string().valid('New', 'Contacted', 'Qualified', 'Lost', 'Closed')
  })
};

export const taskSchemas = {
  create: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    priority: Joi.string().valid('Low', 'Medium', 'High'),
    status: Joi.string().valid('To Do', 'In Progress', 'In Review', 'Done')
  })
};
