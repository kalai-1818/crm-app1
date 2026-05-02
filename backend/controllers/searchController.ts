import { Response } from 'express';
import { db } from '../config/firebase.ts';

export const globalSearch = async (req: any, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.json({ leads: [], tasks: [], users: [] });

    const searchTerm = q.toLowerCase();
    const userId = req.user.id;

    // Firestore doesn't support complex OR or RegEx. 
    // For a small foundation, we'll fetch recent records and filter in memory, 
    // or do prefix searches if scalability was the goal.
    // Given it's a foundation, we'll do prefix search on name/title if possible, 
    // but here we'll just emulate the search by fetching owner's records.

    const [leadsSnap, tasksSnap, usersSnap] = await Promise.all([
      db.collection('leads').where('owner', '==', userId).limit(50).get(),
      db.collection('tasks').where('owner', '==', userId).limit(50).get(),
      db.collection('users').limit(50).get()
    ]);

    const leads = leadsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data(), _id: doc.id }))
      .filter((l: any) => 
        l.name?.toLowerCase().includes(searchTerm) || 
        l.email?.toLowerCase().includes(searchTerm) || 
        l.company?.toLowerCase().includes(searchTerm)
      ).slice(0, 5);

    const tasks = tasksSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data(), _id: doc.id }))
      .filter((t: any) => 
        t.title?.toLowerCase().includes(searchTerm) || 
        t.description?.toLowerCase().includes(searchTerm)
      ).slice(0, 5);

    const users = usersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data(), _id: doc.id }))
      .filter((u: any) => 
        u.name?.toLowerCase().includes(searchTerm) || 
        u.email?.toLowerCase().includes(searchTerm)
      ).slice(0, 5);

    res.json({ leads, tasks, users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
