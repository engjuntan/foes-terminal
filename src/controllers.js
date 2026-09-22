// src/controllers.js
import { doc, updateDoc, setDoc, getDoc, deleteField } from "firebase/firestore";
import { db } from './firebase.js'; // Imports the connection we made in File 1
import { statusEffectDatabase } from './statusEffects.js';
import { getItem } from './items.js';
import { RACE_RULES, calculateDerivedStats, deriveCharacter, CARRY_OVERAGE_ALLOWANCE } from './formulas.js';
import { getMonster } from './bestiary.js';
import { instantiateMonster, rollInitiative, rollPercentile, resolveHit, rollDamage, applyDamageReduction, parseArmorDtdr, BODY_PARTS, BURST_HIT_PENALTY, BURST_DAMAGE_ROLLS, buildAttackLogMessage, getCritChance, resolveCrit, rollCritTableEntry, STANCES, COVER_LEVELS, isMonsterAttackMelee } from './combat.js';
import { dataLogDatabase } from './dataLogs.js';
import { questDatabase } from './quests.js';
import { mapDatabase } from './maps.js';
import { normalizeInventory, getInventoryQuantity, addToInventory, removeFromInventory } from './inventory.js';
import { DIFFICULTY_TIERS, rollD10, rollD20, resolveSpecialCheck, resolveSkillCheck } from './checks.js';
import { normalizeNeeds, decayNeeds, rollRestHealing, formatGameTime } from './needs.js';
import { getRecipe } from './recipes.js';
import { STATIONS, canCraft, netWeightDelta } from './crafting.js';
import {
  REPUTATION_MIN, REPUTATION_MAX, KARMA_MIN, KARMA_MAX,
  getReputationTier, getReputationValue, getKarmaTier, getKarmaValue,
  normalizeReputationEntities
} from './reputationContent.js';
import {
  isDurable, isBroken, clampMarks, normalizeCondition, takeCopyAt, putCopy,
  conditionMultiplier, hitPenalty, fumbleLuckPenalty, scrapYieldFor,
  applyConditionToDtdr, repairFloor, repairSaveChance,
  totalRepairCost, startMarksForItem
} from './condition.js';

// Marks a `last_resolution.before` field whose value was genuinely
// undefined (the path had never been written before that resolution) —
// a raw JS `undefined` can't be stored in Firestore, but `before` itself
// gets persisted as ordinary document data (not a live update() call),
// so a real FieldValue.delete() sentinel can't live inside it either
// (Firestore only accepts those as top-level update() values). This
// plain, JSON-safe marker stands in for "absent" until the value is
// actually used — see gmRerollLastResolution().
const FIELD_ABSENT = '__foes_field_absent__';
// Firestore rejects `undefined` anywhere in a write, and reroll params come
// straight off UI drafts where an untouched field (no aimed shot, no custom
// check) is undefined. Store those as null; every reader treats both alike.
function withoutUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v]));
}

// --- GAME ACTIONS ---
// `copyIndex` (new, durability system) picks which owned copy of `itemId`
// gets equipped, by position ascending-sorted-by-marks — the inventory
// view renders one row per copy for a durable item, so each row's EQUIP
// button passes its own row index. Omitted/out-of-range falls back to
// the lowest-marks (best-condition) copy, §2.1's stated default.
export async function equipItem(itemId, targetSlot, copyIndex) {
  if (!window.currentUser || !window.liveData) return;

  // Race-based size gating (e.g. Gergasi/Robot can't use human-sized gear).
  const char = window.liveData.characters[window.currentUser];
  const item = getItem(itemId);
  const raceDef = RACE_RULES[char.race || 'human'] || RACE_RULES.human;

  if (item && item.size === 'small') {
    if (item.type === 'weapon' && raceDef.flags?.can_use_small_weapons === false) {
      alert(`${(char.name || 'THIS CHARACTER').toUpperCase()} CANNOT USE SMALL WEAPONS.`);
      return;
    }
    if (item.type === 'armor' && raceDef.flags?.can_wear_small_armor === false) {
      alert(`${(char.name || 'THIS CHARACTER').toUpperCase()} CANNOT WEAR SMALL ARMOR.`);
      return;
    }
  }

  const previousId = (char.equipment || {})[targetSlot];
  if (previousId === itemId) return; // already equipped here — nothing to do

  // Weapons/armor/accessories aren't consumed like ammo or Stimpaks, but
  // they do move: equipping takes one copy out of the pack and onto the
  // body, so you can't equip something you don't actually own.
  const owned = getInventoryQuantity(char.inventory, itemId);
  if (owned < 1) { alert(`YOU DON'T HAVE ${(item && item.name) || itemId.toUpperCase()} IN YOUR INVENTORY`); return; }

  let newInv = removeFromInventory(char.inventory, itemId, 1);
  // Whatever was already in that slot comes back to the pack — swapping
  // gear doesn't erase what you were wearing.
  if (previousId) newInv = addToInventory(newInv, previousId, 1);

  // --- Condition (durability system, BALANCE_PROPOSAL.md §2.1) ---
  const previousItem = getItem(previousId);
  const condition = normalizeCondition(char);
  const newCondInv = { ...condition.inv };
  const newCondWorn = { ...condition.worn };
  if (isDurable(item)) {
    const { marks, rest } = takeCopyAt(newCondInv[itemId], copyIndex);
    if (rest.length) newCondInv[itemId] = rest; else delete newCondInv[itemId];
    newCondWorn[targetSlot] = marks;
  } else {
    delete newCondWorn[targetSlot]; // non-durable gear in this slot carries no marks
  }
  if (previousId && isDurable(previousItem)) {
    const previousMarks = condition.worn[targetSlot] ?? 0;
    newCondInv[previousId] = putCopy(newCondInv[previousId], previousMarks);
  }

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const charPath = `characters.${window.currentUser}`;
  const updatePayload = {};
  updatePayload[`${charPath}.equipment.${targetSlot}`] = itemId;
  updatePayload[`${charPath}.inventory`] = newInv;
  updatePayload[`${charPath}.condition`] = { inv: newCondInv, worn: newCondWorn };
  // Ammo tracking lives per equipped slot, not per item instance (the app
  // doesn't track individual item copies anywhere). Equipping a weapon
  // with a clip_size always assumes a fresh, full magazine; a weapon with
  // no clip_size (melee, unarmed-type gear) just has no ammo entry at all.
  updatePayload[`${charPath}.ammo.${targetSlot}`] = (item && item.stats && item.stats.clip_size) || null;
  try { await updateDoc(charRef, updatePayload); }
  catch (err) { alert("ERROR: " + err.message); }
}

export async function unequipItem(targetSlot) {
  if (!window.currentUser || !window.liveData) return;
  const char = window.liveData.characters[window.currentUser];
  if (!char) return;
  const itemId = (char.equipment || {})[targetSlot];
  const item = getItem(itemId);
  const condition = normalizeCondition(char);
  const newCondWorn = { ...condition.worn };
  delete newCondWorn[targetSlot];
  const newCondInv = { ...condition.inv };
  if (itemId && isDurable(item)) {
    const marks = condition.worn[targetSlot] ?? 0;
    newCondInv[itemId] = putCopy(newCondInv[itemId], marks);
  }
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${window.currentUser}.equipment.${targetSlot}`] = null;
  updatePayload[`characters.${window.currentUser}.ammo.${targetSlot}`] = null;
  updatePayload[`characters.${window.currentUser}.condition`] = { inv: newCondInv, worn: newCondWorn };
  // Unequipping returns the item to the pack — it doesn't vanish.
  if (itemId) updatePayload[`characters.${window.currentUser}.inventory`] = addToInventory(char.inventory, itemId, 1);
  await updateDoc(charRef, updatePayload);
}

// GM tool: unequip any player's item at will (e.g. they lost/traded it,
// a disarm happened narratively, correcting a mistake).
export async function gmUnequipItem(targetCharId, targetSlot) {
  if (!targetCharId || !window.liveData) return;
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const itemId = (char.equipment || {})[targetSlot];
  const item = getItem(itemId);
  const condition = normalizeCondition(char);
  const newCondWorn = { ...condition.worn };
  delete newCondWorn[targetSlot];
  const newCondInv = { ...condition.inv };
  if (itemId && isDurable(item)) {
    const marks = condition.worn[targetSlot] ?? 0;
    newCondInv[itemId] = putCopy(newCondInv[itemId], marks);
  }
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.equipment.${targetSlot}`] = null;
  updatePayload[`characters.${targetCharId}.ammo.${targetSlot}`] = null;
  updatePayload[`characters.${targetCharId}.condition`] = { inv: newCondInv, worn: newCondWorn };
  if (itemId) updatePayload[`characters.${targetCharId}.inventory`] = addToInventory(char.inventory, itemId, 1);
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Small action — resets the equipped weapon's ammo in one slot back to
// full. Deliberately does NOT touch turn_acted/turn_index: the manual
// categorizes reloading as a "small action," distinct from the one main
// action per turn the app already enforces, so this can be done alongside
// (before or after) your actual attack, or on someone else's turn if the
// table allows it narratively. Callable by the weapon's owner or the GM.
export async function reloadWeapon(targetCharId, slot) {
  if (!targetCharId || !slot) return;
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const equippedId = (char.equipment || {})[slot];
  const item = equippedId && getItem(equippedId);
  // ammo_type/clip_size/burst_shots live under the weapon's `stats` block,
  // alongside dmg/range/dmgType — matches how the item content is authored.
  const weaponStats = (item && item.stats) || {};
  if (!item || !weaponStats.clip_size) { alert("NO AMMO-USING WEAPON EQUIPPED IN THAT SLOT"); return; }

  const currentAmmo = (char.ammo || {})[slot] ?? weaponStats.clip_size;
  const deficit = weaponStats.clip_size - currentAmmo;
  if (deficit <= 0) { alert("ALREADY FULLY LOADED"); return; }

  const updatePayload = {};

  // A weapon only draws down real inventory ammo if it's been authored
  // with an ammo_type (e.g. "9mm") — a weapon with clip_size but no
  // ammo_type just refills for free, same as before this feature. Tops
  // up exactly the deficit (not a full clip's worth) so topping off a
  // partially-spent magazine doesn't waste rounds you didn't need to burn.
  if (weaponStats.ammo_type) {
    const inv = normalizeInventory(char.inventory);
    const matchingAmmoIds = Object.keys(inv).filter(id => {
      const def = getItem(id);
      return def && def.type === 'ammo' && def.ammo_type === weaponStats.ammo_type;
    });
    const totalHeld = matchingAmmoIds.reduce((sum, id) => sum + inv[id], 0);
    if (totalHeld < deficit) {
      alert(`NO AMMO! (need ${deficit} more ${weaponStats.ammo_type}, have ${totalHeld})`);
      return;
    }
    // Drain the needed rounds across whichever matching ammo stack(s)
    // are on hand, in whatever order they're found — there's normally
    // just one canonical ammo item per ammo_type.
    let remaining = deficit;
    let newInv = inv;
    for (const id of matchingAmmoIds) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, newInv[id]);
      newInv = removeFromInventory(newInv, id, take);
      remaining -= take;
    }
    updatePayload[`characters.${targetCharId}.inventory`] = newInv;
  }

  updatePayload[`characters.${targetCharId}.ammo.${slot}`] = weaponStats.clip_size;

  const charRef = doc(db, "prisoncampaign", "alpha_team");

  // If this happens mid-combat, log it so the table can see it happened —
  // matches how every other combat action gets logged.
  const combat = window.liveData.active_combat;
  if (combat && combat.is_active) {
    updatePayload.active_combat = {
      ...combat,
      log: [...combat.log, { id: `log_${Date.now()}`, type: 'system', message: `${char.name} reloads ${item.name}.`, timestamp: Date.now() }]
    };
  }

  try {
    await updateDoc(charRef, updatePayload);
    alert("RELOADED!");
  } catch (err) { alert("ERROR: " + err.message); }
}

export async function createAccessCode() {
  const code = document.getElementById('newCode').value.toUpperCase().trim();
  const charId = document.getElementById('newCharName').value.toLowerCase().trim();
  const displayNameInput = document.getElementById('newDisplayName').value.trim();
  const displayName = displayNameInput || charId.toUpperCase(); // fallback to old behavior

  if (!code || !charId) { alert("ENTER CODE AND CHAR ID"); return; }
  
  const ref = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`access_codes.${code}`] = { role: "player", linked_char: charId };
  
  // Create Skeleton Sheet if missing
  if (!window.liveData.characters || !window.liveData.characters[charId]) {
    updatePayload[`characters.${charId}`] = {
      name: displayName,
      level: 1,
      race: "human", // Default
      is_finalized: false, // <--- KEY: Triggers Registration Screen
      avatar_url: "https://placehold.co/200x200/333/white?text=NEW",
      hp: { current: 15, max: 15 }, // Placeholder HP
      special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
      inventory: [],
      equipment: {},
      traits: [],
      perks: [],
      tags: {}
    };
  }
  await updateDoc(ref, updatePayload);
  alert(`ACCESS GRANTED: ${code} linked to ${charId.toUpperCase()}`);
}

