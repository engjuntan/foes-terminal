// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const bestiaryDatabase = {
  automated_turret: {
    "id": "automated_turret",
    "name": "Automated Turret",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "",
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
        "gas": 100
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
        "effect": "Burst fire of 15 rounds. -5 AC and -15 DR. 800 shots."
      },
      {
        "name": "Heavy Fire",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d8+15",
        "effect": "Burst fire of 15 rounds. -10 AC and -20 DR. 800 shots."
      },
      {
        "name": "Flame",
        "hit_percent": 80,
        "action": "Flame",
        "damage": "3d10+30",
        "effect": "Medium range flame. 5 shots."
      },
      {
        "name": "Laser",
        "hit_percent": 75,
        "action": "Laser",
        "damage": "5d4+15",
        "effect": "Burst fire of 15 rounds. 800 shots."
      },
      {
        "name": "Anti-Tank Cannon",
        "hit_percent": 80,
        "action": "Attack",
        "damage": "7d8+30",
        "effect": "-20 AC and -50 DR. 1 shot. May not fire and adjust."
      }
    ]
  },
  ayam_berkepala_tiga: {
    "id": "ayam_berkepala_tiga",
    "name": "Ayam Berkepala Tiga",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      },
      {
        "name": "Centre Head Peck",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none"
      },
      {
        "name": "Right Head Peck",
        "hit_percent": 65,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "none"
      }
    ]
  },
  construction_protectron: {
    "id": "construction_protectron",
    "name": "Construction Protectron",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "",
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
        "gas": 100
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
        "effect": "Pneumatic construction tool repurposed as a weapon."
      }
    ]
  },
  federation_commando: {
    "id": "federation_commando",
    "name": "Federation Commando",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 20 shots. Relentless: may take a second full attack this turn at -30 hit."
      }
    ]
  },
  federation_heavy: {
    "id": "federation_heavy",
    "name": "Federation Heavy",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 30 shots. Burst of 8 rounds. -10 AC and -15 DR."
      }
    ]
  },
  federation_regular: {
    "id": "federation_regular",
    "name": "Federation Regular",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 5 shots."
      }
    ]
  },
  feral_ghoul: {
    "id": "feral_ghoul",
    "name": "Feral Ghoul",
    "type": "monster",
    "creature_type": "Ghoul",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      }
    ]
  },
  giant_ant: {
    "id": "giant_ant",
    "name": "Giant Ant (Semut Besar)",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "Poison 1 damage for 1d8 hours"
      }
    ]
  },
  giant_centipede: {
    "id": "giant_centipede",
    "name": "Giant Centipede",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 50
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
        "effect": "Foe makes an EN check or takes 1d4 damage a turn for 2 turns."
      }
    ]
  },
  giant_rat: {
    "id": "giant_rat",
    "name": "Giant Rat",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      },
      {
        "name": "Bite",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4",
        "effect": "Poison 1 damage for 1d8 hours"
      }
    ]
  },
  giant_vicious_dog: {
    "id": "giant_vicious_dog",
    "name": "Giant Vicious Dog",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      }
    ]
  },
  ibu_sakai: {
    "id": "ibu_sakai",
    "name": "Ibu Sakai",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
    "description": "A small, cheap and ineffective robot. This was once manufactured in large quantities as disruption based machines to distract enemy backlines. Usually where one is found there are more around.",
    "notes": "Can attack and move. NOTE: this description text is identical to 'Liberator Robot Mk 1' in the source manual — likely a copy-paste artifact worth checking against the real page.",
    "stats": {
      "hp": 50,
      "variance_bias": "normal",
      "sequence": 20,
      "crit_chance": 7,
      "ac": 20,
      "dtdr": {
        "normal": {
          "dt": 2,
          "dr": 30
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
        "energy": 0,
        "poison": 100,
        "rad": 100,
        "gas": 0
      },
      "special": {
        "str": 6,
        "per": 5,
        "end": 5,
        "cha": 4,
        "int": 3,
        "agi": 8,
        "luk": 7
      }
    },
    "attacks": [
      {
        "name": "Laser Fire",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "1d6+2",
        "effect": "none"
      },
      {
        "name": "Claw",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none"
      }
    ]
  },
  labourer: {
    "id": "labourer",
    "name": "Labourer",
    "type": "monster",
    "creature_type": "Human/Ghoul/Mutant",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      }
    ]
  },
  lesser_panguling: {
    "id": "lesser_panguling",
    "name": "Lesser Panguling",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 100
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
        "effect": "Foe makes EN roll. On success the opponent loses small action."
      },
      {
        "name": "Spray",
        "hit_percent": 70,
        "action": "Gas",
        "damage": "1d4",
        "effect": "Sprays small area around itself with gas. Enemies suffer -3 PE and take 1d4 while crossing or inside."
      },
      {
        "name": "Curl Up",
        "hit_percent": 100,
        "action": "Defend",
        "damage": "0",
        "effect": "Gain +5 AC and -10% hit. Takes an action."
      },
      {
        "name": "Roll",
        "hit_percent": 80,
        "action": "SM",
        "damage": "2d6",
        "effect": "Must be curled up first."
      }
    ]
  },
  liberator_robot_follower: {
    "id": "liberator_robot_follower",
    "name": "Liberator Robot (Follower)",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "",
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
        "gas": 100
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
        "effect": "none"
      },
      {
        "name": "Headbutt",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "Foe rolls an EN check of +1. On failure knock the opponent down."
      },
      {
        "name": "Claw",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none"
      }
    ]
  },
  liberator_robot_mk1: {
    "id": "liberator_robot_mk1",
    "name": "Liberator Robot Mk 1",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "",
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
        "gas": 100
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
        "effect": "none"
      },
      {
        "name": "Claw",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none"
      }
    ]
  },
  mercenary: {
    "id": "mercenary",
    "name": "Mercenary",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 25 shots. Burst of 5 rounds. -5 AC and -10 DR."
      }
    ]
  },
  monyet_sakai: {
    "id": "monyet_sakai",
    "name": "Monyet Sakai",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
    "description": "A curious oddity you found. It has been modified to spew UCL propaganda, yet seemingly has a mind of its own. It has been refurbished. May be upgraded with specific parts.",
    "notes": "Can attack and move. NOTE: this description text is identical to 'Liberator Robot (Follower)' in the source manual — likely a copy-paste artifact worth checking against the real page.",
    "stats": {
      "hp": 40,
      "variance_bias": "normal",
      "sequence": 18,
      "crit_chance": 5,
      "ac": 15,
      "dtdr": {
        "normal": {
          "dt": 1,
          "dr": 25
        },
        "laser": {
          "dt": 0,
          "dr": 10
        },
        "fire": {
          "dt": 0,
          "dr": 5
        },
        "plasma": {
          "dt": 0,
          "dr": 15
        },
        "explosive": {
          "dt": 0,
          "dr": 20
        }
      },
      "resistances": {
        "energy": 0,
        "poison": 100,
        "rad": 100,
        "gas": 0
      },
      "special": {
        "str": 5,
        "per": 5,
        "end": 4,
        "cha": 3,
        "int": 2,
        "agi": 7,
        "luk": 5
      }
    },
    "attacks": [
      {
        "name": "Swipe",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "1d6+3",
        "effect": "none"
      },
      {
        "name": "Bite",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "Foe rolls an EN check of +1. On failure knock the opponent down."
      },
      {
        "name": "Throw",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d4+4",
        "effect": "none"
      }
    ]
  },
  pahlawan: {
    "id": "pahlawan",
    "name": "Pahlawan",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Relentless: may take a second full attack this turn at -30 hit."
      }
    ]
  },
  panguling: {
    "id": "panguling",
    "name": "Panguling",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 100
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
        "effect": "Foe makes EN roll. On success the opponent loses small action."
      },
      {
        "name": "Spray",
        "hit_percent": 70,
        "action": "Gas",
        "damage": "1d4",
        "effect": "Sprays small area around itself with gas. Enemies suffer -3 PE and take 1d4 while crossing or inside."
      },
      {
        "name": "Curl Up",
        "hit_percent": 100,
        "action": "Defend",
        "damage": "0",
        "effect": "Gain +5 AC and -10% hit. Small action."
      },
      {
        "name": "Roll",
        "hit_percent": 80,
        "action": "SM",
        "damage": "2d8+4",
        "effect": "Must be curled up first."
      }
    ]
  },
  protectorate_infantry: {
    "id": "protectorate_infantry",
    "name": "Protectorate Infantry",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
          "dt": 1,
          "dr": 30
        },
        "fire": {
          "dt": 1,
          "dr": 20
        },
        "plasma": {
          "dt": 1,
          "dr": 30
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
        "gas": 0
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
        "effect": "Has 20 shots. -10 AC and -15 DR. Burst of 5 rounds."
      },
      {
        "name": "Throw Grenade",
        "hit_percent": 60,
        "action": "Frag",
        "damage": "2d12+20",
        "effect": "Affects small radius. Foes AG DC, fails take 1d6 bleed damage."
      },
      {
        "name": "Pistol",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d8+4",
        "effect": "Has 5 shots. For shield users."
      },
      {
        "name": "Medium Shield",
        "hit_percent": 80,
        "action": "SM",
        "damage": "1d8+1",
        "effect": "Infantry with shields gain medium cover."
      },
      {
        "name": "Mortar",
        "hit_percent": 50,
        "action": "SM",
        "damage": "2d12+60",
        "effect": "Takes one turn to setup. 3 rounds per squad of infantry. Mortar carrier has no other weapons."
      }
    ]
  },
  protectorate_power_armor: {
    "id": "protectorate_power_armor",
    "name": "Protectorate Power Armor",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Plasma damage. Has 10 shots."
      }
    ]
  },
  raider_ghoul: {
    "id": "raider_ghoul",
    "name": "Raider Ghoul",
    "type": "monster",
    "creature_type": "Ghoul",
    "icon": "",
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
        "gas": 0
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
        "effect": "Armed like a Raider — pipe, knife, or whatever else was lying around."
      }
    ]
  },
  raider_protectron: {
    "id": "raider_protectron",
    "name": "Raider Protectron",
    "type": "monster",
    "creature_type": "Robot",
    "icon": "",
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
        "gas": 100
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
        "effect": "Laser damage."
      }
    ]
  },
  raider_veteran: {
    "id": "raider_veteran",
    "name": "Raider Veteran",
    "type": "monster",
    "creature_type": "Human/Ghoul/Mutant",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 8 shots. -5 AC and -10 DR."
      }
    ]
  },
  raider: {
    "id": "raider",
    "name": "Raider",
    "type": "monster",
    "creature_type": "Human/Ghoul/Mutant",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 6 shots."
      },
      {
        "name": "Rifle",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d8+6",
        "effect": "Has 5 or 20 shots. -5AC and -10 DR. Burst of 10 shots."
      },
      {
        "name": "Sub Machine",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d8+4",
        "effect": "Has 20 shots. Burst of 10 shots."
      },
      {
        "name": "Shield",
        "hit_percent": 70,
        "action": "Defend",
        "damage": "2d6",
        "effect": "Grants small cover bonus."
      },
      {
        "name": "Knife",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d8+1",
        "effect": "Mutant raiders +10"
      },
      {
        "name": "Melee",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "Mutant raiders use 2d4+10."
      }
    ]
  },
  rakan_watch_enforcer: {
    "id": "rakan_watch_enforcer",
    "name": "Rakan Watch Enforcer",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 8 shots. -5 AC and -10 DR."
      }
    ]
  },
  rakan_watch_member: {
    "id": "rakan_watch_member",
    "name": "Rakan Watch Member",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 0
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
        "effect": "Has 12 shots."
      }
    ]
  },
  rat_king: {
    "id": "rat_king",
    "name": "Rat King (Rat Raja)",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      },
      {
        "name": "Bite",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "2d6",
        "effect": "Poison 2 damage for 1d8 hours"
      },
      {
        "name": "Tail Swipe",
        "hit_percent": 50,
        "action": "Attack",
        "damage": "1d6",
        "effect": "Knockdown on hit"
      }
    ]
  },
  soldier_ant: {
    "id": "soldier_ant",
    "name": "Soldier Ant (Semut Askar)",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
          "dr": 0
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
        "gas": 0
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
        "effect": "Poison 1 damage for 1d8 hours"
      }
    ]
  },
  sumatran_rhino: {
    "id": "sumatran_rhino",
    "name": "Sumatran Rhino",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "Forces an AG check on hit or the target is Knocked Down."
      },
      {
        "name": "Gore",
        "hit_percent": 75,
        "action": "Attack",
        "damage": "3d8+6",
        "effect": "Second attack of its turn, used after the Charge."
      }
    ]
  },
  supermutant_labourer: {
    "id": "supermutant_labourer",
    "name": "Supermutant Labourer",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
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
        "gas": 0
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
        "effect": "none"
      },
      {
        "name": "Kick",
        "hit_percent": 55,
        "action": "Attack",
        "damage": "2d4+2",
        "effect": "none"
      },
      {
        "name": "Overhead Smash",
        "hit_percent": 50,
        "action": "SM",
        "damage": "2d4+3",
        "effect": "Foe makes EN throw. Knockdown on hit."
      },
      {
        "name": "Sledgehammer",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d6+15+3",
        "effect": "none"
      }
    ]
  },
  ucl_regular: {
    "id": "ucl_regular",
    "name": "UCL Regular",
    "type": "monster",
    "creature_type": "Human",
    "icon": "",
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
        "gas": 100
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
        "effect": "Has 5 shots. -5 AC and -15 DR."
      },
      {
        "name": "Machete",
        "hit_percent": 70,
        "action": "Attack",
        "damage": "1d10+5",
        "effect": "Used after charge."
      },
      {
        "name": "Melee",
        "hit_percent": 60,
        "action": "Attack",
        "damage": "1d4+1",
        "effect": "When no other options are left."
      },
      {
        "name": "Bayonet",
        "hit_percent": 75,
        "action": "SM",
        "damage": "2d6+2",
        "effect": "Must charge into enemy."
      }
    ]
  },
  vicious_dog: {
    "id": "vicious_dog",
    "name": "Vicious Dog",
    "type": "monster",
    "creature_type": "Mutated Creature",
    "icon": "",
    "description": "A stray gone wrong — feral, fast, and hunting in a pack. Once somebody's kampung dog, now just teeth and hunger.",
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
        "gas": 0
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
        "effect": "none"
      }
    ]
  }
};

export function getMonster(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return bestiaryDatabase[cleanId] || null; }
