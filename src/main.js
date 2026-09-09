// src/main.js
import { doc, onSnapshot } from "firebase/firestore";
import { db } from './firebase.js'; // Connection
import * as Views from './views.js'; // All HTML generators
import * as Controllers from './controllers.js'; // All Actions
import './style.css';

// --- GLOBAL STATE ---
window.liveData = null;
window.currentUser = null;
window.userRole = null;
window.currentTab = 'STATUS';

// --- TEXT SIZE (per-device preference, not synced — CSS uses fixed px
// everywhere, so rather than rewrite ~450 lines to rem units, this scales
// the whole rendered page uniformly via `zoom`, same effect as a
// browser's own page zoom, just persisted and controlled in-app) ---
const FONT_SCALE_KEY = 'foes_font_scale';
const FONT_SCALE_MIN = 0.8;
const FONT_SCALE_MAX = 1.6;
window.getFontScale = () => Number(localStorage.getItem(FONT_SCALE_KEY)) || 1;
window.setFontScale = (scale) => {
  const clamped = Math.round(Math.max(FONT_SCALE_MIN, Math.min(FONT_SCALE_MAX, scale)) * 100) / 100;
  localStorage.setItem(FONT_SCALE_KEY, clamped);
  document.documentElement.style.zoom = clamped;
  const display = document.getElementById('fontScaleDisplay');
  if (display) display.textContent = Math.round(clamped * 100) + '%';
};
window.adjustFontScale = (delta) => window.setFontScale(window.getFontScale() + delta);
document.documentElement.style.zoom = window.getFontScale();
const fontScaleDisplayInit = document.getElementById('fontScaleDisplay');
if (fontScaleDisplayInit) fontScaleDisplayInit.textContent = Math.round(window.getFontScale() * 100) + '%';

// --- EXPOSE ACTIONS TO HTML ---
// We must attach these to 'window' so onclick="window.equipItem()" works
window.equipItem = Controllers.equipItem;
window.unequipItem = Controllers.unequipItem;
window.reloadWeapon = Controllers.reloadWeapon;
window.createAccessCode = Controllers.createAccessCode;
window.forceReset = Controllers.forceReset;
window.gmGrantItem = () => Controllers.gmGrantItem(window.selectedCharId);
window.gmUnequipItem = (slot) => Controllers.gmUnequipItem(window.selectedCharId, slot);
window.gmSaveBiography = () => Controllers.gmSaveBiography(window.selectedCharId);
window.gmGrantDataLog = Controllers.gmGrantDataLog;
window.openDataLog = Controllers.openDataLog;
window.gmGrantQuest = Controllers.gmGrantQuest;
window.openQuest = Controllers.openQuest;
window.gmSetQuestStatus = Controllers.gmSetQuestStatus;
window.toggleQuestObjective = Controllers.toggleQuestObjective;
window.gmGrantMap = Controllers.gmGrantMap;
window.openMap = Controllers.openMap;
window.sendMessage = Controllers.sendMessage;
window.openMessage = Controllers.openMessage;
window.gmAdjustHP = (amt) => Controllers.gmAdjustHP(window.selectedCharId, amt);
window.gmSetRadiation = (amt) => Controllers.gmSetRadiation(window.selectedCharId, amt);
window.useItem = Controllers.useItem;
window.giveItem = Controllers.giveItem;
window.gmAdjustVaultPoints = (amt) => Controllers.gmAdjustVaultPoints(window.selectedCharId, amt);
window.gmGrantLevel = () => Controllers.gmGrantLevel(window.selectedCharId);
window.gmApplyStatusEffect = () => Controllers.gmApplyStatusEffect(window.selectedCharId);
window.gmRemoveStatusEffect = (instanceId) => Controllers.gmRemoveStatusEffect(window.selectedCharId, instanceId);
window.adjustSkillDraft = Controllers.adjustSkillDraft;
window.confirmLevelUp = Controllers.confirmLevelUp;
window.cancelLevelUp = Controllers.cancelLevelUp;
window.choosePerk = Controllers.choosePerk;
window.adjustCombatDraftMonster = Controllers.adjustCombatDraftMonster;
window.startCombat = Controllers.startCombat;
window.endCombat = Controllers.endCombat;
window.setStance = Controllers.setStance;
window.setCombatActionField = Controllers.setCombatActionField;
window.rollForMe = Controllers.rollForMe;
window.resolveAttack = Controllers.resolveAttack;
window.setPlayerCheckField = Controllers.setPlayerCheckField;
window.setPlayerCheckWhat = Controllers.setPlayerCheckWhat;
window.rollForPlayerCheck = Controllers.rollForPlayerCheck;
window.resolvePlayerCheck = Controllers.resolvePlayerCheck;
window.setGmCheckField = Controllers.setGmCheckField;
window.setGmCheckWhat = Controllers.setGmCheckWhat;
window.rollForGmCheck = Controllers.rollForGmCheck;
window.resolveGmCheck = Controllers.resolveGmCheck;
window.revealCheck = Controllers.revealCheck;
window.passTurn = Controllers.passTurn;
window.endTurn = Controllers.endTurn;
window.addCombatantMidFight = Controllers.addCombatantMidFight;
window.gmAdjustCombatantHP = Controllers.gmAdjustCombatantHP;
window.gmApplyStatusEffectInCombat = Controllers.gmApplyStatusEffectInCombat;
// Direct (charId, instanceId) form — for removing an effect from a
// context (like the Combat view) that isn't scoped to a "selected
// character" the way the GM modal is.
window.gmRemoveStatusEffectDirect = Controllers.gmRemoveStatusEffect;
// Character Creation Actions
window.adjustCreationStat = Controllers.adjustCreationStat;
window.setCreationRace = Controllers.setCreationRace;
window.toggleCreationTag = Controllers.toggleCreationTag;
window.finalizeCharacter = Controllers.finalizeCharacter;
window.gmFactoryReset = () => Controllers.gmFactoryReset(window.selectedCharId);

