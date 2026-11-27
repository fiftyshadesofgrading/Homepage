"""Render a share card (og:image) to PNG.

    python3 tools/og/shoot.py tools/og/<slug>.html            -> assets/posts/<slug>/og.png
    python3 tools/og/shoot.py tools/og/<slug>.html out.png

Needs Playwright (pip install playwright && playwright install chromium).
Then set `image: /assets/posts/<slug>/og.png` in the post's front matter and
re-run the URL through https://www.linkedin.com/post-inspector/ before sharing.
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

src = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path(__file__).resolve().parents[2]
out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else root / "assets" / "posts" / src.stem / "og.png"

with sync_playwright() as p:
    try:
        browser = p.chromium.launch()
    except Exception:
        browser = p.chromium.launch(channel="chrome")  # fall back to an installed Chrome
    page = browser.new_page(viewport={"width": 1200, "height": 630})
    page.goto(src.as_uri())
    page.wait_for_load_state("networkidle")
    page.evaluate("document.fonts.ready")
    page.locator(".card").screenshot(path=str(out))
    browser.close()
print(f"wrote {out}")
