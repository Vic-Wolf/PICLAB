import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLabsView, labs } from '../js/ui/views/labsView.js';
import { renderLabDetailView } from '../js/ui/views/labDetailView.js';
import { renderPinoutView } from '../js/ui/views/pinoutView.js';
import { renderRegistersView } from '../js/ui/views/registerView.js';
import { renderLearnView } from '../js/ui/views/learningView.js';
import { renderChallengesView } from '../js/ui/views/challengesView.js';
import { NAV_ITEMS } from '../js/ui/navigation.js';

test('primary workspaces render non-empty content', () => {
  assert.ok(renderLearnView().length > 1000);
  assert.ok(renderPinoutView().length > 1000);
  assert.ok(renderRegistersView().includes('TRISB'));
  assert.ok(renderChallengesView().includes('Challenges'));
});

test('pinout render contains 40 package contacts and register explorer has real register details', () => {
  const pinout = renderPinoutView();
  assert.equal((pinout.match(/class="pin-lead-row/g) || []).length, 40);
  const registers = renderRegistersView();
  for (const name of ['TRISB', 'ADCON0', 'TXSTA']) assert.ok(registers.includes(name), `register ${name} should appear`);
});

test('all ten experiment cards open a manual-style page without embedded simulation controls', () => {
  assert.equal(labs.length, 10);
  const index = renderLabsView();
  for (const lab of labs) {
    assert.ok(index.includes(`data-lab="${lab.id}"`), `${lab.id} card should exist`);
    const page = renderLabDetailView(lab.id);
    for (const id of ['lab-aim','lab-apparatus','lab-theory','lab-connections','lab-procedure','lab-code','lab-viva']) {
      assert.ok(page.includes(`id="${id}"`), `${lab.id} should include ${id}`);
    }
    assert.ok(!page.includes('lab-simulation'), `${lab.id} should not include an interactive simulation section`);
    assert.ok(!page.includes('run-lab-simulation'), `${lab.id} should not include a run-simulation control`);
    assert.ok(!page.includes('EXPERIMENT CONTROL'), `${lab.id} should not include the removed control sidebar`);
  }
});

test('removed standalone Circuit Lab and Simulator workspaces are not in primary navigation', () => {
  const ids = NAV_ITEMS.map(x => x.id);
  assert.ok(!ids.includes('circuit'));
  assert.ok(!ids.includes('simulator'));
});
