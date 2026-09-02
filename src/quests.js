// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const questDatabase = {
  example_quest: {
    "id": "example_quest",
    "name": "Example Quest",
    "type": "quest",
    "body": "A shipment bound for the Federal Cultural Library never arrived. The Protectorate wants it found before RobCo's rivals do.",
    "objectives": [
      "Track down the last known location of the shipment",
      "Recover the cargo",
      "Deliver it to the Federal Cultural Library"
    ],
    "category_path": [
      "Quests"
    ]
  }
};

export function getQuest(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return questDatabase[cleanId] || null; }
