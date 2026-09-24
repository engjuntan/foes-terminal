// src/condition.js
// Pure durability/condition helpers — same separation as formulas.js,
// inventory.js and crafting.js (no Firestore imports, callable by hand).
// BALANCE_PROPOSAL.md §2 is the spec; SCOPE_DECISIONS.md's 2026-09-22
// rulings override it where the two disagree (see each function's comment).
//
// Data shape (characters.<id>.condition):
//   { inv: { itemId: [marksPerCopy, ...] }, worn: { slotKey: marks } }
// `inventory` itself stays the existing { itemId: qty } map — condition is
// a sibling field, written in the SAME updateDoc as any inventory/equipment
// write that moves a durable item. Only weapons (excluding throwing, which
// isn't tracked as a durable item — it's consumed, not carried) and armor
// carry marks; everything else (consumables, ammo, junk, components,
// currency, accessories) has no condition entry at all.
//
// Marks run 0 (pristine) to 10 (Broken — GM ruling 2026-09-22: 10 marks
// makes the item unusable until repaired, overriding BALANCE_PROPOSAL's
// finer table which kept armor's AC/DT/DR at x0.50 rather than blocking it
// outright at 10; here both weapons and armor are simply blocked at 10 —
// see resolveAttack()'s Broken check in controllers.js and MARKS_BROKEN
// below. Equipping/unequipping/giving a Broken copy is still allowed
// (you can carry or hand over a wrecked gun), only USING it (attacking, or
// — by the same reading — presumably wearing it into a fight) is refused;
// this build only gates the weapon-attack path, since that's the one the
// brief's click-through explicitly calls out.

import { getItem } from './items.js';
import { normalizeInventory } from './inventory.js';

export const MAX_MARKS = 10;

export function clampMarks(v) {
  const n = Math.round(Number(v) || 0);
  return Math.max(0, Math.min(MAX_MARKS, n));
}

// Weapons that use the `throwing` skill are excluded on purpose — the
// manual and this app both treat thrown weapons as consumed on use, same
// as ammo, not as a carried/maintained copy. Everything else typed
// 'weapon', plus everything typed 'armor', is durable.
export function isDurable(item) {
  if (!item) return false;
  if (item.type === 'armor') return true;
  if (item.type === 'weapon') return item.skill !== 'throwing';
  return false;
}

export function isBroken(marks) {
  return clampMarks(marks) >= MAX_MARKS;
}

// §2.2's linear scale: every point of wear costs 5% — weapon damage,
// weapon-condition's own hit-chance component (see hitPenalty, which is
// NOT this — hit is a flat -1/mark, not this multiplier), armor AC/DT/DR,
// and scrap yield all read off this same curve.
export function conditionMultiplier(marks) {
  return 1 - 0.05 * clampMarks(marks);
}

// Value is its own, steeper curve (§2.2: "Value drops 10% per mark") —
// deliberately NOT the same function as conditionMultiplier, floored at
// 10% of value rather than reaching 0, matching the table's Marks-10 row
// (x0.1, not x0.0 — a Broken weapon is still worth something for parts).
export function valueMultiplier(marks) {
  return Math.max(0.1, 1 - 0.1 * clampMarks(marks));
}

// Hit ends at -9 (marks 9), not -10 at Broken — the manual's own ceiling
// of "-10% hit chance" for worn weapons, and moot besides since a Broken
// (10-mark) weapon can't be fired at all (see isBroken gate).
export function hitPenalty(marks) {
  return -Math.min(9, clampMarks(marks));
}

// Fumble save (roll 91-99, PC only): succeeds on d10 <= LK - floor(m/2).
export function fumbleLuckPenalty(marks) {
  return Math.floor(clampMarks(marks) / 2);
}

export function conditionLabel(marks) {
  const m = clampMarks(marks);
  if (m === 0) return 'Pristine';
  if (m <= 3) return 'Serviceable';
  if (m <= 6) return 'Worn';
  if (m <= 9) return 'Damaged';
  return 'Broken';
}

// Rounds an armor AC/DT/DR number under condition wear — ".5 rounds up"
// per §2.2, which is what Math.round already does for positive inputs.
export function applyConditionToStat(base, marks) {
  return Math.round((base || 0) * conditionMultiplier(marks));
}

