// src/needs.js
// Pure survival-needs logic: hunger, thirst, sleep, plus the world clock's
// display formatting and the natural-healing dice roll. Kept out of
// controllers.js the same way formulas.js and inventory.js are — no
// Firestore imports here, everything testable by hand-building objects.
//
// Scale: base 100, DEPLETING (100 = sated, 0 = critical) — the inverse of
// radiation, which fills 0->1000 as it worsens. FNV hardcore mode is the
// baseline, adjusted harsher per the GM's call: roughly 2x FNV's rates.
//
// The SPECIAL split is deliberately non-overlapping — FNV lets dehydration
// and sleep deprivation both hit PER/AGI/INT, stacking into double
// penalties. Here each need owns two stats and nothing collides: thirst
// degrades acting (PER/AGI), hunger degrades enduring (STR/END), sleep
// degrades thinking (INT/CHA). LUK is untouched by any of the three.
import { rollDamage } from './combat.js';

export const NEED_RATES = { hunger: 2.0, thirst: 3.0, sleep: 1.5 };

// Descending order (100 -> 0) since these deplete. Each tier's `modifiers`
// applies whenever the need is AT OR BELOW `at` and no lower tier also
// qualifies — same "last match wins" walk as RAD_THRESHOLDS in formulas.js,
// just inverted because this scale runs the other direction.
export const HUNGER_THRESHOLDS = [
  { at: 100, label: "Sated", modifiers: {} },
  { at: 80, label: "Peckish", modifiers: {} },
  { at: 60, label: "Hungry", modifiers: { special_str: -1 } },
  { at: 40, label: "Famished", modifiers: { special_str: -2, special_end: -1 } },
  { at: 20, label: "Starving", modifiers: { special_str: -3, special_end: -2, max_hp_flat: -10 } },
  { at: 0, label: "Dying of hunger", modifiers: { special_str: -3, special_end: -2, max_hp_flat: -10 }, hpDrainDice: "1d4" }
];

export const THIRST_THRESHOLDS = [
  { at: 100, label: "Hydrated", modifiers: {} },
  { at: 80, label: "Dry", modifiers: {} },
  { at: 60, label: "Thirsty", modifiers: { special_per: -1 } },
  { at: 40, label: "Dehydrated", modifiers: { special_per: -2, special_agi: -1 } },
  { at: 20, label: "Severely Dehydrated", modifiers: { special_per: -3, special_agi: -3 } },
  { at: 0, label: "Dying of thirst", modifiers: { special_per: -3, special_agi: -3 }, hpDrainDice: "1d6" }
];

export const SLEEP_THRESHOLDS = [
  { at: 100, label: "Rested", modifiers: {} },
  { at: 80, label: "Tired", modifiers: {} },
  { at: 60, label: "Drowsy", modifiers: { special_int: -1 } },
  { at: 40, label: "Exhausted", modifiers: { special_int: -2, special_cha: -1 } },
  { at: 20, label: "Collapsing", modifiers: { special_int: -3, special_cha: -2 } },
  { at: 0, label: "Sleep Deprived", modifiers: { special_int: -2, special_cha: -2 }, hpDrainDice: "1d4" }
];

const THRESHOLD_TABLES = { hunger: HUNGER_THRESHOLDS, thirst: THIRST_THRESHOLDS, sleep: SLEEP_THRESHOLDS };

// A character created before this system shipped has no `needs` field at
// all — absent reads as fully sated, never as starving. Also tolerates a
// partially-written object (one need present, others missing).
export function normalizeNeeds(raw) {
  return {
    hunger: (raw && typeof raw.hunger === 'number') ? raw.hunger : 100,
    thirst: (raw && typeof raw.thirst === 'number') ? raw.thirst : 100,
    sleep: (raw && typeof raw.sleep === 'number') ? raw.sleep : 100
  };
}

// Walks descending and keeps the LAST tier the value still qualifies for
// (value <= t.at), so e.g. hunger 45 matches Famished (40) not Hungry (60).
export function getNeedTier(needKey, value) {
  const table = THRESHOLD_TABLES[needKey];
  let tier = table[0];
  for (const t of table) { if ((value ?? 100) <= t.at) tier = t; }
  return tier;
}

const clamp100 = (v) => Math.max(0, Math.min(100, v));

// Advances hunger/thirst/sleep by `hours` and returns both the new values
// and any HP damage owed from time spent AT ZERO. Damage only applies for
// the hours *after* a need bottoms out, not the whole span — otherwise
// advancing a week from full needs either does nothing (if only the first
// hour is checked) or wipes the party (if the whole week is charged). A
// character already at 0 when this is called takes damage for the entire
// span, which falls out of the same formula (hoursUntilEmpty = 0).
export function decayNeeds(needs, hours) {
  const current = normalizeNeeds(needs);
  const result = { needs: { ...current }, damage: { hunger: 0, thirst: 0, sleep: 0 } };
  if (hours <= 0) return result;

  for (const key of ['hunger', 'thirst', 'sleep']) {
    const rate = NEED_RATES[key];
    const startValue = current[key];
    const hoursUntilEmpty = rate > 0 ? startValue / rate : Infinity;
    const hoursAtZero = Math.max(0, hours - hoursUntilEmpty);
    if (hoursAtZero > 0) {
      const table = THRESHOLD_TABLES[key];
      const zeroTier = table[table.length - 1]; // the `at: 0` entry, carries hpDrainDice
      let dmg = 0;
      for (let h = 0; h < Math.floor(hoursAtZero); h++) dmg += rollDamage(zeroTier.hpDrainDice);
      result.damage[key] = dmg;
    }
    result.needs[key] = clamp100(startValue - rate * hours);
  }
  return result;
}

// Natural healing — manual p.136/446: "Roll a 1d10, and regain hp per hour
// up to the maximum of your EN." Rolled once per FULL hour elapsed
// (fractional leftover minutes don't generate a partial heal). A rest of
// 6+ hours multiplies the TOTAL by 1.5x per the manual's long-rest bonus;
// ordinary time advance (GM travel, not flagged as a rest) always heals at
// the base 1x rate — ties healing to every clock advance per the GM's
// call, while the long-rest bonus itself stays scoped to an actual rest.
export function rollRestHealing(healingCap, hours, isLongRest) {
  const fullHours = Math.floor(hours);
  if (fullHours <= 0 || healingCap <= 0) return 0;
  let total = 0;
  for (let h = 0; h < fullHours; h++) {
    total += Math.min(rollDamage("1d10"), healingCap);
  }
  if (isLongRest) total = Math.round(total * 1.5);
  return total;
}

// Single source of truth for turning a raw minute count into a display.
// Campaign starts at minute 480 so Day 1 opens at 08:00, not midnight.
export function formatGameTime(minutes) {
  const m = Math.max(0, Math.floor(minutes || 0));
  const day = Math.floor(m / 1440) + 1;
  const hourOfDay = Math.floor((m % 1440) / 60);
  const minOfHour = m % 60;
  const label = `DAY ${day} · ${String(hourOfDay).padStart(2, '0')}:${String(minOfHour).padStart(2, '0')}`;
  return { day, hourOfDay, minOfHour, label };
}
