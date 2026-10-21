/**
 * Abishek Apps & Tools Hub — Frontend Client Application
 * Handles Catalog, Context Search, Public Submissions, Auth & Admin Portal
 */

// ================= DOM & GLOBAL STATE =================
let allTools = [];
let currentUser = null;
let currentCategory = 'all';

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('hub_theme') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.remove('dark-theme');
  document.body.classList.add('light-theme');
}

themeToggle?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('hub_theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('hub_theme', 'dark');
  }
});

// Domain branding indicator
const host = window.location.hostname;
const subdomainPill = document.getElementById('subdomainPill');
if (subdomainPill) {
  if (host.includes('tools.')) {
    subdomainPill.textContent = 'tools.abishek.in · Developer Suite';
  } else if (host.includes('apps.')) {
    subdomainPill.textContent = 'apps.abishek.in · Applications Directory';
  } else {
    subdomainPill.textContent = 'apps.abishek.in & tools.abishek.in (Local)';
  }
}

// ================= MODAL HELPERS =================
window.openModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
};

window.closeModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
};

// Close modals when clicking backdrop
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
});

window.openRequestModal = () => openModal('modalRequest');
window.openBugModal = () => openModal('modalBug');
window.openContactModal = () => openModal('modalContact');
window.openAuthModal = () => openModal('modalAuth');

document.getElementById('btnOpenRequestModal')?.addEventListener('click', openRequestModal);
document.getElementById('btnOpenBugModal')?.addEventListener('click', openBugModal);
document.getElementById('btnOpenContactModal')?.addEventListener('click', openContactModal);
document.getElementById('btnOpenAuthModal')?.addEventListener('click', openAuthModal);

// ================= LOAD TOOLS & CATALOG =================
const toolsGrid = document.getElementById('toolsGrid');
const upcomingGrid = document.getElementById('upcomingGrid');
const toolSearchInput = document.getElementById('toolSearchInput');
const btnSearchClear = document.getElementById('btnSearchClear');
const sortSelect = document.getElementById('sortSelect');
const bugToolSelect = document.getElementById('bugToolSelect');

async function fetchTools() {
  try {
    const res = await fetch('/api/tools');
    const data = await res.json();
    allTools = data.tools || [];
    renderCatalog();
    renderUpcomingRoadmap();
    populateBugToolDropdown();
    updateCategoryCounters();
  } catch (err) {
    toolsGrid.innerHTML = `<div class="grid-loading" style="color:var(--danger)">Failed to load tools: ${err.message}</div>`;
  }
}

function updateCategoryCounters() {
  const liveTools = allTools.filter(t => !t.is_upcoming);
  const upcomingTools = allTools.filter(t => t.is_upcoming);

  document.getElementById('countAll').textContent = allTools.length;
  document.getElementById('countDev').textContent = allTools.filter(t => t.category === 'developer').length;
  document.getElementById('countFormatters').textContent = allTools.filter(t => t.category === 'formatters').length;
  document.getElementById('countMedia').textContent = allTools.filter(t => t.category === 'media').length;
  document.getElementById('countUpcoming').textContent = upcomingTools.length;
}

function populateBugToolDropdown() {
  if (!bugToolSelect) return;
  bugToolSelect.innerHTML = '<option value="">-- Select Tool --</option>';
  allTools.forEach(tool => {
    const opt = document.createElement('option');
    opt.value = tool.slug;
    opt.textContent = `${tool.icon} ${tool.name} (${tool.slug}.abishek.in)`;
    bugToolSelect.appendChild(opt);
  });
}

