---
published: false
date: 2026-11-27
title: "Finding streaks with SQL: gaps and islands"
description: "Hitting streaks, scoreless innings, win runs: one classic SQL pattern finds them all, with no loops and no application code."
kicker: "SQL patterns"
tags: [sql, postgres, mlb, data]
---

I keep a database of baseball game logs at home, and the first "fun" question I wanted to ask it was the obvious one: who's on a hitting streak, and what's the longest one this season?

It turns out that's a surprisingly awkward question for SQL. A streak is a run of *consecutive* rows that meet a condition, and SQL thinks in sets, not sequences. You can see a streak instantly in a spreadsheet; writing it as a query takes a trick. That trick has a name: **gaps and islands**. The rows you care about are islands, the rows that break them are gaps, and once you learn the pattern you'll use it everywhere.

## The trick

Number the rows twice:

1. Number **every** game in order (1, 2, 3, 4, 5…).
2. Number **only the games with a hit** in order (1, 2, 3…).

Then subtract. Inside an unbroken streak, both numbers go up by one each game, so the difference stays the same. As soon as a hitless game sneaks in, the first number jumps ahead and the difference changes. That difference is a free label for "which streak this game belongs to".

| Game | Hit? | All games | Hit games | Difference |
|---|---|---|---|---|
| Apr 1 | ✔ | 1 | 1 | **0** |
| Apr 2 | ✔ | 2 | 2 | **0** |
| Apr 4 | ✔ | 3 | 3 | **0** |
| Apr 5 | ✘ | 4 | — | — |
| Apr 6 (game 1) | ✔ | 5 | 4 | **1** |
| Apr 6 (game 2) | ✔ | 6 | 5 | **1** |

Group by the difference, count, and you have streaks: three games, then two.

## The query

{% highlight sql %}
WITH counted AS (          -- games that count toward a streak (see the rules below)
  SELECT *
  FROM batter_games
  WHERE at_bats > 0 OR sac_flies > 0
),
numbered AS (
  SELECT *,
         hits > 0 AS got_hit,
         row_number() OVER (PARTITION BY player_id
                            ORDER BY game_date, game_number) AS game_seq
  FROM counted
),
islands AS (
  SELECT *,
         game_seq - row_number() OVER (PARTITION BY player_id
                                       ORDER BY game_date, game_number) AS island
  FROM numbered
  WHERE got_hit
)
SELECT player_id,
       min(game_date) AS streak_start,
       max(game_date) AS streak_end,
       count(*)       AS games
FROM islands
GROUP BY player_id, island
ORDER BY games DESC;
{% endhighlight %}

No loops, no cursors, no Python. One pass with window functions, and it works the same on a dozen rows or a few hundred thousand.

## The baseball rules hiding in the WHERE clause

The first version I wrote was "wrong" in a way only a baseball fan would notice. Officially, a hitting streak isn't broken by a game where every plate appearance was a walk, a hit-by-pitch, catcher's interference or a sacrifice bunt. Those games simply don't count. A sacrifice fly, though, *does* end a streak.

So before numbering anything, the `counted` step throws out games that don't count: no at-bats and no sacrifice fly. A walk-only game disappears, and the streak carries on across it. A hitless game with a sac fly stays in and breaks the streak, as it should.

Two more decisions worth making on purpose:

- **Doubleheaders.** Order by date *and* game number, or the two games on the same day land in a random order.
- **Season boundaries.** Add `season` to the `PARTITION BY` if a streak should reset each spring. Leave it out to let streaks span the off-season. Record books track both, so pick one and say which.

## Active streaks

A streak is "active" if its last game is the player's most recent counted game. Join the islands back to each player's latest game date and keep the ones that match. That's a nice daily "who's hot" list.

## Where else this shows up

Once you see it, it's everywhere outside baseball too:

- **Equipment uptime:** consecutive days a machine reported in.
- **Weather windows:** the longest run of dry days for a paving or concrete pour.
- **Crew schedules:** consecutive working days, for fatigue or overtime rules.
- **Sensor data:** stretches of readings above a threshold.

Same three steps every time: number everything, number the rows that match, subtract, and group.
