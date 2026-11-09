// Renders the Noor Quran icon set to PNG with Playwright.
// Usage: node scripts/icons/render.mjs
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ICONS, ICON_NAMES, LOGO_SVG, appIcon } from './icons.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pub = path.join(root, 'public');
const dirs = [path.join(pub, 'icons/ui'), path.join(pub, 'brand'), path.join(pub, 'icons'), path.join(root, 'app')];
dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 1 });

async function png(svg, size, out, opaque = false) {
  const sized = svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:${opaque ? '#062a21' : 'transparent'};overflow:hidden">${sized}</body></html>`,
  );
  await page.screenshot({ path: out, omitBackground: !opaque, clip: { x: 0, y: 0, width: size, height: size } });
}

// UI icons
for (const n of ICON_NAMES) await png(ICONS[n], 128, path.join(pub, 'icons/ui', `${n}.png`));
fs.writeFileSync(path.join(pub, 'icons/ui/index.json'), JSON.stringify(ICON_NAMES, null, 2) + '\n');

// Brand
fs.writeFileSync(path.join(pub, 'brand/logo.svg'), LOGO_SVG + '\n');
await png(LOGO_SVG, 512, path.join(pub, 'brand/logo-512.png'));

// PWA
const main = appIcon({ rounded: true, pattern: true, scale: 0.66 });
for (const s of [72, 96, 128, 144, 152, 192, 384, 512]) await png(main, s, path.join(pub, 'icons', `icon-${s}x${s}.png`));
await png(appIcon({ rounded: false, pattern: true, scale: 0.6 }), 512, path.join(pub, 'icons/maskable-512.png'), true);
await png(appIcon({ rounded: false, pattern: true, scale: 0.7 }), 180, path.join(pub, 'icons/apple-touch-icon.png'), true);
fs.copyFileSync(path.join(pub, 'icons/apple-touch-icon.png'), path.join(pub, 'apple-icon.png'));
const fav = appIcon({ rounded: true, pattern: false, scale: 0.86 });
await png(fav, 32, path.join(pub, 'icons/favicon-32.png'));
await png(fav, 16, path.join(pub, 'icons/favicon-16.png'));
await png(main, 512, path.join(root, 'app/icon.png'));

await browser.close();
console.log('rendered', ICON_NAMES.length, 'ui icons + brand + pwa');
