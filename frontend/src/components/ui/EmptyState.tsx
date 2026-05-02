import React from 'react';
import { motion } from 'motion/react';
import { Ghost } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-8 border border-stone-100 shadow-inner group">
        <div className="text-stone-300 group-hover:scale-110 group-hover:text-orange-500 transition-all duration-500">
          {icon || <Ghost className="w-8 h-8" />}
        </div>
      </div>
      <h3 className="text-xl font-black tracking-tight text-stone-900 mb-2">{title}</h3>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 max-w-[320px] mx-auto leading-relaxed mb-10">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
