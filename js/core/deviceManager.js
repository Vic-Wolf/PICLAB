/**
 * PICLAB Device Manager
 * Manages active microcontroller target, device capabilities, and configuration.
 */

import { PIC18_DEVICES } from '../data/devices.js';
import { getPinsForDevice } from '../data/pins.js';
import { getRegistersForDevice } from '../data/registers.js';
import { getPeripheralsForDevice } from '../data/peripherals.js';
import { stateStore, setPath } from './state.js';
import { eventBus } from './eventBus.js';

class DeviceManager {
  constructor() {
    this.devices = PIC18_DEVICES;
  }

  /**
   * Get the current active device ID from state
   * @returns {string}
   */
  getCurrentDeviceId() {
    return stateStore.getState().device.currentId || 'PIC18F4520';
  }

  /**
   * Get full metadata definition of active device
   * @returns {object}
   */
  getCurrentDevice() {
    const id = this.getCurrentDeviceId();
    return this.devices[id] || this.devices['PIC18F4520'];
  }

  /**
   * Get pinout array for active device
   * @returns {Array<object>}
   */
  getCurrentPins() {
    return getPinsForDevice(this.getCurrentDeviceId());
  }

  /**
   * Get register dictionary for active device
   * @returns {object}
   */
  getCurrentRegisters() {
    return getRegistersForDevice(this.getCurrentDeviceId());
  }

  /**
   * Get peripheral specifications for active device
   * @returns {object}
   */
  getCurrentPeripherals() {
    return getPeripheralsForDevice(this.getCurrentDeviceId());
  }

  /**
   * Ensure local register state contains only SFRs in the active device map.
   */
  ensureRegisterState(reset = false) {
    const registerMap = this.getCurrentRegisters();
    const storedSfr = stateStore.getState().mcu.sfr || {};
    const currentSfr = {};
    for (const [name, reg] of Object.entries(registerMap)) {
      const rawReset = reg.resetValue;
      const numericReset = typeof rawReset === 'string'
        ? (/^0x[0-9a-f]+$/i.test(rawReset.trim()) ? parseInt(rawReset, 16) : Number(rawReset))
        : Number(rawReset ?? 0);
      const safeReset = Number.isFinite(numericReset) ? Math.max(0, Math.min(255, Math.trunc(numericReset))) : 0;
      const existing = storedSfr[name];
      currentSfr[name] = !reset && Number.isInteger(existing) && existing >= 0 && existing <= 255
        ? existing
        : safeReset;
    }
    // Drop SFRs belonging to a different device map rather than exposing stale values.
    setPath('mcu.sfr', currentSfr, true);
    return currentSfr;
  }

  /**
   * Switch the active microcontroller target
   * @param {string} deviceId
   * @returns {boolean} True if switch succeeded
   */
  setCurrentDevice(deviceId) {
    if (!this.devices[deviceId]) {
      console.warn(`[DeviceManager] Device "${deviceId}" not recognized.`);
      return false;
    }

    const previousDevice = this.getCurrentDevice();
    const newDevice = this.devices[deviceId];

    // Update state
    setPath('device.currentId', deviceId, false);
    setPath('device.clockFreqHz', newDevice.defaultClockHz, false);
    this.ensureRegisterState(true);

    eventBus.emit('device:changed', {
      previous: previousDevice.id,
      current: newDevice.id,
      device: newDevice
    });

    eventBus.emit('pico:speak', {
      mood: 'excited',
      message: `Active target switched to ${newDevice.name}! (${newDevice.specs.programMemoryKB}KB Flash, ${newDevice.specs.adcChannels} ADC channels).`
    });

    return true;
  }

  /**
   * List all available devices for selector dropdowns
   * @returns {Array<object>}
   */
  getAvailableDevices() {
    return Object.values(this.devices);
  }
}

export const deviceManager = new DeviceManager();
export const getCurrentDevice = () => deviceManager.getCurrentDevice();
export const getCurrentDeviceId = () => deviceManager.getCurrentDeviceId();
export const getCurrentPins = () => deviceManager.getCurrentPins();
export const getCurrentRegisters = () => deviceManager.getCurrentRegisters();
export const getCurrentPeripherals = () => deviceManager.getCurrentPeripherals();
export const setCurrentDevice = (id) => deviceManager.setCurrentDevice(id);
export const getAvailableDevices = () => deviceManager.getAvailableDevices();
