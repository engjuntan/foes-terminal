// tools/art-slots.mjs — art slots that aren't vault items.
//
// Items keep their prompts in the vault. These live in hand-written source
// modules (`src/reputationContent.js`, `src/goatContent.js`) as `image_url: ""`
// fields, so the prompts live here beside them. `npm run art` treats both the
// same: sheet → generate/draw → ingest → the url is written back.
//
// Each group has its own STYLE, because a reputation card is a scene and a
// SPECIAL card is an emblem — neither is an item on a dark background.

// Cards are scenes, not objects, so they take the Bible's "scene
// photograph" register instead of the object plate — same grade, same
// climate, same negatives, same square format.
const CARD_STYLE = 'Photorealistic photograph, 1:1 square, 1080x1080, 35mm film still, natural light, shallow depth of field, fine grain. Monsoon Gold grade: blown-out near-white hazy sky light, hot golden key light, cyan-green bounced shadows, heavy humid air. Equatorial Malaya after 170 years of rain: black-green mould and algae staining from the top down, rust weeping in dark streaks, damp surfaces, red laterite mud, jungle reclaiming every structure. No dust, no sand, no arid cracked earth. No text, no lettering, no watermark, no modern plastics, no Bethesda marks. People appear ONLY where the subject names them — and every person the subject names IS MALAYSIAN, Malay, Chinese or Indian, never a white or European face. These scenes say "a stranger", "a stallholder", "a guard" and leave the rest open; the answer is always someone from this peninsula.';

// Faction cards are group portraits, and the GM's note after the first
// pass was that the wet-ruin background was fighting the figures. So
// this style keeps the grade but spends the frame on the people: the
// setting is named, thrown well out of focus, and kept quiet.
const FACTION_STYLE = 'Photorealistic photograph, 1:1 square, 1080x1080, 35mm film still, natural light, shallow depth of field, fine grain. Monsoon Gold grade: hazy near-white sky light, hot golden key light, cyan-green bounced shadows, humid equatorial air. Three figures together, full length, clearly separated, in dynamic poses with expressive faces, caught mid-moment rather than lined up for a portrait. EVERY FACE IS MALAYSIAN — Malay, Chinese or Indian, and ideally a mix across the three figures. NO WHITE OR EUROPEAN FACES, whatever the uniform looks like. This holds for the Protectorate and the Caliphate just as much as for anyone else, whatever their tailoring. THE FIGURES ARE THE SUBJECT: sharply lit and in focus, filling most of the frame, their clothing and colours reading instantly. The setting is simple and thrown well out of focus behind them: enough to say where they are, never enough to compete. Keep the background uncluttered and restrained. Weathering and jungle overgrowth stay in the soft background only, never on the figures or across the frame. Malaya 170 years after the bombs, but legible before it is ruined. No text, no lettering, no watermark, no modern plastics, no Bethesda marks.';

