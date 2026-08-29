// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const traitDatabase = {
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
    "requires_item": "glasses",
    "modifiers": {
      "special_per": -1
    }
  }
};

export function getTrait(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return traitDatabase[cleanId] || { name: id, description: "Unknown Trait", modifiers: {} }; }
