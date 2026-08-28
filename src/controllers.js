// src/controllers.js
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from './firebase.js'; // Imports the connection we made in File 1
import { statusEffectDatabase } from './statusEffects.js';
import { getItem } from './items.js';
import { RACE_RULES, calculateDerivedStats } from './formulas.js';
import { getMonster } from './bestiary.js';
import { instantiateMonster, rollInitiative } from './combat.js';

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

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const charPath = `characters.${window.currentUser}`;
  const updatePayload = {};
  updatePayload[`${charPath}.equipment.${targetSlot}`] = itemId;
  try { await updateDoc(charRef, updatePayload); }
  catch (err) { alert("ERROR: " + err.message); }
}

export async function unequipItem(targetSlot) {
  if (!window.currentUser) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${window.currentUser}.equipment.${targetSlot}`] = null;
  await updateDoc(charRef, updatePayload);
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
    
    // Get current inventory array (or empty array if none)
    const currentInv = charSnap.data().characters[targetCharId].inventory || [];
    
    // Add the new item to the local array
    currentInv.push(itemId);
    
    // WRITE the entire updated array back
    const charPath = `characters.${targetCharId}`;
    const updatePayload = {};
    updatePayload[`${charPath}.inventory`] = currentInv;
    
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
export async function gmApplyStatusEffect(targetCharId) {
  const select = document.getElementById('statusEffectSelect');
  const chosenId = select.value;

  let name, modifiers, sourceId;

  if (chosenId === '__custom__') {
    name = document.getElementById('statusEffectCustomName').value.trim();
    const modsRaw = document.getElementById('statusEffectCustomModifiers').value.trim();
    if (!name) { alert("ENTER A NAME FOR THE CUSTOM EFFECT"); return; }

    modifiers = {};
    modsRaw.split(',').forEach(pair => {
      const [key, val] = pair.split(':').map(s => s && s.trim());
      if (key && val !== undefined && val !== '' && !isNaN(Number(val))) {
        modifiers[key] = Number(val);
      }
    });
    sourceId = null;
  } else {
    if (!chosenId) return;
    const def = statusEffectDatabase[chosenId];
    if (!def) { alert("UNKNOWN STATUS EFFECT"); return; }
    name = def.name;
    modifiers = def.modifiers || {};
    sourceId = chosenId;
  }

  const instance = {
    id: `${(sourceId || name).toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    source_id: sourceId,
    name,
    modifiers,
    applied_at: Date.now()
  };

  const char = window.liveData.characters[targetCharId];
  const currentEffects = char.status_effects || [];
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${targetCharId}.status_effects`] = [...currentEffects, instance];

  try {
    await updateDoc(charRef, updatePayload);
  } catch (err) { alert("ERROR: " + err.message); }
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
  
  const updatePayload = {};
  updatePayload[`characters.${charId}.special`] = draft.special;
  updatePayload[`characters.${charId}.tags`] = tagMap;
  updatePayload[`characters.${charId}.race`] = draft.race; 
  updatePayload[`characters.${charId}.is_finalized`] = true; // LOCK IT
  
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
      char.race || 'human', char.status_effects || []
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
  updatePayload[`characters.${targetCharId}.inventory`] = []; 
  updatePayload[`characters.${targetCharId}.equipment`] = { head: null, body: null, right_hand: null, left_hand: null };
  updatePayload[`characters.${targetCharId}.skill_points`] = 0;
  updatePayload[`characters.${targetCharId}.level`] = 1;
  updatePayload[`characters.${targetCharId}.hp`] = { current: 15, max: 15 };
  
  await updateDoc(charRef, updatePayload);
  alert("CHARACTER RESET. NEXT LOGIN WILL TRIGGER CREATION.");
}