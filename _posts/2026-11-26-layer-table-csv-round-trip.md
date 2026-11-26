---
published: false
date: 2026-11-26
title: "Edit a drawing's layers in a spreadsheet, then push them back"
description: "Dump a layer table to CSV, review it in Excel, and apply adds, renames and deletes in one transaction. The trick is an explicit action column."
kicker: "Templates and standards"
tags: [civil-3d, autocad, csharp, layers, templates]
---

<!--
STUB. TK = to come. Set `date` to when the work actually happened; if back-dated, add a one-line "written up later" note at the top.
First person ("I"), keep it anonymous (no hostnames, IPs, team names, employers).
-->

## Why a spreadsheet

TK: layer standards get reviewed by people who live in Excel, not the Layer Properties Manager.

## Dump

TK: one command writes the layer table to CSV in the same column order as the Layer Properties Manager.

## The action column

TK: ADD / MODIFY / RENAME / DELETE per row; blank means leave alone. Why there's no delete-by-omission.

## Update

TK: preview, confirm, then apply everything in one transaction so a bad row can't leave a half-changed drawing.

## Code

TK: the key C# parts (transaction, layer table, linetype lookup).
