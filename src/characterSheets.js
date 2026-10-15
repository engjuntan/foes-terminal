// Character sheets — front, side and back on white, one per character.
//
// A model sheet, in the animation sense: the reference you hand to whoever
// draws the character next so they come out the same person twice. Not a
// scene and not a portrait — no setting, no mood, no grade. Flat light and
// a white ground so the costume reads without interpretation.
//
// Prompts live in `tools/art-slots.mjs` under the `sheet` group. The
// character's canonical look is a {{token}} from `tools/art-characters.mjs`,
// so the sheet and every scene they appear in are built from one source.

export const CHARACTER_SHEETS = [
  { id: "big_ben", name: "Big Ben", note: "Gergasi in the clock-tower cosplay", image_url: "art/sheet_big_ben.jpg" },
  { id: "janson_peng", name: "Janson Peng", note: "the short Peng brother, seio", image_url: "art/sheet_janson_peng.jpg" },
  { id: "orange_peng", name: "Orange Peng", note: "the large Peng brother, gentle", image_url: "art/sheet_orange_peng.jpg" },
  { id: "farmer_nick_peng", name: "Farmer Nick Peng", note: "ghoul, Bandawang's largest farmer", image_url: "art/sheet_farmer_nick_peng.jpg" },
  { id: "slink_tan", name: "Slink Tan", note: "1414 Red Pole, gun leg, eyepatch", image_url: "art/sheet_slink_tan.jpg" },
  { id: "iron_legs", name: "Iron Legs", note: "PC — the Delusional Master", image_url: "art/sheet_iron_legs.jpg" },
  { id: "kong", name: "Kong", note: "PC — the Gergasi Scholar", image_url: "art/sheet_kong.jpg" },
  { id: "two", name: "Two", note: "PC — the Fallen Prince", image_url: "art/sheet_two.jpg" }
];

export function getCharacterSheet(id) {
  return CHARACTER_SHEETS.find(s => s.id === id) || null;
}
