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
const M = JSON.parse(readFileSync(join(ROOT, 'data/media.json'), 'utf8'));
import { existsSync } from 'node:fs';
// Their photo if we have the file, otherwise a marked placeholder block.
function pic(R, file, cls, alt) {
  if (file && existsSync(join(ROOT, 'assets/img/aum', file))) return `<img class="${cls}" src="${R}assets/img/aum/${file}" alt="${esc(alt || '')}" loading="lazy">`;
  return `<div class="${cls} ph"><div class="tesserae" data-count="40"></div><span>${esc(PH)}</span></div>`;
}
let PH = '';
const has = (file) => !!file && existsSync(join(ROOT, 'assets/img/aum', file));
const mp = (R, file) => `${R}assets/img/aum/${file}`;
const SITE = 'https://labsuncut.github.io/site-aum-madaba/';

const LINKS = {
  apply: 'https://registration.aum.edu.jo/faces/ui/pages/guest/admissionOnline/index.xhtml',
  elearning: 'https://elearning.aum.edu.jo/',
  registration: 'https://reg.aum.edu.jo/',
  bus: 'https://aum.edu.jo/announcements/bus-schedule-second-semester-2025-2026',
  calendar: 'https://aum.edu.jo/admissions/academic-calendar/view',
  email: 'mailto:info@aum.edu.jo',
  tel: 'tel:+96253294444',
  maps: 'https://www.google.com/maps/search/?api=1&query=American+University+of+Madaba',
  intl: 'https://www.aum.edu.jo/life-at-aum/international-students-office',
  courseFinder: 'https://aum.edu.jo/course-finder',
  studyPlans: 'https://aum.edu.jo/academics/programs/program-type/undergraduates',
  grading: 'https://aum.edu.jo/admissions/grading-system',
  exams: 'https://aum.edu.jo/final-examinations-regulations',
  genEd: 'https://www.aum.edu.jo/academics/general-education-program',
  library: 'https://aum.edu.jo/library-services',
  health: 'https://www.aum.edu.jo/life-at-aum/health-and-wellbeing',
  housing: 'https://aum.edu.jo/apply-to-the-dorms-form',
  dorms: 'https://www.aum.edu.jo/life-at-aum/female-dorms',
  studentAffairs: 'https://aum.edu.jo/life-at-aum/deanship-of-student-affairs',
  studentEmail: 'https://mail.google.com/',
  fees: 'https://aum.edu.jo/admissions/tuition-fees/tuition-and-registration-fees-for-graduates-and-undergraduates-programs',
  scholarships: 'https://aum.edu.jo/admissions/tuition-fees/scholarships',
  qa: 'https://aum.edu.jo/admissions/qanda',
  bachelorRules: 'https://aum.edu.jo/awarding-the-bachelors-degree',
  masterRules: 'https://aum.edu.jo/awarding-the-masters-degree',
  discipline: 'https://aum.edu.jo/regulation-for-student-discipline',
  transferPolicy: 'https://aum.edu.jo/policy-for-student-admission-and-transfer',
  announcements: 'https://aum.edu.jo/announcements',
  news: 'https://aum.edu.jo/news',
  events: 'https://www.aum.edu.jo/events',
  alumni: 'https://aum.edu.jo/life-at-aum/alumni-and-career-development',
  contact: 'https://www.aum.edu.jo/about/overview/aum-contact',
  abroad: 'https://aum.edu.jo/life-at-aum/study-abroad-program',
  president: 'https://aum.edu.jo/about/overview/message-from-the-president',
  board: 'https://www.aum.edu.jo/about/board',
  council: 'https://www.aum.edu.jo/about/governance-and-policies/university-council',
  licensing: 'https://www.aum.edu.jo/about/licensing-and-accreditation',
  adminDepts: 'https://aum.edu.jo/about/administrative-departments',
  glance: 'https://aum.edu.jo/about/overview/aum-at-a-glance',
  nonDiscrimination: 'https://aum.edu.jo/',
  undergrad: 'https://aum.edu.jo/academics/programs/program-type/undergraduates',
  transport: 'https://www.aum.edu.jo/life-at-aum/transportation',
  aum: 'https://aum.edu.jo/'
};

