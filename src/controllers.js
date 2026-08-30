// src/controllers.js
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from './firebase.js'; // Imports the connection we made in File 1
import { statusEffectDatabase } from './statusEffects.js';
import { getItem } from './items.js';
import { RACE_RULES, calculateDerivedStats } from './formulas.js';
import { getMonster } from './bestiary.js';
import { instantiateMonster, rollInitiative, rollPercentile, resolveHit, rollDamage, applyDamageReduction, BODY_PARTS, BURST_HIT_PENALTY, BURST_DAMAGE_ROLLS, buildAttackLogMessage } from './combat.js';
import { dataLogDatabase } from './dataLogs.js';
import { mapDatabase } from './maps.js';
import { normalizeInventory, getInventoryQuantity, addToInventory, removeFromInventory } from './inventory.js';

// --- GAME ACTIONS ---
export async function equipItem(itemId, targetSlot) {
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

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const charPath = `characters.${window.currentUser}`;
  const updatePayload = {};
  updatePayload[`${charPath}.equipment.${targetSlot}`] = itemId;
  updatePayload[`${charPath}.inventory`] = newInv;
  // Ammo tracking lives per equipped slot, not per item instance (the app
  // doesn't track individual item copies anywhere). Equipping a weapon
  // with a clip_size always assumes a fresh, full magazine; a weapon with
  // no clip_size (melee, unarmed-type gear) just has no ammo entry at all.
  updatePayload[`${charPath}.ammo.${targetSlot}`] = (item && item.clip_size) || null;
  try { await updateDoc(charRef, updatePayload); }
  catch (err) { alert("ERROR: " + err.message); }
}

