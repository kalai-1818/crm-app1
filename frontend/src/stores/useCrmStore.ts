import { create } from 'zustand';
import { leadService } from '../services/leadService.ts';

export const PIPELINE_STAGES = ['Lead', 'Contacted', 'Proposal', 'Won', 'Lost'] as const;
export type PipelineStageId = (typeof PIPELINE_STAGES)[number];

const DEMO_LEADS: any[] = [
  {
    _id: 'demo-1',
    id: 'demo-1',
    name: 'Alex Rivera',
    email: 'alex@demo.io',
    company: 'Rivera Logistics',
    status: 'Contacted',
    pipelineStage: 'Proposal' as PipelineStageId,
    value: 8400,
    priority: 'High',
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'demo-2',
    id: 'demo-2',
    name: 'Priya Sharma',
    email: 'priya@demo.co',
    company: 'Sharma Foods',
    status: 'New',
    pipelineStage: 'Lead' as PipelineStageId,
    value: 2200,
    priority: 'Medium',
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

type CrmStore = {
  leads: any[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
  fetchLeads: () => Promise<void>;
  setLeadsPatch: (id: string, patch: Partial<any>) => void;
  replaceLead: (lead: any) => void;
  removeLead: (id: string) => void;
  prependLead: (lead: any) => void;
  clearError: () => void;
};

export const useCrmStore = create<CrmStore>((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  usingFallback: false,

  clearError: () => set({ error: null }),

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const data = await leadService.getLeads();
      const list = Array.isArray(data) ? data : [];
      set({
        leads: list.map(normalizeLeadId),
        loading: false,
        usingFallback: false,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load leads';
      set({
        error: message,
        leads: DEMO_LEADS.map(normalizeLeadId),
        loading: false,
        usingFallback: true,
      });
    }
  },

  setLeadsPatch: (id, patch) =>
    set((s) => ({
      leads: s.leads.map((l) => {
        const lid = l._id || l.id;
        return lid === id ? normalizeLeadId({ ...l, ...patch }) : l;
      }),
    })),

  replaceLead: (lead) =>
    set((s) => {
      const id = lead._id || lead.id;
      const next = normalizeLeadId(lead);
      const idx = s.leads.findIndex((l) => (l._id || l.id) === id);
      if (idx === -1) return { leads: [next, ...s.leads] };
      const copy = [...s.leads];
      copy[idx] = next;
      return { leads: copy };
    }),

  removeLead: (id) =>
    set((s) => ({
      leads: s.leads.filter((l) => (l._id || l.id) !== id),
    })),

  prependLead: (lead) =>
    set((s) => ({
      leads: [normalizeLeadId(lead), ...s.leads.filter((l) => (l._id || l.id) !== (lead._id || lead.id))],
    })),
}));

function normalizeLeadId(lead: any) {
  const id = lead._id || lead.id;
  return id ? { ...lead, _id: id, id } : lead;
}

export function leadsByStage(leads: any[], stage: PipelineStageId) {
  return leads.filter((l) => (l.pipelineStage || 'Lead') === stage);
}
