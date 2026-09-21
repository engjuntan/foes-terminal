# FOES Balance Proposal

Written by the `balance-auditor` agent on 2026-09-21. Nothing in `src/`, the vault
or the specs was changed. Everything below is a proposal for the GM to adopt,
change or reject.

**Tags.** **CHANGE** means an existing number or formula changes, and every affected
item is listed. **NEW** fills a gap. **BUG** means the code does not do what a
settled ruling or the manual says; the fix is a code change, not a balance call.

**Sources.** The GM rulings (`SCOPE_DECISIONS.md`, `*_SPEC.md`), then
`reference/manual.txt`, then `src/`, then the generated data. Simulation scripts are
in the session scratchpad (`…/scratchpad/balance/sim.mjs`, `party.mjs`, `wear.mjs`,
`repair.mjs`, `tables.mjs`). They import the real `src/combat.js`, `items.js` and
`bestiary.js`, and every Monte Carlo figure uses 4,000 to 20,000 runs.

**Currency unit.** An item's `value` is read as **RMR at a fair Federation-town
market**. That reading fits the data: purified water is 15, and a data log says
"Water's up two RMR a bottle again". The manual's MYR price column is about 5 times
higher. It belongs to the older "Kingdom of Malaya" draft and is treated as superseded
(open question Q1).

---

## 1. Summary: the changes that matter most

| # | Tag | Change | Why it matters |
|---|---|---|---|
| 1 | **BUG** | Combat, skill checks and crafting skill floors all read `derived.skills`, which leaves out the **+20 tag bonus and every skill point spent** (`skill_ranks`). Only the dashboard adds them back (`views.js:1253`). | A level-1 tagged gunner fights at 21% instead of the 41% on their sheet. Against 3 raiders the party wins 2% of the time as coded, against 11% as intended. Every number below assumes this is fixed. |
| 2 | **NEW** | Durability shape: `characters.<id>.condition = { inv: { itemId: [marks…] }, worn: { slot: marks } }`. Weapons and armor only. `inventory` stays `{itemId: qty}`. | This is the smallest shape that holds per-copy condition without touching any code that counts inventory. See §2.1. |
| 3 | **NEW** | Condition uses the **manual's 10 condition marks**. Armor loses 10% potency for each mark above 3. A weapon at 7+ marks takes −10% to hit and loses 10% damage for each mark above 7. At 10 marks a weapon is Broken. | Taken straight from the manual (Condition & Repair, and step 3 of the hit order). Integer steps a GM can say out loud. |
| 4 | **CHANGE** | Revalue all **29 junk items** so that `value = total value of their scrap_yield`. | Junk scraps into 2 to 5 times its own value. For example, Broken Radio Set costs 6 and yields 20. The moment a shop sells junk, that is a money printer. The spec's 1.5× rule only guards the craft step. |
| 5 | **CHANGE** | Rebuild the tier-1 raider from the PC formulas: HP 50→30, AC 18→13, hit 60→45%, DT/DR 3/20→2/25. | A level-1 party of 4 wins only 11% of fights against 3 raiders today. With the proposal it wins 95%. |
| 6 | **CHANGE** | Protectorate Infantry: Mortar 2d12+60 → 2d10+17 (needs one turn to set up), Grenade 2d12+20 → 2d8+9. | The mortar averages 73 damage, which one-shots every PC up to level 5 (PC HP is 30 to 61). With the mortar, a level-5 party wins 33% of fights against 2 infantry. |
| 7 | **NEW** | Official rates: **1 PD = 10 RMR, 1 Dinar = 200 RMR**. Bursa (black-market) spreads and regional shifts are in §4. Currency `value` fields change to 1 / 10 / 200. | All three currencies currently have `value: 1`. |
| 8 | **NEW** | Barter: buy ×1.25 and sell ×0.45 at the base, with 0.05 steps per 25 points of Speech. Hard limits are **buy ≥ 1.05 and sell ≤ 0.65**. | These limits are the line that stops craft-and-sell and repair-and-flip loops, including after the proposed junk fix. |
| 9 | **CHANGE** | Healing-rate perks should add a flat bonus *after* the EN cap, instead of raising the cap. | Healing is min(1d10, cap), so the extra cap above EN 7 is almost always unused. Faster Healing adds 0.3 HP per hour at EN 8 and nothing at EN 10. |
| 10 | **NEW** | Numbers for every `TBA`: 22 weapons, 23 armor pieces, 14 ammo types and 4 traits or perks (§3, §7). | These are needed before the bulk item-writing pass. |

Other bugs found along the way, each a one-line fix: burst fire never triggers, head
armor is ignored, Gergasi DR is unused, armor `modifiers` and Heavy Handed's crit
penalty do nothing, and Rad Child applies to everyone and everywhere. See §6.4 and §7.

---

## 2. Durability (priority section: build this first)

### 2.1 Data shape (**NEW**)

```js
// Unchanged — every existing reader (carry weight, give, equip, craft, scrap) keeps working.
characters.<id>.inventory = { "10mm_pistol": 2, "leather_armor": 1, "stimpak": 3 }

// New sibling field. Durable items only.
characters.<id>.condition = {
  inv:  { "10mm_pistol": [2, 7], "leather_armor": [5] }, // one integer 0–10 (marks) per copy, sorted ascending
  worn: { "right_hand": 3, "body": 4 }                   // marks on the copy sitting in each equipment slot
}
```

**Rules for the shape**

| Rule | Detail |
|---|---|
| Durable items | `(type === 'weapon' && skill !== 'throwing') \|\| type === 'armor'`. Grenades, mines, ammo, consumables, components, junk and accessories stay plain counts. |
| Invariant | For every durable id, `condition.inv[id].length === inventory[id]`. |
| Missing data | `normalizeCondition(char)` fills in missing copies with `item.base_marks ?? 0` and trims extra entries. A missing `worn[slot]` also means `base_marks ?? 0`. Legacy characters therefore upgrade silently, the same way `normalizeInventory()` handles the old array shape. |
| Writes | Replace `condition.inv` whole, in the **same `updateDoc`** as `inventory`, following the existing whole-field convention. Wear during combat writes `characters.<id>.condition.worn.<slot>` as a single dot-path field inside the attack's existing `updateDoc`. Neither case adds a write. |
| Default copy choice | Equip takes the lowest-marks copy. Scrap and sell default to the highest-marks copy. Give moves the copy the player picks. The UI shows one row per copy. |
| Vault field | **CHANGE:** replace `"condition": "disrepair"` with `"base_marks": 8` on `salvaged_power_armor_chestplate`, `salvaged_power_armor_helmet` and `fractured_laser_rifle`. |

