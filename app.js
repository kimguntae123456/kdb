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
let clipFolders = JSON.parse(localStorage.getItem('ns_clip_folders') || '[]');
let summaryOverrides = JSON.parse(localStorage.getItem('ns_summary_overrides') || '{}');
// Migration: ensure each clip has folderId field
clips.forEach(c => { if (c.folderId === undefined) c.folderId = null; });
// Migration: 너무 짧은(<=3자) 형광펜 항목 제거 — '핵심' 같은 단어가 모든 글에 번지는 것 차단.
// 또한 사용자가 의도하지 않은 단어 단위 highlight 자동 정리. (1회성)
if (!localStorage.getItem('ns_hl_purge_v1')) {
  const before = highlights.length;
  highlights = highlights.filter(h => (h.text || '').trim().length > 3);
  if (highlights.length !== before) {
    localStorage.setItem('ns_highlights', JSON.stringify(highlights));
  }
  localStorage.setItem('ns_hl_purge_v1', '1');
}

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
  initPrintButtons();
}

// ── Print/PDF (현재 펼쳐진 글만 출력) ──
function initPrintButtons() {
  if (!document.getElementById('print-style')) {
    const st = document.createElement('style');
    st.id = 'print-style';
    st.textContent = `
      @media print {
        @page { margin: 14mm; }
        body * { visibility: hidden !important; }
        .row.expanded + .inline-article,
        .row.expanded + .inline-article * { visibility: visible !important; }
        .row.expanded + .inline-article {
          position: absolute !important; left: 0; top: 0; width: 100% !important;
          max-width: none !important; margin: 0 !important; padding: 0 !important;
          box-shadow: none !important; border: none !important; background: #fff !important;
          display: block !important;
        }
        .ia-close, .ia-print, .pk-mindmap, .bookmark-btn, #gsBtn { display: none !important; }
      }
    `;
    document.head.appendChild(st);
  }
  document.querySelectorAll('.inline-article').forEach(art => {
    if (art.querySelector('.ia-print')) return;
    const btn = document.createElement('button');
    btn.className = 'ia-print';
    btn.title = 'PDF로 출력';
    btn.textContent = 'PDF';
    Object.assign(btn.style, {
      position:'absolute', top:'12px', right:'56px', zIndex:'5',
      padding:'4px 10px', fontSize:'.78rem', fontWeight:'700',
      background:'#fff8d8', color:'#1c2040',
      border:'2px solid #1c2040', boxShadow:'2px 2px 0 #1c2040',
      cursor:'pointer', borderRadius:'4px'
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.print();
    });
    const closeBtn = art.querySelector('.ia-close');
    if (closeBtn) closeBtn.parentNode.insertBefore(btn, closeBtn);
    else art.appendChild(btn);
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
  clips.unshift({id: Date.now(), text, title, folderId: null, createdAt: Date.now()});
  localStorage.setItem('ns_clips', JSON.stringify(clips));
  updateClipsFab();
  syncPush();
}

// ── Clip Folders ──
function saveFolders() { localStorage.setItem('ns_clip_folders', JSON.stringify(clipFolders)); syncPush(); }
function saveClips() { localStorage.setItem('ns_clips', JSON.stringify(clips)); syncPush(); }
function createFolder(name, color) {
  const f = {id: 'f' + Date.now(), name: name || '새 폴더', color: color || 'oklch(0.55 0.13 35)', createdAt: Date.now()};
  clipFolders.push(f);
  saveFolders();
  return f;
}
function renameFolder(id, name) { const f = clipFolders.find(f => f.id === id); if (f) { f.name = name; saveFolders(); } }
function deleteFolder(id) {
  clipFolders = clipFolders.filter(f => f.id !== id);
  clips.forEach(c => { if (c.folderId === id) c.folderId = null; });
  saveFolders(); saveClips();
}
function moveClipToFolder(clipId, folderId) {
  const c = clips.find(c => c.id === clipId);
  if (c) { c.folderId = folderId; saveClips(); }
}
function removeClip(id) {
  clips = clips.filter(c => c.id !== id);
  localStorage.setItem('ns_clips', JSON.stringify(clips));
  updateClipsFab();
  renderDrawer();
  syncPush();
}

// ── Sector detection (URL path 기반) ──
function getCurrentSector() {
  try {
    const p = decodeURIComponent(location.pathname).replace(/\/index\.html$/, '');
    const segs = p.split('/').filter(Boolean);
    if (!segs.length) return '메인';
    const last = segs[segs.length - 1];
    if (last === '통합' || last === 'kdb') return '메인';
    return last;
  } catch (_) { return '기타'; }
}

// 기존 highlights에 sector 필드 마이그레이션
if (!localStorage.getItem('ns_hl_sector_v1')) {
  let migrated = false;
  highlights.forEach(h => { if (!h.sector) { h.sector = getCurrentSector(); migrated = true; } });
  if (migrated) localStorage.setItem('ns_highlights', JSON.stringify(highlights));
  localStorage.setItem('ns_hl_sector_v1', '1');
}

// ── Highlights ──
function addHighlight(text, title) {
  const id = Date.now();
  highlights.unshift({id, text, title, sector: getCurrentSector(), createdAt: id});
  localStorage.setItem('ns_highlights', JSON.stringify(highlights));
  updateClipsFab();
  /* 1차 시도: 라이브 Range 직접 wrap (가장 안정적) */
  const r = window.__pendingHlRange;
  window.__pendingHlRange = null;
  let wrapped = false;
  if (r) {
    try { wrapped = wrapLiveRange(r, id); } catch (_) { wrapped = false; }
  }
  /* 2차 시도: 텍스트 매칭 기반 재적용 */
  if (!wrapped) applyHighlightsToDOM();
  syncPush();
}
function wrapLiveRange(range, hlId) {
  if (!range || range.collapsed) return false;
  const root = range.commonAncestorContainer.nodeType === 1
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;
  if (!root) return false;
  /* 단일 텍스트 노드인 경우 */
  if (range.startContainer === range.endContainer && range.startContainer.nodeType === 3) {
    const t = range.startContainer;
    const s = range.startOffset, e = range.endOffset;
    if (s >= e) return false;
    const piece = t.splitText(s);
    if (e - s < piece.textContent.length) piece.splitText(e - s);
    const m = document.createElement('mark');
    m.className = 'hl-mark'; m.dataset.hlId = hlId;
    piece.parentNode.insertBefore(m, piece);
    m.appendChild(piece);
    return true;
  }
  /* 멀티 노드: range 내 텍스트 노드 수집 후 각각 래핑 */
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => range.intersectsNode(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const texts = [];
  let n; while (n = walker.nextNode()) texts.push(n);
  if (!texts.length) return false;
  texts.forEach(t => {
    let s = 0, e = t.textContent.length;
    if (t === range.startContainer) s = range.startOffset;
    if (t === range.endContainer) e = range.endOffset;
    if (s >= e) return;
    const piece = t.splitText(s);
    if (e - s < piece.textContent.length) piece.splitText(e - s);
    const m = document.createElement('mark');
    m.className = 'hl-mark'; m.dataset.hlId = hlId;
    piece.parentNode.insertBefore(m, piece);
    m.appendChild(piece);
  });
  return true;
}
function removeHighlight(id) {
  highlights = highlights.filter(h => h.id !== id);
  localStorage.setItem('ns_highlights', JSON.stringify(highlights));
  updateClipsFab();
  renderDrawer();
  syncPush();
}
function applyHighlightsToDOM() {
  document.querySelectorAll('mark.hl-mark').forEach(m => {
    const parent = m.parentNode;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize?.();
  });
  if (!highlights.length) return;
  // 각 글의 highlight는 그 글 안에서만 재적용 — 짧은 단어("핵심" 등)가 다른 글까지 번지는 것 방지
  document.querySelectorAll('.inline-article, .article-content').forEach(content => {
    const card = content.closest('.card-row, .row') || content.previousElementSibling || content.parentElement;
    const titleEl = card?.querySelector?.('.ia-title, .row-title') || content.querySelector?.('.ia-title, .row-title');
    const myTitle = (titleEl?.textContent || '').trim();
    highlights.forEach(h => {
      const hTitle = (h.title || '').trim();
      // title이 비어있으면(레거시) 모든 글에 적용, 아니면 동일 제목에만
      if (hTitle && myTitle && hTitle !== myTitle) return;
      highlightTextInRoot(content, h.text, h.id);
    });
  });
}
function highlightTextInRoot(root, search, hlId) {
  if (!search) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentNode.closest('mark.hl-mark') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nodes = [];
  let n;
  while (n = walker.nextNode()) nodes.push(n);
  if (!nodes.length) return;
  const flat = nodes.map(t => t.textContent).join('');
  /* 공백/줄바꿈 차이 허용 매칭: search의 공백류를 \s+ 로 */
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escapeRe(search.trim()).replace(/\s+/g, '\\s+');
  let idx = -1, end = -1;
  const re = new RegExp(pattern);
  const m = re.exec(flat);
  if (m) { idx = m.index; end = idx + m[0].length; }
  else {
    /* fallback: 공백 모두 제거하고 매칭 */
    const stripIdx = flat.replace(/\s+/g, '').indexOf(search.replace(/\s+/g, ''));
    if (stripIdx !== -1) {
      const stripSearch = search.replace(/\s+/g, '');
      let acc = '', wsBefore = 0;
      for (let i = 0; i < flat.length; i++) {
        if (/\s/.test(flat[i])) { wsBefore++; continue; }
        if (acc.length === stripIdx) { idx = i; break; }
        acc += flat[i];
      }
      if (idx !== -1) {
        let collected = 0, j = idx;
        while (j < flat.length && collected < stripSearch.length) {
          if (!/\s/.test(flat[j])) collected++;
          j++;
        }
        end = j;
      }
    }
  }
  if (idx === -1 || end === -1) return;
  let pos = 0, startNode = null, startOff = 0, endNode = null, endOff = 0;
  for (const t of nodes) {
    const len = t.textContent.length;
    if (!startNode && pos + len > idx) { startNode = t; startOff = idx - pos; }
    if (!endNode && pos + len >= end) { endNode = t; endOff = end - pos; break; }
    pos += len;
  }
  if (!startNode || !endNode) return;
  try {
    const range = document.createRange();
    range.setStart(startNode, startOff);
    range.setEnd(endNode, endOff);
    if (startNode === endNode) {
      const mark = document.createElement('mark');
      mark.className = 'hl-mark';
      mark.dataset.hlId = hlId;
      range.surroundContents(mark);
      return;
    }
    /* multi-node: wrap each text segment within range individually */
    const between = nodes.slice(nodes.indexOf(startNode), nodes.indexOf(endNode) + 1);
    between.forEach(t => {
      let s = 0, e = t.textContent.length;
      if (t === startNode) s = startOff;
      if (t === endNode) e = endOff;
      if (s >= e) return;
      const piece = t.splitText(s);
      if (e - s < piece.textContent.length) piece.splitText(e - s);
      const mark = document.createElement('mark');
      mark.className = 'hl-mark';
      mark.dataset.hlId = hlId;
      piece.parentNode.insertBefore(mark, piece);
      mark.appendChild(piece);
    });
  } catch (_) {}
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
    // 섹터 → 보고서(title) → 형광펜 묶음 (폴더 구조)
    const bySector = {};
    highlights.forEach(h => {
      const sec = h.sector || '기타';
      const title = h.title || '(제목없음)';
      if (!bySector[sec]) bySector[sec] = {};
      if (!bySector[sec][title]) bySector[sec][title] = [];
      bySector[sec][title].push(h);
    });
    const collapsed = JSON.parse(localStorage.getItem('ns_hl_collapsed_v1') || '{}');
    list.innerHTML = Object.entries(bySector).map(([sec, reports]) => {
      const totalCount = Object.values(reports).reduce((a, b) => a + b.length, 0);
      const sKey = 's::' + sec;
      const isOpen = collapsed[sKey] !== true;
      const reportsHTML = Object.entries(reports).map(([title, hs]) => {
        const tKey = 't::' + sec + '::' + title;
        const tOpen = collapsed[tKey] !== true;
        const itemsHTML = hs.map(h => `<div class="hl-snippet"><span class="hl-snippet-text">${esc(h.text)}</span><button class="hl-snippet-del" data-del-id="${h.id}" title="삭제">×</button></div>`).join('');
        return `<div class="hl-report ${tOpen ? 'open' : ''}"><div class="hl-report-head" data-toggle="${esc(tKey)}"><span class="hl-report-arrow">${tOpen ? '▾' : '▸'}</span><span class="hl-report-title">${esc(title)}</span><span class="hl-report-count">${hs.length}</span></div>${tOpen ? `<div class="hl-report-body">${itemsHTML}</div>` : ''}</div>`;
      }).join('');
      return `<div class="hl-sector ${isOpen ? 'open' : ''}"><div class="hl-sector-head" data-toggle="${esc(sKey)}"><span class="hl-sector-arrow">${isOpen ? '▾' : '▸'}</span><span class="hl-sector-icon">📁</span><span class="hl-sector-name">${esc(sec)}</span><span class="hl-sector-count">${totalCount}</span></div>${isOpen ? `<div class="hl-sector-body">${reportsHTML}</div>` : ''}</div>`;
    }).join('');
    list.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.toggle;
        const cur = JSON.parse(localStorage.getItem('ns_hl_collapsed_v1') || '{}');
        cur[key] = !cur[key];
        localStorage.setItem('ns_hl_collapsed_v1', JSON.stringify(cur));
        renderDrawer();
      });
    });
    list.querySelectorAll('[data-del-id]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        removeHighlight(Number(btn.dataset.delId));
      });
    });
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
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (/Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1 && !('chrome' in window) && !matchMedia('(pointer: fine)').matches);

