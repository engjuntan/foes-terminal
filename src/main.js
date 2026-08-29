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

// --- EXPOSE ACTIONS TO HTML ---
// We must attach these to 'window' so onclick="window.equipItem()" works
window.equipItem = Controllers.equipItem;
window.unequipItem = Controllers.unequipItem;
window.createAccessCode = Controllers.createAccessCode;
window.forceReset = Controllers.forceReset;
window.gmGrantItem = () => Controllers.gmGrantItem(window.selectedCharId);
window.gmAdjustHP = (amt) => Controllers.gmAdjustHP(window.selectedCharId, amt);
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
window.setCombatActionField = Controllers.setCombatActionField;
window.rollForMe = Controllers.rollForMe;
window.resolveAttack = Controllers.resolveAttack;
window.passTurn = Controllers.passTurn;
window.endTurn = Controllers.endTurn;
window.addCombatantMidFight = Controllers.addCombatantMidFight;
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

  // 3. Render Navbar (Optional, for future)
  // const navHtml = Views.getNavbar(window.currentTab, window.currentUser); 
  // (We are currently using the sidebar in HTML, so we skip nav rendering for now)

  // 4. Render Main Content
  if (window.userRole === 'gm') {
    viewport.innerHTML = window.currentTab === 'COMBAT'
      ? Views.getCombatView(window.liveData, 'gm', window.currentUser)
      : Views.renderGMScreen(window.liveData);
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
       } else if (window.currentTab === 'DATA') {
          viewport.innerHTML = `<h1>DATA LOGS (COMING SOON)</h1>`;
       } else {
          viewport.innerHTML = `<h1>ARCHIVE OFFLINE</h1>`;
       }
    } else {
       // --- SHOW G.O.A.T. REGISTRATION ---
       viewport.innerHTML = Views.getRegistrationView(window.currentUser, window.liveData);
    }
  }

  maybeAnnounceTurn();
}

// --- TURN ANNOUNCEMENT (5s, all clients react to the same Firestore state) ---
window.lastAnnouncedTurnKey = null;
function maybeAnnounceTurn() {
  const combat = window.liveData && window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  const currentActor = combat.initiative_order[combat.turn_index];
  if (!currentActor) return;
  const key = `${combat.round}_${combat.turn_index}_${currentActor.combatant_id}`;
  if (window.lastAnnouncedTurnKey === key) return;
  window.lastAnnouncedTurnKey = key;
  showTurnAnnouncement(currentActor.name);
}

function showTurnAnnouncement(name) {
  let el = document.getElementById('turn-announcement');
  if (!el) {
    el = document.createElement('div');
    el.id = 'turn-announcement';
    el.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:5000; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px; color:var(--pip-green); font-family:VT323, monospace; cursor:pointer;';
    el.onclick = () => { el.style.display = 'none'; };
    document.body.appendChild(el);
  }
  el.innerHTML = `<div style="font-size:48px; text-shadow:0 0 10px rgba(51,255,51,0.6);">${name}'S TURN</div><div id="turn-announcement-countdown" style="font-size:18px; color:#888;">closing in 5...</div>`;
  el.style.display = 'flex';

  let secondsLeft = 5;
  const timer = setInterval(() => {
    secondsLeft -= 1;
    const countdownEl = document.getElementById('turn-announcement-countdown');
    if (countdownEl) countdownEl.innerText = secondsLeft > 0 ? `closing in ${secondsLeft}...` : 'closing...';
    if (secondsLeft <= 0) {
      clearInterval(timer);
      if (el) el.style.display = 'none';
    }
  }, 1000);
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