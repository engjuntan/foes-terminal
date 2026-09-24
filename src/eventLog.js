// src/eventLog.js
// The wide running log (GM ruling "Crafting, resting and tabs", 2026-09-24:
// "An event log, not just a combat log") — one shared feed of what
// happens across the whole campaign: hidden checks rolled (the fact, not
// the result), items granted and given, status effects applied, time
// advanced, rests, reputation changes, deaths. Distinct from the
// per-combat log (combat.js's active_combat.log, reset every fight) and
// from `messages` (GM narration/DMs) — this is the mechanical record,
// always in the background. Pure, Firestore-free, same separation as
// needs.js/crafting.js/grants.js.
export const EVENT_LOG_LIMIT = 100;

// Appends one entry and bounds the array to the last EVENT_LOG_LIMIT so
// the Firestore doc doesn't grow forever. `visibility` is 'all' (every
// player sees it — the default) or 'gm' (GM screen only, for anything
// that would leak a secret if a player saw it).
export function pushEventLog(currentLog, { text, actor = null, visibility = 'all', timestamp = Date.now(), id } = {}) {
  const entry = {
    id: id || `evt_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp, actor, text, visibility
  };
  const next = [...(currentLog || []), entry];
  return next.length > EVENT_LOG_LIMIT ? next.slice(next.length - EVENT_LOG_LIMIT) : next;
}

// What a given role is allowed to see — players never see a 'gm'-only
// entry, the GM sees everything.
export function visibleEventLog(log, userRole) {
  return (log || []).filter(e => userRole === 'gm' || e.visibility !== 'gm');
}