**Rejected alternative: a per-copy instance id** (`gear: { g_ab12: { item, marks } }`).
It would be cleaner for future weapon mods, but every inventory reader would have to
read two stores. Plain integers are the minimum. If mods ever arrive,
`normalizeCondition` can turn `3` into `{ m: 3 }` without a migration script.

**Pure helpers.** Put these in a new `src/condition.js` with no Firestore import, the
same way `inventory.js` and `crafting.js` are kept separate.

```js
isDurable(item) -> boolean
normalizeCondition(char) -> { inv, worn }
takeCopy(condition, itemId, pick = 'best'|'worst'|index) -> { condition, marks }
putCopy(condition, itemId, marks) -> condition
weaponCondition(marks) -> { hitMod, dmgMult, broken, label }
armorMult(marks) -> number                        // 1.0 … 0.3
conditionValue(item, marks) -> integer RMR
scrapYieldFor(item, marks) -> { componentId: qty }
repairCostPerMark(item) -> { componentId: qty }
repairFloor(skill, atBench, hasTools) -> integer  // lowest marks this character can reach
```

**Code that must use the new shape:** `equipItem`, `unequipItem`, `gmUnequipItem`,
`giveItem`, `gmGrantItem` (add a marks input), `craftItem` (output copy starts at 0
marks), `scrapItem`, `resolveAttack` (including `destroyOrDropAttackerWeapon`, since a
dropped weapon returns with its marks), `gmFactoryReset`, `calculateDerivedStats`
(armor AC), `parseArmorDtdr`, and the inventory and hit-preview rendering in
`views.js`.

### 2.2 Condition scale

| Marks | Label | Weapon | Armor potency (AC, DT, DR) | Value |
|---|---|---|---|---|
| 0 | Pristine | full | ×1.0 | ×1.0 |
| 1–3 | Serviceable | full | ×1.0 | ×0.9 / 0.8 / 0.7 |
| 4 | Worn | full | ×0.9 | ×0.6 |
| 5 | Worn | full | ×0.8 | ×0.5 |
| 6 | Worn | full | ×0.7 | ×0.4 |
| 7 | Damaged | **−10% hit**, damage ×1.0, no Luck save on 91–99 | ×0.6 | ×0.3 |
| 8 | Damaged | −10% hit, damage **×0.9**, no Luck save | ×0.5 | ×0.2 |
| 9 | Damaged | −10% hit, damage **×0.8**, no Luck save | ×0.4 | ×0.1 |
| 10 | **Broken** | cannot be used. The attack is blocked with an alert and the turn is not spent, the same as out of ammo. | ×0.3 ("held on with tape") | ×0.1 (priced as 9 marks) |

**Why these numbers**
- Armor: "Each mark above 3 reduces its potency by 10%" (manual, Condition & Repair).
  The manual has no broken state for armor, so 10 marks leaves 30% potency.
- Weapons: "Each mark above 7 reduces the weapons damage by 10%, and the user suffers a
  −10% hit chance penalty", and step 3 of the hit order is "−10% Hit Chance if Weapon
  has 7 or more Condition Marks". **NEW:** 10 marks means Broken, following the Fallout
  NV convention that a weapon at 0 condition cannot be used. Without a broken state a
  weapon would never need repair past −30% damage.
- Value: `value × max(1, 10 − marks) / 10`. Each mark is 10% of the item, which also
  makes repair pricing easy (§2.5).

### 2.3 How condition feeds combat

| Quantity | Formula | Where |
|---|---|---|
| Weapon hit | `skill − AC − (marks ≥ 7 ? 10 : 0) + …` | `resolveAttack`, PC branch, next to `burstPenalty` |
| Weapon damage | `floor(rolled × dmgMult)`, applied **before** DT/DR, so a worn gun really does less against armor | same place as the aimed-shot `damageMultiplier` |
| Jam / fumble | At 7+ marks the Luck save on a natural 91–99 is skipped, so the roll is an automatic critical failure. At LK 5 the fumble rate goes from **5.5% to 10.2%** (simulated). | `resolveCrit` gets a `worn` flag |
| Armor AC | `AGI + floor(armor.ac × armorMult)` | `calculateDerivedStats`: add a 12th parameter `condition = {}` |
| Armor DT/DR | `floor(dt × m)`, `floor(dr × m)` for each damage type (the manual rounds down) | `parseArmorDtdr(armorItem, marks = 0)` |

**Worked example: Leather Armor (AC 15, Normal 2/25)**

| Marks | 0–3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| AC | 15 | 13 | 12 | 10 | 9 | 7 | 6 | 4 |
| Normal DT/DR | 2/25 | 1/22 | 1/20 | 1/17 | 1/15 | 1/12 | 0/10 | 0/7 |

**Worked example: 10mm Pistol (2d6+2, average 9, value 110)**

| Marks | 0–6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|
| Hit | ±0 | −10 | −10 | −10 | — |
| Average damage before DT | 9.0 | 9.0 | 8.1 | 7.2 | Broken |
| Value | 110 → 44 (0 to 6 marks) | 33 | 22 | 11 | 11 |

### 2.4 Wear: how marks are gained

| Source | Marks | Basis |
|---|---|---|
| Weapon: any critical failure | +1 | Manual: "on critical failures". **NEW:** every fumble counts, not only table entries 6 and 7. |
| Weapon: crit-fail table entries 6 and 7 | +1d6 instead of +1 | Manual crit-fail table. These entries are blank today because "the weapon-condition system was cut". Restore them once durability ships (GM sign-off needed, Q4). |
| Weapon: crit-fail entry 2 (Backfire) | set to 10 (Broken) *or* destroyed (the current ruling) | Q4. Broken keeps it repairable. The current ruling deletes it. |
| Melee: Block or Deflect special moves (GM adjudicated) | +1d2 / +1 | Manual special-moves table |
| Armor: a hit on you whose attack roll ends in 0 (10, 20 … 100) | +1 | The manual's "every 10 successful hits, one mark", turned into a roll the app already makes. No hit counter is needed and the GM can call it at the table. |
| Armor: explosive hit | +floor(raw damage / 10) | Manual: explosive damage "adds condition marks … according to the first digit of the damage" |
| Optional: improvised weapons (`improvised: true`) | Roll LK after each attack. On a failure, +1 mark. | The manual says improvised sticks and knives "roll luck after attack. On failure it breaks." This softens outright breaking to a single mark. |

