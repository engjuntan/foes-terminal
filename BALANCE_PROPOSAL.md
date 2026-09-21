# FOES Balance Proposal (rev. 3)

Written by the `balance-auditor` agent.

| Revision | Date | What it applied |
|---|---|---|
| rev. 1 | 2026-09-21 | First proposal |
| rev. 2 | 2026-09-22 | First round of GM rulings |
| rev. 3 | 2026-09-22 | **Second round of GM rulings** (win-rate ceiling, enemy tiers, faction character, Repair skill, RMR baseline prices, skill books not shared) |

Nothing in `src/`, the vault or the specs was changed. Everything here is a proposal
unless it is marked **RULED**.

**Tags.** **CHANGE** alters an existing number or formula, and every affected item is
listed. **NEW** fills a gap. **BUG** means the code does not match a ruling or the
manual. **RULED** means the GM has already decided it; the section only works out the
numbers.

**Sources and method.**
- Sources, in order of authority: the GM rulings in `SCOPE_DECISIONS.md`, then
  `reference/manual.txt`, then `src/`, then the generated data.
- The simulations import the real `src/combat.js`, `items.js` and `bestiary.js`.
- Scripts are in the session scratchpad (`…/scratchpad/balance/`):

  | Script | What it produces |
  |---|---|
  | `tier.mjs` | The encounter engine |
  | `final.mjs` | The tuned stat lines and the per-tier verification |
  | `fix*.mjs` | The last adjustments |
  | `wear2.mjs` | Wear rates |
  | `tiers.mjs` | Appendix A |

- Every simulation assumes the tag / `skill_ranks` bug is fixed.

### Prices (RULED)

- **An item's `value` is its baseline price in RMR.** CHANGE: every vault `value` is
  multiplied by 10 (for example, Stimpak 75 → 750).
- **PD price = value ÷ 100. Dinar price = value ÷ 2,000.**
- All values in this file are the new RMR values unless marked otherwise.
- Inflation is a GM-moved multiplier on top of the baseline (§4.3).

---

## 1. Summary: what matters most

| # | Tag | Change | Why it matters |
|---|---|---|---|
| 1 | **RULED** + NEW | **Enemy tiers T5 to T1**, each with a target party level and win rate: T5 at level 1 (85%), T4 at level 2 (85%), T3 at level 3 (80%), T2 at level 5 (75%), T1 at level 7 (about 55%, a hard fight). Every bestiary entry is placed and tuned, and 10 new entries are proposed (§6). | Every tuned matchup lands between **75% and 89%** of its target. **None exceeds 89%**, against 97–100% in rev. 2. |
| 2 | **NEW finding** | **Win rate falls off a cliff with encounter size.** One enemy fewer than standard gives 94–100% wins. One more gives 2–63%. | Stats can only hit a target at one group size. The GM has to hold the **standard group sizes** in §6.2. Adding a single enemy is a tier jump. |
| 3 | **RULED** | Faction character: the **Caliphate** has the best-trained elites (Pahlawan, 120% to hit). The **Federation** has poor regulars (65%) and elite commandos (110%). The **Protectorate** has the best gear (AC 26 and 31, pristine armor) but poor training (65–70% to hit), and makes up for it with numbers and toughness. | Protectorate troops no longer wear worn armor. Only raiders do. |
| 4 | **NEW** | Durability shape: `condition = { inv: { itemId: [marks…] }, worn: { slot: marks } }`. `inventory` stays `{itemId: qty}`. | Unchanged from rev. 2 (§2.1). |
| 5 | **RULED** | Linear wear from the first mark: weapon damage ×(1 − 0.05 × marks), −1 to hit per mark, armor potency ×(1 − 0.05 × marks), and 10 marks = Broken. | Unchanged from rev. 2 (§2.2). |
| 6 | **RULED** | **The Repair skill (3 × INT, the Fallout 2 formula)** governs repair. The floor is `6 − floor(Repair / 20)`. There is a chance not to use up components: 10% at Repair 60, 20% at 80, **30% at 100 (the cap)**. | The arbitrage guard still holds after the ×10 price change (§2.5). |
| 7 | **RULED** | 1 PD = 100 RMR and 1 Dinar = 2,000 RMR. Inflation is a GM-moved **market multiplier** on RMR prices, suggested at +5% a week. PD and Dinar prices don't move. | §4 |
| 8 | **NEW** | Five item tiers (T5 Homemade to T1 Pre-War) with bands per tier, and all 119 weapons and armor pieces placed (Appendix A, now in RMR). | §3 |
| 9 | **CHANGE** | Junk values = the value of their scrap yield, which removes the money printer. The barter limits stay at buy ≥ 1.05 and sell ≤ 0.65. | §5, §8 |
| 10 | **RULED** | Skill books: each character reads their **own copy** (+5 skill points, 2 hours on the shared clock per book). Nails: 10 RMR each. The Nail Driver is 700 RMR. | §7.2, §3.3 |

These bugs from earlier revisions are still open: burst never triggers (`burst_capable`
vs `burst_shots`), head armor is ignored, Gergasi DR is unused, armor `modifiers` and
Heavy Handed's crit penalty do nothing, and Rad Child applies to everyone everywhere.

---

## 2. Durability

### 2.1 Data shape (**NEW**, unchanged)

```js
characters.<id>.inventory = { "10mm_pistol": 2, "leather_armor": 1, "stimpak": 3 }   // unchanged
characters.<id>.condition = {
  inv:  { "10mm_pistol": [2, 7], "leather_armor": [5] }, // one integer 0–10 (marks) per copy, sorted ascending
  worn: { "right_hand": 3, "body": 4 }                   // marks on the copy in each equipment slot
}
```

| Rule | Detail |
|---|---|
| Durable items | `(type === 'weapon' && skill !== 'throwing') \|\| type === 'armor'`. Everything else stays a plain count. |
| Invariant | `condition.inv[id].length === inventory[id]` |
| Missing data | `normalizeCondition(char)` fills in missing copies with `item.base_marks ?? 0` and trims extra entries, so legacy characters upgrade silently. |
| Writes | Replace `condition.inv` whole, in the same `updateDoc` as `inventory`. Combat wear is one dot-path field inside the attack's existing write. |
| Default copy choice | Equip takes the lowest-marks copy. Scrap and sell take the highest-marks copy. Give moves the copy the player picks. One UI row per copy. |
| Vault field | **CHANGE:** `"condition": "disrepair"` → `"base_marks": 8` on the salvaged power armor pieces and the fractured laser rifle. |

**Pure helpers** (a new `src/condition.js`): `isDurable`, `normalizeCondition`,
`takeCopy`, `putCopy`, `weaponCondition(marks)`, `armorMult(marks)`,
`conditionValue(item, marks)`, `scrapYieldFor(item, marks)`, `repairCostPerMark(item)`,
`repairFloor(repair, atBench, hasTools)`, `repairSaveChance(repair)`.

**Code that must use the new shape:** `equipItem`, `unequipItem`, `gmUnequipItem`,
`giveItem`, `gmGrantItem` (add a marks input), `craftItem`, `scrapItem`,
`resolveAttack` (including `destroyOrDropAttackerWeapon`), `gmFactoryReset`,
`calculateDerivedStats` (armor AC), `parseArmorDtdr`, and the inventory and
hit-preview views.

### 2.2 Condition scale (**RULED**: linear from 1 mark)

Every multiplier is 1 − 0.05 × marks, rounded to the nearest whole number (.5 rounds
up).

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
| 10 | **Broken** | cannot be used (blocked, turn not spent) | — | — | ×0.50 | ×0.1 | ×0.50 |

