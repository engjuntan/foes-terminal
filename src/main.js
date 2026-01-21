import './style.css'
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc } from "firebase/firestore"; // Added updateDoc

// 1. FIREBASE CONFIGURATION (PASTE YOUR KEYS BACK HERE!)
const firebaseConfig = {
  apiKey: "AIzaSyBOaUzRAx8DlZUK7kiaRo0CC3SRI-pGWNk",
  authDomain: "foes-2beca.firebaseapp.com",
  projectId: "foes-2beca",
  storageBucket: "foes-2beca.firebasestorage.app",
  messagingSenderId: "526195913580",
  appId: "1:526195913580:web:0790c9c5a807112bb2f949"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. STATE
const viewport = document.querySelector('#main-viewport');
const cmdInput = document.querySelector('#cmdInput');
let currentTab = 'dashboard';
let liveData = {}; 
let isAdmin = false; // New Admin Flag

// 3. LISTENER
function subscribeToData() {
  onSnapshot(doc(db, "prisoncampaign", "alpha_team"), (doc) => {
    if (doc.exists()) {
      liveData = doc.data();
      render(); 
    }
  });
}

// 4. WRITE DATA (The new GM Power)
async function updateHP(character, amount) {
  const ref = doc(db, "prisoncampaign", "alpha_team");
  // Calculate new HP (prevent going below 0)
  const newHP = Math.max(0, liveData[`hp_${character}`] + amount);
  await updateDoc(ref, { [`hp_${character}`]: newHP });
}

async function setAlert(status) {
  const ref = doc(db, "prisoncampaign", "alpha_team");
  await updateDoc(ref, { alert_level: status });
}

// 5. CONTENT GENERATORS
function getDashboardContent() {
  if (!liveData.hp_kong) return "<h1>> ESTABLISHING UPLINK...</h1>";
  
  const maxHpKong = 50; 
  const maxHpIron = 40; 
  const maxHpTwo = 30;

  return `
    <h1>> LIVE PRISON FEED</h1>
    <p>ALERT: <span style="color:${liveData.alert_level === 'CRITICAL' ? 'red' : '#33ff33'}">${liveData.alert_level}</span></p>
    <hr style="border:0; border-bottom:1px dashed #33ff33; margin: 20px 0;">
    
    <div style="margin-bottom: 15px;">
      <div style="display:flex; justify-content:space-between;">
        <span>KONG</span>
        <span>${liveData.hp_kong} / ${maxHpKong}</span>
      </div>
      <div style="width: 100%; height: 12px; border: 1px solid #1a801a; margin-top:5px;">
        <div style="width: ${(liveData.hp_kong / maxHpKong) * 100}%; height: 100%; background: #33ff33;"></div>
      </div>
    </div>

    <div style="margin-bottom: 15px;">
      <div style="display:flex; justify-content:space-between;">
        <span>IRON LEG</span>
        <span>${liveData.hp_iron_leg} / ${maxHpIron}</span>
      </div>
      <div style="width: 100%; height: 12px; border: 1px solid #1a801a; margin-top:5px;">
        <div style="width: ${(liveData.hp_iron_leg / maxHpIron) * 100}%; height: 100%; background: #33ff33;"></div>
      </div>
    </div>

    <div style="margin-bottom: 15px;">
      <div style="display:flex; justify-content:space-between;">
        <span>TWO</span>
        <span>${liveData.hp_two} / ${maxHpTwo}</span>
      </div>
      <div style="width: 100%; height: 12px; border: 1px solid #1a801a; margin-top:5px;">
        <div style="width: ${(liveData.hp_two / maxHpTwo) * 100}%; height: 100%; background: #33ff33;"></div>
      </div>
    </div>
  `;
}

function getAdminContent() {
  return `
    <h1 style="color:red;">> GM OVERRIDE PANEL</h1>
    
    <div style="border: 1px solid red; padding: 20px;">
      <h3>MODIFY HP</h3>
      
      <div style="margin-bottom: 10px;">
        <strong>KONG:</strong> 
        <button class="gm-btn" onclick="window.modHP('kong', -1)">-1</button>
        <button class="gm-btn" onclick="window.modHP('kong', -5)">-5</button>
        <button class="gm-btn" onclick="window.modHP('kong', 5)">+5</button>
      </div>

      <div style="margin-bottom: 10px;">
        <strong>IRON:</strong> 
        <button class="gm-btn" onclick="window.modHP('iron_leg', -1)">-1</button>
        <button class="gm-btn" onclick="window.modHP('iron_leg', -5)">-5</button>
        <button class="gm-btn" onclick="window.modHP('iron_leg', 5)">+5</button>
      </div>

      <div style="margin-bottom: 10px;">
        <strong>TWO:</strong> 
        <button class="gm-btn" onclick="window.modHP('two', -1)">-1</button>
        <button class="gm-btn" onclick="window.modHP('two', -5)">-5</button>
        <button class="gm-btn" onclick="window.modHP('two', 5)">+5</button>
      </div>
      
      <hr style="border-color: red;">
      <h3>SET ALERT LEVEL</h3>
      <button class="gm-btn" onclick="window.modAlert('NORMAL')">NORMAL</button>
      <button class="gm-btn" onclick="window.modAlert('CAUTION')">CAUTION</button>
      <button class="gm-btn" onclick="window.modAlert('CRITICAL')">CRITICAL</button>
    </div>
  `;
}

// Expose functions to HTML (Window scope)
window.modHP = (char, amt) => updateHP(char, amt);
window.modAlert = (val) => setAlert(val);


// 6. RENDER
function render() {
  if (currentTab === 'dashboard') viewport.innerHTML = getDashboardContent();
  else if (currentTab === 'logs') viewport.innerHTML = `<h1>> LOGS</h1><p>No new logs.</p>`;
  else if (currentTab === 'admin') viewport.innerHTML = getAdminContent();
  
  // Navbar Highlighting
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if(btn.id === `btn-${currentTab}`) btn.classList.add('active');
  });

  // Show Admin Button if unlocked
  if(isAdmin) document.querySelector('#btn-admin').classList.remove('hidden');
}

// 7. INPUT HANDLING (Password Protection)
cmdInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const val = e.target.value.trim().toUpperCase();
    if (val === 'GM_ACCESS') {
      isAdmin = true;
      alert('ADMIN PRIVILEGES GRANTED');
      render();
    }
    e.target.value = '';
  }
});

// 8. NAVIGATION
document.querySelector('#btn-dashboard').addEventListener('click', () => { currentTab = 'dashboard'; render(); });
document.querySelector('#btn-logs').addEventListener('click', () => { currentTab = 'logs'; render(); });
document.querySelector('#btn-admin').addEventListener('click', () => { currentTab = 'admin'; render(); });

subscribeToData();

// Handle the SEND button click
document.querySelector('#cmdBtn').addEventListener('click', () => {
  const input = document.querySelector('#cmdInput');
  // Trigger the existing logic manually
  const event = new KeyboardEvent('keypress', { key: 'Enter' });
  input.value = input.value; // Keep value for the listener to read
  input.dispatchEvent(event);
  // Logic inside listener will clear the input, but we need to ensure our listener logic runs.
  // Actually, easier way: just copy the logic.
  const val = input.value.trim().toUpperCase();
  if (val === 'GM_ACCESS') {
     isAdmin = true;
     alert('ADMIN PRIVILEGES GRANTED');
     render();
  } else if (val === 'BLUE_BLOOD') {
     // ... (If you have other codes) ...
  }
  input.value = '';
});