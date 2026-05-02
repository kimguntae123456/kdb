/* =========================================================
   논술 리더 — app.js (공통 런타임)
   ========================================================= */

// ── Base path detection ──
const BASE = (function() {
  const p = location.pathname;
  // if we're in a subfolder (category page), base is ../
  // if we're at root index.html, base is ./
  const segs = p.replace(/\/index\.html$/, '').split('/').filter(Boolean);
  // check if current page has ../styles.css reference → subfolder
  const isSubfolder = !!document.querySelector('link[href^="../styles.css"], link[href^="../"]');
  return isSubfolder ? '../' : './';
})();

// ── State ──
let density = localStorage.getItem('ns_density') || 'magazine';
let theme = localStorage.getItem('ns_theme') || 'white';
let mode = localStorage.getItem('ns_mode') || 'magazine';
let fsIdx = ['s','m','l','xl'].indexOf(localStorage.getItem('ns_fs') || 'm');
if (fsIdx < 0) fsIdx = 1;
const fsSizes = ['s','m','l','xl'];
let bookmarks = new Set(JSON.parse(localStorage.getItem('ns_bookmarks') || '[]'));
let clips = JSON.parse(localStorage.getItem('ns_clips') || '[]');
let highlights = JSON.parse(localStorage.getItem('ns_highlights') || '[]');
let memos = JSON.parse(localStorage.getItem('ns_memos') || '[]');

const SVG_CLIP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>';

function applyState() {
  document.body.className = `density-${density} theme-${theme} mode-${mode}`;
  document.body.dataset.fs = fsSizes[fsIdx];
  document.querySelectorAll('[data-setting]').forEach(btn => {
    const [key, val] = btn.dataset.setting.split(':');
    const current = key === 'density' ? density : key === 'theme' ? theme : key === 'mode' ? mode : fsSizes[fsIdx];
    btn.classList.toggle('active', val === current);
  });
  updateBookmarkUI();
  updateClipsFab();
}

// ── Search ──
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const rows = document.querySelectorAll('.card-row');
  if (searchInput && rows.length) {
    searchInput.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      let vis = 0;
      rows.forEach(r => {
        const show = !q || r.dataset.text.includes(q);
        r.style.display = show ? '' : 'none';
        if (show) vis++;
      });
      const fc = document.getElementById('filterCount');
      if (fc) fc.textContent = vis + '\uD3B8';
    });
  }
  // category search (main page)
  const catSearch = document.getElementById('catSearch');
  if (catSearch) {
    catSearch.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      document.querySelectorAll('.sector-card').forEach(c => {
        c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
      // also filter group children
      document.querySelectorAll('.group-child').forEach(c => {
        c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
      // show all groups if searching
      if (q) {
        document.querySelectorAll('.group-children').forEach(gc => gc.style.display = '');
      }
    });
  }
}

// ── Expand/Collapse (article rows) ──
function initExpandCollapse() {
  document.querySelectorAll('.row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.closest('.bookmark-btn') || e.target.closest('.ia-close')) return;
      const wasOpen = this.classList.contains('expanded');
      document.querySelectorAll('.row.expanded').forEach(r => r.classList.remove('expanded'));
      if (!wasOpen) {
        this.classList.add('expanded');
        setTimeout(() => {
          const art = this.nextElementSibling;
          if (art && art.classList.contains('inline-article')) {
            const top = art.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({top, behavior: 'smooth'});
          }
        }, 50);
      }
    });
  });
  document.querySelectorAll('.ia-close').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const art = this.closest('.inline-article');
      if (art && art.previousElementSibling) art.previousElementSibling.classList.remove('expanded');
    });
  });
}

// ── Bookmarks ──
function updateBookmarkUI() {
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    const t = btn.dataset.title;
    const on = bookmarks.has(t);
    btn.classList.toggle('on', on);
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none');
  });
}
function initBookmarks() {
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const t = this.dataset.title;
      if (bookmarks.has(t)) bookmarks.delete(t); else bookmarks.add(t);
      localStorage.setItem('ns_bookmarks', JSON.stringify([...bookmarks]));
      updateBookmarkUI();
      syncPush();
    });
  });
}

// ── Font Size ──
function initFontSize() {
  document.getElementById('fsBtn')?.addEventListener('click', () => {
    fsIdx = (fsIdx + 1) % fsSizes.length;
    localStorage.setItem('ns_fs', fsSizes[fsIdx]);
    applyState();
  });
}

