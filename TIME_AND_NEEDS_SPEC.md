# IN-GAME TIME & SURVIVAL NEEDS — IMPLEMENTATION SPEC

Status: **approved for build**
Owner decisions locked: 2026-09-16
Baseline: Fallout: New Vegas hardcore mode, adjusted (see §1)

Executable spec. Written to be handed to an implementing agent with no other context.
Read `SCOPE_DECISIONS.md` for project-wide conventions first.

---

## 0. Locked design decisions

| Decision | Ruling |
|---|---|
| **Scale** | Base **100**, depleting. 100 = sated, 0 = critical. Inverse of FNV, which fills 0→1000. |
| **Needs tracked** | **Three** — hunger, thirst, sleep. Full FNV hardcore triad. |
| **Decay rate** | **Harsher than FNV.** Thirst 3.0/hr, hunger 2.0/hr, sleep 1.5/hr. |
| **At zero** | **HP drain per hour**, not death. Recoverable. |
| **Chem durations** | **Not in scope.** Stays parked — see §8. |
| **Radiation** | Unchanged. Displayed alongside needs but keeps its existing 0→1000 *filling* scale. |

---

## 1. The numbers

### 1.1 Decay rates and time to empty

| Need | Rate/hr | Empty in | Days | Penalises |
|---|---:|---:|---:|---|
| Thirst | **3.0** | 33.3 h | 1.4 | PER, AGI |
| Hunger | **2.0** | 50.0 h | 2.1 | STR, END |
| Sleep | **1.5** | 66.7 h | 2.8 | INT, CHA |

**The SPECIAL split is deliberately non-overlapping.** FNV lets dehydration and sleep
deprivation both hit PER/AGI/INT, which stacks into brutal double penalties. Here each
need owns two stats and nothing collides — 6 of 7 SPECIAL covered, LUK untouched.
Thirst degrades your *acting*, hunger your *enduring*, sleep your *thinking*.

### 1.2 What a day costs

| Span | Thirst | Hunger | Sleep |
|---|---:|---:|---:|
| 1 hour | −3 | −2 | −1.5 |
| 8h rest | −24 | −16 | **restored to 100** |
| 12h travel | −36 | −24 | −18 |
| 24h | −72 | −48 | −36 |

**Consequence to be aware of:** an 8-hour rest costs 24 thirst. Resting is therefore
itself a resource decision, not a free reset. Combined with a 1.4-day thirst clock, this
makes water the party's dominant logistical concern — which is the intended effect given
the Federation water-control arc, but it is a demanding system. See §7 for the escape
hatch that keeps it from becoming punishing between sessions.

### 1.3 Tier thresholds

FNV's five tiers (200/400/600/800/1000 of 1000) map cleanly onto the depleting 100 scale
at **80 / 60 / 40 / 20 / 0**.

**Hunger** — penalises STR, END

| At or below | Label | Modifiers |
|---:|---|---|
| 100 | Sated | — |
| 80 | Peckish | — |
| 60 | Hungry | `special_str: -1` |
| 40 | Famished | `special_str: -2, special_end: -1` |
| 20 | Starving | `special_str: -3, special_end: -2, max_hp_flat: -10` |
| 0 | Dying of hunger | above + `hp_drain_per_hour: "1d4"` |

**Thirst** — penalises PER, AGI

| At or below | Label | Modifiers |
|---:|---|---|
| 100 | Hydrated | — |
| 80 | Dry | — |
| 60 | Thirsty | `special_per: -1` |
| 40 | Dehydrated | `special_per: -2, special_agi: -1` |
| 20 | Severely dehydrated | `special_per: -3, special_agi: -3` |
| 0 | Dying of thirst | above + `hp_drain_per_hour: "1d6"` |

**Sleep** — penalises INT, CHA

| At or below | Label | Modifiers |
|---:|---|---|
| 100 | Rested | — |
| 80 | Tired | — |
| 60 | Drowsy | `special_int: -1` |
| 40 | Exhausted | `special_int: -2, special_cha: -1` |
| 20 | Collapsing | `special_int: -3, special_cha: -2` |
| 0 | Sleep deprived | above + `hp_drain_per_hour: "1d4"` |

