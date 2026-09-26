// src/checkLog.js
// Turns a resolved check entry (checks[] shape — see resolveGmCheck,
// resolveHiddenCheck and resolvePlayerCheck in controllers.js) into the
// text that reaches the event log and the big-announcement overlay.
// Pure and Firestore-free, same separation as needs.js/crafting.js/
// grants.js — the GM dashboard bug this fixes is "a resolved check
// leaves no trace," and the fix is entirely string-building, so it lives
// here rather than inline in the controller.
import { DIFFICULTY_TIERS } from './checks.js';

const SPECIAL_NAMES = {
  str: 'Strength', per: 'Perception', end: 'Endurance', cha: 'Charisma',
  int: 'Intelligence', agi: 'Agility', luk: 'Luck'
};

function titleCase(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// "WHAT" was rolled — a named SPECIAL/skill, or a generic fallback for a
// custom/NPC check (entry.key is null there; see resolveGmCheck).
export function checkWhatLabel(entry) {
  if (entry.key) {
    return entry.kind === 'special' ? (SPECIAL_NAMES[entry.key] || titleCase(entry.key)) : titleCase(entry.key);
  }
  return entry.kind === 'special' ? 'SPECIAL' : 'SKILL';
}

// A hidden check must never leak through the log — that's the whole
// point of hiding it. `hidden` only exists on GM checks (resolveGmCheck)
// and the always-hidden hidden-roll tool; a player's own check
// (resolvePlayerCheck) never sets it, so it's always 'all' there too.
export function checkLogVisibility(entry) {
  return entry.hidden ? 'gm' : 'all';
}

// One outcome, GM-detail wording — the GM is the audience for the event
// log line and wants the numbers; players only ever see the existing
// "just success/failure" reveal message (buildCheckRevealMessage),
// which this doesn't touch.
export function formatCheckOutcome(result) {
  const outcome = result.success ? 'PASSED' : 'FAILED';
  const crit = result.critType ? ' (CRITICAL)' : '';
  return `${outcome}${crit} (rolled ${result.roll}, needed ${result.threshold})`;
}

// One log line per result — party scope rolls one line per character
// (they pass/fail independently), so this always returns an array, even
// for a single-target check.
export function buildCheckLogLines(entry) {
  const tierLabel = (DIFFICULTY_TIERS[entry.tier] || {}).label || entry.tier;
  const whatLabel = checkWhatLabel(entry);
  return (entry.results || []).map(r => `${r.name} — ${whatLabel} (${tierLabel}): ${formatCheckOutcome(r)}`);
}

// The big-announcement version — one subline per character, no roll
// numbers (players see this on a revealed check, and the rest of the
// check system deliberately never shows a player the raw threshold).
// `color` picks pass/fail so a pass doesn't read like a failure.
export function buildCheckAnnouncement(entry) {
  const whatLabel = checkWhatLabel(entry);
  const results = entry.results || [];
  const sublines = results.map(r => ({
    text: `${r.name} — ${whatLabel}: ${r.success ? 'PASSED' : 'FAILED'}${r.critType ? ' (CRITICAL)' : ''}`,
    color: r.success ? 'var(--pip-green)' : '#ff5555'
  }));
  const headline = entry.scope === 'party'
    ? 'CHECK RESOLVED'
    : (results[0] && results[0].success ? 'CHECK PASSED' : 'CHECK FAILED');
  return { headline, sublines };
}
