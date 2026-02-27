import { describe, it, expect } from 'vitest';
import { deriveSignalInputs, scoreLead } from '../src/domain/scoring';

describe('scoreLead', () => {
  it('marks strong signals as HOT', () => {
    const inputs = deriveSignalInputs({ owner_confirmed: true, condition_score: 2, timeline: '0-30', asking_price: 100000 });
    const result = scoreLead(inputs, { motivation: 2, distress: 2, timeline: 2, priceFlex: 1 }, 24);
    expect(result.priority).toBe('HOT');
    expect(result.score).toBeGreaterThanOrEqual(24);
  });
});
