# CRAFTING — IMPLEMENTATION SPEC

Status: **approved for build, launch blocker (session one)**
Owner decisions locked: 2026-09-14

This document is the executable spec. It is written to be handed to an implementing
agent with no other context. Every task lists the exact file, the pattern to copy,
and how to verify it. Read `SCOPE_DECISIONS.md` for project-wide conventions first.

---

## 0. Locked design decisions

These were decided by the GM and are **not** open for reinterpretation during build.

| Decision | Ruling |
|---|---|
| **Resolution** | **Instant, no roll.** Meet the skill floor + have the inputs + be at the station → click → item is made. No dice, no failure state, no material loss. Mirrors `useItem()` exactly. |
| **Materials** | **Junk breaks down into generic components.** Concrete flavourful junk items → a small fixed set of generic components. See §1. |
| **Station gating** | **GM unlocks stations per location**, reusing the existing grant pattern (`gmGrantMap`). Field Kit is always available. |
| **Scope** | **Ships for session one.** Sequenced ahead of remaining content work. |

### Consequences of "instant, no roll" — read this before tuning numbers

Removing the dice removes the only *random* balance lever. The **only** levers left are:

1. Input cost (how much junk a recipe eats)
2. Skill floor (who can make it at all)
3. Station access (where, and whether the GM has granted it)

This means recipe numbers must be set deliberately, not casually. A recipe that is
cheap, has a low floor, and works at the Field Kit is *unconditionally* available to
every player forever. Budget accordingly — see §4.3.

---

## 1. Component categories — THE PROPOSAL

**7 common + 2 rare = 9 total.**

The count is derived, not arbitrary: every crafting-capable skill needs 2–3 primary
components so no discipline is starved and no component is dead weight. 9 rows also
fits the component ledger on a phone without scrolling.

### 1.1 The seven common components

| id | Name | Covers | Weight |
|---|---|---|---|
| `scrap_metal` | Scrap Metal | Structural filler — weapon frames, armour plate, ammo casings | 0.5 |
| `gun_parts` | Gun Parts | Springs, pins, receivers, barrels. Weapons + ammo only | 0.3 |
| `electronics` | Electronics | Wiring, boards, cells. Energy weapons, tech, robotics | 0.2 |
| `cloth` | Cloth & Hide | Fabric, leather, webbing. Armour, bandages, packs | 0.1 |
| `chemicals` | Chemicals | Solvents, reagents, propellant. Chems, stims, explosives | 0.2 |
| `adhesive` | Adhesive | Glue, resin, tape. Universal binder, small amounts everywhere | 0.1 |
| `organics` | Organics | Plant matter, meat, bone. Food, water purification, primitive gear | 0.2 |

### 1.2 The two rare components

Rare components are **not** a separate mechanic. They are ordinary components the GM
simply chooses to drop rarely. They exist to give high-tier recipes a gate that costs
no new code.

| id | Name | Gates | Weight |
|---|---|---|---|
| `prewar_tech` | Pre-War Tech | Intact circuitry, military electronics → energy weapons, advanced mods | 0.2 |
| `hardened_alloy` | Hardened Alloy | Ballistic plate, military steel → top-tier weapons and armour | 0.8 |

### 1.3 Coverage matrix — why these seven

`✓✓` = primary component for that discipline, `✓` = occasional.

| Component | Gunsmith | Engineering | Medicine | Science | Survival |
|---|:--:|:--:|:--:|:--:|:--:|
| Scrap Metal | ✓✓ | ✓✓ | | ✓ | ✓ |
| Gun Parts | ✓✓ | | | | |
| Electronics | ✓ | ✓ | | ✓✓ | |
| Cloth & Hide | | ✓✓ | ✓ | | ✓ |
| Chemicals | ✓ | | ✓✓ | ✓ | |
| Adhesive | ✓ | ✓ | ✓ | ✓ | ✓ |
| Organics | | | ✓✓ | | ✓✓ |

Every column has at least two primaries. Every row is used by at least two disciplines
except Gun Parts, which is deliberately single-purpose so gunsmiths have something that
is *theirs*.

### 1.4 Naming rule — generic components, flavourful junk

**Components stay mechanically generic.** `Scrap Metal`, not `Kampung Tin`. They are a
rules layer and must read instantly.

