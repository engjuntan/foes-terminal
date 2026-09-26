// The GM console's INVENTORY tab (GM_DASHBOARD_SPEC.md Job 2) grouping
// logic — the ~280-item database sorted into a category dropdown, plus
// "what they're carrying" sorted the same way. Pure functions, checked
// here by hand-built item lists rather than by clicking through the UI.
import { describe, it, expect } from 'vitest';
import {
  GRANT_CATEGORY_LABELS, groupItemsByCategory, buildGrantCategoryList,
  defaultGrantCategory, buildCarriedRows
} from '../src/gmInventory.js';

const ITEMS = {
  pistol: { id: 'pistol', name: 'Pistol', type: 'weapon' },
  rifle: { id: 'rifle', name: 'Rifle', type: 'weapon' },
  armor_vest: { id: 'armor_vest', name: 'Vest', type: 'armor' },
  stimpak: { id: 'stimpak', name: 'Stimpak', type: 'consumable' },
  cap: { id: 'cap', name: 'Bottle Cap', type: 'currency' },
  no_type: { id: 'no_type', name: 'Mystery Thing' } // missing `type`
};

describe('groupItemsByCategory', () => {
  it('groups items under their type, sorted by name', () => {
    const grouped = groupItemsByCategory(ITEMS);
    expect(grouped.weapon.map(i => i.name)).toEqual(['Pistol', 'Rifle']);
    expect(grouped.armor.map(i => i.name)).toEqual(['Vest']);
  });

  it('drops items with no type rather than crashing', () => {
    const grouped = groupItemsByCategory(ITEMS);
    expect(Object.values(grouped).flat().some(i => i.id === 'no_type')).toBe(false);
  });

  it('accepts an array as well as a keyed object', () => {
    const grouped = groupItemsByCategory(Object.values(ITEMS));
    expect(grouped.weapon.map(i => i.name)).toEqual(['Pistol', 'Rifle']);
  });

  it('returns an empty object for an empty/missing database', () => {
    expect(groupItemsByCategory({})).toEqual({});
    expect(groupItemsByCategory(undefined)).toEqual({});
  });
});

describe('buildGrantCategoryList', () => {
  it('only lists categories that actually have an item', () => {
    const list = buildGrantCategoryList(ITEMS);
    const types = list.map(c => c.type);
    expect(types).toEqual(['weapon', 'armor', 'consumable', 'currency']);
    // ammo/component/junk/accessory have nothing in ITEMS — absent, not empty
    expect(types).not.toContain('ammo');
  });

  it('labels categories in plain words, in the fixed order', () => {
    const list = buildGrantCategoryList(ITEMS);
    expect(list.find(c => c.type === 'weapon').label).toBe('Weapons');
    expect(list.find(c => c.type === 'currency').label).toBe('Currency');
  });

  it('carries each category\'s own sorted item list', () => {
    const list = buildGrantCategoryList(ITEMS);
    expect(list.find(c => c.type === 'weapon').items.map(i => i.id)).toEqual(['pistol', 'rifle']);
  });
});

describe('defaultGrantCategory', () => {
  const list = buildGrantCategoryList(ITEMS);

  it('keeps the GM\'s last pick when it is still a valid category', () => {
    expect(defaultGrantCategory(list, 'armor')).toBe('armor');
  });

  it('falls back to the first category when nothing was picked yet', () => {
    expect(defaultGrantCategory(list, null)).toBe('weapon');
    expect(defaultGrantCategory(list, undefined)).toBe('weapon');
  });

  it('falls back when the last pick no longer has any items', () => {
    expect(defaultGrantCategory(list, 'ammo')).toBe('weapon');
  });

  it('returns null when there is nothing to grant at all', () => {
    expect(defaultGrantCategory([], 'weapon')).toBe(null);
  });
});

describe('buildCarriedRows', () => {
  const getItemFn = (id) => ITEMS[id] || null;

  it('sorts by category (fixed order) then name', () => {
    const inventory = { stimpak: 3, rifle: 1, pistol: 2, cap: 10 };
    const rows = buildCarriedRows(inventory, getItemFn);
    expect(rows.map(r => r.itemId)).toEqual(['pistol', 'rifle', 'stimpak', 'cap']);
  });

  it('drops zero/negative quantities and unknown item ids', () => {
    const inventory = { stimpak: 0, ghost_item: 5, rifle: 1 };
    const rows = buildCarriedRows(inventory, getItemFn);
    expect(rows.map(r => r.itemId)).toEqual(['rifle']);
  });

  it('returns an empty list for an empty/missing inventory', () => {
    expect(buildCarriedRows({}, getItemFn)).toEqual([]);
    expect(buildCarriedRows(undefined, getItemFn)).toEqual([]);
  });

  it('puts an item of an unlisted category last, not first', () => {
    const items = { ...ITEMS, oddity: { id: 'oddity', name: 'Oddity', type: 'trinket' } };
    const rows = buildCarriedRows({ oddity: 1, cap: 1 }, (id) => items[id] || null);
    expect(rows.map(r => r.itemId)).toEqual(['cap', 'oddity']);
  });
});
