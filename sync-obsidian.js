// sync-obsidian.js - V5 (Stable & Clean)
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
// ⚠️ REPLACE THIS WITH YOUR EXACT PATH
const OBSIDIAN_PATH = '/Users/edge/Library/CloudStorage/GoogleDrive-fallouteasternshores@gmail.com/My Drive/FOES Wiki/FALLOUT_MASTER_ZIPv3';

// --- SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ITEMS_TARGET = path.join(__dirname, 'src', 'items.js');
const TRAITS_TARGET = path.join(__dirname, 'src', 'traits.js');
const STATUS_EFFECTS_TARGET = path.join(__dirname, 'src', 'statusEffects.js');
const BESTIARY_TARGET = path.join(__dirname, 'src', 'bestiary.js');
const DATA_LOGS_TARGET = path.join(__dirname, 'src', 'dataLogs.js');
const MAPS_TARGET = path.join(__dirname, 'src', 'maps.js');
const QUESTS_TARGET = path.join(__dirname, 'src', 'quests.js');
const RECIPES_TARGET = path.join(__dirname, 'src', 'recipes.js');
const GLOSSARY_TARGET = path.join(__dirname, 'src', 'glossary.js');
const PEOPLE_TARGET = path.join(__dirname, 'src', 'people.js');
const INDEX_TARGET = path.join(__dirname, 'VAULT_INDEX.tsv');

// Folders whose plain-prose pages (no ```json block at all) become
// implicit glossary entries — filename is the term, first sentence of
// the body is the auto-extracted summary. This is an ALLOWLIST, not a
// denylist, on purpose: anything not listed here (Items, Bestiary,
// Character Details, Maps, Media, and critically 99_Backend Engine,
// which holds GM-only plot notes and session prep) never becomes a
// player-visible tooltip, even by accident.
const GLOSSARY_FOLDERS = ['01_World Details', '02_Factions', 'Locations', 'Religions', 'Fallout Details', 'Bandawang', 'People'];

let itemsMap = {};
let traitsMap = {};
let statusEffectsMap = {};
let bestiaryMap = {};
let dataLogsMap = {};
let mapsMap = {};
let questsMap = {};
let recipesMap = {};
let glossaryMap = {};
let peopleMap = {};

// --- HELPER FUNCTIONS ---

// Recursively find all markdown files
function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (path.extname(file) === '.md') {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  
  return arrayOfFiles;
}

// Generate the final JS file content
function generateFileContent(type, dataMap) {
  const dbNames = { item: 'itemDatabase', status_effect: 'statusEffectDatabase', monster: 'bestiaryDatabase', trait: 'traitDatabase', data_log: 'dataLogDatabase', map: 'mapDatabase', quest: 'questDatabase', recipe: 'recipeDatabase', glossary: 'glossaryDatabase', person: 'peopleDatabase' };
  const dbName = dbNames[type] || dbNames.trait;

  const helperFuncs = {
    item: `export function getItem(itemId) { if (!itemId) return null; const cleanId = itemId.toLowerCase().replace(/ /g, "_"); return itemDatabase[cleanId] || null; }`,
    trait: `export function getTrait(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return traitDatabase[cleanId] || { name: id, description: "Unknown Trait", modifiers: {} }; }`,
    status_effect: `export function getStatusEffect(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return statusEffectDatabase[cleanId] || null; }`,
    monster: `export function getMonster(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return bestiaryDatabase[cleanId] || null; }`,
    data_log: `export function getDataLog(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return dataLogDatabase[cleanId] || null; }`,
    map: `export function getMap(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return mapDatabase[cleanId] || null; }`,
    quest: `export function getQuest(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return questDatabase[cleanId] || null; }`,
    recipe: `export function getRecipe(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return recipeDatabase[cleanId] || null; }`,
    glossary: `export function getGlossaryTerm(id) { if (!id) return null; return glossaryDatabase[id] || null; }`,
    person: `export function getPerson(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return peopleDatabase[cleanId] || null; }`
  };
  const helperFunc = helperFuncs[type] || helperFuncs.trait;

  const jsonString = JSON.stringify(dataMap, null, 2);
  // Cosmetic only: unquote a top-level key when it's a valid bare JS
  // identifier (e.g. "homemade_pistol": -> homemade_pistol:). Keys that
  // aren't valid identifiers — starting with a digit ("1414_windbreaker"),
  // containing hyphens, etc. — must stay quoted or the generated file is
  // invalid JS (a real bug this fixes: it previously stripped quotes
  // unconditionally, breaking the build the moment an item's name started
  // with a number).
  const jsObjectString = jsonString.replace(/^  "([A-Za-z_$][A-Za-z0-9_$]*)":/gm, '  $1:');

  return `// AUTOMATICALLY GENERATED FILE. DO NOT EDIT MANUALLY.
export const ${dbName} = ${jsObjectString};

${helperFunc}
`;
}

