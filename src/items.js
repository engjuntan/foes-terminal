// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const itemDatabase = {
  glasses: {
    "id": "glasses",
    "name": "Glasses",
    "type": "accessory",
    "slot": "head",
    "icon": "",
    "description": "A pair of corrective lenses, scavenged and re-fitted. It takes real skill to make these things. Hope you don't drop them. ",
    "value": 10
  },
  dinar: {
    "id": "dinar",
    "name": "Caliphate Dinar",
    "type": "currency",
    "icon": "[https://placehold.co/50x50/gold/black?text=$](https://placehold.co/50x50/gold/black?text=$)",
    "description": "A trinitite-infused library token, granting temporary access to the Grand Library. Often treated as spiritual relics or symbols of honor ",
    "value": 1,
    "stackable": true
  },
  pd: {
    "id": "pd",
    "name": "Protectorate Dollar",
    "type": "currency",
    "icon": "[https://placehold.co/50x50/gold/black?text=$](https://placehold.co/50x50/gold/black?text=$)",
    "description": "A tightly controlled currency distributed by the Protectorate.",
    "value": 1,
    "stackable": true
  },
  rmr: {
    "id": "rmr",
    "name": "Reformed Malayan Ringgit",
    "type": "currency",
    "icon": "[https://placehold.co/50x50/gold/black?text=$](https://placehold.co/50x50/gold/black?text=$)",
    "description": "Also called RMR, it is the most common currency in the Wastes. It consists of salvaged pre-war Malayan Ringgit that have been stamped and marked for day to day use.",
    "value": 1,
    "stackable": true
  },
  homemade_pistol: {
    "id": "homemade_pistol",
    "name": "Homemade Pistol",
    "type": "weapon",
    "slot": "hand",
    "size": "small",
    "two_handed": false,
    "skill": "small_guns",
    "icon": "https://i.imgur.com/ejIIJM5.png",
    "description": "The Homemade Pistol is a weapon of the enterprising survivor. Cobbled out of junk and stuck together on nothing but willpower and faith, the Homemade Pistol is certainly a weapon of sorts. Some use gunpowder, some use pressure, but all of them have one thing in common: injecting lead into whatever it's pointed at.",
    "stats": {
      "dmg": "1d6",
      "dmgType": "normal",
      "range": 15
    },
    "value": 50
  },
  kitchen_knife: {
    "id": "kitchen_knife",
    "name": "Kitchen Knife",
    "type": "weapon",
    "slot": "hand",
    "size": "small",
    "two_handed": false,
    "skill": "melee_weapons",
    "icon": "https://i.imgur.com/48WviQB.png",
    "description": "The knife of the willing, the chefs, the housewife under duress and the knife you find under scraps of salvage. Is it sharp? Can it slice? Who cares? It's a knife.",
    "stats": {
      "dmg": "1d6",
      "dmgType": "normal",
      "range": 1
    },
    "value": 10
  }
};

export function getItem(itemId) { if (!itemId) return null; const cleanId = itemId.toLowerCase().replace(/ /g, "_"); return itemDatabase[cleanId] || null; }