**Junk carries all the setting texture.** `Rusted Kapcai Carburettor`, `Warung
Signboard`, `Federation Ration Tin`. This is where Bandawang's character lives, and it
costs nothing mechanically because junk only ever resolves to components.

---

## 2. Architecture

### 2.1 The key insight — components need no new storage

Inventory is already `{ itemId: qty }` (see `src/inventory.js`). Components and junk
are **ordinary items** with a new `type`. They therefore inherit, for free:

- stacking
- carry weight
- `gmGrantItem` / `giveItem` player-to-player transfer
- inventory rendering

Do **not** build a parallel component store on the character document.

### 2.2 New content types

| Type | Storage | Notes |
|---|---|---|
| `component` | existing `itemDatabase` | `stackable: true`. Add to the type whitelist. |
| `junk` | existing `itemDatabase` | `stackable: true`, carries `scrap_yield`. |
| `recipe` | **new** `src/recipes.js` | New sync branch, mirrors `maps.js` generation. |
| stations | **new** `src/crafting.js` | Hardcoded const, 4 entries. Not synced — see §3.3. |

### 2.3 Character document additions

```js
characters.<id>.stations = { [stationId]: "Location Label" }
// e.g. { weapons_bench: "Axe Town", chem_station: "Lakeside Bar" }
```

A map rather than an array so the GM's flavour label ("where you found it") displays
in the Workshop, matching the approved mockup. Absent field = Field Kit only.

---

## 3. Build tasks

Tasks are dependency-ordered. Each is independently verifiable.

### TASK 1 — Admit components and junk to the pipeline

**File:** `sync-obsidian.js`, line ~213.

```js
// BEFORE
if (['weapon', 'armor', 'consumable', 'currency', 'accessory', 'ammo'].includes(data.type)) {

// AFTER
if (['weapon', 'armor', 'consumable', 'currency', 'accessory', 'ammo', 'component', 'junk'].includes(data.type)) {
```

That is the entire code change. Components and junk now flow into `itemDatabase`.

**Acceptance:** author one `component` and one `junk` `.md` file in the vault, run
`npm run sync`, confirm both appear in `src/items.js`.

---

### TASK 2 — Recipes as a synced content type

**File:** `sync-obsidian.js`. Add a branch alongside the existing `map` / `quest`
handling (line ~239). Copy the `map` branch's structure exactly — collect into a
module-level object, reset it in `runSync()`, write the generated file at the end.

Generated `src/recipes.js` must match the shape of `src/maps.js`:

```js
// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const recipeDatabase = { /* ... */ };
export function getRecipe(id) {
  if (!id) return null;
  const cleanId = id.toLowerCase().replace(/ /g, "_");
  return recipeDatabase[cleanId] || null;
}
```

**Recipe schema:**

```json
{
  "id": "recipe_pipe_pistol",
  "type": "recipe",
  "name": "Pipe Pistol",
  "category": "weapons",
  "produces": { "item": "pipe_pistol", "qty": 1 },
  "inputs": { "scrap_metal": 3, "gun_parts": 2, "adhesive": 1 },
  "station": "weapons_bench",
  "skill": { "key": "gunsmith", "min": 40 },
  "description": "A barrel, a spring, and enough tape to keep them arguing."
}
```

Field notes:
- `category` — one of `weapons | armour | ammo | chems | food | gear`. Used for UI grouping only.
- `station` — a station id, or `"field_kit"` for craft-anywhere.
- `skill.key` — must be a valid key in `SKILL_INFO` (`src/goatContent.js`).
- `skill.min` — compared against `derived.skills[key]`. Set `0` for no floor.
- `produces.item` — must resolve via `getItem()`. **The sync must warn if it does not.**

**Acceptance:** a recipe file syncs into `src/recipes.js`; a recipe naming a
nonexistent output item prints a warning (same loudness as the duplicate-ID guard).

---

### TASK 3 — `src/crafting.js` (new, hand-written)

Pure rules only. **No Firestore imports.** This mirrors how `formulas.js` and
`inventory.js` are already kept separate from `controllers.js`.