// Scales a parsed { dt, dr } damage-type block (see combat.js's
// parseArmorDtdr) by the same per-mark multiplier, on both DT and DR.
export function applyConditionToDtdr(dtdrBlock, marks) {
  const mult = conditionMultiplier(marks);
  const out = {};
  Object.entries(dtdrBlock || {}).forEach(([type, entry]) => {
    out[type] = {
      dt: Math.round((entry.dt || 0) * mult),
      dr: Math.round((entry.dr || 0) * mult)
    };
  });
  return out;
}

// §2.4's "found and stocked condition" — an item's starting marks when it
// enters play new (crafted always starts pristine; the vault expresses a
// pre-worn starting condition via `start_marks`, a field this app reads
// but never writes — see CLAUDE.md's "never hand-edit generated files").
//
// `"condition": "disrepair"` is the shorthand two vault items already
// carry (Salvaged Power Armor Chestplate/Helmet, the Fractured Laser
// Rifle) — BALANCE_PROPOSAL.md §2.1 names the intended fix directly:
// "CHANGE: `"condition": "disrepair"` -> `"base_marks": 8`". Since this
// app can't hand-edit items.js (generated) to make that rename, both
// `start_marks` (this brief's field name) and `base_marks`
// (BALANCE_PROPOSAL's own name for the same thing) are read here, and the
// bare `"disrepair"` string maps to that same 8 — Damaged tier, matching
// the proposal's stated intent for exactly these pieces. See this agent's
// report for the vault field the sync should add going forward.
const DISREPAIR_DEFAULT_MARKS = 8;
export function startMarksForItem(item) {
  if (!item) return 0;
  if (typeof item.start_marks === 'number') return clampMarks(item.start_marks);
  if (typeof item.base_marks === 'number') return clampMarks(item.base_marks);
  if (item.condition === 'disrepair') return DISREPAIR_DEFAULT_MARKS;
  return 0;
}

// Rebuilds a character's condition field so it always matches their
// current inventory/equipment: fills a missing copy with the item's
// starting marks (old characters with no condition field at all upgrade
// silently to "every copy pristine, except an item authored with its own
// start_marks/disrepair"), trims any copy beyond what's actually owned,
// and drops entries for items no longer carried. Read-only — callers
// still have to write the result back themselves in the same updateDoc
// as whatever inventory/equipment change they're making.
export function normalizeCondition(char) {
  const inv = normalizeInventory(char && char.inventory);
  const equipment = (char && char.equipment) || {};
  const raw = (char && char.condition) || {};
  const rawInv = raw.inv || {};
  const rawWorn = raw.worn || {};

  const newInv = {};
  Object.entries(inv).forEach(([itemId, qty]) => {
    if (!qty) return;
    const item = getItem(itemId);
    if (!isDurable(item)) return;
    const existing = Array.isArray(rawInv[itemId]) ? rawInv[itemId].slice(0, qty) : [];
    while (existing.length < qty) existing.push(startMarksForItem(item));
    newInv[itemId] = existing.map(clampMarks).sort((a, b) => a - b);
  });

  const newWorn = {};
  Object.entries(equipment).forEach(([slot, itemId]) => {
    if (!itemId) return;
    const item = getItem(itemId);
    if (!isDurable(item)) return;
    const existing = rawWorn[slot];
    newWorn[slot] = clampMarks(typeof existing === 'number' ? existing : startMarksForItem(item));
  });

  return { inv: newInv, worn: newWorn };
}

// Removes and returns one marks value from a (possibly unsorted) copies
// array, by position in ascending order — index 0 is the lowest-marks
// (best-condition) copy, the last index the highest-marks (worst) copy.
// Falls back to the lowest copy if `index` is missing/out of range, which
// is also §2.1's stated default for an equip that doesn't specify one.
export function takeCopyAt(marksArray, index) {
  const sorted = [...(marksArray || [])].sort((a, b) => a - b);
  const i = (typeof index === 'number' && index >= 0 && index < sorted.length) ? index : 0;
  const marks = sorted[i];
  const rest = [...sorted.slice(0, i), ...sorted.slice(i + 1)];
  return { marks: marks ?? 0, rest };
}

// §2.1's stated defaults for callers that don't let the player pick a
// specific copy (e.g. a hotkey/quick-equip with no per-copy UI).
export function takeLowestCopy(marksArray) {
  const sorted = [...(marksArray || [])].sort((a, b) => a - b);
  return takeCopyAt(sorted, 0);
}
export function takeHighestCopy(marksArray) {
  const sorted = [...(marksArray || [])].sort((a, b) => a - b);
  return takeCopyAt(sorted, sorted.length - 1);
}

