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

// --- AIMED SHOTS (new — not from the manual, numbers agreed with the user) ---
// Torso is just the default/normal attack (0 penalty, no special effect).
// Picking anything else is a genuinely optional second choice, not a
// replacement for the normal attack — matches Fallout 1/2's targeted-shot
// convention. effectId (if present) only mechanically applies to PC
// targets right now, since monsters don't carry a status_effects array.
export const BODY_PARTS = {
  torso: { label: 'Torso', penalty: 0 },
  head: { label: 'Head', penalty: 20, damageMultiplier: 1.5 },
  eyes: { label: 'Eyes', penalty: 40, effectId: 'blinded' },
  left_arm: { label: 'Left Arm', penalty: 20, effectId: 'crippled_arm' },
  right_arm: { label: 'Right Arm', penalty: 20, effectId: 'crippled_arm' },
  left_leg: { label: 'Left Leg', penalty: 15, effectId: 'crippled_leg' },
  right_leg: { label: 'Right Leg', penalty: 15, effectId: 'crippled_leg' },
  groin: { label: 'Groin', penalty: 20, effectId: 'stunned' }
};

// --- AMMO / BURST FIRE (new — simplified approximation, not the manual's
// full multi-roll-until-a-100 system, agreed with the user) ---
// A gun with a `clip_size` in its item JSON tracks ammo per equipped slot
// on the character (no per-item-instance state exists anywhere in this
// app, so the slot is the unit of tracking). A gun with a `burst_shots`
// value can additionally be fired as a burst: it costs that many rounds
// instead of 1, at a flat hit-chance penalty, for roughly double damage
// (one extra full roll of the weapon's damage dice) — a deliberately
// simple stand-in for "several rounds landing" rather than modeling an
// actual spray/partial-hit spread.
export const BURST_HIT_PENALTY = 15;
export const BURST_DAMAGE_ROLLS = 2; // weapon's damage dice rolled this many times and summed

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

// --- RANDOMIZED COMBAT LOG FLAVOR TEXT ---
// Purely cosmetic — every variant still carries the same mechanical
// numbers (roll, chance, damage, part/burst tags, effect applied), just
// phrased differently each time so the log doesn't read as the same
// template over and over. Kept weapon-agnostic on purpose (no "fires" /
// "shoots"-only verbs) since the same attack could be a gun, a blade, or
// a bare fist.
const HIT_TEMPLATES = [
  ({ attacker, target, weapon, part }) => `${attacker} connects with ${weapon}${part} — ${target} takes DMG damage.`,
  ({ attacker, target, weapon, part }) => `${attacker}'s ${weapon} finds its mark${part}. ${target} takes DMG damage.`,
  ({ attacker, target, weapon, part }) => `Clean hit: ${attacker} tags ${target}${part} with ${weapon} for DMG damage.`,
  ({ attacker, target, weapon, part }) => `${attacker} strikes true${part} with ${weapon} — DMG damage to ${target}.`,
  ({ attacker, target, weapon, part }) => `${target} takes DMG damage as ${attacker}'s ${weapon} lands${part}.`,
  ({ attacker, target, weapon, part }) => `Solid hit — ${attacker} catches ${target}${part} with ${weapon} for DMG damage.`,
  ({ attacker, target, weapon, part }) => `${attacker} doesn't miss${part} — ${weapon} deals DMG damage to ${target}.`,
  ({ attacker, target, weapon, part }) => `${weapon} bites deep${part}. ${attacker} deals DMG damage to ${target}.`
];
const MISS_TEMPLATES = [
  ({ attacker, target, weapon, part }) => `${attacker} swings ${weapon}${part} at ${target} and misses completely.`,
  ({ attacker, target, weapon, part }) => `${target} ducks out of the way — ${attacker}'s ${weapon} finds nothing but air${part}.`,
  ({ attacker, target, weapon, part }) => `${attacker}'s ${weapon} misses ${target}${part} by a hair.`,
  ({ attacker, target, weapon, part }) => `Close, but no — ${attacker}'s ${weapon} misses ${target}${part}.`,
  ({ attacker, target, weapon, part }) => `${attacker} whiffs${part} with ${weapon}. ${target} is unscathed.`,
  ({ attacker, target, weapon, part }) => `${target} shrugs off ${attacker}'s attempt${part} with ${weapon} — no damage.`,
  ({ attacker, target, weapon, part }) => `${attacker} can't find an opening${part}. ${weapon} does nothing.`,
  ({ attacker, target, weapon, part }) => `Bad luck for ${attacker} — ${weapon} misses ${target}${part} entirely.`
];

// Builds the full combat log line: a randomly-picked flavor sentence plus
// the mechanical numbers, which are always present regardless of which
// flavor variant got picked. `partTag`/`burstTag`/`effectAppliedMsg` are
// the same pre-formatted strings resolveAttack() already builds
// (e.g. " (aimed at Head)", " [BURST FIRE, 21/24 ammo left]").
export function buildAttackLogMessage({ isHit, attackerName, targetName, weaponName, partTag, burstTag, damage, roll, chance, effectAppliedMsg }) {
  const templates = isHit ? HIT_TEMPLATES : MISS_TEMPLATES;
  const template = templates[Math.floor(Math.random() * templates.length)];
  let sentence = template({ attacker: attackerName, target: targetName, weapon: weaponName, part: partTag || '' });
  if (isHit) sentence = sentence.replace('DMG', damage);
  const suffix = `${burstTag || ''} (rolled ${roll} vs ${chance}%)${isHit ? (effectAppliedMsg || '') : ''}`;
  return sentence + suffix;
}
