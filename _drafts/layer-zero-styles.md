---
layout: post
title: "Layer 0 styles: let the object's layer do the work"
description: "Put style components on layer 0 and a Civil 3D object takes on the look of whatever layer it lives on. One style, many looks, and a lot fewer layers."
kicker: "Templates and standards"
tags: [civil-3d, styles, templates, layers]
---

<!--
DRAFT. TK = to come / to check before publishing.
Screenshots wanted: (1) Drawing Settings → Object Layers, (2) a style's Display tab with components on 0,
(3) the same alignment style on an existing and a proposed layer, side by side.
-->

Open the Display tab of almost any Civil 3D style and every component has its own layer: alignment lines on one, curves on another, arrows on a third. That's one way to build a template. Here's the other: **put the components on layer 0** and let the object's own layer decide how it looks.

## How it works

Civil 3D objects behave a lot like blocks. Each object sits on a layer, set by *Drawing Settings → Object Layers* when it's created (`C-ROAD-ALIN`, `C-TOPO`, and so on). Its style components draw *inside* the object, and a component on layer 0 does what block geometry on layer 0 always does: it **takes on the layer of its container**.

| Component setting | What you see |
|---|---|
| Layer `0`, color ByLayer | the object's layer color |
| Layer `0`, color ByBlock | the object's own color property |
| Layer `C-ROAD-ALIN-LINE` (named) | that layer, no matter where the object lives |

## Why bother

- **One style, many looks.** The same alignment style draws existing centerlines on a `V-` layer and proposed ones on a `C-` layer, each in its own color and lineweight, with no style swap.
- **Fewer layers.** A template with named component layers can easily carry hundreds of layers nobody touches. TK: count the layers in a stock country kit vs a layer-0 build.
- **Freeze an object, not a component.** Freezing the object's layer hides the whole thing, which is usually what people meant.
- **XREFs make sense.** Referenced objects keep their components on the referenced object layer (`SITE|C-ROAD-ALIN`), so layer overrides in the host drawing work per object instead of per component.
- **Plot styles by layer still work.** The object layer carries the pen.

## Why not

- **You can't freeze one component by layer.** Want to hide alignment tick marks but keep the line? On layer-0 styles, that's a style change, not a layer freeze. People with a habit of "just freeze the layer" will notice.
- **Exploding lands everything on 0.** *Export to AutoCAD* turns Civil 3D objects into blocks, so layer-0 components still inherit fine. But the minute somebody explodes those blocks, every component falls to layer 0. TK: show this in a GIF; it's the most common complaint.
- **Labels are their own animal.** Label styles have a layer setting of their own, and label components inherit from the label, not the parent object. TK: verify the exact behavior with label style layer = 0 vs named, and with label layers set in Object Layers.
- **Some agencies want named layers.** If the DOT or the Corps hands you a CAD standard with component-level layer names, follow it.

## What we'd actually do

A hybrid:

1. **Layer 0** for the main linework of alignments, profiles, corridors, pipes and structures.
2. **Named layers** for components people genuinely need to toggle on their own: surface triangles, borders, contour majors and minors, points, profile view grids.
3. **Object Layers** set in the template so new objects land on the right layer without anyone thinking about it.

TK: decide whether contours belong on named layers or 0 + a separate surface per display need. This is the part worth arguing about.

## Check your template in a minute

Scan every style for which components sit on 0 and which don't. TK: link the HackingCivil3D template report (or a simple Dynamo graph) once it's ready to share.
