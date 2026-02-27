# M.A.I-VA (Market Acquisition Intelligence – Virtual Assistant)

AI entity for real-estate wholesaling that automates seller lead intake, qualification, scoring, follow-up, and CRM stage updates.

## Features
- **Webhook server**
  - `POST /webhooks/sms/inbound`
  - `POST /webhooks/sms/status`
  - `POST /webhooks/crm/event`
  - `GET /health`
- **AI Brain** (`LLMRouter`) with JSON-contract validation + one retry on invalid JSON.
- **Qualification + scoring** with configurable weights and HOT threshold.
- **Pipeline state machine** for all required stages.
- **CRM adapter pattern**
  - `MockCRMClient`
  - `GoHighLevelCRMClient` skeleton (REST + env vars)
- **SMS adapter pattern**
  - `MockSMSClient`
  - `TwilioSMSClient` skeleton
- **Follow-up engine**
  - WARM: weekly for 4 weeks
  - COLD: day 7, 14, 30, 60
- **SQLite persistence** for leads, logs, messages, follow-ups.
- **Daily brief script** for Codex automations.

## Market Modes
- `MARKET_MODE=HOUSTON_KATY` (ZIP-focused)
- `MARKET_MODE=REMOTE` (market tags)

## Guardrails
- Never claims legal or licensed-agent authority.
- Concise, respectful, non-coercive messaging.
- No deception or fabricated facts.
- Asks follow-up questions when data is missing.

## Setup
```bash
cp .env.example .env
npm install
npm run dev
```

### Docker
```bash
docker compose up --build
```

## Environment Variables
See `.env.example`.

Key toggles:
- `CRM_ADAPTER=mock|ghl`
- `SMS_ADAPTER=mock|twilio`
- `HOT_THRESHOLD=24`

## Switch Mock -> Real Adapters
- **CRM (GoHighLevel)**:
  - Set `CRM_ADAPTER=ghl`
  - Provide `GHL_API_KEY` and `GHL_LOCATION_ID`
- **SMS (Twilio)**:
  - Set `SMS_ADAPTER=twilio`
  - Provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

If credentials are missing, adapters safely stub requests and log warnings.

## Run worker + daily brief
```bash
npm run worker
npm run daily-brief
```

## Unit tests
```bash
npm test
```

## Demo (Mock clients)
1) Start server
```bash
npm run dev
```

2) Inbound SMS simulation
```bash
curl -X POST http://localhost:3000/webhooks/sms/inbound \
  -H 'Content-Type: application/json' \
  -d '{
    "from":"+17135551212",
    "body":"Yes I own 123 Main St in Katy 77449. It is vacant and needs roof repairs. Want to sell in 30 days."
  }'
```

3) SMS status simulation
```bash
curl -X POST http://localhost:3000/webhooks/sms/status \
  -H 'Content-Type: application/json' \
  -d '{"leadId":"lead_123","status":"delivered"}'
```

4) CRM event simulation
```bash
curl -X POST http://localhost:3000/webhooks/crm/event \
  -H 'Content-Type: application/json' \
  -d '{"leadId":"lead_123","event":"moved_to_offer_sent"}'
```

5) View logs/state in SQLite (example)
```bash
sqlite3 mai-va.sqlite 'select id, phone, stage, score, priority, updated_at from leads;'
sqlite3 mai-va.sqlite 'select id, lead_id, event_type, created_at from logs order by id desc limit 20;'
```

## Twilio payload examples
Inbound webhook (Twilio -> `/webhooks/sms/inbound`):
```x-www-form-urlencoded
From=+17135550000
To=+18325550000
Body=I can sell my house in 2 months
MessageSid=SMxxxxxxxx
```

Delivery status callback (`/webhooks/sms/status` example normalized):
```json
{ "leadId": "lead_123", "status": "delivered", "MessageSid": "SMxxxxxxxx" }
```

## Morph one-screen HOT summary
When a lead is `HOT`, `/webhooks/sms/inbound` response includes:
```json
{
  "human_summary": {
    "for": "Morph",
    "one_screen_summary": {
      "lead_id": "...",
      "phone": "...",
      "score": 29,
      "stage": "HOT_CALL_NOW",
      "fields": { "address": "...", "timeline": "0-30" }
    }
  }
}
```

## Codex automation-ready daily brief
See `.codex/automation-example.md`.
