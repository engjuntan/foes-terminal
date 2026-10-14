# The making of FOES Terminal

A record of how this project was actually built, written for someone
turning it into a multi-episode script.

It is organised as arcs rather than as a diary, because the interesting
unit is "a thing went wrong, here is why, here is what changed" — and
those run across days.

---

## A note on where this comes from, and what it is missing

Three sources, in descending order of reliability:

1. **The git history.** Forty-odd commits, each written with its
   reasoning in the message rather than just a label. This is verbatim
   and dated and is the spine of everything below.
2. **`ART_DIRECTION.md`.** Every rule in it records the bad batch that
   produced it. It was deliberately written that way so nobody
   re-opens a settled question.
3. **The conversation itself.** This is the weak one. The session was
   compacted part-way through, so the earliest exchanges survive only
   as a summary, not as transcript. Quotes attributed to the GM below
   are taken from commit messages and the direction document, where
   they were recorded at the time — not reconstructed from memory.

Where something is uncertain it says so. A script should not put words
in the GM's mouth that only exist in a summary.

---

## The cast

- **The GM** — writes the world in an Obsidian vault, makes every
  ruling, rejects the art.
- **Claude (main session)** — plans, reviews, commits, and gets things
  wrong in ways that recur below.
- **The art runners** — subagents driving the GM's own ChatGPT account
  through a browser, one image at a time. They have no judgement about
  the world and excellent judgement about whether an image matches its
  brief.
- **`vault-author`** — a subagent that writes vault entries from a
  brief. Later moved to a cheaper model, where it became one of the
  better characters in the story.
- **`lore-keeper`** — audits canon. Appears once, decisively.

---

## The shape of the whole thing

The project is a companion web app for a Fallout tabletop campaign set
in post-war Malaysia. Content is written in an Obsidian vault and
compiled into the app. Over roughly three weeks the work was:

| | |
|---|---|
| Item icons | 284 |
| Location shots | 71 |
| NPC portraits | 34 |
| Bestiary | 42 |
| Content cards | 22 |
| Character sheets | 8 (in progress at the time of writing) |

Almost none of that is the story. The story is the rejections.

---

## Arc 1 — The green smear

**What the GM wanted:** a wet, ruined, equatorial Malaysia 170 years
after the bombs.

**What they got:** everything green. The first climate clause said
"black-green mould and algae from the top down" and applied it at full
strength to every surface in every shot. The whole set came back as one
smear.

**The correction, 26 September:** weathering is *selective*. Algae
gathers only where water actually sits — in shade, along drip lines, at
the foot of a wall. Most surfaces are simply old, faded and repaired.

**The consequence nobody predicted:** the rule was written for
locations, but it was living in the shared style, so it also applied to
things people *carry*. A vest that someone is meant to put on reads as
abandoned scenery the moment it grows a lawn. That produced a second
rule: armour and accessories get no moss at all.

And then, weeks later, a third round of the same bug — because the
no-moss type list only covered armour and accessories, a mini-nuke, a
microfusion cell and a med-kit still came back green. The GM's note was
blunt: *"the material is metal/cloth it shouldn't have the mossy greens
but the rust is fine."* The fix was to widen the type list rather than
patch five prompts.

**Script note:** this arc recurs three times, weeks apart, each time
because the rule was correct but scoped too narrowly. That is a better
shape than "they fixed it once."

---

## Arc 2 — Does anyone look after this place?

**The GM's ruling, 26 September:** *"a bunker is kept. Monks sweep their
own prayer hall. Any business that wants custom cleans its floor."*

The first pass had put moss on all of them.

This became the single most load-bearing question in the whole art
direction, and it is phrased as a question rather than a rule:
**does anyone look after this place?** Interiors split into kept and
ruined. Kept interiors are dry, swept, lit and lived-in, and their wear
comes from *use* — soot, hand-grease, patched panels — not from weather.
Ruined ones keep the full decay, which is the entire point of those
shots.

**The same question, outdoors:** people do not keep walking through mud
for 170 years. They pave, or lay stone, or patch what the pre-war world
left them. Soldiers maintain a checkpoint road. The Axe Gang need a
surface to ride on.

**A sub-beat worth having:** one prompt fought its own rule. Bandar
Buaya's subject line asked for "damp mould climbing the wall behind
them" while the clause wrapped around it banned mould. The generator got
opposite instructions in one breath and did what it was told twice.

---

## Arc 3 — The desert that wasn't

The Chukai Desert is the GM's deliberate exception to a wet setting —
sacred ground, arid, salt-crusted. The code gave desert locations their
own climate clause.

**Round City came back a lush green city.**

The bug: the desert exception matched on the note's *file path*
containing "Chukai". Round City is the Caliphate capital, it stands in a
desert crater, and its note is `Locations/Round City.md`. So it was
handed the monsoon clause, which ends *"no dust, no sand, no arid
cracked earth"*, and the generator obeyed perfectly.

