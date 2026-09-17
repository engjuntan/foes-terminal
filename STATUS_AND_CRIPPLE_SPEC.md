# STATUS SECTION & CRIPPLE SYSTEM — IMPLEMENTATION SPEC

Status: **approved for build**
Owner decisions locked: 2026-09-17

Executable spec, written to be handed to an implementing agent with no other
context. Read `SCOPE_DECISIONS.md` for project-wide conventions first.

Two features, specced together because they share one dependency: the Status
section is only worth building if it can say *why* a number changed, and the
cripple system is the biggest new source of "why".

---

## 0. Locked design decisions

| Decision | Ruling |
|---|---|
| **Cripple trigger** | **Manual-accurate.** Limb Resistance = EN/2 (round down) hits to cripple a limb. Crits still cripple instantly. |
| **Cripple scope** | **Players and monsters both.** Every combatant tracks per-limb hits. |
| **Limb damage persistence** | **Persists until treated.** Never clears on rest, never clears between fights. |
| **Cripple healing** | **Doctor's Bag (automatic) or a Medicine check (DC 20, can fail)** — plus the GM's existing manual removal. |
| **Status detail** | **Full provenance.** Every modifier shown with its source and value, not just the net figure. |

### What already exists (do not rebuild)

- `BODY_PARTS` (combat.js) maps every part to a to-hit penalty and an `effectId`.
- `crippled_arm` (−10 all combat skills) and `crippled_leg` (−2 AGI) are real
  status effects with real modifiers.
- `CRIT_SUCCESS_TABLE` rolls 2 and 3 already carry `effect: 'cripple_leg'` /
  `'cripple_arm'` tags that `resolveAttack()` switches on — **the crit path is
  already wired and already bypasses any counter.** Leave it alone.
- `grantEffect()` (controllers.js ~line 1465) already applies a status effect to
  a PC or monster combatant. Reuse it.
- `advanceTime()` heals HP but never touches status effects, so the manual's
  "rests may not heal crippled limbs" is **already satisfied** by accident. Keep
  it that way.

### The one real gap

`resolveAttack()` (controllers.js ~line 1626) currently does:

