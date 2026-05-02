import { db } from '../config/firebase.ts';

const activitiesCollection = db.collection('activities');

export default {
  async find(query: any) {
    let q: any = activitiesCollection;
    if (query.lead) q = q.where('lead', '==', query.lead);
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async create(data: any) {
    const docRef = activitiesCollection.doc();
    const newActivity = {
      ...data,
      createdAt: new Date().toISOString()
    };
    await docRef.set(newActivity);
    return { id: docRef.id, ...newActivity, _id: docRef.id };
  }
};