**Simulated wear** (`wear.mjs`, 20,000 runs per case, weapons):

| LK | Attacks per mark | Pristine to Damaged (0→7) | Typical find to Damaged (3→7) | Damaged to Broken (7→10) |
|---|---|---|---|---|
| 3 | 14 | 55 attacks | 38 | 23 |
| 5 | 18 | 73 | 50 | 23 |
| 8 | 36 | 143 | 99 | 23 |

A level-1 fight is 8 to 17 rounds (§6), with one attack per PC per round. That puts a
serviceable weapon at about one repair every 3 to 5 fights. Luck matters, and the
spiral after 7 marks (no Luck save) makes a Damaged weapon worth fixing quickly. Armor
averages about 1 mark per 10 hits taken, which is roughly 15 or more level-1 fights
before potency starts to drop.

### 2.5 Repair (**NEW**, proposed ahead of the "repair/salvage" build)

**Resolution.** Repair is instant with no roll, the same as the crafting ruling. The
Repair cap and the component cost take the place of the manual's roll-and-waste-parts.
The manual's version is kept as the alternative in Q5.

**Skill used**

| Item | Skill | Station for the bench bonus |
|---|---|---|
| Small Guns and Big Guns weapons, and every melee or unarmed weapon | Gunsmith (matches the existing melee recipes) | Weapons Bench |
| Energy weapons, and power armor pieces | Science (manual: "science power armor") | Weapons Bench / Armour Bench |
| All other armor | Engineering (matches the armor recipes) | Armour Bench |

**How far a character can repair (the repair floor)**

`floor = max(0, 6 − floor(skill / 20))`. Being at the matching bench lowers it by 1
more. A Tool Set adds +25 to the repair skill (manual: "Adds 25% to repair skill").
Gunsmith's Tools add +25 to Gunsmith for weapons (the manual gives no number, so this
is a proposal).

| Skill | 0–19 | 20–39 | 40–59 | 60–79 | 80–99 | 100–119 | 120+ |
|---|---|---|---|---|---|---|---|
| Field floor (lowest marks reachable) | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| At the matching bench | 5 | 4 | 3 | 2 | 1 | 0 | 0 |

Example: a level-1 human with PE 8, AG 7 and IN 6 and a tagged Gunsmith has 41. Their
floor is 4, or 3 at a bench. With a Tool Set (66) it is 3, or 2 at a bench. Anyone can
always pull a weapon out of the Damaged band (7+), so the rule never locks a character
out. Pristine takes real investment, the way it does in Fallout NV. **This depends on
fix #1**, because the floor must read the sheet skill.

**Cost per mark removed.** A mark is worth 10% of the item, so fixing a mark costs
about 10% of the item's value in parts:

`primary × max(1, round(0.10 × value / primary.value))` + `1 secondary`, plus
`1 rare per 2 marks` for energy weapons and power armor.

| Category | Primary (value) | Secondary | Rare |
|---|---|---|---|
| Ballistic guns | Gun Parts (5) | Scrap Metal | — |
| Energy weapons | Electronics (6) | Gun Parts | Pre-War Tech, 1 per 2 marks |
| Melee and unarmed | Scrap Metal (2) | Adhesive | — |
| Powered melee (Ripper, Shishkebab, Power Fist) | Scrap Metal | Electronics | — |
| Light armor (under 5 kg) | Cloth & Hide (2) | Adhesive | — |
| Heavy armor (5 kg or more) | Scrap Metal | Cloth & Hide | — |
| Power armor pieces | Scrap Metal | Electronics | Hardened Alloy, 1 per 2 marks |

An optional `"repair": { … }` field on an item overrides its category.

| Item (value) | Per mark | RMR equivalent |
|---|---|---|
| Homemade Pistol (50) | 1 Gun Parts + 1 Scrap | 7 |
| 10mm Pistol (110) | 2 Gun Parts + 1 Scrap | 12 |
| Hunting Rifle (130) | 3 Gun Parts + 1 Scrap | 17 |
| Assault Rifle (200) | 4 Gun Parts + 1 Scrap | 22 |
| Machete (85) | 4 Scrap + 1 Adhesive | 11 |
| Sledgehammer (150) | 8 Scrap + 1 Adhesive | 19 (4 kg of scrap: the weight is intended) |
| Leather Armor (55) | 3 Cloth + 1 Adhesive | 9 |
| Ramshackle Armor (35) | 2 Scrap + 1 Cloth | 6 |
| Laser Pistol (240, proposed) | 4 Electronics + 1 Gun Parts + 1 Pre-War Tech per 2 marks | 41 per mark on average |
| Salvaged PA Chestplate (140) | 7 Scrap + 1 Electronics + 1 Hardened Alloy per 2 marks | 35 per mark on average |

**Loop check.** Buying a 9-mark item, repairing it to 0 and selling it pays
`V/10 × (10 × 0.65 − 1 × 1.05) − 9c`. That only makes a profit if the cost per mark
`c` is below 6% of value. The rule prices the primary component alone at about 10% of
value, and the secondary component adds more, so no item can be flipped for profit.
Cheap items (Kitchen Knife, Tarp Poncho, etc.) cost more than 10% because of the 1 + 1
minimum. That is harmless, since those are throwaway gear.

**Time (optional, ties into the clock).** 10 in-game minutes per mark in the field, 5
at a bench, through `advanceTime`.

**Vendor repair (later, with the shop).** A vendor charges `0.10 × value × buyMult`
per mark and repairs down to 2 marks, or 1 for a specialist.

### 2.6 Scrap yield from weapons and armor (**NEW**)

- Weapons and armor gain an optional `scrap_yield`. If the item has a recipe, the
  default is **50% of each recipe input, rounded down, minimum 1**. For example, the
  Homemade Pistol yields 2 Gun Parts and 2 Scrap Metal. The authoring rule for items
  without a recipe is that the yield must be worth **≤ 40% of the item's value**.
- Condition: 0 to 6 marks gives the full yield. **7 to 10 marks gives half**, rounded
  down, with at least 1 of the first component.
- Loop check: crafting then scrapping returns about 0.5× the inputs, and buying then
  scrapping returns about 0.35× the buy price, so neither makes a profit.

### 2.7 Condition of found and stocked gear (**NEW**)

This carries out the world rule that "anything high-tier appears worn". The GM's grant
dialog pre-fills this roll.

| Item value | Marks when found |
|---|---|
| under 100 | 1d4 |
| 100–249 | 2 + 1d4 |
| 250–499 | 4 + 1d4 |
| 500 or more | 6 + 1d4 (often Damaged or Broken) |
| Vendor stock | the vendor's repair floor (2) |
| Crafted | 0 |

