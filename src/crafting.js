// src/crafting.js
// Pure crafting rules — no Firestore imports, same separation as
// formulas.js and inventory.js. Everything here is a plain function of
// its arguments, callable by hand from the browser console.
import { getItem } from './items.js';
import { normalizeInventory, getInventoryQuantity } from './inventory.js';

// Four stations, hardcoded rather than synced content — there will never
// be many of these, and the GM's own flavour label (where the party found
// it) lives per-character in characters.<id>.stations, not here. This
// object just defines what a station id MEANS.
export const STATIONS = {
  field_kit: {
    id: 'field_kit', name: 'Field Kit', always: true,
    description: 'A roll of tools and tape. Whatever you can manage in the dirt.'
  },
  weapons_bench: {
    id: 'weapons_bench', name: 'Weapons Bench', always: false,
    description: 'A vice, a file, and somewhere to put the pieces down.'
  },
  armour_bench: {
    id: 'armour_bench', name: 'Armour Bench', always: false,
    description: 'Awls, rivets, and a stand to shape plate against.'
  },
  chem_station: {
    id: 'chem_station', name: 'Chem Station', always: false,
    description: 'Burners and glassware. Ventilation optional, regrettably.'
  }
};

// { componentId: shortfall } — only components the character is short on,
// empty object when every input is fully satisfied.
export function getMissingInputs(recipe, inventory) {
  const inv = normalizeInventory(inventory);
  const missing = {};
  Object.entries(recipe.inputs || {}).forEach(([id, qty]) => {
    const owned = inv[id] || 0;
    if (owned < qty) missing[id] = qty - owned;
  });
  return missing;
}

export function meetsSkillFloor(recipe, derivedSkills) {
  const req = recipe.skill || { key: null, min: 0 };
  if (!req.key || !req.min) return true;
  return ((derivedSkills || {})[req.key] || 0) >= req.min;
}

// field_kit is always available — every other station requires the GM
// to have granted it on charStations (characters.<id>.stations).
export function hasStation(recipe, charStations) {
  if (!recipe.station || recipe.station === 'field_kit') return true;
  return !!(charStations && charStations[recipe.station]);
}

// Returns every reason crafting is currently blocked, not just the
// first — the Workshop shows a player everything standing in their way
// at once rather than one error at a time across repeated clicks.
export function canCraft(recipe, char, derivedSkills) {
  const reasons = [];
  const missing = getMissingInputs(recipe, char && char.inventory);
  Object.entries(missing).forEach(([id, qty]) => {
    const item = getItem(id);
    reasons.push(`Need ${qty} more ${item ? item.name : id}`);
  });
  if (!meetsSkillFloor(recipe, derivedSkills)) {
    const req = recipe.skill;
    reasons.push(`Requires ${req.key.replace(/_/g, ' ')} ${req.min} (you have ${(derivedSkills || {})[req.key] || 0})`);
  }
  if (!hasStation(recipe, char && char.stations)) {
    const station = STATIONS[recipe.station];
    reasons.push(`Requires ${station ? station.name : recipe.station} — not available here`);
  }
  return { ok: reasons.length === 0, reasons };
}

// Output weight minus input weight, in kg. Positive means crafting adds
// net mass (rare — most recipes consume more bulk than they produce),
// which is the only case craftItem() needs to run a carry-capacity check.
export function netWeightDelta(recipe) {
  const outputItem = getItem(recipe.produces && recipe.produces.item);
  const outputWeight = outputItem ? (outputItem.weight || 0) * (recipe.produces.qty || 1) : 0;
  const inputWeight = Object.entries(recipe.inputs || {}).reduce((sum, [id, qty]) => {
    const item = getItem(id);
    return sum + (item ? (item.weight || 0) * qty : 0);
  }, 0);
  return outputWeight - inputWeight;
}
