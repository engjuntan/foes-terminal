// src/views.js
import { calculateDerivedStats, RACE_RULES, getRadiationTier, RAD_THRESHOLDS, CARRY_OVERAGE_ALLOWANCE } from './formulas.js';
import { getItem, itemDatabase } from './items.js';
import { normalizeInventory, getInventoryQuantity } from './inventory.js';
import { SPECIAL_INFO, SKILL_INFO } from './goatContent.js';
import { DIFFICULTY_TIERS } from './checks.js';
import { getTrait, traitDatabase } from './traits.js';
import { statusEffectDatabase } from './statusEffects.js';
import { bestiaryDatabase } from './bestiary.js';
import { BODY_PARTS, BURST_HIT_PENALTY, STANCES } from './combat.js';
import { dataLogDatabase } from './dataLogs.js';
import { questDatabase } from './quests.js';
import { glossaryDatabase } from './glossary.js';
import { mapDatabase } from './maps.js';

// --- HELPERS ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// used/capacity gauge for the carry-weight system — green under
// capacity, yellow in the GM's 10% grace zone (allowed, no penalty,
// just a warning), red at/over the hard-block line (acquiring more
// gets refused there, see CARRY_OVERAGE_ALLOWANCE).
function renderCarryWeightGauge(used, capacity) {
  const hardLimit = capacity * CARRY_OVERAGE_ALLOWANCE;
  const pct = capacity > 0 ? Math.min(100, (used / capacity) * 100) : 0;
  let color = 'var(--pip-green)';
  if (used > capacity) color = 'yellow';
  if (used >= hardLimit) color = 'red';
  return `
    <div style="margin-bottom:20px;">
      <label>CARRY WEIGHT</label>
      <div style="background:#222; height:14px; border:1px solid ${color}; margin-top:5px;"><div style="width:${pct}%; background:${color}; height:100%;"></div></div>
      <div style="text-align:right; font-size:12px; color:${color};">${Math.round(used)} / ${Math.round(capacity)} lbs</div>
    </div>`;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Wraps any glossary term found in already-escaped HTML with the
// app's existing hover/tap tooltip (renderWikiLink — same mechanism
// already used for SPECIAL stats, skills, traits, and item names), so
// Data Log / Quest bodies can surface quick definitions pulled from
// the wiki. Longest-name-first in the alternation so e.g. "The
// Federation" (if authored) wins over a bare "Federation" at the same
// starting position — standard regex alternation already prefers the
// earlier/longer branch when several match at once, so no extra
// overlap-resolution logic is needed. Must run AFTER escapeHtml(),
// never before — matching happens on the final markup, and the
// matched (already-safe) text is what gets handed to renderWikiLink
// as the visible name, so nothing unescaped ever gets inserted.
let glossaryPattern = null;
function getGlossaryPattern() {
  if (glossaryPattern) return glossaryPattern;
  const terms = Object.values(glossaryDatabase).sort((a, b) => b.name.length - a.name.length);
  if (terms.length === 0) return null;
  const alternation = terms.map(t => escapeRegex(t.name)).join('|');
  glossaryPattern = { regex: new RegExp(`\\b(${alternation})\\b`, 'gi'), terms };
  return glossaryPattern;
}
function applyGlossaryTooltips(safeHtml) {
  const pattern = getGlossaryPattern();
  if (!pattern) return safeHtml;
  return safeHtml.replace(pattern.regex, (matchText) => {
    const term = pattern.terms.find(t => t.name.toLowerCase() === matchText.toLowerCase());
    if (!term) return matchText;
    return renderWikiLink(matchText, term.summary);
  });
}

// Builds a nested tree from a flat list of entries carrying a
// category_path array (e.g. Data Logs, folder-derived).
function buildCategoryTree(entries) {
  const root = { children: {}, items: [] };
  entries.forEach(entry => {
    let node = root;
    (entry.category_path || []).forEach(segment => {
      if (!node.children[segment]) node.children[segment] = { children: {}, items: [] };
      node = node.children[segment];
    });
    node.items.push(entry);
  });
  return root;
}

function renderCategoryTree(node, renderItem, depth = 0) {
  let html = '';
  Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b)).forEach(([name, child]) => {
    html += `<div style="margin-left:${depth * 16}px; margin-top:8px;">
      <div style="color:var(--pip-dim); font-weight:bold; text-transform:uppercase; font-size:13px; border-bottom:1px dashed var(--pip-dim); padding-bottom:2px;">${name}</div>
      ${renderCategoryTree(child, renderItem, depth + 1)}
    </div>`;
  });
  node.items.forEach(item => {
    html += `<div style="margin-left:${(depth + 1) * 16}px;">${renderItem(item)}</div>`;
  });
  return html;
}

// Builds a nested tree from a flat list of entries carrying a parent_id
// (e.g. Maps, since image files sit flat in one folder and can't derive
// hierarchy from their location the way Data Logs can).
function buildParentTree(entries) {
  const byId = {};
  entries.forEach(e => { byId[e.id] = { entry: e, children: [] }; });
  const roots = [];
  entries.forEach(e => {
    const node = byId[e.id];
    if (e.parent_id && byId[e.parent_id]) byId[e.parent_id].children.push(node);
    else roots.push(node);
  });
  return roots;
}

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
  if (!char) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND — ASK YOUR GM TO SET UP THIS ACCESS CODE</h1>`;
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
        <span style="width:50px; font-weight:bold; color:var(--pip-dim);">${renderWikiLink(label, SPECIAL_INFO[stat])}</span>
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
    // Hover-only tooltip (not renderWikiLink's onclick variant) — the
    // whole tile's own onclick already toggles the tag, and stacking a
    // second onclick on the text would stopPropagation and silently
    // break tapping to select on mobile. Desktop hover still explains
    // the skill; touch users just don't get a tap-tooltip here, same
    // as before this feature existed.
    const safeDesc = (SKILL_INFO[skill] || '').replace(/"/g, "&quot;").replace(/'/g, "\\'");
    return `<div onclick="window.toggleCreationTag('${skill}')" onmouseover="window.showTooltip('${safeDesc}', event)" onmouseout="window.hideTooltip()" style="border:1px solid; padding:5px; cursor:pointer; text-transform:uppercase; font-size:12px; text-align:center; ${style} ${disabled}">${skill.replace('_', ' ')}</div>`;
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
    .map(([k, v]) => `<div class="special-row"><span>${renderWikiLink(k.toUpperCase(), SPECIAL_INFO[k])}</span><span>${v}</span></div>`)
    .join('');

  const tagsHtml = tags.length > 0
    ? tags.map(t => `<div style="border:1px solid cyan; color:cyan; padding:5px; text-align:center; text-transform:uppercase; font-size:12px;">${renderWikiLink(t.replace(/_/g, ' '), SKILL_INFO[t])}</div>`).join('')
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

        ${char.gm_notes ? `
        <h3 style="border-bottom:1px solid gold; color:gold; margin-top:20px;">NOTES FROM YOUR GM</h3>
        <div style="font-size:14px; color:#ccc; line-height:1.5; white-space:pre-wrap;">${escapeHtml(char.gm_notes)}</div>` : ''}
      </div>
    </div>
  `;
}

