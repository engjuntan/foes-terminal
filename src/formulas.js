// formulas.js - Fixed Sequence & Added Melee Damage
import { getTrait } from './traits.js';

export function calculateDerivedStats(baseSpecial, level = 1, activeTraits = [], activePerks = []) {
  
  // --- 0. PRE-CALCULATION ---
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

  const { str, per, end, cha, int, agi, luk } = special;

  // --- 1. DERIVED VITALS ---
  let armorClass = agi; 
  
  // FIX: Sequence is now STATIC (Perception * 2 is classic, or use AGI if you prefer)
  // Your previous note said "Base is just AG", so we will use that for stability.
  let sequenceBonus = agi; 

  // MELEE DAMAGE: (Strength - 5), Minimum of 1
  let meleeDamageBase = Math.max(1, str - 5);

  const hpPerLevel = 3 + Math.floor(end * 0.5);
  const poisonRes = end * 5;
  const radRes = end * 2;
  const implantLimit = Math.floor(end / 3);
  const skillPointsPerLevel = 5 + (int * 3);

  // --- 2. SKILL CALCULATIONS ---
  const skills = {
    // Combat
    small_guns:     5 + per + per,
    big_guns:       str + per + agi,
    energy_weapons: 5 + per + int,
    melee_weapons:  20 + (2 * (agi + str)),
    throwing:       Math.floor((1.5 * str) + (0.5 * agi)),
    unarmed:        30 + (2 * (agi + str)),

    // Stealth
    sneak:          5 + (3 * agi),
    steal:          5 + agi + agi,
    lockpick:       10 + per + agi,
    traps:          per + agi + int,

    // Science
    medicine:       int + per,
    science:        5 + (4 * int),
    engineering:    5 + (int * 2) + (agi * 0.5),
    robotics:       int + int,
    gunsmith:       per + agi + int,

    // Soft Skills
    speech:         5 + cha + cha,
    instinct:       Math.floor((str + per + end + cha + int + agi + luk) / 3),
    survival:       5 + agi + agi
  };

  // --- 3. POST-CALCULATION ---
  allModifiers.forEach(traitId => {
    const traitDef = getTrait(traitId);
    if (traitDef && traitDef.modifiers) {
      if (traitDef.modifiers.ac_bonus) armorClass += traitDef.modifiers.ac_bonus;
      if (traitDef.modifiers.sequence_bonus) sequenceBonus += traitDef.modifiers.sequence_bonus;
      if (traitDef.modifiers.melee_dmg_flat) meleeDamageBase += traitDef.modifiers.melee_dmg_flat; // Link Heavy Handed!
      
      Object.keys(skills).forEach(skillName => {
        const modKey = `skill_${skillName}`;
        if (traitDef.modifiers[modKey]) {
          skills[skillName] += traitDef.modifiers[modKey];
        }
      });
    }
  });

  return {
    special,
    armorClass,
    sequenceBonus,
    meleeDamageBase, // <--- EXPORTING THIS NOW
    hpPerLevel,
    poisonRes,
    radRes,
    implantLimit,
    skillPointsPerLevel,
    skills
  };
}