// src/goatContent.js
// Hand-authored reference text for the G.O.A.T. Exam hover tooltips —
// what each SPECIAL stat and skill actually does, condensed from the
// manual (not auto-synced from Obsidian; this is fixed rules reference,
// not campaign content). Edit directly here if the manual's wording
// changes.

// Canonical display order. The stat keys are stored in Firestore as a
// plain object, and Firestore does NOT preserve key order — reading a
// character back gives them in effectively arbitrary order, which is
// why the dashboard used to render "LUK STR INT AGI CHA...". Anything
// that lists SPECIAL for a human to read iterates THIS, never
// Object.entries() on the stored object.
export const SPECIAL_ORDER = ['str', 'per', 'end', 'cha', 'int', 'agi', 'luk'];

// Broad, one-per-stat flavor text for the G.O.A.T. exam / creation
// screen — the New Vegas-style "Strength is a measure of your raw
// physical power..." narrator card, not a per-value breakdown. Each
// entry also carries an image_url slot for the GM's own 1080x1080
// generated art (one card per stat); left blank until supplied.
// Distinct from SPECIAL_INFO below, which stays the terse mechanical
// hover text used everywhere else in the app (character sheet, combat).
export const SPECIAL_FLAVOR = {
  str: {
    description: "Strength is how much of the wasteland you can bend to your will by force alone — what you can carry, what you can break, and how hard you hit when the talking's done. The strong don't ask twice.",
    image_url: "art/special_str.png"
  },
  per: {
    description: "Perception is what you catch before it catches you — the tripwire across the doorway, the glint of a scope two streets over, the one word in a lie that didn't sit right. Sharp eyes outlive strong arms.",
    image_url: "art/special_per.png"
  },
  end: {
    description: "Endurance is what's left of you after the radiation, the hunger, and the beating you took last week. It's how much the wasteland can throw at your body before your body stops throwing it back.",
    image_url: "art/special_end.png"
  },
  cha: {
    description: "Charisma is the door that opens because you're the one knocking. It's the ration you get an extra scoop of, the guard who looks the other way, the room that goes quiet when you walk in — earned or borrowed, it works the same.",
    image_url: "art/special_cha.png"
  },
  int: {
    description: "Intelligence is how fast you turn scrap into a plan — reading a situation, a machine, or a person, and knowing which wire to pull. The wasteland rewards the clever at least as often as the strong.",
    image_url: "art/special_int.png"
  },
  agi: {
    description: "Agility is the half-second between the shot fired and the one that finds you. It's how fast you move, how fast you react, and how many things you can get done before the moment's gone.",
    image_url: "art/special_agi.png"
  },
  luk: {
    description: "Luck is the reason you found the stimpak instead of the landmine. Nobody plans around it, everybody's alive because of it — the thumb on the scale the wasteland never tells you is there.",
    image_url: "art/special_luk.png"
  }
};

export const SPECIAL_INFO = {
  str: "Raw physical power. Sets weapon Strength requirements, melee damage, and starting HP. Used to push, smash, or throw heavy things.",
  per: "Awareness — sharp eyes and ears. Governs effective firing range and hit chance at distance, plus spotting traps or hidden things.",
  end: "Toughness and constitution. Drives HP, poison/radiation resistance, healing rate, and how many implants you can carry.",
  cha: "Attractiveness, trustworthiness, force of personality. Used whenever you're talking your way through a situation.",
  int: "Raw intelligence. Determines skill points gained per level, and how well you untangle puzzles, jargon, or history.",
  agi: "Speed and dexterity. Sets your base Armor Class and turn order (Sequence), and how many actions you get in a round.",
  luk: "How the dice favor you. Governs critical hits and failures, and the quality of what you find when looting."
};

export const SKILL_INFO = {
  small_guns: "5 + PER + PER. Pistols, rifles, and other one-handed or slingable firearms — assault rifles, holdout pistols.",
  big_guns: "STR + PER + AGI. Heavy two-handed or stationary weapons — miniguns, LMGs, mortars, rocket launchers.",
  energy_weapons: "5 + PER + INT. Charge-based weapons — laser rifles, plasma casters, sonic weapons. Ammo's rare, damage isn't.",
  melee_weapons: "STR + AGI. Any melee weapon. Higher skill adds flat damage and eventually a free small-action attack.",
  unarmed: "STR + AGI. Punches, kicks, grapples. Higher skill adds flat damage and unlocks special unarmed moves.",
  throwing: "STR×1.5 + AGI×0.5. Throwing anything — grenades, rocks, a table if you're strong enough.",
  medicine: "INT + PER. First aid, diagnosing wounds, and healing crippled limbs.",
  science: "5 + INT + INT. Understanding how the world works — hacking, coding, scientific theory.",
  lockpick: "5 + PER + AGI. Picking locked doors and safes. A critical failure jams the lock.",
  sneak: "AGI + AGI. Slipping past enemies unseen. A successful sneak attack hits harder against an unaware target.",
  speech: "5 + CHA + CHA. Talking your way through — persuading, deceiving, intimidating, or spotting a lie.",
  survival: "5 + AGI + AGI. Scrounging food and water, navigating terrain, general wilderness know-how.",
  steal: "5 + AGI + AGI. Lifting or planting items on someone without them noticing.",
  traps: "PER + AGI + INT. Detecting, disarming, escaping, or setting traps.",
  engineering: "5 + INT×1.5 + AGI×0.5. Building, repairing, and fixing malfunctioning gear.",
  robotics: "INT + INT. Understanding and disabling robots and other programmed machines.",
  gunsmith: "PER + AGI + INT. Modifying, repairing, and crafting weapons or ammunition.",
  repair: "INT × 3. Restoring worn weapons and armor — how many condition marks you can take off, and how often you manage it without using up parts.",
  instinct: "(All SPECIAL stats summed) ÷ 3, rounded down. Gut feeling — sensing something's off even if you can't prove it."
};
