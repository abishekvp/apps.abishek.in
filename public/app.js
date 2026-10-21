/**
 * Abishek Apps & Tools Hub — Frontend Client Application
 * Clean & Professional UX, Stable Colors, Spacious Responsive Layout
 */

// ================= GLOBAL STATE & TOAST SYSTEM =================
let allTools = [];
let currentUser = null;
let currentCategory = 'all';

// Toast Notification Manager
window.showToast = function (message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = 'ℹ';
  if (type === 'success') iconSvg = '✓';
  if (type === 'error') iconSvg = '✕';

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger smooth slide-in
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  // Auto-dismiss after 3.5s
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3500);
};

// Safe API response parser to prevent "Unexpected token 'A', ... is not valid JSON" errors
async function parseApiResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      // JSON parsing failed, fallback below
    }
  }

  if (!data) {
    const text = (await res.text()).trim();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text || `HTTP ${res.status}: ${res.statusText}` };
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
  }

  return data;
}

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
    showToast('Switched to Light Theme', 'info');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('hub_theme', 'dark');
    showToast('Switched to Dark Theme', 'info');
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
    subdomainPill.textContent = 'apps.abishek.in · tools.abishek.in';
  }
}

// ================= MODAL HELPERS =================
window.openModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // Focus first input if available
    const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
};

window.closeModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
};

// Close modals when clicking backdrop
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
});