function showPopover(sel) {
  if (!sel || sel.isCollapsed) return;
  const text = sel.toString().trim();
  if (text.length < 2) return;
  const range = sel.getRangeAt(0);
  const cac = range.commonAncestorContainer;
  const cacEl = cac.nodeType === 1 ? cac : cac.parentElement;
  // 본문 영역 판정: row 단위까지 포괄. 못 찾으면 ia-body/row 보조 selector도 시도.
  const art = cacEl?.closest('.inline-article, .row-excerpt, .row-body, .article-content, .ia-body, .row, [class*="article"], [class*="ia-"]');
  if (!art) return;
  // 같은 selection 으로 popover 이미 떠 있으면 재생성 스킵 (mouseup 재트리거로 인한 클릭 유실 방지)
  if (clipPopover && clipPopover.dataset.selKey === text) return;
  if (clipPopover) { clipPopover.remove(); clipPopover = null; }
  const rect = range.getBoundingClientRect();
  const card = cacEl.closest('.card-row, .row') || art;
  const title = card.querySelector('.ia-title, .row-title')?.textContent || '';
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

  // onclick 인라인 속성에 따옴표·특수문자 들어가면 HTML이 깨져 핸들러가 죽음 → addEventListener로 바인딩
  pop.innerHTML =
    `<button data-act="clip">${SVG_CLIP} 클립</button>` +
    `<button data-act="hl" class="pop-hl"><svg width="14" height="14" viewBox="0 0 24 24" fill="oklch(0.85 0.18 90)" stroke="none"><rect x="1" y="6" width="22" height="12" rx="2"/></svg> 형광펜</button>` +
    `<button data-act="memo" class="pop-memo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 메모</button>` +
    `<button data-act="copy">복사</button>`;

  pop.dataset.selKey = text;
  pop.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      const liveSel = window.getSelection();
      const liveRange = liveSel && liveSel.rangeCount ? liveSel.getRangeAt(0).cloneRange() : null;
      if (act === 'clip') addClip(text, title);
      else if (act === 'hl') { window.__pendingHlRange = liveRange; addHighlight(text, title); }
      else if (act === 'memo') { startMemo(text, title); }
      else if (act === 'copy') { navigator.clipboard?.writeText(text); }
      pop.remove(); clipPopover = null;
      if (act !== 'memo') liveSel?.removeAllRanges();
    });
  });

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
  // Desktop: mouseup. popover 자체에서 발생한 mouseup은 무시(클릭 유실 방지)
  document.addEventListener('mouseup', (e) => {
    if (e.target && e.target.closest && e.target.closest('.clip-popover')) return;
    setTimeout(() => showPopover(window.getSelection()), 10);
  });
  // 모바일/iOS 모두: selectionchange 기반 폴백 (네이티브 콜아웃과 공존)
  let selTimer = null;
  document.addEventListener('selectionchange', () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const s = window.getSelection();
      if (!s || s.isCollapsed) return;
      // 이미 popover 있으면 재생성 안 함 (showPopover가 알아서 selKey 비교)
      showPopover(s);
    }, IS_IOS ? 250 : 200);
  });
  // 추가: touchend도 백업으로 (selectionchange 미발화 케이스)
  document.addEventListener('touchend', (e) => {
    if (e.target && e.target.closest && e.target.closest('.clip-popover')) return;
    setTimeout(() => showPopover(window.getSelection()), 280);
  });
  // Dismiss
  document.addEventListener('mousedown', (e) => {
    if (clipPopover && !e.target.closest('.clip-popover')) { clipPopover.remove(); clipPopover = null; }
  });
  document.addEventListener('touchstart', (e) => {
    if (clipPopover && !e.target.closest('.clip-popover')) { clipPopover.remove(); clipPopover = null; }
  });
  // 단축키: 드래그 후 e=형광펜, c=클립, m=메모. 한글 IME에서도 동작하도록 ev.code 우선 매칭
  document.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const code = ev.code;
    let act = null;
    if (code === 'KeyE' || ev.key === 'e' || ev.key === 'E' || ev.key === 'ㄷ') act = 'hl';
    else if (code === 'KeyC' || ev.key === 'c' || ev.key === 'C' || ev.key === 'ㅊ') act = 'clip';
    else if (code === 'KeyM' || ev.key === 'm' || ev.key === 'M' || ev.key === 'ㅡ') act = 'memo';
    else return;
    const t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (text.length < 2) return;
    const range = sel.getRangeAt(0);
    const cac = range.commonAncestorContainer;
    const cacEl = cac.nodeType === 1 ? cac : cac.parentElement;
    const art = cacEl?.closest('.inline-article, .row-excerpt, .row-body, .article-content, .ia-body, .row, [class*="article"], [class*="ia-"]');
    if (!art) return;
    ev.preventDefault();
    const card = cacEl.closest('.card-row, .row') || art;
    const title = card.querySelector('.ia-title, .row-title')?.textContent || '';
    if (act === 'hl') { window.__pendingHlRange = range.cloneRange(); addHighlight(text, title); }
    else if (act === 'clip') addClip(text, title);
    else if (act === 'memo') { startMemo(text, title); return; }
    if (clipPopover) { clipPopover.remove(); clipPopover = null; }
    sel.removeAllRanges();
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
        const newText = (this.textContent || '').trim();
        // 제목 빈값 저장 차단 — 실수로 비우고 blur해도 기존 텍스트 복구
        if (field === 'title' && !newText) {
          const card = this.closest('.card-row');
          const fallback = card?.querySelector('.bookmark-btn')?.dataset.title
            || card?.dataset.text
            || card?.querySelector('.ia-title')?.textContent
            || card?.querySelector('.row-title')?.textContent
            || '';
          if (fallback.trim()) {
            this.textContent = fallback.trim();
            if (edits[saveKey]) { delete edits[saveKey][field]; localStorage.setItem(EDITS_KEY, JSON.stringify(edits)); }
            return;
          }
        }
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

  function makeEditableHTML(el, saveKey, field) {
    el.classList.add('ns-editable-body');
    el.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      if (this.contentEditable === 'true') return;
      const prevHTML = this.innerHTML;
      this.contentEditable = 'true';
      this.focus();
      const done = () => {
        this.contentEditable = 'false';
        const newHTML = this.innerHTML;
        if (newHTML === prevHTML) return;
        const plain = (this.textContent || '').trim();
        /* 데이터 손실 가드: 이전에 내용이 있었는데 빈 문자열로 저장하려 하면 무시 */
        if (!plain && (prevHTML || '').replace(/<[^>]+>/g, '').trim()) {
          this.innerHTML = prevHTML;
          return;
        }
        if (!edits[saveKey]) edits[saveKey] = {};
        edits[saveKey][field] = newHTML;
        localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
        syncPush();
      };
      this.addEventListener('blur', done, {once: true});
      this.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') { ev.preventDefault(); this.blur(); }
      });
    });
  }

  const BODY_EDITABLE = '.ia-section-h, .ia-para-title, .ia-sub-title, .ia-tag-title, .ia-para-body, .ia-source, .qa-q, .qa-a, .term-name, .term-def';

  const PAGE_NS = decodeURIComponent(location.pathname).replace(/\/+/g, '_').replace(/^_|_$/g, '') || 'root';
  document.querySelectorAll('.card-row').forEach((row, i) => {
    const id = PAGE_NS + '::card-' + i;
    const oldId = 'card-' + i;
    row.id = id;
    const rowTitle = row.querySelector('.row-title');
    const iaTitle = row.querySelector('.ia-title');
    if (rowTitle) makeEditable(rowTitle, id, 'title');
    if (iaTitle) makeEditable(iaTitle, id, 'title');

    /* 보고서 본문(MD 변환 결과) 인라인 편집 */
    const article = row.nextElementSibling;
    if (article && article.classList.contains('inline-article')) {
      const items = article.querySelectorAll(BODY_EDITABLE);
      items.forEach((el, j) => {
        const field = 'body-' + j;
        if (edits[id]?.[field] != null) el.innerHTML = edits[id][field];
        makeEditableHTML(el, id, field);
      });
    }
    /* 신규 키 우선, 없으면 기존 글로벌 키는 무시 (다른 페이지 오염 방지) */
    if (edits[id]?.title) {
      if (rowTitle) rowTitle.textContent = edits[id].title;
      if (iaTitle) iaTitle.textContent = edits[id].title;
    } else if (edits[oldId]) {
      /* 1회성 정리: 글로벌 키 삭제 (모든 페이지가 공유하던 오염 제거) */
      delete edits[oldId];
      localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
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
    clipFolders,
    summaryOverrides,
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
  if (data.clipFolders) { clipFolders = data.clipFolders; localStorage.setItem('ns_clip_folders', JSON.stringify(clipFolders)); }
  if (data.summaryOverrides) { summaryOverrides = data.summaryOverrides; localStorage.setItem('ns_summary_overrides', JSON.stringify(summaryOverrides)); }
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

// ── Readability Enhancements (auto-injected on category pages) ──
function getArticleId(article) {
  // Stable id from parent card-row index
  const card = article.previousElementSibling;
  if (!card?.classList.contains('card-row')) return null;
  const all = [...document.querySelectorAll('.card-row')];
  return 'art-' + all.indexOf(card);
}

function autoSummaryFor(section) {
  // Grab first paragraph after the section heading, take first sentence
  let node = section.nextElementSibling;
  while (node && !['P','UL','DIV'].includes(node.tagName)) node = node.nextElementSibling;
  if (!node) return '';
  const txt = node.textContent.trim();
  if (!txt) return '';
  // First sentence: split by . or 다. or 음. patterns
  const m = txt.match(/^.{20,160}?(?:[\.。](?=\s|$)|다\.|음\.|함\.)/);
  let s = (m ? m[0] : txt.substring(0, 140)).trim();
  if (s.length > 160) s = s.substring(0, 157) + '...';
  return s;
}

function injectSectionSummaries(article) {
  const artId = getArticleId(article);
  if (!artId) return;
  const sections = article.querySelectorAll('.ia-section-h');
  sections.forEach((sec, idx) => {
    if (sec.nextElementSibling?.classList.contains('auto-summary')) return;
    const key = `${artId}::${idx}`;
    const override = summaryOverrides[key];
    const text = override !== undefined ? override : autoSummaryFor(sec);
    if (!text) return;
    const box = document.createElement('div');
    box.className = 'auto-summary';
    box.dataset.summaryKey = key;
    box.innerHTML = `<span class="as-label">요약</span><span class="as-text" contenteditable="false">${esc(text)}</span><button class="as-edit" title="수정">✎</button>`;
    sec.insertAdjacentElement('afterend', box);

    const txtEl = box.querySelector('.as-text');
    const editBtn = box.querySelector('.as-edit');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const editing = txtEl.contentEditable === 'true';
      if (!editing) {
        txtEl.contentEditable = 'true';
        txtEl.focus();
        editBtn.textContent = '✓';
      } else {
        txtEl.contentEditable = 'false';
        editBtn.textContent = '✎';
        summaryOverrides[key] = txtEl.textContent.trim();
        localStorage.setItem('ns_summary_overrides', JSON.stringify(summaryOverrides));
        syncPush();
      }
    });
    txtEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editBtn.click(); }
      if (e.key === 'Escape') { txtEl.textContent = override !== undefined ? override : autoSummaryFor(sec); editBtn.click(); }
    });
  });
}

