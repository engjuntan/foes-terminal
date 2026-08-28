// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const statusEffectDatabase = {};

export function getStatusEffect(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return statusEffectDatabase[cleanId] || null; }
