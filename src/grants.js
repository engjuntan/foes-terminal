// src/grants.js
// Pure "who actually gets this" resolution shared by every GM grant flow
// that adds an id to a character's array field — data logs, maps,
// recipes (unlocked_logs / unlocked_maps / unlocked_recipes). No
// Firestore here, same separation as formulas.js/needs.js/crafting.js:
// plain functions of plain objects, testable by hand.
//
// `target` is either one character id or the literal 'all'.
export function resolveGrantTargets(characters, target) {
  const all = characters || {};
  if (target === 'all') return Object.keys(all).filter(id => all[id] && all[id].is_finalized);
  return (all[target]) ? [target] : [];
}

// Splits the resolved targets into who actually gets the grant and who
// already had it. A duplicate grant should refuse and say so rather than
// silently adding a second copy (GM ruling, "Grant Items becomes its own
// tab" 2026-09-24) — this is what lets a caller tell those two groups
// apart without re-deriving the "already has it" check itself.
export function planListGrant(characters, target, listKey, id) {
  const all = characters || {};
  const targets = resolveGrantTargets(all, target);
  const toGrant = [];
  const alreadyHave = [];
  targets.forEach(charId => {
    const current = (all[charId] && all[charId][listKey]) || [];
    if (current.includes(id)) alreadyHave.push(charId);
    else toGrant.push(charId);
  });
  return { toGrant, alreadyHave };
}

// Message for a grant that changed nothing because every resolved target
// already had it — "<name> already has that log" for a single character,
// a party-wide phrasing for 'all'.
export function describeNoOpGrant(characters, alreadyHave, thing) {
  const all = characters || {};
  if (alreadyHave.length === 1) {
    const name = (all[alreadyHave[0]] && all[alreadyHave[0]].name) || alreadyHave[0];
    return `${name} already has that ${thing}.`;
  }
  return `Everyone already has that ${thing}.`;
}
