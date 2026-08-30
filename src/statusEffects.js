// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const statusEffectDatabase = {
  bleeding: {
    "id": "bleeding",
    "name": "Bleeding",
    "type": "status_effect",
    "description": "A major artery, opened. It won't stop on its own.",
    "effect": "1d6 damage per turn, until cauterized",
    "ticking": true,
    "modifiers": {
      "damage_per_turn": "1d6"
    }
  },
  blinded: {
    "id": "blinded",
    "name": "Blinded",
    "type": "status_effect",
    "description": "Something's wrong with your eyes — dust, blood, a solid hit.",
    "effect": "-3 Perception and -50% hit chance, until cured",
    "ticking": false,
    "modifiers": {
      "special_per": -3,
      "hit_chance_pct": -50
    }
  },
  crippled_arm: {
    "id": "crippled_arm",
    "name": "Crippled Arm",
    "type": "status_effect",
    "description": "A solid hit to the arm — weapons don't sit right in a hand that won't cooperate.",
    "effect": "-10 to all combat skills, until cured",
    "ticking": false,
    "modifiers": {
      "skill_small_guns": -10,
      "skill_big_guns": -10,
      "skill_energy_weapons": -10,
      "skill_melee_weapons": -10,
      "skill_unarmed": -10,
      "skill_throwing": -10
    }
  },
  crippled_leg: {
    "id": "crippled_leg",
    "name": "Crippled Leg",
    "type": "status_effect",
    "description": "A solid hit to the leg — every step is a bad idea now.",
    "effect": "-2 Agility, until cured",
    "ticking": false,
    "modifiers": {
      "special_agi": -2
    }
  },
  distracted: {
    "id": "distracted",
    "name": "Distracted",
    "type": "status_effect",
    "description": "Lost in thought about something cringey. Focus is gone for a moment.",
    "effect": "Lose your next turn",
    "ticking": true,
    "modifiers": {
      "skip_turn": true
    }
  },
  jammed: {
    "id": "jammed",
    "name": "Jammed",
    "type": "status_effect",
    "description": "The gun doesn't fire. Melee attacks spin out of control instead.",
    "effect": "Lose your next turn clearing it",
    "ticking": true,
    "modifiers": {
      "skip_turn": true
    }
  },
  knocked_down: {
    "id": "knocked_down",
    "name": "Knocked Down",
    "type": "status_effect",
    "description": "Flat on the ground. Getting back up takes a moment.",
    "effect": "Lose your next turn",
    "ticking": true,
    "modifiers": {
      "skip_turn": true
    }
  },
  poison: {
    "id": "poison",
    "name": "Poison",
    "type": "status_effect",
    "description": "Toxin working through the bloodstream.",
    "effect": "1-5 damage at the start of each of your turns, until cured",
    "ticking": true,
    "modifiers": {
      "damage_per_turn": "1d5"
    }
  },
  stunned: {
    "id": "stunned",
    "name": "Stunned",
    "type": "status_effect",
    "description": "Too dazed to act.",
    "effect": "Skips your turn, until cured",
    "ticking": true,
    "modifiers": {
      "skip_turn": true
    }
  }
};

export function getStatusEffect(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return statusEffectDatabase[cleanId] || null; }
