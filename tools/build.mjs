// Generates the static pages of the AUM concept site.
//   node tools/build.mjs
// English pages land at the repo root, Arabic pages under ar/. Text comes from data/strings.json,
// programme figures from data/programmes.json. GitHub Pages serves the output as-is; nothing runs there.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = JSON.parse(readFileSync(join(ROOT, 'data/strings.json'), 'utf8'));
const D = JSON.parse(readFileSync(join(ROOT, 'data/programmes.json'), 'utf8'));
const M = JSON.parse(readFileSync(join(ROOT, 'data/media.json'), 'utf8'));
const AL = JSON.parse(readFileSync(join(ROOT, 'data/alerts.json'), 'utf8'));
// Study plans copied from AUM's department pages (data/plans/<slug>.json, see /mnt/project-files/aum/study-plans/README.md)
// Short content hash per asset, so browsers fetch new CSS/JS on the first load after a push
const VER = (p) => createHash('sha1').update(readFileSync(join(ROOT, p))).digest('hex').slice(0, 8);
const V = { css: VER('assets/css/site.css'), js: VER('assets/js/site.js'), intro: VER('assets/js/intro.js') };
const PLANS = {};
for (const f of readdirSync(join(ROOT, 'data/plans')).filter((x) => x.endsWith('.json')).sort()) PLANS[f.slice(0, -5)] = JSON.parse(readFileSync(join(ROOT, 'data/plans', f), 'utf8'));
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
  registration: 'https://registration.aum.edu.jo/',
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
  about: 'about.html', tools: 'student-tools.html', plans: 'study-plans.html', notfound: '404.html'
};

