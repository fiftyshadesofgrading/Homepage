# Notes for AI assistants working on this repo

## Blog voice
- Write posts in the author's first person: "I", "my". Not "we", "us" or "our".
- Keep posts anonymous: no personal names, home location, IP addresses, account or bucket names, client IDs, or employer references.
- Brand tone is playful; the subject is civil/CAD technology (Civil 3D at the core).

## Posts
- Text posts are Markdown in `_posts/` with front matter (title, date, published, description, kicker, tags). `published: false` = draft.
- Drafts may start with an HTML comment of TK notes. Pages CMS's rich-text editor may drop it, so don't rely on it surviving.
- Post assets go in `assets/posts/<slug>/`. Raw source data stays out of the repo; keep only scripts and small built outputs.
- Remove unused assets (especially images) when changing the site.

## Commits
- Author commits as `Fifty Shades of Grading <hello@fiftyshadesofgrading.com>`.