// ── Density ──
function initDensity() {
  document.getElementById('densityBtn')?.addEventListener('click', () => {
    const order = ['compact','grid','magazine'];
    density = order[(order.indexOf(density) + 1) % order.length];
    localStorage.setItem('ns_density', density);
    applyState();
  });
}

// ── Settings Panel ──
function initSettings() {
  const settingsOverlay = document.getElementById('settingsOverlay');
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    settingsOverlay?.classList.toggle('open');
    applyState();
  });
  settingsOverlay?.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) settingsOverlay.classList.remove('open');
  });
  document.querySelectorAll('[data-setting]').forEach(btn => {
    btn.addEventListener('click', function() {
      const [key, val] = this.dataset.setting.split(':');
      if (key === 'density') { density = val; localStorage.setItem('ns_density', val); }
      if (key === 'theme') { theme = val; localStorage.setItem('ns_theme', val); }
      if (key === 'mode') { mode = val; localStorage.setItem('ns_mode', val); }
      if (key === 'fs') { fsIdx = fsSizes.indexOf(val); localStorage.setItem('ns_fs', val); }
      applyState();
    });
  });
}

// ── Clips ──
function updateClipsFab() {
  const fab = document.querySelector('.clips-fab');
  if (fab) {
    const total = clips.length + highlights.length + memos.length;
    fab.classList.toggle('show', total > 0);
    fab.querySelector('.num').textContent = total;
  }
}
function addClip(text, title) {
  clips.unshift({id: Date.now(), text, title, createdAt: Date.now()});
  localStorage.setItem('ns_clips', JSON.stringify(clips));
  updateClipsFab();
  syncPush();
}
function removeClip(id) {
  clips = clips.filter(c => c.id !== id);
  localStorage.setItem('ns_clips', JSON.stringify(clips));
  updateClipsFab();
  renderDrawer();
  syncPush();
}

// ── Highlights ──
function addHighlight(text, title) {
  highlights.unshift({id: Date.now(), text, title, createdAt: Date.now()});
  localStorage.setItem('ns_highlights', JSON.stringify(highlights));
  updateClipsFab();
  applyHighlightsToDOM();
  syncPush();
}
function removeHighlight(id) {
  highlights = highlights.filter(h => h.id !== id);
  localStorage.setItem('ns_highlights', JSON.stringify(highlights));
  updateClipsFab();
  renderDrawer();
  syncPush();
}
function applyHighlightsToDOM() {
  // re-apply highlight marks to visible article content
  document.querySelectorAll('mark.hl-mark').forEach(m => {
    const text = m.textContent;
    m.replaceWith(document.createTextNode(text));
  });
  if (!highlights.length) return;
  document.querySelectorAll('.article-content').forEach(content => {
    highlights.forEach(h => {
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        const idx = node.textContent.indexOf(h.text);
        if (idx === -1) continue;
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + h.text.length);
        const mark = document.createElement('mark');
        mark.className = 'hl-mark';
        mark.dataset.hlId = h.id;
        range.surroundContents(mark);
        break;
      }
    });
  });
}

// ── Memos ──
function addMemo(text, title, note) {
  memos.unshift({id: Date.now(), text, title, note: note || '', createdAt: Date.now()});
  localStorage.setItem('ns_memos', JSON.stringify(memos));
  updateClipsFab();
  syncPush();
}
function updateMemoNote(id, note) {
  const m = memos.find(m => m.id === id);
  if (m) { m.note = note; localStorage.setItem('ns_memos', JSON.stringify(memos)); syncPush(); }
}
function removeMemo(id) {
  memos = memos.filter(m => m.id !== id);
  localStorage.setItem('ns_memos', JSON.stringify(memos));
  updateClipsFab();
  renderDrawer();
  syncPush();
}

// ── Drawer (clips/highlights/memos tabs) ──
let drawerTab = 'clips';

