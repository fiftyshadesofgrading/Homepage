---
published: false
date: 2026-12-01
title: "Cut and fill labels that say C and F, with Civil 3D expressions"
description: "A volume surface already knows the cut and fill depth everywhere. Expressions turn −2.35 into C 2.35 and make the label pick its own color."
kicker: "Label styles"
tags: [civil-3d, labels, expressions, surfaces]
---

<!--
DRAFT. TK = to come / to check before publishing.
Screenshots wanted: (1) the volume surface dialog, (2) the expression editor, (3) the label style composer with both components, (4) a finished plan with a grid of C/F labels.
-->

Every grading plan eventually gets the question "how deep is the cut here?" Civil 3D can answer it everywhere on the site, live, but its out-of-the-box answer looks like `-2.35`, and nobody in the field wants to do sign math. They want **C 2.35** in one color and **F 1.10** in another.

Expressions get us there without a single line of code.

## Step 1: let a volume surface do the subtraction

Make a TIN volume surface with existing ground as the base and finished grade as the comparison (*Create Surface → TIN volume surface*). Its "elevation" at any point is **comparison minus base**, so:

| Volume surface value | Meaning |
|---|---|
| positive | fill (finished grade is above existing) |
| negative | cut (finished grade is below existing) |
| zero | daylight / no change |

A spot elevation label placed on that surface already reports cut/fill depth. The rest is cosmetics, but it's the cosmetics that get the plan read.

## Step 2: know what expressions can and can't do

Expressions live in the Settings tab under each label type, e.g. *Surface → Label Styles → Spot Elevation → Expressions*. They're small formulas built from the label's own properties (`{Surface Elevation}` here) plus math functions like `ABS`, `ROUND`, `MIN`, `MAX` and `IF`.

Two rules shape everything that follows:

1. **An expression returns a number, never text.** It can't output "C" or "F".
2. **That number can be shown in a label, or plugged into numeric style properties** such as text height or rotation.

So we can't write one component that switches its prefix. We write two components, one for cut and one for fill, and let an expression hide whichever one doesn't apply.

## Step 3: the expressions

Create three expressions under the Spot Elevation label styles:

```
Depth       ABS({Surface Elevation})
CutHeight   IF({Surface Elevation}<0, 0.1/12, 0.00001)
FillHeight  IF({Surface Elevation}>=0, 0.1/12, 0.00001)
```

`Depth` drops the sign. The two height expressions return a real text height when they apply and a microscopic one when they don't.

> **TK: confirm the height units.** When an expression drives a sheet-size property like text height, it's read in drawing units, not plotted inches, hence `0.1/12` for 0.1" text in a feet drawing. Test at 1"=20' and 1"=40' and in a metric drawing before publishing, and give the metric version (`2.5/1000`?).

## Step 4: two components, two colors

In the label style composer:

| Component | Contents | Text height | Color |
|---|---|---|---|
| `Cut` | `C` + `<[Depth]>` (precision 0.01) | expression `CutHeight` | red |
| `Fill` | `F` + `<[Depth]>` (precision 0.01) | expression `FillHeight` | green |

Stack them in the same spot (same anchor, same attachment). Only one is ever big enough to see, so the label looks like it changes its own prefix *and* color. That's the payoff of the two-component trick: color can't be driven by an expression, but it rides along for free.

TK: screenshot of the composer.

## Step 5: blanket the site

*Annotate → Add Labels → Surface → Spot Elevations on Grid* on the volume surface gives you a cut/fill grid the field crew can actually read. Pair it with a cut/fill elevation-banding style on the same surface and you've got a heat map underneath the numbers.

## Gotchas

- **Zero is a fill.** With `>=0` on the fill side, a no-change spot reads `F 0.00`. If you'd rather it say nothing, add a third tiny band: `IF(ABS({Surface Elevation})<0.005, ...)`. TK: decide whether that's worth the clutter.
- **Rebuilds.** The volume surface rebuilds when either surface changes, and the labels follow. Turn rebuild off on the volume surface if the drawing gets sluggish, and remember to turn it back on.
- **Points can't play.** A point label can show a surface elevation through a reference text component, but expressions can't read reference properties, so this trick is surface-label only. TK: double-check in 2027.
- **Hidden text still exists.** The 0.00001 text is still in the label, so it'll snap and select. It's never been a real problem, but it's a hack, and we should say so.

## Try it

TK: link a small sample DWG (EG, FG, volume surface, the label style) once we decide where downloads live.
