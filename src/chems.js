// src/chems.js
// Pure chem-system logic: hour-based buff/withdrawal expiry and the
// addiction roll, kept out of controllers.js the same way needs.js and
// checks.js stay pure and Firestore-free (see those files' own headers).
// Fallout 1/2's model, per the GM's approval (promotes the "chem
// durations" parking-lot item off TIME_AND_NEEDS_SPEC.md §8 /
// STATUS_AND_CRIPPLE_SPEC.md's "Out of scope").
//
// The shape of it:
//   - Using a chem with `duration_hours` grants a BUFF status effect
//     that expires on the WORLD CLOCK (hours), not combat rounds.
//     `expires_at_minutes` is a new field any status-effect instance can
//     carry for this — an absolute world.minutes value, not a countdown,
//     so it survives however advanceTime() is later chunked up. Existing
//     `duration_turns` effects (combat rounds, ticked in endTurn()) are
//     a completely separate axis and this never touches them.
//   - When a buff with a `withdrawal: {id, duration_hours}` expires, it
//     hands off to a WITHDRAWAL status effect — a separate, longer,
//     negative effect with its own clock, looked up from
//     statusEffectDatabase by the withdrawal's own id.
//   - Using an addictive chem (item.addiction_chance, 0-100) rolls a
//     chance of gaining a persistent "Addicted — <chem>" status effect
//     that does NOT expire on its own. Its id follows the fixed
//     convention `addicted_<itemId>` — no extra item field needed to
//     link a chem to its own addiction status; the vault only has to
//     author a status effect at that id for the addiction to carry real
//     penalties (absent, it still applies, just inert — same "safe
//     default" as an unauthored buff).

// Item stat keys that are never a buff modifier, even though several of
// them are numeric — everything else numeric on `item.stats` is read
// straight through as a status-effect modifier (special_str,
// skill_small_guns, ac_bonus, ...), exactly the keys
// calculateDerivedStats() already understands from traits/perks/status
// effects. This means an unauthored chem (today, every one of them —
// their "buff"/"debuff"/"duration" fields are prose STRINGS, not
// numbers) grants an inert, numberless timed status: it still shows up
// on the STATUS tab and still expires on schedule, it just has nothing
// to apply until the vault adds real numeric modifiers alongside
// `duration_hours`.
const NON_MODIFIER_STAT_KEYS = new Set([
  'heal', 'hunger', 'thirst', 'sleep', 'rad_removed', 'rad_added',
  'permanent', 'cures_addiction', 'cures_status', 'buff', 'debuff',
  'duration', 'dmg', 'dmgType'
]);

export function extractChemBuffModifiers(stats) {
  const out = {};
  Object.entries(stats || {}).forEach(([key, value]) => {
    if (NON_MODIFIER_STAT_KEYS.has(key) || typeof value !== 'number') return;
    out[key] = value;
  });
  return out;
}

// How many in-game days of not re-using a chem clears its addiction on
// its own — the third cure route, alongside Addictol and a Medicine
// check (see computeCureAddiction() in controllers.js). One named place
// to tune — the GM's call; the manual gives no chem-specific "clean"
// duration.
export const CHEM_ADDICTION_CLEAN_DAYS = 7;

// Difficulty tier (checks.js's DIFFICULTY_TIERS) for "a Medicine check
// by another character" curing an addiction — harder than the limb-
// treatment Medicine check (DIFFICULTY_TIERS.normal, DC 20, "Average" in
// the manual), since breaking an addiction is a bigger ask than setting
// a bone. One named place to tune.
export const CHEM_ADDICTION_MEDICINE_TIER = 'difficult';

// Builds the buff status-effect instance useItem() grants when a chem
// carries `duration_hours`. `nowMinutes` is the world clock AT THE
// MOMENT OF USE (world.minutes) — expiry is stored as an absolute clock
// value so it's correct regardless of how advanceTime() is later called.
// Returns null for a chem with no duration_hours (or 0) — the majority
// of consumables, which this system must leave completely alone.
export function buildChemBuffInstance(item, nowMinutes) {
  const hours = Number(item.duration_hours);
  if (!hours || hours <= 0) return null;
  const withdrawal = item.withdrawal && item.withdrawal.id ? item.withdrawal : null;
  return {
    id: `chembuff_${item.id}_${Date.now()}`,
    source_id: item.id,
    name: item.name,
    modifiers: extractChemBuffModifiers(item.stats),
    ticking: false,
    applied_at: Date.now(),
    expires_at_minutes: nowMinutes + hours * 60,
    ...(withdrawal ? {
      withdrawal_id: withdrawal.id,
      withdrawal_duration_hours: Number(withdrawal.duration_hours) || 0
    } : {})
  };
}

