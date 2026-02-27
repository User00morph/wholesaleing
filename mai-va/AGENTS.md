# AGENTS.md (mai-va)

## Purpose
This repository runs M.A.I-VA, an AI assistant for real-estate wholesaling lead intake and workflow automation.

## Safe commands
- Install deps: `npm install`
- Run server: `npm run dev`
- Run worker: `npm run worker`
- Build: `npm run build`
- Test: `npm test`
- Daily brief: `npm run daily-brief`

## Do not break
- Webhook contract paths:
  - `POST /webhooks/sms/inbound`
  - `POST /webhooks/sms/status`
  - `POST /webhooks/crm/event`
  - `GET /health`
- JSON output contract from `LLMRouter`:
  `{ next_message, lead_fields, lead_score, priority, pipeline_stage, internal_note, needs_human }`
- Pipeline stage names in `src/types/domain.ts`
- Guardrails in `src/brain/llmRouter.ts`

## Dev notes
- Keep HOT-lead routing to Morph one-screen summary intact.
- Keep adapter pattern: interfaces + mock + real-adapter skeleton.
- Prefer adding tests for any scoring/state-machine behavior changes.
