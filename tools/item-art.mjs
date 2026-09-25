// tools/item-art.mjs — art pipeline: prompt sheet → images → Imgur → vault/src.
// Covers vault item icons and the content slots in tools/art-slots.mjs
// (reputation tiers, karma tiers, SPECIAL cards).
//
//   npm run art -- status                 what's done, what's pending
//   npm run art -- sheet [--limit N]      write art/prompt-sheet.md for manual generation (free)
//   npm run art -- ingest [--limit N]     upload the vault's Media/New items/<id>.png|jpg to Imgur and link them
//   npm run art -- generate --limit N     PAID: generate N images with the Gemini API into Media/New items/
//   npm run art -- queue [--limit N]     export the pending queue (art/queue.json + .md) for another image tool
//     …add --only items|slots|locations and --group faction|karma|rep|special to narrow any of these
//   npm run art -- skip <id|prefix*|slots> leave art you already made out of the runs (--undo to restore)
//   npm run art -- collect <id>          file the newest browser download as Media/New items/<id>.png
//   npm run art -- link <id> <url>       attach an already-uploaded image to an item or slot
//   npm run art -- set-prompts <file.json>  write {id: prompt} into the vault's image_prompt fields
//
// Add --dry-run to any command to see what it would do without doing it.
//
// Safety: every command that spends anything (API calls, uploads) needs an
// explicit --limit, is hard-capped at MAX_PER_RUN, and stops at the first
// error rather than retrying. A rate limit ends the run cleanly; running the
// same command again resumes from where it stopped, because anything already
// linked in the vault (or already sitting in the inbox) is skipped.

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { allSlots } from './art-slots.mjs';
import { allLocationShots } from './art-locations.mjs';
import crypto from 'crypto';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.FOES_VAULT || '/Users/edge/Library/CloudStorage/GoogleDrive-fallouteasternshores@gmail.com/My Drive/FOES Wiki/FALLOUT_MASTER_ZIPv3';
const ART = path.join(ROOT, 'art');
// Generated images land in the vault's Media folder so they ride Google
// Drive with everything else and the GM can see them without leaving
// Obsidian. "New items" is the staging tray: approved art gets dragged out
// of it by hand; `ingest` moves what it uploads into `uploaded/`.
const MEDIA = process.env.FOES_MEDIA || path.join(VAULT, 'Media', 'New items');
const INBOX = MEDIA;
const DONE = path.join(MEDIA, 'uploaded');
const LEDGER = path.join(ART, 'ledger.json');
const SKIPLIST = path.join(ART, 'skip.json');

const MAX_PER_RUN = 25;          // no single run can exceed this, whatever --limit says
const LIFETIME_GENERATE_CAP = 400; // total paid generations ever; raise deliberately if needed

// The shared look — the FOES Visual Standard Bible's stacking formula
// (render register + grade + place/climate + negatives), applied to every
// prompt so the whole set holds one aesthetic. Items use the Bible's
// "object plate" register; the GM's overarching rules are photorealism,
// 1080x1080 square, and a plain post-apocalyptic ground that never
// competes with the subject. Edit here to restyle everything.
const GRADE = 'Monsoon Gold grade: blown-out near-white hazy sky light, hot golden key light, cyan-green bounced shadows, heavy humid air.';
const CLIMATE = 'Equatorial Malaya after 170 years of rain: black-green mould and algae staining from the top down, rust weeping in dark streaks, damp surfaces, red laterite mud. No dust, no sand, no arid cracked earth.';
// "No text" was blanket, and it fought the item prompts themselves in two
// whole classes of item. Branded consumables: Jet's prompt asks for
// "faded red lettering spelling JET", Cap Kilat Cola's for "a label
// reading Cap Kilat Cola" — a branded bottle without its brand is just a
// jar, and Fallout's own item art is built on those labels. Written
// things: a "field diary with terrain sketches and movement notes" or a
// "log book with hand-drawn water maps" IS writing; ban the writing and
// the object cannot be drawn at all. So the ban now names the text nobody
// asked for — captions, watermarks, signatures, stray glyphs floating on
// an object that isn't a written thing — and lets the subject carry its
// own.
const NEGATIVES = 'No captions, no watermark, no signature, and no stray lettering on an object that is not itself a written or labelled thing — a document, book, note, map, poster, sign or a product with a printed label may carry its own writing, and should. No hands, no people, no modern plastics, no flat screens, no Vault-Tec or other Bethesda marks.';
// Each item carries its own setting in its prompt (a suitable, interesting
// place that item would actually be found), so the shared style no longer
// names a surface — it only holds the register, the grade, the climate and
// the negatives, plus the rule that the setting stays out of the way.
const STYLE = `Photorealistic photograph, 1:1 square, 1080x1080. The object is the subject: centred, prominent, sharp, filling most of the frame, with one soft key light. Its setting is real but simple and thrown out of focus — depth, never clutter, and nothing in it competes with the object. No faction logos, insignia, emblems or crests of any kind. ${GRADE} ${CLIMATE} ${NEGATIVES}`;

