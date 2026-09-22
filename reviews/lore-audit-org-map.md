# Lore audit: Organization Map vs vault

**Mode:** AUDIT. **Date:** 2026-09-22. **Author:** lore-keeper (advisory only; every item is a question for the GM).

**Scope read in full:** `reference/org-map.md` (A1–L119); `01_World Details/FOES Timeline.md`, `🕛 Timeline of Major Events.md`; all of `99_Backend Engine/GM Notes/*` and `Ideation & References/*`; `Locations/The Free City of Bandawang.md`, `Kulim.md`, `Fortress City of Penang.md`, `Great Jungle.md`, `Wira Bunker.md`, `Perdana Bunker.md`; `02_Factions/Sub-Factions/*`; `Sepuluh Ribu.md`, `Keturunans.md`, `Kosongs (Federation).md`, `Chosen (Federation).md`, `Federation Bunkers.md`, `Federation–Protectorate Labor Exchange.md`, `Bandawang Refugees.md`; `Pahlawan.md`; `Protiga.md`, `Riders.md`; `Religions/*`; `Fallout Details/Supermutan.md`, `Great War.md`; `99_Backend Engine/Tulang.md`, `To do.md`, the Taman Hidup report (grep); `A00_Introduction.md` (opening); all 31 data logs (via `src/dataLogs.js`); the Lim Clan / 1414 items and perk. `CONVERSATION_HISTORY` not used.

**Severity:** CHECK = the GM decides; NOTE = worth knowing. No BLOCKs: this is the GM's own material. In section 5, "CHECK" means the existing text conflicts with the newest plan.

**Counts:** Already resolved 9 · 1. Inconsistencies 30 · 2. Redundancies 16 · 3. Gaps 17 · 4. Real-world names 22 · 5. Existing content affected 24 · 6. "In the vault?" 10 boxes (all 10 exist; 2 under a different name) · 7. Dark-theme locations: 20 places (10 in the map, 10 in the vault).

---

## 0. Already resolved (GM answers, 2026-09-22; not flagged again below)

Source: `SCOPE_DECISIONS.md` ("Organization Map intake — GM answers") and CLAUDE.md World rules.

1. **Two Ishtar boxes** (K62, age 40, Indian, Protectorate agent; K76, age 30, Malay-Indian, triple agent run by "Uncle Loo"): to be settled during the heist brainstorm.
2. **K61 Pastor Steven** is a generic Church of NAS NPC. His opening line ("Muthu is the sole representative for PosLaju") is a paste error.
3. **Empty Importance lines** (K64 Slink Tan, K73 Nipu & Nipi, K67 Muthu, K80 Sudirman "Farmer") stay empty for now.
4. **Lim Clan / Lim Family**: the 1414 Triad is the main gang and the Lim family is part of it. Never "Lim Clan". (The vault files still to update are listed in section 5.)
5. **Boss Bob = Ketua Bob**, the same man.
6. **Abave replaces Genting everywhere.** There is no "Genting Buddhist Enclave". (Remaining "Genting" uses are listed in section 5.)
7. **Kept real names:** Sudirman, Harimau Malaya, a passing pre-War Perodua mention.
8. **Dark themes are canon but GM-led** (Employment Agency, slavery and indentured servitude, Kancil child labour, the labour camp). Nothing is to be invented about the PCs' own origin. The location list is in section 7.
9. **NPC notes** go to a new player-facing `People/` folder. PC backstories go into the in-app biographies. Prison Rags merges with the existing prison clothes item. Rakan item ids move from `1414_` to `rakan_`.

---

## 1. Inconsistencies

Ordered by how much each matters for play.

**1.1 CHECK: Tan and Choo personalities are swapped between the vault and the map.**
- Vault: the Tans are "traditionalist … ritualistic" and "cling to ritual and restraint"; the Choos are "violent, aggressive … thrive on chaos, spectacle" (`Tan Family.md`, `Choo Family.md`).
- Map: the Tans are "known for their hot-temper and proclivity for random violence" (L102); the Choos have a "silver tongue … cautious and careful decision making" (L108). The data log *An Old Town Household Diary* already follows the map ("always polite, always precise").
- The vault also has the two families in a "bitter blood feud" (`Choo Family.md`; `To do.md`: "inspired by the Hatfield–McCoy feud"). The map has them as sister families inside one triad that split only later, in D16.
- Newer: the map. Both vault notes need rewriting.

**1.2 CHECK: The vault's two timelines disagree on almost every post-war date.**

| Event | `FOES Timeline.md` | `🕛 Timeline of Major Events.md` | Other sources |
|---|---|---|---|
| Protectorate centralises | 2130 | 2115 | — |
| First contact with the South | 2150 | 2120 | — |
| Great Ghoul Massacre | 2196–2198 | 2130–2132 | — |
| Chosen emerge | 2200, seat at Wira Bunker | 2150, seat at Perdana Bunker | `Wira Bunker.md` / `Perdana Bunker.md`: 2200; `Federation Bunkers.md`: 2157; `v1 Prime Minister.md`: Tunku Adnan's term 2157–2175 |
| Campaign start | 2242 | 2247 | `A00_Introduction.md`: 2247; `The Ghoul Kings Plan.md`: 2242 |

- Newer: the Timeline of Major Events. It is the one `A00` links to, and 2247 matches the Prime Minister terms.[^1]
- D13 supersedes D16 but gives no dates, so the vault years still stand.

**1.3 CHECK: Who makes Kosongs.**
- D16 (the Next Days): "Known Anti-Federation activists are made into Kosongs", by the Federation.
- Everywhere else, the Protectorate makes them: both timelines, `Kosongs (Federation).md`, `01_Federation of Malaya.md`, and the map's own A1 (Protectorate propaganda denying "creating Kosongs from indentured servants").
- Newer: D16 is deprecated, so the vault version most likely stands.[^2]

