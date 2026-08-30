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
    is_boss: template.stats.is_boss || false, // "one shot one kill" crit takes 20 true damage instead
    status_effects: [], // same shape as a PC's — carries crit/aimed-shot afflictions inline
    stance: 'standing',
    is_down: false
  };
}

// 1d20 + a sequence bonus (PCs: derived.sequenceBonus; monsters: stats.sequence).
export function rollInitiative(sequenceBonus) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  return { roll: d20, total: d20 + (sequenceBonus || 0) };
}

// --- STANCE (manual's Stances table) ---
// Change is free-form here — the user governs the action economy at the
// table themselves rather than the app enforcing a small-action cost.
// `agiCap` limits how much of AC's AGI component still applies (only
// meaningful for a PC, since a monster's AC isn't AGI-derived); null
// means no cap (full AC). Knocked Down is the one stance nobody picks
// for themselves — it's what the crit system's knockdown effects set.
export const STANCES = {
  standing: { label: 'Standing', hitBonus: 0, agiCap: null, blocksMelee: false },
  crouching: { label: 'Crouching', hitBonus: 10, agiCap: 3, blocksMelee: false },
  prone: { label: 'Prone', hitBonus: 25, agiCap: 1, blocksMelee: true },
  knocked_down: { label: 'Knocked Down', hitBonus: 0, agiCap: 0, blocksMelee: false }
};

// --- AIMED SHOTS (new — not from the manual, numbers agreed with the user) ---
// Torso is just the default/normal attack (0 penalty, no special effect).
// Picking anything else is a genuinely optional second choice, not a
// replacement for the normal attack — matches Fallout 1/2's targeted-shot
// convention. effectId now applies to PC and monster targets alike —
// monster combat instances carry their own status_effects array too,
// same shape as a PC's (see the critical hit section below).
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

// --- CRITICAL HITS (manual p.~1286-1345, amended with the user) ---
// Crit chance: LK stat used directly as percentage points for PCs
// (perk/trait bonuses can layer on top later through the same modifier
// system if any get authored), capped at 50% per the manual. Monsters
// use their own authored bestiary `crit_chance` directly — same cap.
export function getCritChance(rawValue) {
  return Math.min(50, Math.max(0, rawValue || 0));
}

// Resolves crit status for the SAME roll already made for the hit check
// — not a separate roll. A roll within crit chance is always a critical
// success, even overriding what would've otherwise been a miss. A
// natural 100 is always a critical failure. A natural 91-99 is a
// PC-only fumble save (the manual's own rule): roll 1d10, and failing
// to roll <= your LK turns it into a critical failure too. Monsters
// don't have a Luck stat, so they skip that 91-99 save — only a natural
// 100 can fumble them; a deliberate simplification rather than
// inventing a proxy formula for something the bestiary doesn't track.
export function resolveCrit(roll, critChance, luckStat, isPc) {
  if (roll <= critChance) return 'success';
  if (roll === 100) return 'fail';
  if (isPc && roll >= 91 && roll <= 99) {
    const saveRoll = rollD10();
    if (saveRoll > luckStat) return 'fail';
  }
  return null;
}

function rollD10() { return Math.floor(Math.random() * 10) + 1; }

// Rolls which table entry applies — a separate 1d10 from the attack
// roll itself, matching the tables' own "Roll: Effect" framing.
export function rollCritTableEntry(isSuccess) {
  const table = isSuccess ? CRIT_SUCCESS_TABLE : CRIT_FAIL_TABLE;
  const roll = rollD10();
  return { roll, ...table[roll] };
}

// `effect` is a tag resolveAttack() switches on to apply the mechanical
// consequence — see controllers.js. Entries 5/6/7 on the failure table
// were the ones built on weapon condition marks (cut — no durability
// system exists), so they're blank ("no special effect beyond the
// miss") rather than renumbered, keeping the original 1-10 odds intact.
export const CRIT_SUCCESS_TABLE = {
  1: { label: 'Nothing extra — a clean hit', effect: 'none' },
  2: { label: 'Cripples their leg', effect: 'cripple_leg' },
  3: { label: 'Cripples their arm', effect: 'cripple_arm' },
  4: { label: '+300% damage', effect: 'bonus_damage' },
  5: { label: 'Hits a major artery — 20 true damage, then bleeding', effect: 'artery' },
  6: { label: 'Stuns them for 1d4 turns', effect: 'stun' },
  7: { label: 'Chink in the armor — ignores DT/DR', effect: 'ignore_mitigation' },
  8: { label: 'Blinded — 50% hit chance reduction', effect: 'blind' },
  9: { label: 'Knockdown', effect: 'knockdown' },
  10: { label: 'One Shot One Kill (bosses take 20 true damage instead)', effect: 'instant_kill' }
};
export const CRIT_FAIL_TABLE = {
  1: { label: 'Misfire — jammed, loses their next turn', effect: 'jammed' },
  2: { label: 'Weapon backfires — cripples their own arm, weapon destroyed', effect: 'backfire' },
  3: { label: 'Hits themselves for half their weapon\'s damage', effect: 'hit_self' },
  4: { label: 'Hits someone else nearby instead', effect: 'hit_other' },
  5: { label: 'Nothing extra — just a miss', effect: 'none' },
  6: { label: 'Nothing extra — just a miss', effect: 'none' },
  7: { label: 'Nothing extra — just a miss', effect: 'none' },
  8: { label: 'Distracted — loses their next turn', effect: 'distracted' },
  9: { label: 'Knocked down — loses their next turn', effect: 'knockdown_fail' },
  10: { label: 'Drops their weapon — attack misses', effect: 'drop_weapon' }
};

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
  // effectAppliedMsg used to only ever get set on a hit (aimed-shot
  // afflictions), so gating it behind isHit was safe — but a critical
  // failure now carries its own effectAppliedMsg too (backfire,
  // hit-self, hit-someone-else, jammed, etc.), so it has to show
  // regardless of whether the original target actually got hit.
  const suffix = `${burstTag || ''} (rolled ${roll} vs ${chance}%)${effectAppliedMsg || ''}`;
  return sentence + suffix;
}