// Student tools: id, group, icon, url. Text lives in strings.json (tools.t_<id>, tools.d_<id>).
const TOOLS = [
  ['elearning', 'gStudy', 'laptop', LINKS.elearning], ['registration', 'gStudy', 'edit', LINKS.registration],
  ['courseFinder', 'gStudy', 'grid', LINKS.courseFinder], ['studyPlans', 'gStudy', 'list', '@plans'],
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
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 13h20"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
  trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4a1 1 0 0 0-1 1 4 4 0 0 0 4 4M17 6h3a1 1 0 0 1 1 1 4 4 0 0 1-4 4"/>',
  waves: '<path d="M2 8c2 0 2-1.5 4-1.5S8 8 10 8s2-1.5 4-1.5S16 8 18 8s2-1.5 4-1.5"/><path d="M2 13c2 0 2-1.5 4-1.5S8 13 10 13s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const icon = (k) => `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg></span>`;

/* ---------- page shell ---------- */
function guideHtml(ctx) {
  const { lang, R, c } = ctx; const G = S.guide; const g = (k) => G[k][lang];
  const tl = (id) => (S.tools['t_' + id] ? S.tools['t_' + id][lang] : id);
  const T2 = (sec, k) => (S[sec] && S[sec][k] ? S[sec][k][lang] : '');
  const H = S.home, L = S.life, A = S.admissions, AB = S.about, SC = S.science, TL = S.tools;
  const bach = D.programmes.filter((p) => p.level === 'bachelor').length, mast = D.programmes.length - bach;
  const facNames = D.faculties.map((f) => f[lang] || f.en).join(lang === 'ar' ? '، ' : ', ');
  const feeRows = D.programmes.filter((p) => p.feePerCredit).map((p) => `${p[lang] || p.en}: ${p.feePerCredit}`).join(lang === 'ar' ? '، ' : ', ');
  // Knowledge base: every entry is built from strings already on the site, so Arabic and English stay in step and nothing is invented.
  const E = (id, k, a, l, tags) => ({ id, t: g('kb_' + id), k, a, l, tags: tags || [] });
  const entries = [
    E('apply', 'apply admission admissions register enrol enroll enrolment tawjihi requirements requirement join start studying provisional قدم قدّم تقديم أقدم اقدم قبول تسجيل توجيهي شروط التحق التحاق انتساب', g('a_apply'), [[c('apply'), LINKS.apply, 1], [c('howToApply'), R + PAGES.admissions]], ['apply']),
    E('steps', 'steps step process placement test tests english arabic computer interview entrance exam adviser خطوات خطوة امتحان تحديد مستوى مقابلة قبول مرشد', `${T2('admissions', 'lead')} 1) ${T2('admissions', 's1T')}. 2) ${T2('admissions', 's2T')}. 3) ${T2('admissions', 's3T')}: ${T2('admissions', 's3D')} 4) ${T2('admissions', 's4T')}.`, [[c('howToApply'), R + PAGES.admissions], [c('apply'), LINKS.apply, 1]], ['apply']),
    E('average', 'average minimum tawjihi score percent percentage accept accepted stream scientific literary معدل معدلي الحد الأدنى توجيهي نسبة مقبول قبول فرع علمي أدبي', `${T2('admissions', 's1D')} ${T2('admissions', 'gradeD')}`, [[c('findProgramme'), R + 'index.html#finder'], [TL.t_qa[lang], LINKS.qa, 1]], ['average']),
    E('plan', 'study plan plans courses course semester prerequisite prerequisites guidance خطة خطتي دراسية الخطة مساقات مساق فصل متطلب متطلبات', g('a_plan'), [[c('allPlans'), R + PAGES.plans], [c('findProgramme'), R + 'index.html#finder']], ['plan']),
    E('programmes', 'programme programmes program programs major majors specialisation specialization degree degrees study offer offered available list تخصص تخصصات برنامج برامج درجة ادرس أدرس متوفر متاح قائمة', `${g('countLine').replace('{b}', bach).replace('{m}', mast)} ${g('a_programmes')}`, [[c('findProgramme'), R + 'index.html#finder'], [c('navAcademics'), R + PAGES.academics]], ['programmes', 'numbers']),
    E('faculties', 'faculty faculties college colleges school schools seven which كلية كليات سبع الكليات', `${facNames}.`, [[c('navAcademics'), R + PAGES.academics]], ['programmes', 'numbers']),
    E('master', 'master masters msc mba graduate postgraduate graduates thesis comprehensive ماجستير ماستر دراسات عليا رسالة شامل', `${T2('academics', 'graduateLead')} ${T2('admissions', 'gradLead')}`, [[S.academics.graduate[lang], R + PAGES.academics + '#graduate'], [TL.t_masterRules[lang], LINKS.masterRules, 1]], ['programmes', 'fees']),
    E('fees', 'fee fees tuition cost costs price prices pay payment expensive how much per credit hour jd dinar رسوم رسم تكلفة سعر أسعار دفع بكم كم غالي دينار الساعة', `${g('a_fees')} ${g('feesKnown')} ${feeRows} (${c('perCredit')}). ${T2('academics', 'graduateLead')}`, [[tl('fees'), LINKS.fees, 1], [c('navAdmissions'), R + PAGES.admissions + '#fees'], [tl('scholarships'), LINKS.scholarships, 1]], ['fees']),
    E('schol', 'scholarship scholarships discount discounts sibling siblings sponsored sponsorship merit financial aid free منحة منح خصم خصومات أخوة إخوة مكفول كفالة دعم مجاني', `${T2('admissions', 'scholLead')} ${T2('admissions', 'scholNote')} ${T2('admissions', 'gradLead')}`, [[tl('scholarships'), LINKS.scholarships, 1], [c('navAdmissions'), R + PAGES.admissions + '#scholarships']], ['fees']),
    E('bus', 'bus buses transport transportation commute commuting schedule timetable route routes amman zarqa karak fuhais madaba ride باص باصات حافلة مواصلات نقل جدول خط خطوط عمان الزرقاء الكرك الفحيص مادبا', `${L.busTitle[lang]} ${L.busLead[lang]} ${g('busFees')}`, [[tl('bus'), LINKS.bus, 1], [L.busTitle[lang], R + PAGES.life + '#bus']], ['fees', 'hours']),
    E('calendar', 'calendar dates date semester start starts begin begins end exam exams midterm final holiday holidays vacation registration window when تقويم مواعيد موعد بداية نهاية امتحان امتحانات نصفي نهائي عطلة عطل إجازة متى يبدأ', g('a_calendar'), [[c('toolCalendar'), LINKS.calendar, 1]], ['dates']),
    E('contact', 'contact phone call telephone email mail number talk someone office extension fax whatsapp تواصل اتصال اتصل هاتف تلفون بريد رقم مكتب فرعي فاكس', `${g('a_contact')} ${c('fax')}: ${c('faxN')}. ${TL.extAdm[lang]}: 1900, 1901.`, [[c('phone'), LINKS.tel], ['info@aum.edu.jo', LINKS.email], [TL.t_contact[lang], LINKS.contact, 1]], ['contact', 'hours']),
    E('hours', 'hours hour open opening opens close closes time times working day days weekend friday saturday sunday دوام ساعات وقت أوقات مفتوح يفتح يغلق جمعة سبت أحد', `${c('hours')}: ${c('hoursV')}. ${L.hoursHealth[lang]}: ${L.healthHours[lang]}. ${A.applyCardHours[lang]}`, [[c('contact'), R + PAGES.about + '#contact']], ['hours']),
    E('elearning', 'elearning e-learning moodle lms online course material grades marks results registration system portal login password account تعلم الكتروني إلكتروني مودل علامات نتائج نظام التسجيل بوابة دخول كلمة سر حساب', g('a_elearning'), [[c('toolElearning'), LINKS.elearning, 1], [c('toolRegistration'), LINKS.registration, 1]], []),
    E('housing', 'housing dorm dorms dormitory accommodation room rooms live stay residence rent house of grace سكن سكنات مسكن غرفة غرف إقامة أقيم أسكن إيجار', `${L.housingW[lang]} ${L.housingM[lang]} ${L.housingFacts[lang]}.`, [[L.housingApply[lang], LINKS.housing, 1], [H.lifeHousingT[lang], R + PAGES.life + '#housing']], []),
    E('library', 'library books book database databases borrow borrowing printing study space quiet مكتبة كتب كتاب قواعد بيانات استعارة طباعة', `${g('a_library')} ${TL.extLib[lang]}.`, [[c('toolLibrary'), LINKS.library, 1]], []),
    E('exams', 'grading grade grades gpa pass fail mark marks exam exams final finals regulation regulations rules appeal review نظام العلامات علامة علامات معدل تراكمي نجاح رسوب امتحان امتحانات نهائي تعليمات مراجعة', `${A.gradeD[lang]} ${TL.d_exams[lang]}`, [[A.gradeT[lang], LINKS.grading, 1], [TL.t_exams[lang], LINKS.exams, 1]], []),
    E('transfer', 'transfer transferring switch change changing major specialisation credit recognition equivalence bridging تحويل أحول تجسير تغيير تخصص معادلة احتساب', TL.d_transfer[lang], [[TL.t_transfer[lang], LINKS.transferPolicy, 1], [TL.t_qa[lang], LINKS.qa, 1]], []),
    E('rules', 'graduation graduate requirements duration years long bachelor degree awarding rules thesis تخرج متطلبات مدة سنوات كم سنة منح درجة بكالوريوس', `${TL.d_bachelorRules[lang]} ${TL.d_masterRules[lang]} ${S.biotech.duration[lang]}: ${S.biotech.durationV[lang]} (${S.biotech.h1[lang]}).`, [[TL.t_bachelorRules[lang], LINKS.bachelorRules, 1], [TL.t_masterRules[lang], LINKS.masterRules, 1]], ['duration']),
    E('gened', 'general education programme requirement requirements university electives elective متطلبات عامة جامعة اختياري اختيارية', T2('academics', 'generalLead'), [[TL.t_genEd[lang], LINKS.genEd, 1]], []),
    E('location', 'where location located map directions madaba address campus reach get there far distance drive minutes amman أين وين موقع مكان خريطة اتجاهات مادبا عنوان حرم أصل أوصل بعيد مسافة دقيقة عمان', `${g('a_location')} ${H.visitLead[lang]}`, [[c('directions'), LINKS.maps, 1], [c('linkCampusMap'), (M.campusMap && M.campusMap.url) || LINKS.glance, 1]], ['where']),
    E('map', 'campus map building buildings tour virtual 360 walk around find way خريطة الحرم مبنى مباني جولة افتراضية', `${H.campusD[lang]} ${H.tourD[lang]}`, [[H.campusCta[lang], (M.campusMap && M.campusMap.url) || LINKS.glance, 1]].concat(M.tour ? [[H.tourT[lang], M.tour, 1]] : []), ['where']),
    E('madaba', 'madaba city town mosaic mosaics history about area مادبا مدينة فسيفساء', H.madabaD[lang], (M.madaba && M.madaba.url ? [[H.madabaCta[lang], M.madaba.url, 1]] : []).concat([[c('directions'), LINKS.maps, 1]]), ['where']),
    E('science', 'science biology biotechnology biotech lab labs laboratory laboratories dean head department departments chemistry physics علوم أحياء بيولوجيا تكنولوجيا حيوية مختبر مختبرات عميد رئيس قسم كيمياء فيزياء', `${g('a_science')} ${SC.deanName[lang]}: ${SC.deanRole[lang]}. ${SC.headName[lang]}: ${SC.headRole[lang]}. ${SC.labsLead[lang]}`, [[SC.kicker[lang], R + PAGES.science], [S.biotech.h1[lang], R + PAGES.biotech]], ['people']),
    E('news', 'news events announcements event announcement happening latest new today week أخبار فعاليات إعلانات فعالية إعلان جديد اليوم هذا الأسبوع', `${g('a_news')} ${H.newsLeadLabel[lang]}: ${H.news1T[lang]} (${H.news1D[lang]}).`, [[c('linkNews'), LINKS.news, 1], [c('linkEvents'), LINKS.events, 1], [H.newsroomKicker[lang], R + 'index.html#news']], ['dates']),
    E('ann', 'announcement announcements notice notices board vacancy vacancies job jobs إعلان إعلانات لوحة وظيفة وظائف شاغر', `${H.annD[lang]} ${H.ann1T[lang]} (${H.ann1D[lang]}). ${H.ann2T[lang]}.`, [[c('linkAnnouncements'), LINKS.announcements, 1], [c('linkVacancies'), 'https://jobs.aum.edu.jo/', 1]], ['dates']),
    E('openday', 'open day days visit visiting tour come see campus book appointment يوم مفتوح أيام مفتوحة زيارة أزور جولة حجز موعد', `${A.openLead[lang]} ${H.visitBookD[lang]}`, [[H.visitBook[lang], (M.visit && M.visit.url) || LINKS.contact, 1], [c('linkEvents'), LINKS.events, 1]], ['dates']),
    E('tools', 'tools links link useful systems wifi password student portal أدوات روابط رابط أنظمة واي فاي بوابة', g('a_tools'), [[c('allTools'), R + PAGES.tools]], []),
    E('email', 'student email mail gmail google account outlook inbox بريد الطالب جيميل حساب جوجل', TL.d_email[lang], [[c('toolEmail'), LINKS.studentEmail, 1], [c('allTools'), R + PAGES.tools]], []),
    E('history', 'history founded foundation established establishment when old year years patriarchate latin catholic church pope king inaugurated opened تاريخ تأسست تأسيس أنشئت متى قديمة سنة بطريركية لاتينية كاثوليكية كنيسة بابا ملك افتتاح', `${AB.lead[lang]} ${AB.t1Y[lang]}: ${AB.t1[lang]} ${AB.t2Y[lang]}: ${AB.t2[lang]} ${AB.t3Y[lang]}: ${AB.t3[lang]} ${AB.t4Y[lang]}: ${AB.t4[lang]}`, [[c('navAbout'), R + PAGES.about]], ['dates', 'numbers']),
    E('accred', 'accredited accreditation recognised recognized licensed license licence neche american usa us quality معتمدة معترف اعتماد ترخيص مرخصة أمريكية أمريكا جودة', `${AB.acc1[lang]}. ${AB.acc2[lang]}. ${AB.acc3[lang]}. ${AB.acc4[lang]}. ${AB.t6[lang]}`, [[AB.l4[lang], LINKS.licensing, 1], [c('navAbout'), R + PAGES.about]], []),
    E('president', 'president rector chancellor head of university leadership board trustees council who runs رئيس الجامعة رئيس مجلس أمناء إدارة قيادة من يدير', `${AB.presName[lang]}: ${AB.presRole[lang]}. ${AB.linksTitle[lang]}`, [[AB.l1[lang], LINKS.president, 1], [AB.l2[lang], LINKS.board, 1]], ['people']),
    E('motto', 'motto seal logo emblem meaning sapientia scientia wisdom hands light mosaic شعار ختم لوجو معنى حكمة علم أيدي نور فسيفساء', `${c('motto')} (${c('mottoMeaning')}). ${AB.sealLead[lang]}`, [[c('navAbout'), R + PAGES.about + '#seal']], []),
    E('numbers', 'how many students number numbers size big small graduates nationalities majors faculties statistics كم عدد طلاب حجم كبيرة صغيرة خريجين جنسيات تخصصات كليات إحصائيات', `${H.statFacultiesN[lang]} ${H.statFaculties[lang]} · ${H.statMajorsN[lang]} ${H.statMajors[lang]} · ${H.statNatN[lang]} ${H.statNat[lang]} · ${H.statGradN[lang]} ${H.statGrad[lang]} · ${H.statSinceN[lang]} ${H.statSince[lang]}.`, [[AB.l6[lang], LINKS.glance, 1]], ['numbers']),
    E('language', 'language instruction taught teach teaching english arabic medium لغة التدريس تدرس تدريس انجليزي إنجليزي إنجليزية عربي', `${H.statLang[lang]}: ${H.statLangN[lang]}. ${L.langD[lang]}`, [[c('navAcademics'), R + PAGES.academics]], []),
    E('week', 'four day week schedule classes days weekly timetable friday off أربعة أيام أسبوع دوام أيام الدوام جدول جمعة عطلة', `${H.why6[lang]}: ${H.why6D[lang]}`, [[H.whyTitle[lang], R + 'index.html#why']], ['hours']),
    E('intl', 'international foreign foreigner visa residency residence permit nationality nationalities abroad office دولي دوليين أجنبي أجانب فيزا تأشيرة إقامة جنسية جنسيات مكتب', `${L.intlLead[lang]} ${A.intlD[lang]}`, [[L.intlCta[lang], LINKS.intl, 1], [H.lifeIntlT[lang], R + PAGES.life + '#intl']], []),
    E('abroad', 'study abroad exchange semester partner partners university universities italy usa lebanon erasmus الدراسة في الخارج تبادل فصل شريكة شركاء جامعات إيطاليا أمريكا لبنان', `${L.abroadD[lang]} ${H.why4D[lang]}`, [[L.abroadT[lang], LINKS.abroad, 1]], []),
    E('clubs', 'club clubs society sport sports football volleyball chess pool swimming gym team teams activities community communities hiking debate ieee نادي أندية رياضة رياضات كرة قدم طائرة شطرنج مسبح سباحة فريق فرق أنشطة مجتمعات مشي مناظرة', `${L.clubsLead[lang]} ${L.sportLead[lang]} ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => L['cl' + i][lang]).join(lang === 'ar' ? '، ' : ', ')}.`, [[H.lifeClubsT[lang], R + PAGES.life + '#clubs'], [TL.t_studentAffairs[lang], LINKS.studentAffairs, 1]], []),
    E('health', 'health doctor doctors clinic nurse sick ill emergency ambulance pharmacy medical wellbeing counselling counseling psychologist صحة طبيب أطباء عيادة ممرض مريض طوارئ إسعاف صيدلية طبي إرشاد نفسي', `${L.healthLead[lang]} ${L.hoursHealth[lang]}: ${L.healthHours[lang]}.`, [[TL.t_health[lang], LINKS.health, 1], [L.healthTitle[lang], R + PAGES.life + '#health']], ['hours']),
    E('lang', 'language center centre arabic course courses beginners learn arabic مركز لغات اللغة العربية دورة دورات مبتدئين تعلم', L.langD[lang], [[c('navLife'), R + PAGES.life]], []),
    E('careers', 'career careers job jobs work employment internship alumni graduates network career day وظيفة مهنة مهن عمل توظيف تدريب خريجين شبكة يوم مهني', `${L.careerD[lang]} ${S.biotech.careersTitle[lang]}`, [[c('linkAlumni'), LINKS.alumni, 1]], []),
    E('discipline', 'discipline disciplinary rights duties rules behaviour behavior complaint cheating تأديب تأديبي حقوق واجبات سلوك شكوى غش', TL.d_discipline[lang], [[TL.t_discipline[lang], LINKS.discipline, 1]], []),
    E('whats', 'whatsapp message chat text واتساب رسالة دردشة', H.visitWhats[lang], [[H.visitWhats[lang], (M.social && M.social.whatsapp) || LINKS.contact, 1], [c('phone'), LINKS.tel]], ['contact']),
  ];
  // Faculty names answer "which faculty has X" and "faculty of business" style questions
  D.faculties.forEach((f) => entries.push({ id: 'fac-' + f.id, t: f[lang] || f.en, k: (f.en + ' ' + (f.ar || '')).toLowerCase(), a: `${f[lang] || f.en}: ${D.programmes.filter((p) => p.faculty === f.id).map((p) => p[lang] || p.en).join(lang === 'ar' ? '، ' : ', ')}.`, l: [[c('navAcademics'), R + PAGES.academics + '#' + f.id]], tags: ['programmes'] }));
  const chips = ['q_apply', 'q_programmes', 'q_plan', 'q_bus', 'q_fees', 'q_calendar', 'q_contact'].map((k) => `<button type="button" data-q="${esc(g(k))}">${esc(g(k))}</button>`).join('');
  const gs = {}; ['related', 'greet', 'thanks', 'canDo', 'fallback2', 'p_fee', 'p_feeOnly', 'p_feeNA', 'p_credits', 'p_creditsNA', 'p_avg', 'p_avgNA', 'p_plan', 'p_about', 'p_more'].forEach((k) => { gs[k] = g(k); });
  const facMap = {}; D.faculties.forEach((f) => { facMap[f.id] = f[lang] || f.en; });
  const data = { hi: g('hi'), fallback: g('fallback'), progFound: g('progFound'), studyPlan: c('studyPlan'), details: c('programmeDetails'), entries, s: gs, fac: facMap, lv: { bachelor: c('bachelor'), master: c('master') }, credits: c('credits'), minAverage: c('minAverage'), perCredit: c('perCredit'), notPublished: c('notPublished'), feeLink: [tl('fees'), LINKS.fees], contactLinks: [[c('phone'), LINKS.tel], [H.visitWhats[lang], (M.social && M.social.whatsapp) || LINKS.contact, 1], [c('allTools'), R + PAGES.tools]] };
  return `<button class="guide-fab" type="button" aria-expanded="false" aria-controls="guide">${icon('chat')}<span>${esc(g('open'))}</span></button>
<section class="guide" id="guide" hidden aria-label="${esc(g('title'))}">
  <header><img src="${R}assets/img/seal.png" width="34" height="34" alt=""><b>${esc(g('title'))}</b><button class="guide-close" type="button" aria-label="${esc(g('close'))}">×</button></header>
  <div class="guide-log" id="guide-log" aria-live="polite"></div>
  <div class="guide-chips">${chips}</div>
  <form class="guide-form" id="guide-form"><input id="guide-q" type="text" placeholder="${esc(g('placeholder'))}" autocomplete="off" aria-label="${esc(g('title'))}"><button class="btn" type="submit">${esc(g('send'))}</button></form>
  <p class="guide-note">${esc(g('note'))}</p>
</section>
<script>window.AUM_GUIDE=${JSON.stringify(data)};</script>`;
}

function shell(ctx, page, body) {
  const { lang, R, t, c } = ctx; const sec = S[page] || {};
  PH = c('photoSlot');
  const social = Object.entries(M.social || {}).filter(([, u]) => u);
  const SOC = { facebook: 'M14 8h2.5V4.5H14c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.8c0-.5.3-.8.5-.8Z', x: 'M4 4l16 16M20 4 4 20', youtube: 'M3 8.5c0-1.4 1.1-2.5 2.5-2.5h13C19.9 6 21 7.1 21 8.5v7c0 1.4-1.1 2.5-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5v-7Zm7 1.5v4l4-2-4-2Z', instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.5 6.5h.01', linkedin: 'M6 9v12M6 5v.01M11 21v-7a3 3 0 0 1 6 0v7M11 9v12', whatsapp: 'M4 20l1.3-3.8A8 8 0 1 1 8.3 19L4 20Zm5-9c.5 2 2 3.5 4 4l1-1 2 1c0 1-1 1.5-2 1.5-3 0-6.5-3.5-6.5-6.5 0-1 .5-2 1.5-2l1 2-1 1Z' };
  const socialHtml = social.length ? `<div class="social" aria-label="${esc(c('followUs'))}">${social.map(([k, u]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${SOC[k]}"/></svg></a>`).join('')}</div>` : '';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const file = ctx.file || PAGES[page];
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
<title>${esc(ctx.title || t('title'))}</title>
<meta name="description" content="${esc(ctx.description || (sec.description ? t('description') : t('lead')))}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#8b0a12">
<link rel="icon" href="${R}assets/img/favicon-48.png" sizes="48x48">
<link rel="icon" href="${R}assets/img/icon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="${R}assets/img/apple-touch-icon.png">
<link rel="alternate" hreflang="en" href="${SITE}${file}">
<link rel="alternate" hreflang="ar" href="${SITE}ar/${file}">
<link rel="alternate" hreflang="x-default" href="${SITE}${file}">
<link rel="preload" href="${R}assets/fonts/${lang === 'ar' ? 'amiri-arabic-bold' : 'cormorant-latin'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${R}assets/css/site.css?v=${V.css}">
<script>window.AUM_STRINGS=${JSON.stringify(strings)};window.AUM_DATA=${JSON.stringify(D)};window.AUM_FAC=${JSON.stringify(facData(R))};window.AUM_DEPT=${JSON.stringify(deptThumbs(R))};window.AUM_ALERTS=${JSON.stringify(alertsData(lang))};</script>
</head>
<body>
<div class="intro" id="intro" aria-hidden="true">
  <canvas class="intro-canvas" id="intro-canvas"></canvas>
  <img class="intro-seal" id="intro-seal" src="${seal}" width="239" height="239" alt="">
  <p class="intro-name"><small>${esc(lang === 'ar' ? 'مادبا · الأردن' : 'Madaba · Jordan')}</small>${esc(c('siteName'))}</p>
  <button class="intro-skip" type="button">${esc(c('skip'))}</button>
</div>
<script src="${R}assets/js/intro.js?v=${V.intro}"></script>
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
${guideHtml(ctx)}
<script src="${R}assets/js/site.js?v=${V.js}" defer></script>
</body>
</html>
`;
}

