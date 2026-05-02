import { db } from '../config/firebase.ts';

const notificationsCollection = db.collection('notifications');

export default {
  async find(query: any) {
    let q: any = notificationsCollection;
    if (query.recipient) q = q.where('recipient', '==', query.recipient);
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async create(data: any) {
    const docRef = notificationsCollection.doc();
    const newNotification = {
      ...data,
      isRead: data.isRead || false,
      createdAt: new Date().toISOString()
    };
    await docRef.set(newNotification);
    return { id: docRef.id, ...newNotification, _id: docRef.id };
  },
  async findOneAndUpdate(query: any, data: any, options: any) {
    if (query._id) {
       const docRef = notificationsCollection.doc(query._id);
       await docRef.update(data);
       const updatedDoc = await docRef.get();
       return { id: updatedDoc.id, ...updatedDoc.data(), _id: updatedDoc.id };
    }
    return null;
  }
};
