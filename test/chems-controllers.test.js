// Chem system wiring: useItem() granting a timed buff / rolling
// addiction / curing with Addictol, advanceTime() expiring a buff into
// its withdrawal and clearing an addiction after staying clean, and the
// Medicine-check cure route. Firestore mocked the same way
// test/cripple.test.js mocks it — updateDoc inspected directly rather
// than a real project. items.js is also mocked here (rather than using
// getItem against the real vault data) because no shipped item yet
// carries duration_hours/withdrawal/addiction_chance — see this job's
// DATA NEEDED.
import { describe, it, expect, vi, afterEach } from 'vitest';

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

const TEST_ITEMS = {
  buffout_test: {
    id: 'buffout_test', name: 'Buffout', type: 'consumable',
    stats: { special_str: 2, special_end: 3, duration: '1d6+2 Hours' },
    duration_hours: 8,
    withdrawal: { id: 'buffout_withdrawal_test', duration_hours: 4 },
    addictive: true, addiction_chance: 50
  },
  no_withdrawal_chem: {
    id: 'no_withdrawal_chem', name: 'Mild Tonic', type: 'consumable',
    stats: { special_per: 1 }, duration_hours: 2
  },
  addictol_test: { id: 'addictol_test', name: 'Addictol', type: 'consumable', stats: { cures_addiction: true } },
  stimpak_test: { id: 'stimpak_test', name: 'Stimpak', type: 'consumable', stats: { heal: '1d10+10' } }
};
vi.mock('../src/items.js', () => ({ getItem: (id) => TEST_ITEMS[id] || null }));

const { useItem, advanceTime, computeCureAddiction } = await import('../src/controllers.js');

function baseChar(overrides = {}) {
  return {
    name: 'Rook', is_finalized: true,
    special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
    hp: { current: 30, max: 40 }, needs: { hunger: 80, thirst: 80, sleep: 80 },
    inventory: {}, status_effects: [], skill_ranks: {}, tags: {}, perks: [],
    ...overrides
  };
}
function setLiveData(characters, worldMinutes = 480) {
  global.window = { liveData: { characters, world: { minutes: worldMinutes }, messages: [], active_combat: null, event_log: [] } };
  global.alert = () => {};
}

afterEach(() => {
  vi.restoreAllMocks();
  updateDocMock.mockClear();
  delete global.window;
  delete global.alert;
});

describe('useItem — chem buff (duration_hours)', () => {
  it('grants a timed status effect with an absolute expires_at_minutes', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // 99 >= 50% addiction_chance -> no addiction roll noise
    const rook = baseChar({ inventory: { buffout_test: 1 } });
    setLiveData({ rook }, 480);
    await useItem('rook', 'buffout_test');
    const payload = updateDocMock.mock.calls[0][1];
    const effects = payload['characters.rook.status_effects'];
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ source_id: 'buffout_test', name: 'Buffout', modifiers: { special_str: 2, special_end: 3 } });
    expect(effects[0].expires_at_minutes).toBe(480 + 8 * 60);
    expect(effects[0].withdrawal_id).toBe('buffout_withdrawal_test');
  });

  it('consumes the item and never touches status_effects for a non-chem consumable', async () => {
    const rook = baseChar({ inventory: { stimpak_test: 1 } });
    setLiveData({ rook }, 480);
    await useItem('rook', 'stimpak_test');
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.inventory'].stimpak_test).toBeUndefined();
    expect(payload['characters.rook.status_effects']).toBeUndefined();
  });
});

