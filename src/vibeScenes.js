// Vibe scenes — wide shots of the campaign, for the GM to set a mood with.
//
// These are not items, locations or portraits. A location shot answers
// "what does this place look like"; a vibe scene answers "what is it like
// to be here", and it has people doing something in it. The GM's own
// examples were a classroom argument, a loose kerbau in a paddy, and a
// standoff over a dining table at seio.
//
// Prompts live in `tools/art-slots.mjs` under the `vibe` group, the same
// way faction and karma cards do. The url is written back into `image_url`
// here, so this file is the single place that knows which scenes exist.

export const VIBE_SCENES = [
  {
    id: "driving_school",
    name: "The Driving School",
    blurb:
      "Learning to drive at the end of the world, with a clipboard and strong opinions.",
    image_url: ""
  },
  {
    id: "big_ben_taken_seriously",
    name: "Big Ben, Taken Seriously",
    blurb:
      "Three metres of Gergasi in a homemade clock tower, listening carefully.",
    image_url: "art/vibe_big_ben_taken_seriously.jpg"
  },
  {
    id: "crossing_the_emerald_sea",
    name: "Crossing the Emerald Sea",
    blurb:
      "Pahlawan on foot across the Chukai at night, and the sand is full of green glass.",
    image_url: ""
  }
];

export function getVibeScene(id) {
  return VIBE_SCENES.find(s => s.id === id) || null;
}
