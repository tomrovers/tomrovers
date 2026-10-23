// Renders conceptboek.html to Samen_Conceptboek.pdf with headless Chromium.
// Usage: node build.mjs [--png <dir>]   (requires the `playwright` package)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const pngIdx = process.argv.indexOf('--png');
const pngDir = pngIdx > -1 ? process.argv[pngIdx + 1] : null;

const browser = await chromium.launch(
  fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {}
);
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(dir, 'conceptboek.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Fail loudly when a page's content does not fit on its A4 sheet.
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll('.page')].flatMap((p, i) => {
    const bottom = p.getBoundingClientRect().bottom - parseFloat(getComputedStyle(p).paddingBottom);
    const tooTall = [...p.children].some(c => c.getBoundingClientRect().bottom > bottom + 0.5);
    const content = p.querySelector('.content');
    const squeezed = content && content.scrollHeight > content.clientHeight + 0.5;
    return tooTall || squeezed ? [i + 1] : [];
  })
);
if (overflow.length) {
  console.error('Overflowing pages:', overflow.join(', '));
  process.exitCode = 1;
}

await page.pdf({ path: path.join(dir, 'Samen_Conceptboek.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });

if (pngDir) {
  fs.mkdirSync(pngDir, { recursive: true });
  const els = await page.$$('.page');
  for (const [i, el] of els.entries()) {
    await el.screenshot({ path: path.join(pngDir, `p${String(i + 1).padStart(2, '0')}.png`) });
  }
}
await browser.close();
console.log('Wrote Samen_Conceptboek.pdf');
