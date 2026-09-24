// Who actually receives a GM grant (data log / map / recipe), and the
// duplicate-refusal behaviour the GM ruling (2026-09-24) asks for —
// "granting a data log or a map a character already has should say
// '<name> already has that log' and change nothing."
import { describe, it, expect } from 'vitest';
import { resolveGrantTargets, planListGrant, describeNoOpGrant } from '../src/grants.js';

const characters = {
  iron_legs: { name: 'Iron Legs', is_finalized: true, unlocked_logs: ['log_a'] },
  sunny: { name: 'Sunny', is_finalized: true, unlocked_logs: [] },
  draft_only: { name: 'Draft Only', is_finalized: false, unlocked_logs: [] }
};

describe('resolveGrantTargets', () => {
  it('resolves a single character id straight through', () => {
    expect(resolveGrantTargets(characters, 'sunny')).toEqual(['sunny']);
  });

  it('resolves "all" to every finalized character, skipping drafts', () => {
    expect(resolveGrantTargets(characters, 'all').sort()).toEqual(['iron_legs', 'sunny']);
  });

  it('returns nothing for an id that is not in the roster', () => {
    expect(resolveGrantTargets(characters, 'nobody')).toEqual([]);
  });

  it('treats a missing characters map as empty rather than throwing', () => {
    expect(resolveGrantTargets(undefined, 'all')).toEqual([]);
  });
});

describe('planListGrant', () => {
  it('grants to a character who does not have it yet', () => {
    const { toGrant, alreadyHave } = planListGrant(characters, 'sunny', 'unlocked_logs', 'log_a');
    expect(toGrant).toEqual(['sunny']);
    expect(alreadyHave).toEqual([]);
  });

  it('refuses (reports, does not grant) a character who already has it', () => {
    const { toGrant, alreadyHave } = planListGrant(characters, 'iron_legs', 'unlocked_logs', 'log_a');
    expect(toGrant).toEqual([]);
    expect(alreadyHave).toEqual(['iron_legs']);
  });

  it('"grant to all" splits the party: some get it, some are refused', () => {
    const { toGrant, alreadyHave } = planListGrant(characters, 'all', 'unlocked_logs', 'log_a');
    expect(toGrant).toEqual(['sunny']);
    expect(alreadyHave).toEqual(['iron_legs']);
  });

  it('treats a character with no list field yet as having nothing', () => {
    const bare = { new_guy: { name: 'New Guy', is_finalized: true } };
    const { toGrant } = planListGrant(bare, 'new_guy', 'unlocked_maps', 'map_1');
    expect(toGrant).toEqual(['new_guy']);
  });
});

describe('describeNoOpGrant', () => {
  it('names the one character who already has it', () => {
    expect(describeNoOpGrant(characters, ['iron_legs'], 'log')).toBe('Iron Legs already has that log.');
  });

  it('falls back to a party-wide message for multiple/no names', () => {
    expect(describeNoOpGrant(characters, ['iron_legs', 'sunny'], 'map')).toBe('Everyone already has that map.');
  });
});
