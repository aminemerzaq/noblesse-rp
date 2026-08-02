/* ============================================================
   admin.js — NOBLESSE RP Admin Panel Logic
   ============================================================ */

/* ---- Mock Data ---- */
const PLAYERS = [
  { name:'Victor_Nzinga', id:'#264751829', faction:'La Famiglia Nera', status:'online', playtime:'1,247h', joined:'Jan 2024' },
  { name:'Sofia_Reyes',   id:'#384920471', faction:'LSPD',             status:'online', playtime:'832h',   joined:'Mar 2024' },
  { name:'Marco_Bianchi', id:'#193847562', faction:'Iron Ravens MC',   status:'online', playtime:'956h',   joined:'Feb 2024' },
  { name:'Lena_Fischer',  id:'#829104738', faction:'LSEMS',            status:'offline',playtime:'421h',   joined:'May 2024' },
  { name:'Jack_Moreno',   id:'#748291047', faction:'None',             status:'banned', playtime:'12h',    joined:'Jul 2024' },
  { name:'Amara_Diallo',  id:'#629847102', faction:'LSPD',             status:'online', playtime:'603h',   joined:'Apr 2024' },
  { name:'Dmitri_Volkov', id:'#102947385', faction:'La Famiglia Nera', status:'offline',playtime:'1,540h', joined:'Dec 2023' },
  { name:'Nina_Cortez',   id:'#847201938', faction:'LSEMS',            status:'online', playtime:'318h',   joined:'Jun 2024' },
];

const BANS = [
  { player:'Jack_Moreno',  type:'Temp Ban',   reason:'RDM x3 incidents',    by:'Mod_Alex', duration:'7 Days', date:'Aug 1 2025' },
  { player:'AnonTroll99',  type:'Perm Ban',   reason:'Hacking/exploiting',  by:'SuperAdmin',duration:'Permanent', date:'Jul 28 2025' },
  { player:'SpeedHack_01', type:'Perm Ban',   reason:'Speed exploit abuse',  by:'Mod_Lucas', duration:'Permanent', date:'Jul 26 2025' },
  { player:'NoSkill_Karl', type:'Warning',    reason:'OOC toxicity in voice',by:'Mod_Alex', duration:'N/A',      date:'Jul 24 2025' },
  { player:'Racer_Brett',  type:'Temp Ban',   reason:'VDM during pursuit',   by:'Mod_Sara',  duration:'3 Days',   date:'Jul 20 2025' },
];

const APPLICATIONS = [
  { name:'Elias_Fontaine',   date:'Aug 2, 2025', age:'24', experience:'3 years FiveM RP, ex-NoPixel whitelisted.', char:'Detective turned rogue — seeking justice outside the law.', rp_style:'Deep character-driven, long-arc storytelling.' },
  { name:'Maria_Santos',     date:'Aug 1, 2025', age:'21', experience:'2 years serious RP, previous LSPD faction lead.', char:'A nurse with a dark past and an addiction to adrenaline.', rp_style:'Medical RP, faction politics, emotional storytelling.' },
  { name:'Tyler_Morrison',   date:'Aug 1, 2025', age:'27', experience:'5 years GTA RP, ran own server for 2 years.', char:'Retired cartel enforcer building a legit life in LS.', rp_style:'Criminal redemption arc, business development.' },
  { name:'Aria_Volkov',      date:'Jul 31, 2025',age:'22', experience:'1.5 years RP on Eclipse RP.', char:'Law student interning at the DA\'s office by day.', rp_style:'Legal RP, courtroom drama, political intrigue.' },
  { name:'Hassan_Barkawi',   date:'Jul 30, 2025',age:'26', experience:'4 years RP, content creator with 50k+ subs.', char:'Investigative journalist uncovering city corruption.', rp_style:'Journalism RP, undercover operations, media.' },
  { name:'Cleo_Adeyemi',     date:'Jul 29, 2025',age:'23', experience:'2 years Eclipse + owner of an RP podcast.', char:'Street artist whose work attracts dangerous attention.', rp_style:'Cultural RP, gang adjacent, art-world crossover.' },
];

