---
published: true
date: 2026-12-15
title: "Proxy objects and the consultant file that won't behave"
description: "Why a drawing from someone else's software shows boxes you can't edit, what an object enabler is, and how to hand files to people without Civil 3D."
kicker: "AutoCAD nuts and bolts"
tags: [autocad, civil-3d, interoperability, proxy-objects]
---

A consultant sends a drawing. You open it and get a warning about proxy objects, and half the linework is either a grey box, invisible, or impossible to select. Nothing's corrupt. The drawing just contains objects your software doesn't know how to handle.

## What a proxy is

A proxy object is an object created by an application that isn't loaded right now. Civil 3D surfaces opened in plain AutoCAD, Plant 3D pipes opened in Civil 3D, objects from some long-gone add-on: AutoCAD can't edit them, because the code that defines them isn't there. It keeps them safely (so you don't destroy the consultant's data) and shows whatever stand-in graphics were saved with them.

## What you see, and why

When a drawing with proxies opens, you get the **proxy information** dialog. `PROXYNOTICE` controls whether it shows up.

How the proxies look depends on two settings:

- `PROXYSHOW` controls the display in *your* session: `1` shows the saved graphics, `2` shows just a bounding box, `0` shows nothing.
- `PROXYGRAPHICS` controls whether stand-in graphics get **saved** with a drawing. If the person who saved it had it set to `0`, there are no graphics to show. That's the "I can't see anything at all" case, and no setting on your end will bring them back.

## Object enablers

Autodesk publishes free **object enablers** for its vertical products, Civil 3D included. Install the right one and plain AutoCAD can display the objects properly, list their properties, and in some cases do light editing. You still can't design with them, but for someone who only needs to see, plot and xref the drawing, an enabler is often all it takes.

Check for an enabler matching your AutoCAD version before you ask anyone to re-export anything.

## Export to AutoCAD

When the person receiving the file really doesn't have the software, send them a drawing with no Civil 3D objects in it. Civil 3D's *Export to AutoCAD* (`-EXPORTTOAUTOCAD` at the command line, which is easier to script) writes a copy where Civil 3D objects are turned into plain AutoCAD geometry and blocks. The options worth setting:

- **Format:** the DWG version the recipient can open.
- **Bind xrefs:** yes, if they need one self-contained file. Bind type *Insert* keeps layer names cleaner than *Bind*.
- **Prefix/suffix:** the new file's name, so nobody confuses it with the live one.

What you lose: everything that made it Civil 3D. Surfaces become faces and lines, labels become text and blocks, and nothing updates any more. It's a picture of the design, not the design.

## Export to AutoCAD with Project Explorer

Project Explorer originally released in beta with the tagline that it "aimed to be your second monitor when working in Civil 3D". It is a fully customizable, data-rich, supercharged Toolspace Prospector. Another facet of this tool is the Object Sets workflows. The concept of Object Sets are that they allow you, the user, to manually pull in specific model elements and perhaps perform an action on that set. These actions include export to Excel, create an AutoCAD table, or even export to AutoCAD DWG format. 

This could be a neat way to standardize the export of just a selection of Civil 3D model data to a new file, rather than down saving and exporting the entire model. 

## What to ask for before the file shows up

A two-minute email at the start of a job saves hours later:

1. **Which software and version** made the files?
2. **Native or exported?** If you don't have their software, ask for an exported AutoCAD (or IFC if your organization utilized the format) copy alongside the native file.
3. **Xrefs:** bound, or sent along with their folder structure?
4. **Coordinate system and units,** stated, not implied.
5. **Fonts, plot styles and shapes,** if the sheets need to plot the way they meant. Don't forget that Civil 3D users need to use the eTransmittal command to ensure all relevant files and shortcuts are included. 

Proxies aren't a bug. They're AutoCAD keeping someone else's work safe. The fix is almost always on the sending side, so ask early.