function renderDrawer() {
  const list = document.querySelector('.cd-list');
  if (!list) return;
  const countEl = document.querySelector('.cd-count');

  if (drawerTab === 'clips') {
    if (countEl) countEl.textContent = clips.length + '\uAC1C';
    if (!clips.length) {
      list.innerHTML = '<div class="cd-empty"><div style="font-size:2.5rem;color:var(--rule);margin-bottom:12px">\xB6</div><div>본문에서 텍스트를 드래그하면<br>여기에 모입니다.</div></div>';
      return;
    }
    list.innerHTML = clips.map(c => `<div class="clip-item"><div style="font-size:0.78rem;color:var(--muted);margin-bottom:4px">${esc(c.title || '')}</div><div class="ci-text">${esc(c.text)}</div><div class="ci-tools"><button onclick="navigator.clipboard?.writeText(${JSON.stringify(c.text)})">복사</button><button onclick="removeClip(${c.id})">삭제</button></div></div>`).join('');
  } else if (drawerTab === 'highlights') {
    if (countEl) countEl.textContent = highlights.length + '\uAC1C';
    if (!highlights.length) {
      list.innerHTML = '<div class="cd-empty"><div style="font-size:2.5rem;color:var(--rule);margin-bottom:12px">\uD83D\uDD8D</div><div>형광펜으로 칠한 텍스트가<br>여기에 모입니다.</div></div>';
      return;
    }
    list.innerHTML = highlights.map(h => `<div class="clip-item"><div style="font-size:0.78rem;color:var(--muted);margin-bottom:4px">${esc(h.title || '')}</div><div class="ci-text" style="border-left-color:oklch(0.85 0.18 90)">${esc(h.text)}</div><div class="ci-tools"><button onclick="removeHighlight(${h.id})">삭제</button></div></div>`).join('');
  } else if (drawerTab === 'memos') {
    if (countEl) countEl.textContent = memos.length + '\uAC1C';
    if (!memos.length) {
      list.innerHTML = '<div class="cd-empty"><div style="font-size:2.5rem;color:var(--rule);margin-bottom:12px">\uD83D\uDCDD</div><div>메모를 추가하면<br>여기에 모입니다.</div></div>';
      return;
    }
    list.innerHTML = memos.map(m => `<div class="clip-item"><div style="font-size:0.78rem;color:var(--muted);margin-bottom:4px">${esc(m.title || '')}</div><div class="ci-text">${esc(m.text)}</div><div class="memo-note-wrap"><textarea class="memo-note" placeholder="메모 입력..." data-memo-id="${m.id}">${esc(m.note || '')}</textarea></div><div class="ci-tools"><button onclick="removeMemo(${m.id})">삭제</button></div></div>`).join('');
    // memo note save on blur
    list.querySelectorAll('.memo-note').forEach(ta => {
      ta.addEventListener('blur', function() {
        updateMemoNote(Number(this.dataset.memoId), this.value);
      });
    });
  }
}

function initDrawer() {
  document.querySelector('.clips-fab')?.addEventListener('click', () => {
    document.getElementById('clipsOverlay')?.classList.add('open');
    document.querySelector('.clips-drawer')?.classList.add('open');
    renderDrawer();
  });
  document.getElementById('clipsOverlay')?.addEventListener('click', () => {
    document.getElementById('clipsOverlay')?.classList.remove('open');
    document.querySelector('.clips-drawer')?.classList.remove('open');
  });
  document.getElementById('clipsClose')?.addEventListener('click', () => {
    document.getElementById('clipsOverlay')?.classList.remove('open');
    document.querySelector('.clips-drawer')?.classList.remove('open');
  });
  // Tabs
  document.querySelectorAll('.cd-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      drawerTab = this.dataset.tab;
      document.querySelectorAll('.cd-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === drawerTab));
      renderDrawer();
    });
  });
}

