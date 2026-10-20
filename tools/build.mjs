// Generates the static pages of the AUM concept site.
//   node tools/build.mjs
// English pages land at the repo root, Arabic pages under ar/. Text comes from data/strings.json,
// programme figures from data/programmes.json. GitHub Pages serves the output as-is; nothing runs there.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = JSON.parse(readFileSync(join(ROOT, 'data/strings.json'), 'utf8'));
const D = JSON.parse(readFileSync(join(ROOT, 'data/programmes.json'), 'utf8'));
const SITE = 'https://labsuncut.github.io/site-aum-madaba/';

const LINKS = {
  apply: 'https://registration.aum.edu.jo/faces/ui/pages/guest/admissionOnline/index.xhtml',
  elearning: 'https://elearning.aum.edu.jo/',
  registration: 'https://reg.aum.edu.jo/PreAdmission.aspx',
  bus: 'https://aum.edu.jo/announcements/bus-schedule-second-semester-2025-2026',
  calendar: 'https://aum.edu.jo/admissions/academic-calendar/view',
  email: 'mailto:info@aum.edu.jo',
  tel: 'tel:+96253294444',
  maps: 'https://www.google.com/maps/search/?api=1&query=American+University+of+Madaba',
  intl: 'https://aum.edu.jo/international-students',
  transport: 'https://www.aum.edu.jo/life-at-aum/transportation',
  aum: 'https://aum.edu.jo/'
};

