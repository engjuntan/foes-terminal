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

let itemsMap = {};
let traitsMap = {};
let statusEffectsMap = {};
let bestiaryMap = {};
let dataLogsMap = {};
let mapsMap = {};

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
  const dbNames = { item: 'itemDatabase', status_effect: 'statusEffectDatabase', monster: 'bestiaryDatabase', trait: 'traitDatabase', data_log: 'dataLogDatabase', map: 'mapDatabase' };
  const dbName = dbNames[type] || dbNames.trait;

  const helperFuncs = {
    item: `export function getItem(itemId) { if (!itemId) return null; const cleanId = itemId.toLowerCase().replace(/ /g, "_"); return itemDatabase[cleanId] || null; }`,
    trait: `export function getTrait(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return traitDatabase[cleanId] || { name: id, description: "Unknown Trait", modifiers: {} }; }`,
    status_effect: `export function getStatusEffect(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return statusEffectDatabase[cleanId] || null; }`,
    monster: `export function getMonster(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return bestiaryDatabase[cleanId] || null; }`,
    data_log: `export function getDataLog(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return dataLogDatabase[cleanId] || null; }`,
    map: `export function getMap(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return mapDatabase[cleanId] || null; }`
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

        if (['weapon', 'armor', 'consumable', 'currency', 'accessory'].includes(data.type)) {
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
        } else if (data.type === 'map') {
          mapsMap[data.id] = data;
          console.log(`[MAP] Loaded: ${data.name}`);
        }
      } catch (e) {
        // Ignore JSON parse errors (likely incomplete editing)
      }
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

  const allFiles = getAllFiles(OBSIDIAN_PATH);

  if (allFiles.length === 0) {
    console.error(`[ERROR] No files found in: ${OBSIDIAN_PATH}`);
  }

  allFiles.forEach(file => processFile(file));

  // Write the output files
  fs.writeFileSync(ITEMS_TARGET, generateFileContent('item', itemsMap));
  fs.writeFileSync(TRAITS_TARGET, generateFileContent('trait', traitsMap));
  fs.writeFileSync(STATUS_EFFECTS_TARGET, generateFileContent('status_effect', statusEffectsMap));
  fs.writeFileSync(BESTIARY_TARGET, generateFileContent('monster', bestiaryMap));
  fs.writeFileSync(DATA_LOGS_TARGET, generateFileContent('data_log', dataLogsMap));
  fs.writeFileSync(MAPS_TARGET, generateFileContent('map', mapsMap));

  console.log(`[SYNC] Complete. Items: ${Object.keys(itemsMap).length} | Traits: ${Object.keys(traitsMap).length} | Status Effects: ${Object.keys(statusEffectsMap).length} | Bestiary: ${Object.keys(bestiaryMap).length} | Data Logs: ${Object.keys(dataLogsMap).length} | Maps: ${Object.keys(mapsMap).length}`);
}

// --- WATCHER START ---
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