export const SLOT_GROUPS = {
  rep: {
    label: 'Reputation tier',
    file: 'src/reputationContent.js',
    anchor: id => new RegExp(`id:\\s*["']${id}["']`),
    style: CARD_STYLE,
    slots: {
      idolized: 'A shopfront shutter in a wasteland market painted with a crude, affectionate mural of a wanderer, flowers and scrap offerings left on the step beneath it.',
      liked: 'A market stallholder leaning out over her counter with both hands raised in welcome, a cup of tea already poured for a guest who has not sat down yet.',
      accepted: 'A guard at a settlement gate waving someone through without looking up from his newspaper, the barrier already half-lifted.',
      neutral: 'A crowded settlement street seen from the back, every face turned away, nobody paying any attention to the figure walking into it.',
      hated: 'A hand-lettered wooden sign nailed over a doorway, a crossed-out silhouette painted on it, and the door behind it barred with scrap timber.',
      vilified: 'A wanted poster of a faceless silhouette nailed to a post, riddled with bullet holes, with knives driven through it at the corners.'
    }
  },
  karma: {
    label: 'Karma tier',
    file: 'src/reputationContent.js',
    anchor: id => new RegExp(`id:\\s*["']${id}["']`),
    style: CARD_STYLE,
    slots: {
      guardian_angel: 'A worn travelling coat hung on a post at a crossroads shrine, lit by candle stubs and small offerings left by strangers who never met its owner.',
      do_gooder: 'A stranger crouched at a roadside handing a canteen to a seated child, the pack on their back still shouldered as if they were only passing through.',
      nobody: 'An empty pair of boots beside an unmade bedroll in a wasteland camp, the fire long dead, nothing to say who slept there.',
      troublemaker: 'An overturned market cart with fruit rolling into the dust, a curtain still swinging in a doorway where someone has just left in a hurry.',
      menace: 'A burnt-out doorway in a settlement wall, a handprint in soot beside it, scavenger birds gathered on the roofline above.'
    }
  },
  faction: {
    label: 'Faction card',
    file: 'src/reputationContent.js',
    anchor: id => new RegExp(`id:\\s*["']${id}["']`),
    style: FACTION_STYLE,
    slots: {
      rakan_watch: "Three Rakan Watch neighbourhood volunteers outside their community hall in Bandawang Baru, helping a ghoul labourer in a filthy orange PCI coverall. THE WORLD IS STILL HARD AND THIS IS STILL AFTER THE WAR: the hall behind them is patched and water-stained with mismatched repairs, paint flaking, concrete cracked, the yard rutted; their homemade matching mint-green shirts are faded, sweat-marked and mended, their boots worn through. Nobody is clean and nothing is new. THE GHOUL IS NOT ENJOYING THIS AND IS NOT THEIR FRIEND. He is exhausted, filthy and stooped from carrying, and his expression is STARTLED AND WARILY GRATEFUL - caught off guard, eyebrows up, not yet sure whether to accept. He is not smiling, not laughing, not linking arms with anyone. He has plainly not been helped in a long time and does not know what to do with it. One volunteer has lifted the heavy sack off the ghoul's shoulder onto his own and is bracing under the weight, grimacing. One steadies the ghoul by the forearm, businesslike rather than affectionate, watching his footing. One holds out a dented tin cup of water at arm's length, waiting for him to take it. NOBODY IS POINTING, nobody is posing for the camera, and nobody is beaming. Quiet, awkward, practical decency in a worn-out place.",
      triad_1414: 'Three 1414 Triad men on the roof pagoda of the Tortoise Palace casino: sharp black pinstripe suits, red lacquer and gilded carved timber behind them, vertical black and gold name plaques, embroidered silk banners, incense haze, ancestral-hall formality — one seated and amused, one standing guard, one leaning in mid-threat.',
      axe_gang: 'Three Axe Gang rockers of Bandawang on the lobby stage of ProTiga HQ: Malaysian rock kapak band look of the late eighties, NOT punk — long straight black hair worn loose past the shoulders, headbands and knotted bandanas, no mohawks and no shaved heads; sleeveless denim and leather vests worn open over bare chests or thin singlets, tight faded jeans, studded belts, leather wristbands and cuffs, scuffed boots. Oil-black and factory safety-yellow paint salvaged from a pre-war car plant marks their vests and gear. Modified electric guitars slung as weapons, one with a rifle barrel bolted along the neck. A race-numbered pedal kapcai parked behind them, soft in the background. One mid-shout at a microphone, one grinning with a guitar raised overhead, one stamping a boot on a monitor speaker.',
      bandawang_enforcers: "Three Bandawang Enforcers loitering on the graffiti-covered steps of the old police station: drab light-brown pre-war private-security armour thrown on over mismatched civilian clothes, batons and a shotgun, a shrine with burning incense in the doorway behind. THUGGISH AND OFF-DUTY-LOOKING, not a disciplined unit: one sprawled across the steps smoking with his boots up on the rail, one leaning in close over somebody\'s shoulder with a baton resting on it, grinning unpleasantly, one counting a fistful of notes without looking up. NOBODY IS POINTING, nobody is saluting, nobody is performing respectability. They look like men who are owed something.",
      the_federation: "Three figures of the Federation of Malaya at a roadside checkpoint. Their palette is lavender and orange, EXCEPT the officer. First: a Federation OFFICER in FULL WHITE CEREMONIAL DRESS UNIFORM in the Malaysian manner \u2014 a high-collared white tunic with gold buttons and gold shoulder cords, white trousers with a stripe, a white peaked cap with a gold badge, white gloves, a ceremonial belt. Immaculate, pressed, conspicuously clean against everything around him \u2014 standing hands behind his back, chin up, posing for the camera. Second: a Federation soldier in a sun-faded LAVENDER field jacket with orange collar facings over lavender combat slacks, brown webbing and pouches, a WW1-pattern steel helmet painted lavender \u2014 mid-salute. Third: a ghoul labourer of the Public Citizenship Initiative in a long frayed bright-ORANGE mechanic\'s jumpsuit, sleeves rolled, carrying two heavy stuffed sacks across his shoulders, head down and straining. Behind them, softly out of focus, a lavender-and-orange painted boom barrier and guard post.",
      the_protectorate: "Three Protectorate personnel inside a refurbished pre-war technical laboratory they have brought back into working order: clean bench tops, powered lamps, a restored terminal glowing, brass instruments racked on the wall \u2014 tidy and functional, softly out of focus. DARK NAVY BLUE UNIFORMS, no cream and no khaki anywhere. Naval formal tailoring with a light steampunk flair: quilted navy high-collared tunics and long coats, open-necked shirts with no tie, navy shoulder boards, brass buttons, black leather gloves, wide leather belts, tall boots, and a leather bandolier of mechanic\'s tools across the chest. No headgear of any kind. One leaning over a bench with a caliper mid-measurement, one gesturing at a drawing pinned to the wall, one standing arms folded. BEHIND THEM, SOFT BUT UNMISTAKABLE, A GERGASI \u2014 a Fallout-style super mutant, close to three metres tall, slabbed with grotesque muscle and thick grey-green hide, stooping under the ceiling as it carries a crate of equipment across the back of the room in heavy canvas work clothes. It is labour, not a threat; nobody in the foreground is looking at it.",
      the_caliphate: 'Three Caliphate Pahlawan on the sandstone steps of a plain Caliphate hall at the edge of the Chukai Desert: dry ochre stone, arid scrub, low geometric carved screens and a plain domed roof — no jungle, no tiered pagoda roofs, no Balinese or Hindu temple architecture. Modern post-apocalyptic warrior-pilgrims: salvaged modern body armour — a scuffed plate carrier, composite shoulder and shin plates, webbing pouches — worn OVER traditional Malay dress, unbleached linen robes and a samping sash at the waist, a tengkolok headwrap on one and a folded scarf on another. Waxed-cloth-wrapped manuscripts in bandolier satchels, tooled leather straps, a keris at the hip beside a battered rifle. Palette of sand and ochre with turquoise accents. One reading aloud from an open book, one with a hand raised in greeting, one turned alert toward the road.'
    }
  },
  vibe: {
    label: 'Vibe scene',
    file: 'src/vibeScenes.js',
    anchor: id => new RegExp(`id:\\s*["']${id}["']`),
    style: CARD_STYLE,
    slots: {
      driving_school: "A post-war Malaysian driving school on a cracked asphalt practice circuit, faded cone markings under the weeds, a wonky concrete hill-start ramp and dented traffic cones. EVERYBODY'S CLOTHES ARE OLD AND HARD-WORN \u2014 nothing is new, nothing is pressed, nothing matches. Faded and sun-bleached cotton gone shapeless, visible patches and mismatched mending at elbows and knees, frayed collars and cuffs, sweat-marked backs, grubby hems, shoes worn down and dusty. The INSTRUCTOR leans in at the window of a doorless retro-futurist car husk \u2014 bulbous fifties styling, rust through the sills \u2014 in a short-sleeved shirt gone thin and yellowish at the shoulders with a pen in the pocket and a clipboard in one hand. Inside, a TERRIFIED LEARNER grips the wheel at ten and two in a much-mended baju, staring straight ahead. Four applicants wait on mismatched plastic stools under a corrugated lean-to in patched work clothes and sarongs, one asleep sitting up. A board of pass photographs gone brown behind them. Comic but played completely straight.",
      big_ben_taken_seriously: "{{big_ben}} He is CROUCHED DOWN ON ONE KNEE to listen, head tilted, nodding, while a SMALL SERIOUS PERSON of ordinary height stands in front of him in a songkok and sarong, explaining something with a hand-drawn diagram held up in both hands. NOBODY IS LAUGHING and nobody is mugging \u2014 both are entirely sincere. A sunlit Bandawang street, out of focus behind them.",
      crossing_the_emerald_sea: "Night in the Chukai Desert. EXACTLY THREE Caliphate pahlawan on foot \u2014 three figures only, no more \u2014 walking away from camera across a vast field of sand dunes under a huge moon. Salvaged plate carriers and composite shoulder plates worn over unbleached linen robes and samping sashes, packs and bedrolls, one with a tengkolok. They are spread apart with real distance between them, small against the dunes. Scattered across the sand all around, thousands of TINY GREEN TRINITITE SHARDS catch the moonlight and glitter. THE LEAD FIGURE HAS STOPPED AND TURNED, looking back at the other two. Cold blue moonlight, never golden. Enormous scale, emptiness, no action."
    }
  },

  special: {
    label: 'SPECIAL card',
    file: 'src/goatContent.js',
    anchor: id => new RegExp(`^\\s{2}${id}:\\s*\\{`, 'm'),
    style: CARD_STYLE + ' Retro instructional poster in the style of a 1950s public information illustration.',
    slots: {
      str: 'A labourer hauling a chain-wrapped engine block off a wrecked truck one-handed, sleeves rolled, the crowd behind him stepping back.',
      per: 'A scout on a rooftop lowering a pair of battered binoculars, having spotted the one tripwire glinting across the alley below.',
      end: 'A figure walking straight into a dust storm with a rag over their face, pack still square on their shoulders, leaving a long trail of footprints.',
      cha: 'A trader mid-handshake across a market counter, both parties smiling, one of them clearly getting the better end of the deal.',
      int: 'A tinkerer at a workbench surrounded by open manuals and exposed circuitry, holding up a repaired vacuum tube to the lamplight.',
      agi: 'A runner vaulting a collapsed railing between two rooftops, mid-air, a strap of gear trailing behind them.',
      luk: 'A pre-War slot machine in a ruined arcade hitting three sevens, coins spilling into the dust of a floor nobody has swept in a century.'
    }
  }
};

// A flat list of every slot: a stable id (also its inbox filename), the
// module it lives in, and the regex that finds its entry.
export function allSlots() {
  return Object.entries(SLOT_GROUPS).flatMap(([group, def]) =>
    Object.entries(def.slots).map(([key, prompt]) => ({
      id: `${group}_${key}`,
      key,
      group,
      label: `${def.label}: ${key.replace(/_/g, ' ')}`,
      file: def.file,
      anchor: def.anchor(key),
      style: def.style,
      prompt
    }))
  );
}
