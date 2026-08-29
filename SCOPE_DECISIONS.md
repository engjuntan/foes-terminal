# Scope Decisions — Claude Code Session

Running log of decisions made while working with Claude Code, separate from
`DESIGN_NOTES_FROM_GEMINI.md` (which covers the prior Gemini history). Newest
at the bottom. Nothing here is implemented yet — this is scope-locking only.

---

## Implants
- Visible but non-interactive equipment slots — a "coming soon" teaser, not
  a functional system yet.
- Reuses the existing equipment slot UI pattern (Head/Body/L-Hand/R-Hand
  already equip/unequip); implant slots render locked/greyed with a tooltip.
- Actual implant mechanics: not scoped yet, explicitly deferred (consistent
  with the Gemini-era decision to defer implants).

## Dual interface (player vs. GM)
- Already built, not a new feature. Confirmed: `main.js` branches on
  `userRole === 'gm'` into a separate GM screen; player dashboard is
  otherwise a completely different render path.

## Messages tab (new subsystem)
- **Directionality: one-way broadcast.** GM sends to all players or to one
  individual player. Players can read but cannot reply in-app (Discord/text
  covers replies for now — may revisit later).
- Needs: Firestore structure for per-character inbox + broadcast channel,
  GM compose UI, player-side Messages tab.

## Firestore Security (RESOLVED — two-step plan)
- **Immediate**: reconnect using a non-expiring rule scoped to the single
  document this app uses, replacing the expired test-mode timestamp rule:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /prisoncampaign/alpha_team {
        allow read, write: if true;
      }
    }
  }
  ```
  This is explicitly **not** real security — it's obscurity (private URL,
  not indexed) — chosen to unblock building/testing now.
- **Before the campaign is publicized (the planned YouTube video)**: add
  **Firebase Anonymous Authentication** + UID-scoped Firestore rules as
  its own scoped phase. Each login silently gets a real (if anonymous)
  Firebase UID; claiming a passcode tags that character/GM role with the
  claiming UID; rules require `request.auth.uid` to match before allowing
  a write. Keeps the existing passcode UX unchanged, stays on the free
  Spark plan (no billing account needed), closes the real hole (anyone
  bypassing the UI via dev tools to write Firestore directly).
- **Considered, not chosen now**: Firebase App Check (good complementary
  layer against automated/bot abuse, doesn't stop a human using the real
  app's dev tools — worth adding after Anonymous Auth, not instead of it);
  routing writes through a Cloud Functions backend (the most robust
  option, but requires the Blaze billing plan and real backend code —
  scoped as a separate, later effort if the project ever needs it, not
  part of the current roadmap).
- **Cost note**: on the free Spark plan, abuse just gets denied once the
  daily quota is hit (app breaks temporarily) — no surprise bill is
  possible without a Blaze billing account attached. This applies
  regardless of which security option above is chosen.

## Firestore reconnected + Iron Legs created (RESOLVED)
- Reconnected using the non-expiring scoped rule (see Security section
  above). Confirmed live: real data flows, no `permission-denied`.
- Live data at reconnect time: access codes `KONG_ACCESS`, `IRON_ACCESS`,
  `GM_OVERRIDE`, `TEST_ACCESS`; characters `kong`, `test_dummy`.
  `test_dummy`/`TEST_ACCESS` are leftover test data — left alone
  deliberately, not a priority to clean up.
- Found and fixed a real crash: `IRON_ACCESS` pointed to a `linked_char`
  ("iron") that didn't exist as a character yet, and `getRegistrationView`
  had no guard for a missing character (unlike `getPlayerView`, which
  already handled this) — logging in with that code crashed the app
  outright. Fixed to show a graceful in-app error instead.
- Created Iron Legs live via the app's real GM tools (Grant New Access,
  Code `IRON_ACCESS` / Char ID `iron` / Display Name `Iron Legs`) —
  confirmed via `characters.iron.name === "Iron Legs"` and an end-to-end
  login showing "IDENTITY: Iron Legs" on the G.O.A.T. Registration
  screen. Iron Legs and "Iron" are the same character — just the display
  name was wrong before.

## Combat polish round (RESOLVED, from live playtesting feedback)
- **Monster/NPC targeting expanded**: a monster's turn can now target any
  other combatant, including other monsters — chaos, mind control, an
  animal turning on an ally, etc. PC turns still target the opposing
  side only (a player targeting a teammate should go through the GM,
  not be a default UI option). Revisit if PC-on-PC targeting is wanted too.
- **Roll input focus bug (real bug, fixed)**: `setCombatActionField`
  called `window.render()` on every keystroke, which replaces the whole
  screen's HTML and kills focus on whatever's mid-typed — made the roll
  field unusable past one digit. Fixed by not re-rendering for
  live-typed/selected action-panel fields; only explicit actions
  (Resolve Attack, Roll For Me, etc.) trigger a render now.
- **GM unequip**: added to the character's GM modal (Squad Monitor →
  click a card), not combat-specific — equipment is persistent character
  state. A mid-combat "disarm" action would be a different, bigger
  feature if ever wanted.
- **Parked**: randomized flavor text for the combat log (e.g. varied
  hit/miss/damage phrasing instead of the same template every time).
  Explicitly deferred by the user — revisit later, not blocking anything.

## Roster
- Campaign has **4 PCs total**, not 2. Only **Kong** and **Iron Legs** exist
  in the app so far.
- Iron's name is two words — **"Iron Legs"**, not "Iron." Current seed data
  in `controllers.js` only ever produces the display name "IRON" (derived
  from the charId via `charId.toUpperCase()`), so this needs an explicit
  `name` fix once that character object is touched.
- The other 2 PCs don't exist in Firestore/seed data at all yet. Adding
  them is mostly an operational step (GM creates an access code, player
  runs Character Creation) rather than new code — best done once Phase 1
  (character systems) is solid, so they're not created against math that's
  about to change.

## Phase 0 — Math & Data Corrections (RESOLVED)
Manual is source of truth for all game math. The Horse spreadsheet is an
example character, not ground truth — its numbers reflect that specific
character's traits/perks/status effects on top of the base formulas, not
the base formulas themselves.

Final formulas to implement in `formulas.js`:
- **HP**: `15 + (STR + 2×END)` at creation; `+3 + floor(END/2)` per level
  (replaces the current flat `15 + level×hpPerLevel`, which silently
  dropped STR/END from the base).
- **Melee Weapons**: `STR + AGI` — no `+5`, following the manual exactly
  even though the manual itself flags this as possibly an oversight
  (every other combat skill has a `+5`). Revisit if it plays wrong.
- **Unarmed**: `STR + AGI` — same reasoning as Melee Weapons.
- **Science**: `5 + INT + INT` (i.e. `5 + 2×INT`).
- **Engineering**: `5 + 1.5×INT + 0.5×AGI`.
- **Lockpick**: `5 + PER + AGI` (constant corrected from 10 to 5).
- **Sneak**: `AGI + AGI` (dropped the code's unexplained `+5` and `×3`).
- **Ghoul minimum Luck**: 5 (was 1 — this one was a straightforward bug,
  not a design choice; every other race's caps already matched the manual).
- **Robot poison/rad resistance**: kept at 100%/100% — explicit design
  choice (robots take no poison/radiation damage), not manual-derived.
- **Ghoul resistance stacking**: base formula + flat racial bonus,
  additive (e.g. Ghoul PR = `EN×5 + 30`). Turns out the current code
  already does this correctly — no change needed here.
- **Skill points per level**: `5 + (INT×3)`. `formulas.js` already
  computes this correctly as `skillPointsPerLevel`, but the level-up
  granting logic in `controllers.js` (`gmGrantLevel`) uses a different,
  wrong hardcoded `5 + (INT×2)` and ignores the correct computed value —
  needs to be fixed to use the real formula.
- **Perk cadence per race** (resolved by using the race *description*
  text, not the later contradicting table): Human = every level (was
  every 2), Ghoul = every 2 levels, Gergasi = every 3 levels, Half Mutant
  = every 2 levels, Robot = none. Only Human's value actually changes —
  the rest already matched the description text as coded.
- **No skill cap**: confirmed — skills (and only skills) can exceed 100%,
  consistent with classic Fallout. Nothing in code currently caps them;
  nothing to change.

## Trait/Perk correctness (RESOLVED — genuine bugs, not design choices)
- `formulas.js` reads `modifiers.melee_dmg_flat`; `traits.js` defines
  `modifiers.melee_damage_flat`. Different property names — the mismatch
  means Heavy Handed's bonus silently never applies. Confirmed a real bug
  to fix, not intentional.
- Heavy Handed's downside is coded as `crit_chance: -30`; the manual
  states "−25% critical **damage**" (p. 40) — wrong stat and wrong number.
  Fix to match the manual.

## Trait/Perk content & display (Phase 1)
- **Obsidian file structure**: one `.md` file per trait/perk, matching
  how items already work. Any file anywhere in the vault with a fenced
  ` ```json ` block and `"type": "trait"` or `"type": "perk"` gets synced
  automatically — this already works with zero changes to
  `sync-obsidian.js`.
