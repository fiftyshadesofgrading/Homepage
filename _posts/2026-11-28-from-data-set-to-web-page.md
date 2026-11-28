---
published: true
date: 2026-11-28
title: "From dataset to web page: how I publish a data post"
description: "The repeatable recipe behind the Waffle House and wild turkey maps: find the data, shape it with SQL, draw it with plain HTML, publish it with Jekyll, and the mistakes I made along the way."
kicker: "Behind the scenes"
tags: [data, maps, jekyll, sql, workflow]
---

The first two data posts on this blog were a [live temperature map of every Waffle House]({{ '/blog/2026/11/17/waffle-house-weather/' | relative_url }}) and [sixty years of wild turkey counts]({{ '/blog/2026/11/26/wild-turkey-comeback/' | relative_url }}). One is silly, one is a real federal dataset, and both went from "huh, I wonder" to a published page in about a day. Here’s the recipe, so you can try it yourself and I never have to relearn the hard parts.

## The short version

- **Find data with coordinates, a story, and a license you can live with.** Check the date, the license, and the size before you commit to it.
- **Keep the raw files out of the repo.** The website receives required scripts and small data outputs as requested. The 66 MB download stays on my own storage.
- **Shape it with SQL** until it's only what the page needs. Millions of rows in, a few thousand out. 
- **Draw it with plain SVG, CSS and a little JavaScript.** Project the coordinates once, ahead of time, and skip the map library.
- **Publish it with Jekyll on GitHub Pages**, and let code (tiny GitHub hamsters) check my work before anything goes live.

## 1. Find a dataset worth exploring

A good map dataset has three things: coordinates (or something you can geocode), a question worth asking, and a license that lets you publish what you make.

The Waffle House locations came from a public CSV on GitHub, a snapshot from a specific month. That date is important to tuck away; stores open and close, so the post says how old the data is.

The Thanksgiving post taught me a better lesson. I went looking for wild turkey numbers from the agency I assumed would have them, and it doesn't publish them. Turkeys are managed by the states. Who knew!? The long-running federal record turned out to be the USGS **North American Breeding Bird Survey**, on USGS's ScienceBase data catalog with a DOI and a public-domain license. Five minutes of "who actually collects this?" saved me from building a map on the wrong source. I always take a moment to appreciate how open and tangible public GIS data can be. It's refreshing in a world of proprietary formats and software. _Coughs in a general direction._

Places I look first: ScienceBase, data.gov, state GIS portals, and GitHub (searching for the thing plus "csv" or "dataset"). Knowing a bit of Google-fu can go a long way in tracking down various data sources.

## 2. Keep the raw data out of the repo

The bird survey download is a 66 MB zip that unpacks to about 7.5 million rows. None of that belongs in a website repository: it makes every clone slow, and it's re-downloadable anyway.

My rule:
- **Raw downloads** live on my own network storage, in a folder per post. God bless these storage prices.
- **The repo** gets the scripts that process them, plus the small files the page actually loads (here, about 430 KB of map data and a 2 MB SQLite file).

If the page ever needs rebuilding, the scripts with the raw data folder get me back to the same result.

## 3. Shape it with SQL

For the Thanksgiving post I loaded everything into PostgreSQL with PostGIS, the spatial extension. I had to tie this into my career somehow, right? Three things bit me, and they'll bite you too:

1. **File encoding.** The routes file wasn't UTF-8, and the first load died on an accented character in a route name. Adding `ENCODING 'LATIN1'` to the `\copy` fixed it. When a CSV load fails on a "weird byte", check the encoding before anything else. This one gave me flashbacks: on a Civil 3D add-on I helped build, French accents were a constant test, and an unexpected é could choke the whole system.
2. **Missing rows mean zero.** The count files only list species that *were* seen. A survey with no turkeys has no turkey row at all. (Yes, this is how I spend my weekends now.) Average only the rows you have and every route looks like it had turkeys. The fix is to build the list of every survey run first, then left-join the turkey counts onto it and fill the gaps with `COALESCE(..., 0)`.
3. **Let geometry answer lookup questions.** The survey uses its own state codes. Instead of hunting for a lookup table, I loaded state outlines and asked which polygon each route's start point falls inside (`ST_Intersects`). A dozen coastal routes started just outside the simplified shoreline, so they get the nearest state with PostGIS's `<->` distance operator. These are the moments that make you rethink the data and respect GIS and PostGIS even more.

The last step in SQL is the important one: summarize down to exactly what the page shows. Yearly percentages, a value per route per decade, and a then-vs-now table per state. The browser never sees 7.5 million rows.

## 4. Draw it with plain HTML, CSS and SVG

I don't use a map library for these. The setup:

- **Project once, ahead of time.** A small Node script uses `d3-geo` and the `us-atlas` state outlines to turn every latitude/longitude into x/y on an Albers USA map (a conic projection, a cousin of the Lambert conformal conic used by many state plane zones). The page loads a JavaScript file with the outlines as SVG paths and every point already placed.
- **Every point is an SVG `<circle>`.** Styling lives in the stylesheet, so a restyle is a CSS edit.
- **Hover and tap find the nearest dot** in script, instead of making each tiny circle the target. Small dots stay easy to hit on a phone.
- **Color does one job.** Temperature uses a diverging blue-to-red scale centered on 50°F. Turkey counts use one hue, light to dark, with gray for "surveyed, none seen".
- **A table view under every map**, for anyone who'd rather read numbers than squint at dots.

Then I test it on a phone. The turkey map's row of decade buttons ran off the side of the screen. A horizontal scroll fixed it, and I'd never have caught it on a desktop.

## 5. Publish it

The site is Jekyll on GitHub Pages, built by a GitHub Action every time something is saved to the main branch.

- **Posts are Markdown** with a short settings block on top (title, date, published, tags). Data posts carry their figure as HTML.
- **Drafts are `published: false`.** They're in the repo, but the site skips them.
- **I edit in the browser.** I move between machines and user accounts a lot, and keeping local copies in sync was a mess. GitHub is the one copy now. I write in a web editor or hit `.` on the repo for a full code editor, and the site rebuilds in a minute or two.
- **Coding proofreads.** I mark unfinished bits with `TK` (old newspaper shorthand for "to come"). A check in the build refuses to publish any post that still has one, along with publish date checks. 

One thing changed after launch. The Waffle House page first asked the weather service for every temperature straight from each visitor's browser. That's about 780 location lookups per visit, more than the free tier allows in a minute, so a single page view could blow the limit. Now the build fetches temperatures every three hours and the page reads one small file. Fresh enough, and one set of lookups no matter how many people visit.

## 6. Let readers dig in

The turkey post ships a 2 MB SQLite file next to the map, plus a link that opens it in [Datasette Lite](https://lite.datasette.io/). That's the whole Datasette data explorer running inside the browser, so anyone can browse the tables or write their own SQL without installing anything. The link also installs the new datasette-charts plugin for quick charts. It's an alpha, so the link may need updating as the plugin matures.

## What I'd do differently

- **Ask "who actually collects this?"**, before searching for files.
- **Check the encoding and row counts the moment the data lands**, before writing any analysis scripts.
- **Write the post (or the SOP) while building, not after.** This post exists because I started doing that.
- **Preview through the built site, not the file.** Opening the raw post file in a browser shows the settings block and template tags as plain text, and the map doesn't load. Nothing's broken; it just hasn't been through Jekyll yet.