export async function forceReset() {
  if (!confirm("OVERWRITE DATABASE? This will reset everyone.")) return;
  const seedData = {
    meta: { version: "2.0" },
    access_codes: {
      "KONG_ACCESS": { role: "player", linked_char: "kong" },
      "IRON_ACCESS": { role: "player", linked_char: "iron" },
      "GM_OVERRIDE": { role: "gm", linked_char: null }
    },
    characters: {
      kong: {
        name: "KONG",
        level: 1,
        avatar_url: "https://placehold.co/200x200/33ff33/black?text=KONG",
        hp: { current: 30, max: 30 },
        special: { str: 6, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
        tags: { unarmed: true, survival: true },
        skill_ranks: {},
        inventory: ["homemade_pistol", "stimpak", "leather_jacket"], 
        equipment: { head: null, body: null, right_hand: null, left_hand: null, back: null },
        traits: ["heavy_handed"],
        perks: ["strong_back"] 
      }
    }
  };
  await setDoc(doc(db, "prisoncampaign", "alpha_team"), seedData);
  alert("DATABASE RESET COMPLETE.");
  location.reload();
}

// --- GM GOD POWERS ---

// GM tool: save a character's biography + GM-only notes. Both fields are
// visible only to that character's own player (and the GM) — not the
// rest of the party — per how they're used narratively.
export async function gmSaveBiography(targetCharId) {
  if (!targetCharId) return;
  const biography = document.getElementById('bioTextarea').value;
  const gmNotes = document.getElementById('gmNotesTextarea').value;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.biography`] = biography;
  updatePayload[`characters.${targetCharId}.gm_notes`] = gmNotes;
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Player tool: save their own free-text notes (STATUS_AND_CRIPPLE_SPEC.md
// C, GM adjustment 2026-09-22). Deliberately separate from biography/
// gm_notes above — those are GM-owned and GM-only to edit; player_notes
// is the player's own scratchpad, writable only by themselves. The GM
// can read it (see the squad modal) but has no save control for it.
export async function savePlayerNotes() {
  if (!window.currentUser || !window.liveData) return;
  const el = document.getElementById('playerNotesTextarea');
  if (!el) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${window.currentUser}.player_notes`] = el.value;
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// --- DATA LOGS ---
export async function gmGrantDataLog(logId, target) {
  const characters = window.liveData.characters || {};
  const targets = target === 'all' ? Object.keys(characters).filter(id => characters[id].is_finalized) : [target];
  const updatePayload = {};
  targets.forEach(charId => {
    const current = characters[charId].unlocked_logs || [];
    if (!current.includes(logId)) updatePayload[`characters.${charId}.unlocked_logs`] = [...current, logId];
  });
  if (Object.keys(updatePayload).length === 0) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Toggles the expand/collapse locally (no write needed for that), and
// auto-marks read the first time — matches "auto-mark on open," decided earlier.
export async function openDataLog(logId) {
  window.openLogId = window.openLogId === logId ? null : logId;
  window.render();
  const char = window.liveData.characters[window.currentUser];
  const readLogs = char.read_logs || [];
  if (!readLogs.includes(logId)) {
    const charRef = doc(db, "prisoncampaign", "alpha_team");
    const updatePayload = {};
    updatePayload[`characters.${window.currentUser}.read_logs`] = [...readLogs, logId];
    try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
  }
}

// --- QUESTS --- (same grant/unlock/read shape as Data Logs, plus a
// GM-set status per character and a player-toggleable objective
// checklist, since a quest is something to track progress on rather
// than a one-shot piece of lore.)
export async function gmGrantQuest(questId, target) {
  const characters = window.liveData.characters || {};
  const targets = target === 'all' ? Object.keys(characters).filter(id => characters[id].is_finalized) : [target];
  const updatePayload = {};
  targets.forEach(charId => {
    const current = characters[charId].unlocked_quests || [];
    if (!current.includes(questId)) updatePayload[`characters.${charId}.unlocked_quests`] = [...current, questId];
    // Newly-granted quests default to Active — GM can flip it later.
    if (!(characters[charId].quest_status || {})[questId]) {
      updatePayload[`characters.${charId}.quest_status.${questId}`] = 'active';
    }
  });
  if (Object.keys(updatePayload).length === 0) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

export async function openQuest(questId) {
  window.openQuestId = window.openQuestId === questId ? null : questId;
  window.render();
  // Unlike Data Logs (where only the player-facing view ever calls
  // openDataLog), the GM view also opens a quest inline to review it
  // and set status — window.currentUser is 'GM' there, which has no
  // entry in liveData.characters, so there's no "read" state to track.
  const char = window.liveData.characters[window.currentUser];
  if (!char) return;
  const readQuests = char.read_quests || [];
  if (!readQuests.includes(questId)) {
    const charRef = doc(db, "prisoncampaign", "alpha_team");
    const updatePayload = {};
    updatePayload[`characters.${window.currentUser}.read_quests`] = [...readQuests, questId];
    try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
  }
}

// GM-only: Active / Completed / Failed. Targets one character or 'all'
// unlocked players, matching the grant flow's target picker.
export async function gmSetQuestStatus(questId, target, status) {
  const characters = window.liveData.characters || {};
  const targets = target === 'all'
    ? Object.keys(characters).filter(id => characters[id].is_finalized && (characters[id].unlocked_quests || []).includes(questId))
    : [target];
  const updatePayload = {};
  targets.forEach(charId => {
    updatePayload[`characters.${charId}.quest_status.${questId}`] = status;
  });
  if (Object.keys(updatePayload).length === 0) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Self-tracked, like a real checklist — either the player or the GM
// (on their behalf) can check/uncheck one objective. Stored as a set
// of completed indices rather than booleans-per-index so a quest with
// reordered objectives doesn't silently misalign old progress.
export async function toggleQuestObjective(targetCharId, questId, objectiveIndex) {
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const progress = (char.quest_progress || {})[questId] || [];
  const newProgress = progress.includes(objectiveIndex)
    ? progress.filter(i => i !== objectiveIndex)
    : [...progress, objectiveIndex];
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.quest_progress.${questId}`] = newProgress;
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// --- MAPS ---
export async function gmGrantMap(mapId, target) {
  const characters = window.liveData.characters || {};
  const targets = target === 'all' ? Object.keys(characters).filter(id => characters[id].is_finalized) : [target];
  const updatePayload = {};
  targets.forEach(charId => {
    const current = characters[charId].unlocked_maps || [];
    if (!current.includes(mapId)) updatePayload[`characters.${charId}.unlocked_maps`] = [...current, mapId];
  });
  if (Object.keys(updatePayload).length === 0) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// --- CRAFTING STATIONS ---
// Same grant pattern as gmGrantMap above, but writes a map key rather
// than pushing to an array — characters.<id>.stations is { [stationId]:
// locationLabel }, so the Workshop can show "where you found it" rather
// than just a checkmark. field_kit needs no grant; STATIONS.field_kit is
// always available (see crafting.js's hasStation()).
export async function gmGrantStation(stationId, target, locationLabel) {
  if (!STATIONS[stationId]) return;
  const characters = window.liveData.characters || {};
  const targets = target === 'all' ? Object.keys(characters).filter(id => characters[id].is_finalized) : [target];
  const updatePayload = {};
  targets.forEach(charId => {
    updatePayload[`characters.${charId}.stations.${stationId}`] = locationLabel || STATIONS[stationId].name;
  });
  if (Object.keys(updatePayload).length === 0) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// The party leaving a settlement is exactly when a granted bench should
// go away again — deleteField() rather than writing null, so hasStation()'s
// truthy check keeps working without needing to special-case an empty string.
export async function gmRevokeStation(stationId, target) {
  const characters = window.liveData.characters || {};
  const targets = target === 'all' ? Object.keys(characters).filter(id => characters[id].is_finalized) : [target];
  const updatePayload = {};
  targets.forEach(charId => {
    updatePayload[`characters.${charId}.stations.${stationId}`] = deleteField();
  });
  if (Object.keys(updatePayload).length === 0) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Pure local toggle — no read-tracking for maps, just image preview.
export function openMap(mapId) {
  window.openMapId = window.openMapId === mapId ? null : mapId;
  window.render();
}

// --- MESSAGES ---
export async function sendMessage() {
  const target = document.getElementById('messageTarget').value;
  const body = document.getElementById('messageBody').value.trim();
  if (!body) { alert("ENTER A MESSAGE"); return; }
  const current = window.liveData.messages || [];
  const message = { id: `msg_${Date.now()}`, from: 'GM', target, body, timestamp: Date.now() };
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { messages: [...current, message] });
    document.getElementById('messageBody').value = '';
  } catch (err) { alert("ERROR: " + err.message); }
}

export async function openMessage(messageId) {
  window.openMessageId = window.openMessageId === messageId ? null : messageId;
  window.render();
  const char = window.liveData.characters[window.currentUser];
  const readMessages = char.read_messages || [];
  if (!readMessages.includes(messageId)) {
    const charRef = doc(db, "prisoncampaign", "alpha_team");
    const updatePayload = {};
    updatePayload[`characters.${window.currentUser}.read_messages`] = [...readMessages, messageId];
    try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
  }
}

// 1. Give Item (Updated to allow duplicates)
// A durable (weapon/armor) grant reads an optional #gmItemMarks number
// input (0-10) so the GM can hand out pre-worn gear directly — e.g.
// "disrepair" loot — without it defaulting to the item's own start_marks
// (see condition.js's startMarksForItem). Left blank, it uses that
// default (pristine unless the item itself is authored pre-worn).
export async function gmGrantItem(targetCharId) {
  const select = document.getElementById('gmItemSelect');
  const itemId = select.value;
  if (!itemId) return;
  const item = getItem(itemId);

  const charRef = doc(db, "prisoncampaign", "alpha_team");

  try {
    // READ current data first
    const charSnap = await getDoc(charRef);
    if (!charSnap.exists()) return;

    const targetCharDoc = charSnap.data().characters[targetCharId];
    // Inventory is a stacked { itemId: quantity } map now — normalizes
    // and upgrades transparently even if this character still has the
    // old flat-array shape from before stacking existed.
    const currentInv = targetCharDoc.inventory;
    const newInv = addToInventory(currentInv, itemId, 1);

    // WRITE the entire updated map back
    const charPath = `characters.${targetCharId}`;
    const updatePayload = {};
    updatePayload[`${charPath}.inventory`] = newInv;

    if (isDurable(item)) {
      const condition = normalizeCondition(targetCharDoc);
      const marksInput = document.getElementById('gmItemMarks');
      const marksRaw = marksInput ? marksInput.value : '';
      const marks = (marksRaw !== '' && !isNaN(Number(marksRaw))) ? clampMarks(Number(marksRaw)) : startMarksForItem(item);
      updatePayload[`${charPath}.condition`] = {
        inv: { ...condition.inv, [itemId]: [...(condition.inv[itemId] || []), marks].sort((a, b) => a - b) },
        worn: condition.worn
      };
    }

    await updateDoc(charRef, updatePayload);
    alert(`GRANTED ${itemId.toUpperCase()} TO ${targetCharId.toUpperCase()}`);
  } catch (err) { alert(err.message); }
}

// 2. Adjust HP
export async function gmAdjustHP(targetCharId, amount) {
  // We need to read the current HP first to ensure we don't go over Max or under 0
  // Note: For speed, we can assume window.liveData is fresh enough
  const char = window.liveData.characters[targetCharId];
  if (!char) return;

  let newCurrent = (char.hp.current || 0) + amount;
  if (newCurrent > char.hp.max) newCurrent = char.hp.max;
  if (newCurrent < 0) newCurrent = 0;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.hp.current`] = newCurrent;

  await updateDoc(charRef, updatePayload);
}

// GM sets a PC's radiation directly, at will — not an automatic
// accrual system, purely GM discretion on how much exposure they judge
// a character to have taken. Clamped to the manual's 0-1000 scale
// (1000 = death).
export async function gmSetRadiation(targetCharId, amount) {
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const clamped = Math.max(0, Math.min(1000, Math.round(amount)));
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.rads`] = clamped;
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// --- REPUTATION & KARMA ---
// Party-wide standing with a faction/town, modelled on Fallout 2 — every
// player sees the same tier for a given entity. Stored flat at
// `reputation.<entityId>` (missing = 0 = Neutral, see
// reputationContent.js's getReputationValue). GM-only write, one
// updateDoc, same commit-on-release slider convention as gmSetNeed.
export async function gmSetReputation(entityId, value) {
  if (!window.liveData || !entityId) return;
  const clamped = Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, Math.round(Number(value) || 0)));
  const before = getReputationValue(window.liveData, entityId);
  const beforeTier = getReputationTier(before);
  const afterTier = getReputationTier(clamped);

  const entities = normalizeReputationEntities(window.liveData.reputation_entities);
  const entity = entities.find(e => e.id === entityId);
  if (!entity) return; // only tracked entities; a stray id would create an orphan value
  // Names already carry their own article where they need one ("The
  // Federation"), so don't add "the" in front.
  const entityName = /^the\s/i.test(entity.name) ? entity.name : `the ${entity.name}`;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`reputation.${entityId}`] = clamped;
  // Only post when the TIER actually changes, not every slider nudge —
  // players see named tiers, never raw numbers, so a message only makes
  // sense when what they'd see has actually moved.
  if (afterTier.id !== beforeTier.id) {
    const currentMessages = window.liveData.messages || [];
    updatePayload.messages = [...currentMessages, {
      id: `msg_${Date.now()}`, from: 'GM', target: 'all',
      body: `Your standing with ${entityName} is now: ${afterTier.name}.`,
      timestamp: Date.now()
    }];
  }
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Personal karma — one character's own track, private to them (message
// targets just that charId, not 'all'). Missing = 0 = "Nobody", see
// getKarmaValue.
export async function gmSetKarma(targetCharId, value) {
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const clamped = Math.max(KARMA_MIN, Math.min(KARMA_MAX, Math.round(Number(value) || 0)));
  const beforeTier = getKarmaTier(getKarmaValue(char));
  const afterTier = getKarmaTier(clamped);

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.karma`] = clamped;
  if (afterTier.id !== beforeTier.id) {
    const currentMessages = window.liveData.messages || [];
    updatePayload.messages = [...currentMessages, {
      id: `msg_${Date.now()}`, from: 'GM', target: targetCharId,
      body: `Your karma shifts. You are now regarded as: ${afterTier.name}.`,
      timestamp: Date.now()
    }];
  }
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// --- REPUTATION ENTITY ROSTER (GM add/rename/remove) ---
// `reputation_entities` only gets WRITTEN to Firestore the first time the
// GM actually edits the roster — until then every reader falls back to
// DEFAULT_REPUTATION_ENTITIES via normalizeReputationEntities, same lazy-
// write-on-first-touch convention as needs/condition defaults elsewhere
// in this file. Editing always starts from that normalized list so a
// GM's first add/rename/remove seeds the full default roster, not just
// the one entry they touched.
function slugifyReputationEntityName(name, existingIds) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'entity';
  let id = base;
  let n = 2;
  while (existingIds.includes(id)) { id = `${base}_${n}`; n++; }
  return id;
}

export async function gmAddReputationEntity() {
  const input = document.getElementById('gmNewReputationEntity');
  const name = input ? input.value.trim() : '';
  if (!name) { alert("ENTER A NAME"); return; }
  const entities = normalizeReputationEntities(window.liveData.reputation_entities);
  const id = slugifyReputationEntityName(name, entities.map(e => e.id));
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { reputation_entities: [...entities, { id, name }] });
    if (input) input.value = '';
  } catch (err) { alert("ERROR: " + err.message); }
}

export async function gmRenameReputationEntity(entityId) {
  const input = document.getElementById(`gmRenameReputationEntity_${entityId}`);
  const name = input ? input.value.trim() : '';
  if (!name) { alert("ENTER A NAME"); return; }
  const entities = normalizeReputationEntities(window.liveData.reputation_entities);
  const updated = entities.map(e => e.id === entityId ? { ...e, name } : e);
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, { reputation_entities: updated }); } catch (err) { alert("ERROR: " + err.message); }
}