**Reasons.**
- Damage follows the GM ruling.
- Hit ends at −9, which keeps the manual's ceiling of "−10% hit chance" for worn
  weapons.
- The fumble rate at LK 5 rises smoothly: 5.5% → 6.3% (2 marks) → 7.4% (4) → 8.2% (6)
  → 9.2% (8).
- Value drops 10% per mark, because the repair price is built on it.

**Combat hooks.**
- Hit: `skill − AC − marks`.
- Damage: `round(rolled × (1 − 0.05m))`, before DT/DR.
- Fumble save: succeeds on `d10 ≤ LK − floor(m/2)`.
- Armor: `AGI + round(ac × (1 − 0.05m))`, and the same multiplier on every DT and DR.

**Worked example: Leather Armor (AC 15, 2/25)**

| Marks | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AC | 15 | 14 | 14 | 13 | 12 | 11 | 11 | 10 | 9 | 8 | 8 |
| DT/DR | 2/25 | 2/24 | 2/23 | 2/21 | 2/20 | 2/19 | 1/18 | 1/16 | 1/15 | 1/14 | 1/13 |

**Worked example: 10mm Pistol (2d6+2, value 1,100 RMR)**

| Marks | 0 | 2 | 4 | 6 | 8 | 10 |
|---|---|---|---|---|---|---|
| Average damage | 9.0 | 8.1 | 7.2 | 6.3 | 5.4 | Broken |
| Hit | ±0 | −2 | −4 | −6 | −8 | — |
| Value (RMR) | 1,100 | 880 | 660 | 440 | 220 | 110 |

### 2.3 Wear

| Source | Marks | Basis |
|---|---|---|
| Weapon: any critical failure | +1 | Manual ("on critical failures") |
| Weapon: crit-fail entries 6 and 7 | **+1d3** in place of the +1 | **RULED** |
| Weapon: crit-fail entry 2 (Backfire) | set to **10 (Broken)**. The arm is still crippled. | **RULED** |
| Melee: Block or Deflect | +1d2 / +1 | Manual special moves |
| Armor: a hit on you whose attack roll ends in 0 | +1 | The manual's "every 10 hits, one mark" |
| Armor: explosive hit | +floor(raw / 10) | Manual |
| Optional: `improvised: true` weapons | LK roll after each attack. On a failure, +1 mark. | Manual, softened |

Simulated wear (`wear2.mjs`): at LK 5 a weapon gains 1 mark per 18 attacks, takes 59
attacks to go from 0 to 5 marks, and 87 to reach Broken. At LK 3 those figures are 14,
46 and 69. At LK 8 they are 36, 110 and 149.

### 2.4 Found and stocked condition (by item tier)

| Where the item comes from | Marks |
|---|---|
| T5 Homemade | 1d4 |
| T4 Salvaged | 1 + 1d4 |
| T3 Baseline | 2 + 1d4 |
| T2 Improved | 4 + 1d4 |
| T1 Pre-War | 6 + 1d4 |
| Vendor stock | 2 |
| Crafted | 0 |
| **NPC gear** | raiders and gangs: by tier as above. **Protectorate: always 0** (RULED: well-maintained). Federation and UCL regulars: 1d4. |

### 2.5 Repair (**RULED**: instant, capped by the **Repair** skill)

**The skill.** **Repair = 3 × INT** (Fallout 2 formula, RULED). It is taggable like
any other skill: +20 when tagged, and 2 per point spent. Every repair uses Repair,
whatever the item.

**At level 1:**

| INT | Untagged | Tagged |
|---|---|---|
| 4 | 12 | 32 |
| 6 | 18 | 38 |
| 8 | 24 | 44 |

**Floor, bench and tools.** The floor is `max(0, 6 − floor(Repair / 20))`. A bench
matching the item (Weapons Bench for weapons, Armour Bench for armor) lowers it by 1
more. A Tool Set adds +25 to Repair (manual: "Adds 25% to repair skill"). Gunsmith's
Tools add +25 when repairing guns.

| Repair | 0–19 | 20–39 | 40–59 | 60–79 | 80–99 | 100–119 | 120+ |
|---|---|---|---|---|---|---|---|
| Field floor (lowest marks reachable) | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| At a bench | 5 | 4 | 3 | 2 | 1 | 0 | 0 |
| **Chance not to consume components** (one d100 per repair job) | 0% | 0% | 0% | 10% | 20% | 30% | 30% (cap) |

Example: a level-1 PC with INT 6 and Repair tagged has 38, so their floor is 5 in the
field and 4 at a bench. With a Tool Set (63) the floor is 3 in the field and 2 at a
bench, with a 10% chance of saving the parts.

**Cost per mark removed.**
`primary × max(1, ceil(0.10 × value / primary.value))` + 1 secondary, plus 1 rare per
2 marks for energy weapons and power armor. For heavy armor, 1 Hardened Alloy may
stand in for 10 Scrap Metal.

| Category | Primary | Secondary | Rare |
|---|---|---|---|
| Guns | Gun Parts | Scrap Metal | — |
| Energy weapons | Electronics | Gun Parts | Pre-War Tech |
| Melee | Scrap Metal | Adhesive | — |
| Light armor | Cloth | Adhesive | — |
| Heavy armor | Scrap Metal | Cloth | — |
| Power armor | Scrap Metal | Electronics | Hardened Alloy |

Component values in RMR: Scrap Metal 20, Cloth 20, Organics 20, Adhesive 30, Gun Parts
50, Chemicals 50, Electronics 60, Pre-War Tech 250, Hardened Alloy 300.

| Item (value) | Per mark | RMR per mark |
|---|---|---|
| Homemade Pistol (500) | 1 Gun Parts + 1 Scrap | 70 |
| 10mm Pistol (1,100) | 3 Gun Parts + 1 Scrap | 170 |
| Assault Rifle (2,000) | 4 Gun Parts + 1 Scrap | 220 |
| Machete (850) | 5 Scrap + 1 Adhesive | 130 |
| Sledgehammer (1,500) | 8 Scrap + 1 Adhesive | 190 |
| Leather Armor (550) | 3 Cloth + 1 Adhesive | 90 |
| Laser Pistol (2,400) | 4 Electronics + 1 Gun Parts + 1 Pre-War Tech per 2 marks | about 415 |
| Salvaged PA Chestplate (3,000) | 15 Scrap + 1 Electronics + 1 Hardened Alloy per 2 marks | about 510 |

**Re-check of the arbitrage guard** (buy damaged, repair, sell). The worst case is
buying at 9 marks and repairing to 0 at the barter limits (buy 1.05, sell 0.65). That
pays `0.545 V − 9c(1 − p)`, which only makes a profit if **c(1 − p) < 0.061 V**, where
c is the cost per mark and p the chance to save parts.

- Because the cost rounds up (`ceil`), c ≥ 0.10 V. At the 30% cap, c(1 − p) ≥ 0.07 V,
  so every item loses money. **Keep the cap at 30%.**
- The ×10 price change multiplies both sides equally, so it doesn't matter.
- The market multiplier (§4.3) only opens a gap of 5–20% (repairing with parts bought
  at an older, lower multiplier). That is below the margin.

**Time (optional):** 10 in-game minutes per mark in the field, 5 at a bench.

### 2.6 Scrap yield from weapons and armor

The default comes from the recipe: 50% of each input, rounded down, minimum 1. For
items without a recipe, author a yield worth ≤ 40% of the item's value. Condition then
applies the §2.2 multiplier.

---

## 3. Item tiers and values (all values in RMR)

### 3.1 Tier bands

