/**
 * Abishek Apps & Tools Hub — Frontend Client Application
 * Clean & Professional UX, Stable Colors, Spacious Responsive Layout
 * Pure Vector SVG Icons (Zero Emojis Everywhere)
 * Floating Apps Showcase & Community Requested User Profiles
 */

// ================= GLOBAL STATE =================
let allTools = [];
let currentUser = null;
let currentCategory = 'all';

// ================= PURE VECTOR SVG ICON SYSTEM (NO EMOJIS) =================
window.getIconSvg = function (name, size = 18, className = '') {
  const s = size;
  const n = (name || '').toLowerCase().trim();

  // Map known slugs or names to icons
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

    case 'heart':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    case 'bell':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

    case 'copy':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

    case 'check':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    case 'close':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    case 'external-link':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

    case 'arrow-up':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>`;

    case 'user':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

    case 'settings':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    case 'lightbulb':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>`;

    case 'zap':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;

    case 'shield':
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

    default:
      // Fallback clean code symbol
      return `<svg class="svg-icon ${className}" width="${s}" height="${s}" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
  }
};

// Extract initials for user profile avatars (e.g. "Sarah Chen" -> "SC")
function getInitials(name) {
  if (!name) return 'U';
  const clean = name.replace(/\([^)]*\)/g, '').replace(/@\S+/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || 'U';
}

// Toast Notification Manager (Zero emojis)
window.showToast = function (message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconMarkup = getIconSvg('lightbulb', 16);
  if (type === 'success') iconMarkup = getIconSvg('check', 16);
  if (type === 'error') iconMarkup = getIconSvg('close', 16);

  toast.innerHTML = `
    <span class="toast-icon">${iconMarkup}</span>
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
    showToast(`Copied ${url} to clipboard`, 'success');
  }).catch(() => {
    showToast('Failed to copy link', 'error');
  });
};

// ================= LOAD TOOLS & CATALOG =================
const toolsGrid = document.getElementById('toolsGrid');
const upcomingGrid = document.getElementById('upcomingGrid');
const floatingAppsRibbon = document.getElementById('floatingAppsRibbon');
const toolSearchInput = document.getElementById('toolSearchInput');
const btnSearchClear = document.getElementById('btnSearchClear');
const sortSelect = document.getElementById('sortSelect');
const bugToolSelect = document.getElementById('bugToolSelect');
const catalogResultsCount = document.getElementById('catalogResultsCount');

async function fetchTools() {
  try {
    const res = await fetch('/api/tools');
    const data = await res.json();
    allTools = data.tools || [];
    renderFloatingApps();
    renderCatalog();
    renderUpcomingRoadmap();
    populateBugToolDropdown();
    updateCategoryCounters();
  } catch (err) {
    toolsGrid.innerHTML = `<div class="grid-loading" style="color:var(--danger-text)">Failed to load tools: ${err.message}</div>`;
  }
}