// --- COMBAT VIEW ---
export function getCombatView(liveData, userRole, currentUser) {
  const combat = liveData.active_combat;
  if (!combat) return `<h1>> NO COMBAT RECORDED YET</h1>`;

  const isLive = combat.is_active;
  const currentActor = isLive ? combat.initiative_order[combat.turn_index] : null;

  // GM always sees exact HP; players need the "awareness" perk.
  let viewerHasAwareness = userRole === 'gm';
  if (!viewerHasAwareness) {
    const viewerChar = liveData.characters[currentUser];
    viewerHasAwareness = ((viewerChar && viewerChar.perks) || []).includes('awareness');
  }

  // PCs don't carry embedded HP (it stays live-linked to their real
  // character doc so combat never gets out of sync with the dashboard);
  // monster instances carry their own HP directly. Resolve either shape here.
  const resolveHp = (c) => {
    if (c.ref_type === 'pc') {
      const liveChar = liveData.characters[c.char_id];
      return liveChar ? liveChar.hp : { current: 0, max: 1 };
    }
    return c.hp;
  };

  const hpLabel = (c) => {
    if (c.is_down) return 'DOWN';
    const hp = resolveHp(c);
    const pct = (hp.current / hp.max) * 100;
    if (viewerHasAwareness) return `${hp.current}/${hp.max}`;
    if (pct >= 100) return 'HEALTHY';
    if (pct >= 75) return 'BRUISED';
    if (pct >= 50) return 'WOUNDED';
    if (pct >= 25) return 'BADLY WOUNDED';
    if (pct > 0) return 'NEAR DEATH';
    return 'DOWN';
  };

  // PC affliction tags — always visible in red, regardless of Awareness
  // (knowing *something* is wrong with someone is different from knowing
  // their exact HP, which stays gated).
  const afflictionTags = (c) => {
    if (c.ref_type !== 'pc') return '';
    const char = liveData.characters[c.char_id];
    const effects = (char && char.status_effects) || [];
    if (effects.length === 0) return '';
    return `<div style="margin-top:3px;">${effects.map(fx => `
      <span style="color:#ff5555; font-size:11px; border:1px solid #5a2020; padding:1px 5px; margin-right:4px; display:inline-block;">
        ${fx.name.toUpperCase()}${userRole === 'gm' ? `<span onclick="event.stopPropagation(); window.gmRemoveStatusEffectDirect('${c.char_id}', '${fx.id}')" style="cursor:pointer; margin-left:5px; font-weight:bold;" title="Resolve / remove">✕</span>` : ''}
      </span>`).join('')}</div>`;
  };

  // Stance is prominent right next to the name — free-form change, any
  // time, not gated to turn order (the GM governs that verbally). A
  // player can only change their own PC's; the GM can change anyone's,
  // PC or monster.
  const stanceHtml = (c) => {
    const current = (c.ref_type === 'pc' ? (liveData.characters[c.char_id] || {}).stance : c.stance) || 'standing';
    const canEdit = userRole === 'gm' || (c.ref_type === 'pc' && c.char_id === currentUser);
    const colors = { standing: '#666', crouching: 'cyan', prone: 'orange', knocked_down: 'red' };
    if (!canEdit) {
      return `<span style="font-size:11px; color:${colors[current]}; border:1px solid ${colors[current]}; padding:0 5px;">${STANCES[current].label.toUpperCase()}</span>`;
    }
    const options = Object.entries(STANCES).map(([key, s]) => `<option value="${key}" ${current === key ? 'selected' : ''}>${s.label}</option>`).join('');
    return `<select onclick="event.stopPropagation();" onchange="event.stopPropagation(); window.setStance('${c.combatant_id}', this.value)" style="font-size:11px; background:black; color:${colors[current]}; border:1px solid ${colors[current]}; padding:0 2px;">${options}</select>`;
  };

  const initiativeHtml = combat.initiative_order.map((c, idx) => {
    const isCurrent = isLive && idx === combat.turn_index;
    const hp = resolveHp(c);
    const pct = c.is_down ? 0 : (hp.current / hp.max) * 100;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; margin-bottom:4px; border:1px solid ${isCurrent ? 'var(--pip-green)' : '#333'}; background:${isCurrent ? 'rgba(51,255,51,0.1)' : 'transparent'};">
        <div>
          <strong style="color:${c.ref_type === 'pc' ? 'cyan' : 'red'};">${isCurrent ? '▶ ' : ''}${c.name}</strong>
          ${stanceHtml(c)}
          <div style="font-size:11px; color:#666;">INIT ${c.initiative}</div>
          ${afflictionTags(c)}
        </div>
        <div style="text-align:right;">
          <div class="hp-bar-container" style="width:100px;"><div class="hp-fill" style="width:${pct}%"></div></div>
          <div style="font-size:12px;">${hpLabel(c)}</div>
        </div>
      </div>`;
  }).join('');

  const logHtml = (combat.log || []).slice().reverse().map(entry => `
      <div style="padding:4px 0; border-bottom:1px dashed #222; font-size:13px;">
        <span style="color:#555; font-size:10px;">${new Date(entry.timestamp).toLocaleTimeString()}</span>
        <span style="color:${entry.type === 'system' ? 'gold' : 'var(--pip-green)'};"> ${entry.message}</span>
      </div>`).join('');

  const headerHtml = isLive
    ? `<h2 style="color:red;">⚔ COMBAT — ROUND ${combat.round}</h2>
       <p style="color:var(--pip-dim); font-size:13px;">CURRENT TURN: <strong style="color:var(--pip-green);">${currentActor ? currentActor.name : '—'}</strong></p>`
    : `<h2 style="color:#888;">⚔ COMBAT ENDED</h2>
       <p style="color:var(--pip-dim); font-size:13px;">${combat.summary || 'No summary recorded.'}</p>`;

  // --- Whose turn can THIS viewer act for? GM can always act; a player
  // only during their own PC's turn. One action per turn (no AP economy) —
  // once turn_acted is set, the action panel disappears until End Turn.
  const canActThisTurn = isLive && currentActor && !combat.turn_acted && (
    userRole === 'gm' || (currentActor.ref_type === 'pc' && currentActor.char_id === currentUser)
  );
  const isMyIdleTurn = isLive && currentActor && combat.turn_acted && (
    userRole === 'gm' || (currentActor.ref_type === 'pc' && currentActor.char_id === currentUser)
  );
  const canEndTurn = isLive && (userRole === 'gm' || canActThisTurn || isMyIdleTurn);

  let actionPanelHtml = '';
  if (canActThisTurn) {
    const draft = window.combatActionDraft || {};
    // PC turns target the opposing side only (a player attacking a
    // teammate should go through the GM, not be a default option).
    // Monster/NPC turns can target anyone else — chaos, mind control,
    // an animal turning on an ally, etc.
    const opposingSide = currentActor.ref_type === 'pc' ? 'monster' : 'pc';
    const targetOptions = combat.initiative_order
      .filter(c => c.combatant_id !== currentActor.combatant_id && !c.is_down &&
        (currentActor.ref_type === 'monster' || c.ref_type === opposingSide))
      .map(c => `<option value="${c.combatant_id}" ${draft.targetId === c.combatant_id ? 'selected' : ''}>${c.name}</option>`).join('');

    let attackOptions = '';
    if (currentActor.ref_type === 'monster') {
      attackOptions = (currentActor.attacks || [])
        .map(a => `<option value="${a.name}" ${draft.attackKey === a.name ? 'selected' : ''}>${a.name} (${a.hit_percent}% · ${a.damage})</option>`).join('');
    } else {
      const char = liveData.characters[currentActor.char_id];
      const equip = (char && char.equipment) || {};
      const ammo = (char && char.ammo) || {};
      const seen = new Set();
      const weaponOpts = [equip.right_hand, equip.left_hand].filter(Boolean).map(itemId => {
        if (seen.has(itemId)) return '';
        seen.add(itemId);
        const item = getItem(itemId);
        if (!item) return '';
        const slot = equip.right_hand === itemId ? 'right_hand' : 'left_hand';
        const itemClipSize = item.stats && item.stats.clip_size;
        const ammoTag = itemClipSize ? ` (${ammo[slot] ?? itemClipSize}/${itemClipSize} ammo)` : '';
        return `<option value="${itemId}" ${draft.attackKey === itemId ? 'selected' : ''}>${item.name}${ammoTag}</option>`;
      }).join('');
      attackOptions = `<option value="unarmed" ${!draft.attackKey || draft.attackKey === 'unarmed' ? 'selected' : ''}>Unarmed</option>${weaponOpts}`;
    }

    // Ammo/burst — a simplified stand-in for the manual's full multi-roll
    // burst system (agreed with the user): one roll at a flat hit%
    // penalty, roughly double damage, costs the weapon's burst_shots in
    // ammo instead of 1. PC-only (matches resolveAttack() — monster
    // attacks are hand-authored in the bestiary and don't carry ammo).
    let ammoHtml = '';
    let burstSelected = false;
    let equippedWeaponItem = null, equippedWeaponSlot = null;
    if (currentActor.ref_type === 'pc' && draft.attackKey && draft.attackKey !== 'unarmed') {
      const char = liveData.characters[currentActor.char_id];
      const equip = (char && char.equipment) || {};
      equippedWeaponItem = getItem(draft.attackKey);
      equippedWeaponSlot = equip.right_hand === draft.attackKey ? 'right_hand' : equip.left_hand === draft.attackKey ? 'left_hand' : null;
      // ammo_type/clip_size/burst_shots all live under the weapon's
      // `stats` block, alongside dmg/range/dmgType.
      const equippedStats = (equippedWeaponItem && equippedWeaponItem.stats) || {};
      if (equippedWeaponItem && equippedStats.clip_size && equippedWeaponSlot) {
        const currentAmmo = ((char.ammo || {})[equippedWeaponSlot]) ?? equippedStats.clip_size;
        burstSelected = !!(draft.burst && equippedStats.burst_shots);
        const burstOption = equippedStats.burst_shots ? `
          <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:6px;">
            <input type="checkbox" ${burstSelected ? 'checked' : ''} onchange="window.setCombatActionField('burst', this.checked)">
            🔥 BURST FIRE (-${BURST_HIT_PENALTY}% hit, ~2x damage, uses ${equippedStats.burst_shots} ammo)
          </label>` : '';
        // Spare-rounds count only applies to weapons authored with an
        // ammo_type — a weapon without one reloads for free (no real
        // inventory ammo item to track), same as before this feature.
        const spareTag = equippedStats.ammo_type
          ? ` <span style="color:#666;">(spare: ${Object.keys(normalizeInventory(char.inventory)).filter(id => { const d = getItem(id); return d && d.type === 'ammo' && d.ammo_type === equippedStats.ammo_type; }).reduce((sum, id) => sum + getInventoryQuantity(char.inventory, id), 0)})</span>`
          : '';
        ammoHtml = `
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#888; margin-bottom:6px;">
            <span>Ammo: <span style="color:var(--pip-green);">${currentAmmo}/${equippedStats.clip_size}</span>${spareTag}</span>
            <button class="gm-btn" style="padding:2px 8px; font-size:10px;" onclick="window.reloadWeapon('${currentActor.char_id}', '${equippedWeaponSlot}')">RELOAD</button>
          </div>
          ${burstOption}`;
      }
    }

    // Aimed shots (VATS-style targeted shot) — attacker-agnostic, same as
    // resolveAttack(): torso is just the normal attack, always available,
    // 0 penalty. Works for a PC's turn OR a GM-controlled monster's turn
    // (a called shot works the same regardless of who's pulling the
    // trigger — this is also what makes the Blinded/Crippled effects
    // reachable at all, since PCs can only target monsters and monsters
    // don't carry status effects).
    let bodyPartHtml = '';
    {
      const selectedPart = draft.bodyPart || 'torso';
      const bodyPartOptions = Object.entries(BODY_PARTS)
        .map(([key, part]) => `<option value="${key}" ${selectedPart === key ? 'selected' : ''}>${part.label}${part.penalty ? ` (-${part.penalty}%)` : ''}</option>`).join('');

      // Live hit% preview — replicates the same effectiveChance math used
      // in resolveAttack() (combat.js resolveHit: max(0, skill - penalty - AC)),
      // recomputed here at render time so it updates as target/attack/part change.
      let previewHtml = '';
      const target = combat.initiative_order.find(c => c.combatant_id === draft.targetId);
      if (target) {
        let attackerValue = null;
        if (currentActor.ref_type === 'monster') {
          const attackDef = (currentActor.attacks || []).find(a => a.name === draft.attackKey);
          if (attackDef) attackerValue = attackDef.hit_percent;
        } else {
          const char = liveData.characters[currentActor.char_id];
          const derived = calculateDerivedStats(char.special, char.level || 1, char.traits || [], char.perks || [], char.race || 'human', char.status_effects || [], char.equipment || {}, char.rads || 0);
          if (!draft.attackKey || draft.attackKey === 'unarmed') {
            attackerValue = derived.skills.unarmed;
          } else {
            const weaponItem = getItem(draft.attackKey);
            if (weaponItem) {
              const isMelee = !weaponItem.stats || (weaponItem.stats.range || 0) <= 1;
              const skillKey = weaponItem.skill || (isMelee ? 'melee_weapons' : 'small_guns');
              attackerValue = derived.skills[skillKey] ?? 0;
            }
          }
        }
        let targetAC = null;
        if (target.ref_type === 'monster') {
          targetAC = target.ac;
        } else {
          const targetChar = liveData.characters[target.char_id];
          const targetDerived = calculateDerivedStats(targetChar.special, targetChar.level || 1, targetChar.traits || [], targetChar.perks || [], targetChar.race || 'human', targetChar.status_effects || [], targetChar.equipment || {}, targetChar.rads || 0);
          targetAC = targetDerived.armorClass;
        }
        if (attackerValue !== null && targetAC !== null) {
          const part = BODY_PARTS[selectedPart] || BODY_PARTS.torso;
          const chance = Math.max(0, attackerValue - part.penalty - (burstSelected ? BURST_HIT_PENALTY : 0) - targetAC);
          previewHtml = `<div style="font-size:11px; color:#888; margin-bottom:6px;">Hit chance vs ${target.name}: <span style="color:var(--pip-green); font-weight:bold;">${chance}%</span></div>`;
        }
      }

      bodyPartHtml = `
        <label style="font-size:11px; color:#666;">AIMED SHOT (optional — defaults to Torso)</label>
        <select onchange="window.setCombatActionField('bodyPart', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;">
          ${bodyPartOptions}
        </select>
        ${previewHtml}`;
    }

    actionPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:var(--pip-green); margin-top:0;">${currentActor.name}'S TURN</h3>
        <label style="font-size:11px; color:#666;">TARGET</label>
        <select onchange="window.setCombatActionField('targetId', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          <option value="">— choose —</option>${targetOptions}
        </select>
        <label style="font-size:11px; color:#666;">ATTACK</label>
        <select onchange="window.setCombatActionField('attackKey', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          <option value="">— choose —</option>${attackOptions}
        </select>
        ${ammoHtml}
        ${bodyPartHtml}
        <label style="font-size:11px; color:#666;">ROLL (1-100)</label>
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="number" id="combatRollInput" min="1" max="100" value="${draft.roll ?? ''}" oninput="window.setCombatActionField('roll', this.value)" style="flex-grow:1; background:black; color:lime; border:1px solid #333;">
          ${currentActor.ref_type === 'pc' ? `<button class="gm-btn" onclick="window.rollForMe()">🎲 ROLL</button>` : ''}
        </div>
        <button style="width:100%; padding:10px; background:var(--pip-green); color:black; font-weight:bold; border:none; cursor:pointer; margin-bottom:6px;" onclick="window.resolveAttack()">RESOLVE ATTACK</button>
        <button style="width:100%; padding:6px; background:#333; color:#aaa; border:none; cursor:pointer;" onclick="window.passTurn()">PASS</button>
      </div>`;
  } else if (isMyIdleTurn) {
    actionPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:var(--pip-dim); margin-top:0;">${currentActor.name}'S TURN</h3>
        <p style="color:#888; font-size:13px;">Action taken this turn. Click END TURN when ready to move on.</p>
      </div>`;
  }

  const bestiaryQuickOptions = Object.values(bestiaryDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  const addCombatantHtml = isLive && userRole === 'gm' ? `
    <div class="panel" style="margin-bottom:15px;">
      <h4 style="color:orange; margin-top:0;">ADD COMBATANT</h4>
      <div style="display:flex; gap:6px;">
        <select id="midFightMonsterSelect" style="flex-grow:1; background:black; color:orange; border:1px solid orange;">${bestiaryQuickOptions}</select>
        <button class="gm-btn" style="border-color:orange; color:orange;" onclick="window.addCombatantMidFight(document.getElementById('midFightMonsterSelect').value)">ADD</button>
      </div>
    </div>` : '';

  const hpTargetOptions = isLive ? combat.initiative_order
    .map(c => `<option value="${c.combatant_id}">${c.name}${c.is_down ? ' (DOWN)' : ''}</option>`).join('') : '';
  const itemPickOptions = `<option value="">— none, just typing a reason —</option>${Object.values(itemDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(item => `<option value="${item.name}">${item.name}</option>`).join('')}`;
  const adjustHpHtml = isLive && userRole === 'gm' ? `
    <div class="panel" style="margin-bottom:15px;">
      <h4 style="color:lime; margin-top:0;">ADJUST HP / USE ITEM</h4>
      <label style="font-size:11px; color:#666;">ON</label>
      <select id="hpAdjustTarget" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;">${hpTargetOptions}</select>
      <label style="font-size:11px; color:#666;">ITEM USED (optional, fills reason)</label>
      <select id="hpAdjustItem" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;"
        onchange="if (this.value) document.getElementById('hpAdjustReason').value = 'Used ' + this.value;">${itemPickOptions}</select>
      <label style="font-size:11px; color:#666;">REASON (for the combat log)</label>
      <input type="text" id="hpAdjustReason" placeholder="e.g. Used Stimpak" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:6px;">
      <label style="font-size:11px; color:#666;">HP CHANGE (+ or -)</label>
      <input type="number" id="hpAdjustDelta" placeholder="-5 or 10" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
      <button class="gm-btn" style="width:100%; border-color:lime; color:lime;" onclick="window.gmAdjustCombatantHP(document.getElementById('hpAdjustTarget').value, Number(document.getElementById('hpAdjustDelta').value), document.getElementById('hpAdjustReason').value)">APPLY</button>
    </div>` : '';

  const pcTargetOptions = combat.initiative_order
    .filter(c => c.ref_type === 'pc')
    .map(c => `<option value="${c.char_id}">${c.name}</option>`).join('');
  const combatEffectOptions = Object.values(statusEffectDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(fx => `<option value="${fx.id}">${fx.name}</option>`).join('');
  const afflictPcHtml = isLive && userRole === 'gm' ? `
    <div class="panel" style="margin-bottom:15px;">
      <h4 style="color:#ff5555; margin-top:0;">AFFLICT PC</h4>
      <select id="combatEffectTargetSelect" style="width:100%; background:black; color:#ff5555; border:1px solid #ff5555; margin-bottom:6px;">
        <option value="">— choose PC —</option>${pcTargetOptions}
      </select>
      <select id="combatEffectSelect" style="width:100%; background:black; color:#ff5555; border:1px solid #ff5555; margin-bottom:6px;"
        onchange="document.getElementById('combatEffectCustomFields').style.display = this.value === '__custom__' ? 'flex' : 'none';">
        ${combatEffectOptions}
        <option value="__custom__">— CUSTOM (type your own) —</option>
      </select>
      <div id="combatEffectCustomFields" style="display:${combatEffectOptions ? 'none' : 'flex'}; flex-direction:column; gap:6px; margin-bottom:6px;">
        <input type="text" id="combatEffectCustomName" placeholder="NAME (e.g. Bleeding)" style="background:black; color:#ff5555; border:1px solid #333;">
        <input type="text" id="combatEffectCustomModifiers" placeholder="MODIFIERS e.g. special_end:-2" style="background:black; color:#ff5555; border:1px solid #333;">
      </div>
      <button class="gm-btn" style="width:100%; border-color:#ff5555; color:#ff5555;" onclick="window.gmApplyStatusEffectInCombat()">APPLY</button>
    </div>` : '';

  return `
    <div class="dashboard-container" style="grid-template-columns: 320px 320px 1fr; justify-content:center;">
      <div class="panel">
        ${headerHtml}
        <div style="margin-top:15px;">${initiativeHtml}</div>
        ${canEndTurn ? `<button style="width:100%; margin-top:15px; padding:10px; background:var(--pip-dim); color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.endTurn()">END TURN</button>` : ''}
        ${isLive && userRole === 'gm' ? `<button style="width:100%; margin-top:8px; padding:10px; background:red; color:white; border:none; cursor:pointer;" onclick="window.endCombat()">END COMBAT</button>` : ''}
        <button style="width:100%; margin-top:8px; padding:8px; background:#333; color:var(--pip-green); border:none; cursor:pointer;" onclick="window.switchTab('STATUS')">BACK TO DASHBOARD</button>
      </div>
      <div>
        ${actionPanelHtml}
        ${afflictPcHtml}
        ${adjustHpHtml}
        ${addCombatantHtml}
        ${!actionPanelHtml && !afflictPcHtml && !adjustHpHtml && !addCombatantHtml ? `<div class="panel" style="color:#555; font-size:13px;">${isLive ? "Waiting on this combatant's turn." : 'Combat has ended.'}</div>` : ''}
      </div>
      <div class="panel">
        <h2>COMBAT LOG</h2>
        <div style="max-height:500px; overflow-y:auto;">${logHtml || '<span style="color:#555;">No events yet.</span>'}</div>
      </div>
    </div>
  `;
}

// --- DIFFICULTY CHECKS ---
const SPECIAL_KEYS = ['str', 'per', 'end', 'cha', 'int', 'agi', 'luk'];
const SKILL_KEYS = Object.keys(SKILL_INFO);

function buildWhatOptions(selectedKind, selectedKey) {
  const specialOpts = SPECIAL_KEYS.map(k => `<option value="special:${k}" ${selectedKind === 'special' && selectedKey === k ? 'selected' : ''}>${k.toUpperCase()}</option>`).join('');
  const skillOpts = SKILL_KEYS.map(k => `<option value="skill:${k}" ${selectedKind === 'skill' && selectedKey === k ? 'selected' : ''}>${k.replace(/_/g, ' ').toUpperCase()}</option>`).join('');
  return `<optgroup label="SPECIAL">${specialOpts}</optgroup><optgroup label="SKILLS">${skillOpts}</optgroup>`;
}

function buildTierOptions(selectedTier) {
  return Object.entries(DIFFICULTY_TIERS).map(([key, tier]) =>
    `<option value="${key}" ${selectedTier === key ? 'selected' : ''}>${tier.label}${tier.skillMod ? ` (${tier.specialMod}/${tier.skillMod})` : ''}</option>`
  ).join('');
}

function formatCheckResultLine(r) {
  const critTag = r.critType === 'success' ? ' <span style="color:gold;">CRITICAL!</span>' : r.critType === 'fail' ? ' <span style="color:red;">CRITICAL FAIL!</span>' : '';
  return `<span style="color:${r.success ? 'var(--pip-green)' : '#d4574a'};">${r.success ? 'SUCCESS' : 'FAILURE'}</span>${critTag} <span style="color:#666; font-size:11px;">(rolled ${r.roll} vs ${r.threshold})</span>`;
}

export function getChecksView(liveData, userRole, currentUser) {
  const checks = liveData.checks || [];
  const chars = liveData.characters || {};

  let playerPanelHtml = '';
  if (userRole === 'player') {
    const draft = window.playerCheckDraft || { kind: 'special', key: 'str', tier: 'normal', useD20: false, roll: '' };
    window.playerCheckDraft = draft;
    const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
    playerPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:var(--pip-green); margin-top:0;">ROLL A CHECK</h3>
        <label style="font-size:11px; color:#666;">WHAT</label>
        <select onchange="window.setPlayerCheckWhat(this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          ${buildWhatOptions(draft.kind, draft.key)}
        </select>
        <label style="font-size:11px; color:#666;">DIFFICULTY (as called by your GM)</label>
        <select onchange="window.setPlayerCheckField('tier', this.value)" style="width:100%; background:black; color:lime; border:1px solid #333; margin-bottom:8px;">
          ${buildTierOptions(draft.tier)}
        </select>
        ${draft.kind === 'special' ? `
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <input type="checkbox" ${draft.useD20 ? 'checked' : ''} onchange="window.setPlayerCheckField('useD20', this.checked)">
          Especially difficult task — roll 1d20 instead of 1d10
        </label>` : ''}
        <label style="font-size:11px; color:#666;">ROLL (1-${maxRoll})</label>
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="number" id="playerCheckRollInput" min="1" max="${maxRoll}" value="${draft.roll ?? ''}" oninput="window.setPlayerCheckField('roll', this.value)" style="flex-grow:1; background:black; color:lime; border:1px solid #333;">
          <button class="gm-btn" onclick="window.rollForPlayerCheck()">🎲 ROLL</button>
        </div>
        <button style="width:100%; padding:10px; background:var(--pip-green); color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.resolvePlayerCheck()">RESOLVE CHECK</button>
      </div>`;
  }

  let gmPanelHtml = '';
  if (userRole === 'gm') {
    const draft = window.gmCheckDraft || { scope: 'single', targetCharId: '', kind: 'special', key: 'str', tier: 'normal', useD20: false, reveal: true, customName: '', customValue: '', roll: '' };
    window.gmCheckDraft = draft;
    const maxRoll = draft.kind === 'special' ? (draft.useD20 ? 20 : 10) : 100;
    const charOptions = Object.entries(chars).filter(([, c]) => c.is_finalized)
      .map(([id, c]) => `<option value="${id}" ${draft.targetCharId === id ? 'selected' : ''}>${c.name}</option>`).join('');

    gmPanelHtml = `
      <div class="panel" style="margin-bottom:15px;">
        <h3 style="color:orange; margin-top:0;">GM: ROLL A CHECK</h3>
        <label style="font-size:11px; color:#666;">TARGET</label>
        <select onchange="window.setGmCheckField('scope', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          <option value="single" ${draft.scope === 'single' ? 'selected' : ''}>SINGLE CHARACTER</option>
          <option value="party" ${draft.scope === 'party' ? 'selected' : ''}>WHOLE PARTY (each rolls their own)</option>
          <option value="custom" ${draft.scope === 'custom' ? 'selected' : ''}>CUSTOM / NPC</option>
        </select>
        ${draft.scope === 'single' ? `
        <select onchange="window.setGmCheckField('targetCharId', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          <option value="">— choose —</option>${charOptions}
        </select>` : ''}
        ${draft.scope === 'custom' ? `
        <input type="text" placeholder="NAME (e.g. Raider Lookout)" value="${draft.customName || ''}" oninput="window.setGmCheckField('customName', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:6px;">
        <input type="number" placeholder="CHECK VALUE (stat or skill %)" value="${draft.customValue ?? ''}" oninput="window.setGmCheckField('customValue', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">` : ''}
        <label style="font-size:11px; color:#666;">WHAT ${draft.scope === 'custom' ? '(picks which modifier column applies)' : ''}</label>
        <select onchange="window.setGmCheckWhat(this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          ${buildWhatOptions(draft.kind, draft.key)}
        </select>
        <label style="font-size:11px; color:#666;">DIFFICULTY</label>
        <select onchange="window.setGmCheckField('tier', this.value)" style="width:100%; background:black; color:orange; border:1px solid orange; margin-bottom:8px;">
          ${buildTierOptions(draft.tier)}
        </select>
        ${draft.kind === 'special' ? `
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <input type="checkbox" ${draft.useD20 ? 'checked' : ''} onchange="window.setGmCheckField('useD20', this.checked)">
          Especially difficult task — roll 1d20 instead of 1d10
        </label>` : ''}
        ${draft.scope !== 'party' ? `
        <label style="font-size:11px; color:#666;">ROLL (1-${maxRoll})</label>
        <div style="display:flex; gap:6px; margin-bottom:8px;">
          <input type="number" id="gmCheckRollInput" min="1" max="${maxRoll}" value="${draft.roll ?? ''}" oninput="window.setGmCheckField('roll', this.value)" style="flex-grow:1; background:black; color:orange; border:1px solid orange;">
          <button class="gm-btn" style="border-color:orange; color:orange;" onclick="window.rollForGmCheck()">🎲 ROLL</button>
        </div>` : `<p style="font-size:11px; color:#666; margin-bottom:8px;">Each party member auto-rolls their own dice when resolved.</p>`}
        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:6px; margin-bottom:10px;">
          <input type="checkbox" ${draft.reveal ? 'checked' : ''} onchange="window.setGmCheckField('reveal', this.checked)">
          Reveal result to all players immediately (a message gets sent)
        </label>
        <button style="width:100%; padding:10px; background:orange; color:black; font-weight:bold; border:none; cursor:pointer;" onclick="window.resolveGmCheck()">RESOLVE CHECK</button>
      </div>`;
  }

  const visibleChecks = checks.filter(c => userRole === 'gm' || !c.hidden);
  const checkLogHtml = visibleChecks.slice().reverse().map(entry => {
    const tierLabel = (DIFFICULTY_TIERS[entry.tier] || {}).label || entry.tier;
    const whatLabel = entry.key ? entry.key.replace(/_/g, ' ').toUpperCase() : (entry.kind === 'special' ? 'SPECIAL' : 'SKILL');
    const hiddenTag = entry.hidden ? `<span style="color:red; font-size:10px; border:1px solid red; padding:1px 4px; margin-left:6px;">HIDDEN — NOT REVEALED</span>` : '';
    const revealBtn = (userRole === 'gm' && entry.hidden) ? `<button class="gm-btn" style="margin-top:4px; padding:2px 8px; font-size:10px;" onclick="window.revealCheck('${entry.id}')">REVEAL TO PLAYERS</button>` : '';
    const resultsHtml = entry.results.map(r => `<div style="padding-left:8px;">${r.name}: ${formatCheckResultLine(r)}</div>`).join('');
    return `
      <div style="padding:6px 0; border-bottom:1px dashed #222; font-size:13px;">
        <span style="color:#555; font-size:10px;">${new Date(entry.timestamp).toLocaleTimeString()}</span>
        <span style="color:#888;"> ${whatLabel} — ${tierLabel}</span>${hiddenTag}
        ${resultsHtml}
        ${revealBtn}
      </div>`;
  }).join('');

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto;">
      <h2 style="color:var(--pip-green);">🎲 DIFFICULTY CHECKS</h2>
      ${playerPanelHtml}
      ${gmPanelHtml}
      <div class="panel">
        <h2>CHECK LOG</h2>
        <div style="max-height:500px; overflow-y:auto;">${checkLogHtml || '<span style="color:#555;">No checks rolled yet.</span>'}</div>
      </div>
    </div>
  `;
}

// --- DATA LOGS ---
export function getDataLogsView(liveData, userRole, currentUser) {
  const allLogs = Object.values(dataLogDatabase);
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);

  if (userRole === 'gm') {
    const renderLog = (log) => `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #222; padding:5px 0;">
        <span>${log.name}</span>
        <div style="display:flex; gap:4px;">
          <select id="grantLogTarget_${log.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
            <option value="all">ALL PLAYERS</option>
            ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
          </select>
          <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantDataLog('${log.id}', document.getElementById('grantLogTarget_${log.id}').value)">GRANT</button>
        </div>
      </div>`;
    return `
      <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
        <div class="panel">
          <h2>DATA LOGS — GM VIEW</h2>
          <p style="font-size:12px; color:#666;">You see everything unconditionally. Grant a log to a player (or everyone) to unlock it for them.</p>
          ${allLogs.length > 0 ? renderCategoryTree(buildCategoryTree(allLogs), renderLog) : '<p style="color:#555;">No data logs authored yet.</p>'}
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const unlocked = new Set(char.unlocked_logs || []);
  const readSet = new Set(char.read_logs || []);
  const visibleLogs = allLogs.filter(l => unlocked.has(l.id));
  const openId = window.openLogId;

  const renderLog = (log) => {
    const isUnread = !readSet.has(log.id);
    const isOpen = openId === log.id;
    return `
      <div>
        <div onclick="window.openDataLog('${log.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; ${isUnread ? 'font-weight:bold; color:var(--pip-green);' : 'color:#888;'}">
          ${isUnread ? '<span style="color:red;">●</span> ' : ''}${log.name}
        </div>
        ${isOpen ? `<div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px; color:#ccc; white-space:pre-wrap;">${applyGlossaryTooltips(escapeHtml(log.body || ''))}</div>` : ''}
      </div>`;
  };

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>DATA LOGS</h2>
        ${visibleLogs.length === 0 ? '<p style="color:#555; font-size:13px;">Nothing unlocked yet — your GM will grant you access as the story unfolds.</p>' : renderCategoryTree(buildCategoryTree(visibleLogs), renderLog)}
      </div>
    </div>`;
}

// --- QUESTS ---
const QUEST_STATUS_COLOR = { active: 'var(--pip-green)', completed: '#4af', failed: '#f55' };
const QUEST_STATUS_LABEL = { active: 'ACTIVE', completed: 'COMPLETED', failed: 'FAILED' };

export function getQuestsView(liveData, userRole, currentUser) {
  const allQuests = Object.values(questDatabase);
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);

  if (userRole === 'gm') {
    const openId = window.openQuestId;
    const renderQuest = (quest) => {
      const isOpen = openId === quest.id;
      const holders = players.filter(([, c]) => (c.unlocked_quests || []).includes(quest.id));
      return `
        <div style="border-bottom:1px dashed #222; padding:5px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span onclick="window.openQuest('${quest.id}')" style="cursor:pointer;">${quest.name}</span>
            <div style="display:flex; gap:4px;">
              <select id="grantQuestTarget_${quest.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
                <option value="all">ALL PLAYERS</option>
                ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
              </select>
              <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantQuest('${quest.id}', document.getElementById('grantQuestTarget_${quest.id}').value)">GRANT</button>
            </div>
          </div>
          ${isOpen ? `
            <div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px;">
              <div style="color:#ccc; white-space:pre-wrap; margin-bottom:8px;">${applyGlossaryTooltips(escapeHtml(quest.body || ''))}</div>
              ${(quest.objectives || []).length > 0 ? `<ol style="margin:0 0 10px 18px; padding:0; color:#aaa; font-size:12px;">${quest.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ol>` : ''}
              ${holders.length === 0 ? '<p style="color:#555; font-size:11px;">Not granted to anyone yet.</p>' : `
                <div style="border-top:1px dashed #333; padding-top:6px;">
                  <div style="font-size:11px; color:var(--pip-dim); text-transform:uppercase; margin-bottom:4px;">Status per player</div>
                  ${holders.map(([id, c]) => {
                    const status = (c.quest_status || {})[quest.id] || 'active';
                    return `
                      <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 0;">
                        <span style="font-size:12px;">${c.name}</span>
                        <select id="questStatus_${quest.id}_${id}" style="background:black; color:${QUEST_STATUS_COLOR[status]}; border:1px solid #333; font-size:11px;">
                          ${['active', 'completed', 'failed'].map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${QUEST_STATUS_LABEL[s]}</option>`).join('')}
                        </select>
                        <button class="gm-btn" style="padding:0 6px; font-size:10px;" onclick="window.gmSetQuestStatus('${quest.id}', '${id}', document.getElementById('questStatus_${quest.id}_${id}').value)">SET</button>
                      </div>`;
                  }).join('')}
                </div>`}
            </div>` : ''}
        </div>`;
    };
    return `
      <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
        <div class="panel">
          <h2>QUESTS — GM VIEW</h2>
          <p style="font-size:12px; color:#666;">Click a title to review it and set status per player. Grant unlocks it for a player (or everyone) — new grants default to Active.</p>
          ${allQuests.length > 0 ? renderCategoryTree(buildCategoryTree(allQuests), renderQuest) : '<p style="color:#555;">No quests authored yet.</p>'}
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const unlocked = new Set(char.unlocked_quests || []);
  const readSet = new Set(char.read_quests || []);
  const statusMap = char.quest_status || {};
  const progressMap = char.quest_progress || {};
  const visibleQuests = allQuests.filter(q => unlocked.has(q.id));
  const openId = window.openQuestId;

  const renderQuest = (quest) => {
    const isUnread = !readSet.has(quest.id);
    const isOpen = openId === quest.id;
    const status = statusMap[quest.id] || 'active';
    const completedObjectives = new Set(progressMap[quest.id] || []);
    return `
      <div>
        <div onclick="window.openQuest('${quest.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; display:flex; justify-content:space-between; align-items:center; ${isUnread ? 'font-weight:bold; color:var(--pip-green);' : 'color:#888;'}">
          <span>${isUnread ? '<span style="color:red;">●</span> ' : ''}${quest.name}</span>
          <span style="font-size:10px; color:${QUEST_STATUS_COLOR[status]};">${QUEST_STATUS_LABEL[status]}</span>
        </div>
        ${isOpen ? `
          <div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px;">
            <div style="color:#ccc; white-space:pre-wrap; margin-bottom:8px;">${applyGlossaryTooltips(escapeHtml(quest.body || ''))}</div>
            ${(quest.objectives || []).length > 0 ? `
              <div style="border-top:1px dashed #333; padding-top:6px;">
                ${quest.objectives.map((o, i) => `
                  <div onclick="event.stopPropagation(); window.toggleQuestObjective('${currentUser}', '${quest.id}', ${i})" style="cursor:pointer; display:flex; gap:6px; align-items:baseline; padding:2px 0; ${completedObjectives.has(i) ? 'color:#666; text-decoration:line-through;' : 'color:#ccc;'}">
                    <span>${completedObjectives.has(i) ? '[X]' : '[ ]'}</span><span style="font-size:12px;">${escapeHtml(o)}</span>
                  </div>`).join('')}
              </div>` : ''}
          </div>` : ''}
      </div>`;
  };

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>QUESTS</h2>
        ${visibleQuests.length === 0 ? '<p style="color:#555; font-size:13px;">No quests unlocked yet — your GM will grant them as the story unfolds.</p>' : renderCategoryTree(buildCategoryTree(visibleQuests), renderQuest)}
      </div>
    </div>`;
}

// --- MAPS ---
export function getMapsView(liveData, userRole, currentUser) {
  const allMaps = Object.values(mapDatabase);
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);
  const openId = window.openMapId;

  if (userRole === 'gm') {
    const renderMap = (node) => {
      const map = node.entry;
      return `
        <div style="border-bottom:1px dashed #222; padding:5px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span onclick="window.openMap('${map.id}')" style="cursor:pointer;">${map.name}</span>
            <div style="display:flex; gap:4px;">
              <select id="grantMapTarget_${map.id}" style="background:black; color:lime; border:1px solid #333; font-size:11px;">
                <option value="all">ALL PLAYERS</option>
                ${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
              </select>
              <button class="gm-btn" style="padding:0 8px; font-size:11px;" onclick="window.gmGrantMap('${map.id}', document.getElementById('grantMapTarget_${map.id}').value)">GRANT</button>
            </div>
          </div>
          ${openId === map.id ? `<img src="${map.image_url}" style="max-width:100%; border:1px solid var(--pip-dim); margin-top:6px;">` : ''}
          ${node.children.length > 0 ? `<div style="margin-left:16px;">${node.children.map(renderMap).join('')}</div>` : ''}
        </div>`;
    };
    const roots = buildParentTree(allMaps);
    return `
      <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
        <div class="panel">
          <h2>MAPS — GM VIEW</h2>
          <p style="font-size:12px; color:#666;">Click a name to preview it. Grant unlocks it for a player (or everyone).</p>
          ${roots.length > 0 ? roots.map(renderMap).join('') : '<p style="color:#555;">No maps authored yet.</p>'}
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const unlocked = new Set(char.unlocked_maps || []);
  const visibleMaps = allMaps.filter(m => unlocked.has(m.id));

  const renderMap = (node) => {
    const map = node.entry;
    const visibleChildren = node.children.filter(c => unlocked.has(c.entry.id));
    return `
      <div style="border-bottom:1px dashed #222; padding:5px 0;">
        <div onclick="window.openMap('${map.id}')" style="cursor:pointer; color:var(--pip-green);">${map.name}</div>
        ${openId === map.id ? `<img src="${map.image_url}" style="max-width:100%; border:1px solid var(--pip-dim); margin-top:6px;">` : ''}
        ${visibleChildren.length > 0 ? `<div style="margin-left:16px;">${visibleChildren.map(renderMap).join('')}</div>` : ''}
      </div>`;
  };
  // Only walk from roots the player can actually see; an unlocked child
  // under a not-yet-unlocked parent still shows at its own top level
  // rather than disappearing.
  const allRoots = buildParentTree(allMaps);
  const visibleRoots = allRoots.filter(n => unlocked.has(n.entry.id));
  const orphanedVisibleChildren = [];
  (function findOrphans(nodes, parentVisible) {
    nodes.forEach(n => {
      const isVisible = unlocked.has(n.entry.id);
      if (isVisible && !parentVisible) orphanedVisibleChildren.push(n);
      findOrphans(n.children, isVisible || parentVisible);
    });
  })(allRoots, false);

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>MAPS</h2>
        ${visibleMaps.length === 0 ? '<p style="color:#555; font-size:13px;">No maps unlocked yet.</p>' :
          [...visibleRoots, ...orphanedVisibleChildren].map(renderMap).join('')}
      </div>
    </div>`;
}

// --- MESSAGES ---
export function getMessagesView(liveData, userRole, currentUser) {
  const messages = liveData.messages || [];
  const players = Object.entries(liveData.characters || {}).filter(([, c]) => c.is_finalized);
  const openId = window.openMessageId;

  if (userRole === 'gm') {
    const targetOptions = `<option value="all">ALL PLAYERS</option>${players.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}`;
    const historyHtml = messages.slice().reverse().map(m => `
      <div style="border-bottom:1px dashed #222; padding:6px 0; font-size:13px;">
        <span style="color:#555; font-size:11px;">${new Date(m.timestamp).toLocaleString()}</span>
        <span style="color:cyan;"> → ${m.target === 'all' ? 'ALL' : (liveData.characters[m.target]?.name || m.target)}</span>
        <div style="color:#ccc; margin-top:2px;">${escapeHtml(m.body)}</div>
      </div>`).join('');
    return `
      <div class="dashboard-container" style="grid-template-columns: 340px 1fr; justify-content:center;">
        <div class="panel">
          <h2 style="color:cyan;">SEND MESSAGE</h2>
          <label style="font-size:11px; color:#666;">TO</label>
          <select id="messageTarget" style="width:100%; background:black; color:cyan; border:1px solid #333; margin-bottom:8px;">${targetOptions}</select>
          <label style="font-size:11px; color:#666;">MESSAGE</label>
          <textarea id="messageBody" rows="5" style="width:100%; background:black; color:cyan; border:1px solid #333; font-family:'IBM Plex Mono', monospace; margin-bottom:8px;"></textarea>
          <button class="gm-btn" style="width:100%; border-color:cyan; color:cyan;" onclick="window.sendMessage()">SEND</button>
        </div>
        <div class="panel">
          <h2>HISTORY</h2>
          <div style="max-height:500px; overflow-y:auto;">${historyHtml || '<span style="color:#555;">No messages sent yet.</span>'}</div>
        </div>
      </div>`;
  }

  const char = liveData.characters[currentUser];
  const readSet = new Set(char.read_messages || []);
  const myMessages = messages.filter(m => m.target === 'all' || m.target === currentUser);

  const rowsHtml = myMessages.slice().reverse().map(m => {
    const isUnread = !readSet.has(m.id);
    const isOpen = openId === m.id;
    return `
      <div>
        <div onclick="window.openMessage('${m.id}')" style="cursor:pointer; padding:6px 0; border-bottom:1px dashed #222; ${isUnread ? 'font-weight:bold; color:var(--pip-green);' : 'color:#888;'}">
          ${isUnread ? '<span style="color:red;">●</span> ' : ''}${m.target === 'all' ? '[ALL] ' : '[YOU] '}${new Date(m.timestamp).toLocaleDateString()}
        </div>
        ${isOpen ? `<div style="background:rgba(0,50,0,0.2); border:1px solid var(--pip-dim); padding:10px; margin:6px 0; font-size:13px; color:#ccc; white-space:pre-wrap;">${escapeHtml(m.body)}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="dashboard-container" style="display:block; max-width:700px; margin:0 auto; padding-top:10px;">
      <div class="panel">
        <h2>MESSAGES</h2>
        ${myMessages.length === 0 ? '<p style="color:#555; font-size:13px;">No messages yet.</p>' : rowsHtml}
      </div>
    </div>`;
}

// --- PLAYER SCREEN (The Dashboard) ---
export function getPlayerView(charId, liveData) {
  const charData = liveData.characters[charId];
  if (!charData) return `<h1>> ERROR: IDENTITY '${charId.toUpperCase()}' NOT FOUND</h1>`;

  const equip = charData.equipment || { head: null, body: null, right_hand: null, left_hand: null, back: null };
  const activeStatusEffects = charData.status_effects || [];

  // PASS RACE + STATUS EFFECTS + EQUIPMENT TO FORMULAS
  const derived = calculateDerivedStats(
    charData.special,
    charData.level || 1,
    charData.traits || [],
    charData.perks || [],
    charData.race || 'human', // Default to human if missing
    activeStatusEffects,
    equip,
    charData.rads || 0,
    charData.inventory || {}
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
      skillsHtml += `<div class="skill-item ${isTagged ? 'tagged' : ''}" style="display:flex; justify-content:space-between; align-items:center;"><span>${renderWikiLink(key.replace(/_/g, ' ').toUpperCase(), SKILL_INFO[key])}</span><div style="display:flex; gap:10px; align-items:center;">${controls}${valDisplay}</div></div>`;
    });
  }

  // --- 3. INVENTORY & WALLET ---
  // Inventory is a stacked { itemId: quantity } map — normalizeInventory
  // also transparently upgrades a character still on the old flat-array
  // shape from before stacking existed, purely for display (nothing gets
  // written back just from viewing).
  let inventoryHtml = "";
  let walletHtml = "";

  // Other finalized party members — the give-item target list. Excludes
  // this character themselves; nothing to give to if nobody else has
  // finished G.O.A.T. registration yet.
  const otherPlayers = Object.entries(liveData.characters || {})
    .filter(([id, c]) => id !== charId && c.is_finalized);

  if (charData.inventory) {
    const invMap = normalizeInventory(charData.inventory);
    const rawInv = Object.entries(invMap).map(([itemId, qty]) => {
       const itemDef = getItem(itemId);
       return { id: itemId, qty, def: itemDef };
    });

    walletHtml = rawInv.filter(i => i.def && i.def.type === 'currency')
      .map(i => `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #333; padding:2px 0;">${renderWikiLink(i.def.name, i.def.description)}<span style="color:var(--pip-gold);">x${i.qty}</span></div>`).join("");

    inventoryHtml = `<ul class="inventory-list">` + rawInv.filter(i => !i.def || i.def.type !== 'currency').map(i => {
        const itemDef = i.def;
        const itemId = i.id;
        if (itemDef) {
          const isEquipped = Object.values(equip).includes(itemId);
          const style = isEquipped ? "opacity: 0.5; border-color: #555;" : "";
          const safeDesc = (itemDef.description || "").replace(/"/g, "&quot;").replace(/'/g, "\\'");
          const qtyTag = i.qty > 1 ? ` <span style="color:var(--pip-green);">x${i.qty}</span>` : '';

          let buttons = "";
          if (!isEquipped) {
            if (itemDef.slot === "hand") buttons = `<button onclick="window.equipItem('${itemId}', 'right_hand')">R</button> <button onclick="window.equipItem('${itemId}', 'left_hand')">L</button>`;
            else if (itemDef.slot === "body") buttons = `<button onclick="window.equipItem('${itemId}', 'body')">EQUIP</button>`;
            else if (itemDef.slot === "head") buttons = `<button onclick="window.equipItem('${itemId}', 'head')">EQUIP</button>`;
            else if (itemDef.slot === "back") buttons = `<button onclick="window.equipItem('${itemId}', 'back')">EQUIP</button>`;
            else if (itemDef.type === "consumable") buttons = `<button onclick="window.useItem('${charId}', '${itemId}')">USE</button>`;
          } else { buttons = `<span style="color:var(--pip-green); font-size:10px;">[EQUIPPED]</span>`; }

          // Give-to-party-member — only for unequipped items (equipped
          // gear has to come off first, same as any other inventory
          // action), and only when there's someone else to give it to.
          const giveControl = (!isEquipped && otherPlayers.length > 0) ? `
            <select id="giveTarget_${itemId}" style="background:black; color:lime; border:1px solid #333; font-size:10px; max-width:70px;">
              ${otherPlayers.map(([id, c]) => `<option value="${id}">${c.name}</option>`).join('')}
            </select>
            <button onclick="window.giveItem('${itemId}', 1, document.getElementById('giveTarget_${itemId}').value)">GIVE</button>` : '';

          return `<li class="inv-card" style="${style}"><img src="${itemDef.icon}" class="inv-icon"><div class="inv-info"><span class="inv-name" style="cursor:help; border-bottom:1px dotted var(--pip-green);" onmouseover="window.showTooltip('${safeDesc}', event)" onmouseout="window.hideTooltip()">${itemDef.name}</span>${qtyTag}<span class="inv-meta">${itemDef.type.toUpperCase()}</span></div><div class="inv-actions">${buttons}${giveControl}</div></li>`;
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

  // Radiation — two-phase per the manual's threshold table. This view is
  // always the player's OWN dashboard (never rendered for the GM looking
  // at someone else), so it deliberately never shows the exact number —
  // only the vague in-character symptom text for their current tier.
  // The GM sees the real count elsewhere (the Squad Monitor character
  // modal), and sets it directly at will rather than it accruing on its own.
  const rads = charData.rads || 0;
  const radTierIndex = RAD_THRESHOLDS.findIndex(t => t.rads === getRadiationTier(rads).rads);
  const radPercent = (radTierIndex / (RAD_THRESHOLDS.length - 1)) * 100; // tier-based, not exact rads — stays vague
  let radColor = "yellow";
  if (rads > 400) radColor = "orange";
  if (rads > 800) radColor = "red";
  if (rads === 0) radColor = "var(--pip-green)";

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
        ${liveData.active_combat && liveData.active_combat.is_active ? `
        <div onclick="window.switchTab('COMBAT')" style="cursor:pointer; text-align:center; padding:8px; margin-bottom:15px; background:rgba(200,0,0,0.15); border:1px solid red; color:red; animation: blink 1s infinite;">
          ⚔ COMBAT IN PROGRESS — TAP TO JOIN
        </div>` : ''}

        <div style="margin-bottom:15px;">
           <label>HP STATUS</label>
           <div style="background:#330000; height:20px; border:1px solid red; margin-top:5px;"><div style="width:${(charData.hp.current / charData.hp.max) * 100}%; background:red; height:100%;"></div></div>
           <div style="text-align:right;">${charData.hp.current} / ${charData.hp.max}</div>
        </div>

        <div style="margin-bottom:15px;">
           <label>RADIATION</label>
           <div style="background:#333; height:10px; border:1px solid ${radColor}; margin-top:2px;"><div style="width:${radPercent}%; background:${radColor}; height:100%;"></div></div>
           <div style="font-size:12px; color:${radColor}; margin-top:4px; font-style:italic;">${getRadiationTier(rads).description}</div>
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
        ${Object.entries(charData.special).map(([k, v]) => `<div class="special-row"><span>${renderWikiLink(k.toUpperCase(), SPECIAL_INFO[k])}</span><span>${v}</span></div>`).join("")}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">TRAITS</h3>
        ${traitsHtml || "> NONE"}
        
        <h3 style="color:var(--pip-dim); border-bottom:1px solid var(--pip-dim); margin-top:20px;">PERKS</h3>
        ${perksHtml || "> NONE"}
        ${perkAlert}
        ${perkSelectionHtml}
      </div>
      
      <div class="panel">
        ${charData.biography ? `
        <h2>BIOGRAPHY</h2>
        <div style="max-height:180px; overflow-y:auto; margin-bottom:20px; font-size:14px; color:#ccc; line-height:1.5; white-space:pre-wrap;">${escapeHtml(charData.biography)}</div>` : ''}
        <h2>COMBAT STATS</h2>
         <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
          <div style="border:1px solid #333; padding:5px; text-align:center;"><small>AC</small><br><strong style="font-size:24px;">${derived.armorClass}</strong></div>
          <div style="border:1px solid #333; padding:5px; text-align:center;"><small>SEQ</small><br><strong style="font-size:24px;">${derived.sequenceBonus}</strong></div>
        </div>
        ${renderCarryWeightGauge(derived.carryUsed, derived.carryCapacity)}
        <h2>SKILLS</h2>
        <div style="flex-grow:1; overflow-y:auto;">${skillsHtml}</div>
      </div>

      <div class="panel">
        <h2>EQUIPPED GEAR</h2>
        <div class="equipment-grid">${renderSlot("HEAD", "head")}${renderSlot("BODY", "body")}${renderSlot("R. HAND", "right_hand")}${renderSlot("L. HAND", "left_hand")}${renderSlot("BACK", "back")}</div>

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

  // --- COMBAT SETUP ---
  const combatDraft = window.combatDraft || { monsters: {} };
  window.combatDraft = combatDraft;

  const bestiaryListHtml = Object.values(bestiaryDatabase)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => {
      const count = combatDraft.monsters[m.id] || 0;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 0; border-bottom:1px dashed #222;">
          <span style="font-size:13px;">${m.name}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="gm-btn" style="padding:0 6px;" onclick="window.adjustCombatDraftMonster('${m.id}', -1)">-</button>
            <span style="width:16px; text-align:center;">${count}</span>
            <button class="gm-btn" style="padding:0 6px;" onclick="window.adjustCombatDraftMonster('${m.id}', 1)">+</button>
          </div>
        </div>`;
    }).join('') || `<div style="color:#555; font-size:12px;">No bestiary entries yet.</div>`;

  const activeCombat = liveData.active_combat;
  const combatActionHtml = activeCombat && activeCombat.is_active
    ? `<div style="color:red; margin-bottom:10px; animation: blink 1s infinite;">⚠ COMBAT IN PROGRESS</div>
       <button style="width:100%; padding:10px; cursor:pointer; background:red; color:white; font-weight:bold; border:none;" onclick="window.switchTab('COMBAT')">GO TO COMBAT</button>`
    : `<button style="width:100%; padding:10px; cursor:pointer; background:red; color:white; font-weight:bold; border:none;" onclick="window.startCombat()">START COMBAT</button>`;

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

        <h4 style="color:yellow; border-bottom:1px dashed yellow;">RADIATION</h4>
        <div style="font-size:12px; color:#aaa; margin-bottom:6px;">
          Exact count (only you see this): <span style="color:yellow; font-weight:bold;">${(targetChar && targetChar.rads) || 0} rads</span>
          — <span style="font-style:italic;">${getRadiationTier((targetChar && targetChar.rads) || 0).description}</span>
        </div>
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="number" id="gmRadInput" min="0" max="1000" placeholder="SET RADS" style="flex-grow:1; background:black; color:yellow; border:1px solid yellow;">
          <button class="gm-btn" style="border-color:yellow; color:yellow;" onclick="window.gmSetRadiation(Number(document.getElementById('gmRadInput').value))">SET</button>
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
        <div style="display:flex; gap:5px; margin-bottom:10px;">
          <select id="gmItemSelect" style="flex-grow:1; background:black; color:lime; border:1px solid lime; font-family:'VT323';">
            ${itemOptions}
          </select>
          <button class="gm-btn" style="border-color:lime; color:lime;" onclick="window.gmGrantItem()">GRANT</button>
        </div>
        <div>
          ${['head', 'body', 'right_hand', 'left_hand'].map(slot => {
            const equippedId = targetChar && targetChar.equipment ? targetChar.equipment[slot] : null;
            const equippedItem = getItem(equippedId);
            if (!equippedItem) return '';
            return `<div style="display:flex; justify-content:space-between; align-items:center; border:1px solid #333; padding:3px 8px; margin-bottom:4px; font-size:13px;">
              <span>${slot.replace('_', ' ').toUpperCase()}: ${equippedItem.name}</span>
              <button class="gm-btn" style="border-color:lime; color:lime; padding:0 8px;" onclick="window.gmUnequipItem('${slot}')">UNEQUIP</button>
            </div>`;
          }).join('') || `<div style="color:#555; font-size:12px;">Nothing equipped.</div>`}
        </div>

        <h4 style="color:cyan; border-bottom:1px dashed cyan; margin-top:20px;">BIOGRAPHY &amp; GM NOTES</h4>
        <p style="font-size:11px; color:#666; margin:0 0 4px;">Visible only to this player (and you) — not the rest of the party.</p>
        <label style="font-size:11px; color:#666;">BIOGRAPHY</label>
        <textarea id="bioTextarea" rows="6" style="width:100%; background:black; color:cyan; border:1px solid #333; font-family:'IBM Plex Mono', monospace; font-size:12px; margin-bottom:8px;">${(targetChar && targetChar.biography) || ''}</textarea>
        <label style="font-size:11px; color:#666;">GM NOTES</label>
        <textarea id="gmNotesTextarea" rows="6" style="width:100%; background:black; color:cyan; border:1px solid #333; font-family:'IBM Plex Mono', monospace; font-size:12px; margin-bottom:8px;">${(targetChar && targetChar.gm_notes) || ''}</textarea>
        <button class="gm-btn" style="width:100%; border-color:cyan; color:cyan;" onclick="window.gmSaveBiography()">SAVE</button>

        <h4 style="color:red; border-bottom:1px dashed red; margin-top:20px;">DANGER ZONE</h4>
        <button class="gm-btn" style="border-color:red; color:white; background:red; width:100%;" onclick="window.gmFactoryReset()">FACTORY RESET CHARACTER</button>

      </div>
    </div>
  `;

  return `
    <div class="dashboard-container" style="grid-template-columns: 360px 280px 280px; justify-content: center;">
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

      <div class="panel">
        <h3 style="color:red;">COMBAT</h3>
        ${combatActionHtml}
        <p style="font-size:11px; color:#666; margin-top:10px;">Pick enemies for the next encounter:</p>
        <div style="max-height:260px; overflow-y:auto; border-top:1px solid #333; padding-top:6px;">
          ${bestiaryListHtml}
        </div>
      </div>
    </div>
  `;
}