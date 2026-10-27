// AUM opening scene, v3. Mosaic tesserae scatter over the dark page, then fly in to build the seal
// itself, tile by tile, while a loose ring of tesserae gathers around it. The real seal fades in over
// the mosaic, the ring keeps turning unattached, the name rises, and the page is revealed.
// Plays once per tab session; a tap or the Skip button ends it. No libraries.
// v3: every tile keeps its position relative to the centre and ring radius, and the canvas follows the
// overlay's real box, so when the viewport changes mid-scene (phone address bar, rotation, window
// resize) the ring stays centred on the seal instead of drifting off it.
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
  var W, H, cx, cy, R, SZ, cell, M, phone, cssW = 0, cssH = 0;
  var G = 34;                                                // picture grid (set in size())
  var COLORS = ['#b4563a', '#d2a24a', '#7d8a5a', '#dcc8a3', '#f3ecdf', '#e9d6a6', '#8b0a12', '#c08a2e'];
  var T = { scatter: 500, form: 1500, mosaic: 700, reveal: 900, hold: 1100, out: 700 };
  var tForm = T.scatter, tMosaic = tForm + T.form, tReveal = tMosaic + T.mosaic, tHold = tReveal + T.reveal, tOut = tHold + T.hold, tEnd = tOut + T.out;
  var ring = [], pic = [], t0 = null, raf = 0, done = false, revealed = false;

  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Measure the overlay itself (not window.innerHeight): the seal is centred in this same box by CSS,
  // so the canvas centre and the seal centre can never disagree.
  function size() {
    var box = intro.getBoundingClientRect();
    cssW = Math.round(box.width) || innerWidth; cssH = Math.round(box.height) || innerHeight;
    phone = cssW < 700;
    W = canvas.width = Math.round(cssW * dpr); H = canvas.height = Math.round(cssH * dpr);
    cx = W / 2; cy = H / 2;
    var m = Math.min(cssW, cssH);
    M = m * dpr;                                             // shorter side in device px
    SZ = Math.min(230, Math.max(150, m * .26));              // seal size in CSS px, same clamp as the CSS
    R = m * (phone ? .34 : .24) * dpr;                       // ring radius in device px
    G = phone ? 26 : 34;
    cell = (SZ / G) * dpr;
    intro.style.setProperty('--seal', SZ + 'px');
    intro.style.setProperty('--ringr', Math.round(R / dpr) + 'px');
  }
  function sizeChanged() { var b = intro.getBoundingClientRect(); return Math.round(b.width) !== cssW || Math.round(b.height) !== cssH; }

  // Ring tiles: angle + radius as a fraction of R, scatter start as a fraction of the box.
  function buildRing() {
    var N = phone ? 150 : 240;
    ring = [];
    for (var i = 0; i < N; i++) {
      var inRing = i % 3 !== 0;
      ring.push({
        a: Math.random() * Math.PI * 2,
        rf: inRing ? 1 + rnd(-.06, .06) : rnd(1.18, 1.6),
        sxf: Math.random(), syf: Math.random(),
        s: (inRing ? rnd(9, 15) : rnd(5, 10)) * dpr, rot: rnd(-.5, .5), spin: rnd(-1.2, 1.2),
        c: COLORS[(Math.random() * COLORS.length) | 0], delay: Math.random() * .5, ph: Math.random() * 6.28,
        alpha: inRing ? rnd(.75, 1) : rnd(.35, .6)
      });
    }
  }

  // Sample the seal image into a grid of coloured tiles. Fails quietly (ring only) if the image can't be read.
  // Each tile keeps its grid offset from the centre; its pixel position is computed per frame.
  function buildPicture() {
    pic = [];
    try {
      var off = doc.createElement('canvas'); off.width = G; off.height = G;
      var o = off.getContext('2d');
      o.drawImage(seal, 0, 0, G, G);
      var d = o.getImageData(0, 0, G, G).data;
      var half = G / 2, maxD = Math.hypot(half, half);
      for (var y = 0; y < G; y++) for (var x = 0; x < G; x++) {
        var k = (y * G + x) * 4;
        if (d[k + 3] < 110) continue;
        var dxg = x - half + .5, dyg = y - half + .5, dist = Math.hypot(dxg, dyg);
        if (dist > half + .2) continue;
        pic.push({
          gx: dxg, gy: dyg,
          ang: Math.random() * Math.PI * 2, farf: rnd(.35, .6),
          c: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')',
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
    if (sizeChanged()) size();                               // phone address bar, rotation: re-measure, tiles follow
    var t = now - t0, i, p, x, y, a, u, e;
    ctx.clearRect(0, 0, W, H);

    // Ring: gather, then orbit slowly, then fly out.
    var spinK = (Math.min(t, tOut) - tMosaic) * .00022;
    for (i = 0; i < ring.length; i++) {
      p = ring[i]; a = p.alpha; var rot = p.rot, sc = 1;
      var rad = p.rf * R, sx = p.sxf * W, sy = p.syf * H;
      var tx = cx + Math.cos(p.a) * rad, ty = cy + Math.sin(p.a) * rad;
      if (t < tForm) {
        x = sx + Math.sin(t * .0012 + p.ph) * 3 * dpr; y = sy + Math.cos(t * .001 + p.ph) * 3 * dpr;
        a *= Math.min(1, t / 400) * .8;
      } else if (t < tOut) {
        e = Math.min(1, Math.max(0, (t - tForm - p.delay * T.form) / (T.form * (1 - p.delay))));
        u = ease(e);
        var ddx = tx - sx, ddy = ty - sy, bow = Math.sin(Math.PI * u) * 0.18;
        x = sx + ddx * u - ddy * bow; y = sy + ddy * u + ddx * bow;
        rot = p.rot + p.spin * (1 - u) * 2;
        a *= .8 + .2 * u;
        if (t > tMosaic) {
          x = cx + Math.cos(p.a + spinK) * rad; y = cy + Math.sin(p.a + spinK) * rad;
          a *= .85 + .15 * Math.sin(t * .003 + p.ph);
        }
      } else {
        var o = ease(Math.min(1, (t - tOut) / T.out));
        var bx = cx + Math.cos(p.a + spinK) * rad, by = cy + Math.sin(p.a + spinK) * rad;
        x = bx + Math.cos(p.a) * rad * 1.4 * o; y = by + Math.sin(p.a) * rad * 1.4 * o;
        a *= 1 - o; sc = 1 + o * .6;
      }
      tile(x, y, p.s, p.c, a, rot, sc);
    }

    // Picture: fly in from the edges to build the seal, hold, then dissolve as the real seal appears.
    if (t >= tForm) {
      for (i = 0; i < pic.length; i++) {
        p = pic[i];
        var ptx = cx + p.gx * cell, pty = cy + p.gy * cell;
        var far = p.farf * M, psx = cx + Math.cos(p.ang) * far, psy = cy + Math.sin(p.ang) * far;
        e = Math.min(1, Math.max(0, (t - tForm - p.delay * T.form) / (T.form * (1 - p.delay))));
        u = ease(e);
        var fx = ptx - psx, fy = pty - psy, bw = Math.sin(Math.PI * u) * 0.12;
        x = psx + fx * u - fy * bw; y = psy + fy * u + fx * bw;
        a = .25 + .75 * u; var r2 = p.rot * (1 - u) + p.spin * (1 - u) * 1.5, s2 = 1;
        if (t > tReveal) {
          var v = ease(Math.min(1, (t - tReveal) / T.reveal));
          a *= 1 - v; s2 = 1 + v * .8;
          x += p.dx * v * 18 * dpr; y += p.dy * v * 18 * dpr;
        }
        tile(x, y, cell * .92, p.c, a, r2, s2);
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
