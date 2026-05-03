import React, { useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { PipelineColumn } from './PipelineColumn.tsx';
import { PipelineCard } from './PipelineCard.tsx';
import { PIPELINE_STAGES, useCrmStore, type PipelineStageId } from '../../stores/useCrmStore.ts';
import { leadService } from '../../services/leadService.ts';
import { useToast } from '../ui/Toast.tsx';

type Props = {
  query: string;
  stageScope: PipelineStageId | 'all';
  onEdit: (lead: any) => void;
  onRequestDelete: (lead: any) => void;
  usingFallback: boolean;
};

export function PipelineBoard({ query, stageScope, onEdit, onRequestDelete, usingFallback }: Props) {
  const leads = useCrmStore((s) => s.leads);
  const setLeadsPatch = useCrmStore((s) => s.setLeadsPatch);
  const replaceLead = useCrmStore((s) => s.replaceLead);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (stageScope !== 'all' && String(lead.pipelineStage || 'Lead') !== stageScope) return false;
      if (!q) return true;
      const hay = `${lead.name || ''} ${lead.email || ''} ${lead.company || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [leads, query, stageScope]);

  const byStage = (stage: PipelineStageId) => filtered.filter((l) => String(l.pipelineStage || 'Lead') === stage);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (usingFallback) {
      toast('Demo mode: connect your API URL to persist moves.', 'error');
      return;
    }

    const { active, over } = event;
    if (!over) return;

    const data = over.data?.current as { type?: string; stage?: PipelineStageId } | undefined;
    const nextStage = data?.type === 'stage' ? data.stage : undefined;
    const leadId = String(active.id);
    const lead = leads.find((l) => (l._id || l.id) === leadId);
    if (!nextStage || !lead) return;

    const prevStage = String(lead.pipelineStage || 'Lead') as PipelineStageId;
    if (prevStage === nextStage) return;

    setLeadsPatch(leadId, { pipelineStage: nextStage });

    try {
      const updated = await leadService.updateLead(leadId, { pipelineStage: nextStage });
      replaceLead(updated);
      toast(`Moved to ${nextStage}`, 'success');
    } catch (err) {
      setLeadsPatch(leadId, { pipelineStage: prevStage });
      toast(err instanceof Error ? err.message : 'Could not sync move', 'error');
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 px-1 -mx-1 scroll-smooth custom-scrollbar snap-x snap-mandatory min-h-[min(70vh,720px)]">
        {PIPELINE_STAGES.map((stage) => {
          const rows = byStage(stage);
          const sum = rows.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
          return (
            <div key={stage} className="snap-start shrink-0 h-full flex">
              <PipelineColumn stage={stage} totalValue={sum} count={rows.length}>
                {rows.map((lead) => (
                  <PipelineCard
                    key={lead._id || lead.id}
                    lead={lead}
                    onEdit={onEdit}
                    onRequestDelete={onRequestDelete}
                    draggingDisabled={usingFallback}
                  />
                ))}
              </PipelineColumn>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
