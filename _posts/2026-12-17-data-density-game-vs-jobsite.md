---
published: false
date: 2026-12-17
title: "Data density: a video game match vs. a week on the jobsite"
description: "One competitive match records about as many position samples as a week of worker tracking or half a day of dozer machine control. What to keep, and what to throw away."
kicker: "Opinion"
tags: [data, gnss, machine-control, data-engineering]
---

I wish I could tell you this post started with deep thoughts about IoT sensors and jobsite data streams. That would be a lie. It started at the Counter-Strike Major in Boston in 2018, the ELEAGUE Major, with the playoffs at the Agganis Arena (site of the first Beanpot championship I saw live). That's where I met one of the sharpest software engineers I know, a Ruby fan with strong opinions about code quality, and we've been best buds ever since. When most of the crowd is teenage gamers, the adults find each other fast: the dads, the young professionals, and the folks ordering double Woodford's bourbons at 11 a.m. This is still a nerdy blog, right?!

Years later I pulled every match from that Major into a database, mostly for fun, right as I was planning a GPS machine-control demo. Thinking about both at once led to a comparison I can't stop thinking about: **one competitive match records about as many position samples as a week or two of tracking a worker on a jobsite, or a full shift of a dozer running machine control.**

## The dataset

The matches are from a Counter-Strike Major played in Boston in 2018. Every match was recorded as a demo file, and a demo isn't a video. It's the server's whole simulation, tick by tick: every player's position, view angle, health, money and weapon, every grenade's arc, every shot and every kill. Each map is a couple hundred megabytes compressed, and two to four times that unpacked.

I wrote a small loader (Go, using the open-source `demoinfocs-golang` parser) that unpacks each demo and writes it into Postgres with PostGIS:

| Table | One row per |
|---|---|
| `matches`, `rounds`, `players` | map played, round, player per map (with the final scoreboard) |
| `kills`, `damages`, `weapon_fires` | kill, hit, shot, with positions and view angles |
| `grenades`, `flashes`, `bomb_events` | throw (with its full flight path), flashbang, plant or defuse |
| `player_frames` | **each player, sampled every 16 ticks**: position, view, health, money, weapon |

Positions land as PostGIS points, so the same spatial SQL I use for site data works on a video game map.

Two lessons came free with the build. First, the recordings drop a network packet now and again, sometimes losing the last kill of a round as the ticks count down to the round switch. The loader rebuilds those kills from the victim's health and the killer's scoreboard, flags them as `inferred`, and checks every player's totals against the in-game scoreboard. Second: (please sit down for this) real-world data is never complete, even when it comes from a computer.

## Where the bytes went

Here's the whole point of this post in one number: in my first test loads, roughly **90% of the database was `player_frames`**. The positions. Everything that actually *happened* (every kill, every bomb plant, every round won) fits in the other 10%.

TK: chart of storage by table for the full Major, from this query:

```sql
SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS size,
       n_live_tup AS approx_rows
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

TK: the real numbers. Total size, rows in `player_frames` vs `kills`, and the events share of the total.

## The comparison

A "tick" is one step of the server's simulation. In CS:GO, Valve's own matchmaking servers ran at 64 ticks a second, while pro LAN events and the competitive third-party services ran at 128. A Major on LAN is the 128 case. With round numbers, for one player over a ~45-minute map:

| Source | Rate | Duration | Samples |
|---|---|---|---|
| One player, 64-tick server | 64 per second | ~45 minutes | 64 × 2,700 s ≈ **173,000** |
| One player, 128-tick LAN Major | 128 per second | ~45 minutes | 128 × 2,700 s ≈ **346,000** |
| A worker's GPS tag | 1 per second | 48 hours (a week of shifts) | 1 × 172,800 s ≈ **173,000** |
| A dozer on machine control | 10 per second | ~4.8 hours | 10 × 17,280 s ≈ **173,000** |

So a 64-tick match is about a week of worker tracking or half a day of machine control, and a 128-tick Major doubles that: two weeks of a worker, or a full shift of a dozer.

### A note on CS2 and "sub-tick"

This is a 2018 CS:GO data set, and the game has moved on. CS2 replaced the 64-vs-128 argument with what Valve calls **sub-tick**: the server still simulates at a fixed rate (64 a second), but every shot and movement input carries its exact timestamp *between* ticks. So the old "128 is better" debate is mostly history, and a CS2 demo would give you positions at 64 a second plus precisely timed actions.

That doesn't make the comparison moot. If anything, it makes the point of this post for me: CS2 samples the **tracks** at a fixed, modest rate and records the **events** with precise timestamps. That's exactly the split I'd want on a jobsite.

Same order of magnitude, wildly different value per sample. Every tick of the match matters to someone reviewing a fight. Most of the worker's week is someone standing roughly where they were a second ago.

Now scale the jobsite up. Thirty machines on machine control at 10 Hz, ten-hour days, a 200-day season:

> 30 machines × 10 samples/s × 36,000 s × 200 days ≈ **2.2 billion rows**

Add a hundred workers tagged at 1 Hz and that's another 720 million. One season of one big job buries the entire Major many times over, and almost all of it is breadcrumbs.

## Tracks vs events, drawn

TK: figure. One round on one map: every player's `player_frames` drawn as lines (the tracks), with the kills drawn as points on top (the events). Same round, two very different amounts of data, and the dots are what anyone actually talks about.

The tracks come straight out of PostGIS:

```sql
SELECT player_name, round_num,
       ST_MakeLine(geom ORDER BY tick) AS path
