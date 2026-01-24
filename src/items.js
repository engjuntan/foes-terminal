// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const itemDatabase = {
  homemade_pistol: {
    "id": "homemade_pistol",
    "name": "Homemade Pistol",
    "type": "weapon",
    "slot": "hand",
    "icon": "https://i.imgur.com/ejIIJM5.png",
    "description": "The Homemade Pistol is a weapon of the enterprising survivor. Cobbled out of junk and stuck together on nothing but willpower and faith, the Homemade Pistol is certainly a weapon of sorts. Some use gunpowder, some use pressure, but all of them have one thing in common: injecting lead into whatever target it finds.",
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