export function putCopy(marksArray, marks) {
  return [...(marksArray || []), clampMarks(marks)].sort((a, b) => a - b);
}

// --- VALUE / SCRAP (§2.2, §2.6) ---

// `item.value` isn't always a number yet (many items are still authored
// "TBA" — see CLAUDE.md/items.js) — returns null rather than a fake 0 so
// a caller can tell "no price yet" apart from "worth nothing".
export function conditionValue(item, marks) {
  if (!item || typeof item.value !== 'number') return null;
  return Math.round(item.value * valueMultiplier(marks));
}

// Scales an already-computed scrap yield ({ componentId: qty }) by the
// same curve as weapon damage/armor AC (§2.6: "Condition then applies the
// §2.2 multiplier"), flooring each component but never zeroing one out
// that had a nonzero yield to begin with.
export function scrapYieldFor(scrapYield, marks) {
  const mult = conditionMultiplier(marks);
  const out = {};
  Object.entries(scrapYield || {}).forEach(([id, qty]) => {
    if (!qty) return;
    out[id] = Math.max(1, Math.floor(qty * mult));
  });
  return out;
}

// --- REPAIR (§2.5) ---

// Category -> { primary, secondary, rare? } component ids, matching
// §2.5's table. Armor's category is a judgment call the table doesn't
// give a hard rule for (it only names "Light armor"/"Heavy armor"/"Power
// armor") — power armor is read off the item id (the only two pieces
// that exist are salvaged_power_armor_*), and light/heavy off weight
// (>=8kg reads as heavy) since that's the one numeric armor field every
// piece already carries. Stated as an assumption in this agent's report.
// Five components only (GM ruling 2026-09-24): gun_parts, clothing_scrap,
// scrap_metal, scrap_electronics, chemicals. The retired adhesive,
// organics, hardened_alloy and prewar_tech are gone, so energy gear and
// power armor no longer have a rare gate here.
const REPAIR_COMPONENTS = {
  guns: { primary: 'gun_parts', secondary: 'scrap_metal' },
  energy: { primary: 'scrap_electronics', secondary: 'gun_parts' },
  melee: { primary: 'scrap_metal', secondary: 'gun_parts' },
  light_armor: { primary: 'clothing_scrap', secondary: 'scrap_metal' },
  heavy_armor: { primary: 'scrap_metal', secondary: 'clothing_scrap' },
  power_armor: { primary: 'scrap_metal', secondary: 'scrap_electronics' }
};
const HEAVY_ARMOR_WEIGHT_KG = 8;

export function repairCategory(item) {
  if (!item) return null;
  if (item.type === 'weapon') {
    if (item.skill === 'energy_weapons') return 'energy';
    if (item.skill === 'melee_weapons') return 'melee';
    return 'guns';
  }
  if (item.type === 'armor') {
    const id = item.id || '';
    if (id.includes('power_armor')) return 'power_armor';
    return (typeof item.weight === 'number' && item.weight >= HEAVY_ARMOR_WEIGHT_KG) ? 'heavy_armor' : 'light_armor';
  }
  return null;
}

// --- GENERIC SCRAP (SCOPE_DECISIONS.md "Combat, scrap, People tab,
// heist" GM ruling, 2026-09-22: "Every weapon and armor scraps for 1-3
// generic components matching what it is... Low Repair skews toward 1;
// higher Repair skews toward 3.") ---
// Only used as a FALLBACK by scrapItem() (controllers.js) when the item
// has no authored `scrap_yield` of its own — an authored yield always
// wins. Component choice reuses the same armor family judgment call
// repairCategory() already makes (power-armor-by-id, heavy-by-weight —
// see that function's own comment), but weapons are grouped differently
// here than for repair (repair only cares energy/melee/guns; scrap also
// separates melee from unarmed/throwing into the same bucket, matching
// the brief's literal component list).
export function genericScrapComponent(item) {
  if (!item) return null;
  if (item.type === 'weapon') {
    if (item.skill === 'energy_weapons') return 'scrap_electronics';
    if (item.skill === 'melee_weapons' || item.skill === 'unarmed' || item.skill === 'throwing') return 'scrap_metal';
    return 'gun_parts'; // small_guns, big_guns, or unspecified — "a gun"
  }
  if (item.type === 'armor') {
    const id = item.id || '';
    if (id.includes('power_armor')) return 'power_armor'; // special-cased in genericScrapYield below
    const heavy = typeof item.weight === 'number' && item.weight >= HEAVY_ARMOR_WEIGHT_KG;
    return heavy ? 'scrap_metal' : 'clothing_scrap';
  }
  return null;
}

