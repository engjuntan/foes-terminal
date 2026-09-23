// Endurance (and other SPECIAL) saves, shared by poison damage and by
// attack-applied status effects (Screech's Ears Ringing). See
// SCOPE_DECISIONS.md "Heist economics, Faiz, and the Beruk (2026-09-23)":
// a Screech is "on a failed Endurance difficulty check, -2 PER for 1
// turn", and "poison attacks use the same shape... an Endurance
// difficulty check, not an ad-hoc roll".
import { describe, it, expect } from 'vitest';
import { resolveCombatantSave } from '../src/combat.js';

const pcCharacters = {
  survivor: { special: { str: 5, per: 5, end: 7, cha: 5, int: 5, agi: 5, luk: 5 } }
};

describe('resolveCombatantSave — PC', () => {
  it('succeeds when the roll is at or under the stat (Normal tier, no modifier)', () => {
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'survivor' }, pcCharacters, 7);
    expect(result).toMatchObject({ stat: 'end', statValue: 7, tier: 'normal', threshold: 7, success: true, roll: 7 });
  });

  it('fails when the roll is over the stat', () => {
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'survivor' }, pcCharacters, 8);
    expect(result.success).toBe(false);
  });

  it('reads the stat through deriveCharacter, not the raw character doc', () => {
    // Radiation sickness at 200 rads docks -2 END (formulas.js's rad
    // tier table) — the save has to see that lowered value, not the
    // character's base 7.
    const irradiated = { irradiated: { special: { str: 5, per: 5, end: 7, cha: 5, int: 5, agi: 5, luk: 5 }, rads: 200 } };
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'irradiated' }, irradiated, 6);
    expect(result.statValue).toBe(5);
    expect(result.success).toBe(false); // roll 6 > threshold 5
  });

  it('applies a harder tier as a negative modifier on the threshold', () => {
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'survivor' }, pcCharacters, 6, 'end', 'difficult');
    // Difficult: specialMod -2 -> threshold 7 - 2 = 5
    expect(result.threshold).toBe(5);
    expect(result.success).toBe(false);
  });

  it('defaults to the END stat and the Normal tier when neither is given', () => {
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'survivor' }, pcCharacters, 7);
    expect(result.stat).toBe('end');
    expect(result.tier).toBe('normal');
  });

  it('a natural 1 is a critical success even over the threshold', () => {
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'survivor' }, pcCharacters, 1, 'end', 'nearly_impossible');
    expect(result.success).toBe(true);
    expect(result.critType).toBe('success');
  });

  it('a natural 10 is a critical failure even under the threshold', () => {
    const result = resolveCombatantSave({ ref_type: 'pc', char_id: 'survivor' }, pcCharacters, 10);
    expect(result.success).toBe(false);
    expect(result.critType).toBe('fail');
  });
});

describe('resolveCombatantSave — monster', () => {
  it('reads the stat off the combat instance\'s own special block', () => {
    const result = resolveCombatantSave({ ref_type: 'monster', special: { end: 6 } }, {}, 6);
    expect(result.statValue).toBe(6);
    expect(result.success).toBe(true);
  });

  it('falls back to the bestiary entry when the instance has no special block (older combat instance)', () => {
    // Ibu Beruk's bestiary END is 6 (src/bestiary.js).
    const result = resolveCombatantSave({ ref_type: 'monster', source_id: 'ibu_beruk', special: {} }, {}, 7);
    expect(result.statValue).toBe(6);
    expect(result.success).toBe(false); // roll 7 > threshold 6
  });

  it('treats a monster with no SPECIAL data at all as stat 0 rather than throwing', () => {
    const result = resolveCombatantSave({ ref_type: 'monster', source_id: 'nonexistent_monster' }, {}, 5);
    expect(result.statValue).toBe(0);
    expect(result.success).toBe(false);
  });
});
