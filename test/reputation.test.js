// Reputation is per character (GM ruling, 26 Sep). It used to be one
// party-wide number, so the face-man's careful work and the thug's murder
// spree landed on the same standing. These specs pin the new behaviour
// and — just as important — the fallback that stops an existing campaign
// having every standing reset to Neutral the moment this ships.
import { describe, it, expect } from 'vitest';
import {
  getReputationValue, getReputationModifiers, getReputationTier,
  REPUTATION_MIN, REPUTATION_MAX
} from '../src/reputationContent.js';

const live = (partyRep = {}) => ({ reputation: partyRep });

describe('getReputationValue', () => {
  it("reads the character's own standing", () => {
    const char = { reputation: { triad_1414: 40 } };
    expect(getReputationValue(char, 'triad_1414', live())).toBe(40);
  });

  it('gives two characters genuinely separate standings with one faction', () => {
    const diplomat = { reputation: { rakan_watch: 60 } };
    const thug = { reputation: { rakan_watch: -70 } };
    const world = live();
    expect(getReputationTier(getReputationValue(diplomat, 'rakan_watch', world)).id).not
      .toBe(getReputationTier(getReputationValue(thug, 'rakan_watch', world)).id);
  });

  it('is Neutral for a faction the character has never dealt with', () => {
    expect(getReputationValue({ reputation: {} }, 'the_caliphate', live())).toBe(0);
  });

  it('treats a character with no reputation field at all as Neutral', () => {
    expect(getReputationValue({}, 'triad_1414', live())).toBe(0);
    expect(getReputationValue(undefined, 'triad_1414', live())).toBe(0);
  });

  // The migration case. Campaigns already in play have standings stored
  // party-wide; without this they would all silently reset.
  it('falls back to the old party-wide value when the character has none', () => {
    expect(getReputationValue({ reputation: {} }, 'triad_1414', live({ triad_1414: 55 }))).toBe(55);
    expect(getReputationValue({}, 'triad_1414', live({ triad_1414: 55 }))).toBe(55);
  });

  it("prefers the character's own value over the inherited one", () => {
    const char = { reputation: { triad_1414: -20 } };
    expect(getReputationValue(char, 'triad_1414', live({ triad_1414: 55 }))).toBe(-20);
  });

  it('honours a deliberate zero rather than treating it as absent', () => {
    // A GM who drags someone back to Neutral must not have them inherit
    // the party's old standing again on the next render.
    const char = { reputation: { triad_1414: 0 } };
    expect(getReputationValue(char, 'triad_1414', live({ triad_1414: 80 }))).toBe(0);
  });

  it('survives a missing liveData', () => {
    expect(getReputationValue({ reputation: {} }, 'triad_1414', undefined)).toBe(0);
  });
});

describe('getReputationModifiers', () => {
  it('resolves tier and trade modifiers for one character', () => {
    const char = { reputation: { rakan_watch: REPUTATION_MAX } };
    const out = getReputationModifiers('rakan_watch', char, live());
    expect(out.value).toBe(REPUTATION_MAX);
    expect(out.tier).toBe(getReputationTier(REPUTATION_MAX));
    expect(out.buy_mod).toBe(out.tier.buy_mod);
  });

  it('reports refusal to trade at the bottom of the track', () => {
    const hated = { reputation: { rakan_watch: REPUTATION_MIN } };
    const out = getReputationModifiers('rakan_watch', hated, live());
    expect(out.refuses_trade).toBe(out.tier.buy_mod === null);
  });

  it('gives each character their own modifiers for the same faction', () => {
    const world = live();
    const liked = getReputationModifiers('triad_1414', { reputation: { triad_1414: 75 } }, world);
    const loathed = getReputationModifiers('triad_1414', { reputation: { triad_1414: -75 } }, world);
    expect(liked.tier.id).not.toBe(loathed.tier.id);
  });
});
