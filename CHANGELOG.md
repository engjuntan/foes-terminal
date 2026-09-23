# Changelog

## v0.5 — Session One build (2026-09-21)

Everything since the last push to GitHub (January 2026), 59 commits.
Design reasoning for most of it lives in `SCOPE_DECISIONS.md` and the
`*_SPEC.md` files.

### Game math & rules
- Core formulas corrected against the manual (Phase 0).
- Difficulty-class checks: player self-checks and a GM check tool, with dice animation.
- G.O.A.T. Exam hover tooltips for SPECIAL and skills; SPECIAL flavor cards (7 broad descriptors, each with a 1080×1080 image slot).
- Character creation grants starting skill points and shows a live derived-stat preview.
- Perk selection UI and G.O.A.T. review screen.

### Combat
- Combat Module: start/end, initiative, full turn loop, attack resolution, damage, mid-fight adds, HP visibility.
- Aimed (called) shots, ammo tracking, simplified burst fire, reload checks real ammo.
- Critical hit system (applies to NPCs too).
- Stances (crouch/prone/knocked-down limit AC from AGI).
- Status effects: buffs/debuffs, skip-turn, damage-per-turn, authorable ticking.
- GM tools: adjust any combatant's HP with a logged reason; GM unequip.
- Randomised combat-log flavor text.
- Bestiary pipeline populated from the manual, with automatic HP variance.

### Items & inventory
- Inventory stacks; equip/unequip moves real inventory copies; equipment size gating; implant teaser slots.
- Metric carry weight with real weights for all items; backpacks; player-to-player giving.
- Weapons, armor (AC + DT/DR) and consumables numbered and wired in (Batches 1–4).
- Scavenge Tier: 26 low-level-appropriate items — disrepair high-tier gear, old power armor pieces, oversized items, Malaysian Chinese post-apocalyptic food and drink.
- Skill books: 54 (3 per skill), permanent stacking +1 per distinct title.

### Crafting
- 9 components (7 common, 2 rare), 30 junk items, 25 recipes.
- Instant crafting and scrapping at GM-unlocked stations (field kit, weapons bench, armour bench, chem station) via the WORKSHOP tab.

### Time & survival
- Large in-game clock visible to everyone; GM time advance.
- Hunger, thirst, sleep bars (FNV Hardcore baseline, harsher) with tiered penalties and HP drain at zero; radiation gauge.
- Rest button for any player, adjustable hours, broadcasts the cost to the party; HP regen on every time advance (×1.5 and sleep restore on 6h+ rest).
- 3 healing-rate perks.

### World & lore
- Data Logs, Maps, Messages and Quests tabs.
- 28 new found texts (Bandawang, the Peninsula, the Federation, Before the War) — 31 logs total.
- Glossary hover tooltips sourced from the wiki, with alias support (e.g. "Federation", "Bandawang", "KLB").
- "1414 Gang" renamed to The Rakan Watch.
- Character biography and GM notes.

### Specs written, not yet built
- `STATUS_AND_CRIPPLE_SPEC.md` — status section with full provenance; EN/2 limb counters, treated only by Doctor's Bag or Medicine.

### Tooling
- `sync-obsidian.js`: duplicate-ID guard, recipe validation, glossary alias extraction.

## v0.6 — Systems build (2026-09-23)

Everything since v0.5, tested in the app and covered by 57 Vitest specs.

### Systems
- **Status section**: always-visible CONDITION block on the dashboard plus a
  STATUS tab showing where every modifier comes from ("PER 5 → 3, −2
  Dehydrated"), and a player Notes section.
- **GM reroll** of the last resolved roll — combat or check — restoring HP,
  ammo, AP and effects before rolling again.
- **Durability**: 10 condition marks per copy of a weapon or armor, wear from
  crits and hits, instant repair capped by the new Repair skill, condition
  scaling price and scrap yield.
- **Reputation**: six Fallout 2-style tiers per faction plus personal karma,
  GM sliders, and a player tab with art slots for each tier.
- **Cripple system**: limb counters against EN/2, crits crippling outright,
  counters that persist until treated, Doctor's Bag and Medicine routes.
- **Combat**: GM-assigned cover (−25 to −100), NPC stances costing AC, the
  manual's damage types (EMP stuns, poison halved on an Endurance check,
  true damage ignoring armor), and generic 1–3 component scrap.
- **Repair** added as the 19th skill; all 19 are now taggable at creation.
- **People** browsable inside the Data Logs tab, GM-revealed like logs.

### Content
- The GM's Organization Map imported: 23 data logs, 33 People notes, 51 lore
  notes, 20 bestiary entries, quests, items and food.
- Canon corrections throughout: 1414 Triad, Choo Clan, Abave, three
  Bandawang districts, Kelam Sungai, Beruk (was Sakai).
- Image prompts for all 283 items and 68 location shots, written against the
  GM's Visual Standard Bible.

### Tooling
- Vitest with 57 specs; agents build test-first.
- `npm run art` pipeline: prompt sheets, Imgur upload, vault write-back,
  staging in the vault's `Media/New items/`.
- `sync-obsidian.js --once`, `VAULT_INDEX.tsv`, GM-only `[!gm]` callouts.
- Five agent definitions: vault-author, lore-keeper, balance-auditor,
  system-builder, art-runner.
