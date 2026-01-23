// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const traitDatabase = {
  heavy_handed: {
    "id": "heavy_handed",
    "name": "Heavy Handed",
    "type": "trait",
    "description": "You swing harder, not better. Your attacks are brutal, but lack finesse. You rarely cause a good critical hit, but you always do more melee damage.",
    "modifiers": {
      "melee_damage_flat": 4,
      "crit_chance": -30
    }
  }
};

export function getTrait(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return traitDatabase[cleanId] || { name: id, description: "Unknown Trait", modifiers: {} }; }