// Global Keyboard Shortcuts (Escape to close modals, Ctrl+K / Cmd+K to search)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => {
      m.classList.remove('show');
    });
    document.body.style.overflow = '';
  }

  // Ctrl+K or Cmd+K or '/' to focus search bar
  const isK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
  const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if (isK || isSlash) {
    e.preventDefault();
    const searchInput = document.getElementById('toolSearchInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

window.openRequestModal = () => openModal('modalRequest');
window.openBugModal = () => openModal('modalBug');
window.openContactModal = () => openModal('modalContact');
window.openAuthModal = () => openModal('modalAuth');

document.getElementById('btnOpenRequestModal')?.addEventListener('click', openRequestModal);
document.getElementById('btnOpenBugModal')?.addEventListener('click', openBugModal);
document.getElementById('btnOpenContactModal')?.addEventListener('click', openContactModal);
document.getElementById('btnOpenAuthModal')?.addEventListener('click', openAuthModal);

// Copy URL to Clipboard helper
window.copyToolUrl = function (url, e) {
  if (e) e.stopPropagation();
  navigator.clipboard.writeText(url).then(() => {
    showToast(`Copied ${url} to clipboard!`, 'success');
  }).catch(() => {
    showToast('Failed to copy link', 'error');
  });
};

// ================= LOAD TOOLS & CATALOG =================
const toolsGrid = document.getElementById('toolsGrid');
const upcomingGrid = document.getElementById('upcomingGrid');
const toolSearchInput = document.getElementById('toolSearchInput');
const btnSearchClear = document.getElementById('btnSearchClear');
const sortSelect = document.getElementById('sortSelect');
const bugToolSelect = document.getElementById('bugToolSelect');
const catalogResultsCount = document.getElementById('catalogResultsCount');

async function fetchTools() {
  try {
    const res = await fetch('/api/tools');
    const data = await parseApiResponse(res);
    allTools = data.tools || [];
    renderCatalog();
    renderUpcomingRoadmap();
    populateBugToolDropdown();
    updateCategoryCounters();
  } catch (err) {
    toolsGrid.innerHTML = `<div class="grid-loading" style="color:var(--danger-text)">Failed to load tools: ${err.message}</div>`;
  }
}

function updateCategoryCounters() {
  const upcomingTools = allTools.filter(t => t.is_upcoming);

  const countAll = document.getElementById('countAll');
  const countDev = document.getElementById('countDev');
  const countFormatters = document.getElementById('countFormatters');
  const countMedia = document.getElementById('countMedia');
  const countUpcoming = document.getElementById('countUpcoming');

  if (countAll) countAll.textContent = allTools.length;
  if (countDev) countDev.textContent = allTools.filter(t => t.category === 'developer').length;
  if (countFormatters) countFormatters.textContent = allTools.filter(t => t.category === 'formatters').length;
  if (countMedia) countMedia.textContent = allTools.filter(t => t.category === 'media').length;
  if (countUpcoming) countUpcoming.textContent = upcomingTools.length;
}

function populateBugToolDropdown() {
  if (!bugToolSelect) return;
  bugToolSelect.innerHTML = '<option value="">-- Select Affected Tool --</option>';
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
    filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  } else if (sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Featured / display order
    filtered.sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
  }

  // Update counter
  if (catalogResultsCount) {
    if (query) {
      catalogResultsCount.textContent = `Found ${filtered.length} matching "${query}"`;
    } else {
      catalogResultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'tool' : 'tools'} available`;
    }
  }

  toolsGrid.innerHTML = '';

  if (filtered.length === 0) {
    toolsGrid.innerHTML = `
      <div class="grid-loading">
        <p style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">No tools matching "${query}"</p>
        <p style="font-size:14px; color:var(--text-secondary); margin-bottom:18px;">Can't find what you need? We build requested tools quickly.</p>
        <button class="btn btn-primary btn-sm" onclick="openRequestModal()">
          <span>+ Request This Tool</span>
        </button>
      </div>`;
    return;
  }

  filtered.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';

    const isUpcoming = tool.is_upcoming;
    let badgeClass = 'badge-live';
    if (isUpcoming) badgeClass = 'badge-upcoming';
    else if (tool.badge === 'Beta') badgeClass = 'badge-beta';
    else if (tool.badge === 'New') badgeClass = 'badge-new';

    const cleanDisplayUrl = tool.url.replace(/^https?:\/\//, '');
    const featurePills = (tool.features || []).slice(0, 4).map(f => `<span class="feature-pill">${f}</span>`).join('');

    card.innerHTML = `
      <div class="tool-card-header">
        <div class="tool-icon-box">${tool.icon || '⚡'}</div>
        <div class="tool-meta-block">
          <div class="tool-title-row">
            <h3 class="tool-title" title="${tool.name}">${tool.name}</h3>
            <span class="tool-badge ${badgeClass}">${tool.badge || 'Live'}</span>
          </div>
          <div class="tool-url-sub" onclick="copyToolUrl('${tool.url}', event)" title="Click to copy link">
            <span>${cleanDisplayUrl}</span>
            <button class="copy-mini-btn" title="Copy URL">📋</button>
          </div>
        </div>
      </div>
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

  if (upcoming.length === 0) {
    upcomingGrid.innerHTML = '<div style="color:var(--text-muted); font-size:14px;">All roadmap tools have shipped to production!</div>';
    return;
  }

  upcoming.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'upcoming-card';
    card.innerHTML = `
      <div class="upcoming-card-header">
        <div class="upcoming-icon">${tool.icon || '🚀'}</div>
        <span class="launch-badge">${tool.launch_date || 'In Development'}</span>
      </div>
      <h4 style="font-size:17px; font-weight:700; margin-bottom:8px; color:var(--text-primary);">${tool.name}</h4>
      <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.55; margin-bottom:20px; flex:1;">${tool.short_desc}</p>
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
    const data = await parseApiResponse(res);
    if (data.success) {
      btn.querySelector('.like-count').textContent = data.likes;
      btn.classList.add('liked');
      showToast('Thank you for upvoting!', 'success');
    }
  } catch (e) {
    showToast('Failed to upvote', 'error');
  }
};

// Search Events
toolSearchInput?.addEventListener('input', () => {
  btnSearchClear.style.display = toolSearchInput.value ? 'block' : 'none';
  renderCatalog();
});

btnSearchClear?.addEventListener('click', () => {
  toolSearchInput.value = '';
  btnSearchClear.style.display = 'none';
  toolSearchInput.focus();
  renderCatalog();
});

document.querySelectorAll('.search-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    toolSearchInput.value = tag.dataset.query;
    btnSearchClear.style.display = 'block';
    renderCatalog();
    toolSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const data = await parseApiResponse(res);
    showToast(data.message || 'Subscribed successfully!', 'success');
    closeModal('modalNotify');
  } catch (err) {
    showToast('Failed to subscribe: ' + err.message, 'error');
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
    const data = await parseApiResponse(res);

    showToast(data.message || 'Tool request submitted successfully!', 'success');
    formToolRequest.reset();
    closeModal('modalRequest');
    fetchRequests();
  } catch (err) {
    showToast(err.message, 'error');
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
    const data = await parseApiResponse(res);

    showToast(data.message || 'Bug report sent! Thank you for helping us improve.', 'success');
    formBugReport.reset();
    closeModal('modalBug');
  } catch (err) {
    showToast(err.message, 'error');
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
    const data = await parseApiResponse(res);

    showToast(data.message || 'Message sent! We will get back to you shortly.', 'success');
    formContact.reset();
    closeModal('modalContact');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ================= COMMUNITY REQUESTS BOARD =================
const requestsGrid = document.getElementById('requestsGrid');

async function fetchRequests() {
  if (!requestsGrid) return;
  try {
    const res = await fetch('/api/requests');
    const data = await parseApiResponse(res);
    const requests = data.requests || [];

    requestsGrid.innerHTML = '';
    if (requests.length === 0) {
      requestsGrid.innerHTML = '<div style="color:var(--text-muted); padding:32px 0;">No community requests yet. Be the first to suggest a tool idea!</div>';
      return;
    }

    requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'request-card';
      const statusClass = `status-${req.status || 'pending'}`;

      card.innerHTML = `
        <div class="request-card-header">
          <div>
            <h4 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">${req.title}</h4>
            <span class="req-status-badge ${statusClass}">${(req.status || 'pending').replace('_', ' ')}</span>
          </div>
          <button class="vote-btn" onclick="voteRequest(${req.id}, this)" title="Upvote this idea">
            <span>▲</span>
            <span class="vote-count">${req.votes_count || 1}</span>
          </button>
        </div>
        <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.55; margin-bottom:12px; flex:1;">${req.description}</p>
        ${req.use_cases ? `<div style="font-size:12px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:10px;"><strong>Use Cases:</strong> ${req.use_cases}</div>` : ''}
      `;

      requestsGrid.appendChild(card);
    });
  } catch (e) {}
}

window.voteRequest = async function (id, btn) {
  try {
    const res = await fetch(`/api/requests/${id}/vote`, { method: 'POST' });
    const data = await parseApiResponse(res);
    if (data.success) {
      btn.querySelector('.vote-count').textContent = data.votes;
      btn.style.color = 'var(--accent)';
      btn.style.borderColor = 'var(--accent)';
      showToast('Vote recorded!', 'success');
    }
  } catch (e) {
    showToast('Failed to vote', 'error');
  }
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
    const data = await parseApiResponse(res);
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
      <button class="btn btn-secondary btn-sm" onclick="openAuthModal()">
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
    const data = await parseApiResponse(res);

    currentUser = data.user;
    updateAuthHeader();
    closeModal('modalAuth');
    showToast(`Welcome back, ${currentUser.name || 'Developer'}!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
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
    const data = await parseApiResponse(res);

    currentUser = data.user;
    updateAuthHeader();
    closeModal('modalAuth');
    showToast(`Account created! Welcome, ${currentUser.name}!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// Logout
window.handleLogout = async function () {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  updateAuthHeader();
  closeModal('modalAccount');
  showToast('Signed out successfully.', 'info');
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
    const data = await parseApiResponse(res);
    if (currentUser) currentUser.notify_new_tools = isEnabled ? 1 : 0;
    showToast(data.message || 'Notification preferences updated', 'success');
  } catch (err) {
    showToast('Failed to update email preferences', 'error');
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
    const bugsData = await parseApiResponse(bugsRes);
    const reqsData = await parseApiResponse(reqsRes);

    const bugs = bugsData.bugs || [];
    const requests = reqsData.requests || [];

    if (bugs.length === 0 && requests.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); font-size:12.5px; font-style:italic; padding:12px 0;">You have not submitted any bug reports or requests yet.</div>';
      return;
    }

    let html = '';
    requests.forEach(r => {
      html += `
        <div style="padding:10px 12px; background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:6px; margin-bottom:8px; font-size:12.5px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>💡 Idea: ${r.title}</strong>
            <span class="req-status-badge status-${r.status}">${r.status}</span>
          </div>
          <div style="color:var(--text-muted); margin-top:4px;">${r.votes_count || 1} upvotes</div>
        </div>`;
    });

    bugs.forEach(b => {
      html += `
        <div style="padding:10px 12px; background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:6px; margin-bottom:8px; font-size:12.5px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>🐞 Bug: ${b.title} (${b.tool_name})</strong>
            <span class="req-status-badge status-${b.status}">${b.status}</span>
          </div>
          <div style="color:var(--text-muted); margin-top:4px;">Severity: ${b.severity}</div>
        </div>`;
    });

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<div style="color:var(--danger-text)">Failed to load activity</div>';
  }
}

// ================= ADMIN PORTAL =================
window.openAdminModal = function () {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Administrator access required.', 'error');
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
    const data = await parseApiResponse(res);
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
    const data = await parseApiResponse(res);
    const tools = data.tools || [];

    tbody.innerHTML = '';
    tools.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.icon} ${t.name}</strong><br><small style="color:var(--text-muted)">${t.slug}</small></td>
        <td><a href="${t.url}" target="_blank" style="color:var(--accent)">${t.url.replace('https://', '')}</a></td>
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
    showToast('Tool visibility toggled', 'success');
    loadAdminTools();
    fetchTools();
  } catch (e) {
    showToast('Failed to toggle visibility', 'error');
  }
};

window.deleteTool = async function (id) {
  if (confirm('Are you sure you want to delete this tool permanently?')) {
    try {
      await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
      showToast('Tool deleted', 'info');
      loadAdminTools();
      fetchTools();
    } catch (e) {
      showToast('Failed to delete tool', 'error');
    }
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
    const data = await parseApiResponse(res);

    showToast(data.message || 'Tool saved successfully!', 'success');
    closeModal('modalToolForm');
    loadAdminTools();
    fetchTools();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// 2. Admin Bugs Management
async function loadAdminBugs() {
  const tbody = document.getElementById('admBugsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/bugs');
    const data = await parseApiResponse(res);
    const bugs = data.bugs || [];

    tbody.innerHTML = '';
    bugs.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${b.tool_name}</strong></td>
        <td>${b.email}</td>
        <td><span style="font-weight:700; color:${b.severity === 'critical' ? 'var(--danger-text)' : 'var(--warning-text)'}">${b.severity}</span></td>
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
  try {
    await fetch(`/api/admin/bugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast('Bug status updated', 'success');
  } catch (e) {
    showToast('Failed to update status', 'error');
  }
};

window.deleteBug = async function (id) {
  if (confirm('Delete this bug report?')) {
    try {
      await fetch(`/api/admin/bugs/${id}`, { method: 'DELETE' });
      showToast('Bug report deleted', 'info');
      loadAdminBugs();
    } catch (e) {
      showToast('Failed to delete report', 'error');
    }
  }
};

// 3. Admin Tool Requests Management
async function loadAdminRequests() {
  const tbody = document.getElementById('admRequestsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/requests');
    const data = await parseApiResponse(res);
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
  try {
    await fetch(`/api/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast('Request status updated', 'success');
  } catch (e) {
    showToast('Failed to update status', 'error');
  }
};

window.deleteRequest = async function (id) {
  if (confirm('Delete this request?')) {
    try {
      await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' });
      showToast('Request deleted', 'info');
      loadAdminRequests();
    } catch (e) {
      showToast('Failed to delete request', 'error');
    }
  }
};

// 4. Admin Messages
async function loadAdminMessages() {
  const tbody = document.getElementById('admMessagesTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/messages');
    const data = await parseApiResponse(res);
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
    try {
      await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      showToast('Message deleted', 'info');
      loadAdminMessages();
    } catch (e) {
      showToast('Failed to delete message', 'error');
    }
  }
};

// 5. Admin Subscribers
async function loadAdminSubscribers() {
  const tbody = document.getElementById('admSubscribersTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/subscribers');
    const data = await parseApiResponse(res);
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