Damage is the average per roll. Melee is measured **before MD**, so its band sits 2
lower. Big guns, launchers and explosives are banded on value only. Armor uses
`score = AC + 3 × DT + DR/2` (normal damage). Head pieces are tiered by origin.

| Tier | Guns: damage | Melee: damage | Weapon value | Armor score | Armor value | Found at |
|---|---|---|---|---|---|---|
| **T5 Homemade** | 2–6 | 0–5.5 | 50–600 | 0–16 | 10–300 | 1d4 marks |
| **T4 Salvaged** | 4–9 | 2–8 | 400–1,200 | 15–30 | 250–700 | 1 + 1d4 |
| **T3 Baseline** | 8–12 | 6–10 | 900–2,200 | 30–45 | 550–1,300 | 2 + 1d4 |
| **T2 Improved** | 11–18 | 9–16 | 2,000–5,000 | 45–60 | 1,200–2,500 | 4 + 1d4 |
| **T1 Pre-War/Pristine** | 15+ | 13+ | 4,000+ | 60+ | 2,500+ | 6 + 1d4 |

Counts per tier: T5 29, T4 22, T3 25, T2 26, T1 17 (Appendix A).

The value formulas are unchanged in shape and now in RMR:
- Weapons: `value ≈ K × average damage`, with K = 50 for homemade, 120–150 for
  standard, 180–200 for military, 220 for energy and 450 for big guns.
- Armor: `score × (15 clothing, 20 scavenged, 30 military, 40 elite)`.

### 3.2 Outliers

| Item | Tier | Proposal |
|---|---|---|
| angkasa_wrench, salvaged_rebar_greatsword, corroded_minigun_barrel_club | T4 | **CHANGE** damage → 2d4+2 / 2d6+1 / 2d6+1. Each hits harder than its tier allows. |
| salvaged_power_armor_chestplate | T1 | **CHANGE** → AC 22, Normal 6/40, Laser 3/30, Explosive 5/35, value **3,000**, `base_marks: 8`. At 8 marks it plays like today's piece. |
| salvaged_power_armor_helmet | T1 | **CHANGE** → AC 6, 2/15, value **800**, `base_marks: 8` |
| fractured_laser_rifle | T2 | **CHANGE** → Laser Rifle stats (2d10+6, value 3,750) with `base_marks: 8` |
| combat_leather_jacket / supermutant_clothes | T3 | **CHANGE** value → 1,100 / 600 |
| axe_town_coveralls | T4 | Flag: Ramshackle stats at 1.5 kg. Suggest AC 4, 1/10, value 120. |
| 10mm_smg | T3 | Accept: below the band per roll, but burst rolls twice. |
| protectorate_officers_uniform, lim_clan_tailored_suit | T5 | Accept as a social premium. |

### 3.3 Stats for every TBA (values in RMR)

| Item | Tier | dmg | range | value | Item | Tier | dmg | range | value |
|---|---|---|---|---|---|---|---|---|---|
| laser_pistol | T2 | 2d6+4 | 15 | 2,400 | frag_grenade | T3 | 2d8+9 | 8 | 350 |
| laser_rifle | T2 | 2d10+6 | 30 | 3,750 | dynamite | T4 | 2d10+8 | 8 | 300 |
| plasma_pistol | T2 | 2d8+4 | 15 | 2,850 | incendiary_grenade | T3 | 2d6+6 fire | 8 | 300 |
| plasma_rifle | T1 | 3d8+6 | 28 | 4,300 | molotov_cocktail | T5 | 1d10+4 fire | 8 | 150 |
| plasma_caster | T1 | 4d8+10 | 25 | 6,150 | plasma_grenade | T1 | 4d10+15 | 8 | 900 |
| gauss_pistol | T1 | 3d8+9 | 20 | 4,950 | land_mine | T2 | 2d10+15 | 1 | 550 |
| gauss_rifle | T1 | 3d10+18 | 50 | 7,600 | 1414_chain_whip | T5 | 1d6+1 | 1 | 200 |
| tesla_cannon | T1 | 3d10+20 | 25 | 8,050 | axe_gang_cleaver | T4 | 1d10+2 | 1 | 1,100 |
| 50_cal_machine_gun | T1 | 2d8+8 | 30 | 7,650 | lim_clan_straight_razor | T4 | 1d6+1 | 1 | 650 |
| light_machine_gun | T2 | 1d8+3 | 25 | 3,400 | parang | T4 | 1d8+1 | 1 | 850 |
| rocket_launcher | T1 | 4d10+5 | 30 | 6,750 | rebar_nail_club | T5 | 1d6+2 | 1 | 250 |
| missile_launcher | T1 | 4d10+8 | 40 | 7,500 | water_pipe_cudgel | T5 | 1d6+1 | 1 | 200 |
| grenade_launcher | T2 | 2d10+12 | 25 | 4,600 | keris (dmg exists) | T2 | — | — | 2,500 |

**Nail Driver and Nails (RULED: `nails` ammo)**

| Item | Proposal | Reason |
|---|---|---|
| pneumatic_nail_driver | **T4.** `skill: small_guns`, 1H, dmg **1d6+3**, range **6**, `ammo_type: nails`, **`clip_size: 30`**, value **700** | Mid-band T4 gun damage. Point-blank range, like the Sawed-off. A 30-nail strip. |
| ammo_nails | value **10**, weight **0.005** (keep) | The cheapest round, below makeshift rounds (20) |
| Recovery | Recover half the nails fired after a fight, rounded down | The item text: "easy to straighten and reuse" |
| `recipe_nails` | 2 Scrap + 1 Adhesive (70) → 10 Nails (100). Weapons Bench, Gunsmith 10. | 1.43×, inside the 1.5 rule |

**Ammo per round (RMR):**

| Ammo | Value | Ammo | Value |
|---|---|---|---|
| nails | 10 | makeshift rounds | 20 |
| 9mm | 20 | 5mm | 20 |
| 10mm | 30 | 5.56 | 40 |
| shotgun shells | 40 | 7.62 | 50 |
| 14mm | 50 | energy cell | 60 |
| plasma cartridge | 100 | 2mm EC | 150 |
| flamer fuel | 30 | 40mm grenade | 400 |
| missile | 1,200 | mini nuke | 5,000 |

The missing calibers (.22 / .32 / .44 / .45 / .50) should be 20 / 20 / 40 / 40 / 100.
Armor TBA values are in Appendix A (for example Mercenary 850, Protectorate Infantry
1,500, Frontliner 2,550).

---

## 4. Currency: early hyperinflation

### 4.1 Official rates and roles (**RULED**)

| | RMR | PD | Dinar |
|---|---|---|---|
| 1 RMR | 1 | 0.01 | 0.0005 |
| 1 PD | **100** | 1 | 0.05 |
| 1 Dinar | **2,000** | **20** | 1 |

- **RMR** is the inflated everyday currency and carries the inflation story.
- **PD** is the stable middle tier: "most stable" in the vault.
- **Dinar** is rare and valuable: "most sacred… immense value" in the vault. A Dinar
  is worth about 2.7 Stimpaks or one T2 weapon (Assault Rifle 2,000).

**CHANGE (currency `value` fields):** `rmr` 1, `pd` 1 → **100**, `dinar` 1 →
**2,000**. The official rates are consistent with each other, so they leave no
arbitrage.

### 4.2 The Bursa and regions (market multiplier at 1.0)

The Bursa's spread is ±10%, or ±15% in a shock week.

