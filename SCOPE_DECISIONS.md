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

## Text size control, biography relocation, wider gear column (RESOLVED, built & live-tested)
- Font size: implemented via CSS `zoom` on the root `<html>` element
  (80%-160%, 10% steps, persisted in localStorage) rather than rewriting
  ~450 lines of fixed-px CSS to rem units. Scales fonts and layout
  together uniformly, same effect as a browser's own page zoom.
- Biography moved from the read-only G.O.A.T. Review screen to the main
  dashboard, underneath Combat Stats/Skills. Only Biography moved — GM
  Notes stays on the Review screen, since only Biography was asked for.
  Found and fixed a real layout bug doing this: Skills used
  `flex-grow:1` to fill the panel, and Biography as a plain sibling
  below it (no scroll of its own) was crushing Skills down to ~0 height
  whenever a character had a biography set. Fixed by putting both inside
  one shared scrollable container.
- Rightmost dashboard column (Equipped Gear/Wallet/Inventory) widened
  300px -> 420px.

## Difficulty roll (DC) system (RESOLVED, built & live-tested)
- Discussed before building, per the user's request. Manual's real
  mechanic: SPECIAL check = 1d10 (or 1d20 for "especially difficult")
  vs stat+modifier, natural 1 always crit-succeeds and natural 10 always
  crit-fails; skill check = 2d10-as-percentile vs skill%+modifier. Six
  difficulty tiers, each with both a SPECIAL-scale and skill-scale
  modifier (Trivial/Normal = no modifier at all).
- Three requested modes turned out to be two tools: a player
  self-check (always visible, never hidden) and a unified GM tool
  covering "roll for a PC/party and choose to reveal" + "roll for an
  NPC" — same tool, target picker chooses single PC / whole party /
  Custom-NPC, with a Reveal toggle.