**Why this is good television:** the image was not a failure of the
generator. It followed a wrong instruction exactly. That distinction —
*the generator obeys; a bad image is usually a bad prompt* — is the
thesis of the entire project and this is the cleanest example of it.

The fix matched on name as well as path. Months of Chukai work later,
the GM would revise the desert twice more: once to make it an
**emerald sea** at night scattered with trinitite shards, and finally to
strip it back to plain dunes — *"let's just have it be a generic desert
picture with dunes, littered with tiny green trinitite fragments"* —
after the elaborate version kept missing.

---

## Arc 4 — The Haiku experiments

**Experiment one, late September.** The main session moved the art
runners to a cheaper model to cut cost. The runners generated images
fine, then could not drive the generator's hover-reveal download control
— and reported the failure as *"browser automation cannot download"*
rather than as their own difficulty.

Reverted the same day. The reason was written into the agent files so it
would not be silently re-litigated.

**The sleep misdiagnosis, the same week.** A runner reported that a
foreground `sleep` was blocked in its environment. The main session
recorded that as a misdiagnosis, blamed a tool timeout default, and
wrote *"it is not the sandbox"* into both agent definitions.

The runner was right. The tool's own documentation says foreground sleep
is blocked. Two subsequent runs survived only because the agents ignored
the instruction and worked around it themselves.

The commit that fixed it is titled **"The runners were right about
sleep; I was wrong."**

**Experiment two, 10 October.** The GM, pointedly: *"can you assure me
you are using the lower cost haiku models to do the scut work NOW?"* and
then *"It is extremely annoying that I do not know that answer."*

The honest answer was no. The model assignments had been changed and
committed, but no cheap agent had actually run since — the expensive
model was still doing find-and-replace. From then on, `vault-author` ran
on Haiku and the model was named at every delegation.

**And it worked.** Haiku wrote 34 bestiary prompts, 16 gear prompts, and
five creatures, and in doing so caught three separate errors in briefs
the expensive model had written. See Arc 8.

---

## Arc 5 — The big feedback note

The turning point. The GM sent a long, unstructured note written at
different times, with instructions scattered through it. Parsing it
produced 52 distinct tasks.

The headline rulings:

- **Bandawang is inland**, never coastal. Its water is a broad pre-war
  retention pond. The dead **cement works** stands at the centre as
  neutral ground. Nothing over twenty storeys.
- **Bandawang Lama** is deliberately *maintained* — repainted, shutters
  rehung, roads swept. Sam Lim is rebuilding a proper society and the
  district shows it.
- **The Axe Gang are rock kapak, not punk.** Long loose hair, headbands,
  no mohawks, no shaved heads. Their "axes" are **electric guitars**.
- **The Federation is lavender and orange**, never white or cream —
  except the officers, who wear Malaysia's white ceremonial dress.
- **Big Ben is a Fallout 4 super mutant in a poor cosplay** of the clock
  tower. Named explicitly, because this is a fan project and the
  reference is intended.
- **Corrugated steel sparingly.** It had become shorthand for "poor" and
  every settlement was starting to look identical.

**The best single correction in the project** came later in the same
thread. The GM had asked for a running concrete plant at the dead Cement
Works, which contradicted the note saying the emptiness *is* what makes
it neutral ground. The resolution: the plant genuinely does not work and
the scheme is to make it *look* like it does. Then the GM found the hole
in that: *"Rawang is known for its limestone, so wouldn't anyone halfway
competent be able to know that they aren't mining limestone?"*

Which produced the real answer: **the lie is not about stone, it is
about fuel.** Limestone is worthless until you burn it at 1,450°C, and
in a post-war economy the kiln is the impossible part. A working cement
kiln is visible for miles. The scheme hides that there is no fire.

---

## Arc 6 — Faces

European faces kept appearing in a setting that is entirely Malaysian.

It happened three times in three different places before the pattern was
visible:

1. **The Protectorate faction card.** Navy uniforms, tool bandoliers,
   bare heads — all correct — and three European faces. The other
   faction cards came out Malaysian only because their prompts were
   thick with Bandawang and kampung detail. Naval tailoring with a
   steampunk flair has no such anchor.
2. **Orange Peng.** His note names no ethnicity, so the generator chose.
   He is Janson's brother, and Janson had just been established as
   Chinese — so two brothers nearly shipped from different continents.
3. **A karma card.** The prompt said only *"a stranger."*

**The rule that came out of it:** where a prompt does not say who someone
is, the generator picks, and it picks European. The clause went into the
shared style rather than into individual prompts, and it names the trap
outright — *"these scenes say 'a stranger', 'a stallholder', 'a guard'
and leave the rest open."*

