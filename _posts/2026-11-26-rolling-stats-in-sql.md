---
published: false
date: 2026-11-26
title: "Rolling 7, 14 and 30-day stats with SQL window functions"
description: "ERA, WHIP, FIP and wOBA over rolling windows, computed in the database: sums and counts first, ratios last."
kicker: "SQL patterns"
tags: [sql, postgres, mlb, window-functions]
---

<!--
STUB. TK = to come. Set `date` to when the work actually happened; if back-dated, add a one-line "written up later" note at the top.
First person ("I"), keep it anonymous (no hostnames, IPs, team names, employers).
-->

## Why rolling windows

TK: season totals hide slumps and hot streaks; a 14-day window shows them.

## The rule that saves you: sum first, divide last

TK: you can't average ERAs; roll up innings and earned runs, then divide.

## Window frames by date, not by row

TK: `RANGE BETWEEN INTERVAL '13 days' PRECEDING AND CURRENT ROW` vs `ROWS`, and why off days matter.

## A daily stats table

TK: `pitcher_stats_daily` / `batter_stats_daily` with 7/14/30/season-to-date columns; refreshed nightly.

## Formulas

TK: ERA, WHIP, FIP (with the league constant), BABIP, wOBA, OPS+.
