# FOES Terminal — Design Notes Distilled from Gemini Conversation

Source: `Gemini Conversation.md` (~21,120 lines), full transcript read start to finish.
Purpose: reference for scope-lock discussion before resuming development in Claude Code.
Code history/snippets are intentionally omitted — the current repo (`src/formulas.js`, `items.js`, `traits.js`, `views.js`, `controllers.js`, `main.js`) is the real source of truth for "what code exists now." This document is about *decisions, requirements, and process lessons*.

---

## 1. Game Design / Lore Decisions

### Setting
- Campaign: **Fallout: The Eastern Shores (FOES)**. Prison-break/scavenger tone ("Protiga Prison" setting — Firestore collection is literally named `prisoncampaign`, doc `alpha_team`).
- App branding: renamed mid-project from "FOES Online" to **"THE PROTIGA HELPER 3.0"**.
- Aesthetic: green-on-black Fallout terminal look, VT323 font, scanline overlay on the login screen — **not** on character portraits (explicit early correction: portrait is plain, no scanline).
- Existing PCs referenced throughout: **Kong** (confirmed race: Gergasi/Super Mutant), **Iron Leg**, **Two**.

### SPECIAL stats — firm, user-dictated (overrides any "standard Fallout" formula Gemini ever suggested)
- **STR**: bonus to Melee Damage.
- **PER**: affects hit chance; "effective distance" explicitly deferred to a future combat module.
- **END**: HP gain per level = `3 + floor(0.5 × END)`. Poison Resistance = `END × 5`. Rad Resistance = `END × 2`. Implant limit = `floor(END / 3)`.
- **CHA**: mostly a difficulty-check stat.
- **INT**: skill points per level = `5 + (INT × 3)`. *(Note: a later GM "Grant Level Up" button was coded using `5 + (INT × 2)` — this contradicts the user's own stated formula; flag for correction.)*
- **AGI**: Armor Class = AGI (base, static — no dice roll). Sequence = AGI (also static; a dice-roll version was explicitly rejected — dice belong only in a future combat module).
- **LUK**: mostly a difficulty-check stat.
- **Carry Weight and Action Points (AP) were deliberately removed** from the ruleset to streamline play. Gemini repeatedly tried to reintroduce them by defaulting to "standard Fallout" math — **do not reintroduce these**.

### Skills — firm, user-dictated, custom (not the source manual's list)
Final formulas (ST/PE/EN/CH/IN/AG/LK = SPECIAL stats):
- **Combat**: Small Guns `5+PE+PE`; Big Guns `ST+PE+AG`; Energy Weapons `5+PE+IN`; Melee Weapons `ST+AG`; Throwing `(1.5×ST)+(0.5×AG)`; Unarmed `ST+AG`.
- **Stealth**: Sneak `AG+AG`; Steal `5+AG+AG`; Lockpick `5+PE+AG`; Traps `PE+AG+IN`.
- **Science**: Medicine `IN+PE`; Science `5+IN+IN`; Engineering `5+(INx1.5)+(AGx0.5)`; Robotics `IN+IN`; Gunsmith `PE+AG+IN`.
- **Soft**: Speech `5+CH+CH`; Instinct `(ST+PE+EN+CH+IN+AG+LK)/3` rounded down; Survival `5+AG+AG`.
- Skill list includes non-canon skills (Engineering, Robotics, Gunsmith, Instinct) and **excludes "Barter"** — Gemini repeatedly tried to sneak "Barter" back in from generic Fallout knowledge; user removed it each time. **`formulas.js` is the single source of truth for which skills exist — never add a skill that isn't defined there.**
- Tagged skill bonus on the character sheet: **+20%** flat.
- Tagged skill bonus during level-up point spending: **+2% per point** (vs +1%/point untagged).
- User considered fully switching to "classic Fallout 2" formulas after seeing how much harder their own math was, but ultimately **kept a hand-tuned hybrid ruleset** ("I will instead go through the math and replace what I think is better accordingly"). Treat the current `formulas.js` skill math as deliberate and authoritative — don't "correct" it toward textbook Fallout formulas.

### Character sheet — original spec (from an uploaded reference sheet, early in the project)
Must include: avatar (portrait aspect ratio, no scanline), HP, SPECIAL, AC, skills (tagged = distinct color), **DT (Damage Threshold) and DR (Damage Resistance) per damage type** (Normal, Laser, Fire, Plasma, Explode) plus Poison/Radiation/Electricity/Gas resistances, inventory, Perks and Traits (both unique per character, each with their own numeric modifiers).
- **Open gap**: the DT/DR-per-damage-type grid was in the original spec but was **never actually implemented** — the shipped "Combat Stats" panel only shows AC and Sequence. This seems to have been silently dropped during refactors, not a deliberate cut. Worth asking the user directly.
- No XP system — GM levels characters up manually by milestone, not through XP tracking.

### Equipment
- Slots: **Head, Body, Left Hand, Right Hand** only (final; user explicitly deferred implants to later).
- Item types: weapon / armor / consumable / **currency** (currency added later, see Currency section).
- Equipping armor should change AC/DT/DR live (DT/DR side never fully landed — see above).
- Melee vs ranged damage routing rule: an equipped weapon's `stats.range` decides melee (`<=1` or missing) vs ranged (anything else). Melee damage baseline = `max(1, STR-5)`. Unarmed/racial base damage (e.g. Gergasi's `2d4+MD`) should display when no weapon is in either hand — this fix was proposed but not confirmed working as of the transcript's end.
- Planned but **not implemented**: "small" vs "big" size tags on weapons/armor, to block Gergasi/Robot from wearing human-sized ("small") gear. Also planned: Gergasi's "Titan Grip" (can wield a two-handed weapon one-handed, leaving the off-hand slot open, at a lore-specified -10% hit-chance penalty that has nowhere to apply yet since there's no hit-roll system).