function renderCatalog() {
  const query = (toolSearchInput.value || '').toLowerCase().trim();
  const sort = sortSelect.value;

  // Filter
  let filtered = allTools.filter(tool => {
    // Category filter
    if (currentCategory === 'upcoming') {
      if (!tool.is_upcoming) return false;
    } else if (currentCategory !== 'all') {
      if (tool.category !== currentCategory) return false;
    }

    // Search query matching (smart context aware)
    if (query) {
      const matchName = tool.name.toLowerCase().includes(query);
      const matchDesc = (tool.short_desc || '').toLowerCase().includes(query);
      const matchTags = (tool.tags || []).some(t => t.toLowerCase().includes(query));
      const matchFeatures = (tool.features || []).some(f => f.toLowerCase().includes(query));
      const matchSlug = tool.slug.toLowerCase().includes(query);
      return matchName || matchDesc || matchTags || matchFeatures || matchSlug;
    }
    return true;
  });

  // Sort
  if (sort === 'popular') {
    filtered.sort((a, b) => b.likes_count - a.likes_count);
  } else if (sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Featured / display order
    filtered.sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
  }

  toolsGrid.innerHTML = '';

  if (filtered.length === 0) {
    toolsGrid.innerHTML = `
      <div class="grid-loading">
        <p style="font-size:16px; font-weight:600; color:var(--text-primary); margin-bottom:8px;">No tools matching "${query}"</p>
        <p>Can't find what you need? <a href="javascript:void(0)" onclick="openRequestModal()" style="color:var(--accent-blue)">Request this tool now ➜</a></p>
      </div>`;
    return;
  }

  filtered.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';

    const isUpcoming = tool.is_upcoming;
    const badgeClass = isUpcoming ? 'badge-upcoming' : (tool.badge === 'Beta' ? 'badge-beta' : 'badge-live');

    const featurePills = (tool.features || []).slice(0, 4).map(f => `<span class="feature-pill">${f}</span>`).join('');

    card.innerHTML = `
      <div class="tool-card-header">
        <div class="tool-icon-box">${tool.icon}</div>
        <div class="tool-badges">
          <span class="tool-badge ${badgeClass}">${tool.badge}</span>
        </div>
      </div>
      <h3 class="tool-title">${tool.name}</h3>
      <div class="tool-url-sub">${tool.url.replace('https://', '')}</div>
      <p class="tool-description">${tool.short_desc}</p>
      <div class="tool-features-list">${featurePills}</div>
      <div class="tool-card-footer">
        <button class="like-btn" onclick="likeTool('${tool.slug}', this)" title="Upvote this tool">
          <span>❤️</span>
          <span class="like-count">${tool.likes_count || 0}</span>
        </button>
        ${
          isUpcoming
            ? `<button class="notify-btn" onclick="openNotifyModal('${tool.slug}', '${tool.name}')">🔔 Notify on Launch</button>`
            : `<a href="${tool.url}" target="_blank" rel="noopener" class="launch-btn">Open Tool ↗</a>`
        }
      </div>
    `;

    toolsGrid.appendChild(card);
  });
}

// Render Upcoming Tools Roadmap Grid
function renderUpcomingRoadmap() {
  const upcoming = allTools.filter(t => t.is_upcoming);
  if (!upcomingGrid) return;
  upcomingGrid.innerHTML = '';

  upcoming.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'upcoming-card';
    card.innerHTML = `
      <div class="upcoming-card-header">
        <span class="upcoming-icon">${tool.icon}</span>
        <span class="launch-badge">${tool.launch_date || 'In Development'}</span>
      </div>
      <h4 style="font-size:16px; font-weight:700; margin-bottom:6px;">${tool.name}</h4>
      <p style="font-size:12.5px; color:var(--text-secondary); line-height:1.5; margin-bottom:16px; flex:1;">${tool.short_desc}</p>
      <button class="btn btn-secondary btn-sm w-full" onclick="openNotifyModal('${tool.slug}', '${tool.name}')">
        🔔 Notify Me When Available
      </button>
    `;
    upcomingGrid.appendChild(card);
  });
}

// Like / Upvote Tool
window.likeTool = async function (slug, btn) {
  try {
    const res = await fetch(`/api/tools/${slug}/like`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      btn.querySelector('.like-count').textContent = data.likes;
      btn.style.color = '#ec4899';
    }
  } catch (e) {}
};

