/* The Wild Turkey comeback: map of Breeding Bird Survey routes by decade, plus a yearly trend line.
   Data: turkey-map-data.js (built by tools/posts/wild-turkey-comeback/build-turkey.mjs). No dependencies. */
(() => {
  const T = window.TURKEY;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const label = (d) => (d === 2020 ? '2020–25' : d + 's');

  // ---- colour: one hue (the site pink), light -> dark, by turkeys counted per run ----
  const BINS = [
    { max: 1, fill: '#f6b6d1', text: 'under 1' },
    { max: 3, fill: '#ec6fa6', text: '1–3' },
    { max: 6, fill: '#c8216f', text: '3–6' },
    { max: Infinity, fill: '#7d0f45', text: '6+' },
  ];
  const binOf = (v) => BINS.find((b) => v <= b.max);
  $('legend-bins').innerHTML =
    '<span class="nd"><i></i> surveyed, no turkeys</span>' +
    BINS.map((b) => `<span class="nd"><i style="background:${b.fill}"></i> ${b.text}</span>`).join('');

  // ---- map ----
  const svg = $('tmap');
  svg.setAttribute('viewBox', T.viewBox.join(' '));
  mk('path', { d: T.land, class: 'land' }, svg);
  mk('path', { d: T.borders, class: 'borders' }, svg);
  const gZero = mk('g', {}, svg), gHit = mk('g', {}, svg);
  const R = T.routes;  // [x, y, name, state, perDecade[]]
  const dots = R.map((r) => mk('circle', { cx: r[0], cy: r[1] }, null));

  let di = T.decades.length - 1;   // start on the most recent decade
  function drawMap() {
    gZero.textContent = ''; gHit.textContent = '';
    let run = 0, hit = 0, sum = 0;
    R.forEach((r, i) => {
      const v = r[4][di], c = dots[i];
      if (v == null) return;
      run++; sum += v;
      if (v === 0) { c.setAttribute('r', 1.6); c.setAttribute('class', 'dot zero'); c.removeAttribute('fill'); gZero.appendChild(c); }
      else { hit++; c.setAttribute('r', 3.2); c.setAttribute('class', 'dot'); c.setAttribute('fill', binOf(v).fill); gHit.appendChild(c); }
    });
    if (picked != null) dots[picked].classList.add('sel');
    $('t-runs').textContent = run.toLocaleString();
    $('t-runs-sub').textContent = 'routes surveyed in the ' + label(T.decades[di]);
    $('t-pct').textContent = run ? Math.round((100 * hit) / run) + '%' : '—';
    $('t-pct-sub').textContent = hit.toLocaleString() + ' routes';
    $('t-avg').textContent = run ? (sum / run).toFixed(2) : '—';
    document.querySelectorAll('#decades button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === di)));
    $('tmap').setAttribute('aria-label', `Map of Breeding Bird Survey routes in the lower 48 states during the ${label(T.decades[di])}. Turkeys were counted on ${hit} of ${run} routes surveyed.`);
    drawBand();
  }

  // ---- decade buttons + play ----
  $('decades').innerHTML = T.decades.map((d) => `<button type="button" aria-pressed="false">${label(d)}</button>`).join('');
  document.querySelectorAll('#decades button').forEach((b, i) => b.addEventListener('click', () => { stop(); di = i; drawMap(); }));
  let timer = null;
  const play = $('play');
  function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Play'; play.setAttribute('aria-pressed', 'false'); }
  play.addEventListener('click', () => {
    if (timer) return stop();
    play.textContent = '❚❚ Pause'; play.setAttribute('aria-pressed', 'true');
    di = 0; drawMap();
    timer = setInterval(() => { if (di >= T.decades.length - 1) return stop(); di++; drawMap(); }, 1100);
  });

  // ---- hover / tap ----
  const tip = $('ttip');
  let picked = null;
  function nearest(evt) {
    const p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
    const q = p.matrixTransform(svg.getScreenCTM().inverse());
    let best = null, bd = 12 * 12;
    R.forEach((r, i) => { if (r[4][di] == null) return; const dx = r[0] - q.x, dy = r[1] - q.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
    return best;
  }
  const describe = (i) => { const v = R[i][4][di]; return v === 0 ? 'No turkeys counted' : `${v} turkey${v === 1 ? '' : 's'} per survey`; };
  function showTip(i) {
    const r = R[i], box = svg.getBoundingClientRect(), vb = T.viewBox;
    tip.hidden = false;
    tip.style.left = ((r[0] - vb[0]) / vb[2]) * box.width + 'px';
    tip.style.top = ((r[1] - vb[1]) / vb[3]) * box.height + 'px';
    tip.innerHTML = `<b>${describe(i)}</b>${r[2]} route · ${r[3]} · ${label(T.decades[di])}`;
  }
  svg.addEventListener('pointermove', (e) => { const i = nearest(e); i == null ? (tip.hidden = true) : showTip(i); });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; });
  svg.addEventListener('click', (e) => {
    const i = nearest(e); if (i == null) return;
    if (picked != null) dots[picked].classList.remove('sel');
    picked = i; dots[i].classList.add('sel');
    const r = R[i];
    $('tpicked').innerHTML = `<strong>${r[2]}</strong>, ${r[3]}: ` +
      T.decades.map((d, k) => `${label(d)} ${r[4][k] == null ? '–' : r[4][k]}`).join(' · ') + ' <span class="note">(turkeys per survey)</span>';
  });

  // ---- trend line: share of US routes with a turkey, by year ----
  const L = $('tline'), W = 640, H = 220, m = { l: 40, r: 14, t: 12, b: 26 };
  L.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const Y = T.yearly, y0 = Y[0][0], y1 = Y[Y.length - 1][0];
  const sx = (yr) => m.l + ((yr - y0) / (y1 - y0)) * (W - m.l - m.r);
  const sy = (p) => H - m.b - (p / 40) * (H - m.t - m.b);
  const band = mk('rect', { class: 'band', y: m.t, height: H - m.t - m.b }, L);
  [0, 10, 20, 30, 40].forEach((p) => {
    mk('line', { x1: m.l, x2: W - m.r, y1: sy(p), y2: sy(p), class: p ? 'grid' : 'axis' }, L);
    mk('text', { x: m.l - 6, y: sy(p) + 4, class: 'tick', 'text-anchor': 'end' }, L).textContent = p + '%';
  });
  [1970, 1980, 1990, 2000, 2010, 2020].forEach((yr) => { mk('text', { x: sx(yr), y: H - 6, class: 'tick', 'text-anchor': 'middle' }, L).textContent = yr; });
  mk('path', { class: 'trend', d: Y.map((r, i) => (i ? 'L' : 'M') + sx(r[0]).toFixed(1) + ',' + sy(r[2]).toFixed(1)).join('') }, L);
  const last = Y[Y.length - 1];
  mk('circle', { cx: sx(last[0]), cy: sy(last[2]), r: 4, class: 'trend-end' }, L);
  mk('text', { x: sx(last[0]) - 6, y: sy(last[2]) - 9, class: 'tick strong', 'text-anchor': 'end' }, L).textContent = `${last[2]}% in ${last[0]}`;
  const cross = mk('line', { class: 'cross', y1: m.t, y2: H - m.b, visibility: 'hidden' }, L);
  const cdot = mk('circle', { r: 4.5, class: 'trend-end', visibility: 'hidden' }, L);
  const ltip = $('ltip');
  function drawBand() {
    const d = T.decades[di], a = Math.max(d, y0), b = Math.min(d + 9, y1);
    band.setAttribute('x', sx(a) - 3); band.setAttribute('width', sx(b) - sx(a) + 6);
  }
  L.addEventListener('pointermove', (e) => {
    const p = L.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(L.getScreenCTM().inverse());
    const r = Y.reduce((a, b) => (Math.abs(sx(b[0]) - q.x) < Math.abs(sx(a[0]) - q.x) ? b : a));
    cross.setAttribute('x1', sx(r[0])); cross.setAttribute('x2', sx(r[0])); cross.setAttribute('visibility', 'visible');
    cdot.setAttribute('cx', sx(r[0])); cdot.setAttribute('cy', sy(r[2])); cdot.setAttribute('visibility', 'visible');
    const box = L.getBoundingClientRect();
    ltip.hidden = false; ltip.style.left = (sx(r[0]) / W) * box.width + 'px'; ltip.style.top = (sy(r[2]) / H) * box.height + 'px';
    ltip.innerHTML = `<b>${r[2]}%</b>${r[0]} · ${r[1].toLocaleString()} routes surveyed · ${r[3]} turkeys per route`;
  });
  L.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); cdot.setAttribute('visibility', 'hidden'); ltip.hidden = true; });

  // ---- state table ----
  const rows = T.states.filter((s) => s[2] != null && s[0] !== 'Alaska').sort((a, b) => b[2] - a[2]);
  $('tstates').innerHTML = rows.map((s) => `<tr><td>${s[0]}</td><td>${s[1] == null ? '–' : s[1] + '%'}</td><td>${s[2]}%</td><td>${s[3]}</td></tr>`).join('');

  drawMap();
})();