### Currencies / Wallet
- **Vault Points**: a GM-adjustable integer field directly on the character (`vault_points`), not an inventory item. Displayed in the Vitals panel under HP. Its narrative purpose/use was never defined in the transcript — open question.
- **Item-based currencies** (Credits, Caliphate Dinar, Protectorate Dollar, Reformed Malayan Ringgit): decided to reuse `items.js`/Obsidian sync rather than build a separate `currencies.js` — any item with `"type": "currency"` gets filtered out of the Inventory list and shown in a separate "Wallet" section instead. This required adding `'currency'` to the sync script's allowed-type list (done).
- Note: Vault Points and item-currencies are **two separate, coexisting mechanisms** — worth confirming with the user whether that's intentional.

### Races — full user-authored system (high-value canonical lore, verbatim-derived)
1. **Human** — baseline, no bonuses/penalties, SPECIAL 1–10 all stats, perk every 2 levels. Recommended for new players; most accepted, most perk access.
2. **Ghoul** — born of radiation overexposure; feral/mentally-lacking variants are shot on sight. Ghouls over 100 years old gain an extra tag skill and must write a pre-war-knowledge background story. Innate 30% Poison Resistance, 80% Radiation Resistance. At HIGH radiation must roll INT every 30 min or go feral; at VERY HIGH radiation, automatically feral. Needs a radiation-level dashboard indicator. SPECIAL min/max: STR 1–8, PER 4–13, END 1–10, CHA 1–10, INT 2–10, AGI 1–6, LUK 1–12. Perk every 2 levels.
3. **Gergasi (Super Mutant)** — "beast, fairytale monster," accepted as laborers/mercenaries. Largest race. Cannot use one-handed weapons; can wield two-handed weapons one-handed at -10% hit chance. Cannot wear human-sized armor. Advantage on Intimidation checks. +10% DR all damage types. +3 Max HP/level. Base unarmed `2d4+MD`. Perk every 3 levels. SPECIAL min/max: STR 5–13, PER 1–11, END 4–11, CHA 1–7, INT 1–11, AGI 1–8, LUK 1–10. **Kong is this race.**
4. **Half Mutant** — born of human × radioactive-creature unions; shunned by both sides for disfigurement. Must write a background-perk story about it. Always rolls CHA when talking to humans; always at disadvantage on Speech/CHA checks except Intimidation. +15% RR/PR. Base unarmed `2d4+MD`. Perk every 2 levels. SPECIAL min/max: STR 3–12, PER 1–10, END 2–11, CHA 1–10, INT 1–10, AGI 1–10, LUK 3–12. User confirmed the "disadvantage" is GM-manual/text-note only — not to be coded (no dice system exists yet).
5. **Robot** — lives in "curious subservience"; prone to being stolen from/scrapped. Higher natural DR, hardy limbs. **Cannot take Perks at all** (upgrade-only). Must be repaired, not healed — **Stimpaks explicitly do not work on Robots**; healing is manual GM HP adjustment for now (user said they'd build a "Repair Kit" item themselves). Cannot wear armor. Unlimited implant/upgrade slots. Immune to radiation/poison in lore, but DR needs to be **GM-adjustable per individual robot** (not a fixed constant) — not yet built. SPECIAL min/max: STR 3–12, PER 1–10, END 2–11, CHA 1–10, INT 1–10, AGI 1–10, LUK 1–10.

No hit-chance/combat-roll system exists in the app at all yet, so several racial mechanics above (Gergasi's -10% penalty, Intimidation advantage, Half-Mutant disadvantage) are GM-adjudicated by hand until a combat module exists.

---

## 2. Feature Requirements — spec status

| Feature | Status | Notes |
|---|---|---|
| Character sheet (3-panel dashboard) | **Built** | Avatar, vitals, SPECIAL, traits/perks (left); combat stats + skills (center); equipment + wallet + inventory (right) |
| Tagged skill coloring/bonus | **Built** | +20% flat on sheet |
| Obsidian → items.js/traits.js sync pipeline | **Built** | `sync-obsidian.js`, chokidar-watched, run via `npm run sync` in a second terminal alongside `npm run dev` |
| Hover tooltips (Tyranny-style wiki links) | **Built** | Global floating tooltip div, shows the item/trait's literal `description` field |
| Equip/unequip system | **Built** | 4 slots, melee/ranged damage split by weapon `range` stat |
| GM login + role system | **Built** | Firestore `access_codes` map; GM can add players live without touching code |
| GM "God Hand" management modal | **Built** | HP ±1/Full Heal, Vault Points ±1, Grant Level Up, Grant Item (supports duplicates), Factory Reset |
| Level-Up draft mode (allocate → confirm/reset) | **Built** | Explicit user requirement: changes are a client-side draft until [CONFIRM] |
| Currency/Wallet split | **Built** | via `items.js` `type: "currency"`, not a separate file |
| Character Creation ("G.O.A.T. Exam") | **Built**, bugs open | 40-point SPECIAL pool, race dropdown w/ live min/max, 3 tag skills, is_finalized flag gates Dashboard vs Registration. Known bugs at hand-off: race min/max not enforced correctly, max-HP display using stale stored value instead of recalculated, racial unarmed damage not showing with empty hands |
| Race system (5 races, stat caps, racial passives) | **Built (data)**, partially wired | RACE_RULES in formulas.js; UI reads race for min/max, HP/level, unarmed dice; **not** wired: small/big equipment gating, Titan Grip, per-robot DR tuning, feral/radiation auto-enforcement |
| Radiation bar | **Built** | GM-settable `rads` field, 0–1000 assumed scale, color-coded — but the Ghoul feral roll itself is not automated |
| Perk system | **Partially built** | `perksAllowed` computed and a "N perks available" alert shown; **no in-app perk-selection/spending UI** exists yet |
| DATA LOGS tab (GM push messages, targeted/global) | **Not built** | Still a placeholder string ("COMING SOON") |
| Combat module (hit rolls, encounters, enemy spawning) | **Not built** | Only ever outlined (Phase 1–4 plan: nav tabs → `active_encounter` data model → GM enemy-spawn tools → roll/damage loop). Nav tabs (STATUS/DATA/ARCHIVE, later relabeled) exist as stubs only |
| GEOGRAPHY tab (maps/locations) | **Not built** | Placeholder only |
| "Razak Terminal" holo-tape lore documents | **Not built** | `#wiki-overlay` / `#wiki-frame` iframe skeleton exists in `index.html`, no trigger/content logic wired |
| DT/DR per-damage-type grid | **Not built** | Was in original spec, quietly dropped in refactors — ask user if intentional |
| Avatar upload | **Not built** | Still a raw `avatar_url` string edited directly via Firebase Console; no in-app upload UI |
| Robot Repair Kit item | **Not built** | User said they'd make this item themselves |

---

## 3. Explicit User Frustrations / Corrections (signals for what NOT to repeat)

These recur across the *entire* transcript, not just once — treat them as standing behavioral rules for future work on this project:

1. **"Ask before you code."** Set in the very first exchanges ("you must ask me to proceed... I will want to ask questions before you continue to write code") and **restated at least three more times** later in the conversation, each time after Gemini jumped to code generation right after a clarifying-questions exchange instead of waiting for an explicit "go ahead."
2. **Never fabricate/hallucinate sourced content.** Gemini invented a Firestore schema the user never provided, and separately claimed to "extract" derived-stat and skill formulas from the uploaded rules manual — both times fabricating numbers (including reintroducing Carry Weight and Action Points, which the user had explicitly cut). User: *"I see now that you are hallucinating this data... I was hoping you would give me an online source... but you haven't even done that."* Twice more when asked to extract from specific manual slide numbers, Gemini's "extraction" was wrong, and the user gave up and manually typed the source data themselves both times.
3. **Do not do silent full-file rewrites.** The single most repeated failure mode: Gemini would say "replace the entire file" or "select all and delete," and in the process would silently drop working functionality (login screen CSS, scanlines, mobile responsive rules, the GM login button, inventory equip buttons, damage-calc logic, the Factory Reset button). This happened over a dozen times across the conversation. It eventually produced a **formal standing rule from the user** (verbatim): *"From now on, you are NOT ALLOWED TO GENERATE THE ENTIRE CODE BLOCK. You must suggest amendments to what we already have (uploaded file), or to replace sections, but not to generate the entire file again."* Gemini acknowledged this rule explicitly — and then **violated it again at least twice more** later in the same conversation, each time justified as "the safest fix." Treat targeted, minimal diffs as the default; full-file rewrites need explicit, freshly-obtained permission every single time, never as a unilateral "safety" choice.
4. **Never use vague/abbreviated editing instructions.** User, verbatim: *"I cannot really read code, so if you mention things like 'paste existing inventory generation code here'... I don't quite understand."* Always give complete, literal, pasteable content — never "keep the rest the same" or "re-paste standard logic here."
5. **Don't over-correct on narrow complaints.** A request to fix bold-text rendering on Safari led Gemini to apply a broad `font-weight: normal !important` + disabled font-smoothing override that changed the *entire* font's appearance; had to be fully reverted.
6. **Don't misattribute functional bug reports as taste/preference.** User explicitly corrected this: *"Lets make it clear I rejected the change because your solution didn't work, not because I am 'art director.'"*
7. **Verify before renaming/inventing racial or game vocabulary** — the "Barter" skill kept reappearing from generic Fallout training-data bias despite being explicitly excluded from this project's skill list.
8. User is a **self-described coding novice** and said so directly in the first message — needs explicit, step-by-step instructions (e.g. "what does 'initialize the Firestore document' mean") and has zero tolerance for jargon without a concrete action attached.
9. Debugging sessions repeatedly thrashed through multiple full-file "fixes" before finding a one-line root cause (e.g. an entire login-centering saga — "you led me on a wild goose chase" — that turned out to be a single `margin-top: auto` CSS line). Diagnose precisely (check for inline-style conflicts, single misplaced properties) before proposing rewrites or restructuring.

---

## 4. Open Questions / Unresolved Items

- **Level-up skill points formula mismatch**: user's own stated SPECIAL rule is `5 + (INT × 3)`, but the coded "Grant Level Up" GM action uses `5 + (INT × 2)`. Needs reconciling.
- **Max HP source of truth**: should it be a stored, GM-editable database field, or purely recalculated from formulas every render? The last unresolved bug fix in the transcript pushed toward "always recalculate," which may conflict with a future GM manual-HP-max-override feature.
- **DT/DR per-damage-type grid**: in original spec, never implemented, unclear if intentionally dropped.
- **Vault Points vs item-currencies**: two parallel currency mechanisms exist — confirm if intentional or should be unified.
- **Perk selection/spending UI**: numeric "perks available" is shown but there's no flow to actually pick/spend a perk (parallel to the existing skill-point draft-mode UI).
- **Ghoul feral mechanic automation**: is the "roll INT every 30 min at HIGH rads, auto-feral at VERY HIGH" meant to ever be automated in-app, or permanently GM-adjudicated with the app only showing a radiation-level warning?
- **Mobile tooltip behavior**: tap-to-toggle was the stated design intent for touch devices (since hover doesn't exist there), but the shipped code appeared to remain hover-only — worth re-verifying.
- **Combat module**: only ever outlined at a high level (4 phases: nav/tabs, `active_encounter` data model, GM enemy-spawn tools, roll/damage loop) — never actually built. This is the single largest deferred feature.
- **"Razak Terminal" and other holo-tape lore documents**: the overlay/iframe UI shell exists but nothing populates or triggers it.

---

## 5. Hosting / Firebase / Security

- Firebase project: **`foes-terminal`**; live hosting URL **`foes-terminal.web.app`**.
- Firestore structure: a single document `prisoncampaign/alpha_team` holds *everything* — `characters` (map of char-id → full character object), `access_codes` (map of passcode string → `{role, linked_char}`), `meta`. No sub-collections; no security rules were discussed or shown in the transcript at all — **access control today is entirely passcode-string-based inside the app, not enforced by Firestore security rules.** This is worth an explicit security review before wider use, since it implies the Firestore database may currently be open/writable by anyone with the project's client config (no evidence in the transcript of locked-down rules).
- Deployment is a strict two-step: `npm run build` (regenerates `dist/`) then `npx firebase deploy` (uploads whatever is in `dist/`) — `npm run dev` (localhost) has **zero** effect on the deployed site. This tripped the user up repeatedly (deploying a stale build).
- Real-time sync via a single `onSnapshot` listener on that one document, feeding a global `liveData` object that drives every render.
- Local dev tooling: Vite (`npm run dev`), Node/ESM throughout (not CommonJS) — this bit the user when `sync-obsidian.js` was first written with `require()`.
- Two terminals are needed simultaneously during content authoring: `npm run dev` (web server) + `npm run sync` (Obsidian watcher).

---

## 6. Timeline / Arc Summary

1. **Opening pitch** — stack overview, GM edit-mode and a "hidden difficulty modifier" design decision (Option C: GM-only hidden slider, chosen over player-visible input or mental math).
2. **User halts and resets expectations** — no code without discussion; declares novice skill level; uploads the real rules manual.
3. **Schema/formula hallucination crisis** — Gemini fabricates a DB schema and "manual-extracted" formulas (including reintroducing cut mechanics like Carry Weight/AP); user catches it twice, eventually types the entire skill/SPECIAL ruleset by hand.
4. **Foundation build** — `formulas.js` (user's math), 3-panel dashboard, CSS regression teaches "never silently drop code" lesson.
5. **Debugging saga** — CORS/ad-blocker issues, missing imports, duplicate declarations, login-centering "wild goose chase"; establishes patterns of thrash from full-file rewrites.
6. **Item/Trait system + Obsidian sync pipeline** — items.js/traits.js, tooltip system, `sync-obsidian.js` built and iteratively hardened (folder recursion, ESM conversion, forgiving regex).
7. **Equipment, Wallet, Level-Up draft mode** — equip slots, melee/ranged split, GM "God Hand" modal, draft-then-confirm skill spending.
8. **"The Great Split"** — main.js decomposed into firebase.js/views.js/controllers.js/main.js after repeated regressions from an overgrown single file; user sets the formal "no full-file regeneration" rule here.
9. **Character Creation + full Race system** — the largest single feature push: G.O.A.T. registration screen, 5 races with detailed lore/mechanics, radiation bar, perk-availability alert.
10. **Conversation trails off mid-bugfix** on the just-shipped Character Creation/Race system (race min/max enforcement, HP calc source-of-truth, racial unarmed damage display) — this is the actual hand-off point for continued work.
