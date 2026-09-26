# FOES art direction

The rules every generated image obeys, and why each one exists. These are
enforced in code — `tools/item-art.mjs` holds the shared style strings,
`tools/art-locations.mjs` holds the per-location classifications. Change
the rule here and in the constant together, or they drift.

Most of these were written after a bad batch. The reason is recorded with
each one so nobody re-opens a settled question.

---

## The shared formula

Every prompt is `register + grade + climate + negatives + subject`. The
subject lives with the thing it describes (an item's vault note, a slot in
`art-slots.mjs`, a shot in `art-locations.mjs`); everything before it is
shared, so the whole set holds one look.

**Register** — items are *object plates*: the thing centred, sharp,
filling the frame, one soft key light, setting thrown out of focus.
Locations and cards are *35mm film stills*.

**Grade** — Monsoon Gold: blown-out near-white hazy sky light, hot golden
key, cyan-green bounced shadows, heavy humid air.

**Format** — 1:1 square, always. `collect` refuses anything off-square by
more than 2%, because Gemini silently returns 1408×768 when a subject
sounds landscape (a road, a railway, a skyline) no matter what the prompt
says. Set the generator's own aspect control rather than arguing with it.

---

## Weathering

**Weathering is selective, not total.** Rust runs in streaks, surfaces are
sun-bleached and water-darkened, laterite stains what it touches — but
algae and moss gather *only where water actually sits*: in shade, along
drip lines, at the foot of a wall. Most surfaces are simply old, faded and
repaired.

> Why: the first pass applied "black-green mould and algae from the top
> down" at full strength to every surface in every shot, and the set came
> back as one green smear. Toned down 26 Sep.

**Armor and accessories get no moss at all.** Worn kit keeps rust, salt
and sweat staining, scuffs, and laterite worked into the seams — moss,
algae, lichen and mould are banned outright.

> Why: a vest someone is meant to put on reads as abandoned scenery the
> moment it grows a lawn.

**Interiors people use are not weathered.** See below.

---

## Interiors: upkeep beats climate

Interiors declare whether anyone looks after them. `KEPT_INTERIORS` in
`art-locations.mjs` lists the 23 that are inhabited, staffed or in daily
use; the other 11 are ruins.

**Kept interiors** are dry, sheltered, swept, lit and lived-in. Wear comes
from *use*, not weather: scuffed and polished-smooth surfaces, soot and
cooking smoke, oil and hand-grease on what gets touched, mismatched
repairs, patched panels, salvaged parts pressed into service. Moss, algae,
lichen, mould, water staining, indoor plant growth, rain and standing
water are all banned.

**Ruined interiors** keep the full decay clause. That's the point of those
shots — the gutted Abave casino, the structure the Great Jungle swallowed,
the collapsed cells under Kelam Sungai.

Upkeep wins over climate: a swept room is swept whether it stands in the
monsoon belt or the Chukai Desert.

> Why: a bunker is kept. Monks sweep their own prayer hall. Any business
> that wants custom cleans its floor. The first pass put moss on all of
> them. GM ruling, 26 Sep.

**A prompt must not fight its own clause.** Bandar Buaya's subject line
asked for "damp mould climbing the wall behind them" while the clause
wrapped around it banned mould — the generator got opposite instructions
in one breath. Sweep subject lines for decay words when moving a location
into `KEPT_INTERIORS`.

---

## Ground: paved, not mud

A location standing on pre-war ground, or held by anyone who maintains it,
gets a **made surface**: cracked and patched asphalt, worn concrete, laid
cobbles or brick, weeds through the joints, potholes crudely filled,
kerbs still visible under the dirt. Bad condition, yes. Mud, no.
`PAVED_LOCATIONS` in `art-locations.mjs` lists them.

> Why: people do not keep walking through mud for 170 years. They pave,
> or lay stone, or patch what the pre-war world already left them.
> Soldiers maintain a checkpoint road. The Axe Gang need a surface to ride
> on. GM ruling, 26 Sep.

This is the exterior half of the interiors rule. The question is always
the same: *does anyone look after this place?*

---

## Materials and props

**Retro-futurist, in the Fallout manner.** Vehicles, appliances and
machinery are bulbous 1950s American styling — chrome, tail fins, atomic
curves. Never anything resembling a modern car or modern electronics. A
car husk at Sekitar Litar is a Fallout car husk.

**Corrugated metal sheet is used sparingly** — as patches and lean-tos,
never as the main material of a building.

> Why: the first pass reached for corrugated steel as a shorthand for
> "poor", and the settlements started to look identical.

---

## Text

Text is **correct** on anything that is itself a written or labelled
thing: a document, book, note, map, poster, sign, or a product with a
printed label. A Buffout bottle without "Buffout" on it is just a jar, and
a field diary without writing cannot be drawn at all.

Text is a **failure** as a caption, watermark or signature, as stray
glyphs on an object that isn't a written thing, and when the generator
renders a template placeholder literally — one betting board came back
reading `FIGHT 1: (Name) vs (Name)`.

> Why: the rule was blanket "no text" and fought the prompts themselves,
> which asked for "faded red lettering spelling JET" and "a label reading
> Cap Kilat Cola". Corrected 25 Sep, then again for documents.

**No faction logos, insignia, emblems or crests** on item plates.

---

## Climate exceptions

**The Chukai Desert** and everything standing in it takes the desert
clause — storm-scoured, salt-crusted, wind-polished, heat haze, dry not
tropical. `DESERT_LOCATIONS` matches on name as well as note path.

> Why: it matched on the note's *file path* containing "Chukai", which
> missed Round City — the Caliphate capital stands in a desert crater but
> its note is `Locations/Round City.md`, so it was handed the monsoon
> clause ending "no dust, no sand, no arid cracked earth". The generator
> obeyed and produced a lush green city. Fixed 26 Sep.

---

## Working practice

**Review before linking.** Agents have reported one image when they had
collected twenty-five, and have diagnosed their own failures wrongly
(calling a model limitation a platform limitation). Check the folder, not
the report.

**Put the check in the tool, not the reviewer.** Three defects reached
the app because a human eye was the only guard: duplicate images filed
under the wrong id, locally-linked art counting as unmade, and wide
images. Each is now refused by `collect` or `ingest`.

**Where images ship.** `public/art/` holds item icons and cards;
`public/art/locations/` holds location shots. Item icons are capped at
512px (they render at 24–40px), cards and locations at 1000px, written as
JPEG when there's no alpha.

**Aiming a batch at one place.** `queue --match <text>` narrows to assets
whose id *or note path* contains the text, so
`--only locations --match bandawang` gives the whole city — including the
places named for themselves (the Tortoise Palace, the Scrapyard) that
only the `Locations/Bandawang/` folder identifies. Work location by
location; the raw list order is meaningless.

**Cost.** Driving a browser costs roughly 18,700 tokens per image on
Gemini and ~31,000 on ChatGPT, almost all of it polling. Runners sleep
through the full expected generation time and look once. The API path
(`npm run art -- generate`) is about $0.03 an image with no browser at
all.
