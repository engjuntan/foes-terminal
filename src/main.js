// src/main.js
import { doc, onSnapshot } from "firebase/firestore";
import { db } from './firebase.js'; // Connection
import * as Views from './views.js'; // All HTML generators
import * as Controllers from './controllers.js'; // All Actions
import { formatGameTime } from './needs.js';
import { captureScrollPositions, restoreScrollPositions } from './scrollUtil.js';
import { shouldAnimateInitiative } from './combat.js';
import './style.css';

// --- GLOBAL STATE ---
window.liveData = null;
window.currentUser = null;
window.userRole = null;
window.currentTab = 'DASHBOARD';
// Whether the GM's character-management modal (id="gm-modal") is open,
// and on whom. Every GM action re-renders the whole GM screen from
// scratch (Firestore write -> onSnapshot -> render()), which used to
// blow away the modal's "open" state along with everything else in its
// markup — read by renderGMScreen() so a re-render reproduces the same
// open/closed state instead of resetting it. See openGMModal/closeGMModal.
window.gmModalOpen = false;

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
// Which inventory row the detail pane is showing. Pure view state — it
// never reaches Firestore, because what one player is looking at is
// nobody else's business and shouldn't cost a write. Clicking the
// selected row again closes the pane.
window.selectedInventoryItem = null;
window.selectInventoryItem = (itemId) => {
  window.selectedInventoryItem = window.selectedInventoryItem === itemId ? null : itemId;
  window.render();
};
window.reloadWeapon = Controllers.reloadWeapon;
window.createAccessCode = Controllers.createAccessCode;
window.forceReset = Controllers.forceReset;
window.gmGrantItem = () => Controllers.gmGrantItem(window.selectedCharId);
window.gmGrantItemToTarget = Controllers.gmGrantItemToTarget;
window.setGMStatusTarget = (charId) => { window.selectedCharId = charId; window.render(); };
window.gmUnequipItem = (slot) => Controllers.gmUnequipItem(window.selectedCharId, slot);
window.gmSaveBiography = () => Controllers.gmSaveBiography(window.selectedCharId);
window.savePlayerNotes = Controllers.savePlayerNotes;
window.gmGrantDataLog = Controllers.gmGrantDataLog;
window.openDataLog = Controllers.openDataLog;
window.gmGrantPerson = Controllers.gmGrantPerson;
window.openPerson = Controllers.openPerson;
window.gmGrantQuest = Controllers.gmGrantQuest;
window.openQuest = Controllers.openQuest;
window.gmSetQuestStatus = Controllers.gmSetQuestStatus;
window.toggleQuestObjective = Controllers.toggleQuestObjective;
window.gmGrantMap = Controllers.gmGrantMap;
window.gmGrantRecipe = Controllers.gmGrantRecipe;
window.openMap = Controllers.openMap;
window.sendMessage = Controllers.sendMessage;
window.openMessage = Controllers.openMessage;
window.gmAdjustHP = (amt) => Controllers.gmAdjustHP(window.selectedCharId, amt);
window.gmSetRadiation = (amt) => Controllers.gmSetRadiation(window.selectedCharId, amt);
window.gmSetNeed = (needKey, val) => Controllers.gmSetNeed(window.selectedCharId, needKey, val);
window.gmSetReputation = Controllers.gmSetReputation;
// Which character the GM's reputation sliders are pointed at. Pure view
// state — reputation is per character now, but whose sheet the GM happens
// to have open is nobody else's business and never reaches Firestore.
window.reputationTargetId = null;
window.setReputationTarget = (charId) => { window.reputationTargetId = charId; window.render(); };
window.gmSetKarma = (val) => Controllers.gmSetKarma(window.selectedCharId, val);
window.gmAddReputationEntity = Controllers.gmAddReputationEntity;
window.gmRenameReputationEntity = Controllers.gmRenameReputationEntity;
window.gmRemoveReputationEntity = Controllers.gmRemoveReputationEntity;
window.advanceTime = Controllers.advanceTime;
window.requestRest = Controllers.requestRest;
window.gmAdvanceTimeAction = Controllers.gmAdvanceTimeAction;
window.craftItem = Controllers.craftItem;
window.scrapItem = Controllers.scrapItem;
// Durability system: `slot` (a worn item) or `index` (a specific
// inventory copy, position ascending-sorted-by-marks) identify which
// copy — exactly one of the two is passed by the view, so `slot` wins if
// somehow both are (never expected in practice).
window.repairItem = (itemId, slot, index) => Controllers.repairItem(itemId, slot ? { slot } : { index });
window.gmSetItemCondition = (itemId, slot, index, marks) => Controllers.gmSetItemCondition(window.selectedCharId, itemId, slot ? { slot } : { index }, marks);
window.gmToggleStation = Controllers.gmToggleStation;
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
window.setCover = Controllers.setCover;
window.setCombatActionField = Controllers.setCombatActionField;
window.rollForMe = Controllers.rollForMe;
window.resolveAttack = Controllers.resolveAttack;
window.gmRerollLastResolution = Controllers.gmRerollLastResolution;
window.setPlayerCheckField = Controllers.setPlayerCheckField;
window.setPlayerCheckWhat = Controllers.setPlayerCheckWhat;
window.rollForPlayerCheck = Controllers.rollForPlayerCheck;
window.resolvePlayerCheck = Controllers.resolvePlayerCheck;
window.setGmCheckField = Controllers.setGmCheckField;
window.setGmCheckWhat = Controllers.setGmCheckWhat;
window.rollForGmCheck = Controllers.rollForGmCheck;
window.resolveGmCheck = Controllers.resolveGmCheck;
window.revealCheck = Controllers.revealCheck;
window.setHiddenCheckField = Controllers.setHiddenCheckField;
window.setHiddenCheckWhat = Controllers.setHiddenCheckWhat;
window.rollForHiddenCheck = Controllers.rollForHiddenCheck;
window.resolveHiddenCheck = Controllers.resolveHiddenCheck;
window.passTurn = Controllers.passTurn;
window.endTurn = Controllers.endTurn;
window.addCombatantMidFight = Controllers.addCombatantMidFight;
window.gmAdjustCombatantHP = Controllers.gmAdjustCombatantHP;
window.gmApplyStatusEffectInCombat = Controllers.gmApplyStatusEffectInCombat;
// Job 4 (weapon-swap approval).
window.gmApproveWeaponSwap = Controllers.gmApproveWeaponSwap;
window.gmDenyWeaponSwap = Controllers.gmDenyWeaponSwap;
// Direct (charId, instanceId) form — for removing an effect from a
// context (like the Combat view) that isn't scoped to a "selected
// character" the way the GM modal is.
window.gmRemoveStatusEffectDirect = Controllers.gmRemoveStatusEffect;
// Character Creation Actions
window.adjustCreationStat = Controllers.adjustCreationStat;
window.setCreationFocus = Controllers.setCreationFocus;
window.setCreationRace = Controllers.setCreationRace;
window.toggleCreationTag = Controllers.toggleCreationTag;
window.finalizeCharacter = Controllers.finalizeCharacter;
window.gmFactoryReset = () => Controllers.gmFactoryReset(window.selectedCharId);