export async function unequipItem(targetSlot) {
  if (!window.currentUser || !window.liveData) return;
  const char = window.liveData.characters[window.currentUser];
  if (!char) return;
  const itemId = (char.equipment || {})[targetSlot];
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${window.currentUser}.equipment.${targetSlot}`] = null;
  updatePayload[`characters.${window.currentUser}.ammo.${targetSlot}`] = null;
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
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.equipment.${targetSlot}`] = null;
  updatePayload[`characters.${targetCharId}.ammo.${targetSlot}`] = null;
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
  if (!item || !item.clip_size) { alert("NO AMMO-USING WEAPON EQUIPPED IN THAT SLOT"); return; }

  const currentAmmo = (char.ammo || {})[slot] ?? item.clip_size;
  const deficit = item.clip_size - currentAmmo;
  if (deficit <= 0) { alert("ALREADY FULLY LOADED"); return; }

  const updatePayload = {};

  // A weapon only draws down real inventory ammo if it's been authored
  // with an ammo_type (e.g. "9mm") — a weapon with clip_size but no
  // ammo_type just refills for free, same as before this feature. Tops
  // up exactly the deficit (not a full clip's worth) so topping off a
  // partially-spent magazine doesn't waste rounds you didn't need to burn.
  if (item.ammo_type) {
    const inv = normalizeInventory(char.inventory);
    const matchingAmmoIds = Object.keys(inv).filter(id => {
      const def = getItem(id);
      return def && def.type === 'ammo' && def.ammo_type === item.ammo_type;
    });
    const totalHeld = matchingAmmoIds.reduce((sum, id) => sum + inv[id], 0);
    if (totalHeld < deficit) {
      alert(`NO AMMO! (need ${deficit} more ${item.ammo_type}, have ${totalHeld})`);
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

  updatePayload[`characters.${targetCharId}.ammo.${slot}`] = item.clip_size;

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
        equipment: { head: null, body: null, right_hand: null, left_hand: null },
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
export async function gmGrantItem(targetCharId) {
  const select = document.getElementById('gmItemSelect');
  const itemId = select.value;
  if (!itemId) return;

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  
  try {
    // READ current data first
    const charSnap = await getDoc(charRef);
    if (!charSnap.exists()) return;

    // Inventory is a stacked { itemId: quantity } map now — normalizes
    // and upgrades transparently even if this character still has the
    // old flat-array shape from before stacking existed.
    const currentInv = charSnap.data().characters[targetCharId].inventory;
    const newInv = addToInventory(currentInv, itemId, 1);

    // WRITE the entire updated map back
    const charPath = `characters.${targetCharId}`;
    const updatePayload = {};
    updatePayload[`${charPath}.inventory`] = newInv;

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
  window.render(); // Re-render to update UI
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
    const derived = calculateDerivedStats(
      char.special, char.level || 1, char.traits || [], char.perks || [],
      char.race || 'human', char.status_effects || [], char.equipment || {}
    );
    const { roll, total } = rollInitiative(derived.sequenceBonus);
    initiative_order.push({
      combatant_id: `pc_${charId}`,
      ref_type: 'pc',
      char_id: charId,
      name: char.name,
      initiative_roll: roll,
      initiative: total,
      is_down: false
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
  draft.roll = rollPercentile();
  window.render();
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

  // Aimed shots are attacker-agnostic — a called shot works the same
  // whether a PC targets a monster or a monster (GM-controlled) targets a
  // PC. Torso is just the default normal attack, unchanged either way.
  const bodyPartKey = draft.bodyPart || 'torso';
  const bodyPart = BODY_PARTS[bodyPartKey] || BODY_PARTS.torso;

  // --- Attacker's skill/hit% + attack definition ---
  // Ammo/burst state (only meaningful for a PC firing an equipped gun with
  // a clip_size — melee, unarmed, and monster attacks never touch this).
  let attackDef, attackerValue;
  let burstPenalty = 0, isBurstShot = false;
  let ammoCharId = null, ammoSlot = null, ammoAfterShot = null;
  if (attacker.ref_type === 'monster') {
    attackDef = (attacker.attacks || []).find(a => a.name === draft.attackKey);
    if (!attackDef) { alert("PICK AN ATTACK"); return; }
    attackerValue = attackDef.hit_percent;
  } else {
    const char = window.liveData.characters[attacker.char_id];
    const derived = calculateDerivedStats(char.special, char.level || 1, char.traits || [], char.perks || [], char.race || 'human', char.status_effects || [], char.equipment || {});
    if (!draft.attackKey || draft.attackKey === 'unarmed') {
      attackDef = { name: 'Unarmed', damage: derived.unarmedDamageFull, damageType: 'normal' };
      attackerValue = derived.skills.unarmed;
    } else {
      const weaponItem = getItem(draft.attackKey);
      if (!weaponItem) { alert("PICK A WEAPON"); return; }
      const isMelee = !weaponItem.stats || (weaponItem.stats.range || 0) <= 1;
      const skillKey = weaponItem.skill || (isMelee ? 'melee_weapons' : 'small_guns');
      attackerValue = derived.skills[skillKey] ?? 0;
      const dmgDice = (weaponItem.stats && weaponItem.stats.dmg) || '1d4';
      attackDef = {
        name: weaponItem.name,
        damage: isMelee ? `${dmgDice}+${derived.meleeDamageBase}` : dmgDice,
        damageType: (weaponItem.stats && weaponItem.stats.dmgType) || 'normal'
      };

      // --- Ammo check (only for weapons authored with a clip_size) ---
      if (weaponItem.clip_size) {
        const equip = char.equipment || {};
        ammoSlot = equip.right_hand === draft.attackKey ? 'right_hand' : equip.left_hand === draft.attackKey ? 'left_hand' : null;
        if (ammoSlot) {
          ammoCharId = attacker.char_id;
          const currentAmmo = (char.ammo || {})[ammoSlot] ?? weaponItem.clip_size;
          isBurstShot = !!(draft.burst && weaponItem.burst_shots);
          const shotCost = isBurstShot ? weaponItem.burst_shots : 1;
          if (currentAmmo < shotCost) {
            alert(`OUT OF AMMO (${currentAmmo}/${weaponItem.clip_size}) — RELOAD FIRST`);
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
    targetDtdr = target.dtdr || {};
    targetName = target.name;
  } else {
    const targetChar = window.liveData.characters[target.char_id];
    const targetDerived = calculateDerivedStats(targetChar.special, targetChar.level || 1, targetChar.traits || [], targetChar.perks || [], targetChar.race || 'human', targetChar.status_effects || [], targetChar.equipment || {});
    targetAC = targetDerived.armorClass;
    const armorItem = getItem((targetChar.equipment || {}).body);
    targetDtdr = (armorItem && armorItem.dtdr) || {}; // no armor authored yet -> defaults to no mitigation
    targetName = targetChar.name;
  }

  const { effectiveChance, isHit } = resolveHit(attackerValue - bodyPart.penalty - burstPenalty, targetAC, roll);

  let finalDamage = 0;
  let effectAppliedMsg = '';
  const newInitiativeOrder = combat.initiative_order.map(c => ({ ...c }));
  const charUpdates = {};

  // Ammo is spent on firing, hit or miss — the rounds left the barrel
  // either way. Applied regardless of isHit, once we know we're actually
  // going through with the shot (past the earlier ammo-check return).
  if (ammoCharId && ammoSlot) {
    charUpdates[`characters.${ammoCharId}.ammo.${ammoSlot}`] = ammoAfterShot;
  }

  if (isHit) {
    // A simplified stand-in for "several rounds landing" on a burst —
    // not the manual's per-round spray, just the damage dice rolled an
    // extra time and summed (see combat.js BURST_DAMAGE_ROLLS comment).
    let rolledDamage = rollDamage(attackDef.damage);
    if (isBurstShot) for (let i = 1; i < BURST_DAMAGE_ROLLS; i++) rolledDamage += rollDamage(attackDef.damage);
    const rawDamage = Math.round(rolledDamage * (bodyPart.damageMultiplier || 1));
    finalDamage = applyDamageReduction(rawDamage, targetDtdr, attackDef.damageType || 'normal');
    const idx = newInitiativeOrder.findIndex(c => c.combatant_id === target.combatant_id);
    let newCurrent;
    if (target.ref_type === 'monster') {
      newCurrent = Math.max(0, target.hp.current - finalDamage);
      newInitiativeOrder[idx] = { ...target, hp: { ...target.hp, current: newCurrent }, is_down: newCurrent <= 0 };
    } else {
      const targetChar = window.liveData.characters[target.char_id];
      newCurrent = Math.max(0, targetChar.hp.current - finalDamage);
      newInitiativeOrder[idx] = { ...target, is_down: newCurrent <= 0 };
      charUpdates[`characters.${target.char_id}.hp.current`] = newCurrent;

      // Aimed-shot effects only mechanically apply to PC targets right
      // now — monsters don't carry a status_effects array.
      if (bodyPart.effectId && newCurrent > 0) {
        const effectDef = statusEffectDatabase[bodyPart.effectId];
        if (effectDef) {
          const currentEffects = targetChar.status_effects || [];
          const instance = {
            id: `${bodyPart.effectId}_${Date.now()}`,
            source_id: bodyPart.effectId,
            name: effectDef.name,
            modifiers: effectDef.modifiers || {},
            ticking: effectDef.ticking !== false,
            applied_at: Date.now()
          };
          charUpdates[`characters.${target.char_id}.status_effects`] = [...currentEffects, instance];
          effectAppliedMsg = ` ${targetChar.name} is afflicted by ${effectDef.name}!`;
        }
      }
    }
  }

  const partTag = bodyPartKey !== 'torso' ? ` (aimed at ${bodyPart.label})` : '';
  const burstTag = isBurstShot ? ` [BURST FIRE, ${ammoAfterShot}/${getItem(draft.attackKey).clip_size} ammo left]` : '';
  const message = buildAttackLogMessage({
    isHit, attackerName: attacker.name, targetName, weaponName: attackDef.name,
    partTag, burstTag, damage: finalDamage, roll, chance: effectiveChance, effectAppliedMsg
  });

  const updatedCombat = {
    ...combat,
    turn_acted: true,
    initiative_order: newInitiativeOrder,
    log: [...combat.log, { id: `log_${Date.now()}`, type: 'action', message, timestamp: Date.now() }]
  };

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  try {
    await updateDoc(charRef, { active_combat: updatedCombat, ...charUpdates });
    window.combatActionDraft = null;
  } catch (err) { alert("ERROR: " + err.message); }
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
  try { await updateDoc(charRef, { active_combat: updatedCombat }); } catch (err) { alert("ERROR: " + err.message); }
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

    let skip = false;
    if (candidate.ref_type === 'pc') {
      const char = window.liveData.characters[candidate.char_id];
      const effects = (char && char.status_effects) || [];
      // "ticking" defaults to true if unset, so nothing authored before
      // this field existed silently stops working — false is opt-out.
      const tickingEffects = effects.filter(fx => fx.ticking !== false && fx.modifiers);

      const hpKey = `characters.${candidate.char_id}.hp.current`;
      let runningHp = charUpdates[hpKey] !== undefined ? charUpdates[hpKey] : char.hp.current;

      // Every ticking effect resolves independently — e.g. Stunned skipping
      // the turn does NOT stop Poison from still dealing its damage.
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
      });

      if (runningHp !== char.hp.current || charUpdates[hpKey] !== undefined) {
        charUpdates[hpKey] = runningHp;
      }
      if (runningHp <= 0) {
        newInitiativeOrder[nextIndex] = { ...candidate, is_down: true };
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
  try { await updateDoc(charRef, { active_combat: updatedCombat, ...charUpdates }); } catch (err) { alert("ERROR: " + err.message); }
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
    window.currentTab = 'STATUS';
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
  updatePayload[`characters.${targetCharId}.equipment`] = { head: null, body: null, right_hand: null, left_hand: null };
  updatePayload[`characters.${targetCharId}.skill_points`] = 0;
  updatePayload[`characters.${targetCharId}.level`] = 1;
  updatePayload[`characters.${targetCharId}.hp`] = { current: 15, max: 15 };
  
  await updateDoc(charRef, updatePayload);
  alert("CHARACTER RESET. NEXT LOGIN WILL TRIGGER CREATION.");
}