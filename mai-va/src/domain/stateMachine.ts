import { PipelineStage } from '../types/domain';

const allowed: Record<PipelineStage, PipelineStage[]> = {
  NEW_UNQUALIFIED: ['ENGAGED_PREQUAL', 'DEAD_DNC'],
  ENGAGED_PREQUAL: ['PREQUAL_COMPLETE', 'NURTURE_30', 'DEAD_DNC'],
  PREQUAL_COMPLETE: ['HOT_CALL_NOW', 'NURTURE_30', 'DEAD_DNC'],
  HOT_CALL_NOW: ['OFFER_SENT', 'NEGOTIATION', 'DEAD_DNC'],
  OFFER_SENT: ['NEGOTIATION', 'UNDER_CONTRACT', 'NURTURE_30', 'DEAD_DNC'],
  NEGOTIATION: ['UNDER_CONTRACT', 'NURTURE_30', 'DEAD_DNC'],
  UNDER_CONTRACT: ['TITLE_CLOSING', 'DEAD_DNC'],
  TITLE_CLOSING: ['CLOSED_ASSIGNED', 'DEAD_DNC'],
  CLOSED_ASSIGNED: [],
  NURTURE_30: ['NURTURE_90', 'ENGAGED_PREQUAL', 'DEAD_DNC'],
  NURTURE_90: ['ENGAGED_PREQUAL', 'DEAD_DNC'],
  DEAD_DNC: []
};

export function canMoveStage(from: PipelineStage, to: PipelineStage): boolean {
  return allowed[from].includes(to);
}

export function suggestStageFromPriority(priority: 'HOT' | 'WARM' | 'COLD'): PipelineStage {
  if (priority === 'HOT') return 'HOT_CALL_NOW';
  if (priority === 'WARM') return 'NURTURE_30';
  return 'NURTURE_90';
}