const ANNOUNCEMENTS_DATA = [
  { cat:'SERVER UPDATE', title:'Patch 2.4.1 — Economy Rebalance', date:'Aug 2, 2025' },
  { cat:'EVENT',         title:'End of Summer Race Tournament',    date:'Jul 28, 2025' },
  { cat:'RULES UPDATE',  title:'Updated Combat Rules — NVL Clause',date:'Jul 20, 2025' },
  { cat:'COMMUNITY',     title:'Staff Appreciation Week',          date:'Jul 10, 2025' },
];

/* ============================================================
   LOGIN LOGIC
   ============================================================ */
const loginOverlay  = document.getElementById('login-overlay');
const adminPanel    = document.getElementById('admin-panel');
const loginForm     = document.getElementById('login-form');
const loginError    = document.getElementById('login-error');
const togglePassBtn = document.getElementById('toggle-pass');
const passInput     = document.getElementById('admin-password');

const ADMIN_CREDENTIALS = { username: 'admin', password: 'noblesse2025' };

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('admin-username').value.trim();
  const pass = passInput.value;

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    loginOverlay.style.opacity = '0';
    loginOverlay.style.pointerEvents = 'none';
    setTimeout(() => { loginOverlay.style.display = 'none'; }, 400);
    adminPanel.classList.add('visible');
    initDashboard();
  } else {
    loginError.textContent = 'Invalid credentials. Please try again.';
    document.getElementById('login-card').style.animation = 'none';
    setTimeout(() => { document.getElementById('login-card').style.animation = 'shake 0.4s ease'; }, 10);
    setTimeout(() => { loginError.textContent = ''; }, 3000);
  }
});

