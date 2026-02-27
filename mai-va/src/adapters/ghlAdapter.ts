import { config } from '../config/config';
import { Lead, PipelineStage } from '../types/domain';
import { CRMClient } from './crm';

export class GoHighLevelCRMClient implements CRMClient {
  private headers = {
    Authorization: `Bearer ${config.crm.apiKey}`,
    'Content-Type': 'application/json'
  };

  async createOrUpdateLead(lead: Lead): Promise<void> {
    await this.request('/contacts/upsert', {
      locationId: config.crm.locationId,
      phone: lead.phone,
      name: lead.name,
      customFields: [{ key: 'mai_va_stage', field_value: lead.stage }]
    });
  }

  async moveStage(leadId: string, stage: PipelineStage): Promise<void> {
    await this.request(`/opportunities/${leadId}`, { stage });
  }

  async addTag(leadId: string, tag: string): Promise<void> {
    await this.request(`/contacts/${leadId}/tags`, { tags: [tag] });
  }

  async addNote(leadId: string, note: string): Promise<void> {
    await this.request(`/contacts/${leadId}/notes`, { body: note });
  }

  async createTask(leadId: string, title: string, dueAt?: string): Promise<void> {
    await this.request('/tasks', { contactId: leadId, title, dueDate: dueAt });
  }

  private async request(path: string, body: Record<string, unknown>): Promise<void> {
    if (!config.crm.apiKey || !config.crm.locationId) {
      console.log('[GoHighLevelCRMClient] Missing API credentials; request stubbed.', path, body);
      return;
    }
    const res = await fetch(`${config.crm.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(`GHL API error ${res.status}: ${await res.text()}`);
    }
  }
}