// --- CRIPPLE SYSTEM (STATUS_AND_CRIPPLE_SPEC.md Part B/C) ---
window.gmSetLimbDamage = (partKey, val) => Controllers.gmSetLimbDamage(window.selectedCharId, partKey, val);
window.openTreatLimbDraft = Controllers.openTreatLimbDraft;
window.setTreatLimbField = Controllers.setTreatLimbField;
window.rollForTreatLimb = Controllers.rollForTreatLimb;
window.cancelTreatLimbDraft = Controllers.cancelTreatLimbDraft;
window.resolveTreatLimbDraft = Controllers.resolveTreatLimbDraft;

// --- CHEMS: addiction cure via Medicine check (Job 1, chem durations) ---
window.openCureAddictionDraft = Controllers.openCureAddictionDraft;
window.setCureAddictionRoll = Controllers.setCureAddictionRoll;
window.rollForCureAddiction = Controllers.rollForCureAddiction;
window.cancelCureAddictionDraft = Controllers.cancelCureAddictionDraft;
window.resolveCureAddictionDraft = Controllers.resolveCureAddictionDraft;

window.openGMModal = (charId) => {
  window.selectedCharId = charId; // Store who we are editing globally
  window.gmModalOpen = true;
  // Re-render so everything baked into the modal's HTML (title, active
  // status effects list, etc.) reflects the character just selected, and
  // the "open" flag above — renderGMScreen() reads both directly, so a
  // later re-render (e.g. after granting an item) reproduces the same
  // open modal instead of resetting to closed.
  window.render();
};

