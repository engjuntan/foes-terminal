# Lore direction: the Chukai Desert, the Emerald Sea and the Caliphate

Mode: DIRECTION. Advice only; every item is a question for the GM.
`$V` = the vault root. Line numbers are as of 6 Oct 2026.

**GM rulings built in as decided (coordinator, 6 Oct):**
- **R1.** The Emerald Sea is a desert, not water. It is the Chukai's own name after dark. Nothing may suggest a body of water.
- **R2.** No oil derricks anywhere in the Chukai or Round City. Refineries, tank farms, flare stacks and chemical works stay.
- **R3.** The Library Token and the Caliphate Dinar are one item: a trinitite-infused pre-war library card. It is the Grand Library's key and the Stewards control it. The capital-punishment line for late returns stays.

---

## (a) Contradictions and gaps

Ordered by how much they matter for play.

| Sev | Where | Issue | Source |
|---|---|---|---|
| BLOCK | `Found Texts/The Peninsula/On the Salt.md:6` (and generated `src/dataLogs.js:475`) | "The derricks come first… black bones standing in a white sea" breaks R2. "White sea" also brushes against R1. | R2, R1 |
| BLOCK | `Locations/Round City.md:67` | "mast antenna was salvaged from an oil derrick" breaks R2. The same wording is in `tools/art-locations.mjs:182`, the Round City interior prompt. The interior art that has already shipped shows a tall steel lattice tower, which can be re-described without regenerating it (see c). | R2 |
| BLOCK | `Locations/🏜️Chukai Desert.md:10` | "saturated with oil fields" breaks R2. It is also wrong for the real place: Terengganu's oil is all offshore, and the coast only has refineries, terminals and gas plants (see d). | R2; [Kerteh](https://en.wikipedia.org/wiki/Kerteh) |
| BLOCK | `02_Factions/The Caliphate/The Caliphate.md:64-66` | Calls the currency "Caliphate Library Tokens, original pre-war library cards" and never names the Dinar. This breaks R3. | R3; `Items/Currency/Caliphate Dinar.md:5` |
| BLOCK | `Locations/Round City.md:69` | "sealed archive, accessed only via gifted Dinars" leaves it unclear whether this is the same token. It needs to say what "gifted" means (see c). | R3 |
| BLOCK | `Locations/Round City.md:16` vs `The Caliphate.md:29`, `On the Salt.md:6`, `Found Texts/The Peninsula/Conditions of Admission.md` | The founding order is reversed. Round City has scholars mapping safe zones and *choosing* a crater, then building. Three other sources say Syed found the Library first, and *Conditions of Admission* states "The Library is older than the walls around it. The walls were built because of the Library." Round City is the outlier. | quoted |
| CHECK | `The Caliphate.md:52` vs `Conditions of Admission` | "access to the Grand Library being restricted to those who earn it" contradicts "Admission is granted to any person who comes to read. This has never been restricted." | quoted |
| CHECK | `The Caliphate.md:64` vs `Conditions of Admission` | Tokens "borrow books", yet "You may not remove any original. There is no appeal, no exception, and no price." | quoted |
| CHECK | Physical story: `🏜️Chukai Desert.md:10,12,18` vs `Round City.md:10,16` vs the art | The Chukai note gives a fuel firestorm, a detonation and a ring at the heart. Round City gives "a long-forgotten nuclear crater". The shipped Chukai night art shows the ring with an **empty centre**. The shipped Round City art shows the city on open dunes with **no crater rim and no glass**. If the city sat inside the ring, both images would be wrong. | `public/art/locations/loc_chukai_desert_entrance.jpg`, `loc_round_city_entrance.jpg` [^1] |
| CHECK | `🏜️Chukai Desert.md:18` vs `Religions/The Path.md:9` | "God turned to glass", but The Path is "agnostic… does not claim to know the nature of this power". | quoted |
| CHECK | `Round City.md:10` vs `On the Salt.md:6` and `Round City.md:16` | Line 10 says "deep **wound** of a… crater". The pilgrim says "the first scholars called this a scar and not a wound", and Round City's own line 16 says "a divine scar". | quoted |
| CHECK | `Conditions of Admission` vs `tools/art-locations.mjs:182` and the shipped interior art | "You may not bring fire", yet the Library is "lit by rows of scattered oil lamps". | quoted [^2] |
| CHECK | `The Caliphate.md:108-110`, `Round City.md:65-95`, `01_World Details/Economies of the Peninsula.md:86` | "Secrets and Narrative Hooks" (Red Vault, AI fragment, war protocols) and the Dinar buy-back sit in player-facing notes **outside** `> [!gm]-` callouts. | CLAUDE.md callout convention |
| CHECK | `The Caliphate.md:110` | The text is cut off mid-word: "with rumors circulating abo". The file ends there. | — |
| CHECK | `People/Faiz.md:16` (and `SCOPE_DECISIONS.md` ~954) vs `The Caliphate.md:104`, `org-map.md` D16 | Faiz wants "a presence in the **East**". The Caliphate *is* the East; every other source says it wants a foothold on the **West** Coast. This looks like a slip. | quoted |
| CHECK | `Round City.md:28` | "Librarian **Uztad**" should be **Ustaz**, the standard Malay spelling of the religious-teacher title (Arabic *ustādh*). | assumed, not searched |
| NOTE | `reference/northern-conflict.md` (Faction Lore, ~l.870) | Says "green specks that **glow** in the night". Real trinitite does not glow; it only reflects. The Chukai note's "glitters under moonlight" is right, so keep glitter. | [Trinitite FAQ](https://galactic-stone.com/trinitite-faq/) |
| NOTE | `On the Salt.md:6` "two centuries"; `org-map.md` D13 "200 year old heist" | 2077 to 2247 is 170 years. Fine as a pilgrim's round number. | timeline |
| NOTE | `Round City.md:39` vs `:18` and the art | "Spirals inward like a nautilus" vs "a perfectly circular city"; the art shows concentric rings. | — |
| NOTE | `org-map.md` D13 vs `SCOPE_DECISIONS.md` (2026-09-23), `Faiz.md:19` | D13 says Faiz "actually wants" the cache map. The newer ruling says he doesn't know it is one. The ruling already supersedes D13; listed only so nobody re-imports D13. | — |
| NOTE | `01_World Details/🕛 Timeline of Major Events.md` | The Caliphate has **no founding date**, only the 2231–2241 "grows stronger" line (l.115). | — |
| NOTE | `The Caliphate.md:43` vs `northern-conflict.md` (~l.918) | The vault calls The Path "a pre-war belief system". The older doc says the House of Syed was Islamic and *amended* its scripture after the war. These are compatible if The Path is the House's post-war reform. | — |
| NOTE | `Items/Currency/Caliphate Dinar.md:17`, `public/art/dinar.jpg` | R3 says "card", but the shipped art is a round glazed disc. Both fit if pre-war library cards were stamped metal plates (see c). | [Charga-Plate](https://en.wikipedia.org/wiki/Credit_card) |
| NOTE | Climate | Real Kemaman is one of Terengganu's worst-flooded districts in the north-east monsoon. The desert is a deliberate Fallout conceit, already ruled ("The Chukai Desert is dry", `SCOPE_DECISIONS.md` ~1009). Don't explain it with rain mechanics. | [NST 2022](https://api.nst.com.my/news/nation/2022/12/862695/65-episodes-floods-kelantan-and-terengganu-dec-17-says-did) |

---

## (b) Proposed account (about 390 words)

**What hit.** The Kerteh–Kemaman coast held the oil Malaya had promised America (timeline, 2000s–2020s). On 23 October 2077 it took **several** warheads, as `northern-conflict.md` says ("the target of a few nuclear detonations").[^3] The largest was a ground burst over the refinery country in the middle of the coast. Its fireball fused the sandy beach-ridge soil into **trinitite**, green from the iron in it. The tank farms and pipelines burned for months, and the winds those fires pulled in scoured the land down to salt and sand. That is the Chukai note's "fuel reserves ignited and superheated winds scoured", and it is why one bomb's patch became hundreds of square kilometres.

**Two landmarks, one war.** At ground zero, the blast threw up a crater rim. 170 years of wind have built sand against it, ridge inside ridge: this is **the Ring**, seen only from high ground, the desert's navigation mark. Nobody lives in it, and the art's empty centre is correct. A **lesser strike** near the desert's edge left a smaller crater, now half-filled with sand. A pre-war hardened shelter lay buried beneath its wall: books, terminals, its own water and a working reactor (`northern-conflict.md`). The blast laid its door open. That shelter is the Grand Library, and the Round City stands in that small crater, at the edge of the glass rather than in it. This matches the Round City art, which shows dunes and no glitter.

**Founding (proposed dates).** Around **2160**, Syed the First, a salvage merchant, finds the door and moves in for the water. He trades the water, spends a decade cataloguing, and dies. Around **2175–90**, his heirs become the House of Syed and the Stewards issue the Dinars from the Library's own stock of cards. Scholars survey the basin with the Library's instruments, judge the crater floor cool enough to live on, and raise walls around the Library. Around **2200–10**, the Grand Library Mosque is finished ("nearly a generation later") and coastal towns join against the Great Jungle. From **2231** the Caliphate grows stronger, which is canon.[^4]

**Why it is holy.** The Path's second tenet is **folly**: "observe the mistakes of the past" (`The Path.md:9`). The glass is the old world's folly laid out where anyone can read it. The war that should have destroyed the Library dug it up instead. So the Caliphate treats the desert the way the Library treats a book: look as long as you like, copy what you see, never remove an original.[^5]

**Outsiders vs the faithful.** Outsiders see a radioactive glass plain, a faction that will not let them pick up the glass, and the one faction that does gather it, for its own currency. The Caliphate sees a text written by the war, Heaven's correction, and a sacred road crossed by night.

---

## (c) Edit proposals

### `Locations/🏜️Chukai Desert.md`: full replacement for two sections

Keep the lede (line 6) as it is. Replace lines 8–22 with:

```markdown
## Origins and History

Before the war this was the oil coast: the refinery towns of Kerteh and Paka, the tank farms and gas works strung down the shore towards Chukai, the crude piped in from the platforms far offshore. It was the oil Malaya had promised America, and on 23 October 2077 somebody else came to collect.

More than one warhead found the coast. The largest came down on the refinery country at its middle. Its fireball fused the sand where it stood; the tank farms and pipelines caught behind it and burned for months, and the wind those fires dragged in off the land scoured everything that was left down to salt and grit. What was coconut, kampung and padi on the morning of the 23rd has been desert ever since. Nobody can say why the land never took the rain back. The Caliphate can, at length.

The blast left its own monument. Where the largest warhead struck, the ground was thrown up into a crater rim, and a hundred and seventy years of wind have banked the sand against it into a great concentric ring, ridge inside ridge, so wide it only reads as a circle from high ground or from the air. It is the one landmark anyone crossing the Chukai navigates by. Nobody lives inside it.

The refineries are still standing, more or less: distillation columns and flare stacks gone black, leaning where the wind has leaned them, picked over by every scavenger with a cart and somehow still not empty. The board at the main gate of the largest still reads UTAMAKAN KESELAMATAN — 903 HARI TANPA KEMALANGAN. Nobody has had the heart to reset it.

The smaller strikes left smaller craters nearer the desert's edge. In one of them, long since half-filled with sand, stands the [[Round City]].

## The Emerald Sea

By day the Chukai is what it looks like: glare, salt and heat haze. It earns its other name after dark.

The fireball fused the coast's own sand into **trinitite**, a green glass, broken into shards across hundreds of square kilometres, none of them larger than a coin. Under moonlight the whole desert glitters green, ridge to ridge, further than any lamp can reach. The Caliphate calls it the **Emerald Sea** and holds it holy: what the old world burned, Heaven turned to glass, and then left lying out where everyone could read it.

That is how the faithful treat it: as a text. The rule the Grand Library keeps for its books it keeps for the desert too. You may look as long as you like and copy what you see; you do not carry an original away. Pilgrims cross by night, when the glitter shows the road and the ground has stopped cooking, and step around the brightest patches like a page they have not been given leave to turn.

Travellers who care nothing for any of that are warned anyway, and the warning is practical. The shards are the hottest thing in the desert, and the ones that shine brightest are the worst. A Pahlawan who finds a man filling a sack will explain this to him, once, kindly.

The only hands allowed to gather the glass belong to the Library's Stewards, who need it for the [[Caliphate Dinar]]. Depending on who is asked, this is either a sacred exception or an excellent way to stop forgers.

It was at the edge of this glass that the salvage merchant **Syed the First** found the door of the **Grand Library**, a buried pre-war shelter the war had dug up for him, and around it grew the Round City and then the Caliphate.

> [!gm]- Secret — the Library's water
> The Grand Library was a pre-war hardened shelter with its own water plant and a working fusion reactor. Syed moved in for the water, not the books. That plant still runs, which is why a desert faction can offer Bandawang a water deal (org-map D16). Players can learn it in play; the note never states it.
```

Notes on this text:
- **"Heaven" replaces "God"** so the line agrees with The Path's agnosticism. It is a CHECK for the GM. "Tuhan" is another option.
- **The safety board.** "Utamakan Keselamatan" ("put safety first") is everyday Malaysian site signage. It is in a note, not an image, so the no-text rule for Chukai art doesn't apply. The number avoids 1414.[^6]
- **"The brightest are the worst"** is kept from the current note. It is Fallout logic, not physics. A light GM hook: it is a teaching, not a measurement, and the dull shards can be just as hot. Use it or drop it.
- **Light game hook, not a system.** A `trinitite_shard` junk item could carry rads on pickup, sell well to cults and scholars (`Economies…md:81`), and give a Caliphate reputation hit if a Pahlawan sees it. That's one item, if wanted at all.

### `Locations/Round City.md`: line edits

| Line | Now | Proposed |
|---|---|---|
| 10 | "Built in the deep wound of a long-forgotten nuclear crater, the **Round City**…" | "Built in the deep scar of a lesser nuclear crater at the desert's edge, long since half-filled with sand, the **Round City**…" |
| 16 | "After the bombs, early Caliphate scholars wandered the wastes, mapping radiation-safe zones. One site — a deep, stable nuclear crater — became the sacred foundation for their new capital." | "The Library came first. Syed the First found its buried door in the crater wall and made his home beside it; a generation later his heirs' scholars surveyed the basin with the Library's own instruments, judged the crater floor cool enough to live on, and raised their capital there around it." (The rest of the paragraph, "The crater's geometry…", stays.) |
| 28 | "**Librarian Uztad**" | "**Librarian Ustaz**" |
| 39 | "Spirals inward like a nautilus, emphasizing divine recursion" | Optional: "Concentric rings stepping inward, each wall a page of the same text". This matches the art and line 18. |
| 67 | "salvaged from an oil derrick" | "salvaged from the lattice frame of a refinery flare stack". The shipped interior art already shows a steel lattice tower, so no reroll is needed.[^7] |
| 69 | "accessed only via gifted Dinars" | "opened only for a Dinar given up to the Library for good — surrendered, not spent" |
| 87–95 | "Secrets and Narrative Hooks" in plain text | Wrap the AI fragment and the war protocols in `> [!gm]- Secret`. Keep the Red Vault, mural and child as public rumours. The GM decides which are rumours. |
| `tools/art-locations.mjs:182` (not a vault file) | "a salvaged oil-derrick mast antenna… lit by rows of scattered oil lamps" | "a salvaged refinery flare-stack lattice threaded up through the ceiling… lit by rows of electric lamps in old oil-lamp housings" (for any future regeneration). |

### `02_Factions/The Caliphate/The Caliphate.md`: line edits

- **Line 29**, replace the first sentence with: "The **Caliphate** traces its origins to **Syed the First**, a salvage merchant who found the buried **Grand Library**, a pre-war shelter the war had laid open at the edge of the [[🏜️Chukai Desert]]'s glass." This also fixes "the House of Syed, a merchant". The rest of the line stays.
- **Line 52**, replace the last sentence with: "Reading is open to anyone who comes; borrowing, the terminals and the deeper stacks are for those who hold a **Dinar**."
- **Lines 64–66**, replace with:

```markdown
The **Caliphate** barters within its territory and uses RMR for most daily trade, but its own currency is the **[[Caliphate Dinar]]**, the **library token**. Each Dinar is one of the Grand Library's own pre-war library cards, infused with trinitite by the **Caliphate Stewards**, who alone issue and control it. It is the Grand Library's key: it lets its holder borrow a Library copy of any book (no original ever leaves the Library), use a library terminal, or enter the deeper stacks. The Dinars are highly valued and tightly controlled.

The punishment for failing to return a borrowed book is capital punishment, and there is a specific division within the **Caliphate** tasked with tracking down those who fail to return their borrowed materials. The **Dinar** symbolizes not only access to knowledge but also trust and responsibility within **Caliphate** society.
```

- **Line 108–110**: wrap in `> [!gm]- Secret`, and the GM finishes the cut-off sentence.

### `Found Texts/The Peninsula/On the Salt.md`: line 6, inside the JSON string

Replace only this substring. It has no quotes or backslashes, so the JSON stays valid.

- Now: `The derricks come first. Long before any wall or minaret, you see them: black bones standing in a white sea, leaning the way the wind has asked them to lean for two centuries.`
- Proposed: `The stacks come first. Long before any wall or minaret, you see them: refinery towers and flare stacks, black bones standing up out of the white salt, leaning the way the wind has asked them to lean for two centuries.`

Keep "in a basin the war fused to glass, that Syed the First found the Library". It fits the account as written. Run the sync afterwards so `src/dataLogs.js:475` updates.

### `Items/Currency/Caliphate Dinar.md` and `01_World Details/Economies of the Peninsula.md:27`

Both already match R3. Optional, add after the first sentence: "Also called the **library token**. Each is one of the Grand Library's own pre-war library cards: stamped steel plates, faced by the Stewards with ground trinitite under a hard glaze." This explains how a pre-war card is "trinitite-infused" and why the shipped art is a glazed disc. Fifties stores issued embossed metal charge plates, which is the real-world anchor.[^8] `Economies…md:86` ("quietly buying back Dinars… major political move") belongs in a `> [!gm]-` callout.

### `People/Faiz.md:16`

"to give the Caliphate a presence in the East" → "a presence in the West". Confirm with the GM first, since `SCOPE_DECISIONS.md` repeats "East".

### Real-world names (check 4)

None of the notes reviewed name a real company. Kerteh, Paka and Chukai are generic place names and fine. The real operator, **Petronas** (founded 1974, after the divergence), should stay unnamed. If the refineries ever need a brand, **Poseidon** (Poseidon Energy) is already in play through the seio sign (`ART_DIRECTION.md`); "Petrominas" is the alternative. The Round City of Baghdad (`Round City.md:18`) is a historical homage and needs no change.

---

## (d) Real-world checks

| Claim | Status | Source |
|---|---|---|
| Chukai is the seat of Kemaman District, southern Terengganu, on the South China Sea coast between Kuantan and Kuala Terengganu | Verified | [Kemaman District](https://en.wikipedia.org/wiki/Kemaman_District) |
| Kerteh, about 30 minutes north of Chukai, has Malaysia's first refinery (1983) and an integrated petrochemical complex | Verified | [Kerteh](https://en.wikipedia.org/wiki/Kerteh) |
| Paka has gas processing plants and the decommissioned Sultan Ismail power station. **Paka is in Dungun District, not Kemaman.** | Verified | [Sultan Ismail Power Station](https://en.wikipedia.org/wiki/Sultan_Ismail_Power_Station) |
| The oil is **offshore** (Tapis, Dulang) and piped to the Kerteh terminal. There are no onshore oil fields or derricks, so R2 is also the real-world answer. | Verified | [Kerteh](https://en.wikipedia.org/wiki/Kerteh); [Tapis–Kerteh pipeline](https://www.gem.wiki/Tapis-Kerteh_Oil_Pipeline) |
| Kemaman has the Kemaman Supply Base and Teluk Kalung (steel and chemical works), and Chukai port shipped iron ore | Verified | [shipnext Kemaman port](https://shipnext.com/port/5821fd0a2fb0950f14a74830) |
| The coast is sandy BRIS (beach-ridge) soil: infertile and quick-draining. It gives the bomb "the desert's own sand" before there was a desert. | Verified | [FRIM JTFS](https://jtfs.frim.gov.my/jtfs/article/download/279/197/388) |
| Trinitite is green because of iron in the sand. It is mildly radioactive and does not glow. | Verified | [Trinitite FAQ](https://galactic-stone.com/trinitite-faq/); [sciencenotes](https://sciencenotes.org/trinitite-alamogordo-glass/) |
| Iron-rich local soil explains the green | Inferred from the two rows above | [^9] |
| The Richat Structure is about 40 km across and erosional, not a crater. No real bomb throws up a ring kilometres wide; the wind-banked rim is the in-world explanation. | Verified (Richat); inference (bomb scale) | [Richat Structure](https://en.wikipedia.org/wiki/Richat_Structure) |
| Kemaman floods badly in the north-east monsoon, so the desert is a conceit | Verified | [NST](https://api.nst.com.my/news/nation/2022/12/862695/65-episodes-floods-kelantan-and-terengganu-dec-17-says-did) |
| "Syed" is a hereditary Malaysian title for descendants of the Prophet, not a personal name | Verified | [Sayyid](https://en.wikipedia.org/wiki/Sayyid) |
| "Bandar Bulat" means "round city" and "Pahlawan" means "warrior/hero" | Assumed (standard Malay) | — |
| "Utamakan Keselamatan" is common site signage | Assumed | — |
| Flare stacks are built self-supported, guyed or lattice-supported | Assumed (industry knowledge) | — |

**Sensitivity.** "Syed" as a dynasty's founder's *name* implies a claim of descent from the Prophet in Malaysian ears. That is a NOTE, not a fix; it can be read as the House's own legitimacy claim. Capital punishment for late books is kept by ruling. It works as long as it stays a Steward/bureaucratic gag (an "Overdue division") and is never framed as Islamic law.

---

## (e) Questions for the GM (only where canon can't decide)

1. **Two features, or one?** I propose the Ring at ground zero (empty, holy) plus the Round City in a lesser crater at the edge. The shipped art supports this. If you want the city *inside* the Ring, both location images are wrong.
2. **What was the Library before the war?** Canon says only "buried" and "shelter" (older doc: water, reactor, terminals). Leaving it vague costs nothing until a module needs it.
3. **Faiz: "presence in the East" or "foothold on the West Coast"?** The SCOPE ruling and Faiz.md disagree with the Caliphate note and org-map D16.
4. **"God", "Heaven" or "Tuhan"** for a faith that "does not claim to know the nature" of its higher power?

## Don'ts

- Don't call the Emerald Sea water, and don't give it a shore or tides (R1). The real coastline still exists to the east; keep the two apart.
- No derricks, pumpjacks or "oil fields" (R2). The art prompts already say NOT a derrick.
- Don't light the Library with flame in new text or prompts.
- Don't let shard-gathering become a crafting or economy system. Keep it as one junk item at most.
- Don't name Petronas. Don't reveal the Library's water source or the Dinar buy-back in player-facing text. Don't bring in org-map D16's Ghoul King framing of the Caliphate (that timeline is deprecated).

---

## Footnotes

[^1]: Inference from viewing the shipped images, not from a note: the night shot shows only rock and glass inside the Ring, and the Round City shot shows dunes right up to the outer wall.
[^2]: Inference. The lamps in the shipped interior read as flame-shaped. Electric lamps in old oil-lamp housings reconcile the rule without a reroll.
[^3]: `northern-conflict.md` is older than the vault notes, and its war dates are deprecated. I use it only for physical description the vault doesn't contradict.
[^4]: The dates are proposals, set for the parallel timeline rewrite. Reasoning: the Federation exists from 2150, and the older doc has Federation explorers find the coast before Syed. Three generations (founder, sons, mosque "a generation later") must fit before the 2231 rise. That puts Syed at about 2160 and the current Caliph about four generations on.
[^5]: Inference joining `The Path.md:9` (folly) with `Conditions of Admission` ("You may not remove any original"). No source states this link.
[^6]: The board is my invention, offered as tone. Drop it freely.
[^7]: The lattice shape is from viewing `loc_round_city_interior.jpg`.
[^8]: Invention to satisfy R3 ("card") against the round-disc art. The anchor is the Charga-Plate, an embossed metal charge card used in US stores from the 1930s to the late 1950s ([Credit card, Wikipedia](https://en.wikipedia.org/wiki/Credit_card)).
[^9]: Iron ore was shipped from Chukai port, and trinitite is green from iron, so iron-rich local sand giving green glass is plausible. It is not documented for this site.