const PAGES = {
  home: 'index.html', academics: 'academics.html', science: 'faculty-of-science.html',
  biotech: 'biology-and-biotechnology.html', admissions: 'admissions.html', life: 'life-at-aum.html',
  about: 'about.html', notfound: '404.html'
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let uid = 0;

/* ---------- small SVG ornaments ---------- */
const TESS = ['#b4563a', '#d2a24a', '#7d8a5a', '#dcc8a3', '#8b0a12', '#c08a2e', '#5b3a2e'];
function mosaicRule() {
  const id = 'mr' + (++uid);
  return `<svg class="mosaic-rule" aria-hidden="true" preserveAspectRatio="none"><defs><pattern id="${id}" width="84" height="14" patternUnits="userSpaceOnUse">` +
    [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 14 + 2}" y="2" width="10" height="10" rx="1" fill="${TESS[i % TESS.length]}" opacity=".85"/>`).join('') +
    `</pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
}
function ring(cls) {
  // A ring of tesserae, like the border of a Madaba floor.
  let out = '';
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = 184;
    const x = 200 + Math.cos(a) * r, y = 200 + Math.sin(a) * r;
    out += `<rect x="${(x - 7).toFixed(1)}" y="${(y - 7).toFixed(1)}" width="14" height="14" rx="2" fill="${TESS[i % TESS.length]}" transform="rotate(${((a * 180) / Math.PI + 45).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" opacity=".9"/>`;
  }
  return `<svg class="${cls}" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="160" fill="none" stroke="#c08a2e" stroke-width="1.2" stroke-dasharray="3 9" opacity=".7"/><circle cx="200" cy="200" r="198" fill="none" stroke="#c08a2e" stroke-width="1" opacity=".45"/>${out}</svg>`;
}
const ICONS = {
  engineering: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  science: '<path d="M9 3h6"/><path d="M10 3v6.3L4.6 18.4A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.6L14 9.3V3"/><path d="M7.5 15h9"/>',
  health: '<path d="M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 6.5-6.5L12 7.1l1-1a4.6 4.6 0 0 1 6.5 6.5Z"/><path d="M8 12h2l1.5-3 2 6 1.5-3h2"/>',
  it: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
  business: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  design: '<path d="M12 19 19 12l2 2-7 7-2-2Z"/><path d="M18 13l-1.4-1.4"/><path d="M2 2l7.6 7.6"/><path d="M4 20c0-3.3 2.7-6 6-6l2 2-6 6c-1.1 0-2-.9-2-2Z"/><path d="M2 2c3.3 0 6 2.7 6 6"/>',
  languages: '<path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  bus: '<path d="M8 6v6M16 6v6M2 12h20"/><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/><circle cx="7.5" cy="17" r="1"/><circle cx="16.5" cy="17" r="1"/>',
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  clubs: '<circle cx="12" cy="12" r="9"/><path d="m12 7 1.5 3 3.3.5-2.4 2.3.6 3.2L12 14.5 9 16l.6-3.2-2.4-2.3 3.3-.5L12 7Z"/>',
  intl: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4V4Z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7V4Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};
const icon = (k) => `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg></span>`;

/* ---------- page shell ---------- */
function shell(ctx, page, body) {
  const { lang, R, t, c } = ctx; const sec = S[page] || {};
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const file = PAGES[page];
  const other = lang === 'ar' ? R + file : R + 'ar/' + file;
  const seal = R + 'assets/img/seal.png';
  const strings = {};
  for (const k of Object.keys(S.common)) strings[k] = S.common[k];
  for (const k of Object.keys(S[page] || {})) strings[k] = S[page][k];
  const navItems = [
    ['academics', c('navAcademics')], ['science', c('navScience')], ['admissions', c('navAdmissions')],
    ['life', c('navLife')], ['about', c('navAbout')]
  ];
  const nav = navItems.map(([p, label]) => `<a href="${R + PAGES[p]}"${p === page ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  const tools = [
    [LINKS.elearning, c('toolElearning')], [LINKS.registration, c('toolRegistration')], [LINKS.bus, c('toolBus')],
    [LINKS.calendar, c('toolCalendar')], [LINKS.email, c('toolEmail')]
  ];
  const toolLinks = (cls) => tools.map(([h, l]) => `<a href="${h}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}${cls ? ` class="${cls}"` : ''}>${esc(l)}</a>`).join('');
  const brand = (extra = '') => `<a class="brand${extra}" href="${R}index.html"><img src="${seal}" width="46" height="46" alt=""><span class="brand-text"><span class="brand-name">${esc(c('siteName'))}</span><span class="brand-sub">${esc(c('motto'))}</span></span></a>`;

  return `<!doctype html>
<html lang="${lang}" dir="${dir}"${R ? ` data-root="${R}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t('title'))}</title>
<meta name="description" content="${esc(sec.description ? t('description') : t('lead'))}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#8b0a12">
<link rel="icon" href="${R}assets/img/favicon-48.png" sizes="48x48">
<link rel="icon" href="${R}assets/img/icon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="${R}assets/img/apple-touch-icon.png">
<link rel="alternate" hreflang="en" href="${SITE}${file}">
<link rel="alternate" hreflang="ar" href="${SITE}ar/${file}">
<link rel="alternate" hreflang="x-default" href="${SITE}${file}">
<link rel="preload" href="${R}assets/fonts/${lang === 'ar' ? 'amiri-arabic-bold' : 'cormorant-latin'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${R}assets/css/site.css">
<script>window.AUM_STRINGS=${JSON.stringify(strings)};window.AUM_DATA=${JSON.stringify(D)};</script>
</head>
<body>
<div class="intro" id="intro" aria-hidden="true">
  <canvas class="intro-canvas" id="intro-canvas"></canvas>
  <div class="intro-stage">
    <img class="intro-seal" src="${seal}" width="239" height="239" alt="">
    <p class="intro-name"><small>${esc(lang === 'ar' ? 'مادبا · الأردن' : 'Madaba · Jordan')}</small>${esc(c('siteName'))}</p>
    <p class="intro-motto">${esc(c('motto'))}</p>
  </div>
  <button class="intro-skip" type="button">${esc(c('skip'))}</button>
</div>
<script src="${R}assets/js/intro.js"></script>
<div class="tools">
  <div class="wrap">
    <span class="tools-label">${esc(c('tools'))}</span>
    <nav class="tools-links" aria-label="${esc(c('tools'))}">${toolLinks()}</nav>
    <a class="lang" href="${other}" lang="${lang === 'ar' ? 'en' : 'ar'}" hreflang="${lang === 'ar' ? 'en' : 'ar'}" aria-label="${esc(c('langSwitchLabel'))}">${esc(c('langSwitch'))}</a>
  </div>
</div>
<header class="top">
  <div class="wrap">
    ${brand()}
    <button class="burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="${esc(c('menu'))}"><span></span><span></span><span></span></button>
    <nav class="nav" id="nav" aria-label="${esc(c('menu'))}">${nav}<a class="btn" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))}</a></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        ${brand()}
        <p>${esc(c('address'))}</p>
        <p><a href="${LINKS.tel}">${esc(c('phone'))}</a><br>${esc(c('phoneAdmissions'))}</p>
        <p><a href="${LINKS.email}">info@aum.edu.jo</a></p>
      </div>
      <div><h4>${esc(c('footerSitemap'))}</h4><ul>${navItems.map(([p, l]) => `<li><a href="${R + PAGES[p]}">${esc(l)}</a></li>`).join('')}<li><a href="${R}index.html#finder">${esc(c('findProgramme'))}</a></li></ul></div>
      <div><h4>${esc(c('footerStudents'))}</h4><ul>${tools.map(([h, l]) => `<li><a href="${h}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(l)}</a></li>`).join('')}</ul></div>
      <div><h4>${esc(c('contact'))}</h4><ul><li><a href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))}</a></li><li><a href="${LINKS.maps}" target="_blank" rel="noopener">${esc(c('directions'))}</a></li><li><a href="${LINKS.aum}" target="_blank" rel="noopener">aum.edu.jo</a></li><li><a href="${other}" lang="${lang === 'ar' ? 'en' : 'ar'}">${esc(c('langSwitch'))}</a></li><li><a href="#main">${esc(c('back'))}</a></li></ul></div>
    </div>
    <div class="foot-bottom">
      <span class="badge">${esc(c('concept'))}</span>
      <p>${esc(c('footerRights'))}<br>${esc(c('accredited'))}</p>
    </div>
  </div>
