---
published: false
date: 2026-11-30
title: "AutoCAD without AutoCAD: accoreconsole"
description: "Every AutoCAD install ships a headless command-line version that runs scripts against drawings without opening the program. Batch-fixing a folder of DWGs becomes one line."
kicker: "AutoCAD nuts and bolts"
tags: [autocad, automation, scripts, batch]
---

<!--
STUB. TK = to come. First person ("I"), anonymous. Verify every command name and menu path in the current release before publishing.
-->

## What it is
TK: `accoreconsole.exe` in the AutoCAD install folder; the same core engine, no graphics, no UI. (Close cousin of what Design Automation runs in the cloud — link the APS post.)

## Hello world
TK: `accoreconsole.exe /i "C:\path\file.dwg" /s "C:\path\fix.scr"` and a three-line script that saves a change.

## Batch a folder
TK: a PowerShell loop over every DWG in a folder, with a log.

## What doesn't work
TK: no dialogs, no ActiveX/COM, some commands need their `-` command-line versions; LISP mostly fine.

## Good first jobs
TK: purge everything, set a layer standard, plot to PDF, report drawing units.
