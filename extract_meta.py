#!/usr/bin/env python3
"""md/*.md 상단에서 발간일/발간기관/원제목 추출.

사용: python3 extract_meta.py <md_dir> <out_json>
"""
import json, re, sys, os
from pathlib import Path

# 기관 식별 패턴 (영문/한글 매핑)
ORG_MAP = [
    (r'Korea Institute of Finance|한국금융연구원|금융브리프|02-3705|\(3705-\d{4}\)', '한국금융연구원'),
    (r'KOREA CAPITAL MARKET INSTITUTE|자본시장연구원|자본시장포커스', '자본시장연구원'),
    (r'한국무역협회|국제무역통상연구원|TRADE FOCUS', '한국무역협회 국제무역통상연구원'),
    (r'산업연구원|KIET|산\s업\s경\s제\s분\s석|산\s업\s포\s커\s스|i-KIET', '산업연구원'),
    (r'현대경제연구원|경제주평|현안과 과제|통권\s*\d{3,4}\s*호', '현대경제연구원'),
    (r'kita\.or\.kr|TRADE BRIEF', '한국무역협회 국제무역통상연구원'),
    (r'Deloitte\s+Insights|Deloitte\s+Korea', 'Deloitte Korea'),
    (r'산은조사월보|\d{3,4}호\)\s*이슈분석', 'KDB산업은행 미래전략연구소'),
    (r'기획재정부', '기획재정부'),
    (r'금융위원회', '금융위원회'),
    (r'POSRI|포스코경영연구원', '포스코경영연구원'),
    (r'삼정KPMG|KPMG\s*경제연구원', '삼정KPMG 경제연구원'),
    (r'Hana Financial Focus|하나금융그룹|하나금융경영연구소|하나Knowledge', '하나금융경영연구소'),
    (r'한국광해광업공단', '한국광해광업공단'),
    (r'국토교통부|국토연구원', '국토연구원'),
    (r'에너지경제연구원|KEEI', '에너지경제연구원'),
    (r'한국노동연구원|KLI', '한국노동연구원'),
    (r'한국법제연구원', '한국법제연구원'),
    (r'한국조세재정연구원|KIPF', '한국조세재정연구원'),
    (r'한국보건사회연구원|KIHASA', '한국보건사회연구원'),
    (r'정보통신정책연구원|KISDI', '정보통신정책연구원'),
    (r'과학기술정책연구원|STEPI', '과학기술정책연구원'),
    (r'금융결제원', '금융결제원'),
    (r'한국금융신문|한국경제신문|매일경제', None),  # 신문기사 — 출처표기 안 함
    (r'중소벤처기업연구원|KOSI', '중소벤처기업연구원'),
    (r'삼일\s*PwC\s*경영연구원|삼일PwC', '삼일PwC경영연구원'),
    (r'한국개발연구원|KDI(?![A-Za-z])', '한국개발연구원(KDI)'),
    (r'국제금융센터|KCIF', '국제금융센터'),
    (r'수출입은행\s*해외경제연구소|한국수출입은행', '한국수출입은행 해외경제연구소'),
    (r'대외경제정책연구원|KIEP', '대외경제정책연구원'),
    (r'김앤장\s*ESG경영연구소', '김앤장 ESG경영연구소'),
    (r'한국경제인협회|전경련', '한국경제인협회'),
    (r'하나금융경영연구소|하나Knowledge', '하나금융경영연구소'),
    (r'우리금융경영연구소', '우리금융경영연구소'),
    (r'IBK경제연구소|IBK기업은행 경제연구소', 'IBK경제연구소'),
    (r'한국신용평가', '한국신용평가'),
    (r'NICE신용평가|나이스신용평가', 'NICE신용평가'),
    (r'산은조사월보|산은\s*경제연구소|KDB미래전략연구소|글로벌 이슈\s*\d|KDB산업은행', 'KDB미래전략연구소'),
    (r'Bank of Korea|한국은행', '한국은행'),
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
    is_essay = bool(re.search(r'^#\s+\S+.*\n+.*\n+##\s+제\s*\d+장\s+서론', text[:1000])) \
        or bool(re.search(r'소스\s*1개\s*[·•]\s*20\d{2}', text[:500])) \
        or bool(re.search(r'산업은행 면접[·•]논술 대비를 위해', text[:1500]))
    if is_essay:
        # 제목만 추출, 출처 없음
        m = re.match(r'^#\s+(.+)$', text.strip(), re.MULTILINE)
        title = m.group(1).strip() if m else None
        return {'org': None, 'date': None, 'title': title, 'is_essay': True}

    # 기관 (헤더 + 파일명에서)
    org = None
    search_zone = head_pipe + ' ' + fname
    for pat, name in ORG_MAP:
        if re.search(pat, search_zone, re.IGNORECASE):
            org = name
            break

    # 날짜 — 1) 파일명 YYYYMMDD 우선 2) 헤더 상단 400자 매칭
    date = None
    m = re.search(r'(?<!\d)(20\d{6})(?!\d)', fname)
    if m:
        date = normalize_date(m.group(1))
    if not date:
        # 헤더 상단 400자만 검색 (본문 인용 날짜 회피)
        head_top = head_pipe[:400]
        for pat in DATE_PATTERNS[:4]:
            m = re.search(pat, head_top)
            if m:
                y, mo, d = m.groups()
                date = f"{y}-{int(mo):02d}-{int(d):02d}"
                break
    if not date:
        # 파일명 _YYMMDD
        m = re.search(r'_(\d{6})(?:\D|$)', fname)
        if m:
            date = normalize_date(m.group(1))

    # 원제목 — 노이즈 단어 제외 강화
    NOISE_TITLES = {'OPINION', '글로벌 이슈', '금융브리프', 'TRADE FOCUS', '현안과 과제',
                    '목 차', '목차', '서 론', '서론', '본 론', '본론', '결 론', '결론',
                    '요 약', '요약', 'Executive Summary', 'Issue Analysis', 'ISSUE REPORT',
                    'ISSUE BRIEF', '현안분석', '이슈분석', '이슈리포트', '포커스', 'FOCUS',
                    '경제주평', '주간 경제 동향', '경제동향', 'Highlight', '연구보고서',
                    '산 업 경 제 분 석', '산업경제분석', '산업분석', '동향분석',
                    '해 외 산 업 이 슈 점 검', '해외산업이슈점검', '내 생각',
                    '추가 인사이트', '정책적 방향성', '해결방안', '제언'}
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
        if t.startswith('[') or '/' in t and t.count('/') >= 2: continue
        # 별표/공백/특수문자만으로 끝나면 다듬기
        t = t.rstrip('*').rstrip()
        if len(t) < 8: continue
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
