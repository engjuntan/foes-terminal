# FOES Balance Proposal (rev. 2)

Written by the `balance-auditor` agent. The first version was 2026-09-21. This
revision (2026-09-22) applies the GM rulings in `SCOPE_DECISIONS.md` ("Balance
proposal — GM rulings (2026-09-22)") and the two new Method rules: five item tiers,
and RMR prices at early hyperinflation. Nothing in `src/`, the vault or the specs was
changed. Everything here is a proposal unless it is marked **RULED**.

**Tags.** **CHANGE** means an existing number or formula changes, and every affected
item is listed. **NEW** fills a gap. **BUG** means the code does not match a ruling or
the manual. **RULED** means the GM has already decided it; the section only works out
the numbers.

**Sources.** The GM rulings, then `reference/manual.txt`, then `src/`, then the
generated data. The simulations import the real `src/combat.js`, `items.js` and
`bestiary.js` and run 4,000 to 20,000 times each. The scripts are in the session
scratchpad (`…/scratchpad/balance/`: `party4.mjs`/`party5.mjs` for encounters,
`sim3.mjs` for attacks-to-kill, `wear2.mjs` for wear, `tiers.mjs` for the appendix).
Every simulation assumes the tag / `skill_ranks` bug is **fixed**, since the main
session is fixing it in parallel.

### Price convention used throughout

An item's **`value` is a stable base value.** The vault numbers need no bulk rewrite.

- **RMR price = value × the RMR index.** The index starts at **10**, which is the
  GM's "×10 across the board", and it drifts upward (§4.3).
- **PD price = value ÷ 10.** This never drifts.
- **Dinar price = value ÷ 200.** This never drifts either.

So a Stimpak (value 75) costs **750 RMR = 7.5 PD** today. Every value in this file is
a base value unless it is written in RMR. The alternative of multiplying every vault
`value` by 10 is open question N1.

---

## 1. Summary: what matters most

| # | Tag | Change | Why it matters |
|---|---|---|---|
| 1 | **BUG** (being fixed) | Combat, checks and crafting ignored the +20 tag bonus and `skill_ranks`. | As coded, a level-1 party wins 2% of fights against 3 raiders. Every figure below assumes the fix. |
| 2 | **NEW** | Durability shape: `characters.<id>.condition = { inv: { itemId: [marks…] }, worn: { slot: marks } }`. `inventory` stays `{itemId: qty}`. | This is the smallest shape that holds per-copy condition. It is unchanged from rev. 1 (§2.1). |
| 3 | **RULED** | Linear wear from the first mark: weapon damage ×(1 − 0.05 × marks), −1 to hit per mark, armor potency ×(1 − 0.05 × marks), and 10 marks = Broken. | §2.2. The new curve does not reopen the repair-arbitrage guard (§2.5). |
| 4 | **RULED** | Repair is instant and capped by skill. A higher skill gives up to a **30% chance not to consume the components**. The cost is **ceil**(10% of value) per mark. | The guard needs the chance kept at 30% or below (§2.5). |
| 5 | **RULED** | Currency: 1 PD = 100 RMR and 1 Dinar = 2,000 RMR (20 PD) at index 10. RMR carries the inflation, PD is the stable middle tier, and the Dinar is rare and valuable. The RMR index drifts about **+5% a week** (a 1d10 roll each week). | §4. PD and Dinar are fixed against each other, and only RMR floats. |
| 6 | **NEW** | Five tiers (T5 Homemade to T1 Pre-War/Pristine) with damage, protection and value bands for each. All 119 weapons and armor pieces are placed (Appendix A). Six items sit outside their band. | §3.1. "Tier sets the ceiling; condition wears it down": salvaged power armor and the fractured laser rifle become full-spec items with high `base_marks`. |
| 7 | **RULED** | Humanoid NPCs are built like PCs from a generic 40-point SPECIAL. Their faction armor is worn down with condition marks so that **no NPC's AC goes above its current value**. | Level-1 party vs 3 raiders: 11% wins today, 97% with the rebuilt raider. Protectorate at level 5 (mortar): 27% today, 99% (§6). |
| 8 | **CHANGE** | Revalue 29 junk items so that value = the value of their scrap yield. | This money printer is unaffected by the ×10, because it is a ratio (§8.3). |
| 9 | **NEW** | Barter limits stay: **buy ≥ 1.05, sell ≤ 0.65**. Reputation re-banded to 6 tiers with Antipathy removed. | §5. |
| 10 | **RULED** | Skill books give +5 skill points and take **2 hours** to read on the shared clock. Nails ammo: value 1, weight 0.005. The Nail Driver becomes a T4 Salvaged sidearm (1d6+3, range 6, 30-nail strip). | §7.2, §3.3. |

These bugs from rev. 1 are still open: burst never triggers (`burst_capable` vs
`burst_shots`), head armor is ignored, Gergasi DR is unused, armor `modifiers` and
Heavy Handed's crit penalty do nothing, and Rad Child applies to everyone everywhere
(§6.4, §7).

---

## 2. Durability

### 2.1 Data shape (**NEW**, unchanged from rev. 1)

```js
// Unchanged — every existing reader (carry weight, give, equip, craft, scrap) keeps working.
characters.<id>.inventory = { "10mm_pistol": 2, "leather_armor": 1, "stimpak": 3 }

// New sibling field. Durable items only.
characters.<id>.condition = {
  inv:  { "10mm_pistol": [2, 7], "leather_armor": [5] }, // one integer 0–10 (marks) per copy, sorted ascending
  worn: { "right_hand": 3, "body": 4 }                   // marks on the copy in each equipment slot
}
```

| Rule | Detail |
|---|---|
| Durable items | `(type === 'weapon' && skill !== 'throwing') \|\| type === 'armor'`. Everything else stays a plain count. |
| Invariant | `condition.inv[id].length === inventory[id]` for every durable id. |
| Missing data | `normalizeCondition(char)` fills in missing copies with `item.base_marks ?? 0` and trims extra entries. A missing `worn[slot]` also means `base_marks ?? 0`. Legacy characters upgrade silently. |
| Writes | Replace `condition.inv` whole, in the same `updateDoc` as `inventory`. Wear during combat is a single dot-path field (`…condition.worn.<slot>`) inside the attack's existing `updateDoc`. No extra writes. |
| Default copy choice | Equip takes the lowest-marks copy. Scrap and sell default to the highest-marks copy. Give moves the copy the player picks. One UI row per copy. |
| Vault field | **CHANGE:** `"condition": "disrepair"` → `"base_marks"`. Values are in the tier notes (§3.2). |

A per-copy instance id (`gear: { g_ab12: {…} }`) was considered and rejected: every
inventory reader would have to read two stores. If mods ever arrive, integers can be
upgraded to `{ m: 3 }` inside `normalizeCondition`.

**Pure helpers** (a new `src/condition.js` with no Firestore import): `isDurable`,
`normalizeCondition`, `takeCopy`, `putCopy`, `weaponCondition(marks)`,
`armorMult(marks)`, `conditionValue(item, marks)`, `scrapYieldFor(item, marks)`,
`repairCostPerMark(item)`, `repairFloor(skill, atBench, hasTools)`,
`repairSaveChance(skill)`.

**Code that must use the new shape:** `equipItem`, `unequipItem`, `gmUnequipItem`,
`giveItem`, `gmGrantItem` (add a marks input), `craftItem`, `scrapItem`,
`resolveAttack` (including `destroyOrDropAttackerWeapon`), `gmFactoryReset`,
`calculateDerivedStats` (add a `condition` parameter for armor AC), `parseArmorDtdr`,
and the inventory and hit-preview views.

### 2.2 Condition scale (**RULED**: linear from 1 mark)

Every multiplier is **1 − 0.05 × marks**, rounded to the nearest whole number (.5
rounds up). Rounding to nearest instead of the manual's round-down stops DT 2 from
dropping to 1 at the very first mark.

| Marks | Label | Weapon damage | Weapon hit | Fumble save (91–99) | Armor AC/DT/DR | Value | Scrap yield |
|---|---|---|---|---|---|---|---|
| 0 | Pristine | ×1.00 | ±0 | LK | ×1.00 | ×1.0 | ×1.00 |
| 1 | Serviceable | ×0.95 | −1 | LK | ×0.95 | ×0.9 | ×0.95 |
| 2 | Serviceable | ×0.90 | −2 | LK − 1 | ×0.90 | ×0.8 | ×0.90 |
| 3 | Serviceable | ×0.85 | −3 | LK − 1 | ×0.85 | ×0.7 | ×0.85 |
| 4 | Worn | ×0.80 | −4 | LK − 2 | ×0.80 | ×0.6 | ×0.80 |
| 5 | Worn | ×0.75 | −5 | LK − 2 | ×0.75 | ×0.5 | ×0.75 |
| 6 | Worn | ×0.70 | −6 | LK − 3 | ×0.70 | ×0.4 | ×0.70 |
| 7 | Damaged | ×0.65 | −7 | LK − 3 | ×0.65 | ×0.3 | ×0.65 |
| 8 | Damaged | ×0.60 | −8 | LK − 4 | ×0.60 | ×0.2 | ×0.60 |
| 9 | Damaged | ×0.55 | −9 | LK − 4 | ×0.55 | ×0.1 | ×0.55 |
| 10 | **Broken** | cannot be used (the attack is blocked and the turn not spent, like out of ammo) | — | — | ×0.50 ("held on with tape") | ×0.1 | ×0.50 |

**Why these numbers**
- **Damage:** the GM ruling (×0.95 per mark).
- **Hit:** −1 per mark ends at −9, which keeps the manual's ceiling of "−10% hit
  chance" for worn weapons. Damage carries most of the penalty.
- **Fumble save:** −1 per 2 marks. This is the "jam chance" rising with wear. At LK 5
  the fumble rate climbs smoothly: **5.5% → 6.3% (2) → 7.4% (4) → 8.2% (6) → 9.2% (8)**
  (simulated).
- **Armor:** the same 5% line. At 10 marks armor keeps half its potency, where the
  manual gave 30%, so worn armor still matters.
- **Value:** stays at 10% per mark, because the repair price is built on it (§2.5).
  Broken is priced as 9 marks.
- **Scrap:** the same 5% line, rounded down, with at least 1 of the first component.

**How condition feeds combat**

| Quantity | Formula | Where |
|---|---|---|
| Weapon hit | `skill − AC − marks + …` | `resolveAttack`, PC branch, next to `burstPenalty` |
| Weapon damage | `round(rolled × (1 − 0.05m))` **before** DT/DR | beside the aimed-shot `damageMultiplier` |
| Fumble | the 91–99 save succeeds on `d10 ≤ LK − floor(m/2)` | `resolveCrit(…, marks)` |
| Armor AC | `AGI + round(armor.ac × (1 − 0.05m))` | `calculateDerivedStats(…, condition)` |
| Armor DT/DR | the same multiplier on every damage type | `parseArmorDtdr(armorItem, marks)` |

**Worked example: Leather Armor (AC 15, Normal 2/25)**

| Marks | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AC | 15 | 14 | 14 | 13 | 12 | 11 | 11 | 10 | 9 | 8 | 8 |
| DT/DR | 2/25 | 2/24 | 2/23 | 2/21 | 2/20 | 2/19 | 1/18 | 1/16 | 1/15 | 1/14 | 1/13 |

**Worked example: 10mm Pistol (2d6+2, average 9, value 110 = 1,100 RMR)**

| Marks | 0 | 2 | 4 | 6 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|
| Average damage | 9.0 | 8.1 | 7.2 | 6.3 | 5.4 | 5.0 | Broken |
| Hit | ±0 | −2 | −4 | −6 | −8 | −9 | — |
| RMR value (index 10) | 1,100 | 880 | 660 | 440 | 220 | 110 | 110 |

### 2.3 Wear: how marks are gained

| Source | Marks | Basis |
|---|---|---|
| Weapon: any critical failure | +1 | Manual: "on critical failures". **NEW:** every fumble counts. |
| Weapon: crit-fail table entries 6 and 7 | **+1d3** in place of the +1 | **RULED.** Entries 6 and 7 in `CRIT_FAIL_TABLE` get `effect: 'condition'` and the label "Weapon condition — takes 1d3 condition marks". |
| Weapon: crit-fail entry 2 (Backfire) | **set to 10 (Broken)**. The attacker's arm is still crippled. | **RULED.** `destroyOrDropAttackerWeapon(false)` changes: the weapon stays in the slot and `worn[slot] = 10`. The log reads "… is Broken". |
| Melee: Block or Deflect (GM adjudicated) | +1d2 / +1 | Manual special moves |
| Armor: a hit on you whose attack roll ends in 0 | +1 | The manual's "every 10 successful hits, one mark", using a roll the app already makes |
| Armor: explosive hit | +floor(raw damage / 10) | Manual: marks by "the first digit of the damage" |
| Optional: `improvised: true` weapons | Roll LK after each attack. On a failure, +1 mark. | The manual's "roll luck after attack… it breaks", softened |

**Simulated weapon wear under the new rules** (`wear2.mjs`, 20,000 runs):

| LK | Attacks per mark | 0 → 5 marks | 3 → 6 marks | 0 → Broken |
|---|---|---|---|---|
| 3 | 14 | 46 | 28 | 69 |
| 5 | 18 | 59 | 35 | 87 |
| 8 | 36 | 110 | 58 | 149 |

A level-1 fight is 12 to 19 rounds (§6), so a PC with LK 5 picks up about one mark per
fight. Because penalties now start at 1 mark, a weapon picks up small penalties along
the way instead of hitting a wall at 7 marks. Repair becomes routine upkeep every few
fights rather than an emergency.

### 2.4 Condition of found and stocked gear (**CHANGE**: now by tier, not value)

| Tier | Marks when found |
|---|---|
| T5 Homemade | 1d4 |
| T4 Salvaged | 1 + 1d4 |
| T3 Baseline | 2 + 1d4 |
| T2 Improved | 4 + 1d4 |
| T1 Pre-War/Pristine | 6 + 1d4 (often Damaged or Broken) |
| Vendor stock | the vendor's repair floor (2) |
| Crafted | 0 |

`base_marks` (the fixed starting condition, which overrides the roll):
`salvaged_power_armor_chestplate` 8, `salvaged_power_armor_helmet` 8,
`fractured_laser_rifle` 8.

### 2.5 Repair (**RULED**: instant and capped by skill, with a chance to save parts)

**Skill.** FOES has no Repair skill. "Repair skill" here means the item's skill:
**Gunsmith** for guns and all melee or unarmed weapons (matching the recipes),
**Science** for energy weapons and power armor (manual: "science power armor"), and
**Engineering** for other armor. See N2.

**How far a character can repair (the floor).** Unchanged:
`floor = max(0, 6 − floor(skill / 20))`. A matching bench lowers it by 1. A Tool Set
adds +25 to the repair skill (manual). Gunsmith's Tools add +25 for weapons.

| Skill | 0–19 | 20–39 | 40–59 | 60–79 | 80–99 | 100–119 | 120+ |
|---|---|---|---|---|---|---|---|
| Field floor (lowest marks reachable) | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| At the matching bench | 5 | 4 | 3 | 2 | 1 | 0 | 0 |
| **Chance not to consume components** (one d100 roll per repair job) | 0% | 0% | 0% | 10% | 20% | 30% | 30% (cap) |

**Cost per mark removed (CHANGE: `round` → `ceil`).**
`primary × max(1, ceil(0.10 × value / primary.value))` + 1 secondary, plus 1 rare per
2 marks for energy weapons and power armor. Categories are as in rev. 1: guns use Gun
Parts + Scrap Metal, energy weapons Electronics + Gun Parts (+ Pre-War Tech), melee
Scrap Metal + Adhesive, light armor Cloth + Adhesive, heavy armor Scrap Metal + Cloth,
and power armor Scrap Metal + Electronics (+ Hardened Alloy). **NEW:** for heavy armor,
1 Hardened Alloy may stand in for 10 Scrap Metal. That trades value for weight.

| Item (value) | Per mark | Base value | RMR (index 10) |
|---|---|---|---|
| Homemade Pistol (50) | 1 Gun Parts + 1 Scrap | 7 | 70 |
| 10mm Pistol (110) | 3 Gun Parts + 1 Scrap | 17 | 170 |
| Assault Rifle (200) | 4 Gun Parts + 1 Scrap | 22 | 220 |
| Machete (85) | 5 Scrap + 1 Adhesive | 13 | 130 |
| Sledgehammer (150) | 8 Scrap + 1 Adhesive | 19 | 190 |
| Leather Armor (55) | 3 Cloth + 1 Adhesive | 9 | 90 |
| Laser Pistol (240) | 4 Electronics + 1 Gun Parts + 1 Pre-War Tech per 2 marks | about 42 | about 415 |
| Salvaged PA Chestplate (300, §3.2) | 15 Scrap + 1 Electronics + 1 Hardened Alloy per 2 marks | about 51 | about 510 |

**Re-check of the arbitrage guard** (buy damaged, repair, sell). Buying at a marks, repairing to b and selling pays
`V/10 × [sell × (10 − b) − buy × (10 − a)] − c × (1 − p) × (a − b)`.
The worst case is a = 9, b = 0, at the barter limits (buy 1.05, sell 0.65). That gives
`0.545 V − 9 c (1 − p)`, which only makes a profit if **c (1 − p) < 0.061 V**.

- With `ceil`, the cost per mark c is always at least 0.10 V plus a secondary
  component. At the 30% cap, c (1 − p) ≥ 0.07 V, so the loop **loses money for every
  item.**
- A 40% save chance would bring the worst case down to 0.06 V, right at the line.
  **Keep the cap at 30%.**
- The linear penalty curve does not affect this guard. It changes combat, not prices.
- The ×10 RMR index cancels out, because buying, repairing and selling are all
  priced at the same index.
- During a *drifting* index there is one gap: a player who repairs with components
  bought last week is paying old prices. That gain is 5–20%, which is below the loop's
  margin.

**Time (optional):** 10 in-game minutes per mark in the field, 5 at a bench.
**Vendor repair (later):** `0.10 × value × index × buyMult` per mark, down to 2 marks.

### 2.6 Scrap yield from weapons and armor (**NEW**)

The default comes from the item's recipe: **50% of each input, rounded down, minimum
1**. For items without a recipe, author a yield worth **≤ 40% of the item's value**.
Condition then applies the ×(1 − 0.05m) column in §2.2. The loops (craft then scrap,
buy then scrap) still lose money.

---

## 3. Item tiers and values

### 3.1 Tier bands (**NEW**, following the Method rule)

Weapon damage is the average per roll. Melee and unarmed are measured **before MD**,
which adds 1 to 5 on top, so their band sits 2 points lower. Big guns, launchers and
explosives are banded on value only, because their burst or area damage doesn't
compare roll for roll. Armor uses `score = AC + 3 × DT(normal) + DR(normal)/2`. Head
pieces are tiered by origin and not banded. Values are base; RMR is ×10.

| Tier | Guns: damage | Melee: damage | Weapon value | Armor score | Armor value | Found at |
|---|---|---|---|---|---|---|
| **T5 Homemade** | 2–6 | 0–5.5 | 5–60 | 0–16 | 1–30 | 1d4 marks |
| **T4 Salvaged** | 4–9 | 2–8 | 40–120 | 15–30 | 25–70 | 1 + 1d4 |
| **T3 Baseline** | 8–12 | 6–10 | 90–220 | 30–45 | 55–130 | 2 + 1d4 |
| **T2 Improved** | 11–18 | 9–16 | 200–500 | 45–60 | 120–250 | 4 + 1d4 |
| **T1 Pre-War/Pristine** | 15+ | 13+ | 400+ | 60+ | 250+ | 6 + 1d4 |

**How many items land in each tier:** T5 29, T4 22, T3 25, T2 26, T1 17 (119 weapons
and armor pieces). The full list is Appendix A. The bands overlap deliberately:
condition decides where a particular copy actually sits.

**Value formulas inside a tier.** Weapons: `value ≈ K × average damage`, with K = 5
for homemade, 12–15 for standard, 18–20 for military, 22 for energy and 45 for big
guns. Armor: `value ≈ score × (1.5 clothing, 2 scavenged, 3 military, 4 elite)`. These
are unchanged from rev. 1, and each tier's value band is simply what these formulas
produce for its damage band.

### 3.2 Outliers: items outside their tier's band

| Item | Tier | Problem | Proposal |
|---|---|---|---|
| angkasa_wrench | T4 | 2d6+2 (9) is T3 melee damage at a value of 45 | **CHANGE** dmg → 2d4+2 (7) |
| salvaged_rebar_greatsword | T4 | 2d8 (9) | **CHANGE** dmg → 2d6+1 (8) |
| corroded_minigun_barrel_club | T4 | 2d6+4 (11) outdoes the T3 Sledgehammer | **CHANGE** dmg → 2d6+1 (8) |
| 10mm_smg | T3 | 1d8+2 (6.5) is below the band | **Accept.** Burst rolls twice, so its real output is T3. |
| protectorate_officers_uniform, lim_clan_tailored_suit | T5 | 35 and 150 are above the T5 value band | **Accept** as a social premium (CHA or authority). |
| salvaged_power_armor_chestplate | T1 by origin | AC 14, 3/28 (score 37) is only T3 | **CHANGE** to real T1 stats: AC 22, Normal 6/40, Laser 3/30, Explosive 5/35, value 300, `base_marks: 8`. At 8 marks it plays as AC 13, 4/24, close to today's piece, and it can be restored. |
| salvaged_power_armor_helmet | T1 by origin | AC 4, 1/10 | **CHANGE** → AC 6, 2/15, value 80, `base_marks: 8`. Head armor also needs the head-armor bug fixed (§6.4). |
| fractured_laser_rifle | T2 (it is a Laser Rifle) | Authored as its own 1d6 weapon | **CHANGE** → Laser Rifle stats (2d10+6, range 30, value 375) with `base_marks: 8`. At 8 marks it averages 10.2. |
| combat_leather_jacket | T3 | Value 60 is too low for AC 20 and CHA +2 | **CHANGE** value → 110 (rev. 1) |
| supermutant_clothes | T3 | Value 45 is below the band | **CHANGE** value → 60 |
| axe_town_coveralls | T4 | Ramshackle stats at 1.5 kg | Flag, as in rev. 1: AC 4, 1/10 (T5), value 12 |
| Skill books, med_kit, homemade_pistol, cracked_pvc_pipe_gun | — | Covered elsewhere | §7.2, §8.2, §6.4 |

### 3.3 Proposed stats for every TBA

Unchanged from rev. 1 unless noted. The energy and heavy weapons are converted from
the manual's scale (about 1.8× the vault's) using manual average × 0.55. Every row is
placed in Appendix A.