// Older prompts carried their own style tail; drop it so it can't fight STYLE.
const LEGACY_TAIL = /,?\s*isolated on dark background,?\s*game icon style\.?\s*$/i;

// ---------- args ----------
const args = process.argv.slice(2);
const command = args[0];
const flag = name => args.includes(`--${name}`);
const option = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const DRY = flag('dry-run');

function requireLimit() {
  const raw = option('limit');
  const n = Number(raw);
  if (!raw || !Number.isInteger(n) || n < 1) fail(`"${command}" needs --limit N (1–${MAX_PER_RUN}).`);
  if (n > MAX_PER_RUN) fail(`--limit ${n} is over the per-run cap of ${MAX_PER_RUN}.`);
  return n;
}
function fail(msg) { console.error(`\n✖ ${msg}\n`); process.exit(1); }

// ---------- vault ----------
function allMarkdown(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    // Skip hidden folders (.obsidian, .trash) but not files: real item
    // files can start with a dot (".50 cal Machine Gun.md").
    if (fs.statSync(full).isDirectory()) { if (!name.startsWith('.')) allMarkdown(full, out); }
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

// Items straight from the vault (not src/items.js), so the script always
// sees the latest prompts/icons, including ones it just wrote.
function loadItems() {
  const ITEM_TYPES = new Set(['weapon', 'armor', 'consumable', 'currency', 'accessory', 'ammo', 'component', 'junk']);
  const items = [];
  for (const file of allMarkdown(VAULT)) {
    const text = fs.readFileSync(file, 'utf8');
    const m = text.match(/```json\s*([\s\S]*?)```/);
    if (!m) continue;
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    if (!data.id || !ITEM_TYPES.has(data.type)) continue;
    items.push({ ...data, file });
  }
  return items;
}

// A linked url is either an Imgur link or, on the --local route, a
// relative `art/<id>.jpg` that ships with the app. Both mean "made" —
// matching only http:// here is what made the queue keep re-offering
// locally-ingested art and let a re-ingest overwrite it.
const isLinked = url => !!url && !/placehold\.co/.test(url) && (/^https?:\/\//.test(url) || /^art\//.test(url));
const hasArt = item => isLinked(item.icon || '');
// GM ruling, 25 Sep: armor gets no moss. The shared CLIMATE clause puts
// "black-green mould and algae staining from the top down" on every
// object, which is right for a signboard or a fuel drum and wrong for a
// vest someone is meant to put on — worn kit reads as abandoned scenery
// the moment it grows a lawn. Armor keeps the wet, rusted, hard-used
// world; it just isn't overgrown by it.
const CLIMATE_WORN = 'Equatorial Malaya after 170 years of rain: rust weeping in dark streaks, salt and sweat staining, scuffed and scratched surfaces, damp and recently rained on, red laterite mud worked into the seams. NO moss, NO algae, NO lichen, NO mould, NO green growth of any kind on the object. No dust, no sand, no arid cracked earth.';
const WORN_TYPES = new Set(['armor', 'accessory']);
const styleFor = item => (WORN_TYPES.has(item.type) ? STYLE.replace(CLIMATE, CLIMATE_WORN) : STYLE);
const fullPrompt = item => `${styleFor(item)} Subject: ${(item.image_prompt || '').replace(LEGACY_TAIL, '').trim()}`;

// Edits one field inside the file's json block as a single-line text edit,
// leaving the GM's formatting everywhere else untouched. Re-parses the block
// afterwards and refuses to write if the edit broke the JSON.
function setVaultField(file, key, value, afterKey = 'icon') {
  const text = fs.readFileSync(file, 'utf8');
  const block = text.match(/```json\s*([\s\S]*?)```/);
  if (!block) throw new Error(`no json block in ${file}`);
  let json = block[1];
  const line = new RegExp(`("${key}"\\s*:\\s*)"(?:[^"\\\\]|\\\\.)*"`);
  const encoded = JSON.stringify(value);
  if (line.test(json)) {
    json = json.replace(line, (_, lead) => `${lead}${encoded}`);
  } else {
    const anchor = new RegExp(`(\\n([ \\t]*)"${afterKey}"\\s*:\\s*"(?:[^"\\\\]|\\\\.)*",)`);
    if (!anchor.test(json)) throw new Error(`no "${afterKey}" field to insert "${key}" after in ${file}`);
    json = json.replace(anchor, (all, _m, indent) => `${all}\n${indent}"${key}": ${encoded},`);
  }
  const parsed = JSON.parse(json); // throws → nothing written
  if (parsed[key] !== value) throw new Error(`edit didn't take in ${file}`);
  if (!DRY) fs.writeFileSync(file, text.replace(block[1], () => json)); // fn form: no $-pattern surprises
}

// ---------- ledger ----------
function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); }
  catch { return { generated: 0, uploaded: 0, history: [] }; }
}
function writeLedger(ledger) { if (!DRY) fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2)); }
function inboxFileFor(id) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const f = path.join(INBOX, `${id}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

// ---------- targets ----------
// One shape for both kinds of art: vault items (prompt + icon in the item's
// json) and content slots (prompt in art-slots.mjs, `image_url: ""` in a
// hand-written module). Everything below works on targets, so `sheet`,
// `generate` and `ingest` cover both without caring which is which.
function itemTargets() {
  return loadItems().map(item => ({
    id: item.id,
    name: item.name,
    kind: 'item',
    hasArt: hasArt(item),
    hasPrompt: !!item.image_prompt,
    prompt: fullPrompt(item),
    description: item.description || '',
    setUrl: url => setVaultField(item.file, 'icon', url)
  }));
}

// Reads/writes `image_url: ""` on one entry of a hand-written source module.
// The entry is found by its anchor (an id line, or a key line for SPECIAL),
// then the next image_url after it — the same minimal-edit approach the vault
// files get, so the rest of the file is left exactly as written.
function slotUrlRange(text, anchor) {
  const at = text.search(anchor);
  if (at < 0) return null;
  const field = /image_url:\s*(['"])((?:[^'"\\]|\\.)*)\1/g;
  field.lastIndex = at;
  const m = field.exec(text);
  return m ? { start: m.index, end: m.index + m[0].length, value: m[2] } : null;
}

function slotTargets() {
  return allSlots().map(slot => {
    const full = path.join(ROOT, slot.file);
    const text = fs.readFileSync(full, 'utf8');
    const found = slotUrlRange(text, slot.anchor);
    if (!found) console.warn(`  [slot] no image_url found for ${slot.id} in ${slot.file}`);
    return {
      id: slot.id,
      name: slot.label,
      kind: 'slot',
      hasArt: !!(found && isLinked(found.value)),
      hasPrompt: true,
      prompt: `${slot.style} Subject: ${slot.prompt}`,
      description: slot.prompt,
      setUrl: url => {
        const current = fs.readFileSync(full, 'utf8');
        const range = slotUrlRange(current, slot.anchor);
        if (!range) throw new Error(`no image_url slot for ${slot.id}`);
        const next = current.slice(0, range.start) + `image_url: ${JSON.stringify(url)}` + current.slice(range.end);
        if (!DRY) fs.writeFileSync(full, next);
      }
    };
  });
}

// Locations get two shots each (entrance + interior). The prompt lives in
// art-locations.mjs; the url is written into the vault note's frontmatter as
// `image_entrance` / `image_interior`, so the note stays the one place that
// knows about its own art.
// Locations keep the item negatives except "no hands, no people" — a
// market or a checkpoint reads wrong with nobody in it, and the prompts
// themselves say when figures belong.
const SCENE_NEGATIVES = NEGATIVES.replace(' no hands, no people,', '');
const LOCATION_STYLE = `Photorealistic photograph, 1:1 square, 1080x1080, 35mm film still, natural light, shallow depth of field, fine grain. ${GRADE} ${CLIMATE} ${SCENE_NEGATIVES}`;
// The Chukai Desert is the GM's deliberate exception to the wet-climate rule
// — a sacred desert in canon — so those shots swap the monsoon clauses for
// their own rather than being forced to contradict the note.
const DESERT_CLIMATE = 'Storm-scoured equatorial desert: salt-crusted dunes, scorched soil, wind-polished concrete, bleached debris, heat haze. Dry, not tropical.';
// The Chukai Desert is the GM's deliberate exception to the wet-climate
// rule, and so is everything standing in it. This used to match on the
// note's PATH containing "Chukai", which quietly missed Round City —
// the Caliphate capital sits in a desert crater but its note is
// `Locations/Round City.md`, so it got the monsoon clause instead, the
// one that ends "no dust, no sand, no arid cracked earth". The art came
// back as a lush green city, correctly following a wrong prompt. Name
// the desert places explicitly rather than inferring them from a path.
const DESERT_LOCATIONS = [/chukai/i, /round city/i, /bandar bulat/i];
const isDesertShot = shot =>
  DESERT_LOCATIONS.some(re => re.test(shot.notePath || '') || re.test(shot.name || ''));
const locationStyleFor = shot => isDesertShot(shot)
  ? `Photorealistic photograph, 1:1 square, 1080x1080, 35mm film still, natural light, shallow depth of field, fine grain. ${GRADE} ${DESERT_CLIMATE} ${SCENE_NEGATIVES}`
  : LOCATION_STYLE;

// Reads or writes one key in a note's YAML frontmatter, creating the block
// when the note has none. Leaves the body untouched either way.
function frontmatterValue(text, key) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return line ? line[1].trim().replace(/^["']|["']$/g, '') : null;
}

function setFrontmatterValue(file, key, value) {
  const text = fs.readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  let next;
  if (!fm) {
    next = `---\n${key}: ${value}\n---\n${text}`;
  } else if (new RegExp(`^${key}:`, 'm').test(fm[1])) {
    next = text.replace(new RegExp(`^${key}:.*$`, 'm'), `${key}: ${value}`);
  } else {
    next = text.replace(fm[0], `---\n${fm[1]}\n${key}: ${value}\n---`);
  }
  if (!DRY) fs.writeFileSync(file, next);
}

function locationTargets() {
  return allLocationShots().map(shot => {
    const file = path.join(VAULT, shot.notePath);
    const key = `image_${shot.shot}`;
    const current = fs.existsSync(file) ? frontmatterValue(fs.readFileSync(file, 'utf8'), key) : null;
    return {
      id: shot.id,
      name: `${shot.name} — ${shot.shot}`,
      kind: 'location',
      hasArt: isLinked(current || ''),
      hasPrompt: !!shot.prompt,
      prompt: `${locationStyleFor(shot)} Subject: ${shot.prompt}`,
      description: shot.prompt,
      setUrl: url => setFrontmatterValue(file, key, url)
    };
  });
}

function allTargets() { return [...itemTargets(), ...slotTargets(), ...locationTargets()]; }

// ---------- commands ----------
function status() {
  const targets = allTargets();
  const report = (label, list) => {
    const linked = list.filter(t => t.hasArt).length;
    const noPrompt = list.filter(t => !t.hasArt && !t.hasPrompt).length;
    console.log(`${label.padEnd(18)}${String(linked).padStart(4)} done, ${String(list.length - linked).padStart(4)} to go${noPrompt ? `  (${noPrompt} still need a prompt)` : ''}`);
  };
  report('Items:', targets.filter(t => t.kind === 'item'));
  report('Content slots:', targets.filter(t => t.kind === 'slot'));
  report('Location shots:', targets.filter(t => t.kind === 'location'));
  const inInbox = fs.existsSync(INBOX) ? fs.readdirSync(INBOX).filter(f => !f.startsWith('.')).length : 0;
  const ledger = readLedger();
  const skipped = readSkipList().length;
  if (skipped) console.log(`Skipped (made elsewhere): ${skipped}`);
  console.log(`Waiting for review:        ${inInbox}  (${path.relative(VAULT, MEDIA)} in the vault)`);
  console.log(`Paid generations so far: ${ledger.generated} / ${LIFETIME_GENERATE_CAP} lifetime cap`);
}

function sheet() {
  const limit = option('limit') ? requireLimit() : Infinity;
  const pending = pendingTargets().slice(0, limit);
  const lines = [`# Art — prompt sheet`, ``,
    `Generate each image, save it into the vault's \`Media/New items/\` folder, named exactly as the **file name** below, then run \`npm run art -- ingest --limit N\`.`, ``];
  pending.forEach(t => lines.push(`## ${t.name}${t.kind === 'slot' ? ' *(content slot)*' : ''}`, `File name: \`${t.id}.png\``, '', '```', t.prompt, '```', ''));
  if (!DRY) fs.writeFileSync(path.join(ART, 'prompt-sheet.md'), lines.join('\n'));
  console.log(`${DRY ? '[dry run] would write' : 'Wrote'} art/prompt-sheet.md with ${pending.length} prompts.`);
}