/* ---------- reusable blocks ---------- */
const head = (ctx, kicker, title, lead, center) =>
  `<div class="section-head${center ? ' center' : ''} rv">${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}<h2>${esc(title)}</h2>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div>`;

const phero = (ctx, kicker, h1, lead, h1em) =>
  `<section class="phero"><div class="wrap"><div class="phero-band">${ring('')}<img class="phero-seal" src="${ctx.R}assets/img/seal.png" width="239" height="239" alt=""></div><span class="kicker rv">${esc(kicker)}</span><h1 class="rv d1">${esc(h1)}${h1em ? ` <em>${esc(h1em)}</em>` : ''}</h1><p class="lead rv d2">${esc(lead)}</p></div></section>${mosaicRule()}`;

const pheroPhoto = (ctx, kicker, h1, lead, media, alt) => {
  const img = media && has(media.file) ? `<img src="${mp(ctx.R, media.file)}" alt="${esc(alt)}" loading="eager">` : `<div class="ph"><div class="tesserae" data-count="40"></div><span>${esc(PH)}</span></div>`;
  return `<section class="phero photo-hero"><div class="tesserae" data-count="36" aria-hidden="true"></div><div class="wrap phero-split"><div><span class="kicker rv">${esc(kicker)}</span><h1 class="rv d1">${esc(h1)}</h1><p class="lead rv d2">${esc(lead)}</p></div><div class="phero-pic rv d2">${img}</div></div></section>`;
};

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
// v4d: each faculty gets its own photo (AUM's department card images), a colour edge and the icon as fallback
const facultyColor = { engineering: '#9a4a2a', science: '#5e6b3a', health: '#8b0a12', it: '#5a3d2b', business: '#b8862b', design: '#560309', languages: '#c08a2e' };
const facData = (R) => Object.fromEntries(D.faculties.map((f) => [f.id, { icon: icon(facultyIcon[f.id]), img: has(`dept/fac-${f.id}.jpg`) ? mp(R, `dept/fac-${f.id}.jpg`) : '', color: facultyColor[f.id] || '#8b0a12' }]));
// v4e: breaking-news bar data (text from strings.json when an item names a key, else inline en/ar)
const alertsData = (lang) => ({ active: !!AL.active, items: (AL.items || []).map((i) => ({ level: i.level || 'notice', text: i.key ? ((S.home[i.key] || {})[lang] || (S.home[i.key] || {}).en || '') : (i[lang] || i.en || ''), url: i.url || '' })).filter((i) => i.text) });
const deptThumbs = (R) => Object.fromEntries(D.programmes.filter((p) => p.plan && has(`dept/${p.plan}.jpg`)).map((p) => [p.plan, mp(R, `dept/${p.plan}.jpg`)]));
const count = (fid, level) => D.programmes.filter((p) => p.faculty === fid && p.level === level).length;

/* ---------- pages ---------- */
function toolCard(ctx, id, group, ic, url, i) {
  const { T, c } = ctx;
  const internal = url === '@plans'; if (internal) url = ctx.R + PAGES.plans;
  return `<a class="tool rv d${i % 4}" href="${url}"${internal ? '' : ' target="_blank" rel="noopener"'} data-group="${group}" data-text="${esc((T('tools', 't_' + id) + ' ' + T('tools', 'd_' + id)).toLowerCase())}">${icon(ic)}<span class="tool-body"><b>${esc(T('tools', 't_' + id))}</b><span>${esc(T('tools', 'd_' + id))}</span></span><span class="tool-go" aria-hidden="true">↗</span></a>`;
}