---

## 3. Item values

### 3.1 Value formulas

**Weapons:** `value ≈ K × average damage` (MD not included). Round to 5.

| Class | K | Checked against current data |
|---|---|---|
| Improvised or scrap (homemade, rebar, pipe, board) | 5 | Nail Board 2.2, Rebar Spear 2.3, Minigun-barrel Club 5.0 |
| Standard melee and civilian guns | 12–15 | 9mm 12.0, 10mm 12.2, .44 13.0, Machete 18.9, Fire Axe 13.8 |
| Military or automatic rifles | 18–20 | Assault Rifle 18.2, Battle Rifle 19.4, Katana 20.0 |
| Energy weapons | 22 | (all TBA) |
| Big guns (burst or emplaced) | 45 | Minigun 53, Gatling 51 |
| Launchers (not counting ammo) | 20–25 | Fat Man 37.7, a nuke-grade outlier |
| Thrown single-use items | 2 × average | — |

**Armor:** `value ≈ score × tier`, where `score = AC + 3 × DT(normal) + DR(normal) / 2`.
Tier is ×1.5 for clothing, soft or civilian gear, ×2 for scavenged or gang armor, ×3
for military issue and ×4 for elite, heavy or pre-war. On the 10 armor pieces that
already have numbers, the formula lands within ±20% of the current value for 9 of
them. The exception is Combat Leather Jacket (below).

### 3.2 Proposed values and stats for every TBA

Energy and heavy weapons below are scaled to the **vault's** damage scale, not the
manual's. The manual's guns are about 1.8× the vault's (10mm Pistol: manual 2d6+9,
vault 2d6+2). The conversion is manual average × 0.55, rounded to dice.

| Item | dmg | range | value | Reason |
|---|---|---|---|---|
| laser_pistol | 2d6+4 | 15 | 240 | Manual 6d4+5 → 11. Beats the 10mm through low laser DT on most armor. |
| laser_rifle | 2d10+6 | 30 | 375 | Battle Rifle average. Laser DT is 0–1 on most armor, which is the edge. |
| plasma_pistol | 2d8+4 | 15 | 285 | Manual 8d4+5 → 13. |
| plasma_rifle | 3d8+6 | 28 | 430 | Manual 5d8+25, scaled to sit just above the laser rifle. |
| plasma_caster | 4d8+10 | 25 | 615 | Top non-unique energy weapon. |
| gauss_pistol | 3d8+9 | 20 | 495 | Manual 6d6+20 → 22.5. Gauss ammo halves DT (manual). |
| gauss_rifle | 3d10+18 | 50 | 760 | Manual 6d6+60 would be 44 after scaling. Capped near 1.4× the Anti-Materiel Rifle so it doesn't one-shot every PC. |
| tesla_cannon | 3d10+20 | 25 | 805 | Manual energy Cannon 5d10+45 → 40, trimmed. Arcs, so area damage is left to the GM. |
| 50_cal_machine_gun | 2d8+8 | 30 | 765 | Manual "Strong HMG" +22 with heavy ammo → 17 per roll. Burst doubles it. |
| light_machine_gun | 1d8+3 | 25 | 340 | Manual LMG +5 with light ammo. Matches the Minigun per roll, and is lighter. |
| rocket_launcher | 4d10+5 | 30 | 675 | Manual Rocket +25 with Missile 6d8 → 29 (explosive). |
| missile_launcher | 4d10+8 | 40 | 750 | Guided: +3 damage and +10 range over the rocket launcher. |
| grenade_launcher | 2d10+12 | 25 | 460 | Manual 40mm Explosive 2d10+20 plus launcher +10 → 23. |
| frag_grenade | 2d8+9 | 8 | 35 | Manual 2d12+20 → 18. Manual: an AG save halves it and a fail adds 1d6 bleed. |
| dynamite | 2d10+8 | 8 | 30 | Pre-war stock with a fuse, slightly cheaper than frag. |
| incendiary_grenade | 2d6+6 fire | 8 | 30 | Adds burning damage over time. |
| molotov_cocktail | 1d10+4 fire | 8 | 15 | Scrap tier and a craft candidate (Chemicals + Cloth + a bottle). |
| plasma_grenade | 4d10+15 plasma | 8 | 90 | Manual 5d10+40 → 37. Rare. |
| land_mine | 2d10+15 | 1 (placed) | 55 | Placed with Traps. Priced against the Bear Trap (60). |
| 1414_chain_whip | 1d6+1 | 1 | 20 | Improvised flail, K 5. |
| axe_gang_cleaver | 1d10+2 | 1 | 110 | Forged and oversized: Cleaver +1 die step. K 15. |
| lim_clan_straight_razor | 1d6+1 | 1 | 65 | Concealable, K 15. Optionally +5 crit chance on aimed shots. |
| parang | 1d8+1 | 1 | 85 | The Malay machete: +1 damage over the Machete, at the same price. |
| rebar_nail_club | 1d6+2 | 1 | 25 | Improvised, K 5. |
| water_pipe_cudgel | 1d6+1 | 1 | 20 | Improvised, K 5. |
| keris (dmg exists) | — | — | 250 | 2d6+4+MD is from the manual (Smithed). K 20 plus the Lithe Thrust special move. |
| pneumatic_nail_driver | 1d8+2, **skill small_guns** | 6 | 80 | Factory tool. Needs an `ammo_type` decision (Q9). |

| Armor | value | Armor | value |
|---|---|---|---|
| 1414_windbreaker | 10 (gang colours are social value) | protectorate_heavy_trooper_armor | 285 |
| axe_town_coveralls | 40 (see the outlier note) | protectorate_infantry_armor | 150 |
| clothes | 5 | protectorate_officers_uniform | 35 |
| factory_respirator | 30, **`gas_res: 50`** | rebar_plate_vest | 65 |
| ghoul_wrap | 3 | supermutant_clothes | 45 |
| lim_clan_tailored_suit | 150 (tailored, CHA +2) | ucl_officers_uniform | 15 |
| malayan_frontliner_armor | 255 | ucl_soldier_armor | 100 |
| malayan_infantry_armor | 125 | ucl_vanguard_armor | 220 |
| malayan_officers_uniform | 25 | water_wardens_slicker | 15 (faction issue) |
| mercenary_armor | 85 | metal_plates | 15 |
| press_plate_armor_oversized | 80 | prison_slave_clothes | 1 |

**Ammo, per round.** `makeshift_rounds` = 2 is the floor.

