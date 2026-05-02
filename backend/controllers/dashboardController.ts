import { Response } from 'express';
import { db } from '../config/firebase.ts';

export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const leadsCollection = db.collection('leads');
    const tasksCollection = db.collection('tasks');

    const [totalLeadsSnap, totalTasksSnap, recentLeadsSnap, recentTasksSnap] = await Promise.all([
      leadsCollection.where('owner', '==', userId).count().get(),
      tasksCollection.where('owner', '==', userId).count().get(),
      leadsCollection.where('owner', '==', userId).orderBy('createdAt', 'desc').limit(3).get(),
      tasksCollection.where('owner', '==', userId).orderBy('createdAt', 'desc').limit(3).get()
    ]);

    const totalLeads = totalLeadsSnap.data().count;
    const totalTasks = totalTasksSnap.data().count;
    
    const recentLeads = recentLeadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const recentTasks = recentTasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const activity = [
      ...recentLeads.map((l: any) => ({ id: l.id, type: 'lead', title: `New Lead: ${l.name}`, time: l.createdAt })),
      ...recentTasks.map((t: any) => ({ id: t.id, type: 'task', title: `New Task: ${t.title}`, time: t.createdAt }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    res.json({
      stats: {
        totalLeads,
        totalTasks,
      },
      activity
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