// v4e: the visit band (dark, floating tesserae, three ways in, a stack of photos) replaces the plain contact tiles on the home page
function visitSection(ctx) {
  const { R, t, c, lang } = ctx;
  const pics = ((M.visit && M.visit.files) || []).filter((x) => has(x.file));
  const stack = pics.length ? `<div class="visit-stack rv d1">${pics.map((x, i) => `<figure class="vphoto p${i}"><img src="${mp(R, x.file)}" alt="${esc(t(x.cap))}" loading="lazy"><figcaption>${esc(t(x.cap))}</figcaption></figure>`).join('')}</div>` : '';
  const ways = [
    ['send', t('visitBook'), t('visitBookD'), (M.visit && M.visit.url) || LINKS.contact, c('visit')],
    ['calendar', t('visitOpen'), S.admissions.openLead[lang], LINKS.events, t('visitOpenCta')],
    ['pin', t('visitDir'), c('address'), LINKS.maps, c('directions')]
  ].map(([ic, h, d, href, cta], i) => `<a class="way rv d${i}" href="${href}" target="_blank" rel="noopener">${icon(ic)}<span class="way-body"><b>${esc(h)}</b><span>${esc(d)}</span><span class="link">${esc(cta)} <span class="arr">→</span></span></span></a>`).join('');
  const wa = M.social && M.social.whatsapp;
  return `<section class="section dark visit" id="visit"><div class="tesserae" data-count="90" aria-hidden="true"></div>
  <div class="wrap">
    <div class="visit-grid">
      <div class="rv"><span class="kicker">${esc(t('visitKicker'))}</span><h2 class="visit-title">${esc(t('visitTitle'))}</h2><p class="lead">${esc(t('visitLead'))}</p>
        <div class="visit-actions"><a class="btn btn-light" href="${LINKS.tel}">${esc(t('visitCall'))} · ${esc(c('phone'))}</a>${wa ? `<a class="btn btn-ghost light" href="${wa}" target="_blank" rel="noopener">${esc(t('visitWhats'))}</a>` : ''}<a class="btn btn-ghost light" href="${LINKS.email}">${esc(t('visitEmail'))}</a></div>
        <p class="visit-hours"><b>${esc(t('visitHoursT'))}</b> ${esc(c('hoursV'))}</p>
      </div>
      ${stack}
    </div>
    <div class="ways">${ways}</div>
  </div>
</section>`;
}

// v4e: Life at AUM blocks for current and new students
function audBar(ctx) {
  const { t } = ctx;
  return `<div class="wrap"><div class="audbar rv" role="tablist" aria-label="${esc(t('audLabel'))}"><span class="aud-label">${esc(t('audLabel'))}</span><div class="aud-seg"><button type="button" role="tab" class="on" data-aud="all" aria-selected="true">${esc(t('audAll'))}</button><button type="button" role="tab" data-aud="new" aria-selected="false">${esc(t('audNew'))}</button><button type="button" role="tab" data-aud="current" aria-selected="false">${esc(t('audCurrent'))}</button></div></div></div>`;
}
function lifeWeek(ctx) {
  const { R, t, c, lang, T } = ctx;
  const quick = ['elearning', 'registration', 'courseFinder', 'calendar', 'library', 'email'].map((id, i) => { const tl = TOOLS.find((x) => x[0] === id); return `<a class="quick rv d${i % 4}" href="${tl[3]}" target="_blank" rel="noopener">${icon(tl[2])}<b>${esc(T('tools', 't_' + id))}</b></a>`; }).join('');
  const routes = [['rAmman', 250], ['rFuhais', 250], ['rZarqa', 250], ['rKarak', 250], ['rMadaba', 160]];
  const opts = routes.map(([k, fee], i) => `<option value="${fee}"${i ? '' : ' selected'}>${esc(t(k))}</option>`).join('');
  return `<section class="section week" id="week" data-aud="current">
  <div class="wrap">
    ${head(ctx, t('weekKicker'), t('weekTitle'), t('weekLead'))}
    <div class="week-grid">
      <div class="week-card quick-links rv"><h3>${esc(t('quickT'))}</h3><div class="quick-grid">${quick}</div><a class="link" href="${R + PAGES.tools}">${esc(c('allTools'))} <span class="arr">→</span></a></div>
      <div class="week-card hours rv d1"><h3>${esc(t('hoursT'))}</h3><dl><div>${icon('health')}<dt>${esc(t('hoursHealth'))}</dt><dd>${esc(t('healthHours'))}</dd></div><div>${icon('clock')}<dt>${esc(t('hoursOffice'))}</dt><dd>${esc(c('hoursV'))}</dd></div></dl></div>
      <div class="week-card busfind rv d2"><h3>${esc(t('busFindT'))}</h3><label class="field">${esc(t('busFindLabel'))}<select id="bus-from">${opts}</select></label><p class="bus-out"><b id="bus-fee">250</b> ${esc(t('busFindFee'))}</p><p class="finder-note">${esc(t('busFindSummer'))} ${esc(t('busNote'))}</p><a class="btn" href="${LINKS.bus}" target="_blank" rel="noopener">${esc(t('busFindCta'))} <span class="arr">→</span></a></div>
    </div>
  </div>
</section>`;
}
function lifeStart(ctx) {
  const { t } = ctx;
  const links = [LINKS.elearning, LINKS.bus, LINKS.housing, LINKS.calendar, LINKS.studentAffairs];
  const steps = [1, 2, 3, 4, 5].map((i) => `<li class="rstep rv d${(i - 1) % 4}"><span class="rstep-n">${i}</span><div><h3>${esc(t('n' + i))}</h3><p>${esc(t('n' + i + 'D'))}</p><a class="link" href="${links[i - 1]}" target="_blank" rel="noopener">${esc(ctx.c('opensAum'))} <span class="arr">↗</span></a></div></li>`).join('');
  return `<section class="section tint start" id="start" data-aud="new">
  <div class="wrap">
    ${head(ctx, t('newKicker'), t('newTitle'), t('newLead'))}
    <ol class="route-steps start-steps">${steps}</ol>
  </div>
</section>`;
}

