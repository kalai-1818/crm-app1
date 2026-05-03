import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, PencilLine, Target, Flame, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { getLeadInsights } from '../../lib/leadIntelligence.ts';
import type { PipelineStageId } from '../../stores/useCrmStore.ts';

type Props = {
  lead: any;
  onEdit: (lead: any) => void;
  onRequestDelete: (lead: any) => void;
  draggingDisabled?: boolean;
};

export function PipelineCard({ lead, onEdit, onRequestDelete, draggingDisabled }: Props) {
  const id = lead._id || lead.id;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: draggingDisabled || !id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: draggingDisabled ? 'default' : 'grab',
    touchAction: 'none',
  };

  const updated = lead.updatedAt || lead.createdAt;
  const insights = getLeadInsights({ ...lead, pipelineStage: lead.pipelineStage as PipelineStageId | undefined });

  return (
    <motion.div ref={setNodeRef} layout style={style} className="relative">
      <div
        {...listeners}
        {...attributes}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit(lead);
          }
        }}
        className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm hover:shadow-md hover:border-orange-200/80 transition-all group select-none"
      >
        <div className="flex justify-between gap-2 items-start mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                lead.priority === 'High'
                  ? 'bg-red-50 text-red-700 border-red-100'
                  : lead.priority === 'Medium'
                    ? 'bg-orange-50 text-orange-700 border-orange-100'
                    : 'bg-stone-50 text-stone-600 border-stone-100'
              }`}
            >
              {(lead.priority || 'Medium')} · Score {insights.score}
            </span>
            <span
              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                insights.risk === 'high'
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : insights.risk === 'medium'
                    ? 'bg-amber-50 text-amber-800 border-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-100'
              }`}
            >
              {insights.risk === 'high' ? (
                <Flame className="w-3 h-3" />
              ) : insights.risk === 'medium' ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
              )}
              {insights.risk} risk
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              aria-label="Edit lead"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <PencilLine className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Delete lead"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(lead);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-sm font-bold text-stone-900 tracking-tight leading-snug line-clamp-2">{lead.name || 'Untitled lead'}</h3>
        <p className="text-[11px] font-semibold text-stone-500 mt-1 truncate">{lead.company || lead.email || '—'}</p>

        <p className="mt-3 text-[10px] text-stone-600 leading-snug line-clamp-2 flex gap-2">
          <span className="shrink-0 text-orange-600 font-black uppercase tracking-wide">Next</span>
          <span>{insights.nextAction}</span>
        </p>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-stone-700 min-w-0">
            <Target className="w-3.5 h-3.5 shrink-0 text-orange-600" />
            <span className="text-[11px] font-black truncate">₹{Number(lead.value || 0).toLocaleString()}</span>
          </div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter shrink-0">
            {(lead.pipelineStage || 'Lead')} ·{' '}
            {updated ? new Date(updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
