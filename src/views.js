// src/views.js
import { calculateDerivedStats, RACE_RULES } from './formulas.js';
import { getItem, itemDatabase } from './items.js';
import { getTrait, traitDatabase } from './traits.js';
import { statusEffectDatabase } from './statusEffects.js';

// --- HELPERS ---
export function renderWikiLink(name, description) {
  if (!description) description = "No data available.";
  const safeDesc = description.replace(/"/g, "&quot;").replace(/'/g, "\\'");
  return `<span class="wiki-link"
          onmouseover="window.showTooltip('${safeDesc}', event)"
          onmouseout="window.hideTooltip()"
          onclick="window.toggleTooltip('${safeDesc}', event)">
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

// --- REGISTRATION SCREEN (The G.O.A.T. Exam) ---
export function getRegistrationView(charId, liveData) {
  const char = liveData.characters[charId];
  // Initialize Draft if missing
  const draft = window.creationDraft || {
    race: "human",
    special: { str: 5, per: 5, end: 5, cha: 5, int: 5, agi: 5, luk: 5 },
    tags: []
  };
  window.creationDraft = draft; 

  // Data Prep
  const TOTAL_POINTS = 40; 
  const currentSpent = Object.values(draft.special).reduce((a, b) => a + b, 0);
  const remaining = TOTAL_POINTS - currentSpent;
  const raceDef = RACE_RULES[draft.race] || RACE_RULES['human'];
  
  // Render Special Rows
  const renderRow = (stat, label) => {
    const val = draft.special[stat];
    const min = raceDef.min[stat];
    const max = raceDef.max[stat];
    
    const canMinus = val > min ? '' : 'disabled style="opacity:0.3"';
    const canPlus = (val < max && remaining > 0) ? '' : 'disabled style="opacity:0.3"';

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px dashed #333; padding:5px;">
        <span style="width:50px; font-weight:bold; color:var(--pip-dim);">${label}</span>
        <div style="display:flex; align-items:center; gap:10px;">
          <button ${canMinus} onclick="window.adjustCreationStat('${stat}', -1)">[-]</button>
          <span style="color:${val >= 10 ? 'gold' : 'var(--pip-green)'}; width:30px; text-align:center;">${val}</span>
          <button ${canPlus} onclick="window.adjustCreationStat('${stat}', 1)">[+]</button>
        </div>
        <span style="font-size:10px; color:#555; width:60px; text-align:right;">MIN ${min} / MAX ${max}</span>
      </div>
    `;
  };

  // Render Skills
  const allSkills = ["small_guns", "big_guns", "energy_weapons", "melee_weapons", "unarmed", "throwing", "medicine", "science", "lockpick", "sneak", "speech", "survival"];
  const skillGrid = allSkills.map(skill => {
    const isSelected = draft.tags.includes(skill);
    const style = isSelected ? "border-color:cyan; color:cyan; background:rgba(0,255,255,0.1);" : "border-color:#333; color:#555;";
    const disabled = (!isSelected && draft.tags.length >= 3) ? "opacity:0.3; pointer-events:none;" : "";
    return `<div onclick="window.toggleCreationTag('${skill}')" style="border:1px solid; padding:5px; cursor:pointer; text-transform:uppercase; font-size:12px; text-align:center; ${style} ${disabled}">${skill.replace('_', ' ')}</div>`;
  }).join("");

  return `
    <div class="dashboard-container" style="display:block; max-width:600px; margin:0 auto; padding-top:20px;">
      <div class="panel" style="border:2px solid var(--pip-green); box-shadow:0 0 15px rgba(50,255,50,0.1);">
        <h1 style="text-align:center; background:var(--pip-green); color:black; margin:-10px -10px 20px -10px;">G.O.A.T. REGISTRATION</h1>
        
        <div style="display:flex; gap:20px; margin-bottom:20px;">
          <img src="${char.avatar_url}" style="width:100px; height:100px; border:1px solid var(--pip-green);">
          <div style="flex-grow:1;">
            <h2 style="margin:0; color:white;">IDENTITY: ${char.name}</h2>
            <div style="margin-top:10px;">
              <label>GENETIC STRAIN (RACE):</label><br>
              <select onchange="window.setCreationRace(this.value)" style="background:black; color:lime; border:1px solid lime; font-family:'VT323'; font-size:18px; width:100%;">
                ${Object.keys(RACE_RULES).map(r => `<option value="${r}" ${draft.race === r ? 'selected' : ''}>${RACE_RULES[r].name.toUpperCase()}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div style="background:rgba(0,50,0,0.2); padding:10px; border:1px solid var(--pip-dim); margin-bottom:20px; font-size:14px; color:#aaa;">
           ${raceDef.description}
        </div>

        <div style="background:rgba(0,0,0,0.5); padding:10px; border:1px solid #333; margin-bottom:20px;">
          <div style="text-align:center; margin-bottom:10px;">
            POINTS POOL: <span style="font-size:24px; color:${remaining === 0 ? 'lime' : 'yellow'};">${remaining}</span>
          </div>
          ${renderRow('str', 'STR')} ${renderRow('per', 'PER')} ${renderRow('end', 'END')}
          ${renderRow('cha', 'CHA')} ${renderRow('int', 'INT')} ${renderRow('agi', 'AGI')} ${renderRow('luk', 'LUK')}
        </div>

        <h3 style="border-bottom:1px solid var(--pip-dim);">TAG SKILLS (${draft.tags.length}/3)</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-bottom:20px;">${skillGrid}</div>

        <button onclick="window.finalizeCharacter()" 
          style="width:100%; padding:15px; font-size:24px; background:${(remaining === 0 && draft.tags.length === 3) ? 'var(--pip-green)' : '#333'}; color:black; font-family:'VT323'; border:none; cursor:pointer;"
          ${(remaining === 0 && draft.tags.length === 3) ? '' : 'disabled'}>
          ${(remaining === 0 && draft.tags.length === 3) ? 'PRINT IDENTITY CARD' : 'INCOMPLETE DATA'}
        </button>
      </div>
    </div>
  `;
}

// --- G.O.A.T. REVIEW (read-only look back at creation choices) ---
export function getGoatReviewView(charId, liveData) {
  const char = liveData.characters[charId];
  if (!char) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const raceDef = RACE_RULES[char.race] || RACE_RULES['human'];
  const tags = Object.keys(char.tags || {});

  const specialRows = Object.entries(char.special || {})
    .map(([k, v]) => `<div class="special-row"><span>${k.toUpperCase()}</span><span>${v}</span></div>`)
    .join('');

  const tagsHtml = tags.length > 0
    ? tags.map(t => `<div style="border:1px solid cyan; color:cyan; padding:5px; text-align:center; text-transform:uppercase; font-size:12px;">${t.replace(/_/g, ' ')}</div>`).join('')
    : '<span style="color:#555;">NONE RECORDED</span>';

  return `
    <div class="dashboard-container" style="display:block; max-width:600px; margin:0 auto; padding-top:20px;">
      <div class="panel" style="border:2px solid var(--pip-green); box-shadow:0 0 15px rgba(50,255,50,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--pip-green); margin:-10px -10px 20px -10px; padding:10px;">
          <h1 style="margin:0; color:black;">IDENTITY CARD</h1>
          <button onclick="window.switchTab('STATUS')" style="background:black; color:lime; border:1px solid black; cursor:pointer;">BACK</button>
        </div>

        <div style="display:flex; gap:20px; margin-bottom:20px;">
          <img src="${char.avatar_url}" style="width:100px; height:100px; border:1px solid var(--pip-green);">
          <div>
            <h2 style="margin:0; color:white;">${char.name}</h2>
            <p style="color:var(--pip-dim); margin:5px 0 0;">${raceDef.name.toUpperCase()}</p>
          </div>
        </div>

        <div style="background:rgba(0,50,0,0.2); padding:10px; border:1px solid var(--pip-dim); margin-bottom:20px; font-size:14px; color:#aaa;">
          ${raceDef.description}
        </div>

        <h3 style="border-bottom:1px solid var(--pip-dim);">S.P.E.C.I.A.L. AT CREATION</h3>
        ${specialRows}

        <h3 style="border-bottom:1px solid var(--pip-dim); margin-top:20px;">TAG SKILLS</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">${tagsHtml}</div>
      </div>
    </div>
  `;
}

// --- PLAYER SCREEN (The Dashboard) ---
export function getPlayerView(charId, liveData) {
  const charData = liveData.characters[charId];
  if (!charData) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const equip = charData.equipment || { head: null, body: null, right_hand: null, left_hand: null };
  const activeStatusEffects = charData.status_effects || [];

  // PASS RACE + STATUS EFFECTS TO FORMULAS
  const derived = calculateDerivedStats(
    charData.special,
    charData.level || 1,
    charData.traits || [],
    charData.perks || [],
    charData.race || 'human', // Default to human if missing
    activeStatusEffects
  );

  // --- 1. LEVEL UP & PERKS STATE ---
  const availablePoints = charData.skill_points || 0;
  const draft = window.levelUpDraft || { spent: 0, allocation: {} };
  const pointsRemaining = availablePoints - draft.spent;
  const isLeveling = availablePoints > 0;
  
  // Perks Calculation
  const perksOwned = (charData.perks || []).length;
  const perksAvailable = derived.perksAllowed - perksOwned;

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
        controls = `<div style="display:flex; gap:5px;"><button ${minDisabled} onclick="window.adjustSkillDraft('${key}', -1)">[-]</button><button ${maxDisabled} onclick="window.adjustSkillDraft('${key}', 1)">[+]</button></div>`;
      }
      
      const valDisplay = addedValue > 0 ? `<span style="color:cyan;">${totalVal}% (+${addedValue})</span>` : `<span>${totalVal}%</span>`;
      skillsHtml += `<div class="skill-item ${isTagged ? 'tagged' : ''}" style="display:flex; justify-content:space-between; align-items:center;"><span>${key.replace(/_/g, ' ').toUpperCase()}</span><div style="display:flex; gap:10px; align-items:center;">${controls}${valDisplay}</div></div>`;
    });
  }

  // --- 3. INVENTORY & WALLET ---
  let inventoryHtml = "";
  let walletHtml = "";

  if (charData.inventory) {
    const rawInv = charData.inventory.map(itemEntry => {
       const itemId = (typeof itemEntry === 'string') ? itemEntry : itemEntry.id;
       const itemDef = getItem(itemId);
       return { id: itemId, def: itemDef };
    });

    walletHtml = rawInv.filter(i => i.def && i.def.type === 'currency')
      .map(i => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #333; padding:2px 0;">${renderWikiLink(i.def.name, i.def.description)}<span style="color:var(--pip-gold);">x1</span></div>`).join("");

    inventoryHtml = `<ul class="inventory-list">` + rawInv.filter(i => !i.def || i.def.type !== 'currency').map(i => {
        const itemDef = i.def;
        const itemId = i.id;
        if (itemDef) {
          const isEquipped = Object.values(equip).includes(itemId);
          const style = isEquipped ? "opacity: 0.5; border-color: #555;" : "";
          const safeDesc = (itemDef.description || "").replace(/"/g, "&quot;").replace(/'/g, "\\'");
          
          let buttons = "";
          if (!isEquipped) {
            if (itemDef.slot === "hand") buttons = `<button onclick="window.equipItem('${itemId}', 'right_hand')">R</button> <button onclick="window.equipItem('${itemId}', 'left_hand')">L</button>`;
            else if (itemDef.slot === "body") buttons = `<button onclick="window.equipItem('${itemId}', 'body')">EQUIP</button>`;
            else if (itemDef.slot === "head") buttons = `<button onclick="window.equipItem('${itemId}', 'head')">EQUIP</button>`;
          } else { buttons = `<span style="color:var(--pip-green); font-size:10px;">[EQUIPPED]</span>`; }

          return `<li class="inv-card" style="${style}"><img src="${itemDef.icon}" class="inv-icon"><div class="inv-info"><span class="inv-name" style="cursor:help; border-bottom:1px dotted var(--pip-green);" onmouseover="window.showTooltip('${safeDesc}', event)" onmouseout="window.hideTooltip()">${itemDef.name}</span><span class="inv-meta">${itemDef.type.toUpperCase()}</span></div><div class="inv-actions">${buttons}</div></li>`;
        } else { return `<li>${itemId} (DATA SYNC PENDING)</li>`; }
    }).join("") + `</ul>`;
  }

  const renderSlot = (slotName, slotKey) => {
    const itemId = equip[slotKey];
    const itemDef = getItem(itemId);
    if (itemDef) return `<div class="slot-box occupied" onclick="window.unequipItem('${slotKey}')"><small>${slotName}</small><div style="display:flex; align-items:center; gap:5px;"><img src="${itemDef.icon}" style="width:24px; height:24px; border:1px solid var(--pip-green);"><span>${itemDef.name}</span></div></div>`;
    return `<div class="slot-box empty"><small>${slotName}</small><span style="color:#555;">[EMPTY]</span></div>`;
  };

  // --- 4. DAMAGE & WEAPONS ---
  const rHandItem = getItem(equip.right_hand);
  const lHandItem = getItem(equip.left_hand);
  let finalMeleeDmg = derived.meleeDamageBase || 0; 
  let finalRangedDmg = "N/A";

  const checkWeapon = (item) => {
    if (!item || item.type !== 'weapon' || !item.stats) return;
    if (item.stats.range <= 1 || !item.stats.range) {
      const bonus = derived.meleeDamageBase || 0;
      finalMeleeDmg = `${item.stats.dmg} + ${bonus}`;
    } else { finalRangedDmg = item.stats.dmg; }
  };
  checkWeapon(rHandItem);
  checkWeapon(lHandItem);

  // --- 5. TRAITS & PERKS ---
  const traitsHtml = (charData.traits || []).map(tID => { const t = getTrait(tID); return `<div style="margin-bottom:5px;">• ${renderWikiLink(t.name, t.description)}</div>`; }).join("");
  const perksHtml = (charData.perks || []).map(pID => { const p = getTrait(pID); return `<div style="margin-bottom:5px;">• ${renderWikiLink(p.name, p.description)}</div>`; }).join("");
  
  // Perk Alert
  const perkAlert = perksAvailable > 0
    ? `<div style="color:gold; animation: blink 1s infinite; margin-top:5px;">[!] ${perksAvailable} PERK(S) AVAILABLE</div>`
    : "";

  // Perk Selection — the shell works whether the perk library has 0 entries or 50.
  const ownedPerkIds = charData.perks || [];
  const selectablePerks = Object.values(traitDatabase).filter(t => t.type === 'perk' && !ownedPerkIds.includes(t.id));
  const perkSelectionHtml = perksAvailable > 0
    ? (selectablePerks.length > 0
        ? selectablePerks.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid var(--pip-dim); padding:6px 8px; margin-top:6px;">
              ${renderWikiLink(p.name, p.description)}
              <button onclick="window.choosePerk('${p.id}')">TAKE</button>
            </div>`).join('')
        : `<div style="color:#555; font-size:12px; margin-top:5px;">No perks authored yet — ask your GM to add some in Obsidian.</div>`)
    : '';

  // Radiation Bar (New!)
  const rads = charData.rads || 0;
  const radPercent = Math.min(100, (rads / 1000) * 100); // Assume 1000 is death
  let radColor = "yellow";
  if (rads > 400) radColor = "orange";
  if (rads > 800) radColor = "red";

  return `
    <div class="dashboard-container">
      <div class="panel">
        <img src="${charData.avatar_url || 'https://placehold.co/200x200/333/white?text=NO+IMG'}" class="char-portrait">
        
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--pip-green); padding:5px; margin:-10px -10px 10px -10px;">
           <h2 style="margin:0; background:none; color:black;">${charData.name}</h2>
           <span style="color:black; font-weight:bold; font-size:18px;">LVL ${charData.level || 1}</span>
        </div>
        <div style="text-align:right; margin-bottom:10px;">
          <span onclick="window.switchTab('GOAT_REVIEW')" style="cursor:pointer; font-size:11px; color:var(--pip-dim); text-decoration:underline;">[ REVIEW G.O.A.T. RESULTS ]</span>
        </div>

        <div style="margin-bottom:15px;">
           <label>HP STATUS</label>
           <div style="background:#330000; height:20px; border:1px solid red; margin-top:5px;"><div style="width:${(charData.hp.current / charData.hp.max) * 100}%; background:red; height:100%;"></div></div>
           <div style="text-align:right;">${charData.hp.current} / ${charData.hp.max}</div>
        </div>

        <div style="margin-bottom:15px;">
           <label>RADIATION</label>
           <div style="background:#333; height:10px; border:1px solid ${radColor}; margin-top:2px;"><div style="width:${radPercent}%; background:${radColor}; height:100%;"></div></div>
           <div style="text-align:right; font-size:12px; color:${radColor};">${rads} RADS</div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px dashed var(--pip-dim); padding-bottom:5px;">
           <span>VAULT POINTS</span>
           <span style="color:cyan;">${charData.vault_points || 0}</span>
        </div>

        ${activeStatusEffects.length > 0 ? `
        <h3 style="color:orange; border-bottom:1px solid orange; margin-top:20px;">ACTIVE EFFECTS</h3>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
          ${activeStatusEffects.map(fx => renderWikiLink(fx.name.toUpperCase(),
              Object.entries(fx.modifiers || {}).map(([k,v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ') || 'No numeric effect.'
            )).join('')}
        </div>` : ''}

        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">S.P.E.C.I.A.L.</h3>
        ${Object.entries(charData.special).map(([k, v]) => `<div class="special-row"><span>${k.toUpperCase()}</span><span>${v}</span></div>`).join("")}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">TRAITS</h3>
        ${traitsHtml || "> NONE"}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">PERKS</h3>
        ${perksHtml || "> NONE"}
        ${perkAlert}
        ${perkSelectionHtml}
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

        <h4 style="color:#555; border-bottom:1px dashed #333; margin-top:15px; margin-bottom:5px;">IMPLANTS <span style="font-size:11px;">(COMING SOON)</span></h4>
        <div class="equipment-grid">
          ${Array.from({ length: derived.implantLimit || 0 }).map(() =>
            `<div class="slot-box empty" style="opacity:0.4; cursor:not-allowed;" title="Implants aren't installable yet — this slot is reserved for you.">
               <small>LOCKED</small><span style="color:#555;">[IMPLANT]</span>
             </div>`
          ).join('')}
        </div>

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
        <div style="margin-bottom:20px;">${walletHtml || "<small style='color:#555;'>EMPTY</small>"}</div>

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

  const statusEffectOptions = Object.values(statusEffectDatabase)
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(fx => `<option value="${fx.id}">${fx.name}</option>`)
    .join('');

  // Active status effects on the currently-selected GM target, for the modal.
  const targetChar = window.selectedCharId ? chars[window.selectedCharId] : null;
  const activeEffectsHtml = targetChar && (targetChar.status_effects || []).length > 0
    ? targetChar.status_effects.map(fx => `
        <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid #333; padding:4px 8px; margin-bottom:4px;">
          <span>${fx.name}</span>
          <button class="gm-btn" style="border-color:red; color:red; padding:0 6px;" onclick="window.gmRemoveStatusEffect('${fx.id}')">X</button>
        </div>`).join('')
    : `<div style="color:#555; font-size:12px;">No active effects.</div>`;

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

        <h4 style="color:orange; border-bottom:1px dashed orange;">STATUS EFFECTS</h4>
        <div style="margin-bottom:6px;">${activeEffectsHtml}</div>
        <div style="display:flex; gap:5px; margin-bottom:6px;">
          <select id="statusEffectSelect" style="flex-grow:1; background:black; color:orange; border:1px solid orange; font-family:'VT323';"
            onchange="document.getElementById('customEffectFields').style.display = this.value === '__custom__' ? 'flex' : 'none';">
            ${statusEffectOptions}
            <option value="__custom__">— CUSTOM (type your own) —</option>
          </select>
          <button class="gm-btn" style="border-color:orange; color:orange;" onclick="window.gmApplyStatusEffect()">APPLY</button>
        </div>
        <div id="customEffectFields" style="display:${statusEffectOptions ? 'none' : 'flex'}; gap:5px; margin-bottom:10px;">
          <input type="text" id="statusEffectCustomName" placeholder="NAME (e.g. Bleeding)" style="width:40%; background:black; color:orange; border:1px solid #333;">
          <input type="text" id="statusEffectCustomModifiers" placeholder="MODIFIERS e.g. special_end:-2, skill_sneak:-10" style="flex-grow:1; background:black; color:orange; border:1px solid #333;">
        </div>

        <h4 style="color:lime; border-bottom:1px dashed lime;">INVENTORY</h4>
        <div style="display:flex; gap:5px;">
          <select id="gmItemSelect" style="flex-grow:1; background:black; color:lime; border:1px solid lime; font-family:'VT323';">
            ${itemOptions}
          </select>
          <button class="gm-btn" style="border-color:lime; color:lime;" onclick="window.gmGrantItem()">GRANT</button>
        </div>

        <h4 style="color:red; border-bottom:1px dashed red; margin-top:20px;">DANGER ZONE</h4>
        <button class="gm-btn" style="border-color:red; color:white; background:red; width:100%;" onclick="window.gmFactoryReset()">FACTORY RESET CHARACTER</button>

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
          <input type="text" id="newCharName" placeholder="CHAR ID (e.g. iron_legs)" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <input type="text" id="newDisplayName" placeholder="DISPLAY NAME (e.g. Iron Legs) — optional" style="width:100%; margin-bottom:5px; background:black; color:lime; border:1px solid #333;">
          <button style="width:100%; cursor:pointer; background:var(--pip-green); color:black; font-weight:bold;" onclick="window.createAccessCode()">AUTHORIZE</button>
        </div>
        <div style="height:200px; overflow-y:auto; border-top:1px solid #333; padding-top:10px;">
          ${codesHtml}
        </div>
      </div>
    </div>
  `;
}