// Search Events
toolSearchInput?.addEventListener('input', () => {
  btnSearchClear.style.display = toolSearchInput.value ? 'block' : 'none';
  renderCatalog();
});

btnSearchClear?.addEventListener('click', () => {
  toolSearchInput.value = '';
  btnSearchClear.style.display = 'none';
  renderCatalog();
});

document.querySelectorAll('.search-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    toolSearchInput.value = tag.dataset.query;
    btnSearchClear.style.display = 'block';
    renderCatalog();
  });
});

// Category Tabs
document.querySelectorAll('#categoryTabs .cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#categoryTabs .cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderCatalog();
  });
});

sortSelect?.addEventListener('change', renderCatalog);

// ================= NOTIFY ON LAUNCH =================
const modalNotify = document.getElementById('modalNotify');
const notifyToolSlug = document.getElementById('notifyToolSlug');
const notifyToolDesc = document.getElementById('notifyToolDesc');
const formNotifyLaunch = document.getElementById('formNotifyLaunch');
const notifyEmail = document.getElementById('notifyEmail');

window.openNotifyModal = function (slug, name) {
  notifyToolSlug.value = slug;
  notifyToolDesc.textContent = `Get notified by email the minute ${name} is available for use.`;
  if (currentUser?.email) notifyEmail.value = currentUser.email;
  openModal('modalNotify');
};

formNotifyLaunch?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = notifyEmail.value.trim();
  const tool_slug = notifyToolSlug.value;

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, tool_slug })
    });
    const data = await res.json();
    alert(data.message || 'Subscribed successfully!');
    closeModal('modalNotify');
  } catch (err) {
    alert('Failed to subscribe: ' + err.message);
  }
});

// ================= PUBLIC SUBMISSIONS =================
// 1. Tool Request Submission
const formToolRequest = document.getElementById('formToolRequest');
formToolRequest?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('reqTitle').value.trim();
  const description = document.getElementById('reqDesc').value.trim();
  const use_cases = document.getElementById('reqUseCases').value.trim();
  const email = document.getElementById('reqEmail').value.trim();

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, use_cases, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit');

    alert('🎉 ' + data.message);
    formToolRequest.reset();
    closeModal('modalRequest');
    fetchRequests();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// 2. Bug Report Submission
const formBugReport = document.getElementById('formBugReport');
formBugReport?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tool_slug = document.getElementById('bugToolSelect').value;
  const tool_name = bugToolSelect.options[bugToolSelect.selectedIndex]?.text || tool_slug;
  const title = document.getElementById('bugTitle').value.trim();
  const description = document.getElementById('bugDesc').value.trim();
  const severity = document.getElementById('bugSeverity').value;
  const email = document.getElementById('bugEmail').value.trim();

  try {
    const res = await fetch('/api/bugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_slug, tool_name, title, description, severity, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit');

    alert('🐞 ' + data.message);
    formBugReport.reset();
    closeModal('modalBug');
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// 3. Contact Support Submission
const formContact = document.getElementById('formContact');
formContact?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');

    alert('✉️ ' + data.message);
    formContact.reset();
    closeModal('modalContact');
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// ================= COMMUNITY REQUESTS BOARD =================
const requestsGrid = document.getElementById('requestsGrid');

async function fetchRequests() {
  if (!requestsGrid) return;
  try {
    const res = await fetch('/api/requests');
    const data = await res.json();
    const requests = data.requests || [];

    requestsGrid.innerHTML = '';
    if (requests.length === 0) {
      requestsGrid.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No community requests yet. Be the first to suggest a tool!</div>';
      return;
    }

    requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'request-card';
      const statusClass = `status-${req.status || 'pending'}`;

      card.innerHTML = `
        <div class="request-card-header">
          <div>
            <h4 style="font-size:15px; font-weight:700; margin-bottom:4px;">${req.title}</h4>
            <span class="req-status-badge ${statusClass}">${(req.status || 'pending').replace('_', ' ')}</span>
          </div>
          <button class="vote-btn" onclick="voteRequest(${req.id}, this)">
            <span>▲</span>
            <span class="vote-count">${req.votes_count || 1}</span>
          </button>
        </div>
        <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:10px; flex:1;">${req.description}</p>
        ${req.use_cases ? `<div style="font-size:11.5px; color:var(--text-muted); font-style:italic;">Use cases: ${req.use_cases}</div>` : ''}
      `;

      requestsGrid.appendChild(card);
    });
  } catch (e) {}
}

