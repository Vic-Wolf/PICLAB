import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('shared design tokens load after component styles and are included in offline app shell', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/design-system.css'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  assert.match(html, /href="css\/design-system\.css"/);
  assert.ok(html.indexOf('css/design-system.css') > html.indexOf('css/device-support.css'));
  for (const token of ['--brand-700', '--radius-md', '--space-4', '--font-body', '--ds-border']) assert.ok(css.includes(token), `missing token ${token}`);
  assert.match(css, /html\[data-theme="light"\]/);
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(sw, /"\.\/css\/design-system\.css"/);
});