| Region | PD (Bursa buys / sells) | Dinar (buys / sells) | Regional price level | Vendor behaviour |
|---|---|---|---|---|
| Federation towns and bunkers | 90 / 110 | 1,800 / 2,200 | ×1.0 | Only validated notes are taken at full value. |
| Border towns (Bandawang, the lake) | 90 / 115 | 1,750 / 2,250 | ×1.1 | All three currencies are posted, "adjusted by the ruling garrison". |
| Protectorate (Penang) | licensed: 100 + 10% fee. Bursa: 80 / 130 (risk of confiscation) | 1,700 / 2,300 | ×1.25 in RMR, or RMR refused | Prices are in PD. |
| Caliphate (Round City) | 90 / 110 | House of Syed buyback 20 PD. Cults and scholars pay a premium (trade hook). | ×1.0 | RMR is the daily money. |
| KLB | 85 / 120 | 1,600 / 2,400 | ×1.0 | Old unstamped Ringgit taken at par by ghoul vendors. |

### 4.3 Inflation as a GM-moved market multiplier

**The rule.** RMR price = `value × market multiplier × regional level`. The multiplier
starts at **1.0**. PD and Dinar prices (value ÷ 100 and value ÷ 2,000) **never move**,
so the RMR cost of 1 PD is 100 × the multiplier. The GM moves the multiplier. A
suggested weekly roll:

| 1d10 | Multiplier change | What players see |
|---|---|---|
| 1–4 | none | "Prices holding." |
| 5–8 | +0.05 | "Water's up two RMR a bottle again." |
| 9 | +0.10 | Vendors re-mark their stock. |
| 10 | **+0.20, a shock week** | The spread widens to ±15%. Vendors sell T2+ goods and meds only for hard currency or barter. |

The expected drift is about +5% a week, or +20–25% a month. That is the onset of
hyperinflation (the classic threshold is 50% a month). A doubled-step "full
hyperinflation" row is available for story beats.

| Vendor behaviour | Rule |
|---|---|
| Sticky prices | Vendors re-price only when the multiplier moves. |
| Hard-currency discount | −10% when paying in PD or Dinar. Vendors pay players in RMR, or in PD at an extra −10%. |
| Rewards lag | A job quoted in RMR pays the same *number* on completion. A Speech check (Kind of Tricky) gets the fee in PD instead. |
| Savings | RMR loses about 20% a month in purchasing power. PD and Dinar lose nothing. |

### 4.4 Counterfeits and unstamped notes (no Bond Slips)

| Item | Worth | Mechanic |
|---|---|---|
| `rmr_unstamped`, "Old Ringgit" | 0.5 RMR (Federation), 0.4 (Bursa), 1.0 (KLB and ghoul markets) | Vault: only validated notes carry full value |
| `rmr_suspect`, "Ringgit (unverified)" | 0 if caught, 0.3 at the Bursa | The vendor makes an Instinct or PER check. If caught, the note is refused and reputation with the town drops by 5. |
| An active counterfeit ring | — | Regional price level +0.1, vendors inspect notes (−10 Speech), and the next weekly roll counts as at least a 9 |

---

## 5. Barter (proposal: no shop yet)

| Speech | 0–24 | 25–49 | 50–74 | 75–99 | 100+ |
|---|---|---|---|---|---|
| Buy × | 1.25 | 1.20 | 1.15 | 1.10 | 1.05 |
| Sell × | 0.45 | 0.50 | 0.55 | 0.60 | 0.65 |

- CHA ≤ 3 adds +0.05 to buy. CHA ≥ 8 takes 0.05 off.
- **Hard limits: buy ≥ 1.05, sell ≤ 0.65.** At those limits, buying inputs, crafting
  (up to 1.5× the input value) and selling returns 1.5 × 0.65 / 1.05 = 0.93, so the
  loop always loses money.
- `price = round(value × conditionMult × multiplier × region × mult, to 5 RMR)`.

Worked example: a Speech 13 PC buys a Stimpak for 750 × 1.25 = **940 RMR** (or **8.4
PD** with the hard-currency discount). They sell a 10mm Pistol at 5 marks for 1,100 ×
0.5 × 0.45 = **245 RMR**.

**Reputation (six tiers, Antipathy removed)**

| Tier | Slider | Buy | Sell | Other |
|---|---|---|---|---|
| Idolized | 70+ | −0.15 | +0.10 | Hidden stock. Sells T2+ goods for RMR even in shock weeks. |
| Liked | 40–69 | −0.10 | +0.05 | Uses the official exchange rate |
| Accepted | 15–39 | −0.05 | 0 | — |
| Neutral | −14 to 14 | 0 | 0 | — |
| Hated | −15 to −49 | +0.20 | −0.10 | May refuse to trade |
| Vilified | −50 or less | refuses | — | Black market only |

---

## 6. Combat: enemy tiers (**RULED** targets)

### 6.1 Method and assumptions

- **Party:** four 40-point humans. Two gunners (tagged Small Guns 41) and two
  melee/pistol characters (35, MD 3). Main skill +20 per level. HP follows the Phase 0
  formula.
- **Gear by level:** Ramshackle armor at levels 1–2, Leather at 3–4, Mercenary at 5–6,
  Malayan Infantry at 7. Weapons: 10mm, Hunting Rifle and Machete (level 1–2);
  Assault Rifle, Combat Shotgun and Sledgehammer (3–4); Battle Rifle, Riot Shotgun and
  Super Sledge (5–6); Sniper and Battle Rifle (7).
- **Assumed away:** PC gear is pristine, and nobody uses stimpaks, cover, stances or
  aimed shots.
- **Win** means every enemy goes down before every PC does, within 60 rounds. Enemy
  HP is varied ±30% (the bestiary rule). 4,000 fights per line.
- **The simulation is harsher than a real table.** Real players have tactics and
  stimpaks, so the table will run a little easier than these numbers.
- **Humanoid NPCs** are built like PCs. HP = `15 + ST + 2×EN + (NPC level − 1) × (3 +
  EN/2)`, from a generic 40-point SPECIAL (Grunt 6/6/6/5/5/6/6, Soldier 6/7/6/4/5/6/6,
  Elite AG 8 LK 7). AC = AG + their armor. DT/DR = their armor. **Training is their
  hit %**, which is the faction's character.

### 6.2 Tiers, target level and standard group size

| Tier | Target party level | Target win rate | Standard group vs 4 PCs | Contents |
|---|---|---|---|---|
| **T5** Pests | 1 | 85% | 6 rats or ants, 5 soldier ants, 4 of anything else | giant_rat, giant_ant, soldier_ant, lesser_panguling, liberator_robot_mk1 |
| **T4** Low humanoids and larger creatures | 2 | 85% | 4 (5 feral ghouls). Boss: 1 Rat King + 3 rats | raider, labourer, feral_ghoul (NEW), monyet_sakai, panguling, ibu_sakai, liberator_robot_follower, rat_king |
| **T3** Regulars, gangs, Gergasi | 3–4 | 80% | 4 | ucl_regular, supermutant_labourer, federation_regular (NEW), rakan_watch_enforcer (NEW), raider_veteran (NEW), mercenary (NEW) |
| **T2** Protectorate regulars (T2.5), Federation heavies | 5–6 | 75% | 4 Protectorate (they fight in numbers), 3 heavies. Turret: 1 turret + 2 Protectorate. | protectorate_infantry, federation_heavy (NEW), automated_turret |
| **T1** Elites | 7+ | about 55% (a hard fight) | 2 | federation_commando (NEW), protectorate_power_armor (NEW), pahlawan (NEW) |

**Encounter-size warning (NEW finding).** The "−1 / +1" columns in §6.4 show that
**one enemy more or fewer moves the win rate far more than any stat change** (for
example raider ×3 = 99%, ×4 = 84%, ×5 = 33%). This is the Lanchester effect: extra
attackers multiply damage and also soak the party's attacks. Table rule: **every enemy
above the standard group is roughly a tier jump.** Either hold the group size, or swap
in a weaker type to add bodies.

