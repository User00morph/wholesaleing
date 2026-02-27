import { LeadFields, Priority } from '../types/domain';

export interface ScoringInputs {
  motivation: number;
  distress: number;
  timeline: number;
  priceFlex: number;
}

export function scoreLead(
  inputs: ScoringInputs,
  weights: { motivation: number; distress: number; timeline: number; priceFlex: number },
  hotThreshold: number
): { score: number; priority: Priority } {
  const score =
    inputs.motivation * weights.motivation +
    inputs.distress * weights.distress +
    inputs.timeline * weights.timeline +
    inputs.priceFlex * weights.priceFlex;

  if (score >= hotThreshold) return { score, priority: 'HOT' };
  if (score >= hotThreshold * 0.6) return { score, priority: 'WARM' };
  return { score, priority: 'COLD' };
}

export function deriveSignalInputs(fields: LeadFields): ScoringInputs {
  const motivation = fields.owner_confirmed ? 8 : 4;
  const distress = fields.condition_score ? Math.max(1, 11 - fields.condition_score) : 3;
  const timelineMap: Record<string, number> = { '0-30': 10, '30-90': 7, '3-6': 4, '6+': 2 };
  const timeline = fields.timeline ? timelineMap[fields.timeline] ?? 2 : 2;
  const priceFlex = fields.asking_price ? 6 : 3;
  return { motivation, distress, timeline, priceFlex };
}