- **New JSON field**: add `"effect"` — a hand-written, human-readable
  summary string (e.g. `"+4 Melee Damage, -25% Critical Damage"`), shown
  in the tooltip alongside the existing flavor `description`. Keeps
  `modifiers` purely mechanical/machine-readable while giving players a
  plain-English readout.
- **Mobile tooltip gap**: the existing hover tooltip (`renderWikiLink` /
  `showTooltip`) only fires on `mouseover`, which never fires on
  touchscreens. Needs a tap-to-show fallback (tap to open, tap elsewhere
  or a close control to dismiss). Applies to any current wiki-link use,
  not just traits/perks — genuine existing gap, not a new feature.

## GOAT review screen (Phase 1, new)
- After character creation, players should be able to come back and see
  a read-only summary of their G.O.A.T. choices (race, SPECIAL
  allocation, tag skills) to understand what they picked.
- Reuses the existing registration view's rendering, just in a
  non-editable mode gated behind `is_finalized === true` instead of the
  editable creation flow.

## Data Logs tab (new subsystem — replaces the current "COMING SOON" stub)
- **Delivery model: access gating.** Logs are hidden/locked by default;
  players only see logs the GM has explicitly "given" them. Not a shared
  library — visibility is per-player controlled.
- **Authoring: Obsidian sync.** New logs (recaps, quest items, newspapers,
  in-world documents) are written as markdown files in the existing
  Obsidian wiki vault, same pipeline that currently generates
  `src/items.js` / `src/traits.js` via `sync-obsidian.js`. No new in-app
  authoring UI planned for v1.
- Folder structure in Obsidian becomes the category tree in the UI, e.g.
  `Bandawang > Bandawang Casino > Baccarat Rules`.
- Open question (not yet resolved): how "giving" access is actually
  triggered on the GM side, and whether granting is per-log or per-folder
  (e.g. grant a whole location at once vs. one document at a time).
