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
const CARD_STYLE = 'Photorealistic photograph, 1:1 square, 1080x1080, 35mm film still, natural light, shallow depth of field, fine grain. Monsoon Gold grade: blown-out near-white hazy sky light, hot golden key light, cyan-green bounced shadows, heavy humid air. Equatorial Malaya after 170 years of rain: black-green mould and algae staining from the top down, rust weeping in dark streaks, damp surfaces, red laterite mud, jungle reclaiming every structure. No dust, no sand, no arid cracked earth. No text, no lettering, no watermark, no people in the foreground unless the subject names them, no modern plastics, no Bethesda marks.';

// Faction cards are group portraits, and the GM's note after the first
// pass was that the wet-ruin background was fighting the figures. So
// this style keeps the grade but spends the frame on the people: the
// setting is named, thrown well out of focus, and kept quiet.
const FACTION_STYLE = 'Photorealistic photograph, 1:1 square, 1080x1080, 35mm film still, natural light, shallow depth of field, fine grain. Monsoon Gold grade: hazy near-white sky light, hot golden key light, cyan-green bounced shadows, humid equatorial air. Three figures together, full length, clearly separated, in dynamic poses with expressive faces, caught mid-moment rather than lined up for a portrait. THE FIGURES ARE THE SUBJECT: sharply lit and in focus, filling most of the frame, their clothing and colours reading instantly. The setting is simple and thrown well out of focus behind them: enough to say where they are, never enough to compete. Keep the background uncluttered and restrained. Weathering and jungle overgrowth stay in the soft background only, never on the figures or across the frame. Malaya 170 years after the bombs, but legible before it is ruined. No text, no lettering, no watermark, no modern plastics, no Bethesda marks.';

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
      rakan_watch: 'Three Rakan Watch neighbourhood volunteers outside a repainted community hall in Bandawang Baru: homemade matching municipal mint-green and off-white shirts with hand-sewn name tags, swept step, hand-painted signboard, farming tools and homemade weapons, performing respectability — one laughing, one wary, one mid-instruction with an arm out.',
      triad_1414: 'Three 1414 Triad men on the roof pagoda of the Tiger Palace casino: sharp black pinstripe suits, red lacquer and gilded carved timber behind them, vertical black and gold name plaques, embroidered silk banners, incense haze, ancestral-hall formality — one seated and amused, one standing guard, one leaning in mid-threat.',
      axe_gang: 'Three Axe Gang rockers of Bandawang on the lobby stage of ProTiga HQ: Malaysian rock kapak band look of the late eighties, NOT punk — long straight black hair worn loose past the shoulders, headbands and knotted bandanas, no mohawks and no shaved heads; sleeveless denim and leather vests worn open over bare chests or thin singlets, tight faded jeans, studded belts, leather wristbands and cuffs, scuffed boots. Oil-black and factory safety-yellow paint salvaged from a pre-war car plant marks their vests and gear. Modified electric guitars slung as weapons, one with a rifle barrel bolted along the neck. A race-numbered pedal kapcai parked behind them, soft in the background. One mid-shout at a microphone, one grinning with a guitar raised overhead, one stamping a boot on a monitor speaker.',
      bandawang_enforcers: 'Three Bandawang Enforcers on the graffiti-covered steps of the old police station: drab light-brown pre-war private-security armour over mismatched clothes, batons and a shotgun, a shrine with burning incense in the doorway behind — one bored, one shouting an order, one already walking away.',
      the_federation: 'Three figures of the Federation of Malaya at a roadside checkpoint. NO WHITE OR CREAM CLOTHING ANYWHERE. Their palette is lavender and orange throughout. First: a Federation officer in a retro-futuristic lavender jumpsuit with a high orange stand-up collar, an orange stripe down the sleeve, brass buttons and a wide brown leather belt with a heavy brass buckle, peaked lavender cap with an orange enamel starburst badge — standing hands on hips, smiling for the camera. Second: a Federation soldier in a sun-faded lavender field jacket with orange collar facings over lavender combat slacks, brown webbing and pouches, a WW1-pattern steel helmet painted lavender — mid-salute. Third: a ghoul labourer of the Public Citizenship Initiative in a long frayed bright-orange mechanic\'s jumpsuit, sleeves rolled, carrying two heavy stuffed sacks slung across his shoulders, head down and straining under the load. Behind them, softly out of focus, a lavender-and-orange painted boom barrier and guard post.',
      the_protectorate: 'Three Protectorate personnel inside a refurbished pre-war technical laboratory that they have brought back into working order: clean bench tops, powered lamps, a restored terminal glowing, brass instruments racked on the wall — tidy and functional, softly out of focus. DARK NAVY BLUE UNIFORMS, no cream and no khaki anywhere. Naval formal tailoring with a light steampunk flair: quilted navy high-collared tunics and long coats, open-necked shirts with no tie, navy shoulder boards, brass buttons, black leather gloves, wide leather belts, tall boots, and a leather bandolier of mechanic\'s tools worn across the chest. A small Protectorate emblem at the upper breast. No headgear of any kind. One leaning over a bench with a caliper mid-measurement, one gesturing at a drawing pinned to the wall, one standing arms folded watching impassively.',
      the_caliphate: 'Three Caliphate Pahlawan on the sandstone steps of a plain Caliphate hall at the edge of the Chukai Desert: dry ochre stone, arid scrub, low geometric carved screens and a plain domed roof — no jungle, no tiered pagoda roofs, no Balinese or Hindu temple architecture. Modern post-apocalyptic warrior-pilgrims: salvaged modern body armour — a scuffed plate carrier, composite shoulder and shin plates, webbing pouches — worn OVER traditional Malay dress, unbleached linen robes and a samping sash at the waist, a tengkolok headwrap on one and a folded scarf on another. Waxed-cloth-wrapped manuscripts in bandolier satchels, tooled leather straps, a keris at the hip beside a battered rifle. Palette of sand and ochre with turquoise accents. One reading aloud from an open book, one with a hand raised in greeting, one turned alert toward the road.'
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
