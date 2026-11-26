---
published: false
date: 2026-11-26
title: "Finding streaks with SQL: gaps and islands"
description: "Hitting streaks, scoreless innings, win runs: one classic SQL pattern finds them all, with no loops and no application code."
kicker: "SQL patterns"
tags: [sql, postgres, mlb, data]
---

<!--
STUB. TK = to come. Set `date` to when the work actually happened; if back-dated, add a one-line "written up later" note at the top.
First person ("I"), keep it anonymous (no hostnames, IPs, team names, employers).
-->

## The problem

TK: a streak is a run of consecutive rows that meet a condition. Easy to see, awkward to query.

## The trick

TK: number every row, number only the matching rows, and subtract. Matching rows in the same streak share the same difference, so the difference becomes the group key (the "island").

## Worked example: hitting streaks

TK: query against the batter game logs; longest active and longest ever.

## Gotchas

TK: games that don't count (no at-bats), doubleheaders, season boundaries.

## Where else it shows up

TK: equipment uptime, consecutive dry days for a site, survey crews' working days.