</footer>
<script src="${R}assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- reusable blocks ---------- */
const head = (ctx, kicker, title, lead, center) =>
  `<div class="section-head${center ? ' center' : ''} rv">${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}<h2>${esc(title)}</h2>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div>`;

const phero = (ctx, kicker, h1, lead, h1em) =>
  `<section class="phero"><div class="wrap"><div class="phero-band">${ring('')}</div><span class="kicker rv">${esc(kicker)}</span><h1 class="rv d1">${esc(h1)}${h1em ? ` <em>${esc(h1em)}</em>` : ''}</h1><p class="lead rv d2">${esc(lead)}</p></div></section>${mosaicRule()}`;

const applyCta = (ctx, extraLink) => {
  const { R, c, T } = ctx;
  return `<section class="section"><div class="wrap"><div class="cta rv"><div><span class="kicker">${esc(T('biotech', 'applyKicker'))}</span><h2>${esc(T('biotech', 'applyTitle'))}</h2><p>${esc(c('applyNote'))}</p></div><div class="actions"><a class="btn btn-light" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))} <span class="arr">→</span></a><a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="${R + PAGES.admissions}">${esc(c('howToApply'))}</a>${extraLink || ''}</div></div></div></section>`;
};

const contactTiles = (ctx, kicker, title, lead) => {
  const { c } = ctx;
  return `<section class="section tint" id="contact"><div class="wrap">${head(ctx, kicker, title, lead)}<div class="contact">
    <div class="tile rv">${icon('phone')}<h3>${esc(S.home.visitCall[ctx.lang])}</h3><a href="${LINKS.tel}">${esc(c('phone'))}</a><p>${esc(c('phoneAdmissions'))}</p></div>
    <div class="tile rv d1">${icon('mail')}<h3>${esc(S.home.visitEmail[ctx.lang])}</h3><a href="${LINKS.email}">info@aum.edu.jo</a><p>${esc(S.admissions.contactLead[ctx.lang])}</p></div>
    <div class="tile rv d2">${icon('pin')}<h3>${esc(c('directions'))}</h3><a href="${LINKS.maps}" target="_blank" rel="noopener">${esc(c('address'))}</a><p>${esc(S.home.visitLead[ctx.lang])}</p></div>
  </div></div></section>`;
};

const facultyIcon = { engineering: 'engineering', science: 'science', health: 'health', it: 'it', business: 'business', design: 'design', languages: 'languages' };
const count = (fid, level) => D.programmes.filter((p) => p.faculty === fid && p.level === level).length;

