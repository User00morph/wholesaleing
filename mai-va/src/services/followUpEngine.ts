import { run, all } from '../db/sqlite';

export function scheduleOffsetsByPriority(priority: 'WARM' | 'COLD'): number[] {
  return priority === 'WARM' ? [7, 14, 21, 28] : [7, 14, 30, 60];
}

export async function queueFollowUps(leadId: string, phone: string, priority: 'WARM' | 'COLD'): Promise<void> {
  const offsets = scheduleOffsetsByPriority(priority);
  for (const days of offsets) {
    const due = new Date();
    due.setDate(due.getDate() + days);
    await run(
      'INSERT INTO followups (lead_id, phone, body, due_at, sent) VALUES (?, ?, ?, ?, 0)',
      [leadId, phone, 'Checking in—are you still open to discussing an offer on your property?', due.toISOString()]
    );
  }
}

export async function dueFollowUps(): Promise<Array<{ id: number; phone: string; body: string; lead_id: string }>> {
  return all('SELECT id, phone, body, lead_id FROM followups WHERE sent = 0 AND due_at <= ?', [new Date().toISOString()]);
}

export async function markFollowUpSent(id: number): Promise<void> {
  await run('UPDATE followups SET sent = 1 WHERE id = ?', [id]);
}