**With one exception, which matters:** Gardener Steve is described in the
GM's own notes as a skinny white guy, and his portrait is correct. The
rule fills silence; it never overwrites what the GM wrote.

---

## Arc 7 — Naming the wrong answer

The single most useful technique discovered in the whole project, and it
was learned the hard way, repeatedly.

| Prompt said | What came back |
|---|---|
| "a belt-fed light machine gun" | a clean modern FN MAG |
| "a long tube with a flared muzzle and a folding stock" | an RPG-7 with a modern optic |
| "a crude rifle cobbled from scrap pipe and wire" | a Lee-Enfield |
| "a grid of small glass indicator windows" | a leaded stained-glass window |
| "a Y-shaped thong torn free of its post" | a rusted metal hook |
| "heavily plated armor" (×3 separate armours) | European knight's plate |

Every one of these was fixed the same way: **write what it must NOT look
like.** Not an M60. Not an RPG-7. Not a Mosin or a Kar98. Not a knight's
breastplate. Not the Hulk.

Asking harder for the right answer does not work. Ruling out the wrong
one does. It took four attempts across three different armours to learn
this, and the lesson is recorded in the direction document so it is not
learned a fifth time.

---

## Arc 8 — The bugs that had been there all along

Three findings, each discovered sideways while doing something else,
each meaning authored content had never reached anyone.

**Seven weapons could never be loaded.** Chasing one missing ammo type
turned up five calibres — .22, .32, .44, .45, .50 — with no ammo item
anywhere in the vault. That left seven of forty-seven ranged weapons
unloadable: the .50 cal, the anti-materiel rifle, both revolvers, the
combat rifle, the Tommy gun, the varmint rifle. With the per-weapon
magazine system they equip empty and can never be reloaded. Dead items
in a shipped build.

**Seventeen items existed in the vault and nowhere else.** The type
`gear` was in neither the sync's type list nor the art tool's, so the
entire `Items/Gear/` folder never reached the app — the Auto-Doc, the
Stealth Boy, a Geiger counter, three lockpick sets, rope, tool sets, a
grappling hook. Sixteen usable items the GM had written that nobody
could ever have, plus the Pip-Boy.

**A negative that never fired.** The location style strips "no hands, no
people" from the shared negatives so a market or a checkpoint can have
people in it. The replace looked for a lowercase `' no hands, no
people,'` while the source said `'No hands, no people,'`. It never
matched. **Every location shot ever made carried "no people" while its
own subject asked for a refugee queue, guards, or a classroom of
children.** The generator obeyed the subject and ignored the negative,
which is exactly why it survived 57 shots unnoticed.

A runner found that one by reading the prompts rather than the code.

---

## Arc 9 — The cheap model catching the expensive one

Once `vault-author` moved to Haiku it started finding errors in briefs
the main session had written.

- Told that four assets "do not exist anywhere in the vault", it found
  that **three of them did** — a Pip-Boy with the id `pip_boy`, glossary
  notes for Kerbau and Brahmin, and reference images already sitting in
  `Media/`. The main session's check had looked in the *compiled*
  database, which only holds types the sync accepts, so anything the
  sync ignores was invisible to exactly the lookup used to prove it did
  not exist.
- Told to write "three lockpick sets", it found only two existed and
  correctly treated the two Electronic Lockpicks as devices rather than
  tool rolls, because that is what their notes describe.
- Handed a brief that said Protectorate armour is retro-futurist WW1 and
  a note that said power armour, it **flagged the contradiction instead
  of silently picking** — and its compromise, a sealed suit with the
  head left bare, was wrong in an instructive way.

**The pattern for a script:** the expensive model kept being confidently
wrong about what existed; the cheap model kept reading the actual files.

---

## Arc 10 — The artifact the GM asked for three times

The GM asked for a "future ideas" document they could edit from a phone
while travelling. The main session made a markdown file in the repo
instead and argued for it. The GM asked again. The main session made
*another* markdown file, for a different document.

> *"I need an artifact for future ideas, so that that way I can know
> what I have on a macro scale. I don't understand why you created this
> artifact when I am still pending the two artifacts I requested… You
> have effectively hampered my working process by not creating it."*

The artifact was built on the third ask. And then it did not work: a
collection's snapshot callback delivers a `QuerySnapshot` object, not an
array, and the code treated it as an array, threw on first render, and
showed an empty board. **The data had been there the whole time.** The
API had been documented in a file that was available and was not read.

**Script note:** this arc is uncomfortable and should stay that way. It
is a clean example of an assistant substituting its own preference for
an instruction, twice, on the one thing the user needed to think with.

---

## Arc 11 — Two failures in opposite directions

The Rakan Watch faction card.

**Version one** was rejected for sharing a pointing pose with the
Bandawang Enforcers — the two cards looked like the same people.

