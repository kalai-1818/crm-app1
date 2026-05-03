export type InsightRisk = 'low' | 'medium' | 'high';

export interface LeadInsights {
  score: number;
  risk: InsightRisk;
  nextAction: string;
}

/** Client-side heuristic scores (fast UI); server may extend later */
export function getLeadInsights(lead: {
  value?: number;
  pipelineStage?: string;
  priority?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
}): LeadInsights {
  const value = Number(lead.value) || 0;
  const stage = lead.pipelineStage || 'Lead';
  const staleRef = lead.updatedAt || lead.createdAt;
  const staleDays =
    staleRef != null ? (Date.now() - new Date(staleRef).getTime()) / (1000 * 60 * 60 * 24) : 0;

  let score = 40;
  if (value >= 10000) score += 28;
  else if (value >= 5000) score += 20;
  else if (value >= 1000) score += 12;

  if (lead.priority === 'High') score += 12;
  if (lead.priority === 'Medium') score += 6;

  const stageBump: Record<string, number> = {
    Proposal: 15,
    Contacted: 8,
    Lead: 4,
    Won: -5,
    Lost: -30,
  };
  score += stageBump[stage] ?? 0;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let risk: InsightRisk = 'low';
  if (stage === 'Proposal' && staleDays > 5) risk = 'high';
  else if ((stage === 'Lead' || stage === 'Contacted') && staleDays > 14) risk = 'high';
  else if (staleDays > 10 || stage === 'Lost') risk = 'medium';

  let nextAction = 'Keep nurturing — schedule a tailored follow-up.';
  if (stage === 'Lead')
    nextAction = 'Reach out today — qualify budget and timeline.';
  if (stage === 'Contacted')
    nextAction = 'Follow up now — confirm interest before the trail goes cold.';
  if (stage === 'Proposal')
    nextAction =
      staleDays > 5
        ? 'Close the loop — send a concise recap and decision deadline.'
        : 'Share a sharp one-pager and anchor on next steps.';
  if (stage === 'Won') nextAction = 'Onboard smoothly — lock scope and kickoff.';
  if (stage === 'Lost') nextAction = 'Capture learnings — tag for re-engagement in 60–90 days.';
  if (risk === 'high' && stage !== 'Lost')
    nextAction = 'Follow up now — high chance to close if you act this week.';

  return { score, risk, nextAction };
}
