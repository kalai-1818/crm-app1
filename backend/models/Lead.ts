import { db } from '../config/firebase.ts';

const leadsCollection = db.collection('leads');

export default {
  async find(query: any) {
    let q: FirebaseFirestore.Query = leadsCollection;
    if (query.owner) q = q.where('owner', '==', query.owner);
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, _id: doc.id, ...doc.data() }));
  },
  async findOne(query: any) {
    if (query._id) {
      const doc = await leadsCollection.doc(query._id).get();
      if (!doc.exists) return null;
      const data = doc.data();
      if (query.owner && data?.owner !== query.owner) return null;
      return { id: doc.id, _id: doc.id, ...data };
    }
    return null;
  },
  async create(data: any) {
    const docRef = leadsCollection.doc();
    const newLead = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(newLead);
    return { id: docRef.id, _id: docRef.id, ...newLead };
  },
  async findOneAndUpdate(query: any, data: any, _options: any) {
    if (query._id) {
      const docRef = leadsCollection.doc(query._id);

      // Handle $push for comments (Mongoose-style compat)
      if (data.$push?.comments) {
        const doc = await docRef.get();
        const currentData = doc.data() || {};
        const comments = [...(currentData.comments || []), data.$push.comments];
        delete data.$push;
        data.comments = comments;
      }

      const updateData = { ...data, updatedAt: new Date().toISOString() };
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, _id: updatedDoc.id, ...updatedDoc.data() };
    }
    return null;
  },
  async findOneAndDelete(query: any) {
    if (query._id) {
      const docRef = leadsCollection.doc(query._id);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      await docRef.delete();
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    return null;
  },
  // Only supports single-value status filter (Firestore doesn't support $in)
  async countDocuments(query: any) {
    let q: FirebaseFirestore.Query = leadsCollection;
    if (query.owner) q = q.where('owner', '==', query.owner);
    if (query.status && typeof query.status === 'string') {
      q = q.where('status', '==', query.status);
    }
    const snapshot = await q.count().get();
    return snapshot.data().count;
  },
};