/* ---------- pages ---------- */
function home(ctx) {
  const { R, t, c, lang } = ctx;
  const seal = R + 'assets/img/seal.png';
  const stats = [['statFacultiesN', 'statFaculties'], ['statLangN', 'statLang'], ['statSinceN', 'statSince'], ['statNecheN', 'statNeche']]
    .map(([n, l]) => `<div class="stat"><b>${esc(t(n))}</b><span>${esc(t(l))}</span></div>`).join('');
  const faculties = D.faculties.map((f, i) => {
    const n = count(f.id, 'bachelor'), m = count(f.id, 'master');
    const parts = [];
    if (n) parts.push(`${n} ${lang === 'ar' ? (n === 1 ? 'برنامج بكالوريوس' : 'برامج بكالوريوس') : (n === 1 ? 'bachelor programme' : 'bachelor programmes')}`);
    if (m) parts.push(`${m} ${lang === 'ar' ? (m === 1 ? 'برنامج ماجستير' : 'برامج ماجستير') : (m === 1 ? 'master programme' : 'master programmes')}`);
    const line = parts.length ? parts.join(' · ') : (lang === 'ar' ? 'تفاصيل البرامج تُضاف من الكلية' : 'Programme details to be added from the faculty');
    const href = f.id === 'science' ? R + PAGES.science : R + PAGES.academics + '#' + f.id;
    return `<a class="tile rv d${i % 4}" href="${href}">${icon(facultyIcon[f.id])}<h3>${esc(f[lang])}</h3><p>${esc(line)}</p><span class="link">${esc(c('learnMore'))}</span></a>`;
  }).join('');
  const labs = [1, 2, 3, 4].map((i) => `<div class="lab"><b>${esc(S.science['lab' + i + 'T'][lang])}</b><span>${esc(S.science['lab' + i + 'D'][lang])}</span></div>`).join('');
  const life = [['bus', 'Bus'], ['home', 'Housing'], ['clubs', 'Clubs'], ['intl', 'Intl']].map(([ic, k], i) =>
    `<a class="tile rv d${i}" href="${R + PAGES.life}#${k.toLowerCase()}">${icon(ic)}<h3>${esc(t('life' + k + 'T'))}</h3><p>${esc(t('life' + k + 'D'))}</p><span class="link">${esc(c('learnMore'))}</span></a>`).join('');
  const news = [1, 2, 3, 4].map((i) => `<article class="rv d${i - 1}"><h3>${esc(t('news' + i + 'T'))}</h3><p>${esc(t('news' + i + 'D'))}</p></article>`).join('');

  return `
<section class="hero">
  <div class="hero-wall tesserae" data-count="110"></div>
  <div class="wrap hero-grid">
    <div>
      <span class="kicker rv">${esc(t('kicker'))}</span>
      <h1 class="rv d1">${esc(t('h1a'))} <em>${esc(t('h1b'))}</em></h1>
      <p class="lead rv d2">${esc(t('lead'))}</p>
      <div class="hero-cta rv d3">
        <a class="btn" href="#finder">${esc(c('findProgramme'))} <span class="arr">→</span></a>
        <a class="btn btn-ghost" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))}</a>
      </div>
    </div>
    <div class="hero-seal rv d2">${ring('hero-ring')}<img src="${seal}" width="239" height="239" alt="${esc(c('siteName'))}"></div>
  </div>
</section>
${mosaicRule()}
<section class="stats"><div class="wrap">${stats}</div></section>

<section class="section" id="finder">
  <div class="wrap">
    ${head(ctx, t('finderKicker'), t('finderTitle'), t('finderLead'))}
    <div class="finder rv">
      <div class="finder-controls">
        <label class="field">${esc(t('finderSearch'))}<input id="f-q" type="search" placeholder="${esc(t('finderPlaceholder'))}" autocomplete="off"></label>
        <label class="field">${esc(t('finderFaculty'))}<select id="f-fac"><option value="">${esc(t('finderAll'))}</option></select></label>
        <label class="field">${esc(t('finderLevel'))}<select id="f-level"><option value="">${esc(t('finderAllLevels'))}</option><option value="bachelor">${esc(c('bachelor'))}</option><option value="master">${esc(c('master'))}</option></select></label>
      </div>
      <div class="finder-meta"><span id="f-count"></span><span>${esc(c('verify'))}</span></div>
      <div class="plist" id="f-list"></div>
      <p class="finder-note">${esc(t('finderNote'))} ${esc(c('estimate'))}: ${esc(c('estimateNote'))}.</p>
    </div>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('facultiesKicker'), t('facultiesTitle'), '', true)}
    <div class="grid c4">${faculties}<a class="tile rv d3" href="${R + PAGES.academics}#graduate">${icon('book')}<h3>${esc(S.academics.graduate[lang])}</h3><p>${esc(lang === 'ar' ? 'ثلاثة برامج ماجستير في الأعمال وإدارة المخاطر والأمن السيبراني' : 'Three master programmes in business, risk management and cybersecurity')}</p><span class="link">${esc(c('learnMore'))}</span></a></div>
  </div>
</section>
${mosaicRule()}
<section class="section dark">
  <div class="wrap">
    <div class="spot">
      <div class="photo olive rv"><div class="tesserae" data-count="70"></div><p class="note">${esc(S.science.photoNote[lang])}</p></div>
      <div>
        ${head(ctx, t('scienceKicker'), t('scienceTitle'), t('scienceLead'))}
        <div class="labs rv d1">${labs}</div>
        <p class="rv d2" style="margin-top:26px"><a class="btn btn-light" href="${R + PAGES.science}">${esc(t('scienceCta'))} <span class="arr">→</span></a></p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head(ctx, t('lifeKicker'), t('lifeTitle'))}
    <div class="grid c4">${life}</div>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('newsKicker'), t('newsTitle'))}
    <div class="news">${news}</div>
  </div>
</section>
${contactTiles(ctx, t('visitKicker'), t('visitTitle'), t('visitLead'))}
${applyCta(ctx)}`;
}

