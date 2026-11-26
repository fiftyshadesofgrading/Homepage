---
published: false
date: 2026-11-30
title: "Read a drawing without opening AutoCAD: Autodesk Platform Services on a homelab"
description: "Upload a DWG, let the little hamsters run AutoCAD in the cloud, and land every layer in your own Postgres database. Free tier, self-hosted n8n, no desktop seat required."
kicker: "Automation"
tags: [aps, design-automation, autocad, civil-3d, n8n, postgres, lisp]
---

<!--
DRAFT. TK = to come / to check before publishing.
- Paste the final layers.lsp (and activity.json) from the LayerDump project into step 4.
- Screenshots wanted: (1) the APS app's credentials page with the secret blurred, (2) the n8n Run workflow, (3) the layer table in pgAdmin.
- Re-check the APS free tier terms and Design Automation pricing on the APS site the week this goes out.
- Keep it anonymous: no names, IPs, bucket names, client IDs, or employer references.
-->

I do my best work in a hotel lobby café or an airport. There's something about being on the move: the energy of transition gives me perspective. In reality, I'm sitting by a giant window on Commercial Street in Portland, walking distance from my home-office. Hopping between the home-office, jobsite, client meeting and coffeeshop, I got curious (bored, honestly) about what I could offload to the cloud. Could I chuck in a drawing (`.dwg`) and get data out the other end?

Overcaffeinated, perhaps, but here's the thing that still feels like a magic trick: you drop a `.dwg` into a web form, and a minute later every layer in that drawing (name, color, linetype, lineweight, on, frozen, locked, plot) is sitting in a database table you own. Nobody opened AutoCAD. No seat was used. The drawing was opened by a copy of AutoCAD running on Autodesk's servers.

That's **Design Automation**, part of Autodesk Platform Services (APS, the platform formerly known as Forge). This post walks through getting it running from a homelab, the five things that tripped us up, and what changes when you try the same thing inside a company.

## What you need

- **An Autodesk account and an APS developer hub.** APS has a free tier, and you don't need a Forma or ACC subscription to sign up. Developer access is separate from your product licenses.
- **Something to orchestrate the calls.** We used [n8n](https://n8n.io/), a self-hosted workflow tool, running in Docker. Any scripting language works; n8n just makes each step visible and re-runnable.
- **A database for the results.** Postgres here, but a CSV would do for a first test.
- **A little AutoLISP.** Design Automation runs AutoCAD's core engine (no UI), so your script is how you tell it what to do.

## 1. Make an app and get credentials

In the APS developer portal, create a developer hub, then an **application** inside it. The app gives you a **Client ID** and a **Client Secret**. Treat the secret like a password: don't paste it into scripts or commit it to a repo, and don't hit *Regenerate* unless you mean to (the old one stops working immediately).

For a server talking to APS on its own behalf (no user signing in), you use the **client credentials** flow, also called 2-legged auth.

## 2. Set up the token in n8n

Create an **OAuth2 API** credential in n8n:

- **Grant type:** Client Credentials
- **Access Token URL:** `https://developer.api.autodesk.com/authentication/v2/token`
- **Scope:** `data:read data:write data:create bucket:create bucket:read code:all`
- **Authentication:** *Header* (Basic auth). The v2 token endpoint wants the ID and secret in the Authorization header, not the request body.
- **Allowed HTTP request domains:** `developer.api.autodesk.com`, so the token can only ever be sent to Autodesk.

`code:all` is the one people miss. Without it you can get a token, but you can't register anything with Design Automation.

## 3. The moving parts

Design Automation has its own vocabulary, and it clicks once you map it to things you know:

| Term | What it is |
|---|---|
| **Engine** | A version of AutoCAD running headless in the cloud. Pick the newest one listed for your account. |
| **AppBundle** | Your code (here, a LISP file) zipped up and uploaded. |
| **Activity** | A saved "recipe": which engine, which AppBundle, what command to run, which files go in and come out. |
| **WorkItem** | One run of an Activity against one drawing. |
| **OSS bucket** | Autodesk's file storage. Drawings go in, results come out, via signed URLs. |

## 4. Two workflows: set up once, run many times

**Setup** (run once): list the engines and pick the newest, create a bucket, upload the LISP as an AppBundle, and register the Activity with an alias like `prod`.

**Run** (every drawing):

1. An n8n form takes the `.dwg` upload.
2. Upload it to the bucket through a signed URL.
3. Submit a WorkItem that points the Activity at that file and at an output location.
4. Poll the WorkItem's status every 10 seconds until it succeeds or fails.
5. Download the result (`layers.json`) and insert it into Postgres as a `jsonb` row.

TK: the LISP. In short, it walks the layer table with `tblnext`, reads each layer's properties, and writes them out as JSON for the WorkItem to return.

## 5. The five things that bit us

1. **The token request failed** until the credential was switched to *Header* authentication.
2. **A 404 on upload** turned out to be an unencoded `/` in the object key. URL-encode object names.
3. **A LISP function that works on the desktop didn't exist in the cloud.** The engine has no UI, so anything that leans on it is missing. We read the drawing's dictionaries directly instead (for layouts, the `ACAD_LAYOUT` dictionary).
4. **The "JSON" came back as a file.** The storage service returns results as a download, so the HTTP node passed along the previous step's output instead. Setting the node's response format to JSON fixed it.
5. **Postgres permission denied.** The schema belonged to the account n8n writes with, and the read-only account used for browsing can't grant itself access. Run grants as the owner.

When the job fails, the WorkItem's `reportUrl` is your friend: it's the AutoCAD command-line log from the cloud session, and it usually names the exact line that broke.

## 6. What it's good for

Once layers are rows, comparing two CAD templates is one SQL query:

{% highlight sql %}
WITH a AS (SELECT l->>'name' n, l FROM aps.layer_fingerprint f, jsonb_array_elements(f.payload->'layers') l WHERE f.id = 1),
     b AS (SELECT l->>'name' n, l FROM aps.layer_fingerprint f, jsonb_array_elements(f.payload->'layers') l WHERE f.id = 2)
SELECT coalesce(a.n, b.n) AS layer,
       CASE WHEN a.n IS NULL THEN 'added' WHEN b.n IS NULL THEN 'removed' ELSE 'changed' END AS status,
       a.l - 'name' AS was, b.l - 'name' AS now
FROM a FULL JOIN b ON a.n = b.n
WHERE a.l IS DISTINCT FROM b.l
ORDER BY status, layer;
{% endhighlight %}

We tested it on a publicly available government CAD standards template, and the same pattern ran two more jobs: plotting a drawing to PDF with Autodesk's stock plot activity, and a custom LISP that plots every paper-space layout to its own named PDF.

## Doing this inside a company

The homelab version is a proof of concept. Inside a firm, the tech is the same but the questions change:

- **Whose app is it?** Register the APS app in a company-owned developer hub, not a personal one, so it survives people changing jobs.
- **Where do the files go?** Design Automation processes drawings on Autodesk's cloud. Most firms already store project files in Autodesk's cloud, but a client contract or IT policy may still have something to say about it. Ask first.
- **Secrets.** Client secrets belong in a secrets manager or the workflow tool's credential store, with someone responsible for rotating them.
- **Least privilege.** Ask only for the scopes each job needs. Reading files from the firm's Forma/ACC hub uses 3-legged auth and needs an admin to approve the app as a custom integration.
- **Cost.** Check your plan before scaling up. Design Automation usage is metered on paid plans.
- **Make the case with a demo.** A working pipeline on a real template answers more IT questions than a slide deck.

TK: closing line and a link to the next post in the series.