/* Shake animation */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`;
document.head.appendChild(shakeStyle);

togglePassBtn.addEventListener('click', () => {
  const type = passInput.type === 'password' ? 'text' : 'password';
  passInput.type = type;
  togglePassBtn.innerHTML = type === 'text' ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
});

/* ============================================================
   SIDEBAR + NAVIGATION
   ============================================================ */
const sidebarEl   = document.getElementById('sidebar');
const adminMain   = document.getElementById('admin-main');
const sidebarTog  = document.getElementById('sidebar-toggle');
const topbarMenu  = document.getElementById('topbar-menu-btn');
let sidebarCollapsed = false;

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  sidebarEl.classList.toggle('collapsed', sidebarCollapsed);
  adminMain.classList.toggle('expanded', sidebarCollapsed);
}

sidebarTog.addEventListener('click', toggleSidebar);
topbarMenu.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    sidebarEl.classList.toggle('mobile-open');
  } else {
    toggleSidebar();
  }
});

/* Page switching */
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) targetPage.classList.add('active');
  const targetLink = document.getElementById('sidebar-' + pageId) ||
                     document.querySelector(`[data-page="${pageId}"]`);
  if (targetLink) targetLink.classList.add('active');
  const breadcrumb = document.getElementById('breadcrumb-current');
  if (breadcrumb) breadcrumb.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
}
window.switchPage = switchPage;

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) switchPage(page);
    if (window.innerWidth <= 768) sidebarEl.classList.remove('mobile-open');
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  adminPanel.classList.remove('visible');
  loginOverlay.style.display = 'flex';
  setTimeout(() => { loginOverlay.style.opacity = '1'; loginOverlay.style.pointerEvents = 'all'; }, 10);
  document.getElementById('admin-username').value = '';
  passInput.value = '';
});

/* ============================================================
   DASHBOARD INIT
   ============================================================ */
function initDashboard() {
  renderPlayersTable();
  renderApplications();
  renderBansTable();
  renderAnnouncements();
  initCharts();
}

/* ============================================================
   CHARTS (Chart.js)
   ============================================================ */
function initCharts() {
  Chart.defaults.color = '#7D8693';
  Chart.defaults.font.family = 'Inter';

  /* Players chart */
  const pCtx = document.getElementById('playersChart');
  if (pCtx && !pCtx._chartInstance) {
    pCtx._chartInstance = new Chart(pCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Players Online',
          data: [98, 115, 104, 138, 162, 189, 147],
          borderColor: '#C8A45A',
          backgroundColor: 'rgba(200,164,90,0.08)',
          borderWidth: 2,
          pointBackgroundColor: '#C8A45A',
          pointBorderColor: '#0F1115',
          pointBorderWidth: 2,
          pointRadius: 5,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(125,134,147,0.08)' }, ticks: { font: { size: 11 } } },
          y: { grid: { color: 'rgba(125,134,147,0.08)' }, ticks: { font: { size: 11 } }, beginAtZero: false, min: 80 }
        }
      }
    });
  }

  /* Revenue donut */
  const rCtx = document.getElementById('revenueChart');
  if (rCtx && !rCtx._chartInstance) {
    rCtx._chartInstance = new Chart(rCtx, {
      type: 'doughnut',
      data: {
        labels: ['Noble', 'Elite', 'Citizen'],
        datasets: [{
          data: [640, 440, 160],
          backgroundColor: ['#C8A45A','#E3C98A','#7D8693'],
          borderColor: '#1A1D24',
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false } }
      }
    });
  }
}

/* ============================================================
   PLAYERS TABLE
   ============================================================ */
function renderPlayersTable() {
  const tbody = document.getElementById('players-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  PLAYERS.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="player-cell">
          <div class="player-avatar">${p.name[0]}</div>
          <span>${p.name}</span>
        </div>
      </td>
      <td style="color:var(--slate);font-size:0.78rem;">${p.id}</td>
      <td>${p.faction}</td>
      <td><span class="status-pill ${p.status}">${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span></td>
      <td style="color:var(--gold)">${p.playtime}</td>
      <td style="color:var(--slate)">${p.joined}</td>
      <td>
        <div class="action-btns">
          <button class="tbl-btn">View</button>
          <button class="tbl-btn">Warn</button>
          <button class="tbl-btn danger" onclick="openBanModal('${p.name}')">Ban</button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

/* Player search */
const playerSearch = document.getElementById('player-search');
if (playerSearch) {
  playerSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#players-tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ============================================================
   APPLICATIONS
   ============================================================ */
function renderApplications() {
  const grid = document.getElementById('apps-grid');
  if (!grid) return;
  grid.innerHTML = '';
  APPLICATIONS.forEach((app, i) => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="app-header">
        <span class="app-name">${app.name}</span>
        <span class="app-date">${app.date}</span>
      </div>
      <div class="app-field"><span class="app-field-label">AGE</span><span class="app-field-val">${app.age}</span></div>
      <div class="app-field"><span class="app-field-label">RP EXPERIENCE</span><span class="app-field-val">${app.experience}</span></div>
      <div class="app-field"><span class="app-field-label">CHARACTER CONCEPT</span><span class="app-field-val">${app.char}</span></div>
      <div class="app-field"><span class="app-field-label">RP STYLE</span><span class="app-field-val">${app.rp_style}</span></div>
      <div class="app-footer">
        <button class="app-btn-approve" onclick="handleApp(${i}, 'approve', this)"><i class="fa-solid fa-check"></i> APPROVE</button>
        <button class="app-btn-deny" onclick="handleApp(${i}, 'deny', this)"><i class="fa-solid fa-xmark"></i> DENY</button>
      </div>`;
    grid.appendChild(card);
  });
}

function handleApp(idx, action, btn) {
  const card = btn.closest('.app-card');
  const name = APPLICATIONS[idx].name;
  if (action === 'approve') {
    card.style.borderColor = 'rgba(74,222,128,0.4)';
    showToast(`✓ ${name} has been approved and whitelisted.`, 'success');
  } else {
    card.style.borderColor = 'rgba(224,85,85,0.4)';
    showToast(`✗ Application from ${name} has been denied.`, 'error');
  }
  card.querySelectorAll('button').forEach(b => b.disabled = true);
  setTimeout(() => { card.style.opacity = '0'; card.style.transform = 'scale(0.95)'; card.style.transition = 'all 0.4s'; setTimeout(() => card.remove(), 400); }, 1500);
}
window.handleApp = handleApp;

/* ============================================================
   BANS TABLE
   ============================================================ */
