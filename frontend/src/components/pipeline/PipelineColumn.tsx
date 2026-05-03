import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { PipelineStageId } from '../../stores/useCrmStore.ts';

type Props = {
  stage: PipelineStageId;
  totalValue: number;
  count: number;
  children: React.ReactNode;
};

export function PipelineColumn({ stage, totalValue, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage}`,
    data: { type: 'stage', stage },
  });

  return (
    <section className="min-w-[280px] sm:min-w-[300px] flex flex-col gap-3 h-full max-h-[calc(100vh-220px)]">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-800">{stage}</span>
          <span className="bg-stone-200/90 text-stone-700 text-[9px] font-black px-2 py-0.5 rounded-full tabular-nums">{count}</span>
        </div>
        <span className="text-[10px] font-black text-orange-600 uppercase tabular-nums">₹{totalValue.toLocaleString()}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-2xl border p-3 space-y-3 overflow-y-auto overflow-x-hidden transition-colors custom-scrollbar ${
          isOver ? 'bg-orange-50/40 border-orange-300/70 ring-2 ring-orange-200/70' : 'bg-stone-100/35 border-stone-200/60'
        }`}
      >
        {children}
        {count === 0 && (
          <div className="py-14 text-center text-[10px] font-black uppercase tracking-widest text-stone-400">Drop leads here</div>
        )}
      </div>
    </section>
  );
}
