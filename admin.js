/* ============================================================
   admin.js — NOBLESSE RP Admin Panel — Full CRUD Edition
   Credentials:
     Admin:       admin       / noblesse2025
     Super Admin: superadmin  / noblesse_super_2025
   ============================================================ */

/* ============================================================
   CREDENTIALS & ROLE SYSTEM
   ============================================================ */
const CREDENTIALS = {
  admin:       { password: 'noblesse2025',       role: 'Administrator',  isSuperAdmin: false },
  superadmin:  { password: 'noblesse_super_2025', role: 'Super Admin',   isSuperAdmin: true  },
};
let currentUser = null;

/* ============================================================
   LOCALSTORAGE DATA LAYER
   ============================================================ */
const DB = {
  get: (key, def) => { try { return JSON.parse(localStorage.getItem('nrp_' + key)) || def; } catch { return def; } },
  set: (key, val) => localStorage.setItem('nrp_' + key, JSON.stringify(val)),
  genId: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
};

/* ── Default seed data ── */
function seedDefaults() {
  if (!DB.get('seeded', false)) {
    DB.set('players', [
      { id: DB.genId(), name:'Victor_Nzinga', discord:'#264751829', faction:'La Famiglia Nera', status:'online',  playtime:'1,247h', joined:'Jan 2024' },
      { id: DB.genId(), name:'Sofia_Reyes',   discord:'#384920471', faction:'LSPD',             status:'online',  playtime:'832h',   joined:'Mar 2024' },
      { id: DB.genId(), name:'Marco_Bianchi', discord:'#193847562', faction:'Iron Ravens MC',   status:'online',  playtime:'956h',   joined:'Feb 2024' },
      { id: DB.genId(), name:'Lena_Fischer',  discord:'#829104738', faction:'LSEMS',            status:'offline', playtime:'421h',   joined:'May 2024' },
      { id: DB.genId(), name:'Jack_Moreno',   discord:'#748291047', faction:'None',             status:'banned',  playtime:'12h',    joined:'Jul 2024' },
      { id: DB.genId(), name:'Amara_Diallo',  discord:'#629847102', faction:'LSPD',             status:'online',  playtime:'603h',   joined:'Apr 2024' },
    ]);
    DB.set('factions', [
      { id: DB.genId(), name:'Los Santos Police Dept.', type:'Law Enforcement', status:'open',    members:35, capacity:50, leader:'Capt. Rodriguez', desc:'Serve and protect the citizens of Los Santos.' },
      { id: DB.genId(), name:'La Famiglia Nera',        type:'Criminal Org.',   status:'closed',  members:28, capacity:35, leader:'Don Vincenzo',    desc:'Elite underground syndicate operating in the shadows.' },
      { id: DB.genId(), name:'LSEMS',                   type:'Emergency Svcs',  status:'open',    members:22, capacity:40, leader:'Dr. Adeyemi',     desc:'Dedicated paramedics and doctors saving lives.' },
      { id: DB.genId(), name:'Iron Ravens MC',          type:'Motorcycle Club', status:'open',    members:18, capacity:30, leader:'Pres. Hawk',      desc:'Brotherhood forged in steel and chrome.' },
      { id: DB.genId(), name:'Noblesse Legal Group',    type:'Legal System',    status:'open',    members:10, capacity:20, leader:'J. Fontaine',     desc:'Lawyers, judges, and prosecutors of Los Santos.' },
    ]);
    DB.set('staff', [
      { id: DB.genId(), displayName:'Super Admin',  username:'superadmin', role:'Super Admin',   status:'active', added:'Jan 2024' },
      { id: DB.genId(), displayName:'Mod Alex',     username:'mod_alex',   role:'Moderator',     status:'active', added:'Feb 2024' },
      { id: DB.genId(), displayName:'Support Sara', username:'sup_sara',   role:'Support',       status:'active', added:'Apr 2024' },
    ]);
    DB.set('tiers', [
      { id: DB.genId(), name:'CITIZEN',        price:'9.99',  perks:['Priority queue access','Exclusive citizen tag','Custom license plate','5,000 in-game bonus'], featured:false },
      { id: DB.genId(), name:'NOBLE',          price:'19.99', perks:['All Citizen perks','VIP spawn location','Exclusive Noble title','15,000 in-game bonus','Exclusive vehicle wraps'], featured:true },
      { id: DB.genId(), name:'NOBLESSE ELITE', price:'39.99', perks:['All Noble perks','Staff interaction priority','Custom accessories','40,000 in-game bonus','Exclusive Discord role','Monthly recognition'], featured:false },
    ]);
    DB.set('bans', [
      { id: DB.genId(), player:'Jack_Moreno',  type:'Temp Ban',  reason:'RDM x3',             by:'Mod_Alex',  duration:'7 Days',   date:'Aug 1 2025' },
      { id: DB.genId(), player:'AnonTroll99',  type:'Perm Ban',  reason:'Hacking/exploiting', by:'SuperAdmin', duration:'Permanent', date:'Jul 28 2025' },
      { id: DB.genId(), player:'SpeedHack_01', type:'Perm Ban',  reason:'Speed exploit abuse', by:'Mod_Lucas', duration:'Permanent', date:'Jul 26 2025' },
    ]);
    DB.set('announcements', [
      { id: DB.genId(), cat:'Server Update', title:'Patch 2.4.1 — Economy Rebalance',  body:'Economy has been rebalanced for a better experience.', date:'Aug 2, 2025' },
      { id: DB.genId(), cat:'Event',         title:'End of Summer Race Tournament',     body:'Join us this weekend for the biggest race event of the year!', date:'Jul 28, 2025' },
      { id: DB.genId(), cat:'Rules Update',  title:'Updated Combat Rules — NVL Clause', body:'Please review the updated NVL clause in the rules section.', date:'Jul 20, 2025' },
    ]);
    DB.set('seeded', true);
  }
}