| Ammo | value | Ammo | value |
|---|---|---|---|
| ammo_9mm | 2 | ammo_shotgun_shells | 4 |
| ammo_10mm | 3 | energy_cell | 6 |
| ammo_556 | 4 | plasma_cartridge | 10 |
| ammo_5mm | 2 (miniguns burn hundreds) | 2mm_ec | 15 |
| ammo_762 | 5 | flamer_fuel | 3 |
| ammo_14mm | 5 | 40mm_grenade | 40 |
| missile | 120 | mini_nuke | 500 |

The five calibers that have no ammo item yet (.22 / .32 / .44 / .45 / .50) should be
priced 2 / 2 / 4 / 4 / 10.

A level-1 fight uses about 10 rounds per gunner, which is 20 to 30 RMR of ammo. That is
a real cost next to a 75-RMR Stimpak, without being ruinous.

### 3.3 Outliers in current values

| Item | Now | Proposal | Reason |
|---|---|---|---|
| combat_leather_jacket | 60 | **CHANGE → 110** | AC 20 (the manual's number, left alone) at 3.5 kg with CHA +2. It beats Leather Armor (AC 15, 6 kg, 55) and Studded Leather (AC 20, 11 kg, 75) outright. |
| axe_town_coveralls | stats | **Flag** | Ramshackle stats (AC 8, 2/25) at 1.5 kg against Ramshackle's 7 kg, described as "light, cheap". Suggest AC 4, 1/10 (the rattan basket tier) and value 12. The GM decides. |
| Skill books (54 items) | 145–250 for +1% | **CHANGE:** effect +1 → **+3** (the Fallout NV book), keep values | +1% for about 200 RMR is a poor buy. One level-up gives 11 to 29 points. |
| med_kit | 55 for 1d10 (5.5 HP) | **CHANGE → 30**. Recipe inputs → 3 Chemicals + 3 Organics (ratio 1.43) | At 10 RMR per HP it is twice the price of a Stimpak (4.8 per HP) for a slower heal. The heal amount is from the manual and stays. |
| homemade_pistol | 1d6 | **CHANGE → 1d6+2** | Useless against DT 3 or more: 106 attacks to kill a current raider. The manual's "Weak" pistol is +4 flat. |
| keris | 2d6+4 at 0.5 kg | Keep (manual) and price at 250 | It hits harder than a Sledgehammer. The value has to reflect that. |

---

## 4. Currency exchange

### 4.1 Official rates (**NEW**, `value` becomes the RMR equivalent)

| | in RMR | in PD | Basis |
|---|---|---|---|
| 1 RMR | 1 | 0.1 | The unit. "Most common … most liquid." |
| 1 Protectorate Dollar | **10** | 1 | The manual's own price columns put MYR:PD at about 10:1 (Stimpak 500:50, one quest 500:50). The vault says PD is "rare and highly valuable" and "most stable". |
| 1 Caliphate Dinar | **200** | 20 | The vault describes a "non-mintable" token "treated as spiritual relics", "limited usage, immense value". 200 is about the price of an assault rifle: a real reward that doesn't break a level-1 economy. The manual's 0.5–2 MYR comes from the older "trinitite coin" version and is superseded. |

**CHANGE:** `rmr.value` stays 1, `pd.value` 1 → **10**, `dinar.value` 1 → **200**.

### 4.2 Black market (the Bursa sheet) and regional shifts

The Bursa quotes two prices: what it **buys** at and what it **sells** at, in RMR per
unit. The lore says "Black market dealers … will inflate exchange rates for RMR", so
converting RMR into anything else always loses more than the official rate.

| Region / market | PD (Bursa buys / sells) | Dinar (buys / sells) | RMR prices | Notes |
|---|---|---|---|---|
| Federation towns and bunkers | 11 / 14 | 150 / 250 | ×1.0 | Home of the RMR. Only validated notes are accepted at full value. |
| Border towns (Bandawang, the lake) | 12 / 15 | 160 / 260 | ×1.1 | All three currencies are priced, "adjusted by the ruling garrison". |
| Protectorate (Penang) | licensed: 12 plus a 10% licence fee. Bursa: 15 / 20 | 180 / 280 | ×1.25, or refused | Vault: "Smuggling PD is punishable by confiscation". A black-market deal risks confiscation (GM check). |
| Caliphate (Round City) | 10 / 13 | House of Syed buyback **200**. Cults and scholars pay **300–400** | ×1.0 | The vault says RMR is the Caliphate's daily money, and cults and scholars pay high for Dinars. |
| KLB (City of the Dead) | 13 / 18 | 150 / 250 | ×1.0 | Old **unstamped Ringgit is taken at full value by ghouls** (the Sepuluh Ribu identity hook). |
| UCL north | ? | ? | ? | No source. See Q2. |

### 4.3 Counterfeits, unstamped notes and Federation Bond Slips (**NEW** items)

| Item | Official | Bursa | Mechanic |
|---|---|---|---|
| `rmr_unstamped`, "Old Ringgit" (unvalidated) | 0.5 | 0.4 | Full value in KLB and ghoul markets. Vault: "nearly any old Ringgit can be used, but only officially validated notes carry full value." |
| `rmr_suspect`, "Ringgit (unverified)" (counterfeit) | 0 if caught | 0.3 | Spending it prompts the GM to roll the vendor's Instinct or PER against the note's quality. If caught, the note is refused and reputation with that town drops by 5. |
| Active counterfeit ring in a region (vault hook) | — | — | Every RMR price in that region rises by one ×0.1 step, and vendors inspect notes (−10 Speech for barter). |
| `bond_slip`, Federation Bond Slip | face value (for example 10) | **1 per slip** | Vault: "nearly worthless, trading at 1:1 with RMR". Read as one slip trading for one RMR whatever its face value. Federation offices pay face value only to citizens at Liked or above, and in kind (rations or power credit) after a delay. That is a quest hook. See Q3. |

---

## 5. Barter (proposal only: no shop exists yet)

FOES has no Barter skill. **Speech** (5 + 2×CHA) stands in, with CHA as a small extra
modifier.

| Speech | Buy × | Sell × |
|---|---|---|
| 0–24 | 1.25 | 0.45 |
| 25–49 | 1.20 | 0.50 |
| 50–74 | 1.15 | 0.55 |
| 75–99 | 1.10 | 0.60 |
| 100+ | 1.05 | 0.65 |

| Modifier | Buy | Sell |
|---|---|---|
| CHA ≤ 3 | +0.05 | — |
| CHA ≥ 8 | −0.05 | — |
| Reputation (below) | as listed | as listed |
| **Hard limits** | **≥ 1.05, ≤ 2.0** | **≥ 0.20, ≤ 0.65** |

`price = round(value × conditionMult × mult)`.

**Why the limits.** A recipe may output up to 1.5× the value of its inputs (CRAFTING_SPEC
§4.2). Buying inputs at 1.05, crafting, then selling at 0.65 returns 1.5 × 0.65 / 1.05
= 0.93, so the loop loses money. Raise the sell limit above about 0.70 and the loop
comes back. Worked example: a level-1 PC with CHA 4 and untagged Speech 13 buys a
Stimpak for 94, and sells a found 10mm Pistol at 5 marks for 110 × 0.5 × 0.45 = 25.

**Reputation hook.** This follows the SCOPE ruling (Fallout 2 tiers, set by a GM
slider). Suggested slider range −100 to +100.

| Tier | Slider | Buy | Sell | Other |
|---|---|---|---|---|
| Idolized | 60+ | −0.15 | +0.10 | Vendor shows hidden stock |
| Liked | 30–59 | −0.10 | +0.05 | Bond Slips redeemable (§4.3) |
| Accepted | 10–29 | −0.05 | 0 | — |
| Neutral | −9 to 9 | 0 | 0 | — |
| Antipathy | −10 to −29 | +0.10 | −0.05 | — |
| Hated | −30 to −59 | +0.25 | −0.15 | The vendor may refuse |
| Vilified | −60 or less | refuses to trade | — | Black market only |

Karma has no effect on prices. It controls access: bad karma opens black-market
vendors, and good karma opens Federation officials. The **faction's** reputation (as
opposed to the town's) sets which exchange rate a vendor uses: at Liked or above with
the vendor's faction, use the official rate instead of the Bursa rate. Triad Ties
(§7) fits in here.

---

## 6. Combat

### 6.1 Assumptions

The party is four 40-point humans: two gunners (PE 8, AG 7, LK 5, tagged Small Guns
41) and two melee or pistol characters (ST 8, AG 7, tagged Melee 35, MD 3). Each level
puts 10 points into the main tagged skill, which is +20% per level. That gives 41 / 81
/ 121 for the gunners and 35 / 75 / 115 for melee at levels 1 / 3 / 5. HP follows the
Phase 0 formula. Armor is Ramshackle at level 1, Leather at level 3 and Mercenary at
level 5. The simulation copies `resolveAttack`: percentile roll, skill − AC, crits
within LK, the 91–99 Luck save, the crit table, then DT then DR.

### 6.2 Attacks needed to kill one enemy, and PC hit chance (base bestiary HP)

Percentages in brackets are the share of attacks that deal damage, crits included.

| Lvl | PC / weapon | Giant Rat | Soldier Ant | Lesser Panguling | Monyet Sakai | **Raider** | UCL Regular | Prot. Infantry | Turret |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Gunner, Homemade Pistol | 8.8 (36%) | 24.9 | 64.4 (10%) | 55.4 | **106** (12%) | 100 | 119 | 126 |
| 1 | Gunner, 10mm Pistol | 4.4 | 10.4 | 15.1 | 23.3 | **37.7** (23%) | 35.3 | 63.6 | 101 |
| 1 | Gunner, Hunting Rifle | 3.8 | 8.6 | 12.1 | 19.6 | **30.4** (23%) | 28.1 | 48.3 | 88.8 |
| 1 | Melee, Machete | 5.8 | 14.3 | 24.0 | 32.3 | **51.9** (17%) | 48.4 | 82.7 | 108 |
| 1 | *As coded (bug #1)*, 10mm Pistol | 9.5 | 21.6 | 46.7 | 69.1 | **90.3** (5%) | 87.5 | 103 | 118 |
| 3 | Gunner, Assault Rifle | 1.7 | 4.2 | 5.0 | 8.3 | 12.3 (63%) | 12.0 | 20.5 | 32.9 |
| 3 | Melee, Sledgehammer | 1.5 | 3.9 | 4.3 | 7.8 | 11.1 (57%) | 10.9 | 17.2 | 28.1 |
| 5 | Gunner, Battle Rifle | 1.1 | 2.3 | 2.2 | 3.9 | 5.1 (95%) | 5.3 | 7.5 | 11.2 |
| 5 | Melee, Super Sledge | 1.0 | 2.1 | 2.1 | 3.7 | 4.8 (94%) | 4.8 | 7.0 | 10.9 |

### 6.3 Encounters: 4 PCs against a group (`party.mjs`, 4,000 fights each)

| Encounter | Win % | Rounds | Party HP lost | PCs downed |
|---|---|---|---|---|
| L1 vs 3 raiders, **current** | **11%** | 21.3 | 90 | 1.04 |
| L1 vs 3 raiders, current, **as coded (bug #1)** | **2%** | 21.7 | 86 | 0.90 |
| L1 vs 3 raiders, **proposed** | 95% | 17.0 | 53 | 0.37 |
| L1 vs 2 raiders, proposed, party crouching (+10) | 100% | 8.4 | 19 | 0.08 |
| L1 vs 6 giant rats | 100% | 7.6 | 13 | 0.07 |
| L1 vs 3 UCL Regulars, current | 6% | 18.9 | 89 | 1.13 |
| L3 vs 3 raiders, current / proposed | 98% / 100% | 13.7 / 7.3 | 68 / 18 | 0.30 / 0.06 |
| L3 vs 2 Prot. Infantry, current (mortar) / proposed | **6%** / 83% | 12.1 / 13.1 | 69 / 83 | 1.48 / 0.76 |
| L5 vs 2 Prot. Infantry, current (mortar) / proposed | **33%** / 100% | 12.0 / 8.0 | 118 / 58 | 1.45 / 0.22 |
| L5 vs 3 UCL Regulars, proposed | 100% | 6.7 | 39 | 0.07 |

### 6.4 Over- and under-tuned

| Target | Tag | Change | Reason |
|---|---|---|---|
| **Raider** | CHANGE | HP 50→**30**, AC 18→**13**, DT/DR 3/20→**2/25**, all hit% 60→**45**, Rifle 1d8+6→**1d8+4** | Rule: **a humanoid NPC is built like a PC at its level.** A level-1 raider has 15 + ST 5 + 2×EN 5 = 30 HP. AC is AG 5 plus Ramshackle 8 = 13, and DT/DR is Ramshackle's. Hit is about the tagged skill at level 1–2. |
| UCL Regular | CHANGE | HP 45→40, AC 16→**20** (AG 5 + UCL Soldier Armor 15), DT/DR 3/30→2/25 | The same rule for level 3. It trades DR for AC. The level-3 party wins 99% against 3. |
| **Protectorate Infantry** | CHANGE | HP 50→45, AC 20→26 (AG 6 + Protectorate Infantry Armor 20), DT/DR 5/40→4/35. **Mortar 2d12+60→2d10+17 with a one-turn setup. Grenade 2d12+20→2d8+9** | The mortar and grenade are on the manual's damage scale, which is about 1.8× the vault's. A mortar that averages 73 one-shots every PC up to level 5. |
| Supermutant Slave, Sledgehammer | CHANGE | 1d6+15+3 → **2d6+7** (the vault Sledgehammer 2d6+3 plus MD 4 for ST 9) | Same scale problem: that line is the manual's improvised sledge. |
| Automated Turret | Flag | Anti-Tank Cannon 7d8+30 (average 61) and Flame 3d10+30 | A fixture that deletes a PC per hit. Fine as a "don't fight this, hack it" set piece. Mark it `is_boss` and tell the players it's there. |
| Homemade Pistol, PVC Pipe Gun | CHANGE | 1d6→1d6+2, 1d4→1d4+1 | Nearly useless against any DT (see §6.2). |
| Encounter sizing at level 1 | NEW guidance | Budget **1 raider-class enemy per 2 PCs** at level 1 and 1 per PC at level 3 | Even with the proposal, 3 raiders at level 1 take 17 rounds: too long at a table. |
| Level 5 and up | Note | Main-skill hit chance reaches the 95% ceiling (the fumble band) against every current enemy | Skills are uncapped (settled). New level-5+ enemies need AC 30 or more, or DT that punishes low-damage weapons. |
| **Burst fire** | **BUG** | The 8 burst-capable weapons carry `burst_capable: true`, but the code reads `stats.burst_shots`. None of them can burst. Author `burst_shots` (3 for SMGs and ARs, 10 for miniguns) or read `burst_capable`. | `clip_size` is also set on only 2 weapons, so ammo tracking is dormant. |
| **Head armor** | **BUG** | `calculateDerivedStats` and `resolveAttack` only read `equipment.body`. Helmets and the respirator do nothing. Proposal: head armor's AC adds to total AC, and its DT/DR applies to Head and Eyes aimed shots. | Salvaged PA Helmet (AC 4, value 60) is dead weight. Also, Glasses and helmets share the `head` slot (Q8). |
| Gergasi +10% DR | **BUG** | `derived.damageRes` is computed but never used. Add it to the DR of every damage type in `applyHpDamage` (DR maximum 90, manual). | The race text promises it. |
| Crit chance | Minor BUG | It uses raw `char.special.luk`, not the derived LK | Trait, status and chem LK changes don't affect crits. |

---

## 7. Traits & perks

There are 9 entries in `traits.js`. Healing figures come from `rollRestHealing`:
min(1d10, EN + bonus) per hour, so the average for a cap c ≤ 10 is
(c(c+1)/2 + (10−c)c)/10.

| Entry | What it does now, in numbers | Issue | Proposal |
|---|---|---|---|
| Heavy Handed | +4 melee damage (works). −25% crit damage: **does nothing** (`crit_damage_pct` is never read). | +4 adds 53% to a level-1 machete's hits (1d8+3 → 1d8+7, average 7.5 → 11.5) with no real downside. | BUG: apply the penalty. Crit table entry 4 becomes ×3 instead of ×4, and Artery does 15 true damage instead of 20. |
| Short-Sighted | −1 PER unless Glasses are worn. That is −2% Small Guns and −1% Energy Weapons. | Balanced as a flavour trait. | Keep. |
| Faster Healing | Adds 2 to the cap. EN 5: 4.0 → 4.9 HP per hour (+22%). EN 8: 5.2 → 5.5 (+6%). EN 10: +0. No rank support (manual: 3 ranks). | Worthless for exactly the EN-6+ characters who qualify. | **CHANGE** (all healing perks): the bonus becomes **flat HP per hour added after the EN cap**. Faster Healing at EN 5 is then 6.0 per hour (+50%). Add `ranks`. |
| Rad Child | Adds 5 to the cap, **always, for any race**. EN 6: 4.5 → 5.5. | The manual says "+5 Healing Rate **in irradiated areas**. Only Ghouls". The data has no race lock or condition. | BUG: add `race_requirement: ghoul` and make it conditional (only while rads > 0, as a table-friendly stand-in for "irradiated area"). Flat bonus after the cap, as above. |
| Cancerous Growth | Adds 2 to the cap (Ghoul-only, correct). | Same cap problem. | Flat +2 after the cap. |
| Triad Ties | TBA | — | **NEW:** Lim-affiliated vendors: buy −0.10, sell +0.05 (inside the barter limits). Starts one reputation tier lower (Antipathy) with one rival faction of the GM's choice. |
| Water Sense | TBA | — | **NEW:** +20 Survival when searching for water. The contamination chance on Dirty Water drops from 20% to 10%. |
| Border Rat | TBA | — | **NEW:** +15 Speech with smugglers and the Bursa, −15 with Federation officials. Bursa spreads improve one row (for example PD 12/15 becomes 11/14). |
| Feral Blood | TBA | — | **NEW:** +1 STR (+1 MD at ST 6+). Feral checks start at 500 rads instead of 600. |
| Armor `modifiers` | Combat Leather Jacket and the Lim Clan suit give CHA +2. Frontliner gives −40 Sneak, Steal and Engineering. Heavy Trooper gives LK +2 and −20 Sneak and Steal. **None of them apply.** | `calculateDerivedStats` never reads equipped-item modifiers. | BUG: add equipped items' `modifiers` to `modifierSources`. |

---

## 8. Survival & crafting

### 8.1 Cost of staying fed

The need rates are settled: 72 thirst and 48 hunger per day.

| Source | RMR per point | Cost per day (cheapest clean option) |
|---|---|---|
| Thirst: Soyabean Milk 8/20, Purified Water 15/30, Winter Melon 12/25 | 0.40–0.50 | about 30 RMR |
| Thirst: Dirty Water 3/25 (20% contamination) | 0.12 | 9 RMR, but about a 49% chance per day of at least one contamination |
| Hunger: Cicak 6/20, Instant Mee 8/25, Can of Food 10/30 | 0.30–0.33 | about 16 RMR |
| **Per PC per day** | | **about 45 RMR**, or 180 for the party |

Weight: 3 drinks (1.5 kg) and 2 meals (about 0.6 kg) per PC per day, so a 5-day trip
is about 10 kg of a STR 5 character's 68 kg. That is meaningful without being
crippling, and it fits the spec's aim of 2–3 drinks and 2 meals a day.

**Suggestions**
- **NEW recipe, Boil & Strain** (Field Kit, Survival 10): 2 Dirty Water + 1 Chemicals
  → 1 Purified Water. Inputs are worth 11 and the output 15 (1.36×). Without it, the
  only cheap water is the contaminated kind.
- A job reward budget for level 1 of **50–150 RMR** covers 1 to 3 party-days of
  supplies, so money pressure stays real.

### 8.2 Healing value

| Item | Average HP | RMR per HP |
|---|---|---|
| Nasi Lemak Ration Brick (also restores 25 hunger) | 3.5 | 5.7 (the food is the real value) |
| Healing Poultice | 10.5 | 3.8 |
| Stimpak | 15.5 | 4.8 |
| Doctor's Bag (full action) | 21 | 6.2 |
| Med Kit | 5.5 | **10.0 → 5.5 at the proposed 30** |

**Flag, not a redesign:** natural healing runs on every clock advance, not only rests
(the TIME ruling). At EN 5 that is 4 HP per hour, so a level-1 PC is full again after
about 8 hours of travel. Stimpaks are therefore purely a combat item. That seems to be
the intent, but it also means attrition never carries from one day to the next (Q7).

### 8.3 Recipe audit (the spec's rule: output value ≤ 1.5 × inputs)

All 25 recipes pass (the highest is Bear Trap at 1.50). Problems:

| Recipe | Ratio | Issue | Proposal |
|---|---|---|---|
| studded_leather_armor | 0.99 | Needs 2 Hardened Alloy (rare, 60 RMR) for a 75-value armor. Nobody will craft it. | Inputs → 8 Cloth + 10 Scrap + 6 Adhesive (54, 1.39×) |
| baseball_bat, combat_knife, nightstick | 1.35–1.48 | 6 Gun Parts in melee items breaks the spec's rule that Gun Parts are "a gunsmith's alone". | Re-flavour, or accept. The numbers are fine. |
| med_kit | 1.45 | Tied to the Med Kit repricing (§3.3). | 3 Chemicals + 3 Organics |
| dirty_water | 0.75 | Crafting it is worse than buying it. | Fine: it is the no-money fallback. |
| **All junk** | yield 1.0–5.0× the junk's value | **The money printer** (Summary #4). | **CHANGE** the value of each item below. Bobby Pin is already correct. |

| Junk | Now → proposed | Junk | Now → proposed |
|---|---|---|---|
| Broken Radio Set | 6 → **20** | Cracked Motorbike Mirror | 2 → 8 |
| Copper Wire Spool | 4 → 14 | Duct Tape | 3 → 9 |
| Circuit Board Fragment | 4 → 12 | Broken Pressure Cooker | 3 → 9 |
| Cracked LCD Panel | 4 → 12 | Empty Kerosene Tin | 2 → 9 |
| Dead Car Battery | 4 → 12 | Rusty Bicycle Chain | 3 → 9 |
| Jammed Sewing Machine | 4 → 12 | Rusted Kapcai Carburettor | 3 → 7 |
| Broken Streetlamp Fixture | 3 → 10 | ProTiga Factory Scrap | 3 → 6 |
| Moth-Eaten Prayer Mat | 1 → 6 | Shredded Tarpaulin | 2 → 6 |
| Spoiled Coconut Husk Sack | 2 → 6 | Tangled Barbed Wire Coil | 2 → 6 |
| Warung Signboard | 3 → 6 | Rubber Sandal Strap | 1 → 5 |
| Spool of Fishing Line | 2 → 5 | Rusted Pipe Segment | 3 → 4 |
| Broken Ceiling Fan Blade | 2 → 4 | Cracked Motorcycle Helmet | 2 → 4 |
| Cracked Rain Barrel | 2 → 4 | Dried Fish Bones | 1 → 4 |
| Federation Ration Tin | 1 → 4 | Torn Umbrella Frame | 1 → 4 |
| Withered Herb Bundle | 1 → 4 | | |

These values are still low in absolute terms: junk is always worth grabbing, but it
never becomes loot that makes anyone rich.

---

## 9. Open questions for the GM

| # | Question | Why I couldn't decide |
|---|---|---|
| Q1 | Is item `value` in RMR, and is the manual's MYR price column (about 5× higher) retired? | The vault's water prices fit value = RMR, but the manual is otherwise the authority. |
| Q2 | What are the UCL's currency and rates in the north? | No source. |
| Q3 | Bond Slips "trading at 1:1 with RMR": does one slip trade for 1 RMR whatever its face value (my reading), or is face value 1 RMR? | If face value is 1 RMR, "nearly worthless" doesn't hold. |
| Q4 | With durability in place, should crit-fail entries 6 and 7 go back to +1d6 marks, and should Backfire set the weapon **Broken** (repairable) instead of **destroying** it? | Both change settled rulings. The crit-system entry says those slots were blanked because condition was cut. |
| Q5 | Repair: instant and capped (my proposal, consistent with crafting), or the manual's DC roll where a failure wastes the parts? | The crafting ruling covers crafting only. The manual says repair rolls. |
| Q6 | Heavy Handed: is ×3 on the +300% entry and 15 true damage on Artery the right reading of "−25% crit damage"? | Crits in this app are table effects, not a damage multiplier. |
| Q7 | Healing on every clock advance means no attrition from day to day. Is that intended? | TIME_AND_NEEDS_SPEC ruling. Flagged, not changed. |
| Q8 | Glasses and helmets both use the `head` slot. Add a `face` slot? | This affects Short-Sighted builds who want armor. |
| Q9 | What does the Pneumatic Nail Driver fire? Makeshift rounds, a new `nails` ammo, or Scrap Metal? | The item has no `ammo_type`. |
| Q10 | Do you accept the rule that humanoid NPCs are built like PCs (§6.4)? It makes the Protectorate *harder* to hit (AC 26) but no longer one-shots the party. | It changes the bestiary's philosophy, not just one number. |
| Q11 | The bestiary entries `slave` and `supermutant_slave` touch the off-limits slave-trade theme. Rename them (for example "Labourer", "Gergasi Labourer")? | CLAUDE.md world rules. Not a balance call. |
| Q12 | Skill books: +3%, or treat "+1" as one skill *point* (+2% when tagged)? | The authored `effect` text says "+1 … skill". |
