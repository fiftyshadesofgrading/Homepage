---
published: true
date: 2026-11-30
title: "Your DWG is fat: a diet plan"
description: "Registered applications, scale lists, orphaned linetype data and other junk that makes a 200 KB drawing weigh 40 MB, and how to get rid of it."
kicker: "AutoCAD nuts and bolts"
tags: [autocad, civil-3d, cleanup, purge]
---

Every office has one: the drawing that takes a minute to open, freezes when you copy and paste from it, and weighs 40 MB while holding about six lines and a north arrow. The geometry isn't the problem. The junk riding along with it is, and most of that junk came from other drawings.

## The symptoms

- A slow open, with the progress bar sitting still for no obvious reason.
- Copy and paste between drawings that takes seconds instead of milliseconds.
- A file size that makes no sense for what's in it.
- Annotation scale lists a mile long, full of names ending in `_XREF`.

## Registered applications (regapps)

Every add-on that touches a drawing can leave a registered application name behind. They're tiny, but they get copied along with anything you paste or insert, so they multiply from drawing to drawing until some files carry tens of thousands of them.

To count them, paste this at the command line:

```lisp
(setq n 0 r (tblnext "APPID" T)) (while r (setq n (1+ n) r (tblnext "APPID"))) n
```

To clear the unused ones: `-PURGE` → `R` (Regapps) → `*` → `N` (don't verify each one). Count again afterwards. I've watched that number drop from five figures to a couple dozen.

## Scale lists

Attach an xref and its annotation scales can come along with it, renamed with an `_XREF` suffix. Nest a few xrefs and you get entries like `1:20_XREF_XREF`, hundreds of them, in every scale dropdown.

Fix: `-SCALELISTEDIT` → `R` (Reset) → `Y` → `E` (Exit). That puts the list back to the defaults. If your office uses a custom scale list, reset first, then add your scales back (or save them in your template so a reset brings them back).

## Orphaned linetype data

Drawings that have been anywhere near a MicroStation file (a DGN import, or a DWG that started life as one) can carry orphaned DGN linetype data. It can't be seen and it isn't used, and it's notorious for bloating files.

`PURGE` has an option for it: tick **Orphaned data** in the dialog, or at the command line `-PURGE` → `O`. If you work with DOT or federal files that came out of MicroStation, this is often the one that matters most.

## Excessive references

External References and Data References should be used throughout a project with care. Your method for overlaying or attaching XREFs and ensuring that each model has access to the relevant information is imperative. Avoid attaching too much overhead to file through references, be selective and use Data References where possible. Entities such as Pressure Networks or Gravity Networks can bog down a file, especially when brought in through a reference. 

## The usual suspects

- **Unused blocks, anonymous blocks, layers, styles and linetypes:** `-PURGE` → `A` (All) → `*` → `N`. Run it two or three times, because purging one thing can free up something it was holding (a block that used a layer that used a linetype).
- **Errors:** `AUDIT` → `Y` fixes what it finds. If a drawing won't open cleanly, `RECOVER` is the heavier version.
- **The last resort:** `-WBLOCK` the whole drawing (`*`) out to a new file. Only what's actually used gets written. Open the new file and check it carefully before you throw away the old one. This technique can be used to re-write an entire Civil 3D project drawing database. 

## One script for all of it

A script file (`.scr`) is just keystrokes, one per line. Here's mine:

```
-PURGE R * N
-PURGE O
-SCALELISTEDIT R Y E
-PURGE A * N
-PURGE A * N
-PURGE A * N
AUDIT Y
QSAVE
```

Run it with `SCRIPT` on one drawing. Prompts move around between versions, so walk through each line by hand once in your version before trusting the script. In a few days I'll show how to run the same script on a whole folder of drawings without opening any of them.