### 6.3 Proposed stat lines

Changes from the current bestiary are in **bold**. An NPC level applies only to
humanoids.

| Tier | Entry | NPC level | HP | AC | DT/DR | Hit | Attack | Character |
|---|---|---|---|---|---|---|---|---|
| T5 | giant_rat | — | **14** | 5 | 0/0 | 75 | Bite **1d6+4** | Dog-sized. Only dangerous in a pack. |
| T5 | giant_ant | — | 15 | 2 | 0/0 | 60 | Mandibles **2d6+3** | |
| T5 | soldier_ant | — | 25 | 5 | 1/10 | 70 | Mandibles **1d8+2** | |
| T5 | lesser_panguling | — | 20 | **12** | **2/0** | 80 | Roll 2d6 | It was AC 15 and DT 4, which made it nearly immune to level-1 guns. |
| T5 | liberator_robot_mk1 | — | 25 | **14** | 2/20 | 70 | Claw **1d4+3** | |
| T4 | raider | L2 Grunt | **39** | **13** (Ramshackle, 2 marks) | **2/23** | **70** | **1d8+3** (9mm) | Worn gear, as the ruling allows |
| T4 | labourer | L4 Grunt | **51** | **6** | **0/5** | **60** | **Sledgehammer 2d6+4** | Only fights when forced, but hits hard when it does |
| T4 | feral_ghoul **(NEW)** | — | 30 | 8 | 0/0 | 65 | Claw 1d6+8 | Group of 5 |
| T4 | monyet_sakai | — | 40 | 15 | 1/25 | 75 | Swipe **1d6+4** | |
| T4 | panguling | — | 30 | **16** | **4/20** | **85** | Roll **2d4+1** | Was 2d8. That killed a level-2 party in 99% of fights. |
| T4 | ibu_sakai | — | **40** | **16** | **2/30** | 70 | Claw **1d4+4** | |
| T4 | liberator_robot_follower | — | 30 | 15 | 3/25 | **78** | Claw **1d4+5** | |
| T4 boss | rat_king | — | **36** | 14 | 4/25 | 90 | Claw **2d6+2**, 2 attacks a turn | With 3 giant rats |
| T3 | ucl_regular | L4 Soldier | **51** | **20** (UCL Soldier Armor, 2 marks) | **2/23** | **80** | Assault Rifle **2d6+4** | Basic training, drilled teamwork |
| T3 | federation_regular **(NEW)** | L5 Soldier | 57 | 19 (Malayan Infantry, 3 marks) | 3/30 | **65** | Hunting Rifle 2d8+2 | **Poor regulars** (RULED) |
| T3 | rakan_watch_enforcer **(NEW)** | L4 Grunt | 51 | 26 (Combat Leather Jacket) | 2/30 | 75 | 10mm-class 2d6+3 | Gang. Rank-and-file in the 1414 Windbreaker use raider stats. |
| T3 | raider_veteran **(NEW)** | L3 Grunt | 45 | 21 (Leather) | 2/25 | 75 | Combat Shotgun 2d8+4 | "Well-equipped raiders" |
| T3 | mercenary **(NEW)** | L3 Soldier | 45 | 18 (Mercenary) | 3/25 | 85 | Assault Rifle 2d6+4 | |
| T3 | supermutant_labourer | L2 Gergasi (ST 9, EN 8) | **50** | 5 | **1/35** (+10% Gergasi DR) | **78** | Sledgehammer **2d6+7** | |
| T2 | protectorate_infantry | L10 Soldier | **87** | **26** (Protectorate Infantry Armor, **pristine**) | **4/35** | **65** | **Laser rifle 2d10+6**. Mortar 2d10+17 (1-turn setup). Grenade 2d8+9. | **Best gear, poor training** (RULED). Tough and numerous, but they miss. |
| T2 | federation_heavy **(NEW)** | L9 Soldier | 81 | 26 (Frontliner) | 7/45 | 80 | LMG 2d8+6 (burst) | |
| T2 | automated_turret | — | **130** | 28 | 5/40 | 75 | Heavy Fire 2d8+15 | Support piece. Pair it with a squad. |
| T1 | federation_commando **(NEW)** | L15 Elite | 133 | 28 | 7/45 | **110** | 3d10+8 | **Solid elite commandos** (RULED) |
| T1 | protectorate_power_armor **(NEW)** | L19 Soldier | 141 | 31 (full T1 power armor) | 10/50 | **70** | Plasma 4d8+10 | **Top gear, still poor training** |
| T1 | pahlawan **(NEW)** | L14 Elite | 126 | 28 (Caliphate armor) | 6/40 | **120** | 3d10+10 | **The best-trained soldiers on the Peninsula** (RULED) |

### 6.4 Simulation results by tier (win % / rounds / PCs downed per win; −1 and +1 are one enemy fewer or more)

| Tier | Encounter | vs party level | Target | **Win** | Rounds | Downed | −1 | +1 |
|---|---|---|---|---|---|---|---|---|
| T5 | 6 giant rats | 1 | 85 | **87%** | 9.7 | 0.43 | 98% | 63% |
| T5 | 6 giant ants | 1 | 85 | **82%** | 9.5 | 0.57 | 96% | 55% |
| T5 | 5 soldier ants | 1 | 85 | **83%** | — | — | 98% | 45% |
| T5 | 4 lesser pangulings | 1 | 85 | **86%** | 12.5 | 0.44 | 99% | 49% |
| T5 | 4 Liberator Mk1s | 1 | 85 | **85%** | 19.0 | 0.49 | 99% | 44% |
| T4 | 4 raiders | 2 | 85 | **84%** | 16.8 | 0.60 | 99% | 33% |
| T4 | 4 labourers | 2 | 85 | **87%** | 12.7 | 0.61 | 99% | 42% |
| T4 | 5 feral ghouls | 2 | 85 | **83%** | 10.2 | 0.64 | 98% | 43% |
| T4 | 4 monyet sakai | 2 | 85 | **86%** | 16.0 | 0.55 | 100% | 35% |
| T4 | 4 pangulings | 2 | 85 | **83%** | — | — | 99% | 34% |
| T4 | 4 ibu sakai | 2 | 85 | **83%** | 19.6 | 0.59 | 99% | 35% |
| T4 | 4 Liberator Followers | 2 | 85 | **80%** | — | — | 99% | 28% |
| T4 | Rat King + 3 giant rats | 2 | 85 | **85%** | 8.1 | 0.42 | — | — |
| T3 | 4 UCL regulars | 3 | 80 | **81%** | 12.9 | 0.74 | 100% | 25% |
| T3 | 4 Federation regulars | 3 | 80 | **80%** | 16.8 | 0.75 | 99% | 25% |
| T3 | 4 Rakan Watch enforcers | 3 | 80 | **80%** | 15.2 | 0.70 | 100% | 26% |
| T3 | 4 raider veterans | 3 | 80 | **78%** | 11.9 | 0.77 | 99% | 27% |
| T3 | 4 mercenaries | 3 | 80 | **77%** | 12.3 | 0.79 | 100% | 21% |
| T3 | 4 Gergasi labourers | 3 | 80 | **80%** | — | — | 99% | 20% |
| T2 | 4 Protectorate infantry | 5 | 75 | **75%** | 14.4 | 0.94 | 99% | 17% |
| T2 | 3 Federation heavies | 5 | 75 | **78%** | 15.0 | 0.85 | 100% | 12% |
| T2 | 1 turret + 2 Protectorate | 5 | 75 | **77%** | 13.3 | 0.85 | — | — |
| T1 | 2 Federation commandos | 7 | ~55 | **55%** | 12.2 | 1.14 | 100% | 2% |
| T1 | 2 Protectorate power armor | 7 | ~55 | **55%** | 17.7 | 1.00 | 100% | 3% |
| T1 | 2 Pahlawans | 7 | ~55 | **58%** | 10.1 | 1.17 | 100% | 2% |