// Closes the GM modal without navigating away from the GM screen — the
// only way it should close is this, or Escape (see the keydown listener
// below). A grant/apply/adjust action must NOT close it: those all just
// re-render via the normal Firestore round-trip, which leaves
// window.gmModalOpen untouched.
window.closeGMModal = () => {
  window.gmModalOpen = false;
  window.render();
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

// --- ESCAPE CLOSES WHICHEVER MODAL IS OPEN ---
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (window.gmModalOpen) { window.closeGMModal(); return; }
  const wikiOverlay = document.getElementById('wiki-overlay');
  if (wikiOverlay && !wikiOverlay.classList.contains('hidden')) window.closeWiki();
});

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
  // Every re-render below replaces #main-viewport's innerHTML wholesale,
  // which resets scrollTop to 0 on every scrollable element inside it —
  // not just #main-viewport itself. Most screens actually scroll one of
  // their `.panel`s rather than the viewport (see scrollUtil.js), which
  // is why character creation used to jump back to the top on every
  // single click: allocating all 40 SPECIAL points meant scrolling back
  // down each time.
  const savedScrollPositions = captureScrollPositions(viewport);

  // 1. Handle Login Screen Visibility
  if (!window.currentUser) {
    if (loginScreen) loginScreen.style.display = 'flex'; // Use the CSS flex rule we fixed
    if (appInterface) appInterface.classList.add('hidden');
    return;
  }
  
  // 2. Logged In View
  if (loginScreen) loginScreen.style.display = 'none';
  if (appInterface) appInterface.classList.remove('hidden');

  // 3. World clock — lives in the sidebar shell (index.html), not the
  // per-tab viewport, so it's visible on every screen for every role.
  const clockEl = document.getElementById('game-clock');
  if (clockEl) {
    const worldMinutes = (window.liveData.world && window.liveData.world.minutes) || 480;
    clockEl.textContent = formatGameTime(worldMinutes).label;
  }

  // 4. Sync sidebar active state to the current tab, plus unread badges
  const navMap = { DASHBOARD: 'btn-dashboard', QUESTS: 'btn-quests', DATA_LOGS: 'btn-logs', MESSAGES: 'btn-messages', MAPS: 'btn-map', CHECKS: 'btn-checks', COMBAT: 'btn-combat', STATUS: 'btn-status', REPUTATION: 'btn-reputation' };
  Object.entries(navMap).forEach(([tab, id]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', window.currentTab === tab);
  });

  // 4a. Two nav buttons mean something different per role — the shared
  // sidebar has one DOM node per slot regardless of who's logged in, so
  // relabel/repoint them here rather than templating two navs in
  // index.html:
  //  - "1. DASHBOARD" reads "1. CHARACTER SHEET" for players (GM ruling
  //    2026-09-24) — same tab key (DASHBOARD), label only.
  //  - The old WORKSHOP slot becomes the GM's "GRANT ITEMS" tab; players
  //    keep WORKSHOP exactly as before.
  const dashboardBtn = document.getElementById('btn-dashboard');
  if (dashboardBtn) dashboardBtn.textContent = window.userRole === 'gm' ? '1. DASHBOARD' : '1. CHARACTER SHEET';
  const workshopBtn = document.getElementById('btn-workshop');
  if (workshopBtn) {
    const isGm = window.userRole === 'gm';
    const workshopTabName = isGm ? 'GRANT_ITEMS' : 'WORKSHOP';
    workshopBtn.textContent = isGm ? '7. GRANT ITEMS' : '7. WORKSHOP';
    workshopBtn.onclick = () => window.switchTab(workshopTabName);
    workshopBtn.classList.toggle('active', window.currentTab === workshopTabName);
  }

  if (window.userRole === 'player' && window.liveData.characters[window.currentUser]) {
    const char = window.liveData.characters[window.currentUser];
    const readLogs = new Set(char.read_logs || []);
    // People (job 5) live inside the same DATA LOGS tab/nav button, so
    // their unread count folds into the same badge rather than getting
    // one of its own.
    const readPeople = new Set(char.read_people || []);
    const unreadLogCount = (char.unlocked_logs || []).filter(id => !readLogs.has(id)).length
      + (char.unlocked_people || []).filter(id => !readPeople.has(id)).length;

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

  // 5. Render Main Content
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
    } else if (window.currentTab === 'GRANT_ITEMS') {
      viewport.innerHTML = Views.getGrantItemsView(window.liveData);
    } else if (window.currentTab === 'STATUS') {
      viewport.innerHTML = Views.getGMStatusView(window.liveData);
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
       if (window.currentTab === 'DASHBOARD') {
          viewport.innerHTML = Views.getPlayerView(window.currentUser, window.liveData);
       } else if (window.currentTab === 'STATUS') {
          viewport.innerHTML = Views.getStatusView(window.currentUser, window.liveData);
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
       } else if (window.currentTab === 'WORKSHOP') {
          viewport.innerHTML = Views.getWorkshopView(window.currentUser, window.liveData);
       } else if (window.currentTab === 'REPUTATION') {
          viewport.innerHTML = Views.getReputationView(window.currentUser, window.liveData);
       } else {
          viewport.innerHTML = Views.getPlayerView(window.currentUser, window.liveData);
       }
    } else {
       // --- SHOW G.O.A.T. REGISTRATION ---
       viewport.innerHTML = Views.getRegistrationView(window.currentUser, window.liveData);
    }
  }

  restoreScrollPositions(viewport, savedScrollPositions);

  maybeAnnounceTurn();
  maybeAnnounceWeaponSwap();
  maybeAnimateInitiative();
}