function home(ctx) {
  const { R, t, c, lang, T } = ctx;
  const seal = R + 'assets/img/seal.png';
  const stats = [['statFacultiesN', 'statFaculties'], ['statMajorsN', 'statMajors'], ['statNatN', 'statNat'], ['statGradN', 'statGrad'], ['statWeekN', 'statWeek']]
    .map(([n, l]) => `<div class="stat"><b>${esc(t(n))}</b><span>${esc(t(l))}</span></div>`).join('');
  const quick = HOME_TOOLS.map((id, i) => { const tl = TOOLS.find((x) => x[0] === id); return `<a class="quick rv d${i % 4}" href="${tl[3]}" target="_blank" rel="noopener">${icon(tl[2])}<b>${esc(T('tools', 't_' + id))}</b></a>`; }).join('');
  const chips = D.faculties.map((f) => `<button type="button" class="fchip" data-fac="${f.id}">${esc(f[lang])}</button>`).join('');
  const why = [['laptop', 'why1', LINKS.elearning], ['award', 'why2', LINKS.scholarships], ['home', 'why3', LINKS.dorms], ['intl', 'why4', LINKS.abroad], ['bus', 'why5', LINKS.transport], ['calendar', 'why6', LINKS.calendar], ['shield', 'why7', LINKS.licensing]]
    .map(([ic, k, h], i) => `<a class="stone rv d${i % 4}" href="${h}" target="_blank" rel="noopener"><span class="stone-n">${String(i + 1).padStart(2, '0')}</span>${icon(ic)}<b>${esc(t(k))}</b><p>${esc(t(k + 'D'))}</p><span class="stone-go">${esc(c('opensAum'))} <span class="arr">↗</span></span></a>`).join('');
  const bandFiles = ((M.why && M.why.files) || [M.why && M.why.file]).filter(has);
  const whyBand = bandFiles.length
    ? `<div class="why-band rv" data-band><div class="band-track">${bandFiles.map((f, i) => `<a class="band-slide${i ? '' : ' on'}" href="${M.why.url}" target="_blank" rel="noopener" tabindex="${i ? -1 : 0}"><img src="${mp(R, f)}" alt="${esc(t('whyPhotoAlt'))}" loading="${i < 2 ? 'eager' : 'lazy'}"></a>`).join('')}</div><span class="why-cap">${esc(t('whyBandCap'))}</span><div class="band-ui"><button type="button" class="band-btn prev" aria-label="${esc(t('bandPrev'))}">←</button><span class="band-dots" role="tablist">${bandFiles.map((_, i) => `<button type="button" role="tab" class="${i ? '' : 'on'}" aria-label="${i + 1} ${esc(t('bandOf'))} ${bandFiles.length}"></button>`).join('')}</span><button type="button" class="band-btn next" aria-label="${esc(t('bandNext'))}">→</button></div></div>`
    : `<div class="why-band ph"><div class="tesserae" data-count="40"></div><span>${esc(PH)}</span></div>`;
  const notices = [1, 2, 3].map((i) => `<a class="notice" href="${M.announcements[i - 1].url}" target="_blank" rel="noopener">${icon(M.announcements[i - 1].icon || 'megaphone')}<span><small>${esc(t('annCat' + i))} · ${esc(t('ann' + i + 'D'))}</small><b>${esc(t('ann' + i + 'T'))}</b></span></a>`).join('');
  const leadStory = (() => { const n = M.news[0]; return `<a class="lead-story rv" href="${n.url}" target="_blank" rel="noopener">${pic(R, n.file, 'lead-img', t('news1T'))}<span class="lead-body"><span class="tag">${esc(t('newsLeadLabel'))}</span><h3>${esc(t('news1T'))}</h3><span class="date">${esc(t('news1D'))}</span><span class="link">${esc(c('learnMore'))} <span class="arr">→</span></span></span></a>`; })();
  const stories = (M.newsMore || []).map((n, i) => `<a class="story rv d${i % 4}" href="${n.url}" target="_blank" rel="noopener">${pic(R, n.file, 'story-img', t(n.key + 'T'))}<span class="story-body"><h3>${esc(t(n.key + 'T'))}</h3><span class="date">${esc(t(n.key + 'D'))}</span></span></a>`).join('');
  const events = [1, 2, 3, 4].map((i) => { const e = M.events[i - 1]; return `<a class="event rv d${(i - 1) % 4}" href="${e.url}" target="_blank" rel="noopener">${pic(R, e.file, 'event-img', t('ev' + i + 'T'))}<span class="event-date"><b>${esc(t('ev' + i + 'D'))}</b><small>${esc(t('ev' + i + 'M'))}</small></span><span class="event-body"><h3>${esc(t('ev' + i + 'T'))}</h3><span class="time">${esc(t('ev' + i + 'H'))}</span></span></a>`; }).join('');
  const alumniN = Math.min((M.alumni || []).length, 4);
  const alumni = Array.from({ length: alumniN }, (_, i) => {
    const n = i + 1;
    return `<div class="alum alum-slide${i ? '' : ' on'}"><div class="rv"><span class="kicker">${esc(t('alumniKicker'))}</span><h2>${esc(t('alumniTitle'))}</h2><blockquote>“${esc(t('al' + n + 'Q'))}”</blockquote><p class="who"><b>${esc(t('al' + n + 'N'))}</b><span>${esc(t('al' + n + 'R'))}</span></p><a class="btn btn-light" href="${LINKS.alumni}" target="_blank" rel="noopener">${esc(t('alumniMore'))} <span class="arr">→</span></a></div><div class="rv d1">${pic(R, M.alumni[i].file, 'alum-img', t('al' + n + 'N'))}</div></div>`;
  }).join('');
  const orient = (M.orientation && M.orientation.url ? (M.orientation.files || []).filter(has) : []).map((f, i) => `<a class="rv d${i % 3}" href="${M.orientation.url}" target="_blank" rel="noopener"><img src="${mp(R, f)}" alt="${esc(t('galTitle'))}" loading="lazy"></a>`).join('');
  const life = [['bus', 'Bus'], ['home', 'Housing'], ['clubs', 'Clubs'], ['intl', 'Intl']].map(([ic, k], i) =>
    `<a class="tile rv d${i}" href="${R + PAGES.life}#${k.toLowerCase()}">${icon(ic)}<h3>${esc(t('life' + k + 'T'))}</h3><p>${esc(t('life' + k + 'D'))}</p><span class="link">${esc(c('learnMore'))}</span></a>`).join('');
  const reelList = (M.reels || []).filter((r) => has(r.src));
  const reels = reelList.map((r, i) => `<div class="reel-box rv d${i % 4}"><video class="reel" src="${mp(R, r.src)}"${has(r.poster) ? ` poster="${mp(R, r.poster)}"` : ''} muted loop playsinline preload="metadata" data-autoplay></video><button class="reel-sound" type="button" aria-label="${esc(t('soundOn'))}" data-on="${esc(t('soundOff'))}" data-off="${esc(t('soundOn'))}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path class="wave" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/><path class="cross" d="m16 9 5 6m0-6-5 6"/></svg></button></div>`).join('')
    + (reelList.length && M.stories ? `<a class="reel reel-more rv d${reelList.length % 4}" href="${M.stories}" target="_blank" rel="noopener"><span class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><b>${esc(t('storiesT'))}</b><span>${esc(t('storiesD'))}</span></a>` : '');
  const bannerBg = (o) => (o && has(o.file) ? ` style="background-image:url(${mp(R, o.file)})"` : '');
  const banners = `${M.tour ? `<a class="banner rv" href="${M.tour}" target="_blank" rel="noopener"><span><b>${esc(t('tourT'))}</b>${esc(t('tourD'))}</span><span class="btn btn-light">${esc(t('tourCta'))} <span class="arr">→</span></span></a>` : ''}${M.campusMap && M.campusMap.url ? `<a class="banner rv${has(M.campusMap.file) ? ' img' : ''}" href="${M.campusMap.url}" target="_blank" rel="noopener"${bannerBg(M.campusMap)}><span><b>${esc(t('campusT'))}</b>${esc(t('campusD'))}</span><span class="btn btn-light">${esc(t('campusCta'))} <span class="arr">→</span></span></a>` : ''}${M.madaba && M.madaba.url ? `<a class="banner alt rv d1${has(M.madaba.file) ? ' img' : ''}" href="${M.madaba.url}" target="_blank" rel="noopener"${bannerBg(M.madaba)}><span><b>${esc(t('madabaT'))}</b>${esc(t('madabaD'))}</span><span class="btn btn-light">${esc(t('madabaCta'))} <span class="arr">→</span></span></a>` : ''}`;

  const film = M.heroFilm && has(M.heroFilm.src) ? M.heroFilm : null;
  const filmPoster = film && has(film.poster) ? mp(R, film.poster) : '';
  const filmStats = [['statFacultiesN', 'statFaculties'], ['statMajorsN', 'statMajors'], ['statNatN', 'statNat']].map(([n, l]) => `<div class="fstat"><b>${esc(t(n))}</b><span>${esc(t(l))}</span></div>`).join('');
  const heroCtas = `<a class="btn" href="#finder">${esc(c('findProgramme'))} <span class="arr">→</span></a>
        <a class="btn btn-ghost" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))}</a>
        <a class="btn btn-ghost" href="${LINKS.maps}" target="_blank" rel="noopener">${esc(c('visit'))}</a>`;
  const filmHero = film ? `
<section class="film" data-film aria-label="${esc(t('filmLabel'))}">
  <div class="film-stage">
    <video class="film-video" muted playsinline preload="auto"${filmPoster ? ` poster="${filmPoster}"` : ''} aria-hidden="true" tabindex="-1"><source src="${mp(R, film.src)}" type="video/mp4">${film.webm && has(film.webm) ? `<source src="${mp(R, film.webm)}" type="video/webm">` : ''}</video>
    ${filmPoster ? `<img class="film-poster" src="${filmPoster}" alt="" aria-hidden="true">` : ''}
    <div class="film-scrim" aria-hidden="true"></div>
    <div class="film-wall tesserae" data-count="34" aria-hidden="true"></div>
    <div class="wrap film-ui">
      <div class="film-seal">${ring('hero-ring')}<img src="${seal}" width="239" height="239" alt="${esc(c('siteName'))}"></div>
      <div class="beat b1 on" data-from="0" data-to="0.34">
        <span class="kicker">${esc(t('kicker'))}</span>
        <h1>${esc(t('h1a'))} <em>${esc(t('h1b'))}</em></h1>
        <p class="lead">${esc(t('lead'))}</p>
        <div class="hero-cta"><a class="btn" href="#finder">${esc(t('filmBeat1Cta'))} <span class="arr">→</span></a></div>
      </div>
      <div class="beat b2" data-from="0.34" data-to="0.67">
        <span class="kicker">${esc(t('facultiesKicker'))}</span>
        <h2>${esc(t('facultiesTitle'))}</h2>
        <div class="film-stats">${filmStats}</div>
      </div>
      <div class="beat b3" data-from="0.67" data-to="1.01">
        <span class="kicker">${esc(c('navAcademics'))}</span>
        <h2>${esc(t('finderTitle'))}</h2>
        <p class="lead">${esc(t('finderLead'))}</p>
        <div class="hero-cta">${heroCtas}</div>
      </div>
    </div>
    <div class="film-foot" aria-hidden="true"><span class="film-hint">${esc(t('filmScroll'))}<i></i></span><span class="film-bar"><i></i></span></div>
  </div>
</section>` : `
<section class="hero${M.heroVideo && has(M.heroVideo.src) ? ' has-video cine' : ''}">
  ${M.heroVideo && has(M.heroVideo.src) ? `<video class="hero-video" src="${mp(R, M.heroVideo.src)}"${has(M.heroVideo.poster) ? ` poster="${mp(R, M.heroVideo.poster)}"` : ''} autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video><div class="hero-veil" aria-hidden="true"></div>` : ''}
  <div class="hero-wall tesserae" data-count="90"></div>
  <div class="wrap hero-grid">
    <div>
      <span class="kicker rv">${esc(t('kicker'))}</span>
      <h1 class="rv d1">${esc(t('h1a'))} <em>${esc(t('h1b'))}</em></h1>
      <p class="lead rv d2">${esc(t('lead'))}</p>
      <div class="hero-cta rv d3">
        ${heroCtas}
      </div>
    </div>
    <div class="hero-seal rv d2">${ring('hero-ring')}<img src="${seal}" width="239" height="239" alt="${esc(c('siteName'))}"></div>
  </div>
</section>`;

  return `${filmHero}
<section class="quickbar" aria-label="${esc(t('toolsKicker'))}">
  <div class="wrap"><div class="quick-card rv"><div class="tesserae" data-count="26" aria-hidden="true"></div>
    <div class="quick-head"><span class="kicker">${esc(t('toolsKicker'))}</span><a class="link" href="${R + PAGES.tools}">${esc(c('allTools'))}</a></div>
    <div class="quick-grid">${quick}</div>
  </div></div>
</section>
<section class="section featured" aria-label="${esc(t('latestLabel'))}">
  <div class="wrap">
    ${M.heroVideo && has(M.heroVideo.src) ? `<a class="feat vid rv" href="${LINKS.apply}" target="_blank" rel="noopener">
      <video class="feat-img" src="${mp(R, M.heroVideo.src)}"${has(M.heroVideo.poster) ? ` poster="${mp(R, M.heroVideo.poster)}"` : ''} autoplay muted loop playsinline preload="metadata" aria-label="${esc(t('heroVidT'))}"></video>
      <span class="feat-body"><span class="kicker">${esc(t('heroVidKicker'))}</span><h2>${esc(t('heroVidT'))}</h2><p>${esc(t('heroVidD'))}</p><span class="link">${esc(c('apply'))} <span class="arr">→</span></span></span>
    </a>` : ''}
    <a class="feat rev rv" href="${LINKS.news}" target="_blank" rel="noopener">
      ${pic(R, M.hero.file, 'feat-img', t('feat1T'))}
      <span class="feat-body"><span class="kicker">${esc(t('featuredKicker'))}</span><h2>${esc(t('feat1T'))}</h2><p>${esc(t('feat1D'))}</p><span class="link">${esc(c('learnMore'))} <span class="arr">→</span></span></span>
    </a>
  </div>
</section>
<section class="section tint why" id="why">
  <div class="wrap">
    ${head(ctx, t('whyKicker'), t('whyTitle'), t('whyLead'))}
    ${whyBand}
    <div class="stones">${why}</div>
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
      <div class="finder-meta"><span id="f-count"></span><span class="finder-hint">${esc(t('finderHint'))}</span><a class="link" href="${R + PAGES.academics}">${esc(t('finderAllFaculties'))}</a></div>
      <div class="plist compact" id="f-list"></div>
      <p class="finder-note">${esc(t('finderNote'))}</p>
    </div>
  </div>
</section>
${mosaicRule()}
<section class="section newsroom" id="news">
  <div class="wrap">
    <div class="masthead rv">
      <div><span class="kicker">${esc(t('newsroomKicker'))}</span><h2>${esc(t('newsTitle'))}</h2></div>
      <div class="mast-meta"><span>${esc(t('newsUpdated'))}</span><a class="btn btn-ghost" href="${LINKS.news}" target="_blank" rel="noopener">${esc(t('newsAll'))} <span class="arr">→</span></a></div>
    </div>
    <div class="ticker" id="ticker" hidden><span class="ticker-label"><i></i>${esc(t('tickerLabel'))}</span><div class="ticker-view"><div class="ticker-track"></div></div></div>
    <div class="paper">
      ${leadStory}
      <div class="stories"><h4 class="col-head rv">${esc(t('newsMore'))}</h4>${stories}</div>
    </div>
    <aside class="notices rv" id="announcements"><div class="notices-head"><h4 class="col-head">${esc(t('noticesLabel'))}</h4><a class="link" href="${LINKS.announcements}" target="_blank" rel="noopener">${esc(t('noticesAll'))} <span class="arr">→</span></a></div><div class="notices-row">${notices}</div></aside>
  </div>
</section>
${orient ? `<section class="section tint" id="campus-life">
  <div class="wrap">
    <div class="row-head rv"><div><span class="kicker">${esc(t('galKicker'))}</span><h2>${esc(t('galTitle'))}</h2><p class="lead" style="margin:6px 0 0">${esc(t('galLead'))}</p></div><a class="btn btn-ghost" href="${M.orientation.url}" target="_blank" rel="noopener">${esc(t('galCta'))} <span class="arr">→</span></a></div>
    <div class="gallery collage">${orient}</div>
  </div>
</section>` : ''}
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
${reels ? `<section class="section dark" id="reels"><div class="tesserae" data-count="46" aria-hidden="true"></div><div class="wrap reels-wrap"><div class="rv"><span class="kicker">${esc(t('reelsKicker'))}</span><h2>${esc(t('reelsTitle'))}</h2><p class="lead">${esc(t('reelsLead'))}</p>${M.social.instagram ? `<a class="btn btn-light" href="${M.social.instagram}" target="_blank" rel="noopener">${esc(c('followUs'))}</a>` : ''}</div><div class="reels">${reels}</div></div></section>` : ''}
${banners ? `<section class="section banners"><div class="wrap">${banners}</div></section>` : ''}
<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('lifeKicker'), t('lifeTitle'))}
    <div class="grid c4">${life}</div>
  </div>
</section>
${mosaicRule()}
<section class="section tint research" id="research">
  <div class="wrap two">
    <div class="research-text">${head(ctx, t('researchKicker'), t('researchTitle'), t('researchLead'))}<p class="rv d1"><a class="btn" href="${R + PAGES.academics}#graduate">${esc(S.academics.graduate[lang])} <span class="arr">→</span></a></p></div>
    <div class="labs rv d1"><a class="lab" href="${LINKS.alumni}" target="_blank" rel="noopener"><b>${esc(t('alumniT'))}</b><span>${esc(t('alumniD'))}</span></a><a class="lab" href="${LINKS.events}" target="_blank" rel="noopener"><b>${esc(t('eventsT'))}</b><span>${esc(t('eventsD'))}</span></a><a class="lab" href="${LINKS.announcements}" target="_blank" rel="noopener"><b>${esc(t('annT'))}</b><span>${esc(t('annD'))}</span></a><a class="lab" href="${LINKS.library}" target="_blank" rel="noopener"><b>${esc(c('linkLibrary'))}</b><span>${esc(T('tools', 'd_library'))}</span></a></div>
  </div>
</section>
${visitSection(ctx)}
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
    const nm = count(f.id, 'master');
    const masters = nm ? `<h4 class="sub">${esc(t('masterIn'))}</h4><div class="plist" data-programmes="${f.id}" data-level="master"></div>` : '';
    const meta = [n ? `${n} ${esc(c('bachelor'))}` : '', nm ? `${nm} ${esc(c('master'))}` : ''].filter(Boolean).join(' · ');
    const peekNames = D.programmes.filter((p) => p.faculty === f.id).slice(0, 3).map((p) => p[lang] || p.en).join(' · ');
    const total = D.programmes.filter((p) => p.faculty === f.id).length;
    return `<details class="facblock rv" id="${f.id}" style="--fc:${facultyColor[f.id] || '#8b0a12'}"><summary class="facblock-head">${icon(facultyIcon[f.id])}<div class="fb-text"><h3>${esc(f[lang])}</h3>${meta ? `<span class="fac-meta">${meta}</span>` : ''}<span class="fac-peek">${esc(peekNames)}</span></div><small class="fb-count">${total === 1 ? esc(c('programmeOne')) : `${total} ${esc(c('programmesN'))}`}</small></summary><div class="facblock-body">${extra ? `<p class="fac-extra">${extra}</p>` : ''}${n ? `<h4 class="sub">${esc(t('bachelorIn'))}</h4>` : ''}${list}${masters}</div></details>`;
  }).join('');
  const findex = `<div class="facindex rv" id="facindex"><span class="kicker">${esc(t('indexKicker'))}</span><div class="fchips">${D.faculties.map((f) => `<a class="fchip" href="#${f.id}" style="--fc:${facultyColor[f.id] || '#8b0a12'}">${esc(f[lang])}</a>`).join('')}</div><div class="fac-ctl"><button type="button" class="link" data-fac-all="open">${esc(t('openAll'))}</button><button type="button" class="link" data-fac-all="close">${esc(t('closeAll'))}</button></div></div>`;
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section faculties"><div class="tesserae" data-count="60" aria-hidden="true"></div>
  <div class="wrap">
    ${head(ctx, '', t('byFaculty'), c('verify'))}
    ${findex}
    <div class="facblocks">${blocks}</div>
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
  const SM = M.science || {};
  const labs = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<div class="lab rv d${i % 4}"><b>${esc(t('lab' + i + 'T'))}</b><span>${esc(t('lab' + i + 'D'))}</span></div>`).join('');
  const careers = [1, 2, 3, 4].map((i) => `<span class="pill">${esc(S.biotech['car' + i][lang])}</span>`).join('');
  const portrait = (o, initials) => (o && has(o.file) ? `<img class="portrait" src="${mp(R, o.file)}" alt="" width="480" height="669">` : `<div class="portrait" aria-hidden="true">${initials}</div>`);
  const hl = (SM.highlights || []).length ? `<p class="kicker" style="margin-top:16px">${esc(t('hlKicker'))}</p><ul class="list small">${[1, 2, 3].map((i) => `<li><a href="${SM.highlights[i - 1]}" target="_blank" rel="noopener">${esc(t('hl' + i))}</a></li>`).join('')}</ul>` : '';
  const video = SM.video && has(SM.video.src)
    ? `<div class="photo vid rv"><video src="${mp(R, SM.video.src)}"${has(SM.video.poster) ? ` poster="${mp(R, SM.video.poster)}"` : ''} controls playsinline preload="metadata"></video></div>`
    : `<div class="photo rv"><div class="tesserae" data-count="70"></div><p class="note">${esc(t('photoNote'))}</p></div>`;
  const news = (SM.news || []).slice(0, 6).map((n, i) => `<a class="card rv d${i % 3}" href="${n.url}" target="_blank" rel="noopener">${pic(R, n.file, 'card-img', t('n' + (i + 1) + 'T'))}<h3>${esc(t('n' + (i + 1) + 'T'))}</h3><span class="date">${esc(t('n' + (i + 1) + 'D'))}</span><span class="link card-link">${esc(c('learnMore'))}</span></a>`).join('');
  const gallery = (SM.gallery || []).filter((g) => has(g.file)).map((g, i) => `<a class="rv d${i % 3}" href="${g.url}" target="_blank" rel="noopener"><img src="${mp(R, g.file)}" alt="${esc(t('g' + (i + 1)))}" loading="lazy"></a>`).join('');
  const people = (SM.staff || []).map((p, i) => `<div class="person rv d${i % 5}">${has(p.file) ? `<img src="${mp(R, p.file)}" alt="${esc(p.name)}" loading="lazy" width="480" height="669">` : `<div class="ph"></div>`}<b>${esc(p.name)}</b><span>${esc(t('st_' + p.id))}</span></div>`).join('');
  return `
${phero(ctx, t('kicker'), t('h1a'), t('lead'), t('h1b'))}
<section class="section">
  <div class="wrap">
    ${head(ctx, t('leadKicker'), '', '')}
    <div class="leaders">
      <div class="dean rv">
        ${portrait(SM.dean, lang === 'ar' ? 'ع' : 'WA')}
        <div><span class="kicker">${esc(t('deanKicker'))}</span><div class="who"><b>${esc(t('deanName'))}</b><span>${esc(t('deanRole'))}</span></div><p class="bio">${esc(t('deanBio'))}</p><p class="fine"><a class="link" href="${SM.page || LINKS.science}" target="_blank" rel="noopener">${esc(c('opensAum'))}</a></p></div>
      </div>
      <div class="dean rv d1">
        ${portrait(SM.head, lang === 'ar' ? 'و' : 'WA')}
        <div><span class="kicker">${esc(t('headKicker'))}</span><div class="who"><b>${esc(t('headName'))}</b><span>${esc(t('headRole'))}</span></div><p class="bio">${esc(t('headBio'))}</p>${hl}</div>
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
      <div>${video}<p class="fine light">${esc(t('videoNote'))}</p></div>
      <div class="labs">${labs}</div>
    </div>
  </div>
</section>
${news ? `<section class="section" id="news">
  <div class="wrap">
    <div class="row-head rv"><div><span class="kicker">${esc(t('newsKicker'))}</span><h2>${esc(t('newsTitle'))}</h2></div><a class="btn btn-ghost" href="${SM.page || LINKS.news}" target="_blank" rel="noopener">${esc(c('viewAll'))} <span class="arr">→</span></a></div>
    <div class="cards">${news}</div>
  </div>