A dash means that line came from a later re-tune run that only recorded the win rate.
For comparison, the current bestiary at the same levels and group sizes:

| Encounter | Win today |
|---|---|
| 4 rats | 100% |
| 4 raiders (level 1) | 1% |
| 4 pangulings (level 1) | 1% |
| 4 UCL regulars | 93% |
| 3 Protectorate infantry (level 5) | 100% |
| Turret alone (level 7) | 100% |

### 6.5 Other combat notes and bugs

| Item | Tag | Note |
|---|---|---|
| Protectorate mortar | CHANGE | 2d12+60 → 2d10+17, and the one-turn setup is enforced |
| Homemade Pistol / PVC Pipe Gun | CHANGE | 1d6+2 / 1d4+1 |
| Level 5 and up | Note | PC main-skill hit reaches the 95% ceiling. From T2 upward, balance comes from HP, DT and enemy hit, not AC. |
| Bestiary text | Flag | ibu_sakai, monyet_sakai and liberator_robot_follower carry each other's descriptions (copy-paste from the manual; their own notes already say so) |
| Burst fire | **BUG** | `burst_capable` vs `burst_shots`. None of the 8 weapons can burst. |
| Head armor | **BUG** | Only `body` is read. The slot stays shared with Glasses (RULED). |
| Gergasi +10% DR | **BUG** | Never applied. The Gergasi labourer line above already includes it. |
| Crit chance | Minor BUG | Reads raw base LK |

---

## 7. Traits, perks and skill books

### 7.1 Traits and perks

| Entry | Proposal |
|---|---|
| Heavy Handed | **RULED:** the +300% crit entry becomes ×3 and Artery does 15 true damage. The +4 melee damage works. The crit penalty is a BUG (never read). |
| Short-Sighted | Keep. The shared head slot is part of its cost (RULED). |
| Faster Healing / Rad Child / Cancerous Growth | **CHANGE** (proposal): the bonus becomes flat HP per hour after the EN cap, with ranks. Rad Child: Ghoul-only, and only while rads > 0. Healing on every clock advance stays (RULED). |
| Triad Ties | Lim-affiliated vendors: buy −0.10, sell +0.05. At character creation, −10 on one rival faction's reputation slider (still Neutral, but one bad deed from Hated). |
| Water Sense | +20 Survival to find water. Dirty Water contamination 20% → 10%. |
| Border Rat | +15 Speech with smugglers and the Bursa, −15 with Federation officials. Bursa spread ±5% for this character. |
| Feral Blood | +1 STR. Feral checks start at 500 rads instead of 600. |
| Armor `modifiers` | **BUG:** never applied |

### 7.2 Skill books (**RULED**: +5 skill points, own copy, reading takes time)

| Question | Proposal |
|---|---|
| Effect | +5 skill points into the book's skill (+10% tagged, +5% untagged). The book is consumed by its reader and **cannot be shared** (RULED). |
| Read time | **2 hours per book** on the shared party clock (`advanceTime(120)`, not a rest). Every PC pays −6 thirst, −4 hunger and −3 sleep, and gets 2 natural-healing rolls. Three PCs each reading their own book is three separate 2-hour advances. The shared clock makes that the real cost. |
| During a rest | A rest of at least 2 hours can include reading, but the reader gets no sleep recovery for those 2 hours. |
| Value | Keep the authored values ×10: **1,450–2,500 RMR** (15–25 PD) |

---

## 8. Survival and crafting (RMR)

### 8.1 Cost of staying fed

| Need | Cheapest clean options | RMR per point | RMR per day |
|---|---|---|---|
| Thirst, 72 per day | Soyabean Milk 80, Purified Water 150, Winter Melon 120 | 4–5 | about **300** |
| Thirst, using Dirty Water 30 (per 25 thirst) | about a 49% chance a day of at least one contamination | 1.2 | 90 |
| Hunger, 48 per day | Cicak 60, Instant Mee 80, Can of Food 100 | 3–3.3 | about **160** |
| **Per PC per day** | | | **about 450 RMR (4.5 PD)** |

- **Job rewards at level 1:** 500–1,500 RMR, or 5–15 PD. PD protects the players from
  the multiplier.
- **Boil & Strain (NEW recipe):** 2 Dirty Water + 1 Chemicals → 1 Purified Water
  (1.36×).

### 8.2 Healing value

| Item | Average HP | RMR per HP |
|---|---|---|
| Healing Poultice | 10.5 | 38 |
| Stimpak | 15.5 | 48 |
| Doctor's Bag | 21 | 62 |
| Med Kit | 5.5 | 100 → **55 at the proposed value of 300 (CHANGE)** |

### 8.3 Recipes and junk

- All 25 recipes pass the 1.5× rule. The ×10 doesn't change any ratio.
- **Studded Leather** inputs → 8 Cloth + 10 Scrap + 6 Adhesive (1.39×).
- **Med Kit** inputs → 3 Chemicals + 3 Organics.
- **CHANGE: 29 junk values now equal the value of their scrap yield** (the money
  printer):

| Junk | New value (RMR) |
|---|---|
| Broken Radio Set | 200 |
| Copper Wire Spool | 140 |
| Circuit Board Fragment, Cracked LCD Panel, Dead Car Battery, Jammed Sewing Machine | 120 |
| Broken Streetlamp Fixture | 100 |
| Duct Tape, Broken Pressure Cooker, Empty Kerosene Tin, Rusty Bicycle Chain | 90 |
| Cracked Motorbike Mirror | 80 |
| Rusted Kapcai Carburettor | 70 |
| Moth-Eaten Prayer Mat, ProTiga Factory Scrap, Shredded Tarpaulin, Spoiled Coconut Husk Sack, Tangled Barbed Wire Coil, Warung Signboard | 60 |
| Rubber Sandal Strap, Spool of Fishing Line | 50 |
| All other junk | 40 |
| Bobby Pin | 20 (already correct) |

---

## 9. Questions for the GM

### Resolved

| # | Question | Ruling |
|---|---|---|
| Q1 | Is `value` in RMR? | **RESOLVED:** `value` is the baseline RMR price (vault values ×10). PD = ÷100, Dinar = ÷2,000. |
| Q2 | UCL currency? | **RESOLVED:** none |
| Q3 | Bond Slips? | **RESOLVED:** none |
| Q4 | Crit-fail entries 6/7 and Backfire? | **RESOLVED:** 1d3 marks. Backfire sets Broken. |
| Q5 | Repair: roll or cap? | **RESOLVED:** instant, capped by skill, with a chance to save components |
| Q6 | Heavy Handed reading? | **RESOLVED:** rev. 1's reading stands |
| Q7 | Healing on every clock advance? | **RESOLVED:** it stays |
| Q8 | Separate face slot? | **RESOLVED:** no, the head slot stays shared |
| Q9 | What does the Nail Driver fire? | **RESOLVED:** `nails` ammo |
| Q10 | Humanoid NPCs built like PCs? | **RESOLVED:** yes, balanced per tier (§6) |
| Q11 | Rename the slave entries? | **RESOLVED:** renamed to labourers |
| Q12 | Skill books? | **RESOLVED:** +5 skill points, own copy, read time |
| N1 (rev. 2) | Base value × index, or vault ×10? | **RESOLVED:** vault ×10. Inflation stays as a GM-moved multiplier. |
| N2 (rev. 2) | A new Repair skill? | **RESOLVED:** yes. Repair = 3 × INT (Fallout 2). |
| N3 (rev. 2) | Worn Protectorate gear? | **RESOLVED:** no. Protectorate gear is always maintained; they are balanced through training and numbers. |
| — | Win-rate ceiling | **RESOLVED:** ~85%, with the per-tier targets met in §6.4 |
| — | Skill books shared? | **RESOLVED:** no |

