# FOES Balance Proposal (rev. 4)

Written by the `balance-auditor` agent.

| Revision | Date | What it applied |
|---|---|---|
| rev. 1 | 2026-09-21 | First proposal |
| rev. 2 | 2026-09-22 | First round of GM rulings |
| rev. 3 | 2026-09-22 | Second round of GM rulings (win-rate ceiling, enemy tiers, faction character, Repair skill, RMR baseline prices, skill books not shared) |
| **rev. 4** | 2026-09-22 | **Movement, cover and stances modelled; T1 special abilities; damage types (§7); the 20-entry bestiary; the inflation multiplier as a GM shop setting** |

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
  | `tier.mjs` | The rev. 3 encounter engine |
  | `tier2.mjs` / `tier3.mjs` | The rev. 4 engine: movement, cover, stances, party makeup, T1 ability hooks |
  | `tune3.mjs`, `newb*.mjs`, `chk.mjs`, `combo.mjs` | Rev. 4 tuning and verification |
  | `t1b.mjs`, `t1c.mjs` | T1 ability win rates |
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
- Inflation is a GM-set multiplier on top of the baseline, adjusted from the shop tab (§4.3).

---

## 1. Summary: what matters most

| # | Tag | Change | Why it matters |
|---|---|---|---|
| 1 | **RULED** + NEW | **Enemy tiers T5 to T1**, each with a target party level and win rate: T5 at level 1 (85%), T4 at level 2 (85%), T3 at level 3 (80%), T2 at level 5 (75%), T1 at level 7 (a hard fight). All 16 current and 20 new or changed bestiary entries are tuned (§6.3, §6.6). | Under the **movement and cover model** (§6.1) every standard encounter lands at 80–86% (T5–T4), 79–81% (T3) or 74–76% (T2). |
| 1a | **NEW finding** | **Rev. 3 ignored movement, cover and stances.** That made melee creatures about 10–15 points too hard and low-level gunfights 3–10 points too easy. The app has **no cover**, and **NPCs crouch without losing AC**. | §6.1 proposes a cover selector, an NPC stance-AC fix, and applying the aimed-shot penalty after the 95% cap. |
| 1b | **NEW** | **T1 elites** have a moderate 77 HP, plus a menu of 9 Fallout-boss abilities with simulated win rates (§6.5) | The GM picks. Packages for about 55% are suggested. |
| 1c | **NEW** | **Damage types (§7).** 14 armors have no non-normal DT/DR, so energy damage ignores them. No monster attack has a type. Proposed: add electrical and EMP, per-family armor fallbacks, faction strengths and weaknesses, and FMJ/JHP/AP ammo. | Makes "Federation lead against Protectorate light" a real choice |
| 2 | **NEW finding** | **Win rate falls off a cliff with encounter size.** One enemy fewer than standard gives 94–100% wins. One more gives 2–63%. | Stats can only hit a target at one group size. The GM has to hold the **standard group sizes** in §6.2. Adding a single enemy is a tier jump. |
| 3 | **RULED** | Faction character: the **Caliphate** has the best-trained elites (Pahlawan, 120% to hit). The **Federation** has poor regulars (65%) and elite commandos (110%). The **Protectorate** has the best gear (AC 26 and 31, pristine armor) but poor training (65–70% to hit), and makes up for it with numbers and toughness. | Protectorate troops no longer wear worn armor. Only raiders do. |
| 4 | **NEW** | Durability shape: `condition = { inv: { itemId: [marks…] }, worn: { slot: marks } }`. `inventory` stays `{itemId: qty}`. | Unchanged from rev. 2 (§2.1). |
| 5 | **RULED** | Linear wear from the first mark: weapon damage ×(1 − 0.05 × marks), −1 to hit per mark, armor potency ×(1 − 0.05 × marks), and 10 marks = Broken. | Unchanged from rev. 2 (§2.2). |
| 6 | **RULED** | **The Repair skill (3 × INT, the Fallout 2 formula)** governs repair. The floor is `6 − floor(Repair / 20)`. There is a chance not to use up components: 10% at Repair 60, 20% at 80, **30% at 100 (the cap)**. | The arbitrage guard still holds after the ×10 price change (§2.5). |
| 7 | **RULED** | 1 PD = 100 RMR and 1 Dinar = 2,000 RMR. Inflation is a **GM-set market multiplier** on RMR prices, adjusted in the shop tab. PD and Dinar prices don't move. | §4 |
| 8 | **NEW** | Five item tiers (T5 Homemade to T1 Pre-War) with bands per tier, and all 119 weapons and armor pieces placed (Appendix A, now in RMR). | §3 |
| 9 | **CHANGE** | Junk values = the value of their scrap yield, which removes the money printer. The barter limits stay at buy ≥ 1.05 and sell ≤ 0.65. | §5, §9 |
| 10 | **RULED** | Skill books: each character reads their **own copy** (+5 skill points, 2 hours on the shared clock per book). Nails: 10 RMR each. The Nail Driver is 700 RMR. | §8.2, §3.3 |

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

### 4.3 Inflation: a GM-set market multiplier (shop tab)

**The rule.** RMR price = `value × market multiplier × regional level`.
- The **market multiplier is a number the GM sets in the shop tab.** It starts at
  **1.00**, and the GM raises it when the story says so.
- PD and Dinar prices (value ÷ 100 and value ÷ 2,000) **never move**, so the shop
  shows 1 PD = 100 × the multiplier in RMR.
