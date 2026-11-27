---
published: true
date: 2026-12-14
title: "LiDAR to Civil 3D: point clouds that land where they belong"
description: "Download USGS 3DEP LiDAR in bulk, index it in ReCap Pro, and attach it to Civil 3D in the right place, at the right scale and elevation. Plus why a geolocated cloud goes in at 0,0,0."
kicker: "Reality capture"
tags: [civil-3d, point-clouds, recap, coordinate-systems, gis]
---

Public LiDAR is one of the best free things a civil designer can get. The USGS 3D Elevation Program (3DEP) has flown most of the country, and the classified point clouds are there for anyone to download. Getting them into Civil 3D in the right place, at the right scale and at the right elevation is where people lose an afternoon and their sanity. This is my procedure, start to finish.

## The short version

1. Find the 3DEP project that covers the site, and **write down its coordinate system, units and vertical datum**.
2. Build a list of tile URLs and **batch download** the LAZ files.
3. **Import and index** the tiles in ReCap Pro, telling it the units and coordinate system the data was *delivered* in.
4. **Attach** the RCP in Civil 3D (at 0,0,0, which feels wrong; more on that below) and **prove it landed** against something independent.

## Point clouds, not DEMs

3DEP publishes two kinds of elevation data. The **LiDAR point cloud** (LAZ tiles) keeps every point, with intensity, return and classification. The **DEM** products are gridded, bare-earth rasters derived from it. If a bare-earth raster is all you need, grab the DEM and skip this post. If you want to build your own surface, check features, or have the real thing as a backdrop, you want the point cloud.

## Find the data

Two USGS tools, and I use both:

- **[LidarExplorer](https://apps.nationalmap.gov/lidar-explorer/#/)** shows which 3DEP projects cover the site, with their **quality level** (QL0 is best, QL3 is coarsest) and **collection year**. Where projects overlap, prefer the newest, highest-quality collection, and avoid mixing two projects on one site unless you can live with the seam.
- **[The National Map Downloader](https://apps.nationalmap.gov/downloader/#/)** builds the download list. Pick *Elevation Source Data (3DEP) – Lidar, IfSAR*, filter to LAZ, draw the area of interest, and **Search Products**. Each result is one tile. Save the list as TXT or CSV.

## Write down the metadata first

For every project the tiles come from, record:

- project name and collection year
- quality level and nominal point spacing
- horizontal coordinate system and EPSG code
- vertical datum and geoid model (NAVD 88 with GEOID18, say)
- horizontal and vertical units
- tile naming scheme and tile size

Every decision downstream depends on this, and digging it up later is tedious. **Don't assume meters.** USGS delivers each project in the coordinate system and units it was collected in. The LiDAR specification prefers meters but doesn't require them, and older collections in US survey feet turn up regularly. Read the units from the LAS header or the project metadata.

## Batch download

Turn the saved list into a plain text file, `URLS.txt`: one URL per line, no header, no quotes, and only LAZ tiles (no metadata or preview images). Then either of these, both built into Windows.

**curl** (in Windows since Windows 10 version 1803). Save as `download.bat` next to `URLS.txt`:

```bat
@echo on
if not exist LAZ mkdir LAZ
pushd LAZ
for /f "tokens=*" %%a in (..\URLS.txt) do curl -L -f -O --retry 5 --retry-delay 5 --retry-connrefused "%%a"
popd
```

- `-L` follows redirects. The download links redirect to cloud storage, so without it you get nothing.
- `-f` fails on an HTTP error instead of saving the error page as a `.laz`.
- `-O` keeps the USGS tile name.
- The `--retry` flags ride out hiccups over a long queue.
- `pushd`/`popd` are what put the files in the `LAZ` folder, because `-O` always writes to the current folder.

**PowerShell with BITS**, which throttles around other traffic and survives reboots, so it's the better fit for big tile sets (it may be blocked on locked-down work machines):

```powershell
New-Item -ItemType Directory -Force .\LAZ | Out-Null
Get-Content .\URLS.txt | ForEach-Object { Start-BitsTransfer -Source $_ -Destination .\LAZ }
```

### Check the download before indexing

Re-indexing an incomplete tile set costs more than a two-minute check:

```bat
find /c /v "" URLS.txt
dir /b LAZ\*.laz | find /c /v ""
```

The two counts should match. Sort by size and look for anything suspiciously small; that's a potential failed transfer. Delete it and re-run the script (both versions overwrite, so a re-run fills the gaps). Open one tile before importing everything, to confirm the header carries the coordinate system you expect. And keep `URLS.txt` with the data: it's the record of exactly what you downloaded.

## In ReCap Pro

ReCap reads LAS and LAZ directly, so there's nothing to unzip.

1. **New Project → Import Point Cloud**, and save it to fast local storage. Display over a network path crawls.
2. Select all the tiles. Each one comes in as a scan in the project.
3. **Before you hit import, check the coordinate system and units.**
4. Index, then open the project.

### Units and coordinate systems

- Set the **input coordinate system** to match the LAS header for that project.
- Set the **units the data was delivered in**, not the units of the drawing it's headed for. Tell ReCap "feet" when the data is meters and the cloud comes out scaled by about 3.28 and lines up with nothing.
- If the cloud is in meters and the drawing is in feet, **pick one place to convert**: in ReCap, or in Civil 3D when you attach. Converting in both is a very common mistake, and a hard one to spot.
- **ReCap doesn't do geoid transformations.** Elevations pass through exactly as delivered.
- Sometimes the LAS header and the metadata disagree, and you have to make an educated call (a UTM zone, say) to get it to line up. Write down what you assumed.

### Clean up

- Tiles from one 3DEP project share a coordinate system and edge-match by specification. **Don't run Auto Register** on tiled aerial LiDAR; there's nothing to register.
- Use the **limit box** to crop to the area of interest. It cuts file size and makes everything downstream faster.

### Ground classification: usually skip it

ReCap Pro has **automatic ground classification**. For 3DEP data you generally shouldn't run it: the points already come classified (ground, vegetation, buildings, water, noise) by the data producer, and the automatic tool overwrites that with just two classes, ground and everything else. There's no merge.

Where it earns its keep is data with no classification: drone photogrammetry, terrestrial scans for existing ground, and older LiDAR that came unclassified or badly classified. Set the level of detail (less detail gives a smoother ground that ignores low vegetation and curb noise), let it run, then check ditch bottoms, breaklines and heavy canopy, which is where it fails first. It's an estimate, not a survey.

**The gotcha:** hiding non-ground classes and saving the project doesn't carry through. Civil 3D still sees the full cloud. To get a ground-only cloud, delete everything except the ground classification, then **export to a new RCP** (don't just save) and attach that one.

### Saving

- An RCP is a project file plus a support folder with one RCS per scan. Move them together, or the reference breaks.
- Attach the RCP for the whole tile set, or a single RCS when one tile is enough. Export one consolidated RCS for handing off.
- ReCap can't export LAS or LAZ. If you need LAS downstream, export E57 and convert it with another tool.
- For repeat jobs, ReCap installs a command-line indexer (`decap.exe`) that does the same import without the interface.

## In Civil 3D: the 0,0,0 thing

1. Start a new drawing from your template.
2. Assign the project coordinate system (*Toolspace → Settings → Edit Drawing Settings*, or `MAPCSASSIGN`).
3. `POINTCLOUDATTACH` and pick the RCP or RCS.

Now the part that still confuses me a little. The attach dialog may offer to place the cloud by **geographic location**. Often it doesn't, or it doesn't behave the way you'd expect. What reliably works for indexed 3DEP data is:

- **Geographic location off.**
- **Insertion point 0,0,0.** Rotation 0.
- **Scale for units only:** 1 if the cloud and drawing share units, or the meters-to-feet factor if they don't (and only if you didn't already convert in ReCap).

