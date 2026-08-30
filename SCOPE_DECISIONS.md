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

## Firestore scaling — considerations for later (RESOLVED for now: no action needed)
- **Current scale is fine.** Confirmed via real math: the whole campaign
  lives in one Firestore document, so every action (attack, equip, grant
  item, etc.) is exactly one write regardless of party size or content
  volume — verified by checking every function in `controllers.js` (22
  Firestore operations across 23 functions, none inside a loop). A large
  20-character combat generates roughly 300-400 writes and ~7,000 reads
  at most — comfortably under Spark's 20K write / 50K read daily caps.
  Normal gear-experimentation by players is negligible (~250 reads for a
  whole session of trying things on); it would take ~2,500 individual
  equip clicks *per player in a single day* to meaningfully dent the cap.
- **The general principle to design future features against**: browsing/
  reading static content (items, bestiary, traits, and — once built —
  Data Logs) costs nothing, since that content is bundled into the app,
  not fetched from Firestore. Only *saved state changes* (equip, grant,
  apply an effect, unlock a log) cost a write, and that write's read cost
  multiplies by however many clients are currently connected and
  watching. Party size and content volume aren't the risk; **concurrent
  connections** are — this matters specifically if live spectator viewing
  (e.g. for the planned YouTube content) ever becomes a real feature,
  since every viewer becomes another listener paying for every write
  anyone makes.
- **Data Logs (not yet built) already fits this model correctly** as
  scoped: log content syncs from Obsidian like items (free to browse,
  however many hundreds there are); only the per-player "which logs
  they've been granted" flag list lives in Firestore, written only when
  the GM grants access — a deliberate, infrequent action, not something
  that scales with players clicking through logs.
- **Decided (superseding the note above): Mark as Read is wanted.**
  Opening a granted log writes a per-player "read" flag for that log —
  a deliberate, known write-per-view cost, not an accidental one. Given
  the numbers already worked out above (a single player would need
  thousands of actions in one day to matter), this is fine at current
  scale. Design questions for when Phase 3 is actually built: does
  opening a log auto-mark it read, or is there an explicit "mark read"
  action; does the GM see who's read what; is there an unread-count
  badge in the nav.
- **The lever if this ever does become a real concern**: split the one
  shared document into smaller pieces (e.g. one Firestore document per
  character instead of one document for the whole campaign), so a
  listener only pays in reads for what they're actually watching instead
  of every connected client paying for every change anywhere in the
  campaign. Real architectural work, not warranted at current scale —
  noted here so it's not forgotten if the campaign (or spectator viewing)
  grows enough to matter.

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

## Aimed shots / targeted shots (RESOLVED, built & live-tested)
- **Not from the manual** — numbers agreed with the user, following
  Fallout 1/2's targeted-shot convention: Torso is the default normal
  attack (0 penalty), always available; picking another body part is a
  genuinely optional *second* choice, not a restriction or replacement.
- 8 zones: Torso (0), Head (-20%, 1.5x damage), Eyes (-40%, Blinded),
  Left/Right Arm (-20%, Crippled Arm), Left/Right Leg (-15%, Crippled
  Leg), Groin (-20%, Stunned).
- **Attacker-agnostic** (a real design correction made mid-build): the
  body-part dropdown and its effects work the same whether it's a PC's
  turn or a GM-controlled monster's turn. Without this, the status-effect
  half of the mechanic would have been unreachable — PCs can only target
  monsters (opposing-side-only targeting, an earlier decision), and
  monsters don't carry a status_effects array, so a PC's called shot could
  never actually land Blinded/Crippled/Stunned on anyone. Letting monsters
  (GM-controlled) also aim at PCs is what makes the effect real, and
  matches "a called shot works the same regardless of who's pulling the
  trigger."
- Live hit% preview in the action panel, recomputed as target/attack/body
  part change (mirrors the same math `resolveAttack()` uses).
- New status effects authored in Obsidian: Blinded (-3 PER), Crippled Arm
  (-10 all combat skills), Crippled Leg (-2 AGI) — all non-ticking, pure
  passive modifiers.

## Ammo tracking + burst fire (RESOLVED, built & live-tested)
- **Simplified by design, not the manual's system.** The manual's real
  burst mechanic is a multi-roll-until-a-natural-100 sequence; classic
  Fallout 1/2's is a single hit roll followed by a randomized partial-hit
  spray (with stray rounds able to hit bystanders). Both are meaningfully
  bigger builds. Presented both to the user; they chose a third, simpler
  option: one roll at a flat hit% penalty (-15%) with damage dice rolled
  twice and summed, in the interest of it being "a simple addition."
- **Schema**: weapon items gain two optional fields — `clip_size` (max
  ammo) and `burst_shots` (rounds a burst costs; omit = no burst
  capability). Homemade Pistol authored with `clip_size: 6` as the first
  real example.
- **Ammo lives per equipped slot on the character**
  (`characters.<id>.ammo.right_hand` / `.left_hand`), not per item
  instance — the app has no per-item-instance state anywhere (inventory
  is just an array of item ID strings), so the slot is the natural unit.
  Equipping a `clip_size` weapon always assumes a full magazine;
  unequipping clears that slot's ammo.