// What still needs an image: no art yet, has a prompt, and isn't already
// sitting in the inbox waiting to be ingested. `--only items|slots` narrows it.
function pendingTargets() {
  const only = option('only');
  if (only && !['items', 'slots', 'locations'].includes(only)) fail(`--only takes "items", "slots" or "locations".`);
  const skipped = readSkipList();
  // --group narrows slots to one family (faction, karma, rep, special),
  // which is how a single set gets handed to another tool on its own.
  const group = option('group');
  return allTargets()
    .filter(t => !only || t.kind === only.replace(/s$/, ''))
    .filter(t => !group || t.id.startsWith(`${group}_`))
    .filter(t => !t.hasArt && t.hasPrompt && !inboxFileFor(t.id) && !skipped.includes(t.id));
}

// Art the GM made outside this pipeline. Skipped targets never appear in a
// sheet or a generate run; `skip --undo` puts them back.
function readSkipList() {
  try { return JSON.parse(fs.readFileSync(SKIPLIST, 'utf8')); } catch { return []; }
}

// Hands the pending queue to another image tool (ChatGPT, Midjourney, a
// person) in the shape they asked for: one row per asset with a stable id,
// the full prompt, the aspect ratio, any reference image, and what the
// image is for. Writes both a JSON file (for a tool to read) and a
// markdown table (for a human to skim). Whatever comes back is filed by
// saving it as <id>.png in the vault's Media/New items — the same path
// everything else uses.
function queue() {
  const limit = option('limit') ? requireLimit() : Infinity;
  const pending = pendingTargets().slice(0, limit);
  const useFor = t => t.kind === 'item' ? 'Item icon, shown in inventory and equipped slots'
    : t.kind === 'location' ? 'Location art, shown on the location note'
    : 'Card art, shown on the reputation/SPECIAL card';
  const rows = pending.map(t => ({
    asset_id: t.id,
    file_name: `${t.id}.png`,
    prompt: t.prompt,
    aspect_ratio: '1:1',
    size: '1080x1080',
    reference_image: referenceFor(t) || '',
    intended_use: useFor(t)
  }));
  if (!DRY) {
    fs.mkdirSync(ART, { recursive: true });
    fs.writeFileSync(path.join(ART, 'queue.json'), JSON.stringify(rows, null, 2));
    const md = ['# Art queue', '', `${rows.length} assets. Save each result as its **file name** into the vault's \`Media/New items/\` folder.`, '',
      '| Asset ID | File name | Aspect | Reference | Intended use |', '|---|---|---|---|---|',
      ...rows.map(r => `| \`${r.asset_id}\` | \`${r.file_name}\` | ${r.aspect_ratio} | ${r.reference_image || '—'} | ${r.intended_use} |`),
      '', '## Prompts', '',
      ...rows.flatMap(r => [`### ${r.asset_id}`, '', '```', r.prompt, '```', ''])].join('\n');
    fs.writeFileSync(path.join(ART, 'queue.md'), md);
  }
  console.log(`${DRY ? '[dry run] would write' : 'Wrote'} art/queue.json and art/queue.md with ${rows.length} assets.`);
}