- The app should store it as one field (for example `economy.rmr_multiplier`), shown
  to the GM in the shop tab with + and − 0.05 steps and a free-entry box. Players see
  the prices, not the number, unless the GM chooses to post a Bursa sheet.

**Suggested pacing (a GM aid only, not an automatic roll).** Early hyperinflation is
about +5% a week, or +20–25% a month. The classic threshold for hyperinflation is 50%
a month. If the GM wants a random nudge, this optional weekly roll gives that average:

| 1d10 (optional) | Change | What players see |
|---|---|---|
| 1–4 | none | "Prices holding." |
| 5–8 | +0.05 | "Water's up two RMR a bottle again." |
| 9 | +0.10 | Vendors re-mark their stock. |
| 10 | +0.20, a shock week | The spread widens to ±15%. T2+ goods and meds sell only for hard currency or barter. |

**Story beats that justify a GM bump:** a counterfeit ring exposed (+0.10), a
Federation crisis (+0.20), a bunker failure (+0.30), or a Protectorate trade embargo
(PD premium +0.10).

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
| An active counterfeit ring | — | Regional price level +0.1, vendors inspect notes (−10 Speech), and the GM should bump the multiplier (+0.10) |

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

## 6. Combat: enemy tiers (**RULED** targets), with movement and cover modelled

### 6.1 What the app actually does, and what the simulation now models

| Mechanic | In the app today (`combat.js`, `resolveAttack`) | Manual | Modelled in rev. 4 |
|---|---|---|---|
| **Range** | `stats.range` only decides melee (≤ 1) or ranged. There is no distance and no range penalty. | Range accuracy modifiers are listed among the systems the manual removed (§ intro). Distances are loose: small radius 5–10 m, medium 10–15 m, large 15–20 m. | Not needed: there is no rule to model. |
| **Movement** | Not tracked. The action economy is free-form. | Each turn is Movement + Action + Small action. A move covers a small radius. | **Yes.** A melee combatant facing a ranged line loses **1 turn closing the distance** (2 turns in the ½-cover scenario). |
| **Stances** | Built: crouch gives +10 hit and caps AC from AGI at 3; prone gives +25 hit, caps AC from AGI at 1 and blocks melee. **The AC cap only applies to PCs.** A monster's AC is flat. | The same table (Standing, Crouching, Prone, Knocked Down) | **Yes.** Ranged combatants on both sides crouch. The AC cap is applied to PC-built NPCs, which is a proposed fix (below). |
| **Cover** | **Not implemented.** There is no cover field. | ¼ cover −25, ½ cover −50, ¾ cover −75, full cover −100, as a hit penalty on the attacker | **Yes.** It applies to ranged attacks only. The default is ¼ cover on both sides; a ½-cover scenario is also run. |
| **Aimed shots** | Built (`BODY_PARTS`): Head −20 hit for 1.5× damage, and others | — | Not simulated. The bias is discussed below. |

**Proposed fixes (NEW).**
1. Add a **cover selector** to the action panel, the same way the body-part selector works. It applies the manual's −25 / −50 / −75 / −100 to *ranged* attacks against that target.
2. Give PC-built NPCs an `agi` field, so that crouching and going prone cap their AC the same way they cap a PC's. **Today an NPC crouches for free**: +10 to hit and no AC loss. That alone makes low-level ranged fights 6–8 points harder for the party than they should be.
3. **Apply the aimed-shot penalty *after* capping hit chance at 95.** At level 5 and above a PC's hit chance is far past the cap, so a −20 head shot costs nothing and adds 50% damage for free.

**The default scenario from now on:** melee combatants lose 1 approach turn, ranged
combatants crouch, ranged exchanges happen in ¼ cover on both sides, and NPC stance
AC is fixed.

**Which way each omission biased rev. 3.** These are the old rev. 3 stat lines, re-run
with movement and cover added.

| Omission in rev. 3 | Effect on the party's win rate | Why |
|---|---|---|
| The approach turn for melee enemies | **+5 to +10** against melee creatures | Two or three free volleys before contact |
| Crouching and firing | **+5** against melee creatures (**+10 to +15** together with the approach turn) | +10 to hit, and the lost AC doesn't matter against enemies that aren't shooting |
| ¼ cover in gunfights, with the app as-is | **−8 to −18** against T3–T4 shooters | Both sides lose 25 hit, but NPCs crouch without losing AC |
| ¼ cover with the NPC stance fix | **−3 to −10** | |
| ½ cover | Depends on who shoots better. Level-2 party vs raiders: **−35**. Level-5 party vs Protectorate: **+20** | A −50 penalty zeroes out the weaker shooter. The Protectorate are poor shots, so heavy cover *helps* the party against them. |
| Aimed shots (not modelled) | Estimated **+5 to +10 at level 5 and up**, about 0 at levels 1–3 | Free head shots above the 95% cap (fix 3 removes this). At low level a −20 penalty costs more than the 1.5× damage gains. |
| Party composition | An **all-ranged party is 6 to 20 points worse** against T3–T2 humanoids and big creatures. A melee-heavy party is about the same as the default. | A ranged party fires into cover. A melee party has no cover penalty once it is in contact. |

**Net effect:** rev. 3 made melee creatures **too hard**, by about 10–15 points. It
also made humanoid gunfights at levels 2–3 slightly **too easy**, by about 3–10 points
with the fix and 8–18 as-is. Every line below is re-tuned under the default scenario.

