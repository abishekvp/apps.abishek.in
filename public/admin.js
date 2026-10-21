/**
 * Abishek Tools — Dedicated Admin Control Center Client
 */

let currentUser = null;

// ================= PURE VECTOR SVG ICON SYSTEM (NO EMOJIS) =================
function getIconSvg(name, size = 18, className = '') {
  const s = size;
  const n = (name || '').toLowerCase().trim();

  switch (n) {
    case 'terminal':
    case 'base64':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;

    case 'code':
    case 'compiler':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;

    case 'brackets':
    case 'json':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M7 4a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2"></path><path d="M17 4a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2"></path></svg>`;

    case 'file-text':
    case 'md':
    case 'markdown':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;

    case 'sparkles':
    case 'prettier':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`;

    case 'image':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

    case 'file':
    case 'pdf':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>`;

    case 'video':
    case 'youtube':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.18" ry="2.18"></rect><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`;

    case 'globe':
    case 'portfolio':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

    case 'target':
    case 'regex':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;

    case 'database':
    case 'sql':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;

    case 'palette':
    case 'svg':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`;

    case 'layers':
    case 'colors':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;

    default:
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
  }
}

// ================= TOAST SYSTEM =================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-message">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ================= MODAL HELPERS =================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}

// ================= AUTH CHECK & GATE =================
async function checkAdminAuth() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();

    if (data.user && data.user.role === 'admin') {
      currentUser = data.user;
      document.getElementById('adminGate').style.display = 'none';
      document.getElementById('adminMainContent').style.display = 'block';
      document.getElementById('adminUserName').textContent = currentUser.name || currentUser.email;
      loadAdminOverview();
      loadAdminTools();
    } else {
      document.getElementById('adminGate').style.display = 'flex';
      document.getElementById('adminMainContent').style.display = 'none';
    }
  } catch (err) {
    document.getElementById('adminGate').style.display = 'flex';
    document.getElementById('adminMainContent').style.display = 'none';
  }
}

// Gate login form
document.getElementById('adminGateLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('gateEmail').value.trim();
  const password = document.getElementById('gatePassword').value;
  const btn = document.getElementById('btnGateLogin');

  try {
    btn.disabled = true;
    btn.textContent = 'Verifying...';

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');

    if (data.user.role !== 'admin') {
      throw new Error('This account does not have administrator privileges.');
    }

    showToast('Admin authenticated successfully.', 'success');
    checkAdminAuth();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In to Admin Portal';
  }
});

// Logout
document.getElementById('btnAdminLogout')?.addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  window.location.href = '/';
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('abishek_tools_theme') || 'dark';
document.body.className = `${savedTheme}-theme admin-page-body`;

themeToggle?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'light' : 'dark';
  document.body.className = `${newTheme}-theme admin-page-body`;
  localStorage.setItem('abishek_tools_theme', newTheme);
});

// ================= ADMIN TABS =================
document.querySelectorAll('.admin-nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-pane').forEach((p) => p.classList.remove('active'));

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

// ================= KPI OVERVIEW =================
async function loadAdminOverview() {
  try {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();
    const c = data.counts || {};

    document.getElementById('kpiTools').textContent = c.tools || 0;
    document.getElementById('kpiRequests').textContent = c.requests || 0;
    document.getElementById('kpiBugs').textContent = c.bugs || 0;
    document.getElementById('kpiMessages').textContent = c.messages || 0;
    document.getElementById('kpiSubscribers').textContent = c.subscribers || 0;
    document.getElementById('kpiUsers').textContent = c.users || 0;

    document.getElementById('admToolsCount').textContent = c.tools || 0;
    document.getElementById('admBugsCount').textContent = c.bugs || 0;
    document.getElementById('admRequestsCount').textContent = c.requests || 0;
    document.getElementById('admMessagesCount').textContent = c.messages || 0;
    document.getElementById('admSubscribersCount').textContent = c.subscribers || 0;
  } catch (e) {}
}

// ================= 1. TOOLS MANAGEMENT =================
async function loadAdminTools() {
  const tbody = document.getElementById('admToolsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/tools');
    const data = await res.json();
    const tools = data.tools || [];

    tbody.innerHTML = '';
    tools.forEach((t) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="color:var(--accent);">${getIconSvg(t.icon || t.slug, 20)}</div>
            <div>
              <strong style="color:var(--text-primary);">${t.name}</strong><br>
              <small style="color:var(--text-muted); font-family:var(--font-mono);">${t.slug}</small>
            </div>
          </div>
        </td>
        <td><a href="${t.url}" target="_blank" style="color:var(--accent); font-weight:500;">${t.url.replace('https://', '')}</a></td>
        <td><span class="badge">${t.category}</span></td>
        <td><span class="tool-badge ${t.is_upcoming ? 'badge-upcoming' : 'badge-live'}">${t.badge}</span></td>
        <td><small style="color:var(--text-secondary);">${t.suggested_by || 'Ecosystem'}</small></td>
        <td>
          <button class="btn-action-xs" onclick="toggleToolVisibility(${t.id})">
            ${t.is_hidden ? 'Hidden' : 'Public'}
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
    showToast('Tool visibility updated', 'success');
    loadAdminTools();
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
      loadAdminOverview();
    } catch (e) {
      showToast('Failed to delete tool', 'error');
    }
  }
};

// Tool Form Handling
const formAdminTool = document.getElementById('formAdminTool');
const toolFormTitle = document.getElementById('toolFormTitle');
const adminToolId = document.getElementById('adminToolId');
const admToolName = document.getElementById('admToolName');
const admToolSlug = document.getElementById('admToolSlug');
const admToolUrl = document.getElementById('admToolUrl');
const admToolIcon = document.getElementById('admToolIcon');
const admToolCategory = document.getElementById('admToolCategory');
const admToolBadge = document.getElementById('admToolBadge');
const admToolSuggestedBy = document.getElementById('admToolSuggestedBy');
const admToolShortDesc = document.getElementById('admToolShortDesc');
const admToolLongDesc = document.getElementById('admToolLongDesc');
const admToolFeatures = document.getElementById('admToolFeatures');
const admToolTags = document.getElementById('admToolTags');
const admToolIsUpcoming = document.getElementById('admToolIsUpcoming');
const admToolIsHidden = document.getElementById('admToolIsHidden');

window.openAddToolModal = function () {
  formAdminTool.reset();
  adminToolId.value = '';
  admToolSlug.disabled = false;
  toolFormTitle.textContent = 'Add New Tool to Directory';
  openModal('modalToolForm');
};

window.openEditToolModal = function (tool) {
  adminToolId.value = tool.id;
  admToolName.value = tool.name;
  admToolSlug.value = tool.slug;
  admToolSlug.disabled = true;
  admToolUrl.value = tool.url;
  admToolIcon.value = tool.icon || 'code';
  admToolCategory.value = tool.category;
  admToolBadge.value = tool.badge;
  admToolSuggestedBy.value = tool.suggested_by || '';
  admToolShortDesc.value = tool.short_desc;
  admToolLongDesc.value = tool.long_desc || '';
  admToolFeatures.value = (tool.features || []).join(', ');
  admToolTags.value = (tool.tags || []).join(', ');
  admToolIsUpcoming.checked = Boolean(tool.is_upcoming);
  admToolIsHidden.checked = Boolean(tool.is_hidden);

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
    suggested_by: admToolSuggestedBy.value.trim(),
    short_desc: admToolShortDesc.value.trim(),
    long_desc: admToolLongDesc.value.trim(),
    features: admToolFeatures.value.split(',').map((s) => s.trim()).filter(Boolean),
    tags: admToolTags.value.split(',').map((s) => s.trim()).filter(Boolean),
    is_upcoming: admToolIsUpcoming.checked,
    is_hidden: admToolIsHidden.checked
  };

  try {
    const url = id ? `/api/admin/tools/${id}` : '/api/admin/tools';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save tool');

    showToast(data.message || 'Tool saved successfully!', 'success');
    closeModal('modalToolForm');
    loadAdminTools();
    loadAdminOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ================= 2. BUGS MANAGEMENT =================
async function loadAdminBugs() {
  const tbody = document.getElementById('admBugsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/bugs');
    const data = await res.json();
    const bugs = data.bugs || [];

    tbody.innerHTML = '';
    bugs.forEach((b) => {
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
      loadAdminOverview();
    } catch (e) {
      showToast('Failed to delete report', 'error');
    }
  }
};

// ================= 3. REQUESTS MANAGEMENT =================
async function loadAdminRequests() {
  const tbody = document.getElementById('admRequestsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/requests');
    const data = await res.json();
    const reqs = data.requests || [];

    tbody.innerHTML = '';
    reqs.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${r.title}</strong></td>
        <td>
          <p style="color:var(--text-secondary);">${r.description}</p>
          ${r.use_cases ? `<small style="color:var(--text-muted)">Use cases: ${r.use_cases}</small>` : ''}
        </td>
        <td>${r.name || 'Anonymous'}<br><small style="color:var(--text-muted)">${r.email || 'No email'}</small></td>
        <td><span class="badge" style="font-weight:700;">${r.votes_count || 1} votes</span></td>
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
      loadAdminOverview();
    } catch (e) {
      showToast('Failed to delete request', 'error');
    }
  }
};

// ================= 4. MESSAGES MANAGEMENT =================
async function loadAdminMessages() {
  const tbody = document.getElementById('admMessagesTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/messages');
    const data = await res.json();
    const msgs = data.messages || [];

    tbody.innerHTML = '';
    msgs.forEach((m) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${m.name}</strong><br><small style="color:var(--text-muted)">${m.email}</small></td>
        <td><strong>${m.subject}</strong></td>
        <td><p style="white-space:pre-wrap; color:var(--text-secondary); max-width:400px;">${m.message}</p></td>
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
      loadAdminOverview();
    } catch (e) {
      showToast('Failed to delete message', 'error');
    }
  }
};

// ================= 5. SUBSCRIBERS MANAGEMENT =================
async function loadAdminSubscribers() {
  const tbody = document.getElementById('admSubscribersTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/subscribers');
    const data = await res.json();
    const subs = data.subscribers || [];

    tbody.innerHTML = '';
    subs.forEach((s) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${s.email}</strong></td>
        <td><code class="code-badge">${s.tool_slug}</code></td>
        <td><small>${new Date(s.created_at).toLocaleDateString()}</small></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {}
}

// Initial authentication check
checkAdminAuth();