// An already-approved image to hold a subject consistent: the faction card
// for a faction's people, the entrance shot for that location's interior.
// Only returns one that actually exists yet.
function referenceFor(target) {
  const done = allTargets().filter(t => t.hasArt);
  if (target.kind === 'location') {
    const entrance = done.find(t => t.id === target.id.replace(/_interior$/, '_entrance'));
    if (entrance && target.id.endsWith('_interior')) return entrance.id;
  }
  return '';
}

function skip() {
  const ids = args.slice(1).filter(a => !a.startsWith('--'));
  const undo = flag('undo');
  const known = new Set(allTargets().map(t => t.id));
  const groups = { slots: t => t.kind === 'slot', items: t => t.kind === 'item', locations: t => t.kind === 'location' };
  const expanded = ids.flatMap(id => {
    if (groups[id]) return allTargets().filter(groups[id]).map(t => t.id);
    if (id.endsWith('*')) return [...known].filter(k => k.startsWith(id.slice(0, -1)));
    return [id];
  });
  const unknown = expanded.filter(id => !known.has(id));
  if (!expanded.length || unknown.length) fail(unknown.length ? `unknown id(s): ${unknown.join(', ')}` : 'skip needs ids, a prefix like "rep_*", or "items"/"slots".');
  const next = undo ? readSkipList().filter(id => !expanded.includes(id))
    : [...new Set([...readSkipList(), ...expanded])];
  if (!DRY) { fs.mkdirSync(ART, { recursive: true }); fs.writeFileSync(SKIPLIST, JSON.stringify(next, null, 2)); }
  console.log(`${DRY ? '[dry run] ' : ''}${undo ? 'Un-skipped' : 'Skipping'} ${expanded.length}: ${expanded.slice(0, 6).join(', ')}${expanded.length > 6 ? '…' : ''}. Skip list now holds ${next.length}.`);
}

