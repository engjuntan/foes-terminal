// The ammo economy. The rule under test throughout: rounds only exist in
// two places — the pack, or the one weapon you're holding — and moving a
// weapon between those two states must never create or destroy a round.
import { describe, it, expect } from 'vitest';
import {
  weaponAmmoStats, usesAmmo, magazineOnEquip, ammoItemIdsFor, canonicalAmmoId,
  refundMagazine, clipState, heldRounds, availableFireModes, resolveFireMode
} from '../src/ammo.js';

const DB = {
  ammo_9mm:   { id: 'ammo_9mm',   type: 'ammo', ammo_type: '9mm' },
  ammo_9mm_x: { id: 'ammo_9mm_x', type: 'ammo', ammo_type: '9mm' }, // a second stack of the same type
  ammo_10mm:  { id: 'ammo_10mm',  type: 'ammo', ammo_type: '10mm' },
  pistol:     { id: 'pistol',  type: 'weapon', stats: { clip_size: 15, ammo_type: '9mm' } },
  smg:        { id: 'smg',     type: 'weapon', stats: { clip_size: 30, ammo_type: '10mm', burst_shots: 5 } },
  parang:     { id: 'parang',  type: 'weapon', stats: { dmg: '1d8' } },
  oddity:     { id: 'oddity',  type: 'weapon', stats: { clip_size: 4 } } // clip, but no ammo_type authored
};

describe('weaponAmmoStats', () => {
  it('reads clip, type and burst out of the stats block', () => {
    expect(weaponAmmoStats(DB.smg)).toEqual({ clipSize: 30, ammoType: '10mm', burstShots: 5 });
  });
  it('reports zeroes for melee rather than throwing', () => {
    expect(weaponAmmoStats(DB.parang)).toEqual({ clipSize: 0, ammoType: null, burstShots: 0 });
    expect(weaponAmmoStats(undefined)).toEqual({ clipSize: 0, ammoType: null, burstShots: 0 });
  });
});

describe('magazineOnEquip', () => {
  it('hands over an EMPTY magazine — equipping is not a free reload', () => {
    expect(magazineOnEquip(DB.pistol)).toBe(0);
  });
  it('gives melee no ammo entry at all, so the UI can tell it apart from empty', () => {
    expect(magazineOnEquip(DB.parang)).toBeNull();
  });
});

describe('ammo lookup', () => {
  it('finds every ammo item of a type', () => {
    expect(ammoItemIdsFor('9mm', DB)).toEqual(['ammo_9mm', 'ammo_9mm_x']);
  });
  it('picks a deterministic stack for refunds when several match', () => {
    expect(canonicalAmmoId('9mm', DB)).toBe('ammo_9mm');
  });
  it('never matches a weapon that happens to share the ammo_type', () => {
    expect(ammoItemIdsFor('9mm', DB)).not.toContain('pistol');
  });
  it('returns nothing for an unknown or missing type', () => {
    expect(ammoItemIdsFor('40mm', DB)).toEqual([]);
    expect(canonicalAmmoId(null, DB)).toBeNull();
  });
});

describe('refundMagazine', () => {
  it('returns what was left in the gun to the pack', () => {
    expect(refundMagazine({ ammo_9mm: 10 }, DB.pistol, 7, DB)).toEqual({ ammo_9mm: 17 });
  });
  it('starts a stack when the player had none of that ammo left', () => {
    expect(refundMagazine({}, DB.pistol, 3, DB)).toEqual({ ammo_9mm: 3 });
  });
  it('does nothing for an empty magazine', () => {
    expect(refundMagazine({ ammo_9mm: 4 }, DB.pistol, 0, DB)).toEqual({ ammo_9mm: 4 });
  });
  it('does nothing for melee', () => {
    expect(refundMagazine({ ammo_9mm: 4 }, DB.parang, 5, DB)).toEqual({ ammo_9mm: 4 });
  });
  it('drops rounds it cannot name rather than inventing an item', () => {
    // A clip weapon with no ammo_type has nothing to refund AS.
    expect(refundMagazine({}, DB.oddity, 4, DB)).toEqual({});
  });
  it('never mutates the inventory it was handed', () => {
    const before = { ammo_9mm: 2 };
    refundMagazine(before, DB.pistol, 5, DB);
    expect(before).toEqual({ ammo_9mm: 2 });
  });
  it('ignores negative or fractional round counts', () => {
    expect(refundMagazine({ ammo_9mm: 5 }, DB.pistol, -3, DB)).toEqual({ ammo_9mm: 5 });
    expect(refundMagazine({ ammo_9mm: 5 }, DB.pistol, 2.7, DB)).toEqual({ ammo_9mm: 7 });
  });

  it('conserves rounds across a full equip → fire → unequip cycle', () => {
    // The property that matters: nothing is created or destroyed.
    const startingRounds = 20;
    let inv = { ammo_9mm: startingRounds };
    let mag = magazineOnEquip(DB.pistol);            // equip: empty gun
    const loaded = 15;
    inv = { ...inv, ammo_9mm: inv.ammo_9mm - loaded }; // reload
    mag = loaded;
    mag -= 4;                                          // fire four
    inv = refundMagazine(inv, DB.pistol, mag, DB);     // unequip
    expect(inv.ammo_9mm).toBe(startingRounds - 4);
  });
});

