# DIRECTION: the Prewar series (P1–P3) and post-war entries 1–9, with the UCL proposal

**Mode:** DIRECTION. Every flag below is a question for the GM, not a ruling.
**Scope:** 12 approved data logs, 4 new or rewritten notes, the UCL proposal, the folder move.
**Read in full:** the canon timeline (consolidated today); `ProTiga.md`; `Federation Bunkers.md`; `Perdana Bunker.md`; `Wira Bunker.md`; `The Protectron Yard.md`; `Great War.md`; `RobCo.md`; `Sepuluh Ribu.md`; `Economies of the Peninsula.md`; the RMR and PD currency items; `01_The Protectorate.md`; `Fortress City of Penang.md`; `Kulim.md`; `Grand Architect.md`; `Kosongs (Federation).md`; `Public Citizenship Initiative (PCI).md`; `UCL.md`; `UCL Regular.md`; the Chamber of Commerce note (opening); `Cheryl Chia.md`; `Faiz.md`; `Pahlawan.md`; `Gardener Steve.md`; `seio (Peng Brothers RNR).md`; `Peng Brothers.md`; `Janson Peng.md`; `Orange Peng.md`; `Big Ben.md`; `Guru Besar Raj.md`; `The Education Center.md`; `The Kancil Orphanage.md`; `The Marisni's.md`; `Order of the Fallen Gong.md`; `Gongmaster Jane.md`; `☢ Ghoulification.md`; `reference/northern-conflict.md` (UCL parts); the org-map boxes D13, F21, F24, F31–F33, H44–H46, K60, K65–K66, K79, K88; and data logs: *The New Plague*, *For Nora*, *Three Hearts, One Tiger*, *Power Concedes Nothing*, *The City of the Dead*, *A Place for Every Citizen*, *Federation Public Notice №118*, *Abave Journal 1* and *2*, *My Nite Rooteen*, *Requisition 88-C*, *Survey Note GJ-14*, *The Sixth Week*, *Nasi Cicak Rembau*, plus the openings of every other Before the War log.
**Not needed:** the Visual Standard Bible and Guide. None of this work makes an image. If the four new notes later get location art, run DIRECTION again then.

---

## 0. Counts

| Severity | Count |
|---|---|
| BLOCK | 6 |
| CHECK | 13 |
| NOTE | 14 |

All 33 are in the table in §6. The three that matter most:

1. **The bomb time disagrees with *Abave Journal 1*.** Fallout canon puts the bombs at about 9:47 AM Eastern on Saturday 23 Oct 2077. In Malaya that is about **9:45 PM Saturday night**. *Abave Journal 1* has the flash at **breakfast** on Saturday. The foreman's log (P3) and the Harapan dispatch (entry 7) both need a single answer, and the GM has to pick it.
2. **Two existing player-facing notes leak GM secrets that entries 6 and 9 depend on.** `The Kancil Orphanage.md` states the child-labour secret in its body text, outside any callout. `Order of the Fallen Gong.md` says the Mighty Gong is a missile-silo lid, also outside a callout. Fix both before the logs that point players at those notes.
3. **The Protectron Yard note disagrees with the new plan, and with itself.** Its intro says nine robots and its body says seven. It says "whoever first got them running" named them, where the GM's plan has the Rakan Watch naming them as a joke. A full replacement note is in §5.2.

---

## 1. Housekeeping the brief asked for

### 1.1 Folder plan

`Found Texts/Before the War/` holds 9 logs today. All 9 move to `Found Texts/Prewar Data Logs/`:

| File | id | Date in body |
|---|---|---|
| Bazaar Ramadan 2077 — Stall Allocation.md | `bazaar_ramadan_2077` | 2077 |
| Emergency Drill Record.md | `emergency_drill_record` | 3 Sep 2077 |
| For Nora.md | `for_nora` | 27 Aug 2077 |
| Re — That Thing You Asked For.md | `re_that_thing_you_asked_for` | 19 Aug 2077 |
| Scheduled Service Interruption.md | `scheduled_service_interruption` | 18 Oct 2077 |
| Security Handover Book — Basement Levels.md | `security_handover_book_basement` | 22 Aug 2077 |
| Taman Rimba Templer — Visitor Information.md | `templer_visitor_leaflet` | undated |
| The Peninsula Times — The New Plague.md | `peninsula_times_new_plague` | 17 Jul 2077 |
| Three Hearts, One Tiger.md | `three_hearts_one_tiger` | May 2077 |

- **`Abave Journal 1` stays in `Found Texts/Abave/`.** It opens on 22 Oct, but it belongs to a five-part series that runs to 2080.
- **Links to the old path:** none inside the vault. A grep of every vault `.md` file for "Before the War" finds nothing outside `CONVERSATION_HISTORY`. Outside the vault, the name appears only in the history files `CHANGELOG.md` and `reviews/*.md`, which do not need to change.
- **App impact:** the sync builds `category_path` from the folder name (`sync-obsidian.js:341`). Grants are stored by id in `characters.*.unlocked_logs` (`controllers.js:517`). Moving the files therefore changes only the folder label shown in the app. Players keep every log already granted.
- NOTE: in the app the folder will read *Data Logs › Prewar Data Logs*, which repeats "Data Logs". **Prewar** on its own reads cleaner. The GM decides.
- `.claude/agents/vault-author.md:132` says data logs go under `Found Texts/<region>/`. Tell the vault-author agent that "Prewar Data Logs" is a period folder, not a region.

### 1.2 Pre-war company list

**There is no list note in the vault.** The list exists only in the org-map, section **H "Pre-War corporations"**: H44 *Abave*, H45 *ProTiga (In the vault)*, and H46 *Pre-War Corporations*, which is a header with no content. In the vault each company has its own note in `01_World Details/` (`Abave.md`, `ProTiga.md`). Poseidon appears only as seio's alias, and RobCo is in `Fallout Details/`.