async function imgurAccessToken() {
  const { IMGUR_CLIENT_ID, IMGUR_CLIENT_SECRET, IMGUR_REFRESH_TOKEN } = process.env;
  if (!IMGUR_CLIENT_ID || !IMGUR_CLIENT_SECRET || !IMGUR_REFRESH_TOKEN) fail('Imgur keys missing from .env — see tools/ITEM_ART.md.');
  const res = await fetch('https://api.imgur.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: IMGUR_REFRESH_TOKEN, client_id: IMGUR_CLIENT_ID, client_secret: IMGUR_CLIENT_SECRET, grant_type: 'refresh_token' })
  });
  if (!res.ok) fail(`Imgur login failed (${res.status}). Check the keys in .env.`);
  return (await res.json()).access_token;
}

// Without Imgur keys, images can still go live: --local copies them into
// public/art/ and writes a relative url, so they ship with the app on the
// next deploy instead of depending on a third-party host.
// Generators hand back 1080-1250px PNGs of 2-3MB each. Those are fine as
// vault masters but not as something every player downloads, so the copy
// that ships is capped and, when it has no transparency to lose, written
// as a JPEG instead — typically 2.8MB down to ~200KB. `sips` is macOS
// stock; if it isn't there, or anything about it fails, the original is
// copied through unchanged rather than the ingest breaking.
// Sized to what the app actually draws. An item icon renders at 24-40px
// in the inventory and slot boxes, so 512 is already generous headroom on
// a retina screen; cards and location shots are banners and get more.
// This matters at volume: 279 items shipped at 1400px would be ~130MB of
// images in the deploy.
const LOCAL_MAX_DIM = { item: 512, slot: 1000, location: 1000 };
function shipCopy(src, destDir, id, kind = 'item') {
  const srcExt = path.extname(src).toLowerCase() === '.jpeg' ? '.jpg' : path.extname(src).toLowerCase();
  const plain = () => {
    const name = `${id}${srcExt}`;
    fs.copyFileSync(src, path.join(destDir, name));
    return name;
  };
  try {
    const alpha = execSync(`sips -g hasAlpha ${JSON.stringify(src)}`, { encoding: 'utf8' });
    const hasAlpha = /hasAlpha:\s*yes/.test(alpha);
    const ext = hasAlpha ? '.png' : '.jpg';
    const name = `${id}${ext}`;
    const out = path.join(destDir, name);
    const fmt = hasAlpha ? 'png' : 'jpeg';
    const maxDim = LOCAL_MAX_DIM[kind] || LOCAL_MAX_DIM.item;
    execSync(`sips -Z ${maxDim} ${JSON.stringify(src)} --out ${JSON.stringify(out)} --setProperty format ${fmt} --setProperty formatOptions 82`, { stdio: 'ignore' });
    if (!fs.existsSync(out) || fs.statSync(out).size === 0) return plain();
    return name;
  } catch {
    return plain();
  }
}