function injectTOC(article) {
  if (article.querySelector('.toc-rail')) return;
  const sections = article.querySelectorAll('.ia-section-h, .ia-para-title');
  if (sections.length < 2) return;
  const rail = document.createElement('nav');
  rail.className = 'toc-rail';
  rail.innerHTML = '<div class="toc-head">목차</div><ul class="toc-list"></ul>';
  const list = rail.querySelector('.toc-list');
  sections.forEach((s, i) => {
    const id = 'toc-' + getArticleId(article) + '-' + i;
    s.id = id;
    const li = document.createElement('li');
    li.className = 'toc-item ' + (s.classList.contains('ia-section-h') ? 'toc-h2' : 'toc-h3');
    li.innerHTML = `<a href="#${id}">${esc(s.textContent.trim().substring(0, 50))}</a>`;
    li.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      const top = s.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({top, behavior: 'smooth'});
    });
    list.appendChild(li);
  });
  article.insertBefore(rail, article.firstChild);

  // Active section tracking on scroll
  const items = [...list.querySelectorAll('.toc-item')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const idx = [...sections].indexOf(en.target);
        items.forEach((it, i) => it.classList.toggle('active', i === idx));
      }
    });
  }, {rootMargin: '-80px 0px -70% 0px'});
  sections.forEach(s => observer.observe(s));
}

