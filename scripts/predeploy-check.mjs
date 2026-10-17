import { readdir, readFile, stat } from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PIC18_DEVICES } from '../js/data/devices.js';
import { getPinsForDevice } from '../js/data/pins.js';
import { getRegistersForDevice } from '../js/data/registers.js';

const root = process.cwd();
const jsRoot = path.join(root, 'js');
const files = [];
const problems = [];
const notes = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && full.endsWith('.js')) files.push(full);
  }
}
async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}
function check(condition, message) {
  if (!condition) problems.push(message);
}

await walk(jsRoot);

// Also syntax-check the root service worker, which is outside the application module folder.
const serviceWorkerPath = path.join(root, 'service-worker.js');
if (await exists(serviceWorkerPath)) {
  const result = spawnSync(process.execPath, ['--check', serviceWorkerPath], { encoding: 'utf8' });
  if (result.status !== 0) problems.push(`Syntax: service-worker.js\n${result.stderr}`);
} else {
  problems.push('Missing service-worker.js; the offline app shell cannot be installed.');
}

// Syntax-check every JavaScript module and validate relative imports.
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) problems.push(`Syntax: ${path.relative(root, file)}\n${result.stderr}`);
  const source = await readFile(file, 'utf8');
  const importPattern = /(?:from\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    const target = path.resolve(path.dirname(file), match[1]);
    if (!await exists(target)) problems.push(`Missing import: ${path.relative(root, file)} -> ${match[1]}`);
  }
}

// Validate the install manifest, its same-origin scope, app-shell precache and referenced icons.
const manifestPath = path.join(root, 'manifest.webmanifest');
if (!await exists(manifestPath)) {
  problems.push('Missing manifest.webmanifest; installable PWA metadata is unavailable.');
} else {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (manifest.display !== 'standalone') problems.push('PWA manifest display mode should be standalone.');
    if (manifest.scope !== './' || !String(manifest.start_url || '').startsWith('./')) problems.push('PWA manifest must use a project-relative scope and start URL for subpath hosting.');
    for (const icon of manifest.icons || []) {
      const iconPath = String(icon.src || '').replace(/^\.\//, '');
      if (!iconPath || !await exists(path.join(root, iconPath))) problems.push(`Missing manifest icon: ${icon.src}`);
    }
  } catch (err) {
    problems.push(`Invalid manifest.webmanifest: ${err.message}`);
  }
}
if (await exists(serviceWorkerPath)) {
  const worker = await readFile(serviceWorkerPath, 'utf8');
  const section = worker.match(/const APP_SHELL = \[([\s\S]*?)\];/);
  if (!section) problems.push('service-worker.js does not declare the app-shell precache list.');
  else {
    const entries = [...section[1].matchAll(/["'](\.\/[^"']+)["']/g)].map(match => match[1]);
    for (const entry of entries) {
      const target = path.resolve(root, entry.replace(/^\.\//, ''));
      if (!await exists(target)) problems.push(`Missing offline precache asset: ${entry}`);
    }
  }
}

// Check top-level HTML references, duplicate IDs, unsafe URL schemes and external-link isolation.
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const idValues = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]);
const duplicateIds = idValues.filter((id, i) => idValues.indexOf(id) !== i);
if (duplicateIds.length) problems.push(`Duplicate HTML IDs: ${[...new Set(duplicateIds)].join(', ')}`);

