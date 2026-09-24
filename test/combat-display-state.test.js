// The Combat tab has exactly three things it can show: nothing has ever
// happened, a fight is live right now, or the last fight just ended and
// should stay on screen (GM ruling: "the last combat should stay
// readable after it ends"). getCombatDisplayState is the pure decision
// behind that — endCombat() (controllers.js) never clears active_combat,
// it only flips is_active false, specifically so this can tell "finished"
// apart from "never happened".
import { describe, it, expect } from 'vitest';
import { getCombatDisplayState } from '../src/combat.js';

describe('getCombatDisplayState', () => {
  it('is "none" when no combat has ever happened', () => {
    expect(getCombatDisplayState(undefined)).toBe('none');
    expect(getCombatDisplayState(null)).toBe('none');
  });

  it('is "live" while a fight is active', () => {
    expect(getCombatDisplayState({ is_active: true })).toBe('live');
  });

  it('is "finished" once endCombat has flipped is_active false', () => {
    expect(getCombatDisplayState({ is_active: false })).toBe('finished');
  });

  it('treats an old combat record with no is_active field at all as finished, not live', () => {
    expect(getCombatDisplayState({ round: 3 })).toBe('finished');
  });
});