Thirst drains HP fastest (1d6) because it empties fastest. That is intentional
reinforcement, not an accident.

---

## 2. Data model

### 2.1 The clock — one integer

```js
// Firestore root, alongside characters / checks / messages / active_combat
world: { minutes: 480 }   // minutes elapsed since campaign start. 480 = Day 1, 08:00
```

**Store a single integer, not `{day, hour, minute}`.** Advancing is `+= n`, comparison is
`<`, and there are no rollover bugs. Derive the display:

```js
day        = Math.floor(minutes / 1440) + 1
hourOfDay  = Math.floor((minutes % 1440) / 60)
minOfHour  = minutes % 60
```

Campaign starts at `minutes: 480` so Day 1 begins at 08:00 rather than midnight.

### 2.2 Per-character needs

```js
characters.<id>.needs = { hunger: 100, thirst: 100, sleep: 100 }
```

Absent field is treated as all-100 (a character created before this system shipped is
fully sated, not starving). Handle this in a `normalizeNeeds()` helper, matching how
`normalizeInventory()` tolerates the legacy array shape.

---

## 3. The tick — `advanceTime()`

This is the heart of the system. Everything else is display.

### 3.1 Partial-span damage — get this right

If a character sits at 20 thirst and the GM advances 24 hours, they hit zero partway
through. Damage must apply **only for the hours after they hit zero**, or advancing a
week either does nothing or wipes the party.

```
hoursUntilEmpty = current / rate
hoursAtZero     = Math.max(0, hoursElapsed - hoursUntilEmpty)
damage          = Math.round(rollPerHour * hoursAtZero)
```

A character already at 0 when time advances takes damage for the whole span, which falls
out of the same formula (`hoursUntilEmpty` is 0).

### 3.2 Sequence

```
advanceTime(minutes, { provisioned = false, restoreSleep = false })

1. hoursElapsed = minutes / 60
2. updatePayload = { 'world.minutes': currentMinutes + minutes }
3. for each character where is_finalized:
     a. needs = normalizeNeeds(char.needs)
     b. if (!provisioned):
          for each need in [hunger, thirst, sleep]:
            - compute hoursAtZero per §3.1, accumulate HP damage
            - needs[need] = clamp(0, 100, needs[need] - rate * hoursElapsed)
     c. if (restoreSleep) needs.sleep = 100
     d. write needs; write hp.current if damage was taken
4. ONE updateDoc with the whole payload
5. Report what happened — see §3.3
```

**One `updateDoc` for the entire party.** Do not loop Firestore writes per character;
follow the batching already used in `gmGrantMap()`.

### 3.3 Reporting

A time advance that silently damages four characters is unusable at the table. After the
write, post a **message** (reusing the existing `messages` array) summarising the span:

```
Day 3, 14:00 → Day 4, 02:00 (12 hours elapsed)
  Rashid    thirst 44→8    hunger 61→37
  Aminah    thirst 12→0    hunger 40→16   −14 HP (dying of thirst)
```

Targeted at `all`, so it lands in every player's inbox and the GM's log.

### 3.4 What must NOT advance time

Combat rounds are seconds. Crafting is instant by design (see `CRAFTING_SPEC.md`).
Neither touches the clock. Time moves **only** when the GM advances it.

---

## 4. Build tasks

### TASK 1 — `src/needs.js` (new, hand-written, pure)

No Firestore imports. Mirrors how `formulas.js` and `inventory.js` stay out of
`controllers.js`.

```js
export const NEED_RATES = { hunger: 2.0, thirst: 3.0, sleep: 1.5 };
export const HUNGER_THRESHOLDS = [...];   // §1.3
export const THIRST_THRESHOLDS = [...];
export const SLEEP_THRESHOLDS  = [...];

normalizeNeeds(raw) -> { hunger, thirst, sleep }      // absent → 100
getNeedTier(needKey, value) -> tier object
decayNeeds(needs, hours) -> { needs, damage: {hunger,thirst,sleep} }
formatGameTime(minutes) -> { day, hourOfDay, minOfHour, label }
```

**Tier lookup direction.** `getRadiationTier()` iterates ascending and keeps the last
tier where `rads >= t.rads`. Needs deplete, so invert: iterate descending and keep the
last tier where `value <= t.at`. Verify at the boundaries — 100 must be Sated, 20 must
be Starving, 0 must be Dying.

