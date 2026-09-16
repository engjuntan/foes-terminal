// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const traitDatabase = {
  cancerous_growth: {
    "id": "cancerous_growth",
    "name": "Cancerous Growth",
    "type": "perk",
    "description": "Requires ST 7, Level 6. Ghoul-only. Gain +2 Healing Rate and regenerate a crippled limb in 1 day.",
    "effect": "+2 Healing Rate, regrow a crippled limb in 1 day",
    "race_requirement": "ghoul",
    "modifiers": {
      "healing_rate_bonus": 2
    }
  },
  faster_healing: {
    "id": "faster_healing",
    "name": "Faster Healing",
    "type": "perk",
    "description": "Requires EN 6, Level 3. For each rank of this perk you gain a +2 to the Healing Rate.",
    "effect": "+2 Healing Rate per rank",
    "modifiers": {
      "healing_rate_bonus": 2
    }
  },
  rad_child: {
    "id": "rad_child",
    "name": "Rad Child",
    "type": "perk",
    "description": "Requires EN 6, Level 3. Gain +5 Healing Rate.",
    "effect": "+5 Healing Rate",
    "modifiers": {
      "healing_rate_bonus": 5
    }
  },
  triad_ties: {
    "id": "triad_ties",
    "name": "Triad Ties",
    "type": "perk",
    "description": "Lim Clan-aligned perk — discount from Lim-affiliated vendors, possible reputation trade-off elsewhere.",
    "effect": "TBA",
    "modifiers": {
      "vendor_discount_lim_clan": "TBA",
      "reputation_tradeoff": "TBA"
    }
  },
  water_sense: {
    "id": "water_sense",
    "name": "Water Sense",
    "type": "perk",
    "description": "First perk written — sets the template precedent. Advantage on Survival checks to locate clean water sources.",
    "effect": "TBA",
    "modifiers": {
      "survival_water_advantage": "TBA"
    }
  },
  border_rat: {
    "id": "border_rat",
    "name": "Border Rat",
    "type": "trait",
    "description": "Grew up in Bandawang as a border town — bonus to speech/barter with smugglers, penalty with Federation officials.",
    "effect": "TBA",
    "modifiers": {
      "skill_speech_smugglers": "TBA",
      "skill_speech_federation": "TBA"
    }
  },
  feral_blood: {
    "id": "feral_blood",
    "name": "Feral Blood",
    "type": "trait",
    "description": "Ghoul-specific trait — likely a STR or damage buff traded against a higher feral-check risk.",
    "effect": "TBA",
    "modifiers": {
      "special_str": "TBA",
      "feral_check_risk": "TBA"
    }
  },
  heavy_handed: {
    "id": "heavy_handed",
    "name": "Heavy Handed",
    "type": "trait",
    "description": "You swing harder, not better. Your attacks are brutal, but lack finesse. You rarely cause a good critical hit, but you always do more melee damage.",
    "effect": "+4 Melee Damage, -25% Critical Damage",
    "modifiers": {
      "melee_dmg_flat": 4,
      "crit_damage_pct": -25
    }
  },
  short_sighted: {
    "id": "short_sighted",
    "name": "Short-Sighted",
    "type": "trait",
    "description": "Your eyes aren't what they used to be — or maybe never were. Without corrective lenses, the world blurs at any real distance.",
    "effect": "-1 Perception, unless wearing Glasses",
    "suppressed_by_item": "glasses",
    "modifiers": {
      "special_per": -1
    }
  }
};

export function getTrait(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return traitDatabase[cleanId] || { name: id, description: "Unknown Trait", modifiers: {} }; }
