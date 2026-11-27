---
published: true
date: 2026-12-02
title: "Rolling 7, 14 and 30-day stats with SQL window functions"
description: "ERA, WHIP, FIP and wOBA over rolling windows, computed in the database: sums and counts first, ratios last."
kicker: "SQL patterns"
tags: [sql, postgres, mlb, window-functions]
---

A pitcher's season ERA is a fine number for a baseball card. It's a terrible number for "is this guy good right now?" A starter who had a rough April and has been lights-out for a month still carries April around in his season line. Rolling windows fix that: the last 7, 14 and 30 days, recalculated every day.

## Why rolling windows

Season totals hide slumps and hot streaks. A 14-day window shows them. Plot a 7-day ERA as a line over a whole season and you can see an injury, a mechanical fix, or a pitcher figuring out a new pitch, all as bends in the line.

That's also where it got fun. Once every player had a row per day per window, the charts were nearly free. A trend panel in Grafana is one query:

{% highlight sql %}
SELECT stat_date, era, whip, fip
FROM pitcher_stats_daily
WHERE pitcher_id = 12345 AND window_days = 7
ORDER BY stat_date;
{% endhighlight %}

No aggregation at chart time, so the dashboard stays quick even across a full season of every pitcher in the league.

## The rule that saves you: sum first, divide last

You can't average ERAs. A pitcher who threw 1 inning with an ERA of 27.00 and 8 innings with an ERA of 0.00 didn't have a 13.50 ERA; he gave up 3 earned runs in 9 innings, which is 3.00.

Every rate stat works this way. Roll up the **counting stats** (innings, earned runs, hits, walks, strikeouts) over the window, then divide once at the end:

{% highlight sql %}
ROUND(SUM(earned_runs) * 9.0 / NULLIF(SUM(innings_pitched), 0), 2) AS era
{% endhighlight %}

`NULLIF(..., 0)` keeps a pitcher with zero innings from dividing by zero and taking the whole query down with him.

One baseball-data gotcha while I'm at it: box scores write innings as `6.1` and `6.2`, meaning six and a third and six and two thirds. That's notation, not decimals. Convert to outs (6.1 → 19 outs) before you add anything up, and back to innings at the end.

## Window frames by date, not by row

SQL window functions can do this on the fly, and the frame you pick matters:

{% highlight sql %}
SUM(earned_runs) OVER (
  PARTITION BY pitcher_id ORDER BY game_date
  RANGE BETWEEN INTERVAL '13 days' PRECEDING AND CURRENT ROW
)
{% endhighlight %}

`RANGE` with an interval means "the last 14 calendar days". `ROWS BETWEEN 13 PRECEDING AND CURRENT ROW` means "the last 14 *appearances*", and for a starting pitcher who goes every fifth day, that's more than two months. Off days, rest days and the All-Star break all vanish with `ROWS`. If the question is about time, frame by time.

## A daily stats table

For a dashboard, I didn't want window functions running on every page load. So the database does the work once a night and stores the answer:

- `pitcher_stats_daily` and `batter_stats_daily`, one row per player, per day, per window.
- `window_days` is `7`, `14`, `30`, or `0` for season-to-date.
- Each window is a plain `GROUP BY` over `game_date >= CURRENT_DATE - INTERVAL '7 days'` (and so on), written with `ON CONFLICT ... DO UPDATE` so a re-run just refreshes the row.
- A unique key on player, date and window keeps it honest.

A player card is then four rows from one table, and a leaderboard is a `WHERE window_days = 30 ORDER BY era`.

## Formulas

All of them follow the sum-first rule:

| Stat | Formula |
|---|---|
| ERA | 9 × ER / IP |
| WHIP | (BB + H) / IP |
| FIP | (13 × HR + 3 × BB − 2 × K) / IP + league constant |
| BABIP | (H − HR) / (AB − K − HR + SF) |
| wOBA | weighted walks, HBP and hits / (AB + BB − IBB + SF + HBP) |
| OPS+ | OPS relative to league average, × 100 |

Two of those need numbers from outside the box score. The **FIP constant** puts FIP on the same scale as ERA and changes every season, so it lives in a config table instead of the query. The **wOBA weights** also change by season.

And a confession on OPS+: the real version compares on-base and slugging separately to league average and adjusts for the ballpark. Mine is a shortcut, OPS divided by league OPS. It's close enough for trend lines, and I label it so nobody mistakes it for the real thing.