// --- BIG ANNOUNCEMENTS (combat start + turn changes + status-effect procs
// + weapon-swap results) ---
// Every connected client watches the same active_combat state and reacts
// independently — there's no "everyone's screen closes together" signal,
// each viewer's overlay is local to their own browser, driven off the
// same shared event data. That's why a dismiss only affects the person
// who clicked it: there's nothing to broadcast, everyone already saw
// (or is seeing) the same underlying announcement from the same write.
window.lastAnnouncedTurnKey = null;
window.lastAnnouncedCombatStartKey = null;
// Job 2: "the first thing everyone sees is an announcement... This
// replaces the first turn announcement only; every later turn keeps
// today's behaviour." startCombat() never sets last_turn_key — only
// endTurn() does, on the FIRST advance past turn 1 — so "no last_turn_key
// yet" is exactly the pre-first-turn state, and started_at (also set only
// by startCombat) is a stable identity for that particular fight.
function maybeAnnounceTurn() {
  const combat = window.liveData && window.liveData.active_combat;
  if (!combat || !combat.is_active) return;
  const currentActor = combat.initiative_order[combat.turn_index];
  if (!currentActor) return;

  if (!combat.last_turn_key) {
    const startKey = combat.started_at || 'unknown';
    if (window.lastAnnouncedCombatStartKey === startKey) return;
    window.lastAnnouncedCombatStartKey = startKey;
    showBigAnnouncement('COMBAT IS STARTING — ROLL FOR INITIATIVE', [], {
      label: 'GO TO COMBAT',
      onClick: () => window.switchTab('COMBAT')
    });
    return;
  }

  const key = combat.last_turn_key;
  if (window.lastAnnouncedTurnKey === key) return;
  window.lastAnnouncedTurnKey = key;
  showBigAnnouncement(`${currentActor.name}'S TURN`, combat.last_turn_events || []);
}

