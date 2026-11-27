---
published: false
date: 2026-12-18
title: "LiDAR in the browser: Potree vs Forma"
description: "Two ways to share a point cloud with someone who doesn't have ReCap: a free, static Potree site, or publishing the RCP to Forma Data Management and opening it in the browser."
kicker: "Reality capture"
tags: [point-clouds, lidar, potree, forma, recap, web]
---

TK: intro. Picks up from the [point cloud post](/blog/2026/12/14/geolocated-point-clouds/): the cloud is in Civil 3D, now someone without ReCap or Civil 3D needs to see it.

## Option 1: Forma Data Management (the Autodesk way)

ReCap Pro can **publish** an RCP to Forma Data Management (formerly Autodesk Docs/BIM 360) or Autodesk Drive, and anyone with view access can open it in the browser in the ReCap Viewer.

- TK: steps (Desktop Connector running → ReCap *Publish* → pick the project folder → click the RCP in Docs).
- Only RCP projects can be viewed, not a single RCS on its own.
- ReCap Pro 2027 added point density controls to the viewer for big clouds. TK: check it on the 3DEP tile set.
- Permissions are the project's normal Docs permissions. Good for clients and project teams; not a public link.
- TK: does it show the cloud georeferenced against anything (map, model), or just the cloud?

## Option 2: Potree (the open, static way)

Potree is an open-source WebGL point cloud viewer. PotreeConverter turns LAS/LAZ into an octree of small files the browser streams as you zoom, so it handles clouds far bigger than a browser could load in one go.

- TK: PotreeConverter run on the cropped, ground-classified LAZ (Windows build, one command).
- TK: the page: Potree viewer HTML, measurement tools, elevation coloring, classification toggle.
- TK: hosting. It's static files, same idea as the [Waffle House map](/blog/2026/11/17/waffle-house-weather/), but the octree can be hundreds of MB. GitHub Pages has size limits, so decide where the data lives (object storage? the NAS behind a tunnel?).
- TK: coordinate system: Potree shows projected coordinates as-is; add the EPSG for the coordinate readout.

## Which one when

TK: table. Forma = project team, permissions, no setup, Autodesk account needed. Potree = public, free, anyone with a link, you host it.

## Try it

TK: link to the live Potree page of the site from the point cloud post.
