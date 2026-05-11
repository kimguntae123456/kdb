/* ═══════════════════════════════════════════════════════════════
   pokemon-inject.js — 논술 리더 포켓몬 테마 DOM 주입 v3
   pokemon-theme.html과 100% 동일한 동작
   사용: 각 페이지 하단에 <script src="../pokemon-inject.js"></script>
         메인 index는  <script src="./pokemon-inject.js"></script>
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 자동 마이그레이션: 옛 패널 위치/크기 잔재 정리 (v202605110300) ── */
  (function migratePanelState() {
    var MIG_KEY = 'kdb_mig_v202605110300';
    if (localStorage.getItem(MIG_KEY)) return;
    try { localStorage.removeItem('pk-mindmap-floating-v2'); } catch (_) {}
    try {
      var raw = localStorage.getItem('pk-mindmap-floating-v3');
      if (raw) {
        var p = JSON.parse(raw);
        var bad = (p.left != null || p.top != null)
               || (p.w != null && p.w < 320)
               || (p.h != null && p.h < 280);
        if (bad) localStorage.removeItem('pk-mindmap-floating-v3');
      }
    } catch (_) { localStorage.removeItem('pk-mindmap-floating-v3'); }
    localStorage.setItem(MIG_KEY, '1');
  })();

  const SP = n => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;
  const SP_SH = n => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${n}.png`;

  /* ── 포켓볼 SVG ── */
  const ballSVG = (fill = '#e04040') => `<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="10" fill="#fff" stroke="#1c2040" stroke-width="1.5"/>
    <path d="M1 11 Q1 1 11 1 Q21 1 21 11Z" fill="${fill}"/>
    <line x1="1" y1="11" x2="21" y2="11" stroke="#1c2040" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="3.5" fill="#fff" stroke="#1c2040" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="1.8" fill="#1c2040"/>
  </svg>`;

  const greatBallSVG = `<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="10" fill="#fff" stroke="#1c2040" stroke-width="1.5"/>
    <path d="M1 11 Q1 1 11 1 Q21 1 21 11Z" fill="#3a6ec8"/>
    <rect x="5" y="5" width="12" height="3" fill="#e04040" rx="1"/>
    <line x1="1" y1="11" x2="21" y2="11" stroke="#1c2040" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="3.5" fill="#fff" stroke="#1c2040" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="1.8" fill="#3a6ec8"/>
  </svg>`;

  const ultraBallSVG = `<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="10" fill="#fff" stroke="#1c2040" stroke-width="1.5"/>
    <path d="M1 11 Q1 1 11 1 Q21 1 21 11Z" fill="#d0a800"/>
    <circle cx="11" cy="5" r="3" fill="#1c2040"/>
    <line x1="1" y1="11" x2="21" y2="11" stroke="#1c2040" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="3.5" fill="#fff" stroke="#1c2040" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="1.8" fill="#d0a800"/>
  </svg>`;

  /* ── 카테고리 → 포켓몬 매핑 ── */
  const CAT_MAP = {
    'ESG':       { n: 1,   name: '이상해씨', types: [['grass','GRASS'],['poison','POISON']], lv: 42 },
    '가계':      { n: 113, name: '럭키',     types: [['normal','NORMAL']],                  lv: 38 },
    '고령문제':  { n: 113, name: '럭키',     types: [['normal','NORMAL']],                  lv: 38 },
    '금융문제':  { n: 54,  name: '야돈',     types: [['water','WATER'],['psychic','PSY']],  lv: 30 },
    '인력문제':  { n: 35,  name: '삐삐',     types: [['normal','NORMAL']],                  lv: 28 },
    '공급망':    { n: 248, name: '마기라스', types: [['rock','ROCK'],['dark','DARK']],       lv: 65 },
    '글로벌':    { n: 249, name: '루기아',   types: [['psychic','PSYCHIC'],['flying','FLY']],lv: 70 },
    '관세':      { n: 249, name: '루기아',   types: [['psychic','PSYCHIC']],                lv: 70 },
    '외화':      { n: 130, name: '갸라도스', types: [['water','WATER'],['flying','FLY']],   lv: 58 },
    '금융업':    { n: 149, name: '망나뇽',   types: [['dragon','DRAGON'],['flying','FLY']], lv: 68 },
    '디지털':    { n: 137, name: '폴리곤',   types: [['normal','NORMAL']],                  lv: 35 },
    '코인':      { n: 137, name: '폴리곤',   types: [['normal','NORMAL']],                  lv: 35 },
    '벤처':      { n: 6,   name: '리자몽',   types: [['fire','FIRE'],['flying','FLY']],     lv: 60 },
    '창업':      { n: 4,   name: '파이리',   types: [['fire','FIRE']],                      lv: 25 },
    '투자':      { n: 6,   name: '리자몽',   types: [['fire','FIRE'],['flying','FLY']],     lv: 60 },
    '부동산':    { n: 79,  name: '야돈',     types: [['water','WATER'],['psychic','PSY']],  lv: 22 },
    '산업과제':  { n: 376, name: '메타그로스',types:[['steel','STEEL'],['psychic','PSY']],  lv: 72 },
    '산업별':    { n: 130, name: '갸라도스', types: [['water','WATER'],['flying','FLY']],   lv: 58 },
    'AI':        { n: 94,  name: '팬텀',     types: [['ghost','GHOST'],['poison','POISON']],lv: 50 },
    '가전':      { n: 100, name: '홍수몬',   types: [['electric','ELEC']],                  lv: 33 },
    '건설':      { n: 95,  name: '롱스톤',   types: [['rock','ROCK'],['ground','GRND']],    lv: 40 },
    '로봇':      { n: 376, name: '메타그로스',types:[['steel','STEEL'],['psychic','PSY']],  lv: 72 },
    '바이오':    { n: 113, name: '럭키',     types: [['normal','NORMAL']],                  lv: 45 },
    '반도체':    { n: 94,  name: '팬텀',     types: [['ghost','GHOST']],                    lv: 55 },
    '방산':      { n: 248, name: '마기라스', types: [['rock','ROCK'],['dark','DARK']],      lv: 68 },
    '섬유':      { n: 12,  name: '버터플',   types: [['bug','BUG'],['flying','FLY']],       lv: 20 },
    '우주':      { n: 249, name: '루기아',   types: [['psychic','PSYCHIC'],['flying','FLY']],lv:70 },
    '원전':      { n: 77,  name: '포니타',   types: [['fire','FIRE']],                      lv: 38 },
    '유통':      { n: 143, name: '잠만보',   types: [['normal','NORMAL']],                  lv: 45 },
    '이차전지':  { n: 125, name: '에레브',   types: [['electric','ELEC']],                  lv: 50 },
    '자동차':    { n: 59,  name: '윈디',     types: [['fire','FIRE']],                      lv: 55 },
    '조선':      { n: 131, name: '라프라스', types: [['water','WATER'],['ice','ICE']],      lv: 48 },
    '항공':      { n: 17,  name: '피존투',   types: [['normal','NORMAL'],['flying','FLY']], lv: 32 },
    '화학':      { n: 89,  name: '질퍽왕',   types: [['poison','POISON']],                  lv: 42 },
    '시사':      { n: 151, name: '뮤',       types: [['psychic','PSYCHIC']],                lv: 80 },
    '자본시장':  { n: 243, name: '라이코',   types: [['electric','ELEC']],                  lv: 70 },
    '국장':      { n: 243, name: '라이코',   types: [['electric','ELEC']],                  lv: 70 },
    '채권':      { n: 131, name: '라프라스', types: [['water','WATER'],['ice','ICE']],      lv: 52 },
    '정책금융':  { n: 150, name: '뮤츠',     types: [['psychic','PSYCHIC']],                lv: 90 },
    '소상공인':  { n: 39,  name: '푸린',     types: [['normal','NORMAL']],                  lv: 18 },
    '중소기업':  { n: 52,  name: '나옹',     types: [['normal','NORMAL']],                  lv: 28 },
    '중동':      { n: 59,  name: '윈디',     types: [['fire','FIRE']],                      lv: 62 },
    '지역균형':  { n: 133, name: '이브이',   types: [['normal','NORMAL']],                  lv: 25 },
  };

  /* 사이드바 nav 스프라이트 매핑 */
  const NAV_MAP = [
    { text: 'ESG',      n: 1   },
    { text: '가계',     n: 113 },
    { text: '공급망',   n: 248 },
    { text: '글로벌',   n: 249 },
    { text: '금융업',   n: 149 },
    { text: '디지털',   n: 137 },
    { text: '벤처',     n: 6   },
    { text: '부동산',   n: 79  },
    { text: '산업 과제',n: 376 },
    { text: '산업별',   n: 130 },
    { text: '시사',     n: 151 },
    { text: '자본시장', n: 243 },
    { text: '정책금융', n: 150 },
    { text: '중동이슈', n: 59  },
    { text: '지역균형', n: 133 },
    { text: '전체 카테고리', n: 25  },
    { text: '북마크',   n: 143 },
    { text: 'PT',       n: 39  },
  ];

  /* 글자 해시 */
  function strHash(s) {
    return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  }

  /* HP 색상 */
  function hpClass(pct) {
    if (pct > 50) return '';
    if (pct > 20) return 'yellow';
    return 'red';
  }

  /* 타입 배지 HTML */
  function typeHTML(types) {
    return types.map(([cls, lbl]) =>
      `<span class="pk-type pk-type-${cls}">${lbl}</span>`
    ).join('');
  }

  /* 페이지 타이틀에서 카테고리 감지 */
  function detectCategory() {
    const titleRaw = (document.title || '').split(/[—\-–|]/)[0].trim();
    const path = decodeURIComponent(location.pathname);

    // 직접 매칭
    if (CAT_MAP[titleRaw]) return CAT_MAP[titleRaw];

    // 부분 매칭 (타이틀)
    for (const [key, val] of Object.entries(CAT_MAP)) {
      if (titleRaw.includes(key) || key.includes(titleRaw)) return val;
    }

    // URL 경로 매칭
    for (const [key, val] of Object.entries(CAT_MAP)) {
      if (path.includes(key)) return val;
    }

    return { n: 132, name: '메타몽', types: [['normal','NORMAL']], lv: 40 };
  }

  /* ══════════════════════════════════════
     1. 브랜드 마스코트
  ══════════════════════════════════════ */
  function injectBrandMascot() {
    const brand = document.querySelector('.brand');
    if (!brand || document.getElementById('pk-brand-mascot')) return;
    const img = document.createElement('img');
    img.id = 'pk-brand-mascot';
    img.src = SP(133);
    img.alt = '이브이';
    brand.appendChild(img);
  }

  /* ══════════════════════════════════════
     2. 사이드바 nav 포켓몬 스프라이트
  ══════════════════════════════════════ */
  function injectNavSprites() {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
      if (item.querySelector('.pk-nav-sprite')) return;
      // 텍스트 추출 (이모지·특수문자 제거)
      const rawText = (item.querySelector('span') || item).textContent.trim();
      const clean = rawText.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g, '').trim();
      let matched = null;
      for (const m of NAV_MAP) {
        const mClean = m.text.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g, '').trim();
        if (clean.includes(mClean) || mClean.includes(clean)) {
          matched = m; break;
        }
      }
      if (!matched) return;
      const img = document.createElement('img');
      img.className = 'pk-nav-sprite';
      img.src = SP(matched.n);
      img.alt = '';
      item.insertBefore(img, item.firstChild);
    });
  }

  /* ══════════════════════════════════════
     2b. 사이드바 섹션 헤더 주입 (▶ MENU, ▶ CATEGORY DEX)
  ══════════════════════════════════════ */
  function injectNavSectionHeaders() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // nav-list들 찾기
    const navLists = sidebar.querySelectorAll('.nav-list');
    navLists.forEach((list, i) => {
      if (list.querySelector('.pk-nav-section')) return;
      const existingTitle = list.querySelector('.nav-section-title');

      const sec = document.createElement('div');
      sec.className = 'pk-nav-section nav-section-title';

      if (existingTitle) {
        // 이미 있는 섹션 타이틀을 픽셀 폰트로 교체
        sec.textContent = '▶ CATEGORY DEX';
        existingTitle.replaceWith(sec);
      } else {
        // 메뉴 섹션 (북마크/PT 등)
        sec.textContent = '▶ MENU';
        list.insertBefore(sec, list.firstChild);
      }
    });
  }

  /* ══════════════════════════════════════
     3. page-head 포켓몬 + HP바 + 타입
  ══════════════════════════════════════ */
  function injectPageHead() {
    const head = document.querySelector('.page-head');
    if (!head || document.getElementById('pk-head-sprite-wrap')) return;
    const cat = detectCategory();

    // 기존 자식 보존
    const children = [...head.children];

    // 스프라이트 래퍼
    const wrap = document.createElement('div');
    wrap.id = 'pk-head-sprite-wrap';
    const img = document.createElement('img');
    img.id = 'pk-head-sprite';
    img.src = SP(cat.n);
    img.alt = cat.name;
    wrap.appendChild(img);

    // headInfo 래퍼
    const headInfo = document.createElement('div');
    headInfo.id = 'pk-head-info';
    children.forEach(c => headInfo.appendChild(c));

    // 타입 배지 행
    const typeRow = document.createElement('div');
    typeRow.id = 'pk-type-row';
    typeRow.innerHTML = typeHTML(cat.types);

    // HP 바
    const hpPct = Math.min(99, Math.max(30, Math.round(cat.lv / (cat.lv + 20) * 100)));
    const hpCls = hpClass(hpPct);
    const hpRow = document.createElement('div');
    hpRow.id = 'pk-hp-row';
    hpRow.innerHTML = `
      <span class="pk-hp-label">HP</span>
      <div class="pk-hp-track"><div class="pk-hp-fill ${hpCls}" style="width:${hpPct}%"></div></div>
      <span class="pk-hp-num">${cat.lv}/${cat.lv + 20}</span>
    `;

    headInfo.appendChild(typeRow);
    headInfo.appendChild(hpRow);

    // ph-sub 숨기기
    const sub = headInfo.querySelector('.ph-sub');
    if (sub) sub.style.display = 'none';

    head.innerHTML = '';
    head.appendChild(wrap);
    head.appendChild(headInfo);
  }

  /* ══════════════════════════════════════
     4. stats bar
  ══════════════════════════════════════ */
  function injectStatsBar() {
    if (document.getElementById('pk-stats-bar')) return;
    const head = document.querySelector('.page-head');
    if (!head) return;

    const rowCount = document.querySelectorAll('.row').length;
    const fcEl = document.getElementById('filterCount');
    const essays = fcEl ? fcEl.textContent.replace(/[^0-9]/g, '') : String(rowCount);

    const bar = document.createElement('div');
    bar.id = 'pk-stats-bar';
    bar.innerHTML = `
      <div class="pk-stat-pill">
        <span class="pk-stat-val">${essays || rowCount}</span>
        <span class="pk-stat-lbl">ESSAYS</span>
      </div>
      <div class="pk-stat-pill">
        <span class="pk-stat-val">41</span>
        <span class="pk-stat-lbl">CATEGORIES</span>
      </div>
      <div class="pk-stat-pill">
        <span class="pk-stat-val">489</span>
        <span class="pk-stat-lbl">TOTAL</span>
      </div>
    `;
    head.insertAdjacentElement('afterend', bar);
  }

  /* ══════════════════════════════════════
     5. 각 row에 번호 + 포켓볼 주입
  ══════════════════════════════════════ */
  const BALL_KEY = 'pk-balls';
  function loadBalls() {
    try { return JSON.parse(localStorage.getItem(BALL_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveBalls(b) {
    try { localStorage.setItem(BALL_KEY, JSON.stringify(b)); } catch (_) {}
  }
  function ballHTML(kind) {
    return kind === 2 ? ultraBallSVG
         : kind === 1 ? greatBallSVG
         : ballSVG('#e04040');
  }
  function ballLabel(kind) {
    return kind === 2 ? '하이퍼볼 (최우선)'
         : kind === 1 ? '슈퍼볼 (중요)'
         : '몬스터볼 (일반)';
  }

  function injectRowDecorations() {
    const rows = document.querySelectorAll('.row');
    const balls = loadBalls();
    rows.forEach((row, i) => {
      if (row.querySelector('.pk-row-num')) return;

      const num = String(i + 1).padStart(2, '0');
      const numEl = document.createElement('div');
      numEl.className = 'pk-row-num';
      numEl.textContent = num;

      const ballEl = document.createElement('div');
      ballEl.className = 'pk-row-ball';
      const id = `${pageKey()}::row-${i}`;
      const initKind = balls[id] != null ? balls[id] : 0;
      ballEl.dataset.ball = String(initKind);
      ballEl.innerHTML = ballHTML(initKind);
      ballEl.title = ballLabel(initKind) + ' — 클릭해 변경';

      ballEl.addEventListener('click', e => {
        e.stopPropagation();
        const cur = parseInt(ballEl.dataset.ball || '0', 10);
        const next = (cur + 1) % 3;
        ballEl.dataset.ball = String(next);
        ballEl.innerHTML = ballHTML(next);
        ballEl.title = ballLabel(next) + ' — 클릭해 변경';
        const b = loadBalls();
        b[id] = next;
        saveBalls(b);
      });

      row.insertBefore(ballEl, row.firstChild);
      row.insertBefore(numEl, row.firstChild);
    });
  }

  /* ══════════════════════════════════════
     5a. 본/안본 추적 + 필터 + 진척률
  ══════════════════════════════════════ */
  const READ_KEY = 'pk-read';
  function loadRead() {
    try { return JSON.parse(localStorage.getItem(READ_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveRead(r) {
    try { localStorage.setItem(READ_KEY, JSON.stringify(r)); } catch (_) {}
  }
  function rowReadId(row) {
    let key = row.id;
    if (!key) {
      const tl = row.closest('.timeline');
      const rows = tl ? [...tl.querySelectorAll('.row')] : [...document.querySelectorAll('.row')];
      key = `row-${rows.indexOf(row)}`;
    }
    return `${pageKey()}::${key}`;
  }
  function injectReadBadges() {
    const rows = document.querySelectorAll('.row');
    if (!rows.length) return;
    const read = loadRead();
    rows.forEach(row => {
      if (row.querySelector('.pk-read-badge')) return;
      const id = rowReadId(row);
      const badge = document.createElement('span');
      badge.className = 'pk-read-badge';
      badge.title = '본/안본 토글';
      const isRead = !!read[id];
      badge.textContent = isRead ? '✓' : '?';
      badge.dataset.read = isRead ? '1' : '0';
      if (isRead) row.classList.add('pk-row-read');
      badge.addEventListener('click', e => {
        e.stopPropagation();
        const r = loadRead();
        if (r[id]) {
          delete r[id];
          badge.textContent = '?';
          badge.dataset.read = '0';
          row.classList.remove('pk-row-read');
        } else {
          r[id] = Date.now();
          badge.textContent = '✓';
          badge.dataset.read = '1';
          row.classList.add('pk-row-read');
        }
        saveRead(r);
        updateProgress();
      });
      row.appendChild(badge);
    });

    /* row 펼침 시 자동 읽음 */
    rows.forEach(row => {
      row.addEventListener('click', () => {
        setTimeout(() => {
          if (!row.classList.contains('expanded')) return;
          const r = loadRead();
          const id = rowReadId(row);
          if (!r[id]) {
            r[id] = Date.now();
            saveRead(r);
            const badge = row.querySelector('.pk-read-badge');
            if (badge) {
              badge.textContent = '✓';
              badge.dataset.read = '1';
            }
            row.classList.add('pk-row-read');
            updateProgress();
          }
        }, 80);
      });
    });
  }

  function injectProgressAndFilter() {
    if (document.getElementById('pk-progress-bar')) return;
    const head = document.querySelector('.page-head');
    const tl = document.querySelector('.timeline');
    if (!head || !tl) return;
    const wrap = document.createElement('div');
    wrap.id = 'pk-progress-bar';
    wrap.innerHTML = `
      <div class="pk-prog-info">
        <span class="pk-prog-label">진척률</span>
        <div class="pk-prog-track"><div class="pk-prog-fill"></div></div>
        <span class="pk-prog-num">0 / 0 (0%)</span>
      </div>
      <div class="pk-prog-filters">
        <button class="pk-filter-btn active" data-filter="all">전체</button>
        <button class="pk-filter-btn" data-filter="unread">안 본 글만</button>
        <button class="pk-filter-btn" data-filter="read">본 글만</button>
        <button class="pk-filter-btn pk-reset-btn" data-action="reset" title="이 페이지의 본/안본 체크 전부 해제">↺ 전체 체크 해제</button>
      </div>
    `;
    head.insertAdjacentElement('afterend', wrap);

    wrap.querySelectorAll('.pk-filter-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (b.dataset.action === 'reset') {
          if (!confirm('이 페이지의 본/안본 기록을 전부 초기화할까요?')) return;
          const r = loadRead();
          const prefix = pageKey() + '::row-';
          Object.keys(r).forEach(k => { if (k.startsWith(prefix)) delete r[k]; });
          saveRead(r);
          document.querySelectorAll('.row').forEach(row => {
            row.classList.remove('pk-row-read');
            const badge = row.querySelector('.pk-read-badge');
            if (badge) { badge.textContent = '?'; badge.dataset.read = '0'; }
          });
          updateProgress();
          document.querySelectorAll('.sidebar .pk-nav-prog').forEach(el => el.remove());
          injectSidebarProgress();
          return;
        }
        /* 활성 버튼 다시 클릭 → 전체로 리셋(취소) */
        if (b.classList.contains('active') && b.dataset.filter !== 'all') {
          wrap.querySelectorAll('.pk-filter-btn').forEach(x => x.classList.remove('active'));
          wrap.querySelector('[data-filter="all"]').classList.add('active');
          applyFilter('all');
          return;
        }
        wrap.querySelectorAll('.pk-filter-btn').forEach(x => {
          if (x.dataset.action !== 'reset') x.classList.remove('active');
        });
        b.classList.add('active');
        applyFilter(b.dataset.filter);
        applyFolderFilter();
      });
    });
  }

  /* ── 폴더 분류 시스템 (드래그&드롭) ── */
  function folderKey() { return `pk-folders::${pageKey()}`; }
  function loadFolders() {
    try { return JSON.parse(localStorage.getItem(folderKey())) || { folders: [], rowFolder: {}, active: 'all' }; }
    catch (e) { return { folders: [], rowFolder: {}, active: 'all' }; }
  }
  function saveFolders(d) { localStorage.setItem(folderKey(), JSON.stringify(d)); }
  function rowFolderId(row) {
    return row.id || ('row-' + [...row.parentNode.children].filter(c => c.classList.contains('row')).indexOf(row));
  }
  function injectFolderBar() {
    if (document.getElementById('pk-folder-bar')) return;
    const prog = document.getElementById('pk-progress-bar');
    if (!prog) return;
    const bar = document.createElement('div');
    bar.id = 'pk-folder-bar';
    prog.insertAdjacentElement('afterend', bar);
    renderFolderBar();
    enableRowDrag();
    applyFolderFilter();
  }
  function renderFolderBar() {
    const bar = document.getElementById('pk-folder-bar');
    if (!bar) return;
    const d = loadFolders();
    const counts = { __all: 0, __none: 0 };
    d.folders.forEach(f => counts[f] = 0);
    document.querySelectorAll('.timeline .row').forEach(r => {
      counts.__all++;
      const f = d.rowFolder[rowFolderId(r)];
      if (f && counts[f] != null) counts[f]++;
      else counts.__none++;
    });
    const chip = (key, label, cnt, extra='') =>
      `<button class="pk-fchip ${d.active === key ? 'active' : ''}" data-folder="${key}" ${extra}>
         <span class="pk-fchip-label">${label}</span>
         <span class="pk-fchip-count">${cnt}</span>
       </button>`;
    bar.innerHTML = `
      <span class="pk-folder-title">📁 폴더</span>
      ${chip('all', '전체', counts.__all)}
      ${chip('__none', '미분류', counts.__none)}
      ${d.folders.map(f => chip(f, escFolderHtml(f), counts[f], 'data-deletable="1"')).join('')}
      <button class="pk-fchip pk-fchip-add" data-action="add-folder">＋ 새 폴더</button>
      <span class="pk-folder-hint">카드 드래그→폴더 위에 드롭 · 폴더 우클릭=이름변경/삭제</span>
    `;
    bar.querySelectorAll('.pk-fchip').forEach(b => {
      const folder = b.dataset.folder;
      if (b.dataset.action === 'add-folder') {
        b.addEventListener('click', () => {
          const name = (prompt('새 폴더 이름?') || '').trim();
          if (!name) return;
          const cur = loadFolders();
          if (cur.folders.includes(name)) { alert('이미 있는 폴더'); return; }
          cur.folders.push(name);
          saveFolders(cur);
          renderFolderBar();
        });
        return;
      }
      b.addEventListener('click', () => {
        const cur = loadFolders();
        cur.active = folder;
        saveFolders(cur);
        renderFolderBar();
        applyFolderFilter();
      });
      b.addEventListener('dragover', e => {
        if (folder === 'all') return;
        e.preventDefault();
        b.classList.add('pk-drop-hover');
      });
      b.addEventListener('dragleave', () => b.classList.remove('pk-drop-hover'));
      b.addEventListener('drop', e => {
        b.classList.remove('pk-drop-hover');
        if (folder === 'all') return;
        e.preventDefault();
        const rid = e.dataTransfer.getData('text/pk-row') || e.dataTransfer.getData('text/plain');
        if (!rid) return;
        const cur = loadFolders();
        if (folder === '__none') delete cur.rowFolder[rid];
        else cur.rowFolder[rid] = folder;
        saveFolders(cur);
        renderFolderBar();
        applyFolderFilter();
      });
      if (b.dataset.deletable) {
        b.addEventListener('contextmenu', e => {
          e.preventDefault();
          const cur = loadFolders();
          const choice = prompt(`"${folder}"\n새 이름 입력=이름변경 · 빈 값=삭제 · 취소=그대로`, folder);
          if (choice === null) return;
          const newName = choice.trim();
          if (!newName) {
            if (!confirm(`폴더 "${folder}" 삭제? (분류된 카드는 미분류로 이동)`)) return;
            cur.folders = cur.folders.filter(x => x !== folder);
            Object.keys(cur.rowFolder).forEach(k => { if (cur.rowFolder[k] === folder) delete cur.rowFolder[k]; });
            if (cur.active === folder) cur.active = 'all';
          } else if (newName !== folder) {
            if (cur.folders.includes(newName)) { alert('이미 있는 이름'); return; }
            cur.folders = cur.folders.map(x => x === folder ? newName : x);
            Object.keys(cur.rowFolder).forEach(k => { if (cur.rowFolder[k] === folder) cur.rowFolder[k] = newName; });
            if (cur.active === folder) cur.active = newName;
          }
          saveFolders(cur);
          renderFolderBar();
          applyFolderFilter();
        });
      }
    });
    markRowFolderTags();
  }
  function enableRowDrag() {
    /* card-row는 display:contents라 드래그 박스가 안 잡힘 → 실제 레이아웃 박스인 .row에 바인딩 */
    document.querySelectorAll('.timeline .row').forEach(row => {
      if (row.dataset.pkDrag) return;
      row.dataset.pkDrag = '1';
      row.setAttribute('draggable', 'true');
      row.addEventListener('dragstart', e => {
        /* 버튼/편집 영역에서 시작된 드래그는 무시 */
        const t = e.target;
        if (t.closest && (t.closest('button') || t.closest('[contenteditable="true"]') ||
            t.closest('.pk-meta-line') || t.closest('.pk-folder-tag'))) {
          e.preventDefault(); return;
        }
        try {
          e.dataTransfer.setData('text/pk-row', rowFolderId(row));
          e.dataTransfer.setData('text/plain', rowFolderId(row));
          e.dataTransfer.effectAllowed = 'move';
        } catch(_) {}
        row.classList.add('pk-dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('pk-dragging'));
    });
  }
  function applyFolderFilter() {
    const d = loadFolders();
    const active = d.active || 'all';
    const readBtn = document.querySelector('.pk-filter-btn.active');
    const readMode = readBtn ? readBtn.dataset.filter : 'all';
    document.querySelectorAll('.timeline .card-row').forEach(card => {
      const row = card.querySelector('.row');
      if (!row) return;
      const f = d.rowFolder[rowFolderId(row)];
      let show = true;
      if (active === '__none') show = !f;
      else if (active !== 'all') show = f === active;
      if (show && readMode && readMode !== 'all') {
        const isRead = row.classList.contains('pk-row-read');
        if (readMode === 'read') show = isRead;
        else if (readMode === 'unread') show = !isRead;
      }
      card.style.display = show ? '' : 'none';
    });
  }
  function markRowFolderTags() {
    const d = loadFolders();
    document.querySelectorAll('.timeline .row').forEach(row => {
      const id = rowFolderId(row);
      const f = d.rowFolder[id];
      let tag = row.querySelector('.pk-folder-tag');
      if (!f) { if (tag) tag.remove(); return; }
      if (!tag) {
        tag = document.createElement('span');
        tag.className = 'pk-folder-tag';
        row.appendChild(tag);
      }
      tag.textContent = '📁 ' + f;
      tag.title = '클릭=미분류로 이동';
      tag.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        const cur = loadFolders();
        delete cur.rowFolder[id];
        saveFolders(cur);
        renderFolderBar();
        applyFolderFilter();
      };
    });
  }
  function escFolderHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  function applyFilter(mode) {
    const rows = document.querySelectorAll('.card-row');
    rows.forEach(card => {
      const row = card.querySelector('.row');
      if (!row) return;
      const isRead = row.classList.contains('pk-row-read');
      let show = true;
      if (mode === 'read') show = isRead;
      if (mode === 'unread') show = !isRead;
      card.style.display = show ? '' : 'none';
    });
  }
  function updateProgress() {
    const rows = document.querySelectorAll('.row');
    if (!rows.length) return;
    const read = loadRead();
    let cnt = 0;
    rows.forEach(row => { if (read[rowReadId(row)]) cnt++; });
    const total = rows.length;
    const pct = total ? Math.round(cnt * 100 / total) : 0;
    const bar = document.getElementById('pk-progress-bar');
    if (!bar) return;
    bar.querySelector('.pk-prog-num').textContent = `${cnt} / ${total} (${pct}%)`;
    bar.querySelector('.pk-prog-fill').style.width = pct + '%';
  }

  /* href를 pageKey() 형식으로 정규화 */
  function hrefToKey(href) {
    if (!href) return '';
    try {
      const u = new URL(href, location.href);
      return decodeURIComponent(u.pathname).replace(/\/+/g, '_').replace(/^_|_$/g, '') || 'root';
    } catch (_) { return ''; }
  }

  /* 사이드바 카테고리 진척률 — href 기반 정확 매칭 */
  function injectSidebarProgress() {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    if (!navItems.length) return;
    const read = loadRead();
    const readByPrefix = {};
    Object.keys(read).forEach(k => {
      const [prefix] = k.split('::row-');
      readByPrefix[prefix] = (readByPrefix[prefix] || 0) + 1;
    });
    /* nav-group-toggle (예: "가계")은 자식 sub들의 합계로 */
    navItems.forEach(item => {
      if (item.querySelector('.pk-nav-prog')) return;
      const countEl = item.querySelector('.count');
      const total = countEl ? parseInt(countEl.textContent.replace(/[^0-9]/g, ''), 10) : 0;
      if (!total) return;

      let cnt = 0;

      /* a.nav-item: href 직접 매칭 */
      if (item.tagName === 'A' && item.getAttribute('href')) {
        const key = hrefToKey(item.getAttribute('href'));
        cnt = readByPrefix[key] || 0;
      } else if (item.classList.contains('nav-group-toggle')) {
        /* group toggle: 형제(group-items) 안의 a.nav-item.sub 들 합산 */
        const group = item.parentElement;
        const subs = group.querySelectorAll('a.nav-item.sub');
        subs.forEach(s => {
          const k = hrefToKey(s.getAttribute('href'));
          cnt += readByPrefix[k] || 0;
        });
      }

      const pct = total ? Math.round(cnt * 100 / total) : 0;
      const prog = document.createElement('div');
      prog.className = 'pk-nav-prog';
      prog.innerHTML = `<div class="pk-nav-prog-bar"><div class="pk-nav-prog-fill" style="width:${pct}%"></div></div><span>${cnt}/${total} ${pct}%</span>`;
      item.appendChild(prog);
    });
  }

  /* nav-item 안의 ?? mojibake → 카테고리 이모지 복원 */
  function fixNavMojibake() {
    const EMOJI_BY_KEYWORD = [
      ['가계',     '👨‍👩‍👧'],
      ['공급망',   '🔗'],
      ['글로벌',   '🌍'],
      ['관세',     '🌍'],
      ['금융업',   '🏦'],
      ['디지털',   '💻'],
      ['벤처',     '🚀'],
      ['부동산',   '🏠'],
      ['산업 과제','🏛️'],
      ['산업과제', '🏛️'],
      ['산업별',   '🏭'],
      ['시사',     '📰'],
      ['자본시장', '📈'],
      ['정책금융', '🏛️'],
      ['중동',     '🕌'],
      ['지역균형', '🗺️'],
      ['ESG',      '🌱'],
      ['북마크',   '📌'],
      ['PT',       '🎤'],
      ['전체 카테고리', '📚']
    ];
    const spans = document.querySelectorAll('.sidebar .nav-item span');
    spans.forEach(s => {
      const t = s.textContent;
      if (!/\?{2,}/.test(t)) return;
      for (const [kw, em] of EMOJI_BY_KEYWORD) {
        if (t.includes(kw)) {
          s.textContent = em + ' ' + kw;
          return;
        }
      }
      s.textContent = t.replace(/\?+\s*/g, '').trim();
    });
  }

  /* ══════════════════════════════════════
     5b. row-excerpt → 사용자 메모 입력란
  ══════════════════════════════════════ */
  function pageKey() {
    return decodeURIComponent(location.pathname).replace(/\/+/g, '_').replace(/^_|_$/g, '') || 'root';
  }
  function rowKey(row) {
    return row.id || ('row-' + [...row.parentNode.children].indexOf(row));
  }
  function injectRowNotes() {
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
      const ex = row.querySelector('.row-excerpt');
      if (!ex || ex.dataset.pkNote) return;
      ex.dataset.pkNote = '1';
      ex.classList.add('pk-note');
      ex.setAttribute('contenteditable', 'true');
      ex.setAttribute('spellcheck', 'false');
      const k = `pk-note::${pageKey()}::${rowKey(row)}`;
      const saved = localStorage.getItem(k);
      ex.textContent = saved || '';
      ex.addEventListener('input', () => {
        try { localStorage.setItem(k, ex.textContent); } catch (_) {}
      });
      // row 클릭 시 펼침 동작과 충돌 방지
      ex.addEventListener('click', e => e.stopPropagation());
      ex.addEventListener('mousedown', e => e.stopPropagation());
    });
  }

  /* ══════════════════════════════════════
     5c. 마인드맵 패드 (글마다)
  ══════════════════════════════════════ */
  function buildMindmap(article, rowIdx) {
    if (article.querySelector('.pk-mindmap')) return;
    const map = document.createElement('aside');
    map.className = 'pk-mindmap pk-cards';
    map.innerHTML = `
      <div class="pk-mindmap-header">
        <span>📌 핵심카드</span>
        <span>
          <button class="pk-mm-fs-down" title="글자 작게 (-)">A-</button>
          <span class="pk-mm-fs-label">100%</span>
          <button class="pk-mm-fs-up" title="글자 크게 (+)">A+</button>
          <button class="pk-mm-add" title="노드 추가">+ 노드</button>
          <button class="pk-mm-clear" title="모두 지우기">초기화</button>
        </span>
      </div>
      <div class="pk-cards-cols">
        <svg class="pk-mm-edges"></svg>
        <div class="pk-cards-col" data-col="s"><div class="pk-cards-coltitle">서론</div><div class="pk-cards-canvas"></div></div>
        <div class="pk-cards-splitter" data-pair="sm" title="드래그하여 너비 조정"></div>
        <div class="pk-cards-col" data-col="m"><div class="pk-cards-coltitle">본론</div><div class="pk-cards-canvas"></div></div>
        <div class="pk-cards-splitter" data-pair="mc" title="드래그하여 너비 조정"></div>
        <div class="pk-cards-col" data-col="c"><div class="pk-cards-coltitle">결론</div><div class="pk-cards-canvas"></div></div>
      </div>
      <div class="pk-mm-hint">컬럼 더블클릭=노드 · 노드 더블클릭=수정(Ctrl+B 볼드) · 드래그=이동 · Shift+클릭=연결 · Ctrl+Z=실행취소</div>
    `;
    article.appendChild(map);

    // ── floating 패널: 드래그 + 단일 노출 (모든 뷰포트) ──
    map.classList.add('pk-floating');
    // 부모(.inline-article)의 animation transform이 fixed 컨테이닝 블록을
    // 만들어 패널이 사라지는 문제를 회피 — 패널을 body 직속으로 이동
    document.body.appendChild(map);
    map._sourceArticle = article;
    map._sourceRow = article.previousElementSibling;
    if (!window._pkFloatingPanels) window._pkFloatingPanels = [];
    window._pkFloatingPanels.push(map);
    const POS_KEY = 'pk-mindmap-floating-v3';
    /* 좌표 모델:
       - offX: 본문(.inline-article) 오른쪽 가장자리에서 패널 좌상단까지 가로 오프셋
         (본문이 줌/리사이즈로 움직이면 패널도 같이 따라감 — 항상 본문 옆 유지)
       - vy:   패널 좌상단의 visible viewport 기준 세로 좌표 (스크롤 시 화면 고정)
       - w, h: 사용자 리사이즈 크기 */
    const DEFAULT_OFFX = 16;
    const DEFAULT_VY = 80;
    const readSavedPos = () => {
      try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (_) { return null; }
    };
    const vvOffset = () => {
      const vv = window.visualViewport;
      return {
        l: vv ? vv.offsetLeft : 0,
        t: vv ? vv.offsetTop  : 0,
        w: vv ? vv.width  : window.innerWidth,
        h: vv ? vv.height : window.innerHeight,
      };
    };
    const positionPanel = (panel) => {
      const v = vvOffset();
      const art = panel._sourceArticle;
      const saved = readSavedPos() || {};
      if (saved.w != null) panel.style.width  = saved.w + 'px';
      if (saved.h != null) panel.style.height = saved.h + 'px';
      panel.style.transform = 'none';
      panel.style.right = 'auto';
      const offX = saved.offX != null ? saved.offX : DEFAULT_OFFX;
      const vy   = saved.vy   != null ? saved.vy   : DEFAULT_VY;
      const pw = panel.offsetWidth  || 480;
      const ph = panel.offsetHeight || 600;
      let vx;
      if (art && art.getBoundingClientRect) {
        const r = art.getBoundingClientRect();
        vx = r.right + offX;  // 본문 오른쪽에 붙음 (offX만큼)
      } else {
        vx = v.w - pw - 24;
      }
      // 화면 밖으로 완전히 나가지 않게 clamp (최소 80×40 노출)
      vx = Math.max(8 - pw + 80, Math.min(v.w - 80, vx));
      const vyC = Math.max(8, Math.min(v.h - 40, vy));
      panel.style.left = (vx + v.l) + 'px';
      panel.style.top  = (vyC + v.t) + 'px';
    };

    if (!window._pkFloatingUpdate) {
      window._pkFloatingUpdate = () => {
        const panels = window._pkFloatingPanels || [];
        const v = vvOffset();
        const inViewport = (art) => {
          if (!art || !art.getBoundingClientRect) return false;
          const r = art.getBoundingClientRect();
          return r.bottom > 0 && r.top < v.h;
        };
        const expanded = panels.filter(p =>
          p._sourceRow && p._sourceArticle && p._sourceRow.classList.contains('expanded')
        );
        let best = null;
        /* sticky: 현재 표시 중이고 article이 뷰포트에 조금이라도 보이면 유지 */
        const current = window._pkCurrentPanel;
        if (current && expanded.includes(current) && inViewport(current._sourceArticle)) {
          best = current;
        } else {
          /* 뷰포트 안에 article이 보이는 패널 우선 선택, 없으면 중앙 가장 가까운 것 */
          const visible = expanded.filter(p => inViewport(p._sourceArticle));
          const pool = visible.length ? visible : expanded;
          const center = v.t + v.h / 2;
          let bestDist = Infinity;
          pool.forEach(p => {
            const r = p._sourceArticle.getBoundingClientRect();
            const c = (r.top + r.bottom) / 2;
            const d = Math.abs(c - center);
            if (d < bestDist) { bestDist = d; best = p; }
          });
        }
        window._pkCurrentPanel = best;
        panels.forEach(p => {
          const show = (p === best);
          p.style.display = show ? 'flex' : 'none';
          if (show) positionPanel(p);
        });
      };
      window.addEventListener('scroll', window._pkFloatingUpdate, { passive: true });
      window.addEventListener('resize', window._pkFloatingUpdate);
      // 핀치/Ctrl 줌 대응 — visualViewport 변화 시 모든 표시 패널의
      // visible-viewport 좌표를 유지하도록 layout-viewport 좌표 재계산
      if (window.visualViewport) {
        const syncToVisualVP = () => {
          const panels = window._pkFloatingPanels || [];
          panels.forEach(p => {
            if (p.style.display === 'none') return;
            positionPanel(p);
          });
        };
        window.visualViewport.addEventListener('scroll', syncToVisualVP);
        window.visualViewport.addEventListener('resize', syncToVisualVP);
        window._pkSyncVV = syncToVisualVP;
      }
    }
    if (map._sourceRow) {
      new MutationObserver(window._pkFloatingUpdate).observe(map._sourceRow, { attributes: true, attributeFilter: ['class'] });
    }
    requestAnimationFrame(window._pkFloatingUpdate);
      const applyPos = () => positionPanel(map);
      applyPos();

      const header = map.querySelector('.pk-mindmap-header');
      let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
      /* ox/oy/nx/ny 는 visible viewport 좌표 — style.left 적용 시 vv.offsetLeft 보정 */
      header.addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') return;
        dragging = true;
        const r = map.getBoundingClientRect();
        const v = vvOffset();
        sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
        map.style.transform = 'none';
        map.style.left = (r.left + v.l) + 'px';
        map.style.top  = (r.top  + v.t) + 'px';
        map.style.right = 'auto';
        e.preventDefault();
      });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const v = vvOffset();
        const nx = Math.max(0, Math.min(v.w - 80, ox + (e.clientX - sx)));
        const ny = Math.max(0, Math.min(v.h - 40, oy + (e.clientY - sy)));
        map.style.left = (nx + v.l) + 'px';
        map.style.top  = (ny + v.t) + 'px';
        map.style.right = 'auto';
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        const r = map.getBoundingClientRect();
        const art = map._sourceArticle;
        const artR = art && art.getBoundingClientRect ? art.getBoundingClientRect() : null;
        try {
          const cur = JSON.parse(localStorage.getItem(POS_KEY) || '{}');
          cur.offX = artR ? (r.left - artR.right) : 0;  // 본문 오른쪽 기준 가로 오프셋
          cur.vy   = r.top;                              // visible viewport 기준 세로
          localStorage.setItem(POS_KEY, JSON.stringify(cur));
        } catch (_) {}
      });

      /* resize 변화 저장 — box-sizing:border-box 환경에서
         contentRect는 padding/border 제외값이라 매번 줄어듦.
         offsetWidth/Height(테두리 포함)로 측정해 저장. */
      let roDebounce = null;
      const ro = new ResizeObserver(() => {
        clearTimeout(roDebounce);
        roDebounce = setTimeout(() => {
          const w = map.offsetWidth;
          const h = map.offsetHeight;
          if (w < 200 || h < 160) return;  // 잘못 측정된 값 무시
          try {
            const cur = JSON.parse(localStorage.getItem(POS_KEY) || '{}');
            if (cur.w === w && cur.h === h) return;  // 변화 없으면 skip
            cur.w = w; cur.h = h;
            localStorage.setItem(POS_KEY, JSON.stringify(cur));
          } catch (_) {}
        }, 120);
      });
      ro.observe(map);

      // 헤더 더블클릭 → 접기/펼치기
      header.addEventListener('dblclick', e => {
        if (e.target.tagName === 'BUTTON') return;
        map.classList.toggle('pk-collapsed');
      });

      // 글자 크기 조절 (panel 내부 전용)
      const FS_KEY = 'pk-mindmap-fs-v1';
      const fsLabel = map.querySelector('.pk-mm-fs-label');
      const applyFs = (scale) => {
        map.style.setProperty('--pk-fs', scale);
        if (fsLabel) fsLabel.textContent = Math.round(scale * 100) + '%';
      };
      let curFs = parseFloat(localStorage.getItem(FS_KEY) || '1');
      if (!isFinite(curFs) || curFs < 0.6) curFs = 1;
      applyFs(curFs);
      const setFs = (next) => {
        curFs = Math.max(0.7, Math.min(2.4, +next.toFixed(2)));
        applyFs(curFs);
        localStorage.setItem(FS_KEY, String(curFs));
      };
      map.querySelector('.pk-mm-fs-up').addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        setFs(curFs + 0.1);
      });
      map.querySelector('.pk-mm-fs-down').addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        setFs(curFs - 0.1);
      });
      /* 라벨 클릭 → 100%로 리셋 */
      if (fsLabel) fsLabel.addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        setFs(1);
      });
      /* Ctrl/Cmd + 휠 → 글자 크기 조정 */
      map.addEventListener('wheel', e => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        setFs(curFs + (e.deltaY < 0 ? 0.1 : -0.1));
      }, { passive: false });

    const cols = {
      s: map.querySelector('.pk-cards-col[data-col="s"] .pk-cards-canvas'),
      m: map.querySelector('.pk-cards-col[data-col="m"] .pk-cards-canvas'),
      c: map.querySelector('.pk-cards-col[data-col="c"] .pk-cards-canvas'),
    };
    const colEls = {
      s: map.querySelector('.pk-cards-col[data-col="s"]'),
      m: map.querySelector('.pk-cards-col[data-col="m"]'),
      c: map.querySelector('.pk-cards-col[data-col="c"]'),
    };
    const colsWrap = map.querySelector('.pk-cards-cols');
    const svg = map.querySelector('svg.pk-mm-edges');
    /* applyColFracs/splitter는 state 로드 후 정의 */
    let applyColFracs = () => {};
    const storeKey = `pk-mm::${pageKey()}::${rowIdx}`;

    /** state: { nodes: [{id, x, y, t, column:'s'|'m'|'c'}], edges: [[a,b]] } */
    let state = { nodes: [], edges: [] };
    let loadFailed = false;
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) state = JSON.parse(raw);
    } catch (err) {
      loadFailed = true;
      /* 파싱 실패 시 원본 보존 (덮어쓰기 방지) */
      try {
        const raw = localStorage.getItem(storeKey);
        if (raw) localStorage.setItem('pk-mm-corrupt::' + storeKey + '::' + Date.now(), raw);
      } catch (_) {}
      console.error('[핵심카드 로드 실패 — 원본 백업됨]', err);
    }
    // 마이그레이션: column 없는 기존 노드는 본론(m)으로
    let migrated = false;
    state.nodes.forEach(n => { if (!n.column) { n.column = 'm'; migrated = true; } });
    if (!state.colTitles) { state.colTitles = {}; migrated = true; }
    /* 로드 실패 시 절대 자동 저장 금지 (덮어쓰기 방지) */
    if (migrated && !loadFailed) try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (_) {}

    /* ── Undo 스택 + 자동 백업 ── */
    const UNDO_MAX = 50;
    const BAK_MAX = 10;
    const undoStack = [];
    const redoStack = [];
    const snapshot = () => JSON.stringify(state);
    const pushUndo = () => {
      undoStack.push(snapshot());
      if (undoStack.length > UNDO_MAX) undoStack.shift();
      redoStack.length = 0;
    };
    const writeBackup = () => {
      try {
        const ts = Date.now();
        localStorage.setItem('pk-mm-bak::' + storeKey + '::' + ts, snapshot());
        /* 오래된 백업 정리 */
        const baks = Object.keys(localStorage)
          .filter(k => k.startsWith('pk-mm-bak::' + storeKey + '::'))
          .sort();
        while (baks.length > BAK_MAX) {
          localStorage.removeItem(baks.shift());
        }
      } catch (_) {}
    };

    /* 컬럼 제목 편집 (서론/본론/결론 → 사용자 정의) */
    const DEFAULT_COL_TITLES = { s: '서론', m: '본론', c: '결론' };
    const colTitleEls = {
      s: map.querySelector('.pk-cards-col[data-col="s"] .pk-cards-coltitle'),
      m: map.querySelector('.pk-cards-col[data-col="m"] .pk-cards-coltitle'),
      c: map.querySelector('.pk-cards-col[data-col="c"] .pk-cards-coltitle'),
    };
    Object.entries(colTitleEls).forEach(([k, el]) => {
      if (!el) return;
      el.textContent = state.colTitles[k] || DEFAULT_COL_TITLES[k];
      el.title = '더블클릭하여 제목 수정';
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        el.setAttribute('contenteditable', 'true');
        el.focus();
        document.getSelection().selectAllChildren(el);
      });
      el.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        if (text) document.execCommand('insertText', false, text);
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
        else if (e.key === 'Escape') {
          el.textContent = state.colTitles[k] || DEFAULT_COL_TITLES[k];
          el.blur();
        }
      });
      el.addEventListener('blur', () => {
        el.removeAttribute('contenteditable');
        const txt = (el.textContent || '').trim() || DEFAULT_COL_TITLES[k];
        el.textContent = txt;
        state.colTitles[k] = txt;
        save();
      });
    });

    let _lastSavedSnap = snapshot();
    const save = () => {
      const cur = snapshot();
      if (cur !== _lastSavedSnap) {
        undoStack.push(_lastSavedSnap);
        if (undoStack.length > UNDO_MAX) undoStack.shift();
        redoStack.length = 0;
        _lastSavedSnap = cur;
        writeBackup();
      }
      try {
        localStorage.setItem(storeKey, cur);
      } catch (err) {
        /* localStorage 한도 초과 등 — 사용자에게 즉시 알림 */
        if (window._pkSaveWarned) return;
        window._pkSaveWarned = true;
        console.error('[핵심카드 저장 실패]', err);
        alert('핵심카드 저장 실패: 저장 공간이 부족하거나 차단됨.\n' +
              '브라우저 콘솔에서 다음을 실행해 백업 받으세요:\n' +
              'copy(JSON.stringify(localStorage))');
      }
    };

    /* 컬럼 너비 (fr 비율) — 저장된 값 적용, 없으면 1:1:1 */
    if (!state.colFracs) state.colFracs = { s: 1, m: 1, c: 1 };
    applyColFracs = () => {
      const f = state.colFracs;
      colsWrap.style.gridTemplateColumns =
        `${f.s}fr 6px ${f.m}fr 6px ${f.c}fr`;
    };
    applyColFracs();

    /* splitter 드래그 */
    map.querySelectorAll('.pk-cards-splitter').forEach(sp => {
      sp.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const pair = sp.dataset.pair;
        const aKey = pair[0], bKey = pair[1];
        const aEl = colEls[aKey], bEl = colEls[bKey];
        const startX = e.clientX;
        const aW0 = aEl.offsetWidth;
        const bW0 = bEl.offsetWidth;
        const total = aW0 + bW0;
        const MIN = 60;
        document.body.style.cursor = 'col-resize';
        const onMove = (ev) => {
          const dx = ev.clientX - startX;
          let aW = Math.max(MIN, Math.min(total - MIN, aW0 + dx));
          let bW = total - aW;
          const otherKey = ['s','m','c'].find(k => k !== aKey && k !== bKey);
          const otherW = colEls[otherKey].offsetWidth;
          colsWrap.style.gridTemplateColumns =
            pair === 'sm'
              ? `${aW}px 6px ${bW}px 6px ${otherW}px`
              : `${otherW}px 6px ${aW}px 6px ${bW}px`;
          renderEdges();
        };
        const onUp = () => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          document.body.style.cursor = '';
          const sw = colEls.s.offsetWidth;
          const mw = colEls.m.offsetWidth;
          const cw = colEls.c.offsetWidth;
          const sum = sw + mw + cw;
          state.colFracs = {
            s: +(sw / sum * 3).toFixed(3),
            m: +(mw / sum * 3).toFixed(3),
            c: +(cw / sum * 3).toFixed(3),
          };
          applyColFracs();
          save();
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });
      sp.addEventListener('dblclick', e => {
        e.preventDefault();
        e.stopPropagation();
        state.colFracs = { s: 1, m: 1, c: 1 };
        applyColFracs();
        save();
        renderEdges();
      });
    });

    let selectedForEdge = null;

    const renderEdges = () => {
      const rect = colsWrap.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      svg.innerHTML = '';
      state.edges.forEach(([a, b]) => {
        const na = state.nodes.find(n => n.id === a);
        const nb = state.nodes.find(n => n.id === b);
        if (!na || !nb || na.column !== nb.column) return; // 같은 컬럼만
        const ea = colsWrap.querySelector(`[data-id="${a}"]`);
        const eb = colsWrap.querySelector(`[data-id="${b}"]`);
        if (!ea || !eb) return;
        const ra = ea.getBoundingClientRect();
        const rb = eb.getBoundingClientRect();
        const x1 = ra.left - rect.left + ra.width / 2;
        const y1 = ra.top  - rect.top  + ra.height / 2;
        const x2 = rb.left - rect.left + rb.width / 2;
        const y2 = rb.top  - rect.top  + rb.height / 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#d42b2b');
        line.setAttribute('stroke-width', '2.5');
        line.setAttribute('stroke-dasharray', '6 4');
        svg.appendChild(line);
      });
    };

    const findColAt = (clientX, clientY) => {
      for (const k of ['s','m','c']) {
        const r = cols[k].getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return k;
      }
      return null;
    };

    /* 노드 색상 팔레트 */
    const NODE_PALETTE = ['#fff8d8', '#ffd6d6', '#ffe6c4', '#fff2a8', '#d8f3dc', '#cfe8ff', '#e6d6ff', '#1c2040'];
    const applyNodeColor = (el, color) => {
      if (color) {
        el.style.background = color;
        el.style.color = (color === '#1c2040') ? '#fff8d8' : '#1c2040';
      } else {
        el.style.background = '';
        el.style.color = '';
      }
    };
    const openPalette = (n, el) => {
      document.querySelectorAll('.pk-mm-palette').forEach(p => p.remove());
      const pal = document.createElement('div');
      pal.className = 'pk-mm-palette';
      NODE_PALETTE.forEach(c => {
        const sw = document.createElement('button');
        sw.className = 'pk-mm-swatch';
        sw.style.background = c;
        sw.title = c;
        if (n.color === c) sw.classList.add('selected');
        sw.addEventListener('click', ev => {
          ev.stopPropagation();
          n.color = c;
          applyNodeColor(el, c);
          save();
          pal.remove();
        });
        pal.appendChild(sw);
      });
      const rst = document.createElement('button');
      rst.className = 'pk-mm-swatch pk-mm-swatch-reset';
      rst.textContent = '↺';
      rst.title = '기본색';
      rst.addEventListener('click', ev => {
        ev.stopPropagation();
        delete n.color;
        applyNodeColor(el, null);
        save();
        pal.remove();
      });
      pal.appendChild(rst);
      const r = el.getBoundingClientRect();
      pal.style.position = 'fixed';
      pal.style.left = r.left + 'px';
      pal.style.top  = (r.bottom + 6) + 'px';
      document.body.appendChild(pal);
      const pr = pal.getBoundingClientRect();
      if (pr.right > window.innerWidth - 8) {
        pal.style.left = (window.innerWidth - pr.width - 8) + 'px';
      }
      const closer = (ev) => {
        if (!pal.contains(ev.target)) {
          pal.remove();
          document.removeEventListener('mousedown', closer, true);
        }
      };
      setTimeout(() => document.addEventListener('mousedown', closer, true), 0);
    };

    /* 허용 태그: 볼드/이탤릭/밑줄/줄바꿈만 통과 */
    const ALLOWED_TAGS = new Set(['B','STRONG','I','EM','U','BR']);
    const sanitizeNode = (root) => {
      const walk = (node) => {
        [...node.childNodes].forEach(c => {
          if (c.nodeType === 1) {
            if (c.classList && (c.classList.contains('pk-mm-del') || c.classList.contains('pk-mm-color'))) return;
            if (ALLOWED_TAGS.has(c.tagName)) {
              [...c.attributes].forEach(a => c.removeAttribute(a.name));
              walk(c);
            } else {
              const parent = c.parentNode;
              walk(c);
              while (c.firstChild) parent.insertBefore(c.firstChild, c);
              parent.removeChild(c);
            }
          }
        });
      };
      walk(root);
    };

    const makeNode = (n) => {
      const canvas = cols[n.column] || cols.m;
      const el = document.createElement('div');
      el.className = 'pk-mm-node';
      el.dataset.id = n.id;
      el.dataset.col = n.column;
      el.style.left = (n.x || 10) + 'px';
      el.style.top  = (n.y || 10) + 'px';
      el.innerHTML = n.t || '메모';
      if (n.color) applyNodeColor(el, n.color);
      const del = document.createElement('div');
      del.className = 'pk-mm-del';
      del.textContent = 'X';
      del.title = '삭제';
      del.addEventListener('click', e => {
        e.stopPropagation();
        state.nodes = state.nodes.filter(x => x.id !== n.id);
        state.edges = state.edges.filter(([a, b]) => a !== n.id && b !== n.id);
        save();
        el.remove();
        renderEdges();
      });
      el.appendChild(del);

      /* 색상 버튼 — 클릭 시 팔레트 표시 */
      const colorBtn = document.createElement('div');
      colorBtn.className = 'pk-mm-color';
      colorBtn.textContent = '🎨';
      colorBtn.title = '색상 변경';
      colorBtn.addEventListener('mousedown', e => { e.stopPropagation(); });
      colorBtn.addEventListener('click', e => {
        e.stopPropagation();
        openPalette(n, el);
      });
      el.appendChild(colorBtn);

      /* 우클릭으로도 팔레트 */
      el.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        openPalette(n, el);
      });

      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        el.setAttribute('contenteditable', 'true');
        el.focus();
        document.getSelection().selectAllChildren(el);
      });
      /* 붙여넣기 — 서식·인라인 폰트 제거하고 plain text만 삽입 */
      el.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        if (!text) return;
        if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, text);
        } else {
          const sel = document.getSelection();
          if (!sel.rangeCount) return;
          sel.deleteFromDocument();
          sel.getRangeAt(0).insertNode(document.createTextNode(text));
          sel.collapseToEnd();
        }
      });
      el.addEventListener('blur', () => {
        el.removeAttribute('contenteditable');
        const delBtn = el.querySelector('.pk-mm-del');
        const colBtn = el.querySelector('.pk-mm-color');
        /* 버튼 분리 → sanitize → innerHTML 추출 */
        if (delBtn) delBtn.remove();
        if (colBtn) colBtn.remove();
        sanitizeNode(el);
        const html = el.innerHTML;
        const plain = (el.textContent || '').trim();
        /* 데이터 손실 가드: 이전에 내용이 있었는데 빈 문자열로 저장하려 하면 무시 */
        if (!plain && (n.t || '').replace(/<[^>]+>/g, '').trim()) {
          el.innerHTML = n.t;
          if (delBtn) el.appendChild(delBtn);
          if (colBtn) el.appendChild(colBtn);
          return;
        }
        el.innerHTML = html;
        if (delBtn) el.appendChild(delBtn);
        if (colBtn) el.appendChild(colBtn);
        n.t = html;
        save();
      });

      el.addEventListener('click', e => {
        if (!e.shiftKey) return;
        e.stopPropagation();
        if (selectedForEdge && selectedForEdge !== n.id) {
          const other = state.nodes.find(x => x.id === selectedForEdge);
          if (!other || other.column !== n.column) {
            // 다른 컬럼이면 연결 거부
            selectedForEdge = null;
            [...colsWrap.querySelectorAll('.pk-mm-node')].forEach(x => x.style.outline = '');
            return;
          }
          const pair = [selectedForEdge, n.id].sort();
          const exists = state.edges.some(([a, b]) => {
            const s = [a, b].sort();
            return s[0] === pair[0] && s[1] === pair[1];
          });
          if (exists) {
            state.edges = state.edges.filter(([a, b]) => {
              const s = [a, b].sort();
              return !(s[0] === pair[0] && s[1] === pair[1]);
            });
          } else {
            state.edges.push([selectedForEdge, n.id]);
          }
          selectedForEdge = null;
          [...colsWrap.querySelectorAll('.pk-mm-node')].forEach(x => x.style.outline = '');
          save(); renderEdges();
        } else {
          selectedForEdge = n.id;
          el.style.outline = '3px solid #d42b2b';
        }
      });

      let dragging = false, dx = 0, dy = 0;
      const onDown = (e) => {
        if (el.getAttribute('contenteditable') === 'true') return;
        if (e.target === del) return;
        const pt = e.touches ? e.touches[0] : e;
        dragging = true;
        const r = el.getBoundingClientRect();
        dx = pt.clientX - r.left;
        dy = pt.clientY - r.top;
        el.classList.add('dragging');
        if (e.cancelable) e.preventDefault();
      };
      const onMove = (e) => {
        if (!dragging) return;
        const pt = e.touches ? e.touches[0] : e;
        const targetCol = findColAt(pt.clientX, pt.clientY) || n.column;
        const cv = cols[targetCol];
        const c = cv.getBoundingClientRect();
        const x = Math.max(0, Math.min(c.width  - el.offsetWidth,  pt.clientX - c.left - dx));
        const y = Math.max(0, Math.min(c.height - el.offsetHeight, pt.clientY - c.top  - dy));
        if (targetCol !== n.column) {
          n.column = targetCol;
          el.dataset.col = targetCol;
          cv.appendChild(el);
        }
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        n.x = x; n.y = y;
        renderEdges();
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('dragging');
        // 컬럼 변경 시 다른 컬럼의 엣지 자동 정리
        state.edges = state.edges.filter(([a, b]) => {
          const na = state.nodes.find(x => x.id === a);
          const nb = state.nodes.find(x => x.id === b);
          return na && nb && na.column === nb.column;
        });
        save(); renderEdges();
      };
      el.addEventListener('mousedown', onDown);
      el.addEventListener('touchstart', onDown, {passive:false});
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, {passive:false});
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);

      canvas.appendChild(el);
    };

    state.nodes.forEach(makeNode);
    requestAnimationFrame(renderEdges);

    // 컬럼 더블클릭 → 새 노드 (cols-wrap 단일 리스너 + 좌표로 컬럼 판정)
    colsWrap.addEventListener('dblclick', e => {
      /* 노드/제목/버튼/스플리터 위 dblclick은 무시 */
      if (e.target.closest('.pk-mm-node')) return;
      if (e.target.closest('.pk-cards-coltitle')) return;
      if (e.target.closest('button')) return;
      if (e.target.closest('.pk-cards-splitter')) return;
      /* 좌표로 컬럼 판정 */
      let key = findColAt(e.clientX, e.clientY);
      if (!key) return;
      const canvas = cols[key];
      const c = canvas.getBoundingClientRect();
      const n = {
        id: 'n' + Date.now() + Math.floor(Math.random() * 999),
        x: Math.max(0, e.clientX - c.left - 40),
        y: Math.max(0, e.clientY - c.top  - 14),
        t: '메모',
        column: key,
      };
      state.nodes.push(n);
      save();
      makeNode(n);
    });

    map.querySelector('.pk-mm-add').addEventListener('click', () => {
      const canvas = cols.m;
      const c = canvas.getBoundingClientRect();
      const n = {
        id: 'n' + Date.now() + Math.floor(Math.random() * 999),
        x: 20 + Math.random() * Math.max(20, c.width - 160),
        y: 20 + Math.random() * Math.max(20, c.height - 80),
        t: '메모',
        column: 'm',
      };
      state.nodes.push(n);
      save();
      makeNode(n);
    });
    map.querySelector('.pk-mm-clear').addEventListener('click', () => {
      if (!confirm('이 글의 핵심카드를 모두 지울까요?')) return;
      state = { nodes: [], edges: [] };
      save();
      [...colsWrap.querySelectorAll('.pk-mm-node')].forEach(x => x.remove());
      renderEdges();
    });

    window.addEventListener('resize', renderEdges);
    window.addEventListener('scroll', renderEdges, {passive:true});

    /* 전체 패널 재구성 (undo/redo 후 호출) */
    const rebuildAll = () => {
      [...colsWrap.querySelectorAll('.pk-mm-node')].forEach(x => x.remove());
      Object.entries(colTitleEls).forEach(([k, el]) => {
        if (el) el.textContent = state.colTitles[k] || DEFAULT_COL_TITLES[k];
      });
      if (!state.colFracs) state.colFracs = { s: 1, m: 1, c: 1 };
      applyColFracs();
      state.nodes.forEach(makeNode);
      renderEdges();
    };

    /* Ctrl+Z / Ctrl+Shift+Z (또는 Ctrl+Y) */
    const onKey = (e) => {
      const isMeta = e.ctrlKey || e.metaKey;
      if (!isMeta) return;
      const expanded = map._sourceRow && map._sourceRow.classList.contains('expanded');
      if (!expanded || map.style.display === 'none') return;
      /* contenteditable 내에서는 네이티브 텍스트 undo 우선 */
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute('contenteditable') === 'true') return;
      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          if (redoStack.length === 0) return;
          e.preventDefault();
          undoStack.push(_lastSavedSnap);
          const next = redoStack.pop();
          state = JSON.parse(next);
          _lastSavedSnap = next;
          try { localStorage.setItem(storeKey, next); } catch (_) {}
          rebuildAll();
        } else {
          if (undoStack.length === 0) return;
          e.preventDefault();
          redoStack.push(_lastSavedSnap);
          const prev = undoStack.pop();
          state = JSON.parse(prev);
          _lastSavedSnap = prev;
          try { localStorage.setItem(storeKey, prev); } catch (_) {}
          rebuildAll();
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        if (redoStack.length === 0) return;
        e.preventDefault();
        undoStack.push(_lastSavedSnap);
        const next = redoStack.pop();
        state = JSON.parse(next);
        _lastSavedSnap = next;
        try { localStorage.setItem(storeKey, next); } catch (_) {}
        rebuildAll();
      }
    };
    document.addEventListener('keydown', onKey, true);
  }

  /* ══════════════════════════════════════
     6. battle banner — inline-article 열릴 때
  ══════════════════════════════════════ */
  function injectBattleBanner(article) {
    if (article.querySelector('.pk-battle-banner')) return;

    const row = article.previousElementSibling;
    if (!row) return;
    const titleEl = row.querySelector('.row-title');
    const titleText = titleEl ? titleEl.textContent.trim() : '';

    const cat = detectCategory();

    // 글마다 다른 포켓몬
    const hash = strHash(titleText);
    const variants = [3, 9, 152, 6, 149, 248, 151, 130, 94, 100, 79, 376, 131, 125, 243, 59, 150, 12, 17, 77];
    const pkmnN = variants[hash % variants.length];
    const lv = 30 + (hash % 41);
    const hpPct = 40 + (hash % 55);
    const hpCls = hpClass(hpPct);

    const banner = document.createElement('div');
    banner.className = 'pk-battle-banner';
    banner.innerHTML = `
      <div class="pk-battle-enemy">
        <img class="pk-battle-sprite" src="${SP(pkmnN)}" alt="">
        <div class="pk-battle-info">
          <div class="pk-battle-name">${titleText.length > 55 ? titleText.slice(0, 55) + '…' : titleText}</div>
          <div class="pk-battle-lv">Lv.${lv} · ${cat.name}</div>
          <div class="pk-battle-types">${typeHTML(cat.types)}</div>
          <div class="pk-battle-hp">
            <span class="pk-hp-label">HP</span>
            <div class="pk-hp-track"><div class="pk-hp-fill ${hpCls}" style="width:${hpPct}%"></div></div>
            <span class="pk-hp-num">${hpPct}/100</span>
          </div>
        </div>
      </div>
    `;

    // ia-close 버튼 다음에 battle banner 삽입
    const closeBtn = article.querySelector('.ia-close');
    if (closeBtn && closeBtn.nextSibling) {
      article.insertBefore(banner, closeBtn.nextSibling);
    } else {
      article.insertBefore(banner, article.firstChild);
    }

    // ia-body 래퍼가 없으면 kicker/title/content를 묶어줌
    if (!article.querySelector('.ia-body')) {
      const iaBody = document.createElement('div');
      iaBody.className = 'ia-body';
      // banner와 ia-close를 제외한 모든 자식을 ia-body로 이동
      const toMove = [...article.children].filter(c =>
        !c.classList.contains('pk-battle-banner') && !c.classList.contains('ia-close')
      );
      toMove.forEach(c => iaBody.appendChild(c));
      article.appendChild(iaBody);
    }
  }

  /* ══════════════════════════════════════
     7. ia-close 버튼 텍스트 → ✕
  ══════════════════════════════════════ */
  function fixCloseButtons() {
    document.querySelectorAll('.ia-close').forEach(btn => {
      // SVG 숨기고 텍스트 X 추가
      if (!btn.dataset.pkFixed) {
        btn.dataset.pkFixed = '1';
        const svg = btn.querySelector('svg');
        if (svg) svg.style.display = 'none';
        if (!btn.querySelector('.pk-x')) {
          const x = document.createElement('span');
          x.className = 'pk-x';
          x.textContent = '✕';
          btn.appendChild(x);
        }
      }
    });
  }

  /* ══════════════════════════════════════
     8. 걷는 포켓몬
  ══════════════════════════════════════ */
  const WALKERS = [25, 133, 1, 4, 7, 9, 39, 143, 54, 52, 35, 94, 130, 149, 151, 6, 3, 248, 79, 137, 59, 150, 243];
  let walkerIdx = Math.floor(Math.random() * WALKERS.length);

  function injectWalker() {
    if (document.getElementById('pk-walker')) return;
    const img = document.createElement('img');
    img.id = 'pk-walker';
    img.src = shiny ? SP_SH(WALKERS[walkerIdx]) : SP(WALKERS[walkerIdx]);
    img.alt = '';
    img.title = '드래그해서 옮겨보세요!';
    document.body.appendChild(img);

    /* ── 저장된 위치 복원 ── */
    try {
      const saved = JSON.parse(localStorage.getItem('pk-walker-pos') || 'null');
      if (saved && typeof saved.x === 'number') {
        img.style.left = Math.min(window.innerWidth - 80, Math.max(0, saved.x)) + 'px';
        img.style.top  = Math.min(window.innerHeight - 80, Math.max(0, saved.y)) + 'px';
      }
    } catch (_) {}

    /* ── 드래그 ── */
    let dragging = false, dx = 0, dy = 0, moved = false;
    const onDown = e => {
      dragging = true; moved = false;
      const r = img.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      dx = p.clientX - r.left; dy = p.clientY - r.top;
      e.preventDefault();
    };
    const onMove = e => {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const x = Math.max(0, Math.min(window.innerWidth  - img.offsetWidth,  p.clientX - dx));
      const y = Math.max(0, Math.min(window.innerHeight - img.offsetHeight, p.clientY - dy));
      img.style.left = x + 'px';
      img.style.top  = y + 'px';
      moved = true;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        try {
          localStorage.setItem('pk-walker-pos', JSON.stringify({
            x: parseInt(img.style.left, 10),
            y: parseInt(img.style.top, 10)
          }));
        } catch (_) {}
      } else {
        // 클릭(이동 X) → 즉시 랜덤 교체
        swapWalker();
      }
    };
    img.addEventListener('mousedown', onDown);
    img.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    /* ── 랜덤 자동 교체 (8초마다) ── */
    function swapWalker() {
      let next;
      do { next = Math.floor(Math.random() * WALKERS.length); }
      while (next === walkerIdx && WALKERS.length > 1);
      walkerIdx = next;
      img.classList.remove('pk-swap');
      void img.offsetWidth;
      img.src = shiny ? SP_SH(WALKERS[walkerIdx]) : SP(WALKERS[walkerIdx]);
      img.classList.add('pk-swap');
    }
    setInterval(swapWalker, 8000);
  }

  /* ══════════════════════════════════════
     9. row 열림 감지 → battle banner 주입
  ══════════════════════════════════════ */
  function observeRows() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const row = m.target;
          if (row.classList.contains('expanded')) {
            const art = row.nextElementSibling;
            if (art && art.classList.contains('inline-article')) {
              setTimeout(() => {
                injectBattleBanner(art);
                const idx = [...row.parentNode.children].indexOf(row);
                buildMindmap(art, row.id || ('row-' + idx));
              }, 30);
            }
          }
        }
      });
    });
    document.querySelectorAll('.row').forEach(row => {
      observer.observe(row, { attributes: true });
      // 이미 expanded 상태인 row(해시 진입 등)도 한 번 처리
      if (row.classList.contains('expanded')) {
        const art = row.nextElementSibling;
        if (art && art.classList.contains('inline-article')) {
          setTimeout(() => {
            injectBattleBanner(art);
            const idx = [...row.parentNode.children].indexOf(row);
            buildMindmap(art, row.id || ('row-' + idx));
          }, 30);
        }
      }
    });
  }

  /* ══════════════════════════════════════
     10. TWEAKS 패널 (walker 교체 / shiny)
  ══════════════════════════════════════ */
  let shiny = false;

  function buildTweaksPanel() {
    if (document.getElementById('pk-tweaks')) return;
    const panel = document.createElement('div');
    panel.id = 'pk-tweaks';
    panel.style.cssText = `
      position:fixed;bottom:80px;left:16px;z-index:500;
      background:#f5edd8;border:3px solid #1c2040;box-shadow:4px 4px 0 #1c2040;
      padding:14px 14px 16px;width:210px;display:none;
      font-family:'Galmuri11',sans-serif;
    `;
    panel.innerHTML = `
      <div style="font-size:.36rem;color:#d42b2b;letter-spacing:1px;margin-bottom:10px;border-bottom:2px solid #1c2040;padding-bottom:6px;">⚙ TWEAKS</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:.27rem;color:#1c2040;flex:1;">WALKER</span>
        <button id="pk-next-walker" style="font-family:'Galmuri11',sans-serif;font-size:.25rem;padding:3px 7px;border:2px solid #1c2040;background:#e8dfc8;cursor:pointer;box-shadow:2px 2px 0 #1c2040;">교체</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:.27rem;color:#1c2040;flex:1;">SHINY</span>
        <button id="pk-shiny-btn" style="font-family:'Galmuri11',sans-serif;font-size:.25rem;padding:3px 7px;border:2px solid #1c2040;background:#e8dfc8;cursor:pointer;box-shadow:2px 2px 0 #1c2040;">OFF</button>
      </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('pk-next-walker').addEventListener('click', () => {
      walkerIdx = (walkerIdx + 1) % WALKERS.length;
      const w = document.getElementById('pk-walker');
      if (w) w.src = shiny ? SP_SH(WALKERS[walkerIdx]) : SP(WALKERS[walkerIdx]);
    });

    document.getElementById('pk-shiny-btn').addEventListener('click', () => {
      shiny = !shiny;
      const btn = document.getElementById('pk-shiny-btn');
      btn.textContent = shiny ? 'ON' : 'OFF';
      btn.style.background = shiny ? '#d42b2b' : '#e8dfc8';
      btn.style.color = shiny ? '#fff' : '#1c2040';
      // 업데이트: walker, brand mascot, head sprite
      const w = document.getElementById('pk-walker');
      if (w) w.src = shiny ? SP_SH(WALKERS[walkerIdx]) : SP(WALKERS[walkerIdx]);
      const mascot = document.getElementById('pk-brand-mascot');
      if (mascot) mascot.src = shiny ? SP_SH(133) : SP(133);
      const headSprite = document.getElementById('pk-head-sprite');
      if (headSprite) {
        const cat = detectCategory();
        headSprite.src = shiny ? SP_SH(cat.n) : SP(cat.n);
      }
    });
  }

  /* ── Tweaks 프로토콜 ── */
  function initTweaksProtocol() {
    window.addEventListener('message', e => {
      if (e.data?.type === '__activate_edit_mode') {
        const p = document.getElementById('pk-tweaks');
        if (p) p.style.display = 'block';
      }
      if (e.data?.type === '__deactivate_edit_mode') {
        const p = document.getElementById('pk-tweaks');
        if (p) p.style.display = 'none';
      }
    });
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  }

  /* ══════════════════════════════════════
     11. timeline 상단 pk-divider 주입
  ══════════════════════════════════════ */
  function injectDivider() {
    const timeline = document.querySelector('.timeline');
    if (!timeline || timeline.querySelector('.pk-divider')) return;
    const hr = document.createElement('hr');
    hr.className = 'pk-divider';
    timeline.insertBefore(hr, timeline.firstChild);
  }

  /* ══════════════════════════════════════
     12. 폰트 강제 적용 (인라인 style + !important)
         — 외부 CSS로 못 이기는 인라인 <style> .ia-* !important 무력화
  ══════════════════════════════════════ */
  const EMOJI_FB = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla'";
  const READ_FONT      = `'Galmuri11','Pretendard','Noto Sans KR',${EMOJI_FB},sans-serif`;
  const READ_FONT_CND  = `'Galmuri11 Condensed','Galmuri11',${EMOJI_FB},sans-serif`;
  /* 전면 Galmuri 대체 — 픽셀 라벨도 Galmuri11 Bold로 */
  const PIXEL_FONT     = `'Galmuri11','Pretendard',${EMOJI_FB},sans-serif`;

  const PIXEL_SELECTORS = [
    '.pk-row-num',
    '#pk-stats-bar', '#pk-stats-bar *',
    '#pk-type-row', '#pk-type-row *',
    '#pk-hp-row', '#pk-hp-row *',
    '.pk-hp-label', '.pk-hp-num',
    '.pk-type', '.pk-nav-section',
    '#pk-tweaks', '#pk-tweaks *',
    '.pk-battle-lv', '.pk-battle-types', '.pk-battle-types *',
    '.pk-mindmap-header', '.pk-mindmap-header *',
    '.pk-mm-del', '.pk-mm-hint'
  ].join(',');

  /* Bold(Galmuri11 700) 적용 대상 — 제목류 */
  const BOLD_SELECTORS = [
    '.row-title',
    '.ia-title', '.ia-section-h', '.ia-para-title', '.ia-sub-title', '.ia-tag-title',
    '.ph-title', 'h1', 'h2', 'h3', 'h4',
    '.qa-q', '.pk-battle-name',
    '.term-name', '.tag-label',
    '.brand', '.cd-head h2', '.settings-panel h3',
    'strong', 'b'
  ].join(',');

  /* Condensed 적용 대상 — 좁은 라벨/UI */
  const COND_SELECTORS = [
    '.nav-item', '.nav-item *',
    '.eyebrow',
    '.setting-label', '.setting-btn',
    '.bookmark-btn', '.row-actions', '.row-actions *',
    '.count', '.ph-sub',
    '.clip-item .ci-meta', '.tag-label',
    '.pk-mm-del'
  ].join(',');

  function isPixelEl(el) { return el.matches && el.matches(PIXEL_SELECTORS); }
  function isBoldEl(el)  { return el.matches && el.matches(BOLD_SELECTORS); }
  function isCondEl(el)  { return el.matches && el.matches(COND_SELECTORS); }

  function applyFont(el) {
    if (!el || el.nodeType !== 1) return;
    if (isPixelEl(el)) {
      el.style.setProperty('font-family', PIXEL_FONT, 'important');
      el.style.setProperty('font-weight', '700', 'important');
      return;
    }
    if (isBoldEl(el)) {
      el.style.setProperty('font-family', READ_FONT, 'important');
      el.style.setProperty('font-weight', '700', 'important');
      return;
    }
    if (isCondEl(el)) {
      el.style.setProperty('font-family', READ_FONT_CND, 'important');
      return;
    }
    el.style.setProperty('font-family', READ_FONT, 'important');
  }
  function forceFontAll() {
    applyFont(document.body);
    document.querySelectorAll('body *').forEach(applyFont);
  }
  function observeFont() {
    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          applyFont(n);
          n.querySelectorAll && n.querySelectorAll('*').forEach(applyFont);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ══════════════════════════════════════
     13. 단축키: Cmd+U=형광펜, Cmd+E=클립
  ══════════════════════════════════════ */
  function getSelectionInfo() {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    if (!text) return null;
    /* 가장 가까운 .ia-title 또는 row-title을 글 제목으로 추출 */
    let node = sel.anchorNode;
    if (node && node.nodeType === 3) node = node.parentNode;
    const article = node && node.closest && node.closest('.inline-article');
    let title = '';
    if (article) {
      const t = article.querySelector('.ia-title');
      if (t) title = t.textContent.trim();
    }
    if (!title) {
      const card = node && node.closest && node.closest('.card-row');
      const rt = card && card.querySelector('.row-title');
      if (rt) title = rt.textContent.trim();
    }
    return { text, title };
  }

  function bindShortcuts() {
    document.addEventListener('keydown', e => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (!cmd) return;
      const k = e.key.toLowerCase();
      if (k !== 'u' && k !== 'e') return;
      const info = getSelectionInfo();
      if (!info) return;
      e.preventDefault();
      e.stopPropagation();
      const safe = (s) => s.replace(/['"\\]/g, '');
      if (k === 'u' && typeof window.addHighlight === 'function') {
        window.addHighlight(info.text, info.title);
        flashToast('🖍 형광펜 표시됨');
      } else if (k === 'e' && typeof window.addClip === 'function') {
        window.addClip(info.text, info.title);
        flashToast('📎 클립 저장됨');
      }
      window.getSelection().removeAllRanges();
      const pop = document.querySelector('.clip-popover');
      if (pop) pop.remove();
    });
  }
  function flashToast(msg) {
    let t = document.getElementById('pk-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pk-toast';
      t.style.cssText = `position:fixed;top:24px;left:50%;transform:translateX(-50%);
        background:#1c2040;color:#f0c000;padding:10px 18px;
        border:3px solid #f0c000;box-shadow:4px 4px 0 #d42b2b;
        z-index:9999;font-weight:700;letter-spacing:.5px;
        opacity:0;transition:opacity 200ms;`;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._tm);
    t._tm = setTimeout(() => { t.style.opacity = '0'; }, 1400);
  }

  /* ══════════════════════════════════════
     INIT
  ══════════════════════════════════════ */
  /* ══════════════════════════════════════
     X. 글 삭제 / MD 업로드 추가 / 태그·한 줄 요약  (localStorage)
  ══════════════════════════════════════ */
  const PK_DEL = 'pk-deleted';
  const PK_ADD = 'pk-added';
  const PK_META = 'pk-meta';
  function lsLoad(k){ try{return JSON.parse(localStorage.getItem(k)||'{}');}catch(_){return{};} }
  function lsSave(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(_){} }
  function escHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function inlineMd(s){
    return escHtml(s)
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g,'<em>$1</em>');
  }
  function parseMarkdownToReportHtml(md){
    const lines = md.split(/\r?\n/);
    let title = '';
    const out = [];
    let para = [];
    const flushPara = ()=>{
      if (!para.length) return;
      const text = para.join(' ').trim();
      if (text) out.push(`<p class="ia-para-body">${inlineMd(text)}</p>`);
      para = [];
    };
    for (const ln of lines){
      const m1 = ln.match(/^#\s+(.+)$/);
      const m2 = ln.match(/^##\s+(.+)$/);
      const m3 = ln.match(/^###\s+(.+)$/);
      const m4 = ln.match(/^####\s+(.+)$/);
      if (m1) {
        flushPara();
        if (!title) title = m1[1].trim();
        else out.push(`<div class="ia-section-h">${inlineMd(m1[1])}</div>`);
      } else if (m2) {
        flushPara(); out.push(`<div class="ia-section-h">${inlineMd(m2[1])}</div>`);
      } else if (m3) {
        flushPara(); out.push(`<h3 class="ia-para-title">${inlineMd(m3[1])}</h3>`);
      } else if (m4) {
        flushPara(); out.push(`<h4 class="ia-sub-title">${inlineMd(m4[1])}</h4>`);
      } else if (/^\s*$/.test(ln)) {
        flushPara();
      } else {
        para.push(ln.trim());
      }
    }
    flushPara();
    return { title: title || '제목 없음', html: out.join('\n') };
  }
  function plainExcerpt(html, n){
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    return (tmp.textContent || '').replace(/\s+/g,' ').trim().slice(0, n||140);
  }

  function applyDeletions(){
    const all = lsLoad(PK_DEL);
    const list = all[pageKey()] || [];
    if (!list.length) return;
    const ids = new Set(list.map(s => s.split('::').pop()));
    document.querySelectorAll('.row').forEach(row => {
      const rid = row.id || rowReadId(row).split('::').pop();
      if (!ids.has(rid)) return;
      const cr = row.closest('.card-row');
      const ia = (cr ? cr.nextElementSibling : row.nextElementSibling);
      const ia2 = row.parentElement && row.parentElement.querySelector(':scope > .inline-article');
      if (cr) cr.remove(); else row.remove();
      if (ia && ia.classList && ia.classList.contains('inline-article')) ia.remove();
      else if (ia2) ia2.remove();
    });
  }

  function renderAddedArticles(){
    const tl = document.querySelector('.timeline');
    if (!tl) return;
    const all = lsLoad(PK_ADD);
    const list = all[pageKey()] || [];
    if (!list.length) return;
    const sectorName = (document.querySelector('.page-head h2')?.textContent || '').trim();
    list.forEach(a => {
      if (document.getElementById(a.id)) return;
      const wrap = document.createElement('div');
      wrap.className = 'card-row pk-added-card';
      wrap.style.display = 'contents';
      wrap.dataset.text = `${a.title} ${a.excerpt||''}`;
      wrap.innerHTML = `
<div class="row pk-added-row" id="${a.id}">
  <div class="row-body">
    <h3 class="row-title">${escHtml(a.title)}</h3>
    <p class="row-excerpt">${escHtml(a.excerpt||'')}</p>
  </div>
  <div class="row-actions">
    <button class="bookmark-btn" data-title="${escHtml(a.title)}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
  </div>
</div>
<div class="inline-article">
  <button class="ia-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  <div class="ia-kicker"><span class="dot" style="width:6px;height:6px;border-radius:50%;background:var(--c-default);display:inline-block"></span> ${escHtml(sectorName)} · 추가</div>
  <h2 class="ia-title">${escHtml(a.title)}</h2>
  <div class="article-content">${a.html}</div>
</div>`;
      tl.insertBefore(wrap, tl.firstChild);
      const newRow = wrap.querySelector('.row');
      const newArt = wrap.querySelector('.inline-article');
      if (newRow && !newRow.dataset.pkExpandBound) {
        newRow.dataset.pkExpandBound = '1';
        newRow.addEventListener('click', function(e){
          if (e.target.closest('.bookmark-btn') || e.target.closest('.ia-close') ||
              e.target.closest('.pk-del-btn') || e.target.closest('.pk-meta-edit') ||
              e.target.closest('.pk-edit-btn') || e.target.closest('.pk-folder-tag') ||
              e.target.closest('.pk-read-badge') || e.target.closest('.pk-row-ball')) return;
          const wasOpen = this.classList.contains('expanded');
          document.querySelectorAll('.row.expanded').forEach(r => r.classList.remove('expanded'));
          if (!wasOpen) {
            this.classList.add('expanded');
            setTimeout(() => {
              const top = newArt.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top, behavior: 'smooth' });
            }, 50);
          }
        });
        const closeBtn = newArt && newArt.querySelector('.ia-close');
        if (closeBtn) closeBtn.addEventListener('click', e => {
          e.stopPropagation(); newRow.classList.remove('expanded');
        });
      }
    });
  }

  /* ── 추가된(MD 업로드) 글 편집 버튼 ── */
  function injectAddedEditButtons(){
    document.querySelectorAll('.pk-added-row').forEach(row => {
      if (row.querySelector('.pk-edit-btn')) return;
      let actions = row.querySelector('.row-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'row-actions';
        row.appendChild(actions);
      }
      const btn = document.createElement('button');
      btn.className = 'pk-edit-btn';
      btn.title = 'MD 편집';
      btn.type = 'button';
      btn.innerHTML = '✎';
      actions.insertBefore(btn, actions.firstChild);
    });
  }
  /* 위임 핸들러 (capture 단계로 등록 — 다른 row 클릭 핸들러보다 먼저 처리) */
  function bindEditDelegation(){
    if (window.__pkEditBound) return;
    window.__pkEditBound = true;
    document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('.pk-edit-btn');
      if (!btn) return;
      e.stopPropagation(); e.preventDefault();
      const row = btn.closest('.pk-added-row');
      if (row) openMdEditor(row.id);
    }, true);
  }
  function htmlToMdFallback(html){
    /* 저장된 md가 없을 때 — html에서 대략적인 md 역변환 */
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    const out = [];
    tmp.childNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      const t = (n.textContent || '').trim();
      if (!t) return;
      if (n.classList.contains('ia-section-h')) out.push('## ' + t);
      else if (n.classList.contains('ia-para-title')) out.push('### ' + t);
      else if (n.classList.contains('ia-sub-title')) out.push('#### ' + t);
      else out.push(t);
      out.push('');
    });
    return out.join('\n').trim();
  }
  function openMdEditor(rowId){
    const pk = pageKey();
    const all = lsLoad(PK_ADD);
    const list = all[pk] || [];
    const item = list.find(a => a.id === rowId);
    if (!item) { alert('편집 대상 글을 찾을 수 없습니다.'); return; }
    const initialMd = item.md || ('# ' + (item.title||'') + '\n\n' + htmlToMdFallback(item.html));
    let dlg = document.getElementById('pk-md-editor');
    if (dlg) dlg.remove();
    dlg = document.createElement('div');
    dlg.id = 'pk-md-editor';
    dlg.innerHTML = `
      <div class="pk-mde-backdrop"></div>
      <div class="pk-mde-modal">
        <div class="pk-mde-head">
          <span>📝 글 편집 — ${escHtml(item.title || '')}</span>
          <button class="pk-mde-x" type="button">✕</button>
        </div>
        <textarea class="pk-mde-area" spellcheck="false"></textarea>
        <div class="pk-mde-foot">
          <span class="pk-mde-hint">첫 # → 제목, ## → 섹션, ### → 단락 제목, **굵은**</span>
          <button class="pk-mde-cancel" type="button">취소</button>
          <button class="pk-mde-save" type="button">저장</button>
        </div>
      </div>`;
    document.body.appendChild(dlg);
    const ta = dlg.querySelector('.pk-mde-area');
    ta.value = initialMd;
    setTimeout(() => ta.focus(), 30);
    const close = () => dlg.remove();
    dlg.querySelector('.pk-mde-x').addEventListener('click', close);
    dlg.querySelector('.pk-mde-cancel').addEventListener('click', close);
    dlg.querySelector('.pk-mde-backdrop').addEventListener('click', close);
    dlg.querySelector('.pk-mde-save').addEventListener('click', () => {
      const newMd = ta.value;
      const { title, html } = parseMarkdownToReportHtml(newMd);
      const allNow = lsLoad(PK_ADD);
      const arr = allNow[pk] || [];
      const idx = arr.findIndex(a => a.id === rowId);
      if (idx < 0) { close(); return; }
      arr[idx] = Object.assign({}, arr[idx], {
        title, html, md: newMd, excerpt: plainExcerpt(html, 140),
        editedAt: Date.now()
      });
      allNow[pk] = arr;
      lsSave(PK_ADD, allNow);
      // DOM 갱신: 기존 wrap 제거 후 재렌더
      const old = document.getElementById(rowId);
      const wrap = old && old.closest('.card-row');
      if (wrap) wrap.remove();
      renderAddedArticles();
      injectRowDecorations();
      injectRowNotes();
      injectReadBadges();
      injectDeleteButtons();
      injectMetaEditors();
      injectAddedEditButtons();
      enableRowDrag();
      renderFolderBar();
      applyFolderFilter();
      if (typeof updateProgress === 'function') updateProgress();
      close();
    });
    // ESC 닫기
    dlg.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function injectDeleteButtons(){
    document.querySelectorAll('.row').forEach(row => {
      if (row.querySelector('.pk-del-btn')) return;
      let actions = row.querySelector('.row-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'row-actions';
        row.appendChild(actions);
      }
      const btn = document.createElement('button');
      btn.className = 'pk-del-btn';
      btn.title = '글 숨기기 (이 브라우저)';
      btn.innerHTML = '🗑';
      btn.addEventListener('click', e => {
        e.stopPropagation(); e.preventDefault();
        const title = row.querySelector('.row-title')?.textContent?.trim() || '이 글';
        if (!confirm(`"${title}"\n이 글을 숨길까요? (이 브라우저에서만)`)) return;
        const pk = pageKey();
        const id = rowReadId(row);
        const idShort = id.split('::').pop();
        const all = lsLoad(PK_DEL);
        all[pk] = all[pk] || [];
        if (!all[pk].includes(id)) all[pk].push(id);
        lsSave(PK_DEL, all);
        // remove from added if applicable
        const added = lsLoad(PK_ADD);
        if (added[pk]) {
          const before = added[pk].length;
          added[pk] = added[pk].filter(a => a.id !== idShort && a.id !== id);
          if (added[pk].length !== before) lsSave(PK_ADD, added);
        }
        const cr = row.closest('.card-row');
        const ia = (cr ? cr.nextElementSibling : row.nextElementSibling);
        if (cr) cr.remove(); else row.remove();
        if (ia && ia.classList && ia.classList.contains('inline-article')) ia.remove();
        if (typeof updateProgress === 'function') updateProgress();
        if (typeof renderTrashPanel === 'function') renderTrashPanel();
      });
      actions.appendChild(btn);
    });
  }

  function injectMetaEditors(){
    document.querySelectorAll('.row').forEach(row => {
      if (row.querySelector('.pk-meta-line')) return;
      const body = row.querySelector('.row-body');
      if (!body) return;
      const id = rowReadId(row);
      const line = document.createElement('div');
      line.className = 'pk-meta-line';
      const renderInner = ()=>{
        const data = (lsLoad(PK_META))[id] || { tags: [] };
        const empty = !data.tags?.length;
        line.classList.toggle('empty', empty);
        line.innerHTML = `
          <span class="pk-tags">${(data.tags||[]).map(t=>`<span class="pk-tag" data-tag="${escHtml(t)}">#${escHtml(t)}</span>`).join('')}</span>
          <button class="pk-meta-edit" type="button" title="해시태그 편집">✎ 태그</button>`;
        line.querySelector('.pk-meta-edit').addEventListener('click', e => {
          e.stopPropagation(); e.preventDefault();
          const old = (lsLoad(PK_META))[id] || { tags: [] };
          const tagStr = prompt('해시태그 (쉼표로 구분, # 없이 입력)', (old.tags||[]).join(', '));
          if (tagStr === null) return;
          const tags = tagStr.split(/[,\s]+/).map(s=>s.replace(/^#/,'').trim()).filter(Boolean);
          const allNow = lsLoad(PK_META);
          const title = (row.querySelector('.row-title')?.textContent || '').trim();
          allNow[id] = {
            tags,
            pagePath: location.pathname,
            sector: (document.querySelector('.page-head h2')?.textContent || '').trim(),
            rowId: id.split('::').pop(),
            title,
            updatedAt: Date.now()
          };
          lsSave(PK_META, allNow);
          renderInner();
          if (typeof renderHashtagPanel === 'function') renderHashtagPanel();
        });
        /* 태그 칩 클릭 → 해당 태그 필터 모달 */
        line.querySelectorAll('.pk-tag').forEach(chip => {
          chip.addEventListener('click', e => {
            e.stopPropagation(); e.preventDefault();
            openHashtagView(chip.dataset.tag);
          });
        });
      };
      renderInner();
      // place click handler stop on the line itself so clicks don't expand article
      line.addEventListener('click', e => {
        if (e.target.closest('.pk-meta-edit')) return;
        // allow row expansion otherwise
      });
      body.appendChild(line);
    });
  }

  /* ── 사이드바 휴지통 패널 (현재 페이지 숨긴 글) ── */
  function injectTrashPanel(){
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    let panel = sidebar.querySelector('#pk-trash-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'pk-trash-panel';
      panel.className = 'nav-list';
      sidebar.appendChild(panel);
    }
    renderTrashPanel();
  }
  function renderTrashPanel(){
    const panel = document.querySelector('#pk-trash-panel');
    if (!panel) return;
    const pk = pageKey();
    const all = lsLoad(PK_DEL);
    const list = all[pk] || [];
    if (!list.length) {
      panel.innerHTML = `<div class="nav-section-title">🗑 휴지통</div>
        <div class="pk-trash-empty">숨긴 글이 없어요</div>`;
      return;
    }
    /* 글 추가본(PK_ADD) 정보로 제목 추정, 일반 row는 페이지에서 조회 시도 */
    const addedAll = lsLoad(PK_ADD)[pk] || [];
    panel.innerHTML = `
      <div class="nav-section-title">🗑 휴지통 (${list.length}) <button class="pk-trash-restore-all" type="button">전체복원</button></div>
      ${list.map(fullId => {
        const rid = fullId.split('::').pop();
        const added = addedAll.find(a => a.id === rid);
        const title = added ? added.title : rid;
        return `<div class="pk-trash-item">
          <span class="pk-trash-title" title="${escHtml(title)}">${escHtml(title)}</span>
          <button class="pk-trash-restore" data-id="${escHtml(fullId)}" title="복원">↺</button>
        </div>`;
      }).join('')}`;
    panel.querySelectorAll('.pk-trash-restore').forEach(b => {
      b.addEventListener('click', e => {
        e.preventDefault();
        const id = b.dataset.id;
        const cur = lsLoad(PK_DEL);
        cur[pk] = (cur[pk] || []).filter(x => x !== id);
        if (!cur[pk].length) delete cur[pk];
        lsSave(PK_DEL, cur);
        renderTrashPanel();
        location.reload();
      });
    });
    const allBtn = panel.querySelector('.pk-trash-restore-all');
    if (allBtn) allBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!confirm('이 페이지에서 숨긴 글 전부 복원할까요?')) return;
      const cur = lsLoad(PK_DEL);
      delete cur[pk];
      lsSave(PK_DEL, cur);
      location.reload();
    });
  }

  /* ── 사이드바 해시태그 패널 (전체 페이지 통합) ── */
  function collectAllTags(){
    const all = lsLoad(PK_META);
    const map = new Map(); // tag -> [{key, pagePath, sector, rowId, title}]
    Object.keys(all).forEach(key => {
      const v = all[key] || {};
      (v.tags || []).forEach(t => {
        if (!map.has(t)) map.set(t, []);
        map.get(t).push({
          key,
          pagePath: v.pagePath || '',
          sector: v.sector || '',
          rowId: v.rowId || (key.split('::').pop()),
          title: v.title || ''
        });
      });
    });
    return map;
  }
  function injectHashtagPanel(){
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    let panel = sidebar.querySelector('#pk-tag-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'pk-tag-panel';
      panel.className = 'nav-list';
      sidebar.appendChild(panel);
    }
    renderHashtagPanel();
  }
  function renderHashtagPanel(){
    const panel = document.querySelector('#pk-tag-panel');
    if (!panel) return;
    const map = collectAllTags();
    const tags = [...map.entries()].sort((a,b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    if (!tags.length) {
      panel.innerHTML = `<div class="nav-section-title">🏷️ 해시태그</div>
        <div class="pk-tag-empty">아직 태그가 없어요. 글에서 ✎ 태그로 추가</div>`;
      return;
    }
    panel.innerHTML = `
      <div class="nav-section-title">🏷️ 해시태그 (${tags.length})</div>
      ${tags.map(([t, arr]) =>
        `<a href="#" class="nav-item pk-tag-link" data-tag="${escHtml(t)}">
           <span>#${escHtml(t)}</span><span class="count">${arr.length}</span>
         </a>`).join('')}`;
    panel.querySelectorAll('.pk-tag-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        openHashtagView(a.dataset.tag);
      });
    });
  }
  function openHashtagView(tag){
    const map = collectAllTags();
    const items = map.get(tag) || [];
    let dlg = document.getElementById('pk-tag-view');
    if (dlg) dlg.remove();
    dlg = document.createElement('div');
    dlg.id = 'pk-tag-view';
    /* 섹터별 그룹 */
    const bySector = {};
    items.forEach(it => {
      const k = it.sector || '(섹터 없음)';
      (bySector[k] = bySector[k] || []).push(it);
    });
    const sectors = Object.keys(bySector).sort();
    const groups = sectors.map(s => `
      <div class="pk-tv-group">
        <div class="pk-tv-sector">${escHtml(s)} <span class="pk-tv-count">${bySector[s].length}</span></div>
        <ul class="pk-tv-list">
          ${bySector[s].map(it => {
            const url = it.pagePath ? (it.pagePath + '#' + it.rowId) : '#';
            const disabled = !it.pagePath ? 'pk-tv-disabled' : '';
            return `<li><a href="${escHtml(url)}" class="pk-tv-item ${disabled}" data-key="${escHtml(it.key)}">
              <span class="pk-tv-title">${escHtml(it.title || '(제목 없음)')}</span>
            </a></li>`;
          }).join('')}
        </ul>
      </div>
    `).join('');

    /* pagePath → storeKey 의 pageKey 변환 (pokemon-inject pageKey() 와 동일 규칙) */
    const pathToPk = (p) => {
      try { return decodeURIComponent(p || '').replace(/\/+/g, '_').replace(/^_|_$/g, '') || 'root'; }
      catch (_) { return ''; }
    };
    /* 태그가 달린 글들의 핵심카드 노드 모으기 */
    const collectCardsFor = (its) => {
      const out = []; // {sector, title, pagePath, rowId, nodes:[{t,column}]}
      its.forEach(it => {
        const pk = pathToPk(it.pagePath);
        if (!pk || !it.rowId) return;
        try {
          const raw = localStorage.getItem(`pk-mm::${pk}::${it.rowId}`);
          if (!raw) return;
          const st = JSON.parse(raw);
          if (!st || !Array.isArray(st.nodes) || !st.nodes.length) return;
          out.push({
            sector: it.sector || '(섹터 없음)',
            title: it.title || '(제목 없음)',
            pagePath: it.pagePath, rowId: it.rowId,
            nodes: st.nodes
          });
        } catch (_) {}
      });
      return out;
    };
    const cardArticles = collectCardsFor(items);
    const cardTotal = cardArticles.reduce((s, a) => s + a.nodes.length, 0);
    const COL_LABEL = { s: '서론', m: '본론', c: '결론' };
    const cardsByCol = (nodes) => {
      const g = { s: [], m: [], c: [] };
      nodes.forEach(n => (g[n.column] || g.m).push(n));
      return g;
    };
    const cardsHTML = cardArticles.length ? cardArticles.map(a => {
      const g = cardsByCol(a.nodes);
      const url = a.pagePath ? (a.pagePath + '#' + a.rowId) : '#';
      const colBlock = (k) => g[k].length ? `
        <div class="pk-tv-cardcol">
          <div class="pk-tv-cardcol-h">${COL_LABEL[k]}</div>
          <ul>${g[k].map(n => `<li>${escHtml(n.t || '')}</li>`).join('')}</ul>
        </div>` : '';
      return `
        <div class="pk-tv-cardgroup">
          <a href="${escHtml(url)}" class="pk-tv-cardtitle">
            <span class="pk-tv-cardsector">${escHtml(a.sector)}</span>
            <span class="pk-tv-cardtitletxt">${escHtml(a.title)}</span>
            <span class="pk-tv-cardcount">${a.nodes.length}장</span>
          </a>
          <div class="pk-tv-cardcols">${colBlock('s')}${colBlock('m')}${colBlock('c')}</div>
        </div>`;
    }).join('') : '<div class="pk-tv-empty">이 태그의 핵심카드가 없어요. 글에서 핵심카드를 작성해 보세요.</div>';

    dlg.innerHTML = `
      <div class="pk-tv-backdrop"></div>
      <div class="pk-tv-modal">
        <div class="pk-tv-head">
          <span>🏷️ #${escHtml(tag)} <span class="pk-tv-total">${items.length}편</span></span>
          <div class="pk-tv-tabs">
            <button type="button" class="pk-tv-tab active" data-tab="articles">글 (${items.length})</button>
            <button type="button" class="pk-tv-tab" data-tab="cards">핵심카드 (${cardTotal})</button>
          </div>
          <button class="pk-tv-x" type="button">✕</button>
        </div>
        <div class="pk-tv-body" data-tab-pane="articles">
          ${items.length ? groups : '<div class="pk-tv-empty">이 태그의 글이 없습니다.</div>'}
        </div>
        <div class="pk-tv-body" data-tab-pane="cards" hidden>
          ${cardsHTML}
        </div>
      </div>`;
    document.body.appendChild(dlg);
    const close = () => dlg.remove();
    dlg.querySelector('.pk-tv-x').addEventListener('click', close);
    dlg.querySelector('.pk-tv-backdrop').addEventListener('click', close);
    /* 탭 전환 */
    dlg.querySelectorAll('.pk-tv-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        dlg.querySelectorAll('.pk-tv-tab').forEach(b => b.classList.toggle('active', b === btn));
        const tab = btn.dataset.tab;
        dlg.querySelectorAll('[data-tab-pane]').forEach(p => {
          p.hidden = (p.dataset.tabPane !== tab);
        });
      });
    });
  }

  function injectAddBar(){
    if (document.getElementById('pk-add-bar')) return;
    const tl = document.querySelector('.timeline');
    if (!tl) return;
    const bar = document.createElement('div');
    bar.id = 'pk-add-bar';
    bar.innerHTML = `
      <label class="pk-add-btn">
        ＋ MD 업로드로 글 추가
        <input type="file" accept=".md,.markdown,text/markdown,text/plain" hidden>
      </label>
      <span class="pk-add-hint">첫 # → 제목, ## → 섹션, ### → 단락 제목, #### → 소제목, **굵은**</span>`;
    const anchor = document.getElementById('pk-progress-bar') || document.querySelector('.page-head');
    if (anchor) anchor.insertAdjacentElement('afterend', bar);
    else tl.parentNode.insertBefore(bar, tl);
    bar.querySelector('input[type=file]').addEventListener('change', async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const text = await f.text();
      const { title, html } = parseMarkdownToReportHtml(text);
      const pk = pageKey();
      const id = `pk-added-${Date.now()}`;
      const item = { id, title, html, md: text, excerpt: plainExcerpt(html, 140), addedAt: Date.now() };
      const all = lsLoad(PK_ADD);
      all[pk] = all[pk] || [];
      all[pk].unshift(item);
      lsSave(PK_ADD, all);
      e.target.value = '';
      // re-render new article and decorate
      renderAddedArticles();
      injectRowDecorations();
      injectRowNotes();
      injectReadBadges();
      injectDeleteButtons();
      injectMetaEditors();
      injectAddedEditButtons();
      enableRowDrag();
      renderFolderBar();
      if (typeof updateProgress === 'function') updateProgress();
      const newRow = document.getElementById(id);
      if (newRow) newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function init() {
    injectBrandMascot();
    injectNavSprites();
    injectNavSectionHeaders();
    fixNavMojibake();
    injectSidebarProgress();
    injectTrashPanel();
    injectHashtagPanel();

    const isArticlePage = !!document.querySelector('.timeline');
    if (isArticlePage) {
      injectPageHead();
      injectStatsBar();
      applyDeletions();
      renderAddedArticles();
      injectRowDecorations();
      injectRowNotes();
      injectReadBadges();
      injectDeleteButtons();
      injectMetaEditors();
      injectAddedEditButtons();
      bindEditDelegation();
      injectProgressAndFilter();
      injectFolderBar();
      injectAddBar();
      updateProgress();
      injectDivider();
      fixCloseButtons();
      observeRows();
    }

    injectWalker();
    buildTweaksPanel();
    initTweaksProtocol();
    bindShortcuts();

    /* 폰트 전면 강제 — 마지막에 한 번 + 향후 변경 감시 */
    forceFontAll();
    observeFont();
    // 늦게 렌더되는 콘텐츠 대비 두 번 더 재시도
    setTimeout(forceFontAll, 300);
    setTimeout(forceFontAll, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