describe('useItem — addiction roll (addiction_chance)', () => {
  it('addicts on a hit and names the status Addicted — <chem>', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // 0 < 50% -> addicted
    const rook = baseChar({ inventory: { buffout_test: 1 } });
    setLiveData({ rook }, 480);
    await useItem('rook', 'buffout_test');
    const payload = updateDocMock.mock.calls[0][1];
    const effects = payload['characters.rook.status_effects'];
    const addiction = effects.find(fx => fx.is_addiction);
    expect(addiction).toBeDefined();
    expect(addiction.name).toBe('Addicted — Buffout');
    expect(addiction.source_id).toBe('addicted_buffout_test');
    expect(addiction.applied_at_minutes).toBe(480);
  });

  it('does not addict on a miss', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // 99 >= 50% -> no addiction
    const rook = baseChar({ inventory: { buffout_test: 1 } });
    setLiveData({ rook }, 480);
    await useItem('rook', 'buffout_test');
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.status_effects'].some(fx => fx.is_addiction)).toBe(false);
  });

  it('re-using while already addicted resets the clean clock instead of rolling again', async () => {
    const existing = { id: 'addicted_buffout_test_1', source_id: 'addicted_buffout_test', name: 'Addicted — Buffout', modifiers: {}, is_addiction: true, applied_at_minutes: 100 };
    const rook = baseChar({ inventory: { buffout_test: 1 }, status_effects: [existing] });
    setLiveData({ rook }, 900);
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // would have missed anyway — proves no re-roll happens
    await useItem('rook', 'buffout_test');
    const payload = updateDocMock.mock.calls[0][1];
    const effects = payload['characters.rook.status_effects'];
    const addictions = effects.filter(fx => fx.is_addiction);
    expect(addictions).toHaveLength(1); // never duplicated
    expect(addictions[0].applied_at_minutes).toBe(900); // clock reset to now
  });
});

describe('useItem — Addictol (cures_addiction)', () => {
  it('clears every addiction status effect', async () => {
    const addiction = { id: 'a1', source_id: 'addicted_buffout_test', name: 'Addicted — Buffout', modifiers: {}, is_addiction: true, applied_at_minutes: 0 };
    const rook = baseChar({ inventory: { addictol_test: 1 }, status_effects: [addiction] });
    setLiveData({ rook }, 480);
    await useItem('rook', 'addictol_test');
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.status_effects']).toEqual([]);
  });

  it('does nothing destructive when there is no addiction to cure', async () => {
    const rook = baseChar({ inventory: { addictol_test: 1 } });
    setLiveData({ rook }, 480);
    await useItem('rook', 'addictol_test');
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.status_effects']).toEqual([]);
  });
});

describe('advanceTime — chem buff expiry and withdrawal hand-off', () => {
  it('leaves an unexpired buff untouched', async () => {
    const buff = { id: 'b1', source_id: 'buffout_test', name: 'Buffout', modifiers: { special_str: 2 }, expires_at_minutes: 480 + 600 };
    const rook = baseChar({ status_effects: [buff] });
    setLiveData({ rook }, 480);
    await advanceTime(60, { initiatedBy: 'GM' }); // now 540, buff expires at 1080
    const payload = updateDocMock.mock.calls[0][1];
    expect(Object.keys(payload)).not.toContain('characters.rook.status_effects');
  });

  it('expires a buff and hands off to its withdrawal, with its own expiry', async () => {
    const buff = { id: 'b1', source_id: 'buffout_test', name: 'Buffout', modifiers: { special_str: 2 }, expires_at_minutes: 500, withdrawal_id: 'buffout_withdrawal_test', withdrawal_duration_hours: 4 };
    const rook = baseChar({ status_effects: [buff] });
    setLiveData({ rook }, 480);
    await advanceTime(60, { initiatedBy: 'GM' }); // now 540, buff expired at 500
    const payload = updateDocMock.mock.calls[0][1];
    const effects = payload['characters.rook.status_effects'];
    expect(effects.find(fx => fx.source_id === 'buffout_test')).toBeUndefined();
    const withdrawal = effects.find(fx => fx.source_id === 'buffout_withdrawal_test');
    expect(withdrawal).toBeDefined();
    expect(withdrawal.expires_at_minutes).toBe(500 + 4 * 60);
  });

  it('expires a buff with no withdrawal spec cleanly (no hand-off)', async () => {
    const buff = { id: 'b1', source_id: 'no_withdrawal_chem', name: 'Mild Tonic', modifiers: { special_per: 1 }, expires_at_minutes: 500 };
    const rook = baseChar({ status_effects: [buff] });
    setLiveData({ rook }, 480);
    await advanceTime(60, { initiatedBy: 'GM' });
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.status_effects']).toEqual([]);
  });

  it('never touches an ordinary duration_turns (combat) status effect', async () => {
    const bleeding = { id: 'bl1', source_id: 'bleeding', name: 'Bleeding', modifiers: { damage_per_turn: '1d6' }, duration_turns: 2 };
    const rook = baseChar({ status_effects: [bleeding] });
    setLiveData({ rook }, 480);
    await advanceTime(60, { initiatedBy: 'GM' });
    const payload = updateDocMock.mock.calls[0][1];
    expect(Object.keys(payload)).not.toContain('characters.rook.status_effects');
  });
});

