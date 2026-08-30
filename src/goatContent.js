// src/goatContent.js
// Hand-authored reference text for the G.O.A.T. Exam hover tooltips —
// what each SPECIAL stat and skill actually does, condensed from the
// manual (not auto-synced from Obsidian; this is fixed rules reference,
// not campaign content). Edit directly here if the manual's wording
// changes.

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
  instinct: "(All SPECIAL stats summed) ÷ 3, rounded down. Gut feeling — sensing something's off even if you can't prove it."
};
