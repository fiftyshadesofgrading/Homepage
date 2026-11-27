---
published: false
date: 2026-12-03
title: "Station equations: when 10+00 isn't 1,000 feet in"
description: "Back stations, ahead stations, and why the station on the plan sometimes doesn't match the distance along the road."
kicker: "Civil 3D alignments"
tags: [civil-3d, alignments, stationing]
---

Station 10+00 means 1,000 feet from the start of the alignment. Usually. A station is really just a name for a point along the alignment. Most of the time that name equals the distance from the beginning, right up until a station equation says otherwise.

## What a station really is

On a fresh alignment, stationing starts at whatever reference station you set (often 0+00 or 10+00, so it never goes negative) and climbs with distance. A **station equation** is a spot along the alignment where the station values jump: everything before it uses the old numbering, and everything after it uses the new numbering.

It's written as two stations at the same physical point:

```
STA 12+34.56 BK = STA 12+00.00 AH
```

The *back* station is the value coming in, and the *ahead* station is the value going out. In this example, 34.56 feet of stationing repeats: the stations from 12+00.00 to 12+34.56 exist twice along the road. Make the ahead station bigger than the back station and you get a gap instead.

## Why you'd ever want one

- **Realignments.** A curve gets flattened, the road gets shorter, and everyone wants the stations past the curve to keep their existing values, because the as-builts, the right-of-way plans and the utility records all use them.
- **Matching an old as-built.** Your new design ties into a road that's had its stationing since before you were born. You match theirs.
- **Joining two projects.** Two alignments designed separately become one, and both sets of stationing have to survive.

## Setting one in Civil 3D

*Alignment Properties → Station Control.* Set the reference point and its station at the top, then add equations in the table below. For each equation you set where it happens (as a raw station, measured along the alignment), the back station, the ahead station, and whether stationing increases or decreases after it.

Alignment label sets have a **Station Equations** label type. Use it. An equation without a label is how someone ends up building a curb in the wrong place.

## What follows the equation, and what doesn't

Anything that reads stations from the alignment follows it: station labels, profile views, sample lines and section views, and corridor regions defined by station. That's the point of doing it in the alignment.

What doesn't follow is anything that's just a number somewhere else: a station typed into a note, a spreadsheet of stations from the last submittal, a survey file with stations in the descriptions, a report someone exported last month. Add an equation and every one of those is now possibly wrong. Before adding one, I list everything outside the drawing that quotes stations.

## Tell the contractor

The field works from the plans, and a repeated or skipped range of stations is a trap. On the sheets:

- Label every equation on the plan **and** the profile, with both the back and ahead values.
- Call it out in the general notes if the project has more than one.
- If stations repeat, say which side of the equation a station in a table or note refers to.

A station equation is a perfectly good tool. A station equation nobody knows about is how a crew stakes the same station twice.