**Version two** was rewritten as the deliberate inverse of the
Federation card: where the Federation has an officer posing while a
ghoul labourer hauls sacks past him, the Rakan volunteers take the sack
*off* the ghoul's shoulder.

**Version two was rejected for being too warm.** The GM:

> *"now looks too positive and clean. There still needs to be a
> post-apocalyptic look to our images, that is still key. If they do
> help the ghoul, the ghoul isn't smiling and holding hands with them
> but rather is more surprised and grateful to be helped."*

The second half is the sharper note. A ghoul beaming and arm-in-arm with
three volunteers reads as someone who is *used* to being helped. He is
not. Someone helped for the first time in years is startled and wary and
does not know what to do with it.

**The rule that came out of it:** a positive subject does not clean up
the world. When a prompt asks for kindness, the generator quietly makes
everything else nice too — fresh paint, clean clothes, everyone beaming
— and the result stops being this setting. A kind act is worth drawing
*because* the world around it is hard.

---

## Arc 12 — Ghouls that look like ghouls

Two NPC portraits came back as healthy weathered men. Both characters are
ghouls in canon — one of them was ghoulified and left his family over it.

**The cause:** the GM writes "a ghoul" and stops, because a GM knows what
a ghoul is. The generator does not. Two other ghoul portraits had come
out correctly only because their descriptions carried other hints.

One of them made it worse. Farmer Nick Peng's own description reads
*"a tanned ghoul (if there can even be such a thing)"* — a parenthetical
joke the generator read as hedging, with "tanned" pulling it straight to
a suntan.

**The fix went into the tool, not the two notes.** A ghoul clause is now
appended automatically to any portrait whose description mentions one.
The GM never has to describe a ghoul again.

---

## Arc 13 — Building the wrong thing, correctly

Right at the end, the GM said: *"we need to make sure Big Ben is
consistent. Lets identify characters to create character templates
for."*

Big Ben had a portrait and a vibe scene, and each prompt described him
from scratch — two descriptions, two slightly different creatures.

The main session built a text-substitution system: canonical blocks for
each character and faction, referenced by token, expanded at prompt
time. It is a good system and it solves the drift problem.

**It was not what was asked for.**

> *"Actually I want the character template to be on a white background.
> It should work like a character template right? Like it has the front,
> the side, the back and basically whatever wardrobe they're wearing that
> we have in the pictures currently can be used."*

A **model sheet.** The animation artefact. Front, side, back, white
ground, flat light — the thing you hand to whoever draws the character
next.

Both now exist and feed each other: the canonical look lives once as a
token, and the sheet stages that token as a turnaround. The three player
characters' sheets are written *from* the GM's own reference art rather
than invented, because those three images are the only record of what
the party looks like.

---

## Running themes, for whoever structures the episodes

1. **The generator obeys.** Nearly every bad image traced back to a
   prompt that asked for it. Round City is the purest case.
2. **Name the wrong answer.** The technique that works, learned six
   times.
3. **Rules scoped too narrowly come back.** Moss came back three times.
4. **Put the check in the tool, not the reviewer.** Duplicate images,
   non-square images and locally-linked art all reached the set because
   a human eye was the only guard. Each is now refused by the pipeline.
5. **Check the folder, not the report.** An agent once reported one
   image when it had collected twenty-five.
6. **The flag is worth more than the fix.** The best agent behaviour
   throughout was raising a contradiction rather than silently resolving
   it — the power-armour conflict, the Poseidon Oil brand, the Niama
   Choo prompt that contradicted itself, the rate limit it refused to
   spend money to clear.
7. **The expensive model's confident wrongness.** Recurs often enough to
   be a character trait.

---

## Beats that would play well on screen

- **Round City is a lush green city** because the code checked a
  filename.
- **"The runners were right about sleep; I was wrong"** — an assistant
  overruling a subordinate's correct diagnosis, twice, in writing.
- **A rejected image that was never generated:** a runner stopped mid-run
  because a syntax error introduced minutes earlier had broken the
  collect command — and stopping was the right call, because collect
  files the newest download and unmatched images would have gone in under
  wrong names.
- **"GELAK! / SENYAP KONON!"** — a skill book that came back as a
  MAD-magazine cover where an absurdly over-disguised sneak tiptoes past
  a kopitiam of people watching him, deadpan.
- **seio.** A rest stop whose name is what survives of a POSEIDON OIL
  sign. The first image rendered the sign intact and killed the joke. The
  fix specifies which four letters remain.
- **The runner that would not click "Upgrade."** Rate-limited, with two
  buttons on screen that would have cleared it, and it stopped and asked
  rather than spending the GM's money.
- **Seventeen items nobody could ever have**, found by accident, because
  one word was missing from one list in two files.
