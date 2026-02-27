import 'dotenv/config';
import { config } from '../src/config/config';
import { initDb } from '../src/db/sqlite';
import { MockSMSClient } from '../src/adapters/sms';
import { TwilioSMSClient } from '../src/adapters/twilioAdapter';
import { dueFollowUps, markFollowUpSent } from '../src/services/followUpEngine';

async function main(): Promise<void> {
  await initDb();
  const sms = config.sms.adapter === 'twilio' ? new TwilioSMSClient() : new MockSMSClient();
  const due = await dueFollowUps();

  for (const task of due) {
    await sms.sendMessage(task.phone, task.body);
    await markFollowUpSent(task.id);
    console.log(`Sent follow-up ${task.id} to ${task.phone}`);
  }

  console.log(`Done. Processed ${due.length} follow-ups.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
