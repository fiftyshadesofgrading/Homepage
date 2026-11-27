---
published: true
date: 2026-12-16
title: "Corridor frequency: your quantities depend on it"
description: "A corridor is only as accurate as where it takes samples. How frequency, regions and targets change your earthwork numbers, with a test you can run."
kicker: "Civil 3D corridors"
tags: [civil-3d, corridors, earthwork, quantities]
---

A corridor looks like a continuous road, but it isn't. Civil 3D applies the assembly at specific stations and connects the dots with straight lines. Where it takes those samples, the **frequency**, quietly decides how accurate your surface, sections and earthwork quantities are. It helps to think about frequency the same way as surface triangulation. A TIN has no perfect way to fit a curve, so it [tessellates](https://www.youtube.com/watch?v=Qg6BwvDcANg): it breaks the curve into straight edges and flat triangles. The same trade-off between turning curves into straight pieces and keeping file size sane shows up in corridor-world, especially along curves.

## What frequency actually is

At every frequency station, Civil 3D drops the assembly onto the alignment and profile and works out every assembly point, link and shape. Between two frequency stations, everything is a straight line from one station to the next.

On a straight, flat tangent, that's just dandy! On a tight curve, a crest/sag, or a curb return, straight lines between samples cut corners and the corridor surface and volumes cut them too.

## Where to set it

*Corridor Properties → Parameters*, then the frequency button for each region. The settings are:

- **Along tangents:** a fixed spacing.
- **Along curves:** a fixed increment, or a mid-ordinate distance, which adds samples where the curve is tighter.
- **Along spirals** and **along profile curves:** their own spacing.
- **At geometry points:** extra samples exactly at horizontal geometry points (PC, PT), superelevation critical points, profile geometry points and profile high and low points, and offset target geometry points.
- **At offset targets:** extra samples along offset target geometry, or immediately before / after the target begins & ends. 

Turn the "at geometry points" options on. They cost very little, and they put samples where the geometry actually changes, not wherever the spacing happens to land. This can be used to include the helpful profile high points and low points to ensure that the corridor captures the local minimum and maximum elevations along the profile. Toggling on the Adjacent Target stations can be used to ensure that the corridor captures the state of the corridor geometry immediately before the target begins, and capture the geometry immediately after - or adjacent to the target location. 

## Test it and discover your project optimum frequency

The quickest way to see what frequency does to your numbers is to run it on your own job:

1. Copy a corridor that has a decent curve and a vertical curve in it.
2. Rebuild it with tangent and curve frequencies of 50, 25, 10 and 5 feet.
3. For each one, compare the earthwork (a volume surface against existing ground, or your material list), and look at the corridor surface on the tightest curve.

Write the volumes in a little table. You'll see the numbers move, then settle down as the spacing gets tighter, and you'll see build time go up the whole way. The spacing where the numbers stop moving is the one your project needs. That's a better answer than any rule of thumb, including mine. A levee in Mississippi and a runway intersection in New York will each need their own frequency: the one that represents the model with the most accuracy and the least overhead.

## Regions and targets

Frequency (along with other critical region properties) is set **per region**, and that's where the real accuracy comes from. A curb return isn't just a tight curve; the curb is following a separate target (the edge of the return), not the alignment. Give each return its own region, set its width and elevation targets, and give that region a much tighter frequency than the mainline. Otherwise the return gets sampled at the mainline spacing, and the curb comes out as a polygon.

A curb return always ends up in its own region anyway, and its baseline isn't the road centerline. It's the curb return's own alignment and profile, swinging around a tight radius. That baseline is all curve, so a frequency that's fine for the mainline is far too coarse here. Respect the curvature: sample the return by a small increment or mid-ordinate, and the curb comes out round.

The same applies to tapers, driveway aprons, and anywhere a target pulls the assembly off its normal shape: give it a region, and sample it like it matters.

## Where I set it

As a starting point, not a rule:

- **Tangents:** 25 ft while designing, tightened to 10 ft for final quantities and sections.
- **Curves:** by mid-ordinate curvature around 2" accuracy, so tight curves automatically get more samples.
- **Curb returns and tapers:** their own regions, sampled every few feet.
- **Every "at geometry points" option:** on.

Then I run the test above on the real corridor before quantities go out. Design fast with coarse sampling; quantify slowly with fine sampling. Just don't send out numbers from the fast version and understand that different corridor models can serve project specific purposes. 
