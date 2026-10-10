# Timeline consolidation: lore audit

**Mode:** AUDIT. **Date:** 2026-10-06. **Target:** `01_World Details/🕛 Timeline of Major Events.md` ("the canon note").

Everything here is advice. Every flag is a question for the GM, and nothing in the vault has been changed.

**Sources read in full:** the canon note; `99_Backend Engine/FOES Timeline (superseded 2026-10).md`; `reference/northern-conflict.md` ("NC"); `reference/org-map.md` ("OM", boxes A1–L119); all six files under `Modules/New Federation Blues/`; every Federation, Protectorate, Caliphate, UCL and Bandawang faction note; the Locations, People and Religions notes that carry history; every data-log body in `Found Texts/` (extracted from the JSON); `A00_Introduction.md`; `SCOPE_DECISIONS.md` (rulings of 2026-09-22 and later); `QUEST_JUTA_SUCCESS.md`.

**Grep:** `20[7-9][0-9] | 21[0-9][0-9] | 22[0-9][0-9] | years ago | generation(s) | two centuries | century | decades | 170 | NN years | years later/after | since the bombs/war` over the whole vault. `CONVERSATION_HISTORY` and `Media/` were excluded. The rest of `99_Backend Engine` was included as GM-only background. That gave 113 raw hits plus the relative-era hits. Section 4 lists all of them.

**Severity count (rows across sections 2, 3, 7 and 11):** 15 BLOCK · 38 CHECK · 20 NOTE. Many sweep rows (section 11) are the fixes for findings in section 2, so the same problem can be counted twice. Counting distinct problems only, there are 4 BLOCK findings: I-1, I-2, I-5 and I-6. There are also 13 questions for the GM (section 12).

---

## 1. The three things that matter most

1. **One war is told twice, sixty-six years apart.** In the canon note, the *Great Ghoul Massacre* is a Sepuluh Ribu offensive in **2130–2132**, before the Federation exists. Your own notes put a ghoul army marching north and being broken by Protectorate artillery in **2196–2198**: NC "Victory Over The Federation", and the superseded timeline's "2196–2198 – The Great Ghoul Massacre (a.k.a. The Battle for the Line)". Both describe the same battle: a ghoul push north, destroyed by entrenched guns, a pyrrhic Protectorate victory, a Great Shame for the ghouls. **Recommendation: a single war in 2196–2198, fought by the Federation's army.** Several other dates then settle without further changes (Q1).
2. **The Chosen emerge in three different years in player-facing notes.** The canon note and the Federation note give **2150**. `02_Factions/The Federation/Federation Bunkers.md` gives **2157** (lines 25 and 100). `Locations/Wira Bunker.md:22` and `Locations/Perdana Bunker.md:20` give **2200**. Players can open all of them. **Recommendation:** the Chosen emerge in 2150, and **2157** becomes the year the Federation is formally constituted. That matches the term start you drafted in `Ideation & References/v1 Prime Minister.md:34`.
3. **New Federation Blues cannot be a "prequel".** Its refugees are fleeing the Kelam Sungai explosion. `A00_Introduction.md` presents its premise (Wataniah volunteers, a murdered politician) as *this* campaign in 2247. The module index calls it "the story that runs before the main campaign". The Kelam Sungai roster says the explosion "sits upstream of both". **Recommendation:** set the module in 2247, in the weeks after the explosion, alongside the main campaign's opening (Q3).

---

## 2. Inconsistencies (most important for play first)