### 6.2 Tiers, target level and standard group size

| Tier | Party level | Target win rate | Standard group vs 4 PCs |
|---|---|---|---|
| **T5** Pests | 1 | 85% | 6 rats, ants, dogs or small ayam. 5 soldier ants. 4 of anything else. |
| **T4** Low humanoids and larger creatures | 2 | 85% | 4 (5 feral ghouls or Rakan Watch). Boss: Rat King + 3 rats. |
| **T3** Regulars, gangs, Gergasi, big beasts | 3–4 | 80% | 4 humanoids. 2 tenggiling or Construction Protectrons. 1 rhino. Ayam Besar + 2 small ayam. |
| **T2** Protectorate regulars (T2.5), Federation heavies | 5–6 | 75% | 4 Protectorate, 3 heavies, or 1 turret + 2 Protectorate |
| **T1** Elites | 7+ | a hard fight (about 50–60%) | 2, with **special abilities** (§6.5) |

**Encounter size is still the strongest lever.** One enemy more or fewer moves the win
rate by 15–50 points (the −1 / +1 columns). Treat every extra enemy as roughly a tier
jump.

**The ≤ 85% ceiling (RULED).** Under the default scenario every standard encounter
lands at **80–86%** (T5–T4), 79–81% (T3) and 74–76% (T2). Readings of 86% are within
the simulation's noise (±1.5 points). Terrain can still push individual fights above
85%: ½ cover against melee creatures gives 90–95%, and open ground against T4
shooters gives 90–92%. No stat line prevents that. **GM rule of thumb:** when the
terrain clearly favours the party, add one enemy from the tier below, or take away the
cover.

### 6.3 Stat lines (tuned under the default scenario)

Changes since rev. 3 are in **bold**. Humanoids keep PC-built HP. Their hit % is their
training (Protectorate poor, Federation commandos and Pahlawan elite).

| Tier | Entry | HP | AC | DT/DR | Hit | Attack | Group |
|---|---|---|---|---|---|---|---|
| T5 | giant_rat | **23** | 5 | 0/0 | 75 | Bite 1d6+4 | 6 |
| T5 | giant_ant | **22** | 2 | 0/0 | 60 | Mandibles 2d6+3 | 6 |
| T5 | soldier_ant | **33** | 5 | 1/10 | 70 | 1d8+2 | 5 |
| T5 | lesser_panguling | **31** | 12 | 2/0 | 80 | Roll 2d6 | 4 |
| T5 | liberator_robot_mk1 | **36** | 14 | 2/20 | 70 | Claw 1d4+3 | 4 |
| T4 | raider (L2 Grunt) | 39 | 13 (+ `agi: 6`) | 2/23 | **61** | 1d8+3 | 4 |
| T4 | labourer | **66** | 6 | 0/5 | 60 | Sledgehammer 2d6+4 | 4 |
| T4 | monyet_sakai | **52** | 15 | 1/25 | 75 | 1d6+4 | 4 |
| T4 | panguling | **37** | 16 | 4/20 | 85 | Roll 2d4+1 | 4 |
| T4 | ibu_sakai | **48** | 16 | 2/30 | 70 | 1d4+4 | 4 |
| T4 | liberator_robot_follower | **36** | 15 | 3/25 | 78 | 1d4+5 | 4 |
| T4 boss | rat_king | **47** | 14 | 4/25 | 90 | 2d6+2, 2 attacks a turn | + 3 rats |
| T3 | ucl_regular | 51 | 20 | 2/23 | **75** | 2d6+4 | 4 |
| T3 | supermutant_labourer | **62** | 5 | 1/35 | 78 | 2d6+7 | 4 |
| T2 | protectorate_infantry | 87 | 26 (pristine) | 4/35 | 65 | Laser rifle 2d10+6 | 4 |
| T2 | automated_turret | **126** | 28 | 5/40 | 75 | 2d8+15 | + 2 Protectorate |

The new entries are in §6.6.

### 6.4 Results by tier (default scenario, plus sensitivity)

Columns: **Default** win % / Open ground (movement only, no cover, no crouch) / ½
cover (plus a 2-turn approach) / All-ranged party / Melee-heavy party (2 guns, 2
melee) / One enemy fewer / One enemy more. 3,000–4,000 fights per cell.

