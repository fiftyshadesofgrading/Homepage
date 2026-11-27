# Notes for AI assistants working on this repo

## Blog voice
- Write posts in the author's first person: "I", "my". Not "we", "us" or "our".
- Keep posts anonymous: no personal names, home location, IP addresses, account or bucket names, client IDs, or employer references.
- Brand tone is playful; the subject is civil/CAD technology (Civil 3D at the core).

## Posts
- Text posts are Markdown in `_posts/` with front matter (title, date, published, description, kicker, tags). `published: false` = draft.
- Drafts may start with an HTML comment of TK notes. Pages CMS's rich-text editor may drop it, so don't rely on it surviving.
- Post assets go in `assets/posts/<slug>/`. Raw source data stays out of the repo; keep only scripts and small built outputs.
- Share images are built by GitHub Actions (`tools/og/auto.py`) into `assets/og/<slug>.png`, never committed. Every published post gets a title card automatically; for a custom card, add `tools/og/<slug>.html` (see `wild-turkey-comeback.html`). `image:` in front matter overrides both. Problems show as warnings on the Actions run, and the post falls back to the site card. After changing a card, re-run the URL through LinkedIn Post Inspector.
- Remove unused assets (especially images) when changing the site.

## Commits
- Author commits as `Fifty Shades of Grading <hello@fiftyshadesofgrading.com>`.
