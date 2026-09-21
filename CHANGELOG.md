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
