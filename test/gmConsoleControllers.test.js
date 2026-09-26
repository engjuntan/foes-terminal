// The GM console's new writes (GM_DASHBOARD_SPEC.md Job 1.4/2): direct
// SPECIAL/skill overrides (STATS tab), a quantity-aware item grant and
// its TAKE counterpart (INVENTORY tab). Firestore mocked the same way
// test/cripple.test.js and test/chems-controllers.test.js mock it —
// updateDoc inspected directly rather than touching a real project.
import { describe, it, expect, vi, afterEach } from 'vitest';

const updateDocMock = vi.fn(async () => {});
const getDocMock = vi.fn();
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  updateDoc: (...args) => updateDocMock(...args),
  setDoc: vi.fn(),
  getDoc: (...args) => getDocMock(...args),
  deleteField: vi.fn(() => '__deleteField__'),
  onSnapshot: vi.fn()
}));
vi.mock('../src/firebase.js', () => ({ db: {} }));

const TEST_ITEMS = {
  stimpak: { id: 'stimpak', name: 'Stimpak', type: 'consumable' },
  pistol: { id: 'pistol', name: 'Pistol', type: 'weapon', slot: 'right_hand' }
};
vi.mock('../src/items.js', () => ({
  getItem: (id) => TEST_ITEMS[id] || null,
  itemDatabase: TEST_ITEMS
}));

const { gmSetSpecial, gmSetSkillRank, gmGrantItem, gmTakeItem } = await import('../src/controllers.js');

afterEach(() => {
  vi.restoreAllMocks();
  updateDocMock.mockClear();
  getDocMock.mockClear();
  delete global.window;
  delete global.alert;
  delete global.document;
  delete global.confirm;
});

function baseChar(overrides = {}) {
  return {
    name: 'Rook',
    special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
    skill_ranks: {}, inventory: {}, condition: {},
    ...overrides
  };
}

function setupWindow(char, id = 'rook') {
  global.window = { liveData: { characters: { [id]: char }, event_log: [] } };
  global.alert = () => {};
}

describe('gmSetSpecial', () => {
  it('writes a clamped raw SPECIAL value', async () => {
    const char = baseChar();
    setupWindow(char);
    await gmSetSpecial('rook', 'str', 8);
    expect(updateDocMock).toHaveBeenCalledTimes(1);
    expect(updateDocMock.mock.calls[0][1]).toEqual({ 'characters.rook.special.str': 8 });
  });

  it('clamps to the 1-20 GM override range', async () => {
    const char = baseChar();
    setupWindow(char);
    await gmSetSpecial('rook', 'luk', 99);
    expect(updateDocMock.mock.calls[0][1]).toEqual({ 'characters.rook.special.luk': 20 });

    updateDocMock.mockClear();
    await gmSetSpecial('rook', 'luk', -5);
    expect(updateDocMock.mock.calls[0][1]).toEqual({ 'characters.rook.special.luk': 1 });
  });

  it('ignores an unknown stat key', async () => {
    const char = baseChar();
    setupWindow(char);
    await gmSetSpecial('rook', 'not_a_stat', 10);
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it('does nothing when the character does not exist', async () => {
    setupWindow(baseChar());
    await gmSetSpecial('ghost', 'str', 10);
    expect(updateDocMock).not.toHaveBeenCalled();
  });
});

describe('gmSetSkillRank', () => {
  it('sets a skill\'s spent ranks', async () => {
    const char = baseChar();
    setupWindow(char);
    await gmSetSkillRank('rook', 'lockpick', 25);
    expect(updateDocMock.mock.calls[0][1]).toEqual({ 'characters.rook.skill_ranks': { lockpick: 25 } });
  });

  it('clears the key rather than writing a zero', async () => {
    const char = baseChar({ skill_ranks: { lockpick: 10 } });
    setupWindow(char);
    await gmSetSkillRank('rook', 'lockpick', 0);
    expect(updateDocMock.mock.calls[0][1]).toEqual({ 'characters.rook.skill_ranks': {} });
  });

  it('leaves other skills untouched', async () => {
    const char = baseChar({ skill_ranks: { sneak: 5 } });
    setupWindow(char);
    await gmSetSkillRank('rook', 'lockpick', 3);
    expect(updateDocMock.mock.calls[0][1]).toEqual({ 'characters.rook.skill_ranks': { sneak: 5, lockpick: 3 } });
  });
});

describe('gmGrantItem (console INVENTORY tab, quantity-aware)', () => {
  function mockDom({ itemId, qty }) {
    const elements = {
      gmItemSelect: { value: itemId },
      gmItemQty: qty === undefined ? undefined : { value: qty }
    };
    global.document = { getElementById: (id) => elements[id] || null };
  }

  it('grants the default quantity of 1 when the qty field is absent', async () => {
    const char = baseChar();
    setupWindow(char);
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ characters: { rook: char } }) });
    mockDom({ itemId: 'stimpak' });
    await gmGrantItem('rook');
    expect(updateDocMock.mock.calls[0][1]['characters.rook.inventory']).toEqual({ stimpak: 1 });
  });

  it('grants the requested quantity', async () => {
    const char = baseChar();
    setupWindow(char);
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ characters: { rook: char } }) });
    mockDom({ itemId: 'stimpak', qty: '4' });
    await gmGrantItem('rook');
    expect(updateDocMock.mock.calls[0][1]['characters.rook.inventory']).toEqual({ stimpak: 4 });
  });

  it('grants one condition-marks entry per copy for a durable item', async () => {
    const char = baseChar();
    setupWindow(char);
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ characters: { rook: char } }) });
    mockDom({ itemId: 'pistol', qty: '3' });
    await gmGrantItem('rook');
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.inventory']).toEqual({ pistol: 3 });
    expect(payload['characters.rook.condition'].inv.pistol).toHaveLength(3);
  });

  it('does nothing when no item is selected', async () => {
    setupWindow(baseChar());
    mockDom({ itemId: '' });
    await gmGrantItem('rook');
    expect(updateDocMock).not.toHaveBeenCalled();
  });
});

describe('gmTakeItem (console INVENTORY tab)', () => {
  it('removes the requested quantity', async () => {
    const char = baseChar({ inventory: { stimpak: 5 } });
    setupWindow(char);
    await gmTakeItem('rook', 'stimpak', 2);
    expect(updateDocMock.mock.calls[0][1]).toMatchObject({ 'characters.rook.inventory': { stimpak: 3 } });
  });

  it('never takes more than the character actually owns', async () => {
    const char = baseChar({ inventory: { stimpak: 2 } });
    setupWindow(char);
    await gmTakeItem('rook', 'stimpak', 99);
    expect(updateDocMock.mock.calls[0][1]['characters.rook.inventory']).toEqual({});
  });

  it('does nothing if the character has none of the item', async () => {
    const char = baseChar({ inventory: {} });
    setupWindow(char);
    await gmTakeItem('rook', 'stimpak', 1);
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it('drops the lowest-marks durable copies first', async () => {
    const char = baseChar({ inventory: { pistol: 3 }, condition: { inv: { pistol: [1, 5, 9] }, worn: {} } });
    setupWindow(char);
    await gmTakeItem('rook', 'pistol', 2);
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.condition'].inv.pistol).toEqual([9]);
  });
});