```js
export const STATIONS = {
  field_kit:     { id: 'field_kit',     name: 'Field Kit',     always: true,
                   description: 'A roll of tools and tape. Whatever you can manage in the dirt.' },
  weapons_bench: { id: 'weapons_bench', name: 'Weapons Bench', always: false,
                   description: 'A vice, a file, and somewhere to put the pieces down.' },
  armour_bench:  { id: 'armour_bench',  name: 'Armour Bench',  always: false,
                   description: 'Awls, rivets, and a stand to shape plate against.' },
  chem_station:  { id: 'chem_station',  name: 'Chem Station',  always: false,
                   description: 'Burners and glassware. Ventilation optional, regrettably.' }
};
```

Required pure functions:

```js
getMissingInputs(recipe, inventory) -> { [componentId]: shortfall }   // {} when satisfied
meetsSkillFloor(recipe, derivedSkills) -> boolean
hasStation(recipe, charStations) -> boolean                          // field_kit always true
canCraft(recipe, char, derivedSkills) -> { ok: boolean, reasons: string[] }
netWeightDelta(recipe) -> number                                     // output kg − input kg
```

`canCraft` must return **all** failing reasons, not just the first — the UI shows the
player everything blocking them at once.

**Acceptance:** unit-callable from the browser console with hand-built objects; no
import of `firebase.js` anywhere in the file.

---

### TASK 4 — Transactions in `src/controllers.js`

Copy the shape of `useItem()` (line ~464): build one `updatePayload`, issue exactly
one `updateDoc`, then `alert()`. Never write inventory with a per-item dot path — always
replace the whole `inventory` field (see the comment block in `src/inventory.js`).

#### `craftItem(recipeId)`

```
1. recipe = getRecipe(recipeId); guard null
2. char   = window.liveData.characters[window.currentUser]; guard null
3. derived = calculateDerivedStats(...)        // same arg list as resolvePlayerCheck()
4. const { ok, reasons } = canCraft(recipe, char, derived.skills)
   if (!ok) { alert(reasons.join('\n')); return; }
5. CARRY CHECK — only if netWeightDelta(recipe) > 0.
   Reuse the CARRY_OVERAGE_ALLOWANCE rule from giveItem(). Crafting usually
   consumes more mass than it produces, so most recipes skip this entirely.
6. let inv = normalizeInventory(char.inventory)
   for (const [cid, qty] of Object.entries(recipe.inputs))
       inv = removeFromInventory(inv, cid, qty)
   inv = addToInventory(inv, recipe.produces.item, recipe.produces.qty || 1)
7. single updateDoc({ [`characters.${id}.inventory`]: inv })
8. alert(`Crafted ${item.name}. Consumed: ...`)
```

#### `scrapItem(itemId)`

The inverse, and simpler. Consumes 1 junk item, adds its `scrap_yield`.

```
1. item = getItem(itemId); require item.scrap_yield
2. require getInventoryQuantity(char.inventory, itemId) >= 1
3. inv = removeFromInventory(inv, itemId, 1)
   then addToInventory for each [componentId, qty] in item.scrap_yield
4. single updateDoc; alert the yield
```

Scrapping is **instant and irreversible**. No confirm dialog for launch — but junk is
by definition low-value, so the blast radius is small.

#### `gmGrantStation(stationId, target, locationLabel)`

Copy `gmGrantMap()` (line ~346) almost verbatim, including the `target === 'all'`
handling and the `is_finalized` filter. The only difference: write a map key rather
than push to an array.

```js
updatePayload[`characters.${charId}.stations.${stationId}`] = locationLabel || STATIONS[stationId].name;
```

Also add `gmRevokeStation(stationId, target)` using `deleteField()` — the GM will want
to take a bench away when the party leaves town.

**Acceptance:** craft a recipe end to end in the live app; confirm inputs decrement,
output appears, and a second craft attempt with insufficient parts is refused with a
readable reason.

---

### TASK 5 — WORKSHOP tab

**File:** `src/views.js`.

1. `getNavbar()` line ~132 — add `'WORKSHOP'` to the tabs array:
   `const tabs = ['STATUS', 'DATA', 'GEOGRAPHY', 'WORKSHOP'];`
2. New `getWorkshopView(charId, liveData)`, following the structure of the existing
   tab views.
3. Register the tab in `src/main.js` alongside the others, and bind
   `window.craftItem` / `window.scrapItem` / `window.gmGrantStation`.

**Layout, top to bottom:**

