# GM dashboard rework + check resolution

GM's bug reports, 26–27 Sep 2026. Four changes, independent enough to
build and ship one at a time. Written to be implemented without further
design input — where a decision was already made it is stated as a
decision, not an option.

**Build order: 4, 3, 1, 2.** Job 4 is small and unrelated; job 3 is a data
change everything else is easier on top of; job 1 is the layout; job 2
sits inside job 1's new console.

---

## The problem, stated once

`getGMView()` renders a roster of cards, and clicking one opens
`#gm-modal` — a single box capped at **`max-width: 420px`**
(`src/style.css`, `.modal-panel`) with `max-height: 90vh`, where only
`.modal-body` scrolls.

That one modal is doing three unrelated jobs: reading a character's state,
editing their vitals, and granting them things. Three jobs, one 420px
column, so all three are cramped and the grant controls sit below the fold
where the GM cannot find them.

The fix is to split by **what the GM is doing**, not by which character.

---

## Job 1 — Replace the modal with a console

The GM runs this on a **second monitor**, so horizontal space is available
and should be used.

### 1.1 Selection, not a modal

Clicking a squad card **selects** that character. It no longer opens a
modal. Keep `window.selectedCharId` as the store — it already exists and
`gmAdjustHP`, `gmRemoveStatusEffect` and the rest already read it, so
those controllers need no change.

- The selected card gets a visible selected state (border in
  `var(--pip-green)`, raised background), matching how the aimed-shot
  part buttons show selection in the combat panel.
- Clicking the selected card again does **not** deselect. There is always
  a target once one has been picked; deselecting only strands the console.
- Default on load: no selection, and the console shows a single line —
  "Pick someone from the squad above."
- `openGMModal` / `closeGMModal` and the `#gm-modal` markup are deleted.
  There are **4** `openGMModal` references across `src/` — the card's
  onclick, the two controller definitions and the `main.js` binding.
  Removing the modal must not remove `window.selectedCharId`, which the
  console still needs.

### 1.2 Layout

Two columns on a wide screen, stacking to one below **1100px**:

```
┌─────────────────────────┬──────────────────────────────┐
│ SQUAD MONITOR           │ CONSOLE — <selected name>    │
│  (cards, read-only)     │  [VITALS][INVENTORY]         │
│                         │  [STATS][STATUS]             │
│                         │                              │
│ PARTY                   │  …the selected tab…          │
│  crafting toggles       │                              │
│  time control           │                              │
└─────────────────────────┴──────────────────────────────┘
```

Use CSS grid with `grid-template-columns: minmax(320px, 420px) 1fr` and a
`@media (max-width: 1100px)` single-column fallback. No `max-width` cap on
the console. The existing panels below (Event Log, Players & Passcodes,
Combat, Reputation) stay where they are.

### 1.3 Squad cards become the at-a-glance readout

Read-only. Nothing on a card is clickable except the card itself. Each
card shows:

- Avatar, name, level, and the `☠ DECEASED` treatment already there
- HP bar (existing `.hp-bar-container` / `.hp-fill`)
- **The seven SPECIAL stats as a compact row.** **Raw stats** — what the
  character sheet says, `char.special[k]`, *not* `deriveCharacter()`
  values. The GM wants the sheet, not the current modified state.
- **Four survival meters** — hunger, thirst, sleep, radiation — as thin
  bars. Reuse `normalizeNeeds()` from `src/needs.js`; do not re-derive.
- **Status effect chips**, name only, wrapping. No remove buttons here —
  removal lives in the STATUS tab.

Cards grow taller. That is fine and is the point.

### 1.4 The console's four tabs

Tab state in `window.gmConsoleTab`, defaulting to `'vitals'`. View state
only — never written to Firestore, same as `window.reputationTargetId`.