Two proposals:
- **Org-map box** (the GM edits the PDF; this matches H44's wording):
  > **Sungai Construction** — Sungai Construction (Sunway real-life equivalent) was a pre-war construction and property developer that built new townships on worked-out tin-mining land. It built the Federation's three bunkers jointly with ProTiga, and its unfinished Bandawang estate is today's Protectron Yard.
- **Vault:** a new glossary note, `01_World Details/Sungai Construction.md`. Full text is in §5.1.

### 1.3 Data-log ids already used (54)

Run over `Found Texts/` (grep for `"id": "..."`):

`a_bandawang_lama_household_diary a_bartender_s_notebook a_place_for_every_citizen abave_journal_1 abave_journal_2 abave_journal_3 abave_journal_4 abave_journal_5 bandar_buaya_handbill bazaar_ramadan_2077 casino_floor_security_log circular_pc_113 client_courtesy_call defenders_of_taman_templer domestic_water_entitlement emergency_drill_record federation_public_notice_118 field_note_unfiled for_nora grand_library_admission ipoh_marble ishtars_grand_opening marked_in_chalk my_nite_rooteen nasi_cicak_rembau_radio night_watch_edge_post note_to_self_polish_the_axe notice_of_determination on_the_salt oral_history_batu_lapan peninsula_times_new_plague peribahasa_baru power_concedes_nothing protiga_maintenance_log_line_4 rakan_watch_trade_ledger_partial re_that_thing_you_asked_for requisition_88c scheduled_service_interruption scrapyard_wall security_handover_book_basement selling_the_bar shipment_manifest_0447 survey_note_gj_14 templer_visitor_leaflet the_city_of_the_dead the_longest_road_is_long the_restless_song the_sixth_week three_hearts_one_tiger trench_diary undelivered`

`src/dataLogs.js` also carries three ids from outside `Found Texts`: `baccarat_rules`, `federation_gazette_bandawang_explosion` and `session_1_recap`. None of the 12 ids proposed below collides with anything in either list.

**JSON shape** (copy *The New Plague*):
```json
{
  "id": "", "name": "", "type": "data_log",
  "body": "Paragraphs separated by \n\n."
}
```
Any GM-only note goes **above the json block** as a `> [!gm]- Secret` callout. *Power Concedes Nothing* uses a bold `**GM note — Secret**` heading instead; don't copy that.

### 1.4 Real-world names in these twelve logs

| Name | Where it comes up | Proposal |
|---|---|---|
| **Tenaga Nasional** (TNB, a real utility) | `ProTiga.md` lists it as a merger partner. P2 will name it. | CHECK. *Three Hearts* already says just **"Tenaga"**. Use "Tenaga" in P2, or **"Tenaga Malaya"**, and correct `ProTiga.md`. |
| **Petrogas** | ProTiga merger partner | NOTE. It reads like Petronas Gas, but it is generic enough to keep, and *Three Hearts* already uses it. |
| **ProCars Automotive** | ProTiga merger partner | NOTE. Already an in-world stand-in for Proton. Keep it. |
| **Sunway** / **Sungei Way** | P1, P3, the new note | CHECK. Sunway Group began in 1974 as **Sungei Way Holdings**, a tin-mining company[^s1]. "Sungai Construction" is therefore very close to the real company's own root name. Keep it for the joke, or soften it: **"Sungai Jaya Construction"** or **"Arus Bina Berhad"**. |
| **KL Sentral** (opened 2001) | `Perdana Bunker.md`: "beneath the ruins of the pre-war transportation hub KL Sentral" | CHECK. SCOPE_DECISIONS says "under the old central station of KL". In P1 write **"beneath Central Station, Kuala Lumpur"** and correct the note. |
| **Komtar / Kompleks Tun Abdul Razak** (named after a real Prime Minister) | Entry 3 and the Ivory Tower note | NOTE. Never print it. If the tower needs a pre-war name, use **"Menara Mutiara"** (Penang is the "Pearl of the Orient"). |
| **Putrajaya** (built after 1995), **Shah Alam** | P1, entry 7 | NOTE. These are place names the GM has already kept (`Federation Bunkers.md`, SCOPE). |
| **Vault-Tec, RobCo, Poseidon Energy** | P1, P2, P3 | NOTE. Deliberate Fallout references, so they are canon (ART_DIRECTION line 34). |
| **Bernama, RTM, Utusan, The Star, NST** | P1, P2, entry 7 | Don't use any of them. The pre-war newspaper is **The Peninsula Times** (*The New Plague*). For a broadcaster use **"Radio Malaya"**: a real station from 1946 to 1963, so it fits the period and predates the divergence[^i1]. Or keep the dispatch an off-air recording, as *Nasi Cicak Rembau* does. |
| **Jabatan Penerangan, JPAM, Kementerian Pertahanan** | P1 | NOTE. Generic government bodies. Use English forms ("Ministry of Home Defence", "Department of Information") and never name a real minister. |
| **Telekom Malaya, Indah Water, PosLaju** | Possible in P3 or entry 2 | NOTE. Precedent: *For Nora*, *Scheduled Service Interruption*, *Re — That Thing*. |
| **Snow White / Disney** | P3 and the Protectron Yard note | NOTE. The 1937 film predates the divergence, so it can exist in-world. Say "an old picture about a princess and seven little men", never "Disney". |
| **The LDS Church (Mormons), Falun Gong** | Entry 9 | CHECK. Never name either. See entry 9. |
| **KLSE / Bursa Malaysia** | P2 | NOTE. Write "the Kuala Lumpur exchange". "Bursa" is the post-war black market in-world, so keep it out of 2056. |
| Temu, Shein, Mixue and other modern brands | UCL material | Never use them. |

### 1.5 Where each log goes

| # | Log | Folder | Why |
|---|---|---|---|
| P1 | Bunker article | Prewar Data Logs | 2077 |
| P2 | ProTiga merger | Prewar Data Logs | 2056 |
| P3 | Foreman's site diary | Prewar Data Logs | 22–28 Oct 2077. The GM's choice; it is the Prewar folder's centrepiece. |
| 7 | Harapan Line dispatch | **Prewar Data Logs** (alternative: The Federation) | Dated 23 Oct 2077. Keep every log dated 2077 together. |
| 1 | KL citizen, 2090 | The Peninsula | Next to *The City of the Dead* |
| 2 | Counterfeit stamp recording | The Federation | RMR and a Federation dispensary |
| 3 | Scrap dealer at the red light | The Peninsula | Next to *Survey Note GJ-14* and *Circular PC-113* |
| 4 | Cheryl Chia's field notes | Bandawang | She watches Faiz there |
| 5 | seio promo | Bandawang | seio sits in `Locations/Bandawang` |
| 6 | Guru Besar Raj | Bandawang | The Education Center |
| 8 | PCI promo | The Federation | Next to *A Place for Every Citizen* |
| 9 | Fallen Gong script | Bandawang | It is Gongmaster Jane's "Spread the word!" handout |

---

## 2. Shared fact: when the bombs fell, in Malayan time

- **Fallout canon.** Saturday 23 October 2077, in the US morning. Warheads hit Pennsylvania and New York at 9:42 AM Eastern and the rest of the US at 9:47 AM. The exchange lasted about two hours, and who launched first is unknown[^f1][^f2].
- **The conversion** to Malaya (UTC+8, no daylight saving):
  - If the US was on summer time (EDT, UTC−4), 9:47 AM = 13:47 UTC = **9:47 PM Saturday 23 Oct** in Malaya. In the real calendar the US would still be on summer time on 23 October[^i2].
  - If you read the Fallout wiki's "EST" literally (UTC−5), it is **10:47 PM Saturday**.
  - With the two-hour exchange, Malayan strikes land between about **9:45 PM and 11:45 PM on Saturday 23 Oct**. That window keeps CLAUDE.md's rule that the bombs fall on 23 October.
- **Confidence.** High on "Saturday night in Malaya". Medium on the exact hour.
- **What the vault says now:**
  - `Fallout Details/Great War.md` gives the date and the two hours, and no time of day.
  - *Abave Journal 1* is consistent on Friday ("22 October 2077, 11:48 PM"). Then on Saturday "We were at the **breakfast buffet**. There was a light at the windows…". That is about 14 hours before the canon time. It is the conflict behind **BLOCK 1**.
- **Proposal: keep canon and edit *Abave Journal 1*** (about two lines). Change "We were at the breakfast buffet" to something like "We were at the baccarat tables after dinner", and move "The big chandelier came down on the omelette station" to a dessert trolley or the baccarat table. A casino at 10 PM on a Saturday is busier and makes the better scene.
- **The other option** is to declare that FOES ignores Fallout's time of day. Then P3 and entry 7 must also put the strikes in the morning.
- **A night flash also suits P3.** Flash blindness lasts longer at night because the pupils are dilated. A 1-megaton burst can cause it 53 miles (85 km) away on a clear night, against 13 miles by day. Retinal burns happen whenever someone looks straight at the fireball[^r1].

---

## 3. The briefs

Each brief gives: canon to use (with paths), what must not be said, voice, length, id and name, the folder, and any Fallout reference.

### P1. *The Peninsula Times*: Three Shields for Malaya

- **id / name:** `peninsula_times_three_bunkers` / "The Peninsula Times — Three Shields for Malaya"
- **Folder:** Prewar Data Logs. **Length:** 450–650 words. Make it in-depth, like *The New Plague*, but longer.
- **Date:** after May 2077 and before mid-July, e.g. **Monday 28 June 2077**. *Three Hearts* (May 2077) calls the bunkers "a certain very exciting national project that we are not allowed to talk about yet. (You know the one, KL team. Keep digging!)". The article therefore has to be the unveiling. Dating it before May is **BLOCK 3**.
- **Voice:**
  - The government's statement printed in the paper, padded with a reporter's admiring copy.
  - Official reassurance hiding the obvious: the shelters are "a precaution in preparation for the unlikely scenario" (the GM's phrase).
  - The punchline is that the article explains who gets a place, and it isn't the reader.
- **Canon to use:**
  - **Three bunkers, joined by an underground monorail** (`02_Factions/The Federation/Federation Bunkers.md`, `Locations/Perdana Bunker.md`, `Locations/Wira Bunker.md`):
    - **Perdana**, under Central Station, Kuala Lumpur, 13 levels. The continuity-of-government site, with broadcasting equipment, hydroponics and a fusion generator. It also houses a cultural library: in 2077 it is "the national film and broadcast archive", which becomes the Federal Cultural Library.
    - **Wira**, under Shah Alam. Industrial and defence: workshops, laboratories, munitions, a fusion generator linked to Perdana's.
    - **Harapan**, under Putrajaya. It "was never meant to house anyone": it is the national records repository, holding technical manuals, engineering drawings and legal foundations.
  - **Builders:** ProTiga jointly with **Sungai Construction** (the new joint-venture fact). Contrast the giant ProTiga and the township builder, and give it a name like "Projek Perisai Negara" (National Shield Project).
  - **Vault-Tec consultants** from America "advised on the design".
  - **Context** (timeline, Pre-War): Malaya is a launching pad for the war in Vietnam (2074). US–Malaya relations sour in August (*For Nora*). Late June is the last moment the "American friends" line can be written straight, which is the dark joke.
- **Must not say:**
  - The words "Chosen", "Keturunan", "Federation of Malaya", "Sword" or "Ushers". They are all post-war.
  - Anything about ProTiga HQ, its vault, Level 16, or US Army contracts and caches (SCOPE, "ProTiga heist logs: remove the Americans on Level 16 / Army contract").
  - Anything hinting at the monorail's collapse, or at what is inside Harapan beyond "records".
- **Fallout reference:** Vault-Tec. Its own pitch was "preparing for the future"; a consultant quote can borrow the tone without copying any slogan. Keep the Vault-Tec name to one or two mentions.
- **Dark-comedy beats:**
  - "Places will be allocated to essential personnel on the basis of merit. Families will be notified."
  - The Ministry reminds the public that no shelter is needed for the general population, "as there will be no need for one".
  - A closing line selling something, echoing *The New Plague*: "Sungai Construction show homes now open in Bandawang", which sets up P3.

### P2. *The Peninsula Times*: A Tiger Is Born (2056)

- **id / name:** `peninsula_times_protiga_merger` / "The Peninsula Times — A Tiger Is Born"
- **Folder:** Prewar Data Logs. **Length:** 350–500 words.
- **Date:** **2056**, the year of the merger. *Three Hearts* says "Twenty-one years later" in May 2077. Example: **Wednesday 15 March 2056**.
- **Not a duplicate.** *Three Hearts* is a staff newsletter looking back from 2077. P2 is the press coverage on the day itself: a business-page piece that reads like corporate PR (org-map, the A-block plan: "a pre-war corporate article written from a PR person's perspective about ProTiga, and its formation"). Reuse the founding chairman's line ("a tiger with three hearts does not die easy"), as quoted in *Three Hearts*, so the two logs agree.
- **Canon to use:**
  - The three partners: **Petrogas** (fuelled the nation for sixty years), **ProCars Automotive** (built the nation's cars), and **Tenaga** (kept the lights on). Sources: `01_World Details/ProTiga.md` and *Three Hearts*.
  - The name is a pun: Pro + Tiga, "three", which also sounds like "tiger".
  - The context is "when the pumps ran dry in the fifties". Timeline: 2050s–60s, petrol becomes too expensive to use and alternative energy is being explored.
  - 2056 falls in the middle of the **New Plague** (2053 to about 2059, per *The New Plague*). Hold the signing under quarantine rules, with masks, a closed-circuit television link and the "Duduk Rumah, Duduk Malaya" jingle. That is the dark comedy.
- **Poseidon:** in Fallout the company is **Poseidon Energy**[^i3]; the vault has **"Poseidon Oil"** as the brand on seio's station. Write "America's mighty **Poseidon Energy**" in P2. Its forecourts can be Poseidon Oil, and then the two names are consistent. The speculation is that ProTiga "could one day go toe to toe with Poseidon".
- **Foreshadow:** `ProTiga.md` says ProTiga "attempted to compete with RobCo, only to end up a shallow copy". A chairman's aside about "Malayan robots, one day" lands as irony.
- **Must not say:** Tenaga *Nasional* (see §1.4), Abang Kopi (no date in canon; leave it out), the bunkers, or anything about HQ security.
- **Voice:** breathless business PR. "A symbol of Malaya's prosperity", printed in the decade the oil runs out.

### P3. The Protectron Yard site diary (7 entries, 22–28 Oct 2077)

- **id / name:** `protectron_yard_site_diary` / "Site Diary — Taman Seri Bandawang, Phase 2". The estate name is a proposal.
  - Option: split it into three logs with ids `_1`, `_2` and `_3` (entries 22–23, 24–26, 27–28) so the GM can release them in stages, the way the Abave Journals work. The GM asked for one multi-entry log, so one log is the default.
- **Folder:** Prewar Data Logs.
- **Length:** 1,300–1,800 words in total. Day 1 runs about 250 words; days 2 to 7 run 150–250 each, getting shorter as he weakens.
- **The device:**
  - Malaysian construction sites keep a **site diary**: a daily record of weather, manpower, work done and remarks[^i4].
  - On day 1 the foreman writes it himself. From day 2 he is blind, and he **dictates it to one of the Protectrons**, which transcribes it.
  - That solves "how does a blind man keep a log". It also supplies the dark comedy without mocking the dying man. The robot's flat header fields sit above his words, for example:
    > `WEATHER: RAIN (BLACK). MANPOWER ON SITE: 1 FOREMAN, 7 UNITS. WORK DONE: 212 BRICKS. REMARKS (DICTATED):`

    and the headcount falls day by day, from 14 to 1.
- **The foreman:**
  - A kindly old Chinese site foreman employed by **Sungai Construction** (ties to P1).
  - He lives in the site *kongsi* (workers' quarters on the plot), so the robots are a few steps away[^i5].
  - **Make him a widower** with no family on stage. Entry 7 already has a man telling his wife and children he loves them; doing it twice would blunt both.
  - Name suggestion: **Chong Kah Wai ("Uncle Chong")**. Avoid the surnames Tan, Lim, Choo, Peng, Chia, Loo and Leong, which already belong to factions or NPCs. Avoid "Yap": Yap Ah Loy is too famous a real Rawang/KL name.
  - His English is plain, with light Manglish and Cantonese particles. Don't caricature him.
- **The robots in the log:**
  - He must **not** use the dwarf names. The Rakan Watch gives them those generations later.
  - He calls them by their stencilled unit numbers and "my boys" / *budak-budak*. That leaves the dwarf names free as a later layer.
- **Calendar and beats.** Day numbers are diary entries; the bombs fall on day 2.

| Day | Date | Beat | Plausibility notes |
|---|---|---|---|
| 1 | **Fri 22 Oct** | A normal working day, written by his own hand. The crew tease the robots as "useless". One worker calls him a traitor for using **RobCo** while "the Americans are coming". He answers that a brick doesn't know who laid it, and hopes they'll come round. The radio talks invasion (timeline, Late 2077). The crew say "ProTiga also got robot", and he says the ProTiga unit fell in the trench on its first day. | October in the Klang Valley is the inter-monsoon season: hot mornings and heavy afternoon thunderstorms[^i6]. Put a storm in the weather line. The water supply cut on the 21st (*Scheduled Service Interruption*) means the site tank was filled on purpose. Pay that off on day 3. |
| 2 | **Sat 23 Oct, dictated near midnight** | A half-day Saturday. Night in the kongsi. A far-off glow and a bang (Kuala Lumpur, about 30 km south[^i7]). He goes out to look. A second flash, much closer (the **North Bandawang** strike: `Locations/Bandawang/North Bandawang.md`, org-map F24), then white, then nothing. Heat on his face, the wind, crowds running, he can't find the gate. A Protectron's voice ("please follow this unit") walks him into the site office. | He hears and **then** looks, so the GM's order holds. Several strikes inside the two-hour window also fit canon. Permanent blindness needs a **retinal burn** from looking straight at the fireball. Plain flash blindness wears off[^r1]. |
| 3 | **Sun 24** | He has vomited all night and blames shock, or bad char kway teow. Black rain. Strangers at the fence. A man grabs his hand begging for water, and the man's skin comes away in his. Uncle Chong thinks the man is badly burnt, and doesn't understand. The robots fetch water from the full site tank. | Nausea and vomiting within hours are the first stage of acute radiation sickness, and the sooner they start, the higher the dose[^r2]. Skin sloughing off burn victims matches *Abave Journal 2* ("skin coming away from them like wet paper"). **Don't reuse "wet paper".** |
| 4 | **Mon 25** | **The false dawn.** He feels better, makes plans and orders the robots to keep to the work order. A neighbour whose face is "peeling" says she doesn't hurt any more: the first ghoul, without the word. | The **latent stage**: the patient feels fairly well for hours to weeks[^r2]. This entry keeps the log from being one long decline. |
| 5 | **Tue 26** | Fever, diarrhoea, mouth sores. He can't stand, and the robots carry him. Gunfire in the town. Someone outside who used to answer to his name now only growls: the first feral. Robot remark: "FOREMAN INSTRUCTS 'LAY THE BRICKS LAH'. BRICKS LAID: 212." | **Manifest illness**, gastrointestinal type (5–12 Gy), which kills within one to two weeks[^r2]. Leave out hair loss and bruising (they usually take 2–3 weeks) and any numbers or medical terms. |
| 6 | **Wed 27** | Weak and wandering. He talks to the robots as friends, and asks one to light joss sticks for him, which it does with its welding torch. Short. | Keep it simple. Give him one funny line. |
| 7 | **Thu 28** | He is dying. He hopes the world can forgive the sins of the past: everyone's, America's, China's, Malaya's, his own crew's. He tells the robots to **finish the hall** and to find a new home and good people. Last lines are the robot's: "FOREMAN NOT RESPONDING. AWAITING INSTRUCTION. CONTINUING WORK ORDER." | The ending pays off at the yard: they are **still building the hall**, the PCs' home (`The Protectron Yard.md`; org-map D13). Death five days after exposure means a very high dose, which is plausible this close to a strike[^r2]. |

- **Keep it moving, not maudlin:**
  - Each entry has one concrete task: water, the gate, a stranger, bricks, joss sticks.
  - Every entry has one small joke, from him or from the robot's field labels.
  - Day 4 brings hope.
  - Entries get shorter as he weakens; the length shows the decline.
  - No speeches until day 7, and that one stays under 80 words.
- **Must not say:**
  - Anything about the prison or Kelam Sungai (the PCs' origin).
  - Who the eighth Protectron is.
  - The Ghoul King.
  - Medical-manual vocabulary.
  - The dwarf names.
- **Possible clashes:**
  - **"Useless machines":** the phrase appears **nowhere** in the vault or the org-map, so there is nothing to clash with. The colleagues' "useless" on day 1 and the Rakan Watch's "useless" generations later can echo each other on purpose.
  - **Construction Protectron** (`Bestiary/Construction Protectron.md`): the bestiary unit is hostile ("swings it like one at anything that trips its motion sensor"). The yard's seven are friendly. That's no contradiction if the bestiary entry describes *unattended* units elsewhere. The new Yard note says so (NOTE 21).
  - **Requisition 88-C** has four construction Protectrons waiting at a prison. **Do not tie the yard to it.** It touches the prison and the PCs' origin.
- **Fallout reference:** RobCo Protectrons and their stock lines, rephrased. "Please remain calm" fits naturally.

### Entry 1. A KL survivor on the Sepuluh Ribu (c. 2090)

- **id / name:** `ten_thousand_scrawl` / "Dey Call Demselfs Sepuluh Ribu". The name is a proposal.
- **Folder:** The Peninsula. **Length:** 120–200 words.
- **BLOCK 2: the city is not "KLB" in 2090.** It is renamed Kuala Lumpur Baru in **2150** (timeline 2150; `Kuala Lumpur Baru.md`). The writer says **"KL"**.
- **Canon to use** (timeline, 2090; `02_Factions/The Federation/Sepuluh Ribu.md`):
  - Raiders, scavengers and beasts besiege the ruin.
  - Ten thousand ghouls band together. Members are "veterans of war, former engineers, scavengers, scientists".
  - The original members wear "a faded **pre-war patch** on their chest". Here that's an army or police patch on a ghoul, which covers the GM's ex-soldiers and ex-police.
  - They adopt the old **Malayan Ringgit**. Optional: the writer has been paid in old ringgit and is proud of it.
- **Voice:**
  - Barely literate, in phonetic Manglish, but **an adult's misspelling**, so not a copy of *My Nite Rooteen* (a child).
  - Suggestion: make the writer a ghoul who still calls ghouls "ugly monster". "Dey ugly lik me but dey got gun" lands both the prejudice and the joke from inside.
  - Hopeful by the end.
- **Must not say:**
  - The Ghoul King or a "Kingdom".
  - Ghoul sovereignty slogans. "Malaya for Malayans!" is the later kongsi's motto, so leave it out or keep it as a half-heard chant.
  - Anything about the 2130 massacre.

### Entry 2. The trusting merchant and the con man (after 2150)

- **id / name:** `counter_recording_stamped_ringgit` / "Counter Recording — The Stamp".
- **Folder:** The Federation. **Length:** 250–400 words of transcript.
- **Canon to use** (`01_World Details/Economies of the Peninsula.md`): "An unstamped pre-War note is not money: the Federation honours old Ringgit only once it has been stamped, which is why counterfeit stamps are worth more to some people than the notes themselves." The RMR exists only from **2150** (timeline 2150). The merchant says **"ringgit"** for everyday money; a clerk would say "RMR".
- **Mechanics:**
  - The merchant licks his thumb and rubs. A real Federation stamp doesn't run; this one smears. Underneath is a bare pre-war note.
  - A possible line: "Federation ink doesn't run. Only thing in the Federation that doesn't."
  - Optional real-world wink: Malaysia's 2013 "indelible" election ink that washed off[^i8]. Use it only if the GM wants a Malaysian joke here.
- **Recording device:** a counter recorder that merchants keep for **Chamber of Commerce arbitration** (`🏛️Chamber of Commerce 马来亚總商會.md`: the Chamber arbitrates "wage and supply contracts"). It has a canon reason to exist.
- **Ending:**
  - The con man stabs the merchant, mutters "should've taken the deal".
  - "…what's that light?"
  - `[loud impact]`
  - `[DEVICE DISCONNECTED]`
- **Don't duplicate** *Client Courtesy Call*, which also ends with a recording cut off. Give this one a different header (e.g. `COUNTER RECORDER — FOR ARBITRATION — RETAIN 30 DAYS`) and different closing tags.
- **Must not say:** the counterfeit ring's backer (the "Federation defector" in the Economies GM callout). Keep the con man small-time.
- **CHECK 14:** `Items/Currency/Reformed Malayan Ringgit.md` says "nearly any old Ringgit can be used". That contradicts Economies, and this log relies on Economies.

### Entry 3. The scrap dealer at the red light (2232–2241)

- **id / name:** `within_sight_of_the_red_light` / "Within Sight of the Red Light".
- **Folder:** The Peninsula. **Length:** 400–550 words.
- **Date:** at least **2232**. The contrast with PCI ghoul labour needs the PCI, which launched in 2232. Before 2242 suits the "subtle" UCL presence. Suggest **2238**.
- **Canon to use:**
  - **Protectorate Dollar** (Economies; `Items/Currency/Protectorate Dollar.md`): stable, serialised, traded through **licensed traders** and "sanctioned merchant guilds". Smuggling is punished by confiscation or death. Make him a licence-holder who adores the dollar.
  - The Fortress City "only admits merchants it considers vital" (`Locations/Fortress City of Penang.md`). He is outside it, looking at the tower across the channel. **Butterworth to George Town is about 3–4 km**[^i9], so the light is plainly visible.
  - **Kosongs** (`Kosongs (Federation).md`): "excessively cheery", a Protectorate brand on the neck, doing the labour. Contrast them with the Federation's PCI "uncles" (`Public Citizenship Initiative (PCI).md`).
  - **Kulim** sits "at the outer edge of Protectorate artillery range" (`Kulim.md`). He passes the **Crater Line** (new note, §5.4) and feels safe with no patrols in sight. That matches the Protectorate's own boast: "the silence of a happy, productive society" (`01_The Protectorate.md`).
  - Route: **The Longest Road** (`Locations/The Longest Road.md`). He can stop at seio on the way (`seio (Peng Brothers RNR).md`).
- **Guards:**
  - The Protectorate disqualifies ghouls (`01_The Protectorate.md`, "Physiology"), so **ghoul guards would be refused**.
  - Proposal: a **Chamber of Commerce-licensed escort**. The Chamber holds merchant quarters in Protectorate towns. It's expensive, and he brags about the price.
  - His guards should not sound like Botak (*The Longest Road Is Long*).
- **Voice:** rich, rough and blue-collar. He counts money aloud, swears, and is sentimental about the dollar. He ends wishing the Federation could be like this. Don't let him notice the irony; the reader should.
- **UCL / "more Chinese shops":** follow the rules in §4(d).
- **Must not say:**
  - Anything about Syurga's backer (a GM secret in `01_The Protectorate.md`: "Quietly, the Protectorate is bankrolling Ishtar").
  - The Gergasi labs.
  - A UCL war.

### Entry 4. Cheryl Chia's field notes on a Pahlawan (2247, before the campaign)

- **id / name:** `chia_field_notes_outside_remit` / "Field Notes, Outside Remit".
- **Folder:** Bandawang. **Length:** 450–600 words.
- **Keep the existing note** (`People/Cheryl Chia.md`). She is a "cute and curious Protectorate scientist", with "a solid engineering background", who wants "to study the Kapcai". Her image shows her in the Scrapyard. So she is **in Bandawang on a Kapcai survey**, and the Pahlawan study is the thing she was *not* sent to do. Hence the title.
- **"Schools of Thought" do not exist in canon** (CHECK 9).
  - The vault has the **five Divisions**: Defence, Mercantilism, Energy, Infrastructure, Education (`Directorate.md`, `Prime Functionaries.md`). *Survey Note GJ-14* and *Circular PC-113* sign as "Directorate of Defence" and "Directorate of Education — Division of Public Clarity".
  - "School of Defense… School of Education" appears only in brainstorms (`CONVERSATION_HISTORY/Lore Chat.md:9398`; `Fallout Eastern Shores Request.md:3937`, which maps each School to a Division). Discussed, not canon.
  - Proposal: her byline reads **"Field Researcher, Directorate of Infrastructure (Vehicles)"**. That fits her engineering background, and the field never studies people. If the GM wants "School of …", rule on it first and add it to `Directorate.md`.
- **Where she sees a Pahlawan:**
  - Faiz is in Bandawang before the campaign (`People/Faiz.md`; org-map D13).
  - He is openly a Pahlawan there. `Pahlawan.md`: "if you can recognise a Pahlawan, it is most likely because they wanted to appear as one… Faiz is one such rare sight in Bandawang".
  - Set her observations at the Scrapyard, where she works, and around Bandawang Baru. Him helping people fits "the same people are the ones who turn up to help a community in trouble" (`Pahlawan.md`).
- **Canon she gets "wrong" then corrects:**
  - The Protectorate tells her Pahlawan are elite warriors.
  - She finds them to be "an elite militia, not an army… pilgrims on a personal *Hajj*", with no ranks, serving their *kampong* and the Path (`Pahlawan.md`).
  - The Protectorate frowns on spirituality ("Spirituality, aesthetics, and emotional expression are frowned upon", `01_The Protectorate.md`). The Caliphate calls the Protectorate "soulless". She starts to see faith as useful.
  - She resolves to visit the Caliphate.
- **Must not say:**
  - Faiz's name. Use "Subject P" or "the subject".
  - His heist, the vault, Boss Bob, the Peng brothers, or "Naim". Faiz's scouting of the Pengs is a GM secret, so no notes on him "taking an interest in the rest stop".
  - The PCs. Date it before the Kelam Sungai explosion.
  - **Sensitivity:** she may misread the faith in academic jargon, and that is the joke. The *Hajj* is a real pillar of Islam, and the Path is its in-world echo, so the text must never mock the practice itself. The joke is her method (charts, a "spirituality index", tallies of how often he smiles), never his belief.
- **Voice:**
  - Numbered observations. Socially oblivious ("Subject declined to be measured.").
  - Her crush shows in what she records, never in what she admits: the glasses, the easy smile (both in the canon description), three paragraphs on how he ties his sandal.
  - The last line is a travel requisition to the Caliphate, refused or unsent.

### Entry 5. seio promo, by Janson Peng

- **id / name:** `seio_come_lah` / "seio — Come Lah!". Keep **seio** lowercase, as the note does.
- **Folder:** Bandawang. **Length:** 120–200 words.
- **Canon to use** (`Locations/Bandawang/seio (Peng Brothers RNR).md`; org-map F33):
  - A petrol-station husk on **The Longest Road**, with two buildings (station and garage).
  - A **windmill** on the roof, and **fusion-battery charging terminals** where the pumps were, powered by a rare fusion core plus solar and wind. That is the canon reason the air-cond exists at all.
  - Famous for **brahmin rendang from Nick's farm**.
  - Deliberately independent: "the Pengs know to keep their nose out of everyone's business". A line like "WE NO KAPOH YOUR BIZNES" works.
  - The name comes from the faded **Poseidon** Oil letters. A gag about the missing letters fits.
- **Janson** (`People/Janson Peng.md`): tiny, fierce, a contortionist, in colourful glasses. Signature as the GM gave it: *"Janson Peng, seio's most handsomest and most humble owner"*. Optional P.S.: "My brother Orange can carry your bag. One bag."
- **Fine print:** "Air-cond only for EXTRA SUPER DUPER VVIP. VVIP status determined by Janson."
- **CHECK 16: KTV/karaoke has no precedent.** Karaoke dates from 1971, well after the divergence[^i10]. The nearest precedents are Rock Kapak and the Battle of the Bands (the Axe Gang). Options:
  - Keep "KTV" as a deliberate Malaysian reference, like Indah Water.
  - Write it as **"SING-SONG NITE with real microfone"**. A 1950s "sing-along" with a jukebox and a PA mic gives the same joke in period.
- **Must not say:**
  - That Nick is the family patriarch (`Peng Brothers.md`: "isn't publicly known as such"). "Nick farm" is fine; "our Pa Nick" is not.
  - Faiz or the heist.
- **Sensitivity:** the misspelling is Janson's showmanship, not a joke that Malaysians can't spell. Mix flashy salesman words ("CONFIRM PLUS CHOP", "SURE GOT", "VERY THE SHIOK") with a few honest misspellings. Keep it affectionate.

### Entry 6. Guru Besar Raj on Balu

- **id / name:** `raj_remarks_balu` / "Teacher's Record — Remarks: Balu".
- **Folder:** Bandawang. **Length:** 250–350 words.
- **Canon to use:**
  - `People/Guru Besar Raj.md`: a ghoul headmaster in a short-sleeved shirt and jeans who "carries a ruler with him at all times". He is a Rakan Watch representative. Org-map K60 calls him "a relatively unimportant NPC", so this log can give him a voice.
  - `Locations/Bandawang/The Education Center.md`: a joint Tan Family and Rakan Watch initiative, "open to anyone", in a repurposed primary school on a hill above Bandawang Lama. Classrooms are given to subjects and painted with lesson murals. There is a **Grand Library terminal at one Dinar a question**, which is good for a gag about Balu trying to get a free question out of it.
  - Malaysian schools keep a teacher's *Buku Rekod Mengajar* (teaching record book) with a remarks column. Use it for the format[^i11].
- **Classmates:**
  - **Orange Peng**, 24 (org-map K65): simple, a gentle giant.
  - **Ben** is the same character as `People/Big Ben.md`: "the Gergasi who stands at the gate of Syurga dressed as a clock tower", answers to "Ben", gentle with children. **Player text must say "Gergasi", never "super mutant"** (CLAUDE.md). Ben is not new: the note exists and agrees with everything the GM describes.
  - Two new facts that contradict nothing:
    - Orange and Ben are best friends.
    - Ben comes to class, ideally still in costume, the spire scraping the door frame.
  - Orange's job is **not stated** in any note. If the log needs one, the natural fit is the family rest stop or garage at seio (NOTE 26).
- **Balu:**
  - An orphan who comes and goes as he likes, cheeky, always learning.
  - He has been absent for three days. Raj is worried and hopes Balu "has kept away from the Kancil lot".
  - **Language note:** in Malay, *balu* means "widow"[^i12]. As a Tamil short name (from Balakrishnan or Balasubramaniam) it is ordinary, and Malay readers may hear a soft irony. Fine to keep.
- **Kancil: hint only, inside existing framing.**
  - What is public: Kancils become junior mechanics, and the Axe Gang's garages call them "the Marisni's" (`People/The Marisni's.md`).
  - So Raj can say only what any Bandawang local sees: Kancil children stop coming to class "once they are old enough to hold a spanner", and the Mothers came by asking after Balu.
  - **Invent nothing else:** no injuries, no taking, no named Mother.
- **BLOCK 6:** `02_Factions/The Kancil Orphanage.md` states the secret in its **body text**: "Every Mother eventually learns the orphanage's dark secret: Mother Shalini kept the doors open by hiring out her children…". Players who hover "Kancil" in this log will read it. Move that paragraph into the existing `> [!gm]-` callout before granting this log.
- **Voice:** a tired, kind, formal schoolmaster. Short dated lines. One ruler joke. No moral at the end; the record just stops on "Absent. (Day 3.)"

### Entry 7. Harapan Line: the last transmission (23 Oct 2077)

- **id / name:** `harapan_line_last_transmission` / "Harapan Line — Last Transmission".
- **Folder:** Prewar Data Logs. **Length:** 200–300 words.
- **Canon to use:**
  - Timeline 2077: "The monorail to the third bunker, **Harapan**, collapses under the rubble of **Putrajaya**, and with it goes the only way into the Federation's archive."
  - `Federation Bunkers.md`, Harapan section: "the underground monorail that linked the three bunkers went down under thousands of tonnes of rubble. Perdana and Wira kept their connection to each other. The line to Harapan simply stopped."
- **Time:** about **10:00 PM to 11:45 PM, Saturday 23 Oct**, per §2. A driver on a late run is plausible on the night everything was moving.
- **Provenance:** copy *Nasi Cicak Rembau*'s header style: `[TRANSMISSION — HARAPAN LINE OPERATIONS CHANNEL — RECORDED OFF-AIR]`. An unknown listener caught it.
  - CHECK 19: don't label it a *Perdana Control* log. That would tell players Perdana heard him and did nothing, which makes a claim about the Chosen's origins. The GM may want that, but it is a ruling.
- **Content:**
  - He is pinned in the cab, the tunnel is down both ways, and the radio runs on the cab battery.
  - Practical last words to "anyone on this channel": stay down, stay off the surface, conserve water.
  - Then to his wife and children, by name: that he loves them, and something ordinary (the motorbike is due for service, the school fees are in the tin).
  - Plain and sad, as the GM asked. NOTE: this is the one log here that is grim on purpose, without a joke; the GM asked for that. The single ordinary detail does the work.
- **Must not say:**
  - What the train carried or whom.
  - Whether Harapan's doors closed.
  - Whether anyone inside lived.
  - The Sword, the Chosen, or "archive". He's a driver; he doesn't know.
- **Driver:** any community. A Malay or Tamil railwayman suits the KTM-era labour history. Name proposal: **Encik Rosli** or **Mr Suresh**.

### Entry 8. PCI promo: "Growing Pains" (2232)

- **id / name:** `pci_growing_pains` / "Growing Pains: The Initiative Explained".
- **Folder:** The Federation. **Length:** 250–350 words.
- **Date:** **2232**, the launch (timeline 2232; `Public Citizenship Initiative (PCI).md`).
- **Don't duplicate:**
  - *A Place for Every Citizen* is a benefits brochure ("The Federation does not ask where you have been").
  - *Federation Public Notice №118* is an infraction notice.
  - *The Sixth Week* and *Power Concedes Nothing* are the critics' side.
  - Make this a **launch-day radio address or an FAQ sheet** ("Q: Will I have to pay? A: The Initiative is free at the point of entry."). The FAQ form lets the admin fees and the six weeks surface by evasion.
- **Canon to use:**
  - Six weeks of Rehabilitation Orientation.
  - Assigned housing and labour.
  - The titles "uncle" and "auntie".
  - "Administrative fees" that outlive the applicant.
  - Spearheaded "to showcase a reformist image".
  - "Growing pains" for the current treatment of ghouls, and the promise to "wipe away inequity" and "restore equality" (the GM's phrases).
- **Optional:** tie the launch to **"Hari Redependence"**. Tunku Adnan is "the Father of Redependence" (timeline 2157; `Prime Minister (Federation).md`). Avoid "Merdeka".
- **Must not say:**
  - The Taman Hidup murder (2247), the Ushers, or the Sepuluh Ribu's infiltration.
  - **"Biometric tags"**, which the PCI note uses (NOTE 28: modern tech). Use "a number on the back of the hand", which *Power Concedes Nothing* and *The Sixth Week* already established.

### Entry 9. Fallen Gong door-to-door script

- **id / name:** `fallen_gong_doorstep_script` / "Doorstep Resonance — A Script for Echo Pairs".
- **Folder:** Bandawang. **Length:** 450–650 words.
- **Canon to use** (`Religions/Order of the Fallen Gong.md`; `People/Gongmaster Jane.md`):
  - **The Gong That Fell** sounded the **Great Echo Heard Around the World** at the end of the world.
  - Truth is not discovered but *heard*. They speak in paradoxes; quote the note's own ("You cannot see the mountain unless you echo its name").
  - **Truth Circles**: answering is discouraged and participation is compulsory.
  - **The Echoes**, who always speak in a fixed order: the One Who Speaks First, the One Who Asks Questions, the One Who Speaks Last.
  - **Harmonies**, run by a **Gong-Bearer**.
  - Claimed "inhuman feats".
  - The Federation tolerates them for their charity; the Protectorate scoffs.
  - Jane's quest **"Spread the word!"** hands out pamphlets. This script is its natural prop.
  - *Scrapyard Wall* graffiti: "THE GONG DOESN'T RING FOR FREE".
- **Structure:** a numbered training script.
  - The pair knock in the Echo order: three knocks, one each for past, question and decree.
  - The opening line.
  - Handling objections ("If they answer your question, you have lost. Ask another.").
  - The origin story in 60 words.
  - When to leave the pamphlet.
  - The Gong-Bearer's sign-off.
- **The parody:** door-to-door missionary method, adapted. Real Latter-day Saint missionaries "tract" door to door, in pairs called **companionships**, wearing name tags[^r3]. Fold the pair into the Order's own theme: **the "Echo Pair"**, where the second member repeats the first member's last words. That is the Order's doctrine, not a borrowed LDS detail.
- **Sensitivity (CHECK 17):**
  - The Order's name already puns on **Falun Gong**, a real movement whose members are persecuted in China.
  - The script must not borrow markers from either real faith:
    - **LDS:** no "Elder"/"Sister" titles, no white shirts and ties, no badges naming a church, no "testimony", no baptism, no found golden plates or book, no prophet.
    - **Falun Gong:** no exercise sets in parks, no persecution narrative, no "truthfulness–compassion–forbearance" triad, no newspaper or performing troupe.
  - Aim the satire at **sales-funnel evangelism as a method** (scripts, rebuttal trees, quotas, a "doors knocked" tally) and at the Order's own absurd doctrine. **Never at believers' sincerity.** Gongmaster Jane is "kindly, if not deluded", so the script's author can be earnest.
- **Must not say:**
  - That the Mighty Gong is a **missile-silo lid**. **BLOCK 5:** `Order of the Fallen Gong.md` states this in plain player-facing text ("Unknown to the Order, this artifact is actually the lid of a pre-war missile silo"). Move it into a `> [!gm]-` callout before granting this log.
  - **Gonglings** (children used "as ritual instruments"). That is a dark theme; leave it out.
  - Anything about the Kingdom.

---

## 4. The UCL idea, as a proposal for the GM to rule on

**The GM's idea (Future Ideas board):** the UCL as a metaphor for Chinese Malaysian businesses being undercut by cheaper mainland Chinese businesses and prices. In play: merchants selling real, cheaper goods that come from the UCL.

**The real-world anchor:**
- In an ACCCIM survey of 245 Malaysian business owners, 70.9% called competition from Chinese businesses "intense or very intense", and 86.4% named pricing pressure as the main impact[^r4].
- Malaysia is reviewing its anti-dumping laws because of cheap Chinese goods[^r5].
- Local SMEs in F&B, renovation, fashion, wedding services and car workshops report the pressure[^r6].
- The complaint comes largely *from* Chinese Malaysian business associations. That is the key to handling it fairly.

### (a) Does it fit canon?

It fits well, with no direct contradiction:

- **`UCL.md`:**
  - The UCL runs on **Huìlì (汇利), "mutual benefit / shared profit"**.
  - Its local syndicates "manage food, justice, **trade**". "Loyalty is rewarded through access to **UCL-controlled trade and protection networks**."
  - The "Voices of the Wind" propaganda units use "tailored cultural media".
  - Cheap goods as soft power is Huìlì working outward.
- **`A00_Introduction.md`:** "Their **'Favor Centers'** offer aid and ideology in equal measure—with long-term obligations always attached." The obligation attached to a bargain is the same mechanism.
- **Timeline 2231–2241:** the UCL "infiltrates border towns with **trade**, propaganda, and mutual aid". 2242–2246: "**UCL interference**". The idea only gives *trade* a face.
- **`UCL Regular.md`:** a Regular is "a farmer, a smith, **a shopkeep**". The shopkeeper and the soldier are the same people.
- **The Northern Conflict draft (after 2247):** the UCL declares war "detesting slavery… aiming to free the indebted and enslaved". Cheap goods sold alongside an anti-indenture message is a believable lead-in to that war.

Points of friction:

1. **There is no UCL currency** (SCOPE_DECISIONS, the currency ruling). UCL shops must price in **RMR, PD or barter**. Don't invent a League coin.
2. **The Chamber of Commerce:** the UCL grants the Chamber merchant quarters, and Chamber enclaves are "ideologically neutral: **no banners, no propaganda**". UCL goods sold *inside* a Chamber enclave can't carry pamphlets; those sold *outside* it can. This also gives the metaphor its victim: **the Chamber** (马来亚總商會, roughly "Malayan General Chamber of Commerce", a Chinese-language name) and the old merchant houses are the in-world stand-in for long-established Chinese Malaysian business.
3. **The Protectorate licenses all PD trade** (Economies). UCL traders in Protectorate border markets would have to trade through licensed locals or be smuggled. Either works, and the second matches "suspected of ideological infiltration" (`01_The Protectorate.md`).
4. `Wira Bunker.md` and `Perdana Bunker.md` treat the UCL as subversive. That's compatible.

### (b) Minimal edits that adopt it

**Timeline, 2231–2241, first bullet:**

Current:
> Communists and travellers from the North arrive in the Peninsula. They speak of new dangerous ideas and the **[[UCL]]**. UCL presence grows as it infiltrates border towns with trade, propaganda, and mutual aid. Their presence is subtle, not yet consolidated.

Proposed:
> Communists and travellers from the North arrive in the Peninsula. They speak of new dangerous ideas and the **[[UCL]]**, and they bring goods: pots, cloth, tools and power cells at prices no maker on the Peninsula can match. UCL presence grows as it infiltrates border towns with cheap trade, propaganda, and mutual aid, and the old merchant houses of the north begin to lose their customers. Their presence is subtle, not yet consolidated.

**Timeline, 2242–2246:** "distracted by northern logistics and UCL interference" → "distracted by northern logistics and UCL interference **in its own border markets**".

**`UCL.md`, a new section after "Local Clans and Syndicates":**
> #### 🧺 Huìlì Traders
> Where the League cannot send soldiers, it sends shops. Huìlì syndicates sell ordinary things (cookware, cloth, tools, cells) for less than any Peninsula maker can, and the League makes up the difference. Customers get a good price and, outside the Chamber's enclaves, a pamphlet. The merchants they undercut get a closing-down sale. In the border towns the old trading families have a name for it: *"Under Heaven, one price."*
>
> > [!gm]- Secret — the price
> > The losses are the point. Cheap goods buy dependence, map the roads and markets, and make the League the friend of anyone in debt, which is most of the Protectorate's indentured. This is the soft-power front of the war drafted for after 2247. Proposal, not yet ruled on.

None of this touches the 2245+ war material. It only explains how the League came to know the border so well.

### (c) Sensitivity: wording rules

1. **Name the institution, never the ethnicity.**
   - The phenomenon is called **"UCL shops", "Huìlì traders" or "northern goods"**.
   - **Never "Chinese goods" or "Chinese shops"** as the label for cheapness, in narration or notes.
2. **Chinese Malayans must be on the losing side, with faces.** The real story is mainland businesses undercutting Chinese Malaysian ones, so the sympathetic in-world victim is a Chinese Malayan **towkay** or Chamber house. That keeps the satire from reading as "Chinese = cheap".
3. **Jokes hit the system:** subsidies, quotas, slogans, pamphlets in every bag, a price that is "patriotic". **Never accents, food, hygiene, animals or "fake goods" quality jokes** pinned on people.
4. **Never link the UCL or the North to the New Plague** or any disease. Given the real pandemic, that would read as targeting a community.
5. **No real-world names:** CCP, Xi, Belt and Road, Temu, Shein, Mixue. The UCL already has its own (Lao Hua, the Khaganates, Huìlì).
6. **Characters may be prejudiced in their own voice. The text must not endorse it, and no slurs at all.** The scrap dealer can be crude about prices, not about people.
7. **Keep it ambiguous:** customers *like* the prices. The League isn't simply evil, which matches the war draft's anti-slavery UCL.

### (d) The scrap dealer's "more Chinese shops"

- **Geography gives a neutral reading.** Heading north toward Penang, he would see more Chinese signboards. Penang and Kulim are historically Chinese-majority towns, and Kulim is a Tan and Choo town (`Kulim.md`)[^i13].
- **Write two kinds of shop:**
  - The **old shophouses**: local towkays, Hokkien and Manglish, families "here since before the bombs". He haggles with them like old friends.
  - The **new stalls**: northern accents, Mandarin, the same goods in every stall, half price, a sun-and-sky stamp on the crates (from the UCL motto "Under Heaven, One Sky").
- **The voice** is an old towkay complaining to him ("Northern goods, half price. How to fight, lah?"). The businessman in him shrugs, then notices: "Nobody sells that cheap for nothing." That is the whole UCL thread in one line.
- **Kosongs:**
  - He sees cheery branded Kosongs hauling crates for the old shops, the work PCI uncles would do at home.
  - Optionally, a UCL leaflet in a crate of pots reads "Every hand its own master". He doesn't understand it and uses it to wrap his tiffin. That ties cheap goods to the League's anti-indenture line (the 2245+ draft) without stating it.
- **Model sentence** for the vault-author: *"Past Kulim every second shop has the characters up, the old towkays' shophouses, here since before my granddad, and in between them the new northern stalls where everything costs half and comes with a pamphlet I can't read."*

---

## 5. New and rewritten notes (player-facing; secrets in callouts)

### 5.1 `01_World Details/Sungai Construction.md` (new)

```markdown
---
aliases: [Sungai Construction Berhad, Sungai]
---
**Sungai Construction** was a pre-war Malayan construction and property company that built new townships on worked-out tin-mining land, selling the dream of a modern home with a lake view, the lake being the old mine pool.

Its best-known contract was its last. Jointly with [[ProTiga]], it built the three bunkers of the National Shield Project, [[Perdana Bunker|Perdana]], [[Wira Bunker|Wira]] and [[Federation Bunkers|Harapan]], to designs drawn up with American consultants from Vault-Tec, "in preparation for the unlikely scenario".

Its Bandawang estate was never finished. The robots it bought for the job are still working on it at [[The Protectron Yard]].

*"Sungai Construction: Building Tomorrow's Malaya, Today."* (pre-war slogan, still legible on hoardings across the Klang Valley)
```
(The tin-mining detail is the Sunway anchor[^s1]. Rawang itself grew from tin mining[^i14].)

Related one-line edits:
- `01_World Details/ProTiga.md`: "ProTiga also built the Federation's bunkers" → "ProTiga also built the Federation's bunkers, jointly with [[Sungai Construction]]".
- `Federation Bunkers.md`, `Perdana Bunker.md`, `Wira Bunker.md`: "Built … by the corporate-government entity [[Protiga]]" → "… by [[ProTiga]] and [[Sungai Construction]]". The same edit fixes the `Protiga` spelling in those links.

### 5.2 `Locations/Bandawang/The Protectron Yard.md` (full replacement)

```markdown
---
image_entrance: art/locations/loc_the_protectron_yard_entrance.jpg
image_interior: art/locations/loc_the_protectron_yard_interior.jpg
---
**The Protectron Yard** is a construction site in [[Bandawang Baru]] where seven rusting pre-war Protectrons are still building the housing estate their developer, [[Sungai Construction]], abandoned in 2077: a row of homes with a large community centre at its heart. Loose cement bags, timber and construction tools litter the yard. At the campaign's start, only the barely finished husk of the community centre stands, ringed by the half-built outlines of the homes still to come.

## The seven

Seven RobCo construction Protectrons work the yard, the same seven that were working it the week the bombs fell. Nobody has serviced them properly since. Their paint has gone to rust, and after every rain their seams weep orange down the casings. Their joints squeal, their voice boxes crackle, and more than one arm has been splinted with rebar by someone in a hurry. They still work: slowly, without supervision, to a work order nobody alive issued, and they stop for every downpour.

They are friendly, or at least not interested. Unlike the construction units found unattended elsewhere on the Peninsula, the yard's seven have never swung a tool at anyone.

The [[Rakan Watch]] calls them *the useless machines*, and named them as a joke after the seven little men in an old picture about a princess, in Malay:

- **Doktor** wears the site's first-aid cross on its chest and taps the others' joints as if listening for something.
- **Bengkeng** has a speech module stuck on the site warning, PLEASE VACATE THE WORK AREA, which it says to everyone, including the other six.
- **Ceria** plays the same four bars of a pre-war jingle while it works.
- **Mengantuk** drops into standby mid-task, sometimes mid-step.
- **Pemalu** turns its sensor to the wall when anyone speaks to it.
- **Bersin** has a cooling vent that sputters and spits on damp mornings, which in Bandawang is every morning.
- **Dungu** walks into the same foundation trench every day, climbs out, and carries on.

The joke has worn thinner since the hall got its roof.

## The hall

The community hall at the yard's centre has just been roofed: concrete walls in **Minangkabau** style with sweeping upswept gables, the soaring roof built in traditional dark timber, its centre deliberately left open to the sky. It is unfinished, dry and clean, all sawdust and new concrete, with no decay. This is where the party will make their first home.

> [!gm]- Secret — the eighth
> The yard has an eighth Protectron, called **the Foreman**, and it is a player character. What it is, and what it has to do with the site foreman whose diary is the data log `protectron_yard_site_diary`, is for the GM and that player to settle. No player-facing text states the link. The location art (`tools/art-locations.mjs`, `loc_the_protectron_yard_entrance`) shows seven units.
```

**Malay names: verification and alternatives**

| Dwarf | In the note now | Verdict | Alternatives |
|---|---|---|---|
| Doc | **Doktor** | Standard Malay. Keep. | *Tok Doktor* (folksy) |
| Grumpy | **Bengkeng** | **Verified:** "quick to anger, irritable", given as a synonym of *pemarah* in a Malay/Indonesian thesaurus[^r7] | *Pemarah* (plainer); *Merajuk* (sulky, very Malay) |
| Happy | **Ceria** | Standard ("cheerful"). Keep. | *Riang*, *Gembira* |
| Sleepy | **Mengantuk** | Standard ("drowsy"). Keep. | *Ngantuk* (colloquial) |
| Bashful | **Pemalu** | Standard ("shy person"). The best of the set. | *Malu-Malu* |
| Sneezy | **Bersin** | Standard ("sneeze"). Keep. | *Si Bersin* |
| Dopey | **Dungu** | Standard ("dull-witted"), and harsh, which suits "useless machines" | **Blur** (Manglish: affectionate mockery, the funniest option); *Mamai* (dazed, but overlaps Sleepy) |

- **Was there an official Malay dub with translated names?** A Malay dubbing wiki lists a Malay voice cast for *Snow White dan Tujuh Orang Kerdil* with the dwarfs under their **English names**[^r8]. An Indonesian retelling also keeps the English names[^r9]. So there are **no official Malay names to copy**, and the in-world translations are the Rakan Watch's own, which suits the joke.
- **Confidence:** medium. Only the search snippet was read; the wiki page itself returned an error.
- **Search-verified:** *Bengkeng* only. The other five are standard dictionary words, not searched[^i15].

### 5.3 `Locations/Ivory Tower.md` (new; `Fortress City of Penang.md` already links `[[Ivory Tower]]` with no note behind it)

```markdown
---
aliases: [Ivory Tower, the Tower, the Red Light]
---
The **Ivory Tower** is the seat of the [[01_The Protectorate|Protectorate]]: a pre-war tower of cream concrete, more than sixty storeys of it, standing over the [[Fortress City of Penang]], where the [[Grand Architect]] and the [[Directorate]] rule and the Divisions keep their offices and laboratories.

It is the tallest thing on the coast, and at night the only thing on the coast with a light on top: a single red beacon that has not gone out in living memory. Merchants on the mainland steer by it. The Protectorate will tell you it is an aviation warning light. Nobody on the Peninsula has seen an aircraft in a very long time, and the light stays on anyway, because the Protectorate maintains what it has.

At its foot squats a great geodesic dome, a lattice of triangular panels from the same pre-war age, where the city does its public business. Citizens go up the Tower only as far as their scores allow. Samples, reports and petitions go further. Very little comes back down except directives.

Wastelanders call the light the Architect's lamp, and say that as long as it burns someone up there is still working on the [[Grand Project]]. Since no citizen has seen the Grand Architect in generations, it is as good a proof as any.
```
- **Real anchor:** Komtar, George Town. Completed 1985–86, 65 storeys, 231.7 m. It was the tallest building in Southeast Asia when finished, and has a **Buckminster Fuller-designed geodesic dome** (Dewan Tunku) at its base[^r10][^r11]. A Fuller dome is pure 1950s retro-futurism, so it is the best detail to bring over.
- **Canon tie-ins:**
  - "Samples sealed for the Ivory Tower laboratories" (*Survey Note GJ-14*).
  - The Architect "may be dead, divine, or digital" (`Grand Architect.md`).
- **GM callout, if wanted (pointers only; no new secrets invented):**
  ```markdown
  > [!gm]- Secret
  > Where the Kosong procedure and the Gergasi research happen is undecided (timeline 2200–2230 callout; org-map D17). The Tower's laboratories are the obvious candidate. "Alexander" as the current Grand Architect is discussed, not canon (`CONVERSATION_HISTORY/Lore Chat.md:9388`).
  ```

### 5.4 `Locations/The Crater Line.md` (new)

```markdown
---
aliases: [Crater Line, the Line]
---
**The Crater Line** is a band of old shell craters across the mainland south and east of the [[Fortress City of Penang]], marking the furthest reach of the Protectorate's guns. Travellers on [[The Longest Road]] know it when they cross it. The road dips through a strip of pocked ground, the craters brimming with rainwater, kangkung and frogs, and on the far side the patrols stop, because inside the Line the Protectorate does not need them.

Most of the craters were made in the Great Ghoul Massacre of 2130 to 2132, when the [[Sepuluh Ribu]]'s push north broke against the guns. The Protectorate pulled back behind its artillery afterwards and has stayed there; the Line is where it stopped. [[Kulim]] sits just inside it.

Merchants say the Line is the safest place on the Peninsula to stand, so long as you stand on the right side of it. Many ghouls will not cross it at all. For them it is not a border but a graveyard, and the Great Shame of their grandparents is still lying in the paddy.
```
- **Geography (approximate):**
  - Kulim lies about 20 km inland of Butterworth. A line at that radius from the guns runs roughly from the **Kerian River**, which forms the Penang–Perak border in the south-west, through the paddy country, and curves round outside Kulim[^i16].
  - The large naval guns of the Fallout era reach about 35–40 km[^i17], and the Protectorate's guns are salvaged warship guns (`01_The Protectorate.md`). Its range of a few dozen kilometres is therefore plausible.
- **GM callout (a proposal, marked as such):**
  ```markdown
  > [!gm]- Secret
  > Proposal, not ruled: the Line marks where the guns stopped firing in 2132, not necessarily how far they reach. How far they actually reach is a Directorate of Defence secret. Unexploded shells still lie in the paddy.
  ```

### 5.5 Small additions (one line each)

- `People/Big Ben.md`, "Ishtar wanted a Big Ben… so **she** hired" → **he** (BLOCK 4). Every other source has Ishtar as a man (`People/Ishtar.md`; org-map K62/K76).
- `People/Big Ben.md`: add "His best friend is [[Orange Peng]]; the two sit together in class at [[The Education Center]]."
- `People/Orange Peng.md`: add "His best friend is [[Big Ben|Ben]], and the two attend [[The Education Center]] together."
- `People/Cheryl Chia.md`: add "**Background:** … She has found a second subject she was not sent to study: the Caliphate's [[Pahlawan]]." Optionally add "She has very little patience for people and an unlimited amount for questions."
- `People/Guru Besar Raj.md`: add "He keeps a remarks column on every pupil, and reads it more often than he admits."

---

## 6. Inconsistencies and flags (most severe first)

| # | Severity | Entry | Issue | Why (source) | Suggested fix |
|---|---|---|---|---|---|
| 1 | BLOCK | P3, entry 7 vs *Abave Journal 1* | The flash comes at Saturday breakfast. Fallout canon puts it about 9:45–11:45 PM Saturday, Malayan time. | §2; fallout.wiki[^f1] | Rule on it. Recommended: canon time, plus a two-line edit to *Abave Journal 1* |
| 2 | BLOCK | Entry 1 | The GM brief says "KLB citizen". The city is renamed KLB only in 2150. | Timeline 2150 | Write "KL" |
| 3 | BLOCK | P1 | *Three Hearts* (May 2077) says the bunker project can't be talked about yet. | *Three Hearts* body | Date P1 after May 2077 (e.g. 28 Jun 2077) |
| 4 | BLOCK | `People/Big Ben.md` | Ishtar is "she" here and "he" everywhere else. | `People/Ishtar.md`; org-map K62 | he |
| 5 | BLOCK | `Order of the Fallen Gong.md` (entry 9 points players there) | The missile-silo-lid secret sits in player-facing text. | Note, "The Luminary" paragraph | Move into a `> [!gm]-` callout |
| 6 | BLOCK | `The Kancil Orphanage.md` (entry 6 points players there) | The child-labour secret is stated in body text, duplicating the callout. | Note, paragraph 2 | Move into the callout. Leave only the public "junior mechanics" framing. |
| 7 | CHECK | `The Protectron Yard.md` | The intro says **nine** Construction Protectrons and the body says **seven** (org-map F21 says nine). The GM's plan is 7 plus the Foreman. | Note lines 5 and 9; F21 | §5.2 replacement; update F21 in the PDF |
| 8 | CHECK | `The Protectron Yard.md` | "Whoever first got them running named them" vs the plan: the Rakan Watch names them as a "useless machines" joke. | Note line 9; GM brief | §5.2 |
| 9 | CHECK | Entry 4 | Cheryl is an engineer studying the Kapcai; the brief makes her an academic watching Pahlawan. "Schools of Thought" are not in canon (only Divisions). | `Cheryl Chia.md`; `Directorate.md`; brainstorm only | Keep the engineer; make the Pahlawan study off-remit. Rule on Schools vs Divisions. |
| 10 | CHECK | P1 vs four notes | The bunkers are "built by Protiga" alone; P1 makes it a joint venture with Sungai. | `ProTiga.md`, `Federation Bunkers.md`, `Perdana Bunker.md`, `Wira Bunker.md` | §5.1 edits |
| 11 | CHECK | P2 / `ProTiga.md` | "Tenaga Nasional" is a real utility; *Three Hearts* says "Tenaga". | §1.4 | "Tenaga" or "Tenaga Malaya" |
| 12 | CHECK | P1, P3, new note | Sunway's original name was Sungei Way Holdings, so "Sungai Construction" is very close to the real company. | NST[^s1] | Keep it, or use "Sungai Jaya" / "Arus Bina" |
| 13 | CHECK | `Perdana Bunker.md` | "KL Sentral" is a real post-2001 name, against the SCOPE ruling's "old central station". It also says "RMR (**Repurposed Malaysian** Ringgit)". | Note lines 14 and 56; SCOPE | "Central Station, Kuala Lumpur"; "Reformed Malayan Ringgit" |
| 14 | CHECK | Entry 2 | The RMR item says "nearly any old Ringgit can be used"; Economies says an unstamped note "is not money". | Both notes | Align the item to Economies |
| 15 | CHECK | Entry 3 / `Fortress City of Penang.md` | `[[Ivory Tower]]` is linked, but no note exists. | Fortress note | §5.3 |
| 16 | CHECK | Entry 5 | KTV/karaoke dates from 1971, after the divergence, and has no precedent. | §3 entry 5 | Keep as a deliberate reference, or "Sing-Song Nite" |
| 17 | CHECK | Entry 9 | The parody targets LDS method, and the Order's name puns on Falun Gong (a persecuted faith). | Note; LDS sources[^r3] | The wording rules in §3 entry 9 |
| 18 | CHECK | UCL proposal, entry 3 | Risk that the satire reads as aimed at a community. | §4(c) | The seven wording rules |
| 19 | CHECK | Entry 7 | A "Perdana Control" header would say Perdana heard the driver and left him. | Federation Bunkers callout | Use "recorded off-air", unless the GM rules otherwise |
| 20 | NOTE | Entry 6 | *Balu* means "widow" in Malay; as a Tamil short name it's ordinary. | [^i12] | Fine; an irony a Malay reader may enjoy |
| 21 | NOTE | `Bestiary/Construction Protectron.md` | Hostile in the bestiary; friendly at the yard. | Bestiary | §5.2 makes the bestiary units "unattended elsewhere" |
| 22 | NOTE | *Requisition 88-C* | Four construction Protectrons waiting at a prison. | Log body | Keep it separate from the yard (it touches the PCs' origin) |
| 23 | NOTE | P2, seio | Fallout's company is Poseidon **Energy**; the vault has Poseidon **Oil**. | `seio` note; [^i3] | Energy for the company, Oil for the forecourt brand |
| 24 | NOTE | P1 | Vault-Tec consultants vs the ruling removing Americans from the HQ logs. | SCOPE "ProTiga heist logs" | Allowed for the bunkers. Never mention HQ, Level 16 or the Army. |
| 25 | NOTE | Entry 3 | The date must be at least 2232 (PCI). Guards must be human (the Protectorate bars ghouls). | Timeline; `01_The Protectorate.md` | 2238; a Chamber-licensed escort |
| 26 | NOTE | Entry 6 | Orange and Ben as best friends is new, and Orange's job isn't stated anywhere. | `Orange Peng.md`, `Big Ben.md` | §5.5 lines |
| 27 | NOTE | `Gongmaster Jane.md` | "Gongkeeper" vs the Order note's "Gong-Bearer". | Both notes | Pick one; "Gong-Bearer" is in the faction note |
| 28 | NOTE | `Public Citizenship Initiative (PCI).md` | "biometric tags" is modern tech. There's also a stray `%%` that turns the link footer into a comment. | Note | "a number on the back of the hand"; remove `%%` |
| 29 | NOTE | Folder | "Prewar Data Logs" repeats the tab name in the app. | §1.1 | Consider "Prewar" |
| 30 | NOTE | Ivory Tower | Komtar carries a real Prime Minister's name. | [^r10] | Never print it; "Menara Mutiara" if needed |
| 31 | NOTE | P1, entry 7, P3 | Putrajaya, Telekom Malaya, Indah Water, PosLaju. | Precedent: `Federation Bunkers.md`, *For Nora*, *Scheduled Service Interruption*, *Re — That Thing* | Allowed |
| 32 | NOTE | P3 | *Snow White* (1937) predates the divergence, so it can exist in-world. | — | Never say "Disney" |
| 33 | NOTE | Folder move | Grants are keyed by id, and nothing in the vault links the old path. | `controllers.js:517`; grep | Safe to move |

**CLEAN:** these sources agree with all twelve briefs: `Fallout Details/Great War.md` (date), `Sepuluh Ribu.md`, `Economies of the Peninsula.md`, `Pahlawan.md`, `Faiz.md`, `seio (Peng Brothers RNR).md`, `Janson Peng.md`, `Peng Brothers.md`, `The Education Center.md`, `Guru Besar Raj.md`, `Kosongs (Federation).md`, `Kulim.md`, `UCL.md`, *The New Plague*, *For Nora*, *A Place for Every Citizen*, *Federation Public Notice №118*, *The Sixth Week*, *Survey Note GJ-14*.

---

## Sources

- [fallout.wiki — Great War](https://fallout.wiki/wiki/Great_War)
- [Overstreet Access — Fallout's Great War](https://www.overstreetaccess.com/?p=66310)
- [Atomic Archive — Flash Blindness](https://www.atomicarchive.com/science/effects/flash-blindness.html)
- [CDC — Acute Radiation Syndrome fact sheet (PDF)](https://cdc.gov/radiation-emergencies/media/pdfs/ARS.pdf)
- [REMM — ARS time phases](https://webarchive.library.unt.edu/web/20201218003307mp_/https:/www.remm.nlm.gov/ars_timephases1.htm)
- [LDS Living — San Jose missionaries stop tracting](https://www.ldsliving.com/San-Jose-Missionaries-Stop-Tracting-to-Serve/s/74931)
- [Church of Jesus Christ — 10 things to know about missionaries](https://www.churchofjesuschrist.org/comeuntochrist/belong/share-goodness/10-things-to-know-about-missionaries)
- [SCMP — Malaysia moves to protect local firms as cheap Chinese goods fill market](https://www.scmp.com/week-asia/economics/article/3362204/malaysia-moves-protect-local-firms-cheap-chinese-goods-fill-market)
- [FMT — Malaysia reviews dumping laws as cheap China goods spark concern](https://fmtv5.freemalaysiatoday.com/category/nation/2024/07/24/malaysia-reviews-dumping-laws-as-cheap-china-goods-spark-concern)
- [Asia News Network — cheap goods from China threatening ASEAN SMEs](https://asianews.network/?p=289481)
- [NST — Chinese presence seen to toughen up Malaysian firms](https://www.nst.com.my/amp/business/corporate/2025/11/1322372/chinese-presence-seen-toughen-malaysian-firms-bttv)
- [NST — Sunway's humble beginnings](https://nst.com.my/amp/business/corporate/2024/10/1119431/sunway-humble-beginnings-rm35bil-conglomerate)
- [Sunway — Milestones](https://www.sunway.com.my/milestones/)
- [Wikipedia — Komtar](https://en.wikipedia.org/wiki/Komtar)
- [Tatler Asia — Komtar architecture icon](https://www.tatlerasia.com/homes/architecture-design/architecture-icon-komtar-penang)
- [Alih Suara wiki — Snow White dan Tujuh Orang Kerdil](https://alih-suara.fandom.com/ms/wiki/Snow_White_dan_Tujuh_Orang_Kerdil) (search snippet only; page fetch failed)
- [LingoAce — Putri Salju dan 7 Kurcaci](https://www.lingoace.com/id/artikel/parenting/cerita-dongeng-anak-putri-salju-dan-7-kurcaci/)
- [SABDA lexicon — "marah" thesaurus (bengkeng)](https://alkitab.sabda.org/lexicon.php?word=marah)

## Footnotes

[^f1]: fallout.wiki, *Great War*: "9:42 AM EST: Nuclear bombs hit Pennsylvania and New York; 9:47 AM EST: the rest of the United States is bombarded"; "The nuclear exchange continued for two hours"; "Unclear… who initiated launch first." Fetched this session.
[^f2]: Overstreet Access: "Saturday, October 23, 2077, 9:47 AM East Coast Time." Search snippet.
[^i1]: Inference from general knowledge, not searched this session: Radio Malaya ran from 1946 and merged into what became RTM in the 1960s. Verify before printing.
[^i2]: Inference: under current US law, daylight time ends on the first Sunday of November. Whether Fallout's US kept that rule is unknown, hence "medium" confidence on the hour.
[^i3]: Inference from Fallout knowledge, not searched: Poseidon Energy appears in Fallout 3, 4 and 76. Roadside Poseidon-branded fuel stations appear in Fallout: New Vegas, as I recall it.
[^i4]: Inference: the site diary is a standard record on Malaysian (and Commonwealth) construction contracts. Not searched.
[^i5]: Inference: *rumah kongsi* or "kongsi" workers' quarters on construction sites is everyday Malaysian usage. Not searched.
[^i6]: Inference: the October–November inter-monsoon brings heavy afternoon thunderstorms to the west coast. Not searched; MetMalaysia is the source to check.
[^i7]: Inference: Rawang (Bandawang) to central Kuala Lumpur is about 25–30 km by road. Not searched.
[^r1]: Atomic Archive, *Flash Blindness*: flash blindness at night lasts longer because the pupil is dilated; a 1-megaton burst causes it at 13 miles by day and 53 miles on a clear night; retinal burns require looking directly at the detonation.
[^r2]: CDC ARS fact sheet and the REMM time-phase tables: the prodromal stage (nausea, vomiting) comes minutes to days after exposure; the latent stage lasts hours to weeks; the gastrointestinal syndrome comes at about 5–12 Gy. The one-to-two-week death window is from the same CDC material, via the search summary.
[^i8]: Inference from general knowledge, not searched this session: the 2013 Malaysian general election's "indelible" ink was widely reported to wash off.
[^i9]: Inference: the Penang Strait between Butterworth and George Town is about 3–4 km wide. Not searched.
[^r3]: LDS Living: "Tracting is the LDS Church's long-held practice of going door to door"; missionaries work in pairs called companionships and wear name tags (search summary of LDS Living and churchofjesuschrist.org).
[^i10]: Inference: the karaoke machine is generally dated to early-1970s Japan. Not searched.
[^i11]: Inference: *Buku Rekod Mengajar* is the standard Malaysian teacher's record book. Not searched.
[^i12]: Inference from Malay usage, not searched: *balu* = a widow or widower (cf. *janda*, *duda*).
[^i13]: Inference: Penang's George Town and mainland towns like Kulim and Bukit Mertajam have large historic Chinese communities. Not searched. The vault fact (Kulim as a Tan and Choo town) is from `Locations/Kulim.md`.
[^r4]: ACCCIM survey as reported in the search summary of SCMP and Asia News Network coverage: of 245 owners polled, 70.9% called competition with Chinese businesses "intense or very intense" and 86.4% named pricing pressure.
[^r5]: FMT, 24 July 2024: Malaysia's trade ministry is reviewing anti-dumping legislation amid concern over cheap Chinese goods.
[^r6]: Search summary of SCMP and Asia News Network: F&B, renovation, fast fashion, wedding services and car workshops report pressure from expanding mainland businesses.
[^s1]: NST and Sunway Milestones: Sunway began in 1974 as Sungei Way Holdings, a tin-mining and quarrying company; Bandar Sunway was built on rehabilitated mining land.
[^i14]: Inference: Rawang grew as a 19th-century tin-mining town. Not searched.
[^r7]: The SABDA lexicon thesaurus entry for *marah* lists *bengkeng* alongside *pemarah* ("quick to anger"). The source is Indonesian (KBBI-based); the word means the same in Malay, which is an inference.
[^r8]: Alih Suara wiki search snippet: the Malay dub cast lists Doc, Happy, Grumpy, Bashful, Sleepy, Sneezy and Dopey under their English names, with Malay voice actors. The page itself returned HTTP 402, so this is medium confidence.
[^r9]: LingoAce: the Indonesian retelling names the dwarfs "Dopey, Sneezy, Happy, Grumpy, Doc, Bashful, dan Sleepy". Fetched.
[^r10]: Wikipedia, *Komtar*, via search: built in 1985, 65 storeys, 231.7 m, the tallest in Southeast Asia until 1986.
[^r11]: Search summary: the Dewan Tunku geodesic dome at Komtar was designed by Buckminster Fuller.
[^i15]: Doktor, Ceria, Mengantuk, Pemalu, Bersin and Dungu are standard Malay dictionary words. Not searched this session.
[^i16]: Inference, not searched: the Kerian River (Sungai Kerian) forms part of the Penang–Perak boundary south of Seberang Perai. Kerian is a major rice district.
[^i17]: Inference from general knowledge, not searched: the US Iowa-class 16-inch/50 gun's maximum range is about 38 km.
