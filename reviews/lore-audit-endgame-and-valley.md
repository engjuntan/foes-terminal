# Lore audit + direction — endgame, end-state map, and the Valley

Mode: AUDIT (tasks 1–3, 5) + DIRECTION (task 4).
Scope: the genesis fan-fiction premise, the intended campaign ending, the GM's
end-state map, three proposed Great Jungle locations, and the feasibility of
munitions manufacture.

Sources read in full: `01_World Details/🕛 Timeline of Major Events.md`,
`01_World Details/FOES Timeline.md`, `01_World Details/ProTiga.md`,
`Locations/Great Jungle.md`, `Locations/Perdana Bunker.md`,
`Locations/🏜️Chukai Desert.md`, `02_Factions/The Federation/01_Federation of Malaya.md`,
`02_Factions/The Federation/Federation Bunkers.md`,
`02_Factions/The Federation/Sepuluh Ribu.md`,
`02_Factions/The Federation/Public Citizenship Initiative (PCI).md`,
`02_Factions/The Protectorate/01_The Protectorate.md`, `02_Factions/UCL/UCL.md`,
`02_Factions/The Kancil Orphanage.md`, `People/The Ghoul King.md`,
`99_Backend Engine/GM Notes/The Ghoul Kings Plan.md`, `A00_Introduction.md`,
`reference/org-map.md` (boxes B2, C5–C11, D13, D16, F27, K67, K76, K77, K79, L96, L106, L113).
`CONVERSATION_HISTORY/Lore Chat.md` grepped only (cited as discussed, not canon).

Counts: **BLOCK 6 · CHECK 19 · NOTE 21.**

---

## Part A — AUDIT

### A1. The genesis story: NCR / Legion / PMV Valdez