export async function gmRemoveReputationEntity(entityId) {
  if (!confirm("REMOVE THIS ENTITY FROM REPUTATION TRACKING? Its stored standing is discarded too.")) return;
  const entities = normalizeReputationEntities(window.liveData.reputation_entities);
  const updated = entities.filter(e => e.id !== entityId);
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = { reputation_entities: updated };
  updatePayload[`reputation.${entityId}`] = deleteField();
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// --- TIME & SURVIVAL NEEDS ---

export async function gmSetNeed(targetCharId, needKey, value) {
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  if (!['hunger', 'thirst', 'sleep'].includes(needKey)) return;
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const needs = normalizeNeeds(char.needs);
  needs[needKey] = clamped;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.needs`] = needs;
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// The single core time-advance transaction — every clock movement in the
// app (GM travel buttons, GM's marked-as-rest presets, and a player's own
// Rest action) routes through this one function so there is only one place
// that can get the party-wide math wrong.
//
// opts.isRest gates two things ONLY: whether a rest of >=6h restores Sleep
// to 100, and whether natural healing gets the manual's 1.5x long-rest
// bonus. Base healing itself (1d10 capped at EN, manual p.446) fires on
// EVERY advance regardless of isRest — ordinary GM travel time heals a
// little too, it just never gets the bonus or the free sleep reset.
//
// Never call this from inside combat — combat rounds are seconds, and
// letting a round advance the clock would silently drain the whole party's
// needs over what's fictionally a few minutes. Blocked below for that
// reason, not just as a courtesy.
export async function advanceTime(minutes, opts = {}) {
  const { isRest = false, initiatedBy = 'GM', reason = '' } = opts;
  if (!window.liveData) return;
  // active_combat is never cleared after combat ends, only its is_active
  // flag flips false (see endCombat()) — checking the object's mere
  // presence would permanently block time advance after the campaign's
  // very first fight, so this must check is_active specifically, same
  // as every other "is combat happening right now" check in the app.
  if (window.liveData.active_combat && window.liveData.active_combat.is_active) { alert("CANNOT ADVANCE TIME DURING COMBAT"); return; }
  const mins = Number(minutes);
  if (!mins || mins <= 0) { alert("ENTER A VALID DURATION"); return; }

  const hoursElapsed = mins / 60;
  const isLongRest = isRest && hoursElapsed >= 6;
  const currentMinutes = (window.liveData.world && window.liveData.world.minutes) || 480;
  const updatePayload = { 'world.minutes': currentMinutes + mins };

  const characters = window.liveData.characters || {};
  const reportLines = [];

  Object.entries(characters).forEach(([charId, char]) => {
    if (!char.is_finalized) return;

    const before = normalizeNeeds(char.needs);
    const { needs: afterDecay, damage } = decayNeeds(char.needs, hoursElapsed);
    if (isLongRest) afterDecay.sleep = 100;

    // healingRateCap depends on EN, which the needs tiers themselves can
    // penalize (Famished/Starving hit END) — derive it from needs BEFORE
    // this tick's decay, since that's the state the character rested in.
    const derived = deriveCharacter(char);
    const healed = rollRestHealing(derived.healingRateCap, hoursElapsed, isLongRest);
    const totalDamage = damage.hunger + damage.thirst + damage.sleep;

    const currentHp = (char.hp && char.hp.current) || 0;
    const maxHp = (char.hp && char.hp.max) || currentHp;
    const newHp = Math.max(0, Math.min(maxHp, currentHp - totalDamage + healed));

    updatePayload[`characters.${charId}.needs`] = afterDecay;
    if (newHp !== currentHp) updatePayload[`characters.${charId}.hp.current`] = newHp;

    const parts = [
      `thirst ${Math.round(before.thirst)}→${Math.round(afterDecay.thirst)}`,
      `hunger ${Math.round(before.hunger)}→${Math.round(afterDecay.hunger)}`,
      `sleep ${Math.round(before.sleep)}→${Math.round(afterDecay.sleep)}`
    ];
    // Report the HP change that actually landed, not the raw healing
    // roll — a character already at full HP can roll a nonzero heal that
    // the max-HP clamp above throws away entirely, and "+54 HP" next to
    // an unchanged HP total would be actively misleading in the log.
    const netHp = newHp - currentHp;
    if (netHp !== 0) parts.push(`${netHp > 0 ? '+' : ''}${netHp} HP (${newHp}/${maxHp})`);
    reportLines.push(`  ${char.name}   ${parts.join('  ')}`);
  });

  const fromLabel = formatGameTime(currentMinutes).label;
  const toLabel = formatGameTime(currentMinutes + mins).label;
  const hoursLabel = Number.isInteger(hoursElapsed) ? `${hoursElapsed}h` : `${hoursElapsed.toFixed(1)}h`;
  const header = isRest ? `${initiatedBy} calls for a rest (${hoursLabel}).`
    : reason ? `${initiatedBy} ${reason} (${hoursLabel}).`
    : `${initiatedBy} advances time by ${hoursLabel}.`;
  const body = `${header}\n${fromLabel} → ${toLabel}${reportLines.length ? '\n' + reportLines.join('\n') : ''}`;

  const currentMessages = window.liveData.messages || [];
  updatePayload.messages = [...currentMessages, { id: `msg_${Date.now()}`, from: initiatedBy, target: 'all', body, timestamp: Date.now() }];

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Player-facing Rest — any player can trigger this, not just the GM.
// Instant, no accept step (same convention as useItem/giveItem): the
// broadcast message IS the notification, not a request waiting on anyone
// else's click. Hours are player-adjustable; hitting 6+ is what earns the
// manual's long-rest bonus (1.5x healing, Sleep restored to 100) — under
// 6h is just a breather that still costs the hour's hunger/thirst.
export async function requestRest(hours) {
  const charId = window.currentUser;
  if (!charId || !window.liveData) return;
  const char = window.liveData.characters[charId];
  if (!char) return;
  const h = Number(hours);
  if (isNaN(h) || h <= 0) { alert("ENTER A VALID NUMBER OF HOURS"); return; }
  const clampedHours = Math.max(0.5, Math.min(24, h));
  await advanceTime(clampedHours * 60, { isRest: true, initiatedBy: char.name || charId });
}

// DOM-read wrapper for the GM's free-form time panel — same pattern as
// sendMessage() reading its inputs directly rather than a draft object,
// since this is a one-shot action with no per-keystroke UI to preserve.
export async function gmAdvanceTimeAction() {
  const hoursInput = document.getElementById('gmTimeHours');
  const restCheckbox = document.getElementById('gmTimeIsRest');
  const hours = Number(hoursInput && hoursInput.value);
  if (isNaN(hours) || hours <= 0) { alert("ENTER A VALID NUMBER OF HOURS"); return; }
  await advanceTime(hours * 60, { isRest: !!(restCheckbox && restCheckbox.checked), initiatedBy: 'GM' });
}

// Consumes one copy of an item from inventory and applies whatever
// mechanical effect it's authored with: rad_removed/rad_added (RadAway
// and anything like it), stats.heal (Stimpak and every other direct-
// heal consumable — a dice string like "1d10+10", rolled via the same
// parser combat damage uses), stats.hunger/thirst/sleep (food, water,
// and rest-adjacent items — see needs.js; clamped 0-100, so a negative
// value like Ikan Masin Jerky's thirst cost just can't push a need below
// zero on its own), and skill books (stats.permanent + any skill_<name>
// key — see below). Everything else a consumable can carry right now
// (SPECIAL buffs/duration, addiction, cures_addiction/cures_status) has
// no tracked state to act on yet — no duration timers, no addiction
// counter — so those stay reference-only until that system exists.
// Callable by the character themselves or the GM on their behalf, same
// permission shape as everything else here.
// Reading a skill book takes in-game time (GM ruling, 2026-09-22). The
// clock is shared, so a read advances it for the whole party — hunger and
// thirst tick for everyone. A book can override this with `read_minutes`.
const SKILL_BOOK_READ_MINUTES = 60;

export async function useItem(targetCharId, itemId) {
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const owned = getInventoryQuantity(char.inventory, itemId);
  if (owned < 1) { alert(`${(char.name || 'THIS CHARACTER').toUpperCase()} DOESN'T HAVE THAT ITEM`); return; }
  const item = getItem(itemId);
  if (!item) return;
  const isSkillBook = !!(item.stats && item.stats.permanent);
  // advanceTime() refuses during combat, so a book read mid-fight would
  // grant the bonus without the time cost — refuse the read instead.
  if (isSkillBook && window.liveData.active_combat && window.liveData.active_combat.is_active) {
    alert("NO TIME TO READ DURING COMBAT"); return;
  }
  let readMinutes = 0;

  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.inventory`] = removeFromInventory(char.inventory, itemId, 1);

  const msgParts = [];

  const radRemoved = (item.stats && Number(item.stats.rad_removed)) || 0;
  const radAdded = (item.stats && Number(item.stats.rad_added)) || 0;
  if (radRemoved || radAdded) {
    const currentRads = char.rads || 0;
    const newRads = Math.max(0, Math.min(1000, currentRads - radRemoved + radAdded));
    updatePayload[`characters.${targetCharId}.rads`] = newRads;
    msgParts.push(`radiation ${newRads > currentRads ? 'increased' : 'decreased'} to ${newRads} rads`);
  }

  const healDice = item.stats && item.stats.heal;
  if (healDice) {
    const healed = rollDamage(healDice);
    const currentHp = (char.hp && char.hp.current) || 0;
    const maxHp = (char.hp && char.hp.max) || currentHp;
    const newHp = Math.max(0, Math.min(maxHp, currentHp + healed));
    updatePayload[`characters.${targetCharId}.hp.current`] = newHp;
    msgParts.push(`healed ${healed} HP (${newHp}/${maxHp})`);
  }

  // Skill books — a flat, PERMANENT skill_<name> bonus, tracked so the
  // same title can never grant it twice even across separate copies.
  // read_skill_books is keyed by item id specifically because there are
  // multiple distinct skill-book titles per skill (see the Skill Books
  // folder) — reading all of them for one skill is meant to stack.
  // The bonus itself lives in permanent_skill_bonuses and rides into
  // calculateDerivedStats() untouched by the book being consumed here.
  if (item.stats && item.stats.permanent) {
    // Stored PRE-prefixed (skill_small_guns, not small_guns) — that's
    // the exact key calculateDerivedStats()'s existing skill_<name>
    // merge loop already reads for traits/perks, so permanent_skill_
    // bonuses rides that loop with no transformation on either end.
    const modKey = Object.keys(item.stats).find(k => k.startsWith('skill_'));
    const skillKey = modKey && modKey.replace('skill_', '');
    const alreadyRead = (char.read_skill_books || []).includes(itemId);
    if (modKey && !alreadyRead) {
      const bonus = Number(item.stats[modKey]) || 0;
      const currentBonuses = { ...(char.permanent_skill_bonuses || {}) };
      currentBonuses[modKey] = (currentBonuses[modKey] || 0) + bonus;
      updatePayload[`characters.${targetCharId}.permanent_skill_bonuses`] = currentBonuses;
      updatePayload[`characters.${targetCharId}.read_skill_books`] = [...(char.read_skill_books || []), itemId];
      msgParts.push(`permanently gained +${bonus} ${skillKey.replace(/_/g, ' ')}`);
      readMinutes = Number(item.read_minutes) || SKILL_BOOK_READ_MINUTES;
    } else if (modKey && alreadyRead) {
      msgParts.push(`already learned everything this book can teach`);
    }
  }

  // Hunger/thirst/sleep — same clamp-and-report shape as radiation above.
  // Values may be negative (Ikan Masin Jerky's salt costs thirst even as
  // it feeds you) — clamping at 0 means a negative value can't push a
  // need below zero on its own, it just eats into whatever margin the
  // positive restore already bought this same use.
  const needs = normalizeNeeds(char.needs);
  const needDelta = item.stats && (item.stats.hunger || item.stats.thirst || item.stats.sleep) ? item.stats : null;
  if (needDelta) {
    ['hunger', 'thirst', 'sleep'].forEach(key => {
      const delta = Number(needDelta[key]) || 0;
      if (!delta) return;
      const before = needs[key];
      needs[key] = Math.max(0, Math.min(100, before + delta));
      msgParts.push(`${key} ${delta > 0 ? '+' : ''}${delta} (${needs[key]}/100)`);
    });
    updatePayload[`characters.${targetCharId}.needs`] = needs;
  }

  const usedMsg = msgParts.length ? `Used ${item.name} — ${msgParts.join(', ')}.` : `Used ${item.name}.`;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, updatePayload);
    alert(usedMsg);
  } catch (err) { alert("ERROR: " + err.message); return; }
  if (readMinutes) await advanceTime(readMinutes, { initiatedBy: char.name || targetCharId, reason: `reads ${item.name}` });
}

// --- CRAFTING ---

// Instant, no roll (the GM's own call — see CRAFTING_SPEC.md §0): meet the
// skill floor, have the inputs, be at the right station, and the item is
// made on the spot. Same one-updatePayload/one-updateDoc shape as useItem
// above. Callable by the character themselves only — unlike useItem/
// gmAdjustHP, there's no GM-on-behalf-of path, since crafting is read
// entirely off the crafter's own skills and stations.
export async function craftItem(recipeId) {
  const charId = window.currentUser;
  if (!charId || !window.liveData) return;
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  const char = window.liveData.characters[charId];
  if (!char) return;
  const outputItem = getItem(recipe.produces && recipe.produces.item);
  if (!outputItem) { alert("THIS RECIPE'S OUTPUT ITEM IS MISSING — TELL YOUR GM"); return; }

  const derived = deriveCharacter(char);
  const { ok, reasons } = canCraft(recipe, char, derived.skills);
  if (!ok) { alert(reasons.join('\n')); return; }

  // Crafting usually consumes more mass than it produces (scrap metal is
  // heavier than the gizmo it becomes), so this only fires on the rare
  // recipe that adds net weight — same CARRY_OVERAGE_ALLOWANCE rule
  // giveItem() uses, applied to the crafter's own projected total.
  const weightDelta = netWeightDelta(recipe);
  if (weightDelta > 0) {
    const projectedUsed = derived.carryUsed + weightDelta;
    if (projectedUsed > derived.carryCapacity * CARRY_OVERAGE_ALLOWANCE) {
      alert("CAN'T CARRY THAT MUCH — OVER CAPACITY");
      return;
    }
  }

  let inv = normalizeInventory(char.inventory);
  Object.entries(recipe.inputs || {}).forEach(([componentId, qty]) => {
    inv = removeFromInventory(inv, componentId, qty);
  });
  const outputQty = recipe.produces.qty || 1;
  inv = addToInventory(inv, recipe.produces.item, outputQty);

  const consumedText = Object.entries(recipe.inputs || {})
    .map(([id, qty]) => `${qty} ${(getItem(id) || {}).name || id}`).join(', ');

  const updatePayload = {};
  updatePayload[`characters.${charId}.inventory`] = inv;
  // Crafted gear is always pristine (§2.4: "Crafted | 0") — appends fresh
  // 0-mark copies for a durable output, same as any other inventory gain.
  if (isDurable(outputItem)) {
    const condition = normalizeCondition(char);
    const existing = condition.inv[recipe.produces.item] || [];
    const grown = [...existing, ...Array(outputQty).fill(0)].sort((a, b) => a - b);
    updatePayload[`characters.${charId}.condition`] = { inv: { ...condition.inv, [recipe.produces.item]: grown }, worn: condition.worn };
  }
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, updatePayload);
    alert(`Crafted ${outputItem.name}. Consumed: ${consumedText}.`);
  } catch (err) { alert("ERROR: " + err.message); }
}

// The inverse of crafting — break a junk item down into its components.
// Instant and irreversible, no confirm dialog: junk is low-value by
// definition (see CRAFTING_SPEC.md §4.1), so the blast radius of a
// misclick is small, same reasoning as unequip having no confirm step.
export async function scrapItem(itemId) {
  const charId = window.currentUser;
  if (!charId || !window.liveData) return;
  const char = window.liveData.characters[charId];
  if (!char) return;
  const item = getItem(itemId);
  if (!item || !item.scrap_yield) return;
  if (getInventoryQuantity(char.inventory, itemId) < 1) { alert("YOU DON'T HAVE THAT"); return; }

  let inv = removeFromInventory(char.inventory, itemId, 1);

  // Durable items (weapon/armor) scale their yield by condition — §2.6:
  // "Condition then applies the §2.2 multiplier." §2.1's stated default
  // for scrapping/selling is the HIGHEST-marks (worst-condition) copy —
  // you salvage your beaters, not your best gear. Junk (the only thing
  // the WORKSHOP's Salvage panel currently lists) carries no marks at
  // all, so it always scraps at full yield, same as before.
  let updatePayload = {};
  let actualYield = item.scrap_yield;
  if (isDurable(item)) {
    const condition = normalizeCondition(char);
    const sorted = [...(condition.inv[itemId] || [])].sort((a, b) => a - b);
    const marks = sorted.length ? sorted[sorted.length - 1] : 0;
    const rest = sorted.slice(0, -1);
    const newCondInv = { ...condition.inv };
    if (rest.length) newCondInv[itemId] = rest; else delete newCondInv[itemId];
    updatePayload[`characters.${charId}.condition`] = { inv: newCondInv, worn: condition.worn };
    actualYield = scrapYieldFor(item.scrap_yield, marks);
  }

  Object.entries(actualYield).forEach(([componentId, qty]) => {
    inv = addToInventory(inv, componentId, qty);
  });

  const yieldText = Object.entries(actualYield)
    .map(([id, qty]) => `${qty} ${(getItem(id) || {}).name || id}`).join(', ');

  updatePayload[`characters.${charId}.inventory`] = inv;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, updatePayload);
    alert(`Scrapped ${item.name} → ${yieldText}.`);
  } catch (err) { alert("ERROR: " + err.message); }
}

// --- REPAIR (§2.5) ---
// Instant, no roll — same shape as craftItem: read entirely off the
// repairer's own Repair skill and station access, self-service only (no
// GM-on-behalf-of path, matching how crafting works, since the number
// that matters — Repair skill, tool bonuses — belongs to whoever's
// actually fixing it). `copyRef` is `{ slot }` for a worn item or
// `{ index }` for a specific inventory copy (position ascending-sorted by
// marks — same convention as equip/give's copyIndex), so the WORKSHOP can
// offer a REPAIR button per row, same as INVENTORY does for equip/give.
//
// Repairs straight down to the Repair-skill floor in one action (the
// floor being how low a single job can reach, not a per-mark toggle),
// consuming totalRepairCost() components for every mark removed — unless
// one d100 roll (repairSaveChance, capped 30%) saves the whole job's
// components, per §2.5's arbitrage-guard design.
export async function repairItem(itemId, copyRef) {
  const charId = window.currentUser;
  if (!charId || !window.liveData) return;
  const char = window.liveData.characters[charId];
  if (!char) return;
  const item = getItem(itemId);
  if (!isDurable(item)) { alert("THAT CAN'T BE REPAIRED"); return; }

  const condition = normalizeCondition(char);
  const isWorn = !!(copyRef && copyRef.slot);
  const currentMarks = isWorn ? condition.worn[copyRef.slot] : (condition.inv[itemId] || [])[copyRef && copyRef.index];
  if (currentMarks === undefined) { alert("COPY NOT FOUND — IT MAY HAVE MOVED, TRY AGAIN"); return; }

  const derived = deriveCharacter(char);
  const repairSkill = derived.skills.repair || 0;
  const benchStationId = item.type === 'weapon' ? 'weapons_bench' : 'armour_bench';
  const atBench = !!(char.stations && char.stations[benchStationId]);
  const floor = repairFloor(repairSkill, atBench);

  if (currentMarks <= floor) {
    alert(`ALREADY AT THE BEST CONDITION YOUR REPAIR SKILL ALLOWS (${floor} MARK${floor === 1 ? '' : 'S'}${atBench ? ', AT A BENCH' : ''})`);
    return;
  }
  const marksToRepair = currentMarks - floor;
  const cost = totalRepairCost(item, marksToRepair);
  const missing = Object.entries(cost).filter(([id, qty]) => getInventoryQuantity(char.inventory, id) < qty);
  if (missing.length) {
    alert(`MISSING COMPONENTS: ${missing.map(([id, qty]) => `${qty} ${(getItem(id) || {}).name || id}`).join(', ')}`);
    return;
  }

  const saveChance = repairSaveChance(repairSkill);
  const saved = (Math.random() * 100) < saveChance;
  let inv = normalizeInventory(char.inventory);
  if (!saved) Object.entries(cost).forEach(([id, qty]) => { inv = removeFromInventory(inv, id, qty); });

  const newCondition = { inv: { ...condition.inv }, worn: { ...condition.worn } };
  if (isWorn) {
    newCondition.worn[copyRef.slot] = floor;
  } else {
    const arr = [...(newCondition.inv[itemId] || [])].sort((a, b) => a - b);
    arr[copyRef.index] = floor;
    newCondition.inv[itemId] = arr.sort((a, b) => a - b);
  }

  const updatePayload = {};
  updatePayload[`characters.${charId}.inventory`] = inv;
  updatePayload[`characters.${charId}.condition`] = newCondition;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, updatePayload);
    const costText = Object.entries(cost).map(([id, qty]) => `${qty} ${(getItem(id) || {}).name || id}`).join(', ') || 'nothing';
    alert(`Repaired ${item.name} to ${floor} mark${floor === 1 ? '' : 's'}. ${saved ? `Parts saved — ${costText} not consumed!` : `Consumed: ${costText}.`}`);
  } catch (err) { alert("ERROR: " + err.message); }
}

// GM tool: sets a specific copy's marks directly, no cost or roll — for
// handing out pre-worn "disrepair" loot onto a copy that's already in
// play, or correcting a mistake. `copyRef` is the same { slot } / { index }
// shape repairItem() takes.
export async function gmSetItemCondition(targetCharId, itemId, copyRef, marks) {
  if (!targetCharId || !window.liveData) return;
  const char = window.liveData.characters[targetCharId];
  if (!char) return;
  const item = getItem(itemId);
  if (!isDurable(item)) return;

  const condition = normalizeCondition(char);
  const clamped = clampMarks(marks);
  const newCondition = { inv: { ...condition.inv }, worn: { ...condition.worn } };
  if (copyRef && copyRef.slot) {
    newCondition.worn[copyRef.slot] = clamped;
  } else {
    const arr = [...(newCondition.inv[itemId] || [])].sort((a, b) => a - b);
    if (copyRef && typeof copyRef.index === 'number' && copyRef.index >= 0 && copyRef.index < arr.length) {
      arr[copyRef.index] = clamped;
      newCondition.inv[itemId] = arr.sort((a, b) => a - b);
    } else return;
  }

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.condition`] = newCondition;
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// Player-to-player item transfer. Direct/immediate — no accept step,
// matching every other one-click action in this app — but the
// recipient (and the GM) get a message out of it, since a silent
// transfer would be the one inventory action nobody else ever sees.
// Reuses the existing shared `messages` array/Messages tab rather than
// building separate notification plumbing: a message targeted at the
// recipient shows up in their own inbox, and the GM's Messages view
// already lists every message ever sent regardless of target.
//
// Capacity check: the GM's own rule — going over carryCapacity is
// allowed up to CARRY_OVERAGE_ALLOWANCE (10% over) with no penalty,
// but acquiring anything past that is refused outright. This applies
// to the recipient's projected total after the gift; it does NOT gate
// gmGrantItem — a GM grant is an out-of-fiction administrative action
// (same category as gmAdjustHP/gmSetRadiation), not something the
// game's own carry-weight rule constrains.
// `copyIndex` (new, durability system) is which owned copy of a durable
// itemId to give, by position ascending-sorted-by-marks — this is §2.1's
// "Give moves the copy the player picks": the inventory view renders one
// row per copy for a durable item, and each row's own GIVE button passes
// its own index, so the player is choosing by clicking that specific
// row rather than the app defaulting for them. Ignored for qty>1 or a
// non-durable (stacked) item, and falls back to the lowest-marks copy if
// omitted/out of range.
export async function giveItem(itemId, qty, toCharId, copyIndex) {
  const fromCharId = window.currentUser;
  if (!fromCharId || !toCharId || fromCharId === toCharId) return;
  const fromChar = window.liveData.characters[fromCharId];
  const toChar = window.liveData.characters[toCharId];
  if (!fromChar || !toChar) return;
  const item = getItem(itemId);
  if (!item) return;
  qty = Math.max(1, Number(qty) || 1);

  const owned = getInventoryQuantity(fromChar.inventory, itemId);
  if (owned < qty) { alert(`YOU DON'T HAVE ${qty}x ${item.name.toUpperCase()}`); return; }

  const itemWeight = typeof item.weight === 'number' ? item.weight : 0;
  if (itemWeight > 0) {
    const toDerived = deriveCharacter(toChar);
    const projectedUsed = toDerived.carryUsed + (itemWeight * qty);
    if (projectedUsed > toDerived.carryCapacity * CARRY_OVERAGE_ALLOWANCE) {
      alert(`${toChar.name.toUpperCase()} CAN'T CARRY THAT MUCH — OVER CAPACITY`);
      return;
    }
  }

  const newFromInv = removeFromInventory(fromChar.inventory, itemId, qty);
  const newToInv = addToInventory(toChar.inventory, itemId, qty);

  const messages = window.liveData.messages || [];
  const message = {
    id: `msg_${Date.now()}`,
    from: fromChar.name || fromCharId,
    target: toCharId,
    body: `${fromChar.name} gave you ${qty > 1 ? `${qty}x ` : ''}${item.name}.`,
    timestamp: Date.now()
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${fromCharId}.inventory`] = newFromInv;
  updatePayload[`characters.${toCharId}.inventory`] = newToInv;
  updatePayload.messages = [...messages, message];

  if (isDurable(item)) {
    const fromCondition = normalizeCondition(fromChar);
    // Same character giving to themselves is blocked above, so from/to
    // are always two different characters' condition trees — safe to
    // read toChar's fresh, unaffected by fromChar's own write this call.
    const toCondition = normalizeCondition(toChar);
    let movedMarks = [];
    let fromArr = [...(fromCondition.inv[itemId] || [])].sort((a, b) => a - b);
    if (qty === 1) {
      const { marks, rest } = takeCopyAt(fromArr, copyIndex);
      movedMarks = [marks];
      fromArr = rest;
    } else {
      // No per-copy picker for a multi-give — moves the lowest-marks
      // (best-condition) `qty` copies, cheapest reasonable default.
      movedMarks = fromArr.slice(0, qty);
      fromArr = fromArr.slice(qty);
    }
    const newFromCondInv = { ...fromCondition.inv };
    if (fromArr.length) newFromCondInv[itemId] = fromArr; else delete newFromCondInv[itemId];
    const newToCondInv = { ...toCondition.inv, [itemId]: [...(toCondition.inv[itemId] || []), ...movedMarks].sort((a, b) => a - b) };
    updatePayload[`characters.${fromCharId}.condition`] = { inv: newFromCondInv, worn: fromCondition.worn };
    updatePayload[`characters.${toCharId}.condition`] = { inv: newToCondInv, worn: toCondition.worn };
  }

  try {
    await updateDoc(charRef, updatePayload);
    alert(`GAVE ${qty > 1 ? `${qty}x ` : ''}${item.name.toUpperCase()} TO ${toChar.name.toUpperCase()}`);
  } catch (err) { alert("ERROR: " + err.message); }
}

// 3. Vault Points
export async function gmAdjustVaultPoints(targetCharId, amount) {
  const char = window.liveData.characters[targetCharId];
  if (!char) return;

  const currentVP = char.vault_points || 0;
  const newVP = currentVP + amount;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.vault_points`] = newVP;
  
  await updateDoc(charRef, updatePayload);
}

// 4. Grant Level Up
export async function gmGrantLevel(targetCharId) {
  if(!confirm(`LEVEL UP ${targetCharId.toUpperCase()}?`)) return;

  const char = window.liveData.characters[targetCharId];
  const currentLevel = char.level || 1;
  const currentSkillPoints = char.skill_points || 0;
  
  // Skill Points per level, per the manual (p.35): 5 + (INT * 3)
  const intStat = char.special.int || 5;
  const pointsToAdd = 5 + (intStat * 3);

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  
  updatePayload[`characters.${targetCharId}.level`] = currentLevel + 1;
  updatePayload[`characters.${targetCharId}.skill_points`] = currentSkillPoints + pointsToAdd;

  await updateDoc(charRef, updatePayload);
  alert(`LEVEL UP! Granted ${pointsToAdd} Skill Points.`);
}

// 5. Apply Status Effect (from the library, or a custom one typed on the spot)
// Shared by the GM-modal apply form and the in-combat apply form — reads
// whichever trio of select/custom-name/custom-modifiers elements is
// passed in, so the same logic works from either UI.
function buildStatusEffectInstance(selectElId, customNameElId, customModsElId) {
  const select = document.getElementById(selectElId);
  const chosenId = select.value;

  let name, modifiers, sourceId, ticking;

  if (chosenId === '__custom__') {
    name = document.getElementById(customNameElId).value.trim();
    const modsRaw = document.getElementById(customModsElId).value.trim();
    if (!name) { alert("ENTER A NAME FOR THE CUSTOM EFFECT"); return null; }

    modifiers = {};
    modsRaw.split(',').forEach(pair => {
      const [key, val] = pair.split(':').map(s => s && s.trim());
      if (key && val !== undefined && val !== '' && !isNaN(Number(val))) {
        modifiers[key] = Number(val);
      }
    });
    sourceId = null;
    ticking = true; // no UI to toggle this for a typed-on-the-spot effect
  } else {
    if (!chosenId) return null;
    const def = statusEffectDatabase[chosenId];
    if (!def) { alert("UNKNOWN STATUS EFFECT"); return null; }
    name = def.name;
    modifiers = def.modifiers || {};
    sourceId = chosenId;
    ticking = def.ticking !== false; // authored in Obsidian; defaults true
  }

  return {
    id: `${(sourceId || name).toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    source_id: sourceId,
    name,
    modifiers,
    ticking,
    applied_at: Date.now()
  };
}

async function writeStatusEffectToChar(targetCharId, instance) {
  const char = window.liveData.characters[targetCharId];
  const currentEffects = (char && char.status_effects) || [];
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.status_effects`] = [...currentEffects, instance];
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

export async function gmApplyStatusEffect(targetCharId) {
  const instance = buildStatusEffectInstance('statusEffectSelect', 'statusEffectCustomName', 'statusEffectCustomModifiers');
  if (!instance) return;
  await writeStatusEffectToChar(targetCharId, instance);
}

// In-combat variant: the target isn't implicit (no "selected character"
// like the GM modal has) — it's read from its own dropdown instead.
export async function gmApplyStatusEffectInCombat() {
  const targetSelect = document.getElementById('combatEffectTargetSelect');
  const targetCharId = targetSelect && targetSelect.value;
  if (!targetCharId) { alert("PICK A TARGET"); return; }
  const instance = buildStatusEffectInstance('combatEffectSelect', 'combatEffectCustomName', 'combatEffectCustomModifiers');
  if (!instance) return;
  await writeStatusEffectToChar(targetCharId, instance);
}

// 6. Remove Status Effect
export async function gmRemoveStatusEffect(targetCharId, instanceId) {
  const char = window.liveData.characters[targetCharId];
  const currentEffects = char.status_effects || [];
  const updated = currentEffects.filter(fx => fx.id !== instanceId);

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.status_effects`] = updated;

  try {
    await updateDoc(charRef, updatePayload);
  } catch (err) { alert("ERROR: " + err.message); }
}

// ... (Existing code above) ...

// --- LEVEL UP CONTROLLER (DRAFT MODE) ---

// Initialize or Reset the Draft
function getDraftState() {
  if (!window.levelUpDraft) {
    window.levelUpDraft = { spent: 0, allocation: {} };
  }
  return window.levelUpDraft;
}

// Handle (+) and (-) clicks
export function adjustSkillDraft(skillKey, amount, isTagged) {
  const char = window.liveData.characters[window.currentUser];
  const draft = getDraftState();
  const availablePoints = char.skill_points || 0;
  
  // Cost Calculation (Tagged skills give 2% per point, but cost 1 point)
  // Logic: 1 Point = 1 "Step". 
  // If Tagged, 1 Step = +2 value. If Normal, 1 Step = +1 value.
  
  // 1. Check if we can afford it
  if (amount > 0 && (availablePoints - draft.spent) <= 0) return; // No points left
  
  // 2. Check if we are trying to go below zero allocation
  const currentAlloc = draft.allocation[skillKey] || 0;
  if (amount < 0 && currentAlloc <= 0) return; // Can't refund what you haven't spent

  // 3. Update Draft
  draft.spent += amount;
  draft.allocation[skillKey] = currentAlloc + amount;
  
  // 4. Force Re-render to show changes
  window.render();
}

// Commit the Draft to Firebase
export async function confirmLevelUp() {
  const draft = getDraftState();
  if (draft.spent === 0) return; // Nothing to save

  if (!confirm("CONFIRM SKILL ALLOCATION? This cannot be undone.")) return;

  const char = window.liveData.characters[window.currentUser];
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const charPath = `characters.${window.currentUser}`;
  
  const updatePayload = {};

  // 1. Deduct Points
  const newPoints = (char.skill_points || 0) - draft.spent;
  updatePayload[`${charPath}.skill_points`] = newPoints;

  // 2. Update Skill Ranks permanently
  // We need to add the allocated "Steps" to the existing ranks
  const currentRanks = char.skill_ranks || {};
  
  Object.entries(draft.allocation).forEach(([skill, steps]) => {
    if (steps > 0) {
      // If tagged, each step is worth 2, otherwise 1
      const isTagged = char.tags && char.tags[skill];
      const valueToAdd = isTagged ? (steps * 2) : steps;
      
      const oldRank = currentRanks[skill] || 0;
      updatePayload[`${charPath}.skill_ranks.${skill}`] = oldRank + valueToAdd;
    }
  });

  try {
    await updateDoc(charRef, updatePayload);
    window.levelUpDraft = null; // Clear draft
    window.render(); // Refresh
  } catch (e) {
    alert("SAVE FAILED: " + e.message);
  }
}

export function cancelLevelUp() {
  if (confirm("Clear changes?")) {
    window.levelUpDraft = null;
    window.render();
  }
}

// --- CHARACTER CREATION CONTROLLERS ---

export function adjustCreationStat(stat, amount) {
  const draft = window.creationDraft; // Assumes draft is initialized in View
  if (!draft) return;

  // Calculate current total
  const total = Object.values(draft.special).reduce((a, b) => a + b, 0);
  const MAX_POOL = 40;

  // Rules: Prevent going over 40 total
  if (amount > 0 && total >= MAX_POOL) return;

  // Update Draft
  draft.special[stat] += amount;
  draft.lastTouched = stat; // drives the persistent SPECIAL_FLAVOR panel
  window.render(); // Re-render to update UI
}

// A stat already at its min/max still needs to be inspectable — clicking
// the label itself (rather than a now-disabled +/- button) focuses the
// flavor panel on it without changing anything.
export function setCreationFocus(stat) {
  const draft = window.creationDraft;
  if (!draft) return;
  draft.lastTouched = stat;
  window.render();
}

export function setCreationRace(raceKey) {
  if (!window.creationDraft) return;
  window.creationDraft.race = raceKey;
  
  // Reset stats to safe 5s to prevent "stuck" stats when limits change
  window.creationDraft.special = { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 };
  
  window.render();
}

export function toggleCreationTag(skillKey) {
  const draft = window.creationDraft;
  if (!draft) return;
  
  if (draft.tags.includes(skillKey)) {
    // Remove it
    draft.tags = draft.tags.filter(t => t !== skillKey);
  } else {
    // Add it (if less than 3)
    if (draft.tags.length < 3) {
      draft.tags.push(skillKey);
    }
  }
  window.render();
}

export async function finalizeCharacter() {
  if (!confirm("CONFIRM IDENTITY? Stats will be locked.")) return;
  
  const draft = window.creationDraft;
  const charId = window.currentUser;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  
  // Prepare Tag Dictionary for the DB (format: { small_guns: true })
  const tagMap = {};
  draft.tags.forEach(t => tagMap[t] = true);
  
  // Grant the character's first level's worth of skill points immediately,
  // rather than leaving them at 0 until their first level-up — without
  // this, a level-1 character's skills sit at the bare formula value with
  // nothing trained on top, which the math shows is unplayably weak even
  // against the single weakest bestiary creature.
  const derived = calculateDerivedStats(draft.special, 1, [], [], draft.race, []);

  const updatePayload = {};
  updatePayload[`characters.${charId}.special`] = draft.special;
  updatePayload[`characters.${charId}.tags`] = tagMap;
  updatePayload[`characters.${charId}.race`] = draft.race;
  updatePayload[`characters.${charId}.is_finalized`] = true; // LOCK IT
  updatePayload[`characters.${charId}.skill_points`] = derived.skillPointsPerLevel;

  try {
    await updateDoc(charRef, updatePayload);
    window.creationDraft = null; // Clear local draft
    // The main.js render loop will now see 'is_finalized: true' and show the dashboard
  } catch (e) {
    alert("CREATION FAILED: " + e.message);
  }
}

// --- COMBAT: START / SETUP ---
function getCombatDraft() {
  if (!window.combatDraft) window.combatDraft = { monsters: {} };
  return window.combatDraft;
}

export function adjustCombatDraftMonster(monsterId, amount) {
  const draft = getCombatDraft();
  const current = draft.monsters[monsterId] || 0;
  const next = Math.max(0, current + amount);
  if (next === 0) delete draft.monsters[monsterId];
  else draft.monsters[monsterId] = next;
  window.render();
}

export async function startCombat() {
  const draft = getCombatDraft();
  const entries = Object.entries(draft.monsters);
  if (entries.length === 0) { alert("ADD AT LEAST ONE ENEMY BEFORE STARTING COMBAT"); return; }

  const initiative_order = [];

  // Everyone with a finalized character joins automatically (small, fixed party).
  const characters = window.liveData.characters || {};
  Object.entries(characters).forEach(([charId, char]) => {
    if (!char.is_finalized) return;
    const derived = deriveCharacter(char);
    const { roll, total } = rollInitiative(derived.sequenceBonus);
    initiative_order.push({
      combatant_id: `pc_${charId}`,
      ref_type: 'pc',
      char_id: charId,
      name: char.name,
      initiative_roll: roll,
      initiative: total,
      is_down: false,
      cover: 'none' // GM-assigned per combatant — see COVER_LEVELS (combat.js)
    });
  });

  // Instantiate requested monsters, numbering duplicates.
  entries.forEach(([monsterId, count]) => {
    const template = getMonster(monsterId);
    if (!template) return;
    for (let i = 1; i <= count; i++) {
      const label = count > 1 ? `${template.name} #${i}` : template.name;
      const instance = instantiateMonster(monsterId, label);
      const { roll, total } = rollInitiative(instance.sequence);
      instance.initiative_roll = roll;
      instance.initiative = total;
      initiative_order.push(instance);
    }
  });

  initiative_order.sort((a, b) => b.initiative - a.initiative);

  const activeCombat = {
    is_active: true,
    round: 1,
    turn_index: 0,
    turn_acted: false,
    initiative_order,
    log: [{
      id: `log_${Date.now()}`,
      type: 'system',
      message: `Combat started — ${initiative_order.length} combatants. First up: ${initiative_order[0].name}.`,
      timestamp: Date.now()
    }]
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { active_combat: activeCombat });
    window.combatDraft = null;
    window.currentTab = 'COMBAT';
    window.render();
  } catch (err) { alert("ERROR: " + err.message); }
}