function renderBansTable() {
  const tbody = document.getElementById('bans-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  BANS.forEach(b => {
    const isPerm = b.type === 'Perm Ban';
    const isWarn = b.type === 'Warning';
    const color  = isPerm ? 'var(--red)' : isWarn ? 'var(--gold)' : '#f97316';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="player-cell">
          <div class="player-avatar" style="background:rgba(224,85,85,0.15);color:var(--red)">${b.player[0]}</div>
          <span>${b.player}</span>
        </div>
      </td>
      <td><span style="font-size:0.75rem;font-weight:700;color:${color}">${b.type}</span></td>
      <td style="color:var(--slate);font-size:0.83rem;max-width:200px">${b.reason}</td>
      <td style="color:var(--slate)">${b.by}</td>
      <td style="color:${isPerm ? 'var(--red)':'var(--ivory)'}">${b.duration}</td>
      <td style="color:var(--slate)">${b.date}</td>
      <td>
        <div class="action-btns">
          <button class="tbl-btn">View</button>
          <button class="tbl-btn danger" onclick="unbanPlayer('${b.player}')">Unban</button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

function unbanPlayer(name) {
  if (confirm(`Unban ${name}?`)) showToast(`${name} has been unbanned.`, 'info');
}
window.unbanPlayer = unbanPlayer;

/* ============================================================
   BAN MODAL
   ============================================================ */
const banModal = document.getElementById('ban-modal');
function openBanModal(playerName) {
  banModal.classList.add('open');
  if (playerName) document.getElementById('ban-player-name').value = playerName;
}
function closeBanModal() {
  banModal.classList.remove('open');
  document.getElementById('ban-player-name').value = '';
  document.getElementById('ban-reason').value = '';
}
function confirmBan() {
  const name   = document.getElementById('ban-player-name').value.trim();
  const type   = document.getElementById('ban-type-select').value;
  const reason = document.getElementById('ban-reason').value.trim();
  if (!name || !reason) { showToast('Please fill in all fields.', 'error'); return; }
  BANS.unshift({ player: name, type, reason, by: 'Admin', duration: document.getElementById('ban-duration').value || 'N/A', date: new Date().toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) });
  renderBansTable();
  closeBanModal();
  showToast(`${type} issued to ${name}.`, 'success');
}
window.openBanModal  = openBanModal;
window.closeBanModal = closeBanModal;
window.confirmBan    = confirmBan;
banModal.addEventListener('click', (e) => { if (e.target === banModal) closeBanModal(); });

/* ============================================================
   ANNOUNCEMENTS
   ============================================================ */
function renderAnnouncements() {
  const list = document.getElementById('announce-list');
  if (!list) return;
  list.innerHTML = '';
  ANNOUNCEMENTS_DATA.forEach(a => {
    const el = document.createElement('div');
    el.className = 'announce-item';
    el.innerHTML = `<span class="announce-item-cat">${a.cat}</span><p class="announce-item-title">${a.title}</p><span class="announce-item-date">${a.date}</span>`;
    list.appendChild(el);
  });
}

function publishAnnouncement() {
  const title = document.getElementById('announce-title').value.trim();
  const body  = document.getElementById('announce-body').value.trim();
  const cat   = document.getElementById('announce-category').value;
  if (!title || !body) { showToast('Please fill in both title and message fields.', 'error'); return; }
  ANNOUNCEMENTS_DATA.unshift({ cat: cat.toUpperCase(), title, date: 'Just now' });
  renderAnnouncements();
  document.getElementById('announce-title').value = '';
  document.getElementById('announce-body').value = '';
  showToast('Announcement published successfully!', 'success');
}
window.publishAnnouncement = publishAnnouncement;

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, 3500);
}
window.showToast = showToast;

/* ============================================================
   DASHBOARD REFRESH BUTTON
   ============================================================ */
const refreshBtn = document.getElementById('refresh-dashboard-btn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right fa-spin"></i> Refreshing...';
    setTimeout(() => {
      refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refresh';
      showToast('Dashboard refreshed!', 'success');
    }, 1200);
  });
}

/* ============================================================
   SERVER RESTART CONFIRMATION
   ============================================================ */
const restartBtn = document.getElementById('qa-restart-btn');
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    if (confirm('⚠️ Are you sure you want to restart the server? All players will be disconnected.')) {
      showToast('Server restart initiated. ETA: 60 seconds.', 'info');
    }
  });
}