// ── Text selection popover (clip / highlight / memo) ──
let clipPopover = null;
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function showPopover(sel) {
  if (clipPopover) { clipPopover.remove(); clipPopover = null; }
  if (!sel || sel.isCollapsed) return;
  const text = sel.toString().trim();
  if (text.length < 4) return;
  const range = sel.getRangeAt(0);
  const art = range.commonAncestorContainer.closest?.('.inline-article') ||
              range.commonAncestorContainer.parentElement?.closest?.('.inline-article');
  if (!art) return;
  const rect = range.getBoundingClientRect();
  const title = art.querySelector('.ia-title')?.textContent || '';
  const safeText = text.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n');
  const safeTitle = title.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n');

  const pop = document.createElement('div');
  pop.className = 'clip-popover';
  pop.style.position = 'fixed';
  pop.style.left = (rect.left + rect.width / 2) + 'px';
  // iOS: position below selection to avoid native menu overlap
  if (IS_IOS) {
    pop.style.top = (rect.bottom + 12) + 'px';
    pop.style.transform = 'translateX(-50%)';
    pop.classList.add('pop-below');
  } else {
    pop.style.top = rect.top + 'px';
  }

  pop.innerHTML =
    `<button onclick="addClip('${safeText}','${safeTitle}');this.parentElement.remove();window.getSelection().removeAllRanges()">${SVG_CLIP} 클립</button>` +
    `<button onclick="addHighlight('${safeText}','${safeTitle}');this.parentElement.remove();window.getSelection().removeAllRanges()" class="pop-hl">` +
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="oklch(0.85 0.18 90)" stroke="none"><rect x="1" y="6" width="22" height="12" rx="2"/></svg> 형광펜</button>` +
    `<button onclick="startMemo('${safeText}','${safeTitle}');this.parentElement.remove()" class="pop-memo">` +
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 메모</button>` +
    `<button onclick="navigator.clipboard?.writeText('${safeText}');this.parentElement.remove();window.getSelection().removeAllRanges()">복사</button>`;

  document.body.appendChild(pop);
  clipPopover = pop;
}

function startMemo(text, title) {
  window.getSelection().removeAllRanges();
  // show inline memo card
  const card = document.createElement('div');
  card.className = 'memo-card-inline';
  card.innerHTML = `
    <div class="mc-header">메모</div>
    <div class="mc-quote">${esc(text.substring(0, 80))}${text.length > 80 ? '...' : ''}</div>
    <textarea class="mc-input" placeholder="메모를 입력하세요..." autofocus></textarea>
    <div class="mc-actions">
      <button class="mc-cancel">취소</button>
      <button class="mc-save">저장</button>
    </div>
  `;
  document.body.appendChild(card);
  // position near center
  card.style.position = 'fixed';
  card.style.top = '50%';
  card.style.left = '50%';
  card.style.transform = 'translate(-50%, -50%)';
  card.style.zIndex = '500';

  const overlay = document.createElement('div');
  overlay.className = 'memo-overlay';
  document.body.appendChild(overlay);

  const close = () => { card.remove(); overlay.remove(); };
  card.querySelector('.mc-cancel').addEventListener('click', close);
  overlay.addEventListener('click', close);
  card.querySelector('.mc-save').addEventListener('click', () => {
    const note = card.querySelector('.mc-input').value;
    addMemo(text, title, note);
    close();
  });
  setTimeout(() => card.querySelector('.mc-input')?.focus(), 50);
}

function initSelectionPopover() {
  // Desktop: mouseup
  document.addEventListener('mouseup', () => {
    setTimeout(() => showPopover(window.getSelection()), 10);
  });
  // iOS/mobile: selectionchange with delay
  if (IS_IOS) {
    let selTimer = null;
    document.addEventListener('selectionchange', () => {
      clearTimeout(selTimer);
      selTimer = setTimeout(() => showPopover(window.getSelection()), 350);
    });
  } else {
    // Android/other touch
    document.addEventListener('touchend', () => {
      setTimeout(() => showPopover(window.getSelection()), 300);
    });
  }
  // Dismiss
  document.addEventListener('mousedown', (e) => {
    if (clipPopover && !e.target.closest('.clip-popover')) { clipPopover.remove(); clipPopover = null; }
  });
  document.addEventListener('touchstart', (e) => {
    if (clipPopover && !e.target.closest('.clip-popover')) { clipPopover.remove(); clipPopover = null; }
  });
}