function academics(ctx) {
  const { R, t, c, lang } = ctx;
  const blocks = D.faculties.map((f) => {
    const n = count(f.id, 'bachelor');
    const list = n ? `<div class="plist" data-programmes="${f.id}" data-level="bachelor"></div>`
      : `<p class="empty" style="text-align:start;padding:18px 0">${esc(lang === 'ar' ? 'لم تُنشر تفاصيل البرامج بعد في هذه المعاينة؛ تُضاف من الكلية.' : 'Programme details are not yet in this preview; they will be added from the faculty.')}</p>`;
    const extra = f.id === 'science' ? ` <a class="link" href="${R + PAGES.science}">${esc(c('navScience'))}</a>` : '';
    return `<div class="facblock rv" id="${f.id}"><div class="facblock-head">${icon(facultyIcon[f.id])}<h3>${esc(f[lang])}</h3>${extra}</div>${list}</div>`;
  }).join('');
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section">
  <div class="wrap">
    ${head(ctx, '', t('byFaculty'), c('verify'))}
    ${blocks}
  </div>
</section>
<section class="section tint" id="graduate">
  <div class="wrap">
    ${head(ctx, c('master'), t('graduate'), t('graduateLead'))}
    <div class="plist rv" data-programmes="all" data-level="master"></div>
  </div>
</section>
<section class="section">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('kicker'))}</span><h2>${esc(t('general'))}</h2><p class="lead">${esc(t('generalLead'))}</p></div>
    <div class="tile rv d1">${icon('calendar')}<h3>${esc(t('calendar'))}</h3><p>${esc(t('calendarLead'))}</p><a class="link" href="${LINKS.calendar}" target="_blank" rel="noopener">${esc(t('openCalendar'))}</a></div>
  </div>
