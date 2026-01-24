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
window.adjustSkillDraft = Controllers.adjustSkillDraft;
window.confirmLevelUp = Controllers.confirmLevelUp;
window.cancelLevelUp = Controllers.cancelLevelUp;

window.openGMModal = (charId) => {
  window.selectedCharId = charId; // Store who we are editing globally
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
    viewport.innerHTML = Views.renderGMScreen(window.liveData);
  } else {
    if (window.currentTab === 'STATUS') {
      viewport.innerHTML = Views.getPlayerView(window.currentUser, window.liveData);
    } else if (window.currentTab === 'DATA') {
      viewport.innerHTML = `<h1>DATA LOGS (COMING SOON)</h1>`;
    } else {
      viewport.innerHTML = `<h1>ARCHIVE OFFLINE</h1>`;
    }
  }
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