| Severity | Entry | Issue | Why (source) | Suggested fix |
|---|---|---|---|---|
| BLOCK | "the Valdez is a Fallout 1 asset" | Wrong game. The PMV Valdez is a **Fallout 2** asset: a Poseidon Oil tanker anchored at the Shi docks in San Francisco in 2241, repaired by the Chosen One in 2242 and sailed to the Enclave Oil Rig. | [Fallout Wiki — PMV Valdez](https://fallout.fandom.com/wiki/PMV_Valdez); [Destruction of Control Station Enclave](https://fallout.fandom.com/wiki/Destruction_of_Control_Station_Enclave). The GM already had this right in `CONVERSATION_HISTORY/Lore Chat.md:6357` — "let us remember that according to Fallout lore suborbital transports aren't a thing. This expedition will utilize the PMV Valdez from Fallout 2" (discussed, not canon). | Say Fallout 2. Nothing else changes — the ship, the owner (Poseidon) and the date all still work. |
| BLOCK | A **Caesar's Legion frumentarius** on the expedition | Caesar's Legion was founded in **2247** by Edward Sallow and Joshua Graham, out of the Blackfoot tribe in the Grand Canyon. In 2247–2249 it is a two-year-old tribal confederation in Arizona with no coastline, no navy, no NCR contact, and an intelligence corps that barely exists. A frumentarius boarding an NCR ship in San Francisco in that window is the single largest lore break in the premise. | [History of Caesar's Legion](https://fallout.fandom.com/wiki/History_of_Caesar's_Legion); [Frumentarii](https://fallout.fandom.com/wiki/Frumentarii). | Two clean options. **(a) Move the shipwreck later** — 2270s–2280s. A prequel only has to be *earlier*, so 2247 still qualifies, and by then frumentarii operate deep inside NCR territory and the rivalry is the defining one of the west. **(b) Keep 2249 and change the rival** — he is a Blackfoot/Twisted Hairs tribal scout, or one of Sallow's first westward scouts, and the word "frumentarius" is never used. Do not keep both 2249 and the title. |
| CHECK | Shipwreck date vs "prequel to a 2247 campaign" | The GM's own stated date is **2249** (`Lore Chat.md:6357`, "They will crash land along the Chukai Desert in 2249"). That leaves ~2 years between campaign start and shipwreck — which is *very* tight if the campaign must also deliver the Kingdom (task 2). | `🕛 Timeline of Major Events.md` — campaign start 2247. | Either (i) the campaign runs 2247→~2249 and the Kingdom is crowned as the Valdez founders offshore — a strong opening image for the fan fiction; or (ii) the wreck is 2249 but the two rivals' road story is set years later, after a long stranding; or (iii) move the wreck per the Legion fix above. Pick one and put it in `🕛 Timeline of Major Events.md`. |
| CHECK | "NCR expeditionary research force sent to find China" | Plausible but needs an in-fiction reason. The canon hook is sitting there: the **Shi** of San Francisco are descendants of a Chinese submarine crew, and San Francisco is where the Valdez is berthed. An NCR expedition sailing for China from the one city on the west coast with Chinese survivors and a working tanker writes itself. | [San Francisco](https://fallout.fandom.com/wiki/San_Francisco); [PMV Valdez](https://fallout.fandom.com/wiki/PMV_Valdez). | Name the Shi as the expedition's source of navigational charts, language and motive. Avoid inventing NCR institutions — the "Department of Science and Industry / Horizon Initiative" in `Lore Chat.md` is a ChatGPT invention with no canon backing; the NCR does have a canonical bureaucracy but not that one. |
| CHECK | Crossing the Pacific | ~13,000 km. In Fallout 2 the Valdez could not sail until the Chosen One found a fuel tanker FOB — fuel is the ship's canonical limit. A 2240s NCR crew has no refuelling chain west of Hawaii. | [The tanker needs fuel](https://fallout.fandom.com/wiki/The_tanker_needs_fuel). | Turn the problem into the answer: the expedition follows a chain of **Poseidon Energy** fuel depots — which is exactly the depot network proposed in task 4. One secret serves both stories. See D2 below. |
| NOTE | Why Malaya, of all places | Our own timeline makes the Peninsula a logical waypoint: Malaya supplied America with oil reserves from the 2000s–2020s, served as "a launching pad for attacks into Vietnam" from 2067, and was invaded by America in late 2077. Pre-war US charts would show Malaya as friendly forward infrastructure. | `🕛 Timeline of Major Events.md`, Pre-War Timeline. | Have the NCR crew arrive carrying 170-year-old charts that call Malaya an ally. The Peninsula's answer to that is the whole emotional engine of the sequel. |
| NOTE | Containment | Nothing in 2247 Malaya should know the NCR, the Legion, Caesar or California exists. | Current `src/dataLogs.js` and `src/items.js` contain no NCR/Legion references (grepped). | Keep it that way: the genesis story is backstory for the GM, not glossary material. If it is ever written up, file it under `99_Backend Engine/`. |
| NOTE | Off-limits themes | The genesis premise touches none of the labour camp, the slave trade or the PCs' origin. Clean on check 1. | — | — |

### A2. The intended ending — what the intervening years must look like

The ending is **compatible** with canon, and in three places canon already leans
toward it. Listed below are the load-bearing points and the places our own notes
would fight it.

| Severity | Entry | Issue | Why (source) | Suggested fix |
|---|---|---|---|---|
| BLOCK | `Locations/Perdana Bunker.md` → Relations | This **player-facing** file already contains `### - [[Kingdom of Malaya]]: Officially hostile due to ideological opposition and caste reversal.` That is a dangling wikilink to a state that does not exist in 2247, and "caste reversal" telegraphs the ending. | `Locations/Perdana Bunker.md`, Relations section. The file has no `> [!gm]-` callout, so the sync will ship the line. | Delete the entry, or move it into a `> [!gm]- Secret` callout. Do not leave a dead "Kingdom of Malaya" link in a glossary-generating file. |
| BLOCK | Who ends up with the cache list | The GM's current plan splits it: **Faiz** (Caliphate Pahlawan) "wants to extract the data logs of hidden prewar US army weapons and ammo caches" (org-map K79, D13), while the **GK** secretly wants "a pass key from the vault" (org-map D16). The stated ending requires the GK to hold the **list**. | org-map D13, D16, K79. | Decide now, because the whole endgame hangs on it. Cleanest: the GK's cabal already owns the channel — Ishtar is "manipulated by his mysterious Ghoul benefactor… 'Uncle Loo'" (K76), and Uncle Loo is "the alias and public face for a secret cabal… led by the Ghoul King himself" (K77). So the list can be copied before it reaches Faiz. Even better: **let the Caliphate keep the original and the GK take a copy plus the key** — then the later war is a race for the same caches, and the Caliphate's sulphur (see Part C) makes them the third power that freezes the stalemate. |
| BLOCK | "US army" vs "USMC" | org-map K79 says "prewar **US army** weapons and ammo caches"; the end-state map says "Lost **USMC** Supplies"; task 4 says USMC. Three names for one thing. | org-map K79; end-state map annotation. | Standardise on **USMC**. It is canon in Fallout (the Corps is mentioned in FO2, FO3/Point Lookout, FNV/Honest Hearts, FO4/Far Harbor and FO76, fought at Anchorage and was issued T-45 power armor — [United States Marine Corps](https://fallout.fandom.com/wiki/United_States_Marine_Corps)), and Marines are the right branch for a littoral peninsula campaign. Edit K79. |
| CHECK | The Ushers are the structural obstacle to a Kingdom | The Federation's constitution is guarded by the **Ushers**, ghoulified fanatics who "still follow ancient Federation law **literally** even in contradiction to current policy", and the office of Prime Minister explicitly "rules until death" and "cannot be succeeded by their direct descendants". A hereditary Kingdom is unconstitutional by the exact document the Ushers exist to defend. | `02_Factions/The Federation/01_Federation of Malaya.md`, Judiciary & Ushers, Central Government; `Locations/Perdana Bunker.md`, Notes. | This is not a problem, it is the best unwritten scene in the campaign. Decide which: the GK **co-opts** the Ushers (they are ghouls — the crown can be argued as constitutional restoration of a pre-war monarchy, and Malaya *did* have rulers); the Ushers **become the Kingdom's insurgency**; or the constitution is **physically taken** from Perdana. Whichever, the map's "Throne of **LIES**" annotation implies the Kingdom's legitimacy is contested in-world, which fits option 1 or 3. |
| CHECK | Artillery vs "munitions run out" | The stalemate is credible only if the Protectorate runs dry too — and artillery burns propellant in kilograms per shot, not grams. Canon has the Protectorate already committed to exactly this doctrine: after 2130–2132 they "withdraw to safe artillery zones", which "permanently **limits their territorial ambitions**, reinforcing their reliance on long-range firepower, automation, introducing indentured labor programs and Penal Slave Battalions". | `🕛 Timeline of Major Events.md`, 2130–2132. | Make the exhaustion mutual and say so. The Protectorate cannot advance (2132 doctrine + no bodies), the Kingdom cannot crack Penang (no shells), and both slide back toward black powder. See Part C for the chemistry that makes this honest. |
| CHECK | The 2230 Kosong labour deal must break | The Protectorate's manpower substitute is Federation-supplied Kosong labour under the 2230 exchange. If the Federation becomes the Kingdom, the supplier becomes the enemy and the Protectorate loses its expendable bodies at the exact moment it needs to mobilise. | `🕛 Timeline of Major Events.md`, 2230; `02_Factions/The Federation/01_Federation of Malaya.md`, Kosongs. | Add one timeline line for the collapse of the exchange. It is the cheapest possible explanation for why the Protectorate, the strongest faction on paper, freezes. |
| CHECK | The Sepuluh Ribu need a rearmament event | They were "shattered" in 2132 and by 2247 are "a shadow of their former selves, fragmented and exploited". They cannot field an army that takes KLB without new weapons. | `🕛 Timeline of Major Events.md`, 2150–2200; `02_Factions/The Federation/Sepuluh Ribu.md`. | The caches **are** that event, and they redeem the Great Shame with the enemy's own logic (artillery beat them; now they have guns). Say so explicitly in whatever endgame note gets written — it is the strongest thematic thread in the whole plan. |
| CHECK | The PCI inverts, and needs a name that is not the secret | Under a Kingdom the PCI's "uncles/aunties" arrangement flips. `Perdana Bunker.md` already calls this "caste reversal" in player-facing text. | `02_Factions/The Federation/Public Citizenship Initiative (PCI).md`; `Locations/Perdana Bunker.md`. | Name the successor programme something bureaucratic and cheerful, and keep the phrase "caste reversal" out of player-facing files. |
| CHECK | The currency tell | A Kingdom restores the **Ringgit** over the RMR — the Sepuluh Ribu's identity currency, abolished by the Chosen in 2150. | `🕛 Timeline of Major Events.md`, 2090 and 2150. | If the GM ever wants a one-image signal that the ending has happened, it is a Ringgit note, unstamped. Also a free item: `src/items.js` already carries RMR and the Ringgit precedent. |
| NOTE | The ending is already foreshadowed twice | "The Ghoul King is not yet crowned, but his legend begins to form" (`FOES Timeline.md`, 2242) and the Perdana "Kingdom of Malaya" line. | — | Consistent. Just keep the crowning out of player-facing text until it happens. |
| NOTE | The GK's identity | Not restated here. `People/The Ghoul King.md` handles it correctly, with two `> [!gm]-` callouts. | — | Endgame material must keep that discipline. |

**Pre-existing contradictions that will bite when endgame material is written.**
These are already in the vault, independent of the new plan, and every one of
them touches the 2077–2247 stretch the ending has to sit on.

| Severity | Entry | Issue | Why (source) | Suggested fix |
|---|---|---|---|---|
| BLOCK | Date of the Chosen's emergence | **Three** different years in three canon files: 2150, 2200, and 2157. | `🕛 Timeline of Major Events.md` ("**2150** – Rise of the Chosen") and `01_Federation of Malaya.md` ("These survivors emerged around **2150**") vs `Locations/Perdana Bunker.md` ("In **2200**, residents emerged") and `FOES Timeline.md` ("**2200** – Rise of the Chosen") vs `Federation Bunkers.md` ("Emerged in **2157**", stated for both Wira and Perdana). | Keep **2150** (the newest timeline). Fix `Perdana Bunker.md` and both halves of `Federation Bunkers.md`. Note the knock-on: at 2150 the Chosen emerge only 18 years after the Great Ghoul Massacre, which makes the Sword/Sepuluh Ribu merger a live-memory event rather than folklore — better, but it changes tone. |
| BLOCK | Where the Perdana Bunker is | "beneath the ruins of the pre-war transportation hub **KL Sentral**" vs "Located beneath the old **Putrajaya** complex". Putrajaya is canonically Bunker 3's site. | `Locations/Perdana Bunker.md` and `01_Federation of Malaya.md` ("Bunker 1 – Perdana Bunker (KL Sentral)") vs `Federation Bunkers.md`, Perdana section; `01_Federation of Malaya.md` ("**Putera (City of the Dead)** – Feral ghoul zone over the ruins of Putrajaya; formerly Bunker 3's site"). | Keep **KL Sentral**. The Putrajaya line in `Federation Bunkers.md` is a copy-paste error — it has Perdana standing where Harapan died. |
| CHECK | Which bunker the Chosen emerged from | The 🕛 timeline seats power at **Perdana**; `FOES Timeline.md` says **Wira**; `Sepuluh Ribu.md` says "the Chosen emerged from **Wira Bunker** and declared the rebirth of the Federation". | `🕛 Timeline of Major Events.md`, 2150; `FOES Timeline.md`, 2200; `02_Factions/The Federation/Sepuluh Ribu.md`, Origins. | Keep Perdana. Fix the Sepuluh Ribu line. |
| CHECK | Protectorate centralisation year | **2115** (Fortress City declared capital) vs **2130** ("a centralized government was formed in 2130"). 2130 also collides with the Great Ghoul Massacre beginning that same year. | `🕛 Timeline of Major Events.md`, 2115 vs `02_Factions/The Protectorate/01_The Protectorate.md`, Origins; `FOES Timeline.md` has 2130 for centralisation and 2196–2198 for the Massacre. | Keep 2115. Amend the Protectorate note. If the GM prefers 2130, the Massacre needs to move, or the Protectorate is invaded in its founding year (dramatic, but say it on purpose). |
| CHECK | "Founded From: Bunkers 1 and 2" | The same file says the Federation "stems from **three** colossal bunkers". | `01_Federation of Malaya.md`, frontmatter block vs The Bunkers section. | Say three, with Harapan lost. |
| CHECK | RMR expansion | "**Reformed** Malayan Ringgit" (CLAUDE.md, 🕛 timeline) vs "**Repurposed** Malaysian Ringgit" (`Perdana Bunker.md`) vs "Restored Malayan Ringgits" (`CONVERSATION_HISTORY`). Also "Malaysian" where the world uses "Malayan". | `Locations/Perdana Bunker.md`, Economy. | Keep **Reformed Malayan Ringgit**. Fix `Perdana Bunker.md`. |
| CHECK | Rafa | "led by **Prime Minister Rafa**" vs "**Tunku Adnan Rafa** personally brokered a truce" (a 2150s event) vs "the current leader which is **Jeb Rafa**" (`CONVERSATION_HISTORY/Lore Chat.md` — discussed, not canon). One of these is an ancestor and the vault never says so. | `01_Federation of Malaya.md`; `Sepuluh Ribu.md`. | Give the sitting PM a full name and mark Tunku Adnan Rafa as the founder-era ancestor. The dynasty is good material — the Federation forbids direct descent and the Rafas have held it anyway, which the vault already says happens via marriage. |
| CHECK | The newspaper has two names | org-map box L106 is headed "**The New Peninsula Times**" but its body describes "**The Peninsula Scoop**"; the A1 data-log brief also uses "The Peninsula Scoop". CLAUDE.md rules the name is the New Peninsula Times. | org-map L106, A1; CLAUDE.md. | Keep **New Peninsula Times**. If the GM wants a second, scrappier paper, make the Scoop a separate rag — but then it needs its own box. |
| CHECK | The B2 rename is only half applied | B2 says "Lim Clan changed to 1414 Triad", but D16 still says "The **Lim Clan** has been secretly contemplating…", "A brutal split in the **Lim Clan**", and L96 lists "Sam Lim of the **Lim Clan**". CLAUDE.md: never "Lim Clan". | org-map B2 vs D16, L96. | Sweep D16 and L96 on the next regeneration of the PDF. |
| CHECK | "Mountain Master Tan" | The Iron Legs backstory names "**Mountain Master Tan**… (This is Slink Tan)". CLAUDE.md: the Mountain Master is **Sam Lim**; Slink Tan is the **Red Pole**. | org-map D14; CLAUDE.md. | Either fix it, or make it deliberate — Iron Legs is explicitly delusional and could be misnaming his patron, which is funnier and costs nothing. Say which in the box. |
| NOTE | `01_World Details/FOES Timeline.md` | Correctly marked "Superseded", but it is still a glossary-eligible file in `01_World Details` and every date in it differs from the current timeline. | File header. | Move it to `99_Backend Engine/` so it cannot generate a tooltip, or keep it and accept that greps will keep surfacing the wrong dates. |
| NOTE | "Genting Buddhist Enclave" | org-map D16 line 344 still says Genting. CLAUDE.md: **Abave** replaces Genting everywhere. | org-map D16; CLAUDE.md. | Sweep on regeneration. The vault note `Religions/Abave Buddhist Enclave.md` is already correct. |

### A3. The end-state map

| Severity | Entry | Issue | Why (source) | Suggested fix |
|---|---|---|---|---|
| BLOCK | **Qal'at as-Petani** vs the drawn territories | Canon: the Protectorate annexed the city-state of Qal'at as-Petani in **2230**, and this is the *end*-state map. "Petani" is Patani — historically the Patani sultanate, i.e. the far north of the Peninsula, above Perlis/Kedah. On the map that ground is solid **UCL red**, and the Protectorate's blue is confined to Penang, a short coastal strip and some islands. So either the Protectorate lost Petani or the map is wrong. | `🕛 Timeline of Major Events.md`, 2230; end-state map. | Best answer, because it earns the stalemate: **the UCL took Qal'at as-Petani off the Protectorate** somewhere between 2247 and the end. That gives the Protectorate a live northern front, explains why it never marches on the Kingdom, and turns the 2230 "Overreach" heading into a prophecy. Add one timeline line. Alternatively extend the blue north — but then the UCL bloc has to shrink. |
| CHECK | "**The Great Desert**" | Almost certainly our **Chukai Desert**, which canon places "along the East Coast of the Peninsula", with the Round City in a crater inside it, and which the Caliphate holds sacred. The map's circled east-coast region sits exactly there. | `Locations/🏜️Chukai Desert.md`; `Locations/Round City.md`. | Relabel the map **Chukai Desert**. "The Great Desert" reads as a second, unnamed desert and will confuse the glossary. |
| CHECK | "**House of Syed**" used as a place label | The House of Syed is the Caliphate's **ruling family**, not a location; the place is the **Round City / Bandar Bulat**, which houses them and the Grand Library. | `02_Factions/The Caliphate/The Caliphate.md`; `Locations/Round City.md`; CLAUDE.md. | Label the settlement **Round City (Bandar Bulat)** and, if the GM wants the family on the map, put "seat of the House of Syed" under it. |
| CHECK | UCL extent vs "not yet consolidated" | Canon for 2231–2241: "UCL presence grows as it infiltrates border towns with trade, propaganda, and mutual aid. Their presence is **subtle, not yet consolidated**." The map shows a solid contiguous bloc across the whole north. | `🕛 Timeline of Major Events.md`, 2231–2241; `02_Factions/UCL/UCL.md`. | Not a contradiction for an END map — but the consolidation is an unwritten war. Give it one timeline entry and a Khaganate name (the UCL is organised into four Khaganates under a Chairman; the Peninsula would be a march of the **Southern Khaganate**). The `UCL Regular`, `UCL Soldier Armor`, `UCL Vanguard Armor` and `UCL Officers Uniform` entries already exist in `src/`, so the faction is armed for it. |
| CHECK | The southern brown and orange blocks are not in the legend | The legend covers Great Jungle / Caliphate / Protectorate / Kingdom only. The map has an orange wedge and a large brown region in the south, plus teal islands, none of them keyed. | End-state map legend. | Key them. If the brown is a fifth power in the south, it needs a name before the Lion's Reach and Puncak Lanun labels make sense. |
| CHECK | **The Lion's Reach** — new, and an English name | Not in the vault (no file, no glossary entry, no `src/` reference). Geographically it sits at the southern tip — i.e. Singapore, *Singa-pura*, "Lion City", so the name is a translation pun and a good one. But it is English in a world that names places in Malay. | `VAULT_INDEX.tsv` (no hit); end-state map. | Defensible as-is: English is the official language of both the Federation and the Protectorate, so an English exonym for a foreign port is realistic — mark it a deliberate exonym. If the GM wants a local name: **Temasek** (the real pre-Singapura name, and a beautiful deep-cut), **Singa**, or **Kota Singa**. Note it is outside Malaysia in the real world; the map correctly draws it as not-Kingdom, which is the right call. |
| CHECK | **Puncak Lanun** — new; check the noun | Not in the vault; the only trace anywhere is `CONVERSATION_HISTORY/Inconsistency Check and Update.md:1635` — "Used in places like Wang or **Lanun** territories, where face or intimidation matters more than coin" (discussed, not canon). *Lanun* is correct Malay for pirate, and "Puncak Lanun" is grammatical (noun+noun, like Puncak Alam). But *puncak* means summit/peak, and the map places it out among the southern islands. | `VAULT_INDEX.tsv`; `CONVERSATION_HISTORY`; end-state map. | Keep the name only if it is genuinely a peak — a fortified hilltop on an island reads great. Otherwise **Pulau Lanun** (Pirate Island), **Teluk Lanun** (Pirate Bay) or **Tanjung Lanun**. Real-world anchor is excellent either way: the Singapore Strait and the Riau archipelago are the historic home of the Orang Laut and centuries of strait piracy. |
| CHECK | The torn Malay letter needs proofing | Legible fragments include "Ke**mun**anan kita", "ada **sandara** kita", "mesti melindu[ngi]", "harapan Semenanjung", "Raja Baru kita men[anti]". At least two look like typos — *sandara* should be **saudara** (brother/kin); *kemunanan* is not a word (**kemenangan** = victory, **kemurnian** = purity, **kemuliaan** = glory). | End-state map, letter prop. | Get the Malay proofed before this becomes a handout. "Raja Baru" (New King) is correct and on-theme. A letter warning against the Ghoul King, written in Malay, torn, with "BEWARE THE GHOUL KING'S LIES!!" over it in a second hand, is a superb prop — it just has to be literate. |
| NOTE | "Malaya — Truly A **WASTELAND**" | A parody of Tourism Malaysia's 1999 "Malaysia, Truly Asia" — a post-divergence real-world reference. | Precedent: CLAUDE.md sanctions Indah Water, Universiti Malaya, Kemahiran Hidup. | Keep it. It is defaced pre-war tourist print, which is exactly the house register (cheerful signage over rot), and the title's use of "**Malaya**" rather than "Malaysia" quietly handles the divergence. Precedent is established; NOTE, not a flag. |
| NOTE | "SCARY WHISPERS" across the Great Jungle | Matches canon precisely: "most chilling are the **whispers**… Those living on the jungle's edge speak of voices at night… The jungle watches. And it remembers." | `Locations/Great Jungle.md`. | Clean. The jungle also canonically holds "lost technology, mutated beasts, and **hidden vaults untouched since the war**", which pre-authorises everything in Part B. |
| NOTE | Penang, artillery positions, "boom boom guns!" | Matches canon: coastal wall of warship hulls, "high altitude thunderous cannons that rain death kilometers away", withdrawal to "safe artillery zones". | `02_Factions/The Protectorate/01_The Protectorate.md`; `🕛 Timeline`, 2130–2132. | Clean. The small blue footprint is *correct* and should stay small. |
| NOTE | The North–South Railway is not drawn | It is the Protectorate's stated strategic obsession ("a standing interest in the old North South Railway, wanting it refurbished as central infrastructure") and the spine of the 2230 military build-up. | `01_The Protectorate.md`, Interests Beyond Penang; org-map G37; `🕛 Timeline`, 2230. | Draw it. On an end-state map, whether the railway corridor is blue, olive or jungle-green is the single most informative line on the page. |
| NOTE | "tge Protectorate" typo in the legend | — | End-state map. | Cosmetic. |
| NOTE | "Future Home Me & Sarah — sorry", crossed out | Reads as a second annotator's personal note. | End-state map. | Harmless, and it actively helps: two hands on one map is good diegetic texture. Keep it if the map is ever a handout. |

---

## Part B — DIRECTION: three Great Jungle locations

### B1. The Valley of Endless Rain

**What canon says.** The Great Jungle is pre-authorised for exactly this:
"Little is known of the secrets within. Only rumors remain, of lost technology,
mutated beasts, and hidden vaults untouched since the war" (`Locations/Great
Jungle.md`). The GM's own setting note says rainfall is *already* the Peninsula's
saving grace and its problem — "Due to relatively regular rainfall, water is not
crucial but it is important for supply and to farm. **Radioactive rain too proves
problematic to drink but is still usable to a degree**" (org-map D16). A valley of
undrinkable rain is the extreme case of a rule the setting already has.

**The science, honestly.** Cloud seeding **cannot create rain**. It only nudges
moisture that is already in a suitable cloud into precipitating — "cloud seeding
operations can only enhance precipitation when the right kind of clouds are
present", and silver iodide works by nucleating ice from moisture already in the
cloud ([GAO-25-107328](https://www.gao.gov/products/gao-25-107328)). So a machine
stuck "on" does not manufacture a permanent monsoon out of nothing.

But equatorial Malaya is the one place on Earth where that limitation barely
bites. The Peninsula averages 2,000–2,500 mm of rain a year, and Taiping —
sitting on lowland right under the 1,250 m Bukit Larut scarp — takes about
**4,000 mm**, with 159 mm in its *driest* month ([Taiping,
Perak](https://en.wikipedia.org/wiki/Taiping,_Perak)). The mechanism is
orographic: the Titiwangsa range forces moist air up and wrings it out.

→ **Recommended framing, which costs nothing and buys realism:** the machine
does not make the rain. It **never lets the afternoon storm die.** Site the
valley on the windward flank of the central range, where a convective cell
builds daily anyway, and have the machine re-trigger it before it can dissipate.
It has rained for 170 years because the storm has never been allowed to finish.
That is defensible, it is more sinister than "rain machine", and it means
switching the machine off does not stop the rain immediately — it just lets the
sky breathe for the first time since the war.

Second realism upgrade, free: tropical clouds rain by **collision-coalescence**,
not by ice, so warm-cloud seeding uses **hygroscopic salt flares**, not silver
iodide. Make the machine a salt-dispersal tower. You get a visual — white crust
on every leaf, salt-burnt canopy, brine running off the rock — that rhymes with
the Chukai Desert's "irradiated salt" and gives the place a palette.

**Acid rain does not follow from seeding.** Acid rain is sulphuric and nitric
acid formed from SO₂ and NOₓ. You need a sulphur or nitrogen source. Three
in-world options, best first:

1. **Something is burning underneath.** A pre-war chemical works, a refinery
   sulphur store, or a peat fire that never went out, venting into the very
   convection cell the machine keeps re-firing. Refineries stockpile recovered
   elemental sulphur in blocks (the Claus process — [Shell, Sulphur
   Recovery](https://www.shell.com/business-customers/catalysts-technologies/licensed-technologies/emissions-standards/sulphur-recovery/claus-process.html)),
   and a burning sulphur stock genuinely produces sulphuric acid rain. This is
   the recommendation: it makes the rain, the acid and the mutation **one
   causal chain**, and gives the players a second thing to switch off.
2. The machine's own degraded chemical stock.
3. A cracked reactor in the valley (weakest — the Peninsula already has enough
   "it's radiation" explanations).

**Dial the acid down.** Real acid rain sits around pH 4–4.5; it kills forests
over decades, it does not melt people. If the GM wants it to bite, say 170 years
of recirculation in a closed basin has concentrated it, and make it a **slow
corrosion effect** — armour condition loss per hour of exposure, Endurance
checks, ruined food and paper, rust that weeps (the house decay rule) — not
burst damage. Fallout's own model for a hostile weather field is the Cloud in
*Dead Money*: it ruins gear and lungs, it is not a slasher.

**Fauna.** Acid-proof hide is plausible via real analogues: heavy keratinised
scale (pangolin), thick mucus layers (Malayan caecilians, mudskippers), and
sheer hide thickness. Build the bestiary from real Malayan stock so it reads as
this place and not generic wasteland: **Malayan tapir** (the single most
Malayan large mammal and a gorgeous mutant base), sun bear, water monitor, king
cobra, wild boar, giant forest scorpion, and the leeches — tiger leeches in
permanent rain is free horror.

**"The monsters never leave" needs a reason,** and the best one is an inversion:
**they can't.** They are obligate acid-adapted — ordinary air and ordinary rain
are what kill them. That quarantines the content (explains why 170 years of this
has not overrun the Peninsula), justifies the difficulty spike, and produces a
grim little gag: anything the players drag out dies on the way home, so the only
trophy is a story.

**Tone.** This is the location most at risk of being only grim. Get the joke out
of the machine: a ProTiga-branded weather control station with Abang Kopi's
grin still on the panel, a marquee announcing today's *scheduled* shower, and a
cheerful jingle looping into an empty valley for 170 years. ProTiga is canonically
"infamous for attempting to compete with RobCo, only to end up a shallow copy"
(`01_World Details/ProTiga.md`) — a weather machine that never learned how to
stop is exactly their product.

**Name.** "Valley of Endless Rain" is English and a little generic. In-world
options: **Lembah Hujan Abadi** (valley of eternal rain — grammatical and
evocative), **Lembah Basah** as the locals' shorthand, and the Federation's file
name for it, which should be a number and a euphemism.

**Don'ts.**
- Don't say the seeding caused the acid. A chemistry-literate player will catch it.
- Don't make it instantly lethal rain; that turns exploration into a timer.
- Don't use silver iodide language if you want the science to hold in the tropics.
- Don't let the whispers of the Great Jungle be *explained* by this valley. The
  whispers are a peninsula-wide unknown and are better unexplained.
- No dust, no sand, no cracked earth in any art from here. Mould, weeping rust,
  laterite mud, rot.

### B2. The Hidden USMC Vault

**What canon says — this one is already load-bearing and fits almost perfectly.**
The GM's current plan runs: Faiz wants "a data log detailing where pre-war US
military caches were across the Peninsula" from the ProTiga HQ vault (org-map
D13); the GK secretly wants "a pass key from the vault" (D16); the PosLaju centre
holds "pre-war **ProTiga vault keys**" (K67); and the ProTiga HQ basement has "a
giant vault door, leading underground" that the Axe Gang has failed to open for
years (F27). The proposed access code "issued to a handful of pre-war Malayan
companies — ProTiga is one of them" closes that loop exactly. **Say it out loud
in the design: the Bandawang heist yields the list *and* the key, and this valley
is what they open.**

**Timeline fit is strong, and better than the brief assumes.** Our pre-war
timeline has Malaya supplying America with oil from the 2000s–2020s, sending
reserves to the frontline in 2067, serving as "a launching pad for attacks into
Vietnam" from 2074 — and only being **invaded in late 2077**. So US forward
depots on the Peninsula are not an awkward fit; they are implied. Better still,
they were built while Malaya was an *ally*, with Malayan corporate contractors,
and then the ally invaded. That bitterness is worth more than the guns in the box.

**On the branch:** USMC is right (canon Fallout, Anchorage, T-45 —
[USMC](https://fallout.fandom.com/wiki/United_States_Marine_Corps)) and the
org-map's "US army" should change to match (see A2).

**On the access code — one fix.** It is odd for the *Marine Corps* to hand vault
codes to foreign firms. Make it a **contractor maintenance code**, not a military
one: ProTiga built the Federation's bunkers (canon), so ProTiga built these too,
and the code is facilities-management, held by the construction consortium. That
is how it would actually work, it explains the "handful of companies", and it
delivers a genuinely Fallout joke: **the Marines' doomsday cache opens to a
building-services keycard, because the lowest bidder installed the door.**

**On the Enclave — CHECK, and a better answer.** Arguments against: the Enclave
has zero footprint in FOES; retro-fitting them as the authors of the campaign's
keystone makes the Peninsula a satellite of west-coast lore, which is the
opposite of what this setting does well; and the campaign's villainy is
homegrown — ministries, castes, triads, a Grand Architect — which is stronger.

Cleaner alternative that gives the GM everything he wants and costs nothing:
attribute the depot programme to **Poseidon Energy**. Poseidon is a canon
pre-war megacorp; it owned the oil rig the Enclave ran, and it owned the *PMV
Valdez* itself ([Poseidon Oil](https://fallout.fandom.com/wiki/Poseidon_Oil);
[PMV Valdez](https://fallout.fandom.com/wiki/PMV_Valdez)). Our timeline already
puts American oil interests in Malaya for seventy years. So:

- a Poseidon logo on a crate in a Malayan jungle is a **slow reveal**, not a
  retcon, and players who know the games will feel the floor tilt;
- the depots become a **global fuel-and-supply chain**, which is precisely what
  the Valdez needs to cross the Pacific in the sequel (see A1);
- the Enclave stays off-stage, available later, un-spent;
- and if the GM ever wants the Enclave connection made explicit, Poseidon *is*
  the thread that leads there.

Keep whichever version in a `> [!gm]- Secret` callout if it is ever written into
a player-facing note; the sync strips those, and a "Secretly…" sentence outside
one will trip `[GM LEAK?]`.

**Don'ts.**
- Don't let the vault be a loot pile. The dilemma the GM wants ("what to do with
  the munitions") only works if the players understand what handing it to any
  faction means — so the *inventory manifest* is the real treasure, and it should
  be readable, specific and frightening.
- Don't put anything high-tier in working order for a low-level party (CLAUDE.md).
  Sealed crates the party cannot move are more useful than a minigun they can.
- Don't name the Enclave in player-facing text.

### B3. Sgt. Gunn and his Ghoul Squad

**Fallout consistency — it holds, with one fix.**

- *Ghouls lasting 170 years, and only one staying lucid:* straightforwardly canon.
  Ferality is progressive and uneven; one holdout among a squad is standard.
- *Flesh fused to power armor:* there is direct precedent. Feral ghoul reavers
  canonically "wear bits of metal armor and metal flight suits. **Radiation has
  melted and fused entire segments of their body**, making them incredibly tough
  to dispatch" ([Ghoul](https://fallout.fandom.com/wiki/Ghoul)). The GM's image is
  the reaver, escalated. Cite it if anyone argues.
- *The power problem — this is the fix.* Fallout 1's T-51b description says a
  charge "usually has enough fuel to last a hundred years" ([Talk:T-51b power
  armor](https://fallout.fandom.com/wiki/Talk:T-51b_power_armor); note the
  100-year figure is also attached to Fallout Tactics, which is non-canon, so
  treat it as soft). 170+ years is past it either way. **Recommended:** the
  ferals' suits are **dead**. They are corpses walking inside inert armour on
  ghoul muscle alone — slower, louder, unstoppable, and far more horrifying than
  servo-assisted ferals. Only **Gunn's** suit still runs, because he has been
  cannibalising cells from the cache he guards. That gives him his lucidity (his
  suit's life support and med-injector still work), gives the players a ticking
  clock (he is down to his last cells), and makes the munitions dilemma personal:
  the thing the factions want is the thing keeping him a person.
- *Why the armour can't come off:* lean on pressure necrosis, granulation tissue
  growing into the lining, and the waste-management plumbing. One concrete detail
  beats a paragraph: it is the catheter line that fused.

**Balance.** CLAUDE.md: the party is low level, and high-tier gear appears worn
or in pieces (`Salvaged Power Armor Chestplate`, `Salvaged Power Armor Helmet`
are the existing precedent — single pieces, salvaged). A lucid, functioning,
power-armoured Marine is a walking artillery piece. **Recommend Gunn cannot
leave**: his seals are the only thing between him and the rain, and he will not
abandon his men. He is a location-bound ally — quest-giver, terminal-opener,
final-fight wildcard — not a party member. That protects the maths and sharpens
the dilemma.

**Tone — this is the piece most at risk of being *only* grim,** and the GM wants
the comedy. Free material:

- He is still filing daily readiness reports on men who are corpses. The forms
  are immaculate. He has never missed one.
- A "DAYS SINCE LAST INCIDENT" board, maintained with total sincerity.
- 170 years of one-sided radio checks to a command that stopped existing in the
  first hour.
- **The best beat:** he still believes he is guarding supplies for an ally.
  He has no idea America invaded Malaya in the last week of the world
  (`🕛 Timeline of Major Events.md`, "Late 2077 – the paranoia of the late war
  years turns real: America invades Malaya"). Telling him is the scene. It is
  funny right up until it isn't, which is the exact register Fallout runs on.

**Sensitivity.** Gunn is an American soldier stationed in a country his own
government invaded. Keep the joke on the institution — the Corps forgot them, the
paperwork outlived the nation — never on Malaysians. Do not let him become the
Peninsula's saviour or its moral authority. And he should not speak Manglish; he
is a 1957-frozen American and should sound like one.

**The dilemma.** Two options is a coin flip; three is a decision. Give the
players: mercy-kill the squad; seal them in and let them keep the post; or try
to free one and learn what "removing it kills them" actually means.

**Don'ts.**
- Don't make Gunn a recruitable combat NPC who leaves the valley.
- Don't have the ferals talk. The lucid one is the whole point.
- Don't tie them to the Great Jungle's whispers.
- Don't let "Sgt. Gunn" get a wink at the audience. The name is fine because
  Fallout names people like that; a lampshade would break it.

### B4. The Orphanage of Mothers

| Severity | Issue | Why (source) | Suggested fix |
|---|---|---|---|
| BLOCK | This is the Kancil Orphanage under a different name | `02_Factions/The Kancil Orphanage.md` is already canon: founded by **Mother Shalini, the First Mother**; "Its women take on Indian names beginning with S and become **Mothers** in their turn; its men take Indian names beginning with H and become **Harimaus**"; children hired out as labour; "engineering and mathematics are drilled into every Kancil from young". "An orphanage run entirely by children, answering to a single unseen mother figure" is 80% the same institution with a new label — and it would create a second glossary term for one idea. | `02_Factions/The Kancil Orphanage.md`; org-map L113; CLAUDE.md (Kancil child labour is a GM-led dark theme). | Make it a **lost Kancil house** deep in the Great Jungle — a Mother House that stopped receiving word from Bandawang and kept running anyway. You inherit the whole institution for free, you explain why jungle children are competent engineers, and you pay off org-map D16's "**The Kancil Orphanage has closed its doors**" with somewhere the closure did not reach. |

**If it becomes a Kancil house, three things fall into place at once.** Kancils
are drilled in engineering and mathematics and valued for "hands small enough to
maintain machinery no one else can reach". That is *exactly* the labour profile
for keeping a 170-year-old weather machine running, and for getting into a
sealed vault. **The unifying arc:** the children keep the rain falling because
Mother told them to, the rain is what keeps the monsters in, and the monsters are
what has kept the USMC vault hidden for 170 years. Three locations, one causal
chain, and the players have to decide whether to break it.

**The unseen Mother — three readings, all Fallout-legal:**

- **(a) She is dead and the children keep her going.** A terminal, a looping
  recording, a chair, or — best fit — a still-functioning ProTiga nanny unit
  reciting Mother Shalini's rules in Abang Kopi's voice. Reuses established tech,
  lands the house tone (cheerful signage over rot), and is genuinely unsettling.
- **(b) She is a bedridden ghoul.** Careful: this rhymes hard with **Uncle Loo**
  (org-map K77), the bedridden ghoul benefactor who is a front for the GK's
  cabal. The GM may want that echo — or may find it muddies a late reveal.
- **(c) "Mother" is a rota.** Whichever girl is oldest becomes Mother. This
  rhymes deliberately with `People/The Ghoul King.md` — "'the Ghoul King' has
  been three different people over the years, maybe more" — and is thematically
  the strongest.

Recommend **(a)** or **(c)**.

**Name.** "Orphanage of Mothers" is grammatically odd and collides with the
Kancil term. Better: **Rumah Ibu** (mother house), **Rumah Anak Kancil**, or —
for the sign still hanging on the gate — **"Rumah Anak-Anak Bahagia"** (Happy
Children's Home), which is correct Malay and does the tonal work by itself.

**Naming practice, already canon:** women take Indian names beginning with S
(Shalini, Sumathi, Saroja, Sivagami), men Indian names beginning with H, and
"Harimau" is Malay for tiger. The Indian/Malay mix is deliberate and correct for
Malaysian Indian naming — don't "correct" it.

**Don'ts.**
- Don't write the child-labour material outside the GM's framing, and keep the
  specifics in `> [!gm]-` callouts (CLAUDE.md).
- Don't connect this house to the PCs' own prison and labour-camp origin. Ever.
- Don't make the children uncanny-creepy in the horror-movie sense. The vault
  note's horror is bureaucratic — "Factions are more than happy to keep up
  appearances — after all, it still looks, from the outside, like children are
  being cared for." Match that register.
- Don't leave them fed by magic. In a jungle that "swallows settlements", say
  what they eat.

---

## Part C — Can this world make gunpowder and munitions?

Short answer: **black powder, yes, easily and forever. Smokeless propellant, yes,
but only in one or two places and never reliably. Cartridge cases and primers,
no — and that is what actually ends the war.**

### C1. Black powder: a solved problem on this peninsula

**Nitrate.** Malaya has world-class limestone karst full of bats. **Batu Caves
in Selangor was mined for bat guano from the 1860s**, and cave guano leached by
water becomes saltpetre — the nitrogen-rich guano yields calcium nitrate which is
converted with potash to potassium nitrate ([Batu
Caves](https://en.wikipedia.org/wiki/Batu_Caves); [NPS — From Dirt to
Gunpowder](https://www.nps.gov/articles/000/saltpetre-mining.htm)). Where caves
run short, **niter beds** — dung, ash and earth, turned and leached over
12–18 months — are 16th-century technology ([Saltpetre
works](https://en.wikipedia.org/wiki/Saltpetre_works)).
*Caveat worth using in play:* the tropics' rainfall leaches nitrate out of open
ground, so you want **dry cave interiors and roofed beds**. In a monsoon world,
a dry cave is strategic terrain.

**Charcoal.** Trivial. Rubberwood, bamboo, coconut shell.

**Sulphur — and this is the finding the GM should take away.** Peninsular
Malaysia has **no active volcanoes**; volcanic sulphur is Indonesian (Ijen,
Sumatra). But the Peninsula has something better for a post-war setting:
**refinery sulphur.** Refineries strip H₂S from crude and convert it to
elemental sulphur by the **Claus process**, stockpiling it in solid yellow blocks
([Shell — Claus
Process](https://www.shell.com/business-customers/catalysts-technologies/licensed-technologies/emissions-standards/sulphur-recovery/claus-process.html)).
Malaysia's real petrochemical complex is at **Kertih/Kerteh in Terengganu**
([Kertih Refinery](https://www.offshore-technology.com/marketdata/kertih-refinery-malaysia/))
— which is to say, at **Chukai**. And our canon already says the Chukai region
"was saturated with oil fields and chemical infrastructure" and is "once home to
thriving petroleum refineries" (`Locations/🏜️Chukai Desert.md`).

→ **The Caliphate is sitting on the Peninsula's sulphur.** They are pacifists
who "abstain from conflict, seeing themselves as preservers of knowledge", and
they hold the one input nobody can substitute. That is a free, enormous
geopolitical lever, and it is already canon — nothing needs inventing.

**Verdict:** anyone on the Peninsula can make black powder indefinitely.
Cap-and-ball and black-powder cartridges are the **floor**, not a fallback.

### C2. Smokeless propellant: 1840s chemistry, not modern chemistry

This is the part the GM may be over-estimating. Smokeless powder does **not**
require modern industry. It requires 18th–19th century industry, done carefully:

- **Sulphuric acid** — the **lead chamber process**, in use from 1746 and the
  world standard for nearly two centuries: burn sulphur with saltpetre in
  lead-lined chambers ([Lead chamber
  process](https://en.wikipedia.org/wiki/Lead_chamber_process)).
- **Nitric acid** — "early nitric acid was made by **heating strong sulphuric
  acid with saltpeter**" in cast-iron retorts with condensers. **No Haber-Bosch,
  no ammonia plant, no electricity.** Saltpetre + sulphur + iron pots
  ([RNCF — Sulphuric and Nitric Acid Manufacture](https://www.greenacre.info/RNCF/page28.html)).
- **Nitrocellulose** — cellulose treated with mixed nitric/sulphuric acid;
  Schönbein made guncotton this way in **1846**
  ([Nitrocellulose](https://en.wikipedia.org/wiki/Nitrocellulose)). Malaya's
  cellulose supply is absurd: wood pulp, bamboo, kapok, coir.

So the Protectorate can certainly do it, and the Federation *knows* how to —
Wira Bunker canonically holds "chemical laboratories, reloading stations, and
munitions manufacturing" and the Perdana Keturunans include **Keturunan Leong
(Chemical and Munitions manufacturers)** (`Federation Bunkers.md`;
`Locations/Perdana Bunker.md`). That is the setting telling you the answer
already exists.

**The four real bottlenecks, in order of how hard they bite:**

1. **Stabilisation — the tropical killer.** Nitrocellulose that is not washed for
   weeks and stabilised decomposes autocatalytically and self-ignites. Early
   guncotton works blew themselves up repeatedly. Heat and humidity accelerate
   it. In this climate, workshop smokeless powder has a **short, unreliable shelf
   life**. That is a gift: powder sold with a *use-by date*, magazines that
   occasionally cook off in the night, and a Ministry of Standards that certifies
   lots in triplicate and still gets it wrong.
2. **Primers.** Mercury fulminate needs mercury, nitric acid and ethanol. Ethanol
   is easy; mercury is not — it is a **minor** Malaysian ore, and the realistic
   post-war supply is salvage (thermometers, switches, dental amalgam, old gold-
   mining amalgamation stock) ([Britannica —
   Malaysia: Resources](https://www.britannica.com/place/Malaysia/Resources-and-power)).
   Lead styphnate needs styphnic acid via resorcinol — out of reach. Realistic
   answer: **re-prime salvaged cases.** Which the setting already has.
3. **Cases — the true hard limit.** Cartridge brass is 70/30 copper-zinc.
   Peninsular Malaysia is the world's **tin** province — the Kinta Valley alone
   holds "probably a fifth of the world's known tin" — while **copper comes from
   western Sabah**, not the peninsula, and zinc barely features
   ([Britannica](https://www.britannica.com/place/Malaysia/Resources-and-power);
   [The Tin Deposits of the Kinta
   Valley](https://link.springer.com/chapter/10.1007/978-94-011-6511-2_7)). Tin
   gives you bronze, pewter and solder — not cartridge brass. Steel cases are
   possible (Soviet WWII practice) but need good steel and coatings. So cases
   come from **salvage, reloaded until the necks split** — realistically five to
   ten firings a case.¹
4. **Consistency.** A workshop can make powder. Making ten thousand rounds that
   all shoot the same is an industrial-statistics problem, and it is why
   handloads and pre-war cartridges should never be the same item.

### C3. Faction by faction

- **The Protectorate** can do all of C2 at scale — warship salvage gives them
  steel, copper piping and brass fittings, and canon gives them the energy and
  the engineers. Their weakness is their doctrine: **artillery eats propellant in
  kilograms per shot, not grams**, and a barrage is measured in tonnes. Their
  guns therefore depend on two inputs they do not own — **sulphur** (Chukai, i.e.
  Caliphate) and **nitrate** (karst caves, largely in the north-west, i.e. UCL-
  contested ground once the map's end state arrives). The most powerful faction
  on the Peninsula is the most import-dependent one. Use it.
- **The Federation** has the knowledge and no throughput. It is a reloading
  economy wearing an arms industry's uniform — five stamps to requisition a
  primer. Perfectly in character.
- **The Caliphate** sits on the sulphur, keeps the chemistry in the Grand
  Library, and refuses to fight. They are the Peninsula's powder broker, almost
  literally, and they don't know it yet — or they do, and that is why they wait.
- **Bandawang** is black powder, pipe guns and reloads, exactly as written:
  `Items/Weapons/Homemade Pistol.md` — "Some use gunpowder, some use pressure" —
  firing `makeshift_rounds`; `Items/Gear/Gunsmiths Tools.md` — "Grease, brass
  plates, **saltpeter**, gunpowder." The precedent supports a clean two-tier ammo
  economy: **salvaged pre-war cartridges** (scarce, reliable) vs **handloads**
  (common, unreliable, occasionally a misfire). That is a crafting and balance
  decision, not a lore one — worth handing to the balance-auditor rather than
  settling here.

### C4. Does the chemistry support the ending?

**Yes — but not the way the brief states it, and the difference matters.**

"The Kingdom stops expanding because it runs out of munitions" will not survive
contact with a chemistry-literate player *if munitions means gunpowder*. Guano,
sulphur and charcoal are renewable and the Peninsula has all three. Nobody on
Malaya ever runs out of powder.

What **does** run out, irreplaceably:

1. **Cartridge cases and primers.** Finite stock, no local copper-zinc, no local
   mercury, five to ten reloads per case.¹
2. **Artillery shells and fuzes.** Machined steel bodies and mechanical time
   fuzes are a factory product, not a forge product.
3. **Fusion cells and energy ammunition.** Canonically hoarded already
   (`A00_Introduction.md`: "Microfusion Cells & Plasma Weaponry — Hoarded by
   elite factions").
4. **High explosive for breaching fortifications.** TNT needs toluene — a
   petrochemical, i.e. Chukai again. Beyond any jungle forge.

→ **The honest version of the ending, which is also the better image:** the
Kingdom raids the USMC caches, fights the war on pre-war ammunition, and stops
when the **cartridges** run out. After that both sides can still fight — but only
with black powder, at which point nobody can crack Penang's warship walls and
nobody can crack the Kingdom's numbers. **The stalemate is a mutual technological
regression to about 1860**, not a disarmament. A world sliding back to
cap-and-ball while polished artillery sits silent for want of shells is a far
more Fallout picture than empty magazines.

**Timescale (estimate, not a claim).²** Pre-war Malaya was not a small-arms
producer, so the caches *are* the stockpile. A war of raids and sieges burning
even tens of thousands of rounds a month against a cache measured in the millions
is a matter of **years, not decades** — call it 5–15 years of real campaigning
before ammunition discipline becomes doctrine, and roughly a generation before
the last reliable primers are gone. Cases degrade with use as well as with
firing, so the cache shrinks faster than a simple count suggests.

**Which gives the GM a scheduling constraint worth writing down:** if the
stalemate should already be biting when the *Valdez* crew arrives, the crowning
wants to be **five to ten years before the shipwreck**.

**And it makes the villain right.** A leader obsessed with munitions is not a
crank — he is the only person on the Peninsula who has done the arithmetic. He
isn't hoarding bullets; he's hoarding the last century of them. That is the
cleanest possible line to hang the whole endgame on.

**One free worldbuilding lever:** black powder is hygroscopic, paper cartridges
rot, and percussion caps corrode. In a monsoon world at 90% humidity, **dry
storage is a strategic asset**. Sealed pre-war ammunition tins become treasure;
`Items/Junk/Federation Ration Tin.md` is the precedent for the object. And it
makes the USMC vault's sealed door mean something — the Valley of Endless Rain is
the worst place on the Peninsula to store powder, which is exactly why the only
powder that survived there is behind a door.

---

**CLEAN (checked, no flags):** `Locations/Great Jungle.md`; `02_Factions/UCL/UCL.md`;
`02_Factions/The Caliphate/The Caliphate.md`; `Locations/Round City.md`;
`Locations/🏜️Chukai Desert.md`; `Found Texts/The Peninsula/On the Salt.md`;
`People/The Ghoul King.md` (GM callouts correctly used);
`02_Factions/The Kancil Orphanage.md` (correct as written — the conflict is with
the *new* proposal, not with this file); `Items/Weapons/Homemade Pistol.md`;
`Items/Gear/Gunsmiths Tools.md`; `01_World Details/ProTiga.md`;
the end-state map's Great Jungle, Penang artillery, and "SCARY WHISPERS" annotations.

---

### Footnotes — inferences, marked

1. **Five to ten reloads per cartridge case** is a working figure from civilian
   reloading practice (case life ends at neck splits or incipient head
   separation) applied here to post-war conditions with degraded annealing and no
   case-gauge quality control. It is an order-of-magnitude assumption for design
   purposes, not a sourced constant.
2. **The 5–15 year figure** is my inference from the combination of: no pre-war
   Malayan small-arms industry in our timeline; cache size unstated in any source;
   and the reload-life estimate in footnote 1. It is offered as a planning
   number for the GM to set deliberately, not as a derived result.
3. **"The machine re-triggers the daily storm rather than creating rain"** is my
   proposal, not canon and not established meteorology — it is a framing chosen
   because it stays inside the real limits of cloud seeding (seeding enhances
   existing cloud, GAO-25-107328) while delivering the GM's intended effect.
4. **"Qal'at as-Petani corresponds to historic Patani in the far north"** is an
   inference from the name (Arabic *qal'at* = fortress + Petani/Patani) plus the
   timeline's framing of it as "nearby" to a Penang-based power. No vault file
   states its location; there is no `Qal'at as-Petani` note in `VAULT_INDEX.tsv`.
5. **"The Caliphate holds the Peninsula's sulphur"** is my inference, chaining
   canon (Chukai "once home to thriving petroleum refineries", Caliphate holds
   Chukai) to real refinery practice (Claus-process sulphur recovery at Kertih).
   The vault nowhere says the Caliphate has sulphur.
6. **"The UCL took Qal'at as-Petani from the Protectorate"** is a proposal to
   reconcile the map with the 2230 annexation, not a reading of any source.
7. **Gunn's suit being the last powered one** is a proposal to reconcile the
   ~100-year power-armor fuel figure with a 170-year vigil; the 100-year figure
   itself is soft (Fallout 1 item description, and Fallout Tactics is non-canon).
8. **Attributing the depot network to Poseidon Energy rather than the Enclave**
   is my recommendation, not canon. Poseidon's ownership of the rig and the
   Valdez is canon; a global depot programme is not.

### Sources

- [Fallout Wiki — PMV Valdez](https://fallout.fandom.com/wiki/PMV_Valdez)
- [Fallout Wiki — Poseidon Oil](https://fallout.fandom.com/wiki/Poseidon_Oil)
- [Fallout Wiki — Destruction of Control Station Enclave](https://fallout.fandom.com/wiki/Destruction_of_Control_Station_Enclave)
- [Fallout Wiki — The tanker needs fuel](https://fallout.fandom.com/wiki/The_tanker_needs_fuel)
- [Fallout Wiki — San Francisco](https://fallout.fandom.com/wiki/San_Francisco)
- [Fallout Wiki — History of Caesar's Legion](https://fallout.fandom.com/wiki/History_of_Caesar's_Legion)
- [Fallout Wiki — Frumentarii](https://fallout.fandom.com/wiki/Frumentarii)
- [Fallout Wiki — United States Marine Corps](https://fallout.fandom.com/wiki/United_States_Marine_Corps)
- [Fallout Wiki — Ghoul](https://fallout.fandom.com/wiki/Ghoul)
- [Fallout Wiki — Talk:T-51b power armor](https://fallout.fandom.com/wiki/Talk:T-51b_power_armor)
- [GAO — Cloud Seeding Technology: Assessing Effectiveness and Other Challenges](https://www.gao.gov/products/gao-25-107328)
- [Wikipedia — Taiping, Perak](https://en.wikipedia.org/wiki/Taiping,_Perak)
- [Wikipedia — Batu Caves](https://en.wikipedia.org/wiki/Batu_Caves)
- [NPS — From Dirt to Gunpowder: Saltpetre Mining](https://www.nps.gov/articles/000/saltpetre-mining.htm)
- [Wikipedia — Saltpetre works](https://en.wikipedia.org/wiki/Saltpetre_works)
- [Shell — Claus Process, Sulphur Recovery](https://www.shell.com/business-customers/catalysts-technologies/licensed-technologies/emissions-standards/sulphur-recovery/claus-process.html)
- [Offshore Technology — Kertih Refinery, Malaysia](https://www.offshore-technology.com/marketdata/kertih-refinery-malaysia/)
- [Wikipedia — Lead chamber process](https://en.wikipedia.org/wiki/Lead_chamber_process)
- [Wikipedia — Nitrocellulose](https://en.wikipedia.org/wiki/Nitrocellulose)
- [RNCF — Sulphuric and Nitric Acid Manufacture and Use](https://www.greenacre.info/RNCF/page28.html)
- [Britannica — Malaysia: Resources and power](https://www.britannica.com/place/Malaysia/Resources-and-power)
- [Springer — The Tin Deposits of the Kinta Valley, Malaysia](https://link.springer.com/chapter/10.1007/978-94-011-6511-2_7)
