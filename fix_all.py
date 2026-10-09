"""
fix_all.py — Fix portfolio issues:
  1. Replace dead trycloudflare URLs
  2. Renumber project cards 01-14
  3. Delete duplicate V13b CSS block
  4. Remove duplicate copyEmail handler from portfolio.js
  5. Regenerate sitemap.xml
"""

import re
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(r"C:\_zannii_clean")
stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

# ============================================================
# BACKUP
# ============================================================
backup_dir = ROOT / f"_fix_backup_{stamp}"
backup_dir.mkdir(exist_ok=True)
for f in ["index.html", "css/styles.css", "js/portfolio.js", "js/theme.js", "sitemap.xml"]:
    src = ROOT / f
    if src.exists():
        dst = backup_dir / Path(f).name
        shutil.copy2(src, dst)
print(f"[backup] saved originals to {backup_dir.name}")

# ============================================================
# FIX 1 — Replace dead tunnel URLs
# ============================================================
print("\n[1/5] Replacing dead trycloudflare URLs...")

index_path = ROOT / "index.html"
src = index_path.read_text(encoding="utf-8")

# URL Shortener
src = src.replace(
    '<a class="text-link primary-link" href="https://appeared-christopher-dana-tutorials.trycloudflare.com/" rel="noopener" target="_blank">View Live Demo &nearr;</a>',
    '<a class="text-link primary-link" href="https://github.com/Zannii34/url-shortener" rel="noopener" target="_blank">View Code on GitHub ↗</a>'
)

# Receipt Scanner
src = src.replace(
    '<a class="text-link primary-link" href="https://citations-wit-stuff-cartridge.trycloudflare.com/" rel="noopener" target="_blank">View Live App &nearr;</a>',
    '<a class="text-link primary-link" href="https://github.com/Zannii34/receipt-scanner" rel="noopener" target="_blank">View Code on GitHub ↗</a>'
)

# PyServe
src = src.replace(
    '<a class="text-link primary-link" href="https://few-effective-phoenix-league.trycloudflare.com" rel="noopener" target="_blank">View Live Demo &nearr;</a>',
    '<a class="text-link primary-link" href="https://github.com/Zannii34/pyserve" rel="noopener" target="_blank">View Code on GitHub ↗</a>'
)

# Also swap the status badges from "LIVE" to something honest
src = src.replace(
    '<span class="status-badge live">LIVE PRODUCTION</span><span class="project-num">06</span></div><h3>URL Shortener with Analytics</h3>',
    '<span class="status-badge showcase">OPEN SOURCE</span><span class="project-num">09</span></div><h3>URL Shortener with Analytics</h3>'
)
src = src.replace(
    '<span class="status-badge live">LIVE ON RENDER</span><span class="project-num">10</span></div><h3>Receipt Scanner with VAT Tracking</h3>',
    '<span class="status-badge showcase">OPEN SOURCE</span><span class="project-num">10</span></div><h3>Receipt Scanner with VAT Tracking</h3>'
)
src = src.replace(
    '<span class="status-badge live">LIVE</span><span class="project-num">12</span></div><h3>PyServe  HTTP Server from Scratch</h3>',
    '<span class="status-badge showcase">OPEN SOURCE</span><span class="project-num">12</span></div><h3>PyServe — HTTP Server from Scratch</h3>'
)

print("  Replaced 3 dead tunnel URLs with GitHub code links")
print("  Swapped 3 'LIVE' badges to 'OPEN SOURCE'")

# ============================================================
# FIX 2 — Renumber project cards sequentially (01-14)
# ============================================================
print("\n[2/5] Renumbering project cards...")

# Find all project-num spans in order and renumber them
lines = src.split("\n")
counter = 0
for i, line in enumerate(lines):
    if '<span class="project-num">' in line:
        counter += 1
        new_num = f"{counter:02d}"
        line = re.sub(
            r'<span class="project-num">\d+</span>',
            f'<span class="project-num">{new_num}</span>',
            line
        )
        lines[i] = line

src = "\n".join(lines)
print(f"  Renumbered {counter} project cards (01-{counter:02d})")

index_path.write_text(src, encoding="utf-8")

# ============================================================
# FIX 3 — Delete duplicate V13b CSS block
# ============================================================
print("\n[3/5] Removing duplicate V13b CSS block...")

css_path = ROOT / "css" / "styles.css"
css_src = css_path.read_text(encoding="utf-8")

# The duplicate starts with "/* V13b - NUKE dark backgrounds in light mode */"
# and ends just before EOF (they're back-to-back).
marker = "/* V13b - NUKE dark backgrounds in light mode */"
occurrences = [m.start() for m in re.finditer(re.escape(marker), css_src)]

if len(occurrences) == 2:
    # Remove everything from the second occurrence onward,
    # but keep the very end intact if there's a trailing comment
    first_end = css_src.find("}", occurrences[1] - 100)
    # Simpler approach: split at second marker and keep everything up to it
    css_src = css_src[:occurrences[1]].rstrip() + "\n"
    css_path.write_text(css_src, encoding="utf-8")
    print("  Removed second V13b block")
elif len(occurrences) == 1:
    print("  Only one V13b block found, nothing to remove")
else:
    print(f"  WARNING: found {len(occurrences)} V13b markers, skipping")

# ============================================================
# FIX 4 — Remove duplicate copyEmail handler from portfolio.js
# ============================================================
print("\n[4/5] Removing duplicate copyEmail handler...")

js_path = ROOT / "js" / "portfolio.js"
js_src = js_path.read_text(encoding="utf-8")

# Find and remove the copyEmail block in portfolio.js
# It's between "/* ---------- COPY EMAIL BUTTON ---------- */"
# and the next "/* ----------"
start_marker = "/* ---------- COPY EMAIL BUTTON ---------- */"
end_marker = "/* ---------- BACK TO TOP BUTTON ---------- */"

if start_marker in js_src and end_marker in js_src:
    start_idx = js_src.index(start_marker)
    end_idx = js_src.index(end_marker)
    js_src = js_src[:start_idx] + js_src[end_idx:]
    js_path.write_text(js_src, encoding="utf-8")
    print("  Removed copyEmail handler from portfolio.js (kept in theme.js)")
else:
    print("  WARNING: could not find copyEmail block markers")

# ============================================================
# FIX 5 — Regenerate sitemap.xml
# ============================================================
print("\n[5/5] Regenerating sitemap.xml...")

# Discover all case studies
case_studies = sorted((ROOT / "case-studies").glob("*.html"))
# Discover showcase projects
showcases = sorted((ROOT / "projects").glob("*/index.html"))

base = "https://zannii34.github.io"

sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
           f'<url><loc>{base}/</loc><priority>1.0</priority></url>',
           f'<url><loc>{base}/cv.html</loc><priority>0.8</priority></url>']

for cs in case_studies:
    sitemap.append(f'<url><loc>{base}/case-studies/{cs.name}</loc><priority>0.6</priority></url>')

for sc in showcases:
    name = sc.parent.name
    sitemap.append(f'<url><loc>{base}/projects/{name}/</loc><priority>0.5</priority></url>')

sitemap.append('</urlset>')

(ROOT / "sitemap.xml").write_text("\n".join(sitemap), encoding="utf-8")
print(f"  Wrote sitemap with {len(case_studies)} case studies + {len(showcases)} showcases")

print("\n=== Done ===")
print(f"Backup: {backup_dir}")
print("Review the changes with: git diff")
print("Then commit: git add -A && git commit -m 'Fix: dead URLs, duplicate CSS, project numbering, sitemap'")