// GM-only, works on any combatant (PC or monster), any time — not gated
// to whose turn it is. Covers both "use an item on someone" (the item
// name just becomes part of the logged reason; there's no automated
// item-effect system yet, so this is honest about being a logging tool,
// not real item-effect automation) and a free HP adjustment with a
// reason, so the combat log reads like something happened, not just a number.
export async function gmAdjustCombatantHP(combatantId, delta, reason) {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  const target = combat.initiative_order.find(c => c.combatant_id === combatantId);
  if (!target) { alert("PICK A COMBATANT"); return; }
  if (!delta || isNaN(delta)) { alert("ENTER AN HP AMOUNT (+ OR -)"); return; }

  const newInitiativeOrder = combat.initiative_order.map(c => ({ ...c }));
  const idx = newInitiativeOrder.findIndex(c => c.combatant_id === combatantId);
  const charUpdates = {};
  let newCurrent, max;

  if (target.ref_type === 'monster') {
    max = target.hp.max;
    newCurrent = Math.max(0, Math.min(max, target.hp.current + delta));
    newInitiativeOrder[idx] = { ...target, hp: { ...target.hp, current: newCurrent }, is_down: newCurrent <= 0 };
  } else {
    const char = window.liveData.characters[target.char_id];
    max = char.hp.max;
    newCurrent = Math.max(0, Math.min(max, char.hp.current + delta));
    charUpdates[`characters.${target.char_id}.hp.current`] = newCurrent;
    newInitiativeOrder[idx] = { ...target, is_down: newCurrent <= 0 };
  }

  const sign = delta > 0 ? '+' : '';
  const message = reason
    ? `${target.name}: ${reason} (${sign}${delta} HP, now ${newCurrent}/${max})`
    : `${target.name}: ${sign}${delta} HP (now ${newCurrent}/${max})`;

  const updatedCombat = {
    ...combat,
    initiative_order: newInitiativeOrder,
    log: [...combat.log, { id: `log_${Date.now()}`, type: 'action', message, timestamp: Date.now() }]
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, { active_combat: updatedCombat, ...charUpdates }); } catch (err) { alert("ERROR: " + err.message); }
}

