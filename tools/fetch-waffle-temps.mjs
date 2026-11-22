// Fetch the current temperature for every Waffle House grid cell and write temps.json.
// Runs in GitHub Actions (Node 20+) every 3 hours; the page just reads the JSON.
//
//   node tools/fetch-waffle-temps.mjs              # ask Open-Meteo (scheduled runs)
//   node tools/fetch-waffle-temps.mjs --prefer-live # reuse the file already on the site (code pushes)
//
// Budget: Open-Meteo's free tier allows 600 calls/min, 5,000/hour, 10,000/day, and each
// location in a batch counts as a call. 0.25° cells (~780) x 8 runs/day = ~6,200 calls/day.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const DIR = 'assets/posts/waffle-house-weather';
const OUT = path.join(DIR, 'temps.json');
const LIVE = 'https://fiftyshadesofgrading.com/' + OUT;
const GRID = 0.25;          // degrees (~25 km); map.js reads it back from the JSON
const BATCH = 100;          // locations per request
const GAP_MS = 12_000;      // 100 calls every 12 s = 500/min, under the 600/min limit
const API = process.env.OPEN_METEO_API || 'https://api.open-meteo.com';   // override only for testing
const RETRY_MS = +(process.env.RETRY_MS || 65_000);
const GAP = +(process.env.GAP_MS || GAP_MS);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Locations come from the same file the page draws.
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, 'map-data.js'), 'utf8'), ctx);
const M = ctx.window.WH_MAP;
const F = Object.fromEntries(M.fields.map((n, i) => [n, i]));
const snap = (v) => (Math.round(v / GRID) * GRID).toFixed(2);
const keys = [...new Set(M.stores.map((s) => snap(s[F.lat]) + ',' + snap(s[F.lon])))];

async function previous() {
  try {
    const r = await fetch(LIVE, { signal: AbortSignal.timeout(20_000) });
    if (r.ok) { const j = await r.json(); if (j && j.cells) return j; }
  } catch {}
  return null;
}

async function getBatch(batch) {
  const lat = batch.map((k) => k.split(',')[0]).join(',');
  const lon = batch.map((k) => k.split(',')[1]).join(',');
  const url = `${API}/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&temperature_unit=fahrenheit`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (r.ok) { const j = await r.json(); return Array.isArray(j) ? j : [j]; }
      console.warn(`batch failed: HTTP ${r.status} (attempt ${attempt})`);
      if (r.status !== 429 && r.status < 500) return [];
    } catch (e) {
      console.warn(`batch failed: ${e.message} (attempt ${attempt})`);
    }
    await sleep(RETRY_MS);   // rate limited or flaky: wait out the minute window
  }
  return [];
}

async function main() {
  if (process.argv.includes('--prefer-live')) {
    const prev = await previous();
    if (prev) { fs.writeFileSync(OUT, JSON.stringify(prev)); console.log(`reused live temps from ${prev.updated}`); return; }
    console.log('no live temps yet, fetching fresh');
  }

  const cells = {};
  for (let i = 0; i < keys.length; i += BATCH) {
    if (i) await sleep(GAP);
    const batch = keys.slice(i, i + BATCH);
    const res = await getBatch(batch);
    batch.forEach((k, j) => {
      const v = res[j]?.current?.temperature_2m;
      if (typeof v === 'number') cells[k] = Math.round(v * 10) / 10;
    });
    console.log(`${Math.min(i + BATCH, keys.length)} / ${keys.length} cells requested, ${Object.keys(cells).length} answered`);
  }

  const got = Object.keys(cells).length;
  if (got < keys.length * 0.5) {
    // Mostly failed: keep whatever is already published rather than blanking the map.
    const prev = await previous();
    if (prev) { fs.writeFileSync(OUT, JSON.stringify(prev)); console.warn(`only ${got}/${keys.length} cells; kept live temps from ${prev.updated}`); return; }
    console.warn(`only ${got}/${keys.length} cells and nothing published yet; writing what we have`);
  }
  const out = { updated: new Date().toISOString(), grid: GRID, source: 'Open-Meteo.com (CC BY 4.0)', cells };
  fs.writeFileSync(OUT, JSON.stringify(out));
  console.log(`wrote ${OUT}: ${got}/${keys.length} cells`);
}

main().catch((e) => { console.error(e); process.exit(1); });
