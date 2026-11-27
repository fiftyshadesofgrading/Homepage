"""Make sure every published post has a share image (og:image) before the site builds.

- A post with `image:` in its front matter keeps it (warns if that file is missing).
- A post with its own card page, tools/og/<slug>.html, gets that rendered.
- Every other published post gets a title card from tools/og/title-card.html
  (text over a contour plan from tools/og/contours.js, seeded by the slug so it is stable).
- Output: assets/og/<slug>.png, built in CI and not committed; _layouts/default.html points there.
  _data/og.yml gets a short hash per card, added to the image URL (?v=) so LinkedIn and
  friends re-fetch a card when it changes instead of reusing their cached copy.
- Drafts (`published: false`) and future-dated posts are skipped.
- Problems are reported as a warning note, never a failed build. A post whose card can't be
  rendered gets a copy of the site card (/og-image.png), so it always has an image.

Usage: python3 tools/og/auto.py   (needs: pip install playwright pyyaml; uses the installed Chrome)
Runs in .github/workflows/pages.yml; run it locally only to preview cards.
"""
import datetime as dt
import hashlib
import pathlib
import re
import shutil
import zoneinfo

import yaml
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
POSTS = ROOT / "_posts"
OUT = ROOT / "assets" / "og"
TEMPLATE = ROOT / "tools" / "og" / "title-card.html"
TZ = zoneinfo.ZoneInfo(yaml.safe_load((ROOT / "_config.yml").read_text()).get("timezone", "UTC"))
NOW = dt.datetime.now(TZ)

errors, todo, custom = [], [], []
for f in sorted(POSTS.iterdir()):
    m = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.(md|markdown|html)$", f.name)
    if not m:
        continue
    fm = re.match(r"---\r?\n(.*?)\r?\n---", f.read_text(encoding="utf-8"), re.S)
    meta = (yaml.safe_load(fm.group(1)) if fm else None) or {}
    if meta.get("published") is False:
        continue
    when = meta.get("date") or dt.date.fromisoformat(m.group(1))
    if not isinstance(when, dt.datetime):
        when = dt.datetime.combine(when, dt.time())
    if (when if when.tzinfo else when.replace(tzinfo=TZ)) > NOW:
        continue
    if meta.get("image"):
        img = str(meta["image"])
        if not img.startswith("http") and not (ROOT / img.lstrip("/")).is_file():
            errors.append(f"{f.name}: image {img} does not exist")
        custom.append(f.name)
        continue
    if not meta.get("title"):
        errors.append(f"{f.name}: no title, so no title card")
        continue
    todo.append((m.group(2), str(meta["title"]), str(meta.get("kicker") or "")))

if todo:
    OUT.mkdir(parents=True, exist_ok=True)
    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(channel="chrome")
            except Exception:
                browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1200, "height": 630})
            title_page = None
            for slug, title, kicker in todo:
                try:
                    own = TEMPLATE.parent / f"{slug}.html"
                    if own.is_file():  # hand-made card for this post
                        page.goto(own.as_uri())
                        page.wait_for_load_state("networkidle")
                        title_page = None
                    else:
                        if title_page is None:
                            page.goto(TEMPLATE.as_uri())
                            page.wait_for_load_state("networkidle")
                            title_page = True
                        page.evaluate("document.fonts.ready")
                        fit = page.evaluate("([t, k, s]) => window.fill(t, k, s)", [title, kicker, slug])
                        if fit["lines"] > 4:
                            errors.append(f"{slug}: title is long; card text may be cramped")
                    page.evaluate("document.fonts.ready")
                    page.locator(".card").screenshot(path=str(OUT / f"{slug}.png"))
                except Exception as e:  # noqa: BLE001
                    errors.append(f"{slug}: card failed ({e}); using the site card")
                    title_page = None
            browser.close()
    except Exception as e:  # noqa: BLE001
        errors.append(f"browser failed ({e}); using the site card for all title cards")
    for slug, *_ in todo:  # anything not rendered gets the site card
        if not (OUT / f"{slug}.png").is_file():
            shutil.copyfile(ROOT / "og-image.png", OUT / f"{slug}.png")

if todo:  # version each card by its content
    DATA = ROOT / "_data"
    DATA.mkdir(exist_ok=True)
    versions = {slug: hashlib.sha1((OUT / f"{slug}.png").read_bytes()).hexdigest()[:10] for slug, *_ in todo}
    (DATA / "og.yml").write_text(yaml.safe_dump(versions, sort_keys=True))

print(f"Share images: {len(custom)} from front matter, {len(todo)} built into assets/og/")
for slug, *_ in todo:
    kind = "own card" if (TEMPLATE.parent / f"{slug}.html").is_file() else "title card"
    print(f"  {kind}: {slug}")
for e in errors:
    print(f"::warning title=Share image::{e}")