| Sev | # | Subject | Versions | Which looks newer / recommended |
|---|---|---|---|---|
| BLOCK | I-1 | Chosen emergence | 2150: canon note "2150 – Rise of the Chosen"; `01_Federation of Malaya.md:26` "around **2150**". 2157: `Federation Bunkers.md:25`, `:100`; `v1 Prime Minister.md:34` (term 2157–2175). 2200: `Locations/Wira Bunker.md:22`, `Locations/Perdana Bunker.md:20`, superseded timeline "#### 2200 – Rise of the Chosen". | 2150 is canon by your ruling of 2026-09-22 (#2). The 2200 dates are copies left over from the superseded draft. 2157 can be kept as the year of the formal founding (Q2). |
| BLOCK | I-2 | Protectorate centralisation | 2115: canon note. 2130: `02_Factions/The Protectorate/01_The Protectorate.md:24`, NC "Faction Lore – The Protectorate", superseded timeline. | Recommend **2130**: three sources agree on it. The canon note's 2115 looks like it was moved to make room for a 2120 first contact and a 2130 massacre[^1]. |
| CHECK | I-3 | Great Ghoul Massacre | 2130–2132, Sepuluh Ribu alone, before the Federation: canon note; `Sepuluh Ribu.md:19` (placed before the Chosen). 2196–2198, a Federation army: NC; superseded timeline; your recollection in the brief. | Q1. Recommend 2196–2198. A second clue points the same way: the superseded 2242 stub has "a generation born after the Great Ghoul Massacre". That works for 2198 and not for 2132. |
| CHECK | I-4 | First Protectorate contact with the south | 2120, with the Sepuluh Ribu: canon note. 2150, with "the Federation of Malaya from the South": NC; your recollection. 2150, with the Sepuluh Ribu: superseded timeline. | Recommend 2150 (Q2). |
| BLOCK | I-5 | Fate of Harapan | Sealed by rubble, never opened, archive intact: `Federation Bunkers.md:153–183`, `Chosen (Federation).md:9`, `Keturunan.md:17` (newest, commit 8dfd829 of 5 Oct). "Took a direct hit … monorail lines … sealed with several inches of concrete": `01_Federation of Malaya.md:36`. "Not much is known": `:64`. "Destroyed" with leadership and archives: `Polis (Federation).md:13`, `:33`. "Now-defunct": `Federation Bunkers.md:92`. | The newest version is the sealed one. Sweep rows S-6 to S-10. |
| BLOCK | I-6 | Ghoul King's rise stated as fact in player-facing text | `Sword (Federation).md:7` ("The arrival of the Ghoul King acts as a catalyst"), `:23`, `:65` ("sleeper cells for the Ghoul King's uprising"), `:67`, `:107` ("Secret orders given by the Ghoul King are spreading"); `Prime Minister (Federation).md:77` ("As the Rise of the Ghoul King begins"). | CLAUDE.md treats him as rumour, and the Sword-subversion plan is GM material (`The Ghoul Kings Plan.md`, "The Sword as a Trojan Horse"). Recast these as rumour, or move them into `[!gm]` callouts (S-14 to S-18). |
| CHECK | I-7 | When New Federation Blues happens | "the prequel module — the story that runs before the main campaign": `New Federation Blues.md:4–5`. Refugees from the Kelam Sungai explosion are already in Taman Hidup: `Tulang.md:9`, `🕵️ Ikhwan Mystery Brief.md:26`, `Bandawang Refugees.md:1`, which SCOPE ties to the same explosion. The explosion happens "days before the campaign begins": `Kelam Sungai.md:6`. `A00_Introduction.md:44` gives the module's premise as "the campaign". `The Ghoul Kings Plan.md:7` says "years leading up to 2242". | Q3. Recommend 2247, the weeks after the explosion[^2]. |
| CHECK | I-8 | When the PCI begins | "2150–2200 … the PCI program is introduced": canon note. "Overseer Ikhwan was one of the first field administrators to push for PCI": `Public Citizenship Initiative (PCI).md:20`. Ikhwan is "Grandson of Razwan Hashim" (`GM Notes/Taman Hidup (Wataniah Report).md:47`); Razwan's term is 2175–2195 (`v1 Prime Minister.md:39`). | Even if he were Razwan's son, Ikhwan could not be an early PCI administrator before about 2200 and still be murdered as an active overseer in 2247[^3]. Recommend the 2230s (Q4). |
| CHECK | I-9 | Ikhwan's father or grandfather, and his name | Player-facing: "the **son** of our Father of Development **Razak** Hashim" (`Taman Hidup Wataniah Report.md:18`). GM: "**Grandson** of **Razwan** Hashim" (`GM Notes/Taman Hidup (Wataniah Report).md:47`). PM note: "Razwan Hashim, Father of Development". | Use Razwan and grandson. "Razak … Father of Development" is also almost word for word the real Tun Abdul Razak's honorific (section 7). |
| CHECK | I-10 | Where the Perdana Bunker is | Under KL Sentral: `01_Federation of Malaya.md:40`, `Locations/Perdana Bunker.md:13`. "Beneath the old Putrajaya complex": `Federation Bunkers.md:90`. Harapan is also "beneath Putrajaya" (`:157`). | Recommend KL Sentral, the majority view, and leave Harapan alone under Putrajaya (Q6). It is the only version that keeps "headquartered in KLB" true. |
| CHECK | I-11 | Is KLB a capital or a ruin? | Capital: canon 2150 ("headquartered in Kuala Lumpur Baru"); `01_Federation of Malaya.md:15, 28`. "Once the beating capital … now a collapsing ruin": `Kuala Lumpur Baru.md:6`. "The ministries are gone": `Found Texts/The Peninsula/The City of the Dead.md:6`. | Both can be true if the Federation governs *from the bunkers beneath* a surface it never reclaimed. The proposed timeline says so in the 2150 entry. Two lines change (S-11, S-12). |
| CHECK | I-12 | Jeb Rafa's age | "Young, idealistic", and "grandson of Tunku Adnan" (`Prime Minister (Federation).md:59, 65`). Adnan led the Chosen out of the bunkers (2150 or 2157). | His grandson would be about 70 in 2247[^4]. Make him a **great-grandson** (Q7). |
| CHECK | I-13 | RMR name and origin | "Reformed Malayan Ringgit": canon note and CLAUDE.md. "RMR (Repurposed Malaysian Ringgit)", with the 2nd PM "reintroducing" it: `Prime Minister (Federation).md:45`. | The name is wrong there. "Reintroducing" fits a currency the Chosen stamped in the 2150s that then lapsed, so it can stay (S-19). |
| CHECK | I-14 | When the Wataniah was reformed | Recent: `Polis (Federation).md:8` ("overworked of late … leading to the reformation of the Wataniah"). Long-standing: `People/Chang.md` ("investigating … longer than most of his colleagues have been alive … remembers how the Wataniah was supposed to work"). No date: `Wataniah.md:9`. | Q5. Recommend around 2200, after the losses in the north. |
| CHECK | I-15 | Kosongs: before or after the 2230 deal? | Experiments begin after the Massacre: canon note. "Created as part of the Federation–Protectorate Labor Exchange deal" (signed 2230): `Kosongs (Federation).md:5`. "Initially used within Protectorate borders": `:17`. | Kosongs are made first and exported later. Reword `:5` (S-21). |
| CHECK | I-16 | Who the Massacre's ghouls were | Sepuluh Ribu acting alone: `Sepuluh Ribu.md:19`. A Federation army of ghouls under Chosen command: NC. | This follows Q1. If 2196 stands, the Sepuluh Ribu veterans in the Sword are the army's backbone (S-13). |
| CHECK | I-17 | Which bunker the Chosen came out of | "Emerged from Wira Bunker": `Sepuluh Ribu.md:21`. Perdana and Wira emerged together: `Federation Bunkers.md:25, 100`. The Sword began as Perdana's security detachment: `Sword (Federation).md:5`. | Both bunkers at once (S-13). |
| CHECK | I-18 | When the triad came down from Abave | `Ketua Bob.md`: Bob (45) was there at the founding ("The Rakan Watch would not have formed without Bob"), "back when the 1414 Triad was … descending into Bandawang". `Rakan Watch.md:6`: Bob's father led it before him. `Sam Lim.md`: Sam (65) "grew up with the horrors of that war". | Bob must be an adult at the founding, so the triad reaches Bandawang no earlier than about 2220. Sam's childhood puts the Abave war around 2195–2218[^5] (Q8). |
| NOTE | I-19 | Caliphate origin | "Early Caliphate scholars wandered … one site, a deep, stable nuclear crater, became the sacred foundation": `Round City.md:16`. Syed found the Library in the glass basin and the city grew around it: `The Caliphate.md:29`, `🏜️Chukai Desert.md:22`, `On the Salt`. "The walls were built because of the Library": `Conditions of Admission`. NC: "Federation explorers were surprised to find survivors" before "the earliest records … of the merchant Syed". | These reconcile if the Library lies inside the crater ring. If the NC order stands, Syed's discovery comes after 2150 (section 9). |
| NOTE | I-20 | Taman Templer and Night Watch both say "eleven years" (2236) | `The Defenders of Taman Templer` ("Eleven years. The tribe beyond the ridge has come over twice."); `Night Watch – Edge Post` ("died at Kulim, eleven years ago"). | Probably unrelated, but both land in 2236. You could make 2236 a bad year on the jungle edge, or leave it alone. |

---

## 3. Redundancies (several names, or one event in several places)

| Sev | # | What | Proposal |
|---|---|---|---|
| CHECK | R-1 | "City of the Dead" names two places: KLB (`Kuala Lumpur Baru.md` alias, CLAUDE.md, `Nasi Cicak Rembau`) and "Putera (City of the Dead) … over the ruins of Putrajaya" (`01_Federation of Malaya.md:170`). | Keep it for KLB, as CLAUDE.md does. Call Putrajaya "Putera" and nothing else (S-9). |
| CHECK | R-2 | Wira and Perdana are each written up twice: in `02_Factions/The Federation/Federation Bunkers.md` and in `Locations/Wira Bunker.md` / `Locations/Perdana Bunker.md`. The copies already disagree on dates (I-1) and on Perdana's location (I-10). `[[Harapan Bunker]]` links (in Wira, Perdana and `01_The Protectorate.md:146`) point at no file. | Make Locations the single source and turn `Federation Bunkers.md` into a short index, or the other way round. Route the Harapan links to `[[Federation Bunkers]]`. |
| CHECK | R-3 | Wang / Rawang / Bandawang / "Cash City" for the same town: `Tulang.md` ("Wang refugees", `[[Wang (Cash City)]]`), `Ikhwan Mystery Brief.md:26` ("Rawang"), `99_Backend Engine/To do.md:3` ("Wang"). | Use Bandawang everywhere. "Cash City" can stay as a nickname; it is already an alias in `The Free City of Bandawang.md`. |
| NOTE | R-4 | The Great Ghoul Massacre is also called "The Battle for the Line" (superseded timeline). | Keep "Great Ghoul Massacre" as the main name. "The Battle for the Line" works as the Protectorate's own name for it. |
| NOTE | R-5 | Tiger Palace (OM F25, K84) vs **The Tortoise Palace** (vault). | The vault name is settled. This only matters if OM text is pasted in again. |
| NOTE | R-6 | Pre-war duplicate: "2050s–2060s … the first fusion cells are created" and "2066 … The first fusion cell is born". | Change the first to "fusion research accelerates", or drop the "first" in 2066. Kept verbatim in the proposal, because you asked for the pre-war section to be kept. |
| NOTE | R-7 | `A00_Introduction.md:22` and `:26` say the same thing twice: "The year is 2247 …", once citing New Vegas and once Fallout 4. | Merge them (S-24). Both comparisons are correct (2281−2247=34; 2287−2247=40; 2296−2247=49). |
| NOTE | R-8 | Megan Lai is a Wataniah senior investigator (`Wataniah.md:47`), but `Polis (Federation).md:48` says she has "long been one of the more prominent members of the **Polis**". | Make her ex-Polis, now Wataniah. Not a date issue, but it bears on Q5. |

---

## 4. Date and era census (task step 2)

Status key: ✓ consistent with the proposed timeline · ✗ must change (see the sweep) · ~ rounding or hyperbole, acceptable · — not a timeline claim. Line numbers are file lines; JSON data-log bodies sit on line 6.

### Canon and GM timelines

| File:line | Claim | Status |
|---|---|---|
| canon note `:2–16` | Pre-war, 2000s–2074 | ✓ (one duplicate, R-6; stray `**` at `:16`) |
| canon `:18` | Late 2077: America invades Malaya | ✓ (ruling 13) |
| canon `:20` | Heading "2077–2247" | ✗ the note stops at 2241, then has only a 2247 stub |
| canon `:22–26` | 2077, the Great War | ✓ |
| canon `:29–37` | 2090, Siege of the Dead, Sepuluh Ribu, Ringgit | ✓ |
| canon `:40–44` | 2095, Protectorate emerges | ✓ |
| canon `:47–51` | 2115, Centralisation | ✗ I-2 |
| canon `:54–58` | 2120, First Contact with the Sepuluh Ribu | ✗ I-4 |
| canon `:61–69` | 2130–2132, Great Ghoul Massacre; Kosongs begin | ✗ I-3 |
| canon `:72–84` | 2150, Rise of the Chosen; RMR | ✓ |
| canon `:87–93` | 2150–2200, Rebuilding; PCI introduced | ✗ PCI (I-8) |
| canon `:96–106` | 2230, Qal'at as-Petani; Labor Exchange | ✓ (add Baru Setar) |
| canon `:109–117` | 2231–2241, Smiling Collapse; UCL arrives | ✓ |
| canon `:122–126` | 2247 stub | ✓ (expanded in the proposal) |
| superseded `:3, 9, 12, 112` | Campaign starts 2242 | — superseded; leave it |
| superseded `:30, 37, 44, 51, 62, 77, 86, 99` | 2095 / 2130 / 2150 contact / 2196–98 Massacre / 2200 Chosen (seat at Wira) / 2210–2230 / 2230 / 2231–2241 | Source for Q1 and Q2 |
| superseded `:116–122` | 2242 stub: Protectorate lull, "Ghoul King not yet crowned", Taman Hidup / Ketil Baru / Air Jeniang, "a generation born after the Massacre" | The lull is carried into the proposal. The Ghoul King line belongs in a GM callout. Ketil Baru and Air Jeniang belong to the Northern Conflict era. |
| NC "A Brief Timeline" | 1950s–1990s alternate history (Confederacy, Sukarno, MCP, "Federation of States", DMZ, "Defensive Victory") | Not in the vault. Q11 (sensitivity). |
| NC "Context" | "20 years ago, devastation rocked the North"; peace between three factions | Northern Conflict era, after 2247. GM callout only. |
| NC Protectorate lore | Emerged 2095; centralised 2130; contact with the Federation 2150; invasion 2196; "defensive victory was declared in 2198"; Baru Setar deal 2230 | ✓ adopted |
| NC Protectorate lore | UCL declares war 2245; peace 2248; Gergasi made in the war; "Known Map … est. 2250" | ✗ Deprecated placeholders. They must fall after 2247; GM callout only. |
| NC Kingdom lore | YB emerge → ghoul revolt → alliance → Federation reborn → contact → spy → war → defeat → a ranger crowned Ghoul King → Kingdom | The Kingdom and the coronation are deprecated, GM only. The earlier steps fit 2150–2198. |
| NC Caliphate lore | Federation explorers find Chukai survivors → Syed → House of Syed → House of Wisdom → Federation salvage at a desalination plant | Undated; proposals in section 9 |
| OM D13 / D16 | "The timeline to the right of this is deprecated"; the 2247 opening sequence (First Days / Next Days / Final Days) | ✓ 2247 GM callout |

### Factions, People, Locations, Religions

| File:line | Claim | Status |
|---|---|---|
| `01_Federation of Malaya.md:26` | "emerged around **2150**" | ✓ |
| `01_Federation of Malaya.md:36, 64, 170` | Harapan hit / sealed with concrete / unknown / "Putera (City of the Dead) … formerly Bunker 3's site" | ✗ I-5, R-1 |
| `Federation Bunkers.md:25, 100` | Emerged **2157** | ✗ I-1 |
| `Federation Bunkers.md:92` | "now-defunct" Harapan | ✗ I-5 |
| `Federation Bunkers.md:170` | "Six generations on" | ✓ 170 years ÷ 26.9 years per generation ≈ 6.3[^6] |
| `Federation Bunkers.md:188, 192` | "After decades of being used"; "survived 170 years" (GM) | ✓ 2247−2077=170 |
| `Chosen (Federation).md:4, 9, 33` | "over generations"; "six generations later"; "Six generations" | ✓ |
| `Keturunan.md:23` | "Within three generations" | ✓ about 2160, around the emergence |
| `Locations/Wira Bunker.md:22` | Emerged **2200** | ✗ I-1 |
| `Locations/Perdana Bunker.md:20` | Emerged **2200**, founded KLB | ✗ I-1 |
| `Sepuluh Ribu.md:19` | "Years ago … Great Ghoul Massacre", placed before the Chosen | ✗ I-3, I-16 |
| `Sepuluh Ribu.md:21` | Chosen "emerged from Wira Bunker"; Tunku Adnan's truce founds the Sword | ✗ wording (I-17); the truce ✓ |
| `Sword (Federation).md:7, 23, 65, 67, 107` | "Over the decades"; "the arrival of / rise of the Ghoul King" | "decades" ✓; Ghoul King ✗ I-6 |
| `Polis (Federation).md:8, 13, 33` | Wataniah "of late"; Harapan "destroyed" | ✗ I-14, I-5 |
| `Wataniah.md:9` | Reformed "after the Federation needed new cheap manpower" | Undated (Q5) |
| `Prime Minister (Federation).md:38–59` | Four founding PMs; Jeb Rafa "grandson" | ✗ I-12; RMR name I-13 |
| `Public Citizenship Initiative (PCI).md:18–20` | Founded under pressure; Ikhwan among the first administrators | ✗ I-8 |
| `Kosongs (Federation).md:5` | Created as part of the Labor Exchange | ✗ I-15 |
| `Federation–Protectorate Labor Exchange.md:1` | Proposed by the Federation | ✓ (could add "2230") |
| `01_The Protectorate.md:18, 24` | 2095; 2130 | ✓ |
| `The Caliphate.md:29` | "Syed the First spent a decade" | ✓ (section 9) |
| `Round City.md:16, 20` | "After the bombs"; mosque "finished nearly a generation later" | ✓ (section 9) |
| `Kuala Lumpur Baru.md:6` | "Once the beating capital of the Federation, it is now a collapsing ruin" | ✗ I-11 |
| `Kelam Sungai.md:6` | Blown up "in the days before the campaign begins" | ✓ |
| `The Free City of Bandawang.md:6` | "no one dares speak of what turned the sky red" | ✓ the explosion |
| `Bandawang Refugees.md:1` | Refugees from the red-smoke explosion | ✓ (Q3) |
| `1414 Triad.md:4–6`, `Abave Highlands.md:5`, `Ma'qil Monastery.md:5` | Rode out the war; later forced out by the monks | Undated (Q8) |
| `Rakan Watch.md:4–6`, `Ketua Bob.md`, `Mak Cik Yam.md` | Founded during the triad's arrival; Bob, then his father; Yam widowed in the Triad–Axe war | Undated (Q8) |
| `Sam Lim.md` (65) | Grew up during the retreat from Abave | Constraint for Q8 |
| `Daz.md:9` | "defeat at Federation hands **years ago**" | ~ "decades ago" (S-23; Q13) |
| `Commie Bot.md:5` | "reprogrammed decades ago" | ✓ |
| `Chang.md` | "longer than most of his colleagues have been alive" | Constraint for Q5 |
| `Mother Senja.md` (55) | Grew up a Kancil | ✓ the Orphanage existed by about 2195 |
| `PosLaju.md:25, 28` | "Founded loosely in the **2100s**"; "Over decades" | ~ "2100s" could mean the decade or the century. Recommend reading it as the 2100s decade. |
| `The BAR Association.md:25` | "founded shortly after the Great War" | ✓ |
| `Order of the Fallen Gong.md:10` | "emerged in the aftermath of the Great War" | ✓ |
| `Batu Kapur.md:5` | "survived the worst of the Great War, but not the decades that followed" | ✓ |
| `The North South Railway.md:5` | "taken apart over the decades" | ✓ |
| `seio (Peng Brothers RNR).md:6` | "generations of use" | ✓ |
| `The Cement Works.md:12` | Dust "nobody has disturbed in generations" | ✓ (the art rules separately ban dust in this climate) |
| `ProTiga HQ.md:5` | Windows "have survived **two centuries**" | ~ It is 170 years (S-22) |
| `Fallout Details/Great War.md:1` | 23 October 2077 | ✓ |
| `Ghouls.md:4`, `☢ Ghoulification.md:1` | "over centuries" (lifespan) | ✓ |
| `Religions/The Path.md:42` | "future generations" | — |
| `A00_Introduction.md:22, 24, 26` | 2247; Fallout comparisons; "as it will be in **2250**" | Comparisons ✓; "2250" ✗ (S-24) |
| `Modules/…/The Ghoul Kings Plan.md:7` | "years leading up to **2242**" | ✗ S-25 |
| `Modules/…/New Federation Blues.md:4` | "prequel … runs before the main campaign" | ✗ Q3 |

### Found Texts (data logs, all player-facing)

| File | Claim | Status |
|---|---|---|
| `Before the War/The Peninsula Times — The New Plague` | Saturday, 17 July 2077 | ✓ before 23 Oct |
| `Before the War/Three Hearts, One Tiger` | May 2077 | ✓ |
| `Before the War/Re — That Thing You Asked For` | 19 August 2077 | ✓ |
| `Before the War/Security Handover Book — Basement Levels` | 22 August 2077 | ✓ |
| `Before the War/For Nora` | 27 August 2077 | ✓ |
| `Before the War/Emergency Drill Record` | 3 September 2077 | ✓ |
| `Before the War/Scheduled Service Interruption` | 18 October 2077 (work on the 21st) | ✓ |
| `Before the War/Bazaar Ramadan 2077` | 2077 | ✓ |
| `Abave/Abave Journal 1` | Friday 22 October 2077, 11:48 PM | ✓ the eve of the bombs |
| `Abave/Abave Journal 2–5` | 14 Nov 2077; Jan 2078; June 2078 ("It snowed last week"); Aug 2080 (Nong Mei dies) | ✓ The nuclear winter of 2077–2080 is missing from the canon note; it is added in the proposal. |
| `The Peninsula/The City of the Dead` | "Nobody has called it new in **two hundred years**." | ✗ KLB was named in 2150, 97 years ago (S-12) |
| `The Peninsula/On the Salt` | Derricks leaning "for two centuries" | ~ 170; a pilgrim's rounding |
| `The Peninsula/Night Watch — Edge Post` | "eleven years ago"; "nine years" | ✓ (I-20) |
| `The Peninsula/The Defenders of Taman Templer` | "forty years … three generations"; "Eleven years" | ✓ |
| `The Peninsula/The Longest Road Is Long` | "five years" | ✓ |
| `The Peninsula/Client Courtesy Call` | "A hundred years" (the contract) | — |
| `The Federation/Ipoh Marble` | "EVALUATION USE ONLY … printed like that for eleven years" | ✓ 2236, inside 2231–2241 |
| `The Federation/Oral History — Batu Lapan` | A farmer in his seventies; "Then the Federation came" | ✓ the 2180s–2190s expansion |
| `The Federation/Power Concedes Nothing` | "A people cannot eat bravery for two centuries" | ~ From 2090 it is 157 years. Uncle Loo's rhetoric. |
| `The Federation/The Sixth Week` | "forty-three years old" | — |
| `Bandawang/A Bandawang Lama Household Diary` | "back when it was just Sam Lim doing the rounds himself" | ✓ |
| `Bandawang/Undelivered` | "fed us through the winter … fill the summer" | — not a date, but Malaysia has no winter or summer, only monsoons[^7]. Suggest "through the monsoon … the dry months". |

### Items, Quests, Bestiary

| File | Claim | Status |
|---|---|---|
| `Quests/The 200 Year Old Heist.md:6` | Title | ~ Your own map title (OM C10). In-world rounding of 170; keep. |
| `Items/Weapons/Melee/Golf Club.md:1` | "in two hundred years" | ~ joke; keep |
| `Items/Consumables/Fermented Rice Wine Flask.md:1` | "two hundred years after" | ~ keep |
| `Items/Consumables/Skill Books/Guns and Bullets.md:1` | "Two hundred years of back issues" | ~ keep |
| `Items/Weapons/SMGs/Tommy Gun.md:1` | "a reputation that arrived a century before this particular one did" | ~ keep |
| `Items/Consumables/Pak Kopi's Kopi.md:1, 10` | "100 years too old" | ~ keep (a joke) |
| `Items/Junk/*`, `Baseball Bat`, `Salvaged Power Armor Helmet`, `Reboiled Kopi Peng`, `Bestiary/Construction Protectron.md` | "decades ago" | ✓ |
| `Items/Consumables/Preserved Salted Egg.md:9–10` | "century-egg-style" | — |

### 99_Backend Engine (GM-only)

| File:line | Claim | Status |
|---|---|---|
| `GM Notes/The ProTiga Heist.md:58, 76, 106` | "170 years"; a 2077 clock | ✓ |
| `Ideation & References/v1 Prime Minister.md:34, 39, 45, 55` | Terms 2157–2175, 2175–2195, 2195–2220, 2220–2247 | Adopted as proposals (section 8) |
| `To do.md:3` | Gombak ghost "since the bombs fell"; the Wang route | — |
| `Ideation.md:3`, `Prompt Generation.md:12` | Time-loop film idea; "1950s … font" | — |

---

## 5. Arithmetic checks

| Claim | Arithmetic | Verdict |
|---|---|---|
| "Six generations" since the bunkers closed (`Chosen`, `Federation Bunkers`) | 2077→2247 = 170 years; 170 ÷ 26.9 ≈ 6.3[^6] | ✓ |
| "Within three generations" (`Keturunan`) | Around 2160 | ✓ just after the 2150 emergence |
| "170 years" (Harapan GM callout, Heist §2), "170-year-old concrete" (`QUEST_JUTA_SUCCESS.md:75`) | 2247−2077 = 170. Pre-war concrete is at least 170 years old. | ✓ |
| "Nobody has called it new in two hundred years" (City of the Dead) | KLB was named in 2150 (canon), 97 years ago. Even counting from 2077 it is only 170. | ✗ |
| ProTiga HQ windows "survived two centuries" | 170 | ~ "nearly two centuries" |
| "Two hundred year old heist", Golf Club, Rice Wine, Guns and Bullets | 170 | ~ hyperbole in jokes and titles; keep |
| "Bravery for two centuries" (Uncle Loo) | 2090→2247 = 157 | ~ rhetoric; keep |
| Jeb Rafa, "young", a grandson of the man who led the Chosen out of the bunkers | Adnan an adult in 2150–57 → grandson born around 2175 → about 72 in 2247 | ✗ (Q7) |
| Ikhwan "one of the first" PCI administrators, with the PCI in 2150–2200 | Grandson of the 1st Father of Development (2175–95) → born around 2205 or later | ✗ (Q4) |
| Bob (45) present at the founding of the Rakan Watch | Born around 2202 → founding no earlier than about 2220 | Constraint (Q8) |
| Sam Lim (65) grew up during the Abave retreat | Born around 2182 → retreat in his youth, the 2190s–2210s | Constraint (Q8) |
| Mother Senja (55), raised a Kancil | Born around 2192 → the Orphanage existed by about 2195 | ✓ |
| "A generation born after the Great Ghoul Massacre" (superseded stub) | Works for 2198 (about 49 years); for 2132 it would be four generations | Supports Q1 |
| `A00` Fallout comparisons | 34, 40, 49 years | ✓ |
| Ipoh Marble ration card printed for eleven years | 2236 | ✓ inside 2231–2241 |

---

## 6. Northern Conflict dates against the canon note

| NC date | Canon note | Clash? | Proposal |
|---|---|---|---|
| 2095, Protectorate emerges | 2095 | No | Keep |
| 2130, centralised government | 2115 | **Yes** | 2130 (I-2) |
| 2150, contact with the Federation | 2120, with the Sepuluh Ribu | **Yes** | 2150 (Q2) |
| 2196 invasion, 2198 "defensive victory declared" | Massacre 2130–2132 | **Yes** | 2196–2198 (Q1) |
| 2230, Baru Setar joins by deal | 2230, Qal'at as-Petani annexed | Missing, not a clash | Same entry (Q9) |
| 2245 UCL war; 2248 peace; Ghoul King and Kingdom; 2250 map | 2247 is the campaign; no Kingdom | **Yes** (deprecated) | GM callout only, all after 2247 |
| (undated) Tans and Choos settle in Kulim; foreign explorers reach Penang; the spy incident; the village of Gajah; the Chukai desalination plant | Absent | Gap | 2157–2196 window, and the 2200s for the desalination plant |

Real-world geography: Baru Setar stands in for Alor Setar, on the road north from Penang. Qal'at as-Petani stands in for the Pattani region, across today's Thai border to the north-east, at least 160 km from Alor Setar[^8]. Baru Setar is the Protectorate's natural first step, with Petani further along. Both fit one "turning north" entry in 2230. Sensitivity note: the real Pattani region has a live separatist conflict. An Arabic-named Muslim city-state annexed by a technocracy is fine as fiction. Keep the framing on the Protectorate's arrogance rather than on the people of Petani.

---

## 7. Real-world names (check 4, across the audited material)

| Sev | Name | Where | Why | In-world alternatives |
|---|---|---|---|---|
| CHECK | **Putrajaya** | `Federation Bunkers.md:90, 157, 167, 183`; `Keturunan.md:52`; `01_Federation of Malaya.md:170`; the proposed timeline | A real planned capital, established in 1995[^9]. Post-1950s. | **Putera**, already used in the vault (`01_Federation:170`); *Bandar Perdana* |
| CHECK | **KL Sentral** | `01_Federation of Malaya.md:40`; `Locations/Perdana Bunker.md:13` | A real transit hub, opened in 2001[^10] | *Stesen Sentral*; *Pusat Sentral* |
| CHECK | **Penang Bridge** | `Fortress City of Penang.md:8`; OM G40 | A real landmark, opened in 1985[^11] | *the Strait Bridge*; *Jambatan Mutiara* |
| CHECK | **The four founding PMs** | `Prime Minister (Federation).md` | Tunku Adnan Rafa as "Father of Redependence", Razwan Hashim as "Father of Development", Onn Chee and Nasir mirror Tunku Abdul Rahman (*Bapa Kemerdekaan*), Tun Razak (*Bapa Pembangunan*), Hussein Onn and Mahathir[^12]. The names are already altered, and parodying institutions is in tone. But "**Razak** Hashim, Father of Development" (`Taman Hidup Wataniah Report.md:18`) is almost the real honorific. | Use **Razwan** throughout |
| CHECK | **Tenaga Nasional** | `01_World Details/ProTiga.md:6` | A real utility company (TNB) | *Tenaga Persekutuan*; *Kuasa Malaya* |
| CHECK | **Telekom Malaya** | `Found Texts/Before the War/For Nora.md` | Close to the real Telekom Malaysia | *TeleMalaya*; *Jabatan Telekom Persekutuan* |
| NOTE | **Bar Council of Malaya** | `The BAR Association.md:25` | A real institution (the Malaysian Bar) | *the Bar Hall*; GM may keep it for the pun |
| NOTE | **PosLaju / PosMalaya** | `PosLaju.md`; OM L111 | A real courier brand. Your own map uses it, so it is treated as kept. | *PosKilat* if it is ever swapped |
| NOTE | **Indah Water Konsortium** | `Scheduled Service Interruption` | Your precedent for deliberate post-divergence humour | Keep |
| NOTE | **Perodua**, "real-world Rawang" | `The Free City of Bandawang.md:6, 26` | Kept by your ruling. These two sentences are out-of-world asides inside a player-facing glossary note. | Keep, or move the asides into a GM callout |
| NOTE | **Rawang** | `Ikhwan Mystery Brief.md:26` | GM-only, but the vault name is Bandawang | Bandawang (R-3) |
| NOTE | **Shah Alam**, **Cyberjaya** | `Federation Bunkers.md`; `01_Federation:171` | Shah Alam is a generic place name. Cyberjaya is already swapped for **Tekpak**. | — |

---

## 8. Proposed consolidated timeline (ready to replace the canon note)

Notes on the draft:
- The pre-war section is kept verbatim. The only change is the stray `**` at the end of 2074.
- Existing wikilinks are kept. `[[Protectorate]]` has no file of that name (the file is `01_The Protectorate.md`). It is kept as written; consider `[[01_The Protectorate|Protectorate]]`.
- New links point only at notes that exist.
- No sentence outside a callout begins "Secretly", so the sync's `[GM LEAK?]` check stays quiet.
- Each date that is a proposal rather than canon is marked **P-n**. They are listed in section 9, not in the note.

````markdown
The **Timeline of Major Events** follows the Peninsula from the last decades before the Great War to 2247, the year the campaign begins.

### **Pre-War Timeline**
**2000s - 2020s** - China aggressively attempts to wrest control of the South China Sea. America sends warships to contest sovereignty, and in return Malaya promises reserves of oil.

**2040s - 2050s** - A mysterious plague ravages Malaya and quarantine orders are called out. More resources are siphoned from Malaya as America begins to experience a resource shortage. The Resource Wars begin as natural resources of the world runs out, and Europe goes to war with Middle East over gas prices. Indonesia sends aid to their Muslim brothers.

**2050s - 2060s** - Traffic in the world grinds to a halt as petrol becomes too expensive to be used. Alternative energy solutions are explored, and the first fusion cells are created. 

**2060s** - The Middle East and Europe is devastated by war. Left a broken husk after years of fighting, Europe begins a civil war amongst themselves as they fight to control what is left of the oil wells in Middle East. America undergoes a vast construction of Vaults.

**2066** - China becomes more aggressive in trade talks with the US as their dependency on fossil fuels threatens to derail future advancement. US refuses, and walks out of any trade involving the use of oil. Nations scramble to find alternative energy, and the use of nuclear energy develops rapidly. The first fusion cell is born as a result of technological advances by the US to make power armor. In winter, China invades Anchorage Alaska and a war is fought on that front, while also making roads into Vietnam.

**2067** - America begins the process of annexing Canada, with the first suits of Power Armor deployed. China annexes Vietnam and begins to push into Thailand. Malayan reserves are sent to assist the frontline.

**2070** - American made fusion powered cars hit the market and are sold out. This technology spreads rapidly across the world. 

**2074** - America puts boots on the ground in China, and begins their expedition across the Pacific, landing and aggressively pacifying Chinese influence. Malaya serves as a launching pad for attacks into Vietnam.

**Late 2077** - The paranoia of the late war years turns real: America invades Malaya. What had circulated for months as frightened rumour on the radio and in the streets arrives as fact, just before the bombs fall.

### **Timeline of Major Events (2077–2247)**

#### **2077** – The End of the Old World

- On 23 October the Great War occurs. Nuclear warheads devastate global cities. Kuala Lumpur is annihilated in a direct strike, collapsing its infrastructure and irradiating the region.
    
- The survivors, those caught in the blast but not vaporized, begin the [[☢ Ghoulification|long transformation into ghouls]]. 

- The Chosen few of the old Federation ride out the war in its [[Federation Bunkers|bunkers]]. The monorail to the third bunker, **Harapan**, collapses under the rubble of Putrajaya, and with it goes the only way into the Federation's archive.

- On the East Coast the Chukai oil fields burn. The firestorm fuses the basin to glass and leaves a great ring of rock at its heart: the [[🏜️Chukai Desert]].

- In the [[Abave Highlands]], too far from anything worth bombing, the casino crowds come through the war hungry but unchanged.

> [!gm]- Secret — Harapan
> The ghouls of the [[Sword (Federation)|Sword]] know what is in Harapan and have kept it to themselves. Whether anything inside survived is undecided. See [[Federation Bunkers]].
    

#### **2077–2080** – The Long Winter

- Smoke and fallout bring a nuclear winter. Grey snow falls on the Peninsula in June, and the harvests fail.

- At Abave, survivors shelter in a round house behind the old hotel, opened to them by the man the monks now worship as [[Nong Mei]]. He dies in 2080. The [[Abave Buddhist Enclave]] dates itself from that winter.

- What should have withered in the cold does the opposite. The [[Great Jungle]] begins to grow, and it has not stopped.

> [!gm]- Secret — Abave
> Not everyone in the round house ate at the monks' table that first winter. See [[Abave Buddhist Enclave]] and the Abave Journals.


#### **2090** – Siege of the Dead

- Kuala Lumpur becomes a charred husk, its ruins filled with ghoul survivors. Survivors are under constant siege by raiders, scavengers, and mutated beasts.
    
- Ten thousand ghouls band together to defend the city. They become known as the **[[Sepuluh Ribu]]**, the original defenders of the Peninsula.
    
- In an attempt to recreate civil order, the Sepuluh Ribu adopt the pre-war **Malayan Ringgit** as fiat currency for barter fairness. Over time, this currency becomes a **symbol of identity** among ghouls, a relic of their once-prosperous past. However, hyperinflation quickly sets in, with no control over supply or regulation.

- Society quickly becomes chaotic.
    

#### **2095** – The [[Protectorate]] Rises

- The Protectorate emerges from naval bunkers beneath Penang, salvaging warships and forming a society of engineers and technocrats.
    
- Begins the construction of the Fortress City of Penang using salvaged warships and coastal infrastructure. A giant coastal wall made from the hulls of once mighty ships is made.
    

#### **2130** – Centralization of the Protectorate

- The [[Fortress City of Penang]] is declared the capital of a new centralized government.
    
- The North-South Railroad becomes the central infrastructure project for post-war recovery. Protectorate crews advance down the line with great caution, forging alliances with towns worn down by raiders and beasts.
    

#### **2150** – Rise of the Chosen

- From deep bunkers beneath Kuala Lumpur, the **Chosen** emerge (also known informally as the "YB", or Yang Bawah).
    
- Technocratic, classist, and isolated, they claim mandate to rule with the old Federation Constitution and reestablish it as the **Federation of Malaya**, headquartered in **[[Kuala Lumpur Baru]] (KLB)** with the seat of administrative power at the Perdana Bunker.

- The ruin above the bunkers is renamed Kuala Lumpur Baru, the *new* Kuala Lumpur. The Federation governs it from underneath. Everyone who lives on top of it goes on calling it the City of the Dead.
    
- The Chosen promise integration, infrastructure, and access to pre-war knowledge. In practice, they form a new elite.
    
- They are quick to introduce strict **currency controls**, abolishing the Ringgit in favor of the **RMR (Reformed Malayan Ringgit)**, a stamped and regulated form of currency intended to centralize economic authority. Though presented as modern and official, the RMR is functionally just stamped Ringgit.
    
- Ghouls already using the old Ringgit as a symbol of identity, react with quiet bitterness. Though some adapt, others see this as yet another attempt by the Chosen to erase their legacy and economic agency.

- The Sepuluh Ribu do not stand aside, and open fighting follows. It ends only when **Tunku Adnan Rafa** brokers a truce. Sepuluh Ribu veterans and the bunkers' own soldiers are merged into the **[[Sword (Federation)|Sword]]**, and those who refuse go underground.
    
- The Chosen's emergence renders the Sepuluh Ribu politically irrelevant. Many ghouls initially welcome the return of order and technology, only to later discover they have merely traded struggle for subjugation.

- The **[[The New Peninsula Times|New Peninsula Times]]** opens under the Keturunan Hassan, keepers of the old knowledge of mass communication.


#### **2150** – First Contact with the South

- Protectorate crews working south down the railroad reach the ruins of Kuala Lumpur in the same year the bunker doors open. They meet battle-hardened Sepuluh Ribu ghouls and a newly surfaced Chosen government.
    
- A treaty of trade follows: Protectorate knowledge, and safe passage on the routes, in exchange for Federation farmland and salvage. Relations are tenuous but civil. The Sepuluh Ribu are quietly humiliated by the economic and industrial power of the Protectorate.


#### **2157** – The Federation Constituted

- With the truce holding, Tunku Adnan Rafa is sworn in as the first [[Prime Minister (Federation)|Prime Minister]], the Father of Redependence. Prime Ministers rule until death. After him come Razwan Hashim (2175–2195), Onn Chee (2195–2220) and Nasir (2220–2247): the founding four whose portraits hang in the Perdana Bunker.


#### **2157–2196** – Prosperity, Or So It Seemed

- The Federation expands, but the rot sets in: bureaucracy grows bloated, and ghouls are pacified with propaganda. Federation currency and services prioritize the Chosen.
    
- Within ghoul circles, the Sepuluh Ribu retreat and become a shadow of their former selves, fragmented and exploited but not quite forgotten.

- Explorers from India, Neo Indonesia and Europe land at Penang. The Protectorate repairs the last of its warships, extends its protection over the Strait, and pushes north and south at the call of towns besieged from the Great Jungle. The price of its protection is indenture. Two families who do well out of it, the Tans and the Choos, make their home at [[Kulim]].

- Trust breaks when a Federation agent is caught copying plans of the railroad. The Federation disavows him as a rogue. The Protectorate does not believe it, and from then on persecution of ghouls becomes part and parcel of Protectorate life. Raids along the border grow bolder every year.
    

#### **2196–2198** – _The Great Ghoul Massacre_

- Skirmishes become war when the village of **Gajah** comes under Protectorate control. A Federation army, made up mostly of the ghouls of the Sword and Sepuluh Ribu veterans and emboldened by public resentment and jealousy, pushes north to reclaim old territory.

- The outnumbered Protectorate gives ground until, in 2196, the invasion reaches its doorstep. There it is met and obliterated by entrenched Protectorate artillery and the guns of its warships. The resulting battle is a **pyrrhic victory**: the ghoul army is shattered, but the Protectorate suffers severe manpower losses.

- In 2198 a defensive victory is declared and lines of demarcation are drawn. The Protectorate calls it the Battle for the Line.
    
- This becomes a Great Shame for the ghouls of the Peninsula. The Protectorate withdraws to safe artillery zones, unwilling to overextend again. This moment permanently **limits their territorial ambitions**, reinforcing their reliance on long-range firepower, automation, **indentured labor programs and Penal Slave Battalions** to maintain existing control.
    
- The Protectorate begins experimentation to create docile labor. This creates the [[Kosongs (Federation)|Kosongs]].

> [!gm]- Secret — what grew out of 2198
> The deprecated Northern Conflict draft has the Federation's ghouls turn on the Chosen after this defeat. None of that is public in 2247: no Kingdom exists, and the Ghoul King is a rumour. The ghoul dead of 2198 are the soil his legend grows in. Name nothing in player text.


#### **2198–2230** – After the Line

- The Protectorate settles into prosperity, buffered by indentured labour for the wealthy, and turns its attention north, unwilling to risk another war in the south.

- Short of soldiers after the north, the Federation finds a pre-war reserve unit still on its books, the **[[Wataniah]]**, and reforms it as a volunteer force of investigators: not quite Polis, not quite civilians.

- **[[Supermutan|Gergasi]]** become a known, if rare, sight on the Peninsula. Nobody agrees on where they came from.

> [!gm]- Secret — Gergasi
> Their origin is GM-only and deliberately undated. The deprecated Northern Conflict draft has the Protectorate making them later, from a cure for an old plague. Kong's backstory (org-map D17) puts Protectorate labs before 2247.


#### **2160s–2220s** – The House of Syed

- In the glass basin of the Chukai, a merchant named **Syed** finds a buried shelter with renewable water, a working fusion reactor and a great many books. He moves his family and his wares inside. The desert comes to him for the water and stays to read.

- Syed teaches his sons to read and spends the rest of his life cataloguing the collection. He dies before he sees what it becomes: the **Grand Library**, and around it the House of Syed.

- Through the 2190s the Library's teaching, and with it [[The Path]], spreads by willing adoption along the coast.

- In the 2200s a Federation expedition arrives to salvage a desalination plant on the Chukai shore, and the coastal towns close ranks behind the House of Syed. Around the Library, inside the great ring of rock, they begin the [[Round City]]. The walls were built because of the Library, and not the other way about.

- The Grand Library Mosque at its centre is finished nearly a generation later, in the 2220s. [[The Caliphate]] keeps its own counsel.


#### **2195–2228** – The Triad Comes Down the Mountain

- At Abave, the monks and the **[[1414 Triad]]** have shared the Highlands since the bombs. As the Enclave grows stronger the triad's hold weakens, and by 2220 it has been forced out, with Sam Lim's father leading the retreat.

- The triad comes down the mountain into [[The Free City of Bandawang|Bandawang]], opens [[The Tortoise Palace]], and goes to war with the **[[Axe Gang]]** of North Bandawang.

- Caught between them, Bandawang's civilians meet at the old Rakan wholesale supermarket and form the **[[Rakan Watch]]**, led first by Boss Bob's father and then by Bob.

- By 2228 the war has burned out into a Council of Three Bosses. Nobody calls it peace, so it holds.


#### **2230** – Protectorate Overreach

- The Protectorate turns north. **Baru Setar** joins it by treaty, and the city-state of **Qal'at as-Petani** is annexed, triggering concern among regional factions.
    
- Military presence grows along the NS Railroad.
    
- The Federation signs a **[[Federation–Protectorate Labor Exchange|labor exchange deal]]** with the Protectorate: in exchange for Kosong labor units, Federation patrols are deployed along the outer segments of Protectorate territory, and the Federation sends north "volunteers" of its own.
    
- While presented as mutual defense, the arrangement masks a cynical calculus: the Protectorate gets expendable bodies and an excuse to limit its own manpower exposure, while the Federation gains a hollow illusion of relevance and reach.
    
- The deal further strains inter-faction trust, and deepens the moral contradictions in both governments.

- Further north, someone is paying attention.


#### **2232** – A Place for Every Citizen

- Under pressure at home and criticised abroad for its treatment of ghouls, the Federation launches the **[[Public Citizenship Initiative (PCI)|Public Citizenship Initiative]]**: six weeks of orientation, assigned housing and labour, administrative fees that outlive the applicant, and the title of "uncle" or "auntie".
    

#### **2231–2241** – The Era of Smiling Collapse

- Known as the "smiling collapse," this period is marked by an illusion of peace masking deep structural decay:
    
    - Communists and travellers from the North arrive in the Peninsula. They speak of new dangerous ideas and the **[[UCL]]**. UCL presence grows as it infiltrates border towns with trade, propaganda, and mutual aid. Their presence is subtle, not yet consolidated.
        
    - **The Caliphate** grows stronger in the East but abstains from conflict, seeing itself as a preserver of knowledge rather than a conqueror. They observe, record, and wait.
        
    - The Federation's bureaucracy becomes a parody of governance: 5-stamp mop requisitions, duplicate registry queues, and ration cards marked "Evaluation Use Only."


#### **2242–2246** – The Last Quiet Years

- The Protectorate enters a diplomatic lull, distracted by northern logistics and UCL interference.

- The Federation rebuilds **Taman Hidup Baru**, at the edge of the Great Jungle, as a model town for the PCI, using contractors from **Juta Success**. It begins to decay almost as soon as the paint dries.

- In Bandawang Baru, new concrete goes up beside the old timber. A Protectorate-born dealmaker named **Ishtar** breaks ground on **[[Syurga]]**, a Proper English Casino.
        

---

### **2247 – Campaign Start: The Quiet Before the Collapse**

- Federation control slips.

- Prime Minister Nasir dies after twenty-seven years in office. His successor, **Jeb Rafa**, is young, idealistic and out of his depth, and how he came to the post is the subject of quiet speculation.

- An explosion tears through the water plant at **[[Kelam Sungai]]**, outside Bandawang, and turns the sky red. The Federation Gazette names the Sepuluh Ribu before the smoke has cleared. Water runs short, and [[Bandawang Refugees|refugees]] take the road south.

- In Taman Hidup Baru, the Chosen overseer of the PCI is found murdered, and the [[Wataniah]] is stretched too thin to cope.
    
- Whispers speak of a Ghoul Uprising, a revolt that scares the people, lest they return to barbarism and anarchy.

> [!gm]- Secret — 2247
> Pointers only. Who arranged Kelam Sungai and why: [[Kelam Sungai]], org-map D16, `99_Backend Engine/GM Notes/The ProTiga Heist.md`. The Taman Hidup murder is staged to push the Federation toward martial law: see the New Federation Blues GM notes. Ishtar's backers: [[Ishtar]]. The PCs' own origin stays in `GM Notes/Kelam Sungai Prison Roster.md` and never appears here.

> [!gm]- Secret — after the campaign
> The Northern Conflict draft runs on from here: the UCL declares war (drafted as 2245), the Protectorate fights on two fronts, its Gergasi programme grows, and a peace follows (drafted as 2248), with a map dated 2250. Those dates are deprecated placeholders. All of them fall after 2247 and should be reset when the sequel is planned. The Kingdom of Malaya appears only in this callout.
````

---

## 9. Proposed dates register

These are all **(proposed)**. Your notes give no date, or give conflicting ones, so each of these is a suggestion with its basis. None of them is canon until you confirm it.

| P# | Event | Proposed | Basis |
|---|---|---|---|
| P-1 | Nuclear winter | 2077–2080 | The Abave Journals (snow in June 2078; Nong Mei dies Aug 2080); `Great Jungle.md` "what should have withered during the nuclear winter". The dates come from the logs. Only the timeline entry is new. |
| P-2 | The Great Jungle begins to grow | During that winter | `Great Jungle.md:7` |
| P-3 | Centralisation | 2130 (instead of 2115) | I-2 |
| P-4 | Sepuluh Ribu–Chosen fighting, Tunku Adnan's truce, the Sword founded | 2150–2157 | `Sepuluh Ribu.md:21`, `Sword.md:5`, `Prime Minister.md:38`. Undated in the sources. |
| P-5 | First contact in the same year as the emergence | 2150 | Your recollection plus NC (Q2) |
| P-6 | Federation constituted; Tunku Adnan the first PM | 2157 | `Federation Bunkers.md` "2157", `v1 Prime Minister.md:34` |
| P-7 | PM terms 2157/2175/2195/2220/2247 | as listed | `v1 Prime Minister.md` (Ideation, GM intent) |
| P-8 | Explorers reach Penang; Tans and Choos settle at Kulim; the spy incident | 2157–2196 | NC "Prosperity Or So It Seemed", undated |
| P-9 | War starts at Gajah; invasion 2196; victory declared 2198 | 2196–2198 | NC; your recollection |
| P-10 | "The Battle for the Line" as the Protectorate's own name | — | Superseded timeline's alternative name (R-4) |
| P-11 | Wataniah reformed | Around 2200 | Q5 |
| P-12 | Gergasi known by the 2200s | Undated in player text | `Supermutan.md` ("uncertain how they came to be"); NC ("a rarity before" the later war) |
| P-13 | The House of Syed block | Section 10 | — |
| P-14 | Triad forced out of Abave; enters Bandawang; Rakan Watch; Council | Out by 2220; Council 2228 | Q8, I-18 |
| P-15 | Baru Setar treaty in the 2230 entry | 2230 | Your recollection; NC |
| P-16 | "Volunteers" added to the 2230 deal | 2230 | Ruling 3 (2026-09-22); `Kosongs.md:19` |
| P-17 | PCI launched | 2232 | Q4 |
| P-18 | Taman Hidup Baru rebuilt by Juta Success | 2242–2246 | `QUEST_JUTA_SUCCESS.md` ("Juta Success did Taman Hidup first"); A00 ("a once model town, now decaying") |
| P-19 | Syurga breaks ground | 2242–2246 | `Syurga.md` ("nearly-finished construction") |
| P-20 | Nasir dies; Jeb Rafa takes office | 2247 | Nasir's v1 term ends in 2247; `Prime Minister.md` "Current Holder: Jeb Rafa" |
| P-21 | Kelam Sungai explosion, then the Taman Hidup murder | 2247, in that order | Q3[^2] |
| P-22 | The 2198 "defensive victory": the canon "introducing indentured labor programs" becomes "reinforcing … indentured labor" | — | NC says indenture predates the war ("always … made deals … indentured servants") |
| P-23 | KLB renamed and governed from below, "City of the Dead" on top | 2150 | Reconciles I-11. The joke is new and is offered as a suggestion. |

---

## 10. Caliphate and Round City: proposals for the concurrent agent

These are labelled **proposal**, so the other agent can adopt, shift or replace them. They are written as one self-contained block in the timeline ("2160s–2220s – The House of Syed") so it can be swapped out whole.

| Step | Proposed date | Constraint it satisfies | Source it builds on |
|---|---|---|---|
| Chukai oil fields burn; the basin fuses to glass; a ring of rock forms | 23 Oct 2077 | — | `🏜️Chukai Desert.md:10–12` |
| Federation explorers find "simple and hostile" survivors on the East Coast | 2150s | If NC's order stands, this must come after 2150, when the Federation exists | NC Caliphate lore |
| Syed finds the shelter: renewable water, fusion reactor, books | 2160s | After the explorers; the Library is older than the walls | `The Caliphate.md:29`; NC; `On the Salt`; `Conditions of Admission` |
| Syed teaches his sons; catalogues "a decade" and more; dies | 2160s–2180s | Dies "before he could see the fruits" | `The Caliphate.md:29` ("a decade"); NC |
| House of Syed becomes a safe harbour; renamed the House of Wisdom | 2180s | — | NC |
| The Path spreads along the coast by adoption | 2190s | — | NC; `The Caliphate.md:43` |
| Federation salvage expedition to a desalination plant; first conflict | 2200s | After the 2198 defeat, the Federation looks east instead of north[^13] | NC (the text breaks off there) |
| The Caliphate forms as a defensive union under the House of Syed; Round City begun around the Library inside the ring | 2200s | "Formed for survival" (`The Caliphate.md:23`); walls after the Library | `Round City.md:16–18`; `Conditions of Admission` |
| Grand Library Mosque finished | 2220s | "Nearly a generation later" | `Round City.md:20` |
| Condemns the Kosongs; "grows stronger … abstains" | 2230s | After the 2230 Labor Exchange | `Kosongs.md:102`; canon 2231–2241 |
| Faiz is sent west to broker water and "change a life" | 2247 | — | OM D16; `Faiz.md` |

Real-world anchor: the Chukai "refineries" match the real Kerteh petroleum complex just north of Chukai in Kemaman, home to Malaysia's first refinery (1983)[^14]. Sensitivity: the vault's Caliphate is built on a liberal, scholarly faith with a library at its heart. Any founding story should keep it there, and keep satire aimed at institutions, not at Islam.

---

## 11. Sweep: other notes that must change to match

"Depends" names the question that has to be answered first. Exact current wording is quoted. Where the text is long, the quote starts at the first changed word.

| Sev | S# | File:line | Current wording | Replacement | Depends |
|---|---|---|---|---|---|
| BLOCK | S-1 | `Locations/Wira Bunker.md:22` | "- Emerged simultaneously with [[Perdana Bunker]] in **2200**, marking the rebirth of the Federation." | "- Emerged simultaneously with [[Perdana Bunker]] in **2150**; the Federation was formally constituted in 2157, once the truce with the Sepuluh Ribu held." | Q2 |
| BLOCK | S-2 | `Locations/Perdana Bunker.md:20` | "- In **2200**, residents emerged to establish the modern **[[01_Federation of Malaya]]** and found [[Kuala Lumpur Baru]]." | "- In **2150**, residents emerged to establish the modern **[[01_Federation of Malaya]]** and renamed the ruin above them [[Kuala Lumpur Baru]]." | Q2 |
| BLOCK | S-3 | `02_Factions/The Federation/Federation Bunkers.md:25` | "- Emerged simultaneously with [[Perdana Bunker]] in **2157**, marking the rebirth of the Federation." | Same as S-1 | Q2 |
| BLOCK | S-4 | `Federation Bunkers.md:100` | "- Emerged in **2157** alongside Wira, spearheading the reconstruction of civil order and Ministry hierarchy." | "- Emerged in **2150** alongside Wira, spearheading the reconstruction of civil order and Ministry hierarchy." | Q2 |
| CHECK | S-5 | `Federation Bunkers.md:90` | "Located beneath the old Putrajaya complex, it is the symbolic and literal seat of Federation power." | "Located beneath the ruins of the old central station of Kuala Lumpur, it is the symbolic and literal seat of Federation power." | Q6 |
| BLOCK | S-6 | `Federation Bunkers.md:92` | "once had limited access tunnels to the now-defunct [[Harapan Bunker]]." | "once had access tunnels to the sealed Harapan Bunker, lost when the bombs fell." | — |
| BLOCK | S-7 | `01_Federation of Malaya.md:36` | "but after the Harapan bunker took a direct hit, the operational capacity has been greatly diminished. Faced with no choice, the monorail lines to Harapan have been sealed with several inches of concrete to protect from radiation." | "but when the bombs fell the monorail to Harapan collapsed under the rubble of Putrajaya, and the third bunker has been sealed off ever since." | — |
| CHECK | S-8 | `01_Federation of Malaya.md:64` | "Not much is known about Harapan Bunker as of yet." | "Sealed since the bombs fell. See [[Federation Bunkers]]." | — |
| CHECK | S-9 | `01_Federation of Malaya.md:170` | "- **[[Putera (City of the Dead)]]** – Feral ghoul zone over the ruins of Putrajaya; formerly Bunker 3's site." | "- **Putera** – Feral ghoul zone over the ruins of Putrajaya, above the sealed Harapan Bunker." | R-1 |
| BLOCK | S-10 | `Polis (Federation).md:13` and `:33` | ":13 "But after leadership was destroyed with the destruction of the **Harapan Bunker**," / :33 "The **Polis** used to have access to old archives, but it was destroyed with **Harapan**."" | ":13 "But after the **Harapan Bunker** and its records were cut off when the bombs fell," / :33 "The **Polis** once had access to the old archives, but they have been sealed in **Harapan** since the bombs fell."" | — |
| CHECK | S-11 | `Locations/Kuala Lumpur Baru.md:6` | "Once the beating capital of the Federation, it is now a collapsing ruin haunted by" | "Still the Federation's capital on paper — governed from the bunkers beneath it — it is above ground a collapsing ruin haunted by" | — |
| CHECK | S-12 | `Found Texts/The Peninsula/The City of the Dead.md:6` (body) | "They still write it Baru on the old signs. Nobody has called it new in two hundred years." | "They still write it Baru on the old signs. Nobody has called it new since the week they painted them." | — |
| CHECK | S-13 | `Sepuluh Ribu.md:19, 21` | ":19 "- Years ago, the Sepuluh Ribu launched a campaign to reclaim northern territory, resulting in the **Great Ghoul Massacre**." / :21 "- When the **Chosen** emerged from Wira Bunker and declared"" | Move :19 after :23 and reword: "- In 2196, Sepuluh Ribu veterans made up the backbone of the Federation army that marched north to reclaim old territory, resulting in the **Great Ghoul Massacre**." (rest of the bullet unchanged). :21 becomes "- When the **Chosen** emerged from the bunkers in 2150 and declared" | Q1 |
| BLOCK | S-14 | `Sword (Federation).md:7` | "The arrival of the Ghoul King acts as a **catalyst**, accelerating their ideological split from Federation doctrine." | "Whispers of a Ghoul King have begun to act as a **catalyst**, and some say the split from Federation doctrine is accelerating." | — |
| BLOCK | S-15 | `Sword (Federation).md:23` | "- With the rise of the Ghoul King, many units begin to quietly defect, while others hide sympathies behind loyalty." | "- As the rumours spread, some units are said to be quietly defecting, while others hide their sympathies behind loyalty." | — |
| BLOCK | S-16 | `Sword (Federation).md:65, 67` | "others serve as sleeper cells for the Ghoul King's uprising." / "- Their split will eventually lead to **a turning point in the campaign**, where entire battalions may switch sides." | ":65 "others are rumoured to be waiting for a signal."; move :67 into a `> [!gm]- Secret` callout." | — |
| BLOCK | S-17 | `Sword (Federation).md:107` | "- Secret orders given by the Ghoul King are spreading within ghoul-led platoons." | "- Orders said to come from the Ghoul King pass hand to hand in ghoul-led platoons. Nobody has traced one to its source." | — |
| CHECK | S-18 | `Prime Minister (Federation).md:77` | "As the **Rise of the Ghoul King** begins," | "As whispers of a Ghoul Uprising spread," | — |
| CHECK | S-19 | `Prime Minister (Federation).md:45` | "reintroducing the RMR (Repurposed Malaysian Ringgit) into the economy." | "reintroducing the RMR (Reformed Malayan Ringgit) into the economy." | — |
| CHECK | S-20 | `Prime Minister (Federation).md:59` | "**Jeb Rafa**, grandson of Tunku Adnan." | "**Jeb Rafa**, great-grandson of Tunku Adnan." | Q7 |
| CHECK | S-21 | `Kosongs (Federation).md:5` | "created as part of the [[Federation–Protectorate Labor Exchange]] deal." | "first made after the Great Ghoul Massacre and exported under the 2230 [[Federation–Protectorate Labor Exchange]] deal." | Q1 |
| NOTE | S-22 | `Locations/Bandawang/ProTiga HQ.md:5` | "its bulletproof windows have survived two centuries" | "its bulletproof windows have survived nearly two centuries" | — |
| NOTE | S-23 | `People/Daz.md:9` (and OM K81) | "their defeat at Federation hands years ago." | "their defeat at Federation hands, decades ago." | Q13 |
| CHECK | S-24 | `A00_Introduction.md:2, 22–26, 32, 44` | ":24 "This map paints the Malayan Peninsula as it will be in 2250."; :22 and :26 duplicated; :2/:32 "Campaign: The Rise of the Ghoul King"; :44 "You play as [[Wataniah]] volunteers at the edge of a once model town, now decaying. A politician has been murdered, and the Federation is stretched too thin."" | ":24 "This map shows the Peninsula as the campaign finds it, in 2247."; merge :22/:26 into one paragraph; retitle and rewrite :44 for the Bandawang campaign. Something like: "You begin in Bandawang, a free city on the Federation's edge, in the days after its water plant blew up." Keep the Taman Hidup premise in the module index." | Q3 |
| NOTE | S-25 | `Modules/…/The Ghoul Kings Plan.md:7` | "in the years leading up to 2242." | "in the years leading up to 2247." | — |
| CHECK | S-26 | `Modules/New Federation Blues/New Federation Blues.md:4–5` | "**New Federation Blues** is the prequel module — the story that runs before the main campaign," | "**New Federation Blues** is a companion module set in 2247, in the weeks after the Kelam Sungai explosion, alongside the main campaign's opening," | Q3 |
| CHECK | S-27 | `Modules/…/Taman Hidup Wataniah Report.md:18` | "Isn't that the son of our Father of Development Razak Hashim?" | "Isn't that the grandson of our Father of Development Razwan Hashim?" | — |
| CHECK | S-28 | `Public Citizenship Initiative (PCI).md:18` | "- The PCI was founded during a wave of internal political pressure" | "- The PCI was founded in 2232, during a wave of internal political pressure" | Q4 |
| CHECK | S-29 | `Polis (Federation).md:8` | "They have been overworked of late owing to civil unrest within **Kuala Lumpur Baru**, leading to the reformation of the **[[Wataniah]]**" | "Overworked since the losses of the northern war, they were the reason the **[[Wataniah]]** was reformed" | Q5 |
| NOTE | S-30 | `Wataniah.md:9` | "It's only after the Federation needed new cheap manpower did they realise that the Wataniah existed," | "It was only after the northern war, when the Federation needed new cheap manpower, that anyone realised the Wataniah still existed," | Q5 |
| NOTE | S-31 | `Federation–Protectorate Labor Exchange.md:1` | "A labor exchange program proposed by the Federation for peace between them." | "A labor exchange program, proposed by the Federation and signed in 2230, for peace between them." | — |
| NOTE | S-32 | `Found Texts/Bandawang/Undelivered.md:6` (body) | "fed us through the winter … fill the summer" | "fed us through the monsoon … fill the dry months" | — (climate, not a date) |
| NOTE | S-33 | `99_Backend Engine/FOES Timeline (superseded 2026-10).md` | — | Leave as is; it is already marked superseded. Optionally add a pointer to this review. | — |

---

## 12. Questions for the GM (only where canon cannot decide)

1. **The Great Ghoul Massacre: 2130–2132 or 2196–2198?** The canon note has a Sepuluh Ribu push before the Federation exists. Your recollection, NC and the superseded timeline have a Federation army in 2196–2198. *Recommended: 2196–2198, as a single war.* With that choice, centralisation returns to 2130 (matching the Protectorate note), first contact becomes 2150, the Kosongs follow 2198, and "a generation born after the Massacre" works. The cost is one rewrite of `Sepuluh Ribu.md:19` (S-13).
2. **Can the Chosen's emergence and the Protectorate's first contact both fall in 2150?** *Recommended: yes.* The Chosen emerge and claim the Federation; Protectorate crews arrive later that year. Fighting and the truce follow, and the Federation is formally constituted in **2157** with Tunku Adnan as first PM. That keeps all three of your dates (2150, 2150, 2157). Alternative: move first contact to 2157.
3. **When is New Federation Blues set?** *Recommended: 2247, the weeks after the Kelam Sungai explosion, running alongside the main campaign's opening.* Its refugees, A00, the roster's "upstream of both", and Juta Success doing Taman Hidup *before* Bandawang all point the same way. Then "prequel" means "played first", not "happens first". The alternative is to set it before the explosion, which means removing the Bandawang refugees from Tulang, the Ikhwan brief and `Bandawang Refugees.md`.
4. **When did the PCI begin?** *Recommended: 2232*, after the 2230 Labor Exchange. That lets Ikhwan, grandson of the 1st Father of Development, be one of its first administrators.
5. **When was the Wataniah reformed?** *Recommended: around 2200*, after the northern war's losses. That fits Chang's long memory. The alternative is "recent" (the Polis note), which means trimming Chang's background.
6. **Where is the Perdana Bunker?** *Recommended: under the old central station of Kuala Lumpur (KL Sentral; two of three notes)*, with Harapan alone under Putrajaya. That keeps "headquartered in KLB" literally true.
7. **Jeb Rafa: grandson or great-grandson?** *Recommended: great-grandson.* Otherwise "young" fails by about thirty years.
8. **When did the triad come down from Abave?** *Recommended: the Abave struggle runs through Sam Lim's youth (around 2195–2218); the triad is out by 2220; the Rakan Watch forms around 2221 with Bob in his twenties; the Council forms in 2228.* Bob's age and "would not have formed without Bob" rule out anything earlier.
9. **Baru Setar and Qal'at as-Petani: one entry in 2230, or a two-step expansion?** *Recommended: one 2230 entry.* Baru Setar comes by treaty and Qal'at as-Petani by annexation. Geography supports that order.
10. **Does NC's "Federation explorers found the first Chukai survivors" still stand?** *Recommended: yes.* That puts Syed after 2150. This decision belongs mainly to the other agent's Caliphate founding work; section 10 is built to bend either way.
11. **Should the 1950s–1990s alternate history from NC go into the vault's pre-war section?** *Recommended: only a two-line summary* (Malaya becomes a neutral Federation of States that profits from both blocs). Keep Sukarno (a real person), the "racially charged language in the constitution", and Indonesia "butchering communist forces" out of player-facing text. Those touch real constitutional politics and the real 1965–66 killings.
12. **Should Gergasi have a date in player text?** *Recommended: no.* "A known, if rare, sight by the 2200s; nobody agrees where they came from." The rest goes in a GM callout.
13. **Is Daz's "defeat at Federation hands" the fighting with the Chosen in the 2150s?** *Recommended: yes*, so "years ago" becomes "decades ago" (S-23). If you meant the 2196 Massacre, the wording should be "in the Federation's war", because that defeat came at Protectorate hands.

---

## Footnotes (inferences)

[^1]: Inference. In the canon note, 2115 / 2120 / 2130–32 / 2150 is the superseded sequence 2130 / 2150 / 2196–98 / 2200 compressed after the Chosen moved from 2200 to 2150. The Protectorate faction note kept 2130, which suggests it was never revisited.
[^2]: Inference from four sources together: `Bandawang Refugees.md` (red smoke), the Federation Gazette data log (the same explosion; `SCOPE_DECISIONS.md` lines 657–665), `Tulang.md` ("red sky disaster") and `Ikhwan Mystery Brief.md:26` (refugees on the first floor). Refugees cannot arrive before the explosion they are fleeing.
[^3]: Inference. Ikhwan is "Grandson of Razwan Hashim" (GM report). Razwan holds office 2175–2195 in the v1 draft, so a grandson is plausibly born after 2195. A man born then cannot have run PCI sites in 2150–2200.
[^4]: Inference. Adnan is an adult leader in 2150–2157, so born around 2110–2125. A son born around 2140–2155 and a grandson around 2170–2185 makes Jeb about 62–77 in 2247.
[^5]: Inference from stated ages: Bob 45 (born around 2202), Sam Lim 65 (born around 2182), and "the Rakan Watch would not have formed without Bob".
[^6]: Average human generation interval of about 26.9 years: Wang et al., *Science Advances* 2023, summarised at https://pubmed.ncbi.nlm.nih.gov/36608127/
[^7]: Malaysia has no winter; its year runs on the northeast (Nov–Mar) and southwest (late May–Sep) monsoons: https://www.Britannica.cOm/place/Malaysia/Climate
[^8]: Alor Setar to Pattani is 160–220 km depending on route (sources disagree): https://www.rome2rio.com/s/Alor-Setar/Pattani
[^9]: Putrajaya was established on 19 Oct 1995 and construction began that August: https://en.wikipedia.org/wiki/Putrajaya
[^10]: KL Sentral opened on 16 April 2001: https://en.wikipedia.org/wiki/Kuala_Lumpur_Sentral_station
[^11]: The Penang Bridge opened on 3 August 1985: https://en.wikipedia.org/wiki/Penang_Bridge
[^12]: Malaysian PM honorifics (Bapa Kemerdekaan, Bapa Pembangunan, and so on): https://www.nst.com.my/amp/news/nation/2016/01/121866/40th-year-demise-tun-abdul-razak-father-development ; https://ecentral.my/gelaran-perdana-menteri-malaysia/
[^13]: Inference. NC is undated on the desalination expedition. Placing it after 2198 gives the Federation a reason to look east and the Caliphate a reason to unite.
[^14]: Kerteh in Kemaman district hosts the Petronas complex and Malaysia's first refinery (1983): https://en.wikipedia.org/wiki/Kerteh

## Sources

- [Putrajaya — Wikipedia](https://en.wikipedia.org/wiki/Putrajaya)
- [Penang Bridge — Wikipedia](https://en.wikipedia.org/wiki/Penang_Bridge)
- [Kuala Lumpur Sentral station — Wikipedia](https://en.wikipedia.org/wiki/Kuala_Lumpur_Sentral_station)
- [Kerteh — Wikipedia](https://en.wikipedia.org/wiki/Kerteh)
- [Alor Setar to Pattani — Rome2Rio](https://www.rome2rio.com/s/Alor-Setar/Pattani)
- [Human generation times — PubMed](https://pubmed.ncbi.nlm.nih.gov/36608127/)
- [Climate of Malaysia — Britannica](https://www.Britannica.cOm/place/Malaysia/Climate)
- [Tun Abdul Razak, Father of Development — NST](https://www.nst.com.my/amp/news/nation/2016/01/121866/40th-year-demise-tun-abdul-razak-father-development)
- [Gelaran Perdana Menteri Malaysia — eCentral](https://ecentral.my/gelaran-perdana-menteri-malaysia/)
