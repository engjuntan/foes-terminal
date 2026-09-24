// The in-game clock and what one tick of it does to the party: the maths
// the GM's TIME CONTROL panel and every Rest run through. Pure functions,
// so they're checked here by hand-built values rather than by clicking.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NEED_RATES, normalizeNeeds, getNeedTier, decayNeeds, rollRestHealing, healingRateFromEndurance, formatGameTime } from '../src/needs.js';

afterEach(() => vi.restoreAllMocks());

describe('formatGameTime', () => {
  it('opens the campaign at Day 1, 08:00 (minute 480)', () => {
    expect(formatGameTime(480).label).toBe('DAY 1 · 08:00');
  });

  it('rolls over to the next day at midnight, not at 24:00', () => {
    expect(formatGameTime(1439).label).toBe('DAY 1 · 23:59');
    expect(formatGameTime(1440).label).toBe('DAY 2 · 00:00');
  });

  it('counts whole days forward', () => {
    const t = formatGameTime(480 + 1440 * 3 + 90);
    expect(t).toMatchObject({ day: 4, hourOfDay: 9, minOfHour: 30 });
  });

  it('never goes negative or NaN on junk input', () => {
    expect(formatGameTime(-50).label).toBe('DAY 1 · 00:00');
    expect(formatGameTime(undefined).label).toBe('DAY 1 · 00:00');
  });
});

describe('decayNeeds', () => {
  it('drains each need at its own rate per hour', () => {
    const { needs } = decayNeeds({ hunger: 100, thirst: 100, sleep: 100 }, 10);
    expect(needs.hunger).toBeCloseTo(100 - NEED_RATES.hunger * 10);
    expect(needs.thirst).toBeCloseTo(100 - NEED_RATES.thirst * 10);
    expect(needs.sleep).toBeCloseTo(100 - NEED_RATES.sleep * 10);
  });

  it('treats a missing needs object as fully sated', () => {
    expect(normalizeNeeds(undefined)).toEqual({ hunger: 100, thirst: 100, sleep: 100 });
  });

  it('does nothing when no time passes', () => {
    const before = { hunger: 42, thirst: 42, sleep: 42 };
    const { needs, damage } = decayNeeds(before, 0);
    expect(needs).toEqual(before);
    expect(damage).toEqual({ hunger: 0, thirst: 0, sleep: 0 });
  });

  it('floors at zero instead of going negative', () => {
    const { needs } = decayNeeds({ hunger: 5, thirst: 5, sleep: 5 }, 100);
    expect(needs).toEqual({ hunger: 0, thirst: 0, sleep: 0 });
  });

  it('only charges HP for hours actually spent at zero', () => {
    // Thirst 3/hour: 30 thirst empties after 10h, so a 12h advance is
    // 2 hours at zero — two 1d6 rolls, not twelve.
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // every 1d6 rolls a 6
    const { damage } = decayNeeds({ hunger: 100, thirst: 30, sleep: 100 }, 12);
    expect(damage.thirst).toBe(12);
    expect(damage.hunger).toBe(0);
  });

  it('charges nothing while a need is merely low', () => {
    const { damage } = decayNeeds({ hunger: 100, thirst: 30, sleep: 100 }, 9);
    expect(damage.thirst).toBe(0);
  });
});

describe('getNeedTier', () => {
  it('names the tier at each threshold boundary', () => {
    expect(getNeedTier('thirst', 100).label).toBe('Hydrated');
    expect(getNeedTier('thirst', 60).label).toBe('Thirsty');
    expect(getNeedTier('thirst', 40).label).toBe('Dehydrated');
    expect(getNeedTier('thirst', 0).label).toBe('Dying of thirst');
  });

  it('applies a tier to every value below it until the next one', () => {
    expect(getNeedTier('hunger', 59).label).toBe('Hungry');
    expect(getNeedTier('hunger', 41).label).toBe('Hungry');
    expect(getNeedTier('hunger', 40).label).toBe('Famished');
  });

  it('gives thirst and hunger non-overlapping penalties', () => {
    const thirst = getNeedTier('thirst', 40).modifiers;
    const hunger = getNeedTier('hunger', 40).modifiers;
    expect(Object.keys(thirst).some(k => k in hunger)).toBe(false);
  });
});

describe('healingRateFromEndurance (Fallout 1/2 Healing Rate)', () => {
  it('floors EN/3, with a minimum of 1', () => {
    expect(healingRateFromEndurance(1)).toBe(1); // floor(1/3)=0 -> min 1
    expect(healingRateFromEndurance(2)).toBe(1); // floor(2/3)=0 -> min 1
    expect(healingRateFromEndurance(0)).toBe(1); // floor(0/3)=0 -> min 1
  });

  it('floors EN/3 once it clears the minimum', () => {
    expect(healingRateFromEndurance(3)).toBe(1);
    expect(healingRateFromEndurance(5)).toBe(1);
    expect(healingRateFromEndurance(6)).toBe(2);
    expect(healingRateFromEndurance(9)).toBe(3);
    expect(healingRateFromEndurance(10)).toBe(3);
  });

  it('adds perk bonuses (Faster Healing, Cancerous Growth) on top of the floor', () => {
    expect(healingRateFromEndurance(1, 2)).toBe(3); // min-1 case + Faster Healing rank 1
    expect(healingRateFromEndurance(9, 4)).toBe(7); // 3 + Faster Healing(+2) + Cancerous Growth(+2) stacked
  });

  it('treats a missing/undefined endurance as 0, not NaN', () => {
    expect(healingRateFromEndurance(undefined)).toBe(1);
  });
});

describe('rollRestHealing (Fallout 1/2: HR per full 6 hours)', () => {
  it('heals nothing for anything under a full 6-hour block', () => {
    expect(rollRestHealing(3, 5, 1)).toBe(0);
  });

  it('heals exactly one HR at the 6-hour mark', () => {
    expect(rollRestHealing(3, 6, 1)).toBe(3);
  });

  it('only counts FULL 6-hour blocks — partial hours past a block heal nothing extra', () => {
    expect(rollRestHealing(3, 11, 1)).toBe(3); // 1 full block, 5h leftover
    expect(rollRestHealing(3, 12, 1)).toBe(6); // 2 full blocks
  });

  it('a declared rest doubles the total', () => {
    expect(rollRestHealing(3, 6, 2)).toBe(6);
  });

  it('a rest at a proper place of rest quadruples the total', () => {
    expect(rollRestHealing(3, 6, 4)).toBe(12);
  });

  it('multiplier defaults to 1x when not passed (ordinary time advance)', () => {
    expect(rollRestHealing(3, 12)).toBe(6);
  });

  it('heals nothing for a character with no healing rate', () => {
    expect(rollRestHealing(0, 24, 4)).toBe(0);
  });
});
