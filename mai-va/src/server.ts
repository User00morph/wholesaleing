import 'dotenv/config';
import express from 'express';
import { config } from './config/config';
import { initDb } from './db/sqlite';
import { MockCRMClient } from './adapters/crm';
import { GoHighLevelCRMClient } from './adapters/ghlAdapter';
import { MockSMSClient } from './adapters/sms';
import { TwilioSMSClient } from './adapters/twilioAdapter';
import { LLMRouter } from './brain/llmRouter';
import { LeadService } from './services/leadService';

async function bootstrap(): Promise<void> {
  await initDb();
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const crm = config.crm.adapter === 'ghl' ? new GoHighLevelCRMClient() : new MockCRMClient();
  const sms = config.sms.adapter === 'twilio' ? new TwilioSMSClient() : new MockSMSClient();
  const leadService = new LeadService(crm, sms, new LLMRouter());

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'M.A.I-VA' }));

  app.post('/webhooks/sms/inbound', async (req, res) => {
    const result = await leadService.processInbound(req.body);
    const humanSummary = result.lead.priority === 'HOT'
      ? {
          for: 'Morph',
          one_screen_summary: {
            lead_id: result.lead.id,
            phone: result.lead.phone,
            score: result.lead.score,
            stage: result.lead.stage,
            fields: result.lead.fields
          }
        }
      : null;
    res.json({ ok: true, outbound_message: result.outbound, lead: result.lead, human_summary: humanSummary });
  });

  app.post('/webhooks/sms/status', async (req, res) => {
    await leadService.handleStatus(req.body);
    res.json({ ok: true });
  });

  app.post('/webhooks/crm/event', async (req, res) => {
    await leadService.handleCrmEvent(req.body);
    res.json({ ok: true });
  });

  app.listen(config.port, () => {
    console.log(`M.A.I-VA listening on :${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
