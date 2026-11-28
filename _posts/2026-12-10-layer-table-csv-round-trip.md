---
published: true
date: 2026-12-10
title: "Edit a drawing's layers in a spreadsheet, then push them back"
description: "Dump a layer table to CSV, review it in Excel, and apply adds, renames and deletes in one transaction. The trick is an explicit action column."
kicker: "Templates and standards"
tags: [civil-3d, autocad, csharp, layers, templates]
---

Layer standards get reviewed by people who live in Excel. The CAD manager, the project engineer, the client's standards person: they want a spreadsheet they can sort, filter and mark up, not a Layer Properties Manager they have to screenshot. So I built a round trip: dump the layer table to CSV, let people edit it, and push the changes back into the drawing.

## Why a spreadsheet

- **Everyone can review it.** No CAD seat needed to read or comment on a layer standard.
- **Filters and sorting.** "Show me every layer that doesn't plot" is two clicks in Excel and a lot of scrolling in AutoCAD.
- **It diffs.** Two CSVs from two templates can be compared line by line, by eye or by tool.
- **Bulk changes are bulk.** Changing the lineweight of forty layers is a fill-down, not forty clicks.

## Dump

One command, `LAYERLISTDUMP`, writes the layer table to CSV in the same column order as the Layer Properties Manager: name, on, freeze, lock, plot, color, linetype, lineweight, description and so on. Matching the column order matters more than it sounds. Reviewers recognize the layout and stop asking what each column means.

The dump adds two empty columns at the end: **Action** and **New Name**.

## Edit: say what you mean, per row

Every row gets an action, or none:

| Action | What happens |
|---|---|
| *(blank)* | Leave the layer alone. |
| `ADD` | Create a new layer with the properties in that row. |
| `MODIFY` | Update the existing layer to match the row. |
| `RENAME` | Rename the layer to the value in **New Name**. |
| `DELETE` | Delete the layer, if nothing uses it. |

Why not just diff the edited sheet against the drawing and work out what changed? Because of the rows people delete. If someone removes a row to tidy the spreadsheet, or a filter hides rows when they save, a "make the drawing match the sheet" tool would quietly delete those layers. With an explicit action column, a missing row means nothing. **There's no delete by omission**, only delete by asking.

## Apply: preview, confirm, one transaction

`LAYERLISTUPDATE` reads the edited CSV and does three things in order:

1. **Validate every row first.** Unknown layer to modify, a rename onto a name that already exists, a linetype that isn't loaded, a color out of range: all of it gets reported before anything changes.
2. **Preview.** A summary of what's about to happen (so many adds, renames, modifies and deletes, plus anything skipped) and a yes/no prompt.
3. **Apply everything in one transaction.** If any row fails halfway through, the transaction is never committed, so the drawing is exactly as it was. A bad row can't leave a half-changed drawing.

## The key C# parts

The core is an AutoCAD .NET transaction over the layer table. Trimmed to the interesting bits:

```csharp
using (var tr = db.TransactionManager.StartTransaction())
{
    var layers = (LayerTable)tr.GetObject(db.LayerTableId, OpenMode.ForWrite);
    var linetypes = (LinetypeTable)tr.GetObject(db.LinetypeTableId, OpenMode.ForRead);

    foreach (var row in rows.Where(r => r.Action != LayerAction.None))
    {
        switch (row.Action)
        {
            case LayerAction.Add:
                var added = new LayerTableRecord { Name = row.Name };
                ApplyProperties(added, row, linetypes);
                layers.Add(added);
                tr.AddNewlyCreatedDBObject(added, true);
                break;

            case LayerAction.Modify:
                ApplyProperties(Open(tr, layers[row.Name]), row, linetypes);
                break;

            case LayerAction.Rename:
                Open(tr, layers[row.Name]).Name = row.NewName;
                break;

            case LayerAction.Delete:
                var ids = new ObjectIdCollection { layers[row.Name] };
                db.Purge(ids);                      // leaves only what's safe to erase
                if (ids.Count == 1) Open(tr, ids[0]).Erase();
                else skipped.Add($"{row.Name}: in use");
                break;
        }
    }
    tr.Commit();   // nothing above is real until this line
}

static LayerTableRecord Open(Transaction tr, ObjectId id) =>
    (LayerTableRecord)tr.GetObject(id, OpenMode.ForWrite);

static void ApplyProperties(LayerTableRecord layer, LayerRow row, LinetypeTable linetypes)
{
    layer.Color = Color.FromColorIndex(ColorMethod.ByAci, row.Color);
    layer.LinetypeObjectId = linetypes[row.Linetype];  // validated as loaded beforehand
    layer.LineWeight = row.Lineweight;
    layer.IsPlottable = row.Plot;
    layer.IsOff = !row.On;
    layer.IsFrozen = row.Frozen;
    layer.IsLocked = row.Locked;
    layer.Description = row.Description;
}
```

`Database.Purge` is the safety net for deletes. Hand it a set of IDs and it removes anything still in use, so whatever's left is safe to erase. Layer 0, Defpoints and the current layer can never be deleted, so reject them in validation before you get this far.

The spreadsheet becomes the review tool, and the drawing only changes when someone has said exactly what should change.
