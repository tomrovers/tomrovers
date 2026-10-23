// Turns the web export (dist/) into one self-contained HTML file for sharing a demo preview.
// Usage: npx expo export --platform web && node scripts/web-preview.mjs
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const out = path.resolve('preview/samen-demo.html');
const mime = { '.ttf': 'font/ttf', '.png': 'image/png' };

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
html = html.replace(/<link rel="icon"[^>]*>/, '');

html = html.replace(/<script src="([^"]+)"( defer)?><\/script>/g, (_, src) => {
  let js = fs.readFileSync(path.join(dist, src), 'utf8');
  // Fonts and images are referenced by absolute URL; embed them so the file works anywhere.
  js = js.replace(/"(\/assets\/[^"]+\.(ttf|png))"/g, (match, url, ext) => {
    const file = path.join(dist, url);
    if (!fs.existsSync(file)) return match;
    return `"data:${mime[`.${ext}`]};base64,${fs.readFileSync(file).toString('base64')}"`;
  });
  return `<script>${js.replace(/<\/script/g, '<\\/script')}</script>`;
});

// The router reads the URL; a preview may be served from any path, so always start at "/".
html = html.replace('<head>', `<head><script>try { history.replaceState(null, '', '/'); } catch (e) {}</script>`);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB)`);