**Acceptance:** `decayNeeds({thirst: 20, ...}, 24)` returns thirst 0 and roughly
`(24 - 20/3) = 17.3` hours of 1d6 damage — not 24 hours of it.

---

### TASK 2 — Fold needs into `calculateDerivedStats()`

**File:** `src/formulas.js` line 17.

The function already takes `rads` and folds `getRadiationTier(rads).modifiers` into the
stat pipeline. Needs work identically — three more tier lookups, same modifier merge.

```js
// Append as the 10th parameter with a default so no existing call site breaks.
export function calculateDerivedStats(
  baseSpecial, level, activeTraits, activePerks, race,
  activeStatusEffects, equipment, rads, inventory,
  needs = {}                                          // ← new
)
```

Merge all three tiers' `modifiers` objects alongside the radiation tier's, using the
existing merge path. The `special_*` and `max_hp_flat` keys are already understood.

**Acceptance:** a character at thirst 15 shows −3 PER and −3 AGI on their sheet, and the
penalty disappears when the GM slides thirst back to 100.

---

### TASK 3 — Controllers

**File:** `src/controllers.js`

| Function | Notes |
|---|---|
| `advanceTime(minutes, opts)` | §3. GM-only. One `updateDoc`. Posts the §3.3 message. |
| `gmSetNeed(charId, needKey, value)` | Copy `gmSetRadiation()` (line ~443) verbatim; clamp 0–100 instead of 0–1000. |
| `restParty(hours = 8)` | Convenience wrapper: `advanceTime(hours * 60, { restoreSleep: true })`. |

**Extend `useItem()`** (line ~464) to read `stats.hunger`, `stats.thirst`, `stats.sleep`
and apply them to `char.needs`, clamped 0–100. The existing comment block at that
function explicitly parks these fields as reference-only — **update that comment**, since
it will no longer be true.

Values may be **negative** (see §5). Clamping handles that with no special case.

---

### TASK 4 — Display

**File:** `src/views.js`

**Player-facing — one VITALS block, four bars.** Generalise the existing
`renderCarryWeightGauge()` (line ~27) into `renderNeedGauge(label, value, max, color, suffix)`.
It already produces exactly the bar idiom requested.

```
VITALS
  HUNGER     [███████░░░]  72   Peckish
  THIRST     [█████░░░░░]  54   Thirsty      −1 PER
  SLEEP      [████████░░]  81   Tired
  RADIATION  [██░░░░░░░░] 180   Mild
```

- Needs **deplete**: green at 100 → amber → red approaching 0. Colour by *tier*, not by
  a raw percentage, so the bar changes colour exactly when a penalty starts applying.
- Radiation is **reversed** — it fills as it worsens. Keep its 0–1000 scale; do not
  rescale it to 100.
- Show the active penalty inline. A bar that is merely orange doesn't tell a player they
  are at −1 PER.

**The clock** renders persistently in the navbar area, visible on every tab:
`DAY 3 · 14:20`.

**GM-facing — sliders.** In the OVERRIDE tab, per character: three `<input type="range">`
0–100 bound to `gmSetNeed`, matching the existing radiation control's shape.

**GM-facing — time controls.** Preset buttons plus a manual entry:

```
ADVANCE TIME   [ +1h ] [ +4h ] [ +8h REST ] [ +1 DAY ]   [__] hrs [ GO ]
               [ ] Provisioned — party ate and drank normally
```

---

### TASK 5 — Content pass on consumables

**This is the largest task and the one that decides whether the system feels fair.**

All 31 consumables need hunger/thirst/sleep values. Only **five** carry any today, and
those were authored against no defined scale (values of 4–8, which on a 100-point scale
are close to meaningless).

**The restore scale:**

| Band | Value | Examples |
|---|---:|---|
| Light | 10–15 | a snack, a sip, a cigarette |
| Standard | 25–30 | a meal, a bottle |
| Heavy | 40–50 | a feast, a full canteen |

At 72 thirst and 48 hunger consumed per day, this puts a character at roughly
**2–3 drinks and 2 meals per day** — enough to make provisioning a real decision without
turning every session into inventory admin.

**Rescale the five existing items:**