/* ============================================================
   LOGIN LOGIC
   ============================================================ */
const loginOverlay = document.getElementById('login-overlay');
const adminPanel   = document.getElementById('admin-panel');
const loginForm    = document.getElementById('login-form');
const loginError   = document.getElementById('login-error');
const passInput    = document.getElementById('admin-password');

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`;
document.head.appendChild(shakeStyle);

document.getElementById('toggle-pass').addEventListener('click', function() {
  passInput.type = passInput.type === 'password' ? 'text' : 'password';
  this.innerHTML = passInput.type === 'text' ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('admin-username').value.trim().toLowerCase();
  const pass = passInput.value;
  const cred = CREDENTIALS[user];

  if (cred && pass === cred.password) {
    currentUser = { username: user, ...cred };
    loginOverlay.style.opacity = '0';
    loginOverlay.style.pointerEvents = 'none';
    setTimeout(() => loginOverlay.style.display = 'none', 400);
    adminPanel.classList.add('visible');
    applyRoleUI();
    seedDefaults();
    initDashboard();
  } else {
    loginError.textContent = 'Invalid credentials. Please try again.';
    const card = document.getElementById('login-card');
    card.style.animation = 'none';
    setTimeout(() => { card.style.animation = 'shake 0.4s ease'; }, 10);
    setTimeout(() => { loginError.textContent = ''; }, 3000);
  }
});

/* ============================================================
   ROLE-BASED UI
   ============================================================ */
function applyRoleUI() {
  const u = currentUser;
  document.getElementById('sidebar-avatar').textContent   = u.username[0].toUpperCase();
  document.getElementById('sidebar-username').textContent = u.username;
  document.getElementById('sidebar-role').textContent     = u.role;

  if (u.isSuperAdmin) {
    document.querySelectorAll('.superadmin-only').forEach(el => el.style.display = '');
    document.getElementById('sa-section-label').style.display = '';
  }
}

/* ============================================================
   SIDEBAR + NAVIGATION
   ============================================================ */
const sidebarEl   = document.getElementById('sidebar');
const adminMain   = document.getElementById('admin-main');
let sidebarCollapsed = false;

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  sidebarEl.classList.toggle('collapsed', sidebarCollapsed);
  adminMain.classList.toggle('expanded', sidebarCollapsed);
}
document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
document.getElementById('topbar-menu-btn').addEventListener('click', () => {
  if (window.innerWidth <= 768) sidebarEl.classList.toggle('mobile-open');
  else toggleSidebar();
});

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const pg = document.getElementById('page-' + pageId);
  if (pg) pg.classList.add('active');
  const lk = document.getElementById('sidebar-' + pageId) || document.querySelector(`[data-page="${pageId}"]`);
  if (lk) lk.classList.add('active');
  document.getElementById('breadcrumb-current').textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g,' ');
  renderPage(pageId);
  if (window.innerWidth <= 768) sidebarEl.classList.remove('mobile-open');
}
window.switchPage = switchPage;

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => { e.preventDefault(); const p = link.dataset.page; if (p) switchPage(p); });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  adminPanel.classList.remove('visible');
  loginOverlay.style.display = 'flex';
  setTimeout(() => { loginOverlay.style.opacity = '1'; loginOverlay.style.pointerEvents = 'all'; }, 10);
  document.getElementById('admin-username').value = '';
  passInput.value = '';
  document.querySelectorAll('.superadmin-only').forEach(el => el.style.display = 'none');
});

/* ============================================================
   PAGE ROUTER
   ============================================================ */
function renderPage(pageId) {
  switch (pageId) {
    case 'players':      renderPlayersTable(); break;
    case 'applications': renderApplications(); break;
    case 'bans':         renderBansTable();    break;
    case 'announcements':renderAnnouncements();break;
    case 'staff':        renderStaff();        break;
    case 'faction-crud': renderFactionCrud();  break;
    case 'store-crud':   renderStoreCrud();    break;
    case 'player-crud':  renderPlayerCrud();   break;
    case 'dashboard':    initDashboard();      break;
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function initDashboard() {
  renderPlayersTable();
  renderApplications();
  renderBansTable();
  renderAnnouncements();
  initCharts();
  document.getElementById('refresh-dashboard-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('refresh-dashboard-btn');
    btn.innerHTML = '<i class="fa-solid fa-rotate-right fa-spin"></i> Refreshing...';
    setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refresh'; showToast('Dashboard refreshed!', 'success'); }, 1200);
  });
  document.getElementById('qa-restart-btn')?.addEventListener('click', () => {
    if (confirm('⚠️ Restart the server? All players will be disconnected.')) showToast('Server restart initiated. ETA: 60s.', 'info');
  });
}

/* ============================================================
   CHARTS
   ============================================================ */
function initCharts() {
  Chart.defaults.color = '#7D8693';
  Chart.defaults.font.family = 'Inter';
  const pCtx = document.getElementById('playersChart');
  if (pCtx && !pCtx._chartInstance) {
    pCtx._chartInstance = new Chart(pCtx, {
      type: 'line',
      data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label: 'Players Online', data: [98,115,104,138,162,189,147], borderColor: '#C8A45A', backgroundColor: 'rgba(200,164,90,0.08)', borderWidth: 2, pointBackgroundColor: '#C8A45A', pointBorderColor: '#0F1115', pointBorderWidth: 2, pointRadius: 5, fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(125,134,147,0.08)' } }, y: { grid: { color: 'rgba(125,134,147,0.08)' }, beginAtZero: false, min: 80 } } }
    });
  }
  const rCtx = document.getElementById('revenueChart');
  if (rCtx && !rCtx._chartInstance) {
    rCtx._chartInstance = new Chart(rCtx, {
      type: 'doughnut',
      data: { labels: ['Noble','Elite','Citizen'], datasets: [{ data: [640,440,160], backgroundColor: ['#C8A45A','#E3C98A','#7D8693'], borderColor: '#1A1D24', borderWidth: 3, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } }
    });
  }
}

/* ============================================================
   PLAYERS TABLE (read-only page)
   ============================================================ */
const APPLICATIONS_DATA = [
  { name:'Elias_Fontaine', date:'Aug 2, 2025', age:'24', experience:'3 years FiveM RP, ex-NoPixel.', char:'Detective turned rogue.', rp_style:'Character-driven storytelling.' },
  { name:'Maria_Santos',   date:'Aug 1, 2025', age:'21', experience:'2 years serious RP.',          char:'Nurse with a dark past.',  rp_style:'Medical RP, faction politics.' },
  { name:'Tyler_Morrison', date:'Aug 1, 2025', age:'27', experience:'5 years GTA RP.',              char:'Retired cartel enforcer.', rp_style:'Criminal redemption arc.' },
  { name:'Aria_Volkov',    date:'Jul 31, 2025',age:'22', experience:'1.5 years Eclipse RP.',        char:'Law student intern.',      rp_style:'Legal RP, courtroom drama.' },
];

function renderPlayersTable() {
  const tbody = document.getElementById('players-tbody');
  if (!tbody) return;
  const players = DB.get('players', []);
  tbody.innerHTML = '';
  players.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="player-cell"><div class="player-avatar">${p.name[0]}</div><span>${p.name}</span></div></td>
      <td style="color:var(--slate);font-size:0.78rem">${p.discord}</td>
      <td>${p.faction}</td>
      <td><span class="status-pill ${p.status}">${cap(p.status)}</span></td>
      <td style="color:var(--gold)">${p.playtime}</td>
      <td style="color:var(--slate)">${p.joined}</td>
      <td><div class="action-btns">
        <button class="tbl-btn" onclick="openBanModal('${p.name}')">Ban</button>
      </div></td>`;
    tbody.appendChild(row);
  });

  const search = document.getElementById('player-search');
  if (search) {
    search.oninput = (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#players-tbody tr').forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none');
    };
  }
}

