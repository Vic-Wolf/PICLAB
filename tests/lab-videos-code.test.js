import test from 'node:test';
import assert from 'node:assert/strict';
import { experiments } from '../js/data/experiments.js';
import { renderLabDetailView } from '../js/ui/views/labDetailView.js';

test('all ten experiments have their assigned YouTube demonstration link', () => {
  assert.equal(experiments.length, 10);
  for (const experiment of experiments) {
    assert.match(experiment.videoUrl, /^https:\/\/youtu\.be\/[\w-]+\?/);
  }
});

test('experiment theory is separate from source code and page includes a copyable code block', () => {
  for (const experiment of experiments) {
    const theory = experiment.theory.join('\n');
    assert.doesNotMatch(theory, /#include\s*<xc\.h>|#define\s+_XTAL_FREQ|TRIS[A-E]bits\.|LAT[A-E]bits\.|void main\s*\(/, `Experiment ${experiment.number} contains source code in theory`);
  }
  const view = renderLabDetailView('exp01');
  assert.match(view, /data-copy-lab-code/);
  assert.match(view, /<pre class="lab-code"/);
  assert.match(view, /id="lab-video"/);
  assert.match(view, /target="_blank" rel="noopener noreferrer"/);
});


test('code block uses a copy control and syntax highlighting while retaining source text', () => {
  const view = renderLabDetailView('exp01');
  assert.match(view, /lab-code-shell/);
  assert.match(view, /lab-copy-icon/);
  assert.match(view, /syntax-keyword|syntax-preprocessor/);
  assert.doesNotMatch(view, /code-explanation/);
});

test('each experiment exposes its video action near the top and in the video section', () => {
  for (const experiment of experiments) {
    const view = renderLabDetailView(`exp${String(experiment.number).padStart(2,'0')}`);
    assert.ok(view.includes(experiment.videoUrl), `Experiment ${experiment.number} missing its video URL`);
    assert.match(view, /Watch experiment video/);
    assert.match(view, /id="lab-video"/);
  }
});

test('light theme toggle is removed from the interface and theme module enforces dark mode', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const app = fs.readFileSync(path.resolve('js/app.js'), 'utf8');
  const theme = fs.readFileSync(path.resolve('js/ui/theme.js'), 'utf8');
  const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.doesNotMatch(html, /id="header-theme-btn"/);
  assert.doesNotMatch(app, /toggleTheme/);
  assert.match(theme, /applyTheme\('dark'\)/);
});
