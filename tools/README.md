# tools

Scripts behind the site. Nothing here is published; GitHub Actions runs the build ones.

```
tools/
  site/                     runs on every build (.github/workflows/pages.yml)
    check-published.mjs       stops the build if a published post still says TK
    share-cards/              makes the og:image for every published post
      make-cards.py             renders the cards into assets/og/
      title-card.html           default card: title + kicker over contours
      card.css, card.js         shared look and logo
      contours.js               the homepage's contour generator
  posts/<slug>/             everything that belongs to one post
    share-card.html           optional custom share card (replaces the title card)
    ...                       that post's data scripts
```

- **waffle-house-weather/** `fetch-temps.mjs` refreshes the temperatures every 3 hours.
- **wild-turkey-comeback/** the BBS → PostGIS → map pipeline (see its README) and the map share card.
