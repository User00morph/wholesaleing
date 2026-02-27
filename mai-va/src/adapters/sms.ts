export interface ParsedInbound {
  from: string;
  to?: string;
  body: string;
  messageId?: string;
  raw: unknown;
}

export interface SMSClient {
  sendMessage(to: string, body: string): Promise<{ providerId?: string }>;
  parseInboundWebhook(payload: any): ParsedInbound;
}

export class MockSMSClient implements SMSClient {
  public outboundLog: Array<{ to: string; body: string }> = [];

  async sendMessage(to: string, body: string): Promise<{ providerId?: string }> {
    this.outboundLog.push({ to, body });
    console.log(`[MockSMS] -> ${to}: ${body}`);
    return { providerId: `mock-${Date.now()}` };
  }

  parseInboundWebhook(payload: any): ParsedInbound {
    return {
      from: payload.from || payload.From,
      to: payload.to || payload.To,
      body: payload.body || payload.Body,
      messageId: payload.messageId || payload.MessageSid,
      raw: payload
    };
  }
}