function injectKPIHighlights(article) {
  // Highlight numeric data in p/li (e.g., "87%", "5.6조원", "2만달러")
  const re = /(\d{1,4}(?:,\d{3})*(?:\.\d+)?\s?(?:%|조원|억원|억달러|만달러|만원|천억|조|억|만|조달러|배|위|개|건|개사|GW|MW|kW|t|kg|km|개국|년|개월|일|주|시간|회|차|호))/g;
  article.querySelectorAll('.article-content p, .article-content li, .article-content td').forEach(el => {
    if (el.dataset.kpiDone) return;
    if (el.querySelector('input,textarea,button,svg,mark,strong.kpi')) return;
    el.dataset.kpiDone = '1';
    // Walk text nodes only
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while (n = walker.nextNode()) nodes.push(n);
    nodes.forEach(node => {
      if (!re.test(node.textContent)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0; let m;
      const t = node.textContent;
      while ((m = re.exec(t)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(t.substring(last, m.index)));
        const strong = document.createElement('strong');
        strong.className = 'kpi';
        strong.textContent = m[0];
        frag.appendChild(strong);
        last = m.index + m[0].length;
      }
      if (last < t.length) frag.appendChild(document.createTextNode(t.substring(last)));
      node.parentNode.replaceChild(frag, node);
      re.lastIndex = 0;
    });
  });
}

function enhanceArticle(article) {
  if (article.dataset.enhanced) return;
  article.dataset.enhanced = '1';
  injectSectionSummaries(article);
  injectKPIHighlights(article);
}

function initReadabilityEnhancements() {
  // Enhance any already-expanded article (rare) and on-demand expand
  document.querySelectorAll('.row').forEach(row => {
    row.addEventListener('click', () => {
      const art = row.nextElementSibling;
      if (art?.classList.contains('inline-article')) {
        // Defer until after expand animation begins
        setTimeout(() => enhanceArticle(art), 60);
      }
    });
  });
  // Eager pass for any open articles
  document.querySelectorAll('.row.expanded + .inline-article').forEach(enhanceArticle);
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
  initReadabilityEnhancements();
  initGlobalSearch();
  initHashAutoExpand();
  applyState();
  applyHighlightsToDOM();
  // Auto pull on load
  if (syncToken && syncGistId) syncPull();
});