| Item | Tier | dmg | range | value | Item | Tier | dmg | range | value |
|---|---|---|---|---|---|---|---|---|---|
| laser_pistol | T2 | 2d6+4 | 15 | 240 | frag_grenade | T3 | 2d8+9 | 8 | 35 |
| laser_rifle | T2 | 2d10+6 | 30 | 375 | dynamite | T4 | 2d10+8 | 8 | 30 |
| plasma_pistol | T2 | 2d8+4 | 15 | 285 | incendiary_grenade | T3 | 2d6+6 fire | 8 | 30 |
| plasma_rifle | T1 | 3d8+6 | 28 | 430 | molotov_cocktail | T5 | 1d10+4 fire | 8 | 15 |
| plasma_caster | T1 | 4d8+10 | 25 | 615 | plasma_grenade | T1 | 4d10+15 | 8 | 90 |
| gauss_pistol | T1 | 3d8+9 | 20 | 495 | land_mine | T2 | 2d10+15 | 1 | 55 |
| gauss_rifle | T1 | 3d10+18 | 50 | 760 | 1414_chain_whip | T5 | 1d6+1 | 1 | 20 |
| tesla_cannon | T1 | 3d10+20 | 25 | 805 | axe_gang_cleaver | T4 | 1d10+2 | 1 | 110 |
| 50_cal_machine_gun | T1 | 2d8+8 | 30 | 765 | lim_clan_straight_razor | T4 | 1d6+1 | 1 | 65 |
| light_machine_gun | T2 | 1d8+3 | 25 | 340 | parang | T4 | 1d8+1 | 1 | 85 |
| rocket_launcher | T1 | 4d10+5 | 30 | 675 | rebar_nail_club | T5 | 1d6+2 | 1 | 25 |
| missile_launcher | T1 | 4d10+8 | 40 | 750 | water_pipe_cudgel | T5 | 1d6+1 | 1 | 20 |
| grenade_launcher | T2 | 2d10+12 | 25 | 460 | keris (dmg exists) | T2 | — | — | 250 |