```js
if (bodyPart.effectId && stillUp && !killedOutright) {
  effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, bodyPart.effectId)}!`;
}
```

One successful aimed shot = instant cripple. That is the behaviour this spec
replaces with the hit counter.

---

## PART A — PROVENANCE

### A.1 The problem

`calculateDerivedStats()` merges every modifier source into final numbers and
throws away where each came from. A Status screen that can only say "PER 2"
is barely better than the character sheet. It needs to say "PER 5 → 2, because
Dehydrated took 2 and radiation took 1."

### A.2 The shape

Add a `breakdown` object to the return value. **Purely additive** — no existing
field changes, no existing caller breaks.

```js
breakdown: {
  baseSpecial: { str: 5, per: 5, ... },   // as stored on the character
  skillsBase:  { small_guns: 15, ... },   // computed, before post-calc modifiers
  special: {
    per: [ { source: "Dehydrated", sourceType: "need", value: -2 },
           { source: "Radiation (180 rads)", sourceType: "radiation", value: -1 } ]
  },
  skills: {
    small_guns: [ { source: "Guns and Bullets", sourceType: "book", value: 1 },
                  { source: "Crippled Arm", sourceType: "status", value: -10 } ]
  },
  other: [ { source: "Sturdy Backpack", sourceType: "equipment", key: "carry_bonus", value: 20 },
           { source: "Heavy Handed", sourceType: "trait", key: "melee_dmg_flat", value: 4 } ]
}
```

`sourceType` is one of: `trait` · `perk` · `status` · `need` · `radiation` ·
`book` · `equipment` · `race`. The UI groups and colours by it.

### A.3 Making sources nameable

The `modifierSources` array currently mixes named objects (traits, perks, status
effects all carry `.name`) with anonymous ones. Give the anonymous entries a
name and a type at construction:

```js
{ name: `Radiation (${rads} rads)`, sourceType: 'radiation', modifiers: radModifiers },
{ name: hungerTier.label,           sourceType: 'need',      modifiers: hungerTier.modifiers },
{ name: thirstTier.label,           sourceType: 'need',      modifiers: thirstTier.modifiers },
{ name: sleepTier.label,            sourceType: 'need',      modifiers: sleepTier.modifiers },
{ name: 'Skill books',              sourceType: 'book',      modifiers: permanentSkillBonuses },
```

Two notes:
- Need tiers already carry `.label` ("Dehydrated", "Starving"). Radiation tiers
  carry `.description` (long prose), so build a short label from the rad count
  instead of using it.
- A tier contributing nothing (`modifiers: {}`) must produce **no** breakdown
  rows. Filter empties or the Status screen fills with "Sated — no effect".

**Skill books are a special case.** `permanent_skill_bonuses` is a single summed
object, so it can only ever report "Skill books: +2" rather than naming the two
titles. To name them, read `char.read_skill_books` (the id list) and resolve each
through `getItem()`. Do this **in the view, not in formulas.js** — formulas
shouldn't depend on which books exist, only on the summed total it's given.

### A.4 Equipment and race

Equipment never passes through `modifierSources` — armor AC is added directly at
formulas.js line ~116, carry bonus at ~134. Push breakdown rows at those two
sites explicitly. Same for the race's natural AC/DR (`raceDef.stats`).

**Acceptance:** a character with a crippled arm, dehydration and one skill book
produces a breakdown whose rows sum exactly to the difference between
`skillsBase.small_guns` and `skills.small_guns`. If they don't reconcile, a
source is being applied without being recorded.

---

## PART B — CRIPPLE SYSTEM

### B.1 New derived stat

```js
// Manual p.446: "Limb Resistance - EN/2 (round down) — 5 would mean 5 attacks
// needed to cripple a limb." Floored at 1 so a 1-EN character doesn't get a
// 0-resistance limb that cripples on contact (or, worse, divides by zero
// downstream).
limbResistance: Math.max(1, Math.floor(end / 2))
```

Return it from `calculateDerivedStats()` alongside `poisonRes` / `radRes`.

### B.2 New state

**Players** — persists on the character document:

```js
characters.<id>.limb_damage = { left_arm: 2, right_leg: 1 }   // hits accumulated
```

**Monsters** — lives on the combatant entry inside `active_combat.initiative_order[]`,
discarded with the fight:

```js
{ combatant_id: "m_giant_rat_...", limb_damage: { left_leg: 1 }, ... }
```

Absent key = 0. Never write a zero; delete the key instead, so the Status screen
doesn't render eight "0/2" rows for a character who has never been shot.

Monster limb resistance derives from the monster's own EN if the bestiary entry
has one; **fall back to 2** if it doesn't (most bestiary entries carry no SPECIAL
block). Check before building — do not assume monsters have EN.

### B.3 Which parts can cripple

`BODY_PARTS` currently maps: arms → `crippled_arm`, legs → `crippled_leg`,
eyes → `blinded`, groin → `stunned`. Torso and head have no `effectId`.

The manual (p.652) lists Torso, Arm, Leg, Head, Neck, Eye as cripple-able, so
two new status effects need authoring in the vault before this ships:

| Effect | Suggested modifiers | Rationale |
|---|---|---|
| `crippled_head` | `special_per: -2, special_int: -2` | Concussed — senses and thinking both degrade. |
| `crippled_torso` | `special_end: -2, max_hp_flat: -10` | Broken ribs — you cannot take what you used to. |

Numbers are a starting proposal, not from the manual — the manual gives no
values for these. **Flag for GM review before authoring.**

### B.4 The trigger, replacing the instant cripple

In `resolveAttack()`, at the existing `bodyPart.effectId` block:

```
1. Skip entirely if the crit path already applied a cripple this attack
   (CRIT_SUCCESS_TABLE 2/3) — crits bypass the counter by design.