```
COMPONENTS                       (ledger — all 9, dimmed at 0)
  Scrap Metal ............ 14
  Gun Parts .............. 3
  ...

STATIONS                         (● available, ○ not found)
  ● Field Kit ............ always
  ● Weapons Bench ........ Axe Town
  ○ Armour Bench ......... [not found]

RECIPES                          (grouped by category)
  [craftable ones first, then blocked ones dimmed]
  Pipe Pistol            [ CRAFT ]
    3 Scrap Metal · 2 Gun Parts · 1 Adhesive
  Combat Armour          [ needs Armour Bench ]
    missing: 4 Hardened Alloy

SALVAGE                          (junk in inventory)
  Rusted Kapcai Carburettor   [ SCRAP ] → 2 Scrap Metal, 1 Adhesive
```

UI rules:
- Craftable recipes sort above blocked ones. Blocked recipes stay **visible** and dimmed
  with the blocking reason shown — discovering what you *could* build is half the appeal.
- Missing input quantities render in `--danger`; satisfied ones in `--pip-green`.
- The craft button is `disabled` when `canCraft().ok` is false. Never hide it.
- Recipes whose station the player lacks still list, labelled with the station name.

**Acceptance:** the tab renders with an empty inventory without throwing; a player with
partial materials sees exactly which components they are short.

---

### TASK 6 — Content authoring

Launch targets. Author in the vault, not in `src/`.

| Content | Count | Notes |
|---|---|---|
| Components | **9** | Exactly §1. `stackable: true`, weights as tabled. |
| Junk | **~30** | Every one needs `scrap_yield`. Malaysian/Bandawang flavour. |
| Recipes | **~25** | Distribution below. |

Recipe distribution for launch:

- **8 field-kit recipes** — bandages, purified water, simple food, crude ammo.
  Low floors (0–25). These must exist or low-skill characters get nothing.
- **7 weapons-bench** — pipe weapons, ammo conversion, basic repair.
- **5 chem-station** — stimpaks, basic chems, radaway analogue.
- **5 armour-bench** — leather/scrap armour, backpack upgrades (fills the near-empty
  accessory slot flagged in the roadmap).

---

## 4. Authoring rules

### 4.1 Junk `scrap_yield`

- 1–3 component types per junk item. Never more.
- 1–4 of any single component.
- Total yield should feel like the object. A carburettor gives metal and adhesive;
  a radio gives electronics and a little metal.

### 4.2 The value rule — do not build a money printer

> **A crafted item's `value` must be ≤ 1.5 × the summed `value` of its inputs.**

Because crafting is instant and deterministic, any recipe violating this is an infinite
caps loop the moment a player can buy components. Check every recipe against this before
it ships.

### 4.3 Recipe cost shape by tier

| Tier | Station | Component types | Qty each | Rare? | Skill floor |
|---|---|---|---|---|---|
| 0–1 | Field Kit | 2 | 1–4 | no | 0–25 |
| 2 | Bench | 3 | 2–6 | no | 30–50 |
| 3 | Bench | 4 | 2–8 | 1–2 rare | 55–75 |

### 4.4 Component weights are a real constraint

Carry weight is live. At 0.5 kg, 40 Scrap Metal is 20 kg — a meaningful fraction of a
character's capacity. This is **intended**: it makes the Sturdy Backpack matter and
forces choices about what to haul home. Do not raise component weights above the table
in §1 without re-checking against `calculateDerivedStats().carryCapacity`.

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| Instant crafting trivialises scarcity | Station gating is the primary brake. Hold back `weapons_bench` / `chem_station` grants until the party has earned a base. |
| Money printing via craft-and-sell | The §4.2 value rule. Audit all 25 recipes before launch. |
| Component hoarding bloats inventory UI | Ledger is fixed at 9 rows; junk lists separately under Salvage. |
| Recipe references a deleted item | Sync-time warning in Task 2. Do not let this fail silently — that class of bug has already cost content three times on this project. |
| Scope creep into mods/attachments | Explicitly **out of scope**. Crafting makes whole items only. Weapon mods are a post-launch phase. |

---

## 6. Out of scope for session one

Captured so they don't leak into the build:

- Weapon/armour **modification** (attachments, upgrades to existing gear)
- Crafting **failure**, degradation, or quality tiers
- Recipe **discovery** — all recipes are visible from the start, gated only by skill/station
- Batch crafting (craft ×5)
- Components as a trade currency with NPC merchants
