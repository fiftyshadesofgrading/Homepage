---
published: true
date: 2026-12-08
title: "A home NAS that runs a real data stack"
description: "Postgres with PostGIS, a workflow scheduler, a small API worker and push alerts, all in containers on a consumer NAS, plus the backups that make it safe."
kicker: "Homelab"
tags: [homelab, docker, postgres, postgis, n8n, backups]
---

My data platform isn't in the cloud. It's a five-bay consumer NAS in a closet, running a proper database, a workflow scheduler, a small API, push alerts and a couple of wikis and dashboards, all in containers. It's been one of the best learning tools I've ever had, because when something breaks, it's mine to fix.

## The stack

```
                 ┌────────────── NAS (Docker, managed in Portainer) ──────────────┐
 phone/laptop ── │  n8n (schedules, fetches APIs) ──►  Postgres + PostGIS          │
  (VPN only)     │  FastAPI worker (Python jobs) ──►   one server, many schemas    │
                 │  Gotify (push alerts)  ◄── health checks from n8n & the worker │
                 │  dashboards, wiki, other apps                                  │
                 └────────────────────────────────────────────────────────────────┘
                                   │ nightly block-level backup
                                   ▼
                              second NAS
```

- **Postgres with PostGIS:** the center of everything. Baseball stats, CAD template data, map data.
- **n8n:** a self-hosted workflow tool that wakes up on a schedule, calls APIs and loads results.
- **A FastAPI worker:** a small Python container for the jobs that are easier in Python than in a workflow tool.
- **Gotify:** push notifications to my phone when a load fails or a health check goes red.
- **Portainer:** a web UI over Docker, so I can see and restart containers without SSHing in.

## Ground rules

These came from mistakes and near misses:

- **One database server, many schemas.** Each project gets its own schema and its own login. The workflow tool writes to the schemas it owns, and nothing else.
- **A read-only login for browsing.** When I'm poking around in a SQL client, I'm logged in as a user that can't break anything.
- **Grants are run by the owner.** A read-only user can't grant itself access, which is the point. (I learned this from a "permission denied" error.)
- **Never change a working port mapping.** New services reuse what's there or take a new port. Everything connected to the old port is something I'd have to remember, and I won't.

## Getting to it from anywhere

Nothing on the NAS is open to the internet. No port forwarding, no UPnP, and the router's remote admin is off.

Instead, everything goes through a mesh VPN (Tailscale), with the NAS acting as a **subnet router**: my laptop and phone can reach the whole home network from anywhere, as if I were on the couch. The NAS's key doesn't expire, so the door doesn't quietly lock while I'm traveling. Router logs go to the NAS too, so I can see who or what's knocking.

## Backups you can actually restore

- **A second, smaller NAS** is the backup target, so a backup isn't sitting on the same disks it's protecting.
- **A block-level backup job runs every night**, with old versions thinned out over time rather than kept forever.
- **Data scrubbing** runs on a schedule to catch bad sectors before they become missing data.
- **The whole NAS can be rebuilt from backup**, configuration included, not just the files.
- **RAID 5 on the primary NAS**, RAID is not a backup strategy but with multiple bays available it is important to consider parity and/or cold spare drives. 

The part everyone skips is the test restore. A backup you've never restored is a rumor. Pick a database, restore it somewhere harmless, and run a query against it.

## What I'd do differently

- **Give the database its own stack.** Mine started life inside the workflow tool's Docker stack, which means touching one risks the other.
- **Keep logic in the database, not the workflow tool.** My first big workflow did everything in workflow nodes and became a mess. Now the workflow fetches data, and views, functions and triggers in Postgres do the rest. Fewer moving parts, and they're all in one place.
- **Sort out code sync on day one.** I bounce between a Windows machine and a Linux laptop, and scripts drifted between them for weeks before I put everything in git properly.
- **Build the pages I actually want.** Off-the-shelf dashboards were great for a start, but my data is varied enough that small custom web pages ended up being the better view.
