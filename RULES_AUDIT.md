# FOES Terminal — Rules Audit

Comparing the rulebook (`Fallout DND Manual.pdf`, 150 pages), the ground-truth worked
example (`FOES Character Sheet Horse.xlsx`), and the live implementation
(`src/formulas.js`, `src/traits.js`). This document is descriptive only — no code was
changed while producing it.

Page numbers below refer to the PDF's printed page count (as extracted via
`pdftotext`/`pdfinfo`; the deck runs 150 pages total, not 96 as originally guessed).

---

## 1. Manual's stated rules & formulas

### SPECIAL stat effects

| Stat | Manual effect | Page |
|---|---|---|
| Strength | HP base, melee damage, weapon STR requirements (−10% accuracy per point under) | 31 |
| Perception | Effective range bands, ranged hit modifiers | 32 |
| Endurance | HP, healing rate, Limb Resistance, Poison Resistance, Rad Resistance, Implant Limit | 33 |
| Charisma | Speech/social checks (flavor-driven, GM discretion) | 34 |
| Intelligence | Skill points per level | 35 |
| Agility | Base AC, Sequence/Initiative, bonus actions at AG 8/10 | 36 |
| Luck | Critical chance/failure range, loot | 37 |

Character creation: 40 points to allocate, respecting racial min/max; "At all times... your
SPECIAL must equal 40" (p. 29).

**Core vital formulas (explicit):**

- **HP**: `15 + (ST + [2 × EN])` at character creation; **level-up gain** = `3 + ½EN` (rounded
  down) (p. 31, restated in the FORMULAS summary p. 150).
- **Melee Damage**: `ST − 5, minimum 1` (p. 31, restated p. 150).
- **Healing Rate**: roll `1d10`, regain that much HP per hour of rest up to a cap of your EN
  (p. 33, p. 150). No separate numeric "Heal Rate" stat/formula is given beyond "up to your EN."
- **Limb Resistance**: `EN / 2`, rounded down (p. 33, p. 150).
- **Poison Resistance**: `EN × 5` (p. 33).
- **Rad Resistance**: `EN × 2` (p. 33).
- **Implant Limit**: `EN / 3`, rounded down (p. 33).
- **Skill Points per level**: `5 + (IN × 3)` (p. 35, p. 55, p. 150).
- **Base AC**: `= AG` (p. 36).
- **Sequence/Initiative**: `1d20 + AG` (p. 36, p. 150).
- All numeric results are **rounded down** unless stated otherwise (p. 1).

### Skills (all stated as flat SPECIAL-sum formulas; tagging adds +20 and 1 skill point = +2%
instead of +1%; p. 44)

| Skill | Manual formula | Page |
|---|---|---|
| Small Guns | `5 + PE + PE` | 45 |
| Big Guns | `ST + PE + AG` | 45 |
| Energy Weapons | `5 + PE + IN` | 45 |
| Melee Weapons | `ST + AG` | 45 |
| Throwing | `ST×1.5 + AG×0.5` | 45 |
| Unarmed | `ST + AG` | 45 |
| Sneak | `AG + AG` | 46 |
| Steal | `5 + AG + AG` | 46 |
| Lockpick | `5 + PE + AG` | 46 |
| Traps | `PE + AG + IN` | 46 |
| Medicine | `IN + PE` | 47 |
| Science | `5 + IN + IN` | 47 |
| Engineering | `5 + IN×1.5 + AG×0.5` | 47 |
| Robotics | `IN + IN` | 47 |
| Gunsmith | `PE + AG + IN` | 47 |
| Speech | `5 + CH + CH` | 48 |
| Instinct | `(ST+PE+EN+CH+IN+AG+LK) / 3`, rounded down | 48 |
| Survival | `5 + AG + AG` | 48 |

Damage bonuses layered on Melee/Unarmed at 50/100/150/200% skill thresholds (+2/+4/+6/+8
damage, special-move unlocks) are described qualitatively, not as a separate numeric formula
(p. 45).

### Armor Class, sequence, combat math