2. counter = (target.limb_damage?.[partKey] || 0) + 1
3. resistance = target's limbResistance (PC: derived; monster: bestiary EN or 2)
4. if counter >= resistance:
       grantEffect(target, bodyPart.effectId)
       clear that limb's counter (it's crippled now; the status carries the state)
       message: "KONG's right arm is crippled!"
   else:
       persist the incremented counter
       message: "KONG's right arm takes a hard hit. (2/3)"
```

**Telling the player how close they are is the whole point** — a counter nobody
can see is just random cripples. The near-miss message is not optional polish.

Counters are per specific `BODY_PARTS` key (`left_arm` separate from
`right_arm`), but the resulting status effect is the generic `crippled_arm`.
That asymmetry is intentional: tracking is positional, consequence is not.

### B.5 Counters persist until treated — they never reset on their own

**GM ruling: accumulated limb damage is an injury, not a per-fight tally.** It
does not clear at the end of combat, and it does not clear on rest. The only
thing that clears it is medical attention — a Doctor's Bag or the Medicine
skill (see B.6).

```
advanceTime()  →  never touches limb_damage (same rule as cripples)
endCombat()    →  never touches limb_damage for PCs
               →  DOES discard it for monsters, which cease to exist
```

This is deliberately harsher than either alternative considered, and it has a
knock-on worth understanding before tuning: with Limb Resistance at EN/2, a
low-EN character walking around at 1/2 on three limbs is one bad exchange from
three simultaneous cripples. **Medicine stops being a nice-to-have and becomes
the skill the party cannot travel without** — which is the intent.

### B.6 Treatment — the only thing that clears limb damage

Two routes, matching the two things a wasteland medic actually has: supplies, or
skill. Both routes treat **one limb** per use.

| Route | Cost | Reliability | Clears |
|---|---|---|---|
| **Doctor's Bag** | Consumes the item | Automatic, no roll | Accumulated hits **and** an active cripple |
| **Medicine check** | Free, repeatable | DC 20, can fail | Same on success; nothing on failure |

**Doctor's Bag.** This resolves the conflict flagged in the item's own
description. The Doctor's Bag was authored as a direct-heal (`2d10+10`) with a
comment noting it departed from the manual's "+15% to treat crippled limbs".
Under this ruling it becomes neither — it is **the reliable limb-treatment
consumable**, which is a better job than either. Keep the heal as a secondary
effect if you like the numbers; the limb treatment is now its reason to exist.

**Medicine check.** DC 20 (the manual's "Average" tier, already in
`DIFFICULTY_TIERS`). Reuse `resolvePlayerCheck()` rather than rolling fresh.
- Success → clear that limb's counter; if crippled, remove the status and heal
  `1d6+4` (manual p.652).
- Failure → nothing changes. No penalty for trying, but the limb stays as it is.
- Anyone can attempt it on anyone — a medic treating a teammate is the point.

**Eyes are the exception.** The manual says a crippled eye needs a replacement
eye, not a check. Out of scope; `blinded` stays GM-cleared.

**GM route.** `gmRemoveStatusEffect()` already clears cripples. It will also
need a way to clear `limb_damage` counters — see C.3.

**Perk route.** `Cancerous Growth` (authored this session, Ghoul-only) promises
"regenerate a crippled limb in 1 day". Hook into `advanceTime()`: 24h+ elapsed
and the character has that perk → clear one cripple *and* its counter. Cheap,
and it makes an authored perk real — plus it gives Ghouls a genuine structural
advantage in a system that otherwise taxes everyone equally.

---

## PART C — THE STATUS SECTION

### C.1 Placement, and a naming collision to fix first

The player dashboard's internal tab key is already `'STATUS'`, while its sidebar
button reads "1. DASHBOARD". Before adding anything:

1. Rename the existing tab key `'STATUS'` → `'DASHBOARD'` (main.js dispatch,
   `navMap`, and the `onclick` in index.html). It already *says* Dashboard —
   this just makes the code agree with the label.
2. Add the new tab as `'STATUS'`, sidebar button "8. STATUS".

Follow the WORKSHOP tab added in the crafting phase as the pattern for
registering a new tab end to end.

### C.2 Layout

```
CONDITION                     (what's active right now)
  ● Dehydrated          thirst 34/100      −2 PER  −1 AGI
  ● Crippled Arm        untreated          −10 all combat skills   [ TREAT ]
  ● Radiation — mild    180 rads           −1 END
  ○ Hunger              71/100             no effect yet

LIMBS                         (only parts that have taken hits)
  Right Arm   ●●   2/2   CRIPPLED          [ TREAT · Medicine 20 ]
  Left Leg    ●○   1/2   one more hit

ATTRIBUTES                    (provenance — the "why")
  PERCEPTION      5 → 2
     −2  Dehydrated
     −1  Radiation (180 rads)
  SMALL GUNS     15 → 6
     +1  Guns and Bullets (book)
     −10 Crippled Arm

PASSIVE                       (things helping, not hurting)
  +4   Melee Damage      Heavy Handed (trait)
  +20  Carry Capacity    Sturdy Backpack (equipped)
  +2   Healing Rate      Faster Healing (perk)
```

**UI rules:**
- Negative modifiers in `--danger`, positive in `--pip-green`, inert in grey.
  A condition present but not yet penalising (Hunger 71) shows dimmed with "no
  effect yet" — knowing you're *approaching* a penalty is the point.
- Only show an attribute row if it has at least one modifier. A clean character
  should see a short screen, not seven rows of "5 → 5".
- Limb rows appear only for parts with accumulated hits or an active cripple.
- Reuse `renderNeedGauge()` from the VITALS block rather than inventing a second
  bar idiom.

### C.3 GM view

The GM's squad modal already has needs sliders and status-effect controls. Add
limb state there: a per-limb hit counter the GM can set or clear directly, same
shape as the needs sliders. The GM needs to be able to break a limb narratively
without staging a combat round for it.

---

## Build order

1. **Provenance** (Part A) — purely additive to formulas.js, verifiable with no
   UI at all: call it in the console and check the rows reconcile.
2. **`limbResistance`** (B.1) — one line, no dependents yet.
3. **Status tab** (Part C) reading only what exists today — needs, rads, traits,
   perks, books, equipment. Ships useful on its own, before cripples change.
4. **Cripple counters** (B.2–B.4) — the riskiest piece, and it lands into a
   Status screen already built to display it.
5. **Healing routes** (B.6).
6. **Content**: `crippled_head` / `crippled_torso` status effects, after GM
   review of the proposed numbers in B.3.

Steps 1–3 are independently shippable. Do not start 4 before 3 is working —
debugging a hit counter you cannot see is the hard way to do it.

---

## Risks

| Risk | Mitigation |
|---|---|
| Breakdown rows don't reconcile with final numbers | The A.4 acceptance test. Any source applied outside `modifierSources` (equipment, race) is the likely culprit. |
| Monsters have no EN in the bestiary | B.2's fallback of 2. Verify against real bestiary entries before building, not after. |
| Cripples feel random | B.4's near-miss message. A visible counter turns a random event into a resource the player is managing. |
| Status screen becomes a wall of text | C.2's "only show rows with modifiers" rule. A healthy character should see almost nothing. |
| Untreated limb damage accumulates forever | Intended (B.5), but watch the first few sessions: if the party has no Medicine and no Doctor's Bags, this spirals fast. Doctor's Bags should appear in loot before the first serious fight. |
| Tab key collision | C.1's rename, done first, as its own step. |

---

## Out of scope

- Eye replacement / implants (manual requires a replacement eye — no implant
  system exists).
- Neck as a cripple location (manual lists it; no status effect, no body part).
- Weapon durability (the crit-fail table's entries 5–7 were already cut for this
  reason — see the comment in combat.js).
- Addiction and chem duration, still parked, still waiting on nothing but a
  decision to build them.