**Pneumatic Nail Driver and Nails (RULED: `nails` ammo)**

| Item | Proposal | Reason |
|---|---|---|
| pneumatic_nail_driver | **T4 Salvaged.** `skill: small_guns`, 1H, `dmg: 1d6+3`, range **6**, `ammo_type: nails`, **`clip_size: 30`**, no burst, value **70** | 6.5 average sits mid-band for T4 guns. The manual's Weak pistol on light ammo converts to about 4.7, and an industrial driver hits harder at point-blank. Range 6 matches the Sawed-off (5). A 30-nail strip is the real-world capacity. |
| ammo_nails | value **1** (10 RMR), weight **0.005** (keep the authored value) | The cheapest round in the game, below makeshift_rounds (2). A 5–6 g framing nail. |
| Recovery (**NEW**) | After a fight, recover half the nails fired, rounded down | The item text says "Easy to straighten and reuse". This makes the driver the thrifty choice. |
| Recipe (**NEW**) | `recipe_nails`: 2 Scrap Metal + 1 Adhesive → 10 Nails, Weapons Bench, Gunsmith 10 | Inputs 7 → output 10 (1.43×, inside the 1.5 rule) |

**Ammo per round (base; RMR is ×10):** 9mm 2, 10mm 3, 5.56 4, 5mm 2, 7.62 5,
14mm 5, shotgun shells 4, energy cell 6, plasma cartridge 10, 2mm EC 15, flamer fuel 3,
40mm 40, missile 120, mini nuke 500, **nails 1**. The missing calibers (.22 / .32 /
.44 / .45 / .50) should be 2 / 2 / 4 / 4 / 10. Armor TBA values are unchanged from
rev. 1 and listed in Appendix A (for example Mercenary 85, Protectorate Infantry 150,
Frontliner 255, prison_labourer_clothes 1).

