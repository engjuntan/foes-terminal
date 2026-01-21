import './style.css'

// 1. STATE MANAGEMENT
const appState = {
  currentTab: 'dashboard',
  secretUnlocked: localStorage.getItem('secret_unlocked') === 'true'
}

// 2. DOM ELEMENTS
const viewport = document.querySelector('#main-viewport');
const cmdInput = document.querySelector('#cmdInput');

// 3. CONTENT MODULES (This is where your Lore lives for now)
const content = {
  dashboard: `
    <h1>> DASHBOARD</h1>
    <p>STATUS: <span style="color:red; animation: blink 1s infinite;">CRITICAL</span></p>
    <p>LOC: Bandawang Waterworks</p>
    <hr style="border:0; border-bottom:1px dashed #33ff33; margin: 20px 0;">
    <h3>> ACTIVE ALERTS:</h3>
    <ul>
      <li>[!] Sector 2 Radiation Leak Detected</li>
      <li>[!] Unauthorized Biometrics: "Two"</li>
    </ul>
  `,
  logs: `
    <h1>> DATA LOGS</h1>
    <div style="border: 1px solid #33ff33; padding: 15px; margin-bottom: 15px;">
      <strong>ENTRY #14: Razak</strong><br>
      <span style="color: #1a801a;">DATE: 2247.10.14</span>
      <p>"My head is splitting. The pumps are screaming again..."</p>
    </div>
  `,
  map: `
    <h1>> TACTICAL MAP</h1>
    <p>LOADING SATELLITE FEED...</p>
    <div style="width:100%; height:300px; border: 2px dashed #33ff33; display:flex; align-items:center; justify-content:center;">
      [MAP IMAGE PLACEHOLDER]
    </div>
  `,
  secret: `
    <h1 style="color:red;">> CLASSIFIED: TEOH EYES ONLY</h1>
    <p>If you are reading this, the override was successful.</p>
    <p>TARGET: Warden Robo</p>
    <p>WEAKNESS: Thermal Port 3 (Back Panel)</p>
  `
}

// 4. FUNCTIONS
function render() {
  // Update Content
  viewport.innerHTML = content[appState.currentTab];
  
  // Update Buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if(btn.id === `btn-${appState.currentTab}`) btn.classList.add('active');
  });

  // Check Secret Visibility
  if(appState.secretUnlocked) {
    document.querySelector('#btn-secret').classList.remove('hidden');
  }
}

function handleCommand(e) {
  if (e.key === 'Enter') {
    const code = e.target.value.toUpperCase().trim();
    if (code === 'BLUE_BLOOD') {
      appState.secretUnlocked = true;
      localStorage.setItem('secret_unlocked', 'true');
      alert('ACCESS GRANTED');
      render();
    }
    e.target.value = '';
  }
}

// 5. EVENT LISTENERS
document.querySelector('#btn-dashboard').addEventListener('click', () => { appState.currentTab = 'dashboard'; render(); });
document.querySelector('#btn-logs').addEventListener('click', () => { appState.currentTab = 'logs'; render(); });
document.querySelector('#btn-map').addEventListener('click', () => { appState.currentTab = 'map'; render(); });
document.querySelector('#btn-secret').addEventListener('click', () => { appState.currentTab = 'secret'; render(); });

cmdInput.addEventListener('keypress', handleCommand);

// 6. INITIALIZE
render();

// Clock
setInterval(() => {
  document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);