// AUM concept site: menu, scroll reveals, mosaic ornaments, programme finder, fee table, slider, reels, study-plan tabs and the built-in guide. No libraries.
(function () {
  var doc = document, html = doc.documentElement;
  html.classList.add('js');
  var lang = html.lang === 'ar' ? 'ar' : 'en';
  var S = window.AUM_STRINGS || {};
  function t(k) { return (S[k] && S[k][lang]) || (S[k] && S[k].en) || k; }

  // Menu
  var burger = doc.querySelector('.burger'), nav = doc.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      doc.body.classList.toggle('menu-open', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); doc.body.classList.remove('menu-open'); } });
  }

  // Scroll reveals
  var rv = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Mosaic tesserae scattered inside any .tesserae container (decorative only)
  var COLORS = ['#b4563a', '#d2a24a', '#7d8a5a', '#dcc8a3', '#f3ecdf', '#8b0a12', '#c08a2e'];
  doc.querySelectorAll('.tesserae').forEach(function (box) {
    var n = +box.dataset.count || 40, frag = doc.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var s = doc.createElement('i');
      var size = 8 + Math.random() * 14;
      s.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;width:' + size + 'px;height:' + size + 'px;background:' + COLORS[(Math.random() * COLORS.length) | 0] + ';--r:' + (Math.random() * 40 - 20) + 'deg;opacity:' + (.25 + Math.random() * .4);
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });

  // Student tools filter
  var tq = doc.getElementById('t-q');
  if (tq) {
    var cards = [].slice.call(doc.querySelectorAll('.tool')), groups = [].slice.call(doc.querySelectorAll('.tgroup')), emptyT = doc.getElementById('t-empty');
    tq.addEventListener('input', function () {
      var n = tq.value.trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) { var ok = !n || c.dataset.text.indexOf(n) !== -1; c.hidden = !ok; if (ok) shown++; });
      groups.forEach(function (g) { g.hidden = !g.querySelector('.tool:not([hidden])'); });
      emptyT.hidden = shown > 0;
    });
  }

  // Programme data
  var D = window.AUM_DATA;
  if (!D) return;
  var FAC = {}; D.faculties.forEach(function (f) { FAC[f.id] = f; });
  function fmt(n) { return n.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function estimate(p) { return (p.credits && p.feePerCredit) ? p.credits * p.feePerCredit : null; }
  var root = html.dataset.root || '';

  function planHref(p) { return p.plan ? root + 'plans/' + p.plan + '.html' : (p.dept || ''); }
  function card(p) {
    var name = p[lang] || p.en, fac = FAC[p.faculty] ? (FAC[p.faculty][lang] || FAC[p.faculty].en) : '';
    var chips = ['<span class="chip gold">' + esc(t(p.level)) + '</span>'];
    if (p.credits) chips.push('<span class="chip">' + fmt(p.credits) + ' ' + esc(t('credits')) + '</span>');
    if (p.minAverage) chips.push('<span class="chip">' + fmt(p.minAverage) + '% ' + esc(t('minAverage')) + '</span>');
    var href = p.page ? root + p.page : planHref(p) || (root + 'academics.html#' + p.faculty);
    var plan = planHref(p);
    var planLink = plan ? '<a class="plan" href="' + plan + '"' + (p.plan ? '' : ' target="_blank" rel="noopener"') + '>' + esc(t('studyPlan')) + (p.plan ? '' : ' ↗') + '</a>' : '';
    var DT = window.AUM_DEPT || {}, thumb = p.plan && DT[p.plan] ? '<img class="pthumb" src="' + DT[p.plan] + '" alt="" loading="lazy" width="52" height="52">' : '';
    return '<div class="pcard' + (thumb ? ' has-thumb' : '') + '">' + thumb + '<a class="pmain" href="' + href + '"><span class="fac">' + esc(fac) + '</span><h3>' + esc(name) + '</h3></a><div class="meta">' + chips.join('') + planLink + '</div><span class="go" aria-hidden="true">→</span></div>';
  }

  // Finder (home)
  var finder = doc.getElementById('finder');
  if (finder) {
    var q = finder.querySelector('#f-q'), fs = finder.querySelector('#f-fac'), lv = finder.querySelector('#f-level'), list = finder.querySelector('#f-list'), count = finder.querySelector('#f-count');
    D.faculties.forEach(function (f) { var o = doc.createElement('option'); o.value = f.id; o.textContent = f[lang] || f.en; fs.appendChild(o); });
    var params = new URLSearchParams(location.search);
    if (params.get('faculty')) fs.value = params.get('faculty');
    function norm(s) { return s.toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه'); }
    function render() {
      var needle = norm(q.value.trim()), fac = fs.value, level = lv.value;
      var out = D.programmes.filter(function (p) {
        if (fac && p.faculty !== fac) return false;
        if (level && p.level !== level) return false;
        if (!needle) return true;
        var hay = norm(p.en + ' ' + p.ar + ' ' + (FAC[p.faculty].en) + ' ' + (FAC[p.faculty].ar));
        return hay.indexOf(needle) !== -1;
      });
      count.textContent = fmt(out.length) + ' ' + t('finderCount');
      if (!out.length) { list.innerHTML = '<p class="empty">' + esc(t('finderEmpty')) + '</p>'; return; }
      list.classList.toggle('grouped', !fac && !needle);
      if (fac || needle) { list.innerHTML = out.map(card).join(''); return; }
      // No filter: group the cards by faculty so the list reads as a map of the university
      // v4c: one drop-down per faculty, so the whole university fits on one screen
      var FI = window.AUM_FAC || {};
      list.innerHTML = D.faculties.map(function (f) {
        var ps = out.filter(function (p) { return p.faculty === f.id; });
        if (!ps.length) return '';
        var names = ps.slice(0, 3).map(function (p) { return p[lang] || p.en; }).join(' · ') + (ps.length > 3 ? ' · …' : '');
        var fi = FI[f.id] || {}, face = fi.icon || '';
        return '<details class="fgroup-d" id="fg-' + f.id + '"' + (fi.color ? ' style="--fc:' + fi.color + '"' : '') + '><summary>' + face + '<span class="fg-text"><span class="fg-name">' + esc(f[lang] || f.en) + '</span><span class="fg-peek">' + esc(names) + '</span></span><small>' + (ps.length === 1 ? esc(t('programmeOne')) : fmt(ps.length) + ' ' + esc(t('programmesN'))) + '</small></summary><div class="fg-body">' + ps.map(card).join('') + '</div></details>';
      }).join('');
    }
    var fchips = [].slice.call(finder.querySelectorAll('.fchip'));
    function syncChips() { fchips.forEach(function (b) { b.classList.toggle('on', b.dataset.fac === fs.value); }); }
    fchips.forEach(function (b) { b.addEventListener('click', function () { fs.value = b.dataset.fac; syncChips(); render(); }); });
    fs.addEventListener('change', syncChips);
    [q, fs, lv].forEach(function (el) { el.addEventListener('input', render); el.addEventListener('change', render); });
    syncChips(); render();
  }

  // Programme lists by faculty (academics page)
  doc.querySelectorAll('[data-programmes]').forEach(function (box) {
    var fac = box.dataset.programmes, level = box.dataset.level || 'bachelor';
    var out = D.programmes.filter(function (p) { return (fac === 'all' || p.faculty === fac) && p.level === level; });
    box.innerHTML = out.map(card).join('');
  });

  // Fee table (admissions page)
  var fees = doc.getElementById('fee-rows');
  if (fees) {
    var rows = D.programmes.filter(function (p) { return p.level === 'bachelor' && (p.credits || p.feePerCredit || p.minAverage); });
    fees.innerHTML = rows.map(function (p) {
      var est = estimate(p), fac = FAC[p.faculty][lang] || FAC[p.faculty].en;
      var dash = '<span class="dash">—</span>';
      return '<tr><td><b>' + esc(p[lang] || p.en) + '</b><br><small>' + esc(fac) + '</small></td>' +
        '<td class="num">' + (p.credits ? fmt(p.credits) : dash) + '</td>' +
        '<td class="num">' + (p.minAverage ? fmt(p.minAverage) + '%' : dash) + '</td>' +
        '<td class="num">' + (p.feePerCredit ? fmt(p.feePerCredit) : dash) + '</td>' +
        '<td class="num">' + (est ? '<b>' + fmt(est) + '</b>' : dash) + '</td></tr>';
    }).join('');
  }

  // Alumni stories: one at a time, rotate every 8 s, dots to pick
  const sl = document.querySelector('[data-slides]');
  if (sl) {
    const slides = [...sl.querySelectorAll('.alum-slide')];
    const dots = [...document.querySelectorAll('.alum-dots button')];
    let cur = 0, timer;
    const show = (n) => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((el, i) => el.classList.toggle('on', i === cur));
      dots.forEach((d, i) => { d.classList.toggle('on', i === cur); d.setAttribute('aria-selected', i === cur ? 'true' : 'false'); });
      slides[cur].querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
    };
    const start = () => { clearInterval(timer); if (slides.length > 1) timer = setInterval(() => show(cur + 1), 8000); };
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
    start();
  }

  // v4: "Latest" slider (swipe, dots, arrows, gentle auto-advance while in view)
  doc.querySelectorAll('[data-slider]').forEach(function (box) {
    var track = box.querySelector('.slides'), items = [].slice.call(track.children), dotsBox = box.querySelector('.sdots');
    if (items.length < 2) { var nav = box.querySelector('.slider-nav'); if (nav) nav.hidden = true; return; }
    var dots = items.map(function (_, i) { var b = doc.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', (i + 1) + ' / ' + items.length); b.addEventListener('click', function () { go(i); rest(); }); dotsBox.appendChild(b); return b; });
    var cur = 0, timer, restUntil = 0, visible = false;
    function mark(i) { cur = i; dots.forEach(function (d, j) { d.classList.toggle('on', j === i); d.setAttribute('aria-selected', j === i ? 'true' : 'false'); }); }
    function go(i) { i = (i + items.length) % items.length; track.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: 'smooth' }); mark(i); }
    function rest() { restUntil = Date.now() + 12000; }
    box.querySelector('.prev').addEventListener('click', function () { go(cur - 1); rest(); });
    box.querySelector('.next').addEventListener('click', function () { go(cur + 1); rest(); });
    var raf; track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var w = items[0].offsetWidth + 18; var i = Math.round(Math.abs(track.scrollLeft) / w); if (i !== cur && i >= 0 && i < items.length) mark(i); }); });
    ['pointerdown', 'touchstart', 'focusin', 'mouseenter'].forEach(function (ev) { box.addEventListener(ev, rest, { passive: true }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .4 }).observe(box); else visible = true;
    timer = setInterval(function () { if (!visible || doc.hidden || Date.now() < restUntil) return; go(cur + 1); }, 6000);
    mark(0);
  });

  // v4e: Why AUM photo band: slides on its own, swipes by finger or mouse, dots and arrows
  doc.querySelectorAll('[data-band]').forEach(function (band) {
    var slides = [].slice.call(band.querySelectorAll('.band-slide')), dots = [].slice.call(band.querySelectorAll('.band-dots button'));
    if (slides.length < 2) { var ui = band.querySelector('.band-ui'); if (ui) ui.hidden = true; return; }
    var cur = 0, timer, busy = false, restUntil = 0, visible = true, rtl = html.dir === 'rtl';
    function go(n, dir) {
      if (busy) return; n = (n + slides.length) % slides.length; if (n === cur) return;
      dir = dir || (n > cur ? 1 : -1); if (rtl) dir = -dir;
      var from = slides[cur], to = slides[n]; busy = true;
      to.classList.add('on'); to.style.transition = 'none'; to.style.transform = 'translateX(' + (dir * 100) + '%)'; to.style.zIndex = 2; from.style.zIndex = 1;
      void to.offsetWidth; to.style.transition = ''; to.style.transform = 'translateX(0)'; from.style.transform = 'translateX(' + (dir * -100) + '%)';
      setTimeout(function () { from.classList.remove('on'); from.style.transform = ''; from.style.zIndex = ''; to.style.zIndex = ''; from.tabIndex = -1; to.tabIndex = 0; busy = false; }, 820);
      cur = n; dots.forEach(function (d, i) { d.classList.toggle('on', i === n); d.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
    }
    function rest() { restUntil = Date.now() + 9000; }
    band.querySelector('.band-btn.next').addEventListener('click', function () { go(cur + 1, 1); rest(); });
    band.querySelector('.band-btn.prev').addEventListener('click', function () { go(cur - 1, -1); rest(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); rest(); }); });
    // swipe: one small swipe = one photo
    var sx = null, sy = null, moved = false;
    band.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; moved = false; rest(); }, { passive: true });
    band.addEventListener('pointermove', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 8) moved = true; }, { passive: true });
    band.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) { var fwd = rtl ? dx > 0 : dx < 0; go(cur + (fwd ? 1 : -1), fwd ? 1 : -1); } });
    band.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    band.addEventListener('mouseenter', rest); band.addEventListener('focusin', rest);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .3 }).observe(band);
    timer = setInterval(function () { if (!visible || doc.hidden || Date.now() < restUntil) return; go(cur + 1, 1); }, 4600);
  });

  // v4e: breaking-news bar in the newsroom (data from data/alerts.json; hidden when nothing is active)
  var tick = doc.getElementById('ticker'), AL = window.AUM_ALERTS || {};
  if (tick && AL.active && AL.items && AL.items.length) {
    var track = tick.querySelector('.ticker-track');
    var items = AL.items.map(function (it) { var tag = it.url ? 'a' : 'span'; return '<' + tag + ' class="tick-item' + (it.level === 'breaking' ? ' hot' : '') + '"' + (it.url ? ' href="' + esc(it.url) + '" target="_blank" rel="noopener"' : '') + '>' + esc(it.text) + '</' + tag + '>'; }).join('');
    track.innerHTML = items + items;
    var len = AL.items.reduce(function (n, it) { return n + it.text.length; }, 0);
    track.style.setProperty('--dur', Math.max(18, Math.min(70, len / 5)) + 's');
    tick.classList.toggle('hot', AL.items.some(function (it) { return it.level === 'breaking'; }));
    tick.hidden = false;
  }

  // v4e: Academics page: faculty drop-downs open with a height animation, index chips track the open faculty, open/close all
  var facblocks = [].slice.call(doc.querySelectorAll('details.facblock'));
  if (facblocks.length && 'animate' in Element.prototype) {
    facblocks.forEach(function (d) {
      var sum = d.querySelector('summary'), body = d.querySelector('.facblock-body');
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open) { var h = body.offsetHeight; body.style.overflow = 'hidden'; body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = function () { d.open = false; body.style.overflow = ''; }; }
        else { d.open = true; var h2 = body.offsetHeight; body.style.overflow = 'hidden'; body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = function () { body.style.overflow = ''; }; }
      });
    });
    var idxChips = [].slice.call(doc.querySelectorAll('#facindex .fchip'));
    idxChips.forEach(function (ch) { ch.addEventListener('click', function () { var d = doc.getElementById(ch.getAttribute('href').slice(1)); if (d && !d.open) d.open = true; }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { var ch = doc.querySelector('#facindex .fchip[href="#' + en.target.id + '"]'); if (ch) ch.classList.toggle('on', en.isIntersecting); }); }, { rootMargin: '-40% 0px -50% 0px' });
      facblocks.forEach(function (d) { io.observe(d); });
    }
    [].slice.call(doc.querySelectorAll('[data-fac-all]')).forEach(function (b) { b.addEventListener('click', function () { var open = b.dataset.facAll === 'open'; facblocks.forEach(function (d) { d.open = open; }); }); });
  }

  // v4e: Life at AUM: audience switch, bus finder, club filter
  var seg = doc.querySelector('.aud-seg');
  if (seg) {
    var audBtns = [].slice.call(seg.querySelectorAll('button')), secs = [].slice.call(doc.querySelectorAll('[data-aud]'));
    audBtns.forEach(function (b) { b.addEventListener('click', function () {
      var a = b.dataset.aud; audBtns.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      secs.forEach(function (sc) { var hide = a !== 'all' && sc.dataset.aud !== a && sc.dataset.aud !== 'all'; sc.classList.toggle('aud-hide', hide); });
      doc.body.dataset.aud = a;
      var first = a === 'all' ? null : doc.querySelector('[data-aud="' + a + '"]'); if (first) first.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    }); });
  }
  var busSel = doc.getElementById('bus-from'), busFee = doc.getElementById('bus-fee');
  if (busSel && busFee) busSel.addEventListener('change', function () { busFee.textContent = (+busSel.value).toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB'); });
  var kindChips = doc.getElementById('kind-chips'), clubPills = doc.getElementById('club-pills');
  if (kindChips && clubPills) [].slice.call(kindChips.querySelectorAll('.fchip')).forEach(function (ch) { ch.addEventListener('click', function () {
    var k = ch.dataset.kind; [].slice.call(kindChips.querySelectorAll('.fchip')).forEach(function (x) { x.classList.toggle('on', x === ch); });
    [].slice.call(clubPills.children).forEach(function (pl) { pl.classList.toggle('dim', !!k && pl.dataset.kind !== k); });
  }); });

  // v4: reels play on their own while on screen; one tap turns the sound on
  var reels = [].slice.call(doc.querySelectorAll('video[data-autoplay]'));
  if (reels.length) {
    var play = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if ('IntersectionObserver' in window) {
      var rio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) play(en.target); else en.target.pause(); }); }, { threshold: .5 });
      reels.forEach(function (v) { rio.observe(v); });
    } else reels.forEach(play);
    doc.querySelectorAll('.reel-sound').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.parentNode.querySelector('video'), on = v.muted;
        reels.forEach(function (o) { if (o !== v) { o.muted = true; o.parentNode.classList.remove('sound'); var ob = o.parentNode.querySelector('.reel-sound'); if (ob) ob.setAttribute('aria-label', ob.dataset.off); } });
        v.muted = !on; b.parentNode.classList.toggle('sound', on); b.setAttribute('aria-label', on ? b.dataset.on : b.dataset.off); if (on) play(v);
      });
    });
  }

  // v4: study plan version tabs
  doc.querySelectorAll('.plan-versions').forEach(function (bar) {
    var btns = [].slice.call(bar.querySelectorAll('[data-ver]'));
    btns.forEach(function (b) { b.addEventListener('click', function () {
      btns.forEach(function (o) { o.classList.toggle('on', o === b); o.setAttribute('aria-selected', o === b ? 'true' : 'false'); var panel = doc.getElementById(o.dataset.ver); if (panel) panel.hidden = o !== b; });
    }); });
  });

  // v4: built-in guide (keyword matching against this site's own pages; nothing leaves the browser)
  var G = window.AUM_GUIDE, fab = doc.querySelector('.guide-fab'), panel = doc.getElementById('guide');
  if (G && fab && panel) {
    var log = doc.getElementById('guide-log'), form = doc.getElementById('guide-form'), input = doc.getElementById('guide-q'), greeted = false;
    function gnorm(s) { return String(s).toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim(); }
    function bubble(cls, html) { var d = doc.createElement('div'); d.className = 'g-msg ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
    function links(l) { return l && l.length ? '<div class="g-links">' + l.map(function (x) { return '<a class="g-link" href="' + esc(x[1]) + '"' + (x[2] ? ' target="_blank" rel="noopener"' : '') + '>' + esc(x[0]) + (x[2] ? ' ↗' : '') + '</a>'; }).join('') + '</div>' : ''; }
    function open(o) { panel.hidden = !o; fab.setAttribute('aria-expanded', o ? 'true' : 'false'); doc.body.classList.toggle('guide-open', o); if (o) { if (!greeted) { greeted = true; bubble('g-bot', esc(G.hi)); } setTimeout(function () { input.focus(); }, 50); } else fab.focus(); }
    fab.addEventListener('click', function () { open(panel.hidden); });
    panel.querySelector('.guide-close').addEventListener('click', function () { open(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });
    var STOP = ['what', 'can', 'how', 'where', 'the', 'you', 'are', 'for', 'and', 'with', 'your', 'any', 'who', 'when', 'does', 'there', 'some', 'get', 'need', 'want', 'know', 'about', 'find', 'هل', 'ماذا', 'كيف', 'اين', 'متى', 'ما', 'في', 'من', 'على', 'عن'];
    function answer(q) {
      var n = gnorm(q); if (!n) return;
      bubble('g-me', esc(q));
      // 1. a programme named in the question
      var progs = (D ? D.programmes : []).filter(function (p) {
        var en = gnorm(p.en), ar = gnorm(p.ar || '');
        return (en.length > 3 && (n.indexOf(en) !== -1 || en.indexOf(n) !== -1 && n.length > 4)) || (ar.length > 3 && (n.indexOf(ar) !== -1 || ar.indexOf(n) !== -1 && n.length > 3));
      }).slice(0, 4);
      if (progs.length) {
        bubble('g-bot', esc(G.progFound) + progs.map(function (p) {
          var l = [[G.details, p.page ? root + p.page : root + 'academics.html#' + p.faculty]];
          var ph = planHref(p); if (ph) l.push([G.studyPlan, ph, !p.plan]);
          return '<div class="g-card"><b>' + esc(p[lang] || p.en) + '</b>' + links(l) + '</div>';
        }).join(''));
        return;
      }
      // 2. the best keyword entry
      var best = null, bestScore = 0;
      G.entries.forEach(function (e) {
        var score = 0; gnorm(e.k).split(' ').forEach(function (k) { if (k.length >= 3 && STOP.indexOf(k) === -1 && n.indexOf(k) !== -1) score += k.length; });
        if (score > bestScore) { bestScore = score; best = e; }
      });
      if (best) bubble('g-bot', esc(best.a) + links(best.l));
      else bubble('g-bot', esc(G.fallback));
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ''; answer(q); });
    panel.querySelectorAll('.guide-chips button').forEach(function (b) { b.addEventListener('click', function () { answer(b.dataset.q); }); });
  }

  // v4c: the tools card tilts a little towards the pointer on desktop (mouse only; nothing on touch)
  var qc = doc.querySelector('.quick-card');
  if (qc && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tiltRaf;
    qc.addEventListener('pointermove', function (e) {
      var r = qc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(function () { qc.style.setProperty('--tx', (x * 100 + 50).toFixed(1) + '%'); qc.style.setProperty('--ty', (y * 100 + 50).toFixed(1) + '%'); qc.style.transform = 'perspective(1400px) rotateX(' + (-y * 3).toFixed(2) + 'deg) rotateY(' + (x * 4).toFixed(2) + 'deg)'; });
    });
    qc.addEventListener('pointerleave', function () { cancelAnimationFrame(tiltRaf); qc.style.transform = ''; });
  }

  // v4b: faculty blocks fold; a jump chip or a #hash opens the one it points at
  function openTarget(id) { var d = id && doc.getElementById(id.replace(/^#/, '')); if (d && d.tagName === 'DETAILS') d.open = true; }
  openTarget(location.hash);
  window.addEventListener('hashchange', function () { openTarget(location.hash); });
  doc.querySelectorAll('a.fchip[href^="#"]').forEach(function (a) { a.addEventListener('click', function () { openTarget(a.getAttribute('href')); }); });
})();
