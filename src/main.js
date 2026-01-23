import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { calculateDerivedStats } from './formulas.js';
import { getItem } from './items.js';
import { getTrait } from './traits.js';
import './style.css';

// --- 1. CONFIGURATION ---
// ⚠️ PASTE YOUR REAL KEYS HERE ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyCHotPqW1YCwO6TQWOHEKfszPf5ICQOFXQ",
  authDomain: "foes-terminal.firebaseapp.com",
  projectId: "foes-terminal",
  storageBucket: "foes-terminal.firebasestorage.app",
  messagingSenderId: "324758845848",
  appId: "1:324758845848:web:56f6def06d685148ff13ed"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// GLOBAL STATE
window.liveData = null; 
window.currentUser = null; 

// --- 3. DATABASE LISTENER ---
onSnapshot(doc(db, "prisoncampaign", "alpha_team"), (docSnapshot) => {
  if (docSnapshot.exists()) {
    window.liveData = docSnapshot.data();
  } else {
    window.liveData = {}; 
  }
  if (window.currentUser) window.render();
});

// --- 4. CONTROLLERS ---
window.equipItem = async (itemId, targetSlot) => {
  if (!window.currentUser || !window.liveData) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const charPath = `characters.${window.currentUser}`;
  const updatePayload = {};
  updatePayload[`${charPath}.equipment.${targetSlot}`] = itemId;
  try { await updateDoc(charRef, updatePayload); } 
  catch (err) { alert("ERROR: " + err.message); }
};

window.unequipItem = async (targetSlot) => {
  if (!window.currentUser) return;
  const charRef = doc(db, "prisoncampaign", "alpha_team");
  const updatePayload = {};
  updatePayload[`characters.${window.currentUser}.equipment.${targetSlot}`] = null;
  await updateDoc(charRef, updatePayload);
};

// --- 5. HELPER: GLOBAL TOOLTIP LOGIC ---

// A. Inject the tooltip container once on startup
if (!document.getElementById('global-tooltip')) {
  const tooltipDiv = document.createElement('div');
  tooltipDiv.id = 'global-tooltip';
  document.body.appendChild(tooltipDiv);
}

const tooltipEl = document.getElementById('global-tooltip');

// B. Functions to show/hide it based on mouse position
window.showTooltip = (text, event) => {
  tooltipEl.innerHTML = text;
  tooltipEl.classList.add('active');
  // Position it slightly to the right and down from the cursor
  tooltipEl.style.top = (event.clientY + 15) + 'px';
  tooltipEl.style.left = (event.clientX + 15) + 'px';
}

window.hideTooltip = () => {
  tooltipEl.classList.remove('active');
}

// C. The Link Renderer updated to use these functions
function renderWikiLink(name, description) {
  if (!description) description = "No data available.";
  // Escape quotes in description to prevent HTML errors
  const safeDesc = description.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  
  return `
    <span class="wiki-link" 
          onmouseover="window.showTooltip('${safeDesc}', event)" 
          onmouseout="window.hideTooltip()"
          onclick="// Mobile tap support handled by hover state on most devices">
      ${name}
    </span>
  `;
}