// Job 4: "everyone sees 'Weapon swap success!'... 'Weapon swap failed!'" —
// same "every client reacts independently to the same write" pattern as
// the turn announcement, keyed off combat.last_swap_result's own `key`
// (set fresh by gmApproveWeaponSwap/gmDenyWeaponSwap every time).
window.lastAnnouncedSwapKey = null;
function maybeAnnounceWeaponSwap() {
  const combat = window.liveData && window.liveData.active_combat;
  const result = combat && combat.last_swap_result;
  if (!result || !result.key) return;
  if (window.lastAnnouncedSwapKey === result.key) return;
  window.lastAnnouncedSwapKey = result.key;
  showBigAnnouncement(result.success ? 'WEAPON SWAP SUCCESS!' : 'WEAPON SWAP FAILED!', []);
}

function showBigAnnouncement(headline, sublines, actionButton) {
  let el = document.getElementById('turn-announcement');
  if (!el) {
    el = document.createElement('div');
    el.id = 'turn-announcement';
    // overflow-y + padding: a long list of status-effect proc sublines
    // can in principle outgrow the viewport height; without this the
    // DISMISS button (and the rest of the message) would be pushed off
    // screen with no way to scroll down to it.
    el.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:5000; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; color:var(--pip-green); font-family:VT323, monospace; overflow-y:auto; padding:20px; box-sizing:border-box;';
    document.body.appendChild(el);
  }

  const sublinesHtml = (sublines || [])
    .map(line => `<div style="font-size:16px; color:#ff5555; text-align:center;">${line}</div>`)
    .join('');

  const actionHtml = actionButton ? `
    <button id="turn-announcement-action" style="padding:10px 34px; background:var(--pip-green); color:black; border:none; font-family:'VT323', monospace; font-size:18px; font-weight:bold; cursor:pointer;">${actionButton.label}</button>` : '';

  el.innerHTML = `
    <div style="font-size:48px; text-align:center; text-shadow:0 0 10px rgba(51,255,51,0.6); max-width:80vw;">${headline}</div>
    ${sublinesHtml ? `<div style="display:flex; flex-direction:column; gap:4px; max-width:70vw;">${sublinesHtml}</div>` : ''}
    <div style="display:flex; gap:12px;">
      ${actionHtml}
      <button id="turn-announcement-dismiss" style="position:relative; overflow:hidden; padding:10px 34px; background:#111; border:1px solid var(--pip-green); color:var(--pip-green); font-family:'VT323', monospace; font-size:18px; cursor:pointer;">
        <span id="turn-announcement-fill" style="position:absolute; inset:0; width:0%; background:rgba(51,255,51,0.35); z-index:0;"></span>
        <span style="position:relative; z-index:1;">DISMISS</span>
      </button>
    </div>
  `;
  el.style.display = 'flex';

  let closed = false;
  const close = () => { if (closed) return; closed = true; el.style.display = 'none'; clearTimeout(autoTimer); };
  document.getElementById('turn-announcement-dismiss').onclick = close;
  // Job 2: the action button both navigates AND dismisses — clicking it
  // is a complete response to the announcement, same as DISMISS.
  const actionEl = document.getElementById('turn-announcement-action');
  if (actionEl) actionEl.onclick = () => { close(); actionButton.onClick(); };

  // Fill the button over 5s via a CSS transition (starts after a paint
  // so the browser actually animates from 0, rather than snapping to 100%).
  // If nobody clicks anything before it fills, close() just dismisses —
  // no action fires (job 2: "If the countdown runs out and nobody
  // clicks, nothing happens — it just dismisses").
  const fillEl = document.getElementById('turn-announcement-fill');
  requestAnimationFrame(() => {
    if (fillEl) {
      fillEl.style.transition = 'width 5s linear';
      fillEl.style.width = '100%';
    }
  });

  const autoTimer = setTimeout(close, 5000);
}

