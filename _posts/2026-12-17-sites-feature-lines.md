---
published: true
date: 2026-12-17
title: "Sites: why your feature lines keep breaking each other"
description: "In Civil 3D, objects in the same site talk to each other whether you want them to or not. A five-minute explanation that saves hours of mystery splits."
kicker: "Civil 3D grading"
tags: [civil-3d, grading, feature-lines, sites, parcels]
---

You draw two feature lines. They cross. Suddenly one of them has a new vertex you never added, with an elevation you never set, and moving one line changes the other. Nothing's broken. They're in the same **site**, and in a site, objects talk to each other whether you want them to or not.

## The symptoms

- Feature lines that cross get **split points** (or elevation points) at the intersection, and the elevations start depending on each other.
- Editing one feature line changes the grade of another one you weren't touching.
- Grading groups grow strange edges where they meet other linework.

## What a site actually is

A site is a **topology container**. Everything inside it is treated as part of one connected network of linework:

- feature lines,
- parcel lines (and the parcels they form),
- grading groups and their footprints,
- and alignments, if you put them in a site.

Where two feature lines cross inside the same site, Civil 3D makes them share that point, and it can only have one elevation. That's genuinely useful when it's what you meant: a curb line and a sidewalk line meeting at a corner *should* share an elevation. When it's not what you meant, it's absolute chaos and anarchy.

Objects in **different** sites ignore each other completely.

## Living with sites

- **One site per purpose.** "Pond", "Parking lot", "Lots", "Existing". Linework that should interact goes in the same site; linework that shouldn't goes somewhere else.
- **Keep alignments out of sites.** Since 2011 alignments can be created siteless, and that should be your default. An alignment in a site cuts parcels in half and splits feature lines, which is almost never what you want.
- **Move things deliberately.** Feature lines and parcels can be moved or copied to another site from their right-click menus. If something's interacting when it shouldn't, moving it to its own site is usually the whole fix.
- **Beware "Site 1".** Every drawing makes one by default, and everything lands in it unless you choose otherwise. A drawing where everything lives in Site 1 is a drawing where everything is quietly splitting everything else. Rename it to something meaningful and make new sites on purpose.

## Parcels: why some of it is a feature

Parcels show why sites work the way they do. Parcels aren't drawn as closed shapes. They're *found*: any closed area formed by parcel lines (and alignments) in a site becomes a parcel. Draw a lot line across a parcel and you get two parcels. Put a right-of-way alignment in the site and the parcels split along it.

For a subdivision, that's exactly what you want: lot lines and road frontages working together, with areas that update as the layout changes. It's the same behavior that bites you with feature lines, just pointed at the right job.

So the five-minute version is this: before drawing grading linework, ask which other lines it *should* share elevations with. Put those in one site, and everything else somewhere else.