// Builds the withdrawal instance that replaces an expired buff carrying
// a withdrawal spec. `withdrawalDef` is the vault-authored status effect
// (statusEffectDatabase[expiredBuffFx.withdrawal_id]) — tolerated as
// undefined so an item naming a withdrawal the vault hasn't authored yet
// still expires cleanly instead of throwing; the gap shows up as a
// nameless, numberless timed status on the STATUS tab rather than being
// silently swallowed. The withdrawal's own expiry is anchored to the
// EXPIRED BUFF's exact expiry minute (not "now"), so it's correct even
// when a single time advance spans well past both clocks.
export function buildWithdrawalInstance(expiredBuffFx, withdrawalDef) {
  const hours = expiredBuffFx.withdrawal_duration_hours || 0;
  return {
    id: `withdrawal_${expiredBuffFx.withdrawal_id}_${Date.now()}`,
    source_id: expiredBuffFx.withdrawal_id,
    name: (withdrawalDef && withdrawalDef.name) || `${expiredBuffFx.name} Withdrawal`,
    modifiers: (withdrawalDef && withdrawalDef.modifiers) || {},
    ticking: false,
    applied_at: Date.now(),
    expires_at_minutes: expiredBuffFx.expires_at_minutes + hours * 60
  };
}

// Splits a character's status effects into what survives an hour-based
// time advance and what just expired, given the clock value AFTER the
// advance (`nowMinutes`). Effects with no `expires_at_minutes` (the vast
// majority — everything that isn't a timed chem buff/withdrawal) always
// pass straight through untouched.
export function splitExpiredByHour(statusEffects, nowMinutes) {
  const remaining = [];
  const expired = [];
  (statusEffects || []).forEach(fx => {
    if (fx.expires_at_minutes !== undefined && fx.expires_at_minutes <= nowMinutes) {
      expired.push(fx);
    } else {
      remaining.push(fx);
    }
  });
  return { remaining, expired };
}

// Rolls a chem's addiction_chance (0-100, e.g. 35 means 35%). Absent or
// zero chance never addicts — every non-addictive item simply has no
// `addiction_chance` field at all.
export function rollAddictionChance(chancePct) {
  const chance = Number(chancePct) || 0;
  if (chance <= 0) return false;
  return Math.random() * 100 < chance;
}

// See the file header — the fixed id convention linking a chem to its
// own addiction status effect, with no extra item field required.
export function addictionStatusId(itemId) {
  return `addicted_${itemId}`;
}

// Builds a fresh addiction instance. `nowMinutes` seeds
// `applied_at_minutes`, the clock the "stayed clean" cure counts from —
// re-using the chem while already addicted resets this (see useItem()),
// since using it again is the opposite of staying clean.
export function buildAddictionInstance(item, addictionDef, nowMinutes) {
  return {
    id: `${addictionStatusId(item.id)}_${Date.now()}`,
    source_id: addictionStatusId(item.id),
    name: (addictionDef && addictionDef.name) || `Addicted — ${item.name}`,
    modifiers: (addictionDef && addictionDef.modifiers) || {},
    ticking: false,
    is_addiction: true,
    applied_at: Date.now(),
    applied_at_minutes: nowMinutes
  };
}

// Third cure route: staying clean CHEM_ADDICTION_CLEAN_DAYS in-game days
// clears an addiction with no roll and no item spent. Kept as its own
// pass (rather than folded into splitExpiredByHour) because it works off
// days-since-applied rather than an absolute expiry, and because
// re-using the chem resets `applied_at_minutes` in place instead of the
// instance being replaced outright (see useItem()).
export function splitCuredAddictionsByTime(statusEffects, nowMinutes, cleanDays = CHEM_ADDICTION_CLEAN_DAYS) {
  const remaining = [];
  const cured = [];
  (statusEffects || []).forEach(fx => {
    if (fx.is_addiction && typeof fx.applied_at_minutes === 'number') {
      const daysSince = (nowMinutes - fx.applied_at_minutes) / 1440;
      if (daysSince >= cleanDays) { cured.push(fx); return; }
    }
    remaining.push(fx);
  });
  return { remaining, cured };
}