// --- COMBAT: TURN ACTIONS ---
function getCombatActionDraft() {
  if (!window.combatActionDraft) window.combatActionDraft = { targetId: null, attackKey: null, roll: '' };
  return window.combatActionDraft;
}

// Deliberately does NOT call window.render(). This backs live-typed/
// selected action-panel fields (target, attack, roll) — re-rendering on
// every keystroke replaces the whole screen's HTML, which kills focus on
// whatever you're mid-typing (found via testing: the roll field became
// unusable for anything past one digit). The browser already reflects
// input/select changes on its own without our help; only the buttons
// that actually consume the draft (Resolve Attack, Roll For Me, etc.)
// need to trigger a render.
export function setCombatActionField(field, value) {
  const draft = getCombatActionDraft();
  draft[field] = value;
  // Re-render for select fields (target/attack/bodyPart) so the live hit%
  // preview updates — safe here since onchange only fires after the browser
  // has already committed the selection. Skipped for 'roll' specifically:
  // that's a text input fired on every keystroke, and re-rendering there
  // kills focus mid-typing (see rollForMe/getCombatActionDraft comment).
  if (field !== 'roll') window.render();
}

export function rollForMe() {
  const draft = getCombatActionDraft();
  const finalValue = rollPercentile(); // the real roll — already decided, just not shown yet
  window.animateDiceRoll('combatRollInput', finalValue, 100, () => {
    draft.roll = finalValue;
    window.render();
  });
}

export async function resolveAttack() {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active || combat.turn_acted) return;
  const draft = getCombatActionDraft();
  const attacker = combat.initiative_order[combat.turn_index];
  const target = combat.initiative_order.find(c => c.combatant_id === draft.targetId);
  if (!target) { alert("PICK A TARGET"); return; }
  if (draft.roll === '' || draft.roll === null || draft.roll === undefined) { alert("ENTER OR ROLL A DICE VALUE"); return; }
  const roll = Number(draft.roll);
  if (isNaN(roll) || roll < 1 || roll > 100) { alert("ROLL MUST BE 1-100"); return; }

  const resolved = computeAttackResolution(combat, attacker, target, draft, roll);
  if (!resolved) return; // computeAttackResolution already alerted (e.g. no weapon/attack picked, out of ammo)
  const { updatedCombat, charUpdates, message } = resolved;

  // GM reroll (SCOPE_DECISIONS.md "Next systems" ruling, 2026-09-21):
  // resolution already applies HP damage, AP/ammo and status effects, so
  // snapshot the exact fields this write is about to touch — read fresh
  // off window.liveData right now, before anything's actually written,
  // so `before[path]` is the true pre-resolution value. Only the most
  // recent resolution is rerollable: a new action overwrites this field
  // wholesale, and a reroll itself deletes it (see gmRerollLastResolution).
  const before = { active_combat: combat };
  Object.keys(charUpdates).forEach(path => {
    const v = getLiveDataPath(path);
    before[path] = v === undefined ? FIELD_ABSENT : v;
  });
  const last_resolution = {
    kind: 'attack',
    actor: attacker.name,
    target: target.name,
    roll,
    params: withoutUndefined({
      attackerCombatantId: attacker.combatant_id, targetCombatantId: target.combatant_id,
      attackKey: draft.attackKey, bodyPart: draft.bodyPart, burst: !!draft.burst
    }),
    before,
    at: Date.now()
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { active_combat: updatedCombat, ...charUpdates, last_resolution });
    window.combatActionDraft = null;
  } catch (err) { alert("ERROR: " + err.message); }
}

