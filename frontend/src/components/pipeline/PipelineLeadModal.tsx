import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import type { PipelineStageId } from '../../stores/useCrmStore.ts';
import { PIPELINE_STAGES } from '../../stores/useCrmStore.ts';

export type DraftLead = {
  name: string;
  email: string;
  company: string;
  value: number;
  pipelineStage: PipelineStageId;
};

const emptyDraft = (): DraftLead => ({
  name: '',
  email: '',
  company: '',
  value: 0,
  pipelineStage: 'Lead',
});

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  initial?: Partial<DraftLead> | null;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (draft: DraftLead) => Promise<void>;
};

export function PipelineLeadModal({ open, onClose, title, subtitle, initial, submitLabel, submitting, onSubmit }: Props) {
  const [draft, setDraft] = useState<DraftLead>(emptyDraft());

  useEffect(() => {
    if (open) {
      setDraft({
        ...emptyDraft(),
        ...initial,
        value: typeof initial?.value === 'number' ? initial!.value : 0,
      });
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(draft);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            role="dialog"
            aria-modal
            aria-labelledby="pipeline-lead-modal-title"
            className="relative w-full max-w-lg bg-white rounded-[1.75rem] border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-3 bg-stone-50/70">
              <div>
                <h2 id="pipeline-lead-modal-title" className="text-lg font-bold text-stone-900 tracking-tight">
                  {title}
                </h2>
                {subtitle ? <p className="text-xs text-stone-500 mt-1 font-medium">{subtitle}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <Field label="Name" required>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </Field>
              <Field label="Email" required>
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </Field>
              <Field label="Company">
                <input
                  value={draft.company}
                  onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </Field>
              <Field label="Value (₹)">
                <input
                  type="number"
                  min={0}
                  value={draft.value === 0 ? '' : draft.value}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      value: e.target.value === '' ? 0 : Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </Field>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Pipeline stage</p>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE_STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, pipelineStage: s }))}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${
                        draft.pipelineStage === s
                          ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/10'
                          : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-black uppercase tracking-widest hover:bg-orange-700 disabled:opacity-50 shadow-lg shadow-orange-900/15"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </span>
      {children}
    </label>
  );
}
