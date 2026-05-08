#!/usr/bin/env python3
"""md/*.md 상단에서 발간일/발간기관/원제목 추출.

사용: python3 extract_meta.py <md_dir> <out_json>
"""
import json, re, sys, os
from pathlib import Path

# 기관 식별 패턴 (영문/한글 매핑)
ORG_MAP = [
    (r'Korea Institute of Finance|한국금융연구원|금융브리프', '한국금융연구원'),
    (r'KOREA CAPITAL MARKET INSTITUTE|자본시장연구원|자본시장포커스', '자본시장연구원'),
    (r'한국무역협회|국제무역통상연구원|TRADE FOCUS', '한국무역협회 국제무역통상연구원'),
    (r'산업연구원', '산업연구원'),
    (r'현대경제연구원|경제주평|현안과 과제', '현대경제연구원'),
    (r'KDB|산업은행|미래전략연구소|글로벌 이슈\s*\d', 'KDB미래전략연구소'),
    (r'한국은행', '한국은행'),
    (r'대외경제정책연구원|KIEP', '대외경제정책연구원'),
]

DATE_PATTERNS = [
    r'(20\d{2})\.\s*(\d{1,2})\.\s*(\d{1,2})',           # 2026.01.10
    r'(20\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일',          # 2026년 3월 27일
    r'발행일\s*(20\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일',
    r'(20\d{2})\.\s*(\d{1,2})\.\s*(\d{1,2})\.',         # 2025.11.14.
    r'_(\d{6,8})(?:[\._\s]|$)',                         # filename _250214 or _20251125
]

def normalize_date(s):
    """다양한 형식을 YYYY-MM-DD로."""
    s = s.strip().rstrip('.')
    m = re.match(r'^(20\d{2})[-./\s]+(\d{1,2})[-./\s]+(\d{1,2})$', s)
    if m:
        y, mo, d = m.groups()
        return f"{y}-{int(mo):02d}-{int(d):02d}"
    if re.match(r'^\d{8}$', s):
        return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
    if re.match(r'^\d{6}$', s):
        # YYMMDD
        y = '20' + s[:2]
        return f"{y}-{s[2:4]}-{s[4:6]}"
    return s

def extract(text, fname):
    # 헤더 영역 (1500자) + 이미지/br 제거
    head = text[:1500]
    head = re.sub(r'<br\s*/?>', '\n', head)
    head = re.sub(r'!\[image[^\]]*\]\([^)]*\)', '', head)
    head_pipe = re.sub(r'\|', ' ', head)

    # NotebookLM 에세이 감지 (소스 없음)
    is_essay = bool(re.search(r'^#\s+\S+.*\n+.*\n+##\s+제\s*\d+장\s+서론', text[:1000]))
    if is_essay:
        # 제목만 추출, 출처 없음
        m = re.match(r'^#\s+(.+)$', text.strip(), re.MULTILINE)
        title = m.group(1).strip() if m else None
        return {'org': None, 'date': None, 'title': title, 'is_essay': True}

    # 기관 (헤더 영역에서만)
    org = None
    for pat, name in ORG_MAP:
        if re.search(pat, head_pipe, re.IGNORECASE):
            org = name
            break

    # 날짜
    date = None
    for pat in DATE_PATTERNS[:4]:
        m = re.search(pat, head_pipe)
        if m:
            y, mo, d = m.groups()
            date = f"{y}-{int(mo):02d}-{int(d):02d}"
            break
    if not date:
        m = re.search(r'(\d{8})|_(\d{6})(?:\D|$)', fname)
        if m:
            raw = m.group(1) or m.group(2)
            date = normalize_date(raw)

    # 원제목 — 노이즈 단어 제외 강화
    NOISE_TITLES = {'OPINION', '글로벌 이슈', '금융브리프', 'TRADE FOCUS', '현안과 과제',
                    '목 차', '목차', '서 론', '서론', '본 론', '본론', '결 론', '결론',
                    '요 약', '요약', 'Executive Summary'}
    title = None
    for line in head.split('\n'):
        line = line.strip().lstrip('■▶◆●▼*').strip()
        if not line: continue
        m = re.match(r'^#{1,4}\s+(.+)$', line)
        if not m: continue
        t = m.group(1).strip().lstrip('■▶◆●▼*').strip()
        if len(t) < 8: continue
        if t in NOISE_TITLES: continue
        if any(t.startswith(n) for n in NOISE_TITLES): continue
        if re.match(r'^\d', t): continue
        title = t
        break

    # 헤더 안에서 # 못 찾으면 굵은 본문 라인
    if not title:
        for line in head.split('\n'):
            line = line.strip()
            if 12 <= len(line) <= 80 and re.search(r'(분석|시사점|평가|전망|방향|과제|점검|영향|배경)', line):
                if not re.match(r'^[#|\-\*\d]', line):
                    title = line
                    break

    return {'org': org, 'date': date, 'title': title, 'is_essay': False}

def main():
    if len(sys.argv) != 3:
        print("usage: extract_meta.py <md_dir> <out_json>", file=sys.stderr)
        sys.exit(1)
    md_dir = Path(sys.argv[1])
    out = {}
    for f in sorted(md_dir.glob('*.md')):
        text = f.read_text(encoding='utf-8', errors='ignore')
        meta = extract(text, f.stem)
        out[f.stem] = meta
        print(f"{f.stem}\n  org: {meta['org']}\n  date: {meta['date']}\n  title: {meta['title']}\n")
    Path(sys.argv[2]).write_text(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