---

## 4. Currency exchange: early hyperinflation

### 4.1 Official rates (**RULED**)

| At index 10 | RMR | PD | Dinar |
|---|---|---|---|
| 1 RMR | 1 | 0.01 | 0.0005 |
| 1 PD | **100** | 1 | 0.05 |
| 1 Dinar | **2,000** | **20** | 1 |

**The three roles (RULED).**
- **RMR** is the inflated everyday currency and carries the hyperinflation story.
- **PD** is the stable middle tier: "most stable" in the vault.
- **Dinar** is rare and valuable: "most sacred… immense value" in the vault.

**Anchoring (NEW).** PD and Dinar are the stable stores of value (the Method rule).
Their rate against *each other* is fixed at **1 Dinar = 20 PD**. RMR floats against
both: `1 PD = 10 × index RMR` and `1 Dinar = 200 × index RMR`. The GM's numbers are
exactly the picture at index 10.

**Scale check.** One Dinar is worth 200 base, about **2.7 Stimpaks, a T2 weapon
(assault rifle 200, 14mm pistol 220), or about 4½ days of food and water for one PC**.
That is a real relic for a low-level party, and it fits the vault ("a store of value",
"village wealth is measured in Dinars"). The official rates are consistent with each
other, so they leave no arbitrage.

**CHANGE (currency `value` fields):** `rmr` 1 → **0.1**, `pd` 1 → **10**, `dinar`
1 → **200**, all in base value. This puts every item and currency on one scale.
Wallet displays keep showing counts.

### 4.2 Official channels and the Bursa, by region

The Bursa quotes buy/sell **in RMR at the current index** (at index 10 below). The
normal spread is ±10%. In a shock week (§4.3) it widens to ±15%. The lore says
dealers "inflate exchange rates for RMR", so every conversion out of RMR loses the
spread.

| Region | PD (Bursa buys / sells) | Dinar (buys / sells) | Local RMR price level | Vendor behaviour |
|---|---|---|---|---|
| Federation towns and bunkers | 90 / 110 | 1,800 / 2,200 | index × 1.0 | RMR is the legal tender. Only validated notes are taken at full value. |
| Border towns (Bandawang, the lake) | 90 / 115 | 1,750 / 2,250 | index × 1.1 | All three currencies are posted. Prices "adjust based on the ruling garrison". |
| Protectorate (Penang) | licensed: 100 plus a 10% licence fee. Bursa: 80 / 130 (risk of confiscation) | 1,700 / 2,300 | index × 1.25, or RMR refused | Prices are in PD. "Smuggling PD is punishable by confiscation or death." |
| Caliphate (Round City) | 90 / 110 | House of Syed buyback **20 PD**. Cults and scholars pay a **premium of 25–50 PD** | index × 1.0 | RMR is the daily money (vault), so the Caliphate *feels* the inflation too. |
| KLB | 85 / 120 | 1,600 / 2,400 | index × 1.0 | Ghoul vendors take **old unstamped Ringgit at par** (the Sepuluh Ribu identity hook). |

### 4.3 How fast prices drift (**NEW**)

**Weekly index roll.** At the start of each in-game week (or each session, if the GM
prefers), the GM rolls 1d10. The result is posted on the Bursa sheet.

| 1d10 | Index change | What players see |
|---|---|---|
| 1–4 | none | "Prices holding." |
| 5–8 | +0.5 (+5%) | Posted prices creep up. "Water's up two RMR a bottle again." |
| 9 | +1 (+10%) | Vendors re-mark their stock. |
| 10 | **Shock:** +2 (+20%) | The Bursa spread widens to ±15% for the week. Vendors refuse RMR for T2+ goods and meds (below). |

- **Expected drift:** +0.5 index points a week. That is about +5% a week, or +20–25% a
  month at the start. Classic hyperinflation is 50% a month, so this is the *onset*.
  After 3 months the index is around 16: a Stimpak costs about 1,200 RMR but is still
  7.5 PD.
- **Escalation lever:** when the story calls for it (a Federation crisis, the
  counterfeit ring exposed), double every step. That is the "full hyperinflation" row.
- **Table friendliness:** the index is always a multiple of 0.5. Prices are value ×
  index, rounded to 5 RMR, because small notes are gone.

**How vendors behave**