// Reads window.liveData at a dot-path ("characters.abc.hp.current") —
// used to snapshot a field's value right before a resolution overwrites
// it, and again (against a temporarily-restored window.liveData) when
// rebuilding one for a reroll.
function getLiveDataPath(path) {
  const parts = path.split('.');
  let cur = window.liveData;
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// The reverse of getLiveDataPath: writes `value` at a dot-path inside
// `obj`, cloning each object along the way so the original (and its
// sibling keys) are left untouched — used to rebuild a restored
// window.liveData from a last_resolution.before snapshot without
// mutating the live one out from under the rest of the app.
function setDeepPath(obj, keys, value) {
  if (keys.length === 1) { obj[keys[0]] = value; return; }
  const [head, ...rest] = keys;
  obj[head] = { ...(obj[head] || {}) };
  setDeepPath(obj[head], rest, value);
}

// All the actual attack math — hit/crit resolution, damage, status
// effects, ammo, weapon destruction — with NO Firestore write of its
// own; it only reads window.liveData (for the attacker/target's derived
// stats and current values) and returns the {active_combat, charUpdates}
// payload resolveAttack() would write. Kept Firestore-free specifically
// so the GM's reroll can call this exact same logic again against a
// temporarily-restored window.liveData and get back a correctly
// recomputed result, instead of re-deriving (and inevitably drifting
// from) the real resolution logic. Returns null, having already
// alerted, if the draft doesn't describe a resolvable action.
function computeAttackResolution(combat, attacker, target, draft, roll) {
  // Aimed shots are attacker-agnostic — a called shot works the same
  // whether a PC targets a monster or a monster (GM-controlled) targets a
  // PC. Torso is just the default normal attack, unchanged either way.
  const bodyPartKey = draft.bodyPart || 'torso';
  const bodyPart = BODY_PARTS[bodyPartKey] || BODY_PARTS.torso;

  // --- Stance (free-form — the user governs the action economy at the
  // table, so no small-action cost is enforced here) ---
  const attackerStance = STANCES[
    attacker.ref_type === 'pc' ? ((window.liveData.characters[attacker.char_id] || {}).stance || 'standing') : (attacker.stance || 'standing')
  ] || STANCES.standing;

  // --- Attacker's skill/hit% + attack definition ---
  // Ammo/burst state (only meaningful for a PC firing an equipped gun with
  // a clip_size — melee, unarmed, and monster attacks never touch this).
  let attackDef, attackerValue;
  let burstPenalty = 0, isBurstShot = false;
  let ammoCharId = null, ammoSlot = null, ammoAfterShot = null;
  // Durability system (BALANCE_PROPOSAL.md §2.2/§2.3): the equipped
  // weapon's own condition marks, 0 for unarmed/monster attacks (neither
  // carries a trackable copy). Populated below once the equipped weapon
  // (if any) is known.
  let weaponMarks = 0, weaponSlot = null;
  // Job 1 (cover): cover only penalizes RANGED attacks, so every branch
  // below has to say which kind of attack this is. A monster attack has
  // no range/melee field of its own (see combat.js's
  // isMonsterAttackMelee comment for why that's a name-keyword guess).
  let isMeleeAttack = false;
  if (attacker.ref_type === 'monster') {
    const rawAttackDef = (attacker.attacks || []).find(a => a.name === draft.attackKey);
    if (!rawAttackDef) { alert("PICK AN ATTACK"); return; }
    // Job 3: a monster attack's own `dmgType` (new per-attack bestiary
    // field), defaulting to normal when absent — cloned rather than
    // mutated in place since `rawAttackDef` is the actual shared
    // bestiary object (bestiaryDatabase), not a per-instance copy.
    attackDef = { ...rawAttackDef, damageType: rawAttackDef.dmgType || 'normal' };
    attackerValue = attackDef.hit_percent;
    isMeleeAttack = isMonsterAttackMelee(attackDef);
  } else {
    const char = window.liveData.characters[attacker.char_id];
    const derived = deriveCharacter(char);
    const wantsMelee = !draft.attackKey || draft.attackKey === 'unarmed' || (() => {
      const wi = getItem(draft.attackKey);
      return !wi || !wi.stats || (wi.stats.range || 0) <= 1;
    })();
    if (attackerStance.blocksMelee && wantsMelee) { alert("CAN'T MAKE MELEE ATTACKS WHILE PRONE"); return; }
    if (!draft.attackKey || draft.attackKey === 'unarmed') {
      attackDef = { name: 'Unarmed', damage: derived.unarmedDamageFull, damageType: 'normal' };
      attackerValue = derived.skills.unarmed;
      isMeleeAttack = true;
    } else {
      const weaponItem = getItem(draft.attackKey);
      if (!weaponItem) { alert("PICK A WEAPON"); return; }
      const isMelee = !weaponItem.stats || (weaponItem.stats.range || 0) <= 1;
      isMeleeAttack = isMelee;
      const skillKey = weaponItem.skill || (isMelee ? 'melee_weapons' : 'small_guns');
      attackerValue = derived.skills[skillKey] ?? 0;
      const dmgDice = (weaponItem.stats && weaponItem.stats.dmg) || '1d4';
      attackDef = {
        name: weaponItem.name,
        damage: isMelee ? `${dmgDice}+${derived.meleeDamageBase}` : dmgDice,
        damageType: (weaponItem.stats && weaponItem.stats.dmgType) || 'normal'
      };

      // --- Weapon condition (durability system) — 10 marks (Broken) is
      // "cannot be used (blocked, turn not spent)" per SCOPE_DECISIONS.md's
      // GM ruling, checked before the ammo check/turn is spent. ---
      if (isDurable(weaponItem)) {
        const equipNow = char.equipment || {};
        weaponSlot = equipNow.right_hand === draft.attackKey ? 'right_hand' : equipNow.left_hand === draft.attackKey ? 'left_hand' : null;
        weaponMarks = weaponSlot ? (normalizeCondition(char).worn[weaponSlot] ?? 0) : 0;
        if (isBroken(weaponMarks)) { alert(`${weaponItem.name.toUpperCase()} IS BROKEN (10/10 MARKS) — REPAIR IT FIRST`); return; }
      }

      // --- Ammo check (only for weapons authored with a clip_size, under
      // stats — same block as dmg/range/dmgType) ---
      const weaponClipSize = weaponItem.stats && weaponItem.stats.clip_size;
      const weaponBurstShots = weaponItem.stats && weaponItem.stats.burst_shots;
      if (weaponClipSize) {
        const equip = char.equipment || {};
        ammoSlot = equip.right_hand === draft.attackKey ? 'right_hand' : equip.left_hand === draft.attackKey ? 'left_hand' : null;
        if (ammoSlot) {
          ammoCharId = attacker.char_id;
          const currentAmmo = (char.ammo || {})[ammoSlot] ?? weaponClipSize;
          isBurstShot = !!(draft.burst && weaponBurstShots);
          const shotCost = isBurstShot ? weaponBurstShots : 1;
          if (currentAmmo < shotCost) {
            alert(`OUT OF AMMO (${currentAmmo}/${weaponClipSize}) — RELOAD FIRST`);
            return;
          }
          ammoAfterShot = currentAmmo - shotCost;
          if (isBurstShot) burstPenalty = BURST_HIT_PENALTY;
        }
      }
    }
  }

  // --- Target's AC + damage mitigation ---
  let targetAC, targetDtdr, targetName;
  if (target.ref_type === 'monster') {
    targetAC = target.ac;
    // Job 2 (SCOPE_DECISIONS.md ruling: "NPC stances must cost AC the way
    // PC stances do"): today a crouching/prone NPC got the stance's hit
    // bonus for free, with no matching AC loss, because the AGI-cap math
    // only ran for a PC target below. Same formula, gated on the monster
    // actually carrying a SPECIAL block (`special.agi` — most bestiary
    // entries have it per this brief; when it's absent this is skipped
    // entirely and the monster's authored `ac` is left exactly as-is).
    const targetAgi = target.special && target.special.agi;
    if (typeof targetAgi === 'number') {
      const stanceDef = STANCES[target.stance || 'standing'] || STANCES.standing;
      if (stanceDef.agiCap !== null && stanceDef.agiCap !== undefined) {
        targetAC = targetAC - targetAgi + Math.min(targetAgi, stanceDef.agiCap);
      }
    }
    targetDtdr = target.dtdr || {};
    targetName = target.name;
  } else {
    const targetChar = window.liveData.characters[target.char_id];
    const targetDerived = deriveCharacter(targetChar);
    targetAC = targetDerived.armorClass;
    // Crouching/prone/knocked-down caps how much of AC comes from AGI —
    // only meaningful for a PC, since AC's AGI component is what's being
    // capped and a monster's flat `ac` isn't decomposed that way.
    const targetStanceDef = STANCES[targetChar.stance || 'standing'] || STANCES.standing;
    if (targetStanceDef.agiCap !== null && targetStanceDef.agiCap !== undefined) {
      targetAC = targetAC - targetDerived.special.agi + Math.min(targetDerived.special.agi, targetStanceDef.agiCap);
    }
    const armorItem = getItem((targetChar.equipment || {}).body);
    // Armor's own condition marks scale every DT/DR figure by the same
    // curve as weapon damage (§2.2: "the same multiplier on every DT and
    // DR"). AC's own reduction already happened above via deriveCharacter
    // (which reads armorMarks internally — see formulas.js).
    const targetArmorMarks = normalizeCondition(targetChar).worn.body || 0;
    targetDtdr = armorItem ? applyConditionToDtdr(parseArmorDtdr(armorItem), targetArmorMarks) : {};
    targetName = targetChar.name;
  }

  // --- Crit chance/luck (manual p.~1286, amended with the user) ---
  // Same roll already made for the hit check — not a separate roll.
  const attackerIsPc = attacker.ref_type === 'pc';
  let luckStat = 0;
  if (attackerIsPc) {
    const attackerChar = window.liveData.characters[attacker.char_id];
    luckStat = (attackerChar.special && attackerChar.special.luk) || 0;
  }
  const critChance = getCritChance(attackerIsPc ? luckStat : (attacker.crit_chance || 0));

  // Blinded (from a crit or an aimed eye shot) hits the attacker's own
  // accuracy directly — a flat hit-chance penalty, separate from the
  // PER-based skill penalty it also carries. Checked against whichever
  // status_effects array is actually the attacker's own.
  const attackerEffects = attackerIsPc
    ? ((window.liveData.characters[attacker.char_id].status_effects) || [])
    : (attacker.status_effects || []);
  const hitChancePenalty = attackerEffects
    .filter(fx => fx.modifiers && fx.modifiers.hit_chance_pct)
    .reduce((sum, fx) => sum + fx.modifiers.hit_chance_pct, 0);

  // Job 1 (cover): GM-assigned on the TARGET combatant, ranged attacks
  // only — melee is unaffected regardless of what cover is set to. Read
  // straight off the `target` combatant object (initiative_order entry),
  // same place setCover() writes it, for PC and monster targets alike.
  const coverPenalty = !isMeleeAttack ? (COVER_LEVELS[target.cover || 'none'] || COVER_LEVELS.none).penalty : 0;

  // Weapon condition's own hit penalty (§2.2: flat -1/mark, capped at -9,
  // separate from the value multiplier applied to damage below) and its
  // fumble-save penalty (floor(marks/2) off the 91-99 save's LK target).
  const { effectiveChance, isHit: normalHit } = resolveHit(attackerValue - bodyPart.penalty - burstPenalty + hitChancePenalty + attackerStance.hitBonus + hitPenalty(weaponMarks) - coverPenalty, targetAC, roll);
  const critResult = resolveCrit(roll, critChance, luckStat, attackerIsPc, fumbleLuckPenalty(weaponMarks)); // 'success' | 'fail' | null
  // A crit success always hits, even overriding a miss; a crit failure
  // always fumbles, even overriding what would've been a hit — a fumble
  // is worse than a plain miss, not just a miss with extra steps.
  const isHit = critResult === 'fail' ? false : (critResult === 'success' ? true : normalHit);

  let finalDamage = 0;
  let effectAppliedMsg = '';
  let critTag = '';
  const newInitiativeOrder = combat.initiative_order.map(c => ({ ...c }));
  const charUpdates = {};

  // Ammo is spent on firing, hit or miss — the rounds left the barrel
  // either way. Applied regardless of isHit, once we know we're actually
  // going through with the shot (past the earlier ammo-check return).
  if (ammoCharId && ammoSlot) {
    charUpdates[`characters.${ammoCharId}.ammo.${ammoSlot}`] = ammoAfterShot;
  }

  // Applies a named status effect to whoever — PC (via charUpdates,
  // merging with anything already queued this same resolution) or
  // monster (mutated directly on their inline initiative_order entry,
  // same shape as a PC's status_effects now). durationTurns is optional;
  // omit for an effect that persists until cured, same as aimed shots.
  const grantEffect = (combatantRef, effectId, durationTurns) => {
    const effectDef = statusEffectDatabase[effectId];
    const name = (effectDef && effectDef.name) || effectId;
    const instance = {
      id: `${effectId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      source_id: effectId,
      name,
      modifiers: (effectDef && effectDef.modifiers) || {},
      ticking: effectDef ? effectDef.ticking !== false : true,
      applied_at: Date.now(),
      ...(durationTurns ? { duration_turns: durationTurns } : {})
    };
    if (combatantRef.ref_type === 'monster') {
      const idx = newInitiativeOrder.findIndex(c => c.combatant_id === combatantRef.combatant_id);
      const current = newInitiativeOrder[idx].status_effects || [];
      newInitiativeOrder[idx] = { ...newInitiativeOrder[idx], status_effects: [...current, instance] };
      // Knocked Down is also a real stance (0 AC), not just a skipped
      // turn — endTurn() reverts it back to standing when this same
      // status effect expires.
      if (effectId === 'knocked_down') newInitiativeOrder[idx] = { ...newInitiativeOrder[idx], stance: 'knocked_down' };
    } else {
      const path = `characters.${combatantRef.char_id}.status_effects`;
      const char = window.liveData.characters[combatantRef.char_id];
      const current = charUpdates[path] || char.status_effects || [];
      charUpdates[path] = [...current, instance];
      if (effectId === 'knocked_down') charUpdates[`characters.${combatantRef.char_id}.stance`] = 'knocked_down';
    }
    return name;
  };

  const applyHpDamage = (combatantRef, dmg, bypassMitigation) => {
    const idx = newInitiativeOrder.findIndex(c => c.combatant_id === combatantRef.combatant_id);
    // Mitigation belongs to whoever's actually taking the damage — the
    // pre-computed targetDtdr only applies when combatantRef is the
    // original target; a redirected ("hit someone else") or self-hit
    // combatant needs their own armor looked up fresh.
    let dtdrForThis;
    if (combatantRef.ref_type === 'monster') {
      dtdrForThis = combatantRef.dtdr || {};
    } else if (combatantRef.combatant_id === target.combatant_id) {
      dtdrForThis = targetDtdr;
    } else {
      const otherChar = window.liveData.characters[combatantRef.char_id];
      const armorItem = getItem((otherChar.equipment || {}).body);
      const otherArmorMarks = normalizeCondition(otherChar).worn.body || 0;
      dtdrForThis = armorItem ? applyConditionToDtdr(parseArmorDtdr(armorItem), otherArmorMarks) : {};
    }
    const mitigated = bypassMitigation ? dmg : applyDamageReduction(dmg, dtdrForThis, attackDef.damageType || 'normal');
    let newCurrent;
    if (combatantRef.ref_type === 'monster') {
      newCurrent = Math.max(0, combatantRef.hp.current - mitigated);
      newInitiativeOrder[idx] = { ...newInitiativeOrder[idx], hp: { ...combatantRef.hp, current: newCurrent }, is_down: newCurrent <= 0 };
    } else {
      const char = window.liveData.characters[combatantRef.char_id];
      const hpPath = `characters.${combatantRef.char_id}.hp.current`;
      const currentHp = charUpdates[hpPath] !== undefined ? charUpdates[hpPath] : char.hp.current;
      newCurrent = Math.max(0, currentHp - mitigated);
      newInitiativeOrder[idx] = { ...newInitiativeOrder[idx], is_down: newCurrent <= 0 };
      charUpdates[hpPath] = newCurrent;
    }
    return { mitigated, newCurrent };
  };

  // Durability system: adds (or directly sets) marks on the attacker's
  // own equipped weapon — used by the crit-fail table's blanket "+1 mark
  // on any critical failure" (§2.3), entries 6/7's 1d3 override, and
  // Backfire setting the weapon straight to Broken (10) instead of
  // destroying it (GM ruling 2026-09-22 — BALANCE_PROPOSAL.md's original
  // "weapon destroyed" text is superseded). Reads/writes through
  // charUpdates so it composes correctly with a later drop (see
  // dropAttackerWeapon below), which needs the POST-wear marks value.
  // Monsters and unarmed attacks have nothing to wear.
  const applyAttackerWeaponWear = ({ add, set } = {}) => {
    if (!attackerIsPc || !weaponSlot) return null;
    const char = window.liveData.characters[attacker.char_id];
    const condPath = `characters.${attacker.char_id}.condition`;
    const cond = charUpdates[condPath] || normalizeCondition(char);
    const current = cond.worn[weaponSlot] ?? 0;
    const next = clampMarks(set !== undefined ? set : current + (add || 0));
    charUpdates[condPath] = { inv: cond.inv, worn: { ...cond.worn, [weaponSlot]: next } };
    return attackDef.name;
  };

  // The crit-fail table's "drops their weapon" — always returns it to the
  // pack (Backfire is the only crit-fail outcome that keeps a weapon out
  // of the inventory loop entirely, and it no longer removes the weapon
  // at all, just Breaks it in place — see applyAttackerWeaponWear). Only
  // meaningfully applies to a PC firing a real equipped weapon — monsters
  // don't have trackable equipment, and unarmed has nothing to drop.
  const dropAttackerWeapon = () => {
    if (!attackerIsPc || !draft.attackKey || draft.attackKey === 'unarmed') return null;
    const char = window.liveData.characters[attacker.char_id];
    const equip = char.equipment || {};
    const slot = weaponSlot || (equip.right_hand === draft.attackKey ? 'right_hand' : equip.left_hand === draft.attackKey ? 'left_hand' : null);
    if (!slot) return null;
    charUpdates[`characters.${attacker.char_id}.equipment.${slot}`] = null;
    charUpdates[`characters.${attacker.char_id}.ammo.${slot}`] = null;
    charUpdates[`characters.${attacker.char_id}.inventory`] = addToInventory(char.inventory, draft.attackKey, 1);
    if (isDurable(getItem(draft.attackKey))) {
      const condPath = `characters.${attacker.char_id}.condition`;
      const cond = charUpdates[condPath] || normalizeCondition(char);
      const marksNow = cond.worn[slot] ?? 0;
      const newWorn = { ...cond.worn };
      delete newWorn[slot];
      charUpdates[condPath] = { inv: { ...cond.inv, [draft.attackKey]: putCopy(cond.inv[draft.attackKey], marksNow) }, worn: newWorn };
    }
    return attackDef.name;
  };

  // Crit-fail's "hit someone else nearby" — any other living combatant,
  // excluding the attacker and the original target. None available (a
  // 1-on-1 fight) just falls back to a plain miss.
  const pickRedirectTarget = () => {
    const candidates = newInitiativeOrder.filter(c =>
      c.combatant_id !== attacker.combatant_id && c.combatant_id !== target.combatant_id && !c.is_down);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  if (isHit) {
    // A simplified stand-in for "several rounds landing" on a burst —
    // not the manual's per-round spray, just the damage dice rolled an
    // extra time and summed (see combat.js BURST_DAMAGE_ROLLS comment).
    let rolledDamage = rollDamage(attackDef.damage);
    if (isBurstShot) for (let i = 1; i < BURST_DAMAGE_ROLLS; i++) rolledDamage += rollDamage(attackDef.damage);
    let damageMultiplier = bodyPart.damageMultiplier || 1;
    let bypassMitigation = false;
    let damageAlreadyApplied = false; // artery/instant-kill deal their own fixed damage instead of the normal roll
    let killedOutright = false;

    // --- Critical success effect (manual's table, amended with the user) ---
    if (critResult === 'success') {
      const entry = rollCritTableEntry(true);
      critTag = ` [CRITICAL SUCCESS: ${entry.label}]`;
      switch (entry.effect) {
        case 'cripple_leg': effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'crippled_leg')}!`; break;
        case 'cripple_arm': effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'crippled_arm')}!`; break;
        case 'bonus_damage': damageMultiplier = Math.max(damageMultiplier, 4); break; // +300% = 4x total, capped here per "cumulative bonuses cannot go higher"
        case 'artery': {
          const { newCurrent } = applyHpDamage(target, 20, true);
          finalDamage = 20;
          damageAlreadyApplied = true;
          effectAppliedMsg += ` Hit a major artery for 20 true damage!`;
          if (newCurrent > 0) effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'bleeding')}!`;
          break;
        }
        case 'stun': effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'stunned', 1 + Math.floor(Math.random() * 4))}!`; break;
        case 'ignore_mitigation': bypassMitigation = true; break;
        case 'blind': effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'blinded', 1 + Math.floor(Math.random() * 4))}!`; break;
        case 'knockdown': effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'knocked_down', 1)}!`; break;
        case 'instant_kill': {
          // Bosses shrug off "one shot one kill" — needs an is_boss flag
          // authored on the bestiary entry; defaults to false (not a
          // boss) for anything that doesn't have one yet.
          if (target.ref_type === 'monster' && target.is_boss) {
            applyHpDamage(target, 20, true);
            finalDamage = 20;
            effectAppliedMsg += ` ${targetName} shrugs off the killing blow (boss) but takes 20 true damage!`;
          } else {
            const idx = newInitiativeOrder.findIndex(c => c.combatant_id === target.combatant_id);
            if (target.ref_type === 'monster') {
              finalDamage = target.hp.current;
              newInitiativeOrder[idx] = { ...newInitiativeOrder[idx], hp: { ...target.hp, current: 0 }, is_down: true };
            } else {
              const targetChar = window.liveData.characters[target.char_id];
              finalDamage = targetChar.hp.current;
              charUpdates[`characters.${target.char_id}.hp.current`] = 0;
              newInitiativeOrder[idx] = { ...newInitiativeOrder[idx], is_down: true };
            }
            effectAppliedMsg += ` ONE SHOT, ONE KILL!`;
            killedOutright = true;
          }
          damageAlreadyApplied = true;
          break;
        }
        default: break; // 'none' — a clean hit, nothing extra
      }
    }

    let rawDamage = 0;
    if (!damageAlreadyApplied) {
      if (attackDef.damageType === 'emp') {
        // Job 3 (manual: "Not actually damage but rather a stunning
        // effect. If armor has negative EMP then you are always
        // stunned."): no HP damage either way — only a stun, and only
        // when the target's EMP resistance is negative. Monsters carry
        // it under stats.resistances.emp (robots are expected to author
        // a negative value); a PC's comes from an optional stats.emp
        // number on their equipped body armor (no such armor exists in
        // the vault yet — see this agent's report's DATA NEEDED).
        damageAlreadyApplied = true;
        finalDamage = 0;
        let empResistance = 0;
        if (target.ref_type === 'monster') {
          empResistance = (target.resistances && target.resistances.emp) || 0;
        } else {
          const targetChar = window.liveData.characters[target.char_id];
          const armorItem = getItem((targetChar.equipment || {}).body);
          empResistance = (armorItem && armorItem.stats && typeof armorItem.stats.emp === 'number') ? armorItem.stats.emp : 0;
        }
        if (empResistance < 0) {
          effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, 'stunned', 1 + Math.floor(Math.random() * 4))}!`;
        } else {
          effectAppliedMsg += ` The EMP pulse has no effect on ${targetName}.`;
        }
      } else {
        // §2.2: "Damage: round(rolled x (1 - 0.05m)), before DT/DR" —
        // weaponMarks is 0 for unarmed/monster attacks, so conditionMultiplier
        // is a no-op (x1) there.
        rawDamage = Math.round(rolledDamage * damageMultiplier * conditionMultiplier(weaponMarks));
        if (attackDef.damageType === 'poison') {
          // Job 3 (manual: "Poison Resistance... Roll EN. Success = half
          // poison damage."): a d10 against the target's END, success
          // halves it. Bypasses DT/DR entirely — a toxin isn't stopped by
          // armor the way a physical hit is, same reasoning as True.
          const endStat = target.ref_type === 'monster'
            ? ((target.special && target.special.end) || 0)
            : deriveCharacter(window.liveData.characters[target.char_id]).special.end;
          if (rollD10() <= endStat) rawDamage = Math.floor(rawDamage / 2);
          bypassMitigation = true;
        } else if (attackDef.damageType === 'true') {
          bypassMitigation = true; // manual: "Ignores DT and DR and directly affects HP."
        }
        const { mitigated } = applyHpDamage(target, rawDamage, bypassMitigation);
        finalDamage = mitigated;
      }
    }

    // --- Armor wear (§2.3): the TARGET's own body armor takes marks from
    // being hit — an attack roll ending in 0 (the manual's "every 10
    // hits, one mark", approximated off the percentile roll itself), plus
    // floor(raw/10) extra for an explosive hit. Only a PC target has
    // trackable armor; artery/instant-kill's fixed damage isn't "raw
    // weapon damage" in the mitigation sense, so explosive wear is
    // skipped for those (roll-ending-in-0 wear still applies).
    if (target.ref_type === 'pc') {
      let armorWearMarks = (roll % 10 === 0) ? 1 : 0;
      if (attackDef.damageType === 'explosive' && !damageAlreadyApplied) armorWearMarks += Math.floor(rawDamage / 10);
      if (armorWearMarks > 0) {
        const targetChar = window.liveData.characters[target.char_id];
        const armorId = (targetChar.equipment || {}).body;
        const armorItemDef = getItem(armorId);
        if (armorId && isDurable(armorItemDef)) {
          const condPath = `characters.${target.char_id}.condition`;
          const cond = charUpdates[condPath] || normalizeCondition(targetChar);
          const current = cond.worn.body ?? 0;
          charUpdates[condPath] = { inv: cond.inv, worn: { ...cond.worn, body: clampMarks(current + armorWearMarks) } };
        }
      }
    }

    // Aimed-shot effects apply on any hit that leaves the target
    // standing (nothing left to afflict if they're downed or outright
    // killed) — works for PC or monster targets now that both carry a
    // status_effects array.
    const idxCheck = newInitiativeOrder.findIndex(c => c.combatant_id === target.combatant_id);
    const stillUp = !newInitiativeOrder[idxCheck].is_down;
    if (bodyPart.effectId && stillUp && !killedOutright) {
      effectAppliedMsg += ` ${targetName} is afflicted by ${grantEffect(target, bodyPart.effectId)}!`;
    }
  }

  // --- Critical failure effect (manual's table, amended with the user) ---
  if (critResult === 'fail') {
    const entry = rollCritTableEntry(false);
    critTag = ` [CRITICAL FAILURE: ${entry.label}]`;

    // §2.3's weapon wear: every critical failure adds a mark, UNLESS this
    // entry overrides that — Backfire sets Broken (10) outright, 6/7 roll
    // 1d3 instead of the flat 1. Applied before the switch below so
    // 'drop_weapon' (entry 10, no override — gets the flat +1) carries the
    // freshly-worn marks value when it returns the weapon to the pack.
    if (entry.effect === 'backfire') {
      applyAttackerWeaponWear({ set: 10 });
    } else if (entry.effect === 'add_marks') {
      applyAttackerWeaponWear({ add: 1 + Math.floor(Math.random() * 3) }); // 1d3
    } else {
      applyAttackerWeaponWear({ add: 1 });
    }

    switch (entry.effect) {
      case 'jammed': effectAppliedMsg += ` ${attacker.name} is afflicted by ${grantEffect(attacker, 'jammed', 1)}!`; break;
      case 'backfire': {
        effectAppliedMsg += ` ${attacker.name} is afflicted by ${grantEffect(attacker, 'crippled_arm')}!`;
        effectAppliedMsg += ` ${attackDef.name} is wrecked — Broken (10/10 marks), unusable until repaired!`;
        break;
      }
      case 'add_marks': {
        effectAppliedMsg += ` ${attackDef.name} grinds and takes a beating!`;
        break;
      }
      case 'hit_self': {
        const selfDmg = Math.round(rollDamage(attackDef.damage) / 2);
        applyHpDamage(attacker, selfDmg, true);
        effectAppliedMsg += ` ${attacker.name} hits themselves for ${selfDmg} damage!`;
        break;
      }
      case 'hit_other': {
        const redirected = pickRedirectTarget();
        if (redirected) {
          const dmg = rollDamage(attackDef.damage);
          const { mitigated } = applyHpDamage(redirected, dmg, false);
          effectAppliedMsg += ` The shot goes wide and hits ${redirected.name} instead for ${mitigated} damage!`;
        }
        break;
      }
      case 'distracted': effectAppliedMsg += ` ${attacker.name} is afflicted by ${grantEffect(attacker, 'distracted', 1)}!`; break;
      case 'knockdown_fail': effectAppliedMsg += ` ${attacker.name} is afflicted by ${grantEffect(attacker, 'knocked_down', 1)}!`; break;
      case 'drop_weapon': {
        const dropped = dropAttackerWeapon();
        if (dropped) effectAppliedMsg += ` ${attacker.name} drops ${dropped}!`;
        break;
      }
      default: break; // 'none' — just a miss (still took the flat +1 wear above)
    }
  }

  const partTag = bodyPartKey !== 'torso' ? ` (aimed at ${bodyPart.label})` : '';
  const burstTag = isBurstShot ? ` [BURST FIRE, ${ammoAfterShot}/${(getItem(draft.attackKey).stats || {}).clip_size} ammo left]` : '';
  const message = buildAttackLogMessage({
    isHit, attackerName: attacker.name, targetName, weaponName: attackDef.name,
    partTag, burstTag: burstTag + critTag, damage: finalDamage, roll, chance: effectiveChance, effectAppliedMsg,
    damageType: attackDef.damageType
  });

  const updatedCombat = {
    ...combat,
    turn_acted: true,
    initiative_order: newInitiativeOrder,
    log: [...combat.log, { id: `log_${Date.now()}`, type: 'action', message, timestamp: Date.now() }]
  };

  return { updatedCombat, charUpdates, message };
}

