# FOES Terminal

Companion web app for a Fallout TTRPG set in post-war Malaysia (the Fallout
Eastern Shores campaign). Vanilla JS + Vite, one Firestore document for
all live state. Game content is written in an Obsidian vault and compiled
into `src/*.js` by the sync script.

## Where things live

- **Vault:** `/Users/edge/Library/CloudStorage/GoogleDrive-fallouteasternshores@gmail.com/My Drive/FOES Wiki/FALLOUT_MASTER_ZIPv3`
  (Google Drive, **not** in git).
- **Sync:** `node sync-obsidian.js --once` compiles the vault and exits.
  `npm run sync` is the watcher and never exits — don't run it from a
  script or agent. Every sync also writes `VAULT_INDEX.tsv` (path, id,
  type, name for every vault file).
- **Never hand-edit** `src/items.js`, `traits.js`, `statusEffects.js`,
  `bestiary.js`, `dataLogs.js`, `maps.js`, `quests.js`, `recipes.js`,
  `glossary.js`. They're generated; edit the vault and re-sync.
- **Code:** `src/controllers.js` (actions, Firestore writes), `src/views.js`
  (HTML rendering), `src/formulas.js` (`calculateDerivedStats`),
  `src/main.js` (bindings, render loop).
- **Rulebook:** `reference/manual.txt` — text of the 150-page manual
  (gitignored). `grep` it; don't read it whole. `RULES_AUDIT.md` maps
  its rules to the code.
- **GM's campaign plan:** `reference/org-map.md` — text of the FOES
  Organization Map PDF (gitignored; regenerate from the PDF). Newest
  source for story, NPCs, locations and to-dos.
- **Design records:** `SCOPE_DECISIONS.md` (rulings log), `*_SPEC.md`
  (one per system), `CHANGELOG.md`.

## How content syncs

A vault `.md` file becomes app data when it contains a ```json block
whose `type` is one of: `weapon armor consumable currency accessory ammo
component junk trait perk status_effect monster data_log quest map recipe`.
Ids must be unique across the whole vault — the sync ignores duplicates
and prints `[DUPLICATE ID]`.

Json-less files in `01_World Details`, `02_Factions`, `Locations`,
`Religions`, `Fallout Details`, `Bandawang` become **glossary tooltips**:
the filename is the term, the first sentence is the summary, and
frontmatter `aliases:` add short forms ("Federation", "KLB"). Nothing
under `99_Backend Engine` is ever player-visible — it holds GM secrets.

**GM-only text inside a player-facing note** goes in an Obsidian callout:
`> [!gm]- Secret` then `>`-prefixed lines (`-` folds it). The sync strips
these blocks before anything reaches the app, and warns `[GM LEAK?]` if a
"Secretly…" sentence sits outside one. `People/` (NPC notes) is
player-facing and uses this convention.

## World rules (apply to all writing)

- **Powers:** the Federation of Malaya (bunkers, the Public Citizenship
  Initiative for ghouls — members are "uncles"/"aunties"), the
  Protectorate (capital: Fortress City of Penang; Ivory Tower, Grand
  Architect, Directorate, population scores), the Caliphate (capital:
  Round City / Bandar Bulat; the Chukai Desert is sacred). Kuala Lumpur
  Baru (KLB, "City of the Dead") is the ghoul-filled ruin.
- **Currency:** Reformed Malayan Ringgit (RMR, most common), Caliphate
  Dinar, Protectorate Dollar. Not bottle caps.
- **The Rakan Watch** (once drafted as "1414 Gang" — "1414" now means only the triad); Boss Bob leads it —
  "Ketua Bob" is the same man in Malay.
- **The 1414 Triad** is the main gang (the Lim, Tan and Choo families are
  within it; Red Pole Sam Lim leads it). Never "Lim Clan".
- **Abave** replaces Genting everywhere (Abave Highlands, the Abave
  Buddhist Enclave, the Abave group). Some real names stay by GM choice:
  Sudirman, Harimau Malaya, a passing pre-War mention of Perodua.
- **Dark themes are canon but GM-led:** the labour camp, slavery and
  indentured servitude (the Employment Agency), the Kancil Orphanage's
  child labour. Write them only where the GM's notes ask for it, in the
  GM's framing. Never invent anything about the PCs' own prison and
  labour-camp origin.
- **GM secrets are hinted, never stated** in player-facing text (e.g.
  Bandar Buaya's mayor experimenting on ghouls).
- **The party is low level.** Anything high-tier appears worn, rusted or
  in disrepair. Old power armor turns up as single pieces.
- Tone: Fallout's dark humour through Malaysian life — food, school,
  bureaucracy, peribahasa, Manglish where a character would use it.

## Working conventions

- Firestore state is one doc, `prisoncampaign/alpha_team`; one
  `updateDoc` per user action. Inventory is `{itemId: qty}`.
- All player characters are test dummies — fine to modify while testing,
  but revert test data afterwards.
- Verify UI changes in the preview (`.claude/launch.json`). For raw
  Firestore access in tests, add a temporary `window.__debug*` hook in
  `main.js` and remove it before committing.
- Bulk vault writing goes to the `vault-author` agent
  (`.claude/agents/vault-author.md`); the main session plans the batches,
  runs the sync, reviews, and commits.
- Item icons: `npm run art` (`tools/item-art.mjs`, guide in
  `tools/ITEM_ART.md`). Plain script, no Claude tokens; hard-capped runs.
- Lore and aesthetic checks come from the `lore-keeper` agent (DIRECTION
  before writing, REVIEW after); it writes to `reviews/` and changes
  nothing else.
- Game-math proposals come from the `balance-auditor` agent, which writes
  `BALANCE_PROPOSAL.md` and changes nothing else.
