// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const bestiaryDatabase = {
  automated_turret: {
    "id": "automated_turret",
    "name": "Automated Turret",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "art/bestiary/automated_turret.jpg",
    "image_prompt": "A squat automated gun turret of riveted steel on a bulbous 1950s housing, with a glass sensor eye, a pair of stubby cannon barrels, a rounded laser emitter and a short flame nozzle, its chrome trim pitted and scorched at the muzzles. Plain and unmarked, not a sleek modern turret. Bolted to a concrete bunker roof beside a steel gate.",
    "description": "An automated turret usually indicate fortified positions and can usually be found at places of value such as an army bases, reactors or VIP residences. Can be hacked in melee range or disabled elsewhere like a computer terminal.",
    "notes": "Can attack once in a cone fire. Must adjust view, if adjusting and attacking halve damage. Reload takes 1 turn.",
    "stats": {
      "hp": 75,
      "variance_bias": "normal",
      "sequence": 16,
      "crit_chance": 5,
      "ac": 28,
      "dtdr": {
        "normal": {
          "dt": 5,
          "dr": 40
        },
        "laser": {
          "dt": 8,
          "dr": 60
        },
        "fire": {
          "dt": 4,
          "dr": 30
        },
        "plasma": {
          "dt": 4,
          "dr": 50
        },
        "explosive": {
          "dt": 6,
          "dr": 40
        }
      },
      "resistances": {
        "energy": -50,
        "poison": 100,
        "rad": 100,
        "gas": 100,
        "emp": -50
      },
      "special": {
        "str": 0,
        "per": 8,
        "end": 0,
        "cha": 0,
        "int": 0,
        "agi": 0,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Medium Fire",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d6+15",
        "effect": "Burst fire of 15 rounds. -5 AC and -15 DR. 800 shots.",
        "dmgType": "normal"
      },
      {
        "name": "Heavy Fire",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d8+15",
        "effect": "Burst fire of 15 rounds. -10 AC and -20 DR. 800 shots.",
        "dmgType": "normal"
      },
      {
        "name": "Flame",
        "hit_percent": 80,
        "action": "Flame",
        "damage": "3d10+30",
        "effect": "Medium range flame. 5 shots.",
        "dmgType": "fire"
      },
      {
        "name": "Laser",
        "hit_percent": 75,
        "action": "Laser",
        "damage": "5d4+15",
        "effect": "Burst fire of 15 rounds. 800 shots.",
        "dmgType": "laser"
      },
      {
        "name": "Anti-Tank Cannon",
        "hit_percent": 80,
        "action": "Attack",
        "damage": "7d8+30",
        "effect": "-20 AC and -50 DR. 1 shot. May not fire and adjust.",
        "dmgType": "explosive"
      }
    ]
  },
  ayam_berkepala_tiga: {
    "id": "ayam_berkepala_tiga",
    "name": "Ayam Berkepala Tiga",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/ayam_berkepala_tiga.jpg",
    "image_prompt": "A plump kampung chicken, red-brown with black-flecked feathers, three separate heads on three necks rising from one body, each with its own bright eye, bare red wattle and sharp yellow beak. Ordinary chicken size, wing feathers ragged and sun-faded. Standing on a cracked concrete step of a kampung yard.",
    "description": "A three-headed chicken, ordinary-sized and ordinary-tempered until something sets it off — though farmers swear the ones left to feed long enough grow as big as a kerbau. The ones that end up fried still have all three heads on the plate.",
    "notes": "Has 3 attacks (one peck per head) and 1 move.",
    "stats": {
      "hp": 19,
      "variance_bias": "normal",
      "sequence": 8,
      "crit_chance": 4,
      "ac": 10,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 10,
        "rad": 10,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 3,
        "per": 5,
        "end": 3,
        "cha": 1,
        "int": 1,
        "agi": 5,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Left Head Peck",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Centre Head Peck",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Right Head Peck",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  belangkas: {
    "id": "belangkas",
    "name": "Belangkas",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/belangkas.jpg",
    "image_prompt": "A horseshoe crab, its domed olive-brown shell shaped like a horseshoe and as wide as a dinner tray, dulled with grey silt and old scratches, a long spiked tail stiff behind it, six pairs of jointed walking legs folded beneath, and a pale greenish-cream underside showing at the edge. A mangrove shoreline of grey-brown mud among exposed roots.",
    "description": "It was crawling these shallows before there were trees on land, and the war has not changed it much either. It is slow, it does not hunt, and it does not care that you are there, which is the strangest thing about it. The labs pay by the litre for its blue blood, and a mangrove shore littered with drained shells says who has been coming down to take it.",
    "notes": "Low threat. Has 1 attack and 1 move, both defensive. Moves one space a turn at most and never closes on a foe. It only strikes when handled or stood on. Flipped onto its back, it cannot right itself.",
    "stats": {
      "hp": 30,
      "variance_bias": "normal",
      "sequence": 2,
      "crit_chance": 1,
      "ac": 6,
      "dtdr": {
        "normal": {
          "dt": 4,
          "dr": 40
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 30,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 3,
        "per": 2,
        "end": 9,
        "cha": 1,
        "int": 1,
        "agi": 1,
        "luk": 2
      }
    },
    "attacks": [
      {
        "name": "Telson Jab",
        "hit_percent": 40,
        "action": "Attack",
        "damage": "1d4",
        "effect": "Only when handled or stood on. The spine is blunt and the crab is not trying to hurt you.",
        "dmgType": "normal"
      },
      {
        "name": "Crawl Away",
        "hit_percent": 100,
        "action": "Defend",
        "damage": "0",
        "effect": "Moves one space away from the nearest foe. Small action.",
        "dmgType": "normal"
      }
    ]
  },
  beruk: {
    "id": "beruk",
    "name": "Beruk",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/beruk.jpg",
    "image_prompt": "A pig-tailed macaque, lean and grey-furred, with a bare pink-tan face, a short curled tail like a pig's tail, long canines bared in a snarl, and a bundle of stolen food clutched to its chest. Mangy patches on the shoulders, scarred ears. Perched on the sagging ridge of a palm-thatch roof.",
    "description": "A mutated beruk — lean, grey-furred and permanently furious. They travel in troops, take what they want, bite anyone slow about handing it over, and throw what they have been saving at anyone who argues.",
    "notes": "Can attack and move. Never alone: troops of three or more, and an Ibu Beruk is usually close by.",
    "stats": {
      "hp": 40,
      "variance_bias": "normal",
      "sequence": 18,
      "crit_chance": 5,
      "ac": 15,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 10
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": -10
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 5
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 40,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 4,
        "per": 6,
        "end": 4,
        "cha": 3,
        "int": 3,
        "agi": 9,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Claw",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Bite",
        "hit_percent": 55,
        "action": "Attack",
        "damage": "1d4+2",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Throw Berak",
        "hit_percent": 55,
        "action": "Attack",
        "damage": "1d3",
        "effect": "A handful of whatever was to hand. On a failed Endurance check the target is Distracted — too busy with what is on them to do anything useful.",
        "dmgType": "normal",
        "save": {
          "stat": "end",
          "tier": "normal"
        },
        "apply_effect": {
          "id": "distracted",
          "duration_turns": 1,
          "on": "save_failed"
        }
      }
    ]
  },
  biawak_gergasi: {
    "id": "biawak_gergasi",
    "name": "Biawak Gergasi",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/biawak_gergasi.jpg",
    "image_prompt": "A Malayan water monitor grown well past the size of a dog, olive-black skin barred and speckled with cream-yellow, a ridge of armoured scales down its back, a long neck, a pointed snout with a forked tongue, and a thick flattened tail. Old scars and a torn ear, one flank with a swollen weeping bite wound, claws dug into the lip of a storm-drain grate beside a brown monsoon river.",
    "description": "A Malayan water monitor grown well past the size of a dog, and it no longer runs from people. It waits on the lip of a storm drain until you are close enough, having worked out that a settlement is a dependable larder, and whatever it takes it drags towards the water. The bite smells sweet and wrong by the next morning.",
    "notes": "Has 3 attacks and 1 move (crawls up to 3 spaces to reach a foe). Prefers Seize: a seized foe is dragged one space a turn towards the nearest water and cannot take a move action of their own until free. Bold rather than aggressive: once it has its meal, or a foe is in the water, it lets go and leaves. It fights to the end only when cornered. The spine plates are already in its DT and DR.",
    "stats": {
      "hp": 85,
      "variance_bias": "normal",
      "sequence": 9,
      "crit_chance": 5,
      "ac": 12,
      "dtdr": {
        "normal": {
          "dt": 4,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 30,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 5,
        "end": 6,
        "cha": 1,
        "int": 2,
        "agi": 5,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Bite",
        "hit_percent": 70,
        "action": "Poison",
        "damage": "2d6+3",
        "effect": "Septic. Foe makes an EN check or takes 1d4 damage a turn for 3 turns.",
        "dmgType": "poison"
      },
      {
        "name": "Tail Whip",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d8+2",
        "effect": "Foe makes an AG check or is knocked down.",
        "dmgType": "normal"
      },
      {
        "name": "Seize",
        "hit_percent": 60,
        "action": "SM",
        "damage": "1d10+2",
        "effect": "Grabs the foe and drags them one space a turn towards the nearest water. Foe makes a STR check at the start of each of their turns to break free.",
        "dmgType": "normal"
      }
    ]
  },
  brahmin: {
    "id": "brahmin",
    "name": "Brahmin",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/brahmin.jpg",
    "image_prompt": "A Fallout brahmin, the two-headed mutated cow: one body with two complete heads on a single thick neck base, both heads carrying horns, a patchy scarred hide in dun and dirty grey with pink scar tissue showing through, ribs visible along the flank, a broken cart harness still buckled across the shoulders. Not a one-headed cow. On a cracked concrete yard in front of a handcart.",
    "description": "A two-headed mutated cow and the Peninsula's draught beast. It hauls carts, ploughs the padi bunds and drags whatever the caravan cannot carry. Both heads have horns, and both have opinions about which way the cart is going. Brahmin pull the long-haul caravans on the roads between settlements, where a beast that can carry its own water matters; the kerbau stays in the padi and pulls the plough.",
    "notes": "Not aggressive unless cornered or provoked. Slow to act, and fights only when it has nowhere to go. Usually harnessed to a cart and stands still until its driver is threatened.",
    "stats": {
      "hp": 96,
      "variance_bias": "normal",
      "sequence": 4,
      "crit_chance": 3,
      "ac": 6,
      "dtdr": {
        "normal": {
          "dt": 4,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 20,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 8,
        "per": 4,
        "end": 8,
        "cha": 2,
        "int": 1,
        "agi": 2,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Horn Gore",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "2d6+3",
        "effect": "Used only when cornered or provoked.",
        "dmgType": "normal"
      },
      {
        "name": "Kick",
        "hit_percent": 45,
        "action": "Attack",
        "damage": "1d10+2",
        "effect": "Hind-leg kick at anything standing behind it.",
        "dmgType": "normal"
      }
    ]
  },
  construction_protectron: {
    "id": "construction_protectron",
    "name": "Construction Protectron",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "art/bestiary/construction_protectron.jpg",
    "image_prompt": "A Fallout Protectron, not a humanoid android: a squat barrel-bodied robot on two stubby legs, a domed head with a single wide glowing visor band, segmented arms ending in tool claws, one arm swapped for a pneumatic nail and spike driver. Faded pre-War construction paint chipped to bare steel and rusted at the joints. Standing on a half-built concrete slab among rebar stubs.",
    "description": "A pre-War construction-site Protectron, still cycling through its work order decades after the site closed. Its nail and spike driver was never meant to be a weapon, but it swings it like one at anything that trips its motion sensor.",
    "notes": "Electrical/EMP weakness: -50 energy resistance, and an EMP effect disables it for a round. Drops ammo_nails when destroyed.",
    "stats": {
      "hp": 76,
      "variance_bias": "normal",
      "sequence": 9,
      "crit_chance": 5,
      "ac": 10,
      "dtdr": {
        "normal": {
          "dt": 8,
          "dr": 38
        },
        "laser": {
          "dt": 5,
          "dr": 25
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": -50,
        "poison": 100,
        "rad": 100,
        "gas": 100,
        "emp": -50
      },
      "special": {
        "str": 8,
        "per": 6,
        "end": 6,
        "cha": 0,
        "int": 3,
        "agi": 2,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Nail and Spike Driver",
        "hit_percent": 74,
        "action": "Attack",
        "damage": "2d6+4",
        "effect": "Pneumatic construction tool repurposed as a weapon.",
        "dmgType": "normal"
      }
    ]
  },
  federation_commando: {
    "id": "federation_commando",
    "name": "Federation Commando",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/federation_commando.jpg",
    "image_prompt": "A Malay Federation commando in a sun-faded lavender field jacket with a high orange stand collar, brass buttons and a wide brown leather belt, a steel helmet painted lavender, a rifle held across the chest. Lean and fast, with a hard, watchful face and scuffed boots. Standing at a bullet-pocked concrete checkpoint barrier.",
    "description": "An elite Federation shock trooper, fast and lethal, sent in where regular conscripts would only break against the line.",
    "notes": "Boss immunity: One Shot One Kill instead deals 20 true damage. Relentless: may take a second full attack this turn, at -30 hit. Suggested package (BALANCE_PROPOSAL §6.5): Relentless (second attack at -30) + boss, roughly 63% win rate for a level-7 party against two Commandos.",
    "stats": {
      "hp": 77,
      "variance_bias": "normal",
      "sequence": 14,
      "crit_chance": 8,
      "ac": 28,
      "dtdr": {
        "normal": {
          "dt": 7,
          "dr": 45
        },
        "laser": {
          "dt": 3,
          "dr": 30
        },
        "fire": {
          "dt": 3,
          "dr": 30
        },
        "plasma": {
          "dt": 3,
          "dr": 30
        },
        "explosive": {
          "dt": 4,
          "dr": 35
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 7,
        "end": 6,
        "cha": 5,
        "int": 6,
        "agi": 8,
        "luk": 6
      }
    },
    "attacks": [
      {
        "name": "Rifle",
        "hit_percent": 110,
        "action": "Attack",
        "damage": "3d10+8",
        "effect": "Has 20 shots. Relentless: may take a second full attack this turn at -30 hit.",
        "dmgType": "normal"
      }
    ]
  },
  federation_heavy: {
    "id": "federation_heavy",
    "name": "Federation Heavy",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/federation_heavy.jpg",
    "image_prompt": "A Chinese Federation frontliner in heavy plate: a lavender-painted riveted steel breastplate and shoulder guards over a lavender field jacket with an orange collar, a lavender steel helmet, and a light machine gun with a box magazine, its steel blued and worn. Not an FN MAG, not a modern squad gun. Standing behind a steel gate checkpoint.",
    "description": "A Federation Frontliner in heavy armour — the bunker state's answer to a real firefight, rarely deployed but devastating when it is.",
    "notes": "Has 1 attack and 1 move. Deployed only when the Federation commits to a fight for real.",
    "stats": {
      "hp": 81,
      "variance_bias": "normal",
      "sequence": 12,
      "crit_chance": 6,
      "ac": 26,
      "dtdr": {
        "normal": {
          "dt": 7,
          "dr": 45
        },
        "laser": {
          "dt": 2,
          "dr": 20
        },
        "fire": {
          "dt": 2,
          "dr": 20
        },
        "plasma": {
          "dt": 2,
          "dr": 20
        },
        "explosive": {
          "dt": 3,
          "dr": 25
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 7,
        "per": 6,
        "end": 7,
        "cha": 4,
        "int": 5,
        "agi": 5,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Light Machine Gun",
        "hit_percent": 80,
        "action": "Attack",
        "damage": "2d8+6",
        "effect": "Has 30 shots. Burst of 8 rounds. -10 AC and -15 DR.",
        "dmgType": "normal"
      }
    ]
  },
  federation_regular: {
    "id": "federation_regular",
    "name": "Federation Regular",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/federation_regular.jpg",
    "image_prompt": "An Indian Federation conscript in a sun-faded lavender field jacket with an orange collar and brass buttons, a lavender-painted WW1-pattern steel helmet a size too big, and an old bolt-action hunting rifle with a worn wooden stock and frayed sling. Not a military service rifle. Thin and earnest, standing by a lamppost on a cracked tarmac road.",
    "description": "A Federation of Malaya conscript, drilled well but supplied poorly — the bunker state's citizen army, sent out in whatever's left in the armoury.",
    "notes": "Has 1 attack and 1 move. Poorly equipped next to Protectorate regulars; noticeably weaker against energy weapons.",
    "stats": {
      "hp": 57,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 5,
      "ac": 19,
      "dtdr": {
        "normal": {
          "dt": 3,
          "dr": 30
        },
        "laser": {
          "dt": 1,
          "dr": 10
        },
        "fire": {
          "dt": 1,
          "dr": 15
        },
        "plasma": {
          "dt": 1,
          "dr": 15
        },
        "explosive": {
          "dt": 1,
          "dr": 20
        }
      },
      "resistances": {
        "energy": -10,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 5,
        "end": 5,
        "cha": 4,
        "int": 4,
        "agi": 5,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Hunting Rifle",
        "hit_percent": 63,
        "action": "Attack",
        "damage": "2d8+2",
        "effect": "Has 5 shots.",
        "dmgType": "normal"
      }
    ]
  },
  feral_ghoul: {
    "id": "feral_ghoul",
    "name": "Feral Ghoul",
    "type": "monster",
    "creature_type": "Ghoul",
    "icon": "art/bestiary/feral_ghoul.jpg",
    "image_prompt": "A Fallout ghoul: skin like cracked sun-dried leather in mottled grey and raw pink, split open in places to the flesh, no nose, no hair, lipless mouth drawn back from the teeth, long clawed fingers, rotted rags hanging from its hips. Hunched and hungry. Not a scarred man, not a burn victim, not a weathered human. Standing at the mouth of a concrete storm drain.",
    "description": "A ghoul who lost the fight for their own mind. No citizenship, no 'uncle' or 'auntie' — just hunger and claws, shambling in packs toward anything that moves.",
    "notes": "Has 1 attack and 1 move. Rad immune. Weak to fire (-15 DR).",
    "stats": {
      "hp": 41,
      "variance_bias": "normal",
      "sequence": 8,
      "crit_chance": 5,
      "ac": 8,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": -15
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 100,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 3,
        "end": 6,
        "cha": 0,
        "int": 0,
        "agi": 4,
        "luk": 3
      }
    },
    "attacks": [
      {
        "name": "Claw",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d6+8",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  giant_ant: {
    "id": "giant_ant",
    "name": "Giant Ant (Semut Besar)",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/giant_ant.jpg",
    "image_prompt": "A giant ant roughly the size of a large dog, with a glossy black-brown exoskeleton, a segmented abdomen, bent antennae and wide curved mandibles held open, saliva glinting. Nicked and scuffed carapace, pale scratches across the shell from old fights. Standing on a cracked pavement beside a rotting timber door frame.",
    "description": "Giant ants are overgrown insects. They usually travel in packs and are usually indicative that there is a huge colony somewhere nearby. Usually such creatures are merely cleared but never do people set foot into a found colony.",
    "notes": "Has 1 attack and 1 move. May not move and attack. Weak to fire (-25 DR).",
    "stats": {
      "hp": 22,
      "variance_bias": "normal",
      "sequence": 6,
      "crit_chance": 3,
      "ac": 2,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": -25
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 60,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 3,
        "end": 3,
        "cha": 1,
        "int": 1,
        "agi": 1,
        "luk": 3
      }
    },
    "attacks": [
      {
        "name": "Mandibles",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d6",
        "effect": "Poison 1 damage for 1d8 hours",
        "dmgType": "poison"
      }
    ]
  },
  giant_centipede: {
    "id": "giant_centipede",
    "name": "Giant Centipede",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/giant_centipede.jpg",
    "image_prompt": "A giant centipede longer than a man is tall, with a dark brown-black segmented body, a pale yellow underside, dozens of short jointed legs, a pair of curved venom claws at the head and long antennae whipping. Shell cracked and gritty with drain grime, one leg missing. Rising out of a storm-drain grate on a concrete pavement.",
    "description": "A monsoon-drain horror, longer than a man is tall, that comes up through the grates after heavy rain. Its bite doesn't kill outright — it just makes sure you can't run.",
    "notes": "Has 1 attack and 1 move. Poison: on a hit the target makes an EN check or takes 1d4 damage a turn for 2 turns. Weak to fire (-25 DR).",
    "stats": {
      "hp": 58,
      "variance_bias": "normal",
      "sequence": 9,
      "crit_chance": 5,
      "ac": 12,
      "dtdr": {
        "normal": {
          "dt": 2,
          "dr": 10
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": -25
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 50,
        "gas": 50,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 6,
        "end": 5,
        "cha": 1,
        "int": 1,
        "agi": 5,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Bite",
        "hit_percent": 70,
        "action": "Poison",
        "damage": "1d8+3",
        "effect": "Foe makes an EN check or takes 1d4 damage a turn for 2 turns.",
        "dmgType": "poison"
      }
    ]
  },
  giant_leeches: {
    "id": "giant_leeches",
    "name": "Giant Leeches",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
    "image_prompt": "SEVERAL giant jungle leeches together, five or six of them, not one. Each the length of a hand, glossy and dark olive-brown with a thin amber stripe down the back, bodies ringed and muscular. Some are stretched out flat on wet leaf litter, one or two are reared up on their rear suckers and casting about blindly for warmth, and one has gone fat and dark red with blood. On the wet forest floor beside a muddy jungle trail.",
    "description": "You never find them; they find you, and you usually notice by the weight, or the cold, or a sock gone dark and heavy at the top. They go on so quietly that nobody feels them go on, and what they leave keeps bleeding for hours after they have come off. Pull one off and its mouth stays in the wound, so the only clean way is a burning cigarette or a lit match held to its body until it drops away.",
    "notes": "Hazard, not an encounter. Run it as an environmental complication rather than a fight. Whenever a character wades a flooded jungle floor, a wet drain or standing water in the rain, roll Attach against each character once per scene (or once per hour of travel). Attach is silent. The victim notices only on a PE check, which the GM may call at any point. Drain costs 1 HP a turn while attached. Burning it off makes it let go and it takes fire damage; the wound then bleeds at the minor rate (1 a turn) for several hours. Pulling it off leaves the mouth in, and the wound bleeds at double rate until cauterised or stitched.",
    "stats": {
      "hp": 8,
      "variance_bias": "normal",
      "sequence": 3,
      "crit_chance": 1,
      "ac": 4,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": -50
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 50,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 1,
        "per": 3,
        "end": 4,
        "cha": 1,
        "int": 1,
        "agi": 4,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Attach",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "0",
        "effect": "Silent. The victim feels nothing on attaching.",
        "dmgType": "normal"
      },
      {
        "name": "Drain",
        "hit_percent": 100,
        "action": "Attack",
        "damage": "1",
        "effect": "Automatic while attached. Costs 1 HP each turn.",
        "dmgType": "normal"
      }
    ]
  },
  giant_rat: {
    "id": "giant_rat",
    "name": "Giant Rat",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/giant_rat.jpg",
    "image_prompt": "A giant mutated rat the size of a small dog, with scruffy grey-brown fur and bald scar patches, long yellow incisors bared, a bare pink tail dragging behind, torn ears, stiff wide whiskers and a raw wound on one shoulder. Standing on a cracked pavement beside a heap of torn woven sacks.",
    "description": "A giant mutated rat. One of the most common vermins in the wastes, aside from perhaps the Lipas-Lipas. Worrying enough to be dealt with but not enough of a threat to warrant an armed response, often times a neighborhood would gather strong adults or bounty hunters to exterminate nests nearby.",
    "notes": "Has 1 attack and 1 move.",
    "stats": {
      "hp": 10,
      "variance_bias": "normal",
      "sequence": 6,
      "crit_chance": 3,
      "ac": 5,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 50,
        "rad": 20,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 2,
        "per": 4,
        "end": 1,
        "cha": 1,
        "int": 1,
        "agi": 4,
        "luk": 3
      }
    },
    "attacks": [
      {
        "name": "Claw",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "1d4",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Bite",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4",
        "effect": "Poison 1 damage for 1d8 hours",
        "dmgType": "poison"
      }
    ]
  },
  giant_vicious_dog: {
    "id": "giant_vicious_dog",
    "name": "Giant Vicious Dog",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/giant_vicious_dog.jpg",
    "image_prompt": "A kampong mongrel grown huge, tan and brindle, with a thick-muscled chest and neck, a broad skull, a jaw wide enough to take an arm off, yellow fangs bared, a scarred muzzle and cropped ears. Sinew bulges under the coat and the legs are heavy and straight. Standing on a cracked concrete yard in front of a kampong house.",
    "description": "A Vicious Dog that kept eating and kept mutating, until its jaw could take an arm off. Radiation thickened its muscle before it thickened its skull.",
    "notes": "Has 1 attack and 1 move. Larger, radiation-thickened cousin of the Vicious Dog; shrugs off small arms fire.",
    "stats": {
      "hp": 47,
      "variance_bias": "normal",
      "sequence": 9,
      "crit_chance": 5,
      "ac": 10,
      "dtdr": {
        "normal": {
          "dt": 1,
          "dr": 10
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 20,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 6,
        "end": 6,
        "cha": 1,
        "int": 1,
        "agi": 6,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Bite",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d6+3",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  ibu_beruk: {
    "id": "ibu_beruk",
    "name": "Ibu Beruk",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/ibu_beruk.jpg",
    "image_prompt": "A pig-tailed macaque matriarch, large and heavy across the shoulders, grey-furred with a bare pink-tan face, a short curled tail and long canines. Her mouth is wide open in a shriek, shoulder fur bristling, one arm raised with long hooked claws. Standing on the broken top of a shophouse wall.",
    "description": "The matriarch of a troop of mutated beruk. Grey-furred and heavy across the shoulders, she is far faster than her size suggests and fiercely protective of the troop. She screams once before she comes.",
    "notes": "Can attack and move. Never found alone — a troop of Beruk is always nearby, and they join in once she engages.",
    "stats": {
      "hp": 50,
      "variance_bias": "normal",
      "sequence": 18,
      "crit_chance": 7,
      "ac": 16,
      "dtdr": {
        "normal": {
          "dt": 1,
          "dr": 15
        },
        "laser": {
          "dt": 0,
          "dr": 5
        },
        "fire": {
          "dt": 0,
          "dr": -10
        },
        "plasma": {
          "dt": 0,
          "dr": 5
        },
        "explosive": {
          "dt": 0,
          "dr": 10
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 40,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 7,
        "per": 6,
        "end": 6,
        "cha": 3,
        "int": 3,
        "agi": 8,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Claw",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Bite",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d6+3",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Screech",
        "hit_percent": 100,
        "action": "SM",
        "damage": "0",
        "effect": "Every Beruk in earshot joins the fight on her next turn. Each foe in earshot makes an Endurance check or takes Ears Ringing (-2 PER for 1 turn).",
        "dmgType": "true",
        "save": {
          "stat": "end",
          "tier": "normal"
        },
        "apply_effect": {
          "id": "ears_ringing",
          "duration_turns": 1,
          "on": "save_failed"
        }
      },
      {
        "name": "Throw Berak",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d4",
        "effect": "A handful of whatever was to hand. On a failed Endurance check the target is Distracted — too busy with what is on them to do anything useful.",
        "dmgType": "normal",
        "save": {
          "stat": "end",
          "tier": "normal"
        },
        "apply_effect": {
          "id": "distracted",
          "duration_turns": 1,
          "on": "save_failed"
        }
      }
    ]
  },
  kerbau: {
    "id": "kerbau",
    "name": "Kerbau",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/kerbau.jpg",
    "image_prompt": "A Southeast Asian water buffalo, the kerbau: a heavy grey-black body with sparse coarse hide, mud caked to the belly and legs, long horns sweeping back and out over a broad head, one horn grown slightly crooked, a rope tether trailing from a ring through the nose, a notched ear, small watchful eyes and a faint pale scar on the shoulder. Not a bison and not a cow. In a flooded paddy field with young rice stalks standing in the water around its legs.",
    "description": "The Malaysian water buffalo: heavy, grey-black and mud-caked, with horns that sweep back over the neck. The ordinary farm animal of Bandawang, ploughing the padi fields and wallowing in every ditch, placid until it is not.",
    "notes": "Placid when left alone: it grazes and wallows in the mud. Startled or provoked, it bolts before it fights, and it only fights when cornered. A loose kerbau running across a paddy is a chase before it is a fight.",
    "stats": {
      "hp": 110,
      "variance_bias": "normal",
      "sequence": 3,
      "crit_chance": 3,
      "ac": 6,
      "dtdr": {
        "normal": {
          "dt": 5,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 10,
        "rad": 10,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 9,
        "per": 4,
        "end": 9,
        "cha": 1,
        "int": 1,
        "agi": 2,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Horn Toss",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "2d8+3",
        "effect": "Used only when provoked or cornered. Forces an AG check on hit or the target is Knocked Down.",
        "dmgType": "normal"
      },
      {
        "name": "Trample",
        "hit_percent": 40,
        "action": "Attack",
        "damage": "1d10+2",
        "effect": "Used while bolting. Anything in its path takes the hit.",
        "dmgType": "normal"
      }
    ]
  },
  labourer: {
    "id": "labourer",
    "name": "Labourer",
    "type": "monster",
    "creature_type": "Human/Ghoul/Mutant",
    "icon": "art/bestiary/labourer.jpg",
    "image_prompt": "An Indian labourer in faded work clothes: a sweat-darkened singlet, patched trousers and boots with broken laces. Gaunt and tired, with a heavy sledgehammer resting on one shoulder, its wooden handle cracked and bound with wire. Standing beside a half-demolished shophouse wall.",
    "description": "A labourer, worn down by hard manual work. Hungry and tired. May carry a sledgehammer. Won't fight unless their foreman orders it, and stops once the foreman is down. Killing a labourer costs the PC -10 Karma.",
    "notes": "Has 1 attack and 1 move. Not interested in fighting, unless forced.",
    "stats": {
      "hp": 35,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 5,
      "ac": 5,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 4,
        "per": 4,
        "end": 3,
        "cha": 4,
        "int": 5,
        "agi": 4,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Melee",
        "hit_percent": 55,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  lesser_panguling: {
    "id": "lesser_panguling",
    "name": "Lesser Panguling",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/lesser_panguling.jpg",
    "image_prompt": "A small mutated pangolin with overlapping armoured scales in olive-brown and bone-grey, a long tapering tail, a narrow snout with a long sticky tongue half out, and heavy curved claws on the forelegs. Scarred plates along the back. Standing on a cracked concrete path under a rain tree.",
    "description": "A mutated small pangolin. The Panguling hunts insects and are generally nocturnal. They cannot see but can smell and hear well enough to see their prey. Their tongues excrete a paralyzing poison and they have evolved a strong rolling attack which has been known to leave impacts on concrete.",
    "notes": "Has 1 attack and 1 move. May take an action to curl up and gain +5 AC.",
    "stats": {
      "hp": 20,
      "variance_bias": "normal",
      "sequence": 7,
      "crit_chance": 4,
      "ac": 15,
      "dtdr": {
        "normal": {
          "dt": 4,
          "dr": 0
        },
        "laser": {
          "dt": 1,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 1,
          "dr": 30
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 50,
        "gas": 100,
        "emp": 0
      },
      "special": {
        "str": 2,
        "per": 4,
        "end": 4,
        "cha": 1,
        "int": 2,
        "agi": 6,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Lick",
        "hit_percent": 60,
        "action": "Poison",
        "damage": "1d8",
        "effect": "Foe makes EN roll. On success the opponent loses small action.",
        "dmgType": "poison"
      },
      {
        "name": "Spray",
        "hit_percent": 70,
        "action": "Gas",
        "damage": "1d4",
        "effect": "Sprays small area around itself with gas. Enemies suffer -3 PE and take 1d4 while crossing or inside.",
        "dmgType": "poison"
      },
      {
        "name": "Curl Up",
        "hit_percent": 100,
        "action": "Defend",
        "damage": "0",
        "effect": "Gain +5 AC and -10% hit. Takes an action.",
        "dmgType": "normal"
      },
      {
        "name": "Roll",
        "hit_percent": 80,
        "action": "SM",
        "damage": "2d6",
        "effect": "Must be curled up first.",
        "dmgType": "normal"
      }
    ]
  },
  liberator_robot_follower: {
    "id": "liberator_robot_follower",
    "name": "Liberator Robot (Follower)",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "art/bestiary/liberator_robot_follower.jpg",
    "image_prompt": "A FALLOUT 76 LIBERATOR, exactly as that game depicts it, in its propaganda-broadcast variant: a small communist robot about knee height that HOVERS just off the ground, a rounded egg-shaped riveted metal body, a single large central camera eye, two short spindly jointed arms with small claws, thruster vents beneath. A battered loudspeaker horn is bolted to the top of its hull in place of the usual antenna, wired crudely along the shell. Drab military green with a red star, paint chipped. Not a humanoid android and not a Mister Handy. Hovering in a village square.",
    "description": "A curious oddity you found. It has been modified to spew UCL propaganda, yet seemingly has a mind of its own. It has been refurbished. May be upgraded with specific parts.",
    "notes": "Can attack and move. NOTE: this description text is identical to 'Monyet Sakai' in the source manual — likely a copy-paste artifact worth checking against the real page.",
    "stats": {
      "hp": 30,
      "variance_bias": "normal",
      "sequence": 15,
      "crit_chance": 5,
      "ac": 15,
      "dtdr": {
        "normal": {
          "dt": 3,
          "dr": 25
        },
        "laser": {
          "dt": 3,
          "dr": 60
        },
        "fire": {
          "dt": 3,
          "dr": 60
        },
        "plasma": {
          "dt": 3,
          "dr": 25
        },
        "explosive": {
          "dt": 5,
          "dr": 20
        }
      },
      "resistances": {
        "energy": -50,
        "poison": 100,
        "rad": 100,
        "gas": 100,
        "emp": -50
      },
      "special": {
        "str": 4,
        "per": 4,
        "end": 4,
        "cha": 4,
        "int": 7,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Laser Fire",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "1d6+3",
        "effect": "none",
        "dmgType": "laser"
      },
      {
        "name": "Headbutt",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "Foe rolls an EN check of +1. On failure knock the opponent down.",
        "dmgType": "normal"
      },
      {
        "name": "Claw",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  liberator_robot_mk1: {
    "id": "liberator_robot_mk1",
    "name": "Liberator Robot Mk 1",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "art/bestiary/liberator_robot_mk1.jpg",
    "image_prompt": "A FALLOUT 76 LIBERATOR, exactly as that game depicts it: a small communist robot about knee height that HOVERS just off the ground, a rounded egg-shaped riveted metal body, a single large central camera eye with an iris ring, two short spindly jointed arms ending in small claws, a stubby antenna on top, thruster vents beneath. Painted drab military green with a red star on the hull, paint chipped to bare metal. Not a humanoid android and not a Mister Handy. Hovering above a cracked concrete path.",
    "description": "A small, cheap and ineffective robot. This was once manufactured in large quantities as disruption based machines to distract enemy backlines. Usually where one is found there are more around.",
    "notes": "Can attack and move. Increase stats by 1 per Mk (i.e. Mk2 = these stats +1, Mk3 = +2, etc. — only the Mk1 block is given in the manual). NOTE: description text is identical to 'Ibu Sakai' in the source manual — likely a copy-paste artifact worth checking against the real page.",
    "stats": {
      "hp": 25,
      "variance_bias": "normal",
      "sequence": 12,
      "crit_chance": 6,
      "ac": 18,
      "dtdr": {
        "normal": {
          "dt": 2,
          "dr": 20
        },
        "laser": {
          "dt": 2,
          "dr": 20
        },
        "fire": {
          "dt": 2,
          "dr": 20
        },
        "plasma": {
          "dt": 2,
          "dr": 20
        },
        "explosive": {
          "dt": 2,
          "dr": 20
        }
      },
      "resistances": {
        "energy": -100,
        "poison": 100,
        "rad": 100,
        "gas": 100,
        "emp": -100
      },
      "special": {
        "str": 3,
        "per": 4,
        "end": 3,
        "cha": 1,
        "int": 3,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Laser Fire",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "1d6+2",
        "effect": "none",
        "dmgType": "laser"
      },
      {
        "name": "Claw",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  mercenary: {
    "id": "mercenary",
    "name": "Mercenary",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/mercenary.jpg",
    "image_prompt": "A Chinese mercenary in mismatched surplus combat gear: a dark tactical vest over a black shirt with sleeves rolled, a belt of spare magazines, a stubby assault rifle with a taped grip held low. Shaved head, calm and hard eyes, professional and unhurried. Standing beside a shuttered petrol station forecourt.",
    "description": "A gun-for-hire working the Peninsula's contracts — professional, well-drilled, and entirely for sale to whichever faction is paying this week.",
    "notes": "Has 1 attack and 1 move. Fights professionally: will disengage if the contract isn't worth dying for.",
    "stats": {
      "hp": 45,
      "variance_bias": "normal",
      "sequence": 11,
      "crit_chance": 6,
      "ac": 18,
      "dtdr": {
        "normal": {
          "dt": 3,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 6,
        "end": 5,
        "cha": 5,
        "int": 5,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Assault Rifle",
        "hit_percent": 77,
        "action": "Attack",
        "damage": "2d6+4",
        "effect": "Has 25 shots. Burst of 5 rounds. -5 AC and -10 DR.",
        "dmgType": "normal"
      }
    ]
  },
  pahlawan: {
    "id": "pahlawan",
    "name": "Pahlawan",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/pahlawan.jpg",
    "image_prompt": "A Malay Caliphate pahlawan in salvaged modern body armour, a black plate carrier with composite shoulder and shin plates and webbing, worn over unbleached linen robes with a samping sash at the waist and a tengkolok headcloth in ochre with turquoise edging. Holding a long wavy-bladed kris in both hands. Standing on sun-baked sandstone steps.",
    "description": "A Caliphate warrior-pilgrim on their sanctioned Hajj, sent out under the House of Syed with a mission beyond survival. What they carry as a weapon they've mastered completely — faith and discipline make them a match for anything the wasteland puts in front of them.",
    "notes": "Boss immunity: One Shot One Kill instead deals 20 true damage. Relentless: may take a second full attack this turn, at -30 hit. Optional Last Stand: the first lethal hit leaves it at 1 HP instead. Suggested package (BALANCE_PROPOSAL §6.5): Relentless (second attack at -30) + boss, roughly 56% win rate for a level-7 party against two.",
    "stats": {
      "hp": 77,
      "variance_bias": "normal",
      "sequence": 13,
      "crit_chance": 8,
      "ac": 28,
      "dtdr": {
        "normal": {
          "dt": 6,
          "dr": 40
        },
        "laser": {
          "dt": 2,
          "dr": 20
        },
        "fire": {
          "dt": 2,
          "dr": 20
        },
        "plasma": {
          "dt": 2,
          "dr": 20
        },
        "explosive": {
          "dt": 3,
          "dr": 25
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 8,
        "per": 6,
        "end": 7,
        "cha": 5,
        "int": 4,
        "agi": 8,
        "luk": 6
      }
    },
    "attacks": [
      {
        "name": "Melee Strike",
        "hit_percent": 120,
        "action": "Attack",
        "damage": "3d10+10",
        "effect": "Relentless: may take a second full attack this turn at -30 hit.",
        "dmgType": "normal"
      }
    ]
  },
  panguling: {
    "id": "panguling",
    "name": "Panguling",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/panguling.jpg",
    "image_prompt": "A full-grown mutated pangolin, broad and heavy, its overlapping scales thick as roof tiles in olive-brown and bone-grey, with scars across the plates. A long tapering tail, a narrow snout with a long sticky tongue, claws planted low for a rolling charge. Standing beside a fallen durian tree on a cracked concrete path.",
    "description": "A mutated pangolin, full grown — this is the 'Tenggiling Besar' the old-timers talk about. The Panguling exists to hunt insects and are generally nocturnal. They cannot see but can smell and hear well enough to see their prey. Their tongues excrete a paralyzing poison and they have evolved a strong rolling attack which has been known to leave impacts on concrete.",
    "notes": "Has 1 attack and 1 move. May take a small action to curl up and gain +5 AC. This is the bigger, tougher Panguling — see Lesser Panguling for the smaller kind.",
    "stats": {
      "hp": 99,
      "variance_bias": "normal",
      "sequence": 7,
      "crit_chance": 5,
      "ac": 18,
      "dtdr": {
        "normal": {
          "dt": 6,
          "dr": 30
        },
        "laser": {
          "dt": 1,
          "dr": 50
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 1,
          "dr": 30
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 60,
        "gas": 100,
        "emp": 0
      },
      "special": {
        "str": 3,
        "per": 5,
        "end": 5,
        "cha": 1,
        "int": 2,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Lick",
        "hit_percent": 60,
        "action": "Poison",
        "damage": "1d8+2",
        "effect": "Foe makes EN roll. On success the opponent loses small action.",
        "dmgType": "poison"
      },
      {
        "name": "Spray",
        "hit_percent": 70,
        "action": "Gas",
        "damage": "1d4",
        "effect": "Sprays small area around itself with gas. Enemies suffer -3 PE and take 1d4 while crossing or inside.",
        "dmgType": "poison"
      },
      {
        "name": "Curl Up",
        "hit_percent": 100,
        "action": "Defend",
        "damage": "0",
        "effect": "Gain +5 AC and -10% hit. Small action.",
        "dmgType": "normal"
      },
      {
        "name": "Roll",
        "hit_percent": 80,
        "action": "SM",
        "damage": "2d8+4",
        "effect": "Must be curled up first.",
        "dmgType": "normal"
      }
    ]
  },
  protectorate_infantry: {
    "id": "protectorate_infantry",
    "name": "Protectorate Infantry",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/protectorate_infantry.jpg",
    "image_prompt": "A Chinese Protectorate infantryman in a dark navy quilted tunic with a high collar, navy shoulder boards and brass buttons, a leather bandolier of mechanic's tools, black gloves and a riveted steel breastplate. Bare-headed. Holding a battle rifle across the body with a stick grenade clipped to the belt. Standing behind a concrete block barricade across a cracked road.",
    "description": "Standard Protectorate Infantry. Usually citizens called to arms to serve, but given acceptable levels of gear to survive. Equipped with Infantry armor and a standard battle rifle with a grenade for suppressive tactics. Protectorate doctrine is about forming defensive lines and penetrating enemy formations with shock troops or mortar fire.",
    "notes": "Will form a defensive perimeter and make a killzone. Will suppress and throw grenades.",
    "stats": {
      "hp": 50,
      "variance_bias": "normal",
      "sequence": 12,
      "crit_chance": 6,
      "ac": 20,
      "dtdr": {
        "normal": {
          "dt": 5,
          "dr": 40
        },
        "laser": {
          "dt": 3,
          "dr": 45
        },
        "fire": {
          "dt": 1,
          "dr": 20
        },
        "plasma": {
          "dt": 3,
          "dr": 45
        },
        "explosive": {
          "dt": 1,
          "dr": 20
        }
      },
      "resistances": {
        "energy": 30,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 6,
        "end": 5,
        "cha": 5,
        "int": 6,
        "agi": 6,
        "luk": 6
      }
    },
    "attacks": [
      {
        "name": "Rifle",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "2d6+8",
        "effect": "Has 20 shots. -10 AC and -15 DR. Burst of 5 rounds.",
        "dmgType": "normal"
      },
      {
        "name": "Throw Grenade",
        "hit_percent": 60,
        "action": "Frag",
        "damage": "2d12+20",
        "effect": "Affects small radius. Foes AG DC, fails take 1d6 bleed damage.",
        "dmgType": "explosive"
      },
      {
        "name": "Pistol",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d8+4",
        "effect": "Has 5 shots. For shield users.",
        "dmgType": "normal"
      },
      {
        "name": "Medium Shield",
        "hit_percent": 80,
        "action": "SM",
        "damage": "1d8+1",
        "effect": "Infantry with shields gain medium cover.",
        "dmgType": "normal"
      },
      {
        "name": "Mortar",
        "hit_percent": 50,
        "action": "SM",
        "damage": "2d12+60",
        "effect": "Takes one turn to setup. 3 rounds per squad of infantry. Mortar carrier has no other weapons.",
        "dmgType": "explosive"
      }
    ]
  },
  protectorate_power_armor: {
    "id": "protectorate_power_armor",
    "name": "Protectorate Power Armor",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/protectorate_power_armor.jpg",
    "image_prompt": "A Protectorate trooper sealed inside a full suit of POWER ARMOUR in the Fallout manner: a huge enclosing shell of riveted steel plate, bulbous rounded pauldrons, thick segmented limbs, a sealed HELMET with a narrow horizontal visor slit and small round lamps either side, exhaust stacks at the shoulders. The head is NOT bare — the suit is closed. Deep Protectorate navy paint worn through to bare steel at every edge and knee, brass-rimmed joints, hydraulic lines exposed at the elbows. Standing heavily, holding a Fallout plasma rifle with its bulbous green cell. On a cracked quayside.",
    "description": "A Protectorate trooper sealed inside a battered suit of power armour — rare on the Peninsula, and terrifying when the Protectorate actually fields one.",
    "notes": "Boss immunity: One Shot One Kill instead deals 20 true damage. EMP-vulnerable (§7): energy resistance -50, and an EMP effect can drop its shield for a round. Suggested package (BALANCE_PROPOSAL §6.5): Plated Hide +4 DT (ignored by Head/Eyes aimed shots) + boss, or Energy Shield 8 + Self-Destruct (4d10+20 explosive to 2 PCs on death, AG check halves it; crippling both arms first disarms it) — roughly 55-66% win rate for a level-7 party against two.",
    "stats": {
      "hp": 77,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 6,
      "ac": 31,
      "dtdr": {
        "normal": {
          "dt": 10,
          "dr": 50
        },
        "laser": {
          "dt": 12,
          "dr": 60
        },
        "fire": {
          "dt": 5,
          "dr": 40
        },
        "plasma": {
          "dt": 12,
          "dr": 60
        },
        "explosive": {
          "dt": 6,
          "dr": 45
        }
      },
      "resistances": {
        "energy": -50,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": -50
      },
      "special": {
        "str": 9,
        "per": 6,
        "end": 8,
        "cha": 3,
        "int": 5,
        "agi": 5,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Plasma Rifle",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "4d8+10",
        "effect": "Plasma damage. Has 10 shots.",
        "dmgType": "plasma"
      }
    ]
  },
  raider_ghoul: {
    "id": "raider_ghoul",
    "name": "Raider Ghoul",
    "type": "monster",
    "creature_type": "Ghoul",
    "icon": "art/bestiary/raider_ghoul.jpg",
    "image_prompt": "A Fallout ghoul in raider rags: skin like cracked sun-dried leather in mottled grey and raw pink, split open in places, no nose, no hair, lipless mouth drawn back from the teeth. A torn singlet, frayed belt and a rusted parang with a tape-wrapped grip held low. Not a scarred man, not a weathered human. Standing in a broken concrete carpark.",
    "description": "A raider who turned ghoul and never slowed down. No 'uncle' or 'auntie' citizenship for this one — still running with the pack, still armed the same as any other raider.",
    "notes": "Fights like a standard Raider — armed with whatever it's scrounged. Rad and poison resistant (ghoul racial): RR 80, PR 30.",
    "stats": {
      "hp": 39,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 6,
      "ac": 13,
      "dtdr": {
        "normal": {
          "dt": 2,
          "dr": 23
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 30,
        "rad": 80,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 5,
        "end": 6,
        "cha": 1,
        "int": 4,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Scavenged Blade",
        "hit_percent": 61,
        "action": "Attack",
        "damage": "1d8+3",
        "effect": "Armed like a Raider — pipe, knife, or whatever else was lying around.",
        "dmgType": "normal"
      }
    ]
  },
  raider_protectron: {
    "id": "raider_protectron",
    "name": "Raider Protectron",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "art/bestiary/raider_protectron.jpg",
    "image_prompt": "A Fallout Protectron taken by raiders: a squat barrel-bodied robot on two stubby legs, a domed head with a single wide glowing visor band, segmented arms with one tool claw swapped for a welded laser emitter. Chassis crudely repainted in blotchy red and black enamel, plain and unmarked, dented and scraped. Not a humanoid android. Standing beside a patched tarpaulin lean-to.",
    "description": "A RobCo Protectron some raider crew got walking again, chassis repainted with gang colours and its manners left in whatever junkyard they found it in. Patrols raider camps until something crosses its sensor.",
    "notes": "Self-destructs when both arms are crippled. Electrical/EMP weakness: -50 energy resistance, and an EMP effect disables it for a round.",
    "stats": {
      "hp": 36,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 4,
      "ac": 10,
      "dtdr": {
        "normal": {
          "dt": 4,
          "dr": 18
        },
        "laser": {
          "dt": 2,
          "dr": 11
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": -50,
        "poison": 100,
        "rad": 100,
        "gas": 100,
        "emp": -50
      },
      "special": {
        "str": 6,
        "per": 6,
        "end": 4,
        "cha": 0,
        "int": 2,
        "agi": 3,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Laser Arm",
        "hit_percent": 56,
        "action": "Attack",
        "damage": "1d6+4",
        "effect": "Laser damage.",
        "dmgType": "laser"
      }
    ]
  },
  raider_veteran: {
    "id": "raider_veteran",
    "name": "Raider Veteran",
    "type": "monster",
    "creature_type": "Human/Ghoul/Mutant",
    "icon": "art/bestiary/raider_veteran.jpg",
    "image_prompt": "A Malay raider veteran in scavenged plate: patched steel sheets wired over a stained sleeveless shirt at the chest, shoulders and shins, a dented steel helmet, scarred forearms and hard stubble. Holding a combat shotgun low at the hip, its stock wrapped in tape. Standing on the cracked deck of an overpass.",
    "description": "A raider who's survived long enough for it to matter — scavenged plate over real firepower, instead of whatever the newest recruit could scrounge.",
    "notes": "Has 1 attack and 1 move. Tougher and better-equipped than a standard Raider; leads small raider bands.",
    "stats": {
      "hp": 45,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 6,
      "ac": 21,
      "dtdr": {
        "normal": {
          "dt": 2,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 5,
        "end": 6,
        "cha": 3,
        "int": 3,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Combat Shotgun",
        "hit_percent": 69,
        "action": "Attack",
        "damage": "2d8+4",
        "effect": "Has 8 shots. -5 AC and -10 DR.",
        "dmgType": "normal"
      }
    ]
  },
  raider: {
    "id": "raider",
    "name": "Raider",
    "type": "monster",
    "creature_type": "Human/Ghoul/Mutant",
    "icon": "art/bestiary/raider.jpg",
    "image_prompt": "An Indian raider in a torn T-shirt and a scavenged leather jacket with one sleeve ripped away, a submachine gun on a frayed sling, a rusted machete in the other hand and a pistol tucked in the belt. Bruised knuckles, wary eyes. Standing on a cracked street corner beside a fallen shutter.",
    "description": "The strong prey on the weak as they say, and those that do are considered raiders. Often desperate, raiders roam in tight-knit packs, and tend to break easily when the odds turn against them. Often will equip anything they can find or scrounge.",
    "notes": "Standard raider scum. Will flee if friends are dead.",
    "stats": {
      "hp": 50,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 6,
      "ac": 18,
      "dtdr": {
        "normal": {
          "dt": 3,
          "dr": 20
        },
        "laser": {
          "dt": 0,
          "dr": 20
        },
        "fire": {
          "dt": 0,
          "dr": 20
        },
        "plasma": {
          "dt": 0,
          "dr": 20
        },
        "explosive": {
          "dt": 0,
          "dr": 20
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 5,
        "end": 5,
        "cha": 5,
        "int": 5,
        "agi": 5,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Pistol",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d8+4",
        "effect": "Has 6 shots.",
        "dmgType": "normal"
      },
      {
        "name": "Rifle",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d8+6",
        "effect": "Has 5 or 20 shots. -5AC and -10 DR. Burst of 10 shots.",
        "dmgType": "normal"
      },
      {
        "name": "Sub Machine",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d8+4",
        "effect": "Has 20 shots. Burst of 10 shots.",
        "dmgType": "normal"
      },
      {
        "name": "Shield",
        "hit_percent": 70,
        "action": "Defend",
        "damage": "2d6",
        "effect": "Grants small cover bonus.",
        "dmgType": "normal"
      },
      {
        "name": "Knife",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d8+1",
        "effect": "Mutant raiders +10",
        "dmgType": "normal"
      },
      {
        "name": "Melee",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "Mutant raiders use 2d4+10.",
        "dmgType": "normal"
      }
    ]
  },
  rakan_watch_enforcer: {
    "id": "rakan_watch_enforcer",
    "name": "Rakan Watch Enforcer",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/rakan_watch_enforcer.jpg",
    "image_prompt": "A Chinese Rakan Watch enforcer in a homemade mint-green municipal windbreaker, reinforced with scrap steel plates across the chest and shoulders. Carrying a pump-action shotgun with a taped forestock, shells on a bandolier, a radio clipped at the hip. Standing at a road junction in front of a shophouse.",
    "description": "A senior Rakan Watch enforcer — better armoured, better armed, and called in when a patrol of Members isn't enough.",
    "notes": "Has 1 attack and 1 move. Backs up Rakan Watch Members when trouble escalates past what a patrol can handle.",
    "stats": {
      "hp": 51,
      "variance_bias": "normal",
      "sequence": 11,
      "crit_chance": 6,
      "ac": 26,
      "dtdr": {
        "normal": {
          "dt": 2,
          "dr": 30
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 5,
        "end": 6,
        "cha": 4,
        "int": 4,
        "agi": 6,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Shotgun",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "2d6+3",
        "effect": "Has 8 shots. -5 AC and -10 DR.",
        "dmgType": "normal"
      }
    ]
  },
  rakan_watch_member: {
    "id": "rakan_watch_member",
    "name": "Rakan Watch Member",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/rakan_watch_member.jpg",
    "image_prompt": "An Indian Rakan Watch member in a faded homemade mint-green windbreaker zipped to the chin, a steel 9mm pistol in a holster at the hip, a handheld radio clipped to the chest. Short-cropped hair, a weary, watchful face. Standing on a street corner beside a kopitiam, concrete shophouses rising behind.",
    "description": "Rank-and-file muscle for the Rakan Watch, keeping order in Bandawang Baru under Ketua Bob. Sidearm, old windbreaker, and a radio to call for backup.",
    "notes": "Has 1 attack and 1 move. Rank-and-file street patrol; will call for backup before pressing a fight it can't win.",
    "stats": {
      "hp": 39,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 5,
      "ac": 7,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 5
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 0,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 5,
        "end": 5,
        "cha": 4,
        "int": 4,
        "agi": 5,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "9mm Pistol",
        "hit_percent": 72,
        "action": "Attack",
        "damage": "1d8+3",
        "effect": "Has 12 shots.",
        "dmgType": "normal"
      }
    ]
  },
  rat_king: {
    "id": "rat_king",
    "name": "Rat King (Rat Raja)",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/rat_king.jpg",
    "image_prompt": "An enormous gorged mutated rat, as big as a goat, with matted grey-brown fur, bald scar patches and a pale, swollen belly. Huge yellow incisors, a thick bare tail coiled behind, a broad regal head with one torn ear and small shrewd eyes. Perched heavy on a heap of torn woven sacks in a ruined market stall.",
    "description": "A rat that has gorged itself over the years on a healthy diet of prey. The apex predator of where it may reside, the Rat Raja exhumes authority and importance. It will rarely venture from its place of comfort without good reason (or tasty morsels), and prefers to stay where it can feast.",
    "notes": "Has 2 attack, 1 small action and 1 move. Miniboss.",
    "stats": {
      "hp": 30,
      "variance_bias": "normal",
      "sequence": 9,
      "crit_chance": 6,
      "ac": 14,
      "dtdr": {
        "normal": {
          "dt": 4,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 2,
          "dr": 10
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 4,
          "dr": 25
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 70,
        "rad": 45,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 5,
        "end": 3,
        "cha": 1,
        "int": 1,
        "agi": 5,
        "luk": 6
      }
    },
    "attacks": [
      {
        "name": "Claw",
        "hit_percent": 90,
        "action": "Attack",
        "damage": "2d6",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Bite",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d6",
        "effect": "Poison 2 damage for 1d8 hours",
        "dmgType": "poison"
      },
      {
        "name": "Tail Swipe",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "1d6",
        "effect": "Knockdown on hit",
        "dmgType": "normal"
      }
    ]
  },
  securitron: {
    "id": "securitron",
    "name": "RobCo Securitron",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "art/bestiary/securitron.jpg",
    "image_prompt": "A Fallout RobCo Securitron, not a Protectron and not a humanoid robot: a single large monowheel under an armoured ovoid body, a rounded head with a cathode-ray screen showing a simple cartoon face of two dot eyes and a flat mouth, one arm holding a stubby submachine gun and the other a Gatling laser barrel cluster, a shoulder rocket pod, a dull grey enamel body chipped to bare steel with rust at the seams, and a speaker grille below the screen. On a rain-darkened concrete walkway outside a shophouse arcade.",
    "description": "A RobCo Securitron: a pre-War monowheel security robot with an armoured ovoid body, a cathode screen for a face and a weapon on each arm. Most of the ones still running on the Peninsula were left to guard something, and nobody has told them it is over. Warden Robo at Kelam Sungai is one of this make.",
    "notes": "Serious threat: armoured and armed, and it does not give ground. Slow to flank: a target that moves behind it costs the Securitron its next turn to bring the weapons round. A hacked unit can also carry shoulder rocket pods and a grenade launcher, which are not modelled here.",
    "stats": {
      "hp": 110,
      "variance_bias": "normal",
      "sequence": 6,
      "crit_chance": 5,
      "ac": 16,
      "dtdr": {
        "normal": {
          "dt": 10,
          "dr": 35
        },
        "laser": {
          "dt": 6,
          "dr": 25
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": -50,
        "poison": 100,
        "rad": 100,
        "gas": 100,
        "emp": -50
      },
      "special": {
        "str": 8,
        "per": 7,
        "end": 7,
        "cha": 0,
        "int": 4,
        "agi": 2,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Submachine Gun",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "2d6+3",
        "effect": "Close-range burst fire at anything within a few paces.",
        "dmgType": "normal"
      },
      {
        "name": "Gatling Laser",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "2d8+4",
        "effect": "Medium-range burst fire.",
        "dmgType": "laser"
      }
    ]
  },
  soldier_ant: {
    "id": "soldier_ant",
    "name": "Soldier Ant (Semut Askar)",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/soldier_ant.jpg",
    "image_prompt": "A soldier ant, slightly bigger than its workers, with a heavy oversized head and a broad armoured thorax in glossy dark red-brown. Short thick mandibles open wide, scarred plating and long spined legs braced. Standing beside a split timber log on a cracked drain edge.",
    "description": "A soldier ant, responsible for protecting and ensuring other ants can accomplish their tasks and objectives. Slightly tougher, slightly stronger.",
    "notes": "Has 1 attack and 1 move.",
    "stats": {
      "hp": 25,
      "variance_bias": "normal",
      "sequence": 6,
      "crit_chance": 4,
      "ac": 5,
      "dtdr": {
        "normal": {
          "dt": 1,
          "dr": 10
        },
        "laser": {
          "dt": 0,
          "dr": 10
        },
        "fire": {
          "dt": 0,
          "dr": -20
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 1,
          "dr": 10
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 70,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 6,
        "per": 4,
        "end": 3,
        "cha": 1,
        "int": 1,
        "agi": 2,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Mandibles",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d8",
        "effect": "Poison 1 damage for 1d8 hours",
        "dmgType": "poison"
      }
    ]
  },
  sumatran_rhino: {
    "id": "sumatran_rhino",
    "name": "Sumatran Rhino",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/sumatran_rhino.jpg",
    "image_prompt": "A Sumatran rhinoceros mutated huge: shaggy reddish-brown hide, thick folded skin over the shoulders and legs, a long front horn cracked and bone-bright at the tip, a shorter second horn, and small deep-set eyes under a massive low head. Scarred flanks. Standing on the cracked tarmac shoulder of an empty highway.",
    "description": "A rhino that radiation made bigger, meaner and a great deal harder to stop. It doesn't travel in herds — one is more than enough.",
    "notes": "Has 2 attacks (Charge then Gore) and 1 move per turn. A Charge that hits forces an AG check or the target is Knocked Down.",
    "stats": {
      "hp": 144,
      "variance_bias": "normal",
      "sequence": 7,
      "crit_chance": 6,
      "ac": 10,
      "dtdr": {
        "normal": {
          "dt": 5,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 30,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 9,
        "per": 4,
        "end": 9,
        "cha": 1,
        "int": 1,
        "agi": 3,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Charge",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "3d8+6",
        "effect": "Forces an AG check on hit or the target is Knocked Down.",
        "dmgType": "normal"
      },
      {
        "name": "Gore",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "3d8+6",
        "effect": "Second attack of its turn, used after the Charge.",
        "dmgType": "normal"
      }
    ]
  },
  supermutant_labourer: {
    "id": "supermutant_labourer",
    "name": "Supermutant Labourer",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/supermutant_labourer.jpg",
    "image_prompt": "A FALLOUT 4 SUPER MUTANT, copied from that game and not a generic green strongman. NOT the Hulk: the hide is MOTTLED GREY-GREEN and LUMPY like old leather, not smooth green skin, and the musculature is GROTESQUE AND ASYMMETRIC — one shoulder swollen far higher than the other, arms of unequal mass, the whole body built wrong rather than built strong. A heavy jutting shelf of a brow over small sunken YELLOW eyes, a flattened stub of a nose, and a wide LIPLESS mouth drawn back from crowded uneven teeth. Blotched discoloured patches and old scarring across the hide. He wears ragged work trousers held with a rope belt and carries a sledgehammer with a cracked handle. Standing under a collapsed flyover.",
    "description": "A supermutant labourer, worn down by hard manual work. Hungry and tired. May carry a sledgehammer. Won't fight unless their foreman orders it, and stops once the foreman is down.",
    "notes": "Has 1 attack and 1 move. Not interested in fighting, unless forced.",
    "stats": {
      "hp": 60,
      "variance_bias": "normal",
      "sequence": 8,
      "crit_chance": 4,
      "ac": 5,
      "dtdr": {
        "normal": {
          "dt": 1,
          "dr": 25
        },
        "laser": {
          "dt": 1,
          "dr": 25
        },
        "fire": {
          "dt": 1,
          "dr": 25
        },
        "plasma": {
          "dt": 1,
          "dr": 25
        },
        "explosive": {
          "dt": 1,
          "dr": 25
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 50,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 8,
        "per": 4,
        "end": 7,
        "cha": 3,
        "int": 4,
        "agi": 4,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Punch",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "2d4+1",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Kick",
        "hit_percent": 55,
        "action": "Attack",
        "damage": "2d4+2",
        "effect": "none",
        "dmgType": "normal"
      },
      {
        "name": "Overhead Smash",
        "hit_percent": 50,
        "action": "SM",
        "damage": "2d4+3",
        "effect": "Foe makes EN throw. Knockdown on hit.",
        "dmgType": "normal"
      },
      {
        "name": "Sledgehammer",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d6+15+3",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  },
  swarm_of_keluang: {
    "id": "swarm_of_keluang",
    "name": "Swarm of Keluang",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
    "image_prompt": "A colony of flying foxes, each the size of a small child, hanging in a loose cluster from the bare branches of ONE dead tree. ABOUT TWENTY OF THEM, countable at a glance — not hundreds, not a black mass, not a tree furred over with bodies. Rust-brown fur, leathery folded wings, long hooked claws, fox-like muzzles, several with their heads turned towards the viewer. Three or four are in the air just clear of the branches. A flooded padi field behind.",
    "description": "You hear the roost before you see it: a dry, wet rustle from a dead tree or a ruined hall, like rain that has forgotten how to stop. Wake them with noise, light or a thrown stone and the whole colony comes off the branches at once, a cloud that fills the space and cannot be hit with a single shot. Anyone it touches takes the roost fever home with them, and the advice is the same as it always was: wash, burn the clothes, and do not go back in.",
    "notes": "One creature acting as one unit. It fills a single space (a tree crown, a hall's roof beams) and has no body or face to aim at. Single-target attacks (a bullet, a blade, a laser) run into its high DT and DR and do little. Fire and area effects (grenades, explosives, a torch thrown into the roof) take the full value. Asleep until disturbed by noise, light or fire in the roost; it acts first on the round after it wakes. Has 3 attacks. Below half HP it has thinned out and Swarm Bite drops to 1d4+1.",
    "stats": {
      "hp": 120,
      "variance_bias": "normal",
      "sequence": 12,
      "crit_chance": 1,
      "ac": 8,
      "dtdr": {
        "normal": {
          "dt": 8,
          "dr": 60
        },
        "laser": {
          "dt": 6,
          "dr": 50
        },
        "fire": {
          "dt": 0,
          "dr": -50
        },
        "plasma": {
          "dt": 6,
          "dr": 50
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 0,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 2,
        "per": 7,
        "end": 8,
        "cha": 1,
        "int": 3,
        "agi": 9,
        "luk": 3
      }
    },
    "attacks": [
      {
        "name": "Swarm Bite",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d4+2",
        "effect": "Hits every foe in the swarm's space. Each foe struck makes an EN check or takes roost fever: 1d4 damage a turn for 3 turns.",
        "dmgType": "poison"
      },
      {
        "name": "Wing Rush",
        "hit_percent": 80,
        "action": "Attack",
        "damage": "1d6",
        "effect": "Foe makes an AG check or gains the Blinded status until they clear their eyes.",
        "dmgType": "normal"
      },
      {
        "name": "Resettle",
        "hit_percent": 100,
        "action": "Defend",
        "damage": "0",
        "effect": "Moves the swarm up to 3 spaces, over foes and obstacles. Small action.",
        "dmgType": "normal"
      }
    ]
  },
  ucl_regular: {
    "id": "ucl_regular",
    "name": "UCL Regular",
    "type": "monster",
    "creature_type": "Human",
    "icon": "art/bestiary/ucl_regular.jpg",
    "image_prompt": "A Malay UCL regular in a patched jungle-camouflage smock and loose trousers, a canvas webbing belt with a machete in its sheath, a sweat-stained cap and a sun-browned farmer's face. Holding a rifle at the shoulder with a bayonet fixed. Standing at a roadside bus shelter with a cracked concrete base.",
    "description": "A UCL Regular is a farmer, a smith, a shopkeep, a vagrant. Regulars are picked up from all over UCL, and form the bulk of the army. With basic training, they rely on their numbers and basic tactics to get the edge over their opponent. Familiar with jungle fighting. UCL doctrine is all about engaging and enveloping the enemy, and charging regulars as cannon fodder under machine gun fire.",
    "notes": "Will work together to suppress targets, will flank around to hit targets. Prefers rifle, will agr. charge targets.",
    "stats": {
      "hp": 45,
      "variance_bias": "normal",
      "sequence": 10,
      "crit_chance": 5,
      "ac": 16,
      "dtdr": {
        "normal": {
          "dt": 3,
          "dr": 30
        },
        "laser": {
          "dt": 1,
          "dr": 20
        },
        "fire": {
          "dt": 0,
          "dr": 20
        },
        "plasma": {
          "dt": 0,
          "dr": 20
        },
        "explosive": {
          "dt": 1,
          "dr": 30
        }
      },
      "resistances": {
        "energy": 10,
        "poison": 100,
        "rad": 10,
        "gas": 100,
        "emp": 0
      },
      "special": {
        "str": 5,
        "per": 4,
        "end": 6,
        "cha": 4,
        "int": 4,
        "agi": 4,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Rifle",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "2d6+6",
        "effect": "Has 5 shots. -5 AC and -15 DR.",
        "dmgType": "normal"
      },
      {
        "name": "Machete",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d10+5",
        "effect": "Used after charge.",
        "dmgType": "normal"
      },
      {
        "name": "Melee",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "When no other options are left.",
        "dmgType": "normal"
      },
      {
        "name": "Bayonet",
        "hit_percent": 75,
        "action": "SM",
        "damage": "2d6+2",
        "effect": "Must charge into enemy.",
        "dmgType": "normal"
      }
    ]
  },
  ular_sawa: {
    "id": "ular_sawa",
    "name": "Ular Sawa",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/ular_sawa.jpg",
    "image_prompt": "A reticulated python as thick through the body as a man's thigh, its skin a net of gold-brown, black and cream diamonds and fine lines, coiled in heavy loops around a rubber-tree trunk with its head drawn back and its jaws parted to show the teeth. Fresh scrapes on the snout. Black canal water and exposed roots at the base of the tree.",
    "description": "You see the water move before you see the snake, and by the time you see its head it has already wrapped you to the chest. It does not crush you; it waits for you to breathe out, takes up the slack, and each breath in leaves you a little less room than the last. Hacking at it gets you nothing, because the coils only tighten; what loosens them is somebody else's hands working between the coils and you.",
    "notes": "Has 3 attacks and 1 move (slithers up to 4 spaces through water or undergrowth, unseen until it lunges). Ambush: it waits submerged or hidden and gets the first round. Held: Constrict every round, rising as listed. Hurting the snake does not make it let go. A held foe is freed when an ally next to the snake gets hands between the coils and wins a STR check, or when the snake dies. High threat: do not run it against a lone foe with no ally in reach.",
    "stats": {
      "hp": 120,
      "variance_bias": "normal",
      "sequence": 8,
      "crit_chance": 5,
      "ac": 10,
      "dtdr": {
        "normal": {
          "dt": 3,
          "dr": 20
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 20,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 9,
        "per": 6,
        "end": 7,
        "cha": 1,
        "int": 2,
        "agi": 5,
        "luk": 3
      }
    },
    "attacks": [
      {
        "name": "Lunge",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d8+4",
        "effect": "Strikes from water or undergrowth, usually on the first round. Surprise: the foe cannot dodge.",
        "dmgType": "normal"
      },
      {
        "name": "Coil",
        "hit_percent": 70,
        "action": "SM",
        "damage": "1d10+4",
        "effect": "Wraps the foe. Foe makes an AG check to avoid it; on a failure the foe is held and cannot move away.",
        "dmgType": "normal"
      },
      {
        "name": "Constrict",
        "hit_percent": 100,
        "action": "Attack",
        "damage": "1d8+4",
        "effect": "Automatic against a held foe. Each round after the first, damage rises by 1d4, cumulative. The held foe loses their small action each round to breathing.",
        "dmgType": "normal"
      }
    ]
  },
  vicious_dog: {
    "id": "vicious_dog",
    "name": "Vicious Dog",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "art/bestiary/vicious_dog.jpg",
    "image_prompt": "A kampong pariah dog gone feral, short tawny-brown coat, ribs showing through torn skin, long lean legs, a scarred muzzle, ears pinned back and lips curled from the fangs. Thin and quick-looking, hip bones prominent. Standing on a cracked concrete kampong lane.",
    "description": "A stray gone wrong — feral, fast, and hunting in a pack. Once somebody's kampong dog, now just teeth and hunger.",
    "notes": "Has 1 attack and 1 move. Hunts in packs; will flee if left alone and badly hurt.",
    "stats": {
      "hp": 26,
      "variance_bias": "normal",
      "sequence": 8,
      "crit_chance": 4,
      "ac": 8,
      "dtdr": {
        "normal": {
          "dt": 0,
          "dr": 0
        },
        "laser": {
          "dt": 0,
          "dr": 0
        },
        "fire": {
          "dt": 0,
          "dr": 0
        },
        "plasma": {
          "dt": 0,
          "dr": 0
        },
        "explosive": {
          "dt": 0,
          "dr": 0
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 20,
        "rad": 10,
        "gas": 0,
        "emp": 0
      },
      "special": {
        "str": 4,
        "per": 6,
        "end": 4,
        "cha": 1,
        "int": 1,
        "agi": 7,
        "luk": 4
      }
    },
    "attacks": [
      {
        "name": "Bite",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d6+3",
        "effect": "none",
        "dmgType": "normal"
      }
    ]
  }
};

export function getMonster(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return bestiaryDatabase[cleanId] || null; }
