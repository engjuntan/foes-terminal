// Poison damage and attack-applied status effects, both routed through
// the same Endurance-difficulty-check shape (SCOPE_DECISIONS.md "Heist
// economics, Faiz, and the Sakai (2026-09-23)": a Screech is "on a
// failed Endurance difficulty check, -2 PER for 1 turn", and "poison
// attacks use the same shape... an Endurance difficulty check, not an
// ad-hoc roll"). Exercised through computeAttackResolution() itself
// (exported specifically because it's Firestore-free and pure — see its
// own header comment in controllers.js) rather than re-testing the save
// math, which test/saves.test.js already covers directly.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { computeAttackResolution } from '../src/controllers.js';

afterEach(() => {
  vi.restoreAllMocks();
  delete global.window;
  delete global.alert;
});

// A no-armor, unmodified PC with END 7 — a rollD10() of 1-7 saves,
// 8-10 fails (natural 10 always fails regardless, by the SPECIAL check's
// own crit rule).
function makeTarget() {
  const rook = {
    name: 'Rook',
    special: { str: 5, per: 5, end: 7, cha: 5, int: 5, agi: 5, luk: 5 },
    hp: { current: 50, max: 50 },
    equipment: {}, inventory: {}, condition: {}, status_effects: [], stance: 'standing'
  };
  global.window = { liveData: { characters: { rook } } };
  global.alert = () => {};
  return { char: rook, combatant: { ref_type: 'pc', combatant_id: 't1', char_id: 'rook', name: 'Rook', cover: 'none', stance: 'standing' } };
}

function makeAttacker(attackOverrides) {
  return {
    ref_type: 'monster', combatant_id: 'm1', name: 'Poison Bug', crit_chance: 0, stance: 'standing',
    attacks: [{ name: 'Bite', hit_percent: 100, action: 'Poison', damage: '10', dmgType: 'poison', ...attackOverrides }]
  };
}

const makeCombat = (attacker, target) => ({ initiative_order: [attacker, target], log: [] });
const draft = { attackKey: 'Bite', bodyPart: 'torso' };

describe('poison damage — Endurance save', () => {
  it('halves damage on a successful END save', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0); // rollD10() -> 1, saves against END 7
    const attacker = makeAttacker();
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, draft, 1); // roll=1 -> hits (AC 5)
    expect(resolved.message).toMatch(/resists the poison/i);
    expect(resolved.charUpdates['characters.rook.hp.current']).toBe(45); // 50 - floor(10/2)
  });

  it('deals full damage on a failed END save', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // rollD10() -> 10, natural-10 auto-fail
    const attacker = makeAttacker();
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, draft, 1);
    expect(resolved.message).toMatch(/fails to resist the poison/i);
    expect(resolved.charUpdates['characters.rook.hp.current']).toBe(40); // 50 - 10, no halving
  });

  it('honors a custom save shape carried on the attack (harder tier, different stat label)', () => {
    const { combatant: target } = makeTarget();
    // rollD10() -> 6 with Math.random 0.5; Difficult tier is -2, so the
    // threshold becomes END 7 - 2 = 5. Roll 6 fails against 5, where it
    // would have succeeded against Normal's un-modified 7.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const attacker = makeAttacker({ save: { stat: 'end', tier: 'difficult' } });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, draft, 1);
    expect(resolved.message).toMatch(/fails to resist the poison/i);
    expect(resolved.charUpdates['characters.rook.hp.current']).toBe(40);
  });
});

describe('attack-applied effects — "on": "save_failed" (Screech / Ears Ringing shape)', () => {
  it('grants the effect on a failed save', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // rollD10() -> 10, auto-fail
    const attacker = makeAttacker({
      damage: '0', dmgType: 'true', name: 'Screech', action: 'SM',
      save: { stat: 'end', tier: 'normal' },
      apply_effect: { id: 'ears_ringing', duration_turns: 1, on: 'save_failed' }
    });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, attackKey: 'Screech' }, 1);
    const effects = resolved.charUpdates['characters.rook.status_effects'];
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ source_id: 'ears_ringing', duration_turns: 1 });
    expect(resolved.message).toMatch(/afflicted by Ears Ringing/i);
  });

  it('does not grant the effect on a successful save', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0); // rollD10() -> 1, saves against END 7
    const attacker = makeAttacker({
      damage: '0', dmgType: 'true', name: 'Screech', action: 'SM',
      save: { stat: 'end', tier: 'normal' },
      apply_effect: { id: 'ears_ringing', duration_turns: 1, on: 'save_failed' }
    });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, attackKey: 'Screech' }, 1);
    expect(resolved.charUpdates['characters.rook.status_effects']).toBeUndefined();
    expect(resolved.message).toMatch(/resists Screech/i);
  });

  it('defaults to an END/Normal save when the attack carries no "save" of its own', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // rollD10() -> 10, auto-fail
    const attacker = makeAttacker({
      damage: '0', dmgType: 'true', name: 'Screech', action: 'SM',
      apply_effect: { id: 'ears_ringing', duration_turns: 1, on: 'save_failed' }
    });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, attackKey: 'Screech' }, 1);
    expect(resolved.charUpdates['characters.rook.status_effects']).toHaveLength(1);
  });
});

describe('attack-applied effects — "on": "hit" (no save)', () => {
  it('applies unconditionally once the attack connects, without rolling a save', () => {
    const { combatant: target } = makeTarget();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); // would save if rolled — proves no roll happens
    const attacker = makeAttacker({
      damage: '0', dmgType: 'true', name: 'Spores', action: 'SM',
      apply_effect: { id: 'blinded', duration_turns: 2, on: 'hit' }
    });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, attackKey: 'Spores' }, 1);
    const effects = resolved.charUpdates['characters.rook.status_effects'];
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ source_id: 'blinded', duration_turns: 2 });
    expect(resolved.message).not.toMatch(/save/i);
    randomSpy.mockRestore();
  });
});

describe('zero-damage, effect-only attacks (Screech shape)', () => {
  it('reads sensibly on a hit — no "misses completely", no numeric damage line', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const attacker = makeAttacker({
      damage: '0', dmgType: 'true', name: 'Screech', action: 'SM',
      apply_effect: { id: 'ears_ringing', duration_turns: 1, on: 'save_failed' }
    });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, attackKey: 'Screech' }, 1);
    expect(resolved.message).not.toMatch(/misses completely/i);
    expect(resolved.message).not.toMatch(/\d+ damage/i);
    expect(resolved.message).toMatch(/reaches Rook/i);
  });

  it('still spends the turn (turn_acted set) even though nothing gets hurt', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const attacker = makeAttacker({
      damage: '0', dmgType: 'true', name: 'Screech', action: 'SM',
      apply_effect: { id: 'ears_ringing', duration_turns: 1, on: 'save_failed' }
    });
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, attackKey: 'Screech' }, 1);
    expect(resolved.updatedCombat.turn_acted).toBe(true);
    expect(resolved.updatedCombat.log).toHaveLength(1);
  });
});