</section>
${applyCta(ctx)}`;
}

function science(ctx) {
  const { R, t, c, lang } = ctx;
  const labs = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<div class="lab rv d${i % 4}"><b>${esc(t('lab' + i + 'T'))}</b><span>${esc(t('lab' + i + 'D'))}</span></div>`).join('');
  const careers = [1, 2, 3, 4].map((i) => `<span class="pill">${esc(S.biotech['car' + i][lang])}</span>`).join('');
  return `
${phero(ctx, t('kicker'), t('h1a'), t('lead'), t('h1b'))}
<section class="section">
  <div class="wrap">
    <div class="dean rv">
      <div class="portrait" aria-hidden="true">${lang === 'ar' ? 'و' : 'WA'}</div>
      <div>
        <span class="kicker">${esc(t('deanKicker'))}</span>
        <blockquote>“${esc(t('deanQuote'))}”</blockquote>
        <div class="who"><b>${esc(t('deanName'))}</b><span>${esc(t('deanRole'))}</span></div>
        <p class="bio">${esc(t('deanBio'))}</p>
        <p class="fine">${esc(t('deanQuoteNote'))}</p>
      </div>
    </div>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('kicker'), t('deptKicker'))}
    <div class="grid c2">
      <a class="tile rv" href="${R + PAGES.biotech}">${icon('science')}<h3>${esc(t('dept1T'))}</h3><p>${esc(t('dept1D'))}</p><span class="link">${esc(t('dept1Cta'))}</span></a>
      <div class="tile rv d1">${icon('book')}<h3>${esc(t('dept2T'))}</h3><p>${esc(t('dept2D'))}</p></div>
    </div>
  </div>
</section>
${mosaicRule()}
<section class="section dark">
  <div class="wrap">
    ${head(ctx, t('labsKicker'), t('labsTitle'), t('labsLead'))}
    <div class="spot">
      <div class="photo rv"><div class="tesserae" data-count="70"></div><p class="note">${esc(t('photoNote'))}</p></div>
      <div class="labs">${labs}</div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('careersKicker'))}</span><h2>${esc(t('careersTitle'))}</h2><p class="lead">${esc(t('careersLead'))}</p><div class="pills">${careers}</div></div>
    <div class="tile rv d1">${icon('user')}<h3>${esc(t('staffKicker'))}</h3><p>${esc(t('staffLead'))}</p></div>
  </div>
</section>
${applyCta(ctx, `<a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="${R + PAGES.biotech}">${esc(t('dept1Cta'))}</a>`)}`;
}

function biotech(ctx) {
  const { R, t, c, lang } = ctx;
  const p = D.programmes.find((x) => x.id === 'biology-biotechnology') || D.programmes.find((x) => x.faculty === 'science');
  const facts = [
    [p.credits, c('credits')], [p.minAverage + '%', c('minAverage')], [p.feePerCredit + ' JD', c('perCredit')], [t('durationV'), t('duration')]
  ].map(([v, l], i) => `<div class="fact rv d${i}"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('');
  const fields = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<span class="pill">${esc(t('f' + i))}</span>`).join('');
  const courses = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<li>${esc(t('c' + i))}</li>`).join('');
  const careers = [1, 2, 3, 4].map((i) => `<li>${esc(t('car' + i))}</li>`).join('');
  const est = p.credits * p.feePerCredit;
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section">
  <div class="wrap">
    ${head(ctx, t('factsKicker'), t('h1'))}
    <div class="facts">${facts}</div>
    <p class="finder-note rv">${esc(c('estimate'))}: <b>${est.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB')} JD</b> (${esc(c('estimateNote'))}). ${esc(c('verify'))}</p>
  </div>
</section>
<section class="section tint">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('coversKicker'))}</span><h2>${esc(t('coversTitle'))}</h2><div class="pills">${fields}</div></div>
    <div class="rv d1"><span class="kicker">${esc(t('coursesKicker'))}</span><p class="lead" style="font-size:1rem">${esc(t('coursesLead'))}</p><ul class="list">${courses}</ul></div>
  </div>
</section>
<section class="section">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('careersKicker'))}</span><h2>${esc(t('careersTitle'))}</h2><ul class="list">${careers}</ul></div>
    <div class="photo gold rv d1"><div class="tesserae" data-count="60"></div><p class="note">${esc(S.science.photoNote[lang])}</p></div>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    <div class="cta rv"><div><span class="kicker">${esc(t('applyKicker'))}</span><h2>${esc(t('applyTitle'))}</h2><p>${esc(t('applyLead'))}</p></div><div class="actions"><a class="btn btn-light" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))} <span class="arr">→</span></a><a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="${R + PAGES.science}">${esc(t('backToFaculty'))}</a></div></div>
  </div>
</section>`;
}

