---
published: false
date: 2026-11-23
title: "Point clouds that land where they belong"
description: "Getting a LiDAR or scan point cloud into Civil 3D in the right place, at the right scale, at the right elevation, and how to prove it."
kicker: "Reality capture"
tags: [civil-3d, point-clouds, recap, coordinate-systems, gis]
---

<!--
DRAFT. TK = to come / to check before publishing.
Data idea: a USGS 3DEP LAZ tile of somewhere fun (a ballpark? a ski hill?) so readers can follow along.
Screenshots wanted: ReCap import coordinate system settings, the Attach Point Cloud dialog with
"Use Geographic Location", the cloud over the AutoCAD map backdrop.
-->

A point cloud dropped into a drawing at 0,0,0 is a very expensive picture of the wrong place. Getting it to land on your project coordinates is mostly about asking three questions *before* you import anything.

## The three questions

1. **What horizontal coordinate system is it in?** Public LiDAR (USGS 3DEP, state programs) is often UTM or state plane in meters. Survey scans are usually in the project's state plane zone, or in a local scanner coordinate system that still needs registering to control.
2. **What units?** Meters, international feet, or US survey feet. The two feet differ by 2 parts per million. That sounds like nothing until your state plane coordinates are in the millions and the cloud lands a few feet off. NGS retired the US survey foot for the new datums at the start of 2023, but plenty of existing data still uses it.
3. **What vertical datum?** NAVD 88 in feet or meters, or ellipsoid heights straight off GNSS. A cloud in ellipsoid heights will float tens of meters off your surface. TK: give the Maine number, roughly how far the geoid sits from the ellipsoid there.

The metadata (or the surveyor) answers all three. If nobody can, stop here.

## In ReCap Pro

Import the LAS/LAZ or E57 and set the coordinate system in the import's advanced settings, so the project knows where it is. TK: confirm the current ReCap Pro wording and whether it reprojects on import or only tags the data. Index it to an RCP/RCS.

## In Civil 3D

1. **Set the drawing's coordinate system first:** *Drawing Settings → Units and Zone* (or `GEOGRAPHICLOCATION`). Make sure the drawing units match the zone's units.
2. **Attach the cloud:** *Insert → Point Cloud* (`POINTCLOUDATTACH`). When both the drawing and the RCP carry a coordinate system, the dialog offers **Use Geographic Location**. Tick it and AutoCAD places the cloud using the two coordinate systems instead of an insertion point.
3. **No coordinate system on the cloud?** Then it's insertion point 0,0,0, scale 1, rotation 0, and the units had better already match.

## Prove it landed

Don't trust it until you've checked it against something independent:

- **Control.** Snap to a monument, a manhole rim or a building corner in the cloud and compare it to the survey. That's the real test.
- **The map backdrop.** With the drawing geolocated, turn on the online map (`GEOMAP`) and look for roads and rooftops lining up. It's good for catching meters-vs-feet blunders, not for checking tenths.
- **Elevations.** Compare a few cloud points against a known benchmark or the existing surface. A constant offset usually means a vertical datum or geoid problem.

## Then make it useful

*Create Surface from Point Cloud* turns the cloud into a TIN, with ground-only classification and non-ground filtering (TK: list the filter options in 2027 and which one we actually use). Keep the surface and drop the cloud from the drawing when you're done. Your file size will thank you.

## Next time

Put the cloud on the web with Potree, so anyone can spin it around in a browser. Same idea as the [Waffle House map]({% post_url 2026-11-17-waffle-house-weather %}): a folder of static files and no server. TK.