const PAGES = {
  home: 'index.html', academics: 'academics.html', science: 'faculty-of-science.html',
  biotech: 'biology-and-biotechnology.html', admissions: 'admissions.html', life: 'life-at-aum.html',
  about: 'about.html', tools: 'student-tools.html', notfound: '404.html'
};

// Student tools: id, group, icon, url. Text lives in strings.json (tools.t_<id>, tools.d_<id>).
const TOOLS = [
  ['elearning', 'gStudy', 'laptop', LINKS.elearning], ['registration', 'gStudy', 'edit', LINKS.registration],
  ['courseFinder', 'gStudy', 'grid', LINKS.courseFinder], ['studyPlans', 'gStudy', 'list', LINKS.studyPlans],
  ['calendar', 'gStudy', 'calendar', LINKS.calendar], ['grading', 'gStudy', 'percent', LINKS.grading],
  ['exams', 'gStudy', 'file', LINKS.exams], ['genEd', 'gStudy', 'book', LINKS.genEd],
  ['bus', 'gCampus', 'bus', LINKS.bus], ['library', 'gCampus', 'library', LINKS.library],
  ['health', 'gCampus', 'health', LINKS.health], ['housing', 'gCampus', 'home', LINKS.housing],
  ['studentAffairs', 'gCampus', 'clubs', LINKS.studentAffairs], ['intl', 'gCampus', 'intl', LINKS.intl],
  ['email', 'gCampus', 'mail', LINKS.studentEmail],
  ['fees', 'gMoney', 'coins', LINKS.fees], ['scholarships', 'gMoney', 'award', LINKS.scholarships],
  ['apply', 'gMoney', 'send', LINKS.apply], ['qa', 'gMoney', 'help', LINKS.qa],
  ['bachelorRules', 'gRules', 'file', LINKS.bachelorRules], ['masterRules', 'gRules', 'file', LINKS.masterRules],
  ['discipline', 'gRules', 'shield', LINKS.discipline], ['transfer', 'gRules', 'swap', LINKS.transferPolicy],
  ['announcements', 'gContact', 'megaphone', LINKS.announcements], ['news', 'gContact', 'flag', LINKS.news],
  ['events', 'gContact', 'star', LINKS.events], ['alumni', 'gContact', 'user', LINKS.alumni],
  ['contact', 'gContact', 'phone', LINKS.contact]
];
const HOME_TOOLS = ['elearning', 'registration', 'courseFinder', 'calendar', 'bus', 'library'];

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
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  laptop: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6"/>',
  library: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M9 7h7"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 8.5a6 6 0 1 1-7 7"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  swap: '<path d="M7 7h13l-3-3"/><path d="M17 17H4l3 3"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>'
};
const icon = (k) => `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg></span>`;

