import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderRegistersView } from '../js/ui/views/registerView.js';
import { renderPinoutView } from '../js/ui/views/pinoutView.js';
import { renderLabDetailView } from '../js/ui/views/labDetailView.js';
import { renderLessonDetailView } from '../js/ui/views/lessonDetailView.js';

test('register explorer renders eight ordered bit controls and live decimal output', () => {
  const html = renderRegistersView();
  for (let bit = 7; bit >= 0; bit--) assert.match(html, new RegExp(`data-reg-bit="${bit}"`));
  assert.match(html, /Decimal:/);
  assert.match(html, /ACTIVE CONFIGURATION/);
});

test('pinout includes PIC18F4520 peripheral wizard and generated code affordances', () => {
  const html = renderPinoutView();
  assert.match(html, /Pin Configuration Wizard/);
  for (const key of ['pwm','adc0','uart','extint']) assert.match(html, new RegExp(`data-peripheral="${key}"`));
  assert.match(html, /Generate Initialization Code/);
});

test('experiment and lesson views include line-number hooks, download and datasheet references', () => {
  const lab = renderLabDetailView('exp01');
  assert.match(lab, /data-download-lab-code/);
  assert.match(lab, /class="lab-code"/);
  assert.match(lab, /data-line="1"/);
  assert.match(lab, /PIC18F4520 Datasheet/);
  const lesson = renderLessonDetailView('');
  assert.match(lesson, /lesson-code-line/);
  assert.match(lesson, /PIC18F4520 Datasheet/);
});

test('global keyboard shortcuts and visible shortcut legend are installed without replacing PWA service worker', () => {
  const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(app, /bindKeyboardShortcuts/);
  assert.match(app, /event\.key === '\/'/);
  assert.match(app, /event\.key\.toLowerCase\(\) === 'k'/);
  assert.match(html, /Keyboard shortcuts/);
  assert.ok(fs.existsSync(new URL('../service-worker.js', import.meta.url)));
});