// ── Hash navigation: #row-N 으로 진입 시 자동 펼침 ──
function initHashAutoExpand() {
  function tryExpand() {
    const m = location.hash.match(/^#(row-\d+)/);
    if (!m) return;
    const row = document.getElementById(m[1]);
    if (!row) return;
    if (!row.classList.contains('expanded')) row.classList.add('expanded');
    setTimeout(() => {
      row.scrollIntoView({block:'start', behavior:'smooth'});
      window.scrollBy({top:-60, behavior:'instant'});
    }, 80);
  }
  tryExpand();
  window.addEventListener('hashchange', tryExpand);
}

// ── Global Search (전체 사이트 통합 검색) ──
let __searchIndex = null;
async function loadSearchIndex() {
  if (__searchIndex) return __searchIndex;
  try {
    const r = await fetch(BASE + 'search-index.json');
    __searchIndex = await r.json();
  } catch (e) { __searchIndex = []; }
  return __searchIndex;
}
function initGlobalSearch() {
  // FAB 버튼
  if (!document.getElementById('gsBtn')) {
    const btn = document.createElement('button');
    btn.id = 'gsBtn';
    btn.title = '전체 검색 (/)';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
    Object.assign(btn.style, {
      position:'fixed', right:'18px', bottom:'82px', zIndex:'400',
      width:'48px', height:'48px', borderRadius:'50%',
      background:'#fff8d8', border:'2.5px solid #1c2040',
      boxShadow:'3px 3px 0 #1c2040', cursor:'pointer', color:'#1c2040',
      display:'flex', alignItems:'center', justifyContent:'center'
    });
    btn.addEventListener('click', openGlobalSearch);
    document.body.appendChild(btn);
  }
  // 단축키: '/' 또는 Ctrl/Cmd+K
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const inField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if ((e.key === '/' && !inField) || ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      openGlobalSearch();
    }
  });
}
function closeGlobalSearch() {
  const o = document.getElementById('gsOverlay');
  if (o) o.remove();
}
async function openGlobalSearch() {
  closeGlobalSearch();
  const overlay = document.createElement('div');
  overlay.id = 'gsOverlay';
  Object.assign(overlay.style, {
    position:'fixed', inset:'0', zIndex:'9999',
    background:'rgba(28,32,64,.4)', display:'flex',
    alignItems:'flex-start', justifyContent:'center', padding:'8vh 16px 16px'
  });
  overlay.innerHTML = `
    <div id="gsModal" style="width:100%;max-width:640px;background:#fff8d8;border:2.5px solid #1c2040;box-shadow:6px 6px 0 #1c2040;display:flex;flex-direction:column;max-height:80vh;">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:2px solid #1c2040;background:#fff;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c2040" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="gsInput" type="search" placeholder="제목·본문 통합 검색…" autofocus
          style="flex:1;border:none;outline:none;font-size:1rem;background:transparent;color:#1c2040;">
        <button id="gsClose" style="border:none;background:transparent;cursor:pointer;font-size:1.2rem;color:#1c2040;">✕</button>
      </div>
      <div id="gsResults" style="overflow:auto;padding:6px;"></div>
      <div id="gsFoot" style="padding:6px 12px;font-size:.75rem;color:#1c2040;border-top:1px solid #1c2040;background:#fff;">↑↓ 이동 · Enter 열기 · Esc 닫기</div>
    </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGlobalSearch(); });
  overlay.querySelector('#gsClose').addEventListener('click', closeGlobalSearch);
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#gsInput');
  const results = overlay.querySelector('#gsResults');
  const foot = overlay.querySelector('#gsFoot');
  let items = [], filtered = [], cursor = 0;
  foot.textContent = '인덱스 로드 중…';
  items = await loadSearchIndex();
  foot.textContent = `${items.length}개 글 인덱스 · ↑↓ 이동 · Enter 열기 · Esc 닫기`;

  function render() {
    if (!filtered.length) {
      results.innerHTML = `<div style="padding:24px;text-align:center;color:#666;">검색어를 입력하세요</div>`;
      return;
    }
    results.innerHTML = filtered.slice(0, 60).map((it, i) => `
      <a href="${BASE}${it.url}" data-i="${i}" class="gs-row" style="display:block;padding:10px 12px;border-bottom:1px solid #1c204022;text-decoration:none;color:#1c2040;${i===cursor?'background:#ffe890;':''}">
        <div style="font-size:.7rem;opacity:.65;text-transform:uppercase;letter-spacing:.04em;">${escHtml(it.label)}</div>
        <div style="font-weight:700;font-size:.95rem;margin-top:2px;">${highlight(it.title, q)}</div>
        <div style="font-size:.82rem;opacity:.75;margin-top:3px;line-height:1.45;">${highlight(it.excerpt, q)}</div>
      </a>`).join('');
    results.querySelectorAll('.gs-row').forEach(a => {
      a.addEventListener('mouseenter', () => {
        cursor = +a.dataset.i;
        results.querySelectorAll('.gs-row').forEach(el => {
          el.style.background = (+el.dataset.i === cursor) ? '#ffe890' : '';
        });
      });
    });
  }
  function escHtml(s){return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function highlight(text, q) {
    text = escHtml(text || '');
    if (!q) return text;
    const tokens = q.split(/\s+/).filter(t => t.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    if (!tokens.length) return text;
    const re = new RegExp('(' + tokens.join('|') + ')', 'gi');
    return text.replace(re, '<mark style="background:#ffe890;padding:0 2px;">$1</mark>');
  }
  let q = '';
  function search() {
    q = input.value.trim();
    cursor = 0;
    if (!q) { filtered = []; render(); return; }
    const tokens = q.toLowerCase().split(/\s+/).filter(t=>t);
    filtered = items.map(it => {
      const hay = (it.title + ' ' + it.excerpt + ' ' + it.body + ' ' + it.label).toLowerCase();
      let score = 0;
      for (const t of tokens) {
        const titleHits = (it.title.toLowerCase().match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
        const bodyHits = (hay.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
        if (!bodyHits) return null;
        score += titleHits * 10 + bodyHits;
      }
      return {it, score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score).map(x=>x.it);
    render();
  }
  input.addEventListener('input', search);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeGlobalSearch(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); cursor = Math.min(cursor+1, Math.min(filtered.length, 60)-1); render(); scrollToCursor(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = Math.max(cursor-1, 0); render(); scrollToCursor(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = filtered[cursor];
      if (sel) location.href = BASE + sel.url;
    }
  });
  function scrollToCursor() {
    const el = results.querySelector(`.gs-row[data-i="${cursor}"]`);
    el?.scrollIntoView({block:'nearest'});
  }
  render();
  setTimeout(() => input.focus(), 30);
}
