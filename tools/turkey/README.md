# Wild Turkey post: data pipeline

Rebuilds `assets/posts/wild-turkey-comeback/` from the USGS Breeding Bird Survey.

1. **Download** the [2026 BBS release](https://doi.org/10.5066/P144YU3S): `Routes.csv` and `States.zip`.
   Unzip `States.zip` so you have a `States\` folder, and copy `us-states.geojson` (this folder) next to them.
2. **Load into PostGIS** (creates/rebuilds only the `bbs` schema; ~7.5M rows, a few minutes).
   Run from the data folder: `psql -h <host> -U <user> -d <db> -f <repo>/tools/turkey/load-bbs.sql`
3. **Summarize + export** (writes 4 CSVs to the current folder; put them in `tools/turkey/out/`):
   `psql -h <host> -U <user> -d <db> -f <repo>/tools/turkey/queries.sql`
4. **Build the page data** from the repo root (Node 22+):
   `npm i --no-save us-atlas topojson-client d3-geo` then `node tools/turkey/build-turkey.mjs tools/turkey/out`

The raw data and CSVs stay out of git; only the built map data, `turkey.db` and these scripts are committed.
