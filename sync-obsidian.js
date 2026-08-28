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

let itemsMap = {};
let traitsMap = {};
let statusEffectsMap = {};
let bestiaryMap = {};

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
  const dbNames = { item: 'itemDatabase', status_effect: 'statusEffectDatabase', monster: 'bestiaryDatabase', trait: 'traitDatabase' };
  const dbName = dbNames[type] || dbNames.trait;

  const helperFuncs = {
    item: `export function getItem(itemId) { if (!itemId) return null; const cleanId = itemId.toLowerCase().replace(/ /g, "_"); return itemDatabase[cleanId] || null; }`,
    trait: `export function getTrait(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return traitDatabase[cleanId] || { name: id, description: "Unknown Trait", modifiers: {} }; }`,
    status_effect: `export function getStatusEffect(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return statusEffectDatabase[cleanId] || null; }`,
    monster: `export function getMonster(id) { if (!id) return null; const cleanId = id.toLowerCase().replace(/ /g, "_"); return bestiaryDatabase[cleanId] || null; }`
  };
  const helperFunc = helperFuncs[type] || helperFuncs.trait;

  const jsonString = JSON.stringify(dataMap, null, 2);
  // regex to remove quotes from keys: "key": -> key:
  const jsObjectString = jsonString.replace(/^  "([^"]+)":/gm, '  $1:');

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

        if (['weapon', 'armor', 'consumable', 'currency'].includes(data.type)) {
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

  console.log(`[SYNC] Complete. Items: ${Object.keys(itemsMap).length} | Traits: ${Object.keys(traitsMap).length} | Status Effects: ${Object.keys(statusEffectsMap).length} | Bestiary: ${Object.keys(bestiaryMap).length}`);
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