describe('clipState', () => {
  it('describes a partly loaded magazine', () => {
    expect(clipState(DB.pistol, 6)).toMatchObject({ loaded: 6, max: 15, empty: false, full: false, ammoType: '9mm' });
  });
  it('flags empty and full', () => {
    expect(clipState(DB.pistol, 0).empty).toBe(true);
    expect(clipState(DB.pistol, 15).full).toBe(true);
  });
  it('clamps a stale value instead of drawing past the ends of the bar', () => {
    expect(clipState(DB.pistol, 99).loaded).toBe(15);
    expect(clipState(DB.pistol, -5).loaded).toBe(0);
    expect(clipState(DB.pistol, undefined).loaded).toBe(0);
  });
  it('has nothing to show for melee', () => {
    expect(clipState(DB.parang, 3)).toBeNull();
  });
});

describe('heldRounds', () => {
  it('adds up every matching stack', () => {
    expect(heldRounds({ ammo_9mm: 8, ammo_9mm_x: 4, ammo_10mm: 99 }, DB.pistol, DB)).toBe(12);
  });
  it('is zero for melee and for an empty pack', () => {
    expect(heldRounds({ ammo_9mm: 8 }, DB.parang, DB)).toBe(0);
    expect(heldRounds({}, DB.pistol, DB)).toBe(0);
  });
});

describe('availableFireModes', () => {
  it('offers single fire only for a weapon with no burst authored', () => {
    expect(availableFireModes(DB.pistol, 5).map(m => m.id)).toEqual(['single']);
  });
  it('offers burst when the weapon has burst_shots', () => {
    expect(availableFireModes(DB.smg, 30).map(m => m.id)).toEqual(['single', 'burst']);
  });
  it('names the round cost in the burst label, so the button says what it does', () => {
    expect(availableFireModes(DB.smg, 30)[1].label).toBe('BURST (5)');
  });
  it('disables burst with a reason when the magazine is too low', () => {
    const burst = availableFireModes(DB.smg, 3)[1];
    expect(burst.usable).toBe(false);
    expect(burst.reason).toBe('Needs 5 rounds, 3 loaded.');
  });
  it('disables single fire on an empty magazine and says to reload', () => {
    const single = availableFireModes(DB.pistol, 0)[0];
    expect(single.usable).toBe(false);
    expect(single.reason).toBe('Magazine empty — reload first.');
  });
  it('always gives melee one usable mode, so the panel is never blank', () => {
    expect(availableFireModes(DB.parang, null)).toEqual([
      expect.objectContaining({ id: 'single', usable: true })
    ]);
  });
});

describe('resolveFireMode', () => {
  it('keeps a mode the weapon can actually fire', () => {
    expect(resolveFireMode(DB.smg, 30, 'burst')).toBe('burst');
  });
  it('falls back to single when the magazine ran too low for burst', () => {
    expect(resolveFireMode(DB.smg, 2, 'burst')).toBe('single');
  });
  it('falls back to single when the player swapped to a weapon with no burst', () => {
    expect(resolveFireMode(DB.pistol, 10, 'burst')).toBe('single');
  });
  it('defaults to single for junk input', () => {
    expect(resolveFireMode(DB.pistol, 10, undefined)).toBe('single');
    expect(resolveFireMode(DB.pistol, 10, 'railgun')).toBe('single');
  });
});
