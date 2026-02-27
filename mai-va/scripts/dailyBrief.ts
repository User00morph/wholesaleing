import 'dotenv/config';
import { initDb, all } from '../src/db/sqlite';

async function main(): Promise<void> {
  await initDb();
  const hot = await all('SELECT id, phone, score, stage FROM leads WHERE priority = ? AND date(updated_at) = date(?)', ['HOT', new Date().toISOString()]);
  const offers = await all('SELECT id, phone, score, stage FROM leads WHERE stage = ?', ['OFFER_SENT']);
  const underContract = await all('SELECT id, phone, score, stage FROM leads WHERE stage = ?', ['UNDER_CONTRACT']);

  console.log(`# M.A.I-VA Daily Brief (${new Date().toISOString().slice(0, 10)})\n`);
  console.log('## HOT leads today');
  hot.forEach((x: any) => console.log(`- ${x.id} | ${x.phone} | score ${x.score} | ${x.stage}`));
  if (!hot.length) console.log('- None');

  console.log('\n## Offers awaiting response');
  offers.forEach((x: any) => console.log(`- ${x.id} | ${x.phone} | score ${x.score}`));
  if (!offers.length) console.log('- None');

  console.log('\n## Under-contract pipeline');
  underContract.forEach((x: any) => console.log(`- ${x.id} | ${x.phone} | score ${x.score}`));
  if (!underContract.length) console.log('- None');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
