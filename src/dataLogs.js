// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const dataLogDatabase = {
  baccarat_rules: {
    "id": "baccarat_rules",
    "name": "Baccarat Rules",
    "type": "data_log",
    "body": "The Bandawang Casino runs baccarat the old way: Player, Banker, or Tie. Closest hand to 9 wins. House takes 5% on Banker wins. Cheating is punished by the house, not the law — and the house doesn't call the Protectorate.",
    "category_path": [
      "Bandawang",
      "Bandawang Casino"
    ]
  },
  session_1_recap: {
    "id": "session_1_recap",
    "name": "Session 1 Recap",
    "type": "data_log",
    "body": "The party woke up in the Bandawang Labor Camp with no memory of how they arrived. A test recap entry — replace with the real thing after your first session.",
    "category_path": [
      "Bandawang"
    ]
  }
};

export function getDataLog(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return dataLogDatabase[cleanId] || null; }
