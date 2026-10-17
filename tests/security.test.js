import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../js/core/security.js';
import { stateStore, setPath } from '../js/core/state.js';
import { importState, exportState, resetState, STORAGE_KEY } from '../js/core/storage.js';
import { calculateQuizXpReward } from '../js/ui/views/quizView.js';

function installMemoryStorage() {
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear()
  };
  return values;
}

test('escapeHtml safely renders characters that can break HTML contexts', () => {
  assert.equal(escapeHtml(`<img src=x onerror='x'> & "hello"`), '&lt;img src=x onerror=&#39;x&#39;&gt; &amp; &quot;hello&quot;');
});

test('state paths reject prototype-pollution segments', () => {
  const before = ({}).piclabPolluted;
  assert.equal(setPath('__proto__.piclabPolluted', true), false);
  assert.equal(setPath('constructor.prototype.piclabPolluted', true), false);
  assert.equal(({}).piclabPolluted, before);
});

test('state merging ignores prototype-pollution keys', () => {
  const malicious = JSON.parse('{"__proto__":{"piclabPolluted":true},"profile":{"loginId":"safe"}}');
  stateStore.update(malicious, false);
  assert.equal(({}).piclabPolluted, undefined);
  assert.equal(stateStore.getState().profile.loginId, 'safe');
});

test('importState normalizes user-provided JSON, preserves profile, and bounds SFR values', () => {
  installMemoryStorage();
  const hostile = JSON.parse(`{
    "version": 2,
    "profile": {"loginId": "student-1", "displayName": "<img src=x onerror=alert(1)>"},
    "device": {"currentId": "PIC18F4520", "clockFreqHz": 8000000, "vddVoltage": 5, "powerState": "STOPPED", "__proto__": {"polluted": true}},
    "mcu": {"status": "STOPPED", "cycleCount": 5, "sfr": {"TRISB": 99999, "LATB": 17, "__proto__": {"polluted": true}}, "adc": {"channel": 0, "voltageIn": 2.5, "result10Bit": 512}, "pwm": {"dutyPercent": 51, "frequencyHz": 1000}, "uart": {"baudRate": 9600, "txHistory": ["hello"]}},
    "learning": {"completedLessons": ["gpio_basics"], "completedLabs": ["exp01"], "completedChallenges": [], "progressByTopic": {"GPIO": 45}},
    "gamification": {"xp": 255, "level": 1000, "streak": {"current": 2, "best": 3, "lastDate": "2026-10-10"}, "badges": []},
    "ui": {"theme": "light"}
  }`);
  assert.equal(importState(JSON.stringify(hostile)), true);
  const state = stateStore.getState();
  assert.equal(state.profile.loginId, 'student-1');
  assert.equal(state.profile.displayName, '<img src=x onerror=alert(1)>');
  assert.equal(state.mcu.sfr.TRISB, 255, 'out-of-range register values should fall back to reset/default');
  assert.equal(state.mcu.sfr.LATB, 17);
  assert.equal(state.gamification.xp, 255);
  assert.equal(state.gamification.level, 2, 'level should derive from validated XP');
  assert.equal(state.ui.theme, 'light');
  assert.equal(({}).polluted, undefined);
  assert.ok(localStorage.getItem(STORAGE_KEY));
  assert.equal(JSON.parse(exportState()).profile.loginId, 'student-1');
  resetState();
});

test('importState rejects oversized and malformed backups without throwing', () => {
  installMemoryStorage();
  assert.equal(importState('{not-json'), false);
  assert.equal(importState('x'.repeat(2 * 1024 * 1024 + 1)), false);
  assert.equal(({}).polluted, undefined);
});

test('quiz XP rewards only score improvements, preventing replay farming', () => {
  assert.equal(calculateQuizXpReward(8, 0), 200, 'first score earns XP');
  assert.equal(calculateQuizXpReward(8, 8), 0, 'replaying same score earns no extra XP');
  assert.equal(calculateQuizXpReward(9, 8), 25, 'improving one question earns only the improvement bonus');
  assert.equal(calculateQuizXpReward(5, 8), 0, 'a lower score earns no XP');
});

test('profile text is HTML-escaped by the dashboard before DOM insertion', async () => {
  const { renderOverviewView } = await import('../js/ui/views/overviewView.js');
  setPath('profile.loginId', 'student-1', false);
  setPath('profile.displayName', '<img src=x onerror=alert(1)>', false);
  const markup = renderOverviewView();
  assert.equal(markup.includes('<img src=x onerror=alert(1)>'), false);
  assert.equal(markup.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
});
test('PICO escapes user-provided speech and rejects an invalid mood token', async () => {
  const { picoController } = await import('../js/pico/pico.js');
  picoController.container = { innerHTML: '', querySelector: () => null };
  picoController.speechVisible = true;
  picoController.speak('<img src=x onerror=alert(1)>', 'bad" onload="alert(1)');
  assert.equal(picoController.container.innerHTML.includes('<img src=x onerror=alert(1)>'), false);
  assert.equal(picoController.container.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
  assert.equal(picoController.container.innerHTML.includes('pico-mood-bad"'), false);
  picoController.container = null;
});