FROM player_frames
WHERE match_id = 1 AND round_num = 12
GROUP BY player_name, round_num;
```

## How much can you throw away?

Sampling every 16 ticks was already my first decision about what to throw away. The next question is how far you can push it before the picture changes.

TK: run the same round at 8, 2, 1 and 0.2 samples per second and fill in the table. Path length is a good test: thin a track too much and it cuts corners, so it comes out shorter.

| Samples per second | Rows (one round) | Size | Total path length | vs. full |
|---|---|---|---|---|
| 8 (as loaded) | TK | TK | TK | 100% |
| 2 | TK | TK | TK | TK |
| 1 | TK | TK | TK | TK |
| 0.2 | TK | TK | TK | TK |

```sql
-- keep every Nth sample (frames are already 16 ticks apart at a 128-tick broadcast)
SELECT player_name, ST_Length(ST_MakeLine(geom ORDER BY tick)) AS path_len, count(*) AS rows
FROM player_frames
WHERE match_id = 1 AND round_num = 12 AND (tick / 16) % 8 = 0   -- ~1 per second
GROUP BY player_name;
```

My guess is that 1 Hz keeps nearly all of the path in a game this twitchy. On a jobsite, where a dozer moves at walking pace, far less would do for anything except blade control. That's exactly the point: the right rate depends on the question. This is where data analysis and engineering are more of an art than a science. Right where we love to hang out. An understanding of the dataset presently and the representation / rebuilding in the software or data schema are two separate sets of parameters that require a deep understanding of the data to make the best decisions to optimize the data.

## Sample at the rate the decision needs

The right sampling rate isn't "as fast as the hardware allows". It's as fast as the decision you're making needs:

- **Blade control** needs fast, precise positions (several per second, with RTK corrections), because the machine is cutting to grade in real time and the GPS is tied to a high frequency clock.
- **Worker safety** (is someone in the swing radius?) needs positions every second or so, and needs them *now*, not tomorrow. Skanska US implemented this on their jobsites back in 2016, it was at proof on concept stage - but if it influences how workers behave on a jobsite is it a proof? Keeping folks safe was the name of the game. At Skanska we stretched every morning in the VDC office to stay safe like all of our colleagues and friends out there on the site!
- **Productivity and progress** (how much did we move today?) are fine with a position every few seconds, or a summary at the end of the shift.
- **Fleet tracking** (where the heck is the excavator?) is fine at once a minute.

Store everything at the fastest rate and you pay for it in storage, bandwidth and slower queries, forever, for decisions nobody's making.

## Keep events forever, downsample tracks

Separate the **events** from the **tracks**:

- **Events** are the moments that mean something: cut-to-grade reached on a pad, a geofence entered, a machine idle for more than ten minutes, a lift completed. They're small, rare and valuable. Keep them forever.
- **Tracks** are the raw breadcrumbs. Keep them at full rate for a short while (days, not months) for troubleshooting and replay, then thin them out: one point a second, then one every ten, then just the daily footprint.

Pro match analysis already works this way. Nobody rewatches every tick of every round; they jump to the kills, the plants and the rotations, and those are events. My first real question for the match database was about one player's clutch rounds (more on that in a later post), and it never touched a single position sample. It ran entirely on kills and rounds.

## What this means for jobsite data

Construction is about to have the data volume problems that games and sports already solved. Every machine, tag and drone flight is a sensor now. Some lessons to borrow before the database fills up:

1. **Decide what questions you're answering** before choosing a sampling rate.
2. **Write events at the edge.** Let the machine or gateway decide "cut-to-grade reached" and send that, not just the stream of points that implies it.
3. **Put a retention policy on raw data** on day one, while it's still easy to agree on.
4. **Keep the derived stuff in the database,** where it can be queried, joined to the design surface and mapped.

TK: once the GPS demo is logging, add a small live example here: a phone's track on a site, with geofence-entry events pulled out of it.

A match file is a nice, contained way to practice all of this. The jobsite version is the same problem with mud on it.
