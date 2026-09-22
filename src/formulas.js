// src/formulas.js
import { getTrait } from './traits.js';
import { getItem } from './items.js';
import { normalizeInventory } from './inventory.js';
import { getNeedTier } from './needs.js';
import { normalizeCondition, applyConditionToStat } from './condition.js';

// How far over carryCapacity a character is allowed to go before
// acquiring more items gets hard-blocked (trades, GM grants). Below
// this line, going over capacity is simply permitted — no penalty,
// per the GM's own call — the gauge just turns red as a warning.
export const CARRY_OVERAGE_ALLOWANCE = 1.10;

// activeStatusEffects: array of instances already living on the character
// (e.g. charData.status_effects), each shaped { name, modifiers: {...} }.
// Unlike traits/perks (looked up by id from a database), status effect
// instances already carry their own resolved modifiers, ad-hoc or from
// the status-effect library, so they need no lookup step here.
// `armorMarks` (added for the durability system, BALANCE_PROPOSAL.md §2.2)
// is the equipped body armor's own condition marks — deriveCharacter()
// reads it off normalizeCondition(char).worn.body so callers here never
// have to touch the raw condition field themselves. Defaults to 0
// (pristine) for the character-creation preview calls, which pass no
// equipment at all.
export function calculateDerivedStats(baseSpecial, level = 1, activeTraits = [], activePerks = [], race = 'human', activeStatusEffects = [], equipment = {}, rads = 0, inventory = {}, needs = {}, permanentSkillBonuses = {}, armorMarks = 0) {

  // --- 0. RACE DATA ---
  const raceDef = RACE_RULES[race] || RACE_RULES['human'];

  // Is a given item currently equipped in any slot?
  const isItemEquipped = (itemId) => Object.values(equipment || {}).includes(itemId);

  // --- 1. PRE-CALCULATION (Traits/Perks/Status Effects modifying SPECIAL) ---
  const allModifiers = [...(activeTraits || []), ...(activePerks || [])];
  // Radiation sickness is a pure function of the current rads count, not
  // a discrete applied/removed effect — recomputed fresh every time so
  // using RadAway (or anything else that changes rads) immediately
  // changes the debuff too, with nothing left over to manually cure.
  const radTier = getRadiationTier(rads);
  const radModifiers = { ...radTier.modifiers };
  if (radModifiers.max_hp_flat && radTier.maxHpExemptRaces && radTier.maxHpExemptRaces.includes(race)) {
    delete radModifiers.max_hp_flat; // manual: "No effect on Mutants" at the 400-rad tier
  }
  // Survival needs (hunger/thirst/sleep) fold in exactly like radiation —
  // a pure function of the current value, recomputed fresh every render,
  // nothing left over to manually cure once the need is restored.
  const hungerTier = getNeedTier('hunger', (needs || {}).hunger);
  const thirstTier = getNeedTier('thirst', (needs || {}).thirst);
  const sleepTier = getNeedTier('sleep', (needs || {}).sleep);
  // One combined list of resolved modifier objects, regardless of source.
  // A source with "suppressed_by_item" is a downside negated by wearing
  // something (e.g. Short-Sighted's -1 PER goes away while Glasses are
  // equipped) — filtered out here so neither pass below has to know about it.
  const modifierSources = [
    ...allModifiers.map(id => { const t = getTrait(id); return t ? { ...t, sourceType: t.type || 'trait' } : t; }),
    ...(activeStatusEffects || []).map(fx => ({ ...fx, sourceType: 'status' })),
    // Anonymous sources named/typed here (STATUS_AND_CRIPPLE_SPEC.md A.3)
    // so the provenance breakdown below can say *why* a number changed,
    // not just by how much. A tier contributing nothing (`modifiers: {}`)
    // still gets an entry — harmless, since the breakdown-building code
    // only ever emits a row for a modifier key that's actually present.
    { name: `Radiation (${rads} rads)`, sourceType: 'radiation', modifiers: radModifiers },
    { name: hungerTier.label, sourceType: 'need', modifiers: hungerTier.modifiers },
    { name: thirstTier.label, sourceType: 'need', modifiers: thirstTier.modifiers },
    { name: sleepTier.label, sourceType: 'need', modifiers: sleepTier.modifiers },
    // Skill books grant a flat, permanent skill_<name> bonus on first
    // read (see useItem()) that has to persist after the book itself is
    // consumed — so it lives on the character, not the inventory, and
    // rides the exact same skill_<name> merge loop below that traits and
    // perks already use. No new merge logic needed for this to work.
    // (A.3: naming which specific book(s) granted this is a view-layer
    // job — formulas.js only knows the summed total, not which books
    // exist — see views.js's Status tab.)
    { name: 'Skill books', sourceType: 'book', modifiers: permanentSkillBonuses }
  ].filter(source => !source || !source.suppressed_by_item || !isItemEquipped(source.suppressed_by_item));
  let healingRateBonus = 0;
  let special = { ...baseSpecial };

  // --- PROVENANCE (STATUS_AND_CRIPPLE_SPEC.md Part A) ---
  // Purely additive bookkeeping alongside the real calculation below — no
  // existing field changes, no existing caller breaks. `other` collects
  // anything that isn't a SPECIAL stat or a skill (AC, carry, melee
  // damage, healing rate, max HP), pushed at the exact site each one is
  // actually applied so the rows can never drift from the real numbers.
  const breakdown = {
    baseSpecial: { ...baseSpecial },
    skillsBase: {},
    special: {},
    skills: {},
    other: []
  };

  modifierSources.forEach(source => {
    if (source && source.modifiers) {
      const m = source.modifiers;
      const pushSpecial = (statKey, modKey) => {
        if (m[modKey]) {
          special[statKey] += m[modKey];
          (breakdown.special[statKey] = breakdown.special[statKey] || []).push({ source: source.name, sourceType: source.sourceType, value: m[modKey] });
        }
      };
      pushSpecial('str', 'special_str');
      pushSpecial('per', 'special_per');
      pushSpecial('end', 'special_end');
      pushSpecial('cha', 'special_cha');
      pushSpecial('int', 'special_int');
      pushSpecial('agi', 'special_agi');
      pushSpecial('luk', 'special_luk');
      if (m.healing_rate_bonus) healingRateBonus += m.healing_rate_bonus;
    }
  });

  // Apply Racial Modifiers to SPECIAL (if any exist)
  if (raceDef.modifiers) {
    if (raceDef.modifiers.str) special.str += raceDef.modifiers.str;
    if (raceDef.modifiers.per) special.per += raceDef.modifiers.per;
    if (raceDef.modifiers.end) special.end += raceDef.modifiers.end;
    if (raceDef.modifiers.cha) special.cha += raceDef.modifiers.cha;
    if (raceDef.modifiers.int) special.int += raceDef.modifiers.int;
    if (raceDef.modifiers.agi) special.agi += raceDef.modifiers.agi;
    if (raceDef.modifiers.luk) special.luk += raceDef.modifiers.luk;
  }

  // Enforce Racial Min/Max Caps
  const enforceBounds = (val, statKey) => {
    const min = raceDef.min[statKey];
    const max = raceDef.max[statKey];
    return Math.min(Math.max(val, min), max);
  };

  const str = enforceBounds(special.str, 'str');
  const per = enforceBounds(special.per, 'per');
  const end = enforceBounds(special.end, 'end');
  const cha = enforceBounds(special.cha, 'cha');
  const int = enforceBounds(special.int, 'int');
  const agi = enforceBounds(special.agi, 'agi');
  const luk = enforceBounds(special.luk, 'luk');

  // --- 2. DERIVED VITALS ---
  
  // AC / Sequence
  let armorClass = agi + (raceDef.stats?.ac_bonus || 0);
  let sequenceBonus = agi;
  if (raceDef.stats?.ac_bonus) breakdown.other.push({ source: raceDef.name, sourceType: 'race', key: 'ac_bonus', value: raceDef.stats.ac_bonus });

  // Equipped body armor's own AC is added on top of Agility — manual:
  // "The Armor Class from the armor is added with your Agility to
  // create your Total Armor Class." Previously never wired in, so every
  // armor piece's stats.ac sat as inert reference data regardless of
  // what was equipped.
  const equippedBodyArmor = getItem((equipment || {}).body);
  if (equippedBodyArmor && typeof equippedBodyArmor.stats?.ac === 'number') {
    // Condition wear scales the armor's own AC contribution (not the AGI
    // component), per §2.2's "AGI + round(ac x (1 - 0.05m))".
    const wornAcBonus = applyConditionToStat(equippedBodyArmor.stats.ac, armorMarks);
    armorClass += wornAcBonus;
    breakdown.other.push({ source: equippedBodyArmor.name, sourceType: 'equipment', key: 'ac_bonus', value: wornAcBonus });
  }

  // --- Carry Weight ---
  // The manual explicitly cuts carry weight as a system ("Removed
  // systems are things like... carry weight... this game is less about
  // math") — no in-manual formula exists, so this uses Fallout 1's
  // classic one instead, per the GM's own call: 25 + (STR * 25) lbs
  // base, before any equipped-gear bonus — converted to kg (the GM's
  // preferred unit) rather than re-derived, so the underlying game
  // balance/feel stays identical to the source formula, just correctly
  // labeled. Rounded to 1 decimal; item weights are in kg too.
  const LBS_TO_KG = 0.453592;
  const carryBase = Math.round((25 + str * 25) * LBS_TO_KG * 10) / 10;
  let carryBonus = 0;
  Object.values(equipment || {}).forEach(itemId => {
    if (!itemId) return;
    const eqItem = getItem(itemId);
    if (eqItem && typeof eqItem.stats?.carry_bonus === 'number') {
      carryBonus += eqItem.stats.carry_bonus;
      breakdown.other.push({ source: eqItem.name, sourceType: 'equipment', key: 'carry_bonus', value: eqItem.stats.carry_bonus });
    }
  });
  const carryCapacity = carryBase + carryBonus;

  // What's actually being carried: unequipped inventory (still a stacked
  // {itemId: qty} map) PLUS whatever's currently worn — equipping moves
  // an item OUT of the inventory map and into the equipment slot
  // reference, so both have to be summed or worn gear would read as
  // weightless. Items with no `weight` field yet (the vast majority,
  // until that numbering pass happens) contribute 0 — the gauge starts
  // near-empty and fills in as items get real numbers, never crashes.
  let carryUsed = 0;
  const invMap = normalizeInventory(inventory);
  Object.entries(invMap).forEach(([itemId, qty]) => {
    const invItem = getItem(itemId);
    if (invItem && typeof invItem.weight === 'number') carryUsed += invItem.weight * qty;
  });
  Object.values(equipment || {}).forEach(itemId => {
    if (!itemId) return;
    const eqItem = getItem(itemId);
    if (eqItem && typeof eqItem.weight === 'number') carryUsed += eqItem.weight;
  });

  // Melee Damage Base (Melee Weapons)
  let meleeDamageBase = Math.max(1, str - 5);

  // Unarmed Base Damage (Some races have 2d4 base)
  let unarmedBaseDmg = raceDef.stats?.unarmed_base || "1d4"; // Default human is usually 1d3 or 1d4
  let unarmedDamageFull = `${unarmedBaseDmg} + ${meleeDamageBase}`;

  // Hit Points (Gergasi gets +3 per level)
  const baseHpPerLevel = 3 + Math.floor(end * 0.5);
  const hpBonus = raceDef.stats?.hp_bonus_per_level || 0;
  const hpPerLevel = baseHpPerLevel + hpBonus;

  // Total Max HP — manual formula (p.31): 15 + (STR + 2*END) at creation,
  // then +hpPerLevel for each level gained after level 1.
  const baseHp = 15 + str + (2 * end);
  let maxHpCalculated = baseHp + ((level - 1) * hpPerLevel);
  // Summed across every source now, not just radiation — Starving/Dehydrated
  // tiers carry max_hp_flat too (see needs.js), same as the 400+ rad tiers.
  const totalMaxHpFlat = modifierSources.reduce((sum, s) => {
    const v = (s && s.modifiers && s.modifiers.max_hp_flat) || 0;
    if (v) breakdown.other.push({ source: s.name, sourceType: s.sourceType, key: 'max_hp_flat', value: v });
    return sum + v;
  }, 0);
  if (totalMaxHpFlat) maxHpCalculated = Math.max(1, maxHpCalculated + totalMaxHpFlat);

  // Resistances
  let poisonRes = (end * 5) + (raceDef.stats?.poison_res || 0);
  let radRes = (end * 2) + (raceDef.stats?.rad_res || 0);
  let damageRes = raceDef.stats?.damage_res || 0; // Natural Armor (Gergasi/Robot)
  if (raceDef.stats?.damage_res) breakdown.other.push({ source: raceDef.name, sourceType: 'race', key: 'damage_res', value: raceDef.stats.damage_res });

  // Manual p.446: "Limb Resistance - EN/2 (round down) — 5 would mean 5
  // attacks needed to cripple a limb." Floored at 1 so a 1-EN character
  // doesn't get a 0-resistance limb that cripples on contact (or,
  // worse, divides by zero downstream once the cripple counter lands).
  const limbResistance = Math.max(1, Math.floor(end / 2));

  // Manual gives no numeric Robot implant limit ("increased resistance... come
  // naturally" is the only text) — using a modest placeholder bonus over the
  // standard formula rather than the old hardcoded 99, which would render as
  // 99 empty implant slots in the UI. Easy to change.
  const implantLimit = (race === 'robot') ? Math.floor(end / 3) + 3 : Math.floor(end / 3);
  const skillPointsPerLevel = 5 + (int * 3);

  // Perks Allowance (For UI display)
  const levelsPerPerk = raceDef.stats?.levels_per_perk || 2;
  const perksAllowed = (levelsPerPerk === 0) ? 0 : Math.floor(level / levelsPerPerk);

  // --- 3. SKILL CALCULATIONS ---
  const skills = {
    // Combat
    small_guns:     5 + per + per,
    big_guns:       str + per + agi,
    energy_weapons: 5 + per + int,
    melee_weapons:  str + agi,
    throwing:       Math.floor((1.5 * str) + (0.5 * agi)),
    unarmed:        str + agi,

    // Stealth
    sneak:          agi + agi,
    steal:          5 + agi + agi,
    lockpick:       5 + per + agi,
    traps:          per + agi + int,

    // Science
    medicine:       int + per,
    science:        5 + int + int,
    engineering:    5 + (int * 1.5) + (agi * 0.5),
    robotics:       int + int,
    gunsmith:       per + agi + int,
    // Not in the manual's skill list; Fallout 2's formula (GM ruling 2026-09-22).
    repair:         int * 3,

    // Soft Skills
    speech:         5 + cha + cha,
    instinct:       Math.floor((str + per + end + cha + int + agi + luk) / 3),
    survival:       5 + agi + agi
  };
  // A.2/A.4: the skill numbers as computed above, before any post-calc
  // modifier (trait/perk/status/skill-book) is folded in — the Status
  // screen's "SMALL GUNS 15 → 6" needs both ends of that arrow.
  breakdown.skillsBase = { ...skills };

  // --- 4. POST-CALCULATION MODIFIERS (traits, perks, and status effects alike) ---
  modifierSources.forEach(source => {
    if (source && source.modifiers) {
      const m = source.modifiers;
      const pushOther = (key) => { if (m[key]) breakdown.other.push({ source: source.name, sourceType: source.sourceType, key, value: m[key] }); };
      if (m.ac_bonus) armorClass += m.ac_bonus;
      if (m.sequence_bonus) sequenceBonus += m.sequence_bonus;
      if (m.melee_dmg_flat) meleeDamageBase += m.melee_dmg_flat;
      pushOther('ac_bonus');
      pushOther('sequence_bonus');
      pushOther('melee_dmg_flat');
      if (m.healing_rate_bonus) pushOther('healing_rate_bonus');

      Object.keys(skills).forEach(skillName => {
        const modKey = `skill_${skillName}`;
        if (m[modKey]) {
          skills[skillName] += m[modKey];
          (breakdown.skills[skillName] = breakdown.skills[skillName] || []).push({ source: source.name, sourceType: source.sourceType, value: m[modKey] });
        }
      });
    }
  });

  return {
    special: { str, per, end, cha, int, agi, luk },
    armorClass,
    carryCapacity,
    carryUsed,
    sequenceBonus,
    meleeDamageBase,
    unarmedDamageFull,
    hpPerLevel,
    maxHpCalculated,
    poisonRes,
    radRes,
    damageRes,
    limbResistance,
    implantLimit,
    skillPointsPerLevel,
    perksAllowed,
    skills,
    breakdown,
    // Manual p.446: "Roll a 1d10, and regain hp per hour up to the maximum
    // of your EN" — EN after all modifiers (including the needs tiers just
    // folded in above), plus any healing_rate_bonus perks (Faster Healing,
    // Rad Child, Cancerous Growth). Consumed by needs.js's rollRestHealing.
    healingRateCap: Math.max(0, end + healingRateBonus),
    needTiers: { hunger: hungerTier, thirst: thirstTier, sleep: sleepTier },
    raceDef // Export rules so View can check flags (like 'can_wear_small_armor')
  };
}