**1.4 CHECK: "1414" names two different groups.**
- CLAUDE.md: "The Rakan Watch (formerly '1414 Gang')".
- B2 and CLAUDE.md: "The 1414 Triad is the main gang" (Sam Lim's).
- The map's L97 history makes the Rakans form *against* the triad, so a "formerly 1414 Gang" past makes no sense for them any more.
- Proposal: drop "formerly 1414 Gang" from the Rakan Watch world rule.

**1.5 CHECK: Triad ranks.**
- Sam Lim is "Red Pole" and "the leader of the 1414 Triad" (K84, L107).
- D14 uses the real ranks correctly: Iron Legs becomes "one of their Red Poles" (an enforcer), and his boss is "Mountain Master Tan (This is Slink Tan)".
- In real triads the Mountain Master (489) is the leader and the Red Pole (426) is a military commander.[^w1] As written, Slink holds a higher title than Sam Lim, the leader.
- Options: Sam Lim becomes "Mountain Master Sam Lim", or Slink Tan becomes "Red Pole Tan" and Iron Legs "one of his fighters".

**1.6 CHECK: Where Bandawang is.**
- `Ikhwan Mystery Brief.md`: "Seremban ([[The Free City of Bandawang]]) refugees". Seremban is south of KL.
- The map puts it north of KL:
  - it sits on the Longest Road between the Federation and the Protectorate (F23);
  - the triad "descended down Genting to occupy Bandawang" (L107);
  - the Federation battalion "arrives at the South of Bandawang" (D16);
  - the Federation Checkpoint is on its edge.
- Older notes also call the city "Wang" (`Tulang.md`, Taman Hidup report) and "Cash City" (`The Free City of Bandawang.md`).
- Newer: the map.

**1.7 CHECK: Bandawang's districts.**
- Vault: Axe Town, the Scrapyard, Old Town (the Chinese quarter, with the Federation embassy, recruitment centre and garrison) and New Town (Bob's, the prison and water plant).
- Map: North Bandawang, Bandawang Lama, Bandawang Baru (F22–F24). The map notes in `Maps/` already use Lama and Baru.
- Several things have no equivalent on the other side: the Scrapyard is absent from the map, and the Federation embassy or garrison is absent (the map has only a Checkpoint, F29, and a Recruitment Center, F30).
- Proposal: Old Town = Lama and New Town = Baru, but the GM needs to place the Scrapyard and the prison.

**1.8 CHECK: What blew up, and when.**
- Vault: the "Prison / water treatment plant" is one site (`The Free City of Bandawang.md`). Two treats "the Bandawang Waterworks" as the prison (D12); so does Iron Legs, whose "Black Water Dungeon" hoards water (D14).
- D16: the GK makes it seem the Federation "blown up the water treatment plant", but "the prison was blown up a few days in advance". That reads as two sites and two blasts.
- *Federation Gazette* hits the "water treatment facility"; *Requisition 88-C* says "The prison did not survive".
- The GM should confirm one site or two, and one blast or two.

**1.9 CHECK: Who is blamed for the blast.**
- The GK frames the Federation (D16, Setting). Boss Bob thinks it's a Federation false flag (D16).
- The Federation's investigation later finds "evidence that the Caliphate was behind the explosion" (D16, the Next Days). Who planted that is never said.
- The *Gazette* blames the Sepuluh Ribu, which is fine as Federation spin.
- With D13 superseding D16, it's unclear whether the GK plot still stands. See gap 3.4.

**1.10 CHECK: Where Bob wants to go, and who formed the Rakans.**
- K69: Bob "secretly wants to leave". K71: Najwa "is the reason Bob wants to escape to the Federation". D16: Faiz "arranged to bring Boss Bob back to the Caliphate". K79: Faiz's mission is to "change a life … Boss Bob".
- K69: "The Rakans would not have formed without Bob". L97: the leadership "started with Boss Bob and his father Bob".
- K72: Yam "lost her husband during the Lim-Axe war". The age gap between Yam (63) and Bob (45) is fine.
- The Rakans' name has three origins: "a store" (F22), "a pre-war distributor of kitchen supplies" (K69), and "the old Rakan wholesale supermarket" (L97).

**1.11 CHECK: The Sepuluh Ribu's defeat.**
- K81: Daz is "embarrassed for their defeat at Federation hands years ago".
- Vault: the defeat was the Great Ghoul Massacre, by *Protectorate* artillery (both timelines, `Sepuluh Ribu.md`). The clash with the Federation ended in a truce brokered by Tunku Adnan Rafa (`Sepuluh Ribu.md`).

**1.12 CHECK: When the Sepuluh Ribu formed.**
- `FOES Timeline.md`: 2090.
- `Sepuluh Ribu.md`: "in the aftermath of the Great War".
- `Prompt Generation.md`: the patch reads "EST. 2077".
- Minor, but it affects Daz and Uncle Loo's "pre-war" claims.

**1.13 CHECK: Where Abave's survivors came from.**
- L107: the Buddhist enclave came "from this bunker", the triad's private bunkers in the mountain.
- A1 (Nong Mei logs): the survivors sheltered in an Indian janitor's "humble round shack", with gangsters outside.
- G42: the Highlands were "shared" until the monks "forced the triad out". L107: the triad left "after desiring to disband the Genting casinos"; the line is ambiguous.

**1.14 CHECK: Axe Gang and ProTiga HQ.**
- D16: "itching to make Bandawang and the ProTiga HQ as their base … on the cusp of being able to do so".
- F27 and L92: they already live there and have taken over most of the tower.
- Vault (Axe Town): the Axe Gang "refuse outside appraisal or restoration (even basic electricity)" and keep a taboo on "disturbing the spirits". Map: they've spent years trying to break into the vault (F27) and power giant speakers from the machines.

**1.15 CHECK: Axe Gang weapons.**
- L92: they're called the Axe Gang "not because they use axes" but for modified guitars ("axes").
- Vault item `Axe Gang Cleaver` calls a meat cleaver their "signature weapon". J55 names the guitar the Axe Gang 'Axe'.

**1.16 CHECK: Ishtar's casino.**
- F31: "Syurga", British-themed, with staff in British uniforms and a Gergasi "Big Ben", in a pre-war supermarket.
- Data log *Ishtar's Grand Opening*: "ISHTAR'S — DROP ANCHOR IN NEW TOWN", nautical, "on the lake".
- Vault: an "Indian businessman" behind a "proposed new casino" in New Town.
- The nautical theme does fit K76 (he wants to buy a ship). Record against the Ishtar ruling.

**1.17 CHECK: Which casino is whose.**
- Vault: Boss Bob's "own casino", run by Bakri as a front for the Tans (`The Free City of Bandawang.md`).
- Map: the Tiger Palace, with the Lim family on the roof pagoda (F25).
- K59: Bakri might "go all in with Ishtar".
- *Baccarat Rules* only calls it "The Bandawang Casino".

**1.18 CHECK: Bandawang's police.**
- Vault: the "Bandawang Militia", "jointly-funded (all three gangs)".
- Map: the Bandawang Enforcers, "managed by the Tan Family" (L94, F34). F23 has Tan enforcers policing Lama.
- *Requisition 88-C*: the "Bandawang Guard".
- Who guarded the prison: the vault says the Choos ran it; K90 has Silas Tan running prison security; K58 says the Choos gifted Warden Robo.

**1.19 CHECK: Ghouls in Bandawang.**
- Vault: "There is no ghoul discrimination in Bandawang specifically".
- Map: the 1414 are "infamously ghoul phobic" (L107); the Lakeside Bar is a hidden ghoul speakeasy (F20); Nick hides as the Peng patriarch "due to the animosity against ghouls" (L103).

**1.20 CHECK: The Choos and Kulim.**
- K85: Niama Choo "secretly wants … to move operations and focus on Kulim".
- D16: the Choos "do not want to give up their most profitable operation" in Bandawang, while the *Lim* Clan moves to Kulim.
- D17: Kong worked for "the Choo Family of Kulim". `Kulim.md` makes Kulim the Tan–Choo stronghold, so the Choos are already there.

**1.21 CHECK: Pre-war America and Malaya.**
- A1 (pre-war logs): "the scary news that America is invading Malaya".
- `🕛 Timeline of Major Events.md`: Malaya is a US partner. It promises oil (2000s–2020s), sends reserves to the front (2067), and "serves as a launching pad for attacks into Vietnam" (2074).
- An invasion in 2077 is possible (the US annexed Canada), but the timeline never says so.

**1.22 CHECK: Pre-war log dates.**
- A1: "Pre-War Data Logs (Dated on 2077, before September)".
- Existing logs are dated 3 September 2077 (*Emergency Drill Record*) and 18 October 2077 (*Scheduled Service Interruption*).
- `Great War.md`: 23 October 2077.
- The existing dates are Fallout-correct; the "before September" rule would rule them out. Worth checking whether the GM meant "before October".

**1.23 CHECK: Muthu.**
- K67: a "Ghoul" who is "A jovial Sikh man with a yellow turban", in a "faded red Indian kurta".
- Muthu is a Tamil given name, while Malaysian Sikhs are Punjabi and carry Singh or Kaur.[^w2][^3]
- Choose one: keep "Muthu" and make him Tamil (drop the turban), or keep him Sikh and rename him (e.g. "Gurdev Singh").

**1.24 CHECK: The Kancil naming rule.**
- L113: Mothers take "an Indian name beginning with S".
- K74 Mother Senja and her friend Mother Sejora have Malay-sounding names ("senja" is Malay for dusk). Mother Shalini fits the rule.

**1.25 CHECK: Iron Legs's tagged skills.**
- D14 lists "Unarmed, Engineering, Sneak", identical to Two's (D12). This looks like a copy-paste; a fighter with A:10 would more likely tag Melee or Unarmed and Athletics.
- The box is also titled "Iron Legs" while the text says "You are Iron Leg".

**1.26 CHECK: Keturunan names.**
- D12: Keturunan Teoh (sanitation) and "the High Families (like the Keturunan Hashim)".
- L106: the "Hassan Keturunan" runs the newspaper.
- `Perdana Bunker.md` lists Nasaruddin, Ooi, Toh, Badrulhisham and Leong. `v1 Prime Minister.md` has PM Razwan Hashim.
- Teoh and Toh are near-identical. Hashim and Hassan: the GM should confirm whether they're two families or a typo.

**1.27 CHECK: The railway.**
- G37: the North South Railway "has been scavenged and taken apart". D16: the Protectorate wants to refurbish it.
- Both vault timelines make it the Protectorate's "central infrastructure project" since 2115 or 2130, with "Military presence grows along the NS Railroad" by 2230.
- Proposal: it's partly restored in Protectorate land and wrecked south of it.[^4]

**1.28 NOTE: How long ago the war was.**
- "The 200 Year Old Heist" (C10); *The City of the Dead*: "Nobody has called it new in two hundred years"; *On the Salt*: derricks leaning "for two centuries".
- In 2247 the war was 170 years ago (165 in 2242). KL *Baru* was founded 2150–2200, well under a century ago.
- These may be deliberate folk rounding. If not, "170-Year-Old Heist" loses the ring. Suggest "Two Centuries" stays as in-world exaggeration and the KLB line changes.

**1.29 NOTE: Gergasi origins.**
- D17: Kong was made in "pristine blue Protectorate steel corridors", and the Protectorate wants "the secret to Gergasi sentience".
- `Supermutan.md`: "It is uncertain how they came to be in Malaya". Consistent if Kong's origin stays a GM secret.
- K59: Bakri "grew up" in a Bandawang neighbourhood. This implies a born Gergasi or a late mutation, which the map doesn't explain.

**1.30 NOTE: Nick Peng and the family.**
- K75: Nick "distanced himself from the family".
- L103: he is secretly "their patriarch".
- These can both be true. Nick's stated role and Janson's are fine.

---

## 2. Redundancies (several names for one thing)

For each, the proposed name to keep is in **bold**.

1. **1414 Triad**, not "Lim Clan" (D16, L96), "Lim Clan Association" (vault) or "Lim Family" (F25). Resolved; see section 5.
2. **Choo Family**, not "Choo Clan" (D16), "Choo Gang" (D16) or "the Choos" (D16).
3. **Rakan Watch**, not "Rakan Gang" (L96), "Rakan Watch/Gang" (L97) or "Bandawang Rakans" (K69). K79 and the vault already use Rakan Watch.
4. **The New Peninsula Times**, not "The Peninsula Scoop". L106 is titled "The New Peninsula Times" but its body opens "The Peninsula Scoop is…". A1 uses the Scoop; I53 and K77 use the Times. The *Federation Gazette* (the "Official Registry") is a second Federation paper. Keep both, the Gazette as the state organ and the Times as the "independent" one. L106 also says the Chosen emerged "from the vaults"; canon says bunkers.
5. **Order of the Falling Gong** (the vault note's title), not "Order of the Fallen Gong" (L115, K57), "Cult of the Fallen Gong" (`The Free City of Bandawang.md`) or `[[Fallen Gong]]` (Taman Hidup). Its roles also differ: K57 has a "Gongkeeper" at a "temple", while the vault has a Gong-Bearer leading a Harmony. Proposal: Gongmaster Jane is the Gong-Bearer of the Bandawang Harmony.
6. **BAR Association** (vault), not "The Bar Council" (L105). The vault says the Association was founded in the ruins of the pre-war "Bar Council of Malaya".
7. **Gergasi** (the map's in-world word), not "Super Mutant" (K59, D17) or "Supermutan" (`Supermutan.md`, `PosLaju.md`, `Wataniah.md`, `Kosongs`). Items also say "Supermutant" and "Half-Mutant". Add Gergasi as an alias in `Supermutan.md`.
8. **Ishtar Device** (J55), not "Ishtar Shield" (A1, the child's log). The child could call it the Shield as a nickname. Sudirman's ultrasound leash on Terror (K83) seems to be the same technology, which is a good tie-in.
9. **Nasi Goreng Cicak** (J55), not "Nasi Cicak" (A1, the Rembau ad). Either works; pick one for the item id.
10. **Bandawang Lama / Baru / North Bandawang**, not Old Town / New Town / Axe Town. See 1.7.
11. **Bandawang Enforcers**, not Militia or Guard. See 1.18.
12. **Reformed Malayan Ringgit** (CLAUDE.md, timelines, `Economies`), not "Repurposed Malayan Ringgit" (`Wira Bunker.md`) or "Repurposed Malaysian Ringgit" (`Perdana Bunker.md`).
13. **Caliphate Dinar** as the currency name. F32 says a library search costs "a Caliphate token"; `The Caliphate.md` says "Caliphate Library Tokens" and `Economies` says the Dinar is a library token. It is the same object; say "one Dinar" in the Education Center note.
14. **ProTiga** (the map's spelling), not "Protiga" (vault note title and the maintenance log's "PROTIGA"). Pick one for glossary matching.
15. **"Steven" is used three times:** Pastor Steven (K61), Gardener Steve (K82, Protectorate-born), and Steven, the Protectorate garage engineer in Taman Hidup. The last two are both Protectorate expats. Consider renaming one.
16. **Eyepatches are used five times:** Slink Tan (K64), Silas Tan (K90), Warden Robo (K58), Tulang, plus Faiz's glasses. As a family trait for Slink and Silas it's a nice touch; for Tulang it isn't needed.

---

## 3. Gaps (unfinished text, placeholders, copy-paste errors)

1. **CHECK. D13, the heist:** "The Heist itself hasn't been thought of for now". There are four vault targets and no single one:
   - the ProTiga HQ vault (F27, D13);
   - the vault under Syurga (F31);
   - the "old prewar bank vault" Ishtar sends the PCs to (K62, K76);
   - the vault whose coordinates the GK fed Ishtar (D16).

   D16's "casino heist will be planned out and executed" names no casino. Muthu's PosLaju centre holds the "ProTiga vault keys" (K67). The office-lover subplot and the passcode "LUVU<3" (A1) need a location.
2. **CHECK. D13 vs D16:** D13 keeps "details within" D16 but doesn't say which. Still open:
   - whether Faiz still goes missing;
   - whether the GK frame-up still happens;
   - whether the Choos' betrayal stays;
   - whether the Kancil Orphanage still closes.
3. **CHECK. Who the Ghoul King is.** GM Notes: "Naim is secretly the ghoul king", in Taman Hidup. The map adds:
   - K77: the GK leads the cabal behind "Uncle Loo";
   - K76: Uncle Loo mentors Ishtar;
   - D16: the GK is personally in Bandawang ("rally the Rakans … Acting as an old instigator") and then "flees … deeper into Federation territory".

   Is Naim in two towns, or is the Bandawang instigator someone else? Uncle Loo is also described two ways: a "bedridden ghoul businessman" (K76) and "just the alias … for a secret cabal" (K77).
4. **CHECK. D16:** "the Protectorate is 'bankrolling' Ishtar and his  ." (sentence cut off).
5. **CHECK. L107:** "the Asing family (double check their name)". The vault's third family is the **Hei Ren Family** (`The Free City of Bandawang.md`: "Tan Family, Choo Family, Hei Ren Family (and others)"). "Asing" is Malay for "foreign" and "Hei Ren" (黑人) is Mandarin for "black person". Either could be the intended name, but both carry baggage, "Hei Ren" especially.[^5] Suggest a plain surname (Wong, Ong, Yap).
6. **CHECK. B3:** "Input a system for players to use special abilities (example given is" (cut off).
7. **CHECK. A1:** the Nong Mei brief repeats itself mid-sentence ("in pre-war r the Abave Buddhist Enclave detailing the story of Nong Mei) A series of 5…"), from a paste in the PDF.
8. **CHECK. K74:** Mother Sejora is named but never introduced. Is she the current head of the Kancils?
9. **NOTE. D12/D14/D17 (Two's "Da Bomb" virus, Iron Legs's Malek and Ah Piu, Kong):** K91 Ah Piu is "in development". He is central to two PC backstories: Iron Legs must bring him back alive, and Kong thinks Ah Piu sold him.
10. **NOTE. D14:** "a tragic accident (up to you to define, if not I have ideas)". This is intended to be left open.
11. **NOTE. K87:** "Rahul Tahar — Name for a future npc".
12. **NOTE. I54:** "Palm Oil (Come up with a new name?)" is still open. Ideas: "minyak sawit" as the in-world trade word, "Sawit-Diesel", or "ProTiga BioSawit" as the pre-war brand.
13. **NOTE. C5–C10:** the quest boxes are title plus giver only.
14. **NOTE. H45, L95, L99, L104, L105, L111, L112, L115, L117:** title-only boxes that defer to the vault. See section 6.
15. **NOTE. `GM Notes/MASTER STORY.md` and `Ideation & References/Character Ideas.md` are empty (0 words).** D13 is effectively the master story; it could be copied into `MASTER STORY.md`.
16. **NOTE. `v1 Prime Minister.md`:** Razwan Hashim's "Overview: The ." is empty, and the file contains a leftover ChatGPT instruction. Its Jeb Rafa section says "Leave this blank".
17. **NOTE. `Order of the Falling Gong.md` ends with a stray ChatGPT line ("Let me know if you'd like a shortened tagline…"),** which will show in the glossary tooltip only if it's the first sentence. It isn't, but it is player-visible prose.

---

## 4. Real-world names (check 4)

Sources for dates: [^w3][^w4][^w5][^w6][^w7].

| # | Name | Where | Why | In-world options | Flag |
|---|---|---|---|---|---|
| 1 | **Genting** | D16, L107 (×3), G42 and H44 (as "real-life equivalent") | Real resort and company (resort opened 1971) | **Abave** (ruled) | NOTE: resolved; swap on transcription |
| 2 | **Lim** as the triad family from Genting | K84, L107, vault | Genting was founded by **Lim Goh Tong**, and the resort is still run by his family.[^w4] A "Lim" triad descending from Genting's casinos reads as a jab at a real family. | Keep Sam Lim but move the Genting origin to another family, or rename Sam to another surname (e.g. Sam Loke, Sam Yeoh) | CHECK (sensitivity) |
| 3 | **"1414" Triad** | B2, K84, L107 | Echoes the real **14K** triad, which operates in Malaysia.[^w8] Probably intended (like "ProTiga"), but worth knowing. | "1313", "Sei Sap Sei" (Cantonese "44"), or keep | NOTE |
| 4 | **Sudirman** | K80, L96, vault, items | Sudirman Arshad (1954–1992), Malaysia's famous "People's Singer"[^w9] | — | NOTE: kept by GM choice |
| 5 | **Harimau Malaya** | K69 (Bob's jersey) | Official nickname of the national football team[^w10] | — | NOTE: kept by GM choice |
| 6 | **Perodua** | F27 ("based on the real Perodua Corporate HQ"); `The Free City of Bandawang.md` ("in-world equivalent of Perodua — needs an in-world brand name") | Founded 1993[^w5]. The GM kept a pre-War mention. | ProTiga (already the in-world answer) | NOTE: kept; the vault's "needs a brand name" note is now answered by ProTiga |
| 7 | **North South Highway** | G36 | The real North–South Expressway (PLUS), fully open 1994[^w3] | "the old Trans-Peninsular Highway", "Lebuhraya Semenanjung". "The Longest Road" already covers post-war use. | CHECK |
| 8 | **Penang Bridge** | G40 | Opened 1985[^w3] | "the Straits Bridge", "Jambatan Selat", "the Carrier Bridge" (post-war, after the aircraft-carrier patch) | CHECK |
| 9 | **PosLaju** | K61, K67, L111; vault faction `PosLaju.md` | Real Pos Malaysia courier brand | — | NOTE: precedent, long established in the vault |
| 10 | **PosMalaya** | `PosLaju.md` (origin) | Pos Malaysia | fine as a lightly altered name | NOTE |
| 11 | **Tenaga Nasional** | `Protiga.md` (merger of "Petrogas, ProCars Automotive, and Tenaga Nasional") | Real utility (TNB). The other two are already fictionalised. | "Tenaga Semenanjung", "Tenagatron" | CHECK |
| 12 | **Indah Water Konsortium** | data log *Scheduled Service Interruption* | Real company (1994) | — | NOTE: named precedent in the agent brief |
| 13 | **KL Sentral / Putrajaya / Shah Alam** | `Perdana Bunker.md` (KL Sentral), `Federation Bunkers.md` (Putrajaya; also contradicts the KL Sentral location), `Wira Bunker.md` (Shah Alam) | KL Sentral (2001) and Putrajaya (1990s) are post-1950s. Shah Alam is a place name (fine). | "Stesen Pusat", "Pusat Pentadbiran" | CHECK (also an inconsistency: Perdana is under KL Sentral in one note and Putrajaya in another) |
| 14 | **Grup Gerak Khas** | `Prompt Generation.md` (Sepuluh Ribu patch text) | Real Malaysian Army special forces (1965) | "Gerak Khas Sepuluh", or drop it | CHECK (only in an image prompt) |
| 15 | **P. Ramlee** | `To do.md` ("P. Ramlee Impersonators" gang) | Real icon (d. 1973) | "Seniman Agung impersonators", or keep as tribute | NOTE (pre-divergence era, but a real person) |
| 16 | **Shao Shan village** | D14 | Shaoshan is Mao Zedong's birthplace. Probably a riff on Shaolin. | "Shao Lan", "Siu Shan" | NOTE |
| 17 | **Frederick Douglass quote** | A1 (Uncle Loo) | Real person, real quote. Pre-divergence, so allowed. | — | NOTE: fits "pre-war ex-politician" |
| 18 | **Bar Council of Malaya** | `The BAR Association.md` | Real body | — | NOTE: already parodied |
| 19 | **Wataniah, Special Branch** | vault (many) | Real institutions, pre-divergence | — | NOTE: precedent |
| 20 | **RNR** | F33, L103 | The PLUS highway rest-and-relax stops (1990s) | fine: a term, not a brand | NOTE |
| 21 | **"Kancil"** | L113 | Also the Perodua Kancil car (1994)[^w5]. Kancil means mouse-deer, an everyday word. | — | NOTE |
| 22 | **"YB"** | both timelines (Chosen "YB", "Yang Bawah") | A pun on the real honorific Yang Berhormat | — | NOTE: works as satire of the institution |

Also checked and fine, not flagged: Rock Kapak and Rock Jiwang (genres), kapcai (slang), Type 96 LMG (a real 1930s weapon, pre-divergence), Taman Rimba Templer (a 1950s park, pre-divergence), Poseidon Oil, RobCo, Mr Handy (Fallout).

**Language and culture checks from the same pass:**

- **CHECK. L119 "An Mamak deity" / A1 "an Indian janitor … embraced buddhism".** *Mamak* specifically means Tamil **Muslim** men and the Indian-Muslim community.[^w11] A Mamak man converting to Buddhism and being deified by monks touches Islam, the sensitivity area the brief names. Suggest "a Tamil deity" or "an Indian deity", or make the janitor Tamil Hindu or Buddhist from the start. The name is right: 浓眉 *nóng méi* means "thick eyebrows".
- **CHECK. L93 "shrines to Guan Yin and to the Giant Datuk".** The real practice is **Datuk Gong / Na Tuk Kong**, a guardian spirit shown as an old Malay man, widely kept by Malaysian Chinese.[^w12] "Giant Datuk" reads as a slip; suggest "Datuk Gong".
- **NOTE. K81 "a kopiak on his head":** probably *kopiah* (skullcap).
- **NOTE. F28 "Sekitar Litar":** this reads as "around the circuit" in Malay. A track would be "Litar …" (e.g. "Litar Sekitar", "Litar ProTiga"). Fine if meant as a sign fragment.
- **NOTE. K59 "Bandwang"** and **K67 "Mouth is one of PosLaju's riders"** are typos.
- **CHECK. The data log *Undelivered*: "fed us through the winter".** Malaysia has no winter (it has monsoon seasons). Suggest "through the monsoon". A1's "nuclear winter" is fine, since it's post-war climate.

---

## 5. Existing content affected (would need updating to match the map)

**Vault notes:**

1. **CHECK. `Locations/The Free City of Bandawang.md`:**
   - "Lim Clan Association" ×4, "Lim-aligned", "pro-Lim";
   - districts Axe Town / Scrapyard / Old Town / New Town (1.7);
   - "Bandawang Militia" (1.18);
   - "no ghoul discrimination" (1.19);
   - Boss Bob's own casino run by Bakri (1.17);
   - the Axe Gang's taboo on restoration (1.14);
   - "Perodua — needs an in-world brand name" (now ProTiga);
   - "Vokalist Sudirman" (the map says Vokalis);
   - "Hei Ren Family" (3.5);
   - "Cult of the Fallen Gong" (2.5);
   - the Federation embassy and garrison in Old Town (the map has a Checkpoint and a Recruitment Center).
2. **CHECK. `02_Factions/Sub-Factions/Tan Family.md` and `Choo Family.md`:** personalities swapped and the feud (1.1). Neither mentions the 1414 Triad. Add L102's and L108's dragon-tattoo marks (hands for the Tans, faces for the Choos).
3. **CHECK. `Items/Weapons/Lim Clan Straight Razor.md`:** name, and "Tan/Choo subfamilies of the Lim Clan Association".
4. **CHECK. `Items/Armor/Lim Clan Tailored Suit.md`:** name, "Lim Clan crest", "Lim Clan Association". The map dresses the 1414 in "sharp black pinstripe suits" (L107), so the item fits once renamed.
5. **CHECK. `Character Details/Perks/Triad Ties.md`:** "Lim Clan" ×2, key `vendor_discount_lim_clan`.
6. **CHECK. `Items/Consumables/Ah Beng's Moonshine.md`:** "Lim Clan Association gambling dens".
7. **CHECK. `Items/Armor/1414 Windbreaker.md` and `Items/Weapons/1414 Chain Whip.md`:** ids `1414_*` (already ruled to move to `rakan_`). The windbreaker is "gang-colored … faded red and black", which are the **Axe Gang's** colours (F24). L97 says the Rakans "have no formal dress or wardrobe". The chain whip's "bike shop" framing is Axe-Gang flavour too.
8. **CHECK. `Items/Weapons/Axe Gang Cleaver.md`:** see 1.15.
9. **CHECK. `02_Factions/The Federation/Kosongs (Federation).md`:** consistent with the vault but not with D16 (1.3). No change if D16 is dropped.
10. **CHECK. `02_Factions/The Federation/Sepuluh Ribu.md`:** has no Bandawang cell. The map adds Daz (K81) as Bandawang leader, Uncle Loo as funder (K77), and the New Peninsula Times cipher (I53). Wira-vs-Perdana emergence (1.2).
11. **CHECK. `Fallout Details/Supermutan.md`:** no "Gergasi" alias (2.7).
12. **CHECK. `02_Factions/The Federation/Keturunans.md`:** add Teoh (sanitation, "Janitors of the Bunker"), Hashim (a High Family) and Hassan (mass communication) from D12 and L106.
13. **CHECK. `02_Factions/The Caliphate/Pahlawan.md`:** fine. Add Faiz as the example Pahlawan (K79). His "change a life" mission fits the note's personal-Hajj framing.
14. **CHECK. Both timelines:** dates (1.2), the pre-war US relationship (1.21), the railway (1.27). Neither covers the Bandawang events at all.
15. **CHECK. `99_Backend Engine/GM Notes/🕵️ Ikhwan Mystery Brief.md`:** "Seremban (The Free City of Bandawang)" (1.6). GM-only, so low urgency.
16. **NOTE. `99_Backend Engine/Tulang.md` and the Taman Hidup report:** "Wang (Cash City)", "Club Suzy … Choo Family". Rename Wang to Bandawang if they're the same city.
17. **CHECK. `Religions/Order of the Falling Gong.md`:** add a Bandawang Harmony and Gongmaster Jane (K57), plus the quest "Spread the word!". `Quest Ideas.md` adds "The Fallen Gong and their missile bunker base", which matches the vault's missile-silo-lid secret.

**Data logs (31 checked):**

18. **CHECK. *An Old Town Household Diary*:** "the Lim Clan used to be different". Change to "the Triad" or "the Lims". "Old Town" → Lama.
19. **CHECK. *Session 1 Recap*** (player-visible, in `Bandawang/`): "The party woke up in the Bandawang Labor Camp with no memory of how they arrived." This is a seed placeholder that states the **PCs' origin**, which CLAUDE.md now says never to invent. Replace or delete before play.
20. **CHECK. *Ishtar's Grand Opening*:** Syurga and British theme vs "Ishtar's" nautical theme, and "New Town" (1.16). Hold until the Ishtar ruling.
21. **CHECK. *Shipment Manifest 0447*:** "FEDERATION WATER AUTHORITY — ORIGIN: Bandawang Treatment Facility". In the map the Free City runs the plant, and Two plans to *hand* it to the Federation (D12). A Federation manifest implies the Federation already controlled it. Either make it a pre-explosion supply contract or change the issuer. *Field Note, Unfiled* ("Water Authority"), *Domestic Water Entitlement* and *Public Notice №118* are Federation documents filed under `Found Texts/Bandawang`. That's fine if they were found at the Checkpoint or Recruitment Center; say so in the find-location.
22. **CHECK. *Requisition 88-C*:** "Bandawang Guard" (1.18) and "Works" clearance. The four construction Protectrons waiting in a salvage yard could be the origin of the map's **Protectron Yard** (F21: nine construction Protectrons building in Baru). That's a good tie-in if the numbers are reconciled.
23. **CHECK. *Undelivered*:** "winter" (section 4). "Boss Bob's crew fed us" and a Federation sign-up fit F30 well.
24. **NOTE, the rest:**
    - *Baccarat Rules*: "the house doesn't call the Protectorate". The Enforcers or the Federation would be the law nearer home.
    - *Rakan Watch Trade Ledger*: shows the Rakans smuggling "not bike parts". That's darker than L97's civilian watch, and fine if intended.
    - *Peribahasa Baru*: "Dua besar, satu meja" (two big men, one table) for a *three*-boss council. It could become "Tiga besar" or stay as a joke.
    - *The City of the Dead*: "two hundred years" (1.28).
    - *Casino Floor Security Log*: fine. Name the casino once decided.
    - *Bandar Buaya Welcomes the Changed*: its denial of a crocodile creature hints at G38/G39 (Clark, Buayans) without stating it. Good.
    - *Night Watch — Edge Post*: already matches A1's Restless Song idea and the map's jungle logs.
    - *Federation Gazette*: fine as Federation spin (1.9).
    - Clean against the map: *A Bartender's Notebook*, *Marked in Chalk*, *ProTiga Maintenance Log*, *Scrapyard Wall*, the four *Before the War* logs (dates aside, 1.22), *A Place for Every Citizen*, *The Sixth Week*, *Conditions of Admission*, *Notice of Determination*, *On the Salt*, *The Defenders of Taman Templer*.

**Also:** CLAUDE.md's "Rakan Watch (formerly '1414 Gang')" (1.4).

---

## 6. "In the vault?" check

| Box | Map says | Vault note | Exists? | New map detail to add |
|---|---|---|---|---|
| **H45** | ProTiga (In the vault) | `01_World Details/Protiga.md` | Yes (spelled "Protiga") | HQ in North Bandawang, a 20-floor bomb- and quake-proof tower now held by the Axe Gang, with a sealed vault in the basement (F27). The Sekitar Litar test track (F28). "ProTiga helper" handheld (K82). North Bandawang took a nuclear strike (F24). A pre-war PR article on its formation is planned (A1); check it against the note's Petrogas / ProCars / Tenaga Nasional merger. ProTiga also built the Federation bunkers (`Wira Bunker.md`), a link to the heist. |
| **G40** | Fortress City of Penang (in the vault but add to it) | `Locations/Fortress City of Penang.md` | Yes | Penang Bridge partly collapsed and rebuilt from a grounded aircraft carrier's husk. Wastelanders think it "basically impossible to get in", guarded by "the thunder of the gods" (artillery). "Values education and technology". Only vital merchants admitted (A1 bartender). Hot showers, air-conditioning, stable power (A1). |
| **L95** | Caliphate (In the vault) | `02_Factions/The Caliphate/The Caliphate.md` | Yes | Wants a West Coast foothold but avoids overt confrontation (D16). Pahlawan Faiz working outside Caliphate lands (K79, D13). Library terminal access at Bandawang's Education Center for a Caliphate token (F32). Interest in pre-war US military caches (D13, K79). |
| **L99** | Federation (In the vault) | `02_Factions/The Federation/01_Federation of Malaya.md` | Yes | Bandawang Checkpoint (F29) and Recruitment Center, whose applicants "never really returned" (F30, a hint). Colonel Rizal, a ghoul Sword colonel (K86). Keturunans Teoh, Hashim and Hassan (D12, L106). The New Peninsula Times as a Federation-backed paper (L106). The Ipoh marble-quarry rumour (A1). The D16 "aid battalion" if kept. |
| **L104** | Protectorate (In the vault) | `02_Factions/The Protectorate/01_The Protectorate.md` | Yes | Bankrolling Ishtar and a casino at the Federation border (K62, K76, D16). Interest in the North South Railway (D16, G37). Propaganda denying Kosongs are made from indentured servants (A1). Protectorate expats: Cheryl Chia (K88) and Gardener Steve (K82). Kong's lab origin (D17; GM secret, keep out). Geologist-soldier jungle soil study (A1). |
| **L105** | The Bar Council (In the vault) | `02_Factions/Sub-Factions/The BAR Association.md` | Yes, **under a different name** | Nothing new in the map (title only). Settle the name (2.6). |
| **L111** | PosLaju (In the vault) | `02_Factions/Sub-Factions/PosLaju.md` (+ `01_World Details/Riders.md`) | Yes | A Bandawang branch and a PosLaju centre holding the pre-war ProTiga vault keys (K67). Muthu as its rider (K67). The Postmaster regions list has no Bandawang station yet. The vault's "biker sub-faction works on bikes alongside the Axe Gang" (`The Free City of Bandawang.md`) isn't in the map; check whether it still holds. |
| **L112** | Malayan Chamber of Commerce (In the vault) | `02_Factions/Sub-Factions/🏛️Chamber of Commerce 马来亚總商會.md` | Yes | Nothing new in the map (title only). |
| **L115** | Order of the Fallen Gong (In the vault) | `Religions/Order of the Falling Gong.md` | Yes, **under a different name** | Bandawang temple and Gongmaster Jane (K57). Quest "Spread the word!" (K57). Settle the name and the Harmony vs temple wording (2.5). |
| **L117** | The Path (In the vault) | `Religions/The Path.md` | Yes | Faiz explains his Pahlawan duty to the PCs (D13). Nothing else new. |

**Not marked "in the vault", but new and with no vault note yet** (candidates for `People/` or faction notes): the 1414 Triad (L107), Axe Gang (L92), Rakan Watch (L97), Employment Agency (L93), Bandawang Enforcers (L94), The Council (L96), Peng Brothers (L103), Arborists (L109), Kancil Orphanage (L113), Church of the New Age Saints (L114), Abave Buddhist Enclave and Nong Mei (L118, L119), Abave (H44), Ma'qil Monastery and Abave Highlands (G41, G42), Bandar Buaya and the Buayans (G38, G39; GM secret), the Longest Road and North South Railway (G36, G37), all F20–F34 Bandawang locations, and the transport and lore boxes I47–I54.

---

## 7. Dark-theme locations (GM-led canon; for reference only)

**Map:**
- A1: Employment Agency call log (a 100-year indenture); Protectorate propaganda about Kosongs from indentured servants.
- D12, D14, D17: PC backstories (PC origin; D17 has the Bandawang Labor Camp and Kong "sold as a slave").
- D13: the PCs surviving the prison.
- D16: families outside the prison looking for their children; Gergasi "made into slaves"; activists made Kosongs; the Kancil Orphanage closes.
- E18: Battle of the Bands fighters "captured slaves or people in debt".
- K71: "the truth behind the Kancil's".
- K74, K78: Mother Senja; the Marisni's (Kancil child mechanics).
- K89, K90: Ying Ying and Silas, prison plants from the prequel.
- L93: the Employment Agency, formerly "the Slaves guild".
- L113: the Kancil Orphanage's child labour.

**Vault:**
- *Session 1 Recap* (the labour camp and the PCs' origin, player-visible; see 5.19).
- Both timelines: "indentured labor programs and Penal Slave Battalions".
- `Kosongs (Federation).md`: slavery and slaver outposts.
- `Haram Bazaar.md`: "slave labor contracts".
- `Federation–Protectorate Labor Exchange.md`.
- `The Free City of Bandawang.md`: the "labor underclass … debt to the gangs".
- `Chamber of Commerce`: "Labor discipline".
- `01_Federation of Malaya.md`: "perpetual debt" contracts.
- `Order of the Falling Gong.md`: "Gonglings", children "used as … ritual instruments".
- `Bestiary/Supermutant Labourer.md`, which has a foreman.

---

## Footnotes

[^1]: Inference. `A00_Introduction.md` links `[[🕛 Timeline of Major Events|Timeline]]` and states 2247. The Prime Minister terms run to 2247. `FOES Timeline.md` has no wikilinks and matches the older 2242 in `The Ghoul Kings Plan.md`.
[^2]: Inference. D13 says the D16 timeline "is deprecated", and A1 (current) describes the Protectorate side of the Kosong story.
[^3]: Inference. That Muthu is a Tamil name is general knowledge, not from a search result. The Sikh naming convention is sourced in [^w2].
[^4]: Inference. This is a proposal to make the two sources agree, not a stated fact.
[^5]: Inference. The Malay and Mandarin meanings are general knowledge. Whether "Asing" or "Hei Ren" is the intended third family is unknown; L107 itself asks for a double-check.

**Web sources (9 searches):**
[^w1]: Triad (organised crime), Wikipedia: https://en.wikipedia.org/wiki/Triad_(organized_crime)
[^w2]: Sikhism in Malaysia, Wikipedia: https://en.wikipedia.org/wiki/Sikhism_in_Malaysia ; Punjabi Malaysians: https://en.wikipedia.org/wiki/Punjabi_Malaysians
[^w3]: Penang Bridge, Wikipedia: https://en.wikipedia.org/wiki/Penang_Bridge ; North–South Expressway, AARoads: https://wiki.aaroads.com/wiki/North%E2%80%93South_Expressway_(Malaysia)
[^w4]: Genting Highlands, Wikipedia: https://en.wikipedia.org/wiki/Genting_Highlands ; Lim Goh Tong: https://en.wikipedia.org/wiki/Lim_Goh_Tong
[^w5]: Perodua, Wikipedia: https://en.wikipedia.org/wiki/Perodua ; Perodua Kancil: https://en.wikipedia.org/wiki/Perodua_Kancil
[^w6]: Taman Rimba Templer and Indah Water dates are not searched; they rest on the agent brief's precedent list.
[^w7]: Grup Gerak Khas (1965) and KL Sentral (2001) dates are general knowledge, not searched.
[^w8]: Organized Crime on the Belt and Road, Jamestown: https://jamestown.org/organized-crime-on-the-belt-and-road/ ; BenarNews: https://www.benarnews.org/english/news/malaysian/gang-leader-04212021181737.html
[^w9]: Sudirman (singer), Wikipedia: https://en.wikipedia.org/wiki/Sudirman_(singer)
[^w10]: Malaysia national football team, Wikipedia: https://en.wikipedia.org/wiki/Malaysia_national_football_team
[^w11]: Mamak people, Wikipedia: https://en.wikipedia.org/wiki/Mamak_people
[^w12]: Na Tuk Kong, Wikipedia: https://en.wikipedia.org/wiki/Na_Tuk_Kong ; Datuk Keramat: https://en.wikipedia.org/wiki/Datuk_Keramat
