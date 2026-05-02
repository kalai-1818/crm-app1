import { Response } from 'express';
import Task from '../models/Task.ts';
import { sendNotification } from './notificationController.ts';

export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await Task.find({ owner: req.user.id });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;
    const task = await Task.create({
      title,
      description,
      dueDate,
      status,
      priority,
      owner: req.user.id
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Trigger notification
    await sendNotification({
      recipient: req.user.id,
      type: 'TASK_UPDATED' as const,
      title: 'Task Synchronized',
      message: `Task "${(task as any).title}" has been updated in the nexus.`,
      link: '/tasks'
    });

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, owner: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