### Still open

| # | Question | Why it needs a call |
|---|---|---|
| O1 | **What counts as a "loss"?** The simulation counts a party wipe (or 60 rounds) as a loss. So "85% against pests" means 15% of standard T5 fights wipe the party, if nobody uses stimpaks or tactics. The alternative is to count "at least one PC downed" as the failure; then at the same stats the clean-win rate is lower. Which one is the target? | It decides whether T5 and T4 creatures should be as dangerous as tuned here. Giant rats now bite for 1d6+4. |
| O2 | **Are the standard group sizes (§6.2) acceptable as a GM rule?** No stat line can keep 80–85% across different group sizes (the ±1 columns). | The alternative is a threat-point encounter budget, which is more complex to run at the table. |
| O3 | **T1 elites need 126–141 HP** (NPC levels 14–19) to be a hard fight for a level-7 party with its 95% hit rate. Is a bullet-sponge elite fine, or should elites get special rules instead (cover, stimpaks, an extra action)? | This is a design choice, not a numbers one. |
| O4 | Should the 10 new bestiary entries (§6.3) be written to the vault by `vault-author`? feral_ghoul, federation_regular, rakan_watch_enforcer, raider_veteran, mercenary, federation_heavy, federation_commando, protectorate_power_armor and pahlawan are proposals only. | They don't exist yet. |
| O5 | Market multiplier: rolled weekly or per session, and can every player see it or only those who check a Bursa board? | This sets how visible the inflation is. |

---

## Appendix A: every weapon and armor piece by tier (values in RMR)

The damage column is the average per roll, with MD not included for melee. Protection
is `AC + 3 × DT + DR/2` (normal damage). Values include the proposed numbers for TBAs
and changes. "/unit" marks a single-use item priced per piece. The note column lists
items outside their tier's band. Big guns, explosives and head pieces are not banded
on damage or protection. Generated by `tiers.mjs`.