// --- 6. VIEW GENERATOR ---
function getPlayerView(charId) {
  if (!window.liveData || !window.liveData.characters) return "<h1>> WAITING FOR DATA STREAM...</h1>";
  
  const charData = window.liveData.characters[charId];
  if (!charData) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const equip = charData.equipment || { head: null, body: null, right_hand: null, left_hand: null };

  const derived = calculateDerivedStats(
    charData.special, 
    charData.level || 1, 
    charData.traits || [], 
    charData.perks || []
  );

  // --- RENDER SKILLS ---
  const skillCategories = {
    "COMBAT SKILLS": ["small_guns", "big_guns", "energy_weapons", "melee_weapons", "throwing", "unarmed"],
    "COVERT SKILLS": ["sneak", "steal", "lockpick", "traps"],
    "SCIENCE SKILLS": ["medicine", "science", "engineering", "robotics", "gunsmith"],
    "SOFT SKILLS": ["speech", "survival", "instinct"]
  };

  let skillsHtml = "";
  for (const [category, skillKeys] of Object.entries(skillCategories)) {
    skillsHtml += `<h4 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:15px; margin-bottom:5px;">${category}</h4>`;
    skillKeys.forEach(key => {
      if (derived.skills[key] === undefined) return;
      const isTagged = charData.tags ? charData.tags[key] : false;
      const totalVal = derived.skills[key] + (charData.skill_ranks?.[key] || 0) + (isTagged ? 20 : 0);
      skillsHtml += `
        <div class="skill-item ${isTagged ? 'tagged' : ''}">
          <span>${key.replace(/_/g, ' ').toUpperCase()}</span><span>${totalVal}%</span>
        </div>`;
    });
  }

  // --- RENDER TRAITS & PERKS ---
  const traitsHtml = (charData.traits || []).map(tID => {
    const t = getTrait(tID);
    return `<div style="margin-bottom:5px;">• ${renderWikiLink(t.name, t.description)}</div>`;
  }).join("");

  const perksHtml = (charData.perks || []).map(pID => {
    const p = getTrait(pID);
    return `<div style="margin-bottom:5px;">• ${renderWikiLink(p.name, p.description)}</div>`;
  }).join("");

  // --- RENDER EQUIPMENT SLOTS ---
  const renderSlot = (slotName, slotKey) => {
    const itemId = equip[slotKey];
    const itemDef = getItem(itemId);
    
    if (itemDef) {
      return `
        <div class="slot-box occupied" onclick="window.unequipItem('${slotKey}')">
          <small>${slotName}</small>
          <div style="display:flex; align-items:center; gap:5px;">
            <img src="${itemDef.icon}" style="width:24px; height:24px; border:1px solid var(--pip-green);">
            <span>${itemDef.name}</span>
          </div>
        </div>`;
    } else {
      return `
        <div class="slot-box empty">
          <small>${slotName}</small>
          <span style="color:#555;">[EMPTY]</span>
        </div>`;
    }
  };

  // --- RANGED DAMAGE LOGIC ---
  const rHandItem = getItem(equip.right_hand);
  const lHandItem = getItem(equip.left_hand);
  let rangedDmgDisplay = "N/A";
  
  if (rHandItem && rHandItem.type === 'weapon') rangedDmgDisplay = `${rHandItem.stats.dmg} (R)`;
  else if (lHandItem && lHandItem.type === 'weapon') rangedDmgDisplay = `${lHandItem.stats.dmg} (L)`;

  const damageSection = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; border-top:1px solid #333; padding-top:10px;">
      <div style="text-align:center;">
        <small style="color:#aaa;">MELEE DMG</small><br>
        <span style="font-size:18px; color:var(--pip-green);">${derived.meleeDamageBase}</span>
      </div>
      <div style="text-align:center;">
        <small style="color:#aaa;">RANGED DMG</small><br>
        <span style="font-size:18px; color:var(--pip-green);">${rangedDmgDisplay}</span>
      </div>
    </div>
  `;

  // --- INVENTORY LIST ---
  let inventoryHtml = "";
  if (charData.inventory && charData.inventory.length) {
    inventoryHtml = `<ul class="inventory-list">` + 
      charData.inventory.map(itemEntry => {
        const itemId = (typeof itemEntry === 'string') ? itemEntry : itemEntry.id;
        const itemDef = getItem(itemId);

        if (itemDef) {
          const isEquipped = Object.values(equip).includes(itemId);
          const style = isEquipped ? "opacity: 0.5; border-color: #555;" : "";
          
          // 1. PREPARE DESCRIPTION (Escape quotes to prevent errors)
          const rawDesc = itemDef.description || "No description available.";
          const safeDesc = rawDesc.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

          // 2. BUTTON LOGIC
          let buttons = "";
          if (!isEquipped) {
            if (itemDef.slot === "hand") {
              buttons = `<button onclick="window.equipItem('${itemId}', 'right_hand')">R</button> <button onclick="window.equipItem('${itemId}', 'left_hand')">L</button>`;
            } else if (itemDef.slot === "body") {
              buttons = `<button onclick="window.equipItem('${itemId}', 'body')">EQUIP</button>`;
            } else if (itemDef.slot === "head") {
              buttons = `<button onclick="window.equipItem('${itemId}', 'head')">EQUIP</button>`;
            }
          } else {
            buttons = `<span style="color:var(--pip-green); font-size:10px;">[EQUIPPED]</span>`;
          }

          // 3. RENDER CARD WITH TOOLTIP TRIGGER ON NAME
          return `
            <li class="inv-card" style="${style}">
              <img src="${itemDef.icon}" class="inv-icon">
              <div class="inv-info">
                <span class="inv-name" 
                      style="cursor:help; border-bottom:1px dotted var(--pip-green);"
                      onmouseover="window.showTooltip('${safeDesc}', event)" 
                      onmouseout="window.hideTooltip()">
                  ${itemDef.name}
                </span>
                <span class="inv-meta">${itemDef.type.toUpperCase()}</span>
              </div>
              <div class="inv-actions">${buttons}</div>
            </li>`;
        } else {
          return `<li>${itemId}</li>`;
        }
      }).join("") + `</ul>`;
  }

  // --- FINAL LAYOUT ---
  return `
    <div class="dashboard-container">
      <div class="panel">
        <img src="${charData.avatar_url}" class="char-portrait">
        <h2>VITALS</h2>
        <div style="margin-bottom:15px;">
           <label>HP STATUS</label>
           <div style="background:#330000; height:20px; border:1px solid red; margin-top:5px;">
             <div style="width:${(charData.hp.current / charData.hp.max) * 100}%; background:red; height:100%;"></div>
           </div>
           <div style="text-align:right;">${charData.hp.current} / ${charData.hp.max}</div>
        </div>
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">S.P.E.C.I.A.L.</h3>
        ${Object.entries(charData.special).map(([k, v]) => `
          <div class="special-row"><span>${k.toUpperCase()}</span><span>${v}</span></div>
        `).join("")}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">TRAITS</h3>
        ${traitsHtml || "> NONE"}

        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">PERKS</h3>
        ${perksHtml || "> NONE"}
      </div>

      <div class="panel">
        <h2>COMBAT STATS</h2>
         <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
          <div style="border:1px solid #333; padding:5px; text-align:center;">
            <small>AC</small><br><strong style="font-size:24px;">${derived.armorClass}</strong>
          </div>
          <div style="border:1px solid #333; padding:5px; text-align:center;">
            <small>SEQ</small><br><strong style="font-size:24px;">${derived.sequenceBonus}</strong>
          </div>
        </div>
        <h2>SKILLS</h2>
        <div style="flex-grow:1; overflow-y:scroll;">${skillsHtml}</div>
      </div>

      <div class="panel">
        <h2>EQUIPPED GEAR</h2>
        <div class="equipment-grid">
          ${renderSlot("HEAD", "head")}
          ${renderSlot("BODY", "body")}
          ${renderSlot("R. HAND", "right_hand")}
          ${renderSlot("L. HAND", "left_hand")}
        </div>
        ${damageSection}
        <h2 style="margin-top:20px;">INVENTORY</h2>
        <div style="overflow-y:auto; flex-grow:1;">${inventoryHtml}</div>
      </div>
    </div>
  `;
}

// --- 7. STARTUP & CONTROLS ---
function attemptLogin(rawCode) {
  const code = rawCode.toUpperCase().trim();
  if (code === 'KONG_ACCESS') window.currentUser = 'kong';
  else if (code === 'IRON_ACCESS') window.currentUser = 'iron';
  else if (code === 'GM_OVERRIDE') window.currentUser = 'gm';
  else { alert("ACCESS DENIED"); return; }
  window.render();
}
function setupControls() {
  const input = document.getElementById('loginInput');
  const btn = document.getElementById('loginBtn');
  if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(input.value); });
  if (btn) btn.addEventListener('click', () => { if(input) attemptLogin(input.value); });
}

window.render = function() {
  if (!window.currentUser) {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-interface').classList.add('hidden');
  } else {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-interface').classList.remove('hidden');
    document.getElementById('main-viewport').innerHTML = getPlayerView(window.currentUser);
  }
}

// --- 8. DATABASE REPAIR ---
window.forceReset = async () => {
  if (!confirm("OVERWRITE DATABASE?")) return;
  const seedData = {
    meta: { version: "1.3" },
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
  alert("DATABASE RESET. GLOBAL TOOLTIPS ONLINE.");
  location.reload();
};

setupControls();
window.render();