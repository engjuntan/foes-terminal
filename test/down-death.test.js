// The down/up/dead state machine (GM's live-session notes, 2026-09-24):
// 0 HP is "down", not dead — each of a downed combatant's turns rolls an
// Endurance check to stand back up; two failures in a row is permanent
// death; a success resets the failure count. Exercised through the pure
// helper controllers.js's endTurn() calls (resolveDownedRecovery takes
// the ALREADY-ROLLED save result, same shape resolveCombatantSave
// returns — the roll itself is covered by test/saves.test.js).
import { describe, it, expect } from 'vitest';
import { resolveDownedRecovery, clampReviveHp } from '../src/combat.js';

describe('resolveDownedRecovery', () => {
  it('revives on a successful roll, with the streak reset to 0', () => {
    const result = resolveDownedRecovery(true, 0);
    expect(result).toEqual({ revived: true, dies: false, nextFailStreak: 0 });
  });

  it('resets the streak to 0 on success even if it was already at 1 (one prior failure)', () => {
    const result = resolveDownedRecovery(true, 1);
    expect(result.nextFailStreak).toBe(0);
    expect(result.revived).toBe(true);
  });

  it('a first failure (nothing set yet) does not kill — streak becomes 1', () => {
    const result = resolveDownedRecovery(false, 0);
    expect(result).toEqual({ revived: false, dies: false, nextFailStreak: 1 });
  });

  it('treats a missing prior streak the same as 0 on a failure', () => {
    const result = resolveDownedRecovery(false, undefined);
    expect(result).toEqual({ revived: false, dies: false, nextFailStreak: 1 });
  });

  it('a second failure in a row is permanent death', () => {
    const result = resolveDownedRecovery(false, 1);
    expect(result).toEqual({ revived: false, dies: true, nextFailStreak: 2 });
  });

  it('a failure after an already-broken streak keeps counting (still dead)', () => {
    // Defensive — dies should already be true once nextFailStreak hits 2,
    // and a dead character never gets rolled for again in practice, but
    // the math itself shouldn't do anything surprising if it ever is.
    const result = resolveDownedRecovery(false, 2);
    expect(result.dies).toBe(true);
    expect(result.nextFailStreak).toBe(3);
  });
});

describe('clampReviveHp', () => {
  it('passes a normal in-range value through unchanged', () => {
    expect(clampReviveHp(15, 30)).toBe(15);
  });

  it('clamps above max down to max', () => {
    expect(clampReviveHp(999, 30)).toBe(30);
  });

  it('clamps 0 or negative up to 1 — a revive always leaves someone at LEAST 1 HP', () => {
    expect(clampReviveHp(0, 30)).toBe(1);
    expect(clampReviveHp(-5, 30)).toBe(1);
  });

  it('defaults to 1 HP when the GM leaves the field blank or types garbage', () => {
    expect(clampReviveHp('', 30)).toBe(1);
    expect(clampReviveHp('abc', 30)).toBe(1);
    expect(clampReviveHp(undefined, 30)).toBe(1);
  });

  it('rounds a fractional value', () => {
    expect(clampReviveHp(12.6, 30)).toBe(13);
  });

  it('falls back to a max of 1 when maxHp itself is missing (nothing set yet)', () => {
    expect(clampReviveHp(50, undefined)).toBe(1);
  });
});