// GM-only: rerolls the most recent resolved roll (attack or skill/SPECIAL
// check) — SCOPE_DECISIONS.md "Next systems" ruling, 2026-09-21. Resolution
// already applies HP damage, AP/ammo and status effects, so each resolver
// above saves a `last_resolution.before` snapshot of exactly the fields it
// touched. This restores those fields, then re-resolves the exact same
// action (same attacker/target/weapon or same check) with a fresh roll —
// both in the one updateDoc below. Only the most recent resolution is
// rerollable: this deletes `last_resolution` on success rather than
// replacing it with a new one, so a reroll can't itself be rerolled —
// only a fresh action (which writes its own last_resolution) can.
export async function gmRerollLastResolution() {
  if (!window.liveData) return;
  const last = window.liveData.last_resolution;
  if (!last) { alert("NOTHING TO REROLL"); return; }

  // Build a scratch copy of the live doc with the snapshot patched back
  // in, so the re-resolution below reads pre-resolution data — exactly
  // like the original resolution did, not the version it already wrote.
  const restored = { ...window.liveData, characters: { ...window.liveData.characters } };
  Object.entries(last.before).forEach(([path, storedValue]) => {
    // FIELD_ABSENT means the path had no value before the original
    // resolution — restore that as real `undefined` here (fine for an
    // in-memory object; every reader already treats a missing key the
    // same as one explicitly set to undefined).
    const value = storedValue === FIELD_ABSENT ? undefined : storedValue;
    const parts = path.split('.');
    if (parts[0] === 'characters') {
      const charId = parts[1];
      restored.characters[charId] = { ...(restored.characters[charId] || {}) };
      setDeepPath(restored.characters[charId], parts.slice(2), value);
    } else {
      restored[parts[0]] = value;
    }
  });

  const originalLiveData = window.liveData;
  let payload = null;
  try {
    // Synchronous swap — nothing below awaits until this function's own
    // updateDoc call, so no render or other read of window.liveData can
    // slip in and see the restored (not-yet-committed) state.
    window.liveData = restored;

    if (last.kind === 'attack') {
      const combat = restored.active_combat;
      const attacker = combat && combat.initiative_order.find(c => c.combatant_id === last.params.attackerCombatantId);
      const target = combat && combat.initiative_order.find(c => c.combatant_id === last.params.targetCombatantId);
      if (!attacker || !target) { alert("CAN'T REROLL — A COMBATANT FROM THAT ACTION IS NO LONGER PRESENT"); return; }
      const freshRoll = rollPercentile();
      const draft = { attackKey: last.params.attackKey, bodyPart: last.params.bodyPart, burst: last.params.burst, targetId: target.combatant_id };
      const resolved = computeAttackResolution(combat, attacker, target, draft, freshRoll);
      if (!resolved) return;
      const rerollNote = {
        id: `log_${Date.now()}_reroll`, type: 'system',
        message: `[GM REROLL] ${last.actor}'s action vs ${last.target} was rerolled by the GM (was roll ${last.roll}, now ${freshRoll}).`,
        timestamp: Date.now()
      };
      payload = {
        ...last.before,
        ...resolved.charUpdates,
        active_combat: { ...resolved.updatedCombat, log: [...resolved.updatedCombat.log, rerollNote] },
        last_resolution: deleteField()
      };
    } else if (last.kind === 'player_check' || last.kind === 'gm_check') {
      payload = rerollCheckResolution(last);
      if (!payload) return;
    } else {
      return;
    }
  } finally {
    window.liveData = originalLiveData;
  }

  // Any snapshotted path that had no value before the original
  // resolution (FIELD_ABSENT) needs an actual FieldValue.delete() here —
  // valid now because these are real top-level update() keys, not nested
  // data inside `before` any more.
  Object.keys(payload).forEach(key => { if (payload[key] === FIELD_ABSENT) payload[key] = deleteField(); });

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, payload); } catch (err) { alert("ERROR: " + err.message); }
}

// Shared by gmRerollLastResolution() for both check kinds — re-rolls and
// re-resolves against window.liveData (already temporarily restored by
// the caller), producing a new `checks` entry and, when appropriate, a
// visible `messages` entry so players see a reroll happened even for an
// otherwise-secret GM check.
function rerollCheckResolution(last) {
  const p = last.params;
  const freshRoll = p.kind === 'special' ? (p.useD20 ? rollD20() : rollD10()) : rollPercentile();

  if (last.kind === 'player_check') {
    const char = window.liveData.characters[p.charId];
    if (!char) { alert("CAN'T REROLL — CHARACTER NOT FOUND"); return null; }
    const derived = deriveCharacter(char);
    const value = p.kind === 'special' ? char.special[p.key] : derived.skills[p.key];
    const result = p.kind === 'special' ? resolveSpecialCheck(value, p.tier, freshRoll, p.useD20) : resolveSkillCheck(value, p.tier, freshRoll);
    const entry = {
      id: `check_${Date.now()}`, mode: 'player', scope: 'single', tier: p.tier, kind: p.kind, key: p.key, useD20: p.useD20,
      hidden: false,
      results: [{ char_id: p.charId, name: char.name, roll: freshRoll, threshold: result.threshold, success: result.success, critType: result.critType || null }],
      timestamp: Date.now()
    };
    const currentChecks = window.liveData.checks || [];
    const currentMessages = window.liveData.messages || [];
    return {
      checks: [...currentChecks, entry],
      // Player checks are never secret, so the reroll is always spelled
      // out in full — same visibility rule the original resolution used.
      messages: [...currentMessages, { id: `msg_${Date.now()}`, from: 'GM', target: 'all', body: `${char.name}'s check was rerolled by the GM (was roll ${last.roll}, now ${freshRoll}).`, timestamp: Date.now() }],
      last_resolution: deleteField()
    };
  }

  // gm_check (scope 'single' or 'custom' — 'party' is never rerollable,
  // see resolveGmCheck)
  let value, name, charId = null;
  if (p.scope === 'custom') {
    name = (p.customName || '').trim();
    value = Number(p.customValue);
  } else {
    const char = window.liveData.characters[p.targetCharId];
    if (!char) { alert("CAN'T REROLL — TARGET NOT FOUND"); return null; }
    const derived = deriveCharacter(char);
    value = p.kind === 'special' ? char.special[p.key] : derived.skills[p.key];
    name = char.name;
    charId = p.targetCharId;
  }
  const result = p.kind === 'special' ? resolveSpecialCheck(value, p.tier, freshRoll, p.useD20) : resolveSkillCheck(value, p.tier, freshRoll);
  const entry = {
    id: `check_${Date.now()}`, mode: 'gm', scope: p.scope, tier: p.tier, kind: p.kind, key: p.scope === 'custom' ? null : p.key,
    useD20: p.useD20, hidden: !p.reveal,
    results: [{ char_id: charId, name, roll: freshRoll, threshold: result.threshold, success: result.success, critType: result.critType || null }],
    timestamp: Date.now()
  };
  const currentChecks = window.liveData.checks || [];
  const currentMessages = window.liveData.messages || [];
  const updatePayload = { checks: [...currentChecks, entry], last_resolution: deleteField() };
  // "Log the reroll visibly... so players see it happened" only applies
  // once the result is player-visible — a still-hidden check stays
  // hidden, same as the original resolution; the GM already sees it
  // happened via the check log entry itself (GM view shows hidden
  // entries too).
  if (p.reveal) {
    updatePayload.messages = [...currentMessages, { id: `msg_${Date.now()}`, from: 'GM', target: 'all', body: buildCheckRevealMessage(entry), timestamp: Date.now() }];
  }
  return updatePayload;
}

export async function passTurn() {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active || combat.turn_acted) return;
  const attacker = combat.initiative_order[combat.turn_index];
  const updatedCombat = {
    ...combat,
    turn_acted: true,
    log: [...combat.log, { id: `log_${Date.now()}`, type: 'action', message: `${attacker.name} passes.`, timestamp: Date.now() }]
  };
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  // Passing clears any pending reroll — it's a new action on top of
  // whatever was last resolved, and "before" no longer matches the
  // combat state a revert would need to land on.
  try { await updateDoc(charRef, { active_combat: updatedCombat, last_resolution: deleteField() }); } catch (err) { alert("ERROR: " + err.message); }
}

// Advances initiative, applying each newly-current PC's status effects
// (skip_turn / damage_per_turn) before settling on who actually goes —
// a skip_turn effect causes another advance, a lethal damage_per_turn
// effect marks them down and does the same. turnEvents collects every
// message generated so the client can build one shared announcement,
// same idea as the plain turn announcement but richer.
export async function endTurn() {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active) return;

  const n = combat.initiative_order.length;
  const newInitiativeOrder = combat.initiative_order.map(c => ({ ...c }));
  const charUpdates = {};
  const log = [...combat.log];
  const turnEvents = [];

  let nextIndex = combat.turn_index;
  let nextRound = combat.round;
  let settled = false;
  let safety = 0;

  while (!settled && safety < n * 2 + 2) {
    safety++;
    nextIndex = (nextIndex + 1) % n;
    if (nextIndex === 0) {
      nextRound += 1;
      log.push({ id: `log_${Date.now()}_r${safety}`, type: 'system', message: `— Round ${nextRound} begins —`, timestamp: Date.now() });
    }

    const candidate = newInitiativeOrder[nextIndex];
    if (candidate.is_down) continue;

    // Ticking works the same for a PC or a monster now — the only
    // difference is where the effects array and HP actually live: a PC's
    // are in characters.<id>, a monster's are inline on its own
    // initiative_order entry (it's a self-contained instance already).
    const isPcCombatant = candidate.ref_type === 'pc';
    const char = isPcCombatant ? window.liveData.characters[candidate.char_id] : null;
    const effects = isPcCombatant ? ((char && char.status_effects) || []) : (candidate.status_effects || []);
    // "ticking" defaults to true if unset, so nothing authored before
    // this field existed silently stops working — false is opt-out.
    const tickingEffects = effects.filter(fx => fx.ticking !== false && fx.modifiers);

    const hpKey = `characters.${candidate.char_id}.hp.current`;
    let runningHp = isPcCombatant
      ? (charUpdates[hpKey] !== undefined ? charUpdates[hpKey] : char.hp.current)
      : candidate.hp.current;

    let skip = false;
    let standUp = false; // Knocked Down expiring also reverts the stance, not just the status effect
    // Duration countdown happens alongside the same tick — an effect
    // with duration_turns hits 0 and cures itself right after firing one
    // last time, no separate pass needed. Effects with no duration_turns
    // at all persist until a GM removes them, unchanged from before.
    const remainingEffects = [];
    tickingEffects.forEach(fx => {
      if (fx.modifiers.skip_turn) {
        const msg = `${candidate.name} is afflicted by ${fx.name} and skips their turn!`;
        log.push({ id: `log_${Date.now()}_sk${safety}_${fx.id}`, type: 'status', message: msg, timestamp: Date.now() });
        turnEvents.push(msg);
        skip = true;
      }
      if (fx.modifiers.damage_per_turn) {
        const dmg = rollDamage(fx.modifiers.damage_per_turn);
        runningHp = Math.max(0, runningHp - dmg);
        const msg = `${candidate.name} takes ${dmg} damage from ${fx.name}!`;
        log.push({ id: `log_${Date.now()}_dot${safety}_${fx.id}`, type: 'status', message: msg, timestamp: Date.now() });
        turnEvents.push(msg);
      }
      if (fx.duration_turns !== undefined) {
        const left = fx.duration_turns - 1;
        if (left > 0) remainingEffects.push({ ...fx, duration_turns: left });
        else {
          const msg = `${candidate.name} is no longer afflicted by ${fx.name}.`;
          log.push({ id: `log_${Date.now()}_exp${safety}_${fx.id}`, type: 'status', message: msg, timestamp: Date.now() });
          if (fx.source_id === 'knocked_down') standUp = true;
        }
      } else {
        remainingEffects.push(fx); // no duration — persists until manually removed
      }
    });
    // Non-ticking effects (permanent passive modifiers like Crippled Arm)
    // were filtered out of tickingEffects above — carry them through
    // untouched rather than losing them.
    const untouchedEffects = effects.filter(fx => fx.ticking === false || !fx.modifiers);
    const nextEffects = [...remainingEffects, ...untouchedEffects];
    const effectsChanged = nextEffects.length !== effects.length;

    if (isPcCombatant) {
      if (runningHp !== char.hp.current || charUpdates[hpKey] !== undefined) {
        charUpdates[hpKey] = runningHp;
      }
      if (effectsChanged) charUpdates[`characters.${candidate.char_id}.status_effects`] = nextEffects;
      if (standUp) charUpdates[`characters.${candidate.char_id}.stance`] = 'standing';
      if (runningHp <= 0) {
        newInitiativeOrder[nextIndex] = { ...candidate, is_down: true };
        const msg = `${candidate.name} goes down!`;
        log.push({ id: `log_${Date.now()}_down${safety}`, type: 'status', message: msg, timestamp: Date.now() });
        turnEvents.push(msg);
        skip = true;
      }
    } else {
      const downed = runningHp <= 0;
      newInitiativeOrder[nextIndex] = {
        ...candidate,
        hp: { ...candidate.hp, current: runningHp },
        status_effects: nextEffects,
        stance: standUp ? 'standing' : candidate.stance,
        is_down: downed || candidate.is_down
      };
      if (downed) {
        const msg = `${candidate.name} goes down!`;
        log.push({ id: `log_${Date.now()}_down${safety}`, type: 'status', message: msg, timestamp: Date.now() });
        turnEvents.push(msg);
        skip = true;
      }
    }

    if (skip) continue;
    settled = true;
  }

  const updatedCombat = {
    ...combat,
    turn_index: nextIndex,
    round: nextRound,
    turn_acted: false,
    initiative_order: newInitiativeOrder,
    log,
    last_turn_events: turnEvents,
    last_turn_key: `${nextRound}_${nextIndex}_${Date.now()}`
  };
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  window.combatActionDraft = null;
  // Ending the turn moves initiative/round state on — any pending reroll
  // snapshot no longer matches what it would need to restore, so clear
  // it rather than let a later reroll click revert past this turn.
  try { await updateDoc(charRef, { active_combat: updatedCombat, ...charUpdates, last_resolution: deleteField() }); } catch (err) { alert("ERROR: " + err.message); }
}

