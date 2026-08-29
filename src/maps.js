// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const mapDatabase = {
  bandawang_baru: {
    "id": "bandawang_baru",
    "name": "Bandawang Baru",
    "type": "map",
    "parent_id": "bandawang_main_map",
    "image_url": "https://i.imgur.com/KmhxrHE_d.webp?maxwidth=760&fidelity=grand",
    "description": "A district of Bandawang."
  },
  bandawang_lama: {
    "id": "bandawang_lama",
    "name": "Bandawang Lama",
    "type": "map",
    "parent_id": "bandawang_main_map",
    "image_url": "https://i.imgur.com/gql0B0b_d.webp?maxwidth=760&fidelity=grand",
    "description": "A district of Bandawang."
  },
  bandawang_main_map: {
    "id": "bandawang_main_map",
    "name": "Bandawang Main Map",
    "type": "map",
    "parent_id": null,
    "image_url": "https://i.imgur.com/Scpn9X2_d.webp?maxwidth=760&fidelity=grand",
    "description": "The main overview map of the Bandawang region."
  }
};

export function getMap(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return mapDatabase[cleanId] || null; }
