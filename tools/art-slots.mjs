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
    style: CARD_STYLE + ' Three figures together, full length, in dynamic poses with expressive faces — caught mid-moment, not lined up for a portrait. Their setting is the place this faction belongs to.',
    slots: {
      rakan_watch: 'Three Rakan Watch neighbourhood volunteers outside a repainted community hall in Bandawang Baru: homemade matching municipal mint-green and off-white shirts with hand-sewn name tags, swept step, hand-painted signboard, farming tools and homemade weapons, performing respectability — one laughing, one wary, one mid-instruction with an arm out.',
      triad_1414: 'Three 1414 Triad men on the roof pagoda of the Tiger Palace casino: sharp black pinstripe suits, red lacquer and gilded carved timber behind them, vertical black and gold name plaques, embroidered silk banners, incense haze, ancestral-hall formality — one seated and amused, one standing guard, one leaning in mid-threat.',
      axe_gang: 'Three Axe Gang rockers in the ProTiga HQ lobby stage: oil-black and factory safety-yellow salvaged from a pre-war car plant, cut-off denim and leather, hand-painted helmets, modified electric guitars slung as weapons, a race-numbered pedal kapcai behind them — one mid-shout, one grinning, one stamping a boot.',
      bandawang_enforcers: 'Three Bandawang Enforcers on the graffiti-covered steps of the old police station: drab light-brown pre-war private-security armour over mismatched clothes, batons and a shotgun, a shrine with burning incense in the doorway behind — one bored, one shouting an order, one already walking away.',
      the_federation: 'Three Federation figures at a checkpoint of pressed lavender and orange: immaculately laundered 1950s formal dress, high-collared tunic, songkok, enamelled orange starburst order, beside a sun-faded lavender field uniform and WW1-pattern steel helmet — one smiling for the camera, one saluting, one impatient.',
      the_protectorate: 'Three Protectorate personnel on a scaffolded rail works: bone-cream lightweight cotton drill, sleeves rolled, navy shoulder boards and collar facings, navy sash, brass buttons, tool bandoliers across the chest, canvas gaiters — one mid-measurement with brass instruments, one gesturing at a plan, one watching impassively.',
      the_caliphate: 'Three Caliphate Pahlawan on the steps of a timber meru-roofed hall: unbleached linen scholar robes over travel clothes, waxed-cloth-wrapped manuscripts in bandolier satchels, tooled leather, keris at the hip, sand and ochre with turquoise accents, carved openwork screens casting filigree shadows — one reading aloud, one hand raised in greeting, one alert to the road.'
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
