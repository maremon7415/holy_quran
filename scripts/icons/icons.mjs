// Noor Quran icon set: hand-authored SVG sources (viewBox 0 0 64 64).
// Style: duotone "illuminated manuscript" - emerald body, gold accents, ivory paper,
// light source top-left, shared stroke grammar.

const f = (n) => +n.toFixed(2);

export const DEFS = `<defs>
<linearGradient id="e" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="58" y2="60"><stop offset="0" stop-color="#34c295"/><stop offset="1" stop-color="#0e6b51"/></linearGradient>
<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="58" y2="60"><stop offset="0" stop-color="#f4d889"/><stop offset="1" stop-color="#c9973a"/></linearGradient>
<linearGradient id="p" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="58" y2="60"><stop offset="0" stop-color="#fffef8"/><stop offset="1" stop-color="#ebe3c8"/></linearGradient>
<linearGradient id="k" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="58" y2="60"><stop offset="0" stop-color="#58636a"/><stop offset="1" stop-color="#151a1d"/></linearGradient>
</defs>`;

const LS = 'stroke="#e6fff3" stroke-opacity=".55" stroke-width="1.3" stroke-linejoin="round"';
const GS = 'stroke="#8a5f12" stroke-opacity=".55" stroke-width="1" stroke-linejoin="round"';
const IS = 'stroke="#0e6b51" stroke-opacity=".75" stroke-width="1.3" stroke-linejoin="round"';
const KS = 'stroke="#d9e4e0" stroke-opacity=".6" stroke-width="1.2" stroke-linejoin="round"';

const e = (s, extra = '') => `<g fill="url(#e)" ${LS} ${extra}>${s}</g>`;
const g = (s, extra = '') => `<g fill="url(#g)" ${GS} ${extra}>${s}</g>`;
const i = (s, extra = '') => `<g fill="url(#p)" ${IS} ${extra}>${s}</g>`;
const k = (s, extra = '') => `<g fill="url(#k)" ${KS} ${extra}>${s}</g>`;
const dk = (s) => `<g fill="#0a4a39" stroke="none">${s}</g>`;
// union outline: stroke underlay then fill on top (no inner seams)
const u = (s, fill = 'e') =>
  `<g fill="none" stroke="#e6fff3" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round">${s}</g><g fill="url(#${fill})">${s}</g>`;
