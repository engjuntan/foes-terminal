// src/reputationContent.js
// Hand-authored reputation & karma content — modelled on Fallout 2's
// per-town/faction reputation (named tiers, not raw numbers shown to
// players) plus a separate personal karma track. Not auto-synced from
// Obsidian; this is fixed rules content, edited directly here, the same
// way SPECIAL_FLAVOR in goatContent.js is hand-written.
//
// Tier table and buy/sell modifiers are BALANCE_PROPOSAL.md §5
// ("Reputation (six tiers, Antipathy removed)"), as amended by the GM's
// 2026-09-22 ruling to drop the Antipathy tier. Slider range is -100..100
// per SCOPE_DECISIONS.md. `buy_mod`/`sell_mod` are kept as data for the
// future shop (see getReputationModifiers below) — nothing in this build
// spends them yet.

// --- REPUTATION (per faction/town) ---
// Descending by `min` so getReputationTier can do a simple "first tier
// whose min the value clears" walk, same shape as RAD_THRESHOLDS in
// formulas.js and HUNGER_THRESHOLDS in needs.js.
export const REPUTATION_TIERS = [
  {
    id: "idolized",
    name: "Idolized",
    min: 70,
    max: 100,
    description: "They'd take a bullet for you. Doors open before you knock, and old grudges against the people you vouch for get quietly forgotten.",
    effect: "Access to hidden stock, and they'll still sell you T2+ goods for RMR even during a currency shock. Buy prices −15%, sell prices +10%.",
    buy_mod: -0.15,
    sell_mod: 0.10,
    image_url: ""
  },
  {
    id: "liked",
    name: "Liked",
    min: 40,
    max: 69,
    description: "You're one of the good ones around here. People go out of their way to help, and word of your name travels ahead of you — mostly in your favor.",
    effect: "Trades at the official exchange rate. Buy prices −10%, sell prices +5%.",
    buy_mod: -0.10,
    sell_mod: 0.05,
    image_url: ""
  },
  {
    id: "accepted",
    name: "Accepted",
    min: 15,
    max: 39,
    description: "You're not a stranger anymore. They'll deal with you the same as anyone else — no better, no worse.",
    effect: "Buy prices −5%. No other special treatment.",
    buy_mod: -0.05,
    sell_mod: 0,
    image_url: ""
  },
  {
    id: "neutral",
    name: "Neutral",
    min: -14,
    max: 14,
    description: "Nobody's heard much about you, good or bad. You're just another face passing through.",
    effect: "No price adjustment either way.",
    buy_mod: 0,
    sell_mod: 0,
    image_url: ""
  },
  {
    id: "hated",
    name: "Hated",
    min: -49,
    max: -15,
    description: "Word's gotten around, and it isn't good. Doors close a little faster when you're around, and some won't deal with you at all.",
    effect: "Buy prices +20%, sell prices −10%. May refuse to trade with you outright.",
    buy_mod: 0.20,
    sell_mod: -0.10,
    image_url: ""
  },
  {
    id: "vilified",
    name: "Vilified",
    min: -100,
    max: -50,
    description: "You're marked. They'd sooner put a bullet in you than shake your hand, and anyone caught helping you risks the same treatment.",
    effect: "Refuses ordinary trade. Only the black market will deal with you — and only at black market prices.",
    buy_mod: null,
    sell_mod: null,
    image_url: ""
  }
];

export const REPUTATION_MIN = -100;
export const REPUTATION_MAX = 100;

// A party-wide entity (faction/town) has no reputation entry at all until
// the GM first touches its slider — absent reads as exactly 0 (Neutral),
// same "missing = safe default" convention as normalizeNeeds/normalizeCondition.
export function getReputationTier(value) {
  const v = Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, Math.round(Number(value) || 0)));
  let tier = REPUTATION_TIERS[REPUTATION_TIERS.length - 1]; // Vilified, the lowest
  for (const t of REPUTATION_TIERS) { if (v >= t.min) { tier = t; break; } }
  return tier;
}

