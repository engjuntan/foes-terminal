// src/gmInventory.js
// Pure helpers behind the GM console's INVENTORY tab (GM_DASHBOARD_SPEC.md
// Job 2). The item database is ~280 entries, unsorted by anything a GM
// can use at the table — grouping/sorting it lives here, kept out of
// views.js the same way formulas.js/needs.js/crafting.js keep their own
// math out of the render layer, so it's testable without building HTML.

// The item `type` values the grant dropdown offers, in the fixed order
// the GM sees them, each carrying its own plain-words label (2.1: "Label
// them in plain words").
export const GRANT_CATEGORY_LABELS = [
  ['weapon', 'Weapons'],
  ['armor', 'Armor'],
  ['consumable', 'Consumables'],
  ['ammo', 'Ammo'],
  ['component', 'Components'],
  ['junk', 'Junk'],
  ['accessory', 'Accessories'],
  ['currency', 'Currency']
];

// Groups a flat item database (object keyed by id, OR an array of item
// defs — tolerates either) into { [type]: [items sorted by name] }.
// Items missing a `type` are dropped rather than crashing the group —
// nothing in the grant dropdown can point at a category-less item anyway.
export function groupItemsByCategory(itemDatabase) {
  const items = Array.isArray(itemDatabase) ? itemDatabase : Object.values(itemDatabase || {});
  const byCategory = {};
  items.forEach(item => {
    if (!item || !item.type) return;
    (byCategory[item.type] = byCategory[item.type] || []).push(item);
  });
  Object.keys(byCategory).forEach(type => {
    byCategory[type] = [...byCategory[type]].sort((a, b) => a.name.localeCompare(b.name));
  });
  return byCategory;
}

// The category dropdown's own option list — only categories that
// actually have at least one item, in GRANT_CATEGORY_LABELS' order, each
// carrying its own sorted item list so the item dropdown can repopulate
// without re-grouping the whole database on every change.
export function buildGrantCategoryList(itemDatabase) {
  const byCategory = groupItemsByCategory(itemDatabase);
  return GRANT_CATEGORY_LABELS
    .filter(([type]) => (byCategory[type] || []).length > 0)
    .map(([type, label]) => ({ type, label, items: byCategory[type] }));
}

// Which category the GM's dropdown should default to: whatever they
// picked last (window.gmGrantCategory — view state, never reaches
// Firestore), falling back to the first non-empty category so the
// dropdown is never stuck pointing at nothing.
export function defaultGrantCategory(categoryList, lastPicked) {
  if (lastPicked && categoryList.some(c => c.type === lastPicked)) return lastPicked;
  return categoryList.length ? categoryList[0].type : null;
}

// "What they're carrying" (2.2): the character's inventory map
// ({itemId: qty}) resolved against the item database, sorted by category
// (GRANT_CATEGORY_LABELS' fixed order, unknown types last) then name.
// `getItemFn` is injected (rather than importing items.js directly) so
// this stays testable against a hand-built database, same reasoning as
// every other pure helper in this codebase.
export function buildCarriedRows(inventory, getItemFn) {
  const categoryIndex = new Map(GRANT_CATEGORY_LABELS.map(([type], i) => [type, i]));
  return Object.entries(inventory || {})
    .map(([itemId, qty]) => ({ itemId, qty, item: getItemFn(itemId) }))
    .filter(row => row.item && row.qty > 0)
    .sort((a, b) => {
      const catDiff = (categoryIndex.has(a.item.type) ? categoryIndex.get(a.item.type) : 99)
        - (categoryIndex.has(b.item.type) ? categoryIndex.get(b.item.type) : 99);
      if (catDiff !== 0) return catDiff;
      return a.item.name.localeCompare(b.item.name);
    });
}
