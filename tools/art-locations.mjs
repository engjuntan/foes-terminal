// tools/art-locations.mjs — two image prompts per vault location: how you
// first see the place from outside (entrance), and the room or space
// that matters once you're in it (interior).
//
// These follow the Bible's "scene photograph" register (locations and
// key art use 35mm film still / Kodachrome, not the object plate used
// for items). The shared style — grade, climate, negatives, square
// format — is added by the art script at generation time, same as
// tools/art-slots.mjs. Prompts here are subject only: the place, its
// materials, its era layer, what people have done to it.

export const LOCATION_SHOTS = [
  // ---------------------------------------------------------------
  // Locations/ (Peninsula-wide)
  // ---------------------------------------------------------------
  {
    id: 'loc_abave_highlands_entrance',
    name: 'Abave Highlands',
    notePath: 'Locations/Abave Highlands.md',
    shot: 'entrance',
    prompt: "A cracked mountain access road climbs past a broken pre-war theme-park archway and a dead casino marquee, chrome lettering half fallen, jungle vines pulling the signage down; further up the slope, round rammed-earth monastery buildings sit where casino terraces used to be."
  },
  {
    id: 'loc_abave_highlands_interior',
    name: 'Abave Highlands',
    notePath: 'Locations/Abave Highlands.md',
    shot: 'interior',
    prompt: "Inside a gutted pre-war casino hall on the Abave slope: a collapsed chandelier, cracked roulette tables buried under leaf litter, faded gilt wallpaper peeling in sheets, and a strangler fig growing up through a hole in the floor toward a shaft of grey monsoon light."
  },
  {
    id: 'loc_bandar_buaya_entrance',
    name: 'Bandar Buaya',
    notePath: 'Locations/Bandar Buaya.md',
    shot: 'entrance',
    prompt: "A ghoul settlement on stilts at the swampy edge of North Bandawang: plank walkways over still black water, patched zinc-roofed shacks strung with hand-painted warning signs locals use to keep outsiders away, laundry lines and fish traps hung along the waterline."
  },
  {
    id: 'loc_bandar_buaya_interior',
    name: 'Bandar Buaya',
    notePath: 'Locations/Bandar Buaya.md',
    shot: 'interior',
    prompt: "Inside a communal longhouse built from salvaged warehouse steel: rows of hammocks slung between roof trusses, a shared cooking fire under a corrugated vent, jars of murky tonics and bandages stacked on a shelf, cooking soot darkening the wall behind them."
  },
  {
    id: 'loc_batu_kapur_entrance',
    name: 'Batu Kapur',
    notePath: 'Locations/Batu Kapur.md',
    shot: 'entrance',
    prompt: "A city built into karst limestone cliffs, tunnel mouths fortified with welded plate and sandbags, white mineral dust bleaching every rooftop and awning, district banners and rival guild sigils painted and struck out along a switchback stair climbing the rock face."
  },
  {
    id: 'loc_batu_kapur_interior',
    name: 'Batu Kapur',
    notePath: 'Locations/Batu Kapur.md',
    shot: 'interior',
    prompt: "A limestone sculpture hall inside a cave gallery: half-carved white stone figures on trestles, chisels and stone dust everywhere, market stalls selling small carved trinkets between the columns, layered graffiti of feuding clans scratched into the soft rock walls, a chalked price list taped beside a broken cash drawer."
  },
  {
    id: 'loc_frim_entrance',
    name: 'FRIM',
    notePath: 'Locations/FRIM.md',
    shot: 'entrance',
    prompt: "An abandoned pre-war research campus dissolving into rainforest: a raised concrete canopy walkway sags between rusted iron support towers, tropical-modernist brise-soleil sunscreens swallowed by ferns and strangler figs, a faded enamel Forest Research Institute signboard half-buried in moss beside the overgrown entrance drive."
  },
  {
    id: 'loc_frim_interior',
    name: 'FRIM',
    notePath: 'Locations/FRIM.md',
    shot: 'interior',
    prompt: "Inside a ruined herbarium hall: rows of collapsed pre-war specimen cabinets spilling pressed leaves and seed jars, a cracked hydroponic tank dripping algae-green water, botanical charts peeling off cream tiled walls, jungle roots pushing up through broken floor tiles toward the light."
  },
  {
    id: 'loc_federal_cultural_library_entrance',
    name: 'Federal Cultural Library',
    notePath: 'Locations/Federal Cultural Library.md',
    shot: 'entrance',
    prompt: "A guarded reading-room doorway deep inside Perdana Bunker: tall lavender-and-orange enamelled doors set beneath a hand-lettered 1957 relief sign, a queue rope and a Federation clerk's registration desk, bunker corridor walls lined with faded propaganda film posters under humming fluorescent tubes."
  },
  {
    id: 'loc_federal_cultural_library_interior',
    name: 'Federal Cultural Library',
    notePath: 'Locations/Federal Cultural Library.md',
    shot: 'interior',
    prompt: "Rows of steel archival shelving inside the Federal Cultural Library, reel canisters and bound manuals stacked to the ceiling, a bank of microfilm reader desks with cracked bakelite dials, propaganda murals of a confident pre-war Malaya painted across the far wall."
  },
  {
    id: 'loc_fortress_city_of_penang_entrance',
    name: 'Fortress City of Penang',
    notePath: 'Locations/Fortress City of Penang.md',
    shot: 'entrance',
    prompt: "A coastal wall built from the rusted hulls of pre-war cargo ships and warships, crane-lifted upright and welded seam to seam, gun ports cut into their sides; the rebuilt bridge crossing rides over the grounded hull of an aircraft carrier toward the gate."
  },
  {
    id: 'loc_fortress_city_of_penang_interior',
    name: 'Fortress City of Penang',
    notePath: 'Locations/Fortress City of Penang.md',
    shot: 'interior',
    prompt: "A customs and rationing hall just inside the sea-wall gate: bone-cream concrete counters, ledger clerks behind brass grilles, a wall-sized population-score board with rows of hand-set numbers, queues marked out in painted floor lines under navy Protectorate banners, a faded welcome poster peeling above the grille."
  },
  {
    id: 'loc_great_jungle_entrance',
    name: 'Great Jungle',
    notePath: 'Locations/Great Jungle.md',
    shot: 'entrance',
    prompt: "The Longest Road simply stops at a wall of black-green canopy: broken road markers lean into the treeline, a rusted signpost half swallowed by vines, roots cracking through the last visible stretch of tarmac before the jungle closes over it completely."
  },
  {
    id: 'loc_great_jungle_interior',
    name: 'Great Jungle',
    notePath: 'Locations/Great Jungle.md',
    shot: 'interior',
    prompt: "Deep inside the canopy, fused strangler-fig trunks wrap the skeleton of a swallowed pre-war structure, only a corner of tiled wall still visible through the roots; shafts of hazy gold light barely reach the wet, black-green jungle floor below, moisture beading on every exposed vine and leaf."
  },
  {
    id: 'loc_kuala_lumpur_baru_entrance',
    name: 'Kuala Lumpur Baru',
    notePath: 'Locations/Kuala Lumpur Baru.md',
    shot: 'entrance',
    prompt: "A ruined highway interchange fused into a single mass of concrete and rebar, collapsed pre-war towers leaning over it under a yellow haze, an old monorail hub entrance choked with vines, ghoul-built lean-tos wedged among the rubble at street level."
  },
  {
    id: 'loc_kuala_lumpur_baru_interior',
    name: 'Kuala Lumpur Baru',
    notePath: 'Locations/Kuala Lumpur Baru.md',
    shot: 'interior',
    prompt: "Inside a disused PCI screening station: rows of ghoul-height booths with cracked frosted glass, a lavender Federation citizenship poster peeling off the wall, dust-caked paperwork scattered across a counter, a single caged bulb still faintly glowing overhead, a child's drawing pinned crooked beside the counter."
  },
  {
    id: 'loc_kulim_entrance',
    name: 'Kulim',
    notePath: 'Locations/Kulim.md',
    shot: 'entrance',
    prompt: "A crumbling pre-war road lined with lantern-strung tenement fronts and black-market signboards, ceremonial red lanterns glowing through incense smoke, shuttered shopfronts with hand-painted vice-den symbols, a Tan Family lookout leaning against a cracked colonial-era pillar, debt tallies chalked beside a locked gate."
  },
  {
    id: 'loc_kulim_interior',
    name: 'Kulim',
    notePath: 'Locations/Kulim.md',
    shot: 'interior',
    prompt: "A dim underground gambling den beneath Kulim's tenements: low mismatched tables and stools under hanging red lanterns, chalked betting tallies scrawled across a soot-stained wall, cigarette haze thick in the air, a curtained doorway leading toward an unmarked back-room clinic."
  },
  {
    id: 'loc_maqil_monastery_entrance',
    name: "Ma'qil Monastery",
    notePath: "Locations/Ma'qil Monastery.md",
    shot: 'entrance',
    prompt: "Rings of round rammed-earth buildings climb the Abave mountainside like a series of Fujian tulou, timber-shuttered windows facing an inner courtyard, prayer flags and drying robes strung between them, jungle mist rolling down the slope behind the outermost ring, a lone monk sweeping the outermost courtyard steps."
  },
  {
    id: 'loc_maqil_monastery_interior',
    name: "Ma'qil Monastery",
    notePath: "Locations/Ma'qil Monastery.md",
    shot: 'interior',
    prompt: "Inside the monastery's original round house, built from old Abave Grand hotel rubble: a circular prayer hall with a packed-earth floor, salvaged hotel chandelier crystals reworked into a hanging shrine, worn cushions set in a ring around a low central altar."
  },
  {
    id: 'loc_perdana_bunker_entrance',
    name: 'Perdana Bunker',
    notePath: 'Locations/Perdana Bunker.md',
    shot: 'entrance',
    prompt: "A blast-door entrance sunk beneath the fused concrete ruins of old KL Sentral, a lavender-and-orange enamel Federation crest set above riveted steel doors, Usher guards flanking the descending ramp, hand-set 1957 relief lettering announcing the bunker's name above the threshold."
  },
  {
    id: 'loc_perdana_bunker_interior',
    name: 'Perdana Bunker',
    notePath: 'Locations/Perdana Bunker.md',
    shot: 'interior',
    prompt: "An administrative chamber deep in Perdana Bunker: tropical-modernist concrete columns, a long lavender-clothed table under a Federation starburst banner, filing cabinets of Keturunan dynasty records, well-fed Chosen officials' portraits in chipped gilt frames along the wall, a hydroponic fern in a brass planter by the door."
  },
  {
    id: 'loc_round_city_entrance',
    name: 'Round City',
    notePath: 'Locations/Round City.md',
    shot: 'entrance',
    prompt: "A perfectly circular city spiralling down into a desert crater, ceramic-and-refinery-brick ramparts ringed with faded geometric banners, market stalls and stilted desert homes on the outer terraces, the white-and-turquoise domed Grand Library Mosque rising at the spiral's center, condensation traps glinting along a shaded garden terrace."
  },
  {
    id: 'loc_round_city_interior',
    name: 'Round City',
    notePath: 'Locations/Round City.md',
    shot: 'interior',
    prompt: "Inside the Grand Library Mosque: tessellated stone arches supporting a white-and-turquoise dome overhead, a salvaged oil-derrick mast antenna threaded up through the ceiling, calligraphic manuscript shelves lining a subterranean archive hall, its arched alcoves lit by rows of scattered oil lamps."
  },
  {
    id: 'loc_the_free_city_of_bandawang_entrance',
    name: 'The Free City of Bandawang',
    notePath: 'Locations/The Free City of Bandawang.md',
    shot: 'entrance',
    prompt: "A wide dusk view across Bandawang from a low ridge: the dead hulk of a pre-war cement works standing at the city's centre, silo towers and a collapsed kiln gantry dark against the sky, the town grown up around it on every side. Buildings are shoplots and low blocks of no more than twenty storeys — no skyscrapers — strung with salvaged neon tubing and hand-painted signboards, rival gang colours layered on every wall. A wide retention pond lies below, still and reflecting the neon, with stilted walkways along its edge. Distant kapcai engines echo off the concrete."
  },
  {
    id: 'loc_the_free_city_of_bandawang_interior',
    name: 'The Free City of Bandawang',
    notePath: 'Locations/The Free City of Bandawang.md',
    shot: 'interior',
    prompt: "Inside a repurposed factory-floor slot parlour: rows of hand-built one-armed-bandit machines wired from salvaged parts, mismatched neon signage, a low haze of cigarette smoke over crowded gaming tables, gang muscle watching the room from a raised back platform, a pit boss counting chips behind a wire cage."
  },
  {
    id: 'loc_the_longest_road_entrance',
    name: 'The Longest Road',
    notePath: 'Locations/The Longest Road.md',
    shot: 'entrance',
    prompt: "The cracked North-South highway stretches to the horizon between broken concrete pylons and rusted guardrails, a burned-out checkpoint barrier abandoned mid-lane, jungle pressing in from both shoulders and a distant watchtower silhouette marking the next danger point, tyre tracks veering suddenly off the broken shoulder."
  },
  {
    id: 'loc_the_longest_road_interior',
    name: 'The Longest Road',
    notePath: 'Locations/The Longest Road.md',
    shot: 'interior',
    prompt: "Beneath a collapsed highway overpass used as a wayfinding shelter: a cold campfire ring, warning symbols scratched into a support pillar, salvaged tarpaulin strung between fallen slabs, bundled supplies left by past travellers for whoever comes next, initials and tallies scratched into the concrete overhead."
  },
  {
    id: 'loc_the_north_south_railway_entrance',
    name: 'The North South Railway',
    notePath: 'Locations/The North South Railway.md',
    shot: 'entrance',
    prompt: "An elevated maglev rail line collapsing through the jungle canopy, sections of track torn away and stacked as scrap nearby, rusted support pylons streaked black with weeping rust, vines pulling a fallen signal gantry down toward the treeline, a rusted maintenance trolley abandoned on a side spur."
  },
  {
    id: 'loc_the_north_south_railway_interior',
    name: 'The North South Railway',
    notePath: 'Locations/The North South Railway.md',
    shot: 'interior',
    prompt: "Inside a stripped pre-war maglev railcar half-buried in undergrowth: bench seating torn out down to the floor bolts, a cracked enamel route map still fixed above the doorway, shafts of hazy light cutting through rust holes punched along the carriage roof."
  },
  {
    id: 'loc_wira_bunker_entrance',
    name: 'Wira Bunker',
    notePath: 'Locations/Wira Bunker.md',
    shot: 'entrance',
    prompt: "A blast-door entrance beneath the fused industrial ruins of old Shah Alam, riveted steel doors under a lavender-and-orange Federation crest in more muted, practical tones, Sword soldiers in worn field jackets posted either side of the descending ramp, a faded duty roster bolted beside the entry log."
  },
  {
    id: 'loc_wira_bunker_interior',
    name: 'Wira Bunker',
    notePath: 'Locations/Wira Bunker.md',
    shot: 'interior',
    prompt: "A munitions workshop deep in Wira Bunker: rows of reloading benches and chemical vats under bare bulb light, half-assembled weapon frames on a workbench, a fusion generator humming behind a mesh cage at the far end of the hall, spent shell casings swept into a corner pile."
  },
  {
    id: 'loc_chukai_desert_entrance',
    name: 'Chukai Desert',
    notePath: 'Locations/🏜️Chukai Desert.md',
    shot: 'entrance',
    prompt: "A vast salt-crusted dune basin stretching to the horizon, skeletal pre-war oil derricks leaning at broken angles against a bleached sky, fused glassy trinitite glinting across scorched blackened ground, a lone sand-scoured highway marker leaning half-buried at the desert's edge."
  },
  {
    id: 'loc_chukai_desert_interior',
    name: 'Chukai Desert',
    notePath: 'Locations/🏜️Chukai Desert.md',
    shot: 'interior',
    prompt: "Inside a collapsed refinery structure at the desert's heart: twisted fused pipework and a caved-in roof letting in hard white light, the floor a sheet of black glassy trinitite, an old brass instrument case left half-open on a fallen catwalk."
  },

  // ---------------------------------------------------------------
  // Locations/Bandawang/
  // ---------------------------------------------------------------
  {
    id: 'loc_bandawang_baru_entrance',
    name: 'Bandawang Baru',
    notePath: 'Locations/Bandawang/Bandawang Baru.md',
    shot: 'entrance',
    prompt: "A street in Bandawang Baru where new and old are fused into single buildings: pre-war timber kampong houses with modern poured-concrete floors added above and beside them, concrete columns rising straight out of carved wooden frames, freshly painted pastel render meeting bare grey slab. A worn cobbled path runs down the middle, swept and patched, edged with drainage stones. Construction scaffolding and stacked bags of cement lean against a wall, a hand-lettered welcome sign strung between two posts."
  },
  {
    id: 'loc_bandawang_baru_interior',
    name: 'Bandawang Baru',
    notePath: 'Locations/Bandawang/Bandawang Baru.md',
    shot: 'interior',
    prompt: "Inside the patchwork canvas market of Bandawang Baru: quilted tarpaulin roofing stitched from mismatched colours overhead, stalls of traded goods under hanging pastel bunting, a hammock strung between two support poles where a shopkeeper naps between customers, a child's chalk drawing on a support pole nearby."
  },
  {
    id: 'loc_bandawang_lama_entrance',
    name: 'Bandawang Lama',
    notePath: 'Locations/Bandawang/Bandawang Lama.md',
    shot: 'entrance',
    prompt: "A street of post-colonial art-deco shoplots in Bandawang Lama, and unlike the rest of the wasteland it is LOOKED AFTER: stepped deco parapets and curved corner facades repainted in pastel cream and jade, shutters rehung, brass shopfront fittings polished, ornamental plasterwork patched where it had cracked. The road is properly laid asphalt, swept, with kerbstones intact. A Triad house-rules board hangs neatly beside one doorway. Somebody here is deliberately rebuilding a proper society, and it shows."
  },
  {
    id: 'loc_bandawang_lama_interior',
    name: 'Bandawang Lama',
    notePath: 'Locations/Bandawang/Bandawang Lama.md',
    shot: 'interior',
    prompt: "Inside a street casino built into an old shoplot: a felt-worn gaming table under a hanging bulb, chipped mahjong tiles stacked beside a cash box, cigarette smoke curling past faded colonial ceiling mouldings, a Tan Family enforcer's jacket hung on a hook by the door."
  },
  {
    id: 'loc_federation_checkpoint_entrance',
    name: 'Federation Checkpoint',
    notePath: 'Locations/Bandawang/Federation Checkpoint.md',
    shot: 'entrance',
    prompt: "A Federation checkpoint on the road out of Bandawang: a lavender-and-orange painted boom barrier across properly laid, patched asphalt, a sandbagged watchtower cabin beside it, Federation colours hanging limp in the humid air. A long queue of desperate refugees waits along the approach with bundles, cases and children, shuffling forward to be processed one at a time by a single guard at the barrier. Some have plainly been waiting for days."
  },
  {
    id: 'loc_federation_checkpoint_interior',
    name: 'Federation Checkpoint',
    notePath: 'Locations/Bandawang/Federation Checkpoint.md',
    shot: 'interior',
    prompt: "Inside the watchtower cabin: a scarred wooden desk stacked with registration ledgers, a hand-cranked field radio wired to a car battery, a Federation duty roster pinned crooked to the plank wall, binoculars hanging beside a narrow viewing slit, a stamped citizenship pamphlet left open on the desk."
  },
  {
    id: 'loc_federation_recruitment_center_entrance',
    name: 'Federation Recruitment Center',
    notePath: 'Locations/Bandawang/Federation Recruitment Center.md',
    shot: 'entrance',
    prompt: "A cul-de-sac of three pristine show homes in Federation lavender and orange, one carved in ornate Nusantara timber, one square post-modern with tall windows, the centre home in 1960s Islamic-Malay style, all picture-perfect against the rebuilding district around them, a groomed hedge line marking the cul-de-sac's edge."
  },
  {
    id: 'loc_federation_recruitment_center_interior',
    name: 'Federation Recruitment Center',
    notePath: 'Locations/Bandawang/Federation Recruitment Center.md',
    shot: 'interior',
    prompt: "Inside the centre show home's recruitment station: a polished reception desk beneath a lavender Federation citizenship poster, rows of waiting chairs facing a mounted propaganda film screen, an intake clipboard and brass inkstamp set neatly out on the counter, a scale model of the three show homes on a side table."
  },
  {
    id: 'loc_kelam_sungai_entrance',
    name: 'Kelam Sungai',
    notePath: 'Locations/Bandawang/Kelam Sungai.md',
    shot: 'entrance',
    prompt: "A bombed-out water treatment plant north-west of Bandawang Baru, its concrete filtration towers cracked open and scorched, twisted rebar and shattered pipework spilling down the slope, warning signage for a water plant still hanging crooked over the blasted gate, scorch marks radiating outward from the shattered gatehouse."
  },
  {
    id: 'loc_kelam_sungai_interior',
    name: 'Kelam Sungai',
    notePath: 'Locations/Bandawang/Kelam Sungai.md',
    shot: 'interior',
    prompt: "Inside a collapsed cell corridor beneath the treatment works, iron bars bent outward by the blast, a rusted meal cart overturned in the passage, brown floodwater dripping through cracked concrete onto a floor littered with old prisoner bedding and scorched paperwork."
  },
  {
    id: 'loc_north_bandawang_entrance',
    name: 'North Bandawang',
    notePath: 'Locations/Bandawang/North Bandawang.md',
    shot: 'entrance',
    prompt: "The hill country of North Bandawang: low jungle-grown hills rolling back toward the horizon, and cut into the flat valley floor between them the vast pre-war ProTiga vehicle test track — a wide banked oval of cracked asphalt, lane markings still faintly visible, patched and swept where kapcai riders use it. Faded red-and-black Axe Gang paint marks the crash barriers. The bulk of ProTiga HQ's tower rises above the treeline beyond. A retro-futurist car husk with bulbous fifties styling and chrome tail fins sits abandoned at the trackside."
  },
  {
    id: 'loc_north_bandawang_interior',
    name: 'North Bandawang',
    notePath: 'Locations/Bandawang/North Bandawang.md',
    shot: 'interior',
    prompt: "Inside a makeshift underground fighting ring dug into a bomb crater, tiered scrap-metal bleachers ringing a packed-dirt pit, hand-painted betting boards nailed to salvaged plywood, a string of oil-drum floodlights rigged along a sagging cable overhead, spent shell casings pressed into the dirt underfoot."
  },
  {
    id: 'loc_protiga_hq_entrance',
    name: 'ProTiga HQ',
    notePath: 'Locations/Bandawang/ProTiga HQ.md',
    shot: 'entrance',
    prompt: "A twenty-floor bomb-proof pre-war tower, bulletproof windows dusty and pockmarked with bullet holes, giant speakers wired into smashed-out lower windows, a stage built into the former lobby strung with electric guitars beneath torn 80s Rock Kapak banners, a faded ProTiga lobby directory board still bolted by the door."
  },
  {
    id: 'loc_protiga_hq_interior',
    name: 'ProTiga HQ',
    notePath: 'Locations/Bandawang/ProTiga HQ.md',
    shot: 'interior',
    prompt: "A basement storage room beneath ProTiga HQ: broken sledgehammers and drills scattered near old explosive scorch marks, hung axes lining the walls as trophies, a massive sealed vault door standing untouched at the far end of the room, a coil of frayed detonator wire left beside the door."
  },
  {
    id: 'loc_sekitar_litar_entrance',
    name: 'Sekitar Litar',
    notePath: 'Locations/Bandawang/Sekitar Litar.md',
    shot: 'entrance',
    prompt: "A pre-war automobile test track choked with obstacles, burned-out kapcai husks and rusted car hulks scattered across cracked, haphazardly retarred gravel, a guard watchtower overlooking the course, wild grass ringing the whole obstacle-strewn circuit under a grey monsoon sky, faded lane markings barely visible beneath the patched tar."
  },
  {
    id: 'loc_sekitar_litar_interior',
    name: 'Sekitar Litar',
    notePath: 'Locations/Bandawang/Sekitar Litar.md',
    shot: 'interior',
    prompt: "Inside the bombed-out grandstand's ground-floor lobby: a betting counter scrawled with the day's odds in chalk, torn kapcai-race posters curling off the walls, mismatched stools around a cash table, sunlight cutting through a hole in the collapsed ceiling above, a rack of race flags propped against the broken counter."
  },
  {
    id: 'loc_syurga_entrance',
    name: 'Syurga',
    notePath: 'Locations/Bandawang/Syurga.md',
    shot: 'entrance',
    prompt: "A near-finished hamlet of small ersatz-British buildings, a tiny Big Ben clock tower shaped like a standing Gergasi, Union Jack bunting strung between scaffolding, construction materials still stacked outside a converted pre-war supermarket dressed as a parliament building, a half-hung banner reading Grand Opening Soon in painted script."
  },
  {
    id: 'loc_syurga_interior',
    name: 'Syurga',
    notePath: 'Locations/Bandawang/Syurga.md',
    shot: 'interior',
    prompt: "Inside the converted casino floor dressed as British parliament: green-and-gilt gaming tables set beneath mock parliamentary benches, staff in ill-fitting British uniforms carrying trays of tea and biscuits, a Union Jack backdrop hung slightly crooked behind the main stage, a croupier adjusting an ill-fitting bowler hat between hands."
  },
  {
    id: 'loc_the_bandawang_enforcer_station_b_e_station_entrance',
    name: 'The Bandawang Enforcer Station (B.E. Station)',
    notePath: 'Locations/Bandawang/The Bandawang Enforcer Station (B.E. Station).md',
    shot: 'entrance',
    prompt: "An old pre-war police station covered in layered gang graffiti, a small attached flat where enforcers live, sets of drab light-brown security-company armour hung drying on a rail outside, a cracked hand-painted sign for the station barely legible over the entrance."
  },
  {
    id: 'loc_the_bandawang_enforcer_station_b_e_station_interior',
    name: 'The Bandawang Enforcer Station (B.E. Station)',
    notePath: 'Locations/Bandawang/The Bandawang Enforcer Station (B.E. Station).md',
    shot: 'interior',
    prompt: "Inside the enforcer station's reception area: weak ceiling fans stirring warm air, dirt swept into neat piles in the corners, a shrine to Guan Yu lit with incense in one corner, a scarred wooden counter stacked with unpaid complaint slips."
  },
  {
    id: 'loc_the_education_center_entrance',
    name: 'The Education Center',
    notePath: 'Locations/Bandawang/The Education Center.md',
    shot: 'entrance',
    prompt: "A repurposed pre-war primary school on a hill above Bandawang Lama, repainted in faded cream and dark brown, hand-painted subject murals flanking the entrance steps, a cracked schoolyard gate standing open beneath a patched corrugated roof overhang, a hand-painted timetable board propped just inside the gate."
  },
  {
    id: 'loc_the_education_center_interior',
    name: 'The Education Center',
    notePath: 'Locations/Bandawang/The Education Center.md',
    shot: 'interior',
    prompt: "Inside a classroom lined with hand-painted diagrams and lesson murals, mismatched desks facing a chalkboard, a single terminal wired to a car battery in the corner glowing faintly — the library link to the Grand Library — a queue of coin-clutching students waiting their turn."
  },
  {
    id: 'loc_the_lakeside_bar_entrance',
    name: 'The Lakeside Bar',
    notePath: 'Locations/Bandawang/The Lakeside Bar.md',
    shot: 'entrance',
    prompt: "An unremarkable riverside warehouse at the edge of a diverted channel, corrugated walls patched and streaked black, a couple of loitering human guards by a side door with no signage, the Great Jungle's treeline crowding close behind it, a faint rhythm of music leaking through the warehouse wall."
  },
  {
    id: 'loc_the_lakeside_bar_interior',
    name: 'The Lakeside Bar',
    notePath: 'Locations/Bandawang/The Lakeside Bar.md',
    shot: 'interior',
    prompt: "Inside a hidden pirate-den-styled speakeasy: rough wooden pillars and long tables lit by candle stubs jammed into bottle necks, ghoul patrons crowded in rowdy conversation, a back counter stacked with unmarked bottles and quietly traded black-market goods, a card game running quietly at the far table."
  },
  {
    id: 'loc_the_protectron_yard_entrance',
    name: 'The Protectron Yard',
    notePath: 'Locations/Bandawang/The Protectron Yard.md',
    shot: 'entrance',
    prompt: "The Protectron Yard: dry hard-packed earth underfoot, the staked-out foundation outlines of half-finished kampong homes laid across the plot, stacked timber and cement bags between them. Seven boxy pre-war Protectrons go about utility tasks among the works. At the yard's centre the new community hall has just been roofed — a concrete building in Minangkabau style with sweeping upswept buffalo-horn gables, their soaring roof built in traditional dark timber over the raw concrete walls below. The roof's centre is deliberately left open to the sky."
  },
  {
    id: 'loc_the_protectron_yard_interior',
    name: 'The Protectron Yard',
    notePath: 'Locations/Bandawang/The Protectron Yard.md',
    shot: 'interior',
    prompt: "Inside the newly roofed community hall: a cozy but barely furnished room, bright with natural daylight pouring down through the open roof aperture at the centre onto a bare swept concrete floor. A single crafting bench with assorted hand tools stands in one corner; simple worn bedding is laid out in another. A large teak dining table with heavy wooden chairs sits in the middle of the room. The feel is unfinished CONSTRUCTION — clean new concrete, sawdust, the smell of timber — not decay."
  },
  {
    id: 'loc_the_rakan_community_center_entrance',
    name: 'The Rakan Community Center',
    notePath: 'Locations/Bandawang/The Rakan Community Center.md',
    shot: 'entrance',
    prompt: "The Rakan Community Center, nestled among close-packed homes: a repurposed multi-purpose hall lovingly refurbished with fresh paint and new concrete, its outer walls covered in community-made murals of peaceful people and children, bright and hand-painted. A playground of salvaged pipe swings and a climbing frame stands out front on swept paved ground. Warm light spills from the windows. Cared for, well used, and plainly the heart of its neighbourhood."
  },
  {
    id: 'loc_the_rakan_community_center_interior',
    name: 'The Rakan Community Center',
    notePath: 'Locations/Bandawang/The Rakan Community Center.md',
    shot: 'interior',
    prompt: "Inside the Rakan Community Center's main hall: crowded, messy and thoroughly lived in. Children's chalk and paint drawings cover the lower walls beside bright community murals; racks of rifles are mounted high up, deliberately out of a child's reach. An infirmary corner holds cots with sick and injured residents; a shared cafeteria with long trestle tables occupies the far corner; makeshift bedding fills the others. Washing is strung overhead. Warm, busy, safe."
  },
  {
    id: 'loc_the_scrapyard_entrance',
    name: 'The Scrapyard',
    notePath: 'Locations/Bandawang/The Scrapyard.md',
    shot: 'entrance',
    prompt: "The Scrapyard in North Bandawang: great unsorted mountains of scrap metal heaped across a wide flat yard, engine blocks, bent sheet steel, stripped chassis and cabling piled awaiting sorting, with narrow worked paths of compacted rubble and broken concrete running between them. Stalls of picked-over components shelter under patched awnings at the yard's edge, a rusted weighing scale hanging beside the entrance. Any vehicle wreck in the piles is retro-futurist fifties styling, never a modern car."
  },
  {
    id: 'loc_the_scrapyard_interior',
    name: 'The Scrapyard',
    notePath: 'Locations/Bandawang/The Scrapyard.md',
    shot: 'interior',
    prompt: "Inside a crowded scrap-stall shed: shelves of sorted components from wiring spools to cracked fusion battery casings, a workbench cluttered with tools beside a hand-scrawled price board, hazy light falling through gaps in the corrugated roof above, a hand-drawn inventory chart tacked above the workbench."
  },
  {
    id: 'loc_the_tortoise_palace_entrance',
    name: 'The Tortoise Palace',
    notePath: 'Locations/Bandawang/The Tortoise Palace.md',
    shot: 'entrance',
    prompt: "The Tortoise Palace in Bandawang Lama: a grand two-floor casino built into a former bus terminal where Shanghai Bund grandeur meets Malaysian post-colonial art deco — a stepped deco facade in cream and jade with curved corners and vertical fluting, lit by warm salvaged bulbs, dark repurposed timber doors in faded red and gold beneath. Standing at the entrance is an enormous gnarled hardwood log carved into a tortoise, magnificent and weathered smooth by handling, one end of it blackened and charred by fire. The forecourt is laid asphalt, swept clean."
  },
  {
    id: 'loc_the_tortoise_palace_interior',
    name: 'The Tortoise Palace',
    notePath: 'Locations/Bandawang/The Tortoise Palace.md',
    shot: 'interior',
    prompt: "Inside the Tortoise Palace's main gaming floor: a grand speakeasy in the Shanghai Bund manner rendered in Malaysian Chinese materials — a deco mezzanine balustrade in polished brass and dark timber, fluted columns, etched glass panels, red-and-gold lacquer, a fifteen-foot carved wooden dragon coiling overhead, broken and charred in places but still majestic. Suited dealers work worn card tables, a huge jug of iced water sits on the lobby counter, and one of the wasteland's few working air conditioners hums above. Immaculately kept and warmly lit."
  },
  {
    id: 'loc_seio_peng_brothers_rnr_entrance',
    name: 'seio (Peng Brothers RNR)',
    notePath: 'Locations/Bandawang/seio (Peng Brothers RNR).md',
    shot: 'entrance',
    prompt: "A hollow pre-war petrol station beside the Longest Road, faded Poseidon Oil lettering still visible above the forecourt, a large windmill turning atop the roof, old fuel nozzles replaced with fusion-battery charging terminals under a patched awning, a hand-painted menu board propped beside the garage door."
  },
  {
    id: 'loc_seio_peng_brothers_rnr_interior',
    name: 'seio (Peng Brothers RNR)',
    notePath: 'Locations/Bandawang/seio (Peng Brothers RNR).md',
    shot: 'interior',
    prompt: "Inside the garage-diner: travellers seated at mismatched tables over bowls of brahmin rendang, a charging rack of fusion batteries humming behind the counter, worn tools and spare parts hung along the back wall, warm lamp light against the dusk outside."
  },
  {
    id: 'loc_the_rakan_community_center_office',
    name: 'The Rakan Community Center',
    notePath: 'Locations/Bandawang/The Rakan Community Center.md',
    shot: 'office',
    prompt: "Boss Bob's office in the basement beneath the Rakan Community Center: it reads as a football coach's room rather than an administrator's. Old team pennants, framed squad photographs and scuffed trophies crowd the walls, a battered timber desk is stacked with residential paperwork for Bandawang Baru, a tactics board leans in the corner, and a bare bulb hangs over a cracked leather chair. Tidy in its own cluttered way, and the only room in the building with no children's drawings on the walls."
  },
  {
    id: 'loc_the_rakan_community_center_bunker',
    name: 'The Rakan Community Center',
    notePath: 'Locations/Bandawang/The Rakan Community Center.md',
    shot: 'bunker',
    prompt: "The cleared-out private residential bunker beneath the Rakan Community Center: a bare reinforced concrete room stripped of everything it once held, empty anchor bolts and cut conduit stubs marking where bunks and fittings used to be, a heavy pre-war blast door standing open at one end, a single strip light over swept bare floor. Dry, sound and completely empty — cleared deliberately, not looted."
  },
  {
    id: 'loc_the_cement_works_entrance',
    name: 'The Cement Works',
    notePath: 'Locations/Bandawang/The Cement Works.md',
    shot: 'entrance',
    prompt: "The dead pre-war cement works at the centre of Bandawang: a vast silent industrial hulk of silo towers, a long collapsed rotary kiln lying broken on its cradles, and conveyor gantries sagging between them, all in bleached grey concrete stained with rust runs. The town has grown right up to its fence line on every side without anyone claiming it. A wide asphalt approach road, cracked and patched, runs to chained gates. No smoke, no light, nothing working."
  },
  {
    id: 'loc_the_cement_works_interior',
    name: 'The Cement Works',
    notePath: 'Locations/Bandawang/The Cement Works.md',
    shot: 'interior',
    prompt: "Inside the dead cement works' main grinding hall: enormous ball mills and drive gearing seized in place under a torn roof, grey dust lying thick and undisturbed over every surface, shafts of hazy daylight falling through holes in the sheeting far above. Empty, cavernous and quiet. Derelict, abandoned and long picked over — nobody works here and nobody lives here."
  },
];

