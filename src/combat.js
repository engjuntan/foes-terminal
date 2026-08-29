// src/combat.js
// Combat-specific logic: instantiating monsters from the bestiary, rolling
// initiative, and resolving actions. Kept separate from formulas.js since
// that file is about a single character's derived stats, not encounters.
import { getMonster } from './bestiary.js';

// Rolls a real HP value for a monster instance within +/-30% of its
// bestiary "hp" value, respecting variance_bias ("upper"/"lower"/"normal").
export function rollMonsterHp(statsBlock) {
  const base = statsBlock.hp;
  const bias = statsBlock.variance_bias || 'normal';
  const low = base * 0.7;
  const high = base * 1.3;

  let rollMin = low, rollMax = high;
  if (bias === 'upper') rollMin = base;
  if (bias === 'lower') rollMax = base;

  return Math.max(1, Math.round(rollMin + Math.random() * (rollMax - rollMin)));
}

// Creates a fresh, self-contained combat instance from a bestiary template.
// `label` lets the GM distinguish multiples of the same species (e.g. "Giant Rat #2").
export function instantiateMonster(monsterId, label) {
  const template = getMonster(monsterId);
  if (!template) return null;

  const rolledHp = rollMonsterHp(template.stats);

  return {
    combatant_id: `m_${monsterId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    ref_type: 'monster',
    source_id: monsterId,
    name: label || template.name,
    icon: template.icon || '',
    hp: { current: rolledHp, max: rolledHp },
    ac: template.stats.ac,
    sequence: template.stats.sequence,
    crit_chance: template.stats.crit_chance,
    dtdr: template.stats.dtdr,
    resistances: template.stats.resistances,
    attacks: template.attacks || [],
    is_down: false
  };
}

// 1d20 + a sequence bonus (PCs: derived.sequenceBonus; monsters: stats.sequence).
export function rollInitiative(sequenceBonus) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  return { roll: d20, total: d20 + (sequenceBonus || 0) };
}

// --- ATTACK RESOLUTION (manual p.81) ---
// Hit chance is rolled as a percentile: 2d10 read as a tens digit and a
// ones digit (matching the manual's worked example — Ahmad "rolls 2d10
// getting 32" is impossible as a literal sum of two d10s, but reads
// perfectly as a tens-die + ones-die percentile roll).
export function rollPercentile() {
  const tens = Math.floor(Math.random() * 10);
  const ones = Math.floor(Math.random() * 10);
  const value = tens * 10 + ones;
  return value === 0 ? 100 : value;
}

// Hit = roll <= (attacker's skill/hit% minus the target's AC). Cover,
// ammo, and condition-mark modifiers from the manual aren't implemented
// yet (no cover/stance/condition system exists) — this is the core loop.
export function resolveHit(skillOrHitPercent, targetAC, roll) {
  const effectiveChance = Math.max(0, (skillOrHitPercent || 0) - (targetAC || 0));
  return { effectiveChance, isHit: roll <= effectiveChance };
}

// Rolls a dice-notation string like "1d6", "2d4+3", "1d6+15+3".
export function rollDamage(diceStr) {
  if (!diceStr) return 0;
  const termRegex = /([+-]?)(\d*)d(\d+)|([+-]?\d+)(?!d)/g;
  let total = 0;
  let match;
  while ((match = termRegex.exec(String(diceStr))) !== null) {
    if (match[3]) {
      const sign = match[1] === '-' ? -1 : 1;
      const count = match[2] ? parseInt(match[2], 10) : 1;
      const sides = parseInt(match[3], 10);
      let sum = 0;
      for (let i = 0; i < count; i++) sum += Math.floor(Math.random() * sides) + 1;
      total += sign * sum;
    } else if (match[4]) {
      total += parseInt(match[4], 10);
    }
  }
  return Math.max(0, total);
}

// (Initial Damage - DT) x (1 - DR/100) = Damage Result — manual p.84's
// worked example, generalized. dtdrBlock shape matches bestiary/armor:
// { normal: {dt,dr}, laser: {dt,dr}, ... }.
export function applyDamageReduction(rawDamage, dtdrBlock, damageType) {
  const entry = (dtdrBlock && dtdrBlock[damageType]) || { dt: 0, dr: 0 };
  const afterDt = Math.max(0, rawDamage - (entry.dt || 0));
  const afterDr = afterDt * (1 - (entry.dr || 0) / 100);
  return Math.max(0, Math.round(afterDr));
}
