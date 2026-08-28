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