// Reads a single entity's reputation value out of the live doc, tolerating
// every level of absence (no `reputation` field at all, or the field
// present but missing this entity).
export function getReputationValue(liveData, entityId) {
  const rep = (liveData && liveData.reputation) || {};
  return typeof rep[entityId] === 'number' ? rep[entityId] : 0;
}

// What the future shop calls: the tier plus its buy/sell modifiers for one
// entity, resolved straight from the live doc so callers never have to
// duplicate the "missing = 0 = Neutral" lookup themselves.
export function getReputationModifiers(entityId, liveData) {
  const value = getReputationValue(liveData, entityId);
  const tier = getReputationTier(value);
  return { value, tier, buy_mod: tier.buy_mod, sell_mod: tier.sell_mod, refuses_trade: tier.buy_mod === null };
}

// The GM-editable roster of factions/towns tracked for reputation. Seeded
// with the party's current known contacts the first time anything reads
// or writes `reputation_entities` and finds it absent — see
// normalizeReputationEntities. The GM can add/rename/remove from here in
// the GM view; nothing about this list is hardcoded elsewhere.
export const DEFAULT_REPUTATION_ENTITIES = [
  { id: "rakan_watch", name: "Rakan Watch" },
  { id: "triad_1414", name: "1414 Triad" },
  { id: "axe_gang", name: "Axe Gang" },
  { id: "bandawang_enforcers", name: "Bandawang Enforcers" },
  { id: "the_federation", name: "The Federation" },
  { id: "the_protectorate", name: "The Protectorate" },
  { id: "the_caliphate", name: "The Caliphate" }
];

export function normalizeReputationEntities(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw;
  return DEFAULT_REPUTATION_ENTITIES;
}

// --- KARMA (per character) ---
// Fallout 2's own karma track runs roughly -1000..1000 across a dozen-odd
// titles gated by both karma AND a handful of story flags. This build
// keeps the *style* — a short ladder of in-world titles, not a number —
// but simplifies the range to -100..100 to match the reputation slider
// (same GM tooling, same mental model) and drops the story-flag gating
// entirely: karma alone decides the title. State it here since it's a
// deliberate simplification, not an oversight.
export const KARMA_TIERS = [
  {
    id: "guardian_angel",
    name: "Guardian Angel",
    min: 60,
    max: 100,
    description: "Strangers tell stories about you around the fire. Whatever you did, it mattered enough to become legend.",
    image_url: ""
  },
  {
    id: "do_gooder",
    name: "Do-Gooder",
    min: 20,
    max: 59,
    description: "You've helped more than you've hurt, and it shows — small kindnesses people remember and mention to their friends.",
    image_url: ""
  },
  {
    id: "nobody",
    name: "Nobody",
    min: -19,
    max: 19,
    description: "You haven't done enough of anything for the wasteland to have an opinion of you yet.",
    image_url: ""
  },
  {
    id: "troublemaker",
    name: "Troublemaker",
    min: -59,
    max: -20,
    description: "You cut corners and people get hurt for it. That's earned you a reputation nobody's proud of.",
    image_url: ""
  },
  {
    id: "menace",
    name: "Menace",
    min: -100,
    max: -60,
    description: "Your name gets spat out like a curse. You've hurt too many people for anyone to believe it wasn't on purpose.",
    image_url: ""
  }
];

export const KARMA_MIN = -100;
export const KARMA_MAX = 100;

export function getKarmaTier(value) {
  const v = Math.max(KARMA_MIN, Math.min(KARMA_MAX, Math.round(Number(value) || 0)));
  let tier = KARMA_TIERS[KARMA_TIERS.length - 1]; // Menace, the lowest
  for (const t of KARMA_TIERS) { if (v >= t.min) { tier = t; break; } }
  return tier;
}

// A character created before this system shipped has no `karma` field —
// absent reads as exactly 0 (Nobody), never as good or evil.
export function getKarmaValue(char) {
  return (char && typeof char.karma === 'number') ? char.karma : 0;
}
