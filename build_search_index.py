#!/usr/bin/env python3
"""모든 섹터 폴더의 index.html에서 검색 인덱스 생성.
출력: search-index.json — [{folder, label, url, rowId, title, excerpt, body}]
"""
import json, os, re, html
from pathlib import Path

ROOT = Path(__file__).parent
EXCLUDE = {'ESG-A', 'ESG-C', 'fonts', 'scraps', 'screenshots', 'uploads'}

def strip_tags(s: str) -> str:
    s = re.sub(r'<script[\s\S]*?</script>', ' ', s, flags=re.I)
    s = re.sub(r'<style[\s\S]*?</style>', ' ', s, flags=re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

def parse_page(folder: Path):
    idx = folder / 'index.html'
    if not idx.exists(): return []
    src = idx.read_text(encoding='utf-8', errors='ignore')
    # find each card-row block
    out = []
    # use regex to find <div class="row" id="row-N"> ... </div> ... <div class="inline-article"> ... </div>
    # Simpler: split by '<div class="card-row"' or 'id="row-'
    # Strategy: find row id, capture title, excerpt, then find next inline-article block for body
    row_iter = list(re.finditer(r'<div class="row" id="(row-\d+)">', src))
    for i, m in enumerate(row_iter):
        rid = m.group(1)
        start = m.start()
        end = row_iter[i+1].start() if i+1 < len(row_iter) else len(src)
        block = src[start:end]
        title_m = re.search(r'<h3 class="row-title"[^>]*>(.*?)</h3>', block, flags=re.S)
        excerpt_m = re.search(r'<p class="row-excerpt"[^>]*>(.*?)</p>', block, flags=re.S)
        body_m = re.search(r'<div class="article-content">([\s\S]*?)</div>\s*</div>\s*</div>', block)
        title = strip_tags(title_m.group(1)) if title_m else ''
        excerpt = strip_tags(excerpt_m.group(1)) if excerpt_m else ''
        body = strip_tags(body_m.group(1)) if body_m else ''
        if not title: continue
        out.append({
            'folder': folder.name,
            'label': folder.name.replace('_', ' / '),
            'url': f"{folder.name}/index.html#{rid}",
            'rowId': rid,
            'title': title,
            'excerpt': excerpt[:300],
            'body': body[:1500],
        })
    return out

def main():
    items = []
    for d in sorted(ROOT.iterdir()):
        if not d.is_dir(): continue
        if d.name.startswith('.') or d.name in EXCLUDE: continue
        if not (d / 'index.html').exists(): continue
        items.extend(parse_page(d))
    out = ROOT / 'search-index.json'
    out.write_text(json.dumps(items, ensure_ascii=False), encoding='utf-8')
    print(f"wrote {len(items)} entries to {out} ({out.stat().st_size:,} bytes)")

if __name__ == '__main__':
    main()