// Render Floating Applications Showcase (Live Tools Dock)
function renderFloatingApps() {
  if (!floatingAppsRibbon) return;
  const liveTools = allTools.filter(t => !t.is_upcoming);
  floatingAppsRibbon.innerHTML = '';

  liveTools.forEach(tool => {
    const item = document.createElement('a');
    item.className = 'floating-app-item';
    item.href = tool.url;
    item.target = '_blank';
    item.rel = 'noopener';

    const cleanDisplayUrl = tool.url.replace(/^https?:\/\//, '');

    item.innerHTML = `
      <div class="floating-app-icon">${getIconSvg(tool.icon || tool.slug, 20)}</div>
      <div class="floating-app-meta">
        <span class="floating-app-name">${tool.name}</span>
        <span class="floating-app-sub">${cleanDisplayUrl}</span>
      </div>
    `;

    floatingAppsRibbon.appendChild(item);
  });
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
    opt.textContent = `${tool.name} (${tool.slug}.abishek.in)`;
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
      const matchRequester = (tool.suggested_by || '').toLowerCase().includes(query);
      return matchName || matchDesc || matchTags || matchFeatures || matchSlug || matchRequester;
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
          <span>Request This Tool</span>
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

    // Community requested user profile badge
    const requesterInitials = getInitials(tool.suggested_by || 'Community User');
    const requesterHtml = tool.suggested_by ? `
      <div class="tool-requester-badge" title="Originally proposed as a community request">
        <div class="requester-avatar">${requesterInitials}</div>
        <div class="requester-info">
          <span class="requester-subtext">Community Request</span>
          <span class="requester-name">${tool.suggested_by}</span>
        </div>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="tool-card-header">
        <div class="tool-icon-box">${getIconSvg(tool.icon || tool.slug, 26)}</div>
        <div class="tool-meta-block">
          <div class="tool-title-row">
            <h3 class="tool-title" title="${tool.name}">${tool.name}</h3>
            <span class="tool-badge ${badgeClass}">${tool.badge || 'Live'}</span>
          </div>
          <div class="tool-url-sub" onclick="copyToolUrl('${tool.url}', event)" title="Click to copy link">
            <span>${cleanDisplayUrl}</span>
            <button class="copy-mini-btn" title="Copy URL">
              ${getIconSvg('copy', 12)}
            </button>
          </div>
        </div>
      </div>
      <p class="tool-description">${tool.short_desc}</p>
      ${requesterHtml}
      <div class="tool-features-list">${featurePills}</div>
      <div class="tool-card-footer">
        <button class="like-btn" onclick="likeTool('${tool.slug}', this)" title="Upvote this tool">
          ${getIconSvg('heart', 14)}
          <span class="like-count">${tool.likes_count || 0}</span>
        </button>
        ${
          isUpcoming
            ? `<button class="notify-btn" onclick="openNotifyModal('${tool.slug}', '${tool.name}')">
                 ${getIconSvg('bell', 13)}
                 <span>Notify on Launch</span>
               </button>`
            : `<a href="${tool.url}" target="_blank" rel="noopener" class="launch-btn">
                 <span>Open Tool</span>
                 ${getIconSvg('external-link', 12)}
               </a>`
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

    const requesterInitials = getInitials(tool.suggested_by || 'Community User');
    const requesterHtml = tool.suggested_by ? `
      <div class="tool-requester-badge" style="margin-bottom:14px;">
        <div class="requester-avatar">${requesterInitials}</div>
        <div class="requester-info">
          <span class="requester-subtext">Requested by</span>
          <span class="requester-name">${tool.suggested_by}</span>
        </div>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="upcoming-card-header">
        <div class="upcoming-icon">${getIconSvg(tool.icon || tool.slug, 22)}</div>
        <span class="launch-badge">${tool.launch_date || 'In Development'}</span>
      </div>
      <h4 style="font-size:17px; font-weight:700; margin-bottom:8px; color:var(--text-primary);">${tool.name}</h4>
      <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.55; margin-bottom:14px; flex:1;">${tool.short_desc}</p>
      ${requesterHtml}
      <button class="btn btn-secondary btn-sm w-full" onclick="openNotifyModal('${tool.slug}', '${tool.name}')">
        ${getIconSvg('bell', 13)}
        <span>Notify on Launch</span>
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
      btn.classList.add('liked');
      showToast('Thank you for upvoting!', 'success');
    }
  } catch (e) {
    showToast('Failed to upvote', 'error');
  }
};

