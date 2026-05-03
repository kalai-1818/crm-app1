export const PIPELINE_STAGES = ['Lead', 'Contacted', 'Proposal', 'Won', 'Lost'] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

const LEGACY_STAGE_MAP: Record<string, PipelineStage> = {
  New: 'Lead',
  Lead: 'Lead',
  Qualified: 'Proposal',
  'Proposal Sent': 'Proposal',
  Negotiation: 'Proposal',
  Proposal: 'Proposal',
  Converted: 'Won',
  Won: 'Won',
  Rejected: 'Lost',
  Lost: 'Lost',
  Contacted: 'Contacted',
};

/** Map canonical pipeline stage to CRM status stored on the lead */
export function statusFromPipelineStage(stage: PipelineStage): 'New' | 'Contacted' | 'Converted' | 'Rejected' {
  switch (stage) {
    case 'Lead':
      return 'New';
    case 'Contacted':
    case 'Proposal':
      return 'Contacted';
    case 'Won':
      return 'Converted';
    case 'Lost':
      return 'Rejected';
    default:
      return 'New';
  }
}

/** Normalize legacy Firestore values for API + frontend */
export function canonicalPipelineStage(lead: {
  pipelineStage?: string | null;
  status?: string | null;
}): PipelineStage {
  const raw = (lead.pipelineStage || '').trim();
  if ((PIPELINE_STAGES as readonly string[]).includes(raw)) return raw as PipelineStage;

  const fromLegacyKey = LEGACY_STAGE_MAP[raw];
  if (fromLegacyKey) return fromLegacyKey;

  const st = lead.status || '';
  if (st === 'Converted') return 'Won';
  if (st === 'Rejected') return 'Lost';
  if (st === 'Contacted') return 'Contacted';
  return 'Lead';
}
