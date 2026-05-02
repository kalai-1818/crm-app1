import { db } from '../config/firebase.ts';

const servicesCollection = db.collection('services');

export default {
  async find(query: any = {}) {
    const snapshot = await servicesCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async findById(id: string) {
    const doc = await servicesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data(), _id: doc.id };
  },
  async create(data: any) {
    const docRef = servicesCollection.doc();
    const newService = {
      ...data,
      createdAt: new Date().toISOString()
    };
    await docRef.set(newService);
    return { id: docRef.id, ...newService, _id: docRef.id };
  }
};
