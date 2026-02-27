import { describe, it, expect } from 'vitest';
import { canMoveStage } from '../src/domain/stateMachine';

describe('pipeline state machine', () => {
  it('allows NEW_UNQUALIFIED -> ENGAGED_PREQUAL', () => {
    expect(canMoveStage('NEW_UNQUALIFIED', 'ENGAGED_PREQUAL')).toBe(true);
  });

  it('blocks DEAD_DNC -> ENGAGED_PREQUAL', () => {
    expect(canMoveStage('DEAD_DNC', 'ENGAGED_PREQUAL')).toBe(false);
  });
});