// --- INITIATIVE REVEAL ANIMATION (job 3) ---
// Purely cosmetic client-side JS, same spirit as animateDiceRoll — no
// Firestore write per frame, just one write (markInitiativeSeen) once the
// whole reveal finishes. shouldAnimateInitiative (combat.js, pure and
// unit-tested) decides WHETHER to run; everything below is DOM-only.
window.__initiativeAnimatingKey = null;
function maybeAnimateInitiative() {
  if (window.userRole !== 'player' || window.currentTab !== 'COMBAT') return;
  const combat = window.liveData && window.liveData.active_combat;
  const char = window.liveData && window.liveData.characters && window.liveData.characters[window.currentUser];
  if (!combat || !char) return;
  if (!shouldAnimateInitiative(char, combat)) return;

  const key = combat.started_at;
  // Guards against re-triggering on every re-render while the animation
  // is mid-flight (another player's action can re-render this client at
  // any moment) — set BEFORE the async animation starts, cleared only by
  // markInitiativeSeen() actually landing (which changes char's own
  // seen_initiative_for and makes shouldAnimateInitiative false on its own).
  if (window.__initiativeAnimatingKey === key) return;
  window.__initiativeAnimatingKey = key;
  runInitiativeAnimation(combat.initiative_order, key);
}

function runInitiativeAnimation(order, key) {
  const container = document.getElementById('initiative-list');
  const rows = order.map(c => document.getElementById(`init-row-${c.combatant_id}`)).filter(Boolean);
  if (!container || rows.length === 0) { Controllers.markInitiativeSeen(key); return; }

  // Reveal order is shuffled (not the final sorted order) so the reveal
  // genuinely "sorts itself into order" once every roll's landed, rather
  // than just fading in an already-correct list top to bottom.
  const shuffled = [...rows].sort(() => Math.random() - 0.5);
  shuffled.forEach(row => {
    row.style.transition = 'opacity 0.3s, transform 0.3s';
    row.style.opacity = '0';
    row.style.transform = 'translateY(-6px)';
    container.appendChild(row); // re-inserted in shuffled order first
  });

  let i = 0;
  function revealNext() {
    if (i >= shuffled.length) {
      flipToFinalOrder(container, rows); // `rows` is already in combat's final sorted order
      setTimeout(() => Controllers.markInitiativeSeen(key), 500);
      return;
    }
    const row = shuffled[i];
    const rollSpan = row.querySelector('span[id^="init-roll-val-"]');
    const finalValue = row.dataset.roll;
    row.style.opacity = '1';
    row.style.transform = 'translateY(0)';
    if (!rollSpan) { i++; setTimeout(revealNext, 150); return; }

    // Ticks through random values before landing on the real one — the
    // real value was already decided server-side (combat.initiative_order
    // is stored final); this just delays revealing it, same idea as
    // animateDiceRoll.
    let ticks = 0;
    const maxTicks = 6 + Math.floor(Math.random() * 5);
    const tickTimer = setInterval(() => {
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(tickTimer);
        rollSpan.textContent = finalValue;
        i++;
        setTimeout(revealNext, 150);
      } else {
        rollSpan.textContent = 1 + Math.floor(Math.random() * 20);
      }
    }, 55);
  }
  revealNext();
}

// Classic FLIP (First/Last/Invert/Play): records each row's CURRENT
// on-screen position, moves the DOM nodes into `finalOrderRows`' order,
// then animates from where they visually WERE to where they now are —
// so the reorder reads as the list sliding into place instead of
// snapping.
function flipToFinalOrder(container, finalOrderRows) {
  const first = new Map();
  finalOrderRows.forEach(row => first.set(row, row.getBoundingClientRect()));
  finalOrderRows.forEach(row => container.appendChild(row));
  finalOrderRows.forEach(row => {
    const last = row.getBoundingClientRect();
    const firstRect = first.get(row);
    const dy = firstRect.top - last.top;
    if (dy) {
      row.style.transition = 'none';
      row.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        row.style.transition = 'transform 0.4s ease';
        row.style.transform = 'translateY(0)';
      });
    }
  });
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