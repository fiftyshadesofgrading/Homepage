---
published: false
date: 2026-12-02
title: "A home NAS that runs a real data stack"
description: "Postgres with PostGIS, a workflow scheduler, a small API worker and push alerts, all in containers on a consumer NAS, plus the backups that make it safe."
kicker: "Homelab"
tags: [homelab, docker, postgres, postgis, n8n, backups]
---

<!--
STUB. TK = to come. Set `date` to the day you publish.
First person ("I"), keep it anonymous (no hostnames, IPs, team names, employers).
-->

## The stack

TK: Postgres/PostGIS, n8n, a FastAPI worker, Gotify alerts, managed with Portainer. Diagram.

## Ground rules

TK: one database server, separate schemas and users per project, a read-only login for browsing, never change working port mappings.

## Getting to it from anywhere

TK: Tailscale with the NAS as subnet router; no ports open to the internet.

## Backups you can actually restore

TK: second NAS as target, block-level nightly job, data scrubbing, a test restore.

## What I'd do differently

TK