// --- RADIATION (manual's threshold table) ---
// Each tier's `description` is deliberately the vague, in-character
// symptom text — this is what a player sees by default (no number),
// matching "only a Geiger Counter tells you the real count." The GM
// (and eventually a player with the right item/permission) sees the
// exact rads number instead. `modifiers` folds into the same
// trait/perk/status-effect pass calculateDerivedStats already runs.
export const RAD_THRESHOLDS = [
  { rads: 0, description: "No detectable radiation sickness.", modifiers: {} },
  { rads: 100, description: "You feel tired for some reason.", modifiers: { special_end: -1 } },
  { rads: 200, description: "You feel weak. Your bones ache and your skin itches — sunburn-like rashes are starting to show.", modifiers: { special_end: -2 } },
  { rads: 400, description: "You feel a lot weaker. Your joints hurt and feel sluggish, your skin itches, and small open sores are developing. Your hair is starting to fall out.", modifiers: { special_str: -1, special_end: -2, special_agi: -1, max_hp_flat: -10 }, maxHpExemptRaces: ['gergasi', 'half_mutant'] },
  { rads: 600, description: "You're vomiting and have diarrhea. Everything hurts, and your hair is falling out in clumps. At night, you start to glow.", modifiers: { special_str: -2, special_end: -2, special_cha: -1, special_agi: -2, max_hp_flat: -20 } },
  { rads: 800, description: "You're vomiting blood and bloody diarrhea. Your hair is completely gone, and your skin is starting to hang as the cellular damage sets in. Untreated, you have 72 hours.", modifiers: { special_str: -5, special_end: -5, special_cha: -3, special_agi: -4, max_hp_flat: -30 } },
  { rads: 1000, description: "Fatal radiation exposure.", modifiers: {} }
];

