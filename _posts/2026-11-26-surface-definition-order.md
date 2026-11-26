---
published: false
date: 2026-11-26
title: "Surface definitions run in order, and order matters"
description: "A Civil 3D surface is a recipe, not a result. The operation list rebuilds top to bottom every time, which explains a lot of 'my edit disappeared' moments."
kicker: "Civil 3D surfaces"
tags: [civil-3d, surfaces, tin]
---

<!--
STUB. TK = to come. First person ("I"), anonymous. Verify every command name and menu path in the current release before publishing.
-->

## The recipe
TK: Prospector → surface → Definition: point groups, breaklines, boundaries, edits. Surface Properties → Definition tab shows the operation list.

## Why order matters
TK: a breakline added after a delete-line edit; a boundary before vs after breaklines; edits that reference triangles that no longer exist.

## Moving operations up and down
TK: where, and when it's safe.

## Build options people never open
TK: exclude elevations below/above, maximum triangle length, minimum distance between points. When each saves you.

## A sane default order
TK: data first, boundaries, then edits last; and why I keep edits to a minimum.