window.openGMModal = (charId) => {
  window.selectedCharId = charId; // Store who we are editing globally
  // Re-render so anything baked into the modal's HTML at render time (e.g.
  // the active status effects list) reflects the character just selected,
  // not whoever was selected the last time a render happened.
  window.render();
  document.getElementById('gm-modal-title').innerText = "MANAGING: " + charId.toUpperCase();
  const modal = document.getElementById('gm-modal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex'; // Force flex to center it
};

// --- EXPOSE UI HELPERS ---
window.showTooltip = (text, evt) => {
  const el = document.getElementById('global-tooltip');
  if(el) { el.innerHTML = text; el.classList.add('active'); el.style.top=(evt.clientY+15)+'px'; el.style.left=(evt.clientX+15)+'px'; }
};
window.hideTooltip = () => { document.getElementById('global-tooltip').classList.remove('active'); };

// Tap-to-show fallback for touchscreens, which never fire 'mouseover'.
// Tapping a wiki-link toggles the tooltip; tapping anywhere else closes it.
window.toggleTooltip = (text, evt) => {
  evt.stopPropagation();
  const el = document.getElementById('global-tooltip');
  const alreadyShowingThis = el.classList.contains('active') && el.innerHTML === text;
  if (alreadyShowingThis) {
    window.hideTooltip();
  } else {
    window.showTooltip(text, evt);
  }
};
document.addEventListener('click', () => window.hideTooltip());

// --- DICE ROLL ANIMATION ---
// Purely cosmetic — the real roll value is already determined the
// instant this is called (rollForMe/rollForPlayerCheck/rollForGmCheck
// compute it up front); this just delays *revealing* it, cycling random
// numbers into the roll input starting fast and easing down to a stop,
// landing on the true value. Total duration is randomized 1-3s each
// time for a bit of suspense. `onDone` is where the draft's real roll
// field actually gets set — the input's value during the animation is
// pure visual noise, not app state.
window.animateDiceRoll = (inputId, finalValue, maxValue, onDone) => {
  const el = document.getElementById(inputId);
  if (!el) { if (onDone) onDone(); return; } // nothing to animate, just resolve
  el.classList.add('dice-rolling');
  const duration = 1000 + Math.random() * 2000; // 1-3s
  const start = Date.now();

  // Plain setTimeout chaining, deliberately not requestAnimationFrame —
  // rAF pauses/throttles hard the moment a tab isn't the visibly active
  // one (backgrounded, or driven by some automation contexts), which
  // would leave the roll stuck mid-animation. setTimeout keeps ticking
  // regardless.
  function tick() {
    const live = document.getElementById(inputId);
    if (!live) { if (onDone) onDone(); return; } // view re-rendered mid-animation, bail quietly
    const elapsed = Date.now() - start;
    if (elapsed >= duration) {
      live.value = finalValue;
      live.classList.remove('dice-rolling');
      if (onDone) onDone();
      return;
    }
    live.value = 1 + Math.floor(Math.random() * maxValue);
    const progress = elapsed / duration; // 0 -> 1, eases the tick rate down
    const nextDelay = 30 + Math.pow(progress, 2) * 220; // ~30ms -> ~250ms between ticks
    setTimeout(tick, nextDelay);
  }
  tick();
};

window.switchTab = (tabName) => {
  window.currentTab = tabName;
  window.render();
};

window.closeWiki = () => { document.getElementById('wiki-overlay').classList.add('hidden'); };

// --- TOOLTIP SETUP ---
if (!document.getElementById('global-tooltip')) {
  const div = document.createElement('div');
  div.id = 'global-tooltip';
  document.body.appendChild(div);
}

// --- DATABASE LISTENER ---
onSnapshot(doc(db, "prisoncampaign", "alpha_team"), (docSnapshot) => {
  if (docSnapshot.exists()) {
    window.liveData = docSnapshot.data();
  } else {
    window.liveData = {}; 
  }
  if (window.currentUser) window.render();
});

// --- RENDER LOOP ---
window.render = function() {
  const loginScreen = document.getElementById('login-screen');
  const appInterface = document.getElementById('app-interface');
  const viewport = document.getElementById('main-viewport');

  // 1. Handle Login Screen Visibility
  if (!window.currentUser) {
    if (loginScreen) loginScreen.style.display = 'flex'; // Use the CSS flex rule we fixed
    if (appInterface) appInterface.classList.add('hidden');
    return;
  }
  
  // 2. Logged In View
  if (loginScreen) loginScreen.style.display = 'none';
  if (appInterface) appInterface.classList.remove('hidden');

  // 3. Sync sidebar active state to the current tab, plus unread badges
  const navMap = { STATUS: 'btn-dashboard', QUESTS: 'btn-quests', DATA_LOGS: 'btn-logs', MESSAGES: 'btn-messages', MAPS: 'btn-map', CHECKS: 'btn-checks' };
  Object.entries(navMap).forEach(([tab, id]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', window.currentTab === tab);
  });

  if (window.userRole === 'player' && window.liveData.characters[window.currentUser]) {
    const char = window.liveData.characters[window.currentUser];
    const readLogs = new Set(char.read_logs || []);
    const unreadLogCount = (char.unlocked_logs || []).filter(id => !readLogs.has(id)).length;

    const readQuests = new Set(char.read_quests || []);
    const unreadQuestCount = (char.unlocked_quests || []).filter(id => !readQuests.has(id)).length;

    const readMessages = new Set(char.read_messages || []);
    const unreadMsgCount = (window.liveData.messages || [])
      .filter(m => m.target === 'all' || m.target === window.currentUser)
      .filter(m => !readMessages.has(m.id)).length;

    const questsBtn = document.getElementById('btn-quests');
    if (questsBtn) questsBtn.innerHTML = `2. QUESTS${unreadQuestCount > 0 ? ` <span style="color:red;">(${unreadQuestCount})</span>` : ''}`;
    const logsBtn = document.getElementById('btn-logs');
    if (logsBtn) logsBtn.innerHTML = `3. DATA LOGS${unreadLogCount > 0 ? ` <span style="color:red;">(${unreadLogCount})</span>` : ''}`;
    const msgBtn = document.getElementById('btn-messages');
    if (msgBtn) msgBtn.innerHTML = `4. MESSAGES${unreadMsgCount > 0 ? ` <span style="color:red;">(${unreadMsgCount})</span>` : ''}`;
  }

  // 4. Render Main Content
  if (window.userRole === 'gm') {
    if (window.currentTab === 'COMBAT') {
      viewport.innerHTML = Views.getCombatView(window.liveData, 'gm', window.currentUser);
    } else if (window.currentTab === 'QUESTS') {
      viewport.innerHTML = Views.getQuestsView(window.liveData, 'gm', window.currentUser);
    } else if (window.currentTab === 'DATA_LOGS') {
      viewport.innerHTML = Views.getDataLogsView(window.liveData, 'gm', window.currentUser);
    } else if (window.currentTab === 'MESSAGES') {
      viewport.innerHTML = Views.getMessagesView(window.liveData, 'gm', window.currentUser);
    } else if (window.currentTab === 'MAPS') {
      viewport.innerHTML = Views.getMapsView(window.liveData, 'gm', window.currentUser);
    } else if (window.currentTab === 'CHECKS') {
      viewport.innerHTML = Views.getChecksView(window.liveData, 'gm', window.currentUser);
    } else {
      viewport.innerHTML = Views.renderGMScreen(window.liveData);
    }
  } else {
    // PLAYER VIEW LOGIC
    const charData = window.liveData.characters[window.currentUser];

    // CHECK: Is the character finished?
    // Logic: If 'is_finalized' is missing or false, send them to Registration.
    if (charData && charData.is_finalized === true) {
       // --- SHOW DASHBOARD ---
       if (window.currentTab === 'STATUS') {
          viewport.innerHTML = Views.getPlayerView(window.currentUser, window.liveData);
       } else if (window.currentTab === 'GOAT_REVIEW') {
          viewport.innerHTML = Views.getGoatReviewView(window.currentUser, window.liveData);
       } else if (window.currentTab === 'COMBAT') {
          viewport.innerHTML = Views.getCombatView(window.liveData, 'player', window.currentUser);
       } else if (window.currentTab === 'QUESTS') {
          viewport.innerHTML = Views.getQuestsView(window.liveData, 'player', window.currentUser);
       } else if (window.currentTab === 'DATA_LOGS') {
          viewport.innerHTML = Views.getDataLogsView(window.liveData, 'player', window.currentUser);
       } else if (window.currentTab === 'MESSAGES') {
          viewport.innerHTML = Views.getMessagesView(window.liveData, 'player', window.currentUser);
       } else if (window.currentTab === 'MAPS') {
          viewport.innerHTML = Views.getMapsView(window.liveData, 'player', window.currentUser);
       } else if (window.currentTab === 'CHECKS') {
          viewport.innerHTML = Views.getChecksView(window.liveData, 'player', window.currentUser);
       } else {
          viewport.innerHTML = Views.getPlayerView(window.currentUser, window.liveData);
       }
    } else {
       // --- SHOW G.O.A.T. REGISTRATION ---
       viewport.innerHTML = Views.getRegistrationView(window.currentUser, window.liveData);
    }
  }

  maybeAnnounceTurn();
}

// --- BIG ANNOUNCEMENTS (turn changes + status-effect procs) ---
// Every connected client watches the same active_combat state and reacts
// independently — there's no "everyone's screen closes together" signal,
// each viewer's overlay is local to their own browser, driven off the
// same shared event data. That's why a dismiss only affects the person
// who clicked it: there's nothing to broadcast, everyone already saw
// (or is seeing) the same underlying announcement from the same write.
window.lastAnnouncedTurnKey = null;
function maybeAnnounceTurn() {
  const combat = window.liveData && window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  const currentActor = combat.initiative_order[combat.turn_index];
  if (!currentActor) return;
  const key = combat.last_turn_key || `${combat.round}_${combat.turn_index}_${currentActor.combatant_id}`;
  if (window.lastAnnouncedTurnKey === key) return;
  window.lastAnnouncedTurnKey = key;
  showBigAnnouncement(`${currentActor.name}'S TURN`, combat.last_turn_events || []);
}

function showBigAnnouncement(headline, sublines) {
  let el = document.getElementById('turn-announcement');
  if (!el) {
    el = document.createElement('div');
    el.id = 'turn-announcement';
    el.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:5000; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; color:var(--pip-green); font-family:VT323, monospace;';
    document.body.appendChild(el);
  }

  const sublinesHtml = (sublines || [])
    .map(line => `<div style="font-size:16px; color:#ff5555; text-align:center;">${line}</div>`)
    .join('');

  el.innerHTML = `
    <div style="font-size:48px; text-align:center; text-shadow:0 0 10px rgba(51,255,51,0.6); max-width:80vw;">${headline}</div>
    ${sublinesHtml ? `<div style="display:flex; flex-direction:column; gap:4px; max-width:70vw;">${sublinesHtml}</div>` : ''}
    <button id="turn-announcement-dismiss" style="position:relative; overflow:hidden; padding:10px 34px; background:#111; border:1px solid var(--pip-green); color:var(--pip-green); font-family:'VT323', monospace; font-size:18px; cursor:pointer;">
      <span id="turn-announcement-fill" style="position:absolute; inset:0; width:0%; background:rgba(51,255,51,0.35); z-index:0;"></span>
      <span style="position:relative; z-index:1;">DISMISS</span>
    </button>
  `;
  el.style.display = 'flex';

  let closed = false;
  const close = () => { if (closed) return; closed = true; el.style.display = 'none'; clearTimeout(autoTimer); };
  document.getElementById('turn-announcement-dismiss').onclick = close;

  // Fill the button over 5s via a CSS transition (starts after a paint
  // so the browser actually animates from 0, rather than snapping to 100%).
  const fillEl = document.getElementById('turn-announcement-fill');
  requestAnimationFrame(() => {
    if (fillEl) {
      fillEl.style.transition = 'width 5s linear';
      fillEl.style.width = '100%';
    }
  });

  const autoTimer = setTimeout(close, 5000);
}

// --- LOGIN CONTROLLER ---
function attemptLogin(rawCode) {
  const code = rawCode.toUpperCase().trim();
  if (!window.liveData || !window.liveData.access_codes) {
    console.error("DB Not Ready"); return;
  }
  const accessData = window.liveData.access_codes[code];
  if (accessData) {
    window.userRole = accessData.role;
    window.currentUser = accessData.role === 'gm' ? 'GM' : accessData.linked_char;
    window.render();
  } else {
    alert("ACCESS DENIED");
  }
}

// --- BIND LOGIN INPUTS ---
const input = document.getElementById('loginInput');
const btn = document.getElementById('loginBtn');
if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(input.value); });
if (btn) btn.addEventListener('click', () => { if(input) attemptLogin(input.value); });

// Initial Render
window.render();