async function ingestLocal(batch) {
  const dir = path.join(ROOT, 'public', 'art');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(DONE, { recursive: true });
  const ledger = readLedger();
  for (const { file, item } of batch) {
    const name = shipCopy(file, dir, item.id, item.kind);
    item.setUrl(`art/${name}`);
    fs.renameSync(file, path.join(DONE, path.basename(file)));
    ledger.uploaded++;
    ledger.history.push({ at: new Date().toISOString(), action: 'local', id: item.id, url: `art/${name}` });
    writeLedger(ledger);
    console.log(`  ✓ ${item.name} → public/art/${name}`);
  }
  console.log('\nDone. These ship with the app — commit public/art and deploy. Item icons also need `node sync-obsidian.js --once`.');
}

async function ingest() {
  const limit = requireLimit();
  const targets = Object.fromEntries(allTargets().map(t => [t.id, t]));
  const files = (fs.existsSync(INBOX) ? fs.readdirSync(INBOX) : []).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  // Review is per-image: the GM approves some of a batch and sends the
  // rest back to the generator. `--ids a,b,c` links exactly those and
  // leaves everything else sitting in the inbox untouched.
  const onlyIds = (option('ids') || '').split(',').map(x => x.trim()).filter(Boolean);
  const queue = [];
  for (const f of files) {
    const id = path.basename(f, path.extname(f));
    if (onlyIds.length && !onlyIds.includes(id)) continue;
    if (!targets[id]) { console.warn(`  skip ${f}: nothing with id "${id}"`); continue; }
    if (targets[id].hasArt) { console.warn(`  skip ${f}: ${targets[id].name} is already linked`); continue; }
    queue.push({ file: path.join(INBOX, f), item: targets[id] });
  }
  if (onlyIds.length) {
    const missing = onlyIds.filter(id => !queue.some(q => q.item.id === id));
    if (missing.length) console.warn(`  not in the inbox: ${missing.join(', ')}`);
  }
  const batch = queue.slice(0, limit);
  console.log(`Inbox: ${queue.length} ready, uploading ${batch.length}.`);
  if (DRY) { batch.forEach(b => console.log(`  [dry run] ${path.basename(b.file)} → ${b.item.name}${flag('local') ? ' (local)' : ''}`)); return; }
  if (!batch.length) return;
  if (flag('local')) return ingestLocal(batch);

  const token = await imgurAccessToken();
  const ledger = readLedger();
  fs.mkdirSync(DONE, { recursive: true });
  for (const { file, item } of batch) {
    const body = new FormData();
    body.append('image', fs.readFileSync(file).toString('base64'));
    body.append('type', 'base64');
    body.append('title', item.name);
    body.append('description', item.description || '');
    if (process.env.IMGUR_ALBUM_ID) body.append('album', process.env.IMGUR_ALBUM_ID);
    const res = await fetch('https://api.imgur.com/3/image', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
    if (res.status === 429) { console.log(`\nImgur rate limit reached after ${ledger.uploaded} total uploads. Run ingest again later to continue.`); break; }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.data || !json.data.link) fail(`Upload of ${item.name} failed (${res.status}): ${JSON.stringify(json).slice(0, 200)}`);
    item.setUrl(json.data.link);
    fs.renameSync(file, path.join(DONE, path.basename(file)));
    ledger.uploaded++;
    ledger.history.push({ at: new Date().toISOString(), action: 'upload', id: item.id, url: json.data.link, deletehash: json.data.deletehash });
    writeLedger(ledger);
    console.log(`  ✓ ${item.name} → ${json.data.link}`);
  }
  console.log('\nDone. Item icons: run `node sync-obsidian.js --once` to pull them into the app. Content-slot urls are written straight into src/ — commit them.');
}