// Changes a combatant's stance — free-form, any time, not gated to whose
// turn it is or tied to the small-action cost the manual describes (the
// user governs that at the table themselves). A player can only change
// their own PC's stance; the GM can change anyone's, PC or monster.
export async function setStance(combatantId, stance) {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  const combatant = combat.initiative_order.find(c => c.combatant_id === combatantId);
  if (!combatant) return;
  if (window.userRole !== 'gm' && !(combatant.ref_type === 'pc' && combatant.char_id === window.currentUser)) return;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  if (combatant.ref_type === 'pc') {
    updatePayload[`characters.${combatant.char_id}.stance`] = stance;
  } else {
    const newInitiativeOrder = combat.initiative_order.map(c => c.combatant_id === combatantId ? { ...c, stance } : c);
    updatePayload['active_combat.initiative_order'] = newInitiativeOrder;
  }
  try { await updateDoc(charRef, updatePayload); } catch (err) { alert("ERROR: " + err.message); }
}

// GM-only: sets a combatant's cover level (SCOPE_DECISIONS.md "Combat,
// scrap, People tab, heist" ruling — cover is GM-assigned, since combat
// space is navigated manually at the table, not tracked by the app).
// Unlike stance, cover isn't a PC-sheet attribute that persists outside
// combat — it lives entirely on the initiative_order entry for BOTH a PC
// and a monster combatant, same field either way, which is also what
// lets computeAttackResolution() read `target.cover` directly off
// whichever combatant object it already has in hand.
export async function setCover(combatantId, cover) {
  if (window.userRole !== 'gm') return;
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  if (!COVER_LEVELS[cover]) return;
  const combatant = combat.initiative_order.find(c => c.combatant_id === combatantId);
  if (!combatant) return;

  const newInitiativeOrder = combat.initiative_order.map(c => c.combatant_id === combatantId ? { ...c, cover } : c);
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, { 'active_combat.initiative_order': newInitiativeOrder }); } catch (err) { alert("ERROR: " + err.message); }
}

// GM-only: add a fresh monster to an in-progress fight. Appended to the
// end of the current order (not re-sorted) so it doesn't disturb whose
// turn it currently is — it gets its place in the rotation from next round on.
export async function addCombatantMidFight(monsterId) {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active || !monsterId) return;

  const sameSpecies = combat.initiative_order.filter(c => c.source_id === monsterId).length;
  const template = getMonster(monsterId);
  if (!template) return;
  const label = sameSpecies > 0 ? `${template.name} #${sameSpecies + 1}` : template.name;
  const instance = instantiateMonster(monsterId, label);
  const { roll, total } = rollInitiative(instance.sequence);
  instance.initiative_roll = roll;
  instance.initiative = total;

  const updatedCombat = {
    ...combat,
    initiative_order: [...combat.initiative_order, instance],
    log: [...combat.log, { id: `log_${Date.now()}`, type: 'system', message: `${instance.name} joins the fight!`, timestamp: Date.now() }]
  };
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try { await updateDoc(charRef, { active_combat: updatedCombat }); } catch (err) { alert("ERROR: " + err.message); }
}

// --- COMBAT: END ---
export async function endCombat() {
  const combat = window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  if (!confirm("END COMBAT? This closes the encounter — the log stays visible until the next one starts.")) return;

  const downed = combat.initiative_order.filter(c => c.is_down);
  const survivors = combat.initiative_order.filter(c => !c.is_down);
  const summary = `Combat ended after ${combat.round} round(s). ${downed.length} combatant(s) went down. ` +
    `Standing: ${survivors.map(c => c.name).join(', ') || 'none'}.`;

  const finalized = {
    ...combat,
    is_active: false,
    ended_at: Date.now(),
    summary,
    log: [...(combat.log || []), { id: `log_${Date.now()}`, type: 'system', message: summary, timestamp: Date.now() }]
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { active_combat: finalized });
    window.currentTab = 'DASHBOARD';
    window.render();
  } catch (err) { alert("ERROR: " + err.message); }
}

// --- PERK SELECTION ---
export async function choosePerk(perkId) {
  if (!window.currentUser || !window.liveData) return;
  const char = window.liveData.characters[window.currentUser];
  const currentPerks = char.perks || [];
  if (currentPerks.includes(perkId)) return;

  if (!confirm("TAKE THIS PERK? This is permanent unless your GM reverses it.")) return;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${window.currentUser}.perks`] = [...currentPerks, perkId];

  try { await updateDoc(charRef, updatePayload); }
  catch (err) { alert("ERROR: " + err.message); }
}

// GM TOOL: Factory Reset
export async function gmFactoryReset(targetCharId) {
  // Safety check: Don't reset if no target selected
  if (!targetCharId) return; 
  
  if (!confirm(`FACTORY RESET ${targetCharId.toUpperCase()}? This wipes ALL data.`)) return;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  
  // Reset to "Blank Slate"
  updatePayload[`characters.${targetCharId}.is_finalized`] = false;
  updatePayload[`characters.${targetCharId}.race`] = "human";
  updatePayload[`characters.${targetCharId}.special`] = { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 };
  updatePayload[`characters.${targetCharId}.tags`] = {};
  updatePayload[`characters.${targetCharId}.inventory`] = {};
  updatePayload[`characters.${targetCharId}.equipment`] = { head: null, body: null, right_hand: null, left_hand: null, back: null };
  updatePayload[`characters.${targetCharId}.condition`] = { inv: {}, worn: {} };
  updatePayload[`characters.${targetCharId}.skill_points`] = 0;
  updatePayload[`characters.${targetCharId}.level`] = 1;
  updatePayload[`characters.${targetCharId}.hp`] = { current: 15, max: 15 };
  
  await updateDoc(charRef, updatePayload);
  alert("CHARACTER RESET. NEXT LOGIN WILL TRIGGER CREATION.");
}

// --- DIFFICULTY CHECKS (manual's DC section) ---
// Two independent draft objects: a player rolling for themselves, and
// the GM's tool (covers both "roll for a PC/party and choose whether to
// reveal" and "roll for an NPC" — the same tool with a different
// target, per the design discussion).

function getPlayerCheckDraft() {
  if (!window.playerCheckDraft) window.playerCheckDraft = { kind: 'special', key: 'str', tier: 'normal', useD20: false, roll: '' };
  return window.playerCheckDraft;
}
// Same reasoning as setCombatActionField: don't re-render on every
// keystroke in the roll field, or it loses focus mid-typing.
export function setPlayerCheckField(field, value) {
  const draft = getPlayerCheckDraft();
  draft[field] = value;
  if (field !== 'roll') window.render();
}
export function rollForPlayerCheck() {
  const draft = getPlayerCheckDraft();
  const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
  const finalValue = draft.kind === 'special' ? (draft.useD20 ? rollD20() : rollD10()) : rollPercentile();
  window.animateDiceRoll('playerCheckRollInput', finalValue, maxRoll, () => {
    draft.roll = finalValue;
    window.render();
  });
}
// The "WHAT" dropdown packs kind+key into one value ("special:str" /
// "skill:sneak") so picking a new stat/skill is a single select, not two.
export function setPlayerCheckWhat(value) {
  const [kind, key] = value.split(':');
  const draft = getPlayerCheckDraft();
  draft.kind = kind; draft.key = key;
  window.render();
}

export async function resolvePlayerCheck() {
  if (!window.currentUser || !window.liveData) return;
  const draft = getPlayerCheckDraft();
  if (draft.roll === '' || draft.roll === null || draft.roll === undefined) { alert("ENTER OR ROLL A DICE VALUE"); return; }
  const roll = Number(draft.roll);
  const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
  if (isNaN(roll) || roll < 1 || roll > maxRoll) { alert(`ROLL MUST BE 1-${maxRoll}`); return; }

  const char = window.liveData.characters[window.currentUser];
  const derived = deriveCharacter(char);
  const value = draft.kind === 'special' ? char.special[draft.key] : derived.skills[draft.key];
  const result = draft.kind === 'special' ? resolveSpecialCheck(value, draft.tier, roll, draft.useD20) : resolveSkillCheck(value, draft.tier, roll);

  const entry = {
    id: `check_${Date.now()}`,
    mode: 'player',
    scope: 'single',
    tier: draft.tier,
    kind: draft.kind,
    key: draft.key,
    useD20: draft.useD20,
    hidden: false, // a player rolling for themselves is never a secret roll
    results: [{ char_id: window.currentUser, name: char.name, roll, threshold: result.threshold, success: result.success, critType: result.critType || null }],
    timestamp: Date.now()
  };

  const current = window.liveData.checks || [];
  // GM reroll (SCOPE_DECISIONS.md "Next systems" ruling, 2026-09-21): a
  // player check only ever touches the `checks` array, so the "before"
  // snapshot is just that array without this new entry — see
  // gmRerollLastResolution().
  const last_resolution = {
    kind: 'player_check',
    actor: char.name,
    target: null,
    roll,
    params: withoutUndefined({ charId: window.currentUser, kind: draft.kind, key: draft.key, tier: draft.tier, useD20: draft.useD20 }),
    before: { checks: current },
    at: Date.now()
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { checks: [...current, entry], last_resolution });
    window.playerCheckDraft = null;
    window.render();
  } catch (err) { alert("ERROR: " + err.message); }
}

function getGmCheckDraft() {
  if (!window.gmCheckDraft) window.gmCheckDraft = {
    scope: 'single', // 'single' | 'party' | 'custom'
    targetCharId: '',
    kind: 'special', // 'special' | 'skill'
    key: 'str',
    tier: 'normal',
    useD20: false,
    reveal: true, // reveal to players immediately vs hold it back
    customName: '',
    customValue: '',
    roll: ''
  };
  return window.gmCheckDraft;
}
export function setGmCheckField(field, value) {
  const draft = getGmCheckDraft();
  draft[field] = value;
  // Text fields that get typed into (roll, custom name/value) skip the
  // re-render for the same focus-loss reason as everywhere else in this
  // file; selects/checkboxes/radios re-render so the form reflects them.
  if (field !== 'roll' && field !== 'customValue' && field !== 'customName') window.render();
}
export function rollForGmCheck() {
  const draft = getGmCheckDraft();
  const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
  const finalValue = draft.kind === 'special' ? (draft.useD20 ? rollD20() : rollD10()) : rollPercentile();
  window.animateDiceRoll('gmCheckRollInput', finalValue, maxRoll, () => {
    draft.roll = finalValue;
    window.render();
  });
}
export function setGmCheckWhat(value) {
  const [kind, key] = value.split(':');
  const draft = getGmCheckDraft();
  draft.kind = kind; draft.key = key;
  window.render();
}

// "Just success/failure" wording — deliberately doesn't leak the actual
// roll or target number, per the design discussion (keeps some mystery
// about how close a revealed roll actually was).
function buildCheckRevealMessage(entry) {
  const label = (r) => `${r.success ? 'SUCCESS' : 'FAILURE'}${r.critType === 'success' ? ' (CRITICAL!)' : r.critType === 'fail' ? ' (CRITICAL FAILURE!)' : ''}`;
  if (entry.results.length === 1) {
    const r = entry.results[0];
    return `${r.name}'s check: ${label(r)}.`;
  }
  return `Party check results:\n${entry.results.map(r => `${r.name}: ${label(r)}`).join('\n')}`;
}

export async function resolveGmCheck() {
  if (!window.liveData) return;
  const draft = getGmCheckDraft();
  const tier = draft.tier;
  const results = [];

  if (draft.scope === 'party') {
    // Each PC rolls individually against their own stat/skill — a
    // secret party Perception check isn't one shared roll, some notice
    // and some don't. Auto-rolled per character (no manual entry per
    // PC — that'd be a lot of typing for the GM).
    Object.entries(window.liveData.characters || {}).forEach(([charId, char]) => {
      if (!char.is_finalized) return;
      const derived = deriveCharacter(char);
      const value = draft.kind === 'special' ? char.special[draft.key] : derived.skills[draft.key];
      const roll = draft.kind === 'special' ? (draft.useD20 ? rollD20() : rollD10()) : rollPercentile();
      const result = draft.kind === 'special' ? resolveSpecialCheck(value, tier, roll, draft.useD20) : resolveSkillCheck(value, tier, roll);
      results.push({ char_id: charId, name: char.name, roll, threshold: result.threshold, success: result.success, critType: result.critType || null });
    });
    if (results.length === 0) { alert("NO FINALIZED CHARACTERS TO ROLL FOR"); return; }
  } else if (draft.scope === 'custom') {
    const name = (draft.customName || '').trim();
    const value = Number(draft.customValue);
    if (!name) { alert("ENTER A NAME"); return; }
    if (draft.customValue === '' || isNaN(value)) { alert("ENTER A CHECK VALUE"); return; }
    if (draft.roll === '' || draft.roll === null || draft.roll === undefined) { alert("ENTER OR ROLL A DICE VALUE"); return; }
    const roll = Number(draft.roll);
    const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
    if (isNaN(roll) || roll < 1 || roll > maxRoll) { alert(`ROLL MUST BE 1-${maxRoll}`); return; }
    const result = draft.kind === 'special' ? resolveSpecialCheck(value, tier, roll, draft.useD20) : resolveSkillCheck(value, tier, roll);
    results.push({ char_id: null, name, roll, threshold: result.threshold, success: result.success, critType: result.critType || null });
  } else {
    if (!draft.targetCharId) { alert("PICK A TARGET"); return; }
    const char = window.liveData.characters[draft.targetCharId];
    if (!char) { alert("TARGET NOT FOUND"); return; }
    if (draft.roll === '' || draft.roll === null || draft.roll === undefined) { alert("ENTER OR ROLL A DICE VALUE"); return; }
    const roll = Number(draft.roll);
    const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
    if (isNaN(roll) || roll < 1 || roll > maxRoll) { alert(`ROLL MUST BE 1-${maxRoll}`); return; }
    const derived = deriveCharacter(char);
    const value = draft.kind === 'special' ? char.special[draft.key] : derived.skills[draft.key];
    const result = draft.kind === 'special' ? resolveSpecialCheck(value, tier, roll, draft.useD20) : resolveSkillCheck(value, tier, roll);
    results.push({ char_id: draft.targetCharId, name: char.name, roll, threshold: result.threshold, success: result.success, critType: result.critType || null });
  }

  const entry = {
    id: `check_${Date.now()}`,
    mode: 'gm',
    scope: draft.scope,
    tier,
    kind: draft.kind,
    key: draft.scope === 'custom' ? null : draft.key,
    useD20: draft.useD20,
    hidden: !draft.reveal,
    results,
    timestamp: Date.now()
  };

  const currentChecks = window.liveData.checks || [];
  const currentMessages = window.liveData.messages || [];
  const updatePayload = { checks: [...currentChecks, entry] };
  if (draft.reveal) {
    updatePayload.messages = [...currentMessages, { id: `msg_${Date.now()}`, from: 'GM', target: 'all', body: buildCheckRevealMessage(entry), timestamp: Date.now() }];
  }

  // GM reroll (SCOPE_DECISIONS.md "Next systems" ruling, 2026-09-21) —
  // 'single' and 'custom' scope only. 'party' rolls N characters against
  // one shared roll count at once, so "the last roll" has no single
  // well-defined reroll target; left out rather than guess a semantics
  // the ruling doesn't specify.
  if (draft.scope !== 'party') {
    updatePayload.last_resolution = {
      kind: 'gm_check',
      actor: results[0].name,
      target: null,
      roll: results[0].roll,
      params: withoutUndefined({
        scope: draft.scope, targetCharId: draft.targetCharId, kind: draft.kind, key: draft.key,
        tier: draft.tier, useD20: draft.useD20, reveal: draft.reveal,
        customName: draft.customName, customValue: draft.customValue
      }),
      before: { checks: currentChecks, messages: currentMessages },
      at: Date.now()
    };
  }

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, updatePayload);
    window.gmCheckDraft = null;
    window.render();
  } catch (err) { alert("ERROR: " + err.message); }
}

// GM chooses to reveal a previously-hidden check after the fact —
// same "just success/failure" message, sent whenever the GM decides to.
export async function revealCheck(checkId) {
  const checks = window.liveData.checks || [];
  const idx = checks.findIndex(c => c.id === checkId);
  if (idx === -1) return;
  const entry = { ...checks[idx], hidden: false };
  const newChecks = [...checks];
  newChecks[idx] = entry;

  const currentMessages = window.liveData.messages || [];
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, {
      checks: newChecks,
      messages: [...currentMessages, { id: `msg_${Date.now()}`, from: 'GM', target: 'all', body: buildCheckRevealMessage(entry), timestamp: Date.now() }]
    });
  } catch (err) { alert("ERROR: " + err.message); }
}