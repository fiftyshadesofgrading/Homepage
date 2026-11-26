---
published: false
date: 2026-11-27
title: "From data set to web page: how we publish a data post"
description: "The repeatable recipe behind the Waffle House and wild turkey maps: find the data, shape it with SQL, draw it with plain HTML, and publish it with Jekyll."
kicker: "Behind the scenes"
tags: [data, maps, jekyll, sql, workflow]
---

<!--
DRAFT, written while we build the workflow. TK = to come / to check before publishing.
Examples to point at: the Waffle House map (live API, no database) and the turkey map (PostGIS, Datasette).
-->

## The short version

TK: the whole recipe in four or five bullets, once tomorrow's setup settles.

## 1. Find a data set worth mapping

TK: what makes a good one (coordinates, a story, a clear license); where to look (USGS ScienceBase, data.gov, GitHub); check the date and the license before anything else.

## 2. Keep the raw data out of the repo

TK: raw downloads live on the NAS; the repo only gets scripts and small built outputs. Why: repo size, and the raw files are re-downloadable.

## 3. Shape it with SQL

TK: load into PostGIS (or SQLite for small jobs), the gotchas we hit (file encoding, counting zeros), and summarizing down to only what the page needs.

## 4. Draw it with plain HTML, CSS and SVG

TK: projecting points once ahead of time, no map library, hover and tap, a table view for accessibility.

## 5. Publish it

TK: the post as Markdown with the figure as a one-line include, GitHub Pages builds it, Pages CMS or github.dev for edits from any machine.

## 6. Let readers dig in

TK: shipping a small SQLite file and a Datasette Lite link.

## What we'd do differently

TK: notes from tomorrow.
