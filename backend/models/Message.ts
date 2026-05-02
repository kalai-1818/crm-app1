import { db } from '../config/firebase.ts';

const messagesCollection = db.collection('messages');

export default {
  async find(query: any = {}) {
    const snapshot = await messagesCollection.orderBy('createdAt', 'desc').limit(50).get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async create(data: any) {
    const docRef = messagesCollection.doc();
    const newMessage = {
      ...data,
      createdAt: new Date().toISOString()
    };
    await docRef.set(newMessage);
    return { id: docRef.id, ...newMessage, _id: docRef.id };
  }
};
