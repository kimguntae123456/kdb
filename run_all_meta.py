#!/usr/bin/env python3
"""모든 섹터 폴더 일괄 처리."""
import subprocess, sys
from pathlib import Path

SOURCE_BASE = Path('/Users/pc/Downloads/피티/논술')
SITE_BASE = Path('/Users/pc/Downloads/논술/통합')

# 소스 (X/Y or X) → 사이트 폴더명 매핑
def src_to_site(rel_path):
    # rel_path: 'X/Y' or 'X'
    s = rel_path.replace(' ', '_').replace('/', '_')
    return s

def find_pairs():
    pairs = []
    for md_dir in SOURCE_BASE.rglob('md'):
        if not md_dir.is_dir(): continue
        rel = md_dir.parent.relative_to(SOURCE_BASE)
        rel_str = str(rel)
        summary_dir = md_dir.parent / 'summary'
        if not summary_dir.exists(): continue
        site_name = src_to_site(rel_str)
        site_dir = SITE_BASE / site_name
        if not site_dir.exists() or not (site_dir / 'index.html').exists():
            print(f"  ⚠️ 사이트 폴더 없음: {site_name} (소스: {rel_str})")
            continue
        pairs.append((rel_str, site_dir, summary_dir, md_dir))
    return pairs

def main():
    pairs = find_pairs()
    print(f"\n총 {len(pairs)}개 폴더 처리 예정\n")
    ok, fail = 0, 0
    for src, site, summary, md in pairs:
        print(f"\n=== {src} → {site.name} ===")
        try:
            r = subprocess.run(
                ['python3', str(SITE_BASE / 'inject_meta.py'),
                 str(site / 'index.html'), str(summary), str(md)],
                capture_output=True, text=True, timeout=120
            )
            if r.returncode == 0:
                # 마지막 몇 줄만 출력
                lines = r.stdout.strip().split('\n')
                print('\n'.join(lines[-5:]))
                ok += 1
            else:
                print(f"  ❌ 실패: {r.stderr[:300]}")
                fail += 1
        except Exception as e:
            print(f"  ❌ 예외: {e}")
            fail += 1
    print(f"\n\n완료: {ok} 성공 / {fail} 실패")

if __name__ == '__main__':
    main()