// ── Inline editing ──
function initInlineEditing() {
  const EDITS_KEY = 'ns_edits';
  let edits = JSON.parse(localStorage.getItem(EDITS_KEY) || '{}');

  function makeEditable(el, saveKey, field) {
    el.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      if (this.contentEditable === 'true') return;
      this.contentEditable = 'true';
      this.focus();
      const done = () => {
        this.contentEditable = 'false';
        if (!edits[saveKey]) edits[saveKey] = {};
        edits[saveKey][field] = this.textContent;
        localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
        if (field === 'title') {
          const card = this.closest('.card-row');
          if (card) {
            const rt = card.querySelector('.row-title');
            const it = card.querySelector('.ia-title');
            if (rt) rt.textContent = this.textContent;
            if (it) it.textContent = this.textContent;
          }
        }
        syncPush();
      };
      this.addEventListener('blur', done, {once: true});
      this.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); this.blur(); }
      });
    });
  }

  document.querySelectorAll('.card-row').forEach((row, i) => {
    const id = 'card-' + i;
    row.id = id;
    const rowTitle = row.querySelector('.row-title');
    const iaTitle = row.querySelector('.ia-title');
    if (rowTitle) makeEditable(rowTitle, id, 'title');
    if (iaTitle) makeEditable(iaTitle, id, 'title');
    if (edits[id]?.title) {
      if (rowTitle) rowTitle.textContent = edits[id].title;
      if (iaTitle) iaTitle.textContent = edits[id].title;
    }
  });

  // Main page editable
  document.querySelectorAll('[data-edit]').forEach(el => {
    const key = el.dataset.edit;
    const IDX_KEY = 'ns_idx_edits';
    let idxEdits = JSON.parse(localStorage.getItem(IDX_KEY) || '{}');
    if (idxEdits[key]) el.innerHTML = idxEdits[key];
    el.style.cursor = 'text';
    el.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      if (this.contentEditable === 'true') return;
      this.contentEditable = 'true';
      this.focus();
      const done = () => {
        this.contentEditable = 'false';
        idxEdits[key] = this.innerHTML;
        localStorage.setItem(IDX_KEY, JSON.stringify(idxEdits));
      };
      this.addEventListener('blur', done, {once: true});
      this.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); this.blur(); }
      });
    });
  });
}

// ── Mobile tabs ──
function initMobileTabs() {
  document.getElementById('mFsBtn')?.addEventListener('click', () => document.getElementById('fsBtn')?.click());
  document.getElementById('mSettingsBtn')?.addEventListener('click', () => document.getElementById('settingsBtn')?.click());
}

// ── Sidebar group toggle ──
function initSidebarGroups() {
  document.querySelectorAll('.nav-group-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const group = this.closest('.nav-group');
      if (group) group.classList.toggle('open');
    });
  });
}

// ── Gist Sync ──
const SYNC_TOKEN_KEY = 'ns_sync_token';
const SYNC_GIST_KEY = 'ns_sync_gist_id';
let syncToken = localStorage.getItem(SYNC_TOKEN_KEY) || '';
let syncGistId = localStorage.getItem(SYNC_GIST_KEY) || '';
let syncDebounce = null;

function getSyncData() {
  return {
    bookmarks: [...bookmarks],
    clips,
    highlights,
    memos,
    edits: JSON.parse(localStorage.getItem('ns_edits') || '{}'),
    idxEdits: JSON.parse(localStorage.getItem('ns_idx_edits') || '{}'),
    settings: { density, theme, mode, fs: fsSizes[fsIdx] },
    updatedAt: Date.now()
  };
}

function applySyncData(data) {
  if (!data) return;
  if (data.bookmarks) { bookmarks = new Set(data.bookmarks); localStorage.setItem('ns_bookmarks', JSON.stringify(data.bookmarks)); }
  if (data.clips) { clips = data.clips; localStorage.setItem('ns_clips', JSON.stringify(clips)); }
  if (data.highlights) { highlights = data.highlights; localStorage.setItem('ns_highlights', JSON.stringify(highlights)); }
  if (data.memos) { memos = data.memos; localStorage.setItem('ns_memos', JSON.stringify(memos)); }
  if (data.edits) localStorage.setItem('ns_edits', JSON.stringify(data.edits));
  if (data.idxEdits) localStorage.setItem('ns_idx_edits', JSON.stringify(data.idxEdits));
  if (data.settings) {
    density = data.settings.density || density;
    theme = data.settings.theme || theme;
    mode = data.settings.mode || mode;
    fsIdx = fsSizes.indexOf(data.settings.fs) || fsIdx;
    localStorage.setItem('ns_density', density);
    localStorage.setItem('ns_theme', theme);
    localStorage.setItem('ns_mode', mode);
    localStorage.setItem('ns_fs', fsSizes[fsIdx]);
  }
  applyState();
  applyHighlightsToDOM();
}

