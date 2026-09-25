// The ammo economy: where rounds live, and how they move between a
// character's pack and the gun in their hands.
//
// The rule the GM set (2026-09-26): ammo is only ever tracked for the
// weapon you have equipped. Unequip and whatever is still in the
// magazine goes back into the pack as loose rounds, so nobody has to
// remember that the pistol at the bottom of the bag is half empty.
//
// That rule also closes a live exploit. Equipping used to hand out a
// FULL magazine for free, and unequipping did nothing with the rounds —
// so unequip-then-re-equip was an infinite reload for any weapon with a
// clip. Now a weapon arrives empty and you load it from what you own.
//
// Everything here is pure: it takes the item database rather than
// reaching for a global, so the whole economy is testable without a
// character, a slot or Firestore.

// `clip_size` and `ammo_type` are authored under the weapon's `stats`
// block, next to dmg/range — see any weapon note in the vault.
export function weaponAmmoStats(item) {
  const stats = (item && item.stats) || {};
  return {
    clipSize: stats.clip_size || 0,
    ammoType: stats.ammo_type || null,
    burstShots: stats.burst_shots || 0
  };
}

export function usesAmmo(item) {
  return weaponAmmoStats(item).clipSize > 0;
}

// A newly equipped weapon comes up empty. `null` (rather than 0) for
// anything that doesn't take ammo, so melee gear carries no ammo entry
// at all and the UI can tell "no magazine" from "empty magazine".
export function magazineOnEquip(item) {
  return usesAmmo(item) ? 0 : null;
}

// Ammo items declare `ammo_type` at the top level; weapons declare it
// under `stats`. Both spellings mean the same thing, hence the two
// lookups rather than one shared helper.
export function ammoItemIdsFor(ammoType, itemDatabase) {
  if (!ammoType) return [];
  return Object.keys(itemDatabase || {})
    .filter(id => {
      const def = itemDatabase[id];
      return def && def.type === 'ammo' && def.ammo_type === ammoType;
    })
    .sort();
}

// Which stack loose rounds go back into. There is normally exactly one
// ammo item per ammo_type; when there are several, the first by id wins
// so a refund is deterministic and a round can never land in a stack the
// player didn't already recognise.
export function canonicalAmmoId(ammoType, itemDatabase) {
  return ammoItemIdsFor(ammoType, itemDatabase)[0] || null;
}

// Rounds left in the gun go back to the pack. Returns the inventory
// unchanged when there is nothing to give back, when the weapon has no
// ammo_type to give it back AS, or when no such ammo item exists.
export function refundMagazine(inventory, item, rounds, itemDatabase) {
  const inv = { ...(inventory || {}) };
  const { ammoType } = weaponAmmoStats(item);
  const count = Math.max(0, Math.floor(rounds || 0));
  if (!usesAmmo(item) || !ammoType || count === 0) return inv;
  const ammoId = canonicalAmmoId(ammoType, itemDatabase);
  if (!ammoId) return inv;
  inv[ammoId] = (inv[ammoId] || 0) + count;
  return inv;
}

// What the clip tracker draws. `loaded` is clamped into the magazine so a
// stale or hand-edited value can't render a bar past full or below empty.
export function clipState(item, ammoValue) {
  const { clipSize, ammoType, burstShots } = weaponAmmoStats(item);
  if (!clipSize) return null;
  const loaded = Math.max(0, Math.min(clipSize, Number.isFinite(ammoValue) ? ammoValue : 0));
  return {
    loaded,
    max: clipSize,
    ammoType,
    burstShots,
    empty: loaded === 0,
    full: loaded === clipSize,
    fraction: loaded / clipSize
  };
}

// How many rounds of the matching type the character is carrying —
// what the reload button needs to know before it promises anything.
export function heldRounds(inventory, item, itemDatabase) {
  const { ammoType } = weaponAmmoStats(item);
  if (!ammoType) return 0;
  const inv = inventory || {};
  return ammoItemIdsFor(ammoType, itemDatabase)
    .reduce((sum, id) => sum + (inv[id] || 0), 0);
}

// --- FIRE MODES -----------------------------------------------------
// Burst is authored per weapon (`burst_shots`); a weapon without it has
// single fire only. Each mode reports whether it can actually be used
// right now and why not, so the button can say so instead of failing
// after the player commits to a shot.
export const FIRE_MODES = {
  single: { id: 'single', label: 'SINGLE', blurb: 'One round. Normal accuracy.' },
  burst:  { id: 'burst',  label: 'BURST',  blurb: 'Several rounds at once for extra damage, harder to hit.' }
};

export function availableFireModes(item, ammoValue) {
  const clip = clipState(item, ammoValue);
  const { burstShots } = weaponAmmoStats(item);
  const modes = [];

  if (clip) {
    modes.push({
      ...FIRE_MODES.single,
      cost: 1,
      usable: clip.loaded >= 1,
      reason: clip.loaded >= 1 ? null : 'Magazine empty — reload first.'
    });
  } else {
    // Melee, unarmed and anything else without a magazine still has a
    // single "mode", so the panel never renders an empty control.
    modes.push({ ...FIRE_MODES.single, cost: 0, usable: true, reason: null });
  }

  if (burstShots > 0) {
    const enough = clip ? clip.loaded >= burstShots : true;
    modes.push({
      ...FIRE_MODES.burst,
      label: `BURST (${burstShots})`,
      blurb: `${burstShots} rounds at once for extra damage, harder to hit.`,
      cost: burstShots,
      usable: enough,
      reason: enough ? null : `Needs ${burstShots} rounds, ${clip ? clip.loaded : 0} loaded.`
    });
  }
  return modes;
}

// The draft may still name a mode the weapon can no longer fire — the
// magazine ran down, or the player swapped to a weapon with no burst.
// Resolve it here so the attack and the preview always agree.
export function resolveFireMode(item, ammoValue, requested) {
  const modes = availableFireModes(item, ammoValue);
  const hit = modes.find(m => m.id === requested && m.usable);
  return hit ? hit.id : 'single';
}