| Behaviour | Rule |
|---|---|
| Sticky prices | Vendors only re-price when the index moves. Nothing changes mid-week. |
| Hard-currency discount | Paying in PD or Dinar gets **−10%** off the vendor's buy price. When buying from players, vendors pay in RMR by default. They pay PD only at an extra −10%. |
| Hoarding in shock weeks | T2+ goods, Stimpaks, RadAway and ammo are sold **only for PD, Dinar or barter goods** (ammo, meds, components, the Bursa's "trade goods"). |
| Rewards lag | A job quoted in RMR is paid at the same RMR *number* when it is completed, not adjusted to the index. The longer a job takes, the more it loses (at +5% a week). A Speech check (Kind of Tricky) can get the fee quoted in PD instead. |
| Savings | RMR held for a month loses about 20% of what it buys. PD and Dinar lose nothing. Players who save should convert, and pay the Bursa spread to do it. |

### 4.4 Counterfeits and unstamped notes (no Bond Slips)

| Item | Worth | Mechanic |
|---|---|---|
| `rmr_unstamped`, "Old Ringgit" (unvalidated) | 0.5 RMR (Federation), 0.4 (Bursa), **1.0 in KLB and ghoul markets** | Vault: "only officially validated notes carry full value" |
| `rmr_suspect`, "Ringgit (unverified)" (counterfeit) | 0 if caught, 0.3 at the Bursa | Spending it prompts the GM to roll the vendor's Instinct or PER. If caught, the note is refused and reputation with that town drops by 5. |
| Active counterfeit ring (vault hook) | — | That region's price level rises by ×0.1, vendors inspect notes (−10 Speech for barter), and the next weekly roll is treated as at least a 9. Counterfeits **accelerate** the inflation, which is the lore. |

**Trade hook.** Cults and scholars in the Caliphate pay above the official rate for
Dinars (market trends in the vault). Selling there is a trade quest: it needs travel,
a buyer who can be found, and the risk of carrying relics. It is a one-off sale, not a
loop.

---

## 5. Barter (proposal: no shop yet)

This is unchanged from rev. 1. Speech stands in for Barter.

| Speech | 0–24 | 25–49 | 50–74 | 75–99 | 100+ |
|---|---|---|---|---|---|
| Buy × | 1.25 | 1.20 | 1.15 | 1.10 | 1.05 |
| Sell × | 0.45 | 0.50 | 0.55 | 0.60 | 0.65 |

CHA ≤ 3 adds +0.05 to buy, and CHA ≥ 8 takes 0.05 off. **Hard limits: buy ≥ 1.05,
sell ≤ 0.65**, the line that kills the craft-and-sell and repair-and-flip loops (1.5 ×
0.65 / 1.05 = 0.93). The price is
`round(value × conditionMult × index × regionLevel × mult, to 5 RMR)`.

Worked example at index 10, in a Federation town: a level-1 PC with CHA 4 and Speech
13 buys a Stimpak for 75 × 10 × 1.25 = **940 RMR**, or 7.5 × 1.25 × 0.9 = **8.4 PD**
with the hard-currency discount. They sell a 10mm Pistol at 5 marks for 110 × 0.5 ×
10 × 0.45 = **245 RMR**.

**Reputation hook (CHANGE: Antipathy removed, re-banded).** GM slider from −100 to
+100.

| Tier | Slider | Buy | Sell | Other |
|---|---|---|---|---|
| Idolized | 70+ | −0.15 | +0.10 | Hidden stock. Sells T2+ for RMR even in shock weeks. |
| Liked | 40–69 | −0.10 | +0.05 | Uses the official exchange rate, not the Bursa's |
| Accepted | 15–39 | −0.05 | 0 | — |
| Neutral | −14 to 14 | 0 | 0 | — |
| Hated | −15 to −49 | +0.20 | −0.10 | May refuse to trade |
| Vilified | −50 or less | refuses | — | Black market only |

Six tiers, following the Fallout 2 names minus Antipathy. Neutral is ±14, so one or
two deeds don't move a town. The negative side is shorter, because one bad act should
hurt faster than one good act helps. Karma has no effect on price; it only controls
access.

---

## 6. Combat

### 6.1 NPCs built like PCs (**RULED**: generic SPECIAL, not harder to hit)

**Generic SPECIAL, 40 points like a PC:**

| Profile | ST | PE | EN | CH | IN | AG | LK |
|---|---|---|---|---|---|---|---|
| **Grunt** (raider, labourer, thug) | 6 | 6 | 6 | 5 | 5 | 6 | 6 |
| **Soldier** (UCL, Protectorate, Federation) | 6 | 7 | 6 | 4 | 5 | 6 | 6 |

**Derivation:**
- HP = `15 + ST + 2×EN + (level − 1) × (3 + EN/2)`.
- Hit = the tagged combat skill + 10 per level after the first. NPCs spread their
  points, so they gain less per level than a PC's +20.
- Crit = LK.
- AC = AG + the armor they wear.
- DT/DR = that armor's.

**The "not harder to hit" rule:** an NPC wears the armor its faction would issue, but
at enough condition marks that **AG + worn armor AC ≤ its current bestiary AC**. The
GM gets the "built like a PC" consistency without the Protectorate becoming AC 26. It
also carries out the world rule that everything the party meets is worn.

| NPC | Level / profile | HP | AC | DT/DR (normal) | Hit | Weapon | Now |
|---|---|---|---|---|---|---|---|
| **Raider** | L1 Grunt | **33** | **14** (AG 6 + Ramshackle 8, pristine) | 2/25 | **37** | 1d8+3 (9mm Pistol) | 50 HP, AC 18, 3/20, 60%, 1d8+6 |
| UCL Regular | L3 Soldier | 45 | 16 (AG 6 + UCL Soldier Armor at **7 marks** → 10) | 1/16 | 59 | 2d6+6 (unchanged) | 45, AC 16, 3/30, 60% |
| **Protectorate Infantry** | L4 Soldier | 51 | 20 (AG 6 + Protectorate Infantry Armor at **6 marks** → 14) | 3/25 | 69 | Rifle 2d6+8. **Mortar 2d10+17** (one-turn setup). **Grenade 2d8+9** | 50, AC 20, 5/40. Mortar 2d12+60, Grenade 2d12+20 |
| Labourer (renamed from slave) | L1 Grunt | 33 | 6 (AG 6, clothes 0 to 1) | 0/5 | 25 (untagged Melee 12, +13 GM choice) | 1d4+1 | 35, AC 5 |
| Supermutant Labourer | L2, ST 9 variant | 60 (unchanged) | 5 | 1/25 | 60 | Sledgehammer **2d6+7** (vault 2d6+3 plus MD 4) | Sledgehammer 1d6+15+3 |

**Every AC is ≤ its current value** (raider 18 → 14, UCL 16 → 16, Protectorate 20 →
20). Elite units, such as a Heavy Trooper in pristine armor, are the deliberate
exception: that is where AC 30+ belongs.

### 6.2 Attacks to kill one rebuilt NPC (sheet skills, `sim3.mjs`)

| Lvl | Weapon (skill) | Raider | UCL Regular | Prot. Infantry |
|---|---|---|---|---|
| 1 | 10mm Pistol (41) | 21.4 (27% hit) | 24.4 (25%) | 41.7 (21%) |
| 1 | Hunting Rifle (41) | 17.6 (26%) | 21.1 (25%) | 34.1 (21%) |
| 1 | Machete + MD 3 (35) | 30.4 (21%) | 35.9 (19%) | 59.6 (16%) |
| 3 | Assault Rifle (81) | 7.6 (67%) | 8.6 (64%) | 13.4 (61%) |
| 3 | Sledgehammer + MD 3 (75) | 6.9 (61%) | 8.0 (59%) | 11.9 (55%) |
| 5 | Battle Rifle (121) | 3.5 (94%) | 4.0 (94%) | 5.4 (94%) |
| 5 | Super Sledge + MD 3 (115) | 3.2 (95%) | 3.8 (96%) | 5.2 (93%) |

For the old raider, a level-1 10mm Pistol needed 37.7 attacks. Monster-only tables
(rats, ants, pangulings) are unchanged from rev. 1: a level-1 10mm Pistol kills a
Giant Rat in 4.4 attacks, a Soldier Ant in 10.4 and a Lesser Panguling in 15.1.

### 6.3 Encounters: 4 PCs against a group (`party4.mjs` / `party5.mjs`, 4,000 fights each)

| Encounter | Current: win % / rounds / PCs downed | Proposed: win % / rounds / PCs downed |
|---|---|---|
| L1 vs 3 raiders | **11%** / 21.0 / 1.01 | **97%** / 19.2 / 0.33 |
| L1 vs 2 raiders | — | 100% / 12.5 / 0.14 |
| L1 vs 3 UCL (level-3 content) | 6% / 18.6 / 1.13 | 21% / 17.5 / 1.12 |
| L3 vs 3 raiders | 98% / 13.7 / 0.29 | 100% / 8.0 / 0.09 |
| L3 vs 3 UCL | 95% / 13.5 / 0.43 | 100% / 9.0 / 0.21 |
| L3 vs 2 Protectorate, rifle | 76% / 15.6 / 0.68 | 99% / 9.8 / 0.27 |
| L3 vs 2 Protectorate, **mortar every turn** (worst case) | **6%** / 12.2 / 1.53 | 70% / 9.9 / 0.93 |
| L5 vs 2 Protectorate, mortar | **27%** / 11.5 / 1.46 | 99% / 6.6 / 0.32 |
| L5 vs 3 UCL | 100% / 9.1 / 0.12 | 100% / 6.1 / 0.07 |

**Encounter sizing (NEW guidance):** at level 1, **1 grunt per 2 PCs**, because 3
raiders still take about 19 rounds. At level 3, 1 soldier per PC. The Protectorate
mortar needs its one-turn setup enforced. Fired every turn, it is still the deadliest
thing a level-3 party meets (70% win rate).

### 6.4 Over- and under-tuned, and the remaining bugs

| Target | Tag | Change |
|---|---|---|
| Raider, UCL Regular, Protectorate Infantry, Labourers | CHANGE | As in §6.1 |
| Automated Turret | Flag | Anti-Tank 7d8+30 and Flame 3d10+30: a "hack it, don't fight it" set piece. Set `is_boss`. |
| Homemade Pistol / PVC Pipe Gun | CHANGE | 1d6 → 1d6+2 and 1d4 → 1d4+1. Both stay inside the T5 band. |
| Level 5 and up | Note | Main-skill hit reaches the 95% ceiling. New level-5+ enemies need pristine T1 armor (AC 30+) or real DT. |
| **Burst fire** | **BUG** | Items carry `burst_capable`, but the code reads `burst_shots`. None of the 8 weapons can burst. |
| **Head armor** | **BUG** | Only `equipment.body` is read. **RULED:** the head slot stays shared with Glasses, which is part of Short-Sighted's cost. Proposal: head armor's AC adds to total AC, and its DT/DR applies to Head and Eyes aimed shots. |
| Gergasi +10% DR | **BUG** | `derived.damageRes` is never applied |
| Crit chance | Minor BUG | It reads raw base LK, not the derived value |

---

## 7. Traits, perks and skill books

### 7.1 Traits and perks

| Entry | Current effect | Proposal |
|---|---|---|
| Heavy Handed | +4 melee damage (works; +53% on a 1d8+3 machete). The −25% crit damage does nothing. | **RULED** (rev. 1's reading): the +300% entry becomes ×3, and Artery does 15 true damage. |
| Short-Sighted | −1 PER without Glasses | Keep. The shared head slot is the real cost (**RULED**). |
| Faster Healing / Rad Child / Cancerous Growth | They add to the healing *cap*. At EN 8, Faster Healing adds +0.3 HP per hour; at EN 10, nothing. | **CHANGE** (still a proposal): the bonus becomes flat HP per hour *after* the cap. Add ranks. Rad Child: `race_requirement: ghoul`, and only while rads > 0. Healing on every clock advance stays (**RULED**). |
| Triad Ties | TBA. Rev. 1 referred to the removed Antipathy tier. | **CHANGE:** Lim-affiliated vendors: buy −0.10, sell +0.05 (inside the barter limits). At character creation, **−10 on one rival faction's reputation slider** (GM's choice). That is still Neutral, but one bad deed away from Hated. |
| Water Sense | TBA | +20 Survival to find water. Dirty Water contamination drops from 20% to 10%. |
| Border Rat | TBA | +15 Speech with smugglers and the Bursa, −15 with Federation officials. The Bursa spread shrinks from ±10% to ±5% for this character. |
| Feral Blood | TBA | +1 STR. Feral checks start at 500 rads instead of 600. |
| Armor `modifiers` | **BUG:** never applied (CHA +2 jackets, the Frontliner's −40 Sneak) | Add equipped items' modifiers to `modifierSources`. |

### 7.2 Skill books (**RULED**: +5 skill points each and reading advances time)

| Question | Proposal | Reason |
|---|---|---|
| Effect | +5 **skill points** into the book's skill: +10% if tagged, +5% if not | Following the ruling. It works like a quarter of a level-up (11 to 29 points), so a book is worth reading for anyone. |
| **Read time** | **2 hours** on the shared party clock (`advanceTime(120)`, not a rest) | Long enough to cost something without eating a day. At the settled rates, every PC pays **−6 thirst, −4 hunger and −3 sleep**, and gets 2 natural-healing rolls (not the long-rest ×1.5). The whole party waits together. |
| Several readers | PCs can read **at the same time**: one 2-hour advance covers every character reading one book each | The clock is shared. Charging the party 2 hours per book per person would punish splitting the loot. |
| During a rest | A rest of at least 2 hours can include reading at no extra time, but that character gets no sleep recovery for those 2 hours | Stops "read for free while resting" without extra bookkeeping. |
| Value | Keep 145–250 base (1,450–2,500 RMR) | About 3 to 5 PC-days of food and water. That fits a quarter-level. |

---

## 8. Survival and crafting

### 8.1 Cost of staying fed (RMR at index 10)

| Need (settled rates) | Cheapest clean option | Base per point | RMR per day |
|---|---|---|---|
| Thirst, 72 per day | Soyabean Milk 8 / Purified Water 15 / Winter Melon 12 | 0.40–0.50 | about **300** |
| Thirst, using Dirty Water 3/25 | about a 49% chance a day of at least one contamination | 0.12 | 90 |
| Hunger, 48 per day | Cicak 6 / Instant Mee 8 / Can of Food 10 | 0.30–0.33 | about **160** |
| **Per PC per day** | | | **about 450 RMR** (4.5 PD), or 1,800 for the party |

Weight is unchanged: about 10 kg for a 5-day trip against 68 kg capacity at STR 5.
**Job rewards at level 1:** 50–150 base, which is **500–1,500 RMR or 5–15 PD**. Paying
in PD is safer for the players (§4.3). **NEW recipe, Boil & Strain:** 2 Dirty Water + 1
Chemicals → 1 Purified Water (1.36×).

### 8.2 Healing value

| Item | Average HP | Base per HP | RMR per HP |
|---|---|---|---|
| Healing Poultice | 10.5 | 3.8 | 38 |
| Stimpak | 15.5 | 4.8 | 48 |
| Doctor's Bag | 21 | 6.2 | 62 |
| Med Kit | 5.5 | 10.0 → **5.5 at value 30 (CHANGE)** | 100 → 55 |

### 8.3 Recipes and junk

The ×10 index doesn't change any of these, since they are ratios. As in rev. 1:

- All 25 recipes pass the 1.5× rule.
- **Studded Leather** inputs → 8 Cloth + 10 Scrap + 6 Adhesive (1.39×). Its current
  recipe needs rare Hardened Alloy, so nobody will craft it.
- **Med Kit** inputs → 3 Chemicals + 3 Organics, to go with the new value of 30.
- Gun Parts in the melee recipes breaks the spec's "a gunsmith's alone" rule. Flagged
  only.
- **CHANGE: 29 junk values** now equal the value of their yield: Broken Radio Set 6 →
  20, Copper Wire Spool 4 → 14, Circuit Board Fragment, Cracked LCD Panel, Dead Car
  Battery and Jammed Sewing Machine 4 → 12, Broken Streetlamp Fixture 3 → 10, Duct
  Tape, Broken Pressure Cooker, Empty Kerosene Tin and Rusty Bicycle Chain → 9,
  Cracked Motorbike Mirror 2 → 8, Rusted Kapcai Carburettor 3 → 7, Moth-Eaten Prayer
  Mat, ProTiga Factory Scrap, Shredded Tarpaulin, Spoiled Coconut Husk Sack, Tangled
  Barbed Wire Coil and Warung Signboard → 6, Rubber Sandal Strap and Spool of Fishing
  Line → 5, and every other junk item → 4 (Rusted Pipe Segment, Broken Ceiling Fan
  Blade, Cracked Motorcycle Helmet, Cracked Rain Barrel, Dried Fish Bones, Federation
  Ration Tin, Torn Umbrella Frame, Withered Herb Bundle). Bobby Pin is already correct.

---

## 9. Questions for the GM

### Resolved (2026-09-22 rulings)

| # | Question | Ruling |
|---|---|---|
| Q1 | Is `value` in RMR? | **RESOLVED:** RMR prices are ×10 in early hyperinflation. Implemented here as value × index (10). See N1. |
| Q2 | UCL currency? | **RESOLVED:** none. The UCL row is removed. |
| Q3 | Bond Slips? | **RESOLVED:** no Bond Slips. Removed everywhere. |
| Q4 | Crit-fail entries 6/7 and Backfire? | **RESOLVED:** 6/7 add 1d3 marks. Backfire sets Broken (repairable). |
| Q5 | Repair: roll or cap? | **RESOLVED:** instant and capped by skill, with a skill-scaled chance to save components (§2.5). |
| Q6 | Heavy Handed reading? | **RESOLVED:** rev. 1's reading stands. |
| Q7 | Healing on every clock advance? | **RESOLVED:** it stays. Hunger and thirst are the attrition. |
| Q8 | Separate face slot for Glasses? | **RESOLVED:** no. The shared head slot is intended. |
| Q9 | What does the Nail Driver fire? | **RESOLVED:** new `nails` ammo (§3.3). |
| Q10 | Humanoid NPCs built like PCs? | **RESOLVED:** yes, generic SPECIAL, not harder to hit (§6.1). |
| Q11 | Rename the slave entries? | **RESOLVED:** renamed to labourers. |
| Q12 | Skill books? | **RESOLVED:** +5 skill points plus read time (§7.2). |

### Still open

| # | Question | Why it needs a call |
|---|---|---|
| N1 | Keep vault `value` as a base with RMR = value × index (my proposal: no bulk rewrite, and drift is one number), or multiply every vault `value` by 10? | If the vault stores RMR, every drift step means rewriting prices. |
| N2 | Does "Repair skill" mean a **new 19th skill**, or the item's Gunsmith / Science / Engineering (my assumption)? | A new skill would change character creation and the skill-point budget. |
| N3 | Is it acceptable in the lore that Protectorate and UCL line troops wear kit worn to 6–7 marks? The alternative is NPC AC = AG + half the armor's AC. | The Protectorate is the high-tech power. Worn gear is how this proposal keeps them from being harder to hit. |
| N4 | Weekly index roll: at the start of each in-game week or at each session? And who can see the index: every player, or only those who check a Bursa board? | This sets how visible the inflation is. |

---

## Appendix A: every weapon and armor piece by tier

The damage column is the average per roll, with MD not included for melee. Protection
is `AC + 3 × DT + DR/2`, using normal damage. Value is base value (RMR = ×10 at index 10),
with the proposed numbers already in for TBAs and changes (§3.2, §3.3). "/unit" marks
a single-use item priced per piece. The note column lists items outside their tier's
band. Big guns, explosives and head pieces are not banded on damage or protection
(§3.1). Generated by `tiers.mjs`.

| Item | Kind | Tier | Damage / AC, DT/DR | Average damage / protection | Value | Note |
|---|---|---|---|---|---|---|
| malayan_frontliner_armor | Armor | T1 | AC 20, 7/45 | 63.5 | 255 |  |
| protectorate_heavy_trooper_armor | Armor | T1 | AC 25, 8/45 | 71.5 | 285 |  |
| salvaged_power_armor_chestplate | Armor | T1 | proposed AC 22, 6/40 (base_marks 8) | 60 | 300 |  |
| salvaged_power_armor_helmet | Armor (head) | T1 | proposed AC 6, 2/15 (base_marks 8) | — | 80 | |
| 50_cal_machine_gun | Weapon | T1 | 2d8+8 (burst) | 17.0 | 765 |  |
| anti_materiel_rifle | Weapon | T1 | 3d10+8 | 24.5 | 500 |  |
| deathclaw_gauntlet | Weapon | T1 | 2d8+8+MD | 17.0 | 450 |  |
| fat_man | Weapon | T1 | 6d10+20 | 53.0 | 2000 |  |
| gatling_laser | Weapon | T1 | 1d8+4 (burst) | 8.5 | 450 |  |
| gauss_pistol | Weapon | T1 | 3d8+9 | 22.5 | 495 |  |
| gauss_rifle | Weapon | T1 | 3d10+18 | 34.5 | 760 |  |
| missile_launcher | Weapon | T1 | 4d10+8 | 30.0 | 750 |  |
| plasma_caster | Weapon | T1 | 4d8+10 | 28.0 | 615 |  |
| plasma_grenade | Weapon | T1 | 4d10+15 | 37.0 | 90 /unit |  |
| plasma_rifle | Weapon | T1 | 3d8+6 | 19.5 | 430 |  |
| rocket_launcher | Weapon | T1 | 4d10+5 | 27.0 | 675 |  |
| tesla_cannon | Weapon | T1 | 3d10+20 | 36.5 | 805 |  |
| protectorate_infantry_armor | Armor | T2 | AC 20, 4/35 | 49.5 | 150 |  |
| ucl_vanguard_armor | Armor | T2 | AC 20, 5/40 | 55 | 220 |  |
| 14mm_pistol | Weapon | T2 | 2d8+3 | 12.0 | 220 |  |
| 223_pistol | Weapon | T2 | 2d8+4 | 13.0 | 240 |  |
| battle_rifle | Weapon | T2 | 2d10+6 | 17.0 | 330 |  |
| chinese_officers_sword | Weapon | T2 | 1d10+6+MD | 11.5 | 250 |  |
| combat_rifle | Weapon | T2 | 2d8+3 | 12.0 | 210 |  |
| combat_shotgun | Weapon | T2 | 2d8+4 | 13.0 | 200 |  |
| flamer | Weapon | T2 | 2d6+3 | 10.0 | 260 |  |
| fractured_laser_rifle | Weapon | T2 | 2d10+6 | 17.0 | 375 |  |
| gatling_gun | Weapon | T2 | 1d8+3 (burst) | 7.5 | 380 |  |
| grenade_launcher | Weapon | T2 | 2d10+12 | 23.0 | 460 |  |
| katana | Weapon | T2 | 2d8+6+MD | 15.0 | 300 |  |
| keris | Weapon | T2 | 2d6+4 | 11.0 | 250 |  |
| land_mine | Weapon | T2 | 2d10+15 | 26.0 | 55 /unit |  |
| laser_pistol | Weapon | T2 | 2d6+4 | 11.0 | 240 |  |
| laser_rifle | Weapon | T2 | 2d10+6 | 17.0 | 375 |  |
| light_machine_gun | Weapon | T2 | 1d8+3 (burst) | 7.5 | 340 |  |
| minigun | Weapon | T2 | 1d8+3 (burst) | 7.5 | 400 |  |
| plasma_pistol | Weapon | T2 | 2d8+4 | 13.0 | 285 |  |
| power_fist | Weapon | T2 | 2d6+6+MD | 13.0 | 300 |  |
| riot_shotgun | Weapon | T2 | 2d8+4 | 13.0 | 210 |  |
| ripper | Weapon | T2 | 2d8+6+MD | 15.0 | 280 |  |
| shishkebab | Weapon | T2 | 2d8+6+MD | 15.0 | 290 |  |
| sniper_rifle | Weapon | T2 | 2d10+7 | 18.0 | 350 |  |
| super_sledge | Weapon | T2 | 2d8+6+MD | 15.0 | 320 |  |
| combat_leather_jacket | Armor | T3 | AC 20, 2/30 | 41 | 110 |  |
| leather_armor | Armor | T3 | AC 15, 2/25 | 33.5 | 55 |  |
| malayan_infantry_armor | Armor | T3 | AC 15, 3/35 | 41.5 | 125 |  |
| mercenary_armor | Armor | T3 | AC 12, 3/25 | 33.5 | 85 |  |
| press_plate_armor_oversized | Armor | T3 | AC 15, 3/30 | 39 | 80 |  |
| rebar_plate_vest | Armor | T3 | AC 12, 3/25 | 33.5 | 65 |  |
| studded_leather_armor | Armor | T3 | AC 20, 3/25 | 41.5 | 75 |  |
| supermutant_clothes | Armor | T3 | AC 10, 3/25 | 31.5 | 60 |  |
| ucl_soldier_armor | Armor | T3 | AC 15, 2/25 | 33.5 | 100 |  |
| 10mm_pistol | Weapon | T3 | 2d6+2 | 9.0 | 110 |  |
| 10mm_smg | Weapon | T3 | 1d8+2 (burst) | 6.5 | 140 | dmg out of band: accept (burst) |
| 44_revolver | Weapon | T3 | 2d6+3 | 10.0 | 130 |  |
| assault_rifle | Weapon | T3 | 2d6+4 (burst) | 11.0 | 200 |  |
| bowie_knife | Weapon | T3 | 1d8+2+MD | 6.5 | 100 |  |
| double_barrel_shotgun | Weapon | T3 | 2d8+2 | 11.0 | 160 |  |
| fire_axe | Weapon | T3 | 1d8+2+MD | 6.5 | 90 |  |
| frag_grenade | Weapon | T3 | 2d8+9 | 18.0 | 35 /unit |  |
| hunting_rifle | Weapon | T3 | 2d8+2 | 11.0 | 130 |  |
| incendiary_grenade | Weapon | T3 | 2d6+6 | 13.0 | 30 /unit |  |
| lever_action_shotgun | Weapon | T3 | 2d6+3 | 10.0 | 150 |  |
| marksman_carbine | Weapon | T3 | 2d6+3 | 10.0 | 150 |  |
| pump_action_shotgun | Weapon | T3 | 2d6+4 | 11.0 | 155 |  |
| sawed_off_shotgun | Weapon | T3 | 2d6+3 | 10.0 | 130 |  |
| sledgehammer | Weapon | T3 | 2d6+3+MD | 10.0 | 150 |  |
| tommy_gun | Weapon | T3 | 2d6+3 (burst) | 10.0 | 190 |  |
| axe_town_coveralls | Armor | T4 | AC 8, 2/25 | 26.5 | 40 |  |
| ramshackle_armor | Armor | T4 | AC 8, 2/25 | 26.5 | 35 |  |
| rusted_riot_shield_harness | Armor | T4 | AC 10, 4/15 | 29.5 | 50 |  |
| 32_revolver | Weapon | T4 | 1d6+3 | 6.5 | 70 |  |
| 9mm_pistol | Weapon | T4 | 1d8+3 | 7.5 | 90 |  |
| angkasa_wrench | Weapon | T4 | 2d6+2 | 9.0 | 45 | dmg out of band: dmg → 2d4+2 |
| axe_gang_cleaver | Weapon | T4 | 1d10+2 | 7.5 | 110 |  |
| baseball_bat | Weapon | T4 | 1d8+MD | 4.5 | 80 |  |
| brass_knuckles | Weapon | T4 | 1d10+MD | 5.5 | 40 |  |
| cleaver | Weapon | T4 | 1d8+MD | 4.5 | 75 |  |
| combat_knife | Weapon | T4 | 1d8+MD | 4.5 | 75 |  |
| corroded_minigun_barrel_club | Weapon | T4 | 2d6+4 | 11.0 | 55 | dmg out of band: dmg → 2d6+1 |
| dynamite | Weapon | T4 | 2d10+8 | 19.0 | 30 /unit |  |
| lim_clan_straight_razor | Weapon | T4 | 1d6+1 | 4.5 | 65 |  |
| machete | Weapon | T4 | 1d8+MD | 4.5 | 85 |  |
| nightstick | Weapon | T4 | 1d8+MD | 4.5 | 65 |  |
| parang | Weapon | T4 | 1d8+1 | 5.5 | 85 |  |
| pneumatic_nail_driver | Weapon | T4 | 1d6+3 | 6.5 | 70 |  |
| salvaged_rebar_greatsword | Weapon | T4 | 2d8 | 9.0 | 60 | dmg out of band: dmg → 2d6+1 |
| switchblade | Weapon | T4 | 1d6+MD | 3.5 | 60 |  |
| tire_iron | Weapon | T4 | 1d8+MD | 4.5 | 70 |  |
| varmint_rifle | Weapon | T4 | 1d6+2 | 5.5 | 60 |  |
| 1414_windbreaker | Armor | T5 | AC 1, 0/5 | 3.5 | 10 |  |
| clothes | Armor | T5 | AC 1, 0/5 | 3.5 | 5 |  |
| ghoul_wrap | Armor | T5 | AC —, — | 0 | 3 |  |
| lim_clan_tailored_suit | Armor | T5 | AC 3, 1/10 | 11 | 150 | value out of band: accept (social premium) |
| malayan_officers_uniform | Armor | T5 | AC 2, 1/7 | 8.5 | 25 |  |
| metal_plates | Armor | T5 | AC 2.5, 1/5 | 8 | 15 |  |
| padded_coveralls | Armor | T5 | AC 3, 0/8 | 7 | 8 |  |
| prison_labourer_clothes | Armor | T5 | AC 0, 0/0 | 0 | 1 |  |
| protectorate_officers_uniform | Armor | T5 | AC 3, 1/10 | 11 | 35 | value out of band: accept (social premium) |
| rattan_basket_armor | Armor | T5 | AC 4, 1/10 | 12 | 12 |  |
| reinforced_tarpaulin_wrap | Armor | T5 | AC 5, 1/15 | 15.5 | 25 |  |
| tarp_poncho | Armor | T5 | AC 2, 0/5 | 4.5 | 5 |  |
| ucl_officers_uniform | Armor | T5 | AC 2, 0/7 | 5.5 | 15 |  |
| water_wardens_slicker | Armor | T5 | AC 2, 0/7 | 5.5 | 15 |  |
| factory_respirator | Armor (head) | T5 | AC 1, 0/5 | 3.5 | 30 |  |
| 1414_chain_whip | Weapon | T5 | 1d6+1 | 4.5 | 20 |  |
| bent_rebar_spear | Weapon | T5 | 1d6 | 3.5 | 8 |  |
| boxing_gloves | Weapon | T5 | 1d2+MD | 1.5 | 15 |  |
| cracked_pvc_pipe_gun | Weapon | T5 | 1d4+1 | 3.5 | 12 |  |
| golf_club | Weapon | T5 | 1d6+MD | 3.5 | 25 |  |
| homemade_pistol | Weapon | T5 | 1d6+2 | 5.5 | 50 |  |
| homemade_rifle | Weapon | T5 | 1d8+1 | 5.5 | 55 |  |
| kitchen_knife | Weapon | T5 | 1d6 | 3.5 | 10 |  |
| molotov_cocktail | Weapon | T5 | 1d10+4 | 9.5 | 15 /unit |  |
| nail_board | Weapon | T5 | 1d6+1 | 4.5 | 10 |  |
| pool_cue | Weapon | T5 | 1d4+MD | 2.5 | 20 |  |
| rebar_nail_club | Weapon | T5 | 1d6+2 | 5.5 | 25 |  |
| shovel | Weapon | T5 | 1d6+MD | 3.5 | 20 |  |
| water_pipe_cudgel | Weapon | T5 | 1d6+1 | 4.5 | 20 |  |
