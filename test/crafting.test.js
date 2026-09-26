// Station availability: party-wide toggles (liveData.stations) with a
// fallback to the old per-character grant (characters.<id>.stations),
// honoured only until the GM has flipped the party toggle at all. See
// GM_DASHBOARD_SPEC.md Job 3.
import { describe, it, expect } from 'vitest';
import { isStationAvailable } from '../src/crafting.js';

describe('isStationAvailable', () => {
  it('is always true for field_kit, even with no liveData or char at all', () => {
    expect(isStationAvailable('field_kit', undefined, undefined)).toBe(true);
    expect(isStationAvailable('field_kit', {}, {})).toBe(true);
  });

  it('a party toggle set true wins over a character with no grant', () => {
    const liveData = { stations: { weapons_bench: true } };
    const char = { stations: {} };
    expect(isStationAvailable('weapons_bench', liveData, char)).toBe(true);
  });

  it('a party toggle set false wins over a character that still has the old grant', () => {
    const liveData = { stations: { weapons_bench: false } };
    const char = { stations: { weapons_bench: 'the old safehouse' } };
    expect(isStationAvailable('weapons_bench', liveData, char)).toBe(false);
  });

  it('falls back to a per-character grant when the party has never set this station', () => {
    const liveData = { stations: {} };
    const char = { stations: { armour_bench: 'a scrapyard lean-to' } };
    expect(isStationAvailable('armour_bench', liveData, char)).toBe(true);
  });

  it('treats a missing party value the same as never-set, still falling back', () => {
    const liveData = { stations: { weapons_bench: true } };
    const char = { stations: { armour_bench: 'somewhere' } };
    expect(isStationAvailable('armour_bench', liveData, char)).toBe(true);
  });

  it('is off when neither the party nor the character has ever granted it', () => {
    expect(isStationAvailable('chem_station', { stations: {} }, { stations: {} })).toBe(false);
    expect(isStationAvailable('chem_station', undefined, undefined)).toBe(false);
  });
});
