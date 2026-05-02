import { db } from '../config/firebase.ts';

const usersCollection = db.collection('users');

export default {
  async findById(id: string) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, _id: doc.id, ...doc.data() };
  },
  async findOne(query: any) {
    if (query.email) {
      const snapshot = await usersCollection.where('email', '==', query.email).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    return null;
  },
  async create(data: any) {
    const docRef = usersCollection.doc();
    const newUser = {
      ...data,
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(newUser);
    return { id: docRef.id, _id: docRef.id, ...newUser };
  },
  // Create a user with a specific ID (used for Firebase Auth UID sync)
  async createWithId(id: string, data: any) {
    const docRef = usersCollection.doc(id);
    const newUser = {
      ...data,
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(newUser);
    return { id, _id: id, ...newUser };
  },
  async find(query: any = {}) {
    let q: FirebaseFirestore.Query = usersCollection;
    if (query._id?.$ne) {
      q = q.where('__name__', '!=', query._id.$ne);
    }
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, _id: doc.id, ...doc.data() }));
  },
};