- Total AC = armor AC + AG (armor section, p. 124); Base natural AC = AG (p. 36).
- Stances modify AC further: Standing = full AG-based AC, Crouching = AC from AG capped at 3,
  Prone = AC from AG capped at 1, Knocked Down = 0 AC (p. 91).
- Hit resolution: roll `2d10` vs. skill, then subtract foe's AC, apply cover/environment/ammo
  modifiers (pp. 81, 91).
- Damage: `(Initial Damage − DT) × DR% = Damage Result` (DR expressed as "times remainder,"
  e.g. DR 30 → ×0.70) (p. 84). Max DR anyone can have is 90% (p. 124).
- Critical chance is driven by Luck (roll within Luck range on the d100 attack roll = crit);
  capped at 50% max (p. 86). Crit success/failure tables are p. 89–90.

### Perks & Traits math

- Traits: up to 2 chosen at creation, each with explicit numeric pros/cons, e.g. Heavy Handed
  "+4 bonus melee damage, but do 25% less critical damage" (p. 40); Gifted "+1 to all SPECIAL
  points but −10% on all skills and 5 less skill points per level" (p. 39); Skilled "+5 skill
  points/level, one-time +10% to skills, perks delayed by 1 extra level" (p. 41). Full trait
  list pp. 38–41; Background Traits p. 42.