// --- GLOSSARY EXTRACTION HELPERS ---

// Strips Obsidian/markdown syntax down to plain readable prose: YAML
// frontmatter, image embeds, wiki-links (keeps the display text —
// [[Batu Kapur|the city]] -> "the city", [[RobCo]] -> "RobCo"),
// standard markdown links, heading markers, emphasis markers, inline
// code, and collapses whitespace.
function stripMarkdown(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---\n?/, '')            // YAML frontmatter (only at the very top)
    .replace(/!\[\[[^\]]*\]\]/g, '')                   // image/file embeds
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')     // [[target|alias]] -> alias
    .replace(/\[\[([^\]]*)\]\]/g, '$1')                // [[target]] -> target
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')           // [text](url) -> text
    .replace(/^#{1,6}[^\n]*\n?/gm, '')                 // whole heading lines, not just the # marker — a
                                                        // heading's own text ("# 🏢 Protiga") isn't prose
    // Paired emphasis/code markers only — not a blanket strip of every
    // *_` character, which would also eat literal underscores inside a
    // filename-derived link target (e.g. a stray [[01_Federation of
    // Malaya]] turning into the mangled "01Federation of Malaya").
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// A line that's structural rather than prose: a bare divider, an
// Obsidian/Dataview inline field ("Status:: Major Faction", also
// covers "Label**:: value" once the bold markers around Label are
// stripped), or a short label-only line with no sentence-ending
// punctuation ("Preamble"). None of these read as a usable tooltip on
// their own — skip past them to find the first actual sentence.
function isStructuralLine(line) {
  if (/^[-=*]{3,}$/.test(line)) return true;
  if (/^\S[^:]*::/.test(line)) return true;
  if (line.length < 25 && !/[.!?]$/.test(line)) return true;
  return false;
}

// First real sentence of the (already-stripped) body — walks past
// blank/structural lines left over from stripped headers, embeds, and
// metadata fields, then takes up to the first sentence-ending
// punctuation. Hard-capped as a fallback for prose that runs long
// before hitting one (semicolon-delimited declarations, etc.).
function firstSentence(strippedText) {
  const lines = strippedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const line = lines.find(l => !isStructuralLine(l)) || lines[0];
  if (!line) return '';
  const sentenceMatch = line.match(/^.*?[.!?](?=\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[0] : line;
  return sentence.length > 280 ? sentence.slice(0, 277).trimEnd() + '…' : sentence;
}

// --- DUPLICATE ID GUARD ---
// id -> the file path that claimed it first this run.
let idOwners = {};
let duplicateIds = [];

function claimId(id, filePath) {
  if (idOwners[id]) {
    duplicateIds.push({ id, kept: idOwners[id], ignored: filePath });
    console.warn(`[DUPLICATE ID] "${id}" is already used by ${path.relative(OBSIDIAN_PATH, idOwners[id])} — IGNORING ${path.relative(OBSIDIAN_PATH, filePath)}`);
    return false;
  }
  idOwners[id] = filePath;
  return true;
}

function isInGlossaryFolder(filePath) {
  const relDir = path.relative(OBSIDIAN_PATH, path.dirname(filePath));
  const topFolder = relDir.split(path.sep)[0];
  return GLOSSARY_FOLDERS.includes(topFolder);
}

// Glossary terms are named after their file, which means they're formal
// ("Federation of Malaya", "The Free City of Bandawang") while prose is
// not ("the Federation", "Bandawang"). Without aliases the hover system
// silently matches almost nothing in a real data log — and worse, terms
// whose filename carries a disambiguator ("Chosen (Federation)") could
// never match anything a human would actually write.
//
// Two sources:
//   1. Obsidian's own `aliases:` frontmatter, which the vault already
//      uses in ~15 files, in both the inline-array and YAML-list forms.
//      Chosen deliberately by the GM, so matched case-INsensitively.
//   2. An auto-derived alias from stripping a parenthetical suffix, which
//      fixes the "(Federation)" family in one go — but produces ordinary
//      English words ("Chosen", "Ruled", "Sword"). Returned separately as
//      `strict`, and matched case-SENSITIVELY, so the capitalised faction
//      name links and "he had chosen" / "the land ruled by" do not.
//
// Deliberately NOT auto-stripping a leading "The": it would turn "The
// Path" into "Path" and put a tooltip on every use of an ordinary word.
// Those cases get an explicit alias in the vault file instead.
function extractAliases(rawContent, name) {
  const aliases = new Set();
  const strict = new Set();

  const fm = rawContent.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const block = fm[1];
    const inline = block.match(/^aliases:\s*\[(.*?)\]/m);
    if (inline) {
      inline[1].split(',').forEach(a => {
        const cleaned = a.trim().replace(/^["']|["']$/g, '').trim();
        if (cleaned) aliases.add(cleaned);
      });
    } else {
      // YAML list form: `aliases:` followed by indented `- item` lines.
      const list = block.match(/^aliases:\s*\n((?:\s*-\s*.*\n?)+)/m);
      if (list) {
        list[1].split('\n').forEach(line => {
          const m = line.match(/^\s*-\s*(.+?)\s*$/);
          if (m) {
            const cleaned = m[1].replace(/^["']|["']$/g, '').trim();
            if (cleaned) aliases.add(cleaned);
          }
        });
      }
    }
  }

  const withoutParenthetical = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (withoutParenthetical && withoutParenthetical !== name && !aliases.has(withoutParenthetical)) {
    strict.add(withoutParenthetical);
  }

  aliases.delete(name); // the name itself is matched separately
  strict.delete(name);
  return { aliases: [...aliases], strict: [...strict] };
}

// GM-only material inside a player-facing note. In Obsidian it's a
// callout — `> [!gm] Title` followed by `>`-prefixed lines (add a `-`,
// `> [!gm]-`, to fold it) — so the GM keeps secrets next to what they
// describe. The sync removes every such block before anything reaches
// the app, so a secret can never become a tooltip or player text.
function stripGmBlocks(text) {
  return text.replace(/^>\s*\[!gm\][^\n]*(?:\n>[^\n]*)*\n?/gim, '');
}

function processGlossaryCandidate(filePath, rawContent) {
  const name = path.basename(filePath, '.md')
    .replace(/^\d+[_ ]/, '')                                       // Obsidian sort-order prefixes ("01_", "02 ")
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\s]+/u, '') // leading emoji + variation selectors
    .trim();
  if (!name) return;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!id) return;
  const playerText = stripGmBlocks(rawContent);
  // The GM's notes mark secrets with "Secretly…"; one left outside a
  // [!gm] block is almost certainly a leak, so say so on every sync.
  const leak = playerText.match(/(^|[.!?]\s+|\n)\**secretly\b[^.\n]*/i);
  if (leak) console.warn(`[GM LEAK?] ${path.relative(OBSIDIAN_PATH, filePath)}: "${leak[0].trim().slice(0, 80)}" — move it into a > [!gm] block`);
  const stripped = stripMarkdown(playerText);
  const summary = firstSentence(stripped);
  if (!summary) return; // nothing but a title/embed — not useful as a tooltip
  const relDir = path.relative(OBSIDIAN_PATH, path.dirname(filePath));
  const { aliases, strict } = extractAliases(rawContent, name);
  glossaryMap[id] = {
    id,
    name,
    aliases,
    strict_aliases: strict,
    summary,
    category_path: relDir ? relDir.split(path.sep) : []
  };
  const aliasNote = [
    aliases.length ? `aliases: ${aliases.join(', ')}` : '',
    strict.length ? `strict: ${strict.join(', ')}` : ''
  ].filter(Boolean).join(' | ');
  console.log(`[GLOSSARY] Extracted: ${name}${aliasNote ? ` (${aliasNote})` : ''}`);

  // Job 5 (SCOPE_DECISIONS.md "People tab" ruling): People/ notes are
  // glossary candidates like every other allowlisted folder (short
  // `summary` tooltip above), but ALSO get their full player-facing body
  // emitted into src/people.js's peopleDatabase, keyed by this same
  // glossary id, so the Data Logs tab can show the whole note rather than
  // just its first sentence. `stripped` is the same GM-block-stripped,
  // lightly-markdown-converted text the summary was cut from (headings,
  // embeds, wiki-link/emphasis syntax removed, paragraph breaks kept) —
  // matches how a data log's own `body` reads in the app. `topFolder`
  // reads off relDir directly rather than isInGlossaryFolder() (which
  // this function is already inside the caller's check for) since it
  // also doubles as the People-only gate here.
  const topFolder = relDir ? relDir.split(path.sep)[0] : '';
  if (topFolder === 'People') {
    const subPath = relDir.split(path.sep).slice(1); // e.g. ["Rakan Watch"] for People/Rakan Watch/Boss Bob.md
    peopleMap[id] = {
      id,
      name,
      type: 'person',
      body: stripped,
      category_path: ['People', ...subPath]
    };
    console.log(`[PERSON] Extracted: ${name}`);
  }
}

// Process a single file to extract JSON
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Regex that is forgiving (works even if you forget the closing ticks)
    const jsonBlockRegex = /```json\s*([\s\S]*?)(```|$)/;
    const match = content.match(jsonBlockRegex);

    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1].trim());
        if (!data.id || !data.type) return;
        // Two files claiming the same id used to mean whichever one the
        // walk reached last silently won, and the other's content simply
        // never appeared in the app — no error, nothing to notice. That
        // has now bitten twice (duplicate "(1)" item drafts, then a
        // copied quest file). Refuse the second claim and say so loudly.
        if (!claimId(data.id, filePath)) return;

        if (['weapon', 'armor', 'consumable', 'currency', 'accessory', 'ammo', 'component', 'junk'].includes(data.type)) {
          itemsMap[data.id] = data;
          console.log(`[ITEM] Loaded: ${data.name}`);
        } else if (['trait', 'perk'].includes(data.type)) {
          traitsMap[data.id] = data;
          console.log(`[TRAIT] Loaded: ${data.name}`);
        } else if (data.type === 'status_effect') {
          statusEffectsMap[data.id] = data;
          console.log(`[STATUS EFFECT] Loaded: ${data.name}`);
        } else if (data.type === 'monster') {
          bestiaryMap[data.id] = data;
          console.log(`[BESTIARY] Loaded: ${data.name}`);
        } else if (data.type === 'data_log') {
          // category_path always comes from where the file actually lives
          // in the vault, not a manually-typed field — so there's nothing
          // to keep in sync by hand. Organize folders, that's the tree.
          const relDir = path.relative(OBSIDIAN_PATH, path.dirname(filePath));
          data.category_path = relDir ? relDir.split(path.sep) : [];
          dataLogsMap[data.id] = data;
          console.log(`[DATA LOG] Loaded: ${data.name} (${data.category_path.join(' > ') || 'root'})`);
        } else if (data.type === 'quest') {
          // Same folder-derived category_path convention as data logs.
          const relDir = path.relative(OBSIDIAN_PATH, path.dirname(filePath));
          data.category_path = relDir ? relDir.split(path.sep) : [];
          questsMap[data.id] = data;
          console.log(`[QUEST] Loaded: ${data.name} (${data.category_path.join(' > ') || 'root'})`);
        } else if (data.type === 'map') {
          mapsMap[data.id] = data;
          console.log(`[MAP] Loaded: ${data.name}`);
        } else if (data.type === 'recipe') {
          // produces.item is checked against itemsMap AFTER the full file
          // walk finishes (see runSync) rather than here — the item a
          // recipe produces might not have been visited yet depending on
          // directory-walk order, and checking too early would print a
          // false-positive warning for a perfectly valid recipe.
          recipesMap[data.id] = data;
          console.log(`[RECIPE] Loaded: ${data.name}`);
        }
      } catch (e) {
        // Ignore JSON parse errors (likely incomplete editing)
      }
      return;
    }

    // No ```json block at all — if this page lives in one of the
    // allowlisted lore folders, it becomes an auto-extracted glossary
    // entry instead. Files that DO have a json block (handled above)
    // never fall through to here, so a data_log/quest page never
    // double-counts as a glossary term too.
    if (isInGlossaryFolder(filePath)) {
      processGlossaryCandidate(filePath, content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
  }
}

