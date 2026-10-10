# Lore review: the Pahlawan note (REVIEW mode)

**Target:** `02_Factions/The Caliphate/Pahlawan.md` (rewritten, 30 lines) and the changed sentence at `02_Factions/The Caliphate/The Caliphate.md:45`. I also assessed `The Caliphate.md:104` because the brief asked.
**Checked against:** `The Caliphate.md`, `Religions/The Path.md`, `Bestiary/Pahlawan.md`, `People/Faiz.md`, `Locations/🏜️Chukai Desert.md:28`, `reference/org-map.md` (D13, D16, K79), `SCOPE_DECISIONS.md` (~783, ~954, ~973, 1044–1068), `reviews/chukai-caliphate-direction.md`, `FOES Visual Standard Bible.md` §7.4, §8.4 and the prompt kit (~l.379), and `CONVERSATION_HISTORY` (grep only).

**Count:** 1 BLOCK · 9 CHECK · 8 NOTE

---

## 1. The GM's seven points: are they intact?

| # | GM point | Where | Verdict |
|---|---|---|---|
| 1 | Unaggressive, likes helping; Pahlawan are quick defenders against the Great Jungle's monsters | l.8 | **Present, slightly bent.** "the quick defenders *it sends*" makes the Caliphate a dispatcher, which leans toward the command structure point 4 rules out.[^1] One-word fix below (C2). |
| 2 | No rank; only new and veteran Pahlawan; titles undecided | l.8 ("There are no ranks among them. There are simply new Pahlawan and veteran Pahlawan.") | **Intact.** No title is invented, and lowercase "new/veteran" correctly stays descriptive. |
| 3 | Not an organised army; dogmatic ideologues who become upstanding, valuable members of their home town or village | l.18 | **Intact**, almost verbatim. It does sit in tension with The Path (C5). |
| 4 | Disparate confederacy of towns seeking protection; no standing army for fear of warlords; Pahlawan are the next best thing, essentially an elite militia | l.20 | **Intact**, almost verbatim. Line 14 strains it (C1). |
| 5 | Very loyal to their hometown (kampong) | l.24 | **Intact.** The spelling is a GM call (C6). |
| 6 | Of the people, so skilled infiltrators; rarely seen in the Peninsula Wastes; recognising one probably means they wanted to be seen | l.28 | **Intact**, almost verbatim. |
| 7 | Usually in civilian clothes; war gear is individual, each protects themselves differently | l.30 | **Intact, plus an overreach.** The added "no uniform to tell them apart from the crowd" goes further than the GM did (C3). |

All seven points survive. The fixes below touch only the writer's additions.

---

## 2. Findings