| Tab | Contents | Source |
|---|---|---|
| **VITALS** | HP ±1 / full heal, revive-at-HP for the dead, radiation, the three needs, limb damage, karma | move from the modal + the STATUS tab's GM controls |
| **INVENTORY** | Job 2, below | new |
| **STATS** | SPECIAL adjust, skill adjust, level, XP | new — currently nowhere |
| **STATUS** | Apply an effect (existing dropdown), and the active-effects list **with** remove buttons | move from the modal |

The modal's pointer to the STATUS tab ("Radiation, survival needs, limb
damage and karma moved to the STATUS tab") is deleted — those controls
come back here, where the GM expects them.

**Crafting stations leave the character entirely.** See job 3.

---

## Job 2 — Inventory granting

Inside the console's INVENTORY tab. The item list is ~280 entries and
unsorted, which is why the current control is unusable.

### 2.1 The grant control

Two dropdowns and a button, in a row:

1. **Category** — the item `type` values: `weapon`, `armor`, `consumable`,
   `ammo`, `component`, `junk`, `accessory`, `currency`. Label them in
   plain words ("Consumables", "Weapons"). Default to whatever the GM
   picked last (`window.gmGrantCategory`, view state).
2. **Item** — every item of that category, sorted by name. Repopulates
   when the category changes.
3. **Quantity** — number input, default 1.
4. **GRANT** button.

The existing `window.gmGrantItem` controller keeps its signature; only the
UI feeding it changes.

### 2.2 What they are carrying

Below the grant row, the selected character's current inventory: item
name, quantity, and a **TAKE** button per row (quantity 1, or a number
box). Sorted by category then name, with a category heading between
groups. This is the GM's read of what someone has — the player's own
inventory view is unaffected.

### 2.3 Not building

**No party-wide item grant.** The GM confirmed items are always given to
one character at a time. Party-wide applies to crafting only (job 3).

---

## Job 3 — Crafting stations become party-wide toggles

### 3.1 The ruling

A workbench in the safehouse is not something one PC owns. Stations are
**party-wide**, and each is an **on/off toggle** the GM flips — not a
grant with a location label attached to a character.

### 3.2 Data

Today: `characters.<charId>.stations.<stationId> = "<location label>"`,
written by `gmGrantStation` / `gmRevokeStation` (`src/controllers.js`
~line 675–700).

New: `liveData.stations.<stationId> = true | false`.

`STATIONS` in `src/crafting.js` is unchanged. `field_kit` keeps
`always: true` and is never togglable — it is the bare-hands fallback.

### 3.3 Read path

One helper, and every read goes through it:

```js
// src/crafting.js
export function isStationAvailable(stationId, liveData, char) {
  if (STATIONS[stationId]?.always) return true;
  const party = (liveData && liveData.stations) || {};
  if (typeof party[stationId] === 'boolean') return party[stationId];
  // Fallback: campaigns in play still hold per-character grants. Honour
  // them until the GM flips the party toggle for the first time, or every
  // bench a party already had would vanish on this deploy.
  return !!(char && char.stations && char.stations[stationId]);
}
```

**Every read site, found — there are four.** All must go through the
helper, or a station will be on in one place and off in another:

| Where | Currently |
|---|---|
| `src/crafting.js` `hasStation()` | `!!(charStations && charStations[recipe.station])` — the core gate, called by `canCraft` |
| `src/controllers.js:1773` | `const atBench = !!(char.stations && char.stations[benchStationId])` — scrapping |
| `src/views.js:2345` | `const stations = charData.stations || {}` — Workshop display |
| `src/crafting.js:10,50` | comments describing the per-character model; update them |

`hasStation` takes `charStations` today. Change its signature to
`hasStation(recipe, liveData, char)` and update `canCraft`'s call — it
already receives `char`, so it only needs `liveData` threading through
from its callers.

### 3.4 UI

A **PARTY** panel in the left column, above or below time control:

```
CRAFTING STATIONS
Available to everyone. The field kit is always on.
  [x] Weapons Bench
  [x] Armour Bench
  [ ] Chem Station
```

