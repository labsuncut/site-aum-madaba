// AUM opening scene, v2. Mosaic tesserae scatter over the dark page, then fly in to build the seal
// itself, tile by tile, while a loose ring of tesserae gathers around it. The real seal fades in over
// the mosaic, the ring keeps turning unattached, the name rises, and the page is revealed.
// Plays once per tab session; a tap or the Skip button ends it. No libraries.
(function () {
  var doc = document, html = doc.documentElement;
  html.classList.add('js');
  var intro = doc.getElementById('intro');
  if (!intro) return;
  var KEY = 'aum-intro-seen';
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (seen || location.hash) { intro.remove(); return; }
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

  var canvas = doc.getElementById('intro-canvas'), seal = doc.getElementById('intro-seal');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, cx, cy, R, SZ, phone;
  var COLORS = ['#b4563a', '#d2a24a', '#7d8a5a', '#dcc8a3', '#f3ecdf', '#e9d6a6', '#8b0a12', '#c08a2e'];
  var T = { scatter: 500, form: 1500, mosaic: 700, reveal: 900, hold: 1100, out: 700 };
  var tForm = T.scatter, tMosaic = tForm + T.form, tReveal = tMosaic + T.mosaic, tHold = tReveal + T.reveal, tOut = tHold + T.hold, tEnd = tOut + T.out;
  var ring = [], pic = [], t0 = null, raf = 0, done = false, revealed = false;

  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function size() {
    phone = innerWidth < 700;
    W = canvas.width = Math.round(innerWidth * dpr); H = canvas.height = Math.round(innerHeight * dpr);
    cx = W / 2; cy = H / 2;
    var m = Math.min(innerWidth, innerHeight);
    SZ = Math.min(230, Math.max(150, m * .26));            // seal size in CSS px, same clamp as the CSS
    R = m * (phone ? .34 : .24) * dpr;                       // ring radius in device px
    intro.style.setProperty('--seal', SZ + 'px');
    intro.style.setProperty('--ringr', Math.round(R / dpr) + 'px');
  }

  function buildRing() {
    var N = phone ? 150 : 240;
    ring = [];
    for (var i = 0; i < N; i++) {
      var inRing = i % 3 !== 0;
      var a = Math.random() * Math.PI * 2;
      var rr = inRing ? R + rnd(-R * .06, R * .06) : R * rnd(1.18, 1.6);
      ring.push({
        sx: Math.random() * W, sy: Math.random() * H,
        tx: cx + Math.cos(a) * rr, ty: cy + Math.sin(a) * rr,
        ox: cx + Math.cos(a) * rr * 2.4, oy: cy + Math.sin(a) * rr * 2.4,
        s: (inRing ? rnd(9, 15) : rnd(5, 10)) * dpr, rot: rnd(-.5, .5), spin: rnd(-1.2, 1.2),
        c: COLORS[(Math.random() * COLORS.length) | 0], delay: Math.random() * .5, ph: Math.random() * 6.28,
        alpha: inRing ? rnd(.75, 1) : rnd(.35, .6)
      });
    }
  }

  // Sample the seal image into a grid of coloured tiles. Fails quietly (ring only) if the image can't be read.
  function buildPicture() {
    pic = [];
    try {
      var G = phone ? 26 : 34;
      var off = doc.createElement('canvas'); off.width = G; off.height = G;
      var o = off.getContext('2d');
      o.drawImage(seal, 0, 0, G, G);
      var d = o.getImageData(0, 0, G, G).data;
      var cell = (SZ / G) * dpr, half = G / 2, maxD = Math.hypot(half, half);
      for (var y = 0; y < G; y++) for (var x = 0; x < G; x++) {
        var k = (y * G + x) * 4;
        if (d[k + 3] < 110) continue;
        var dxg = x - half + .5, dyg = y - half + .5, dist = Math.hypot(dxg, dyg);
        if (dist > half + .2) continue;
        var ang = Math.random() * Math.PI * 2, far = rnd(.35, .6) * Math.min(W, H);
        pic.push({
          sx: cx + Math.cos(ang) * far, sy: cy + Math.sin(ang) * far,
          tx: cx + dxg * cell, ty: cy + dyg * cell,
          s: cell * .92, c: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')',
          delay: (dist / maxD) * .45 + Math.random() * .08, rot: rnd(-.25, .25), spin: rnd(-1, 1),
          dx: dxg / (dist || 1), dy: dyg / (dist || 1)
        });
      }
    } catch (e) { pic = []; }
  }

  function tile(x, y, s, c, a, rot, sc) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a; ctx.fillStyle = c;
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    var h = s / 2; ctx.fillRect(-h, -h, s, s);
    ctx.restore();
  }

  function frame(now) {
    if (done) return;
    if (t0 === null) t0 = now;
    var t = now - t0, i, p, x, y, a, u, e;
    ctx.clearRect(0, 0, W, H);

    // Ring: gather, then orbit slowly, then fly out.
    for (i = 0; i < ring.length; i++) {
      p = ring[i]; a = p.alpha; var rot = p.rot, sc = 1;
      if (t < tForm) {
        x = p.sx + Math.sin(t * .0012 + p.ph) * 3 * dpr; y = p.sy + Math.cos(t * .001 + p.ph) * 3 * dpr;
        a *= Math.min(1, t / 400) * .8;
      } else if (t < tOut) {
        e = Math.min(1, Math.max(0, (t - tForm - p.delay * T.form) / (T.form * (1 - p.delay))));
        u = ease(e);
        var ddx = p.tx - p.sx, ddy = p.ty - p.sy, bow = Math.sin(Math.PI * u) * 0.18;
        x = p.sx + ddx * u - ddy * bow; y = p.sy + ddy * u + ddx * bow;
        rot = p.rot + p.spin * (1 - u) * 2;
        a *= .8 + .2 * u;
        if (t > tMosaic) {
          var k = (t - tMosaic) * .00022;
          var ang = Math.atan2(p.ty - cy, p.tx - cx) + k, rad = Math.hypot(p.tx - cx, p.ty - cy);
          x = cx + Math.cos(ang) * rad; y = cy + Math.sin(ang) * rad;
          a *= .85 + .15 * Math.sin(t * .003 + p.ph);
        }
      } else {
        var o = ease(Math.min(1, (t - tOut) / T.out));
        var ang2 = Math.atan2(p.ty - cy, p.tx - cx) + (tOut - tMosaic) * .00022, rad2 = Math.hypot(p.tx - cx, p.ty - cy);
        var bx = cx + Math.cos(ang2) * rad2, by = cy + Math.sin(ang2) * rad2;
        x = bx + (p.ox - p.tx) * o; y = by + (p.oy - p.ty) * o;
        a *= 1 - o; sc = 1 + o * .6;
      }
      tile(x, y, p.s, p.c, a, rot, sc);
    }

    // Picture: fly in from the edges to build the seal, hold, then dissolve as the real seal appears.
    if (t >= tForm) {
      for (i = 0; i < pic.length; i++) {
        p = pic[i];
        e = Math.min(1, Math.max(0, (t - tForm - p.delay * T.form) / (T.form * (1 - p.delay))));
        u = ease(e);
        var fx = p.tx - p.sx, fy = p.ty - p.sy, bw = Math.sin(Math.PI * u) * 0.12;
        x = p.sx + fx * u - fy * bw; y = p.sy + fy * u + fx * bw;
        a = .25 + .75 * u; var r2 = p.rot * (1 - u) + p.spin * (1 - u) * 1.5, s2 = 1;
        if (t > tReveal) {
          var v = ease(Math.min(1, (t - tReveal) / T.reveal));
          a *= 1 - v; s2 = 1 + v * .8;
          x += p.dx * v * 18 * dpr; y += p.dy * v * 18 * dpr;
        }
        tile(x, y, p.s, p.c, a, r2, s2);
      }
    }
    if (t >= tReveal && !revealed) { revealed = true; intro.classList.add('reveal'); }
    if (t < tEnd) raf = requestAnimationFrame(frame); else finish();
  }

  function finish() {
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    intro.classList.add('done');
    html.classList.remove('intro-on');
    setTimeout(function () { intro.remove(); }, 1000);
  }

  function start() {
    html.classList.add('intro-on');
    intro.classList.add('play');
    size(); buildRing(); buildPicture();
    if (!pic.length) { // image not readable: shorten the mosaic phase and reveal sooner
      T.form = 1300; T.mosaic = 100; tMosaic = tForm + T.form; tReveal = tMosaic + T.mosaic; tHold = tReveal + T.reveal; tOut = tHold + T.hold; tEnd = tOut + T.out;
    }
    raf = requestAnimationFrame(frame);
    setTimeout(finish, tEnd + 400);
  }

  intro.addEventListener('click', finish);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); }, { once: true });
  window.addEventListener('resize', function () { if (!done) size(); });
  if (seal.complete && seal.naturalWidth) start();
  else { seal.addEventListener('load', start, { once: true }); seal.addEventListener('error', start, { once: true }); }
})();