| Item | Current | Becomes |
|---|---|---|
| `purified_water` | `hydration: 8` | `thirst: 30` |
| `dirty_water` | `hydration: 6` | `thirst: 25` (keep contamination risk) |
| `can_of_food` | `hunger: 8` | `hunger: 30` |
| `nasi_lemak_ration_brick` | `hunger: 6` | `hunger: 25` |
| `ikan_masin_jerky` | `hunger: 4` | `hunger: 15`, **`thirst: -8`** |

Note the field rename: `hydration` → `thirst`, so all three needs use the same key
names as the data model. Do not leave two names for one concept.

`ikan_masin_jerky` is salted dried fish and should cost water. It becomes a trade-off
item for free, with no new content authored.

---

## 5. Trade-off items

Negative values are the point. `stats` may carry any mix:

```json
{
  "id": "rokok_daun",
  "name": "Rokok Daun",
  "type": "consumable",
  "description": "Hand-rolled in a nipah leaf. Takes the edge off an empty stomach and puts it somewhere worse.",
  "effect": "Suppresses hunger, worsens thirst. Addictive.",
  "stats": { "hunger": 15, "thirst": -10 },
  "addictive": true,
  "addiction_rate": 5,
  "weight": 0.01,
  "value": 4
}
```

Suggested additions (author alongside the crafting content pass):

| Item | Effect | Why it's interesting |
|---|---|---|
| **Rokok Daun** (tobacco) | `hunger +15, thirst −10` | The requested archetype. Buys time against starvation at the cost of the faster clock. |
| **Kopi O** | `sleep +20, thirst −5` | Defers rest — and rest is expensive under these rates. |
| **Air Kelapa** | `thirst +35, hunger +5` | Premium hydration. Heavy, so carrying it is a choice. |
| **Budu Paste** | `hunger +20, thirst −15` | Fermented anchovy. Sustaining and brutally salty. |
| **Stale Field Ration** | `hunger +25, sleep −5` | Filling, unpleasant, sits badly. |

**Authoring rule:** a suppressant must never be net-positive across all three needs.
Tobacco that buys 15 hunger for 10 thirst is a trade; tobacco that buys 15 hunger for
nothing is just food.

---

## 6. Build order

1. `src/needs.js` — pure, testable in isolation, nothing depends on it yet
2. `calculateDerivedStats()` integration — penalties become real
3. `advanceTime()` + `gmSetNeed()` — the GM can drive it
4. Display — player bars, GM sliders, clock
5. `useItem()` extension — food starts working
6. Content pass — rescale 5, author ~26 more, add trade-off items

Steps 1–2 are independently verifiable before any UI exists: set `needs` by hand in
Firestore and confirm the character sheet's SPECIAL changes.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| **A time skip between sessions wipes the party.** At 3 thirst/hr, advancing a week kills everyone. | The **`provisioned` flag** in §3.2 is not optional — it is the escape hatch. Narrative time skips advance the clock with decay suppressed, on the assumption the party ate and drank normally. Build it in step 3, not later. |
| Harsh rates turn every session into inventory admin | The restore scale in §5 is tuned so 2–3 drinks and 2 meals cover a day. Audit against that before shipping, and be ready to soften rates after one real session — they live in one const. |
| Partial-span damage computed wrong | §3.1. Test the 24h-advance-from-20-thirst case explicitly; it is the case that breaks. |
| `hydration` vs `thirst` naming drift | §4, Task 5. Rename on the five existing items in the same commit that introduces the field. |
| Needs decay during combat | They must not. Combat never calls `advanceTime()`. |
| Legacy characters read as starving | `normalizeNeeds()` treats absent as 100. Verify with a character created before this ships. |

---

## 8. Out of scope

- **Chem durations and addiction accumulation** — the clock unblocks these, and 6 items
  already carry `duration`, `addiction_rate` and `addiction_threshold` fields doing
  nothing. Deliberately parked to keep this shippable. Now a first-class parking-lot item
  rather than a blocked one.
- Temperature, disease, encumbrance-driven fatigue
- Automatic real-time clock advancement
- Per-race need modifiers (Ghouls not needing water, etc.) — worth revisiting, but it
  interacts with race balance and shouldn't be decided here
