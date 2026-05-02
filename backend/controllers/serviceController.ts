import { Response } from 'express';
import Service from '../models/Service.ts';

export const getServices = async (req: any, res: Response) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req: any, res: Response) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
