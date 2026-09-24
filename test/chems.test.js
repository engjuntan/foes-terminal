// Chem durations, withdrawal and addiction (Fallout 1/2's model — GM
// approval, promoting the "chem durations" parking-lot item). Pure logic
// only — the Firestore-touching wiring (advanceTime/useItem) is covered
// in test/chems-controllers.test.js the same way advanceTime's other
// behaviours are covered in test/cripple.test.js.
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  extractChemBuffModifiers, buildChemBuffInstance, buildWithdrawalInstance,
  splitExpiredByHour, rollAddictionChance, addictionStatusId,
  buildAddictionInstance, splitCuredAddictionsByTime, CHEM_ADDICTION_CLEAN_DAYS
} from '../src/chems.js';

afterEach(() => vi.restoreAllMocks());

describe('extractChemBuffModifiers', () => {
  it('keeps numeric keys as modifiers', () => {
    expect(extractChemBuffModifiers({ special_str: 2, special_agi: 2, special_end: 3 }))
      .toEqual({ special_str: 2, special_agi: 2, special_end: 3 });
  });

  it('drops known non-modifier keys even when numeric', () => {
    expect(extractChemBuffModifiers({ hunger: 30, rad_removed: 200, special_str: 1 }))
      .toEqual({ special_str: 1 });
  });

  it('drops prose fields (todays unauthored chems use strings for buff/debuff/duration)', () => {
    expect(extractChemBuffModifiers({ buff: '+2 CHA', debuff: '-2 PER', duration: '2 Hours' }))
      .toEqual({});
  });

  it('handles a missing stats object', () => {
    expect(extractChemBuffModifiers(undefined)).toEqual({});
  });
});

describe('buildChemBuffInstance', () => {
  const item = { id: 'buffout', name: 'Buffout', duration_hours: 8, stats: { special_str: 2, special_end: 3, duration: '1d6+2 Hours' } };

  it('returns null when the item has no duration_hours', () => {
    expect(buildChemBuffInstance({ id: 'stimpak', name: 'Stimpak', stats: { heal: '1d10+10' } }, 480)).toBeNull();
  });

  it('sets an absolute expiry (now + hours*60), not a countdown', () => {
    const fx = buildChemBuffInstance(item, 480);
    expect(fx.expires_at_minutes).toBe(480 + 8 * 60);
    expect(fx.source_id).toBe('buffout');
    expect(fx.name).toBe('Buffout');
    expect(fx.modifiers).toEqual({ special_str: 2, special_end: 3 });
  });

  it('carries the withdrawal spec forward when the item has one', () => {
    const withItem = { ...item, withdrawal: { id: 'buffout_withdrawal', duration_hours: 4 } };
    const fx = buildChemBuffInstance(withItem, 0);
    expect(fx.withdrawal_id).toBe('buffout_withdrawal');
    expect(fx.withdrawal_duration_hours).toBe(4);
  });

  it('omits withdrawal fields entirely when the item has none', () => {
    const fx = buildChemBuffInstance(item, 0);
    expect(fx.withdrawal_id).toBeUndefined();
    expect(fx.withdrawal_duration_hours).toBeUndefined();
  });
});

describe('splitExpiredByHour', () => {
  it('leaves effects with no expires_at_minutes untouched', () => {
    const effects = [{ id: '1', name: 'Bleeding', duration_turns: 2 }];
    const { remaining, expired } = splitExpiredByHour(effects, 99999);
    expect(remaining).toEqual(effects);
    expect(expired).toEqual([]);
  });

  it('expires an effect exactly at its expiry minute', () => {
    const fx = { id: '1', name: 'Buffout', expires_at_minutes: 960 };
    const { remaining, expired } = splitExpiredByHour([fx], 960);
    expect(remaining).toEqual([]);
    expect(expired).toEqual([fx]);
  });

  it('keeps an effect whose expiry has not been reached yet', () => {
    const fx = { id: '1', name: 'Buffout', expires_at_minutes: 960 };
    const { remaining, expired } = splitExpiredByHour([fx], 959);
    expect(remaining).toEqual([fx]);
    expect(expired).toEqual([]);
  });

  it('handles an empty or missing list', () => {
    expect(splitExpiredByHour(undefined, 100)).toEqual({ remaining: [], expired: [] });
  });
});