function admissions(ctx) {
  const { t, c, lang } = ctx;
  const steps = [1, 2, 3, 4].map((i) => `<div class="step rv d${i - 1}"><h3>${esc(t('s' + i + 'T'))}</h3><p>${esc(t('s' + i + 'D'))}</p></div>`).join('');
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section">
  <div class="wrap"><div class="steps">${steps}</div></div>
</section>
<section class="section tint" id="fees">
  <div class="wrap">
    ${head(ctx, t('feesKicker'), t('feesTitle'), t('feesLead'))}
    <div class="tablewrap rv"><table>
      <thead><tr><th>${esc(t('thProgramme'))}</th><th class="num">${esc(t('thCredits'))}</th><th class="num">${esc(t('thMin'))}</th><th class="num">${esc(t('thFee'))}</th><th class="num">${esc(t('thEstimate'))} (JD)</th></tr></thead>
      <tbody id="fee-rows"></tbody>
    </table></div>
    <p class="finder-note">${esc(c('estimate'))}: ${esc(c('estimateNote'))}. ${esc(c('verify'))}</p>
  </div>
</section>
<section class="section">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('scholKicker'))}</span><h2>${esc(t('scholTitle'))}</h2><p class="lead">${esc(t('scholLead'))}</p><p class="finder-note">${esc(t('scholNote'))}</p></div>
    <div class="tile rv d1">${icon('book')}<h3>${esc(t('gradKicker'))}</h3><p>${esc(t('gradLead'))}</p><p>${esc(S.academics.graduateLead[lang])}</p></div>
  </div>
</section>
${contactTiles(ctx, t('contactKicker'), t('contactTitle'), t('contactLead'))}
${applyCta(ctx)}`;
}

function life(ctx) {
  const { t, c, lang } = ctx;
  const rows = [['rAmman', 250], ['rFuhais', 250], ['rZarqa', 250], ['rKarak', 250], ['rMadaba', 160]]
    .map(([k, fee]) => `<tr><td><b>${esc(t(k))}</b></td><td class="num">${fee}</td></tr>`).join('');
  const clubs = [1, 2, 3, 4, 5, 6].map((i) => `<span class="pill">${esc(t('cl' + i))}</span>`).join('');
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section" id="bus">
  <div class="wrap two">
    <div>
      ${head(ctx, t('busKicker'), t('busTitle'), t('busLead'))}
      <p class="finder-note rv">${esc(t('busNote'))}</p>
      <p class="rv d1"><a class="btn" href="${LINKS.bus}" target="_blank" rel="noopener">${esc(t('busCta'))} <span class="arr">→</span></a></p>
    </div>
    <div class="tablewrap rv d1"><table><thead><tr><th>${esc(t('thRoute'))}</th><th class="num">${esc(t('thFallSpring'))}</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>
</section>
<section class="section tint" id="housing">
  <div class="wrap">
    ${head(ctx, t('housingKicker'), t('housingTitle'))}
    <div class="grid c2">
      <div class="tile rv">${icon('home')}<h3>${esc(lang === 'ar' ? 'للطالبات' : 'For women')}</h3><p>${esc(t('housingW'))}</p></div>
      <div class="tile rv d1">${icon('pin')}<h3>${esc(lang === 'ar' ? 'للطلاب والطلبة الدوليين' : 'For men and international students')}</h3><p>${esc(t('housingM'))}</p></div>
    </div>
  </div>
</section>
<section class="section" id="clubs">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('clubsKicker'))}</span><h2>${esc(t('clubsTitle'))}</h2><p class="lead">${esc(t('clubsLead'))}</p><div class="pills">${clubs}</div></div>
    <div class="photo olive rv d1"><div class="tesserae" data-count="60"></div><p class="note">${esc(S.science.photoNote[lang])}</p></div>
  </div>
</section>
<section class="section dark" id="intl">
  <div class="wrap two">
    <div>${head(ctx, t('intlKicker'), t('intlTitle'), t('intlLead'))}<p class="rv d1"><a class="btn btn-light" href="${LINKS.intl}" target="_blank" rel="noopener">${esc(t('intlCta'))} <span class="arr">→</span></a></p></div>
    <div class="labs rv d1"><div class="lab"><b>${esc(S.about.m1[lang])}</b></div><div class="lab"><b>${esc(S.about.m3[lang])}</b></div><div class="lab"><b>${esc(S.about.m2[lang])}</b></div><div class="lab"><b>${esc(S.about.m4[lang])}</b></div></div>
  </div>
</section>
${applyCta(ctx)}`;
}

