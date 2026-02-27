export const config = {
  port: Number(process.env.PORT ?? 3000),
  hotThreshold: Number(process.env.HOT_THRESHOLD ?? 24),
  marketMode: process.env.MARKET_MODE ?? 'HOUSTON_KATY',
  llm: {
    provider: process.env.LLM_PROVIDER ?? 'openai',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY ?? ''
  },
  scoringWeights: {
    motivation: Number(process.env.WEIGHT_MOTIVATION ?? 2),
    distress: Number(process.env.WEIGHT_DISTRESS ?? 2),
    timeline: Number(process.env.WEIGHT_TIMELINE ?? 2),
    priceFlex: Number(process.env.WEIGHT_PRICE_FLEX ?? 1)
  },
  crm: {
    adapter: process.env.CRM_ADAPTER ?? 'mock',
    baseUrl: process.env.GHL_BASE_URL ?? 'https://rest.gohighlevel.com/v1',
    apiKey: process.env.GHL_API_KEY ?? '',
    locationId: process.env.GHL_LOCATION_ID ?? ''
  },
  sms: {
    adapter: process.env.SMS_ADAPTER ?? 'mock',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? ''
  },
  dbPath: process.env.DB_PATH ?? './mai-va.sqlite'
};
