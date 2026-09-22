// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
// Bootstrapped empty by the system-builder agent (job 5) because the
// sync couldn't be run while the vault was being edited in parallel —
// run `node sync-obsidian.js --once` to populate it for real from
// People/ notes. Matches generateFileContent('person', {})'s exact
// output shape, so the real sync overwrites this cleanly.
export const peopleDatabase = {};

export function getPerson(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return peopleDatabase[cleanId] || null; }
