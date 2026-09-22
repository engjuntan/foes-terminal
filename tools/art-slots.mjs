// tools/art-slots.mjs — art slots that aren't vault items.
//
// Items keep their prompts in the vault. These live in hand-written source
// modules (`src/reputationContent.js`, `src/goatContent.js`) as `image_url: ""`
// fields, so the prompts live here beside them. `npm run art` treats both the
// same: sheet → generate/draw → ingest → the url is written back.
//
// Each group has its own STYLE, because a reputation card is a scene and a
// SPECIAL card is an emblem — neither is an item on a dark background.

const CARD_STYLE = 'Post-apocalyptic retropunk meets dieselpunk. Square 1:1 composition, painted poster art, muted wasteland palette with one strong accent, no text, no lettering, no watermark.';

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
