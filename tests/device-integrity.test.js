import test from 'node:test';
import assert from 'node:assert/strict';
import { PIC18_DEVICES } from '../js/data/devices.js';
import { getPinsForDevice } from '../js/data/pins.js';
import { getRegistersForDevice } from '../js/data/registers.js';
import { INITIAL_STATE, stateStore } from '../js/core/state.js';
import { deviceManager } from '../js/core/deviceManager.js';

test('PICLAB exposes only the PIC18F4520 target with valid pin and register data', () => {
  assert.deepEqual(Object.keys(PIC18_DEVICES), ['PIC18F4520']);
  const device = PIC18_DEVICES.PIC18F4520;
  const pins = getPinsForDevice('PIC18F4520');
  const registers = getRegistersForDevice('PIC18F4520');
  assert.equal(pins.length, device.pinCount);
  assert.equal(new Set(pins.map(pin => pin.physicalPin)).size, pins.length);
  assert.ok(Object.keys(registers).length > 0);
  for (const register of Object.values(registers)) {
    for (const bit of register.bits || []) {
      assert.ok(Number.isInteger(bit.position) && bit.position >= 0 && bit.position < register.width, `${register.name}.${bit.name} bit index`);
    }
  }
});

test('non-PIC18F4520 targets cannot be selected and register state stays on the reference map', () => {
  stateStore.replaceState(JSON.parse(JSON.stringify(INITIAL_STATE)));
  deviceManager.ensureRegisterState(true);
  assert.equal(deviceManager.setCurrentDevice('PIC18F4550'), false);
  assert.equal(deviceManager.setCurrentDevice('PIC18F45K22'), false);
  assert.equal(deviceManager.getCurrentDeviceId(), 'PIC18F4520');
  assert.equal(stateStore.getState().device.currentId, 'PIC18F4520');
  stateStore.replaceState(JSON.parse(JSON.stringify(INITIAL_STATE)));
  deviceManager.ensureRegisterState(true);
});

test('other PIC targets are absent from user-facing selector, search, and help content', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const root = resolve('.');
  const files = ['index.html', 'js/ui/search.js', 'js/ui/views/helpView.js', 'data/faq.json'];
  for (const file of files) {
    const content = readFileSync(resolve(root, file), 'utf8');
    assert.doesNotMatch(content, /PIC18F4550|PIC18F45K22/, `${file} should only mention the PIC18F4520 target`);
  }
});