</section>` : ''}
${gallery ? `<section class="section tint">
  <div class="wrap">
    ${head(ctx, t('galKicker'), t('galTitle'))}
    <div class="gallery collage">${gallery}</div>
  </div>
</section>` : ''}
${people ? `<section class="section">
  <div class="wrap">
    ${head(ctx, t('staffKicker'), t('staffTitle'), t('staffLead'))}
    <div class="people">${people}</div>
  </div>
</section>` : ''}
<section class="section tint">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('careersKicker'))}</span><h2>${esc(t('careersTitle'))}</h2><p class="lead">${esc(t('careersLead'))}</p><div class="pills">${careers}</div></div>
    <a class="tile rv d1" href="${SM.page || LINKS.science}" target="_blank" rel="noopener">${icon('book')}<h3>${esc(t('offT'))}</h3><p>${esc(t('offD'))}</p><span class="link">${esc(c('opensAum'))}</span></a>
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
<section class="section tint" id="plan">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('planKicker'))}</span><h2>${esc(t('planTitle'))}</h2><p class="lead">${esc(t('planLead'))}</p><div class="hero-cta"><a class="btn" href="${R}plans/${p.plan}.html">${esc(t('planCta'))} <span class="arr">→</span></a><a class="btn btn-ghost" href="${LINKS.courseFinder}" target="_blank" rel="noopener">${esc(t('planFinder'))}</a></div><p class="finder-note">${esc(c('studyPlanNote'))}</p></div>
    <div class="steps rv d1 compact">${[1, 2, 3].map((i) => `<div class="step"><h3>${esc(t('ps' + i + 'T'))}</h3><p>${esc(t('ps' + i + 'D'))}</p></div>`).join('')}</div>
  </div>
  <div class="wrap">${PLANS[p.plan] ? planVersions(ctx, PLANS[p.plan].guidance, 'guidance', true) : ''}</div>
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
    ${(M.science && M.science.gallery && has(M.science.gallery[0].file)) ? `<a class="photo-link rv d1" href="${M.science.gallery[0].url}" target="_blank" rel="noopener"><img src="${mp(R, M.science.gallery[0].file)}" alt="${esc(S.science.fieldCap[lang])}" loading="lazy"><span>${esc(S.science.fieldCap[lang])}</span></a>` : `<div class="photo gold rv d1"><div class="tesserae" data-count="60"></div><p class="note">${esc(S.science.photoNote[lang])}</p></div>`}
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    <div class="cta rv"><div><span class="kicker">${esc(t('applyKicker'))}</span><h2>${esc(t('applyTitle'))}</h2><p>${esc(t('applyLead'))}</p></div><div class="actions"><a class="btn btn-light" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))} <span class="arr">→</span></a><a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="${R + PAGES.science}">${esc(t('backToFaculty'))}</a></div></div>
  </div>
</section>`;
}

