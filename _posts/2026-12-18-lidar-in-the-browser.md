---
published: false
date: 2026-12-18
title: "LiDAR in the browser: Potree vs Forma"
description: "Two ways to share a point cloud with someone who doesn't have ReCap: a free, static Potree site, or publishing the RCP to Forma Data Management and opening it in the browser."
kicker: "Reality capture"
tags: [point-clouds, lidar, potree, forma, recap, web]
---

The [point cloud post](/blog/2026/12/14/geolocated-point-clouds/) ended with the LiDAR sitting nicely in Civil 3D. That's great for me. It's no help to the client, the reviewer or the project manager who doesn't have ReCap, InfraWorks, or Civil 3D and just wants to look at the dang thing. There are two good ways to put a point cloud in a browser: Autodesk's own viewer in Forma, or an open-source viewer called Potree that I host myself.

## Option 1: Forma Data Management (the Autodesk way)

If the project already lives in Autodesk's cloud, this is the path of least resistance. ReCap Pro can **publish** a project to Forma Data Management (formerly Autodesk Docs and BIM 360) or Autodesk Drive, and anyone with view access can open it in the browser in the ReCap Viewer.

1. Make sure **Desktop Connector** is running.
2. In ReCap Pro, open the project and choose **Publish** from the Home menu.
3. Point it at a folder in the Forma project (through the connected drive) and publish.
4. In Forma, click the RCP. The viewer opens right in the browser, and you can orbit, zoom and switch between point cloud views and RealViews.

Things to know:

- **Only RCP projects can be viewed.** A single RCS on its own can't be uploaded and viewed, so publish the project, not a loose scan.
- **Big clouds have a density slider now.** ReCap Pro 2027 added point density controls to the viewer, so you can trade detail for smoother navigation on something like a full 3DEP tile set.
- **Access is the project's access.** Whoever can see the folder can see the cloud, with the same permissions as everything else in the project. That's exactly what you want for a project team, and exactly what you don't want for a public link.

TK: screenshot of the 3DEP tile set in the viewer, and whether anything else (a model, a map) can be shown alongside it.

## Option 2: Potree (the open way)

[Potree](https://github.com/potree/potree) is a free, open-source WebGL point cloud viewer. It's what a lot of public LiDAR portals and survey firms use, and the whole thing is static files: no database, no app server, nothing running on the back end. Same idea as the [Waffle House map](/blog/2026/11/17/waffle-house-weather/).

### Convert

Potree doesn't read LAZ directly. **PotreeConverter** reorganizes the points into an octree, a level-of-detail structure where the browser loads a coarse version first and only fetches finer detail for the part you're zoomed into. That's how a browser can show a cloud far bigger than it could ever load in one go.

```bat
PotreeConverter.exe C:\lidar\site_ground.laz -o C:\lidar\potree\site
```

Version 2 of the converter writes just three files (the metadata, the hierarchy and one big octree file) instead of the thousands of tiny files older versions made. Much friendlier to copy and upload.

Before converting:

- **Crop first.** Convert the site, not the whole tile set. The limit box from the ReCap post, or a clip in your LiDAR tool of choice, pays off again here.
- **Decide on classes.** A ground-only cloud is small and clean. Keeping buildings and vegetation looks better and lets viewers toggle classes. TK: compare file sizes for both on the same site.
- **Keep the coordinates.** The converter stores an offset, so real-world state plane or UTM coordinates survive the trip. The coordinate readout in the viewer will be in the cloud's units.

### The page

Potree ships example pages; the simplest route is to copy one and point it at your `metadata.json`:

```js
Potree.loadPointCloud("pointclouds/site/metadata.json", "site", e => {
  viewer.scene.addPointCloud(e.pointcloud);
  viewer.fitToScreen();
});
```

What a reader gets for free:

- **Measurements:** distances, areas, angles and point coordinates.
- **Elevation profiles:** draw a line and get a section through the cloud. This is the one civil people love.
- **Coloring:** by elevation (with a gradient), intensity, return, or classification, with classes you can switch on and off.
- **Clipping volumes and annotations:** cut out a box, label a spot.

TK: the live page, with elevation coloring on by default and a starting camera over the site.

### Hosting

This is the real decision. The converted cloud can easily be hundreds of megabytes, and this blog lives on GitHub Pages, which caps any single file at 100 MB and expects a whole site to stay around 1 GB. The point cloud doesn't belong in the site repo.

The options:

- **Object storage** (Cloudflare R2, Amazon S3, Azure Blob). Cheap, built for big static files, and it can serve large files in pieces, which is how the viewer streams the octree. Needs a CORS rule so the blog's page is allowed to read from it.
- **My NAS.** Free and already there, but it means opening something to the internet, and so far I've kept the NAS entirely private. I'm not changing that for a demo.
- **Both:** the page on the blog, the data in object storage. TK: decide, and note what it costs per month.

## Which one when

| | Forma Data Management | Potree |
|---|---|---|
| **Audience** | the project team | anyone with the link |
| **Setup** | publish from ReCap | convert, build a page, host the files |
| **Cost** | part of an Autodesk subscription | free software; you pay for hosting |
| **Access control** | project permissions | public, unless you put it behind something |
| **Tools** | orbit, navigate, RealViews | measure, profiles, classification, clipping |
| **Best for** | client and team review on a real project | public data, portfolios, blog posts like this one |

For project work, I'd use Forma. It's where the project already is, and the permissions come for free. For public data like 3DEP, and anything I want to share with the world, Potree wins.

## Try it

TK: link to the live Potree page for the site from the point cloud post.
