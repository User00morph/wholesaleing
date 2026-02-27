export type PipelineStage =
  | 'NEW_UNQUALIFIED'
  | 'ENGAGED_PREQUAL'
  | 'PREQUAL_COMPLETE'
  | 'HOT_CALL_NOW'
  | 'OFFER_SENT'
  | 'NEGOTIATION'
  | 'UNDER_CONTRACT'
  | 'TITLE_CLOSING'
  | 'CLOSED_ASSIGNED'
  | 'NURTURE_30'
  | 'NURTURE_90'
  | 'DEAD_DNC';

export type Priority = 'HOT' | 'WARM' | 'COLD';

export interface LeadFields {
  owner_confirmed?: boolean;
  address?: string;
  zip?: string;
  condition_score?: number;
  occupancy?: 'vacant' | 'occupied';
  timeline?: '0-30' | '30-90' | '3-6' | '6+';
  asking_price?: number;
  mortgage?: 'yes' | 'no' | 'unknown';
  repairs?: string[];
  market_tag?: string;
}

export interface LLMDecision {
  next_message: string;
  lead_fields: LeadFields;
  lead_score: number;
  priority: Priority;
  pipeline_stage: PipelineStage;
  internal_note: string;
  needs_human: boolean;
}

export interface Lead {
  id: string;
  phone: string;
  name?: string;
  stage: PipelineStage;
  score: number;
  priority: Priority;
  fields: LeadFields;
  lastMessageAt?: string;
}