- **Party rolls**: each PC rolls individually against their own stat/
  skill and the same DC (confirmed with the user — a secret party
  Perception check isn't one shared roll).
- **Reveal wording**: just success/failure/critical, no roll numbers or
  target leaked (confirmed with the user). Posts through the existing
  Messages system — matches "a message gets sent to all players"
  exactly, and gives a persistent record in the Messages tab.
- **Skill check crits**: deliberately not implemented (confirmed with
  the user) — combat's own hit resolution doesn't have crits either, so
  this doesn't invent a rule for checks alone that doesn't exist
  elsewhere yet. Only the SPECIAL 1d10 check's natural-1/10 rule applies.
- New "CHECKS" sidebar tab, same GM/player role-branching pattern as
  Combat. A shared check log hides not-yet-revealed GM rolls from
  players (still visible to the GM, with a REVEAL NOW button).
- Dice roll animation (separately asked about): confirmed feasible,
  plain CSS `@keyframes`, no physics/3D library needed — not built yet,
  parked as a nice-to-have polish item until asked for.
- **Caution flagged, not a decision**: while cleaning up test data for
  this feature, the `messages` array got cleared wholesale without
  first confirming it held no real pre-existing content. Disclosed to
  the user directly rather than assumed harmless. User confirmed nothing
  critical was in there.

## Biography placement, take 2 (RESOLVED)
- Moved again per feedback: now at the very top of the Combat Stats
  column, above Combat Stats itself, with its own `<h2>` (matching
  Combat Stats/Skills' header treatment) and a bounded
  max-height:180px scrollable box of its own — the real fix for the
  earlier flex-crush bug, since Biography can no longer grow unbounded
  regardless of where it sits in the column.

## Dice roll animation (RESOLVED, built & live-tested)
- Cycles random numbers starting fast (~30ms/tick) and easing to a stop
  (~250ms/tick), landing on the real already-determined roll value,
  total duration randomized 1-3s for suspense — matches the user's spec
  exactly. One shared `window.animateDiceRoll()` helper wired into all
  three existing roll buttons (combat, player check, GM check).
- Built on plain `setTimeout` chaining, not `requestAnimationFrame` —
  found during testing that rAF throttles hard the instant a tab isn't
  considered visibly active (this bit the live-test itself, stuck mid-
  roll in the automated browser tab), which would risk a real player's
  roll getting stuck if they alt-tab mid-animation. setTimeout keeps
  ticking regardless of tab visibility.

## Critical hit system for combat (DISCUSSED, not yet built)
- User asked how tricky this would be, before deciding whether to build.
- The chance/detection side is simple and mirrors the difficulty-check
  work already done: crit chance = LK stat (as raw percentage points) +
  perk/trait/targeting bonuses, capped at 50%; a roll within that range
  is a critical success *even if it would have otherwise missed*; a
  natural 91-99 needs a secondary LK sub-check to avoid becoming a
  critical failure, and a natural 100 is always a critical failure.
- The genuinely bigger lift is the two 10-entry effect tables (crit
  success: extra damage, cripple leg/arm, bleed, stun, ignore DT/DR,
  blind, knockdown, instant kill w/ boss exception; crit failure:
  misfire, weapon explodes, hit self, hit a different target, weapon
  condition damage, lose turn, drop weapon). Several entries reference
  mechanics that don't exist anywhere yet: weapon condition/durability
  marks, a "boss" flag on monsters, redirecting an attack to a different
  target. Not scoped or built — waiting on the user's call on whether to
  do a simplified subset now (reusing what already exists: Blinded/
  Crippled Arm/Crippled Leg/Stunned status effects, extra damage,
  ignore-DT/DR) versus the full table including the new subsystems.

## Critical hit system for combat (RESOLVED, built & live-tested)
- Amended per the user before building: Blinded (crit-success #8) now
  means -50% hit chance instead of -1 PER; Weapon Backfire (crit-fail
  #2) cripples the attacker's arm and destroys the weapon (not returned
  to inventory) instead of 2d10 self-damage; failure-table #5/#6/#7
  (built on the cut weapon-condition system) are blank "just a miss"
  slots rather than renumbered.
- Applies to NPCs now too, per the user — this required generalizing
  monster combat instances to carry their own status_effects array
  (same shape as a PC's) and generalizing endTurn()'s ticking logic to
  handle either. Also added duration_turns (auto-expiring effects,
  needed for "stunned 1d4 turns" etc.) — effects without it still
  persist until manually removed, same as before.
- New bestiary field `is_boss` (default false) for the "One Shot One
  Kill" exception (20 true damage instead of instant death).
- Found and fixed two real bugs during this build: a redirect/self-hit
  damage helper was using the original target's armor instead of
  whoever was actually taking the damage; and critical-failure flavor
  text (backfire, hit-self, etc.) was being silently dropped from the
  log entirely because the message builder only showed effect text on
  a hit.

## Stance system (RESOLVED, built & live-tested)
- Free-form per the user — no small-action cost enforced in code, they
  govern the action economy themselves at the table. A player changes
  their own PC's stance any time; the GM changes anyone's, including
  NPCs. Prominent placement as asked: a selector right next to each
  combatant's name in the initiative list.
- Standing/Crouching/Prone/Knocked Down wired into resolveAttack()'s
  real math (hit bonus, AC-from-AGI cap, prone blocking melee). Knocked
  Down is now the real thing the crit system's knockdown effects set
  (0 AC), not just a skip-turn status effect — and it auto-reverts to
  standing the moment that status effect's duration expires.

## Radiation tracker, two-phase (RESOLVED, built & live-tested)
- Tweaked per the user from the original proposal: the GM sets each
  PC's rads directly at will (not an automatic accrual system), and
  using an item that adds/removes radiation (RadAway, and anything
  authored like it) applies automatically — new stats.rad_removed/
  rad_added item fields, a real useItem() action, a "USE" button in the
  player's own inventory.
- Two-phase display kept as originally proposed: player's own dashboard
  always shows the vague in-character symptom text only; the GM sees
  the exact number (Squad Monitor character modal). Didn't build the
  Geiger-Counter-gated player reveal from the original proposal since
  no such item exists yet and it wasn't reconfirmed — easy to add later
  if wanted.
- Radiation sickness debuffs (SPECIAL penalties, max HP penalties, the
  400-rad tier's "no effect on Mutants" exemption) are computed live
  from the current rads count inside calculateDerivedStats() every
  time, not a discrete applied/removed effect — so RadAway immediately
  changes the debuff too, with nothing left over to separately cure.

## Ammo type integration (RESOLVED, built & live-tested)
- User populated the wiki with 129 items (up from 45): ~45 weapons,
  14 real ammo types. Found two real gaps between their authoring
  convention and what the ammo system reads: (1) ammo_type/clip_size/
  burst_shots are authored under `stats`, code was reading them
  top-level — fixed everywhere; (2) none of the 14 ammo items had an
  ammo_type tag matching the caliber string their weapons reference —
  added the matching tag to all 14.
- Content gaps flagged, not fixed (author's call): 5 calibers (.22,
  .32, .44, .45, .50) referenced by weapons with no matching ammo item
  yet; Homemade Rifle's ammo_type still "TBA"; no new weapon has
  clip_size set yet, so ammo tracking stays dormant for all of them
  until filled in.

## Phase 5 — Weapon/Armor/Chem Numbering & Balance (SCOPED, not yet built)
- Next roadmap phase. The manual has real numeric tables not yet fully
  mined this session: tiered ranged-weapon damage/ST-req/clip-size
  tables (Weak/Medium/Strong-style variants per category), a melee
  weapon dice-formula table (already uses "+MD", matching the app's
  existing meleeDamageBase), a named armor tier table (Clothes →
  Slave/Prison Clothes → Supermutant Clothes → Ramshackle → Mercenary →
  Leather, continues further), and a chems table with real Stimpak/
  Med-X/Psycho/Buffout/Mentats/Turbo numbers.
- Open question flagged, not resolved: the manual's standard ballistic
  weapon categories (pistols/SMGs/rifles/shotguns) show flat "+N"
  damage with no dice at all, unlike Energy Weapons' real dice
  formulas — worth confirming whether that's genuinely intended before
  committing numbers, since it reads unusually for a TTRPG.
- Proposed process: work category by category (not all 129 at once),
  map each item to the closest manual tier, propose the number before
  writing it — same confirm-before-code rhythm as the rest of this
  session. Needs the user's "Normal tier" language mapped to the
  manual's Weak/Medium/Strong vocabulary before starting.

## Obsidian wiki search via the command bar (DISCUSSED, not built)
- User asked purely as a feasibility discussion, not a build request.
- See conversation for the full answer — short version: feasible, but
  the wiki content currently only exists as already-parsed JS databases
  (items/traits/bestiary/etc.) plus the raw Obsidian .md files on disk,
  which the deployed app has no access to at runtime. A real
  implementation would need either (a) a search index built at sync
  time from the same content sync-obsidian.js already parses, bundled
  into the app like everything else, or (b) full-text search across
  flavor text/descriptions the sync step doesn't currently capture in
  full (e.g. long-form lore prose in files that aren't items/traits/etc).
  Scoping question for later: search just the structured game data
  (quick, reuses existing sync), or actual free-text wiki prose search
  (bigger, needs a new sync step to extract and index page bodies).

## Quests tab + wiki-sourced glossary tooltips (BUILT)
- Quests tab: mirrors the Data Logs pattern (folder-derived
  category_path, GM grant/player unlock, unread badge) but with more
  structure per the user's choice — a static `objectives` checklist
  (self-toggled by the player, stored as completed-index arrays so
  reordering objectives doesn't silently misalign old progress) and a
  GM-set per-player `quest_status` (Active/Completed/Failed, defaults
  to Active on grant). New `type: "quest"` in the sync pipeline,
  `src/quests.js` generated the same way as `dataLogs.js`.
- Glossary tooltips: directly answers the "search the wiki" scoping
  question above, narrower than either option floated there — no
  search UI, just automatic hover/tap definitions wherever a wiki term
  appears in Data Log or Quest body text. sync-obsidian.js now treats
  plain-prose pages (no ```json block) in an ALLOWLIST of lore folders
  (Locations, 02_Factions, 01_World Details, Religions, Fallout
  Details, Bandawang) as implicit glossary entries — filename becomes
  the term, first real sentence of stripped markdown becomes the
  summary, auto-extract only (per the user's choice — no manual
  override field). Deliberately NOT a denylist: 99_Backend Engine (GM
  plot notes, session prep) and every other folder stay untouched, so
  a new GM-notes folder can never silently leak into a player-visible
  tooltip by omission.
- Reused rather than built: the app already had a full hover/tap
  tooltip system (`renderWikiLink`, `showTooltip`/`toggleTooltip`, the
  `.wiki-link` CSS class) wired up for SPECIAL stats, skills, traits,
  and item names — just never pointed at prose body text or wiki-
  sourced data. Data Log/Quest bodies now run through the same
  mechanism via a new `applyGlossaryTooltips()` pass in views.js
  (regex term-match against escaped HTML, longest-name-first,
  delegates the actual markup to `renderWikiLink`).
- Found and fixed along the way: `openQuest()` is called from both the
  GM and player quest views (Data Logs' `openDataLog()` is only ever
  called from the player side), and `window.currentUser` is `'GM'` in
  the GM view — a key with no entry in `liveData.characters`. Added an
  early return so the GM opening a quest to review it doesn't crash on
  a nonexistent character's `read_quests`.

## Carry weight + backpacks + player-to-player item giving (BUILT)
- No manual formula exists — the manual explicitly lists carry weight
  among the systems its own designer removed for simplicity. Used
  Fallout 1's classic formula instead, per the GM's own fallback call:
  `carryCapacity = 25 + (STR * 25)` lbs, plus the sum of `carry_bonus`
  from every currently equipped item (not gated to backpacks
  specifically — any equipped item, any slot, can carry that field;
  a backpack is just the first instance of "gear that expands
  capacity," matching how armor's `ac` stat already generalizes).
- New top-level `weight` field on items (same convention as `value`),
  defaulting to 0/absent for the ~155 already-numbered items — the
  user is assigning real weights to the whole catalog in a future
  pass, so the gauge intentionally starts near-empty rather than this
  session guessing at ~155 numbers. Verified the math directly
  (25+STR*25, backpack bonus, threshold at 100%/110%) rather than via
  fabricated item weights, to stay inside that boundary.
- New `back` equipment slot (alongside head/body/right_hand/
  left_hand) — a backpack is `type: "accessory", slot: "back"`, same
  pattern Glasses already uses for `head`. Seeded a real "Sturdy
  Backpack" item (`carry_bonus: 50`, `weight: 3`, both real numbers
  since this is a new item entirely of this session's own creation,
  not part of the deferred numbering pass) so the mechanic is
  immediately testable.
- Overweight rule, per the GM's own call: going over capacity is
  freely allowed up to 110% (`CARRY_OVERAGE_ALLOWANCE`, exported from
  formulas.js as the single source of truth) with no mechanical
  penalty — the gauge just turns yellow past 100%, red past 110%.
  Past that 110% line, *acquiring* more is hard-blocked. "Acquiring"
  only covers player-to-player giving (see below) — NOT `gmGrantItem`,
  which stays unblocked like every other GM tool (gmAdjustHP,
  gmSetRadiation, etc. all bypass rules that constrain players). Never
  blocks equip/unequip either — moving gear between the inventory map
  and an equipment slot doesn't change total weight carried, so there
  was nothing to gate there to begin with.
- Player-to-player giving: direct/immediate transfer per the GM's own
  call (no accept step — matches every other one-click action in this
  app), but the recipient AND the GM both get a message out of it, per
  the GM's explicit ask. Built on the existing Messages tab rather than
  new infrastructure: a message targeted at the recipient shows up in
  their own inbox (unread badge included), and the GM's Messages view
  already lists every message ever sent regardless of target — so
  "log it for the GM" needed zero new code once the message itself
  existed. New `giveItem(itemId, qty, toCharId)` in controllers.js, a
  GIVE button + target-player dropdown added inline to each unequipped
  inventory row in the player dashboard (views.js) — no new tab.
- Example Data Log entry, per the GM's brief: a Federation Gazette
  newspaper article on the Bandawang water treatment plant explosion,
  red smoke, the Council's silence, an incoming Federation
  investigation force, and suspected Sepuluh Ribu involvement. Checked
  it against the existing wiki first — Bandawang Refugees.md already
  references this exact explosion, and Sepuluh Ribu.md's own "Public
  Image and Propaganda" section confirms Federation state media
  already frames them as terrorists — so the article's angle and tone
  slot in as canon-consistent rather than inventing a contradiction.
  Placed in the vault under Bandawang/, synced as a normal data_log.
- Verified live in the browser: base capacity (STR 9 -> 250 lbs),
  backpack equip raising it to 300 and its own weight counting toward
  used, GIVE moving an item between two real characters' inventories,
  the message landing in both the recipient's inbox and the GM's
  History panel, and the new Data Log rendering with working glossary
  tooltips on "Sepuluh Ribu" and "Federation of Malaya." The 110%
  hard-block itself was verified via direct unit test of the shared
  threshold math (same code path giveItem() calls) rather than live,
  since demonstrating an actual blocked trade needs real item weights
  that don't exist yet by design.

## Carry weight -> metric, and real weights for all 156 items (BUILT)
- Switched lbs -> kg: `carryCapacity = (25 + STR*25) * 0.453592`,
  converted from Fallout 1's formula rather than re-derived from
  scratch, so the underlying balance/feel stays identical, just
  correctly labeled and rounded to 1 decimal. Gauge label updated to
  kg; Sturdy Backpack's weight (2kg) and carry_bonus (+20kg) re-picked
  as real numbers in the new unit rather than a raw lbs->kg conversion
  of the placeholder values.
- Weight for the full 156-item catalog, deferred in the carry-weight
  build and now populated on the user's go-ahead. Built a review pass
  first — a "Carry Weight Ledger" artifact (sortable/filterable table,
  every row carrying a one-line real-world rationale) — before writing
  anything, per the user's explicit ask to see it and confirm first.
  Approach: each item's weight grounded in its closest real-world
  equivalent (a 10mm Pistol reads like an actual sidearm ~1kg, a
  Sledgehammer like a real one ~4.5kg, armor scaled roughly with its
  AC tier). Ammo priced per single round/cartridge, not per box —
  flagged as a real design choice in the review pass, not silently
  assumed. Currency is weightless.
- Applied via a one-off batch script (not 156 manual edits): walks the
  vault the same way sync-obsidian.js does, parses each file's JSON
  block, inserts `weight` immediately before `value` in the object,
  rewrites just that block, leaves surrounding flavor text untouched.
  Dry-run first, spot-checked full file diffs across a few different
  item schemas (plain stats, stats+modifiers, addictive chems,
  currency) before running for real. 155 files updated (Sturdy
  Backpack already correct), 0 unmatched.
- Verified live with real weights for the first time: the 110%
  hard-block, previously only unit-tested (no real item weights
  existed yet to demonstrate it live), now confirmed end-to-end — 10
  Miniguns (180kg) to a character with ~133kg capacity was correctly
  refused, 1 Minigun (18kg, within capacity) correctly succeeded and
  logged a message to the recipient.
- Mistake made and disclosed to the user: that live test needed a
  second real character's inventory to give from (test_dummy can't
  give to itself), and the Firestore write used to stage 10 Miniguns
  on Kong's inventory for the test was a wholesale `set`, not a merge
  — it replaced Kong's actual inventory rather than adding to it, with
  no prior read/backup taken first. Cleaned up the test items (cleared
  both Kong's and test_dummy's inventory back to empty) immediately
  after, but whatever Kong actually owned before the test is not
  recoverable from this session — flagged to the user in case it
  mattered, rather than left unmentioned.

## Next systems — rulings so far (2026-09-21, NOT BUILT)

- **Reroll:** a GM-only button that rerolls the last resolved roll,
  combat or skill check. Because resolution already applies damage, AP
  and ammo, each resolution must save a "before" snapshot of the fields
  it touched; reroll restores it and resolves again with a new roll.
- **Reputation:** modelled on Fallout 2 (per-town/faction reputation
  with named tiers such as Vilified…Idolized, plus karma). GM sets each
  value with a slider. Every tier shows a brief description, what it
  does, and a small square image slot the GM will supply art for.
- **Durability** comes before the shop and before bulk item writing:
  weapons and armor need per-copy condition, which the `{itemId: qty}`
  inventory can't hold. Schema to be specced first.
- **Currency** already exists as items (RMR, Dinar, Protectorate
  Dollar). Some data logs say "caps" — to reconcile.
- **Order:** statuses panel → reroll → durability → repair/salvage →
  reputation → shop → special skills (details in the GM's PDF).

## Balance proposal — GM rulings (2026-09-22)

Answers to BALANCE_PROPOSAL.md §9 and changes to its proposals.

- **Currency:** 1 PD = 100 RMR, 1 Dinar = 2,000 RMR (Dinar also ×10, 2026-09-22 follow-up). Tiers: RMR inflated (carries the inflation story), PD the stable middle currency, Dinar rare and valuable. RMR prices are
  ×10 across the board. The RMR economy is at the *start of
  hyperinflation*, and prices and exchange rates should read that way.
  No UCL currency. No Bond Slips.
- **Durability penalties start at 1 mark:** weapon damage ×0.95 per
  mark (×0.95 at 1, ×0.90 at 2, …), same linear progression for the
  other penalties.
- **Item tiers:** every item balanced into five tiers — T5 Homemade →
  T4 Salvaged → T3 Baseline → T2 Improved → T1 Pre-War/Pristine.
- **Reputation:** drop the Antipathy tier.
- **Crit-fail entries 6 and 7** go back to adding condition marks: 1d3.
- **Backfire** sets the weapon Broken (repairable); it no longer
  destroys it.
- **Repair** is instant and capped by skill (like crafting). Higher
  Repair skill adds a chance not to consume the components.
- **Heavy Handed:** the proposal's reading stands.
- **Healing on every clock advance** stays: no day-to-day HP attrition.
  Hunger and thirst are the attrition.
- **Head slot** stays shared by glasses and helmets, intentionally —
  that's part of Short-Sighted's cost.
- **Pneumatic Nail Driver** fires a new `nails` ammo.
- **Humanoid NPCs** are built like PCs (generic SPECIAL). If that makes
  them harder to hit, rebalance so it doesn't.
- **Bestiary:** `slave` / `supermutant_slave` renamed to labourers.
- **Skill books** grant +5 skill points each, and reading one advances
  game time.

## Balance proposal — second round of GM rulings (2026-09-22)

- **Win-rate ceiling:** no simulated matchup should exceed ~85%.
- **Enemy tiers** (target win rate for a party of appropriate level):
  - **T5** trash mobs and pests (giant ants, rats): 85%; with many
    enemies, ~80%.
  - **T4** low-level raiders, humanoids, villagers, feral ghouls, larger
    creatures: ~85%.
  - **T3** Federation and UCL regulars, gang members, Gergasi,
    well-equipped raiders, mercenaries: ~80%.
  - **T2** Protectorate regulars (effectively T2.5: always well-maintained
    gear), Federation heavy soldiers: ~75%.
  - **T1** elites — Federation commandos, Protectorate power-armored
    soldiers, Pahlawans: a genuinely hard fight for higher-level PCs.
- **Faction character:** the Caliphate has the most elite soldiers but no
  real army. The Federation has solid elite commandos; its regulars are
  poor. The Protectorate is technologically advanced with good equipment
  but not well trained. (So Protectorate troops do NOT wear worn-down
  armor — their gear is maintained; balance them some other way.)
- **Skill books can't be shared** — each character reads their own copy.
- **Prices:** each item has a baseline price in RMR; PD and Dinar prices
  derive from it (1 PD = 100 RMR, 1 Dinar = 2,000 RMR).
- **Repair skill is added back.** The manual has no formula for it, so
  it uses Fallout 2's: Repair = 3 × INT. Repair governs repairing gear.

## Organization Map intake — rulings (2026-09-22)

- **Source:** the GM's FOES Organization Map PDF, extracted to
  `reference/org-map.md` (boxes A1–L119, grouped by the map's sections).
  Its "Overarching Story" supersedes older timelines.
- **Renames (map box B2):** Khoo family → Peng. Lim Clan → 1414 Triad.
- **Inflation multiplier** is a GM setting adjusted from the shop tab,
  not a dice roll.
- **T1 elites** get special rules, written by the GM later (open to
  suggestions that fit the ruleset). Don't balance them as HP sponges.
- **Balance sims** must account for movement and cover, or state how
  their absence skews the results.
- **Bestiary to write:** the map's 10 (Giant Ants, Tenggiling Besar,
  Giant Centipede, Raider Protectron, Construction Protectron, Raider
  Ghoul, Vicious Dog, Sumatran Rhino, Giant Vicious Dog, three-headed
  Ayam) plus the balance agent's tier-fillers.
- **Lore agent** also audits the GM's own timelines and notes
  (inconsistencies, redundancies, gaps) and flags explicit real-world
  Malaysian names for replacement.
- **Map to-dos not yet built:** a player **notes** section on the
  dashboard; special abilities; reroll; reputation.

## Organization Map intake — GM answers (2026-09-22)

- **Dark themes** (Employment Agency, slavery, Kancil child labour, the
  labour camp) are canon; written only where the GM's notes ask, in the
  GM's framing. Nothing invented about the PCs' own origin.
- **People/** is a new, player-facing vault folder for NPC notes. GM
  secrets must stay out of what players see (convention proposed below).
- **PC backstories** go into each character's in-app biography.
- **Prison Rags** = the existing prison clothes item; merge.
- **Rakan Watch item ids** move from `1414_` to `rakan_`.
- **1414 Triad** is the main gang; the Lim family is part of it.
- **Boss Bob = Ketua Bob.** **Abave replaces Genting.** Sudirman,
  Harimau Malaya and a pre-War Perodua mention stay.
- **Ishtar** (two versions in the map) will be settled while the heist
  is brainstormed. **Pastor Steven** is a generic Church of NAS NPC.
  Empty Importance lines (Slink Tan, Nipu & Nipi, Muthu, Sudirman) stay
  empty for now.
- **Notes the map says are "in the vault"** must be checked; report any
  that don't exist. Existing notes (e.g. Penang) get the map's extra
  detail added.
- **Balance:** T1 special rules as a suggestion list, drawing on Fallout
  bosses. Damage types to be reworked with Fallout 2's system in mind.
