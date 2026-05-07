/* pokemon-inject.js — 논술 리더 포켓몬 테마 DOM 주입 스크립트
   각 카테고리 index.html 하단에 <script src="../pokemon-inject.js"></script> 추가
*/
(function() {
  'use strict';

  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  const SP = n => `${BASE}${n}.png`;

  /* ── 카테고리 → 포켓몬 매핑 ── */
  const CAT_MAP = {
    'ESG':        { n: 1,   name: '이상해씨', types: [['grass','GRASS'],['poison','POISON']], lv: 42 },
    '가계':        { n: 113, name: '럭키',    types: [['normal','NORMAL']],                   lv: 38 },
    '고령문제':    { n: 113, name: '럭키',    types: [['normal','NORMAL']],                   lv: 38 },
    '금융문제':    { n: 54,  name: '야돈',    types: [['water','WATER'],['psychic','PSY']],    lv: 30 },
    '인력문제':    { n: 35,  name: '삐삐',    types: [['normal','NORMAL']],                   lv: 28 },
    '공급망':      { n: 248, name: '마기라스', types: [['rock','ROCK'],['dark','DARK']],       lv: 65 },
    '글로벌':      { n: 249, name: '루기아',  types: [['psychic','PSYCHIC'],['flying','FLY']], lv: 70 },
    '관세':        { n: 249, name: '루기아',  types: [['psychic','PSYCHIC']],                 lv: 70 },
    '외화':        { n: 130, name: '갸라도스', types: [['water','WATER'],['flying','FLY']],   lv: 58 },
    '금융업':      { n: 149, name: '망나뇽',  types: [['dragon','DRAGON'],['flying','FLY']], lv: 68 },
    '디지털':      { n: 137, name: '폴리곤',  types: [['normal','NORMAL']],                  lv: 35 },
    '코인':        { n: 137, name: '폴리곤',  types: [['normal','NORMAL']],                  lv: 35 },
    '벤처':        { n: 6,   name: '리자몽',  types: [['fire','FIRE'],['flying','FLY']],     lv: 60 },
    '창업':        { n: 4,   name: '파이리',  types: [['fire','FIRE']],                      lv: 25 },
    '투자':        { n: 6,   name: '리자몽',  types: [['fire','FIRE'],['flying','FLY']],     lv: 60 },
    '부동산':      { n: 79,  name: '야돈',    types: [['water','WATER'],['psychic','PSY']],  lv: 22 },
    '산업':        { n: 376, name: '메타그로스',types:[['steel','STEEL'],['psychic','PSY']], lv: 72 },
    '산업별':      { n: 130, name: '갸라도스', types: [['water','WATER'],['flying','FLY']], lv: 58 },
    'AI':          { n: 94,  name: '팬텀',    types: [['ghost','GHOST'],['poison','POISON']],lv: 50 },
    '가전':        { n: 100, name: '홍수몬',  types: [['electric','ELEC']],                  lv: 33 },
    '건설':        { n: 95,  name: '롱스톤',  types: [['rock','ROCK'],['ground','GRND']],    lv: 40 },
    '로봇':        { n: 376, name: '메타그로스',types:[['steel','STEEL'],['psychic','PSY']], lv: 72 },
    '바이오':      { n: 113, name: '럭키',    types: [['normal','NORMAL']],                  lv: 45 },
    '반도체':      { n: 94,  name: '팬텀',    types: [['ghost','GHOST']],                    lv: 55 },
    '방산':        { n: 248, name: '마기라스', types: [['rock','ROCK'],['dark','DARK']],     lv: 68 },
    '섬유':        { n: 12,  name: '버터플',  types: [['bug','BUG'],['flying','FLY']],       lv: 20 },
    '우주':        { n: 249, name: '루기아',  types: [['psychic','PSYCHIC'],['flying','FLY']],lv:70 },
    '원전':        { n: 77,  name: '포니타',  types: [['fire','FIRE']],                      lv: 38 },
    '유통':        { n: 143, name: '잠만보',  types: [['normal','NORMAL']],                  lv: 45 },
    '이차전지':    { n: 125, name: '에레브',  types: [['electric','ELEC']],                  lv: 50 },
    '자동차':      { n: 59,  name: '윈디',    types: [['fire','FIRE']],                      lv: 55 },
    '조선':        { n: 131, name: '라프라스', types: [['water','WATER'],['ice','ICE']],     lv: 48 },
    '항공':        { n: 17,  name: '피존투',  types: [['normal','NORMAL'],['flying','FLY']], lv: 32 },
    '화학':        { n: 89,  name: '질퍽왕',  types: [['poison','POISON']],                  lv: 42 },
    '시사':        { n: 151, name: '뮤',      types: [['psychic','PSYCHIC']],                lv: 80 },
    '자본시장':    { n: 243, name: '라이코',  types: [['electric','ELEC']],                  lv: 70 },
    '국장':        { n: 243, name: '라이코',  types: [['electric','ELEC']],                  lv: 70 },
    '채권':        { n: 131, name: '라프라스', types: [['water','WATER'],['ice','ICE']],     lv: 52 },
    '정책금융':    { n: 150, name: '뮤츠',    types: [['psychic','PSYCHIC']],                lv: 90 },
    '소상공인':    { n: 39,  name: '푸린',    types: [['normal','NORMAL']],                  lv: 18 },
    '중소기업':    { n: 52,  name: '나옹',    types: [['normal','NORMAL']],                  lv: 28 },
    '중동':        { n: 59,  name: '윈디',    types: [['fire','FIRE']],                      lv: 62 },
    '지역균형':    { n: 133, name: '이브이',  types: [['normal','NORMAL']],                  lv: 25 },
  };

  /* 사이드바 nav-item 포켓몬 매핑 */
  const NAV_MAP = [
    { text: 'ESG',   n: 1   },
    { text: '가계',  n: 113 },
    { text: '공급망',n: 248 },
    { text: '글로벌',n: 249 },
    { text: '금융업',n: 149 },
    { text: '디지털',n: 137 },
    { text: '벤처',  n: 6   },
    { text: '부동산',n: 79  },
    { text: '산업 과제',n:376},
    { text: '산업별',n: 130 },
    { text: '시사',  n: 151 },
    { text: '자본시장',n:243},
    { text: '정책금융',n:150},
    { text: '중동이슈',n:59 },
    { text: '지역균형',n:133},
    { text: '전체 카테고리', n: 25  },
    { text: '북마크', n: 143 },
    { text: 'PT',    n: 39  },
  ];

  /* 페이지 타이틀에서 카테고리 감지 */
  function detectCategory() {
    const title = document.title || '';
    // title에서 "카테고리명 — 논술 요약" 패턴으로 앞부분 추출
    const catName = title.split(/[—\-–|]/)[0].trim();
    // 직접 매칭 먼저
    if (CAT_MAP[catName]) return CAT_MAP[catName];
    // 부분 매칭
    for (const [key, val] of Object.entries(CAT_MAP)) {
      if (catName.includes(key) || key.includes(catName)) return val;
    }
    // URL 경로로도 시도
    const path = location.pathname;
    for (const [key, val] of Object.entries(CAT_MAP)) {
      if (path.includes(encodeURIComponent(key)) || path.includes(key)) return val;
    }
    return { n: 132, name: '메타몽', types: [['normal','NORMAL']], lv: 40 };
  }

  /* ────────────────────────────────
     1. 브랜드 마스코트 주입
  ──────────────────────────────── */
  function injectBrandMascot() {
    const brand = document.querySelector('.brand');
    if (!brand || document.getElementById('pk-brand-mascot')) return;
    const img = document.createElement('img');
    img.id = 'pk-brand-mascot';
    img.src = SP(133);
    img.alt = '이브이';
    brand.appendChild(img);
  }

  /* ────────────────────────────────
     2. 사이드바 nav-item 포켓몬 주입
  ──────────────────────────────── */
  function injectNavSprites() {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
      if (item.querySelector('.pk-nav-sprite')) return;
      const label = item.querySelector('span:first-child, .nav-label');
      const text = label ? label.textContent.trim() : item.textContent.trim();
      // 이모지·특수문자 제거 후 비교
      const cleanText = text.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g,'').trim();
      let matched = null;
      for (const m of NAV_MAP) {
        const cleanM = m.text.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g,'').trim();
        if (cleanText.includes(cleanM) || cleanM.includes(cleanText)) {
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

  /* ────────────────────────────────
     3. page-head 포켓몬 + HP바 + 타입 주입
  ──────────────────────────────── */
  function injectPageHead() {
    const head = document.querySelector('.page-head');
    if (!head || document.getElementById('pk-head-sprite-wrap')) return;
    const cat = detectCategory();

    // 스프라이트 래퍼
    const wrap = document.createElement('div');
    wrap.id = 'pk-head-sprite-wrap';
    const img = document.createElement('img');
    img.id = 'pk-head-sprite';
    img.src = SP(cat.n);
    img.alt = cat.name;
    wrap.appendChild(img);
    head.insertBefore(wrap, head.firstChild);

    // headInfo 래퍼 (eyebrow+h2+sub 묶기)
    const headInfo = document.createElement('div');
    headInfo.style.cssText = 'flex:1;min-width:0;';
    const existing = [...head.children].filter(c => c !== wrap);
    existing.forEach(c => headInfo.appendChild(c));
    head.appendChild(headInfo);

    // 타입 배지
    const typeRow = document.createElement('div');
    typeRow.style.cssText = 'display:flex;gap:5px;margin:6px 0 4px;';
    cat.types.forEach(([cls, label]) => {
      const span = document.createElement('span');
      span.className = `pk-type pk-type-${cls}`;
      span.textContent = label;
      typeRow.appendChild(span);
    });
    headInfo.appendChild(typeRow);

    // HP 바
    const total = cat.lv * 1.5 | 0;
    const hpPct = Math.min(100, Math.round((total / (total + 20)) * 100));
    const hpRow = document.createElement('div');
    hpRow.id = 'pk-hp-row';
    hpRow.innerHTML = `
      <span class="pk-hp-label">HP</span>
      <div class="pk-hp-track"><div class="pk-hp-fill" style="width:${hpPct}%"></div></div>
      <span class="pk-hp-num">${cat.lv}/${cat.lv + 20}</span>
    `;
    headInfo.appendChild(hpRow);
  }

  /* ────────────────────────────────
     4. stats bar 주입 (.content 아래, .topbar 다음)
  ──────────────────────────────── */
  function injectStatsBar() {
    if (document.getElementById('pk-stats-bar')) return;
    const head = document.querySelector('.page-head');
    if (!head) return;

    // 글 수 카운트
    const rowCount = document.querySelectorAll('.row').length;
    const filterCount = document.getElementById('filterCount');
    const countText = filterCount ? filterCount.textContent.replace(/[^0-9]/g,'') : rowCount;

    const bar = document.createElement('div');
    bar.id = 'pk-stats-bar';
    bar.innerHTML = `
      <div class="pk-stat-pill">
        <span class="pk-stat-val">${countText || rowCount}</span>
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

  /* ────────────────────────────────
     5. 글 펼침 battle banner 주입
  ──────────────────────────────── */
  function injectBattleBanner(article) {
    if (article.querySelector('#pk-battle-banner')) return;
    const row = article.previousElementSibling;
    if (!row) return;
    const title = row.querySelector('.row-title');
    const titleText = title ? title.textContent.trim() : '';

    // 카테고리에 맞는 포켓몬 선택
    const cat = detectCategory();
    // 글마다 다른 포켓몬 — 번호 기반 해시
    const hash = titleText.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
    const variants = [3,9,152,6,149,248,151,130,94,100,79,376,131,125,243];
    const pkmn = variants[hash % variants.length];

    const lv = 30 + (hash % 41);
    const hpPct = 40 + (hash % 55);

    const banner = document.createElement('div');
    banner.id = 'pk-battle-banner';
    banner.innerHTML = `
      <img class="pk-battle-sprite" src="${SP(pkmn)}" alt="">
      <div class="pk-battle-info">
        <div class="pk-battle-title">${titleText.length > 60 ? titleText.slice(0,60)+'…' : titleText}</div>
        <div class="pk-battle-lv">Lv.${lv} · ${cat.name}</div>
        <div style="display:flex;gap:4px;margin-bottom:6px;">
          ${cat.types.map(([cls,lbl])=>`<span class="pk-type pk-type-${cls}">${lbl}</span>`).join('')}
        </div>
        <div id="pk-hp-row" style="display:flex;align-items:center;gap:8px;">
          <span class="pk-hp-label">HP</span>
          <div class="pk-hp-track"><div class="pk-hp-fill" style="width:${hpPct}%"></div></div>
          <span class="pk-hp-num">${hpPct}/100</span>
        </div>
      </div>
    `;

    // inline-article 상단에 삽입 (::before 레인보우 바 다음)
    const iaBody = article.querySelector('.ia-title') || article.querySelector('.ia-kicker') || article.firstChild;
    if (iaBody) {
      article.insertBefore(banner, iaBody.closest('.ia-kicker') ? iaBody.closest('.ia-kicker') : iaBody);
    } else {
      article.prepend(banner);
    }
  }

  /* ────────────────────────────────
     6. 걷는 포켓몬 주입
  ──────────────────────────────── */
  function injectWalker() {
    if (document.getElementById('pk-walker')) return;
    const walkers = [25,133,1,4,7,9,39,143,54,52,35,94,130,149,151,6,3,248,79,137,59,150,243];
    const n = walkers[Math.floor(Math.random() * walkers.length)];
    const img = document.createElement('img');
    img.id = 'pk-walker';
    img.src = SP(n);
    img.alt = '';
    document.body.appendChild(img);
  }

  /* ────────────────────────────────
     7. inline-article 열릴 때 battle banner 주입
  ──────────────────────────────── */
  function observeArticles() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const row = m.target;
          if (row.classList.contains('expanded')) {
            const article = row.nextElementSibling;
            if (article && article.classList.contains('inline-article')) {
              setTimeout(() => injectBattleBanner(article), 50);
            }
          }
        }
      });
    });
    document.querySelectorAll('.row').forEach(row => {
      observer.observe(row, { attributes: true });
    });
  }

  /* ── INIT ── */
  function init() {
    injectBrandMascot();
    injectNavSprites();
    injectPageHead();
    injectStatsBar();
    injectWalker();
    observeArticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