| Tier | Encounter | Default | Open | ½ cover | Ranged party | Melee party | −1 | +1 |
|---|---|---|---|---|---|---|---|---|
| T5 | 6 giant rats | **86** | 67 | 94 | 88 | 81 | 98 | 53 |
| T5 | 6 giant ants | **86** | 71 | 94 | 87 | 85 | 97 | 56 |
| T5 | 5 soldier ants | **86** | 68 | 92 | 87 | 83 | 99 | 47 |
| T5 | 4 lesser pangulings | **85** | 65 | 91 | 88 | 83 | 99 | 42 |
| T5 | 4 Liberator Mk1 | **85** | 65 | 90 | 87 | 82 | 99 | 44 |
| T5 | 6 vicious dogs (NEW) | **86** | 67 | 92 | 88 | 84 | — | — |
| T5 | 6 small ayam (NEW) | **85** | 68 | 93 | 89 | 83 | — | — |
| T4 | 4 raiders | **86** | 92 | 50 | 86 | 89 | 99 | 44 |
| T4 | 4 raider ghouls (NEW) | **86** | 90 | 52 | 86 | 87 | — | — |
| T4 | 5 Rakan Watch members (NEW) | **84** | 90 | 53 | 84 | 86 | — | — |
| T4 | 4 Raider Protectrons (NEW) | **85** | 92 | 50 | 86 | 85 | — | — |
| T4 | 4 labourers | **85** | 77 | 92 | 85 | 85 | 100 | 33 |
| T4 | 4 monyet sakai | **85** | 69 | 90 | 84 | 81 | 100 | 27 |
| T4 | 4 pangulings | **85** | 74 | 90 | 88 | 85 | 100 | 36 |
| T4 | 4 ibu sakai | **85** | 73 | 91 | 86 | 86 | 100 | 33 |
| T4 | 4 Liberator Followers | **86** | 72 | 92 | 87 | 86 | 100 | 34 |
| T4 | 5 feral ghouls (NEW) | **83** | 71 | 93 | 85 | 83 | — | — |
| T4 | 4 giant centipedes (NEW) | **86** | 73 | 91 | 86 | 86 | — | — |
| T4 | 4 giant vicious dogs (NEW) | **83** | 71 | 93 | 86 | 83 | — | — |
| T4 | Rat King + 3 rats | **85** | 75 | — | — | — | — | — |
| T3 | 4 UCL regulars | **80** | 85 | 74 | 74 | 80 | 99 | 29 |
| T3 | 4 Federation regulars (NEW) | **80** | 81 | 86 | 75 | 78 | 99 | 30 |
| T3 | 4 Rakan enforcers (NEW) | **81** | 85 | 71 | 74 | 82 | 99 | 31 |
| T3 | 4 raider veterans (NEW) | **80** | 83 | 83 | 75 | 80 | 99 | 34 |
| T3 | 4 mercenaries (NEW) | **81** | 85 | 76 | 72 | 83 | 99 | 31 |
| T3 | 4 Gergasi labourers | **79** | 72 | 93 | 66 | 82 | 100 | 19 |
| T3 | 2 Construction Protectrons (NEW) | **81** | 82 | 86 | 63 | 79 | — | — |
| T3 | 2 tenggiling besar (NEW) | **80** | 76 | 86 | 60 | 84 | — | — |
| T3 | 1 Sumatran rhino (NEW) | **81** | 77 | 88 | 65 | 83 | — | — |
| T3 | Ayam Besar + 2 small ayam (NEW) | **80** | 76 | — | — | — | — | — |
| T2 | 4 Protectorate infantry | **74** | 70 | 95 | 69 | 72 | 99 | 20 |
| T2 | 3 Federation heavies (NEW) | **76** | 74 | 85 | 56 | 76 | 100 | 12 |
| T2 | Turret + 2 Protectorate | **76** | 73 | — | — | — | — | — |

**Sensitivity by tier**

| Tier | Default | Open ground | ½ cover | Ranged party | Melee party |
|---|---|---|---|---|---|
| T5 | 85–86 | 65–71 | 90–94 | 87–89 | 81–85 |
| T4 creatures | 83–86 | 69–77 | 90–93 | 84–88 | 81–86 |
| T4 shooters | 84–86 | 90–92 | 50–53 | 84–86 | 85–89 |
| T3 humanoids | 80–81 | 81–85 | 71–86 | 72–75 | 78–83 |
| T3 beasts and robots | 79–81 | 72–82 | 86–93 | 60–66 | 79–84 |
| T2 | 74–76 | 70–74 | 85–95 | 56–69 | 72–76 |

### 6.5 T1 elites: moderate HP plus special abilities (the GM picks)

**Keep T1 HP moderate: 77**, which is the PC formula for a level-7 elite
(35 + 6 × 7). The rev. 3 HP sponges (126–141) are withdrawn.

Base stat lines at HP 77:

| Elite | AC | DT/DR | Hit | Attack |
|---|---|---|---|---|
| Federation Commando | 28 (AG 8) | 7/45 | 110 | 3d10+8 |
| Protectorate Power Armor | 31 | 10/50 | 70 | Plasma 4d8+10 |
| Pahlawan | 28 (AG 8) | 6/40 | 120 | 3d10+10 |

With **no ability**, a level-7 party wins **98–99%** of fights against two of them.
Every figure below is the win rate for 2 elites against a level-7 party, in the
default scenario, over 3,000 fights. It reads **Commando / Power Armor / Pahlawan**.

