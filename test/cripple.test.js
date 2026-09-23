// The cripple system: hit counters accumulating against limbResistance
// (EN/2), a crit bypassing the counter outright, counters persisting
// through rest/time-advance (STATUS_AND_CRIPPLE_SPEC.md B.5's "never
// resets on their own" ruling), and both treatment routes (B.6).
import { describe, it, expect, vi, afterEach } from 'vitest';

// advanceTime writes through Firestore's updateDoc — mocked so the
// "counters survive a rest/time advance" tests can inspect exactly what
// got written without touching a real project, same reasoning as every
// other Firestore-free test in this suite (see attack-saves.test.js's
// own header comment), just one layer further out since advanceTime
// itself isn't split into a pure/impure half the way computeAttackResolution
// and computeLimbTreatment are.
const updateDocMock = vi.fn(async () => {});
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  updateDoc: (...args) => updateDocMock(...args),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  deleteField: vi.fn(() => '__deleteField__'),
  onSnapshot: vi.fn()
}));
vi.mock('../src/firebase.js', () => ({ db: {} }));

const { computeAttackResolution, computeLimbTreatment, advanceTime } = await import('../src/controllers.js');

afterEach(() => {
  vi.restoreAllMocks();
  updateDocMock.mockClear();
  delete global.window;
  delete global.alert;
});

// END 4 -> limbResistance floor(4/2) = 2: two hits to cripple.
function makeTarget(overrides = {}) {
  const rook = {
    name: 'Rook',
    special: { str: 5, per: 5, end: 4, cha: 5, int: 5, agi: 5, luk: 5 },
    hp: { current: 50, max: 50 },
    equipment: {}, inventory: {}, condition: {}, status_effects: [], limb_damage: {}, stance: 'standing',
    ...overrides
  };
  global.window = { liveData: { characters: { rook } } };
  global.alert = () => {};
  return { char: rook, combatant: { ref_type: 'pc', combatant_id: 't1', char_id: 'rook', name: 'Rook', cover: 'none', stance: 'standing' } };
}

// Guaranteed hit (AC 5, this attack's effective chance 75), no crit
// unless the test overrides crit_chance.
function makeAttacker(overrides = {}) {
  return {
    ref_type: 'monster', combatant_id: 'm1', name: 'Raider', crit_chance: 0, stance: 'standing',
    attacks: [{ name: 'Bite', hit_percent: 100, action: 'Melee', damage: '1d4', dmgType: 'normal' }],
    ...overrides
  };
}

const makeCombat = (attacker, target) => ({ initiative_order: [attacker, target], log: [] });
const draft = { attackKey: 'Bite', bodyPart: 'left_arm' };

describe('cripple counters — B.2-B.4', () => {
  it('a hit that does not reach limbResistance leaves the limb un-crippled and reports the count', () => {
    const { combatant: target } = makeTarget();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const attacker = makeAttacker();
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, draft, 1);
    expect(resolved.message).toMatch(/takes a hard hit\. \(1\/2\)/);
    expect(resolved.charUpdates['characters.rook.limb_damage']).toEqual({ left_arm: 1 });
    expect(resolved.charUpdates['characters.rook.status_effects']).toBeUndefined();
  });

  it('a hit that reaches limbResistance cripples the limb and clears the counter', () => {
    const { combatant: target } = makeTarget({ limb_damage: { left_arm: 1 } });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const attacker = makeAttacker();
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, draft, 1);
    expect(resolved.message).toMatch(/left arm is crippled!/i);
    expect(resolved.charUpdates['characters.rook.limb_damage']).toEqual({}); // key deleted, never a stored 0
    const effects = resolved.charUpdates['characters.rook.status_effects'];
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ source_id: 'crippled_arm', name: 'Crippled Arm' });
  });

  it('tracks left and right arm as separate counters', () => {
    const { combatant: target } = makeTarget({ limb_damage: { left_arm: 1 } });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const attacker = makeAttacker();
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, { ...draft, bodyPart: 'right_arm' }, 1);
    expect(resolved.charUpdates['characters.rook.limb_damage']).toEqual({ left_arm: 1, right_arm: 1 });
  });

  it('a monster target falls back to Limb Resistance 2 when the bestiary has no SPECIAL block', () => {
    const attacker = makeAttacker();
    const monsterTarget = {
      ref_type: 'monster', combatant_id: 'mt1', name: 'Giant Rat', source_id: 'nonexistent_monster',
      ac: 0, dtdr: {}, hp: { current: 20, max: 20 }, status_effects: [], limb_damage: { left_leg: 1 },
      stance: 'standing', cover: 'none', special: {}
    };
    global.window = { liveData: { characters: {} } };
    global.alert = () => {};
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const resolved = computeAttackResolution(makeCombat(attacker, monsterTarget), attacker, monsterTarget, { attackKey: 'Bite', bodyPart: 'left_leg' }, 1);
    expect(resolved.message).toMatch(/left leg is crippled!/i);
    const monsterEntry = resolved.updatedCombat.initiative_order.find(c => c.combatant_id === 'mt1');
    expect(monsterEntry.limb_damage).toEqual({});
    expect(monsterEntry.status_effects[0]).toMatchObject({ source_id: 'crippled_leg' });
  });

  it('a critical success bypasses the counter entirely — no increment, no cripple message', () => {
    const { combatant: target } = makeTarget();
    // Every Math.random() call returns 0: rollD10() (crit table roll) -> 1
    // ("Nothing extra — a clean hit", CRIT_SUCCESS_TABLE entry 1).
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const attacker = makeAttacker({ crit_chance: 50 }); // capped crit chance, so roll 1 is a crit success
    const resolved = computeAttackResolution(makeCombat(attacker, target), attacker, target, draft, 1);
    expect(resolved.message).toMatch(/CRITICAL SUCCESS/);
    expect(resolved.message).not.toMatch(/hard hit|crippled/i);
    expect(resolved.charUpdates['characters.rook.limb_damage']).toBeUndefined();
  });
});

