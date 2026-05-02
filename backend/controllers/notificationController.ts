import { Response } from 'express';
import { db } from '../config/firebase.ts';
import Notification from '../models/Notification.ts';
import { emitNotification } from '../socket.ts';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      {}
    );
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('recipient', '==', req.user.id)
      .where('isRead', '==', false)
      .get();
    
    if (snapshot.empty) {
      return res.json({ message: 'All notifications marked as read' });
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendNotification = async (data: {
  recipient: string;
  sender?: string;
  type: 'LEAD_ASSIGNED' | 'TASK_UPDATED' | 'MESSAGE_RECEIVED' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
}) => {
  try {
    const notification = await Notification.create(data);
    emitNotification(data.recipient, notification);
    return notification;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return null;
  }
};
