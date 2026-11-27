---
published: false
date: 2026-12-14
title: "Data shortcuts that don't break"
description: "Working folders, project folders and the repair tool: how to share surfaces and alignments across drawings without the 'object not found' dance."
kicker: "Civil 3D project setup"
tags: [civil-3d, data-shortcuts, project-setup]
---

A surface lives in one drawing. The grading plan, the utility profiles, the cross sections and the sheets all need it. Data shortcuts share it without copying it, and when they're set up right, they're boring in the best way. When they're not, it's the "object not found" dance, every Monday morning.

## Why references beat copies

A data shortcut reference brings the **actual object** into another drawing, not a picture of it. A referenced surface can be labeled, sampled, profiled and used as a corridor target, and it updates when the source changes. One source, many drawings, and only one place to fix a mistake.

An xref shows you the linework. A data reference gives you the object. You'll usually want both: xref for the look, data reference for the design data.

## The two folders

- **Working folder.** The parent folder that holds your projects. Set it once per job (or per office).
- **Data shortcuts project folder.** One per job, inside the working folder. Civil 3D creates a `_Shortcuts` folder in it, with a subfolder per object type (alignments, surfaces, profiles, pipe networks and so on).

Each shortcut is a small XML file in there that records which drawing holds the source object and how to find it. That's all a shortcut is: a pointer. Break the pointer and the reference has nothing to follow.

## How not to break them

- **Keep source drawings inside the project folder.** Shortcuts are happiest with a source that lives in the same project.
- **Don't rename or move source drawings in File Explorer.** The XML still points at the old path. Plan the folder structure before you create shortcuts, not after.
- **Don't rename source objects casually,** either. The shortcut is looking for that object by name in that drawing.
- **One data shortcuts project per job.** Not one per phase, not one shared across three jobs.
- **Copy whole projects, not single drawings.** Moving a job to a new server? Move the entire project folder, `_Shortcuts` included, so the relative structure survives.

## When they break anyway

- **Validate** the shortcuts from Prospector to see which ones have lost their source.
- **Repair** a broken reference from its right-click menu, and point it at the source drawing's new location.
- For lots of broken paths at once (after a server move, say), the standalone **Data Shortcuts Editor** that installs with Civil 3D can repath many shortcuts in one go.
- **Promote** turns a reference into a full, independent copy of the object. It's useful for a frozen as-submitted record, but it cuts the link for good. Don't use it to make an error message go away.

## A layout that's worked for me

```
Job 1234/
  _Shortcuts/              (Civil 3D makes this)
  Source/
    Surfaces.dwg           EG, FG, volume surfaces
    Alignments.dwg         alignments and profiles
    Utilities.dwg          pipe networks
    Corridors.dwg
  Sheets/
    C-101 Grading.dwg      references + xrefs only
    C-201 Profiles.dwg
  Xrefs/
    Existing.dwg
```

Source drawings hold objects. Sheet drawings hold references, labels and layouts, and nothing that anyone else depends on. When everyone knows which drawing owns what, the shortcuts take care of themselves.