One `gmToggleStation(stationId, enabled)` controller, one `updateDoc`.
`gmGrantStation` and `gmRevokeStation` are deleted along with their
location-label inputs and their `window.*` bindings in `main.js`.

### 3.5 Tests

- `isStationAvailable` returns true for `field_kit` with no data at all
- party `true` / `false` beat a per-character grant in both directions
- a per-character grant still works when the party has no value
- `false` is honoured as a value, not read as absent

---

## Job 4 — Skill checks reach the event log, and announce

### 4.1 The bug

`resolveGMCheck` (`src/controllers.js` ~line 3860) writes to `checks[]`
and optionally `messages[]`, but **never calls `pushEventLog`** — 15 other
controllers do. So a resolved check leaves no trace in the log and the GM
cannot tell whether it passed.

`src/eventLog.js` already supports `visibility: 'gm'`, so GM-only entries
were designed for and simply never wired here.

### 4.2 Logging

In `resolveGMCheck`, after `results` is built, add an event log entry:

- **Visibility** — `'gm'` when `hidden` (i.e. `!draft.reveal`), `'all'`
  when revealed. A hidden check must not leak through the log; that is
  the whole point of hiding it.
- **Text**, one line per outcome, naming who, what, and the result:
  `"Iron Legs — Lockpick (Difficult): PASSED (rolled 34, needed 55)"`
  Include the roll and threshold. The GM is the audience and wants the
  numbers; players only ever see the existing reveal message, which is
  unchanged.
- A crit gets said: `PASSED (CRITICAL)` / `FAILED (CRITICAL)` from
  `result.critType`.
- **Party scope** produces one entry per character, not one joint entry —
  they can pass and fail independently.

Do the same in the **player self-check** path — `resolvePlayerCheck`,
around `src/controllers.js:3768`, which writes
`{ checks: [...current, entry], last_resolution }` and likewise never
logs. A player's own check is never hidden, so its entry is always
`visibility: 'all'`.

### 4.3 The announcement

Reuse `showBigAnnouncement(headline, sublines, actionButton)` in
`src/main.js` — it already does exactly this for combat, including a 5s
CSS fill bar and `setTimeout(close, 5000)`.

- **Headline** — `CHECK PASSED` / `CHECK FAILED`. For party scope,
  `CHECK RESOLVED`.
- **Sublines** — one per character: name, skill, result. `showBigAnnouncement`
  already renders sublines in `#ff5555`; for a pass that reads wrong, so
  give sublines a colour argument or set it per line.
- **Button** — a plain dismiss. The GM's ruling: it is just a button
  players can click, and the 5s countdown dismisses the screen anyway.
  Pass no `actionButton`; the existing DISMISS is enough.
- **Duration** — 5s, same as combat. Do not introduce a second constant;
  lift the existing `5000` into a named one if it is used twice.

### 4.4 Who sees it

Fires for **everyone** on a revealed check. On a hidden check it fires for
the **GM only** — a big "CHECK FAILED" on a player's screen would give
away a roll the GM chose to hide.

Trigger it the same way the combat announcement is triggered: a
`window.liveData` watcher in `main.js` comparing the newest `checks[]`
entry id against a `window.lastAnnouncedCheckId`, so it fires once per
check and not on every re-render.

### 4.5 Tests

- pure builder for the log line, given a `results` entry — pass, fail,
  both crit types, party scope
- visibility is `'gm'` for a hidden check and `'all'` for a revealed one
- `visibleEventLog(log, 'player')` excludes a hidden check's entry

---

## Conventions

- One `updateDoc` per user action.
- New Firestore fields default safely when absent — `liveData.stations`
  and `window.gmConsoleTab` both have to survive being missing.
- Pure logic goes in a module with tests; `views.js` renders and does not
  decide.
- View state (`selectedCharId`, `gmConsoleTab`, `gmGrantCategory`) never
  reaches Firestore.
- Verify in the preview before calling it done, at second-monitor width
  **and** below 1100px.
