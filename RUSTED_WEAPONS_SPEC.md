# Rusted weapons

GM ruling, 10 Oct: *"Rusted weapons per weapon. Lets make it purely a
systems one for now."* Plus the original note: *"Add rusted versions of
powerful items, the base damage becomes similar to homemade tier. Jams
more often."*

Written to be built without further design input. Where a decision was
needed it is stated as a decision, with the reasoning, so it can be
overruled in one line rather than re-argued.

---

## What "per weapon, purely systems" means

Two readings were possible and they lead to very different amounts of
work:

- **Content:** author a `rusted_<id>` note for each weapon. 88 weapons,
  88 notes, 88 icons.
- **Systems:** one piece of code that, given any weapon, derives its
  rusted form. No new notes, no new art.

**This spec takes the systems reading**, because "purely a systems one
for now" rules out the content one and "for now" says the door is open
later. Every weapon still has a rusted version — that is the "per
weapon" part — but there is exactly one implementation and nothing new
to write or draw.

---

## The shape

A rusted weapon lives in inventory as the id `rusted_<baseId>`, so
`{itemId: qty}` is unchanged and nothing in Firestore needs migrating.

```js
// src/rusted.js — pure, no Firestore, no DOM
export function isRustedId(id)            // 'rusted_katana' -> true
export function baseIdOf(id)              // 'rusted_katana' -> 'katana'
export function rustedIdFor(id)           // 'katana' -> 'rusted_katana'
export function deriveRusted(baseItem)    // the full derived item
export function canRust(baseItem)         // which weapons have a rusted form
```

`getItem()` in `items.js` gains one branch: an id that `isRustedId`
resolves by looking up the base and returning `deriveRusted(base)`.
Everything downstream — inventory, equipping, combat, the GM console,
scrapping — then works without knowing rusted weapons exist.

---

## What rusting does

### 1. Damage falls to scrap tier

The scrap band in the current data is **1d4 to 1d8+1**: kitchen knife
1d6, bent rebar spear 1d6, pool cue 1d4+MD, homemade rifle 1d8+1.

The rule, applied to the base weapon's own damage:

1. Step the die down one size — d12 → d10 → d8 → d6 → d4. Floor at d4.
2. Reduce the number of dice to **1** if it was more.
3. Cap any flat bonus at **+1**; a negative bonus is left alone.
4. Keep `+MD` if the base had it — melee damage from SPECIAL is the
   wielder's, not the weapon's, and rust does not take it away.

So `2d6+2` → `1d4+1`. `1d8+1` → `1d6+1`. `1d10+MD` → `1d8+MD`.

> Why a formula rather than a flat number: a flat "all rusted weapons do
> 1d6" makes the choice between a rusted minigun and a rusted pistol
> meaningless, and the GM's words were "similar to homemade tier", not
> "identical to it". A stepped-down big gun is still worth slightly more
> than a stepped-down small one, which is what makes finding one
> interesting.

### 2. It jams more often

`src/combat.js:203` already has `1: { label: 'Misfire — jammed, loses
their next turn', effect: 'jammed' }` on the crit-failure table, and
`controllers.js:3169` applies it. Rusting widens the window:

- A normal weapon misfires on the existing crit-fail roll.
- **A rusted weapon also misfires on a roll of 2.**

One number, one place, and it reuses the `jammed` effect that already
exists rather than inventing a second jamming concept.

Melee weapons do not jam. For them, rust is the damage drop alone —
which is correct, and is also why the damage rule has to carry its own
weight.

### 3. It is worth much less

`value` drops to **25%** of base, rounded down, floor 1. A rusted
weapon is salvage, and this is what stops a rusted Fat Man being a
payday.

### 4. Name and icon

- Name: `Rusted <base name>` — "Rusted Katana".
- **Icon: the base weapon's icon, unchanged.** No new art. This is the
  single biggest reason the systems reading is the cheap one, and the
  GM can revisit it when the art queue is empty.
- Description: the base description plus one appended line, so the note
  stays the single source.

---

## Which weapons can rust

`canRust(item)` returns true when **all** of:

- `item.type === 'weapon'`
- it is not already rusted
- its damage is above the floor — a weapon already at `1d4` has nowhere
  to fall, so rusting it only removes value and adds a jam

Energy weapons **do** rust. They corrode, their cells leak, and the
GM's own art already shows pitted plasma casings. Nothing in the rule
needs to change for them.

> Open, and not blocking: the GM's note says "rusted versions of
> **powerful** items". The spec above lets any weapon rust, which is
> simpler and means a rusted anything can be dropped by any enemy. If
> rusted versions should only exist for Tier 3–4 weapons — currently
> fat_man, chinese_officers_sword, deathclaw_gauntlet, katana,
> power_fist, ripper, shishkebab, super_sledge, anti_materiel_rifle,
> battle_rifle, sniper_rifle — that is one predicate change in
> `canRust`.

---

## What this does NOT do

- **No repair.** Turning a rusted weapon back into its base is a
  crafting feature and belongs with the bench work, not here.
- **No rusting in play.** Weapons do not degrade into rusted ones
  through use. A rusted weapon is found rusted. Durability is its own
  system and already has a proposal.
- **No new art, no new vault notes.**
- **No GM console UI.** Granting one works through the existing item
  grant the moment `getItem` resolves the id.

---

## Tests

`test/rusted.test.js`, pure, no Firestore:

- `1d8+1` → `1d6+1`; `2d6+2` → `1d4+1`; `1d10+MD` → `1d8+MD`; `1d4` is
  refused by `canRust`
- a flat bonus above +1 is capped; a negative bonus is untouched
- `+MD` survives rusting
- value is 25% floored, never below 1
- `rustedIdFor` and `baseIdOf` round-trip for every weapon in the
  database
- `isRustedId` is false for a base weapon whose own id merely starts
  with "rusted" — there is no such weapon today, and the guard is what
  stops there being one by accident
- `getItem('rusted_katana')` returns a weapon named "Rusted Katana"
  carrying the katana's icon
- `getItem('rusted_nonsense')` returns null rather than a half-built
  object
- a rusted weapon's clip, ammo type and fire modes are the base's,
  unchanged — rust is damage, jamming and value, nothing else

---

## Conventions

- Pure logic in `src/rusted.js` with tests; `views.js` renders and does
  not decide.
- One `updateDoc` per user action.
- New fields default safely when absent.