// Pulls the first base64 image out of either Gemini response shape
// (generateContent's candidates[].content.parts[].inlineData, or the
// newer interactions API) without betting on one.
function findImage(node) {
  if (!node || typeof node !== 'object') return null;
  const inline = node.inlineData || node.inline_data;
  if (inline && inline.data) return { data: inline.data, mime: inline.mimeType || inline.mime_type || 'image/png' };
  if (node.output_image && node.output_image.data) return { data: node.output_image.data, mime: node.output_image.mime_type || 'image/jpeg' };
  for (const v of Object.values(node)) { const hit = findImage(v); if (hit) return hit; }
  return null;
}

async function generate() {
  const limit = requireLimit();
  const key = process.env.GEMINI_API_KEY;
  if (!key && !DRY) fail('GEMINI_API_KEY missing from .env — see tools/ITEM_ART.md.');
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-lite-image';
  const ledger = readLedger();
  const room = LIFETIME_GENERATE_CAP - ledger.generated;
  if (room <= 0) fail(`Lifetime cap of ${LIFETIME_GENERATE_CAP} paid generations reached. Raise LIFETIME_GENERATE_CAP in the script if you mean to go further.`);
  const pending = pendingTargets();
  const batch = pending.slice(0, Math.min(limit, room));
  console.log(`${pending.length} images pending. Generating ${batch.length} with ${model}.`);
  if (DRY) { batch.forEach(t => console.log(`  [dry run] ${t.id}: ${t.prompt.slice(0, 110)}…`)); return; }

  fs.mkdirSync(INBOX, { recursive: true });
  for (const item of batch) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: item.prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } }
      })
    });
    if (res.status === 429) { console.log(`\nGemini rate limit reached. Run generate again later to continue.`); break; }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) fail(`Gemini refused ${item.name} (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
    const image = findImage(json);
    if (!image) fail(`No image came back for ${item.name} — stopping. Response: ${JSON.stringify(json).slice(0, 300)}`);
    const ext = image.mime.includes('jpeg') ? 'jpg' : 'png';
    fs.writeFileSync(path.join(INBOX, `${item.id}.${ext}`), Buffer.from(image.data, 'base64'));
    ledger.generated++;
    ledger.history.push({ at: new Date().toISOString(), action: 'generate', id: item.id, model });
    writeLedger(ledger);
    console.log(`  ✓ ${item.name}`);
  }
  console.log(`\nImages are in ${path.relative(VAULT, MEDIA)} in the vault. Look through them, delete any you don't like, then run ingest.`);
}

