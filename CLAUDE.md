# Notes for AI assistants working on this repo

## Blog voice
- Write posts in the author's first person: "I", "my". Not "we", "us" or "our".
- Keep posts anonymous: no personal names, home location, IP addresses, account or bucket names, client IDs, or employer references.
- Brand tone is playful; the subject is civil/CAD technology (Civil 3D at the core).

## Posts
- Text posts are Markdown in `_posts/` with front matter (title, date, published, description, kicker, tags). `published: false` = draft.
- Drafts may start with an HTML comment of TK notes. Pages CMS's rich-text editor may drop it, so don't rely on it surviving.
- Post assets go in `assets/posts/<slug>/`. Raw source data stays out of the repo; keep only scripts and small built outputs.
- Share image: set `image:` in front matter (1200x630 PNG, usually `assets/posts/<slug>/og.png`); posts without one fall back to `/og-image.png`. Cards are HTML in `tools/og/`, rendered with `python3 tools/og/shoot.py tools/og/<slug>.html`. After changing one, re-run the URL through LinkedIn Post Inspector.
- Remove unused assets (especially images) when changing the site.

## Commits
- Author commits as `Fifty Shades of Grading <hello@fiftyshadesofgrading.com>`.
