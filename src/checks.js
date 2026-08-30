// src/checks.js
// Difficulty checks (DC) — manual p.~10-11. Two roll types:
//   SPECIAL check: 1d10 (or 1d20 for an "especially difficult" task),
//     succeed if roll <= stat + tier's specialMod.
//   Skill check: 2d10 read as a percentile (same tens+ones convention
//     combat.js's rollPercentile already uses), succeed if roll <= skill% + tier's skillMod.
// Six named difficulty tiers, each carrying both a SPECIAL-scale and a
// skill-scale modifier (Trivial/Normal apply no modifier at all — those
// are for tasks a GM rules as obviously do-able or a bog-standard check).
export const DIFFICULTY_TIERS = {
  trivial: { label: 'Trivial', specialMod: 0, skillMod: 0 },
  normal: { label: 'Normal', specialMod: 0, skillMod: 0 },
  kind_of_tricky: { label: 'Kind of Tricky', specialMod: -1, skillMod: -10 },
  difficult: { label: 'Difficult', specialMod: -2, skillMod: -20 },
  extremely_difficult: { label: 'Extremely Difficult', specialMod: -3, skillMod: -25 },
  nearly_impossible: { label: 'Nearly Impossible', specialMod: -5, skillMod: -50 }
};

export function rollD10() { return Math.floor(Math.random() * 10) + 1; }
export function rollD20() { return Math.floor(Math.random() * 20) + 1; }

// SPECIAL check — rolling a natural 1 is an automatic critical success
// (regardless of threshold) and a natural 10 is an automatic critical
// failure; the manual states this rule right alongside the DC section.
// Doesn't apply when using the 1d20 variant for an especially difficult
// task — that's a plain d20, no crit rule stated for it.
export function resolveSpecialCheck(statValue, tierKey, roll, useD20 = false) {
  const tier = DIFFICULTY_TIERS[tierKey] || DIFFICULTY_TIERS.normal;
  const threshold = Math.max(0, statValue + tier.specialMod);
  let success = roll <= threshold;
  let critType = null;
  if (!useD20) {
    if (roll === 1) { success = true; critType = 'success'; }
    else if (roll === 10) { success = false; critType = 'fail'; }
  }
  return { threshold, success, critType };
}

// Skill check — no crit rule here (deliberately, for now): combat's own
// percentile hit resolution doesn't implement crits either, so this
// stays consistent with that rather than inventing a rule for skill
// checks alone.
export function resolveSkillCheck(skillValue, tierKey, roll) {
  const tier = DIFFICULTY_TIERS[tierKey] || DIFFICULTY_TIERS.normal;
  const threshold = Math.max(0, skillValue + tier.skillMod);
  return { threshold, success: roll <= threshold };
}
