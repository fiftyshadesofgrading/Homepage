---
published: true
date: 2026-12-03
title: "AutoCAD without AutoCAD: accoreconsole"
description: "Every AutoCAD install ships a headless command-line version that runs scripts against drawings without opening the program. Batch-fixing a folder of DWGs becomes one line."
kicker: "AutoCAD nuts and bolts"
tags: [autocad, automation, scripts, batch]
---

Every AutoCAD install, Civil 3D included, ships a second copy of AutoCAD that flies under the radar. It has no ribbon, no graphics window and no dialogs, and it opens in a fraction of the time. It's called `accoreconsole.exe`, and it's the easiest batch tool you already own.

## What it is

Look in the AutoCAD install folder (for example `C:\Program Files\Autodesk\AutoCAD 2027\`) and you'll find `accoreconsole.exe` next to `acad.exe`. It's the same core drawing engine without the user interface: it opens a drawing, runs a script against it, saves, and quits.

It's also a close cousin of what Autodesk runs in the cloud for Design Automation. Tomorrow's post does this same trick on Autodesk's servers instead of locally on my laptop.

## Run one drawing

```bat
"C:\Program Files\Autodesk\AutoCAD 2027\accoreconsole.exe" /i "C:\jobs\site.dwg" /s "C:\scripts\fix.scr" /l en-US
```

- `/i` is the drawing to open.
- `/s` is the script to run on it.
- `/l en-US` sets the language, which saves you from a surprise when the default doesn't match your install.

And a script that makes a change you can see:

```
-LAYER M C-ANNO-NOTE C 2 C-ANNO-NOTE 
-PURGE A * N
QSAVE
```

That makes (or sets current) a layer, sets its color, purges, and saves. Note the trailing space on the first line: in a script, a space is Enter, and `-LAYER` needs one more to get back to the command prompt.

If you're working with Civil 3D drawings, run the console from the Civil 3D install and add `/product C3D` so the Civil 3D objects load properly. Without it they come through as proxy objects, which is a whole post of its own.

## Run a folder

This is where it earns its keep. A PowerShell loop over every drawing in a folder, with a log:

```powershell
$acc = "C:\Program Files\Autodesk\AutoCAD 2027\accoreconsole.exe"
$scr = "C:\scripts\fix.scr"
$log = "C:\scripts\fix.log"

Get-ChildItem "C:\jobs\sheets" -Filter *.dwg | ForEach-Object {
    "=== $($_.Name)" | Out-File $log -Append
    & $acc /i $_.FullName /s $scr /l en-US | Out-File $log -Append
    "exit code $LASTEXITCODE" | Out-File $log -Append
}
```

Work on a copy of the folder the first time. A script runs exactly what you wrote, on every drawing, with nobody watching.

## What it won't do

- **No dialogs.** Anything that opens a dialog either fails or waits forever. Use the command-line versions: `-LAYER`, `-PURGE`, `-PLOT`, `-INSERT`.
- **No ActiveX/COM.** Plain AutoLISP works fine, but `vla-` and `vlax-` functions don't, because they rely on the UI side of AutoCAD.
- **.NET plugins with care.** A plugin only loads if it sticks to the core APIs and doesn't touch the editor UI.
- **The log is chatty.** The console echoes every prompt, so search the log for errors rather than reading it top to bottom.

## Things I use it for

- Purge, audit and fix regapps on a whole folder (see [the DWG diet plan](/blog/2026/11/30/fat-dwg-diet/)).
- Bring every drawing in a set up to a layer standard.
- Plot every layout to PDF with `-PLOT` and a saved page setup.
- Report drawing units and coordinate systems across a project with one line of LISP: `(princ (getvar "INSUNITS"))`.

Once you've run one folder this way, you won't want to open forty drawings by hand again.
