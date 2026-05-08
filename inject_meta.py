#!/usr/bin/env python3
"""사이트 index.html의 각 row inline-article에 메타데이터 블록 주입.

매핑 전략:
- 같은 폴더 내 site index.html의 각 row excerpt와 summary 파일들의 본문을 비교
- N-gram(2-3 글자) 기반 자카드 유사도로 best match 선택
- 임계치 이하 매칭은 출처 미상으로 둠
"""
import json, re, sys
from pathlib import Path
from html import unescape

def ngrams(text, n=2):
    text = re.sub(r'[\s\W]+', '', text)
    return set(text[i:i+n] for i in range(len(text)-n+1))

def jaccard(a, b):
    if not a or not b: return 0
    return len(a & b) / len(a | b)

def load_summaries(summary_dir, md_dir):
    """summary 파일별로 본문 ngram + 그에 대응하는 md/ 메타 추출."""
    sys.path.insert(0, str(Path(__file__).parent))
    from extract_meta import extract
    summaries = []
    for sf in sorted(Path(summary_dir).glob('*_summary.md')):
        stem = sf.stem.replace('_summary', '')
        body = sf.read_text(encoding='utf-8', errors='ignore')
        # md 파일 매칭
        md_path = Path(md_dir) / f"{stem}.md"
        meta = None
        if md_path.exists():
            meta = extract(md_path.read_text(encoding='utf-8', errors='ignore'), stem)
        else:
            # 파일명 약간 변형 시도
            for cand in Path(md_dir).glob('*.md'):
                if cand.stem.replace(' ', '').replace('_','') == stem.replace(' ','').replace('_',''):
                    meta = extract(cand.read_text(encoding='utf-8', errors='ignore'), cand.stem)
                    break
        summaries.append({
            'file': sf.name,
            'stem': stem,
            'ngrams': ngrams(body),
            'meta': meta or {'org': None, 'date': None, 'title': None, 'is_essay': False},
        })
    return summaries

def extract_rows(html):
    """index.html에서 각 row id, excerpt + inline-article 본문 추출."""
    rows = []
    # row 시작점들로 split
    parts = re.split(r'(?=<div class="row" id="row-\d+">)', html)
    for p in parts:
        m = re.match(r'<div class="row" id="(row-\d+)">', p)
        if not m: continue
        rid = m.group(1)
        # 다음 <div class="row" 직전까지 (또는 끝)
        next_idx = p.find('<div class="row" id="row-', 10)
        chunk = p if next_idx < 0 else p[:next_idx]
        em = re.search(r'<p class="row-excerpt">(.*?)</p>', chunk, re.DOTALL)
        excerpt = unescape(re.sub(r'<[^>]+>', '', em.group(1))) if em else ''
        body = unescape(re.sub(r'<[^>]+>', ' ', chunk))
        rows.append({'id': rid, 'excerpt': excerpt, 'body': body})
    return rows

def build_meta_block(meta):
    """주입할 HTML 블록 생성."""
    parts = []
    if meta.get('org'):
        parts.append(meta['org'])
    if meta.get('date'):
        parts.append(meta['date'])
    line1 = ' · '.join(parts) if parts else None
    title = meta.get('title')

    if not line1 and not title:
        return None  # 메타 없음 — 주입 안 함

    html_parts = ['<div class="ia-source" style="margin:8px 0 14px;padding:8px 12px;background:#f4f1e0;border-left:3px solid #1c2040;font-size:.82rem;color:#1c2040;line-height:1.5;">']
    if line1:
        html_parts.append(f'<span style="opacity:.75;">📄 {line1}</span>')
    if title:
        html_parts.append(f'<div style="margin-top:2px;"><strong>원제:</strong> {title}</div>')
    html_parts.append('</div>')
    return ''.join(html_parts)

def inject(html, mapping):
    """row-id → meta_block dict로 ia-title 다음에 주입."""
    out = html
    for row_id, block in mapping.items():
        if not block: continue
        # 해당 row의 inline-article 안 ia-title 다음에 삽입
        # row-N 다음의 inline-article 패턴 찾기
        pattern = re.compile(
            rf'(<div class="row" id="{row_id}">.*?<div class="inline-article">.*?<h2 class="ia-title">[^<]*</h2>)',
            re.DOTALL
        )
        # 이미 ia-source가 있으면 교체
        if re.search(rf'<div class="row" id="{row_id}">.*?<div class="ia-source"[^>]*>.*?</div>', out, re.DOTALL):
            old = re.search(rf'(<div class="row" id="{row_id}">.*?)<div class="ia-source"[^>]*>.*?</div>', out, re.DOTALL)
            if old:
                out = out.replace(old.group(0), old.group(1) + block, 1)
        else:
            out = pattern.sub(lambda m: m.group(1) + '\n' + block, out, count=1)
    return out

def main():
    if len(sys.argv) != 4:
        print("usage: inject_meta.py <site_index.html> <summary_dir> <md_dir>", file=sys.stderr)
        sys.exit(1)
    site_path = Path(sys.argv[1])
    summary_dir = sys.argv[2]
    md_dir = sys.argv[3]

    html = site_path.read_text(encoding='utf-8')
    rows = extract_rows(html)
    summaries = load_summaries(summary_dir, md_dir)

    print(f"site rows: {len(rows)}, summaries: {len(summaries)}\n")

    # 1:1 그리디 매칭 (점수 임계 없이 가장 잘 맞는 것)
    mapping = {}
    used = set()
    # 모든 (row, summary) 쌍 점수 계산 후 점수 내림차순으로 배정
    pairs = []
    for r in rows:
        rg = ngrams(r['body'])
        for i, s in enumerate(summaries):
            pairs.append((jaccard(rg, s['ngrams']), r['id'], i))
    pairs.sort(reverse=True)
    assigned_rows = set()
    chosen = {}
    for score, rid, idx in pairs:
        if rid in assigned_rows or idx in used: continue
        if score < 0.005: continue  # 거의 무관
        chosen[rid] = (score, idx, summaries[idx])
        assigned_rows.add(rid)
        used.add(idx)

    for r in rows:
        if r['id'] in chosen:
            score, idx, s = chosen[r['id']]
            block = build_meta_block(s['meta'])
            mapping[r['id']] = block
            tag = '✅' if block else 'ℹ️'
            print(f"{tag} {r['id']} (j={score:.3f}) → {s['stem']}  | {s['meta'].get('title') or '(제목 없음)'}")
        else:
            mapping[r['id']] = None
            print(f"❌ {r['id']} → 매칭 실패")

    new_html = inject(html, mapping)
    site_path.write_text(new_html, encoding='utf-8')
    print(f"\n주입 완료: {site_path}")

if __name__ == '__main__':
    main()
