import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  UserPlus, 
  RefreshCcw, 
  TrendingUp, 
  CheckCircle2, 
  XSquare,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  _id: string;
  type: 'CREATED' | 'ASSIGNED' | 'STATUS_UPDATED' | 'PRIORITY_UPDATED' | 'CONVERTED' | 'REJECTED';
  message: string;
  createdAt: string;
  user: { name: string };
  previousValue?: string;
  newValue?: string;
}

const ICON_MAP = {
  CREATED: <PlusCircle className="w-4 h-4 text-blue-500" />,
  ASSIGNED: <UserPlus className="w-4 h-4 text-purple-500" />,
  STATUS_UPDATED: <RefreshCcw className="w-4 h-4 text-orange-500" />,
  PRIORITY_UPDATED: <TrendingUp className="w-4 h-4 text-rose-500" />,
  CONVERTED: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  REJECTED: <XSquare className="w-4 h-4 text-red-500" />,
};

export function LeadTimeline({ activities }: { activities: Activity[] }) {
  const list = Array.isArray(activities) ? activities : [];
  if (!list.length) {
    return (
      <div className="py-12 text-center">
        <Clock className="w-8 h-8 text-stone-200 mx-auto mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">No signals recorded</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-stone-100">
      {list.map((activity, index) => (
        <motion.div 
          key={activity._id || `activity-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex items-start gap-6"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-sm z-10">
            {ICON_MAP[activity.type] || <Clock className="w-4 h-4 text-stone-400" />}
          </div>
          <div className="flex-1 pt-1.5 pb-2">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">
                {activity.type.replace('_', ' ')}
              </h4>
              <time className="text-[10px] font-bold text-stone-300 italic">
                {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
              </time>
            </div>
            <p className="text-sm font-bold text-stone-900 leading-relaxed mb-1 italic">
              "{activity.message}"
            </p>
            <p className="text-[10px] font-medium text-stone-400">
              Operative: <span className="text-stone-900 font-black">{activity.user?.name || 'System Operator'}</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