- **Reload is a small action** — matches the manual's Movement/Action/
  Small-action split (reloading is explicitly listed as a small action,
  p.~1221). Deliberately does *not* consume the turn's one main action,
  so it can happen alongside an actual attack. Callable by the weapon's
  owner or the GM; logs to the combat log when used mid-fight.
- Firing without enough ammo blocks the attack with an alert and does
  *not* spend the turn — lets a player realize they're dry and reload
  instead without being punished for trying.
- **NPCs/monsters don't use this system** — bestiary attacks stay
  hand-authored with fixed hit%/damage, no ammo tracking. Scoped this way
  deliberately to match "ammo tracking for guns" (i.e. PC weapons), not
  as an oversight.
- **Found and fixed along the way**: a real, pre-existing bug in
  `sync-obsidian.js` that unconditionally stripped quotes from every
  generated object key, producing invalid JS the instant an item's name
  started with a digit (triggered by a new "1414 Windbreaker" armor the
  user had authored in Obsidian but never synced/built). This was silently
  waiting to break the next `npm run build` regardless of the ammo work —
  now only strips quotes from keys that are valid bare JS identifiers.

## Reload checks real ammo in inventory (RESOLVED, built & live-tested)
- Follow-up to the ammo/burst work above: reload now actually consumes an
  "ammo" item from inventory instead of refilling for free.
- **Prompted a bigger, explicitly-requested change**: inventory items
  didn't stack at all (a flat array of ID strings, one entry per copy) —
  fine for one-off gear, unworkable for "20 Stimpaks." The user asked for
  real stacking (`{itemId: quantity}`) alongside the ammo check, not just
  the ammo check alone. `normalizeInventory()` (new `src/inventory.js`)
  tolerates the old array shape too, so existing characters upgrade
  transparently the first time anything touches their inventory — no
  migration script needed.
- **Consumption model** (decided without re-asking, in the "exact round
  count" direction the user had already chosen): reload computes the
  *deficit* (clip_size minus current ammo) and consumes exactly that many
  matching ammo items — not a full clip's worth — so topping off a
  partial magazine doesn't waste rounds you didn't need to burn. If you
  don't have enough for the full deficit, it's a hard block (no partial
  reloads) — matches the user's own two-outcome framing ("no ammo!" /
  "reloaded!") rather than introducing a third partial-reload state.
- A weapon only draws down real inventory ammo if it's been authored with
  an `ammo_type` — one without it still reloads for free, unchanged from
  the original ammo/burst build. Opt-in per weapon, not a forced
  migration of every existing gun.
- **Equip/unequip still don't touch inventory quantity** (pre-existing
  behavior, unchanged) — equipping doesn't require or consume an
  inventory copy. Known inconsistency now that inventory has real
  quantities (you could equip a weapon you don't "have"), not fixed here
  since it wasn't part of this ask — flagged for later if it matters.
  **Superseded by the next entry** — fixed the very next request.

## Equip/unequip require and move real inventory copies (RESOLVED, built & live-tested)
- Direct follow-up flagged at the end of the ammo work above, actioned
  immediately: "a weapon is a weapon... equip/unequip only, similar to
  armor or accessories" — not consumed like ammo/Stimpaks, but not free
  to summon out of nowhere either.
- Equipping now requires owning a copy in inventory (blocks with an
  alert naming the item otherwise) and moves it out of inventory onto
  the body. Unequipping (player and GM paths both) returns it. Swapping
  gear into an occupied slot correctly returns whatever was there before
  instead of silently discarding it — a real gap that existed the moment
  inventory started tracking real quantities. Re-equipping the same item
  already in that slot is a no-op, not a double-consume.

## Randomized combat log flavor text (RESOLVED, built & live-tested)
- Was sitting in the parking lot from the Combat Module round: "varied
  hit/miss/damage phrasing instead of the same template every time."
  8 hit + 8 miss phrasing templates, randomly picked per attack,
  deliberately weapon-agnostic (no gun-only verbs, since the same attack
  could be a blade or a fist). The mechanical numbers a GM needs
  (roll/chance, damage, burst tag, effect-applied message) are identical
  regardless of which flavor line got picked — only the sentence around
  them varies.

## G.O.A.T. Exam hover tooltips for SPECIAL/skills (RESOLVED, built & live-tested)
- Was parked back in Phase 1 alongside the mobile tap-to-show tooltip
  fix, waiting for actual tooltip *content* to exist for SPECIAL/skills.
  Content condensed from the manual's own SPECIAL and Skills sections,
  covering all 7 SPECIAL stats and all 18 skills (not just the 12
  taggable at character creation).
- Reuses the existing renderWikiLink/showTooltip pattern (same one
  traits/perks use) everywhere except the creation screen's skill-tag
  grid, where each tile already has its own onclick to toggle the tag —
  stacking renderWikiLink's onclick (which calls stopPropagation) there
  would silently break tap-to-select on mobile. That one spot is
  hover-only by design; every other spot (SPECIAL rows on both the
  creation and review screens, tag chips on the review screen, and the
  full skill list on the main dashboard) gets the full hover+tap version.
