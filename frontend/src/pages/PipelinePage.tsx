import React, { useEffect, useState } from 'react';
import {
  Kanban,
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PipelineBoard } from '../components/pipeline/PipelineBoard.tsx';
import { PipelineLeadModal, type DraftLead } from '../components/pipeline/PipelineLeadModal.tsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { useCrmStore, type PipelineStageId } from '../stores/useCrmStore.ts';
import { leadService } from '../services/leadService.ts';

export default function PipelinePage() {
  const fetchLeads = useCrmStore((s) => s.fetchLeads);
  const leads = useCrmStore((s) => s.leads);
  const loading = useCrmStore((s) => s.loading);
  const error = useCrmStore((s) => s.error);
  const usingFallback = useCrmStore((s) => s.usingFallback);
  const clearError = useCrmStore((s) => s.clearError);
  const prependLead = useCrmStore((s) => s.prependLead);
  const replaceLead = useCrmStore((s) => s.replaceLead);
  const removeLead = useCrmStore((s) => s.removeLead);

  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [stageScope, setStageScope] = useState<PipelineStageId | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const openCreate = () => {
    setEditing(null);
    setLeadModalOpen(true);
  };

  const openEdit = (lead: any) => {
    setEditing(lead);
    setLeadModalOpen(true);
  };

  const closeModal = () => {
    setLeadModalOpen(false);
    setEditing(null);
  };

  const handleModalSubmit = async (draft: DraftLead) => {
    setSubmittingModal(true);
    try {
      if (editing) {
        const id = editing._id || editing.id;
        const payload = {
          name: draft.name,
          email: draft.email,
          company: draft.company,
          value: draft.value,
          pipelineStage: draft.pipelineStage,
        };
        const updated = await leadService.updateLead(id, payload);
        replaceLead(updated);
        toast('Lead updated', 'success');
      } else {
        const created = await leadService.createLead({
          name: draft.name,
          email: draft.email,
          company: draft.company || undefined,
          value: draft.value,
          pipelineStage: draft.pipelineStage,
        });
        prependLead(created);
        toast('Lead created', 'success');
      }
      closeModal();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save lead', 'error');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    try {
      await leadService.deleteLead(id);
      removeLead(id);
      toast('Lead removed', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not delete', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const initialDraft =
    editing != null
      ? {
          name: editing.name || '',
          email: editing.email || '',
          company: editing.company || '',
          value: Number(editing.value) || 0,
          pipelineStage: (editing.pipelineStage || 'Lead') as PipelineStageId,
        }
      : null;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 flex flex-wrap items-center gap-2">
            <Kanban className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
            Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Drag cards between stages. {leads.length} lead{leads.length !== 1 ? 's' : ''} synced.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] sm:min-w-[260px] max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, company…"
              aria-label="Filter pipeline cards"
              className="w-full rounded-xl bg-white border border-stone-200 py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 shadow-sm shadow-stone-900/5"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={`h-11 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${
                filterOpen ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {filterOpen && (
              <>
                <button type="button" className="fixed inset-0 z-[50]" aria-label="Close filters" onClick={() => setFilterOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,240px)] bg-white rounded-2xl border border-stone-200 shadow-xl z-[60] p-3 space-y-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Stages</p>
                  {(['all', 'Lead', 'Contacted', 'Proposal', 'Won', 'Lost'] as const).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => {
                        setStageScope(stage === 'all' ? 'all' : stage);
                        setFilterOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide transition-colors ${
                        (stage === 'all' ? stageScope === 'all' : stageScope === stage)
                          ? 'bg-stone-900 text-white'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {stage === 'all' ? 'All stages' : stage}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => void fetchLeads()}
            disabled={loading}
            className="h-11 px-3 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            <span className="sr-only">Refresh pipeline</span>
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="h-11 px-5 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 shadow-lg shadow-stone-900/15 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </header>

      {usingFallback ? (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Offline demo data is showing because the API is unreachable — set{' '}
            <code className="font-mono text-[11px]">VITE_API_URL</code> or{' '}
            <code className="font-mono text-[11px]">NEXT_PUBLIC_API_URL</code> if your backend runs on another host.
          </span>
        </div>
      ) : null}

      {error && !usingFallback ? (
        <div className="rounded-2xl bg-red-50 border border-red-100 text-red-800 px-4 py-3 text-xs flex justify-between gap-4 items-center flex-wrap">
          <span>{error}</span>
          <button type="button" onClick={() => { clearError(); void fetchLeads(); }} className="text-[10px] font-black uppercase tracking-widest underline">
            Retry
          </button>
        </div>
      ) : null}

      {loading && leads.length === 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[280px] h-[min(520px,60vh)] rounded-3xl bg-stone-100/80 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : (
        <PipelineBoard
          query={query}
          stageScope={stageScope}
          onEdit={openEdit}
          onRequestDelete={(lead) => setDeleteTarget(lead)}
          usingFallback={usingFallback}
        />
      )}

      <PipelineLeadModal
        open={leadModalOpen}
        onClose={() => closeModal()}
        submitting={submittingModal}
        title={editing ? 'Edit Lead' : 'New Lead'}
        subtitle={usingFallback ? 'API offline — edits won’t persist in demo.' : undefined}
        initial={initialDraft ?? undefined}
        submitLabel={editing ? 'Save changes' : 'Create lead'}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirmed()}
        title="Remove this lead?"
        message={`This deletes ${deleteTarget?.name || 'the lead'} and cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
