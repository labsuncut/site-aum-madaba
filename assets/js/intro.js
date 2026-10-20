// AUM opening scene. Mosaic tesserae scatter over the dark page, gather into a ring, and the seal
// spins into the centre of it (CSS animation on the image). Then the ring loosens and the page is revealed.
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

  var canvas = doc.getElementById('intro-canvas');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, cx, cy, R;
  var COLORS = ['#b4563a', '#d2a24a', '#7d8a5a', '#dcc8a3', '#f3ecdf', '#e9d6a6', '#8b0a12', '#c08a2e'];
  var T = { scatter: 700, gather: 1500, hold: 1700, out: 800 };
  var tEnd = T.scatter + T.gather + T.hold + T.out;
  var tiles = [], N, t0 = null, raf = 0, done = false;

  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function size() {
    W = canvas.width = Math.round(innerWidth * dpr); H = canvas.height = Math.round(innerHeight * dpr);
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) * (innerWidth < 700 ? .30 : .24);
  }
  function build() {
    size();
    N = innerWidth < 700 ? 260 : 460;
    tiles = [];
    for (var i = 0; i < N; i++) {
      var ring = i % 3 !== 0;                                   // two thirds form the ring, a third a looser halo
      var a = Math.random() * Math.PI * 2;
      var rr = ring ? R + rnd(-R * .06, R * .06) : R * rnd(1.18, 1.6);
      var s = (ring ? rnd(9, 15) : rnd(5, 10)) * dpr;
      tiles.push({
        sx: Math.random() * W, sy: Math.random() * H,          // scattered start
        tx: cx + Math.cos(a) * rr, ty: cy + Math.sin(a) * rr,  // place in the ring
        ox: cx + Math.cos(a) * rr * 2.4, oy: cy + Math.sin(a) * rr * 2.4, // where it flies out at the end
        s: s, rot: rnd(-.5, .5), spin: rnd(-1.2, 1.2),
        c: COLORS[(Math.random() * COLORS.length) | 0],
        delay: Math.random() * .5, ph: Math.random() * 6.28,
        alpha: ring ? rnd(.75, 1) : rnd(.35, .6)
      });
    }
  }

  function frame(now) {
    if (done) return;
    if (t0 === null) t0 = now;
    var t = now - t0;
    ctx.clearRect(0, 0, W, H);
    var tGather = T.scatter, tHold = tGather + T.gather, tOut = tHold + T.hold;
    for (var i = 0; i < N; i++) {
      var p = tiles[i], x, y, a = p.alpha, rot = p.rot, sc = 1;
      if (t < tGather) {
        var e0 = Math.min(1, t / 500);
        x = p.sx + Math.sin(t * .0012 + p.ph) * 3 * dpr; y = p.sy + Math.cos(t * .001 + p.ph) * 3 * dpr;
        a *= e0 * .8;
      } else if (t < tOut) {
        var e = Math.min(1, Math.max(0, (t - tGather - p.delay * T.gather) / (T.gather * (1 - p.delay))));
        var u = ease(e);
        // Curved flight: a sideways bow that fades as it arrives.
        var dx = p.tx - p.sx, dy = p.ty - p.sy, bow = Math.sin(Math.PI * u) * 0.18;
        x = p.sx + dx * u - dy * bow; y = p.sy + dy * u + dx * bow;
        rot = p.rot + p.spin * (1 - u) * 2;
        a *= .8 + .2 * u;
        if (t > tHold) { // settled: a slow shimmer and a very slow turn of the whole ring
          var k = (t - tHold) * .00025;
          var ang = Math.atan2(p.ty - cy, p.tx - cx) + k, rad = Math.hypot(p.tx - cx, p.ty - cy);
          x = cx + Math.cos(ang) * rad; y = cy + Math.sin(ang) * rad;
          a *= .85 + .15 * Math.sin(t * .003 + p.ph);
        }
      } else {
        var o = ease(Math.min(1, (t - tOut) / T.out));
        var ang2 = Math.atan2(p.ty - cy, p.tx - cx) + (tOut - tHold) * .00025, rad2 = Math.hypot(p.tx - cx, p.ty - cy);
        var bx = cx + Math.cos(ang2) * rad2, by = cy + Math.sin(ang2) * rad2;
        x = bx + (p.ox - p.tx) * o; y = by + (p.oy - p.ty) * o;
        a *= 1 - o; sc = 1 + o * .6;
      }
      if (a <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = a; ctx.fillStyle = p.c;
      ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
      var h = p.s / 2; ctx.fillRect(-h, -h, p.s, p.s);
      ctx.restore();
    }
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
    build();
    requestAnimationFrame(function () { intro.classList.add('roll'); raf = requestAnimationFrame(frame); });
    setTimeout(finish, tEnd + 400);
  }

  intro.addEventListener('click', finish);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); }, { once: true });
  window.addEventListener('resize', function () { if (!done) size(); });
  start();
})();
