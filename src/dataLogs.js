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
  federation_gazette_bandawang_explosion: {
    "id": "federation_gazette_bandawang_explosion",
    "name": "Federation Gazette — Bandawang Explosion",
    "type": "data_log",
    "body": "EXPLOSION ROCKS BANDAWANG WATER FACILITY; COUNCIL SILENT AS FEDERATION READIES RESPONSE\n\nTHE FEDERATION GAZETTE — Official Registry of the Federation of Malaya\n\nAn explosion tore through the water treatment facility on the outskirts of Bandawang early this morning, sending a column of red smoke over the district and prompting an immediate evacuation of surrounding blocks. Federation monitoring stations report no elevated radiation readings at this time, though residents in the affected quarter have been advised to shelter indoors pending confirmation from Federal inspectors.\n\nThe Bandawang Council, convened in emergency session shortly after the blast, has yet to issue an official statement. Sources within the Council chambers describe the mood as \"contained but tense,\" though no timeline for a public address has been given.\n\nPreliminary assessments point to sabotage. Federal analysts note the timing and target bear the hallmarks of the Sepuluh Ribu, the ghoul separatist faction long blamed for destabilizing operations across Federation territory. No group has claimed responsibility as of this printing.\n\nAn investigation force is expected to depart for Bandawang within the week, pending final authorization from the Ministry of Infrastructure. Citizens are reminded that unauthorized entry into restricted zones remains a punishable offense under the Public Order Statutes, and are urged to report any sighting of Sepuluh Ribu activity to their nearest Federation post.\n\nThe Federation Gazette will provide updates as they become available. Until then: stand united, stand informed.",
    "category_path": [
      "Bandawang"
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
