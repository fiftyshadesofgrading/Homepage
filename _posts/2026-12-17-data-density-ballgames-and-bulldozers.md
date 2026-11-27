---
published: false
date: 2026-12-17
title: "Data density: a video game match vs. a week on the jobsite"
description: "One competitive match records about as many position samples as a week of worker tracking or half a day of dozer machine control. What to keep, and what to throw away."
kicker: "Opinion"
tags: [data, gnss, machine-control, data-engineering]
---

I've been working on parsing old pro video game matches into a database for fun, and I'm also planning a GPS machine-control demo. Doing both at once led to a comparison I can't stop thinking about: **one competitive match records about as many position samples as a week of tracking a worker on a jobsite, or half a day of a dozer running machine control.**

## The comparison

A competitive match demo records every player's position many times a second. The math, with round numbers:

| Source | Rate | Duration | Samples |
|---|---|---|---|
| One player in a pro match | 64 per second | ~45 minutes | 64 × 2,700 s ≈ **173,000** |
| A worker's GPS tag | 1 per second | 48 hours (a week of shifts) | 1 × 172,800 s ≈ **173,000** |
| A dozer on machine control | 10 per second | ~4.8 hours | 10 × 17,280 s ≈ **173,000** |

Same order of magnitude, wildly different value per sample. Every tick of the match matters to someone reviewing a fight. Most of the worker's week is someone standing roughly where they were a second ago.

## Sample at the rate the decision needs

The right sampling rate isn't "as fast as the hardware allows". It's as fast as the decision you're making needs:

- **Blade control** needs fast, precise positions (several per second, with RTK corrections), because the machine is cutting to grade in real time.
- **Worker safety** (is someone in the swing radius?) needs positions every second or so, and needs them *now*, not tomorrow.
- **Productivity and progress** (how much did we move today?) are fine with a position every few seconds, or a summary at the end of the shift.
- **Fleet tracking** (where's the excavator?) is fine at once a minute.

Store everything at the fastest rate and you pay for it in storage, bandwidth and slower queries, forever, for decisions nobody's making.

## Keep events forever, downsample tracks

The trick I'm planning to use in the demo: separate the **events** from the **tracks**.

- **Events** are the moments that mean something: cut-to-grade reached on a pad, a geofence entered, a machine idle for more than ten minutes, a lift completed. They're small, rare and valuable. Keep them forever.
- **Tracks** are the raw breadcrumbs. Keep them at full rate for a short while (days, not months) for troubleshooting and replay, then thin them out: one point a second, then one every ten, then just the daily footprint.

Pro match analysis works the same way, as it happens. Nobody rewatches every tick of every round; they jump to the kills, the plants and the rotations, and those are events.

## What this means for jobsite data

Construction is about to have the data volume problems that games and sports already solved. Every machine, tag and drone flight is a sensor now. Some lessons to borrow before the database fills up:

1. **Decide what questions you're answering** before choosing a sampling rate.
2. **Write events at the edge.** Let the machine or gateway decide "cut-to-grade reached" and send that, not just the stream of points that implies it.
3. **Put a retention policy on raw data** on day one, while it's still easy to agree on.
4. **Keep the derived stuff in the database,** where it can be queried, joined to the design surface and mapped.

A match file is a nice, contained way to practice all of this. The jobsite version is the same problem with mud on it.
