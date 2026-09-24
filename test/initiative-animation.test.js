// Job 3 (initiative reveal animation): "the first time a player opens the
// Combat tab in a given fight... Once seen, it doesn't replay for that
// fight — record that per character." shouldAnimateInitiative is the
// pure decision behind that — the actual animation is cosmetic DOM-only
// JS in main.js (see runInitiativeAnimation), not covered by a test per
// this project's "UI wiring doesn't need a test" convention.
import { describe, it, expect } from 'vitest';
import { shouldAnimateInitiative } from '../src/combat.js';

describe('shouldAnimateInitiative', () => {
  const activeCombat = { is_active: true, started_at: 12345 };

  it('is true the first time — nothing set yet on the character', () => {
    expect(shouldAnimateInitiative({}, activeCombat)).toBe(true);
  });

  it('is true when the character has seen a DIFFERENT fight', () => {
    expect(shouldAnimateInitiative({ seen_initiative_for: 999 }, activeCombat)).toBe(true);
  });

  it('is false once the character has seen THIS fight', () => {
    expect(shouldAnimateInitiative({ seen_initiative_for: 12345 }, activeCombat)).toBe(false);
  });

  it('is false when there is no active combat', () => {
    expect(shouldAnimateInitiative({}, null)).toBe(false);
    expect(shouldAnimateInitiative({}, { is_active: false, started_at: 12345 })).toBe(false);
  });

  it('is false when the combat carries no started_at (predates this field)', () => {
    expect(shouldAnimateInitiative({}, { is_active: true })).toBe(false);
  });
});
