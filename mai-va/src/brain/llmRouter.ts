import { z } from 'zod';
import { config } from '../config/config';
import { LLMDecision, Lead, LeadFields } from '../types/domain';

const schema = z.object({
  next_message: z.string(),
  lead_fields: z.object({
    owner_confirmed: z.boolean().optional(),
    address: z.string().optional(),
    zip: z.string().optional(),
    condition_score: z.number().min(1).max(10).optional(),
    occupancy: z.enum(['vacant', 'occupied']).optional(),
    timeline: z.enum(['0-30', '30-90', '3-6', '6+']).optional(),
    asking_price: z.number().optional(),
    mortgage: z.enum(['yes', 'no', 'unknown']).optional(),
    repairs: z.array(z.string()).optional(),
    market_tag: z.string().optional()
  }),
  lead_score: z.number(),
  priority: z.enum(['HOT', 'WARM', 'COLD']),
  pipeline_stage: z.enum([
    'NEW_UNQUALIFIED', 'ENGAGED_PREQUAL', 'PREQUAL_COMPLETE', 'HOT_CALL_NOW', 'OFFER_SENT',
    'NEGOTIATION', 'UNDER_CONTRACT', 'TITLE_CLOSING', 'CLOSED_ASSIGNED', 'NURTURE_30', 'NURTURE_90', 'DEAD_DNC'
  ]),
  internal_note: z.string(),
  needs_human: z.boolean()
});

export class LLMRouter {
  async decide(lead: Lead | undefined, inboundBody: string, marketMode: string): Promise<LLMDecision> {
    const prompt = this.buildPrompt(lead?.fields ?? {}, inboundBody, marketMode);
    const raw = await this.callModel(prompt);
    const parsed = this.parse(raw);
    if (parsed) return parsed;

    const retryRaw = await this.callModel(`${prompt}\nReturn ONLY valid minified JSON.`);
    const retryParsed = this.parse(retryRaw);
    if (retryParsed) return retryParsed;

    return {
      next_message: 'Thanks for sharing. Could you confirm the property address and timeline?',
      lead_fields: {},
      lead_score: lead?.score ?? 0,
      priority: 'COLD',
      pipeline_stage: lead?.stage ?? 'NEW_UNQUALIFIED',
      internal_note: 'Fallback due to invalid model JSON.',
      needs_human: false
    };
  }

  private buildPrompt(existing: LeadFields, inboundBody: string, marketMode: string): string {
    return `You are M.A.I-VA for wholesaling lead intake. Guardrails: no legal/agent claims, concise, respectful, non-coercive, no fabricated facts. Ask follow-up questions when missing facts. Market mode: ${marketMode}. Existing lead fields: ${JSON.stringify(existing)}. Seller message: ${inboundBody}. Output JSON with fields: next_message, lead_fields, lead_score, priority, pipeline_stage, internal_note, needs_human.`;
  }

  private async callModel(prompt: string): Promise<string> {
    if (!config.llm.apiKey) {
      return JSON.stringify({
        next_message: 'Thanks for the update—what is your asking price and preferred closing timeline?',
        lead_fields: {},
        lead_score: 8,
        priority: 'COLD',
        pipeline_stage: 'ENGAGED_PREQUAL',
        internal_note: 'Mock LLM response used because OPENAI_API_KEY is missing.',
        needs_human: false
      });
    }
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.llm.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.llm.model,
        input: prompt,
        temperature: 0.2
      })
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    const json = await res.json() as any;
    return json.output_text ?? '';
  }

  private parse(raw: string): LLMDecision | null {
    try {
      const object = JSON.parse(raw);
      return schema.parse(object);
    } catch {
      return null;
    }
  }
}
