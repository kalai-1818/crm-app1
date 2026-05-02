import Lead from '../models/Lead.ts';
import User from '../models/User.ts';
import Activity from '../models/Activity.ts';

export const calculatePriority = (value: number, status: string): 'High' | 'Medium' | 'Low' => {
  if (value >= 5000 || (status === 'New' && value >= 2000)) return 'High';
  if (value >= 1000) return 'Medium';
  return 'Low';
};

export const getAutoAssignee = async () => {
  const users = await User.find({});
  if (users.length === 0) return null;

  // Firestore doesn't support $in, so count New and Contacted leads separately
  const workloads = await Promise.all(
    users.map(async (user: any) => {
      const uid = user._id || user.id;
      const [newCount, contactedCount] = await Promise.all([
        Lead.countDocuments({ owner: uid, status: 'New' }),
        Lead.countDocuments({ owner: uid, status: 'Contacted' }),
      ]);
      return { userId: uid, count: newCount + contactedCount };
    })
  );

  workloads.sort((a, b) => a.count - b.count);
  return workloads[0].userId;
};

export const logActivity = async (data: {
  lead: string;
  user: string;
  type: 'CREATED' | 'ASSIGNED' | 'STATUS_UPDATED' | 'PRIORITY_UPDATED' | 'CONVERTED' | 'REJECTED';
  message: string;
  previousValue?: string;
  newValue?: string;
}) => {
  try {
    await Activity.create(data);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