export function getRadiationTier(rads) {
  let tier = RAD_THRESHOLDS[0];
  for (const t of RAD_THRESHOLDS) { if ((rads || 0) >= t.rads) tier = t; }
  return tier;
}

// --- RACE DEFINITIONS ---
export const RACE_RULES = {
  human: {
    id: "human",
    name: "Human",
    description: "The humans of the wasteland are the most numerous creatures you can find. Hardy, resilient and accepted everywhere, humans come in all shapes and sizes, and are perfectly capable of both great kindness and unspeakable evil. Because humans are generally accepted, they can join any faction and enjoy the most amount of perks. New players are recommended to start here. Gains no stat bonuses or penalties.",
    min: { str: 1, per: 1, end: 1, cha: 1, int: 1, agi: 1, luk: 1 },
    max: { str: 10, per: 10, end: 10, cha: 10, int: 10, agi: 10, luk: 10 },
    stats: {
      levels_per_perk: 1
    },
    flags: {
      can_use_stimpaks: true,
      can_wear_small_armor: true,
      can_use_small_weapons: true
    }
  },
  ghoul: {
    id: "ghoul",
    name: "Ghoul",
    description: "Ghouls are unfortunate humans, born from overexposure to radiation. Feral and sometimes lacking in mental faculties, the ‘lucky’ ones are the only ones people don’t shoot on sight. Haunted by their own bodies decaying, flaking flesh, these ghouls were born en masse after the war lacking radioactive protection. Ghouls above the age of 100 gain an extra tag skill and must embellish a background story that reflects pre-war knowledge. They innately have 30% Poison Resistance (PR) and 80% Radiation Resistance (RR). If ghouls go above HIGH radiation levels (this means we should conceptualise a radiation level visual for the character dashboard) they must roll IN every 30 minutes or they lose control and become feral. At VERY HIGH Radiation they become feral.",
    min: { str: 1, per: 4, end: 1, cha: 1, int: 2, agi: 1, luk: 5 },
    max: { str: 8, per: 13, end: 10, cha: 10, int: 10, agi: 6, luk: 12 },
    stats: {
      poison_res: 30,
      rad_res: 80,
      levels_per_perk: 2
    },
    flags: {
      can_use_stimpaks: true,
      can_wear_small_armor: true,
      can_use_small_weapons: true,
      is_radioactive: true // Trigger for Feral checks
    }
  },
  gergasi: {
    id: "gergasi",
    name: "Gergasi (Super Mutant)",
    description: "HThe Gergasi is a beast, a fairytale monster come to life. It is not clear how these have been born or how they continue to pop up, but the Gergasi have been known to occasionally wander the Peninsula. While considered radiated monstrosities (even as they are not), due to their size they have been mostly accepted as laborers or mercenaries. Gergasi are the largest playable race, and as such may not use small one handed weapons. They may wield two handed weapons as one handed at -10% hit chance. They may also not wear armor made for humans but must find larger pieces. Gains advantage on Intimidation checks.",
    min: { str: 5, per: 1, end: 4, cha: 1, int: 1, agi: 1, luk: 1 },
    max: { str: 13, per: 11, end: 11, cha: 7, int: 11, agi: 8, luk: 10 },
    stats: {
      damage_res: 10, // +10% DR
      hp_bonus_per_level: 3,
      unarmed_base: "2d4",
      levels_per_perk: 3
    },
    flags: {
      can_use_stimpaks: true,
      can_wear_small_armor: false, // Cannot wear human armor
      can_use_small_weapons: false, // No pistols
      titan_grip: true // Can use 2H as 1H
    }
  },
  half_mutant: {
    id: "half_mutant",
    name: "Half Mutant",
    description: "Half mutants are usually born from the union between a human and a radioactive creature, further mutated by the wastes and the hazards within. The Half Mutant must make a special background perk with accompanying story, but otherwise is shunned by both radioactive creatures and human beings for being crimes against nature. This will be their disfigurement, and is what makes half-mutants monsters in the eyes of many. They always roll a CH check when talking to humans and always roll speech and charisma checks at disadvantage, unless it is intimidation.",
    min: { str: 3, per: 1, end: 2, cha: 1, int: 1, agi: 1, luk: 3 },
    max: { str: 12, per: 10, end: 11, cha: 10, int: 10, agi: 10, luk: 12 },
    stats: {
      poison_res: 15,
      rad_res: 15,
      unarmed_base: "2d4",
      levels_per_perk: 2
    },
    flags: {
      can_use_stimpaks: true,
      can_wear_small_armor: true,
      can_use_small_weapons: true,
      social_stigma: true // GM Note: Disadvantage on CHA
    }
  },
  robot: {
    id: "robot",
    name: "Robot",
    description: "Robots in Fallout live an existence of curious subservience amidst the inspiration of existence. Bound by their hardware limitations, robots roaming the Peninsula are ones freed by unwitting travellers or activated through unintended power surges or defensive mechanisms. Robots alone are often curiosities and prone to getting stolen from or straight out disabled for parts.Increased damage resistance and hardy limbs come naturally, but you may not take perks and can only upgrade yourself. You also must be repaired to gain hp and cannot wear armor.",
    min: { str: 3, per: 1, end: 2, cha: 1, int: 1, agi: 1, luk: 3 },
    max: { str: 12, per: 10, end: 11, cha: 10, int: 10, agi: 10, luk: 10 },
    stats: {
      poison_res: 100,
      rad_res: 100,
      damage_res: 0, // Adjustable via Upgrades later
      levels_per_perk: 0 // Cannot take perks
    },
    flags: {
      can_use_stimpaks: false,
      can_wear_small_armor: false, 
      can_use_small_weapons: true,
      needs_repairs: true
    }
  }
};
// A character doc's full derived stats, including the two skill sources
// calculateDerivedStats() doesn't see: points spent at level-up
// (skill_ranks) and the +20 tag bonus. Every roll, check, crafting
// requirement and display goes through here, so the number a player
// reads on their sheet is the number they roll against.
export function deriveCharacter(char) {
  const armorMarks = normalizeCondition(char).worn.body || 0;
  const derived = calculateDerivedStats(
    char.special, char.level || 1, char.traits || [], char.perks || [],
    char.race || 'human', char.status_effects || [], char.equipment || {},
    char.rads || 0, char.inventory || {}, char.needs || {}, char.permanent_skill_bonuses || {},
    armorMarks
  );
  Object.keys(derived.skills).forEach(key => {
    derived.skills[key] += (char.skill_ranks?.[key] || 0) + (char.tags?.[key] ? 20 : 0);
  });
  return derived;
}
