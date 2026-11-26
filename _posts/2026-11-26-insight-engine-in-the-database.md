---
published: false
date: 2026-11-26
title: "An insight engine that lives in the database"
description: "Dozens of rules, a couple hundred auto-written baseball insights a day, and why I moved the logic out of my workflow tool and into Postgres."
kicker: "Data engineering"
tags: [sql, postgres, n8n, mlb, data-engineering]
---

<!--
STUB. TK = to come. Set `date` to when the work actually happened; if back-dated, add a one-line "written up later" note at the top.
First person ("I"), keep it anonymous (no hostnames, IPs, team names, employers).
-->

<!-- Write this after the cleanup: n8n down to one fetch node, everything else as database logic. -->

## Version 1: rules in the workflow tool

TK: 34 rules across pitching, hitting, streaks, bullpen, pace and matchups; ~218 insights a day; what got messy.

## Version 2: rules as data

TK: `insight_rules` / `insight_results` tables; each rule is a row (category, SQL, thresholds, template text).

## Let the database do the work

TK: views for derived stats, a trigger when a game goes final, n8n reduced to fetching.

## Health checks

TK: push alerts when a load or a rule fails.

## Before and after

TK: node count, run time, how easy it is to add a rule.