// Main Sync Function
function runSync() {
  console.log('--- Scanning Obsidian Vault ---');
  itemsMap = {};
  traitsMap = {};
  statusEffectsMap = {};
  bestiaryMap = {};
  dataLogsMap = {};
  mapsMap = {};
  questsMap = {};
  recipesMap = {};
  glossaryMap = {};
  peopleMap = {};
  idOwners = {};
  duplicateIds = [];

  const allFiles = getAllFiles(OBSIDIAN_PATH);

  if (allFiles.length === 0) {
    console.error(`[ERROR] No files found in: ${OBSIDIAN_PATH}`);
  }

  allFiles.forEach(file => processFile(file));

  // A recipe naming an item that doesn't exist is exactly the kind of
  // silent content loss the duplicate-ID guard above was built to stop —
  // checked here, after the full walk, so a recipe is never flagged just
  // because its output item happened to be visited later in the walk.
  const badRecipes = Object.values(recipesMap).filter(r => {
    const outId = r.produces && r.produces.item;
    return outId && !itemsMap[outId.toLowerCase().replace(/ /g, '_')];
  });
  if (badRecipes.length > 0) {
    console.warn(`\n[!] ${badRecipes.length} RECIPE(S) PRODUCE AN UNKNOWN ITEM:`);
    badRecipes.forEach(r => console.warn(`    "${r.id}" produces "${r.produces.item}" — no item with that id exists.`));
    console.warn(`    Fix: correct the recipe's produces.item, or author the missing item.\n`);
  }

  // Write the output files
  fs.writeFileSync(ITEMS_TARGET, generateFileContent('item', itemsMap));
  fs.writeFileSync(TRAITS_TARGET, generateFileContent('trait', traitsMap));
  fs.writeFileSync(STATUS_EFFECTS_TARGET, generateFileContent('status_effect', statusEffectsMap));
  fs.writeFileSync(BESTIARY_TARGET, generateFileContent('monster', bestiaryMap));
  fs.writeFileSync(DATA_LOGS_TARGET, generateFileContent('data_log', dataLogsMap));
  fs.writeFileSync(MAPS_TARGET, generateFileContent('map', mapsMap));
  fs.writeFileSync(QUESTS_TARGET, generateFileContent('quest', questsMap));
  fs.writeFileSync(RECIPES_TARGET, generateFileContent('recipe', recipesMap));
  fs.writeFileSync(GLOSSARY_TARGET, generateFileContent('glossary', glossaryMap));
  fs.writeFileSync(PEOPLE_TARGET, generateFileContent('person', peopleMap));
  writeVaultIndex(allFiles);

  if (duplicateIds.length > 0) {
    console.warn(`\n[!] ${duplicateIds.length} DUPLICATE ID(S) — these files did NOT make it into the app:`);
    duplicateIds.forEach(d => console.warn(`    "${d.id}": kept ${path.relative(OBSIDIAN_PATH, d.kept)}, ignored ${path.relative(OBSIDIAN_PATH, d.ignored)}`));
    console.warn(`    Fix: give each file its own unique "id".\n`);
  }

  console.log(`[SYNC] Complete. Items: ${Object.keys(itemsMap).length} | Traits: ${Object.keys(traitsMap).length} | Status Effects: ${Object.keys(statusEffectsMap).length} | Bestiary: ${Object.keys(bestiaryMap).length} | Data Logs: ${Object.keys(dataLogsMap).length} | Maps: ${Object.keys(mapsMap).length} | Quests: ${Object.keys(questsMap).length} | Recipes: ${Object.keys(recipesMap).length} | Glossary: ${Object.keys(glossaryMap).length} | People: ${Object.keys(peopleMap).length}`);
}

