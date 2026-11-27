/* Live weather at every Waffle House.  No dependencies.
   Locations: map-data.js (projected x/y + lat/lon).  Weather: temps.json, refreshed from Open-Meteo by a scheduled GitHub Action. */
(() => {
  const SCRIPT_SRC = document.currentScript ? document.currentScript.src : location.href;
  const M = window.WH_MAP;
  const F = Object.fromEntries(M.fields.map((n, i) => [n, i]));
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);

  // ---- colour: diverging blue <-> red around 50 F, equal steps per arm ----
  const LO = 10, MID = 50, HI = 90;
  const STOPS = [[10,'#104281'],[20,'#2a78d6'],[30,'#6da7ec'],[40,'#b7d3f6'],[50,'#e2e0dc'],[60,'#f3c5b5'],[70,'#ec835a'],[80,'#d03b3b'],[90,'#8f1f24']]
    .map(([t, h]) => [t, [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))]);
  function colour(f) {
    const t = Math.max(LO, Math.min(HI, f));
    for (let i = 1; i < STOPS.length; i++) {
      if (t <= STOPS[i][0]) {
        const [t0, a] = STOPS[i - 1], [t1, b] = STOPS[i], k = (t - t0) / (t1 - t0);
        return 'rgb(' + a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',') + ')';
      }
    }
  }
  $('ramp').style.background = 'linear-gradient(90deg,' + STOPS.map(([t, c]) => `rgb(${c}) ${((t - LO) / (HI - LO)) * 100}%`).join(',') + ')';

  // ---- units ----
  let unit = 'F';
  const toU = (f) => (unit === 'F' ? f : (f - 32) * 5 / 9);
  const fmt = (f) => (f == null ? '—' : Math.round(toU(f)) + '°' + unit);

  // ---- draw ----
  const svg = $('map');
  svg.setAttribute('viewBox', M.viewBox.join(' '));
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  mk('path', { d: M.land, class: 'land' }, svg);
  mk('path', { d: M.borders, class: 'borders' }, svg);
  const gDots = mk('g', {}, svg);
  const S = M.stores;
  const temp = new Array(S.length).fill(null);       // degrees F
  const dots = S.map((s) => mk('circle', { cx: s[F.x], cy: s[F.y], r: 3.1, class: 'dot', fill: 'var(--nodata)' }, gDots));

  // ---- weather: temps.json is written every 3 hours by a GitHub Action (tools/posts/waffle-house-weather/fetch-temps.mjs) ----
  const TEMPS_URL = new URL('temps.json', SCRIPT_SRC).href;

  async function load() {
    const status = $('status');
    try {
      const r = await fetch(TEMPS_URL, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const g = data.grid || 0.25;
      const snap = (v) => (Math.round(v / g) * g).toFixed(2);
      S.forEach((s, i) => { const v = data.cells[snap(s[F.lat]) + ',' + snap(s[F.lon])]; temp[i] = typeof v === 'number' ? v : null; });
      const when = new Date(data.updated);
      const hours = (Date.now() - when) / 36e5;
      status.className = hours > 12 ? 'status warn' : 'status';
      status.textContent = 'Weather as of ' + when.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) +
        (hours > 12 ? ' (that’s a while ago; the refresh job may be paused).' : ' · refreshed every 3 hours.');
      render();
    } catch (e) {
      status.className = 'status warn';
      status.textContent = 'Couldn’t load the temperatures (' + e.message + '), so the locations are shown without weather.';
    }
  }

  // ---- render temps, stats, table ----
  function render() {
    dots.forEach((d, i) => d.setAttribute('fill', temp[i] == null ? 'var(--nodata)' : colour(temp[i])));
    const have = S.map((_, i) => i).filter((i) => temp[i] != null);
    $('s-count').textContent = S.length.toLocaleString();
    $('s-count-sub').textContent = new Set(S.map((s) => s[F.state])).size + ' states';
    if (!have.length) { ['s-avg', 's-hot', 's-cold'].forEach((id) => ($(id).textContent = '—')); return; }
    const avg = have.reduce((a, i) => a + temp[i], 0) / have.length;
    const hot = have.reduce((a, i) => (temp[i] > temp[a] ? i : a)), cold = have.reduce((a, i) => (temp[i] < temp[a] ? i : a));
    $('s-avg').textContent = fmt(avg); $('s-avg-sub').textContent = have.length.toLocaleString() + ' reporting';
    $('s-hot').textContent = fmt(temp[hot]); $('s-hot-sub').textContent = `#${S[hot][F.store]} · ${S[hot][F.city]}, ${S[hot][F.state]}`;
    $('s-cold').textContent = fmt(temp[cold]); $('s-cold-sub').textContent = `#${S[cold][F.store]} · ${S[cold][F.city]}, ${S[cold][F.state]}`;

    const by = {};
    have.forEach((i) => { const st = S[i][F.state]; (by[st] || (by[st] = [])).push(i); });
    const rows = Object.entries(by).map(([st, ix]) => ({ st, n: ix.length, avg: ix.reduce((a, i) => a + temp[i], 0) / ix.length, hi: Math.max(...ix.map((i) => temp[i])), lo: Math.min(...ix.map((i) => temp[i])) }))
      .sort((a, b) => b.n - a.n);
    $('tbody').innerHTML = rows.map((r) => `<tr><td>${r.st}</td><td>${r.n}</td><td>${fmt(r.avg)}</td><td>${fmt(r.lo)}</td><td>${fmt(r.hi)}</td></tr>`).join('');
    drawTicks();
  }
  function drawTicks() { $('ticks').innerHTML = [10, 30, 50, 70, 90].map((f) => `<span>${f === 10 ? '≤' : f === 90 ? '≥' : ''}${Math.round(toU(f))}°</span>`).join(''); }
  drawTicks();

  // ---- unit toggle ----
  document.querySelectorAll('.unit-toggle button').forEach((b) => b.addEventListener('click', () => {
    unit = b.dataset.u;
    document.querySelectorAll('.unit-toggle button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render(); showPicked(); if (hover != null) showTip(hover);
  }));

  // ---- hover / tap: nearest dot ----
  const tip = $('tip'), box = svg.parentElement;
  let hover = null, picked = null;
  function nearest(evt) {
    const p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
    const q = p.matrixTransform(svg.getScreenCTM().inverse());
    let best = -1, bd = 14 * 14;
    for (let i = 0; i < S.length; i++) { const dx = S[i][F.x] - q.x, dy = S[i][F.y] - q.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
    return best < 0 ? null : best;
  }
  function showTip(i) {
    const s = S[i], r = svg.getBoundingClientRect(), vb = M.viewBox;
    tip.hidden = false;
    tip.style.left = ((s[F.x] - vb[0]) / vb[2]) * r.width + 'px';
    tip.style.top = ((s[F.y] - vb[1]) / vb[3]) * r.height + 'px';
    tip.innerHTML = `<b>${fmt(temp[i])}</b>#${s[F.store]} · ${s[F.city]}, ${s[F.state]}`;
  }
  svg.addEventListener('pointermove', (e) => { const i = nearest(e); hover = i; i == null ? (tip.hidden = true) : showTip(i); });
  svg.addEventListener('pointerleave', () => { hover = null; tip.hidden = true; });
  svg.addEventListener('click', (e) => {
    const i = nearest(e); if (i == null) return;
    if (picked != null) dots[picked].classList.remove('sel');
    picked = i; dots[i].classList.add('sel'); gDots.appendChild(dots[i]); showPicked();
  });
  function showPicked() {
    const el = $('picked');
    if (picked == null) { el.textContent = 'Tap or click a dot for details.'; return; }
    const s = S[picked];
    el.innerHTML = `<strong>Waffle House #${s[F.store]}</strong> — ${s[F.city]}, ${s[F.state]} — ${fmt(temp[picked])} · <a href="https://locations.wafflehouse.com/" target="_blank" rel="noopener">store locator</a>`;
  }
  showPicked(); render(); load();
})();
