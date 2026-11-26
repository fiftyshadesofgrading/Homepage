---
published: false
date: 2026-11-28
title: "Your DWG is fat: a diet plan"
description: "Registered applications, scale lists, orphaned linetype data and other junk that makes a 200 KB drawing weigh 40 MB, and how to get rid of it."
kicker: "AutoCAD nuts and bolts"
tags: [autocad, civil-3d, cleanup, purge]
---

<!--
STUB. TK = to come. First person ("I"), anonymous. Verify every command name and menu path in the current release before publishing.
-->

## The symptoms
TK: slow open, slow copy-paste between drawings, a file size that makes no sense for what's in it.

## Registered applications (RegApps)
TK: what they are, how they multiply when you copy between drawings, `-PURGE` → `R` to clear them. Count before and after.

## The scale list
TK: hundreds of `1:20_XREF_XREF` entries; `-SCALELISTEDIT` → Reset.

## Orphaned DGN linetype data
TK: how it arrives with MicroStation-sourced files, and the PURGE option that clears it (verify in current release).

## The usual suspects
TK: unused blocks, layers and styles; `AUDIT`; `RECOVER` vs `-WBLOCK` to a fresh file as the last resort.

## A cleanup script
TK: a short .scr that does all of the above, safe to run on a folder.
