import { db } from '../config/firebase.ts';

const tasksCollection = db.collection('tasks');

export default {
  async find(query: any) {
    let q: any = tasksCollection;
    if (query.owner) q = q.where('owner', '==', query.owner);
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async create(data: any) {
    const docRef = tasksCollection.doc();
    const newTask = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await docRef.set(newTask);
    return { id: docRef.id, ...newTask, _id: docRef.id };
  },
  async findOne(query: any) {
    if (query._id) {
       const doc = await tasksCollection.doc(query._id).get();
       if (!doc.exists) return null;
       const data = doc.data();
       if (query.owner && data?.owner !== query.owner) return null;
       return { id: doc.id, ...data, _id: doc.id };
    }
    return null;
  },
  async findOneAndUpdate(query: any, data: any, options: any) {
    if (query._id) {
      const docRef = tasksCollection.doc(query._id);
      const updateData = { ...data, updatedAt: new Date().toISOString() };
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data(), _id: updatedDoc.id };
    }
    return null;
  },
  async findOneAndDelete(query: any) {
    if (query._id) {
      const docRef = tasksCollection.doc(query._id);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      await docRef.delete();
      return { id: doc.id, ...doc.data(), _id: doc.id };
    }
    return null;
  }
};
