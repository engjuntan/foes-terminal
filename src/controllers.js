// src/controllers.js
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from './firebase.js'; // Imports the connection we made in File 1

// --- GAME ACTIONS ---
export async function equipItem(itemId, targetSlot) {
  if (!window.currentUser || !window.liveData) return;
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
  
  if (!code || !charId) { alert("ENTER CODE AND CHAR ID"); return; }
  
  const ref = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`access_codes.${code}`] = { role: "player", linked_char: charId };
  
  // Create Skeleton Sheet if missing
  if (!window.liveData.characters || !window.liveData.characters[charId]) {
    updatePayload[`characters.${charId}`] = {
      name: charId.toUpperCase(),
      level: 1,
      avatar_url: "https://placehold.co/200x200/333/white?text=NEW",
      hp: { current: 20, max: 20 },
      special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
      inventory: [],
      equipment: {},
      traits: [],
      perks: []
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
  
  // Calculate Skill Points (5 + INT*3) roughly, or just give flat amount
  // We can grab INT from special.int
  const intStat = char.special.int || 5;
  const pointsToAdd = 5 + (intStat * 2); // Fallout formula approximation

  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  
  updatePayload[`characters.${targetCharId}.level`] = currentLevel + 1;
  updatePayload[`characters.${targetCharId}.skill_points`] = currentSkillPoints + pointsToAdd;

  await updateDoc(charRef, updatePayload);
  alert(`LEVEL UP! Granted ${pointsToAdd} Skill Points.`);
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