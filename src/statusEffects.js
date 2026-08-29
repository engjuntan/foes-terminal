// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const statusEffectDatabase = {
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