describe('buildWithdrawalInstance', () => {
  const expiredBuff = { name: 'Buffout', withdrawal_id: 'buffout_withdrawal', withdrawal_duration_hours: 4, expires_at_minutes: 960 };

  it('uses the authored withdrawal definition when present', () => {
    const def = { name: 'Buffout Withdrawal', modifiers: { special_str: -4, special_agi: -3, special_end: -3 } };
    const fx = buildWithdrawalInstance(expiredBuff, def);
    expect(fx.name).toBe('Buffout Withdrawal');
    expect(fx.modifiers).toEqual(def.modifiers);
    expect(fx.expires_at_minutes).toBe(960 + 4 * 60);
    expect(fx.source_id).toBe('buffout_withdrawal');
  });

  it('falls back to a nameless, numberless withdrawal when unauthored', () => {
    const fx = buildWithdrawalInstance(expiredBuff, undefined);
    expect(fx.name).toBe('Buffout Withdrawal'); // built from the buff's own name
    expect(fx.modifiers).toEqual({});
  });
});

describe('rollAddictionChance', () => {
  it('never addicts at 0 or missing chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // would hit almost anything nonzero
    expect(rollAddictionChance(0)).toBe(false);
    expect(rollAddictionChance(undefined)).toBe(false);
  });

  it('addicts on a roll under the chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.30); // 30 < 35
    expect(rollAddictionChance(35)).toBe(true);
  });

  it('does not addict on a roll at or over the chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.35); // 35 is not < 35
    expect(rollAddictionChance(35)).toBe(false);
  });
});

describe('addictionStatusId / buildAddictionInstance', () => {
  it('follows the addicted_<itemId> convention', () => {
    expect(addictionStatusId('buffout')).toBe('addicted_buffout');
  });

  it('uses the authored addiction definition when present', () => {
    const def = { name: 'Addicted — Buffout', modifiers: { special_str: -4 } };
    const fx = buildAddictionInstance({ id: 'buffout', name: 'Buffout' }, def, 500);
    expect(fx.source_id).toBe('addicted_buffout');
    expect(fx.name).toBe('Addicted — Buffout');
    expect(fx.modifiers).toEqual({ special_str: -4 });
    expect(fx.is_addiction).toBe(true);
    expect(fx.applied_at_minutes).toBe(500);
  });

  it('falls back to a generic name and no modifiers when unauthored', () => {
    const fx = buildAddictionInstance({ id: 'buffout', name: 'Buffout' }, undefined, 500);
    expect(fx.name).toBe('Addicted — Buffout');
    expect(fx.modifiers).toEqual({});
  });
});

describe('splitCuredAddictionsByTime', () => {
  it(`clears an addiction at exactly ${CHEM_ADDICTION_CLEAN_DAYS} days clean`, () => {
    const fx = { id: '1', is_addiction: true, applied_at_minutes: 0 };
    const nowMinutes = CHEM_ADDICTION_CLEAN_DAYS * 1440;
    const { remaining, cured } = splitCuredAddictionsByTime([fx], nowMinutes);
    expect(remaining).toEqual([]);
    expect(cured).toEqual([fx]);
  });

  it('keeps an addiction one minute short of the clean threshold', () => {
    const fx = { id: '1', is_addiction: true, applied_at_minutes: 0 };
    const nowMinutes = CHEM_ADDICTION_CLEAN_DAYS * 1440 - 1;
    const { remaining, cured } = splitCuredAddictionsByTime([fx], nowMinutes);
    expect(remaining).toEqual([fx]);
    expect(cured).toEqual([]);
  });

  it('leaves non-addiction effects alone regardless of age', () => {
    const fx = { id: '1', name: 'Bleeding', duration_turns: 2 };
    const { remaining, cured } = splitCuredAddictionsByTime([fx], 999999);
    expect(remaining).toEqual([fx]);
    expect(cured).toEqual([]);
  });

  it('handles an addiction with no applied_at_minutes (nothing set yet) without crashing', () => {
    const fx = { id: '1', is_addiction: true };
    const { remaining, cured } = splitCuredAddictionsByTime([fx], 999999);
    expect(remaining).toEqual([fx]);
    expect(cured).toEqual([]);
  });
});
