/* Fifty-contour grading plan for share cards: the same terrain generator as the homepage hero
   (index.html), without the animation and pop-ups. contours(svg, seed) draws into an <svg>
   with viewBox 0 0 1200 760. Keep in step with index.html if the hero changes. */
function contours(svg, seed) {
  var NS = 'http://www.w3.org/2000/svg';
  var W = 1200, H = 760, STEP = 5, N = 50;
  var rand = (function (a) {               // mulberry32
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })(seed);
  function between(a, b) { return a + rand() * (b - a); }

  // ---- Seeded gradient (Perlin) noise ----
  var perm = new Uint8Array(512), p = [], i, j, t;
  for (i = 0; i < 256; i++) p[i] = i;
  for (i = 255; i > 0; i--) { j = Math.floor(rand() * (i + 1)); t = p[i]; p[i] = p[j]; p[j] = t; }
  for (i = 0; i < 512; i++) perm[i] = p[i & 255];
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function grad(h, x, y) {
    switch (h & 7) {
      case 0: return x + y;  case 1: return x - y;
      case 2: return -x + y; case 3: return -x - y;
      case 4: return x;      case 5: return -x;
      case 6: return y;      default: return -y;
    }
  }
  function noise(x, y) {
    var X = Math.floor(x), Y = Math.floor(y);
    x -= X; y -= Y; X &= 255; Y &= 255;
    var u = fade(x), v = fade(y), a = perm[X] + Y, b = perm[X + 1] + Y;
    var n00 = grad(perm[a], x, y), n10 = grad(perm[b], x - 1, y);
    var n01 = grad(perm[a + 1], x, y - 1), n11 = grad(perm[b + 1], x - 1, y - 1);
    var top = n00 + (n10 - n00) * u, bot = n01 + (n11 - n01) * u;
    return top + (bot - top) * v;
  }
  function fbm(x, y) {
    var s = 0, amp = 1, f = 1;
    for (var o = 0; o < 4; o++) { s += amp * noise(x * f, y * f); amp *= 0.5; f *= 2.03; }
    return s;
  }

  // ---- Terrain: an elongated hill, warped and roughed up, maybe a second knoll ----
  function hill(cx, cy, ang, ax, ay) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    return function (x, y) {
      var dx = x - cx, dy = y - cy;
      var u = (dx * ca + dy * sa) / ax, v = (-dx * sa + dy * ca) / ay;
      return -Math.sqrt(u * u + v * v);
    };
  }
  var main = hill(between(700, 900), between(300, 460), between(-0.6, 0.6), between(1.25, 1.9), between(0.75, 1));
  var knoll = rand() < 0.6
    ? { f: hill(between(250, 1100), between(80, 700), between(-1.5, 1.5), between(0.8, 1.4), between(0.6, 1)), drop: between(90, 220) }
    : null;
  var ns = between(1 / 420, 1 / 300), warp = between(50, 90), rough = between(55, 85);
  var sx = between(-0.08, 0.08), sy = between(-0.08, 0.08);
  var o1 = between(0, 100), o2 = between(0, 100), o3 = between(0, 100);
  function elev(x, y) {
    var wx = x + warp * fbm(x * ns + o1, y * ns + 4.7);
    var wy = y + warp * fbm(x * ns + o2, y * ns + 17.9);
    var z = main(wx, wy);
    if (knoll) {                                  // smooth max of the two hills, so a saddle forms
      var k = knoll.f(wx, wy) - knoll.drop, m = Math.max(z, k), K = 25;
      z = m + K * Math.log(Math.exp((z - m) / K) + Math.exp((k - m) / K));
    }
    return z + rough * fbm(x * ns * 1.7 + o3, y * ns * 1.7 + 90) + sx * x + sy * y;
  }

  // ---- Sample the surface on a grid ----
  var GX = Math.ceil(W / STEP) + 1, GY = Math.ceil(H / STEP) + 1;
  var g = new Float32Array(GX * GY), zmin = Infinity, zmax = -Infinity;
  for (var r = 0; r < GY; r++) for (var c = 0; c < GX; c++) {
    var v = elev(c * STEP, r * STEP);
    g[r * GX + c] = v;
    if (v < zmin) zmin = v;
    if (v > zmax) zmax = v;
  }
  var dz = (zmax - zmin) / N;                       // exactly 50 contours, one per shade
  var topEl = Math.round(between(120, 420));        // elevation label of the highest contour
  function levelZ(k) { return zmin + (k + 0.5) * dz; }

  // ---- Marching squares: one level -> chains of points ----
  function trace(L) {
    var pts = new Map(), nbr = new Map(), HOFF = GX * GY;
    function pt(id, x1, y1, v1, x2, y2, v2) {
      if (!pts.has(id)) { var s = (L - v1) / (v2 - v1); pts.set(id, [x1 + (x2 - x1) * s, y1 + (y2 - y1) * s]); }
      return id;
    }
    function link(a, b) {
      (nbr.get(a) || nbr.set(a, []).get(a)).push(b);
      (nbr.get(b) || nbr.set(b, []).get(b)).push(a);
    }
    for (var r = 0; r < GY - 1; r++) for (var c = 0; c < GX - 1; c++) {
      var v0 = g[r * GX + c], v1 = g[r * GX + c + 1], v2 = g[(r + 1) * GX + c + 1], v3 = g[(r + 1) * GX + c];
      var b0 = v0 > L, b1 = v1 > L, b2 = v2 > L, b3 = v3 > L;
      var idx = (b0 ? 8 : 0) | (b1 ? 4 : 0) | (b2 ? 2 : 0) | (b3 ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      var x = c * STEP, y = r * STEP, S = STEP, e = [];
      var T = b0 !== b1 ? pt(r * GX + c, x, y, v0, x + S, y, v1) : -1;
      var R = b1 !== b2 ? pt(HOFF + r * GX + c + 1, x + S, y, v1, x + S, y + S, v2) : -1;
      var B = b3 !== b2 ? pt((r + 1) * GX + c, x, y + S, v3, x + S, y + S, v2) : -1;
      var Lf = b0 !== b3 ? pt(HOFF + r * GX + c, x, y, v0, x, y + S, v3) : -1;
      if (idx === 5 || idx === 10) {                 // saddle: settle it with the cell center
        var hi = (v0 + v1 + v2 + v3) / 4 > L;
        if ((idx === 10) === hi) { link(T, R); link(Lf, B); }
        else { link(T, Lf); link(R, B); }
      } else {
        [T, R, B, Lf].forEach(function (id) { if (id >= 0) e.push(id); });
        link(e[0], e[1]);
      }
    }
    var seen = new Set(), chains = [];
    function walk(s) {
      var ids = [s], cur = s;
      seen.add(s);
      for (;;) {
        var n = nbr.get(cur), nx = -1;
        for (var m = 0; m < n.length; m++) if (!seen.has(n[m])) { nx = n[m]; break; }
        if (nx < 0) break;
        seen.add(nx); ids.push(nx); cur = nx;
      }
      var closed = ids.length > 2 && nbr.get(cur).indexOf(s) >= 0;
      chains.push({ pts: ids.map(function (id) { return pts.get(id); }), closed: closed });
    }
    nbr.forEach(function (n, id) { if (n.length === 1 && !seen.has(id)) walk(id); });   // open chains first
    nbr.forEach(function (n, id) { if (!seen.has(id)) walk(id); });                     // then loops
    return chains;
  }

  // One Chaikin pass to take the grid edge off
  function smooth(P, closed) {
    if (P.length < 3) return P;
    var out = closed ? [] : [P[0]], n = P.length, last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var a = P[i], b = P[(i + 1) % n];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
      out.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    if (!closed) out.push(P[n - 1]);
    return out;
  }

  // ---- Draw: k = 0 is the lowest (lightest), k = 49 the highest (darkest) ----
  var levels = [];
  for (var k = 0; k < N; k++) {
    var el = topEl - (N - 1 - k);
    var light = 86 - (k / (N - 1)) * 74;            // 50 shades: 86% down to 12% lightness
    levels[k] = [];
    trace(levelZ(k)).forEach(function (ch) {
      if (ch.pts.length < 2) return;
      var P = smooth(ch.pts, ch.closed), d = '';
      for (var i = 0; i < P.length; i++) d += (i ? 'L' : 'M') + P[i][0].toFixed(1) + ' ' + P[i][1].toFixed(1);
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', ch.closed ? d + 'Z' : d);
      path.setAttribute('stroke', 'hsl(0 0% ' + light.toFixed(1) + '%)');
      path.setAttribute('stroke-width', el % 5 === 0 ? 2.6 : 1.1);   // index contour every 5 ft
      svg.appendChild(path);
      levels[k].push(path);
    });
  }

}

/* A stable seed from a string (the post slug), so a post's card looks the same every build. */
function seedFrom(s) {
  var h = 2166136261;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
