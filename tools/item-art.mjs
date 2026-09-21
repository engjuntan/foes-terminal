// tools/item-art.mjs — item icon pipeline: prompt sheet → images → Imgur → vault.
//
//   npm run art -- status                 what's done, what's pending
//   npm run art -- sheet [--limit N]      write art/prompt-sheet.md for manual generation (free)
//   npm run art -- ingest [--limit N]     upload art/inbox/<item_id>.png|jpg to Imgur, link into the vault
//   npm run art -- generate --limit N     PAID: generate N images with the Gemini API into art/inbox/
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
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = process.env.FOES_VAULT || '/Users/edge/Library/CloudStorage/GoogleDrive-fallouteasternshores@gmail.com/My Drive/FOES Wiki/FALLOUT_MASTER_ZIPv3';
const ART = path.join(ROOT, 'art');
const INBOX = path.join(ART, 'inbox');
const DONE = path.join(ART, 'done');
const LEDGER = path.join(ART, 'ledger.json');

const MAX_PER_RUN = 25;          // no single run can exceed this, whatever --limit says
const LIFETIME_GENERATE_CAP = 400; // total paid generations ever; raise deliberately if needed

// The shared look. Prompts in the vault describe only the object, so the
// whole set can be restyled by editing this one line and regenerating.
const STYLE = 'Post-apocalyptic retropunk meets dieselpunk item illustration. Single object, centered, entire item visible, square composition, plain dark background, no text, no watermark, no hands.';
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

const hasArt = item => /^https?:\/\//.test(item.icon || '') && !/placehold\.co/.test(item.icon);
const fullPrompt = item => `${STYLE} Subject: ${(item.image_prompt || '').replace(LEGACY_TAIL, '').trim()}`;

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

// ---------- commands ----------
function status() {
  const items = loadItems();
  const linked = items.filter(hasArt).length;
  const noPrompt = items.filter(i => !hasArt(i) && !i.image_prompt).length;
  const inInbox = fs.existsSync(INBOX) ? fs.readdirSync(INBOX).filter(f => !f.startsWith('.')).length : 0;
  const ledger = readLedger();
  console.log(`Items:            ${items.length}`);
  console.log(`Linked (done):    ${linked}`);
  console.log(`Need an image:    ${items.length - linked}  (${noPrompt} of them have no prompt yet)`);
  console.log(`Waiting in inbox: ${inInbox}`);
  console.log(`Paid generations so far: ${ledger.generated} / ${LIFETIME_GENERATE_CAP} lifetime cap`);
}

function sheet() {
  const limit = option('limit') ? requireLimit() : Infinity;
  const pending = loadItems().filter(i => !hasArt(i) && i.image_prompt && !inboxFileFor(i.id)).slice(0, limit);
  const lines = [`# Item art — prompt sheet`, ``,
    `Generate each image, save it into \`art/inbox/\` named exactly as the **file name** below, then run \`npm run art -- ingest --limit N\`.`, ``];
  pending.forEach(i => lines.push(`## ${i.name}`, `File name: \`${i.id}.png\``, '', '```', fullPrompt(i), '```', ''));
  if (!DRY) fs.writeFileSync(path.join(ART, 'prompt-sheet.md'), lines.join('\n'));
  console.log(`${DRY ? '[dry run] would write' : 'Wrote'} art/prompt-sheet.md with ${pending.length} prompts.`);
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

async function ingest() {
  const limit = requireLimit();
  const items = Object.fromEntries(loadItems().map(i => [i.id, i]));
  const files = (fs.existsSync(INBOX) ? fs.readdirSync(INBOX) : []).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  const queue = [];
  for (const f of files) {
    const id = path.basename(f, path.extname(f));
    if (!items[id]) { console.warn(`  skip ${f}: no item with id "${id}"`); continue; }
    if (hasArt(items[id])) { console.warn(`  skip ${f}: ${items[id].name} is already linked`); continue; }
    queue.push({ file: path.join(INBOX, f), item: items[id] });
  }
  const batch = queue.slice(0, limit);
  console.log(`Inbox: ${queue.length} ready, uploading ${batch.length}.`);
  if (DRY) { batch.forEach(b => console.log(`  [dry run] ${path.basename(b.file)} → ${b.item.name}`)); return; }
  if (!batch.length) return;

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
    setVaultField(item.file, 'icon', json.data.link);
    fs.renameSync(file, path.join(DONE, path.basename(file)));
    ledger.uploaded++;
    ledger.history.push({ at: new Date().toISOString(), action: 'upload', id: item.id, url: json.data.link, deletehash: json.data.deletehash });
    writeLedger(ledger);
    console.log(`  ✓ ${item.name} → ${json.data.link}`);
  }
  console.log('\nDone. Run `node sync-obsidian.js --once` to pull the new icons into the app.');
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
  const pending = loadItems().filter(i => !hasArt(i) && i.image_prompt && !inboxFileFor(i.id));
  const batch = pending.slice(0, Math.min(limit, room));
  console.log(`${pending.length} items need art. Generating ${batch.length} with ${model}.`);
  if (DRY) { batch.forEach(i => console.log(`  [dry run] ${i.id}: ${fullPrompt(i).slice(0, 110)}…`)); return; }

  fs.mkdirSync(INBOX, { recursive: true });
  for (const item of batch) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt(item) }] }],
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
  console.log('\nImages are in art/inbox/. Look through them, delete any you don\'t like, then run ingest.');
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

const commands = { status, sheet, ingest, generate, 'set-prompts': setPrompts };
if (!commands[command]) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 9).join('\n')); process.exit(command ? 1 : 0); }
fs.mkdirSync(INBOX, { recursive: true });
await commands[command]();