/* ============================================================
   APPLICATIONS
   ============================================================ */
function renderApplications() {
  const grid = document.getElementById('apps-grid');
  if (!grid) return;
  grid.innerHTML = '';
  APPLICATIONS_DATA.forEach((app, i) => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="app-header"><span class="app-name">${app.name}</span><span class="app-date">${app.date}</span></div>
      <div class="app-field"><span class="app-field-label">AGE</span><span class="app-field-val">${app.age}</span></div>
      <div class="app-field"><span class="app-field-label">EXPERIENCE</span><span class="app-field-val">${app.experience}</span></div>
      <div class="app-field"><span class="app-field-label">CHARACTER</span><span class="app-field-val">${app.char}</span></div>
      <div class="app-field"><span class="app-field-label">RP STYLE</span><span class="app-field-val">${app.rp_style}</span></div>
      <div class="app-footer">
        <button class="app-btn-approve" onclick="handleApp(${i},this)"><i class="fa-solid fa-check"></i> APPROVE</button>
        <button class="app-btn-deny"    onclick="handleAppDeny(${i},this)"><i class="fa-solid fa-xmark"></i> DENY</button>
      </div>`;
    grid.appendChild(card);
  });
}
function handleApp(idx, btn) {
  const card = btn.closest('.app-card'); const name = APPLICATIONS_DATA[idx].name;
  card.style.borderColor = 'rgba(74,222,128,0.4)';
  showToast(`✓ ${name} approved and whitelisted.`, 'success');
  card.querySelectorAll('button').forEach(b => b.disabled = true);
  setTimeout(() => { card.style.opacity='0'; card.style.transform='scale(0.95)'; card.style.transition='all 0.4s'; setTimeout(()=>card.remove(),400); },1500);
}
function handleAppDeny(idx, btn) {
  const card = btn.closest('.app-card'); const name = APPLICATIONS_DATA[idx].name;
  card.style.borderColor = 'rgba(224,85,85,0.4)';
  showToast(`✗ Application from ${name} denied.`, 'error');
  card.querySelectorAll('button').forEach(b => b.disabled = true);
  setTimeout(() => { card.style.opacity='0'; card.style.transform='scale(0.95)'; card.style.transition='all 0.4s'; setTimeout(()=>card.remove(),400); },1500);
}
window.handleApp = handleApp; window.handleAppDeny = handleAppDeny;

/* ============================================================
   BANS TABLE
   ============================================================ */
function renderBansTable() {
  const tbody = document.getElementById('bans-tbody');
  if (!tbody) return;
  const bans = DB.get('bans', []);
  tbody.innerHTML = '';
  bans.forEach(b => {
    const isPerm=b.type==='Perm Ban', isWarn=b.type==='Warning';
    const color = isPerm ? 'var(--red)' : isWarn ? 'var(--gold)' : '#f97316';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="player-cell"><div class="player-avatar" style="background:rgba(224,85,85,0.15);color:var(--red)">${b.player[0]}</div><span>${b.player}</span></div></td>
      <td><span style="font-size:0.75rem;font-weight:700;color:${color}">${b.type}</span></td>
      <td style="color:var(--slate);font-size:0.83rem;max-width:200px">${b.reason}</td>
      <td style="color:var(--slate)">${b.by}</td>
      <td style="color:${isPerm?'var(--red)':'var(--ivory)'}">${b.duration}</td>
      <td style="color:var(--slate)">${b.date}</td>
      <td><div class="action-btns">
        <button class="tbl-btn" onclick="openCrud('ban','edit',${JSON.stringify(b).replace(/"/g,'&quot;')})">Edit</button>
        <button class="tbl-btn danger" onclick="confirmDelete('ban','${b.id}','${b.player}')">Delete</button>
      </div></td>`;
    tbody.appendChild(row);
  });
}