async function syncPush() {
  if (!syncToken) return;
  clearTimeout(syncDebounce);
  syncDebounce = setTimeout(async () => {
    try {
      const data = getSyncData();
      const body = { files: { 'ns_sync.json': { content: JSON.stringify(data) } } };
      if (syncGistId) {
        await fetch(`https://api.github.com/gists/${syncGistId}`, {
          method: 'PATCH', headers: { Authorization: `token ${syncToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        body.description = 'Essay Reader Sync';
        body.public = false;
        const res = await fetch('https://api.github.com/gists', {
          method: 'POST', headers: { Authorization: `token ${syncToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const json = await res.json();
        if (json.id) { syncGistId = json.id; localStorage.setItem(SYNC_GIST_KEY, syncGistId); }
      }
      showSyncStatus('synced');
    } catch (e) { showSyncStatus('error'); }
  }, 2000);
}

async function syncPull() {
  if (!syncToken || !syncGistId) return;
  try {
    const res = await fetch(`https://api.github.com/gists/${syncGistId}`, {
      headers: { Authorization: `token ${syncToken}` }
    });
    const json = await res.json();
    const content = json.files?.['ns_sync.json']?.content;
    if (content) {
      const data = JSON.parse(content);
      const localTime = Number(localStorage.getItem('ns_sync_time') || '0');
      if (data.updatedAt > localTime) {
        applySyncData(data);
        localStorage.setItem('ns_sync_time', String(data.updatedAt));
      }
    }
    showSyncStatus('synced');
  } catch (e) { showSyncStatus('error'); }
}

function showSyncStatus(status) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  el.className = 'sync-status ' + status;
  el.textContent = status === 'synced' ? '\u2714' : status === 'error' ? '\u26A0' : '';
  setTimeout(() => { el.className = 'sync-status'; el.textContent = ''; }, 3000);
}

function initSyncUI() {
  // Add sync button to settings if exists
  const settingsPanel = document.querySelector('.settings-panel');
  if (!settingsPanel) return;

  const syncSection = document.createElement('div');
  syncSection.className = 'setting-row';
  syncSection.innerHTML = `
    <div class="setting-label">기기 동기화</div>
    <div class="sync-ui">
      <input type="password" class="sync-token-input" placeholder="GitHub Token (gist scope)" value="${syncToken ? '********' : ''}">
      ${syncGistId ? `<div style="font-size:0.72rem;color:var(--muted);margin-top:4px">Gist: ${syncGistId.substring(0, 8)}... <span id="syncStatus" class="sync-status"></span></div>` : ''}
      <div class="sync-btns">
        <button class="setting-btn sync-save-btn">토큰 저장</button>
        <button class="setting-btn sync-pull-btn">불러오기</button>
        <button class="setting-btn sync-push-btn">내보내기</button>
        ${syncGistId ? '<button class="setting-btn sync-reset-btn" style="color:var(--muted)">연결 해제</button>' : ''}
      </div>
    </div>
  `;
  settingsPanel.appendChild(syncSection);

  const tokenInput = syncSection.querySelector('.sync-token-input');
  syncSection.querySelector('.sync-save-btn').addEventListener('click', () => {
    const val = tokenInput.value;
    if (val && val !== '********') {
      syncToken = val;
      localStorage.setItem(SYNC_TOKEN_KEY, val);
      tokenInput.value = '********';
      // auto push after save
      syncPush();
    }
  });
  syncSection.querySelector('.sync-pull-btn').addEventListener('click', () => syncPull());
  syncSection.querySelector('.sync-push-btn').addEventListener('click', () => {
    clearTimeout(syncDebounce);
    syncDebounce = null;
    syncPush();
  });
  syncSection.querySelector('.sync-reset-btn')?.addEventListener('click', () => {
    syncToken = ''; syncGistId = '';
    localStorage.removeItem(SYNC_TOKEN_KEY);
    localStorage.removeItem(SYNC_GIST_KEY);
    tokenInput.value = '';
    location.reload();
  });
}

// ── Util ──
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initExpandCollapse();
  initBookmarks();
  initFontSize();
  initDensity();
  initSettings();
  initDrawer();
  initSelectionPopover();
  initInlineEditing();
  initMobileTabs();
  initSidebarGroups();
  initSyncUI();
  applyState();
  applyHighlightsToDOM();
  // Auto pull on load
  if (syncToken && syncGistId) syncPull();
});
