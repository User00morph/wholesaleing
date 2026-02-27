import { Lead, PipelineStage } from '../types/domain';

export interface CRMClient {
  createOrUpdateLead(lead: Lead): Promise<void>;
  moveStage(leadId: string, stage: PipelineStage): Promise<void>;
  addTag(leadId: string, tag: string): Promise<void>;
  addNote(leadId: string, note: string): Promise<void>;
  createTask(leadId: string, title: string, dueAt?: string): Promise<void>;
}

export class MockCRMClient implements CRMClient {
  public leads = new Map<string, Lead>();
  public logs: string[] = [];

  async createOrUpdateLead(lead: Lead): Promise<void> {
    this.leads.set(lead.id, lead);
    this.logs.push(`upsert:${lead.id}:${lead.stage}:${lead.score}`);
  }
  async moveStage(leadId: string, stage: PipelineStage): Promise<void> {
    const lead = this.leads.get(leadId);
    if (lead) lead.stage = stage;
    this.logs.push(`move:${leadId}:${stage}`);
  }
  async addTag(leadId: string, tag: string): Promise<void> {
    this.logs.push(`tag:${leadId}:${tag}`);
  }
  async addNote(leadId: string, note: string): Promise<void> {
    this.logs.push(`note:${leadId}:${note}`);
  }
  async createTask(leadId: string, title: string, dueAt?: string): Promise<void> {
    this.logs.push(`task:${leadId}:${title}:${dueAt ?? ''}`);
  }
}