| # | Ability (Fallout source) | Rule in this app's terms | Suits | Win % |
|---|---|---|---|---|
| 1 | **Relentless** (Frank Horrigan; the manual's AG 8/10 bonus actions) | Takes a second full attack each turn. Optional: the second attack is at −30 hit. | Pahlawan, Commando | 34 / 56 / 34. With the −30 second attack: 63 / 92 / 56 |
| 2 | **Plated hide** (Deathclaw Alpha / Legendary armor) | +4 DT against everything except **Head or Eyes aimed shots**, which ignore the bonus. That teaches players to aim. | Protectorate Power Armor | DT +3: 84 / 83 / 86. DT +4: 65 / 66 / 72. DT +5: 48 / 50 / 51. Aiming players pull these up by an estimated 10–15. |
| 3 | **Mutate** (FO4 legendary enemies) | Once, on falling below half HP: heal 40 and damage +25% for the rest of the fight. The log line "…mutates!" warns the party. | Pahlawan (zeal), Commando (combat stims) | Heal 40: 66 / 80 / 63. Heal to full: 24 / 50 / 21 |
| 4 | **Energy shield** (Sierra Madre holograms; Mothership Zeta) | Absorbs the first N damage it takes each round. EMP (§7) or an Eyes shot drops it for a round. | Protectorate Power Armor | N = 5: 80 / 71 / 86. N = 8: 47 / 37 / 59. N = 15: 8 / 10 / 10 (too strong) |
| 5 | **Self-destruct** (Mr. Gutsy / Sentry Bot) | On death, explodes: 4d10+20 explosive to 2 PCs (an AG check halves it). Crippling both arms before death disarms it, as in FO4 Protectrons. | Protectorate Power Armor, robots, turrets | 3d10+10 alone: 95 / 95 / 96. 4d10+20 with DT +3: 43 / 53 / 46 |
| 6 | **Stun strike** (Zeta stun baton; the Master's psychic assault) | On a hit, 50% chance the target loses their next turn (EN check to resist). | Commando (shock baton), Protectorate (tech) | 50% alone: 92 / 97 / 93. With DT +3: 59 / 74 / 60 |
| 7 | **Last stand** (Legate Lanius / Legion zeal) | The first lethal hit leaves it at 1 HP. | Pahlawan | 98 / 98 / 98 alone, which is flavour only. It's useful as a second ability (with a 15 shield: 6–9%). |
| 8 | **Commander** (Lanius; Enclave officers) | Allies within a medium radius get +10 hit and ignore their first crit-fail. | Federation Commando (as a squad leader) | Not simulated. Pair it with T2 escorts. Estimated −5 to −10 per escort. |
| 9 | **Boss immunity** (every Fallout boss) | Already exists: `is_boss` turns One Shot One Kill into 20 true damage. | All T1 | About 0 alone (instant kills are 0.5% of attacks). Use it on every T1. |

**Suggested packages at about 55% win:**

| Elite | Package | Win % |
|---|---|---|
| Federation Commando | Relentless (second attack at −30) + boss | ≈ 63 |
| Protectorate Power Armor | Plated hide +4 + boss, or Shield 8 + self-destruct | ≈ 55–66 |
| Pahlawan | Relentless + boss | ≈ 34 (hard). With the −30 second attack ≈ 56. |

Levers that **do not work** at level 7 are left out on purpose. Extra AC or cover (+25
to +40) changes nothing, because PC hit chance is already past the 95% cap. A higher
crit chance (25%) gives only 93–97%.

### 6.6 The 20 new and changed bestiary entries

The GM's list was merged with this proposal's. Stats are tuned under the default
scenario at the tier's standard group size (win rates are in §6.4). Rev. 3 counted "10
proposed entries" but listed 9. Rakan Watch Member is added here as the 10th.

**FO4 conversion rule (for the Protectrons)**, one table step:

| FO4 stat | FOES equivalent |
|---|---|
| Health | FOES HP = health ÷ 2.5 |
| DR | DT = DR ÷ 10, DR% = DR ÷ 2 |
| ER | Laser and plasma DT/DR, converted the same way |
| Damage | ÷ 2.5 |

Hit % has no FO4 equivalent, so it is tier-tuned.

- **FO4 Protectron** (fallout.wiki): level 5, 100 health, DR 40, ER 25, laser 22.
- **Utility / Subway tier:** level 14, 190 health, DR 75, ER 50.

The wiki has no separate Construction Protectron row, so the Utility tier is used for
it (confirm).

| # | Entry | Source | Tier | HP | AC | DT/DR normal (other types) | Hit | Attack | Group | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | giant_ant | GM (**exists: adjust**) | T5 | 15 → **22** | 2 | 0/0, fire −25 | 60 | Mandibles 2d6+3 | 6 | Weak to fire (§7) |
| 2 | vicious_dog | GM | T5 | 26 | 8 | 0/0 | 70 | Bite 1d6+3 | 6 | |
| 3 | ayam_berkepala_tiga (small) | GM | T5 | 19 | 10 | 0/0 | 65 | **3 pecks** 1d4+1 | 6 | Three heads, three attacks |
| 4 | ayam_berkepala_tiga (grown) | GM | T3 boss | 129 | 14 | 3/20 | 75 | **3 pecks** 2d8+6 | 1 + 2 small | **Grows** on a GM trigger (for example after 2 rounds, or after eating a downed ally): swap in this stat line at full HP |
| 5 | giant_centipede | GM | T4 | 58 | 12 | 2/10, fire −25 | 70 | Bite 1d8+3 + poison (EN check, or 1d4 a turn for 2 turns) | 4 | Poison not simulated: expect a few points harder |
| 6 | giant_vicious_dog | GM | T4 | 47 | 10 | 1/10 | 75 | Bite 2d6+3 | 4 | |
| 7 | raider_ghoul | GM | T4 | 39 | 13 (`agi: 6`) | 2/23 | 61 | 1d8+3 | 4 | Raider stats. RR 80, PR 30 (ghoul racial) |
| 8 | raider_protectron | GM (FO4 −10%) | T4 | 36 | 10 | 4/18 (laser 2/11), **electrical −50, EMP** | 56 | Laser 1d6+4 (laser) | 4 | Self-destructs when both arms are crippled (FO4) |
| 9 | construction_protectron | GM (FO4 Utility tier) | T3 | 76 | 10 | 8/38 (laser 5/25), **electrical −50, EMP** | 74 | Nail and spike driver 2d6+4 | 2 | Drops `ammo_nails` |
| 10 | tenggiling_besar | GM | T3 | 99 | 18 | 6/30, fire 0/0, plasma 0/0 | 80 | Roll 2d8+4 | 2 | Curl up: +5 AC for a small action. **It is a bigger panguling:** reuse its text or note the relation. |
| 11 | sumatran_rhino | GM | T3 | 144 | 10 | 5/25 | 75 | Gore 3d8+6, **2 attacks a turn** (charge + gore) | 1 | A charge hit forces an AG check or the target is Knocked Down |
| 12 | feral_ghoul | rev. 3 | T4 | 41 | 8 | 0/0 | 65 | Claw 1d6+8 | 5 | Rad immune. Fire weak (−15). |
| 13 | rakan_watch_member | rev. 4 | T4 | 39 | 7 (1414 Windbreaker) | 0/5 | 72 | 9mm 1d8+3 | 5 | The gang's rank and file |
| 14 | rakan_watch_enforcer | rev. 3 | T3 | 51 | 26 (Combat Leather Jacket) | 2/30 | **70** | 2d6+3 | 4 | |
| 15 | federation_regular | rev. 3 | T3 | 57 | 19 | 3/30 (laser 1/10: weak to energy) | **63** | Hunting rifle 2d8+2 | 4 | Poor regulars |
| 16 | raider_veteran | rev. 3 | T3 | 45 | 21 | 2/25 | **69** | Combat shotgun 2d8+4 | 4 | |
| 17 | mercenary | rev. 3 | T3 | 45 | 18 | 3/25 | **77** | Assault rifle 2d6+4 | 4 | |
| 18 | federation_heavy | rev. 3 | T2 | 81 | 26 | 7/45 (Frontliner) | 80 | LMG 2d8+6 (burst) | 3 | |
| 19 | federation_commando | rev. 3 | T1 | **77** | 28 | 7/45 | 110 | 3d10+8 | 2 | Plus abilities from §6.5 |
| 20 | protectorate_power_armor | rev. 3 | T1 | **77** | 31 | 10/50 (laser/plasma 12/60), **EMP** | 70 | Plasma 4d8+10 (plasma) | 2 | Plus abilities. EMP-vulnerable (§7). |
| — | pahlawan | rev. 3 | T1 | **77** | 28 | 6/40 | 120 | 3d10+10 | 2 | The 21st row, kept from rev. 3 |

Unchanged since rev. 3: the Protectorate mortar is 2d10+17 with a one-turn setup, and
the Homemade Pistol and PVC Pipe Gun are 1d6+2 and 1d4+1. These bugs are still open:
burst never fires, head armor is ignored, Gergasi DR is unused, and crit chance reads
raw LK.

---

## 7. Damage types (NEW)

### 7.1 How damage types are used today (audit)

| Area | Finding |
|---|---|
| Weapons | 86 total: normal 66, explosive 7, fire 4, **laser 5, plasma 4**. Of those 9 energy weapons, 8 are `TBA`, so today almost everything deals normal damage. |
| Armor | 33 pieces. **14 have only a normal DT/DR** (for example Rebar Plate Vest, Riot Shield Harness, the Tarp items, Press Plate, the PA helmet). `parseArmorDtdr` skips missing types, so **a laser, fire, plasma or explosive hit ignores those armors completely.** |
| Bestiary attacks | **0 of 50 attacks carry a `damageType`.** `resolveAttack` treats every monster attack as normal, including the turret's *Flame* and *Laser*, the robots' *Laser Fire*, and Protectorate grenades and mortars. |
| Bestiary resistances | `resistances.energy` (robots −50 or −100, Protectorate +30) is **never read** by combat |
| Missing types | The manual has **EMP** ("not damage but a stunning effect… negative EMP means always stunned") and **electric** weapons (Displacer Glove, Pulse Pistol/Rifle). Neither exists in the app. |
| Ammo | The manual's per-ammo AC and DR modifiers, and its FMJ/JHP/AP variants, are **not implemented**. Ammo items have no modifier fields. |
| Race | The Human +20 Energy Resistance (manual) is still unused |

### 7.2 Fallout 2 reference

- **Seven damage types:** Normal, Laser, Fire, Plasma, Electrical, EMP and Explosion.
  Armor lists DT/DR for Normal, Laser, Fire, Plasma and Explode. Critters also carry
  Electrical and EMP values.
- **EMP** only hurts robots and power armor. Everyone else takes no damage.
- **Ammo** changes the target's AC, the target's DR and the damage multiplier. Values
  below are from the fallout.wiki ammunition table.

| FO2 ammo | AC mod | DR mod | Damage |
|---|---|---|---|
| 10mm JHP | 0 | +25% | ×2 |
| 10mm AP | 0 | −25% | ×½ |
| 5mm JHP | 0 | +35% | ×2 |
| 5mm AP | 0 | −35% | ×½ |
| 14mm AP | 0 | −50% | ×½ |
| .223 FMJ | −20% | −20% | ×1 |
| 2mm EC | −30% | −20% | ×3/2 |
| Rocket AP | −15% | −50% | ×1 |

**The lesson from FO2:** because JHP doubles damage while AP halves it, JHP
out-damages AP against almost everything. The FOES version below scales the
multipliers so that each round type has a clear job.

### 7.3 Types FOES should use

| Type | Status | Used by | Rule |
|---|---|---|---|
| normal | keep | Ballistic weapons, melee, most creatures | — |
| laser | keep | Laser weapons. The turret, robot and Protectorate lasers are **re-tagged** as laser. | — |
| plasma | keep | Plasma weapons, Protectorate power armor | — |
| fire | keep | Flamer, Molotov, Incendiary, Shishkebab, turret Flame | A fire hit of 10+ on cloth or leather armor adds **+1 condition mark** |
| explosive | keep | Grenades, launchers, mines, mortar | Marks equal to the first digit of the damage (existing) |
| **electrical** | **NEW** | Displacer Glove, Pulse weapons, Tesla Cannon, shock batons | Its own DT/DR column. **Robots and power armor have negative DR** against it. |
| **EMP** | **NEW** | EMP grenade, Pulse weapons (manual) | **Does no damage to organics.** Robots and power armor take the full hit and must pass an EN check or be **stunned 1 turn** (manual). Also drops an energy shield (§6.5). |
| true | keep | Bear Trap, crit effects | Ignores DT and DR |

**Data changes:**
- Add `damageType` to every bestiary attack.
- Add `dt_dr_electrical` to armor. EMP needs no column: it only works if the target
  has `emp_vulnerable: true`.
- Retire `resistances.energy` and fold it into the per-type DT/DR.

**Fallback for armor missing a type** (fixes the 14 normal-only armors): if
`dt_dr_<type>` is missing, derive it from the normal value using the family rule
below. Never fall back to 0/0.

| Armor family (examples) | Laser | Fire | Plasma | Explosive | Electrical |
|---|---|---|---|---|---|
| Cloth / soft (tarp, coveralls, windbreaker) | 0 / DR−5 | 0 / 0 | 0 / DR÷2 | 0 / DR−5 | 0 / DR+5 |
| Leather / hide (leather, jackets) | 0 / DR−5 | 0 / DR−5 | 0 / DR÷2 | DT−2 / DR−5 | 0 / DR |
| Scrap metal (ramshackle, rebar, riot harness, press plate) | = normal (reflective) | DT−1 / DR÷2 | 0 / DR÷2 | = normal | **0 / −25 (conducts)** |
| Military kevlar (Federation, UCL) | 1 / DR−15 | 1 / DR−10 | 1 / DR−15 | 1 / DR−5 | 0 / DR−10 |
| Protectorate energy-dissipating | **DT+2 / DR+15** | 1 / DR−15 | **DT+1 / DR+15** | 1 / DR−15 | = normal |
| Power armor (T1) | +2 / +15 | +0 / +15 | +1 / +15 | = normal | **0 / −25, plus EMP stun** |

**Typical DT/DR by armor tier and type.** T5–T1 come from the manual's armor table.
The electrical column is new.

| Tier (example) | Normal | Laser | Fire | Plasma | Explosive | Electrical |
|---|---|---|---|---|---|---|
| T5 (Clothes) | 0/5 | 0/0 | 0/0 | 0/0 | 0/0 | 0/10 |
| T4 (Ramshackle) | 2/25 | 0/25 | 0/15 | 0/25 | 1/20 | 0/−25 |
| T3 (Leather) | 2/25 | 0/20 | 0/20 | 0/10 | 0/20 | 0/25 |
| T2 (Protectorate Infantry) | 4/35 | 1/30 → **6/50** proposed | 1/20 | 1/30 → **5/50** | 1/20 | 4/35 |
| T1 (Protectorate Heavy Trooper) | 8/45 | 10/60 | 7/60 | 9/60 | 8/40 | 8/45 |

This gives each faction a signature. The **Protectorate resists energy but is only
average against ballistics**, and the **Federation is the opposite** (Malayan Infantry
laser 1/10). "Federation lead against Protectorate light" is a real tactical choice.

### 7.4 Enemy strengths and weaknesses

| Enemy group | Strong against | Weak against |
|---|---|---|
| Robots (Liberators, Protectrons, turret) | laser (existing 60 DR on the Follower), fire, poison, rad | **electrical (DR −50), EMP (stun)** |
| Insects (ants, centipede) | poison | **fire (DR −25)** |
| Pangulings and tenggiling | normal (high DT) | fire, plasma (0/0) |
| Feral ghouls, raider ghouls | rad (immune), poison 30 | fire (−15) |
| Gergasi | everything +10 DR (racial, fix the bug) | — |
| Protectorate infantry and power armor | laser, plasma | normal ballistic and AP ammo (§7.5). Power armor: EMP and electrical |
| Federation regulars and heavies | normal | laser, plasma |
| Dogs, rhino, ayam, rats | — | nothing special. Plain beasts. |

### 7.5 Ammo variants (NEW, a table-friendly FO2 and manual hybrid)

| Variant | Rule | Value | Best against |
|---|---|---|---|
| FMJ (standard) | — | ×1 | Everything |
| **JHP** | Damage ×1.5, and the target's **DT counts double** | ×1.5 | Unarmored or lightly armored targets: creatures, raiders |
| **AP** | **Ignores DT**, damage ×0.75 | ×2 | High-DT targets: Protectorate, power armor, robots |
| Overcharged cell (energy) | Damage ×1.25. A crit-fail with it adds +1 extra condition mark. | ×2 | Energy weapons in a pinch |

Sources: the manual has "JHP… +40% DT… increased damage" and "AP ignores DT but −40%
damage". FO2 used JHP ×2 / DR +25 and AP ×½ / DR −25. Here AP is set to ×0.75
instead of ×½ so it has a clear job.

**Rule of thumb for the table:** JHP beats FMJ when the **target's DT is under half the
gun's average damage**. AP beats FMJ when the **DT is over a quarter of it**.

Average damage per hit:

| Gun (average) | vs Raider (2/23): FMJ / JHP / AP | vs Protectorate (4/35) | vs Power Armor (10/50) |
|---|---|---|---|
| 10mm Pistol (9) | 5.4 / **7.3** / 5.2 | 3.3 / 3.6 / **4.4** | 0 / 0 / **3.4** |
| Battle Rifle (17) | 11.6 / **16.6** / 9.8 | 8.5 / **11.4** / 8.3 | 3.5 / 2.8 / **6.4** |

**Data.** Variant ammo is a separate item per caliber (for example `ammo_10mm_ap`)
with `ammo_mod: { dmg_mult, dt_mult, ignore_dt }`. The loaded variant is stored next
to the round count: `characters.<id>.ammo_variant.<slot>`. Reloading with a different
variant empties the magazine first.

### 7.6 How damage types interact with durability

- Condition scales every type's DT/DR by the same ×(1 − 0.05 × marks) (§2.2).
- Wear by type:
  - **Explosive:** marks equal to the first digit of the damage (existing).
  - **Fire** on cloth or leather: +1 mark for each hit of 10 or more.
  - **EMP or electrical** on power armor and robot plating: +1d3 marks per hit.
  - **AP ammo:** a crit-fail adds +1 extra mark to the gun (hot loads).
- Repairing energy-dissipating Protectorate armor and power armor needs Pre-War Tech
  (§2.5). This keeps faction gear hard to maintain in the field.

## 8. Traits, perks and skill books

### 8.1 Traits and perks

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

### 8.2 Skill books (**RULED**: +5 skill points, own copy, reading takes time)

| Question | Proposal |
|---|---|
| Effect | +5 skill points into the book's skill (+10% tagged, +5% untagged). The book is consumed by its reader and **cannot be shared** (RULED). |
| Read time | **2 hours per book** on the shared party clock (`advanceTime(120)`, not a rest). Every PC pays −6 thirst, −4 hunger and −3 sleep, and gets 2 natural-healing rolls. Three PCs each reading their own book is three separate 2-hour advances. The shared clock makes that the real cost. |
| During a rest | A rest of at least 2 hours can include reading, but the reader gets no sleep recovery for those 2 hours. |
| Value | Keep the authored values ×10: **1,450–2,500 RMR** (15–25 PD) |

---

## 9. Survival and crafting (RMR)

### 9.1 Cost of staying fed

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

### 9.2 Healing value

| Item | Average HP | RMR per HP |
|---|---|---|
| Healing Poultice | 10.5 | 38 |
| Stimpak | 15.5 | 48 |
| Doctor's Bag | 21 | 62 |
| Med Kit | 5.5 | 100 → **55 at the proposed value of 300 (CHANGE)** |

### 9.3 Recipes and junk

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

## 10. Questions for the GM

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
| O3 (rev. 3) | T1 HP sponges? | **RESOLVED:** no. Moderate HP (77) plus GM-chosen special abilities (§6.5). |
| O5 (rev. 3) | Inflation roll: weekly or per session? | **RESOLVED:** neither. A GM setting in the shop tab (§4.3). |
| — | Win rate ≤ 85% after movement and cover? | **RESOLVED** for standard encounters under the default scenario (§6.2). Terrain can still push single fights higher. |

### Still open

| # | Question | Why it needs a call |
|---|---|---|
| O1 | **What counts as a "loss"?** The simulation counts a party wipe (or 60 rounds) as a loss. So "85% against pests" means 15% of standard T5 fights wipe the party, if nobody uses stimpaks or tactics. The alternative is to count "at least one PC downed" as the failure; then at the same stats the clean-win rate is lower. Which one is the target? | It decides whether T5 and T4 creatures should be as dangerous as tuned here. Giant rats now bite for 1d6+4. |
| O2 | **Are the standard group sizes (§6.2) acceptable as a GM rule?** No stat line can keep 80–85% across different group sizes (the ±1 columns). | The alternative is a threat-point encounter budget, which is more complex to run at the table. |
| O3 | **Which T1 abilities?** Pick from the §6.5 menu. Suggested packages give about 55–65% wins. | GM design call (RULED: the GM writes the special rules) |
| O4 | Confirm the 20 bestiary entries in §6.6 before `vault-author` writes them. In particular: Construction Protectron uses the FO4 Utility-tier numbers (the wiki has no separate row); Tenggiling Besar overlaps the Panguling (a big pangolin); and the Ayam's "grow" trigger needs choosing. | Content decisions |
| O5 | **Add a cover selector** and the **NPC stance-AC fix** to the combat UI (§6.1)? | Without them, table play diverges from the tuned numbers by 5–18 points in gunfights |
| O6 | **Damage types (§7):** adopt electrical and EMP, the armor family fallbacks, and the JHP/AP ammo variants? | Needs `damageType` on monster attacks and a new armor column. Bigger than a number change. |

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