| Item | Kind | Tier | Damage / AC, DT/DR | Average damage / protection | Value (RMR) | Note |
|---|---|---|---|---|---|---|
| malayan_frontliner_armor | Armor | T1 | AC 20, 7/45 | 63.5 | 2,550 |  |
| protectorate_heavy_trooper_armor | Armor | T1 | AC 25, 8/45 | 71.5 | 2,850 |  |
| salvaged_power_armor_chestplate | Armor | T1 | proposed AC 22, 6/40 (base_marks 8) | 60 | 3,000 |  |
| salvaged_power_armor_helmet | Armor (head) | T1 | proposed AC 6, 2/15 (base_marks 8) | — | 800 |  |
| 50_cal_machine_gun | Weapon | T1 | 2d8+8 (burst) | 17.0 | 7,650 |  |
| anti_materiel_rifle | Weapon | T1 | 3d10+8 | 24.5 | 5,000 |  |
| deathclaw_gauntlet | Weapon | T1 | 2d8+8+MD | 17.0 | 4,500 |  |
| fat_man | Weapon | T1 | 6d10+20 | 53.0 | 20,000 |  |
| gatling_laser | Weapon | T1 | 1d8+4 (burst) | 8.5 | 4,500 |  |
| gauss_pistol | Weapon | T1 | 3d8+9 | 22.5 | 4,950 |  |
| gauss_rifle | Weapon | T1 | 3d10+18 | 34.5 | 7,600 |  |
| missile_launcher | Weapon | T1 | 4d10+8 | 30.0 | 7,500 |  |
| plasma_caster | Weapon | T1 | 4d8+10 | 28.0 | 6,150 |  |
| plasma_grenade | Weapon | T1 | 4d10+15 | 37.0 | 900 /unit |  |
| plasma_rifle | Weapon | T1 | 3d8+6 | 19.5 | 4,300 |  |
| rocket_launcher | Weapon | T1 | 4d10+5 | 27.0 | 6,750 |  |
| tesla_cannon | Weapon | T1 | 3d10+20 | 36.5 | 8,050 |  |
| protectorate_infantry_armor | Armor | T2 | AC 20, 4/35 | 49.5 | 1,500 |  |
| ucl_vanguard_armor | Armor | T2 | AC 20, 5/40 | 55 | 2,200 |  |
| 14mm_pistol | Weapon | T2 | 2d8+3 | 12.0 | 2,200 |  |
| 223_pistol | Weapon | T2 | 2d8+4 | 13.0 | 2,400 |  |
| battle_rifle | Weapon | T2 | 2d10+6 | 17.0 | 3,300 |  |
| chinese_officers_sword | Weapon | T2 | 1d10+6+MD | 11.5 | 2,500 |  |
| combat_rifle | Weapon | T2 | 2d8+3 | 12.0 | 2,100 |  |
| combat_shotgun | Weapon | T2 | 2d8+4 | 13.0 | 2,000 |  |
| flamer | Weapon | T2 | 2d6+3 | 10.0 | 2,600 |  |
| fractured_laser_rifle | Weapon | T2 | 2d10+6 | 17.0 | 3,750 |  |
| gatling_gun | Weapon | T2 | 1d8+3 (burst) | 7.5 | 3,800 |  |
| grenade_launcher | Weapon | T2 | 2d10+12 | 23.0 | 4,600 |  |
| katana | Weapon | T2 | 2d8+6+MD | 15.0 | 3,000 |  |
| keris | Weapon | T2 | 2d6+4 | 11.0 | 2,500 |  |
| land_mine | Weapon | T2 | 2d10+15 | 26.0 | 550 /unit |  |
| laser_pistol | Weapon | T2 | 2d6+4 | 11.0 | 2,400 |  |
| laser_rifle | Weapon | T2 | 2d10+6 | 17.0 | 3,750 |  |
| light_machine_gun | Weapon | T2 | 1d8+3 (burst) | 7.5 | 3,400 |  |
| minigun | Weapon | T2 | 1d8+3 (burst) | 7.5 | 4,000 |  |
| plasma_pistol | Weapon | T2 | 2d8+4 | 13.0 | 2,850 |  |
| power_fist | Weapon | T2 | 2d6+6+MD | 13.0 | 3,000 |  |
| riot_shotgun | Weapon | T2 | 2d8+4 | 13.0 | 2,100 |  |
| ripper | Weapon | T2 | 2d8+6+MD | 15.0 | 2,800 |  |
| shishkebab | Weapon | T2 | 2d8+6+MD | 15.0 | 2,900 |  |
| sniper_rifle | Weapon | T2 | 2d10+7 | 18.0 | 3,500 |  |
| super_sledge | Weapon | T2 | 2d8+6+MD | 15.0 | 3,200 |  |
| combat_leather_jacket | Armor | T3 | AC 20, 2/30 | 41 | 1,100 |  |
| leather_armor | Armor | T3 | AC 15, 2/25 | 33.5 | 550 |  |
| malayan_infantry_armor | Armor | T3 | AC 15, 3/35 | 41.5 | 1,250 |  |
| mercenary_armor | Armor | T3 | AC 12, 3/25 | 33.5 | 850 |  |
| press_plate_armor_oversized | Armor | T3 | AC 15, 3/30 | 39 | 800 |  |
| rebar_plate_vest | Armor | T3 | AC 12, 3/25 | 33.5 | 650 |  |
| studded_leather_armor | Armor | T3 | AC 20, 3/25 | 41.5 | 750 |  |
| supermutant_clothes | Armor | T3 | AC 10, 3/25 | 31.5 | 600 |  |
| ucl_soldier_armor | Armor | T3 | AC 15, 2/25 | 33.5 | 1,000 |  |
| 10mm_pistol | Weapon | T3 | 2d6+2 | 9.0 | 1,100 |  |
| 10mm_smg | Weapon | T3 | 1d8+2 (burst) | 6.5 | 1,400 | dmg out of band: accept (burst) |
| 44_revolver | Weapon | T3 | 2d6+3 | 10.0 | 1,300 |  |
| assault_rifle | Weapon | T3 | 2d6+4 (burst) | 11.0 | 2,000 |  |
| bowie_knife | Weapon | T3 | 1d8+2+MD | 6.5 | 1,000 |  |
| double_barrel_shotgun | Weapon | T3 | 2d8+2 | 11.0 | 1,600 |  |
| fire_axe | Weapon | T3 | 1d8+2+MD | 6.5 | 900 |  |
| frag_grenade | Weapon | T3 | 2d8+9 | 18.0 | 350 /unit |  |
| hunting_rifle | Weapon | T3 | 2d8+2 | 11.0 | 1,300 |  |
| incendiary_grenade | Weapon | T3 | 2d6+6 | 13.0 | 300 /unit |  |
| lever_action_shotgun | Weapon | T3 | 2d6+3 | 10.0 | 1,500 |  |
| marksman_carbine | Weapon | T3 | 2d6+3 | 10.0 | 1,500 |  |
| pump_action_shotgun | Weapon | T3 | 2d6+4 | 11.0 | 1,550 |  |
| sawed_off_shotgun | Weapon | T3 | 2d6+3 | 10.0 | 1,300 |  |
| sledgehammer | Weapon | T3 | 2d6+3+MD | 10.0 | 1,500 |  |
| tommy_gun | Weapon | T3 | 2d6+3 (burst) | 10.0 | 1,900 |  |
| axe_town_coveralls | Armor | T4 | AC 8, 2/25 | 26.5 | 400 |  |
| ramshackle_armor | Armor | T4 | AC 8, 2/25 | 26.5 | 350 |  |
| rusted_riot_shield_harness | Armor | T4 | AC 10, 4/15 | 29.5 | 500 |  |
| 32_revolver | Weapon | T4 | 1d6+3 | 6.5 | 700 |  |
| 9mm_pistol | Weapon | T4 | 1d8+3 | 7.5 | 900 |  |
| angkasa_wrench | Weapon | T4 | 2d6+2 | 9.0 | 450 | dmg out of band: dmg → 2d4+2 |
| axe_gang_cleaver | Weapon | T4 | 1d10+2 | 7.5 | 1,100 |  |
| baseball_bat | Weapon | T4 | 1d8+MD | 4.5 | 800 |  |
| brass_knuckles | Weapon | T4 | 1d10+MD | 5.5 | 400 |  |
| cleaver | Weapon | T4 | 1d8+MD | 4.5 | 750 |  |
| combat_knife | Weapon | T4 | 1d8+MD | 4.5 | 750 |  |
| corroded_minigun_barrel_club | Weapon | T4 | 2d6+4 | 11.0 | 550 | dmg out of band: dmg → 2d6+1 |
| dynamite | Weapon | T4 | 2d10+8 | 19.0 | 300 /unit |  |
| lim_clan_straight_razor | Weapon | T4 | 1d6+1 | 4.5 | 650 |  |
| machete | Weapon | T4 | 1d8+MD | 4.5 | 850 |  |
| nightstick | Weapon | T4 | 1d8+MD | 4.5 | 650 |  |
| parang | Weapon | T4 | 1d8+1 | 5.5 | 850 |  |
| pneumatic_nail_driver | Weapon | T4 | 1d6+3 | 6.5 | 700 |  |
| salvaged_rebar_greatsword | Weapon | T4 | 2d8 | 9.0 | 600 | dmg out of band: dmg → 2d6+1 |
| switchblade | Weapon | T4 | 1d6+MD | 3.5 | 600 |  |
| tire_iron | Weapon | T4 | 1d8+MD | 4.5 | 700 |  |
| varmint_rifle | Weapon | T4 | 1d6+2 | 5.5 | 600 |  |
| 1414_windbreaker | Armor | T5 | AC 1, 0/5 | 3.5 | 100 |  |
| clothes | Armor | T5 | AC 1, 0/5 | 3.5 | 50 |  |
| ghoul_wrap | Armor | T5 | AC —, — | 0 | 30 |  |
| lim_clan_tailored_suit | Armor | T5 | AC 3, 1/10 | 11 | 1,500 | value out of band: accept (social premium) |
| malayan_officers_uniform | Armor | T5 | AC 2, 1/7 | 8.5 | 250 |  |
| metal_plates | Armor | T5 | AC 2.5, 1/5 | 8 | 150 |  |
| padded_coveralls | Armor | T5 | AC 3, 0/8 | 7 | 80 |  |
| prison_labourer_clothes | Armor | T5 | AC 0, 0/0 | 0 | 10 |  |
| protectorate_officers_uniform | Armor | T5 | AC 3, 1/10 | 11 | 350 | value out of band: accept (social premium) |
| rattan_basket_armor | Armor | T5 | AC 4, 1/10 | 12 | 120 |  |
| reinforced_tarpaulin_wrap | Armor | T5 | AC 5, 1/15 | 15.5 | 250 |  |
| tarp_poncho | Armor | T5 | AC 2, 0/5 | 4.5 | 50 |  |
| ucl_officers_uniform | Armor | T5 | AC 2, 0/7 | 5.5 | 150 |  |
| water_wardens_slicker | Armor | T5 | AC 2, 0/7 | 5.5 | 150 |  |
| factory_respirator | Armor (head) | T5 | AC 1, 0/5 | 3.5 | 300 |  |
| 1414_chain_whip | Weapon | T5 | 1d6+1 | 4.5 | 200 |  |
| bent_rebar_spear | Weapon | T5 | 1d6 | 3.5 | 80 |  |
| boxing_gloves | Weapon | T5 | 1d2+MD | 1.5 | 150 |  |
| cracked_pvc_pipe_gun | Weapon | T5 | 1d4+1 | 3.5 | 120 |  |
| golf_club | Weapon | T5 | 1d6+MD | 3.5 | 250 |  |
| homemade_pistol | Weapon | T5 | 1d6+2 | 5.5 | 500 |  |
| homemade_rifle | Weapon | T5 | 1d8+1 | 5.5 | 550 |  |
| kitchen_knife | Weapon | T5 | 1d6 | 3.5 | 100 |  |
| molotov_cocktail | Weapon | T5 | 1d10+4 | 9.5 | 150 /unit |  |
| nail_board | Weapon | T5 | 1d6+1 | 4.5 | 100 |  |
| pool_cue | Weapon | T5 | 1d4+MD | 2.5 | 200 |  |
| rebar_nail_club | Weapon | T5 | 1d6+2 | 5.5 | 250 |  |
| shovel | Weapon | T5 | 1d6+MD | 3.5 | 200 |  |
| water_pipe_cudgel | Weapon | T5 | 1d6+1 | 4.5 | 200 |  |