for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']\s*javascript:/ig)) {
  problems.push(`Unsafe javascript: URL in index.html near offset ${match.index}`);
}
if (/\son[a-z]+\s*=\s*["']/i.test(html)) {
  problems.push('Inline HTML event handlers found. Use addEventListener instead.');
}
for (const match of html.matchAll(/<script\b([^>]*)>/ig)) {
  const attrs = match[1];
  if (!/\bsrc\s*=/i.test(attrs) && !/\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs)) {
    problems.push('Inline executable script found in index.html; keep code in local modules for CSP compatibility.');
  }
}
for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/ig)) {
  const tag = match[0];
  if (!/\brel=["'][^"']*\bnoopener\b/i.test(tag)) {
    problems.push(`External/new-window anchor is missing rel="noopener": ${tag.slice(0, 140)}`);
  }
}

// Verify linked local scripts and stylesheets.
const cssLinks = [...html.matchAll(/href=["']([^"']+\.css)["']/g)].map(m => m[1]);
for (const href of cssLinks) {
  if (/^(?:https?:|data:|#)/i.test(href)) continue;
  if (!await exists(path.join(root, href.split(/[?#]/)[0]))) problems.push(`Missing stylesheet: ${href}`);
}
const scriptSrcs = [...html.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]);
for (const src of scriptSrcs) {
  if (/^(?:https?:|data:|#)/i.test(src)) problems.push(`Remote executable script not allowed in this static build: ${src}`);
  else if (!await exists(path.join(root, src.split(/[?#]/)[0]))) problems.push(`Missing script: ${src}`);
}
if (!html.includes('type="module"')) problems.push('index.html does not load the app as an ES module.');

// Check CSS local URLs and syntax bracket balance, catching common missing-asset/partial-edit mistakes.
for (const href of cssLinks) {
  const cssPath = path.join(root, href.split(/[?#]/)[0]);
  if (!await exists(cssPath)) continue;
  const css = await readFile(cssPath, 'utf8');
  const opens = (css.match(/{/g) || []).length;
  const closes = (css.match(/}/g) || []).length;
  if (opens !== closes) problems.push(`Unbalanced CSS braces: ${href} (${opens} opening / ${closes} closing)`);
  for (const m of css.matchAll(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/ig)) {
    const url = m[1].trim();
    if (!url || /^(?:https?:|data:|blob:|#)/i.test(url)) continue;
    if (!await exists(path.resolve(path.dirname(cssPath), url.split(/[?#]/)[0]))) {
      problems.push(`Missing CSS asset: ${href} -> ${url}`);
    }
  }
}

// Validate static hosting security headers are present and parseable.
const headersPath = path.join(root, '_headers');
const vercelPath = path.join(root, 'vercel.json');
if (!await exists(headersPath)) problems.push('Missing Netlify-compatible security headers file.');
if (!await exists(vercelPath)) {
  problems.push('Missing Vercel security headers config.');
} else {
  try {
    const cfg = JSON.parse(await readFile(vercelPath, 'utf8'));
    const all = (cfg.headers || []).flatMap(entry => entry.headers || []);
    const map = new Map(all.map(item => [item.key.toLowerCase(), item.value]));
    for (const key of ['content-security-policy','x-content-type-options','referrer-policy','x-frame-options']) {
      if (!map.has(key)) problems.push(`Vercel config missing security header: ${key}`);
    }
    const csp = map.get('content-security-policy') || '';
    for (const directive of ["script-src 'self'", "object-src 'none'", "frame-ancestors 'none'"]) {
      if (!csp.includes(directive)) problems.push(`CSP missing required directive: ${directive}`);
    }
    if (/unsafe-eval/i.test(csp)) problems.push('CSP unexpectedly permits unsafe-eval.');
  } catch (err) {
    problems.push(`Invalid vercel.json: ${err.message}`);
  }
}
if (await exists(headersPath)) {
  const headers = await readFile(headersPath, 'utf8');
  if (!headers.includes('Content-Security-Policy:') || !headers.includes("script-src 'self'")) {
    problems.push('_headers CSP is missing or weaker than expected.');
  }
}

// Ensure the device/pin/register data is structurally sane, while making no unsupported claims about completeness.
for (const [deviceId, device] of Object.entries(PIC18_DEVICES)) {
  const pins = getPinsForDevice(deviceId);
  const registers = getRegistersForDevice(deviceId);
  if (pins.length !== device.pinCount) problems.push(`${deviceId}: ${pins.length} pin entries do not match pinCount ${device.pinCount}.`);
  if (new Set(pins.map(pin => pin.physicalPin)).size !== pins.length) problems.push(`${deviceId}: duplicate physical pin numbers.`);
  if (deviceId === 'PIC18F4520' && device.dataStatus !== 'reference') problems.push('PIC18F4520 must be marked as the reference target.');
  if (deviceId !== 'PIC18F4520' && device.dataStatus !== 'preview') problems.push(`${deviceId} must be marked preview until its device-specific dataset is fully validated.`);
  const addresses = Object.entries(registers).filter(([, reg]) => reg.address).map(([, reg]) => reg.address);
  if (new Set(addresses).size !== addresses.length) problems.push(`${deviceId}: duplicate SFR addresses found.`);
  for (const [name, reg] of Object.entries(registers)) {
    if (!Array.isArray(reg.bits)) continue;
    const bitPositions = reg.bits.map(bit => bit.position);
    if (bitPositions.some(pos => !Number.isInteger(pos) || pos < 0 || pos >= reg.width)) {
      problems.push(`${deviceId}: invalid bit position in ${name}.`);
    }
  }
}

// Basic secret-scan to avoid accidentally shipping common credential formats.
const secretPatterns = [
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\bsk-[A-Za-z0-9]{24,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];
for (const dir of ['js', 'css', 'data']) {
  const base = path.join(root, dir);
  if (!await exists(base)) continue;
  async function scanSecretFiles(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) await scanSecretFiles(full);
      else if (/\.(?:js|css|json|html|md)$/i.test(entry.name)) {
        const text = await readFile(full, 'utf8');
        if (secretPatterns.some(pattern => pattern.test(text))) problems.push(`Possible embedded credential format in ${path.relative(root, full)}`);
      }
    }
  }
  await scanSecretFiles(base);
}

if (problems.length) {
  console.error(`Predeploy check FAILED (${problems.length} finding(s))`);
  console.error(problems.join('\n\n'));
  process.exit(1);
}
console.log(`Predeploy check passed: ${files.length} application JavaScript modules and the root service worker syntax-checked; relative imports, PWA manifest/precache assets, duplicate IDs, local assets, device data and hosting security-header configuration validated.`);
