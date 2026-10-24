// AUM concept site: menu, scroll reveals, mosaic ornaments, programme finder and fee table. No libraries.
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

  function card(p) {
    var name = p[lang] || p.en, fac = FAC[p.faculty] ? (FAC[p.faculty][lang] || FAC[p.faculty].en) : '';
    var chips = ['<span class="chip gold">' + esc(t(p.level)) + '</span>'];
    if (p.credits) chips.push('<span class="chip">' + fmt(p.credits) + ' ' + esc(t('credits')) + '</span>');
    if (p.minAverage) chips.push('<span class="chip">' + fmt(p.minAverage) + '% ' + esc(t('minAverage')) + '</span>');
    var href = p.page ? root + p.page : (root + 'academics.html#' + p.faculty);
    return '<a class="pcard" href="' + href + '"><span class="fac">' + esc(fac) + '</span><h3>' + esc(name) + '</h3><div class="meta">' + chips.join('') + '</div><span class="go" aria-hidden="true">→</span></a>';
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
      list.innerHTML = out.length ? out.map(card).join('') : '<p class="empty">' + esc(t('finderEmpty')) + '</p>';
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
})();