// Quantity bands (this build's own call, stated per the brief): roll
// d100 + Repair skill, then <=70 -> 1, 71-130 -> 2, >130 -> 3. At
// Repair 0 that's ~70% chance of 1 and no chance of 3 (mostly 1); at
// Repair 100 it's ~70% chance of 3 and no chance of 1 (mostly 3); Repair
// ~50 lands mostly on 2 — a smooth low-to-high skew across the normal
// skill range with no hard cap on either end.
export function genericScrapQty(repairSkill) {
  const total = Math.floor(Math.random() * 100) + 1 + (repairSkill || 0);
  if (total > 130) return 3;
  if (total > 70) return 2;
  return 1;
}

// { componentId: qty }, or null if this item isn't a weapon/armor this
// build knows how to classify. Power armor is the one two-component
// case: 1 Scrap Electronics (its servos and wiring) plus the
// Repair-weighted Scrap Metal roll.
export function genericScrapYield(item, repairSkill) {
  const component = genericScrapComponent(item);
  if (!component) return null;
  const qty = genericScrapQty(repairSkill);
  if (component === 'power_armor') return { scrap_electronics: 1, scrap_metal: qty };
  return { [component]: qty };
}

// Per §2.5: "primary x max(1, ceil(0.10 x value / primary.value)) + 1
// secondary, plus 1 rare per 2 marks" — returns the cost for ONE mark of
// repair; totalRepairCost() below multiplies it out for a whole job.
// Component *quantities to consume* read off the live component items'
// own `.value` (getItem), not a hardcoded RMR table, so this automatically
// tracks whatever the vault's prices are at any given time (including the
// rev-4 x10 pass BALANCE_PROPOSAL calls for, whenever that syncs) rather
// than baking in a snapshot that would drift out from under it.
export function repairCostPerMark(item) {
  const category = repairCategory(item);
  const spec = category && REPAIR_COMPONENTS[category];
  if (!spec) return null;
  const primaryItem = getItem(spec.primary);
  const value = typeof item.value === 'number' ? item.value : 0;
  const primaryValue = (primaryItem && typeof primaryItem.value === 'number' && primaryItem.value > 0) ? primaryItem.value : 1;
  const primaryQty = Math.max(1, Math.ceil(0.10 * value / primaryValue));
  return {
    primary: { id: spec.primary, qty: primaryQty },
    secondary: { id: spec.secondary, qty: 1 },
    rare: spec.rare ? { id: spec.rare } : null // 1 per 2 marks, accumulated in totalRepairCost
  };
}

// Total components for repairing `marks` worth of wear off `item` in one
// job — { componentId: totalQty }.
export function totalRepairCost(item, marks) {
  const perMark = repairCostPerMark(item);
  const m = Math.max(0, Math.floor(marks) || 0);
  if (!perMark || m <= 0) return {};
  const total = {};
  const add = (id, qty) => { if (qty > 0) total[id] = (total[id] || 0) + qty; };
  add(perMark.primary.id, perMark.primary.qty * m);
  add(perMark.secondary.id, perMark.secondary.qty * m);
  if (perMark.rare) add(perMark.rare.id, Math.ceil(m / 2));
  return total;
}

// Repair = 3 x INT (Fallout 2 formula, GM ruling 2026-09-22) is computed
// in formulas.js's normal skill pass (skills.repair), same as every other
// skill — nothing repair-specific needed here for the skill number itself.

// §2.5's floor table: the lowest marks a repair job can reach, before any
// Tool Set/Gunsmith's Tools bonus (no such item exists in the vault yet —
// see this agent's report's DATA NEEDED section).
export function repairFloor(repairSkill, atBench) {
  const base = Math.max(0, 6 - Math.floor((repairSkill || 0) / 20));
  return atBench ? Math.max(0, base - 1) : base;
}

// One d100 per repair JOB (not per mark) — §2.5's arbitrage guard is
// built on this being capped at 30%.
export function repairSaveChance(repairSkill) {
  if ((repairSkill || 0) >= 100) return 30;
  if ((repairSkill || 0) >= 80) return 20;
  if ((repairSkill || 0) >= 60) return 10;
  return 0;
}
