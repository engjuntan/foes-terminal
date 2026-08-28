// src/formulas.js
import { getTrait } from './traits.js';

export function calculateDerivedStats(baseSpecial, level = 1, activeTraits = [], activePerks = [], race = 'human') {
  
  // --- 0. RACE DATA ---
  const raceDef = RACE_RULES[race] || RACE_RULES['human'];

  // --- 1. PRE-CALCULATION (Traits modifying SPECIAL) ---
  const allModifiers = [...(activeTraits || []), ...(activePerks || [])];
  let special = { ...baseSpecial };

  allModifiers.forEach(traitId => {
    const traitDef = getTrait(traitId);
    if (traitDef && traitDef.modifiers) {
      if (traitDef.modifiers.special_str) special.str += traitDef.modifiers.special_str;
      if (traitDef.modifiers.special_per) special.per += traitDef.modifiers.special_per;
      if (traitDef.modifiers.special_end) special.end += traitDef.modifiers.special_end;
      if (traitDef.modifiers.special_cha) special.cha += traitDef.modifiers.special_cha;
      if (traitDef.modifiers.special_int) special.int += traitDef.modifiers.special_int;
      if (traitDef.modifiers.special_agi) special.agi += traitDef.modifiers.special_agi;
      if (traitDef.modifiers.special_luk) special.luk += traitDef.modifiers.special_luk;
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
  const maxHpCalculated = baseHp + ((level - 1) * hpPerLevel);

  // Resistances
  let poisonRes = (end * 5) + (raceDef.stats?.poison_res || 0);
  let radRes = (end * 2) + (raceDef.stats?.rad_res || 0);
  let damageRes = raceDef.stats?.damage_res || 0; // Natural Armor (Gergasi/Robot)

  const implantLimit = (race === 'robot') ? 99 : Math.floor(end / 3);
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

    // Soft Skills
    speech:         5 + cha + cha,
    instinct:       Math.floor((str + per + end + cha + int + agi + luk) / 3),
    survival:       5 + agi + agi
  };

  // --- 4. POST-CALCULATION MODIFIERS ---
  allModifiers.forEach(traitId => {
    const traitDef = getTrait(traitId);
    if (traitDef && traitDef.modifiers) {
      if (traitDef.modifiers.ac_bonus) armorClass += traitDef.modifiers.ac_bonus;
      if (traitDef.modifiers.sequence_bonus) sequenceBonus += traitDef.modifiers.sequence_bonus;
      if (traitDef.modifiers.melee_dmg_flat) meleeDamageBase += traitDef.modifiers.melee_dmg_flat;
      
      Object.keys(skills).forEach(skillName => {
        const modKey = `skill_${skillName}`;
        if (traitDef.modifiers[modKey]) {
          skills[skillName] += traitDef.modifiers[modKey];
        }
      });
    }
  });

  return {
    special: { str, per, end, cha, int, agi, luk },
    armorClass,
    sequenceBonus,
    meleeDamageBase,
    unarmedDamageFull,
    hpPerLevel,
    maxHpCalculated,
    poisonRes,
    radRes,
    damageRes,
    implantLimit,
    skillPointsPerLevel,
    perksAllowed,
    skills,
    raceDef // Export rules so View can check flags (like 'can_wear_small_armor')
  };
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