function about(ctx) {
  const { R, t, c, lang } = ctx;
  const seal = R + 'assets/img/seal.png';
  const timeline = [1, 2, 3, 4, 5, 6].map((i) => `<li class="rv d${(i - 1) % 4}"><b>${esc(t('t' + i + 'Y'))}</b><p>${esc(t('t' + i))}</p></li>`).join('');
  const values = [1, 2, 3].map((i) => `<li>${esc(t('v' + i))}</li>`).join('');
  const acc = [1, 2, 3, 4].map((i) => `<li>${esc(t('acc' + i))}</li>`).join('');
  const mem = [1, 2, 3, 4].map((i) => `<span class="pill">${esc(t('m' + i))}</span>`).join('');
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section">
  <div class="wrap">
    ${head(ctx, t('kicker'), t('timelineKicker'))}
    <ol class="timeline">${timeline}</ol>
  </div>
</section>
<section class="section tint">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('missionKicker'))}</span><h2>${esc(t('missionTitle'))}</h2><p class="lead">${esc(t('missionLead'))}</p><ul class="list">${values}</ul></div>
    <div class="tile rv d1">${icon('user')}<span class="kicker">${esc(t('leadKicker'))}</span><h3>${esc(t('presName'))}</h3><p>${esc(t('presRole'))}</p></div>
  </div>
</section>
${mosaicRule()}
<section class="section dark">
  <div class="wrap">
    <div class="spot">
      <div class="photo rv" style="display:grid;place-items:center;background:radial-gradient(circle at 50% 45%, #5a0b11, #3a0608 70%)"><div class="tesserae" data-count="80"></div><img src="${seal}" width="239" height="239" alt="" style="width:56%;position:relative;z-index:1;filter:drop-shadow(0 20px 40px rgba(0,0,0,.4))"></div>
      <div>${head(ctx, t('sealKicker'), t('sealTitle'), t('sealLead'))}<p class="rv d1" style="color:#e4d6c4">${esc(c('motto'))} · ${esc(c('mottoMeaning'))}</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('kicker'))}</span><h2>${esc(t('accKicker'))}</h2><ul class="list">${acc}</ul></div>
    <div class="rv d1"><span class="kicker">${esc(t('kicker'))}</span><h2>${esc(t('memKicker'))}</h2><div class="pills">${mem}</div></div>
  </div>
</section>
${contactTiles(ctx, t('contactKicker'), t('contactTitle'), c('address'))}`;
}

function notfound(ctx) {
  const { R, t } = ctx;
  return `
${phero(ctx, '404', t('h1'), t('lead'))}
<section class="section"><div class="wrap"><p class="rv"><a class="btn" href="${R}index.html">${esc(t('home'))} <span class="arr">→</span></a></p></div></section>`;
}

const BUILDERS = { home, academics, science, biotech, admissions, life, about, notfound };

/* ---------- run ---------- */
let n = 0;
for (const lang of ['en', 'ar']) {
  const R = lang === 'ar' ? '../' : '';
  for (const page of Object.keys(PAGES)) {
    const sec = S[page] || {};
    const ctx = {
      lang, R,
      t: (k) => { const v = (sec[k] || S.common[k]); if (!v) throw new Error(`missing string ${page}.${k}`); return v[lang] || v.en; },
      c: (k) => { const v = S.common[k]; if (!v) throw new Error(`missing common string ${k}`); return v[lang] || v.en; },
      T: (s, k) => { const v = S[s] && S[s][k]; if (!v) throw new Error(`missing string ${s}.${k}`); return v[lang] || v.en; }
    };
    const html = shell(ctx, page, BUILDERS[page](ctx));
    const out = join(ROOT, lang === 'ar' ? 'ar' : '', PAGES[page]);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    n++;
  }
}
console.log(`built ${n} pages`);
