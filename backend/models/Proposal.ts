import { db } from '../config/firebase.ts';

const proposalsCollection = db.collection('proposals');

export default {
  async find(query: any = {}) {
    let q: any = proposalsCollection;
    if (query.leadId) q = q.where('leadId', '==', query.leadId);
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async findById(id: string) {
    const doc = await proposalsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data(), _id: doc.id };
  },
  async create(data: any) {
    const docRef = proposalsCollection.doc();
    const newProposal = {
      ...data,
      createdAt: new Date().toISOString()
    };
    await docRef.set(newProposal);
    return { id: docRef.id, ...newProposal, _id: docRef.id };
  },
  async update(id: string, data: any) {
    const docRef = proposalsCollection.doc(id);
    await docRef.update(data);
    return this.findById(id);
  }
};