describe('counters persist — B.5 (never reset on their own)', () => {
  function liveDataWithLimbDamage() {
    return {
      characters: {
        rook: {
          name: 'Rook', is_finalized: true,
          special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
          hp: { current: 30, max: 40 }, needs: { hunger: 80, thirst: 80, sleep: 80 },
          limb_damage: { left_arm: 1 }, status_effects: [], perks: []
        }
      },
      world: { minutes: 480 }, messages: [], active_combat: null
    };
  }

  it('a time advance never writes to limb_damage', async () => {
    global.window = { liveData: liveDataWithLimbDamage() };
    global.alert = () => {};
    await advanceTime(120, { initiatedBy: 'GM' });
    expect(updateDocMock).toHaveBeenCalledTimes(1);
    const payload = updateDocMock.mock.calls[0][1];
    expect(Object.keys(payload).some(k => k.includes('limb_damage'))).toBe(false);
  });

  it('a rest (isRest: true, long enough to reset Sleep) never writes to limb_damage', async () => {
    global.window = { liveData: liveDataWithLimbDamage() };
    global.alert = () => {};
    await advanceTime(8 * 60, { isRest: true, initiatedBy: 'Rook' });
    const payload = updateDocMock.mock.calls[0][1];
    expect(Object.keys(payload).some(k => k.includes('limb_damage'))).toBe(false);
    // Sanity: the rest itself did go through (Sleep restored to 100).
    expect(payload['characters.rook.needs'].sleep).toBe(100);
  });
});

describe('limb treatment — B.6', () => {
  // per 5 + int 5 -> Medicine 10 (formulas.js: medicine = int + per).
  function makeHealer(overrides = {}) {
    return {
      name: 'Doc', special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
      inventory: {}, ...overrides
    };
  }
  function makeCrippledTarget(overrides = {}) {
    return {
      name: 'Rook', hp: { current: 20, max: 40 },
      limb_damage: { left_arm: 2 },
      status_effects: [{ id: 'fx1', source_id: 'crippled_arm', name: 'Crippled Arm', modifiers: { skill_small_guns: -10 } }],
      ...overrides
    };
  }

  it("Doctor's Bag clears the counter and cures an active cripple, no roll needed", () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // pins the bag's own heal dice
    const healer = makeHealer({ inventory: { doctors_bag: 1 } });
    const target = makeCrippledTarget();
    const result = computeLimbTreatment({ method: 'doctors_bag', healer, healerCharId: 'doc', target, targetCharId: 'rook', partKey: 'left_arm' });
    expect(result.error).toBeUndefined();
    expect(result.charUpdates['characters.doc.inventory'].doctors_bag).toBeUndefined(); // consumed down to 0 -> key dropped
    expect(result.charUpdates['characters.rook.limb_damage']).toEqual({});
    expect(result.charUpdates['characters.rook.status_effects']).toEqual([]);
    expect(result.message).toMatch(/cures Crippled Arm/);
  });

  it("Doctor's Bag refuses without one in inventory", () => {
    const healer = makeHealer({ inventory: {} });
    const target = makeCrippledTarget();
    const result = computeLimbTreatment({ method: 'doctors_bag', healer, healerCharId: 'doc', target, targetCharId: 'rook', partKey: 'left_arm' });
    expect(result.error).toMatch(/DOCTOR'S BAG/);
    expect(result.charUpdates).toBeUndefined();
  });

  it('a successful Medicine check (DC 20 / Normal tier) clears the counter and cures the cripple', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // pins the 1d6+4 heal
    const healer = makeHealer();
    const target = makeCrippledTarget();
    const result = computeLimbTreatment({ method: 'medicine', healer, healerCharId: 'doc', target, targetCharId: 'rook', partKey: 'left_arm', roll: 10 }); // 10 <= Medicine 10
    expect(result.charUpdates['characters.rook.limb_damage']).toEqual({});
    expect(result.charUpdates['characters.rook.status_effects']).toEqual([]);
    expect(result.charUpdates['characters.rook.hp.current']).toBe(20 + 5); // 1d6+4 at Math.random()=0 -> 1+4=5
  });

  it('a successful Medicine check on damage that has not crippled yet only clears the counter — no cripple to cure, no heal', () => {
    const healer = makeHealer();
    const target = makeCrippledTarget({ limb_damage: { left_arm: 1 }, status_effects: [] });
    const result = computeLimbTreatment({ method: 'medicine', healer, healerCharId: 'doc', target, targetCharId: 'rook', partKey: 'left_arm', roll: 10 });
    expect(result.charUpdates['characters.rook.limb_damage']).toEqual({});
    expect(result.charUpdates['characters.rook.status_effects']).toBeUndefined();
    expect(result.charUpdates['characters.rook.hp.current']).toBeUndefined();
  });

  it('a failed Medicine check changes nothing', () => {
    const healer = makeHealer();
    const target = makeCrippledTarget();
    const result = computeLimbTreatment({ method: 'medicine', healer, healerCharId: 'doc', target, targetCharId: 'rook', partKey: 'left_arm', roll: 11 }); // 11 > Medicine 10
    expect(result.charUpdates).toEqual({});
    expect(result.message).toMatch(/fails to treat/i);
  });
});