/* ---------- study plans (copied from AUM's department pages) ---------- */
const planId = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function planBlock(ctx, b) {
  const { T } = ctx;
  if (b[0] === 't') return `<p class="plan-text${(/semester|credit hours?$/i.test(b[1]) && b[1].length < 70) ? ' plan-sem' : ''}">${esc(b[1])}</p>`;
  const [, headers, rows] = b;
  const nCols = headers.length;
  const isNum = (i) => /cr|hours|credit/i.test(headers[i] || '') && !/course|title|name/i.test(headers[i] || '');
  const th = headers.map((h, i) => `<th${isNum(i) ? ' class="num"' : ''}>${esc(h)}</th>`).join('');
  const tr = rows.map((r) => {
    const total = /total/i.test(r[0] + ' ' + (r[1] || '')) && !r[0].match(/^\d{5,}/);
    return `<tr${total ? ' class="total"' : ''}>${r.slice(0, nCols).map((v, i) => `<td${isNum(i) ? ' class="num"' : ''}>${esc(v || (i === 0 ? '' : '—'))}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="tablewrap plan-table"><table dir="ltr" data-cols="${nCols}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}
function planSections(ctx, plan, kind) {
  // guidance plans: one <details> per year, open by default; study plans: one per requirement group
  return plan.sections.map((sec, i) => {
    const body = sec.blocks.map((b) => planBlock(ctx, b)).join('');
    const credits = (sec.title.match(/(\d+)\s*credit/i) || [])[1];
    return `<details class="plan-sec"${kind === 'guidance' || i === 0 ? ' open' : ''}><summary><span class="plan-n">${i + 1}</span><span class="plan-sec-title">${esc(sec.title.replace(/:\s*\d+\s*credit hours?/i, ''))}</span>${credits ? `<span class="chip gold">${esc(credits)} ${esc(ctx.c('credits'))}</span>` : ''}</summary><div class="plan-sec-body">${body}</div></details>`;
  }).join('');
}
function planVersions(ctx, plans, kind, compact) {
  const { T } = ctx;
  if (!plans.length) return `<p class="empty" style="text-align:start">${esc(T('plans', 'noGuidance'))}</p>`;
  const id = kind + '-' + Math.random().toString(36).slice(2, 7);
  const tabs = plans.length > 1 ? `<div class="plan-versions" role="tablist" aria-label="${esc(T('plans', 'version'))}">${plans.map((p, i) => `<button type="button" role="tab" class="${i ? '' : 'on'}" aria-selected="${i ? 'false' : 'true'}" data-ver="${id}-${i}">${esc(p.label.replace(/^Course Curriculum\s*/i, '').replace(/^\(([^)]*)\):\s*/, '$1: '))}</button>`).join('')}</div>` : '';
  const panels = plans.map((p, i) => `<div class="plan-ver" id="${id}-${i}"${i ? ' hidden' : ''}>${planSections(ctx, p, kind)}</div>`).join('');
  return `<div class="plan rv${compact ? ' compact' : ''}">${tabs}${panels}<p class="finder-note plan-legend">${esc(T('plans', 'legend'))}</p></div>`;
}
function planPage(ctx, slug) {
  const { R, t, c, lang, T } = ctx; const P = PLANS[slug];
  const prog = D.programmes.find((p) => p.plan === slug);
  const fac = D.faculties.find((f) => f.id === P.faculty);
  const name = prog ? (prog[lang] || prog.en) : P.department;
  const credits = (P.guidance[0] && P.guidance[0].credits) || (P.study[0] && P.study[0].credits) || (prog && prog.credits) || '';
  const facts = [credits ? `<span class="chip gold">${esc(credits)} ${esc(c('credits'))}</span>` : '', `<span class="chip">${esc(prog ? c(prog.level) : c('bachelor'))}</span>`, `<span class="chip">${esc(fac ? fac[lang] : '')}</span>`].join('');
  const links = [`<a class="btn btn-ghost" href="${P.source}" target="_blank" rel="noopener">${esc(t('official'))} ↗</a>`, prog && prog.page ? `<a class="btn btn-ghost" href="${R + prog.page}">${esc(t('programmePage'))}</a>` : '', `<a class="btn btn-ghost" href="${R + PAGES.plans}">${esc(t('back'))}</a>`].join('');
  return `
${phero(ctx, `${t('pageTitle')} · ${fac ? fac[lang] : ''}`, name, t('pageLead'))}
<section class="section" id="guidance">
  <div class="wrap">
    <div class="plan-top rv"><div class="pills">${facts}</div><div class="hero-cta">${links}</div></div>
    <p class="finder-note plan-note rv">${esc(c('studyPlanNote'))}</p>
    ${head(ctx, t('kicker'), t('guidanceT'), t('guidanceD'))}
    ${planVersions(ctx, P.guidance, 'guidance')}
  </div>
</section>
<section class="section tint" id="study">
  <div class="wrap">
    ${head(ctx, t('kicker'), t('studyT'), t('studyD'))}
    ${planVersions(ctx, P.study, 'study')}
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${head(ctx, '', t('tipsKicker'), '')}
    <div class="steps compact rv">${[1, 2, 3].map((i) => `<div class="step"><h3>${esc(t('tip' + i + 'T'))}</h3><p>${esc(t('tip' + i + 'D'))}</p></div>`).join('')}</div>
    <p class="rv d1" style="margin-top:22px"><a class="btn" href="${LINKS.calendar}" target="_blank" rel="noopener">${esc(c('toolCalendar'))} ↗</a> <a class="btn btn-ghost" href="${LINKS.registration}" target="_blank" rel="noopener">${esc(c('toolRegistration'))} ↗</a></p>
  </div>
</section>
${applyCta(ctx)}`;
}
function plans(ctx) {
  const { R, t, c, lang } = ctx;
  const blocks = D.faculties.map((f) => {
    const items = Object.values(PLANS).filter((P) => P.faculty === f.id).map((P) => {
      const prog = D.programmes.find((p) => p.plan === P.slug);
      const name = prog ? (prog[lang] || prog.en) : P.department;
      const credits = (P.guidance[0] && P.guidance[0].credits) || (P.study[0] && P.study[0].credits) || '';
      return `<a class="pcard plan-card" href="${R}plans/${P.slug}.html"><span class="fac">${esc(prog ? c(prog.level) : c('bachelor'))}</span><h3>${esc(name)}</h3><div class="meta">${credits ? `<span class="chip gold">${esc(credits)} ${esc(c('credits'))}</span>` : ''}${P.guidance.length ? `<span class="chip">${esc(t('guidanceT'))}</span>` : ''}</div><span class="go" aria-hidden="true">→</span></a>`;
    }).join('');
    if (!items) return '';
    const n = Object.values(PLANS).filter((P) => P.faculty === f.id).length;
    return `<details class="facblock rv" id="${f.id}"><summary class="facblock-head">${icon(facultyIcon[f.id])}<div><h3>${esc(f[lang])}</h3><span class="fac-meta">${n} ${esc(S.academics.programmesN[lang])}</span></div></summary><div class="facblock-body"><div class="plist compact">${items}</div></div></details>`;
  }).join('');
  const findex = `<div class="facindex rv"><span class="kicker">${esc(S.academics.indexKicker[lang])}</span><div class="fchips">${D.faculties.map((f) => `<a class="fchip" href="#${f.id}">${esc(f[lang])}</a>`).join('')}</div></div>`;
  return `
${phero(ctx, t('kicker'), t('h1'), t('lead'))}
<section class="section">
  <div class="wrap">
    ${findex}
    <p class="finder-note plan-note rv">${esc(t('indexNote'))}</p>
    ${blocks}
  </div>
</section>
${applyCta(ctx)}`;
}

function admissions(ctx) {
  const { R, t, c, lang } = ctx;
  const steps = [1, 2, 3, 4].map((i) => `<li class="rstep rv d${i - 1}"><span class="rstep-n"><span>${String(i).padStart(2, '0')}</span></span><div><h3>${esc(t('s' + i + 'T'))}</h3><p>${esc(t('s' + i + 'D'))}</p>${i === 1 ? `<a class="link" href="${R}index.html#finder">${esc(c('findProgramme'))} <span class="arr">→</span></a>` : ''}${i === 2 ? `<a class="link" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))} <span class="arr">↗</span></a>` : ''}${i === 4 ? `<a class="link" href="${R + PAGES.life}#bus">${esc(S.home.lifeBusT[lang])} <span class="arr">→</span></a>` : ''}</div></li>`).join('');
  const poster = (M.events || []).find((e) => /openday/.test(e.file || '') && has(e.file));
  return `
${pheroPhoto(ctx, t('kicker'), t('h1'), t('lead'), M.admissionsHero, t('heroAlt'))}
<section class="section" id="route">
  <div class="wrap route">
    <div>
      ${head(ctx, t('routeKicker'), t('routeTitle'))}
      <ol class="route-steps">${steps}</ol>
    </div>
    <aside class="route-side">
      <div class="apply-card rv d1"><div class="tesserae" data-count="18" aria-hidden="true"></div>${icon('send')}<h3>${esc(t('applyCardT'))}</h3><p>${esc(t('applyCardD'))}</p><a class="btn" href="${LINKS.apply}" target="_blank" rel="noopener">${esc(c('apply'))} <span class="arr">→</span></a><p class="small">${esc(t('applyCardHours'))}</p><a class="link" href="${LINKS.tel}">${esc(c('phone'))}</a></div>
      <a class="openday rv d2" href="${LINKS.events}" target="_blank" rel="noopener">${poster ? `<img src="${mp(R, poster.file)}" alt="${esc(t('openAlt'))}" loading="lazy">` : ''}<span><span class="kicker">${esc(t('openKicker'))}</span><b>${esc(t('openTitle'))}</b><p>${esc(t('openLead'))}</p><span class="link">${esc(t('openCta'))} <span class="arr">↗</span></span></span></a>
    </aside>
  </div>
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
  const { R, t, c, lang } = ctx;
  const rows = [['rAmman', 250], ['rFuhais', 250], ['rZarqa', 250], ['rKarak', 250], ['rMadaba', 160]]
    .map(([k, fee]) => `<tr><td><b>${esc(t(k))}</b></td><td class="num">${fee}</td></tr>`).join('');
  const kinds = { 1: 'clubs', 2: 'clubs', 3: 'clubs', 4: 'sport', 5: 'sport', 6: 'sport', 7: 'comm', 8: 'comm', 9: 'sport' };
  const clubs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<span class="pill" data-kind="${kinds[i]}">${esc(t('cl' + i))}</span>`).join('');
  const kindChips = [['', 'filtAll'], ['clubs', 'filtClubs'], ['sport', 'filtSport'], ['comm', 'filtComm']].map(([k, key], i) => `<button type="button" class="fchip${i ? '' : ' on'}" data-kind="${k}">${esc(t(key))}</button>`).join('');
  const stripFiles = (M.lifeStrip && (M.lifeStrip.files || []).filter(has)) || [];
  const stripImgs = stripFiles.map((f) => `<a href="${M.lifeStrip.url}" target="_blank" rel="noopener" tabindex="-1"><img src="${mp(R, f)}" alt="" loading="lazy"></a>`).join('');
  const strip = stripFiles.length ? `<section class="strip-band" data-aud="new" aria-label="${esc(t('stripLabel'))}"><div class="strip"><div class="strip-track">${stripImgs}${stripImgs}</div></div><div class="wrap strip-cap"><span class="kicker">${esc(t('stripLabel'))}</span><a class="link" href="${M.lifeStrip.url}" target="_blank" rel="noopener">${esc(t('stripCta'))} <span class="arr">↗</span></a></div></section>` : '';
  const facts = [1, 2, 3, 4].map((i) => `<div class="stat"><b>${esc(t('f' + i + 'N'))}</b><span>${esc(t('f' + i))}</span></div>`).join('');
  const sportPics = (M.sport && (M.sport.files || []).filter(has)) || [];
  const sport = sportPics.length ? `<div class="gallery collage rv d1">${sportPics.map((f) => `<a href="${M.sport.url}" target="_blank" rel="noopener"><img src="${mp(R, f)}" alt="${esc(t('stripLabel'))}" loading="lazy"></a>`).join('')}</div>` : `<div class="photo olive rv d1"><div class="tesserae" data-count="60"></div><p class="note">${esc(S.science.photoNote[lang])}</p></div>`;
  const health = M.health && has(M.health.file) ? `<a class="photo-link rv d1" href="${LINKS.health}" target="_blank" rel="noopener"><img src="${mp(R, M.health.file)}" alt="${esc(t('healthAlt'))}" loading="lazy"><span>${esc(t('healthAlt'))}</span></a>` : '';
  return `
${pheroPhoto(ctx, t('kicker'), t('h1'), t('lead'), M.lifeHero, t('heroAlt'))}
${audBar(ctx)}
${lifeWeek(ctx)}
${lifeStart(ctx)}
${strip}
<section class="stats life-stats"><div class="wrap"><div class="stats-kicker kicker">${esc(t('dayKicker'))}</div><div class="stats-grid">${facts}</div></div></section>
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
<section class="section tint" id="housing" data-aud="new">
  <div class="wrap">
    ${head(ctx, t('housingKicker'), t('housingTitle'))}
    <div class="grid c2">
      <div class="tile rv">${icon('home')}<h3>${esc(lang === 'ar' ? 'للطالبات' : 'For women')}</h3><p>${esc(t('housingW'))}</p><span class="chip gold">${esc(t('housingFacts'))}</span><a class="link" href="${LINKS.housing}" target="_blank" rel="noopener">${esc(t('housingApply'))}</a></div>
      <div class="tile rv d1">${icon('pin')}<h3>${esc(lang === 'ar' ? 'للطلاب والطلبة الدوليين' : 'For men and international students')}</h3><p>${esc(t('housingM'))}</p><a class="link" href="${LINKS.intl}" target="_blank" rel="noopener">${esc(t('intlCta'))}</a></div>
    </div>
  </div>
</section>
<section class="section" id="clubs">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('sportKicker'))}</span><h2>${esc(t('sportTitle'))}</h2><p class="lead">${esc(t('sportLead'))}</p><p class="finder-note">${esc(t('clubsLead'))}</p><div class="fchips kind-chips" id="kind-chips">${kindChips}</div><div class="pills" id="club-pills">${clubs}</div><p style="margin-top:18px"><a class="link" href="${LINKS.studentAffairs}" target="_blank" rel="noopener">${esc(S.tools.t_studentAffairs[lang])} <span class="arr">↗</span></a></p></div>
    ${sport}
  </div>
</section>
<section class="section tint" id="health">
  <div class="wrap two">
    <div class="rv"><span class="kicker">${esc(t('healthKicker'))}</span><h2>${esc(t('healthTitle'))}</h2><p class="lead">${esc(t('healthLead'))}</p><p class="finder-note">${esc(t('healthHours'))}</p><a class="link" href="${LINKS.health}" target="_blank" rel="noopener">${esc(c('opensAum'))}</a></div>
    ${health}
  </div>
</section>
<section class="section" id="support" data-aud="current">
  <div class="wrap">
    <div class="grid c4">
      <a class="tile rv" href="${LINKS.studentAffairs}" target="_blank" rel="noopener">${icon('languages')}<h3>${esc(t('langT'))}</h3><p>${esc(t('langD'))}</p></a>
      <a class="tile rv d1" href="${LINKS.alumni}" target="_blank" rel="noopener">${icon('user')}<h3>${esc(t('careerT'))}</h3><p>${esc(t('careerD'))}</p></a>
      <a class="tile rv d2" href="${LINKS.abroad}" target="_blank" rel="noopener">${icon('intl')}<h3>${esc(t('abroadT'))}</h3><p>${esc(t('abroadD'))}</p></a>
      <a class="tile rv d3" href="${LINKS.studentAffairs}" target="_blank" rel="noopener">${icon('clubs')}<h3>${esc(S.tools.t_studentAffairs[lang])}</h3><p>${esc(S.tools.d_studentAffairs[lang])}</p></a>
    </div>
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

const BUILDERS = { home, academics, science, biotech, admissions, life, about, tools, plans, notfound };

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
  // one page per department study plan: plans/<slug>.html (EN) and ar/plans/<slug>.html (AR)
  for (const slug of Object.keys(PLANS)) {
    const sec = S.plans; const R2 = R + '../';
    const prog = D.programmes.find((p) => p.plan === slug);
    const name = prog ? (prog[lang] || prog.en) : PLANS[slug].department;
    const ctx = {
      lang, R: R2, file: `plans/${slug}.html`,
      title: `${name} · ${sec.pageTitle[lang]} | ${S.common.siteName[lang]}`,
      description: `${name}: ${sec.guidanceD[lang]}`,
      t: (k) => { const v = (sec[k] || S.common[k]); if (!v) throw new Error(`missing string plans.${k}`); return v[lang] || v.en; },
      c: (k) => { const v = S.common[k]; if (!v) throw new Error(`missing common string ${k}`); return v[lang] || v.en; },
      T: (s, k) => { const v = S[s] && S[s][k]; if (!v) throw new Error(`missing string ${s}.${k}`); return v[lang] || v.en; }
    };
    PH = ctx.c('photoSlot');
    const html = shell(ctx, 'plans', planPage(ctx, slug));
    const out = join(ROOT, lang === 'ar' ? 'ar' : '', 'plans', `${slug}.html`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    n++;
  }
}
console.log(`built ${n} pages`);