It feels wrong to put a geolocated cloud at the origin. As far as I can tell, ReCap stores the points in their real-world projected coordinates, and Civil 3D doesn't transform them at all. Inserting at 0,0,0 just means "don't move anything", so the points land at their own eastings and northings. That only works if the drawing is in the **same coordinate system** as the cloud, which is why step 2 matters.

On the scale factor, **feet aren't all the same feet**. Meters to US survey feet is 3937/1200 (3.2808333…); meters to international feet is 3.2808399. Over state plane coordinates in the millions, picking the wrong one moves the cloud a few feet. Match whatever the drawing uses or set the units to scale inserted content to match the point cloud. 

Once it's placed, **lock it**.

## Prove it landed

Don't trust it until it passes these:

- **Coordinates.** Pick a point on the cloud and compare its northing, easting and elevation against the LAS header extents or, better, a known survey point.
- **Elevations.** A uniform offset of roughly 20 to 35 meters is the classic geoid vs ellipsoid height mismatch. In Maine it's about 28 meters, so ellipsoid heights read about 90 feet higher than NAVD 88.
- **Extents.** A cloud that stops short of the site usually means missing tiles, not a coordinate problem.
- **A known distance.** Measure something you know. Off by 3.28 or 0.3048 is a units mismatch.

## Then make it useful

- **Crop** the cloud to the site or corridor instead of displaying the whole tile set.
- *Create Surface from Point Cloud* builds a TIN. For bare earth, use only the ground class.
- **Decimate** when you build the surface. 3DEP density is far more than a terrain surface needs. Keep the cloud as reference and design on the surface.
- If display drags, lower the point density or level of detail.

## A note on InfraWorks

InfraWorks is the opposite of Civil 3D here: it **reprojects** incoming data to the model's coordinate system. So set the model coordinate system *before* adding any data, then add the RCP, RCS or the LAZ files directly from Data Sources. Crop in ReCap first, because full-density clouds over big areas drag InfraWorks down fast, and for terrain over a large area, the 3DEP DEM is usually quicker and lighter than the point cloud. If the cloud floats above or sinks below the terrain, that's a units or vertical datum problem, not a display setting.

## Next time

Putting the cloud on the web with Potree, so anyone can spin it around in a browser. Same idea as the [Waffle House map]({% post_url 2026-11-17-waffle-house-weather %}): a folder of static files and no server.
