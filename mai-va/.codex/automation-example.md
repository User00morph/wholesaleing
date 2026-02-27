# Codex Automation Example: Daily Brief

Create a daily automation in Codex app:

- **Schedule**: 7:00 AM local time, every day
- **Working directory**: repository root (`mai-va`)
- **Command**:

```bash
npm run daily-brief
```

- **Destination**: Slack/email/notes as markdown output
- **Optional pre-step**: `npm run worker` to send due follow-ups before generating brief.