window.voteRequest = async function (id, btn) {
  try {
    const res = await fetch(`/api/requests/${id}/vote`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      btn.querySelector('.vote-count').textContent = data.votes;
      btn.style.color = 'var(--accent-blue)';
    }
  } catch (e) {}
};

// ================= AUTH (LOGIN, REGISTER, PREFERENCES) =================
const authSlot = document.getElementById('authSlot');
const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');
const formSignIn = document.getElementById('formSignIn');
const formSignUp = document.getElementById('formSignUp');
const userNotifyToggle = document.getElementById('userNotifyToggle');

tabSignIn?.addEventListener('click', () => {
  tabSignIn.classList.add('active');
  tabSignUp.classList.remove('active');
  formSignIn.style.display = 'block';
  formSignUp.style.display = 'none';
});

tabSignUp?.addEventListener('click', () => {
  tabSignUp.classList.add('active');
  tabSignIn.classList.remove('active');
  formSignUp.style.display = 'block';
  formSignIn.style.display = 'none';
});

async function checkAuthSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    currentUser = data.user;
    updateAuthHeader();
  } catch (e) {
    currentUser = null;
    updateAuthHeader();
  }
}

function updateAuthHeader() {
  if (!authSlot) return;

  if (currentUser) {
    const isAdmin = currentUser.role === 'admin';
    authSlot.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        ${isAdmin ? `<button class="btn btn-sm btn-admin" onclick="openAdminModal()">⚙️ Admin Portal</button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="openAccountModal()">
          <span>👤 ${currentUser.name || currentUser.email.split('@')[0]}</span>
        </button>
      </div>
    `;

    // Fill form emails automatically
    const reqEmail = document.getElementById('reqEmail');
    const bugEmail = document.getElementById('bugEmail');
    if (reqEmail && !reqEmail.value) reqEmail.value = currentUser.email;
    if (bugEmail && !bugEmail.value) bugEmail.value = currentUser.email;

    // Sync notification checkbox
    if (userNotifyToggle) {
      userNotifyToggle.checked = currentUser.notify_new_tools === 1;
    }
  } else {
    authSlot.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="openAuthModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Sign In</span>
      </button>
    `;
  }
}

// Sign In Form Submit
formSignIn?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    currentUser = data.user;
    updateAuthHeader();
    closeModal('modalAuth');
    alert(`Welcome back, ${currentUser.name}!`);
  } catch (err) {
    alert(err.message);
  }
});

// Sign Up Form Submit
formSignUp?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    currentUser = data.user;
    updateAuthHeader();
    closeModal('modalAuth');
    alert(`Account created successfully! Welcome, ${currentUser.name}!`);
  } catch (err) {
    alert(err.message);
  }
});

// Logout
window.handleLogout = async function () {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  updateAuthHeader();
  closeModal('modalAccount');
  alert('Signed out.');
};

// Account Modal
window.openAccountModal = function () {
  if (!currentUser) return;
  document.getElementById('accountName').textContent = currentUser.name || 'User';
  document.getElementById('accountEmail').textContent = currentUser.email;
  document.getElementById('accountAvatar').textContent = (currentUser.name || currentUser.email)[0].toUpperCase();
  document.getElementById('accountRoleBadge').textContent = currentUser.role.toUpperCase();
  userNotifyToggle.checked = currentUser.notify_new_tools === 1;

  loadUserSubmissions();
  openModal('modalAccount');
};

// Toggle notification email preferences (In-product switch)
userNotifyToggle?.addEventListener('change', async () => {
  const isEnabled = userNotifyToggle.checked;
  try {
    const res = await fetch('/api/auth/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notify_new_tools: isEnabled })
    });
    const data = await res.json();
    if (currentUser) currentUser.notify_new_tools = isEnabled ? 1 : 0;
  } catch (err) {
    alert('Failed to update email preferences');
  }
});

async function loadUserSubmissions() {
  const container = document.getElementById('userActivityList');
  if (!container) return;

  try {
    const [bugsRes, reqsRes] = await Promise.all([
      fetch('/api/bugs/mine'),
      fetch('/api/requests/mine')
    ]);
    const bugsData = await bugsRes.json();
    const reqsData = await reqsRes.json();

    const bugs = bugsData.bugs || [];
    const requests = reqsData.requests || [];

    if (bugs.length === 0 && requests.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; font-style:italic;">You have not submitted any bug reports or requests yet.</div>';
      return;
    }

    let html = '';
    requests.forEach(r => {
      html += `
        <div style="padding:8px; background:var(--bg-surface); border-radius:6px; margin-bottom:6px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;">
            <strong>💡 Tool Request: ${r.title}</strong>
            <span class="req-status-badge status-${r.status}">${r.status}</span>
          </div>
          <div style="color:var(--text-muted); margin-top:2px;">${r.votes_count || 1} votes</div>
        </div>`;
    });

    bugs.forEach(b => {
      html += `
        <div style="padding:8px; background:var(--bg-surface); border-radius:6px; margin-bottom:6px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;">
            <strong>🐞 Bug: ${b.title} (${b.tool_name})</strong>
            <span class="req-status-badge status-${b.status}">${b.status}</span>
          </div>
          <div style="color:var(--text-muted); margin-top:2px;">Severity: ${b.severity}</div>
        </div>`;
    });

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<div style="color:var(--danger)">Failed to load activity</div>';
  }
}

// ================= ADMIN PORTAL =================
window.openAdminModal = function () {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Administrator access required.');
    return;
  }
  openModal('modalAdmin');
  loadAdminOverview();
  loadAdminTools();
};

// Admin tab switcher
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.atab;
    const target = document.getElementById(`atab-${tab}`);
    if (target) target.classList.add('active');

    if (tab === 'tools') loadAdminTools();
    if (tab === 'bugs') loadAdminBugs();
    if (tab === 'requests') loadAdminRequests();
    if (tab === 'messages') loadAdminMessages();
    if (tab === 'subscribers') loadAdminSubscribers();
  });
});

async function loadAdminOverview() {
  try {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();
    const c = data.counts || {};
    document.getElementById('admToolsCount').textContent = c.tools || 0;
    document.getElementById('admBugsCount').textContent = c.bugs || 0;
    document.getElementById('admRequestsCount').textContent = c.requests || 0;
    document.getElementById('admMessagesCount').textContent = c.messages || 0;
    document.getElementById('admSubscribersCount').textContent = c.subscribers || 0;
  } catch (e) {}
}

// 1. Admin Tools Management
async function loadAdminTools() {
  const tbody = document.getElementById('admToolsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/tools');
    const data = await res.json();
    const tools = data.tools || [];

    tbody.innerHTML = '';
    tools.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.icon} ${t.name}</strong><br><small style="color:var(--text-muted)">${t.slug}</small></td>
        <td><a href="${t.url}" target="_blank" style="color:var(--accent-blue)">${t.url.replace('https://', '')}</a></td>
        <td>${t.category}</td>
        <td><span class="tool-badge ${t.is_upcoming ? 'badge-upcoming' : 'badge-live'}">${t.badge}</span></td>
        <td>
          <button class="btn-action-xs" onclick="toggleToolVisibility(${t.id})">
            ${t.is_hidden ? '🙈 Hidden' : '👁️ Public'}
          </button>
        </td>
        <td>${t.likes_count || 0}</td>
        <td>
          <div class="action-btn-group">
            <button class="btn-action-xs" onclick="openEditToolModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">Edit</button>
            <button class="btn-action-xs btn-danger-xs" onclick="deleteTool(${t.id})">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {}
}

window.toggleToolVisibility = async function (id) {
  try {
    await fetch(`/api/admin/tools/${id}/toggle-visibility`, { method: 'PATCH' });
    loadAdminTools();
    fetchTools();
  } catch (e) {}
};

window.deleteTool = async function (id) {
  if (confirm('Are you sure you want to delete this tool permanently?')) {
    await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
    loadAdminTools();
    fetchTools();
  }
};

// Admin Add/Edit Tool Form
const formAdminTool = document.getElementById('formAdminTool');
const toolFormTitle = document.getElementById('toolFormTitle');
const adminToolId = document.getElementById('adminToolId');
const admToolName = document.getElementById('admToolName');
const admToolSlug = document.getElementById('admToolSlug');
const admToolUrl = document.getElementById('admToolUrl');
const admToolIcon = document.getElementById('admToolIcon');
const admToolCategory = document.getElementById('admToolCategory');
const admToolBadge = document.getElementById('admToolBadge');
const admToolShortDesc = document.getElementById('admToolShortDesc');
const admToolLongDesc = document.getElementById('admToolLongDesc');
const admToolFeatures = document.getElementById('admToolFeatures');
const admToolTags = document.getElementById('admToolTags');
const admToolIsUpcoming = document.getElementById('admToolIsUpcoming');
const admToolIsHidden = document.getElementById('admToolIsHidden');

window.openAddToolModal = function () {
  formAdminTool.reset();
  adminToolId.value = '';
  toolFormTitle.textContent = 'Add New Tool to Directory';
  openModal('modalToolForm');
};

window.openEditToolModal = function (tool) {
  adminToolId.value = tool.id;
  admToolName.value = tool.name;
  admToolSlug.value = tool.slug;
  admToolUrl.value = tool.url;
  admToolIcon.value = tool.icon;
  admToolCategory.value = tool.category;
  admToolBadge.value = tool.badge;
  admToolShortDesc.value = tool.short_desc;
  admToolLongDesc.value = tool.long_desc || '';
  admToolFeatures.value = (tool.features || []).join(', ');
  admToolTags.value = (tool.tags || []).join(', ');
  admToolIsUpcoming.checked = tool.is_upcoming === 1;
  admToolIsHidden.checked = tool.is_hidden === 1;

  toolFormTitle.textContent = `Edit Tool: ${tool.name}`;
  openModal('modalToolForm');
};

formAdminTool?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = adminToolId.value;
  const payload = {
    name: admToolName.value.trim(),
    slug: admToolSlug.value.trim(),
    url: admToolUrl.value.trim(),
    icon: admToolIcon.value.trim(),
    category: admToolCategory.value,
    badge: admToolBadge.value,
    short_desc: admToolShortDesc.value.trim(),
    long_desc: admToolLongDesc.value.trim(),
    features: admToolFeatures.value.split(',').map(s => s.trim()).filter(Boolean),
    tags: admToolTags.value.split(',').map(s => s.trim()).filter(Boolean),
    is_upcoming: admToolIsUpcoming.checked ? 1 : 0,
    is_hidden: admToolIsHidden.checked ? 1 : 0
  };

  try {
    const url = id ? `/api/admin/tools/${id}` : '/api/admin/tools';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save tool');

    alert(data.message || 'Saved successfully!');
    closeModal('modalToolForm');
    loadAdminTools();
    fetchTools();
  } catch (err) {
    alert(err.message);
  }
});

// 2. Admin Bugs Management
async function loadAdminBugs() {
  const tbody = document.getElementById('admBugsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/bugs');
    const data = await res.json();
    const bugs = data.bugs || [];

    tbody.innerHTML = '';
    bugs.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${b.tool_name}</strong></td>
        <td>${b.email}</td>
        <td><span style="font-weight:700; color:${b.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}">${b.severity}</span></td>
        <td>
          <strong>${b.title}</strong>
          <p style="color:var(--text-secondary); margin-top:2px;">${b.description}</p>
        </td>
        <td>
          <select class="select-input" onchange="updateBugStatus(${b.id}, this.value)">
            <option value="open" ${b.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="investigating" ${b.status === 'investigating' ? 'selected' : ''}>Investigating</option>
            <option value="in_progress" ${b.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${b.status === 'resolved' ? 'selected' : ''}>Resolved</option>
            <option value="closed" ${b.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td>
          <button class="btn-action-xs btn-danger-xs" onclick="deleteBug(${b.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {}
}

window.updateBugStatus = async function (id, status) {
  await fetch(`/api/admin/bugs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  alert('Bug status updated');
};

window.deleteBug = async function (id) {
  if (confirm('Delete this bug report?')) {
    await fetch(`/api/admin/bugs/${id}`, { method: 'DELETE' });
    loadAdminBugs();
  }
};

// 3. Admin Tool Requests Management
async function loadAdminRequests() {
  const tbody = document.getElementById('admRequestsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/requests');
    const data = await res.json();
    const reqs = data.requests || [];

    tbody.innerHTML = '';
    reqs.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${r.title}</strong></td>
        <td>${r.description}<br><small style="color:var(--text-muted)">${r.use_cases || ''}</small></td>
        <td>${r.name || 'Anonymous'}<br><small>${r.email}</small></td>
        <td><strong>${r.votes_count || 1}</strong></td>
        <td>
          <select class="select-input" onchange="updateRequestStatus(${r.id}, this.value)">
            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="under_review" ${r.status === 'under_review' ? 'selected' : ''}>Under Review</option>
            <option value="planned" ${r.status === 'planned' ? 'selected' : ''}>Planned</option>
            <option value="building" ${r.status === 'building' ? 'selected' : ''}>Building</option>
            <option value="launched" ${r.status === 'launched' ? 'selected' : ''}>Launched</option>
            <option value="declined" ${r.status === 'declined' ? 'selected' : ''}>Declined</option>
          </select>
        </td>
        <td>
          <button class="btn-action-xs btn-danger-xs" onclick="deleteRequest(${r.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {}
}

window.updateRequestStatus = async function (id, status) {
  await fetch(`/api/admin/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  alert('Request status updated');
};

window.deleteRequest = async function (id) {
  if (confirm('Delete this request?')) {
    await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' });
    loadAdminRequests();
  }
};

// 4. Admin Messages
async function loadAdminMessages() {
  const tbody = document.getElementById('admMessagesTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/messages');
    const data = await res.json();
    const msgs = data.messages || [];

    tbody.innerHTML = '';
    msgs.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${m.name}</strong><br><small>${m.email}</small></td>
        <td>${m.subject}</td>
        <td>${m.message}</td>
        <td><small>${new Date(m.created_at).toLocaleDateString()}</small></td>
        <td>
          <button class="btn-action-xs btn-danger-xs" onclick="deleteMessage(${m.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {}
}

window.deleteMessage = async function (id) {
  if (confirm('Delete this message?')) {
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    loadAdminMessages();
  }
};

// 5. Admin Subscribers
async function loadAdminSubscribers() {
  const tbody = document.getElementById('admSubscribersTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/subscribers');
    const data = await res.json();
    const subs = data.subscribers || [];

    tbody.innerHTML = '';
    subs.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${s.email}</strong></td>
        <td><span class="tool-badge badge-beta">${s.tool_slug}</span></td>
        <td><small>${new Date(s.created_at).toLocaleDateString()}</small></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {}
}

// Initial Invocations
checkAuthSession();
fetchTools();
fetchRequests();
