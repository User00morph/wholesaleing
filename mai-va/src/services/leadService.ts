import { CRMClient } from '../adapters/crm';
import { SMSClient } from '../adapters/sms';
import { LLMRouter } from '../brain/llmRouter';
import { config } from '../config/config';
import { all, get, run } from '../db/sqlite';
import { deriveSignalInputs, scoreLead } from '../domain/scoring';
import { canMoveStage, suggestStageFromPriority } from '../domain/stateMachine';
import { queueFollowUps } from './followUpEngine';
import { Lead, LeadFields } from '../types/domain';

export class LeadService {
  constructor(private crm: CRMClient, private sms: SMSClient, private llm: LLMRouter) {}

  async processInbound(payload: any): Promise<{ lead: Lead; outbound: string }> {
    const inbound = this.sms.parseInboundWebhook(payload);
    const existing = await this.findByPhone(inbound.from);
    const decision = await this.llm.decide(existing, inbound.body, config.marketMode);
    const fields = { ...(existing?.fields ?? {}), ...(decision.lead_fields ?? {}) } as LeadFields;

    const calculated = scoreLead(deriveSignalInputs(fields), config.scoringWeights, config.hotThreshold);
    const priority = decision.priority ?? calculated.priority;
    const stage = decision.pipeline_stage ?? suggestStageFromPriority(priority);

    const lead: Lead = {
      id: existing?.id ?? `lead_${Date.now()}`,
      phone: inbound.from,
      stage: existing && !canMoveStage(existing.stage, stage) ? existing.stage : stage,
      score: calculated.score,
      priority,
      fields,
      lastMessageAt: new Date().toISOString()
    };

    await this.upsertLead(lead);
    await this.crm.createOrUpdateLead(lead);
    await this.crm.addNote(lead.id, decision.internal_note);
    if (lead.priority === 'HOT' || decision.needs_human) {
      await this.crm.createTask(lead.id, 'Morph: call this HOT lead now');
      await this.crm.addTag(lead.id, 'HOT');
    } else {
      await queueFollowUps(lead.id, lead.phone, lead.priority === 'WARM' ? 'WARM' : 'COLD');
    }

    await this.sms.sendMessage(lead.phone, decision.next_message);
    await run('INSERT INTO messages (lead_id, direction, body, created_at) VALUES (?, ?, ?, ?)', [lead.id, 'inbound', inbound.body, new Date().toISOString()]);
    await run('INSERT INTO messages (lead_id, direction, body, created_at) VALUES (?, ?, ?, ?)', [lead.id, 'outbound', decision.next_message, new Date().toISOString()]);
    await run('INSERT INTO logs (lead_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?)', [lead.id, 'lead_processed', JSON.stringify({ decision, lead }), new Date().toISOString()]);

    return { lead, outbound: decision.next_message };
  }

  async handleStatus(payload: any): Promise<void> {
    await run('INSERT INTO logs (lead_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?)', [payload.leadId ?? null, 'sms_status', JSON.stringify(payload), new Date().toISOString()]);
  }

  async handleCrmEvent(payload: any): Promise<void> {
    await run('INSERT INTO logs (lead_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?)', [payload.leadId ?? null, 'crm_event', JSON.stringify(payload), new Date().toISOString()]);
  }

  async hotLeadSummary(): Promise<any[]> {
    return all('SELECT id, phone, stage, score, priority, fields_json FROM leads WHERE priority = ? AND date(updated_at) = date(?)', ['HOT', new Date().toISOString()]);
  }

  private async findByPhone(phone: string): Promise<Lead | undefined> {
    const row = await get<any>('SELECT * FROM leads WHERE phone = ?', [phone]);
    if (!row) return undefined;
    return {
      id: row.id,
      phone: row.phone,
      stage: row.stage,
      score: row.score,
      priority: row.priority,
      fields: JSON.parse(row.fields_json)
    };
  }

  private async upsertLead(lead: Lead): Promise<void> {
    await run(
      `INSERT INTO leads (id, phone, stage, score, priority, fields_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(phone) DO UPDATE SET stage=excluded.stage, score=excluded.score, priority=excluded.priority, fields_json=excluded.fields_json, updated_at=excluded.updated_at`,
      [lead.id, lead.phone, lead.stage, lead.score, lead.priority, JSON.stringify(lead.fields), new Date().toISOString()]
    );
  }
}
