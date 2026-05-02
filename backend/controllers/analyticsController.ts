import { Response } from 'express';
import { db } from '../config/firebase.ts';

export const getAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysISO = last7Days.toISOString();

    const leadsCollection = db.collection('leads');
    const tasksCollection = db.collection('tasks');

    // 1. Basic Stats using newer Firestore count() aggregation
    const totalLeadsSnapshot = await leadsCollection.where('owner', '==', userId).count().get();
    const convertedLeadsSnapshot = await leadsCollection.where('owner', '==', userId).where('status', '==', 'Converted').count().get();
    const tasksCompletedSnapshot = await tasksCollection.where('owner', '==', userId).where('status', '==', 'Done').count().get();
    const totalTasksSnapshot = await tasksCollection.where('owner', '==', userId).count().get();

    const totalLeads = totalLeadsSnapshot.data().count;
    const convertedLeads = convertedLeadsSnapshot.data().count;
    const tasksCompleted = tasksCompletedSnapshot.data().count;
    const totalTasks = totalTasksSnapshot.data().count;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const taskCompletionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

    // 2. Leads Over Time (Last 7 Days)
    // Firestore aggregation is limited, so we fetch and group manually for temporal data
    const recentLeadsSnapshot = await leadsCollection
      .where('owner', '==', userId)
      .where('createdAt', '>=', last7DaysISO)
      .get();
    
    const leadsByDay: Record<string, number> = {};
    recentLeadsSnapshot.forEach(doc => {
      const date = doc.data().createdAt.split('T')[0];
      leadsByDay[date] = (leadsByDay[date] || 0) + 1;
    });

    // 3. Tasks Completed Over Time (Last 7 Days)
    const recentTasksSnapshot = await tasksCollection
      .where('owner', '==', userId)
      .where('status', '==', 'Done')
      .where('updatedAt', '>=', last7DaysISO)
      .get();

    const tasksByDay: Record<string, number> = {};
    recentTasksSnapshot.forEach(doc => {
      const date = doc.data().updatedAt.split('T')[0];
      tasksByDay[date] = (tasksByDay[date] || 0) + 1;
    });

    // Fill in missing days for leads
    const leadsTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      leadsTimeline.push({
        date: dateStr,
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: leadsByDay[dateStr] || 0
      });
    }

    // Fill in missing days for tasks
    const tasksTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      tasksTimeline.push({
        date: dateStr,
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: tasksByDay[dateStr] || 0
      });
    }

    res.json({
      summary: {
        totalLeads,
        convertedLeads,
        conversionRate,
        tasksCompleted,
        taskCompletionRate
      },
      leadsTimeline,
      tasksTimeline
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
