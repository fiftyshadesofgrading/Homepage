---
published: false
date: 2026-12-01
title: "Description keys: let the field code do the drafting"
description: "Survey codes can pick the layer, style, label and even the size of every point. The $0 and $* parameters are where it gets clever."
kicker: "Civil 3D survey"
tags: [civil-3d, survey, points, description-keys]
---

<!--
STUB. TK = to come. First person ("I"), anonymous. Verify every command name and menu path in the current release before publishing.
-->

## What a description key does
TK: matches a point's raw description and assigns layer, point style, label style, format and scale/rotation.

## Wildcards
TK: `TREE*`, `#` for digits, and the order the key set is checked in.

## Parameters: $0, $1, $*
TK: raw description split on spaces. `TREE 12 OAK` → `$0`=TREE, `$1`=12, `$2`=OAK. Format `$*` keeps the whole thing.

## Using a parameter as a size
TK: scale a tree symbol by trunk diameter with the parameter-driven scale settings.

## Key set order and multiple key sets
TK: which wins; drawing settings for search order.

## A starter key set
TK: 10 codes that cover most topo jobs.
