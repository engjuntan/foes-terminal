// Skill books cap out at SKILL_BOOK_SKILL_CAP (90) — GM ruling,
// 2026-09-24: a book does nothing once the skill it targets is already
// at or above that value. No consumption, no reading time spent. Below
// the cap, behaviour is unchanged. Firestore mocked the same way
// test/cripple.test.js mocks it — updateDoc inspected directly.
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
  book_small_guns_test: {
    id: 'book_small_guns_test', name: 'Guns and Bullets', type: 'consumable',
    stats: { skill_small_guns: 5, permanent: true }
  }
};
vi.mock('../src/items.js', () => ({ getItem: (id) => TEST_ITEMS[id] || null }));

const { useItem, SKILL_BOOK_SKILL_CAP } = await import('../src/controllers.js');

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

describe('useItem — skill book cap (SKILL_BOOK_SKILL_CAP)', () => {
  // formulas.js: small_guns = 5 + per + per -> base 15 at PER 5. Reading
  // the book also spends SKILL_BOOK_READ_MINUTES, which fires a second
  // updateDoc via advanceTime() — both calls are checked below rather
  // than assuming a single write.
  it('teaches normally below the cap', async () => {
    const rook = baseChar({ inventory: { book_small_guns_test: 1 }, skill_ranks: {} }); // total 15
    setLiveData({ rook }, 480);
    await useItem('rook', 'book_small_guns_test');
    expect(updateDocMock).toHaveBeenCalledTimes(2); // the grant, then the read-time advance
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.inventory'].book_small_guns_test).toBeUndefined(); // consumed
    expect(payload['characters.rook.permanent_skill_bonuses'].skill_small_guns).toBe(5);
  });

  it('does nothing at exactly 90 — no consumption, no updateDoc, no time spent', async () => {
    const rook = baseChar({ inventory: { book_small_guns_test: 1 }, skill_ranks: { small_guns: 75 } }); // 15 + 75 = 90
    setLiveData({ rook }, 480);
    await useItem('rook', 'book_small_guns_test');
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it('still teaches at 89 (one below the cap)', async () => {
    const rook = baseChar({ inventory: { book_small_guns_test: 1 }, skill_ranks: { small_guns: 74 } }); // 15 + 74 = 89
    setLiveData({ rook }, 480);
    await useItem('rook', 'book_small_guns_test');
    expect(updateDocMock).toHaveBeenCalledTimes(2);
    const payload = updateDocMock.mock.calls[0][1];
    expect(payload['characters.rook.permanent_skill_bonuses'].skill_small_guns).toBe(5);
  });

  it('refuses at 91 (one above the cap) with no side effects', async () => {
    const rook = baseChar({ inventory: { book_small_guns_test: 1 }, skill_ranks: { small_guns: 76 } }); // 15 + 76 = 91
    setLiveData({ rook }, 480);
    await useItem('rook', 'book_small_guns_test');
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it('exposes SKILL_BOOK_SKILL_CAP as 90', () => {
    expect(SKILL_BOOK_SKILL_CAP).toBe(90);
  });
});