- Perks: dozens of named perks with explicit numeric ranks (e.g. Toughness "+10 DR per rank,
  3 ranks", Faster Healing "+2 Healing Rate per rank, 3 ranks", Radiation Resistance "+15% RR
  per rank, 2 ranks"). Full perk tables pp. 58–75.
- **Levels-per-perk is stated inconsistently within the manual itself** (see "topic in flux"
  below).

### Race-specific rules

| Race | Min SPECIAL | Max SPECIAL | Race-specific bonuses | Page |
|---|---|---|---|---|
| Human | all 1 | all 10 | +20 Energy Resistance; no other bonus/penalty | 15 |
| Ghoul | ST1 PE4 EN1 CH1 IN2 AG1 LK**5** | ST8 PE13 EN10 CH10 IN10 AG6 LK12 | 30% PR, 80% RR; radiation ≥600 → roll IN/30min or go feral; ≥1000 → feral; age >100 → extra tag skill | 17 |
| Supermutan (Gergasi) | ST5 PE1 EN4 CH1 IN1 AG1 LK1 | ST13 PE11 EN11 CH7 IN11 AG8 LK10 | +10% DR all; advantage on Intimidation; +3 Max HP/level; unarmed 2d4+MD; may not use 1H weapons (2H usable 1H at −10% hit); can't wear human armor | 18 |
| Half Mutant | ST3 PE1 EN2 CH1 IN1 AG1 LK3 | ST12 PE10 EN11 CH10 IN10 AG10 LK12 | +15% RR/PR; unarmed 2d4+MD; always CH-check + disadvantage on speech/CH with humans (except intimidation) | 19 |
| Robot | ST3 PE1 EN2 CH1 IN1 AG1 LK3 | ST12 PE10 EN11 CH10 IN10 AG10 LK10 | "Increased damage resistance and hardy limbs" (no numeric value given); no perks; must be repaired (not healed) to regain HP; cannot wear armor | 20 |

### Topics clearly "in flux" in the manual

1. **Perk cadence per race contradicts itself.** The per-race description headers (pp. 15–20)
   state: Human = perk every level, Ghoul = every 2 levels, Supermutan = every 3 levels, Half
   Mutant = every 2 levels, Robot = none. But the later "Levels for Perk" table (p. 58) states:
   **Human = 2, Ghoul = 3**, Robot = 0, Super Mutant = 3, Half Mutant = 3. Human and Ghoul (and
   arguably Half Mutant, 2 vs 3) directly conflict between the two statements.
2. **Ghoul feral radiation thresholds are described twice with different numbers.** The Ghoul
   race blurb (p. 17) says "above radiation levels of 600" triggers IN checks and "1000" is
   fully feral. The Radiation table (p. 93) lists debuffs at 100/200/400/600/800/1000 and notes
   "Ghouls roll IN every hour" specifically at the 600 tier — consistent on the numbers, but the
   frequency differs ("every 30 minutes" on p. 17 vs "every hour" on p. 93).
3. **DT/DR damage worked example (p. 84)** computes `(7−5)×0.70 → 2×0.5(from −20 DR)=1`, but the
   arithmetic shown (subtracting the ammo's −20 DR from a 70 DR base to reach "0.5") does not
   self-consistently show its steps (70% → subtracting 20 points of DR should read as 50%, i.e.
   ×0.5, which is what's shown — but the surrounding prose is confusingly worded, suggesting a
   still-being-drafted explanation rather than a settled formula presentation).
4. **Melee/Unarmed skill formula vs. Big Guns formula** — Small Guns, Big Guns, Energy Weapons
   all include a flat "+5", but Melee Weapons and Unarmed do not (`ST + AG`, no "+5"), which is
   inconsistent with the rest of the Combat Skills table (p. 45) and looks like it might be an
   oversight rather than an intentional design choice — flagged for awareness, not asserted as
   an error.

---

## 2. Horse example (spreadsheet ground truth)

`FOES Character Sheet Horse.xlsx`, sheet `u/NotAHorse (Horse) [4]`. The workbook contains **no
live Excel formulas** — every cell is a hard-coded literal value (confirmed via
`openpyxl` with `data_only=False` vs `data_only=True`: formula and cached value are identical
for every populated cell). So this is a manually-computed worked example, not a spreadsheet
that recalculates — its numbers are the "expected output" to reverse-engineer against.

### Inputs (SPECIAL, cell F2:F8)

Race: **Ghoul**. Base allocation (sums to exactly 40, the creation budget):

| Stat | Base | Note in sheet | Effective (after trait) |
|---|---|---|---|
| STR | 3 | — | 3 |
| PER | 8 | "(-2)" | 6 |
| END | 7 | — | 7 |
| CHA | 3 | — | 3 |
| INT | 5 | — | 5 |
| AGI | 6 | "(-1)" | 5 |
| LUK | 8 | — | 8 |

The −2 PE / −1 AG annotations match the "Cursed Horse" background perk text elsewhere on the
sheet ("No crit damage to head/eyes/neck, −2 PE −1 AG. Cannot be removed conventionally").

Traits: **My Way** (+1 tag skill, roll LK on any untagged skill or auto-fail/lose turn, p. 40).
Perks: **Cursed Horse** (background), **Gunslinger +2** (rank 2: +20% hit w/ pistol, p. 71 —
sheet shortens this to "+2").

### Outputs (computed/cached values)

| Stat | Value | Cell |
|---|---|---|
| HP | **50** | B2 |
| AC | **24** | B5 |
| Heal Rate | **13** | B6 |
| Crit Chance | **8** (cell stores 0.08, i.e. 8%) | B4 |
| DT/DR — Normal | 3 / 30 | B8/C8 |
| DT/DR — Laser | 1 / 30 | B9/C9 |
| DT/DR — Fire | 1 / 30 | B10/C10 |
| DT/DR — Plasma | 1 / 30 | B11/C11 |
| DT/DR — Explosive | 1 / 30 | B12/C12 |
| ER (Energy Resist.) | 35 | B13 |
| PR (Poison Resist.) | 35 | D13 |
| RR (Rad Resist.) | 39 | B14 |
| GR (Gas Resist.) | 0 | D14 |
| Melee Damage | shown as "1d4" (text) | C15 — ambiguous, see §4 |

| Skill | Value | Skill | Value |
|---|---|---|---|
| Small Guns | 100 | Lockpick | 41 |
| Big Guns | 19 | Medicine | 15 |
| Energy Weapons | 20 | Traps | 21 |
| Melee | 9 | Science | 15 |
| Unarmed | 9 | Speech | 37 |
| Throwing | 7 | Eng(ineering) | 15 |
| Sneak | 51 | Gunsmith | 47 |
| Steal | 47 | Robotics | 10 |
| Survival | 17 | Instinct | 13 |

### Reverse-engineering the level

The manual's HP formula, applied at face value with **effective** EN = 7:
`15 + (3 + 2×7) = 32` at level 1. Horse's actual HP is 50 — a gap of 18. The manual's level-up
gain is `3 + ½EN (floor)` = `3 + 3 = 6` per level. `18 / 6 = 3` extra levels, i.e. **Horse is
level 4**: `32 + 3×6 = 50`. This matches exactly and is used below as the inferred level for
sanity-checking other level-dependent numbers.

### Zero-point sanity checks (skills where the manual formula reproduces Horse's value with
**zero skill points spent**, i.e. a hard floor/ceiling check independent of tagging ambiguity)

| Skill | Manual formula result | Horse actual | Match? |
|---|---|---|---|
| Melee | `ST+AG` = 3+6 = **9** | 9 | Exact, 0 pts |
| Unarmed | `ST+AG` = 3+6 = **9** | 9 | Exact, 0 pts |
| Throwing | `floor(1.5×3 + 0.5×6)` = **7** | 7 | Exact, 0 pts |
| Science | `5+2×5` = **15** | 15 | Exact, 0 pts |
| Robotics | `2×5` = **10** | 10 | Exact, 0 pts |
| Survival | `5+2×6` = **17** | 17 | Exact, 0 pts |
| AC | `AG(6) + armor AC(18, Protectorate Vet. Armor)` = **24** | 24 | Exact |
| Poison Resist. | `EN×5` = 7×5 = **35** | 35 | Exact (no ghoul +30 added — see §3) |

These are strong, load-bearing data points: since skill points can only ever be *added* on top
of the base formula (never subtracted), any code formula whose "zero-point" base already
*exceeds* Horse's actual trained value is provably wrong. This is used in §3/§4 below to condemn
the code's Science, Engineering, Melee, and Unarmed formulas outright.

---

## 3. Side-by-side comparison table

`str/per/end/cha/int/agi/luk` below refer to **post-modifier** SPECIAL as computed inside
`calculateDerivedStats()`.

| Stat/Skill | Manual formula | Code formula (`src/formulas.js`) | Horse result | Verdict |
|---|---|---|---|---|
| Small Guns | `5+PE+PE` | `5 + per + per` | 100 (w/ points+tag) | **MATCH** |
| Big Guns | `ST+PE+AG` | `str + per + agi` | 19 | **MATCH** |
| Energy Weapons | `5+PE+IN` | `5 + per + int` | 20 | **MATCH** |
| Melee Weapons | `ST+AG` | `20 + 2*(agi+str)` | 9 | **MISMATCH** — code's zero-point base (20+2×8=36) already exceeds Horse's actual 9. Impossible under manual rules. |
| Throwing | `1.5×ST + 0.5×AG` | `Math.floor(1.5*str + 0.5*agi)` | 7 | **MATCH** (exact, incl. rounding) |
| Unarmed | `ST+AG` | `30 + 2*(agi+str)` | 9 | **MISMATCH** — code base (30+2×8=46) exceeds actual 9. Same problem as Melee. |
| Sneak | `AG+AG` | `5 + 3*agi` | 51 | **MISMATCH** — manual has no "+5" or "×3" coefficient for Sneak; code's constant/multiplier don't correspond to any stated rule. |
| Steal | `5+AG+AG` | `5 + agi + agi` | 47 | **MATCH** |
| Lockpick | `5+PE+AG` | `10 + per + agi` | 41 | **MISMATCH** — constant is 10 in code vs. 5 in the manual. |
| Traps | `PE+AG+IN` | `per + agi + int` | 21 | **MATCH** |
| Medicine | `IN+PE` | `int + per` | 15 | **MATCH** |
| Science | `5+IN+IN` | `5 + (4 * int)` | 15 | **MISMATCH** — code base (5+4×5=25) exceeds actual 15. Provably wrong; manual's `5+2×IN=15` is exact. |
| Engineering | `5+1.5×IN+0.5×AG` | `5 + (int*2) + (agi*0.5)` | 15 | **MISMATCH** — code base (5+10+2.5=17.5) exceeds actual 15; manual's `5+7.5+2.5=15` is exact. |
| Robotics | `IN+IN` | `int + int` | 10 | **MATCH** (exact) |
| Gunsmith | `PE+AG+IN` | `per + agi + int` | 47 | **MATCH** |
| Speech | `5+CH+CH` | `5 + cha + cha` | 37 | **MATCH** |
| Instinct | `sum(SPECIAL)/3` floor | `Math.floor(sum(SPECIAL)/3)` | 13 | **MATCH** (formula concept correct; using base-40 sum gives 13 exactly, using post-trait-37 sum gives 12 — 1-pt sensitivity to whether trait penalties apply before this calc) |
| Survival | `5+AG+AG` | `5 + agi + agi` | 17 | **MATCH** (exact) |
| Base AC | `= AG` | `agi + raceDef.ac_bonus` (bonus is 0 for every current race) | 24 (incl. armor) | **MATCH** |
| Sequence | `1d20+AG` | `sequenceBonus = agi` (static bonus only; dice presumably rolled elsewhere) | n/a (formula text only) | **MATCH** (partial — only the static term lives in this function) |
| Melee Damage (mod) | `ST-5, min 1` | `Math.max(1, str - 5)` | ambiguous ("1d4" text in sheet) | **MATCH** |
| HP total | `15+(ST+2EN)` base, `+3+½EN` per level after | `15 + level*hpPerLevel` (flat, no ST/EN in the base term) | 50 (level 4 inferred) | **MISMATCH** — manual formula reproduces 50 exactly (`15+(3+14)=32`, `+3×6=50`); code produces `15+4×6=39` for the same inputs, an 11-point undershoot. |
| HP per level | `3+½EN` floor | `3 + Math.floor(end * 0.5)` | (used above) | **MATCH** |
| Poison Resistance | `EN×5` (Ghoul also "innately 30% PR" per race text) | `end*5 + raceDef.poison_res` (Ghoul +30) | 35 | **MISMATCH** — plain `EN×5=35` matches exactly; code's addition of the race's +30 would give 65, overshooting ground truth by 30. Either the manual's "innate 30%" is not meant to stack additively, or Horse's sheet simply didn't apply it — either way code and the worked example disagree. |
| Rad Resistance | `EN×2` (Ghoul also "innately 80% RR") | `end*2 + raceDef.rad_res` (Ghoul +80) | 39 | **MISMATCH** — neither plain `EN×2=14` nor code's `14+80=94` matches Horse's actual 39. Cannot be fully reconciled from available data (possibly includes perk/armor contributions not visible in this cell dump) — flagged as unresolved rather than conclusively diagnosed. |
| Limb Resistance | `EN/2` floor | *not implemented* | n/a | **MANUAL-ONLY** |
| Implant Limit | `EN/3` floor | `Math.floor(end/3)`; Robot hardcoded to `99` | n/a | **MISMATCH (partial)** — non-robot races match manual exactly; the Robot special-case of `99` has no basis in the manual (which says nothing about robot implant limits). |
| Skill Points/level | `5+3×IN` | `5 + (int * 3)` | n/a | **MATCH** |
| Levels-per-perk | Manual internally inconsistent (see §1) — Human 1 or 2, Ghoul 2 or 3, Half Mutant 2 or 3, Supermutan 3 (both agree), Robot 0 (both agree) | `human:2, ghoul:2, gergasi:3, half_mutant:2, robot:0` | n/a | **MISMATCH / topic in flux** — code doesn't fully match either manual source; it takes the "every-2/3" description for Ghoul/Half Mutant but the *table's* value for Human. |
| Race SPECIAL min/max | See §1 table | `RACE_RULES` per race | n/a | **MATCH except:** Ghoul `luk` min is **1** in code vs. **5** stated in the manual (p. 17). All other races (Human, Supermutan/Gergasi, Half Mutant, Robot) match the manual exactly on every min/max value. |
| Human +20 Energy Resist. | Stated racial bonus (p. 15) | *not implemented* (no ER field anywhere in `RACE_RULES.human`) | n/a | **MANUAL-ONLY** |
| Robot PR/RR | Manual gives **no numeric value** — only "increased damage resistance... come naturally" (p. 20) | `poison_res: 100, rad_res: 100` hardcoded | n/a | **CODE-ONLY** — invented numbers with no textual basis at all. |
| Robot natural DR | Manual implies robots have some innate DR bonus ("increased damage resistance... come naturally") | `damage_res: 0 // Adjustable via Upgrades later` | n/a | **MISMATCH** — code explicitly zeroes out what the manual describes as an inherent trait (code comment concedes this is a placeholder). |

---

## 4. Suspected fabrications

These items in `formulas.js`/`traits.js` have **no clear grounding** in either the manual or the
Horse spreadsheet, and in several cases are *provably* impossible given the ground-truth data
(a zero-point base formula cannot legitimately exceed a trained skill's final value).

1. **`melee_weapons: 20 + (2 * (agi + str))`** — manual says simply `ST+AG`. Horse's actual Melee
   is 9; code's bare formula alone would already be 36+. No conceivable "negative skill points"
   reconciles this. Likely Gemini invented a "20 base + double stat" curve resembling the
   Small-Guns-style formulas but never checked it against Melee's manual entry.
2. **`unarmed: 30 + (2 * (agi + str))`** — same problem as Melee, mirrored with a "30" instead of
   "20" base. Horse's actual Unarmed is 9; code's floor is 46+.
3. **`science: 5 + (4 * int)`** — manual says `5+2×IN`. Code's coefficient is doubled. Horse's
   Science is 15; code's zero-point base is 25 (already impossible).
4. **`engineering: 5 + (int*2) + (agi*0.5)`** — manual says `5+1.5×IN+0.5×AG`. Code rounds IN's
   coefficient up from 1.5 to 2. Horse's Engineering is 15; code's zero-point base is 17.5
   (already impossible).
5. **`sneak: 5 + (3 * agi)`** — manual says plain `AG+AG`. Neither the "+5" nor the "×3" appears
   anywhere in the manual's Sneak entry (p. 46); this looks like a template artifact reused from
   another skill's shape without checking Sneak's actual text.
6. **`lockpick: 10 + per + agi`** — manual says `5+PE+AG` (constant is 5, not 10).
7. **Robot `poison_res: 100, rad_res: 100`** in `RACE_RULES` — the manual gives zero numeric
   resistance values for robots anywhere; these are invented round numbers.
8. **Robot `implantLimit` hardcoded to `99`** — manual's Implant Limit formula (`EN/3`) is never
   said to be waived for robots; `99` is an arbitrary "basically infinite" stand-in with no
   textual support.
9. **`HP total = 15 + level*hpPerLevel`** — replaces the manual's stated base term
   (`15+ST+2EN`) with a flat `15`, silently dropping STR and EN from the character's actual base
   HP. This isn't just a different coefficient, it structurally omits two of the three inputs the
   manual specifies for base HP. Confirmed wrong against Horse's ground-truth HP (50 vs. code's
   39 for the same inputs).
10. **`traits.js` — `heavy_handed` modifier key mismatch**: `traits.js` defines
    `"melee_damage_flat": 4`, but `formulas.js`'s post-calculation step reads
    `traitDef.modifiers.melee_dmg_flat` (different key name — no underscore-abbreviated `dmg`).
    Because of the mismatch, Heavy Handed's melee damage bonus **silently never applies** even
    though the trait exists in the database. Also, the manual states Heavy Handed's downside as
    "25% less critical damage" (p. 40); the code encodes `"crit_chance": -30`, both the wrong
    number (30 vs 25) and arguably the wrong stat (crit *chance* vs crit *damage*).
11. **`getTrait()` fallback** silently returns `{ modifiers: {} }` for any trait/perk ID not in
    `traitDatabase` — and `traitDatabase` currently contains exactly **one** entry
    (`heavy_handed`, itself broken per #10). Every other trait and every single perk in the
    manual (~15 traits, ~70+ perks) is a complete no-op when selected in the app today. This
    isn't a "formula fabrication" so much as the entire Traits/Perks numeric layer being an
    inert stub — see §5.

---

## 5. Manual mechanics not implemented in code at all

Grepped the whole `src/` tree (not just `formulas.js`) for these to confirm absence, not just
absence from the derived-stats function.

| Mechanic | Manual reference | Notes for triage |
|---|---|---|
| **Traits/Perks numeric effects** | pp. 38–75 | `traitDatabase` has 1 stub entry; every trait/perk the character sheet can select currently applies zero mechanical effect (see §4.11). This is the single largest gap — arguably **Core**, since traits/perks are half of character building. |
| **Radiation level & Ghoul feral status** | pp. 17, 93–94 (100/200/400/600/800/1000 rad thresholds, stat debuffs, feral transition) | No radiation tracking or feral-check logic anywhere in `src/`. `RACE_RULES.ghoul.flags.is_radioactive` exists as a flag but nothing reads it to apply the mechanic. **Core** for Ghoul-heavy campaigns (Horse himself is a Ghoul). |
| **Robot repair-instead-of-heal** | p. 20 ("must be repaired to gain hp") | `flags.needs_repairs: true` exists on the Robot race entry but no healing/rest logic anywhere distinguishes repair from normal HP recovery (no HP-recovery logic exists in `src/` at all, robot or otherwise). |
| **Implant limits enforcement** | p. 33 | `implantLimit` is computed but nothing in `controllers.js`/`views.js`/`items.js` checks it against an equipped-implant count. |
| **Healing Rate (1d10/hour, capped at EN)** | pp. 33, 150 | No `healRate`/`healingRate` field or logic anywhere in `src/` (confirmed via grep). Horse's sheet has a "Heal Rate: 13" stat with no obvious formula match — worth resolving with the user before implementing. |
| **Elemental resistances (ER/RR/GR/PR as a full DT/DR system)** | pp. 85, 124–131 | Only `poisonRes`/`radRes` exist in code. Energy/Fire/Plasma/Explosive resistance and per-damage-type DT/DR (as shown on every armor card, e.g. Mercenary Armor "NR 3/25, LR 1/30, FR 1/17...") are absent — this is a large system (armor items, condition marks, DT/DR math) mostly living outside `formulas.js` if at all. |
| **Critical chance/hit resolution** | pp. 86, 89–90 | No `critChance` computation (Luck-based) or crit table logic in `src/`. |
| **Condition marks & repair** | pp. 97–98 | Weapon/armor condition (10 marks, potency loss above 3/7 marks) not modeled. |
| **Exhaustion levels** | p. 92 | 6-tier exhaustion effects (lose small action → death) not modeled. |
| **Human +20 Energy Resistance** | p. 15 | Racial bonus with no equivalent field in `RACE_RULES.human`. |
| **Ghoul age >100 → extra tag skill** | p. 17 | No age-based tag-skill logic. |
| **Stance-based AC modifiers** (Standing/Crouching/Prone/Knocked Down) | p. 91 | `armorClass` in `formulas.js` is a single static value; no stance state machine. |
| **Addiction system (chems)** | pp. 100–102 | EN×2 − addiction-rate roll-under mechanic entirely absent. |
| **Death saves** | p. 92 | 1d20, need 10+ twice of three rolls, not modeled. |
| **Special melee/unarmed moves** (unlocked at 50/75/100/150% skill) | pp. 51–54 | Not modeled; only the flat skill number exists, no move-unlock logic. |

**Suggested triage buckets** (for the user to confirm, not prescribed here): *Core* — Traits/Perks
numeric effects, Radiation/Feral (given Horse is a Ghoul), Healing Rate; *Later* — elemental
resistance/DT-DR system, condition marks, stance AC, exhaustion, death saves; *Cut candidate* —
addiction system, special-move unlock tracking (both high effort, low frequency of use at the
table per the manual's own "this is an alpha, simplified" framing on p. 8).
