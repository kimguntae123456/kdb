/* ═══════════════════════════════════════════════════════════════
   pokemon-inject.js — 논술 리더 포켓몬 테마 DOM 주입 v3
   pokemon-theme.html과 100% 동일한 동작
   사용: 각 페이지 하단에 <script src="../pokemon-inject.js"></script>
         메인 index는  <script src="./pokemon-inject.js"></script>
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

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
  function injectRowDecorations() {
    const rows = document.querySelectorAll('.row');
    rows.forEach((row, i) => {
      if (row.querySelector('.pk-row-num')) return; // 이미 주입됨

      const num = String(i + 1).padStart(2, '0');

      // 번호
      const numEl = document.createElement('div');
      numEl.className = 'pk-row-num';
      numEl.textContent = num;

      // 포켓볼 (i에 따라 종류 다르게)
      const ballEl = document.createElement('div');
      ballEl.className = 'pk-row-ball';
      if (i < 3) {
        ballEl.innerHTML = ballSVG('#e04040');
      } else if (i < 6) {
        ballEl.innerHTML = greatBallSVG;
      } else {
        ballEl.innerHTML = ultraBallSVG;
      }

      // row 맨 앞에 삽입
      row.insertBefore(ballEl, row.firstChild);
      row.insertBefore(numEl, row.firstChild);
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
    const map = document.createElement('div');
    map.className = 'pk-mindmap';
    map.innerHTML = `
      <div class="pk-mindmap-header">
        <span>▶ MIND-MAP MEMO</span>
        <span>
          <button class="pk-mm-add">+ 노드</button>
          <button class="pk-mm-clear">초기화</button>
        </span>
      </div>
      <div class="pk-mindmap-canvas">
        <svg class="pk-mm-edges"></svg>
        <div class="pk-mm-hint">캔버스 더블클릭=노드 추가 · 노드 더블클릭=수정 · Shift+클릭 두 노드=연결</div>
      </div>
    `;
    article.appendChild(map);

    const canvas = map.querySelector('.pk-mindmap-canvas');
    const svg = map.querySelector('svg.pk-mm-edges');
    const storeKey = `pk-mm::${pageKey()}::${rowIdx}`;

    /** state: { nodes: [{id, x, y, t}], edges: [[a,b]] } */
    let state = { nodes: [], edges: [] };
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) state = JSON.parse(raw);
    } catch (_) {}

    const save = () => {
      try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (_) {}
    };

    let selectedForEdge = null;

    const renderEdges = () => {
      const rect = canvas.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      svg.innerHTML = '';
      state.edges.forEach(([a, b]) => {
        const na = canvas.querySelector(`[data-id="${a}"]`);
        const nb = canvas.querySelector(`[data-id="${b}"]`);
        if (!na || !nb) return;
        const ra = na.getBoundingClientRect();
        const rb = nb.getBoundingClientRect();
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

    const makeNode = (n) => {
      const el = document.createElement('div');
      el.className = 'pk-mm-node';
      el.dataset.id = n.id;
      el.style.left = n.x + 'px';
      el.style.top  = n.y + 'px';
      el.textContent = n.t || '메모';
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

      /* 더블클릭 = 편집 */
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        el.setAttribute('contenteditable', 'true');
        el.focus();
        document.getSelection().selectAllChildren(el);
      });
      el.addEventListener('blur', () => {
        el.removeAttribute('contenteditable');
        const txt = el.textContent.replace(/X$/, '').trim();
        n.t = txt;
        save();
      });

      /* Shift+클릭 = 엣지 연결 */
      el.addEventListener('click', e => {
        if (!e.shiftKey) return;
        e.stopPropagation();
        if (selectedForEdge && selectedForEdge !== n.id) {
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
          [...canvas.querySelectorAll('.pk-mm-node')].forEach(x => x.style.outline = '');
          save(); renderEdges();
        } else {
          selectedForEdge = n.id;
          el.style.outline = '3px solid #d42b2b';
        }
      });

      /* 드래그 */
      let dragging = false, dx = 0, dy = 0;
      el.addEventListener('mousedown', e => {
        if (el.getAttribute('contenteditable') === 'true') return;
        if (e.target === del) return;
        dragging = true;
        const r = el.getBoundingClientRect();
        const c = canvas.getBoundingClientRect();
        dx = e.clientX - r.left;
        dy = e.clientY - r.top;
        el.classList.add('dragging');
        e.preventDefault();
      });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const c = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(c.width  - el.offsetWidth,  e.clientX - c.left - dx));
        const y = Math.max(0, Math.min(c.height - el.offsetHeight, e.clientY - c.top  - dy));
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        n.x = x; n.y = y;
        renderEdges();
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('dragging');
        save();
      });

      canvas.appendChild(el);
    };

    state.nodes.forEach(makeNode);
    requestAnimationFrame(renderEdges);

    /* 캔버스 더블클릭 → 새 노드 */
    canvas.addEventListener('dblclick', e => {
      if (e.target !== canvas && e.target !== svg) return;
      const c = canvas.getBoundingClientRect();
      const n = {
        id: 'n' + Date.now() + Math.floor(Math.random() * 999),
        x: e.clientX - c.left - 40,
        y: e.clientY - c.top  - 14,
        t: '메모'
      };
      state.nodes.push(n);
      save();
      makeNode(n);
    });

    /* 헤더 버튼 */
    map.querySelector('.pk-mm-add').addEventListener('click', () => {
      const c = canvas.getBoundingClientRect();
      const n = {
        id: 'n' + Date.now() + Math.floor(Math.random() * 999),
        x: 30 + Math.random() * (c.width - 160),
        y: 30 + Math.random() * (c.height - 80),
        t: '메모'
      };
      state.nodes.push(n);
      save();
      makeNode(n);
    });
    map.querySelector('.pk-mm-clear').addEventListener('click', () => {
      if (!confirm('이 글의 마인드맵을 모두 지울까요?')) return;
      state = { nodes: [], edges: [] };
      save();
      [...canvas.querySelectorAll('.pk-mm-node')].forEach(x => x.remove());
      renderEdges();
    });

    window.addEventListener('resize', renderEdges);
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
      font-family:'Press Start 2P',monospace;
    `;
    panel.innerHTML = `
      <div style="font-size:.36rem;color:#d42b2b;letter-spacing:1px;margin-bottom:10px;border-bottom:2px solid #1c2040;padding-bottom:6px;">⚙ TWEAKS</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:.27rem;color:#1c2040;flex:1;">WALKER</span>
        <button id="pk-next-walker" style="font-family:'Press Start 2P',monospace;font-size:.25rem;padding:3px 7px;border:2px solid #1c2040;background:#e8dfc8;cursor:pointer;box-shadow:2px 2px 0 #1c2040;">교체</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:.27rem;color:#1c2040;flex:1;">SHINY</span>
        <button id="pk-shiny-btn" style="font-family:'Press Start 2P',monospace;font-size:.25rem;padding:3px 7px;border:2px solid #1c2040;background:#e8dfc8;cursor:pointer;box-shadow:2px 2px 0 #1c2040;">OFF</button>
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
  const READ_FONT = "'PF Stardust','Pretendard','Noto Sans KR',sans-serif";
  const PIXEL_FONT = "'Press Start 2P',monospace";
  const PIXEL_SELECTORS = [
    '.pk-row-num',
    '#pk-stats-bar', '#pk-stats-bar *',
    '#pk-type-row', '#pk-type-row *',
    '#pk-hp-row', '#pk-hp-row *',
    '.pk-hp-label', '.pk-hp-num',
    '.pk-type', '.pk-nav-section',
    '#pk-tweaks', '#pk-tweaks *',
    '.eyebrow',
    '.pk-battle-lv', '.pk-battle-types', '.pk-battle-types *',
    '.pk-mindmap-header', '.pk-mindmap-header *',
    '.pk-mm-del', '.pk-mm-hint'
  ].join(',');

  function isPixelEl(el) {
    return el.matches && el.matches(PIXEL_SELECTORS);
  }
  function applyFont(el) {
    if (!el || el.nodeType !== 1) return;
    if (isPixelEl(el)) {
      el.style.setProperty('font-family', PIXEL_FONT, 'important');
    } else {
      el.style.setProperty('font-family', READ_FONT, 'important');
    }
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
     INIT
  ══════════════════════════════════════ */
  function init() {
    injectBrandMascot();
    injectNavSprites();
    injectNavSectionHeaders();

    const isArticlePage = !!document.querySelector('.timeline');
    if (isArticlePage) {
      injectPageHead();
      injectStatsBar();
      injectRowDecorations();
      injectRowNotes();
      injectDivider();
      fixCloseButtons();
      observeRows();
    }

    injectWalker();
    buildTweaksPanel();
    initTweaksProtocol();

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
