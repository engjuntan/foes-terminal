// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const questDatabase = {
  alamak_semut_lagi: {
    "id": "alamak_semut_lagi",
    "name": "Alamak Semut Lagi",
    "type": "quest",
    "body": "Given by Boss Bob. Details not yet written by the GM.",
    "objectives": [],
    "category_path": [
      "Quests"
    ]
  },
  an_audience_with_the_boss: {
    "id": "an_audience_with_the_boss",
    "name": "An Audience with the Boss",
    "type": "quest",
    "body": "Given by Boss Bob. Details not yet written by the GM.",
    "objectives": [],
    "category_path": [
      "Quests"
    ]
  },
  an_unlikely_pairing: {
    "id": "an_unlikely_pairing",
    "name": "An Unlikely Pairing",
    "type": "quest",
    "body": "Given by Boss Bob or Aida. Mak Cik Yam refuses to leave Bandawang, no matter how bad things get for the town's civilians. Perhaps finding her a suitable mate would make her happy enough to finally reconsider — and Farmer Nick Peng, another of Bandawang's resident grouches, might just fit the bill.",
    "objectives": [
      "Speak to Boss Bob or Aida about Mak Cik Yam's stubbornness",
      "Talk to Mak Cik Yam about what she'd actually want in a mate",
      "Introduce Mak Cik Yam to Farmer Nick Peng"
    ],
    "category_path": [
      "Quests"
    ]
  },
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
  },
  its_hard_to_let_go: {
    "id": "its_hard_to_let_go",
    "name": "It's Hard To Let Go",
    "type": "quest",
    "body": "Given by Boss Bob. Details not yet written by the GM.",
    "objectives": [],
    "category_path": [
      "Quests"
    ]
  },
  the_200_year_old_heist: {
    "id": "the_200_year_old_heist",
    "name": "The 200 Year Old Heist",
    "type": "quest",
    "body": "Given by Boss Bob. The crew's target is the sealed vault beneath ProTiga HQ in North Bandawang — the heist itself hasn't been planned out yet by the GM.",
    "objectives": [],
    "category_path": [
      "Quests"
    ]
  },
  call_of_the_ten_thousand: {
    "id": "call_of_the_ten_thousand",
    "name": "The Call of the Ten Thousand",
    "type": "quest",
    "body": "Given by Boss Bob. Details not yet written by the GM.",
    "objectives": [],
    "category_path": [
      "Quests"
    ]
  },
  the_gkr_main_plot: {
    "id": "the_gkr_main_plot",
    "name": "The GKR Main Plot",
    "type": "quest",
    "body": "Given by Boss Bob. Details not yet written by the GM.",
    "objectives": [],
    "category_path": [
      "Quests"
    ]
  }
};

export function getQuest(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return questDatabase[cleanId] || null; }
