// src/views.js
import { calculateDerivedStats } from './formulas.js';
import { getItem, itemDatabase } from './items.js';
import { getTrait } from './traits.js';

// --- HELPERS ---
export function renderWikiLink(name, description) {
  if (!description) description = "No data available.";
  // Sanitizer: Escapes quotes so tooltips don't break
  const safeDesc = description.replace(/"/g, "&quot;").replace(/'/g, "\\'");
  return `<span class="wiki-link" 
          onmouseover="window.showTooltip('${safeDesc}', event)" 
          onmouseout="window.hideTooltip()">
      ${name}
    </span>`;
}

export function getNavbar(currentTab, currentUser) {
  const tabs = ['STATUS', 'DATA', 'GEOGRAPHY'];
  if (window.userRole === 'gm') tabs.push('OVERRIDE');

  return `
    <div class="terminal-nav">
      ${tabs.map(tab => `
        <button class="nav-btn ${currentTab === tab ? 'active' : ''}" 
                onclick="window.switchTab('${tab}')">
          ${tab}
        </button>
      `).join('')}
      <div style="flex-grow:1;"></div>
      <div style="color:var(--pip-green); font-size:12px; align-self:center;">
        USER: ${currentUser.toUpperCase()}
      </div>
    </div>
  `;
}

// --- PLAYER SCREEN ---
export function getPlayerView(charId, liveData) {
  const charData = liveData.characters[charId];
  if (!charData) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const equip = charData.equipment || { head: null, body: null, right_hand: null, left_hand: null };
  const derived = calculateDerivedStats(charData.special, charData.level || 1, charData.traits || [], charData.perks || []);

  // --- 1. LEVEL UP STATE ---
  const availablePoints = charData.skill_points || 0;
  const draft = window.levelUpDraft || { spent: 0, allocation: {} };
  const pointsRemaining = availablePoints - draft.spent;
  const isLeveling = availablePoints > 0;

  // --- 2. SKILLS GENERATION ---
  const skillCategories = {
    "COMBAT SKILLS": ["small_guns", "big_guns", "energy_weapons", "melee_weapons", "throwing", "unarmed"],
    "COVERT SKILLS": ["sneak", "steal", "lockpick", "traps"],
    "SCIENCE SKILLS": ["medicine", "science", "engineering", "robotics", "gunsmith"],
    "SOFT SKILLS": ["speech", "survival", "instinct"]
  };
  
  let skillsHtml = "";
  
  if (isLeveling) {
    skillsHtml += `
      <div style="background:var(--pip-dim); color:black; padding:5px; text-align:center; margin-bottom:10px; border:1px solid var(--pip-green);">
        <strong>>> LEVEL UP MODE <<</strong><br>
        POINTS REMAINING: <span style="color:${pointsRemaining > 0 ? 'white' : 'red'}">${pointsRemaining}</span>
        <div style="margin-top:5px; display:flex; gap:10px; justify-content:center;">
           <button onclick="window.confirmLevelUp()" style="background:var(--pip-green); color:black; border:none; cursor:pointer; font-weight:bold;">[CONFIRM]</button>
           <button onclick="window.cancelLevelUp()" style="background:red; color:white; border:none; cursor:pointer;">[RESET]</button>
        </div>
      </div>
    `;
  }

  for (const [category, skillKeys] of Object.entries(skillCategories)) {
    skillsHtml += `<h4 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:15px; margin-bottom:5px;">${category}</h4>`;
    
    skillKeys.forEach(key => {
      if (derived.skills[key] === undefined) return;
      
      const isTagged = charData.tags ? charData.tags[key] : false;
      const addedSteps = draft.allocation[key] || 0;
      const addedValue = isTagged ? (addedSteps * 2) : addedSteps; 
      
      const baseVal = derived.skills[key] + (charData.skill_ranks?.[key] || 0) + (isTagged ? 20 : 0);
      const totalVal = baseVal + addedValue;

      let controls = "";
      if (isLeveling) {
        const minDisabled = addedSteps <= 0 ? "disabled style='opacity:0.3'" : "style='cursor:pointer; color:red;'";
        const maxDisabled = pointsRemaining <= 0 ? "disabled style='opacity:0.3'" : "style='cursor:pointer; color:lime;'";
        
        controls = `
          <div style="display:flex; gap:5px;">
            <button ${minDisabled} onclick="window.adjustSkillDraft('${key}', -1)">[-]</button>
            <button ${maxDisabled} onclick="window.adjustSkillDraft('${key}', 1)">[+]</button>
          </div>
        `;
      }
      
      const valDisplay = addedValue > 0 
        ? `<span style="color:cyan;">${totalVal}% (+${addedValue})</span>` 
        : `<span>${totalVal}%</span>`;

      skillsHtml += `
        <div class="skill-item ${isTagged ? 'tagged' : ''}" style="display:flex; justify-content:space-between; align-items:center;">
          <span>${key.replace(/_/g, ' ').toUpperCase()}</span>
          <div style="display:flex; gap:10px; align-items:center;">
            ${controls}
            ${valDisplay}
          </div>
        </div>`;
    });
  }

  // --- 3. INVENTORY SPLIT (WALLET vs GEAR) ---
  let inventoryHtml = "";
  let walletHtml = "";

  if (charData.inventory) {
    // Convert list of IDs to list of Objects {id, def}
    const rawInv = charData.inventory.map(itemEntry => {
       const itemId = (typeof itemEntry === 'string') ? itemEntry : itemEntry.id;
       const itemDef = getItem(itemId);
       return { id: itemId, def: itemDef };
    });

    // A. Generate Wallet HTML (Currency Only)
    walletHtml = rawInv
      .filter(i => i.def && i.def.type === 'currency')
      .map(i => {
         return `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #333; padding:2px 0;">
                   ${renderWikiLink(i.def.name, i.def.description)}
                   <span style="color:var(--pip-gold);">x1</span> 
                 </div>`;
      }).join("");

    // B. Generate Gear HTML (Everything Else)
    inventoryHtml = `<ul class="inventory-list">` + rawInv
      .filter(i => !i.def || i.def.type !== 'currency')
      .map(i => {
        const itemDef = i.def;
        const itemId = i.id;
        
        if (itemDef) {
          const isEquipped = Object.values(equip).includes(itemId);
          const style = isEquipped ? "opacity: 0.5; border-color: #555;" : "";
          const rawDesc = itemDef.description || "No description available.";
          const safeDesc = rawDesc.replace(/"/g, "&quot;").replace(/'/g, "\\'");
          
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
          return `<li>${itemId} (DATA SYNC PENDING)</li>`;
        }
    }).join("") + `</ul>`;
  }

  const renderSlot = (slotName, slotKey) => {
    const itemId = equip[slotKey];
    const itemDef = getItem(itemId);
    if (itemDef) {
      return `<div class="slot-box occupied" onclick="window.unequipItem('${slotKey}')"><small>${slotName}</small><div style="display:flex; align-items:center; gap:5px;"><img src="${itemDef.icon}" style="width:24px; height:24px; border:1px solid var(--pip-green);"><span>${itemDef.name}</span></div></div>`;
    }
    return `<div class="slot-box empty"><small>${slotName}</small><span style="color:#555;">[EMPTY]</span></div>`;
  };

  // --- 4. DAMAGE CALCULATION ---
  const rHandItem = getItem(equip.right_hand);
  const lHandItem = getItem(equip.left_hand);
  
  let finalMeleeDmg = derived.meleeDamageBase || 0; 
  let finalRangedDmg = "N/A";

  const checkWeapon = (item) => {
    if (!item || item.type !== 'weapon' || !item.stats) return;
    if (item.stats.range <= 1 || !item.stats.range) {
      const bonus = derived.meleeDamageBase || 0;
      finalMeleeDmg = `${item.stats.dmg} + ${bonus}`;
    } else {
      finalRangedDmg = item.stats.dmg;
    }
  };

  checkWeapon(rHandItem);
  checkWeapon(lHandItem);

  // --- 5. TRAITS & PERKS ---
  const traitsHtml = (charData.traits || []).map(tID => { const t = getTrait(tID); return `<div style="margin-bottom:5px;">• ${renderWikiLink(t.name, t.description)}</div>`; }).join("");
  const perksHtml = (charData.perks || []).map(pID => { const p = getTrait(pID); return `<div style="margin-bottom:5px;">• ${renderWikiLink(p.name, p.description)}</div>`; }).join("");

  // --- 6. RETURN HTML ---
  return `
    <div class="dashboard-container">
      
      <div class="panel">
        <img src="${charData.avatar_url || 'https://placehold.co/200x200/333/white?text=NO+IMG'}" class="char-portrait">
        
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--pip-green); padding:5px; margin:-10px -10px 10px -10px;">
           <h2 style="margin:0; background:none; color:black;">${charData.name}</h2>
           <span style="color:black; font-weight:bold; font-size:18px;">LVL ${charData.level || 1}</span>
        </div>

        <div style="margin-bottom:15px;">
           <label>HP STATUS</label>
           <div style="background:#330000; height:20px; border:1px solid red; margin-top:5px;"><div style="width:${(charData.hp.current / charData.hp.max) * 100}%; background:red; height:100%;"></div></div>
           <div style="text-align:right;">${charData.hp.current} / ${charData.hp.max}</div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px dashed var(--pip-dim); padding-bottom:5px;">
           <span>VAULT POINTS</span>
           <span style="color:cyan;">${charData.vault_points || 0}</span>
        </div>

        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">S.P.E.C.I.A.L.</h3>
        ${Object.entries(charData.special).map(([k, v]) => `<div class="special-row"><span>${k.toUpperCase()}</span><span>${v}</span></div>`).join("")}
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">TRAITS</h3>
        ${traitsHtml || "> NONE"}
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">PERKS</h3>
        ${perksHtml || "> NONE"}
      </div>
      
      <div class="panel">
        <h2>COMBAT STATS</h2>
         <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
          <div style="border:1px solid #333; padding:5px; text-align:center;"><small>AC</small><br><strong style="font-size:24px;">${derived.armorClass}</strong></div>
          <div style="border:1px solid #333; padding:5px; text-align:center;"><small>SEQ</small><br><strong style="font-size:24px;">${derived.sequenceBonus}</strong></div>
        </div>
        <h2>SKILLS</h2>
        <div style="flex-grow:1; overflow-y:scroll;">${skillsHtml}</div>
      </div>
      
      <div class="panel">
        <h2>EQUIPPED GEAR</h2>
        <div class="equipment-grid">${renderSlot("HEAD", "head")}${renderSlot("BODY", "body")}${renderSlot("R. HAND", "right_hand")}${renderSlot("L. HAND", "left_hand")}</div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; border-top:1px solid #333; padding-top:10px;">
          <div style="text-align:center;">
             <small style="color:#aaa;">MELEE DMG</small><br>
             <span style="font-size:18px; color:var(--pip-green);">${finalMeleeDmg}</span>
          </div>
          <div style="text-align:center;">
             <small style="color:#aaa;">RANGED DMG</small><br>
             <span style="font-size:18px; color:var(--pip-green);">${finalRangedDmg}</span>
          </div>
        </div>

        <h2 style="margin-top:20px;">WALLET</h2>
        <div style="margin-bottom:20px;">
           ${walletHtml || "<small style='color:#555;'>EMPTY</small>"}
        </div>

        <h2>INVENTORY</h2>
        <div style="overflow-y:auto; flex-grow:1;">${inventoryHtml}</div>
      </div>
    </div>
  `;
}

// --- GM SCREEN ---
export function renderGMScreen(liveData) {
  const chars = liveData.characters || {};
  const accessCodes = liveData.access_codes || {};

  const itemOptions = Object.values(itemDatabase)
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(item => `<option value="${item.id}">${item.name} (${item.type})</option>`)
    .join('');

  const squadHtml = Object.entries(chars).map(([id, char]) => {
    const hpPercent = (char.hp.current / char.hp.max) * 100;
    const vp = char.vault_points || 0;
    
    return `
      <div class="gm-char-card" onclick="window.openGMModal('${id}')" style="cursor:pointer;">
        <img src="${char.avatar_url}" class="gm-avatar">
        <div style="flex-grow:1;">
          <div style="display:flex; justify-content:space-between;">
             <strong style="color:var(--pip-green);">${char.name}</strong>
             <span style="color:var(--pip-gold); font-size:12px;">LVL ${char.level || 1}</span>
          </div>
          <div class="hp-bar-container"><div class="hp-fill" style="width:${hpPercent}%"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:12px;">
             <span>HP: ${char.hp.current}/${char.hp.max}</span>
             <span style="color:cyan;">VP: ${vp}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  const codesHtml = Object.entries(accessCodes).map(([code, data]) => {
    return `<div><small style="color:var(--pip-gold);">${code}</small>: ${data.role} (${data.linked_char || '-'})</div>`;
  }).join('');

  const modalHtml = `
    <div id="gm-modal" class="hidden" style="position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:2000; display:flex; justify-content:center; align-items:center;">
      <div class="panel" style="width:400px; border:2px solid red; background:#110000; height:auto; overflow:visible;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid red; margin-bottom:10px;">
          <h2 style="background:none; color:red; margin:0;" id="gm-modal-title">MANAGING TARGET</h2>
          <button onclick="document.getElementById('gm-modal').classList.add('hidden')" style="background:red; color:white; border:none; cursor:pointer;">[CLOSE]</button>
        </div>
        
        <h4 style="color:red; border-bottom:1px dashed red;">VITALS</h4>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
         <button class="gm-btn" onclick="window.gmAdjustHP(-1)">-1 HP</button>
		 <button class="gm-btn" onclick="window.gmAdjustHP(1)">+1 HP</button>
          <button class="gm-btn" onclick="window.gmAdjustHP(999)">FULL HEAL</button>
        </div>

        <h4 style="color:cyan; border-bottom:1px dashed cyan;">REWARDS</h4>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <button class="gm-btn" style="border-color:cyan; color:cyan;" onclick="window.gmAdjustVaultPoints(1)">+1 VP</button>
          <button class="gm-btn" style="border-color:cyan; color:cyan;" onclick="window.gmAdjustVaultPoints(-1)">-1 VP</button>
          <button class="gm-btn" style="border-color:gold; color:gold;" onclick="window.gmGrantLevel()">GRANT LEVEL UP</button>
        </div>

        <h4 style="color:lime; border-bottom:1px dashed lime;">INVENTORY</h4>
        <div style="display:flex; gap:5px;">
          <select id="gmItemSelect" style="flex-grow:1; background:black; color:lime; border:1px solid lime; font-family:'VT323';">
            ${itemOptions}
          </select>
          <button class="gm-btn" style="border-color:lime; color:lime;" onclick="window.gmGrantItem()">GRANT</button>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="dashboard-container" style="grid-template-columns: 400px 300px; justify-content: center;">
      ${modalHtml} 
      
      <div class="panel">
        <h2 style="color:var(--pip-gold);">>> GAMEMASTER DASHBOARD</h2>
        <h3>SQUAD MONITOR</h3>
        <p style="font-size:12px; color:#666;">(CLICK CARD TO MANAGE)</p>
        <div class="gm-grid">${squadHtml}</div>
      </div>
      
      <div class="panel">
        <h3>ACCESS CONTROL</h3>
        <div style="margin-bottom:10px; border:1px solid #333; padding:10px; background:rgba(0,0,0,0.5);">
          <small>GRANT NEW ACCESS</small>
          <input type="text" id="newCode" placeholder="CODE" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <input type="text" id="newCharName" placeholder="CHAR ID" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <button style="width:100%; cursor:pointer; background:var(--pip-green); color:black; font-weight:bold;" onclick="window.createAccessCode()">AUTHORIZE</button>
        </div>
        <div style="height:200px; overflow-y:auto; border-top:1px solid #333; padding-top:10px;">
          ${codesHtml}
        </div>
      </div>
    </div>
  `;
}