// stroked line / path
const ln = (d, c, w, extra = '') =>
  c === 'e'
    ? `<path d="${d}" fill="none" stroke="#e6fff3" stroke-opacity=".5" stroke-width="${w + 2.2}" stroke-linecap="round" stroke-linejoin="round" ${extra}/><path d="${d}" fill="none" stroke="url(#e)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`
    : c === 'p'
      ? `<path d="${d}" fill="none" stroke="url(#p)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`
      : `<path d="${d}" fill="none" stroke="url(#g)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// 8-point star (Rub el Hizb): two overlapping squares
const star8pts = (cx, cy, R, rot = 0, ratio = 0.76) => {
  const pts = [];
  for (let n = 0; n < 16; n++) {
    const a = ((n * 22.5 + rot - 90) * Math.PI) / 180;
    const r = n % 2 === 0 ? R : R * ratio;
    pts.push(`${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`);
  }
  return pts.join(' ');
};
const S8 = (cx, cy, R, rot = 0, ratio = 0.76) => `<polygon points="${star8pts(cx, cy, R, rot, ratio)}"/>`;
// 4-point spark
const S4 = (cx, cy, r, kk = 0.2) => {
  const q = r * kk;
  return `<path d="M${cx} ${f(cy - r)}Q${f(cx + q)} ${f(cy - q)} ${f(cx + r)} ${cy}Q${f(cx + q)} ${f(cy + q)} ${cx} ${f(cy + r)}Q${f(cx - q)} ${f(cy + q)} ${f(cx - r)} ${cy}Q${f(cx - q)} ${f(cy - q)} ${cx} ${f(cy - r)}Z"/>`;
};
// crescent opening to the right
const crescent = (cx, cy, R, off, r2) => {
  const x = cx + (off * off + R * R - r2 * r2) / (2 * off);
  const h = Math.sqrt(R * R - (x - cx) ** 2);
  const large1 = x > cx ? 1 : 0;
  const large2 = x > cx + off ? 1 : 0;
  return `<path d="M${f(x)} ${f(cy - h)}A${R} ${R} 0 ${large1} 0 ${f(x)} ${f(cy + h)}A${r2} ${r2} 0 ${large2} 1 ${f(x)} ${f(cy - h)}Z"/>`;
};
const circ = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const rect = (x, y, w, h, r = 0, tr = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"${tr ? ` transform="${tr}"` : ''}/>`;
const path = (d) => `<path d="${d}"/>`;
const mirror = (s) => `<g transform="translate(64 0) scale(-1 1)">${s}</g>`;

const bookOpen = (y0, h) => {
  const cover = path(`M5 ${y0}V${y0 + h}Q20 ${y0 + h - 4} 32 ${y0 + h + 2}Q44 ${y0 + h - 4} 59 ${y0 + h}V${y0}Q44 ${y0 - 4} 32 ${y0 + 2}Q20 ${y0 - 4} 5 ${y0}Z`);
  const pl = `M9 ${y0 + 2.5}Q21 ${y0 - 1} 31 ${y0 + 4.5}V${y0 + h - 3}Q21 ${y0 + h - 6.5} 9 ${y0 + h - 3.5}Z`;
  const pr = `M55 ${y0 + 2.5}Q43 ${y0 - 1} 33 ${y0 + 4.5}V${y0 + h - 3}Q43 ${y0 + h - 6.5} 55 ${y0 + h - 3.5}Z`;
  return { cover: e(cover), pages: i(path(pl) + path(pr)) };
};

const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">${DEFS}${body}</svg>`;

const I = {};

I.quran = () => {
  const b = bookOpen(8, 28);
  return (
    ln('M19 59L32 38L45 59', 'g', 4.5) +
    b.cover + b.pages +
    g(S8(20, 22, 6.5)) +
    ln('M38 19H49M38 25H49M38 31H49', 'e', 2.2)
  );
};

I.read = () => {
  const b = bookOpen(14, 36);
  return (
    b.cover + b.pages +
    ln('M13 23Q19 22 26 25M13 30Q19 29 26 32M13 37Q19 36 26 39', 'e', 2.2) +
    g(path('M40 19.5V43L45 38.5L50 43V19Z'))
  );
};

I.listen = () =>
  ln('M11 40V32A21 21 0 0 1 53 32V40', 'g', 5.5) +
  e(rect(5, 34, 14, 22, 6) + rect(45, 34, 14, 22, 6)) +
  g(rect(8.5, 40, 5, 10, 2.5) + rect(50.5, 40, 5, 10, 2.5)) +
  ln('M26 40V50M32 34V56M38 42V48', 'g', 3.6);

I.hifz = () =>
  e(path('M32 57C10 43 5 31 5 22C5 13 12 7 20 7C25 7 29.5 10 32 14.5C34.5 10 39 7 44 7C52 7 59 13 59 22C59 31 54 43 32 57Z')) +
  dk(circ(32, 29, 14.5)) +
  g(S8(32, 29, 12.5)) +
  e(S8(32, 29, 5.5, 22.5)) +
  g(S4(55, 8, 5, 0.25));

I.tafsir = () =>
  e(rect(6, 6, 38, 50, 6)) +
  g(rect(6, 6, 9, 50, 4)) +
  i(rect(19, 11, 21, 40, 3)) +
  g(S8(29.5, 24, 6.5)) +
  ln('M22 37H37M22 43H33', 'e', 2.2) +
  `<circle cx="42" cy="40" r="12" fill="#fffdf4" fill-opacity=".38" stroke="url(#g)" stroke-width="5.5"/>` +
  ln('M51 49L58 57', 'g', 6.5);

const hand = () => {
  const fing = [[13.5, 14, 24], [18.3, 8, 30], [23.1, 10, 28], [27.9, 17, 21]]
    .map(([x, y, h]) => rect(x, y, 4.4, h + 14, 2.2))
    .join('');
  return (
    `<g transform="translate(-3 -1) rotate(-20 34 58)">` +
    e(fing) +
    e(rect(12.5, 33, 21, 25, 8)) +
    e(rect(31, 38, 4.6, 14, 2.3, 'rotate(-30 33 50)')) +
    `</g>`
  );
};
I.dua = () => hand() + mirror(hand()) + g(S4(32, 14, 7, 0.22));

I.names = () =>
  g(S8(32, 32, 29)) +
  dk(S8(32, 32, 22.5, 22.5, 0.8)) +
  e(S8(32, 32, 20, 22.5, 0.8)) +
  `<circle cx="32" cy="32" r="11.5" fill="none" stroke="url(#g)" stroke-width="2"/>` +
  g(circ(32, 32, 5)) +
  g([0, 1, 2, 3, 4, 5, 6, 7].map((n) => circ(f(32 + 15.5 * Math.cos((n * 45 * Math.PI) / 180)), f(32 + 15.5 * Math.sin((n * 45 * Math.PI) / 180)), 1.3)).join(''));

I.topics = () =>
  g(rect(14, 5, 42, 28, 6, 'rotate(9 35 19)')) +
  e(rect(7, 14, 42, 30, 6, 'rotate(-4 28 29)')) +
  i(rect(8, 28, 44, 28, 6)) +
  g(S8(20, 42, 6)) +
  ln('M31 38H45M31 46H42', 'e', 2.4);

I.prayer = () =>
  ln('M17 57V61M23 57V61M29 57V61M35 57V61M41 57V61M47 57V61', 'g', 2) +
  ln('M17 3V7M23 3V7M29 3V7M35 3V7M41 3V7M47 3V7', 'g', 2) +
  e(rect(10, 7, 44, 50, 5)) +
  g(path('M18 51V30Q18 18 32 12Q46 18 46 30V51Z')) +
  e(path('M23.5 51V31.5Q23.5 23 32 19.5Q40.5 23 40.5 31.5V51Z')) +
  g(S8(32, 36, 5.5));

I.qibla = () =>
  `<circle cx="32" cy="32" r="27" fill="url(#e)" stroke="url(#g)" stroke-width="3.5"/>` +
  ln('M32 9V13M32 51V55M9 32H13M51 32H55', 'p', 2.2) +
  `<g transform="rotate(32 32 32)">` +
  g(path('M32 9L38.5 32H25.5Z')) +
  i(path('M32 55L38.5 32H25.5Z')) +
  `</g>` +
  k(rect(25.5, 25.5, 13, 13, 2)) +
  g(rect(25.5, 30, 13, 2.8, 0));

I.calendar = () =>
  i(rect(7, 11, 50, 47, 7)) +
  e(path('M7 18Q7 11 14 11H50Q57 11 57 18V25H7Z')) +
  g(rect(18, 5, 6, 13, 3) + rect(40, 5, 6, 13, 3)) +
  g(crescent(29, 41, 11, 5.5, 9.3)) +
  g(S4(43, 38, 5.5, 0.25));

I.tasbih = () => {
  const beads = [];
  const n = 11;
  for (let j = 0; j < n; j++) {
    const a = ((-90 + 22 + (j * (360 - 44)) / (n - 1)) * Math.PI) / 180;
    const cx = f(32 + 21 * Math.cos(a));
    const cy = f(26 + 21 * Math.sin(a) - 1);
    beads.push(j % 2 ? g(circ(cx, cy, 5.2)) : e(circ(cx, cy, 5.2)));
  }
  return (
    beads.join('') +
    ln('M32 50V54', 'g', 3) +
    e(circ(32, 51, 4.6)) +
    g(path('M32 55L36.5 62H27.5Z')) +
    `<path d="M24 5.5Q32 2.5 40 5.5" fill="none" stroke="#fff" stroke-opacity="0" />`
  );
};

I.bookmark = () =>
  e(path('M14 5H50V59L32 45L14 59Z')) +
  g(path('M14 5H50V12H14Z')) +
  g(S8(32, 27, 9)) +
  e(S8(32, 27, 4, 22.5)) +
  ln('M20 40Q32 46 44 40', 'g', 2);

I.journey = () =>
  ln('M10 55C34 55 14 38 33 36C52 34 36 22 46 17', 'e', 6.5) +
  `<path d="M10 55C34 55 14 38 33 36C52 34 36 22 46 17" fill="none" stroke="url(#p)" stroke-width="1.6" stroke-dasharray="1 4" stroke-linecap="round"/>` +
  g(circ(10, 55, 5)) +
  g(circ(33, 36, 4.4)) +
  ln('M46 17V4', 'g', 3) +
  g(path('M47 4L60 9L47 15Z'));

I.search = () =>
  `<circle cx="27" cy="27" r="17" fill="#bff3de" fill-opacity=".45" stroke="#e6fff3" stroke-opacity=".5" stroke-width="9"/>` +
  `<circle cx="27" cy="27" r="17" fill="none" stroke="url(#e)" stroke-width="6.5"/>` +
  ln('M40 40L56 56', 'g', 7.5) +
  g(S4(21, 20, 8, 0.2));

I.settings = () => {
  const teeth = [0, 1, 2, 3, 4, 5, 6, 7].map((n) => rect(27, 2.5, 10, 12, 2.5, `rotate(${n * 45} 32 32)`)).join('');
  return (
    u(teeth + circ(32, 32, 21)) +
    dk(circ(32, 32, 13)) +
    g(S8(32, 32, 11)) +
    e(circ(32, 32, 4))
  );
};

I.home = () =>
  e(path('M10 58V29L32 10L54 29V58Z')) +
  ln('M5 31L32 7L59 31', 'g', 4.5) +
  g(path('M22 58V40Q22 30 32 30Q42 30 42 40V58Z')) +
  dk(path('M26.5 58V41Q26.5 34.5 32 34.5Q37.5 34.5 37.5 41V58Z')) +
  g(S8(32, 22, 4.2));

I.mosque = () =>
  ln('M24 7V15', 'g', 2.4) +
  g(circ(24, 6.5, 2.4)) +
  e(path('M8 46C8 31 16 22 24 15C32 22 40 31 40 46Z')) +
  e(rect(5, 44, 38, 14, 3)) +
  g(path('M19 58V50Q19 45 24 45Q29 45 29 50V58Z')) +
  g(path('M46 25H56V58H46Z')) +
  e(path('M45 25H57L51 11Z')) +
  g(circ(51, 8, 2.4)) +
  dk(rect(49.5, 33, 3, 6, 1.5));

I.crescent = () => g(crescent(29, 32, 25, 10, 21)) + e(S8(44, 32, 8.5)) + g(circ(44, 32, 2.4));

I.share = () =>
  ln('M16 32L47 14M16 32L47 50', 'g', 4.2) +
  e(circ(16, 32, 9.5)) +
  g(circ(47, 13, 9)) +
  e(circ(47, 51, 9)) +
  i(circ(16, 32, 3)) ;

I.sparkle = () =>
  g(S4(27, 35, 26, 0.3)) +
  e(S4(50, 14, 11, 0.28)) +
  i(S4(52, 47, 7, 0.28)) +
  e(S4(12, 11, 5.5, 0.28));

I.heart = () =>
  e(path('M32 57C10 43 5 31 5 22C5 13 12 7 20 7C25 7 29.5 10 32 14.5C34.5 10 39 7 44 7C52 7 59 13 59 22C59 31 54 43 32 57Z')) +
  `<path d="M13 23C13 17 16.5 13.5 21 13.5" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>` +
  g(S4(44, 24, 7.5, 0.24));

I.khatam = () =>
  ln('M9 52C2 40 4 24 14 12', 'g', 3) +
  ln('M55 52C62 40 60 24 50 12', 'g', 3) +
  g(path('M7 36Q11 38 11 42Q7 42 7 36ZM6 25Q10 27 10 31Q6 31 6 25ZM10 15Q14 17 13.5 20.5Q10 20 10 15Z')) +
  g(mirror(path('M7 36Q11 38 11 42Q7 42 7 36ZM6 25Q10 27 10 31Q6 31 6 25ZM10 15Q14 17 13.5 20.5Q10 20 10 15Z'))) +
  e(rect(16, 8, 32, 44, 5)) +
  g(rect(16, 8, 8, 44, 4)) +
  g(S8(37, 21, 6)) +
  `<circle cx="42" cy="43" r="14" fill="url(#g)" stroke="#fffaf0" stroke-width="2.4"/>` +
  `<path d="M35 43L40.5 48.5L50 37.5" fill="none" stroke="#0a4a39" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

I.kaaba = () =>
  `<g stroke-linejoin="round">` +
  k(path('M6 22L40 22L40 58L6 58Z')) +
  `<path d="M40 22L58 13V49L40 58Z" fill="#1b2125" stroke="#d9e4e0" stroke-opacity=".6" stroke-width="1.2"/>` +
  `<path d="M6 22L24 13H58L40 22Z" fill="#79868c" stroke="#d9e4e0" stroke-opacity=".6" stroke-width="1.2"/>` +
  g(path('M6 31H40V37H6Z')) +
  g(path('M40 31L58 22V28L40 37Z')) +
  g(path('M25 58V45Q25 41 29 41Q33 41 33 45V58Z')) +
  `</g>`;

I.lantern = () =>
  `<circle cx="32" cy="5.5" r="3" fill="none" stroke="url(#g)" stroke-width="2.2"/>` +
  g(path('M25 9H39L43 17H21Z')) +
  e(path('M20 17H44L50 28V42L44 53H20L14 42V28Z')) +
  g(path('M24 21H40L45 29V41L40 49H24L19 41V29Z')) +
  ln('M32 21V49M19 35H45', 'e', 2) +
  e(S8(32, 35, 6.5)) +
  g(path('M20 53H44L40 59H24Z')) +
  g(path('M20 17H44L45 21H19Z'));

I.hands = () => {
  const bowl = path('M4 36Q6 55 32 58Q58 55 60 36Q47 46 32 46Q17 46 4 36Z');
  return (
    ln('M32 4V6M14 12L16 14M50 12L48 14M8 27H10M54 27H56', 'g', 2.2) +
    g(S8(32, 27, 13)) +
    i(circ(32, 27, 4.2)) +
    e(bowl) +
    ln('M16 46Q32 52 48 46', 'p', 1.6, 'stroke-opacity=".8"')
  );
};

I.clock = () =>
  e(path('M7 58V30C7 15 18 5 32 5C46 5 57 15 57 30V58Z')) +
  `<circle cx="32" cy="35" r="19" fill="url(#p)" stroke="url(#g)" stroke-width="3.5"/>` +
  ln('M32 21.5V35L41 41', 'e', 3.4) +
  g(circ(32, 35, 2.8)) +
  `<path d="M32 18.5V20.5M32 49.5V51.5M15.5 35H17.5M46.5 35H48.5" stroke="#0e6b51" stroke-width="1.6" stroke-linecap="round"/>`;

I.chart = () =>
  e(path('M6 58V30C6 15 17 4 32 4C47 4 58 15 58 30V58Z')) +
  g(rect(14, 38, 9, 16, 2.5) + rect(27.5, 28, 9, 26, 2.5) + rect(41, 18, 9, 36, 2.5)) +
  ln('M12 56.5H52', 'p', 1.6);

I.streak = () =>
  g(path('M33 3C34 17 51 23 51 40C51 53 43 61 32 61C21 61 13 53 13 41C13 33 17 28 22 23C22 30 25 33 28.5 33C26 22 28 11 33 3Z')) +
  e(path('M32 29C34 38 41 40 41 48C41 55 37 58 32 58C27 58 23 55 23 48C23 43 27 41 29 36C30 34 31 32 32 29Z')) +
  `<path d="M28 50C28 47 30 46 31 44" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`;

I.juz = () => {
  let segs = '';
  for (let n = 0; n < 30; n++) {
    const done = n < 18;
    const a = n * 12;
    segs += `<rect x="29.9" y="2.5" width="4.2" height="10" rx="1.7" transform="rotate(${a} 32 32)" fill="url(#${done ? 'g' : 'e'})" ${done ? GS : LS}/>`;
  }
  return (
    segs +
    dk(circ(32, 32, 17)) +
    e(S8(32, 32, 15, 0, 0.78)) +
    g(S8(32, 32, 8.5, 22.5)) +
    e(circ(32, 32, 3))
  );
};

I.play = () =>
  `<circle cx="32" cy="32" r="27" fill="url(#e)" stroke="url(#g)" stroke-width="3.5"/>` +
  `<path d="M26 20.5L45 32L26 43.5Z" fill="url(#g)" stroke="url(#g)" stroke-width="4" stroke-linejoin="round"/>`;

I.mic = () =>
  e(rect(21, 4, 22, 35, 11)) +
  ln('M27 14H37M27 20H37M27 26H37', 'g', 2.4) +
  ln('M13 30A19 19 0 0 0 51 30', 'g', 4.2) +
  ln('M32 49V57M22 58H42', 'g', 4.2);

I.moon = () =>
  e(crescent(28, 33, 25, 12, 21.5)) +
  g(S4(50, 13, 9, 0.25)) +
  g(S4(55, 33, 5, 0.25)) +
  i(S4(40, 55, 4.5, 0.25));

I.sun = () => {
  const rays = [0, 1, 2, 3, 4, 5, 6, 7]
    .map((n) => {
      const a = (n * 45 * Math.PI) / 180;
      const r1 = 21;
      const r2 = n % 2 ? 26 : 29;
      return `M${f(32 + r1 * Math.cos(a))} ${f(32 + r1 * Math.sin(a))}L${f(32 + r2 * Math.cos(a))} ${f(32 + r2 * Math.sin(a))}`;
    })
    .join('');
  return (
    ln(rays, 'g', 4.4) +
    `<circle cx="32" cy="32" r="15.5" fill="url(#g)" stroke="#8a5f12" stroke-opacity=".5" stroke-width="1"/>` +
    e(S8(32, 32, 9.5)) +
    i(circ(32, 32, 2.6))
  );
};

I.language = () =>
  e(path('M10 6H36Q44 6 44 14V26Q44 34 36 34H22L12 42V34Q6 34 6 26V14Q6 6 14 6Z')) +
  i(circ(16, 20, 2.3) + circ(25, 20, 2.3) + circ(34, 20, 2.3)) +
  g(path('M32 25H52Q58 25 58 31V43Q58 49 52 49V57L44 49H32Q26 49 26 43V31Q26 25 32 25Z')) +
  `<g fill="none" stroke="#0a4a39" stroke-width="2"><circle cx="42" cy="37" r="7"/><ellipse cx="42" cy="37" rx="3" ry="7"/><path d="M35 37H49"/></g>`;

I.user = () =>
  e(path('M6 58V30C6 15 17 4 32 4C47 4 58 15 58 30V58Z')) +
  g(circ(32, 26, 9.5)) +
  g(path('M15 58C15 45 23 38 32 38C41 38 49 45 49 58Z'));

I.info = () =>
  `<circle cx="32" cy="32" r="27" fill="url(#e)" stroke="url(#g)" stroke-width="3.5"/>` +
  g(circ(32, 19.5, 4)) +
  g(rect(27.8, 27.5, 8.4, 20, 4));

I.note = () =>
  i(rect(7, 8, 40, 50, 6)) +
  e(path('M7 14Q7 8 13 8H41Q47 8 47 14V19H7Z')) +
  g(circ(17, 8, 3) + circ(27, 8, 3) + circ(37, 8, 3)) +
  ln('M14 28H40M14 35H40M14 42H30', 'e', 2.4) +
  `<g transform="rotate(38 49 38)">` +
  g(rect(44.5, 14, 9, 30, 3)) +
  e(path('M44.5 44H53.5L49 55Z')) +
  `</g>`;

I.copy = () =>
  e(rect(22, 5, 35, 43, 6)) +
  i(rect(7, 16, 35, 43, 6)) +
  ln('M14 28H35M14 36H35M14 44H27', 'e', 2.4) +
  g(S4(49, 17, 6, 0.25));

I.image = () =>
  g(rect(4, 7, 56, 50, 8)) +
  e(rect(10, 13, 44, 38, 4)) +
  i(path('M10 45L24 28L34 40L40 33L54 47V47Q54 51 50 51H14Q10 51 10 47Z')) +
  g(circ(42, 23, 5));

I.focus = () =>
  ln('M5 19V11Q5 5 11 5H19M45 5H53Q59 5 59 11V19M59 45V53Q59 59 53 59H45M19 59H11Q5 59 5 53V45', 'g', 4.4) +
  i(path('M11 32Q32 11 53 32Q32 53 11 32Z')) +
  e(circ(32, 32, 9.5)) +
  dk(circ(32, 32, 3.6)) +
  `<circle cx="29.2" cy="29.2" r="1.7" fill="#fff" fill-opacity=".85"/>`;

I.repeat = () => {
  const head = (deg, color) => {
    const a = (deg * Math.PI) / 180;
    const px = 32 + 20 * Math.cos(a);
    const py = 32 + 20 * Math.sin(a);
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const tip = [px + tx * 9, py + ty * 9];
    const b1 = [px - nx * 8.5 - tx * 1, py - ny * 8.5 - ty * 1];
    const b2 = [px + nx * 8.5 - tx * 1, py + ny * 8.5 - ty * 1];
    const d = `M${f(tip[0])} ${f(tip[1])}L${f(b1[0])} ${f(b1[1])}L${f(b2[0])} ${f(b2[1])}Z`;
    return color === 'e' ? e(path(d)) : g(path(d));
  };
  return (
    ln('M12 32A20 20 0 0 1 48.5 21.5', 'e', 6.5) +
    head(-30, 'e') +
    ln('M52 32A20 20 0 0 1 15.5 42.5', 'g', 6.5) +
    head(150, 'g')
  );
};

I.word = () =>
  e(rect(6, 6, 36, 15, 5)) +
  g(rect(22, 24.5, 36, 15, 5)) +
  e(rect(6, 43, 26, 15, 5)) +
  i(rect(35, 43, 23, 15, 5)) +
  i(circ(13, 13.5, 2.6)) +
  dk(circ(29, 32, 2.6)) +
  g(S4(46, 51, 4.2, 0.25));

I.tajweed = () =>
  ln('M5 45C13 28 22 27 26 40C30 53 37 53 41 40C45 29 51 30 59 38', 'e', 7.5) +
  g(circ(14, 15, 6)) +
  i(circ(32, 11, 6)) +
  g(circ(50, 15, 6)) +
  ``;

export const ICON_NAMES = Object.keys(I);
export const ICONS = Object.fromEntries(Object.entries(I).map(([n, fn]) => [n, wrap(fn())]));

// ---------------- Brand mark ----------------
// Clean 64x64 logo; unique ids so it can be inlined in the header.
export const LOGO_DEFS = `<defs>
<linearGradient id="nq-e" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="58" y2="60"><stop offset="0" stop-color="#34c295"/><stop offset="1" stop-color="#0e6b51"/></linearGradient>
<linearGradient id="nq-g" gradientUnits="userSpaceOnUse" x1="6" y1="4" x2="58" y2="60"><stop offset="0" stop-color="#f6dc90"/><stop offset="1" stop-color="#c9973a"/></linearGradient>
<linearGradient id="nq-p" gradientUnits="userSpaceOnUse" x1="14" y1="24" x2="50" y2="52"><stop offset="0" stop-color="#fffef8"/><stop offset="1" stop-color="#ebe3c8"/></linearGradient>
</defs>`;

export const LOGO_BODY = () =>
  `<polygon points="${star8pts(32, 32, 31)}" fill="url(#nq-g)"/>` +
  `<polygon points="${star8pts(32, 32, 27.6)}" fill="url(#nq-e)"/>` +
  `<polygon points="${star8pts(32, 32, 27.6)}" fill="none" stroke="#f6dc90" stroke-opacity=".0"/>` +
  `<circle cx="32" cy="32" r="17.5" fill="#0a4a39"/>` +
  `<circle cx="32" cy="32" r="17.5" fill="none" stroke="url(#nq-g)" stroke-width="1.6"/>` +
  // open book
  `<path d="M16.5 30Q24.5 27.5 32 32Q39.5 27.5 47.5 30V43.5Q39.5 41 32 45.5Q24.5 41 16.5 43.5Z" fill="url(#nq-p)"/>` +
  `<path d="M32 32V45.5" stroke="#c9973a" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M16.5 47Q24.5 44.5 32 49Q39.5 44.5 47.5 47" stroke="url(#nq-g)" stroke-width="1.8" stroke-linecap="round" fill="none"/>` +
  // crescent + star above the book
  `<g transform="rotate(-35 27 21)">${crescent(27, 21, 6.5, 3, 5.6).replace('<path', '<path fill="url(#nq-g)"')}</g>` +
  `<polygon fill="url(#nq-g)" points="${star8pts(36.5, 20, 3.4)}"/>`;

export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" role="img" aria-label="Noor Quran">${LOGO_DEFS}${LOGO_BODY()}</svg>`;

// App icon: brand mark on deep emerald background with subtle girih pattern
export const appIcon = ({ rounded = true, pattern = true, scale = 0.66 } = {}) => {
  const s = 512 * scale / 64;
  const t = (512 - 64 * s) / 2;
  const rx = rounded ? 112 : 0;
  const pat = pattern
    ? `<pattern id="gi" width="64" height="64" patternUnits="userSpaceOnUse"><g fill="none" stroke="#f0cf7c" stroke-opacity=".13" stroke-width="1.4" stroke-linejoin="round"><polygon points="${star8pts(32, 32, 24)}"/><circle cx="32" cy="32" r="9"/><path d="M0 0L8 8M64 0L56 8M0 64L8 56M64 64L56 56"/><polygon points="${star8pts(0, 0, 12)}"/><polygon points="${star8pts(64, 0, 12)}"/><polygon points="${star8pts(0, 64, 12)}"/><polygon points="${star8pts(64, 64, 12)}"/></g></pattern>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none"><defs>
<radialGradient id="bg" cx="0.3" cy="0.2" r="1.1"><stop offset="0" stop-color="#15876a"/><stop offset=".55" stop-color="#0b4d3c"/><stop offset="1" stop-color="#062a21"/></radialGradient>${pat}</defs>
<rect width="512" height="512" rx="${rx}" fill="url(#bg)"/>${pattern ? `<rect width="512" height="512" rx="${rx}" fill="url(#gi)"/>` : ''}
${LOGO_DEFS}<g transform="translate(${f(t)} ${f(t)}) scale(${f(s)})">${LOGO_BODY()}</g></svg>`;
};
