import { config } from '../config/config';
import { ParsedInbound, SMSClient } from './sms';

export class TwilioSMSClient implements SMSClient {
  async sendMessage(to: string, body: string): Promise<{ providerId?: string }> {
    if (!config.sms.twilioAccountSid || !config.sms.twilioAuthToken || !config.sms.twilioFromNumber) {
      console.log('[TwilioSMSClient] Missing credentials; send stubbed.', { to, body });
      return { providerId: undefined };
    }

    const auth = Buffer.from(`${config.sms.twilioAccountSid}:${config.sms.twilioAuthToken}`).toString('base64');
    const payload = new URLSearchParams({ To: to, From: config.sms.twilioFromNumber, Body: body });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.sms.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
      }
    );
    if (!res.ok) throw new Error(`Twilio error ${res.status}: ${await res.text()}`);
    const json = await res.json() as { sid: string };
    return { providerId: json.sid };
  }

  parseInboundWebhook(payload: any): ParsedInbound {
    return {
      from: payload.From,
      to: payload.To,
      body: payload.Body,
      messageId: payload.MessageSid,
      raw: payload
    };
  }
}
