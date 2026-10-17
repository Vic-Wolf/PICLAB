import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STATE, stateStore } from '../js/core/state.js';
import { eventBus } from '../js/core/eventBus.js';
import { bindChallengesEvents, renderChallengesView, renderChallengeDetailView } from '../js/ui/views/challengesView.js';

class MockContainer {
  constructor(html = '') { this._html = html; this.listeners = new Map(); this.feedback = { innerHTML: '' }; }
  get innerHTML() { return this._html; }
  set innerHTML(value) { this._html = String(value); }
  addEventListener(type, callback) { this.listeners.set(type, callback); }
  contains() { return true; }
  querySelector(selector) { return selector === '#challenge-feedback' && this._html.includes('id="challenge-feedback"') ? this.feedback : null; }
  click(target) { this.listeners.get('click')?.({ target }); }
}
function button({ id = '', challengeId, answer } = {}) {
  const attrs = {}; if (challengeId !== undefined) attrs.challenge = challengeId; if (answer !== undefined) attrs.answer = String(answer);
  return { id, dataset: attrs, closest(selector) { return selector === 'button' ? this : null; }, matches(selector) { if (selector === '[data-challenge]') return attrs.challenge !== undefined; if (selector === '[data-answer]') return attrs.answer !== undefined; return false; } };
}
function resetState() { stateStore.replaceState(JSON.parse(JSON.stringify(INITIAL_STATE))); }

test('Diagnose navigates to a separate challenge page; answers and XP still work once', () => {
  resetState();
  const list = new MockContainer(renderChallengesView()); bindChallengesEvents(list);
  assert.match(list.innerHTML, /data-challenge="gpio-01"/);
  const opened = []; const off = eventBus.on('challenges:open', id => opened.push(id));
  list.click(button({ challengeId: 'gpio-01' })); off();
  assert.deepEqual(opened, ['gpio-01']);
  const detail = new MockContainer(renderChallengeDetailView('gpio-01')); bindChallengesEvents(detail);
  assert.match(detail.innerHTML, /challenge-detail-page/);
  assert.match(detail.innerHTML, /id="active-challenge-title"/);
  assert.match(detail.innerHTML, /data-answer="0"/);
  detail.click(button({ answer: 1 })); assert.match(detail.feedback.innerHTML, /Not quite/);
  detail.click(button({ answer: 0 })); assert.match(detail.feedback.innerHTML, /Correct diagnosis/);
  assert.match(detail.feedback.innerHTML, /id="claim-xp"/);
  detail.click(button({ id: 'claim-xp' }));
  assert.equal(stateStore.getState().gamification.xp, 50);
  assert.deepEqual(stateStore.getState().learning.completedChallenges, ['gpio-01']);
  assert.doesNotMatch(detail.innerHTML, /modal-inline/);
});

test('completed challenge detail can be reviewed without awarding XP again', () => {
  resetState(); stateStore.setPath('learning.completedChallenges', ['gpio-01'], false);
  const detail = new MockContainer(renderChallengeDetailView('gpio-01')); bindChallengesEvents(detail);
  assert.match(detail.innerHTML, /already recorded in your progress/i);
  detail.click(button({ answer: 0 }));
  assert.match(detail.feedback.innerHTML, /no additional XP is awarded/i);
  assert.doesNotMatch(detail.feedback.innerHTML, /id="claim-xp"/);
  assert.equal(stateStore.getState().gamification.xp, 0);
});

test('challenge list binds once and detail page contains no modal or popover', async () => {
  resetState(); const list = new MockContainer(renderChallengesView());
  bindChallengesEvents(list); bindChallengesEvents(list); assert.equal(list.listeners.size, 1);
  const detail = renderChallengeDetailView('gpio-01');
  assert.match(detail, /challenge-detail-page/); assert.doesNotMatch(detail, /modal-inline|popover/);
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../js/ui/views/challengesView.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /document\.body\.appendChild\(modal\)|body\.style\.overflow = 'hidden'/);
});