describe('advanceTime — addiction cured by staying clean', () => {
  it('clears an addiction once enough in-game days have passed clean', async () => {
    const addiction = { id: 'a1', source_id: 'addicted_buffout_test', name: 'Addicted — Buffout', modifiers: {}, is_addiction: true, applied_at_minutes: 0 };
    const rook = baseChar({ status_effects: [addiction] });
    setLiveData({ rook }, 7 * 1440 - 30); // 30 minutes short of 7 clean days
    await advanceTime(60, { initiatedBy: 'GM' }); // crosses the 7-day mark
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.status_effects']).toEqual([]);
  });

  it('keeps the addiction before the clean threshold', async () => {
    const addiction = { id: 'a1', source_id: 'addicted_buffout_test', name: 'Addicted — Buffout', modifiers: {}, is_addiction: true, applied_at_minutes: 0 };
    const rook = baseChar({ status_effects: [addiction] });
    setLiveData({ rook }, 480);
    await advanceTime(60, { initiatedBy: 'GM' });
    const payload = updateDocMock.mock.calls[0][1];
    expect(Object.keys(payload)).not.toContain('characters.rook.status_effects');
  });
});

describe('computeCureAddiction — Medicine check route', () => {
  // per 5 + int 5 -> Medicine 10 (formulas.js). CHEM_ADDICTION_MEDICINE_TIER
  // is 'difficult' (-20 skill), so threshold = max(0, 10-20) = 0.
  function makeHealer(overrides = {}) {
    return { name: 'Doc', special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 }, inventory: {}, ...overrides };
  }
  function makeAddictedTarget() {
    return {
      name: 'Rook',
      status_effects: [{ id: 'a1', source_id: 'addicted_buffout_test', name: 'Addicted — Buffout', modifiers: { special_str: -4 }, is_addiction: true, applied_at_minutes: 0 }]
    };
  }

  it('a roll of exactly the threshold (0) succeeds and clears the addiction', () => {
    const healer = makeHealer();
    const target = makeAddictedTarget();
    const result = computeCureAddiction({ healer, healerCharId: 'doc', target, targetCharId: 'rook', addictionInstanceId: 'a1', roll: 0 });
    expect(result.charUpdates['characters.rook.status_effects']).toEqual([]);
    expect(result.message).toMatch(/cured/);
  });

  it('any roll above threshold 0 fails and changes nothing', () => {
    const healer = makeHealer();
    const target = makeAddictedTarget();
    const result = computeCureAddiction({ healer, healerCharId: 'doc', target, targetCharId: 'rook', addictionInstanceId: 'a1', roll: 1 });
    expect(result.charUpdates).toEqual({});
    expect(result.message).toMatch(/fails/i);
  });

  it('refuses when the named addiction does not exist on the target', () => {
    const healer = makeHealer();
    const target = { name: 'Rook', status_effects: [] };
    const result = computeCureAddiction({ healer, healerCharId: 'doc', target, targetCharId: 'rook', addictionInstanceId: 'nope', roll: 1 });
    expect(result.error).toMatch(/NO SUCH ADDICTION/);
  });
});