// A flat accessor, mirroring tools/art-slots.mjs's allSlots() shape.
// --- UPKEEP (GM ruling, 26 Sep 2026) -------------------------------
// The shared climate clause describes 170 years of monsoon doing its
// work: mould and algae from the top down, rust weeping, damp surfaces.
// That is right for an exterior and right for a ruin. It is wrong for
// the inside of a place people actually use — a bunker is kept, monks
// sweep their own prayer hall, and any business that wants custom
// cleans its floor. The first pass put moss on all of them.
//
// So interiors declare their upkeep. KEPT_INTERIORS are inhabited,
// staffed or in daily use: they get grime, soot, oil, scuffs, patches
// and repairs — the wear of use — but no biological growth. Every other
// interior is abandoned or ruined and keeps the decay clause, because
// that is the whole point of the shot.
export const KEPT_INTERIORS = new Set([
  // lived in
  'loc_bandar_buaya_interior',
  'loc_bandawang_baru_interior',
  // working premises
  'loc_batu_kapur_interior',
  'loc_the_scrapyard_interior',
  'loc_seio_peng_brothers_rnr_interior',
  'loc_the_lakeside_bar_interior',
  // gambling houses — takings depend on looking respectable
  'loc_bandawang_lama_interior',
  'loc_kulim_interior',
  'loc_syurga_interior',
  'loc_the_tortoise_palace_interior',
  'loc_the_free_city_of_bandawang_interior',
  'loc_north_bandawang_interior',
  // institutions that maintain themselves
  'loc_maqil_monastery_interior',
  'loc_round_city_interior',
  'loc_federal_cultural_library_interior',
  'loc_the_education_center_interior',
  'loc_the_rakan_community_center_interior',
  'loc_the_rakan_community_center_office',
  'loc_the_rakan_community_center_bunker',
  // manned posts and bunkers
  'loc_perdana_bunker_interior',
  'loc_wira_bunker_interior',
  'loc_fortress_city_of_penang_interior',
  'loc_federation_checkpoint_interior',
  'loc_federation_recruitment_center_interior',
  'loc_the_bandawang_enforcer_station_b_e_station_interior'
]);

