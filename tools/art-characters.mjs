// tools/art-characters.mjs — canonical looks, written once and reused.
//
// THE PROBLEM THIS SOLVES. Big Ben has a portrait and a vibe scene. Both
// prompts described him from scratch, so he is a slightly different
// creature in each. The same is true of every faction: the Federation's
// uniform is described in the faction card, again in three bestiary
// entries, and again in any scene with a soldier in it. Every retelling
// is a chance to drift.
//
// HOW IT WORKS. A prompt anywhere — a vault note, a slot, a bestiary
// entry — can write a token like {{big_ben}} or {{federation_soldier}}.
// `expandCharacters()` swaps it for the canonical block below before the
// prompt is sent. Change the block here and every image that references
// it changes with it.
//
// WHAT BELONGS HERE. Only things that appear in MORE THAN ONE image. A
// character who exists in exactly one portrait does not need a template;
// their note is already the single source. Add one the moment a second
// image wants them.

export const CHARACTERS = {
  // ---- people -------------------------------------------------------
  big_ben:
    "BIG BEN: a Gergasi — a Fallout 4 super mutant, close to three metres tall, " +
    "slabbed with grotesque asymmetric muscle, thick mottled grey-green hide gone " +
    "lumpy like old leather, a heavy jutting brow, small yellow eyes and a wide " +
    "lipless mouth. He wears a HOMEMADE, BADLY MADE costume meant to make him look " +
    "like the Big Ben clock tower and it fits him terribly: scavenged painted board " +
    "panels lashed over his shoulders and down his back, a crooked clock face strapped " +
    "to his chest with its hands askew, and a lopsided spire tied to the top of his " +
    "head. It reads as poor cosplay, never as a disguise. He is gentle and entirely " +
    "sincere about the costume.",

  // ---- the ghoul baseline -------------------------------------------
  // Portraits already get this automatically; a scene or a bestiary entry
  // has to ask for it.
  ghoul:
    "GHOUL, in the Fallout sense: skin like cracked sun-dried leather in mottled grey, " +
    "brown and raw pink, split open in places to the tissue beneath; NO NOSE at all, " +
    "only the bare nasal opening; no hair anywhere, no eyebrows, no eyelashes; a " +
    "lipless mouth drawn back from the teeth; milky or sunken eyes. Not a scarred " +
    "person, not a burn victim, not merely weathered.",

  // ---- factions -----------------------------------------------------
  federation_officer:
    "FEDERATION OFFICER: full WHITE Malaysian ceremonial dress — a high-collared white " +
    "tunic with gold buttons and gold shoulder cords, white trousers with a stripe, a " +
    "white peaked cap with a gold badge, white gloves, a ceremonial belt. Immaculate " +
    "and conspicuously clean against everything around him. Malaysian.",

  federation_soldier:
    "FEDERATION SOLDIER: a sun-faded LAVENDER field jacket with ORANGE collar facings " +
    "over lavender combat slacks, brown webbing and pouches, a WW1-pattern steel helmet " +
    "painted lavender. Lavender and orange throughout, never white or cream. Malaysian.",

  pci_ghoul:
    "A GHOUL LABOURER OF THE PUBLIC CITIZENSHIP INITIATIVE: a long frayed bright-ORANGE " +
    "mechanic's jumpsuit, filthy and sun-bleached, sleeves rolled. Ghoul features as " +
    "above — no nose, no hair, cracked leather skin.",

  protectorate:
    "PROTECTORATE PERSONNEL: DARK NAVY BLUE, never khaki or cream. Naval formal " +
    "tailoring with a light steampunk flair — a quilted navy high-collared tunic or " +
    "long coat, an open-necked shirt with no tie, navy shoulder boards, brass buttons, " +
    "black leather gloves, a wide leather belt, tall boots, and a leather bandolier of " +
    "mechanic's tools across the chest. NO HEADGEAR OF ANY KIND. Malaysian.",

  pahlawan:
    "CALIPHATE PAHLAWAN: salvaged MODERN BODY ARMOUR worn OVER traditional Malay dress — " +
    "a scuffed plate carrier, composite shoulder and shin plates, webbing pouches, over " +
    "unbleached linen robes and a samping sash at the waist, with a tengkolok headwrap " +
    "or a folded scarf. Waxed-cloth-wrapped manuscripts in a bandolier satchel, tooled " +
    "leather straps, a keris at the hip. Sand and ochre with turquoise accents. Malaysian.",

  rakan_watch:
    "RAKAN WATCH VOLUNTEER: a homemade matching municipal MINT-GREEN and off-white shirt " +
    "with a hand-sewn name tag, faded, sweat-marked and mended, over work trousers and " +
    "worn boots. Civilian volunteers performing respectability, not a uniformed force. " +
    "Malaysian.",

  bandawang_enforcer:
    "BANDAWANG ENFORCER: drab light-brown pre-war private-security armour thrown on over " +
    "mismatched civilian clothes, a baton, black-market weapons. Half-trained and " +
    "half-corrupt, never smart. Malaysian.",

  axe_gang:
    "AXE GANG: Malaysian ROCK KAPAK of the late eighties, NOT punk — long straight black " +
    "hair worn loose past the shoulders, headbands and knotted bandanas, NO mohawks and " +
    "NO shaved heads. Sleeveless denim and leather vests open over bare chests or thin " +
    "singlets, tight faded jeans, studded belts, leather wristbands, scuffed boots. " +
    "Oil-black and factory safety-yellow. Their 'axes' are modified ELECTRIC GUITARS.",

  triad_1414:
    "1414 TRIAD: tailored suits or mandarin-collar shirts, well cut and well kept — this " +
    "is a society that is rebuilding a proper one. Heavily inked dragon tattoos down both " +
    "arms in dense traditional irezumi work, dark blue-black ink gone green with age, " +
    "shown where sleeves are rolled or absent. Malaysian Chinese.",

  gergasi:
    "GERGASI: a Fallout 4 super mutant — close to three metres tall, grotesque ASYMMETRIC " +
    "muscle with one shoulder swollen higher than the other, thick mottled grey-green hide " +
    "gone LUMPY like old leather, a heavy jutting brow, small yellow eyes, a wide lipless " +
    "mouth. Built wrong rather than built strong. Never smooth, never symmetrical, never " +
    "the Hulk."
};

const TOKEN = /\{\{\s*([a-z0-9_]+)\s*\}\}/gi;

/** Swap every {{token}} for its canonical block. An unknown token is left
 *  alone and reported, so a typo is visible rather than silently dropped. */
export function expandCharacters(prompt, onMissing) {
  if (!prompt) return prompt;
  return String(prompt).replace(TOKEN, (whole, key) => {
    const hit = CHARACTERS[key.toLowerCase()];
    if (hit) return hit;
    if (onMissing) onMissing(key);
    return whole;
  });
}

/** Every token a prompt references, for checking. */
export function tokensIn(prompt) {
  return [...String(prompt || '').matchAll(TOKEN)].map(m => m[1].toLowerCase());
}
