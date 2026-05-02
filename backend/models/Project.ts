import { db } from '../config/firebase.ts';

const projectsCollection = db.collection('projects');

export default {
  async find(query: any = {}) {
    let q: any = projectsCollection;
    if (query.leadId) q = q.where('leadId', '==', query.leadId);
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), _id: doc.id }));
  },
  async findById(id: string) {
    const doc = await projectsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data(), _id: doc.id };
  },
  async create(data: any) {
    const docRef = projectsCollection.doc();
    const newProject = {
      name: data.name,
      leadId: data.leadId,
      progress: data.progress || 0,
      status: data.status || 'Active',
      checklist: data.checklist || [
        { task: 'Document Collection', isCompleted: false, category: 'Documents' },
        { task: 'Milestone Setup', isCompleted: false, category: 'Planning' },
        { task: 'Kickoff Meeting', isCompleted: false, category: 'Kickoff' }
      ],
      milestones: data.milestones || [],
      documents: data.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await docRef.set(newProject);
    return { id: docRef.id, ...newProject, _id: docRef.id };
  },
  async update(id: string, data: any) {
    const docRef = projectsCollection.doc(id);
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await docRef.update(updateData);
    return this.findById(id);
  }
};