// Attach a url to any target by hand — for images uploaded outside this
// script. Same write-back path `ingest` uses, so it's also the quickest way
// to check a slot writes where it should.
// Files the newest image sitting in a download folder as Media/New items/<id>.png,
// so images made by hand in a browser join the same pipeline. Used by the
// art-runner agent after each generated image, and fine to run yourself.
function collect() {
  const id = args[1];
  if (!id) fail('collect needs a target id: npm run art -- collect rep_idolized');
  const target = allTargets().find(t => t.id === id);
  if (!target) fail(`nothing with id "${id}".`);
  const dir = option('from') || path.join(process.env.HOME || '', 'Downloads');
  const maxAgeMin = Number(option('max-age') || 10);
  const pick = fs.existsSync(dir) ? fs.readdirSync(dir)
    .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
    .map(f => ({ f, at: fs.statSync(path.join(dir, f)).mtimeMs }))
    .filter(x => (Date.now() - x.at) / 60000 <= maxAgeMin)
    .sort((a, b) => b.at - a.at)[0] : null;
  if (!pick) fail(`no image newer than ${maxAgeMin} min in ${dir} — download it first, or pass --from <dir>.`);
  // A browser download and this command can race: the newest file in
  // Downloads may still be the PREVIOUS image if the new one hasn't landed.
  // Refuse anything we've already filed rather than collecting a duplicate
  // under the wrong id (this bit the art-runner once).
  const digest = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
  const incoming = digest(path.join(dir, pick.f));
  for (const folder of [INBOX, DONE]) {
    if (!fs.existsSync(folder)) continue;
    const clash = fs.readdirSync(folder)
      .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
      .find(f => digest(path.join(folder, f)) === incoming);
    if (clash) fail(`${pick.f} is the same image as ${path.basename(folder)}/${clash} — the download for "${id}" probably hasn't finished. Wait for it and run collect again.`);
  }
  // Every asset in this pipeline is authored 1:1 and the app draws them
  // in square frames. Gemini in particular will quietly return 1408x768
  // for a prompt that says "1:1 square, 1080x1080" when the subject
  // sounds landscape — a road, a railway, a skyline. Catch it here rather
  // than hoping whoever is driving the browser spots it, because a wide
  // shot crops badly and only shows up much later, next to 26 square ones.
  const SQUARE_TOLERANCE = 0.02;
  let dims = null;
  // sips is macOS stock; if it isn't there, don't block the collect.
  try {
    const out = execSync(`sips -g pixelWidth -g pixelHeight ${JSON.stringify(path.join(dir, pick.f))}`, { encoding: 'utf8' });
    const w = Number((out.match(/pixelWidth:\s*(\d+)/) || [])[1]);
    const h = Number((out.match(/pixelHeight:\s*(\d+)/) || [])[1]);
    if (w && h) dims = { w, h };
  } catch { /* unreadable: skip the check rather than refuse the file */ }
  if (dims && Math.abs(dims.w - dims.h) / Math.max(dims.w, dims.h) > SQUARE_TOLERANCE) {
    fail(`${pick.f} is ${dims.w}x${dims.h}, not square. Every asset here is 1:1 — regenerate "${id}" at a square aspect ratio (set it in the generator's own aspect control if the prompt alone won't hold it).`);
  }

  const ext = path.extname(pick.f).toLowerCase() === '.jpeg' ? '.jpg' : path.extname(pick.f).toLowerCase();
  const dest = path.join(INBOX, `${id}${ext}`);
  if (DRY) { console.log(`[dry run] would move ${pick.f} → ${path.relative(ROOT, dest)}`); return; }
  fs.mkdirSync(INBOX, { recursive: true });
  fs.renameSync(path.join(dir, pick.f), dest);
  console.log(`Collected ${pick.f} → ${path.relative(ROOT, dest)} (${target.name})`);
}

function link() {
  const id = args[1], url = args[2];
  if (!id || !/^https?:\/\//.test(url || '')) fail('link needs an id and an http(s) url: npm run art -- link rep_idolized https://…');
  const target = allTargets().find(t => t.id === id);
  if (!target) fail(`nothing with id "${id}".`);
  target.setUrl(url);
  console.log(`${DRY ? '[dry run] would link' : 'Linked'} ${target.name} → ${url}`);
}

function setPrompts() {
  const file = args[1];
  if (!file || !fs.existsSync(file)) fail('set-prompts needs a JSON file of {item_id: prompt}.');
  const prompts = JSON.parse(fs.readFileSync(file, 'utf8'));
  const items = Object.fromEntries(loadItems().map(i => [i.id, i]));
  let written = 0, skipped = 0;
  for (const [id, prompt] of Object.entries(prompts)) {
    const item = items[id];
    if (!item) { console.warn(`  unknown id ${id}`); skipped++; continue; }
    if (item.image_prompt) { skipped++; continue; } // never overwrite a prompt that's already there
    setVaultField(item.file, 'image_prompt', prompt);
    written++;
  }
  console.log(`${DRY ? '[dry run] would write' : 'Wrote'} ${written} prompts; skipped ${skipped}.`);
}

const commands = { status, sheet, ingest, generate, link, collect, skip, queue, 'set-prompts': setPrompts };
if (!commands[command]) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 9).join('\n')); process.exit(command ? 1 : 0); }
fs.mkdirSync(INBOX, { recursive: true });
await commands[command]();