/* ---------- page shell ---------- */
function shell(ctx, page, body) {
  const { lang, R, t, c } = ctx; const sec = S[page] || {};
  PH = c('photoSlot');
  const social = Object.entries(M.social || {}).filter(([, u]) => u);
  const SOC = { facebook: 'M14 8h2.5V4.5H14c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.8c0-.5.3-.8.5-.8Z', x: 'M4 4l16 16M20 4 4 20', youtube: 'M3 8.5c0-1.4 1.1-2.5 2.5-2.5h13C19.9 6 21 7.1 21 8.5v7c0 1.4-1.1 2.5-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5v-7Zm7 1.5v4l4-2-4-2Z', instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.5 6.5h.01', linkedin: 'M6 9v12M6 5v.01M11 21v-7a3 3 0 0 1 6 0v7M11 9v12', whatsapp: 'M4 20l1.3-3.8A8 8 0 1 1 8.3 19L4 20Zm5-9c.5 2 2 3.5 4 4l1-1 2 1c0 1-1 1.5-2 1.5-3 0-6.5-3.5-6.5-6.5 0-1 .5-2 1.5-2l1 2-1 1Z' };
  const socialHtml = social.length ? `<div class="social" aria-label="${esc(c('followUs'))}">${social.map(([k, u]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${SOC[k]}"/></svg></a>`).join('')}</div>` : '';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const file = PAGES[page];
  const other = lang === 'ar' ? R + file : R + 'ar/' + file;
  const seal = R + 'assets/img/seal.png';
  const strings = {};
  for (const k of Object.keys(S.common)) strings[k] = S.common[k];
  for (const k of Object.keys(S[page] || {})) strings[k] = S[page][k];
  const navItems = [
    ['academics', c('navAcademics')], ['admissions', c('navAdmissions')], ['tools', c('navTools')],
    ['life', c('navLife')], ['about', c('navAbout')]
  ];
  const nav = navItems.map(([p, label]) => `<a href="${R + PAGES[p]}"${p === page ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  const tools = [
    [LINKS.elearning, c('toolElearning')], [LINKS.registration, c('toolRegistration')], [LINKS.courseFinder, c('toolCourseFinder')],
    [LINKS.calendar, c('toolCalendar')], [LINKS.bus, c('toolBus')], [LINKS.library, c('toolLibrary')]
  ];
  const uni = [
    [LINKS.news, c('linkNews')], [LINKS.events, c('linkEvents')], [LINKS.announcements, c('linkAnnouncements')],
    [LINKS.president, c('linkResearch')], [LINKS.alumni, c('linkAlumni')], [LINKS.contact, c('linkContact')]
  ];
  const toolLinks = (cls) => tools.map(([h, l]) => `<a href="${h}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}${cls ? ` class="${cls}"` : ''}>${esc(l)}</a>`).join('');
  const brand = (extra = '') => `<a class="brand${extra}" href="${R}index.html"><img src="${seal}" width="60" height="60" alt=""><span class="brand-text"><span class="brand-name">${esc(c('siteName'))}</span><span class="brand-sub">${esc(c('brandSub'))}</span></span></a>`;

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
  <img class="intro-seal" id="intro-seal" src="${seal}" width="239" height="239" alt="">
  <p class="intro-name"><small>${esc(lang === 'ar' ? 'مادبا · الأردن' : 'Madaba · Jordan')}</small>${esc(c('siteName'))}</p>
  <button class="intro-skip" type="button">${esc(c('skip'))}</button>
</div>
<script src="${R}assets/js/intro.js"></script>
<div class="tools">
  <div class="wrap">
    <span class="tools-label">${esc(c('tools'))}</span>
    <nav class="tools-links" aria-label="${esc(c('tools'))}">${toolLinks()}<a href="${LINKS.announcements}" target="_blank" rel="noopener">${esc(c('linkVacancies'))}</a><a href="${R + PAGES.tools}" class="tools-all">${esc(c('allTools'))}</a></nav>
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
    <div class="cstrip">
      <a href="${LINKS.tel}">${icon('phone')}<span><b>${esc(c('phone'))}</b>${esc(c('phoneAdmissions'))}</span></a>
      <div>${icon('file')}<span><b>${esc(c('faxN'))}</b>${esc(c('fax'))}</span></div>
      <a href="${LINKS.email}">${icon('mail')}<span><b>info@aum.edu.jo</b>${esc(c('mail'))}</span></a>
      <div>${icon('calendar')}<span><b>${esc(c('hours'))}</b>${esc(c('hoursV'))}</span></div>
    </div>
    <div class="foot">
      <div>
        ${brand()}
        <p>${esc(c('address'))}</p>
        ${socialHtml}
      </div>
      <div><h4>${esc(c('footerFaculties'))}</h4><ul>${D.faculties.map((f) => `<li><a href="${f.id === 'science' ? R + PAGES.science : R + PAGES.academics + '#' + f.id}">${esc(f[lang])}</a></li>`).join('')}<li><a href="${R}index.html#finder">${esc(c('findProgramme'))}</a></li></ul></div>
      <div><h4>${esc(c('footerAbout'))}</h4><ul>${[[R + PAGES.about, c('navAbout')], [LINKS.president, S.about.l1[lang]], [LINKS.glance, S.about.l6[lang]], [LINKS.contact, c('linkContact')], [LINKS.board, S.about.l2[lang]], [LINKS.council, S.about.l3[lang]], [LINKS.licensing, S.about.l4[lang]], [LINKS.adminDepts, S.about.l5[lang]]].map(([h, l]) => `<li><a href="${h}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(l)}</a></li>`).join('')}</ul></div>
      <div><h4>${esc(c('footerStudents'))}</h4><ul>${tools.map(([h, l]) => `<li><a href="${h}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}<li><a href="${R + PAGES.tools}">${esc(c('allTools'))}</a></li></ul>
        <h4 style="margin-top:22px">${esc(c('footerAdmission'))}</h4><ul><li><a href="${R + PAGES.admissions}">${esc(c('undergraduate'))}</a></li><li><a href="${R + PAGES.academics}#graduate">${esc(c('graduate'))}</a></li><li><a href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))}</a></li></ul></div>
      <div><h4>${esc(c('footerUniversity'))}</h4><ul>${uni.map(([h, l]) => `<li><a href="${h}" target="_blank" rel="noopener">${esc(l)}</a></li>`).join('')}<li><a href="${R + PAGES.life}">${esc(c('navLife'))}</a></li><li><a href="${other}" lang="${lang === 'ar' ? 'en' : 'ar'}">${esc(c('langSwitch'))}</a></li></ul></div>
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
function toolCard(ctx, id, group, ic, url, i) {
  const { T, c } = ctx;
  return `<a class="tool rv d${i % 4}" href="${url}" target="_blank" rel="noopener" data-group="${group}" data-text="${esc((T('tools', 't_' + id) + ' ' + T('tools', 'd_' + id)).toLowerCase())}">${icon(ic)}<span class="tool-body"><b>${esc(T('tools', 't_' + id))}</b><span>${esc(T('tools', 'd_' + id))}</span></span><span class="tool-go" aria-hidden="true">↗</span></a>`;
}

function home(ctx) {
  const { R, t, c, lang, T } = ctx;
  const seal = R + 'assets/img/seal.png';
  const stats = [['statFacultiesN', 'statFaculties'], ['statMajorsN', 'statMajors'], ['statNatN', 'statNat'], ['statGradN', 'statGrad'], ['statWeekN', 'statWeek']]
    .map(([n, l]) => `<div class="stat"><b>${esc(t(n))}</b><span>${esc(t(l))}</span></div>`).join('');
  const quick = HOME_TOOLS.map((id, i) => { const tl = TOOLS.find((x) => x[0] === id); return `<a class="quick rv d${i % 4}" href="${tl[3]}" target="_blank" rel="noopener">${icon(tl[2])}<b>${esc(T('tools', 't_' + id))}</b></a>`; }).join('');
  const chips = D.faculties.map((f) => `<button type="button" class="fchip" data-fac="${f.id}">${esc(f[lang])}</button>`).join('');
  const why = [['laptop', 'why1', LINKS.elearning], ['award', 'why2', LINKS.scholarships], ['home', 'why3', LINKS.dorms], ['intl', 'why4', LINKS.abroad], ['bus', 'why5', LINKS.transport], ['calendar', 'why6', LINKS.calendar], ['shield', 'why7', LINKS.licensing]]
    .map(([ic, k, h], i) => `<a class="hex rv d${i % 4}" href="${h}" target="_blank" rel="noopener"><span class="hex-in">${icon(ic)}<b>${esc(t(k))}</b></span></a>`).join('');
  const ann = [1, 2, 3].map((i) => `<a class="card ann rv d${i - 1}" href="${M.announcements[i - 1].url}" target="_blank" rel="noopener"><span class="card-top"><img src="${R}assets/img/seal.png" width="56" height="56" alt=""><span>${esc(c('siteName'))}</span></span><h3>${esc(t('ann' + i + 'T'))}</h3><span class="date">${esc(t('ann' + i + 'D'))}</span></a>`).join('');
  const news = [1, 2, 3].map((i) => { const n = M.news[i - 1]; return `<a class="card rv d${i - 1}" href="${n.url}" target="_blank" rel="noopener">${pic(R, n.file, 'card-img', t('news' + i + 'T'))}<h3>${esc(t('news' + i + 'T'))}</h3><span class="date">${esc(t('news' + i + 'D'))}</span></a>`; }).join('');
  const events = [1, 2, 3, 4].map((i) => { const e = M.events[i - 1]; return `<a class="event rv d${(i - 1) % 4}" href="${e.url}" target="_blank" rel="noopener">${pic(R, e.file, 'event-img', t('ev' + i + 'T'))}<span class="event-date"><b>${esc(t('ev' + i + 'D'))}</b><small>${esc(t('ev' + i + 'M'))}</small></span><span class="event-body"><h3>${esc(t('ev' + i + 'T'))}</h3><span class="time">${esc(t('ev' + i + 'H'))}</span></span></a>`; }).join('');
  const alumniN = Math.min((M.alumni || []).length, 4);
  const alumni = Array.from({ length: alumniN }, (_, i) => {
    const n = i + 1;
    return `<div class="alum alum-slide${i ? '' : ' on'}"><div class="rv"><span class="kicker">${esc(t('alumniKicker'))}</span><h2>${esc(t('alumniTitle'))}</h2><blockquote>“${esc(t('al' + n + 'Q'))}”</blockquote><p class="who"><b>${esc(t('al' + n + 'N'))}</b><span>${esc(t('al' + n + 'R'))}</span></p><a class="btn btn-light" href="${LINKS.alumni}" target="_blank" rel="noopener">${esc(t('alumniMore'))} <span class="arr">→</span></a></div><div class="rv d1">${pic(R, M.alumni[i].file, 'alum-img', t('al' + n + 'N'))}</div></div>`;
  }).join('');
  const life = [['bus', 'Bus'], ['home', 'Housing'], ['clubs', 'Clubs'], ['intl', 'Intl']].map(([ic, k], i) =>
    `<a class="tile rv d${i}" href="${R + PAGES.life}#${k.toLowerCase()}">${icon(ic)}<h3>${esc(t('life' + k + 'T'))}</h3><p>${esc(t('life' + k + 'D'))}</p><span class="link">${esc(c('learnMore'))}</span></a>`).join('');
  const reelList = (M.reels || []).filter((r) => has(r.src));
  const reels = reelList.map((r, i) => `<video class="reel rv d${i % 4}" src="${mp(R, r.src)}"${has(r.poster) ? ` poster="${mp(R, r.poster)}"` : ''} controls muted playsinline preload="none"></video>`).join('')
    + (reelList.length && M.stories ? `<a class="reel reel-more rv d${reelList.length % 4}" href="${M.stories}" target="_blank" rel="noopener"><span class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><b>${esc(t('storiesT'))}</b><span>${esc(t('storiesD'))}</span></a>` : '');
  const bannerBg = (o) => (o && has(o.file) ? ` style="background-image:url(${mp(R, o.file)})"` : '');
  const banners = `${M.tour ? `<a class="banner rv" href="${M.tour}" target="_blank" rel="noopener"><span><b>${esc(t('tourT'))}</b>${esc(t('tourD'))}</span><span class="btn btn-light">${esc(t('tourCta'))} <span class="arr">→</span></span></a>` : ''}${M.campusMap && M.campusMap.url ? `<a class="banner rv${has(M.campusMap.file) ? ' img' : ''}" href="${M.campusMap.url}" target="_blank" rel="noopener"${bannerBg(M.campusMap)}><span><b>${esc(t('campusT'))}</b>${esc(t('campusD'))}</span><span class="btn btn-light">${esc(t('campusCta'))} <span class="arr">→</span></span></a>` : ''}${M.madaba && M.madaba.url ? `<a class="banner alt rv d1${has(M.madaba.file) ? ' img' : ''}" href="${M.madaba.url}" target="_blank" rel="noopener"${bannerBg(M.madaba)}><span><b>${esc(t('madabaT'))}</b>${esc(t('madabaD'))}</span><span class="btn btn-light">${esc(t('madabaCta'))} <span class="arr">→</span></span></a>` : ''}`;

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
        <a class="btn btn-ghost" href="${LINKS.maps}" target="_blank" rel="noopener">${esc(c('visit'))}</a>
      </div>
    </div>
    <div class="hero-seal rv d2">${ring('hero-ring')}<img src="${seal}" width="239" height="239" alt="${esc(c('siteName'))}"></div>
  </div>
</section>
${mosaicRule()}
<section class="quickbar" aria-label="${esc(t('toolsKicker'))}">
  <div class="wrap">
    <div class="quick-head"><span class="kicker">${esc(t('toolsKicker'))}</span><a class="link" href="${R + PAGES.tools}">${esc(c('allTools'))}</a></div>
    <div class="quick-grid">${quick}</div>
  </div>
</section>
<section class="section featured">
  <div class="wrap">
    ${M.heroVideo && has(M.heroVideo.src) ? `<a class="feat vid rv" href="${LINKS.apply}" target="_blank" rel="noopener">
      <video class="feat-img" src="${mp(R, M.heroVideo.src)}"${has(M.heroVideo.poster) ? ` poster="${mp(R, M.heroVideo.poster)}"` : ''} autoplay muted loop playsinline preload="metadata" aria-label="${esc(t('heroVidT'))}"></video>
      <span class="feat-body"><span class="kicker">${esc(t('heroVidKicker'))}</span><h2>${esc(t('heroVidT'))}</h2><p>${esc(t('heroVidD'))}</p><span class="link">${esc(c('apply'))}</span></span>
    </a>` : ''}
    <a class="feat rev rv d1" href="${LINKS.news}" target="_blank" rel="noopener">
      ${pic(R, M.hero.file, 'feat-img', t('feat1T'))}
      <span class="feat-body"><span class="kicker">${esc(t('featuredKicker'))}</span><h2>${esc(t('feat1T'))}</h2><p>${esc(t('feat1D'))}</p><span class="link">${esc(c('learnMore'))}</span></span>
    </a>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('whyKicker'), t('whyTitle'), '', true)}
    <div class="hexes">${why}</div>
  </div>
</section>
<section class="stats"><div class="wrap five">${stats}</div></section>

<section class="section" id="finder">
  <div class="wrap">
    ${head(ctx, t('finderKicker'), t('finderTitle'), t('finderLead'))}
    <div class="finder rv">
      <div class="fchips"><button type="button" class="fchip on" data-fac="">${esc(t('finderAll'))}</button>${chips}</div>
      <div class="finder-controls">
        <label class="field">${esc(t('finderSearch'))}<input id="f-q" type="search" placeholder="${esc(t('finderPlaceholder'))}" autocomplete="off"></label>
        <label class="field">${esc(t('finderFaculty'))}<select id="f-fac"><option value="">${esc(t('finderAll'))}</option></select></label>
        <label class="field">${esc(t('finderLevel'))}<select id="f-level"><option value="">${esc(t('finderAllLevels'))}</option><option value="bachelor">${esc(c('bachelor'))}</option><option value="master">${esc(c('master'))}</option></select></label>
      </div>
      <div class="finder-meta"><span id="f-count"></span><a class="link" href="${R + PAGES.academics}">${esc(t('finderAllFaculties'))}</a></div>
      <div class="plist compact" id="f-list"></div>
      <p class="finder-note">${esc(t('finderNote'))}</p>
    </div>
  </div>
</section>
${mosaicRule()}
<section class="section tint" id="announcements">
  <div class="wrap">
    <div class="row-head rv"><div><span class="kicker">${esc(t('annKicker'))}</span><h2>${esc(t('annTitle'))}</h2></div><a class="btn btn-ghost" href="${LINKS.announcements}" target="_blank" rel="noopener">${esc(c('viewAll'))} <span class="arr">→</span></a></div>
    <div class="cards">${ann}</div>
  </div>
</section>
<section class="section" id="news">
  <div class="wrap">
    <div class="row-head rv"><div><span class="kicker">${esc(t('newsKicker'))}</span><h2>${esc(t('newsTitle'))}</h2></div><a class="btn btn-ghost" href="${LINKS.news}" target="_blank" rel="noopener">${esc(c('viewAll'))} <span class="arr">→</span></a></div>
    <div class="cards">${news}</div>
  </div>
</section>
<section class="section dark" id="alumni">
  <div class="wrap">
    <div data-slides>${alumni}</div>
    ${alumniN > 1 ? `<div class="alum-dots" role="tablist">${Array.from({ length: alumniN }, (_, i) => `<button type="button" role="tab" class="${i ? '' : 'on'}" aria-selected="${i ? 'false' : 'true'}" aria-label="${esc(t('alumniDot'))} ${i + 1}"></button>`).join('')}</div>` : ''}
  </div>
</section>
<section class="section" id="events">
  <div class="wrap">
    <div class="row-head rv"><div><span class="kicker">${esc(t('eventsKicker'))}</span><h2>${esc(t('eventsTitle'))}</h2></div><a class="btn btn-ghost" href="${LINKS.events}" target="_blank" rel="noopener">${esc(c('viewAll'))} <span class="arr">→</span></a></div>
    <div class="events">${events}</div>
  </div>
</section>
${reels ? `<section class="section tint" id="reels"><div class="wrap reels-wrap"><div class="rv"><span class="kicker">${esc(t('reelsKicker'))}</span><h2>${esc(t('reelsTitle'))}</h2><p class="lead">${esc(t('reelsLead'))}</p>${M.social.instagram ? `<a class="btn" href="${M.social.instagram}" target="_blank" rel="noopener">${esc(c('followUs'))}</a>` : ''}</div><div class="reels">${reels}</div></div></section>` : ''}
${banners ? `<section class="section banners"><div class="wrap">${banners}</div></section>` : ''}
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('lifeKicker'), t('lifeTitle'))}
    <div class="grid c4">${life}</div>
  </div>
</section>
${mosaicRule()}
<section class="section dark">
  <div class="wrap two">
    <div>${head(ctx, t('researchKicker'), t('researchTitle'), t('researchLead'))}<p class="rv d1"><a class="btn btn-light" href="${R + PAGES.academics}#graduate">${esc(S.academics.graduate[lang])} <span class="arr">→</span></a></p></div>
    <div class="labs rv d1"><a class="lab" href="${LINKS.alumni}" target="_blank" rel="noopener"><b>${esc(t('alumniT'))}</b><span>${esc(t('alumniD'))}</span></a><a class="lab" href="${LINKS.events}" target="_blank" rel="noopener"><b>${esc(t('eventsT'))}</b><span>${esc(t('eventsD'))}</span></a><a class="lab" href="${LINKS.announcements}" target="_blank" rel="noopener"><b>${esc(t('annT'))}</b><span>${esc(t('annD'))}</span></a><a class="lab" href="${LINKS.library}" target="_blank" rel="noopener"><b>${esc(c('linkLibrary'))}</b><span>${esc(T('tools', 'd_library'))}</span></a></div>
  </div>
</section>
${contactTiles(ctx, t('visitKicker'), t('visitTitle'), t('visitLead'))}
${applyCta(ctx)}`;
}

function tools(ctx) {
  const { t, T, c } = ctx;
  const groups = ['gStudy', 'gCampus', 'gMoney', 'gRules', 'gContact'];
  const blocks = groups.map((g) => `<div class="tgroup" data-group="${g}"><h2 class="rv">${esc(t(g))}</h2><div class="tgrid">${TOOLS.filter((x) => x[1] === g).map((x, i) => toolCard(ctx, x[0], x[1], x[2], x[3], i)).join('')}</div></div>`).join('');
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section" id="tools">
  <div class="wrap">
    <div class="finder rv tool-search"><label class="field">${esc(t('search'))}<input id="t-q" type="search" placeholder="${esc(t('placeholder'))}" autocomplete="off"></label><p class="finder-note" style="margin:10px 0 0">${esc(c('opensAum'))}</p></div>
    ${blocks}
    <p class="empty" id="t-empty" hidden>${esc(t('empty'))}</p>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('extKicker'), t('extTitle'))}
    <div class="facts">
      <div class="fact rv"><b>1900 · 1901</b><span>${esc(t('extAdm'))}</span></div>
      <div class="fact rv d1"><b>1700 – 1702</b><span>${esc(t('extSA'))}</span></div>
      <div class="fact rv d2"><b>1200 · 1201</b><span>${esc(t('extLib'))}</span></div>
      <a class="fact rv d3" href="${LINKS.tel}"><b>${esc(c('phone'))}</b><span>${esc(c('siteName'))}</span></a>
    </div>
    <p class="finder-note">${esc(t('extNote'))}</p>
  </div>
</section>
${applyCta(ctx)}`;
}

function academics(ctx) {
  const { R, t, c, lang } = ctx;
  const blocks = D.faculties.map((f) => {
    const n = count(f.id, 'bachelor');
    const list = n ? `<div class="plist" data-programmes="${f.id}" data-level="bachelor"></div>`
      : `<p class="empty" style="text-align:start;padding:18px 0">${esc(lang === 'ar' ? 'لم تُنشر تفاصيل البرامج بعد في هذه المعاينة؛ تُضاف من الكلية.' : 'Programme details are not yet in this preview; they will be added from the faculty.')}</p>`;
    const extra = f.id === 'science' ? ` <a class="link" href="${R + PAGES.science}">${esc(c('facultyPage'))}</a>` : '';
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
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('linksKicker'), t('linksTitle'))}
    <div class="grid c3">
      <a class="tile rv" href="${LINKS.fees}" target="_blank" rel="noopener">${icon('coins')}<h3>${esc(S.tools.t_fees[lang])}</h3><p>${esc(S.tools.d_fees[lang])}</p><span class="link">${esc(c('opensAum'))}</span></a>
      <a class="tile rv d1" href="${LINKS.scholarships}" target="_blank" rel="noopener">${icon('award')}<h3>${esc(S.tools.t_scholarships[lang])}</h3><p>${esc(S.tools.d_scholarships[lang])}</p><span class="link">${esc(c('opensAum'))}</span></a>
      <a class="tile rv d2" href="${LINKS.qa}" target="_blank" rel="noopener">${icon('help')}<h3>${esc(S.tools.t_qa[lang])}</h3><p>${esc(S.tools.d_qa[lang])}</p><span class="link">${esc(c('opensAum'))}</span></a>
      <a class="tile rv" href="${LINKS.grading}" target="_blank" rel="noopener">${icon('percent')}<h3>${esc(t('gradeT'))}</h3><p>${esc(t('gradeD'))}</p><span class="link">${esc(c('opensAum'))}</span></a>
      <a class="tile rv d1" href="${LINKS.intl}" target="_blank" rel="noopener">${icon('intl')}<h3>${esc(t('intlT'))}</h3><p>${esc(t('intlD'))}</p><span class="link">${esc(c('opensAum'))}</span></a>
      <a class="tile rv d2" href="${LINKS.transferPolicy}" target="_blank" rel="noopener">${icon('swap')}<h3>${esc(S.tools.t_transfer[lang])}</h3><p>${esc(S.tools.d_transfer[lang])}</p><span class="link">${esc(c('opensAum'))}</span></a>
    </div>
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
      <div class="tile rv">${icon('home')}<h3>${esc(lang === 'ar' ? 'للطالبات' : 'For women')}</h3><p>${esc(t('housingW'))}</p><a class="link" href="${LINKS.housing}" target="_blank" rel="noopener">${esc(t('housingApply'))}</a></div>
      <div class="tile rv d1">${icon('pin')}<h3>${esc(lang === 'ar' ? 'للطلاب والطلبة الدوليين' : 'For men and international students')}</h3><p>${esc(t('housingM'))}</p></div>
    </div>
  </div>
</section>
<section class="section" id="health">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('healthKicker'))}</span><h2>${esc(t('healthTitle'))}</h2><p class="lead">${esc(t('healthLead'))}</p><p class="finder-note">${esc(t('healthHours'))}</p><a class="link" href="${LINKS.health}" target="_blank" rel="noopener">${esc(c('opensAum'))}</a></div>
    <div class="grid c2 rv d1">
      <a class="tile" href="${LINKS.studentAffairs}" target="_blank" rel="noopener">${icon('languages')}<h3>${esc(t('langT'))}</h3><p>${esc(t('langD'))}</p></a>
      <a class="tile" href="${LINKS.alumni}" target="_blank" rel="noopener">${icon('user')}<h3>${esc(t('careerT'))}</h3><p>${esc(t('careerD'))}</p></a>
      <a class="tile" href="${LINKS.abroad}" target="_blank" rel="noopener">${icon('intl')}<h3>${esc(t('abroadT'))}</h3><p>${esc(t('abroadD'))}</p></a>
      <a class="tile" href="${LINKS.studentAffairs}" target="_blank" rel="noopener">${icon('clubs')}<h3>${esc(S.tools.t_studentAffairs[lang])}</h3><p>${esc(S.tools.d_studentAffairs[lang])}</p></a>
    </div>
  </div>
</section>
<section class="section tint" id="clubs">
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
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('linksKicker'), t('linksTitle'))}
    <div class="pills rv">${[['l1', LINKS.president], ['l2', LINKS.board], ['l3', LINKS.council], ['l4', LINKS.licensing], ['l5', LINKS.adminDepts], ['l6', LINKS.glance]].map(([k, h]) => `<a class="pill" href="${h}" target="_blank" rel="noopener">${esc(t(k))} ↗</a>`).join('')}</div>
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

const BUILDERS = { home, academics, science, biotech, admissions, life, about, tools, notfound };

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
    PH = ctx.c('photoSlot');
    const html = shell(ctx, page, BUILDERS[page](ctx));
    const out = join(ROOT, lang === 'ar' ? 'ar' : '', PAGES[page]);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    n++;
  }
}
console.log(`built ${n} pages`);
