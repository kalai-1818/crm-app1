/** Client-side fallback when backend has not set `lead.priority`. Mirrors backend heuristic scale. */

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export function priorityFromValue(value: unknown): PriorityLevel {
  const v = Number(value) || 0;
  if (v >= 5000) return 'High';
  if (v >= 1000) return 'Medium';
  return 'Low';
}

/** Prefer server-provided priority; otherwise derive from deal value */
export function displayPriority(lead: { priority?: string; value?: number }): PriorityLevel {
  const p = lead.priority;
  if (p === 'High' || p === 'Medium' || p === 'Low') return p;
  return priorityFromValue(lead.value);
}