| Severity | Entry | Issue | Why (source) | Suggested fix |
|---|---|---|---|---|
| **BLOCK** | `The Caliphate.md:104` | Plain player-facing text states (a) the Caliphate "quietly wants a foothold on the West Coast", with Faiz as the means, and (b) "an interest in pre-war US military caches rumoured to survive on the Peninsula". (b) points straight at the heist's real prize. | (a) org-map D16 gives this as the Caliphate's *genuine* motive behind a public policy of avoiding confrontation. The same note calls the Caliphate "non-expansionist" (l.31) and "neutral… without… territorial expansion" (l.59), so l.104 exposes the hidden layer.[^2] `Faiz.md:16` keeps Faiz's errand inside a `[!gm]-` callout, and l.104 leaks it. (b) The caches are the Ghoul King's target (`SCOPE_DECISIONS.md` heist brief, ~l.950). The ruling of 2026-09-23 (~l.973) says Faiz *doesn't know* the data is a cache map. That ruling supersedes D13, the only place that gives the Caliphate this interest. | Move both clauses into a `> [!gm]- Secret — the West Coast` callout, and leave only the Education Center sentence in the open. For (b), either cut it or keep it in the callout with a note that it rests on superseded D13. Wording is in §3. East vs West is still the open question logged at `SCOPE_DECISIONS.md` ~l.1067. |
| CHECK | `Pahlawan.md:14` | "A Pahlawan's journey must be sanctioned by the Syed family. Many are sent… with an additional directive." Central sanction and central tasking sit uneasily with a confederacy that refuses an army for fear of warlords (point 4), and with loyalty to the hometown rather than the capital (point 5). | The brainstorm supports a light central role: "not a standing army in the traditional sense but can usually be called to serve the defensive needs of the Caliphate" (`CONVERSATION_HISTORY/Fallout Eastern Shores Request.md:1188`, discussed, not canon). `The Caliphate.md:57` says the House rules "through moral and spiritual authority than direct political power", but l.80 gives the Caliph "ultimate authority". D16 has the Caliphate *sending* Faiz. | GM question (Q1). If the sanction is a religious blessing and not an order, this reconciles cleanly: "sanctioned" → "blessed". Either way, change "the Syed family" → "the House of Syed" to match l.12 and the GM's "ruling house" wording (brainstorm l.1188). |
| CHECK | `Pahlawan.md:8` | "the quick defenders **it sends** against the monsters" | The GM said "quick defenders". "It sends" adds a chain of command.[^1] | "Its Pahlawan are its quick defenders against the monsters of the [[Great Jungle]]…" |
| CHECK | `Pahlawan.md:30` (writer's invention) | "…and there is no uniform to tell them apart from the crowd" | Point 6 says a Pahlawan *can* be recognised when they want to be, so something does mark one out. Org-map K79 (GM's text) and `Faiz.md:11` give Faiz "modern Pahlawan gear". "Usually civilian clothes" (point 7) is not the same as "never identifiable". | **Cut.** End the paragraph at "protect themselves differently." |
| CHECK | `Pahlawan.md:24` (writer's invention, 2nd sentence) | "What a Pahlawan brings back from the road is the point of sending them." | It restates point 3 and adds "sending", the same command implication as C2. It also overrules l.12, which makes the journey's point purpose and service, not the return. | **Keep** "The journey is meant to end there." (well supported by point 3).[^3] **Cut** the second sentence. |
| CHECK | `Pahlawan.md:18` vs `The Path.md:11` | The GM calls Pahlawan "dogmatic ideologues", but The Path "rejects the rigid, dogmatic structure of traditional religions". | Both are canon text. One reading resolves it: they *set out* dogmatic and the journey tempers them, which is what "through their journey, become upstanding…" implies.[^4] | GM question (Q2). Don't change the GM's words without an answer. |
| CHECK | `Pahlawan.md:24` | "_kampong_": the vault has 5 files with *kampong* and 30 with *kampung*. | *Kampung* is standard in Malaysia; *kampong* is the older spelling, still official in Singapore (verified, below). The GM himself writes "kampong" (org-map ~l.492, ~l.804, and his brief). A world frozen in 1957 plausibly never had the 1972 spelling reform, so *kampong* is defensible as period spelling.[^5] | GM question (Q3): pick one house spelling. The vault currently leans *kampung*. |
| CHECK | `Pahlawan.md:4` (tooltip) | At 41 words it is too long for a hover. "and the wastes" goes beyond the GM, who named only the Great Jungle. "Wear no uniform" carries the C3 overreach into the most-read line. | Point 1. "The wastes" can be defended from `The Caliphate.md:31` ("raiders, mutants, and other existential threats"), but it isn't needed. | Proposed (21 words): "**Pahlawan** are the Caliphate's elite militia, not an army: pilgrims on a personal _Hajj_ who defend its towns from the Great Jungle." |
| CHECK | `The Caliphate.md:36` and frontmatter tag `Nomadic` | "nomadic desert dwellers" | Points 4 and 5 describe a confederacy of *towns* whose Pahlawan are loyal to a *hometown*. "Nomadic" comes from an older brainstorm (`Fallout Eastern Shores Request.md:1062`, discussed, not canon). | Propose "desert townsfolk" or "people of the desert towns", and drop the `Nomadic` tag. This is a later pass; the brief only changed l.45. |
| CHECK | `FOES Visual Standard Bible.md` §7.4 and the Pahlawan prompt (~l.379) | It sets one shared look ("scholar's robe over practical travel gear", a bandolier satchel), which amounts to a uniform. Point 7 now says civilian clothes and individual gear. | The Bible is older than the GM's seven points, and anything after the Organization Map counts as fresher canon. The Bible's "no unit insignia, no rank" still fits. | Reframe the prompt as "a Pahlawan *choosing to be seen as one*" (which fits point 6), with gear varying per person. The GM edits the Bible; I don't. |
| NOTE | `Pahlawan.md:8` (writer's invention) | "the same people are the ones who turn up, unasked, to help a community in trouble" | Supported by point 1, The Path's Charity pillar (`The Path.md:25–27`), l.14 ("aid communities in crisis"), and the Chukai precedent: a Pahlawan "will explain this to him, once, kindly" (`Chukai Desert.md:28`). | **Keep**, but drop "unasked". Turning up uninvited in other factions' towns cuts against "avoids overt confrontation" (D16). |
| NOTE | `Pahlawan.md:28` (writer's invention) | "[[Faiz]] is one such rare sight in Bandawang." | Consistent with `Faiz.md:5` and org-map K79 ("quite a rare sight outside Caliphate territory"). With point 6 it hints that Faiz *chooses* to be seen, which fits D13: he openly tells the PCs about his duty as a Pahlawan. It hints, it doesn't reveal, and his errand stays in the GM callout. | **Keep.** |
| NOTE | `Pahlawan.md:2` alias `Pahlawans` | Malay has no -s plural. It reduplicates (*pahlawan-pahlawan*) or uses *para* (verified, below), so an invariant "Pahlawan" in the body is the more Malay-flavoured English. | The GM writes "Pahlawans" himself (`SCOPE_DECISIONS.md:783`, brainstorm l.1188, org-map K79 "Pahlawan's"), and so does the Visual Bible. | **Keep both**: the invariant plural in prose, and the alias so the GM's own "Pahlawans" still gets a tooltip. |
| NOTE | `The Caliphate.md:45` | The new sentence is faithful to points 1, 3 and 4. The next sentence's "Their beliefs…" now reads as the Pahlawan's beliefs, not the Caliphate's. | — | Optional: "The Caliphate's beliefs are reinforced by communal living…" |
| NOTE | `Bestiary/Pahlawan.md:1,10` | "sent out under the House of Syed" carries the same question as C1. There is one stat tier, with no new/veteran split. | Consistent with SCOPE ~l.783 (T1 elite). | Follow the answer to Q1. A "veteran" variant could come later, without inventing a title. |
| NOTE | `Pahlawan.md:12,14` | "_Hajj_" for a non-Islamic pilgrimage. | Already established (`The Path.md:33–35`), and the sensitivity of "Syed" was noted in `chukai-caliphate-direction.md` ~l.172. | None. |
| NOTE | `Pahlawan.md:6` heading emoji 🔱 | The trident reads as a trishula (Shiva's emblem), an odd mark for a Path-derived faction. Sibling notes use 🛡️. | `The Caliphate.md:18`, `The Path.md:6` | Swap to 🛡️ (optional). |
| NOTE | Whole note | The tone is entirely earnest, though the GM wants the dark comedy actively. The one wry beat (point 6) is the GM's own. | The Chukai sack line shows the register works for Pahlawan. | Optional, and the GM's call. The obvious irony is that the Malay word for a war chief, *hulubalang*, translates as "warlord" (below), the very thing the Caliphate fears. Don't add it without the GM. |

**CLEAN:** `Pahlawan.md` l.12 (The Journey ¶1), l.18 (apart from the C5 question), l.20 (point 4); the "no titles invented" check across the note.

---

## 3. Line edits

| File:line | Before | After |
|---|---|---|
| `Pahlawan.md:4` | **Pahlawan** are the Caliphate's elite militia, pilgrims on a personal _Hajj_ who defend its towns and villages from the Great Jungle and the wastes, and who are not an army, have no rank and wear no uniform. | **Pahlawan** are the Caliphate's elite militia, not an army: pilgrims on a personal _Hajj_ who defend its towns from the Great Jungle. |
| `Pahlawan.md:8` | Its Pahlawan are the quick defenders it sends against the monsters of the [[Great Jungle]], and the same people are the ones who turn up, unasked, to help a community in trouble. | Its Pahlawan are its quick defenders against the monsters of the [[Great Jungle]], and the same people are the ones who turn up to help a community in trouble. |
| `Pahlawan.md:14` | A Pahlawan's journey must be sanctioned by the Syed family. | A Pahlawan's journey must be sanctioned by the House of Syed. *(If Q1 says blessing, not order: "…must be blessed by the House of Syed.")* |
| `Pahlawan.md:24` | Pahlawan are very loyal to their hometown, their _kampong_. The journey is meant to end there. What a Pahlawan brings back from the road is the point of sending them. | Pahlawan are very loyal to their hometown, their _kampong_ *(or _kampung_, per Q3)*. The journey is meant to end there. |
| `Pahlawan.md:30` | …They are distinct from one another and protect themselves differently, and there is no uniform to tell them apart from the crowd. | …They are distinct from one another and protect themselves differently. |
| `Pahlawan.md:6` (optional) | `## 🔱 Overview` | `## 🛡️ Overview` |
| `The Caliphate.md:45–46` (optional) | Their beliefs are reinforced by communal living… | The Caliphate's beliefs are reinforced by communal living… |
| `The Caliphate.md:104` | The Caliphate quietly wants a foothold on the West Coast, though it avoids overt confrontation to get one — a Pahlawan operating well outside Caliphate lands, such as **Faiz**, is how that interest reaches this far. The Caliphate also keeps an interest in pre-war US military caches rumoured to survive on the Peninsula. In Bandawang, its Education Center sells library terminal access for a single Caliphate Dinar. | In Bandawang, the Caliphate's Education Center sells library terminal access for a single Caliphate Dinar.<br><br>`> [!gm]- Secret — the West Coast`<br>`> The Caliphate genuinely wants a foothold on the West Coast, but its policy of avoiding confrontation rules out any overt move (org-map D16). A Pahlawan operating well outside Caliphate lands, such as **Faiz**, is how that interest reaches Bandawang. (Open: Faiz.md says "a presence in the East".)`<br>`> [Cache sentence: cut, or keep here marked "rests on D13, superseded 2026-09-23".]` |

---

## 4. Title research: the candidates for new and veteran Pahlawan

The note rightly invents none. This is input for the GM's choice only.

| Term | Real meaning | Implies command? | Religious honorific? | Fit with "no rank, no warlords" |
|---|---|---|---|---|
| **Pahlawan** (itself) | "Hero, paladin", from Persian *pahlavân*. In Malaysia, *Hari Pahlawan* (Warriors' Day, 31 July) honours the armed forces and police. | No | No | Good. There is a mild irony: the real-world word honours state soldiers. |
| **Pahlawan Muda** | Literally "young hero" (*muda* = young). | No | No | Best fit for "new": purely descriptive. |
| **Musafir** | Arabic "traveller". In Islamic jurisprudence a *legal status* that carries concessions (shortened prayer, exemption from fasting) beyond about 81 km. | No | **Yes**, a fiqh term, not an honorific | Fits "on the road". It pairs with The Path's adapted pillars (fasting!), but it brings real Islamic legal meaning with it. |
| **Pendekar** | A warrior who has mastered silat. The title is bestowed by royalty or by common folk, and is the highest rank in silat. | No command, but **is** an earned rank | No | A natural "veteran" honour, given by the people, which suits point 6. Watch "no rank": it is an honour, not a post. |
| **Panglima** | "Commander; warlord, general". Still used for top military commanders today. | **Yes** | No | **Poor**: it is a command title, against point 2. |
| **Hulubalang** | Military nobility of the Malay kingdoms, "roughly translated as 'warlord', 'commander', 'general' or simply 'warrior'". The Hulubalang Besar commanded others; Aceh's *ulèebalang* were "a new nobility of warlords" granted districts. | **Yes**, plus nobility | No | **Worst**: literally the warlord the Caliphate fears. Usable only as a joke or as what the confederacy forbids. |
| **Haji** | The real Muslim honorific for one who has completed the Hajj to Mecca (Hj./Hjh.). | No | **Yes**, a live honorific | **Sensitivity CHECK.** Using a real Islamic title for a fictional agnostic faith's "Hajj" is a step beyond borrowing the word. It is also common enough ("Pak Haji") that it would read as everyday Malaysian, not Path-specific. |

---

## 5. Research: verified and assumed

| Claim | Status | Source |
|---|---|---|
| *Pahlawan* = hero/paladin; Malay from Persian *pahlavân* | Verified | [Wiktionary: pahlawan](https://www.wiktionary.com/wiki/pahlawan) |
| Hari Pahlawan (Warriors' Day) on 31 July honours Malaysia's security forces | Verified | [Malay Mail, 2025](https://www.malaymail.com/amp/news/malaysia/2025/07/31/pm-malaysia-pays-tribute-to-fallen-heroes-ahead-of-warriors-day/185864); [National Monument (Malaysia)](https://en.wikipedia.org/wiki/National_Monument_(Malaysia)) |
| Hulubalang = military nobility, "warlord/commander/general/warrior"; Hulubalang Besar commanded others; Aceh's *ulèebalang* = warlord nobility | Verified | [Wikipedia: Hulubalang](https://en.wikipedia.org/wiki/Hulubalang) |
| Panglima = commander; "warlord, general"; used for modern armed-forces commanders | Verified | [Wiktionary: panglima](https://en.wiktionary.org/wiki/panglima) |
| Pendekar = silat master; bestowed by royalty or common folk; highest silat rank | Verified | [Wikipedia: Pendekar](https://en.wikipedia.org/wiki/Pendekar) |
| Musafir = traveller; a fiqh status with concessions; ~81 km threshold | Verified | [Mufti WP, Al-Kafi #255](https://muftiwp.gov.my/en/artikel/al-kafi-li-al-fatawi/1364-al-kafi-255-the-meaning-of-musafir-muqim-and-mastautin-for-jamak-and-qasar); [ThePilgrim: Musafir](https://thepilgrim.co/musafir/) |
| Haji/Hajah = Malay honorific for those who completed the Hajj, abbreviated Hj./Hjh. | Verified | [Wikipedia: Hajji](https://en.wikipedia.com/wiki/Haji) |
| *Kampung* is standard in Malaysia and Indonesia; *kampong* is the older spelling, kept in Singapore, interchangeable in Brunei | Verified | [Wikipedia: Kampung](https://en.wikipedia.org/wiki/Kampung) |
| Malaysia's 1972 spelling reform (Ejaan Rumi Bersama) replaced the Za'aba spelling | Verified | [1972 orthography reform](https://en.wikipedia.org/wiki/Indonesian%E2%80%93Malaysian_orthography_reform_of_1972) |
| Malay marks the plural by reduplication (*buku-buku*), not a suffix | Verified | [Malay grammar](https://en.wikipedia.org/wiki/Malay_grammar) |
| *Pahlawan Muda* is a plain compound, not a real formal title | Assumed (standard Malay; not searched) | — |
| *Para* as a plural marker for people (*para pahlawan*) | Assumed (standard Malay; the search didn't confirm it) | — |

---

## 6. Open questions for the GM (only where canon can't decide)

1. **Who sends a Pahlawan?** Does the House of Syed *order* the journey (a central directive, as D16 implies for Faiz) or *bless* one the hometown starts? The first strains "no army, fear of warlords"; the second fits it. (C1; also decides the Bestiary wording.)
2. **"Dogmatic" vs The Path's anti-dogmatism.** Do Pahlawan set out dogmatic and come home tempered? If so, l.18 could say "set out as dogmatic ideologues" with your approval. (C5)
3. **Kampong or kampung** as the house spelling? You write *kampong*; the vault mostly says *kampung*. (C6)
4. **What makes a Pahlawan recognisable when they want to be?** Faiz has "modern Pahlawan gear", so something identifies them. Is it a kit, a token, a manner? This also decides how the Visual Bible prompt should change. (C3, Visual Bible)
5. **Is the West Coast foothold public or secret?** And is it West (Caliphate note, D16) or East (Faiz note, SCOPE ~l.954)? The second half is already logged as open. (BLOCK)

---

[^1]: Inference. "Sends" names an agent who dispatches. Point 4's whole logic is that no central body commands the fighters. The GM's own phrase ("quick defenders") has no dispatcher in it.
[^2]: Inference. D16 pairs "genuinely wants a foothold" with "their policy of avoiding confrontation prevents them from making any overt threat". I read "genuinely" as marking a real motive behind a neutral public face. It sits in the GM's "Without PC intervention…" plot section, which is GM-side material.
[^3]: Inference. "Become upstanding and valuable members of the town or village they originated from" implies a return home.
[^4]: Inference. "Through their journey, become…" describes a change. The GM may simply mean they stay dogmatic; hence the question.
[^5]: Inference. The setting freezes its factory-made look at 1957 (Visual Standard Bible, time rule). The Za'aba spelling was current in 1957 Malaya, but whether the pre-War world went through the 1972 reform is not stated anywhere in the vault.