// --- GROUND (GM ruling, 26 Sep 2026) -------------------------------
// The first pass gave nearly every exterior a red laterite mud track.
// People do not keep walking through mud for 170 years — they pave, or
// they lay stone, or they patch what the pre-war world already left
// them. So a location standing on pre-war ground, or held by anyone who
// maintains it, gets a MADE SURFACE: cracked asphalt, patched concrete,
// worn cobbles or laid brick. Bad condition, yes. Mud, no.
//
// This is the exterior half of the same rule as KEPT_INTERIORS: the
// question is always "does anyone look after this place?"
export const PAVED_LOCATIONS = new Set([
  // pre-war towns and infrastructure — the roads were already there
  'loc_bandawang_baru_entrance',
  'loc_bandawang_lama_entrance',
  'loc_north_bandawang_entrance',
  'loc_the_free_city_of_bandawang_entrance',
  'loc_kuala_lumpur_baru_entrance',
  'loc_kulim_entrance',
  'loc_fortress_city_of_penang_entrance',
  'loc_the_longest_road_entrance',
  'loc_the_north_south_railway_entrance',
  'loc_sekitar_litar_entrance',   // a pre-war test track IS the surface
  'loc_protiga_hq_entrance',
  'loc_the_scrapyard_entrance',
  'loc_federal_cultural_library_entrance',
  'loc_abave_highlands_entrance',
  'loc_frim_entrance',
  // held and maintained by someone with an interest in keeping it usable
  'loc_federation_checkpoint_entrance',
  'loc_federation_recruitment_center_entrance',
  'loc_perdana_bunker_entrance',
  'loc_wira_bunker_entrance',
  'loc_the_bandawang_enforcer_station_b_e_station_entrance',
  'loc_the_rakan_community_center_entrance',
  'loc_the_education_center_entrance',
  'loc_kelam_sungai_entrance',
  'loc_the_tortoise_palace_entrance',
  'loc_the_cement_works_entrance',
  'loc_syurga_entrance',
  'loc_seio_peng_brothers_rnr_entrance',
  'loc_the_lakeside_bar_entrance'
]);

export function allLocationShots() {
  return LOCATION_SHOTS;
}