// --- VAULT INDEX ---
// One line per vault file: path, the id/type it syncs as (if any), and its
// name. Content work compares new material against this instead of opening
// hundreds of vault files — it's the cheap way to answer "does this exist?".
function writeVaultIndex(allFiles) {
  const typedMaps = [itemsMap, traitsMap, statusEffectsMap, bestiaryMap, dataLogsMap, mapsMap, questsMap, recipesMap];
  const byPath = {};
  Object.entries(idOwners).forEach(([id, filePath]) => {
    const entry = typedMaps.map(m => m[id]).find(Boolean);
    byPath[filePath] = entry ? `${id}\t${entry.type || ''}\t${entry.name || ''}` : `${id}\t\t`;
  });
  const glossaryNames = new Set(Object.values(glossaryMap).map(g => g.name));
  const rows = allFiles
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const rel = path.relative(OBSIDIAN_PATH, f);
      if (byPath[f]) return `${rel}\t${byPath[f]}`;
      const base = path.basename(f, '.md');
      return `${rel}\t\t${glossaryNames.has(base) ? 'glossary' : 'prose'}\t${base}`;
    })
    .sort();
  fs.writeFileSync(INDEX_TARGET, `path\tid\ttype\tname\n${rows.join('\n')}\n`);
}

// --- WATCHER START ---
// `--once` syncs and exits — for scripts and helper agents, which can't
// run a watcher that never returns.
if (process.argv.includes('--once')) {
  runSync();
  process.exit(0);
}

const watcher = chokidar.watch(OBSIDIAN_PATH, {
  ignored: /(^|[\/\\])\../, // ignore hidden files
  persistent: true,
  ignoreInitial: true,
  depth: 99
});

console.log(`>>> Watcher Active on: ${OBSIDIAN_PATH}`);

// Initial run
runSync();

// Watch for changes
watcher.on('all', (event, path) => {
  if (event === 'change' || event === 'add') {
    console.log(`[UPDATE] ${path}`);
    runSync();
  }
});