// A resolved check leaves no trace in the event log today (resolveGmCheck
// / resolvePlayerCheck never call pushEventLog) — this is the pure
// builder that fixes that, tested directly rather than by driving the
// Checks tab UI.
import { describe, it, expect } from 'vitest';
import { buildCheckLogLines, checkLogVisibility, checkWhatLabel, buildCheckAnnouncement } from '../src/checkLog.js';
import { pushEventLog, visibleEventLog } from '../src/eventLog.js';

function makeEntry(overrides = {}) {
  return {
    mode: 'gm',
    scope: 'single',
    tier: 'difficult',
    kind: 'skill',
    key: 'lockpick',
    hidden: false,
    results: [{ char_id: 'iron_legs', name: 'Iron Legs', roll: 34, threshold: 55, success: true, critType: null }],
    ...overrides
  };
}

describe('buildCheckLogLines', () => {
  it('names who, what, difficulty and the numbers on a pass', () => {
    const lines = buildCheckLogLines(makeEntry());
    expect(lines).toEqual(['Iron Legs — Lockpick (Difficult): PASSED (rolled 34, needed 55)']);
  });

  it('reads FAILED on a failed result', () => {
    const entry = makeEntry({ results: [{ name: 'Iron Legs', roll: 60, threshold: 55, success: false, critType: null }] });
    expect(buildCheckLogLines(entry)).toEqual(['Iron Legs — Lockpick (Difficult): FAILED (rolled 60, needed 55)']);
  });

  it('tags a critical success', () => {
    const entry = makeEntry({
      kind: 'special', key: 'luk', tier: 'normal',
      results: [{ name: 'Iron Legs', roll: 1, threshold: 5, success: true, critType: 'success' }]
    });
    expect(buildCheckLogLines(entry)).toEqual(['Iron Legs — Luck (Normal): PASSED (CRITICAL) (rolled 1, needed 5)']);
  });

  it('tags a critical failure', () => {
    const entry = makeEntry({
      kind: 'special', key: 'luk', tier: 'normal',
      results: [{ name: 'Iron Legs', roll: 10, threshold: 5, success: false, critType: 'fail' }]
    });
    expect(buildCheckLogLines(entry)).toEqual(['Iron Legs — Luck (Normal): FAILED (CRITICAL) (rolled 10, needed 5)']);
  });

  it('produces one line per character for a party check, independent outcomes', () => {
    const entry = makeEntry({
      scope: 'party', kind: 'special', key: 'per', tier: 'kind_of_tricky',
      results: [
        { name: 'Iron Legs', roll: 2, threshold: 6, success: true, critType: null },
        { name: 'Doc', roll: 9, threshold: 6, success: false, critType: null }
      ]
    });
    expect(buildCheckLogLines(entry)).toEqual([
      'Iron Legs — Perception (Kind of Tricky): PASSED (rolled 2, needed 6)',
      'Doc — Perception (Kind of Tricky): FAILED (rolled 9, needed 6)'
    ]);
  });

  it('falls back to a generic SPECIAL/SKILL label for a custom/NPC check with no key', () => {
    const entry = makeEntry({ scope: 'custom', kind: 'skill', key: null, results: [{ name: 'Raider Lookout', roll: 40, threshold: 30, success: false, critType: null }] });
    expect(buildCheckLogLines(entry)[0]).toContain('Raider Lookout — SKILL (Difficult): FAILED');
  });
});

describe('checkWhatLabel', () => {
  it('title-cases a multi-word skill key', () => {
    expect(checkWhatLabel(makeEntry({ kind: 'skill', key: 'small_guns' }))).toBe('Small Guns');
  });

  it('maps a SPECIAL key to its full name', () => {
    expect(checkWhatLabel(makeEntry({ kind: 'special', key: 'agi' }))).toBe('Agility');
  });
});

describe('checkLogVisibility', () => {
  it('is gm-only for a hidden check', () => {
    expect(checkLogVisibility(makeEntry({ hidden: true }))).toBe('gm');
  });

  it('is all for a revealed check', () => {
    expect(checkLogVisibility(makeEntry({ hidden: false }))).toBe('all');
  });

  it('is all when hidden is absent (a player self-check never sets it)', () => {
    const entry = makeEntry();
    delete entry.hidden;
    expect(checkLogVisibility(entry)).toBe('all');
  });
});

describe('a hidden check end-to-end (resolveGmCheck\'s actual wiring)', () => {
  it('never lets visibleEventLog(log, "player") return the hidden entry', () => {
    const entry = makeEntry({ hidden: true });
    let log = [];
    buildCheckLogLines(entry).forEach(text => {
      log = pushEventLog(log, { text, actor: 'GM', visibility: checkLogVisibility(entry) });
    });
    expect(visibleEventLog(log, 'player')).toEqual([]);
    expect(visibleEventLog(log, 'gm')).toHaveLength(1);
  });

  it('lets a revealed check reach the player log', () => {
    const entry = makeEntry({ hidden: false });
    let log = [];
    buildCheckLogLines(entry).forEach(text => {
      log = pushEventLog(log, { text, actor: 'GM', visibility: checkLogVisibility(entry) });
    });
    expect(visibleEventLog(log, 'player')).toHaveLength(1);
  });
});

describe('buildCheckAnnouncement', () => {
  it('headlines a single pass as CHECK PASSED, coloured pip-green', () => {
    const { headline, sublines } = buildCheckAnnouncement(makeEntry());
    expect(headline).toBe('CHECK PASSED');
    expect(sublines).toEqual([{ text: 'Iron Legs — Lockpick: PASSED', color: 'var(--pip-green)' }]);
  });

  it('headlines a single failure as CHECK FAILED, coloured red', () => {
    const entry = makeEntry({ results: [{ name: 'Iron Legs', roll: 60, threshold: 55, success: false, critType: null }] });
    const { headline, sublines } = buildCheckAnnouncement(entry);
    expect(headline).toBe('CHECK FAILED');
    expect(sublines[0].color).toBe('#ff5555');
  });

  it('headlines party scope as CHECK RESOLVED regardless of mixed outcomes', () => {
    const entry = makeEntry({
      scope: 'party',
      results: [
        { name: 'Iron Legs', roll: 2, threshold: 6, success: true, critType: null },
        { name: 'Doc', roll: 9, threshold: 6, success: false, critType: null }
      ]
    });
    const { headline, sublines } = buildCheckAnnouncement(entry);
    expect(headline).toBe('CHECK RESOLVED');
    expect(sublines.map(s => s.color)).toEqual(['var(--pip-green)', '#ff5555']);
  });

  it('never includes the roll or threshold, only name/skill/result', () => {
    const { sublines } = buildCheckAnnouncement(makeEntry());
    expect(sublines[0].text).not.toMatch(/rolled|needed|34|55/);
  });
});
