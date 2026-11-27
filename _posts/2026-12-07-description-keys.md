---
published: false
date: 2026-12-07
title: "Description keys: let the field code do the drafting"
description: "Survey codes can pick the layer, style, label and even the size of every point. The $0 and $* parameters are where it gets clever."
kicker: "Civil 3D survey"
tags: [civil-3d, survey, points, description-keys]
---

Survey crews already type a code for every shot: `EP` for edge of pavement, `TREE 12 OAK`, `MH`. Description keys turn those codes into drafting decisions. The right layer, symbol, label and even the symbol size get chosen as the points come in, before anyone touches them.

## What a description key does

A description key matches a point's **raw description** (what the crew typed) and assigns:

- a **point style** (the symbol),
- a **point label style**,
- a **format** for the full description,
- a **layer**,
- and optionally a **scale** and **rotation** for the symbol.

You'll find them in *Toolspace → Settings → Point → Description Key Sets*. A key set is just a table: one row per code.

## Matching codes

The code column supports wildcards, which is what makes a short key set cover a messy field book:

| Code | Matches |
|---|---|
| `TREE*` | `TREE`, `TREE12`, `TREES` and anything else starting with TREE |
| `MH#` | `MH1` through `MH9` (`#` is any single digit) |
| `EP` | only `EP` |

Keys are checked from the top of the table down, and the first match wins. Put specific codes above general ones, or `TREE*` will swallow everything before `TREEPINE` gets a look. Keep the codes in the same case your crew types, too.

If a drawing uses more than one key set, the search order between sets is in the key sets' properties (right-click *Description Key Sets*).

## $0, $1 and $*

The raw description is split on spaces into parameters. For `TREE 12 OAK`:

| Parameter | Value |
|---|---|
| `$0` | `TREE` |
| `$1` | `12` |
| `$2` | `OAK` |
| `$*` | `TREE 12 OAK` (the whole thing) |

The **Format** column builds the full description from those pieces. `$*` keeps everything. `$2 $0` turns `TREE 12 OAK` into `OAK TREE`. That's how the label on the plan can read nicely even though the crew typed field shorthand.

## Size the symbol from the description

This is my favorite trick. Point the key's **scale parameter** at `$1`, apply it to X-Y, and turn off *Use drawing scale*. Now a tree shot with `TREE 12 OAK` gets a symbol scaled by 12, and `TREE 30 MAPLE` gets one scaled by 30. Draw the tree block at the right base size (1 unit across, with a fixed scale factor to turn inches into feet if you need it) and every tree on the plan shows its trunk size without anyone drawing a circle.

## Description keys vs point groups

Point groups can also set a point style and label. Which wins?

- A description key assigns the style **to the point itself**.
- A point group's style only applies to points whose own style is `<default>`.
- Unless the point group has the **Overrides** tab checked for style or label. Then the group wins, for every point in it.

If points refuse to look the way the key set says, check the overrides first. Edited the key set after the points came in? Right-click the point group and choose *Apply Description Keys*.

## A starter set

Ten codes cover most of a topo survey:

| Code | Point style | Layer |
|---|---|---|
| `EP` | small X | `V-ROAD-EDGE` |
| `TC` / `BC` | small X | `V-ROAD-CURB` |
| `CL` | small X | `V-ROAD-CNTR` |
| `TREE*` | tree, scaled by `$1` | `V-SITE-TREE` |
| `MH*` | manhole | `V-SSWR-STRC` |
| `CB*` | catch basin | `V-STRM-STRC` |
| `HYD*` | hydrant | `V-WATR-HYDR` |
| `UP*` | utility pole | `V-POWR-POLE` |
| `GS` | small X | `V-TOPO-GRND` |
| `BLDG*` | building corner | `V-BLDG-OTLN` |

Match the layer names to your own standard. The point is that the crew's codes, not a drafter at the end of the week, decide how the survey looks.