/* ============================================================
   ANNOUNCEMENTS
   ============================================================ */
function renderAnnouncements() {
  const list = document.getElementById('announce-list');
  if (!list) return;
  const anns = DB.get('announcements', []);
  list.innerHTML = '';
  anns.forEach(a => {
    const el = document.createElement('div');
    el.className = 'announce-item';
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span class="announce-item-cat">${a.cat}</span>
        <div style="display:flex;gap:6px">
          <button class="tbl-btn" style="font-size:0.65rem;padding:3px 8px" onclick="openCrud('announcement','edit',${JSON.stringify(a).replace(/"/g,'&quot;')})">Edit</button>
          <button class="tbl-btn danger" style="font-size:0.65rem;padding:3px 8px" onclick="confirmDelete('announcement','${a.id}','${a.title}')">Del</button>
        </div>
      </div>
      <p class="announce-item-title">${a.title}</p>
      <span class="announce-item-date">${a.date}</span>`;
    list.appendChild(el);
  });
}
function publishAnnouncement() {
  const title = document.getElementById('announce-title').value.trim();
  const body  = document.getElementById('announce-body').value.trim();
  const cat   = document.getElementById('announce-category').value;
  if (!title || !body) { showToast('Please fill title and message.', 'error'); return; }
  const anns = DB.get('announcements', []);
  anns.unshift({ id: DB.genId(), cat: cat.toUpperCase(), title, body, date: fmtDate() });
  DB.set('announcements', anns);
  renderAnnouncements();
  document.getElementById('announce-title').value = '';
  document.getElementById('announce-body').value = '';
  showToast('Announcement published!', 'success');
}
window.publishAnnouncement = publishAnnouncement;

/* ============================================================
   BAN MODAL
   ============================================================ */
const banModal = document.getElementById('ban-modal');
function openBanModal(name) { banModal.classList.add('open'); if (name) document.getElementById('ban-player-name').value = name; }
function closeBanModal()    { banModal.classList.remove('open'); document.getElementById('ban-player-name').value=''; document.getElementById('ban-reason').value=''; }
function confirmBan() {
  const name=document.getElementById('ban-player-name').value.trim();
  const type=document.getElementById('ban-type-select').value;
  const reason=document.getElementById('ban-reason').value.trim();
  const dur=document.getElementById('ban-duration').value;
  if (!name||!reason) { showToast('Fill all fields.','error'); return; }
  const bans=DB.get('bans',[]);
  bans.unshift({ id:DB.genId(), player:name, type, reason, by:currentUser?.username||'Admin', duration:dur||'N/A', date:fmtDate() });
  DB.set('bans',bans);
  renderBansTable();
  closeBanModal();
  showToast(`${type} issued to ${name}.`,'success');
}
banModal?.addEventListener('click', e => { if(e.target===banModal) closeBanModal(); });
window.openBanModal=openBanModal; window.closeBanModal=closeBanModal; window.confirmBan=confirmBan;

/* ============================================================
   ██████╗ ██████╗ ██╗   ██╗██████╗
  ██╔════╝██╔══██╗██║   ██║██╔══██╗
  ██║     ██████╔╝██║   ██║██║  ██║
  ██║     ██╔══██╗██║   ██║██║  ██║
  ╚██████╗██║  ██║╚██████╔╝██████╔╝
   ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝
   UNIVERSAL CRUD ENGINE
   ============================================================ */

let crudState = { entity: null, mode: null, editId: null };

const CRUD_MODAL  = document.getElementById('crud-modal');
const CRUD_BODY   = document.getElementById('crud-modal-body');
const CRUD_TITLE  = document.getElementById('crud-modal-title');
const DELETE_MODAL= document.getElementById('delete-modal');

/* ── Open CRUD Modal ── */
function openCrud(entity, mode, data) {
  crudState = { entity, mode, editId: data?.id || null };
  CRUD_TITLE.innerHTML = `<i class="fa-solid fa-${mode==='create'?'plus':'pen-to-square'}"></i> ${cap(mode)} ${capEntity(entity)}`;
  CRUD_BODY.innerHTML  = buildForm(entity, mode, data);
  CRUD_MODAL.classList.add('open');
  CRUD_MODAL.onclick = e => { if (e.target === CRUD_MODAL) closeCrudModal(); };
}
window.openCrud = openCrud;

function closeCrudModal() { CRUD_MODAL.classList.remove('open'); crudState = {}; }
window.closeCrudModal = closeCrudModal;

/* ── Build Form Fields ── */
function buildForm(entity, mode, d) {
  d = d || {};
  switch (entity) {
    /* ---- PLAYER ---- */
    case 'player': return `
      <div class="crud-field-row">
        <div class="crud-field"><label>In-Game Name *</label><input id="cf-name" value="${d.name||''}" placeholder="John_Doe" /></div>
        <div class="crud-field"><label>Discord ID *</label><input id="cf-discord" value="${d.discord||''}" placeholder="#123456789" /></div>
      </div>
      <div class="crud-field-row">
        <div class="crud-field"><label>Faction</label>
          <select id="cf-faction">${factionOptions(d.faction)}</select>
        </div>
        <div class="crud-field"><label>Status</label>
          <select id="cf-status">
            ${['online','offline','banned'].map(s=>`<option value="${s}" ${d.status===s?'selected':''}>${cap(s)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="crud-field-row">
        <div class="crud-field"><label>Playtime</label><input id="cf-playtime" value="${d.playtime||'0h'}" placeholder="120h" /></div>
        <div class="crud-field"><label>Joined (e.g. Jan 2024)</label><input id="cf-joined" value="${d.joined||''}" placeholder="Jan 2025" /></div>
      </div>`;

    /* ---- FACTION ---- */
    case 'faction': return `
      <div class="crud-field"><label>Faction Name *</label><input id="cf-name" value="${d.name||''}" placeholder="Los Santos PD" /></div>
      <div class="crud-field-row">
        <div class="crud-field"><label>Type *</label>
          <select id="cf-type">${['Law Enforcement','Criminal Org.','Emergency Svcs','Motorcycle Club','Legal System','Government','Civilian Org.'].map(t=>`<option value="${t}" ${d.type===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="crud-field"><label>Status</label>
          <select id="cf-status">${['open','closed','inactive'].map(s=>`<option value="${s}" ${d.status===s?'selected':''}>${cap(s)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="crud-field-row">
        <div class="crud-field"><label>Leader</label><input id="cf-leader" value="${d.leader||''}" placeholder="Character name" /></div>
        <div class="crud-field"><label>Max Capacity</label><input type="number" id="cf-capacity" value="${d.capacity||30}" min="1" /></div>
      </div>
      <div class="crud-field"><label>Description</label><textarea id="cf-desc" placeholder="Short description...">${d.desc||''}</textarea></div>`;

    /* ---- STAFF ---- */
    case 'staff': return `
      <div class="crud-field-row">
        <div class="crud-field"><label>Display Name *</label><input id="cf-displayName" value="${d.displayName||''}" placeholder="Mod Alex" /></div>
        <div class="crud-field"><label>Username *</label><input id="cf-username" value="${d.username||''}" placeholder="mod_alex" /></div>
      </div>
      ${mode==='create'?`<div class="crud-field"><label>Password *</label><input type="password" id="cf-password" placeholder="Set a secure password" /></div>`:''}
      <div class="crud-field-row">
        <div class="crud-field"><label>Role *</label>
          <select id="cf-role">${['Super Admin','Administrator','Moderator','Support'].map(r=>`<option value="${r}" ${d.role===r?'selected':''}>${r}</option>`).join('')}</select>
        </div>
        <div class="crud-field"><label>Status</label>
          <select id="cf-status">${['active','suspended'].map(s=>`<option value="${s}" ${d.status===s?'selected':''}>${cap(s)}</option>`).join('')}</select>
        </div>
      </div>`;

    /* ---- STORE TIER ---- */
    case 'tier': return `
      <div class="crud-field-row">
        <div class="crud-field"><label>Tier Name *</label><input id="cf-name" value="${d.name||''}" placeholder="NOBLE" /></div>
        <div class="crud-field"><label>Price (€/mo) *</label><input type="number" id="cf-price" value="${d.price||'9.99'}" step="0.01" min="0" /></div>
      </div>
      <div class="crud-field"><label>Featured (Most Popular)</label>
        <select id="cf-featured"><option value="false" ${!d.featured?'selected':''}>No</option><option value="true" ${d.featured?'selected':''}>Yes</option></select>
      </div>
      <div class="crud-field">
        <label>Perks <span style="font-weight:400;text-transform:none;letter-spacing:0;color:rgba(125,134,147,0.7)">— one per row</span></label>
        <div class="perks-list" id="perks-list">
          ${(d.perks||[]).map((p,i)=>`<div class="perk-row"><input value="${p}" placeholder="Perk description..." /><i class="fa-solid fa-xmark perk-remove" onclick="removePerk(this)"></i></div>`).join('')}
        </div>
        <button class="add-perk-btn" onclick="addPerk()"><i class="fa-solid fa-plus"></i> Add Perk</button>
      </div>`;

    /* ---- BAN EDIT ---- */
    case 'ban': return `
      <div class="crud-field"><label>Player Name</label><input id="cf-player" value="${d.player||''}" /></div>
      <div class="crud-field-row">
        <div class="crud-field"><label>Type</label>
          <select id="cf-type">${['Perm Ban','Temp Ban','Warning','Kick'].map(t=>`<option value="${t}" ${d.type===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="crud-field"><label>Duration</label><input id="cf-duration" value="${d.duration||'N/A'}" placeholder="7 Days / Permanent" /></div>
      </div>
      <div class="crud-field"><label>Reason</label><textarea id="cf-reason">${d.reason||''}</textarea></div>`;

    /* ---- ANNOUNCEMENT EDIT ---- */
    case 'announcement': return `
      <div class="crud-field"><label>Category</label>
        <select id="cf-cat">${['Server Update','Event','Maintenance','Community','Rules Update'].map(c=>`<option value="${c.toUpperCase()}" ${d.cat===c.toUpperCase()?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="crud-field"><label>Title *</label><input id="cf-title" value="${d.title||''}" /></div>
      <div class="crud-field"><label>Body *</label><textarea id="cf-body">${d.body||''}</textarea></div>`;

    default: return '<p style="color:var(--slate)">Unknown entity.</p>';
  }
}

function factionOptions(selected) {
  const factions = ['None', ...DB.get('factions', []).map(f => f.name)];
  return factions.map(f => `<option value="${f}" ${f===selected?'selected':''}>${f}</option>`).join('');
}

function addPerk() {
  const list = document.getElementById('perks-list');
  const row  = document.createElement('div');
  row.className = 'perk-row';
  row.innerHTML = `<input placeholder="Perk description..." /><i class="fa-solid fa-xmark perk-remove" onclick="removePerk(this)"></i>`;
  list.appendChild(row);
}
function removePerk(el) { el.closest('.perk-row').remove(); }
window.addPerk = addPerk; window.removePerk = removePerk;

/* ── Save CRUD ── */
function saveCrud() {
  const { entity, mode, editId } = crudState;
  const key   = entity === 'faction' ? 'factions' : entity === 'tier' ? 'tiers' : entity === 'ban' ? 'bans' : entity === 'announcement' ? 'announcements' : entity + 's';
  let records = DB.get(key, []);

  let record = {};
  try {
    switch (entity) {
      case 'player':
        record = { name: val('cf-name'), discord: val('cf-discord'), faction: val('cf-faction'), status: val('cf-status'), playtime: val('cf-playtime'), joined: val('cf-joined') };
        if (!record.name || !record.discord) { showToast('Name and Discord ID are required.', 'error'); return; }
        break;
      case 'faction':
        record = { name: val('cf-name'), type: val('cf-type'), status: val('cf-status'), leader: val('cf-leader'), capacity: parseInt(val('cf-capacity'))||30, members: 0, desc: val('cf-desc') };
        if (!record.name) { showToast('Faction name is required.', 'error'); return; }
        break;
      case 'staff':
        record = { displayName: val('cf-displayName'), username: val('cf-username'), role: val('cf-role'), status: val('cf-status'), added: fmtDate() };
        if (mode === 'create') record.password = val('cf-password');
        if (!record.displayName || !record.username) { showToast('Display name and username are required.', 'error'); return; }
        break;
      case 'tier':
        const perks = [...document.querySelectorAll('#perks-list .perk-row input')].map(i => i.value.trim()).filter(Boolean);
        record = { name: val('cf-name'), price: val('cf-price'), featured: val('cf-featured') === 'true', perks };
        if (!record.name || !record.price) { showToast('Tier name and price are required.', 'error'); return; }
        break;
      case 'ban':
        record = { player: val('cf-player'), type: val('cf-type'), duration: val('cf-duration'), reason: val('cf-reason'), by: currentUser?.username||'Admin', date: fmtDate() };
        break;
      case 'announcement':
        record = { cat: val('cf-cat'), title: val('cf-title'), body: val('cf-body'), date: fmtDate() };
        if (!record.title) { showToast('Title is required.', 'error'); return; }
        break;
    }
  } catch (err) { showToast('Error reading form.', 'error'); return; }

  if (mode === 'create') {
    record.id = DB.genId();
    records.unshift(record);
  } else {
    const idx = records.findIndex(r => r.id === editId);
    if (idx > -1) records[idx] = { ...records[idx], ...record };
    else { showToast('Record not found.', 'error'); return; }
  }

  DB.set(key, records);
  closeCrudModal();
  renderPage(currentPageId(entity));
  showToast(`${capEntity(entity)} ${mode === 'create' ? 'created' : 'updated'} successfully.`, 'success');
}
window.saveCrud = saveCrud;

/* ============================================================
   DELETE ENGINE
   ============================================================ */
let deleteCallback = null;

function confirmDelete(entity, id, label) {
  document.getElementById('delete-modal-msg').innerHTML = `Are you sure you want to permanently delete <strong style="color:var(--ivory)">${label}</strong>?<br/><span style="font-size:0.78rem;color:var(--red)">This action cannot be undone.</span>`;
  DELETE_MODAL.classList.add('open');
  DELETE_MODAL.onclick = e => { if (e.target === DELETE_MODAL) closeDeleteModal(); };
  document.getElementById('delete-confirm-btn').onclick = () => { executeDelete(entity, id); closeDeleteModal(); };
}
function closeDeleteModal() { DELETE_MODAL.classList.remove('open'); }
function executeDelete(entity, id) {
  const key = entity === 'faction' ? 'factions' : entity === 'tier' ? 'tiers' : entity === 'ban' ? 'bans' : entity === 'announcement' ? 'announcements' : entity + 's';
  let records = DB.get(key, []);
  records = records.filter(r => r.id !== id);
  DB.set(key, records);
  renderPage(currentPageId(entity));
  showToast('Record deleted.', 'success');
}
window.confirmDelete = confirmDelete; window.closeDeleteModal = closeDeleteModal;

/* ============================================================
   STAFF PAGE (CRUD)
   ============================================================ */
function renderStaff() {
  const tbody = document.getElementById('staff-tbody');
  if (!tbody) return;
  const staff = DB.get('staff', []);
  tbody.innerHTML = '';
  staff.forEach(s => {
    const roleClass = 'role-' + s.role.toLowerCase().replace(' ', '');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="player-cell"><div class="player-avatar" style="background:linear-gradient(135deg,rgba(200,164,90,0.2),rgba(200,164,90,0.05))">${s.displayName[0]}</div><span>${s.displayName}</span></div></td>
      <td style="color:var(--slate);font-family:monospace;font-size:0.8rem">${s.username}</td>
      <td><span class="role-badge ${roleClass}">${s.role}</span></td>
      <td><span class="status-pill ${s.status==='active'?'online':'offline'}">${cap(s.status)}</span></td>
      <td style="color:var(--slate)">${s.added}</td>
      <td><div class="action-btns">
        <button class="tbl-btn" onclick="openCrud('staff','edit',${JSON.stringify(s).replace(/"/g,'&quot;')})">Edit</button>
        <button class="tbl-btn danger" onclick="confirmDelete('staff','${s.id}','${s.displayName}')">Delete</button>
      </div></td>`;
    tbody.appendChild(row);
  });
}

/* ============================================================
   FACTION CRUD PAGE
   ============================================================ */
function renderFactionCrud() {
  const tbody = document.getElementById('faction-tbody');
  if (!tbody) return;
  const factions = DB.get('factions', []);

  // KPI row
  const kpiRow = document.getElementById('faction-kpi-row');
  if (kpiRow) {
    const totalM = factions.reduce((a,f) => a+f.members, 0);
    const open   = factions.filter(f=>f.status==='open').length;
    kpiRow.innerHTML = `
      <div class="kpi-card"><div class="kpi-icon gold"><i class="fa-solid fa-people-group"></i></div><div class="kpi-body"><span class="kpi-label">TOTAL FACTIONS</span><span class="kpi-value">${factions.length}</span></div></div>
      <div class="kpi-card"><div class="kpi-icon green"><i class="fa-solid fa-door-open"></i></div><div class="kpi-body"><span class="kpi-label">RECRUITING</span><span class="kpi-value">${open}</span></div></div>
      <div class="kpi-card"><div class="kpi-icon"><i class="fa-solid fa-users"></i></div><div class="kpi-body"><span class="kpi-label">TOTAL MEMBERS</span><span class="kpi-value">${totalM}</span></div></div>
      <div class="kpi-card"><div class="kpi-icon red"><i class="fa-solid fa-lock"></i></div><div class="kpi-body"><span class="kpi-label">INVITE ONLY</span><span class="kpi-value">${factions.length-open}</span></div></div>`;
  }

  tbody.innerHTML = '';
  factions.forEach(f => {
    const fillPct = Math.min(100, Math.round((f.members/f.capacity)*100));
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="player-cell"><div class="player-avatar" style="background:rgba(200,164,90,0.12);color:var(--gold)">${f.name[0]}</div><span style="font-weight:600">${f.name}</span></div></td>
      <td><span class="faction-type-badge">${f.type}</span></td>
      <td><span class="status-pill ${f.status==='open'?'online':f.status==='closed'?'banned':'offline'}">${cap(f.status)}</span></td>
      <td style="color:var(--gold);font-weight:700">${f.members}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:4px;background:rgba(125,134,147,0.15);border-radius:2px"><div style="width:${fillPct}%;height:100%;background:var(--gold);border-radius:2px"></div></div>
          <span style="font-size:0.75rem;color:var(--slate)">${f.capacity}</span>
        </div>
      </td>
      <td style="color:var(--slate)">${f.leader}</td>
      <td><div class="action-btns">
        <button class="tbl-btn" onclick="openCrud('faction','edit',${JSON.stringify(f).replace(/"/g,'&quot;')})">Edit</button>
        <button class="tbl-btn danger" onclick="confirmDelete('faction','${f.id}','${f.name}')">Delete</button>
      </div></td>`;
    tbody.appendChild(row);
  });
}

/* ============================================================
   STORE CRUD PAGE
   ============================================================ */
function renderStoreCrud() {
  const grid = document.getElementById('store-crud-grid');
  if (!grid) return;
  const tiers = DB.get('tiers', []);
  grid.innerHTML = '';
  tiers.forEach(t => {
    const card = document.createElement('div');
    card.className = 'store-tier-card';
    card.innerHTML = `
      ${t.featured ? '<span class="store-tier-badge">MOST POPULAR</span>' : ''}
      <p class="store-tier-name">${t.name}</p>
      <div class="store-tier-price"><sup>€</sup>${t.price}<sub>/mo</sub></div>
      <ul class="store-tier-perks">
        ${(t.perks||[]).map(p => `<li><i class="fa-solid fa-check"></i>${p}</li>`).join('')}
      </ul>
      <div class="store-tier-actions">
        <button class="tbl-btn" style="flex:1;justify-content:center" onclick="openCrud('tier','edit',${JSON.stringify(t).replace(/"/g,'&quot;')})"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="tbl-btn danger" onclick="confirmDelete('tier','${t.id}','${t.name}')"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    grid.appendChild(card);
  });
}

/* ============================================================
   PLAYER CRUD PAGE (Full CRUD with search)
   ============================================================ */
function renderPlayerCrud() {
  const tbody = document.getElementById('crud-players-tbody');
  if (!tbody) return;
  const players = DB.get('players', []);
  tbody.innerHTML = '';
  players.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="player-cell"><div class="player-avatar">${p.name[0]}</div><span>${p.name}</span></div></td>
      <td style="color:var(--slate);font-size:0.78rem">${p.discord}</td>
      <td>${p.faction}</td>
      <td><span class="status-pill ${p.status}">${cap(p.status)}</span></td>
      <td style="color:var(--gold)">${p.playtime}</td>
      <td style="color:var(--slate)">${p.joined}</td>
      <td><div class="action-btns">
        <button class="tbl-btn" onclick="openCrud('player','edit',${JSON.stringify(p).replace(/"/g,'&quot;')})">Edit</button>
        <button class="tbl-btn danger" onclick="confirmDelete('player','${p.id}','${p.name}')">Delete</button>
      </div></td>`;
    tbody.appendChild(row);
  });

  const search = document.getElementById('crud-player-search');
  if (search) {
    search.oninput = e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#crud-players-tbody tr').forEach(r => r.style.display = r.textContent.toLowerCase().includes(q)?'':'none');
    };
  }
}

/* ============================================================
   QUICK-ACTION BUTTONS
   ============================================================ */
['qa-ban-btn','qa-announce-btn','qa-apps-btn','qa-reports-btn','qa-store-btn'].forEach(id => {
  const btn = document.getElementById(id);
  if (!btn) return;
  const map = { 'qa-ban-btn':'bans','qa-announce-btn':'announcements','qa-apps-btn':'applications','qa-reports-btn':'reports','qa-store-btn':'store' };
  btn.onclick = () => switchPage(map[id]);
});

/* ============================================================
   HELPERS
   ============================================================ */
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const capEntity = e => ({ 'player':'Player','faction':'Faction','staff':'Staff Member','tier':'Store Tier','ban':'Ban Record','announcement':'Announcement' }[e]||cap(e));
const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
const fmtDate = () => new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
function currentPageId(entity) {
  const map = { 'player':'player-crud','faction':'faction-crud','staff':'staff','tier':'store-crud','ban':'bans','announcement':'announcements' };
  return map[entity] || entity;
}

/* ============================================================
   TOAST
   ============================================================ */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, type='info') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}
window.showToast = showToast;