// Search Events
toolSearchInput?.addEventListener('input', () => {
  btnSearchClear.style.display = toolSearchInput.value ? 'flex' : 'none';
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
    btnSearchClear.style.display = 'flex';
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
    const data = await res.json();
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
  const name = document.getElementById('reqName')?.value.trim();
  const email = document.getElementById('reqEmail').value.trim();

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, use_cases, name, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit request');

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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit bug report');

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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');

    showToast(data.message || 'Message sent! We will get back to you shortly.', 'success');
    formContact.reset();
    closeModal('modalContact');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ================= COMMUNITY REQUESTS BOARD & USER PROFILES =================
const requestsGrid = document.getElementById('requestsGrid');

async function fetchRequests() {
  if (!requestsGrid) return;
  try {
    const res = await fetch('/api/requests');
    const data = await res.json();
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

      const requesterName = req.name || (req.email ? req.email.split('@')[0] : 'Community Member');
      const requesterInitials = getInitials(requesterName);

      // Check if this requested tool is live in allTools
      const isLaunched = req.status === 'launched';
      const matchingTool = allTools.find(t => t.name.toLowerCase().includes(req.title.toLowerCase()) || req.title.toLowerCase().includes(t.name.toLowerCase()));

      card.innerHTML = `
        <div class="request-profile-row">
          <div class="requester-profile-group">
            <div class="requester-profile-avatar">${requesterInitials}</div>
            <div class="requester-profile-meta">
              <span class="requester-profile-name">${requesterName}</span>
              <span class="requester-profile-sub">Community Requester</span>
            </div>
          </div>
          <span class="req-status-badge ${statusClass}">${(req.status || 'pending').replace('_', ' ')}</span>
        </div>

        <div class="request-card-header">
          <h4 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">${req.title}</h4>
          <button class="vote-btn" onclick="voteRequest(${req.id}, this)" title="Upvote this idea">
            ${getIconSvg('arrow-up', 14)}
            <span class="vote-count">${req.votes_count || 1}</span>
          </button>
        </div>

        <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.55; margin-bottom:12px; flex:1;">${req.description}</p>
        ${req.use_cases ? `<div style="font-size:12px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:10px; margin-bottom:8px;"><strong>Use Cases:</strong> ${req.use_cases}</div>` : ''}

        ${isLaunched ? `
          <a href="${matchingTool ? matchingTool.url : '#catalogSection'}" target="${matchingTool ? '_blank' : '_self'}" class="launched-link-pill">
            ${getIconSvg('check', 13)}
            <span>Built & Live in Ecosystem</span>
          </a>
        ` : ''}
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
        ${isAdmin ? `<a href="/admin" class="btn btn-sm btn-admin">${getIconSvg('settings', 13)}<span>Admin Portal</span></a>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="openAccountModal()">
          ${getIconSvg('user', 13)}
          <span>${currentUser.name || currentUser.email.split('@')[0]}</span>
        </button>
      </div>
    `;

    // Fill form emails automatically
    const reqEmail = document.getElementById('reqEmail');
    const reqName = document.getElementById('reqName');
    const bugEmail = document.getElementById('bugEmail');
    if (reqEmail && !reqEmail.value) reqEmail.value = currentUser.email;
    if (reqName && !reqName.value) reqName.value = currentUser.name || '';
    if (bugEmail && !bugEmail.value) bugEmail.value = currentUser.email;

    // Sync notification checkbox
    if (userNotifyToggle) {
      userNotifyToggle.checked = currentUser.notify_new_tools === 1;
    }
  } else {
    authSlot.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="openAuthModal()">
        ${getIconSvg('user', 13)}
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

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
  document.getElementById('accountAvatar').textContent = getInitials(currentUser.name || currentUser.email);
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
    const bugsData = await bugsRes.json();
    const reqsData = await reqsRes.json();

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
            <strong>Tool Request: ${r.title}</strong>
            <span class="req-status-badge status-${r.status}">${r.status}</span>
          </div>
          <div style="color:var(--text-muted); margin-top:4px;">${r.votes_count || 1} upvotes</div>
        </div>`;
    });

    bugs.forEach(b => {
      html += `
        <div style="padding:10px 12px; background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:6px; margin-bottom:8px; font-size:12.5px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>Bug Report: ${b.title} (${b.tool_name})</strong>
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

// ================= ADMIN PORTAL (DEDICATED PAGE) =================
window.openAdminModal = function () {
  window.location.href = '/admin';
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
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="color:var(--accent);">${getIconSvg(t.icon || t.slug, 18)}</div>
            <div>
              <strong>${t.name}</strong><br>
              <small style="color:var(--text-muted)">${t.slug}</small>
            </div>
          </div>
        </td>
        <td><a href="${t.url}" target="_blank" style="color:var(--accent)">${t.url.replace('https://', '')}</a></td>
        <td>${t.category}</td>
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
  toolFormTitle.textContent = 'Add New Tool to Directory';
  openModal('modalToolForm');
};

window.openEditToolModal = function (tool) {
  adminToolId.value = tool.id;
  admToolName.value = tool.name;
  admToolSlug.value = tool.slug;
  admToolUrl.value = tool.url;
  admToolIcon.value = tool.icon || 'code';
  admToolCategory.value = tool.category;
  admToolBadge.value = tool.badge;
  admToolSuggestedBy.value = tool.suggested_by || '';
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
    suggested_by: admToolSuggestedBy.value.trim(),
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
    const data = await res.json();
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
