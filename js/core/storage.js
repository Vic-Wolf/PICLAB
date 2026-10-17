/**
 * PICLAB LocalStorage persistence and state portability.
 * Imported JSON is treated as untrusted input and normalised against the app schema.
 */
import { stateStore, INITIAL_STATE } from './state.js';
import { eventBus } from './eventBus.js';
import { PIC18_DEVICES } from '../data/devices.js';
import { getRegistersForDevice } from '../data/registers.js';
import { clampNumber } from './security.js';

export const STORAGE_KEY = 'PICLAB_APP_STATE_V1';
export const CURRENT_SCHEMA_VERSION = 2;
const MAX_IMPORT_CHARS = 2 * 1024 * 1024;
const DEVICE_IDS = new Set(Object.keys(PIC18_DEVICES));
const ALLOWED_MCU_STATUS = new Set(['RUNNING', 'PAUSED', 'STOPPED']);
const ALLOWED_POWER_STATES = new Set(['RUNNING', 'PAUSED', 'STOPPED', 'ON', 'OFF']);
const ALLOWED_THEMES = new Set(['dark', 'light']);
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function cloneDefaults() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}
function safeText(value, fallback = '', maxLength = 100) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLength);
}
function safeIdArray(value, limit = 500) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(x => typeof x === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(x)).slice(0, limit))];
}
function safeStringArray(value, limit = 100, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value.filter(x => typeof x === 'string').slice(0, limit).map(x => safeText(x, '', maxLength));
}
function parseResetValue(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const s = value.trim();
    const n = /^0x[0-9a-f]+$/i.test(s) ? parseInt(s, 16) : Number(s);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
function buildSfr(sourceSfr, deviceId) {
  const registerMap = getRegistersForDevice(deviceId);
  const defaults = {};
  for (const [name, register] of Object.entries(registerMap)) {
    if (FORBIDDEN_KEYS.has(name) || !/^[A-Z][A-Z0-9]*$/.test(name)) continue;
    const fallback = Object.prototype.hasOwnProperty.call(INITIAL_STATE.mcu.sfr, name) ? INITIAL_STATE.mcu.sfr[name] : 0;
    defaults[name] = clampNumber(parseResetValue(register.resetValue, fallback), fallback, 0, 255, true);
  }
  if (!isRecord(sourceSfr)) return defaults;
  for (const [name, value] of Object.entries(sourceSfr)) {
    if (!Object.prototype.hasOwnProperty.call(registerMap, name) || FORBIDDEN_KEYS.has(name)) continue;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 255) defaults[name] = value;
  }
  return defaults;
}
function normalizeState(parsed) {
  const state = cloneDefaults();
  const requestedId = isRecord(parsed.device) && typeof parsed.device.currentId === 'string' ? parsed.device.currentId : state.device.currentId;
  const deviceId = DEVICE_IDS.has(requestedId) ? requestedId : state.device.currentId;
  const device = PIC18_DEVICES[deviceId];

  const rawProfile = isRecord(parsed.profile) ? parsed.profile : {};
  state.profile = {
    loginId: safeText(rawProfile.loginId, '', 64),
    displayName: safeText(rawProfile.displayName, '', 80),
    createdAt: typeof rawProfile.createdAt === 'string' && !Number.isNaN(Date.parse(rawProfile.createdAt))
      ? new Date(rawProfile.createdAt).toISOString() : null
  };

  const rawDevice = isRecord(parsed.device) ? parsed.device : {};
  state.device = {
    currentId: deviceId,
    clockFreqHz: clampNumber(rawDevice.clockFreqHz, device.defaultClockHz, 100000, device.specs.maxFreqMHz * 1_000_000, true),
    vddVoltage: clampNumber(rawDevice.vddVoltage, 5.0, 0, 5.5),
    powerState: ALLOWED_POWER_STATES.has(rawDevice.powerState) ? rawDevice.powerState : 'STOPPED'
  };

  const rawMcu = isRecord(parsed.mcu) ? parsed.mcu : {};
  const rawAdc = isRecord(rawMcu.adc) ? rawMcu.adc : {};
  const rawPwm = isRecord(rawMcu.pwm) ? rawMcu.pwm : {};
  const rawUart = isRecord(rawMcu.uart) ? rawMcu.uart : {};
  state.mcu = {
    ...state.mcu,
    status: ALLOWED_MCU_STATUS.has(rawMcu.status) ? rawMcu.status : 'STOPPED',
    cycleCount: clampNumber(rawMcu.cycleCount, 0, 0, Number.MAX_SAFE_INTEGER, true),
    sfr: buildSfr(rawMcu.sfr, deviceId),
    pinLevels: {},
    adc: {
      channel: clampNumber(rawAdc.channel, 0, 0, Math.max(0, (device.specs.adcChannels || 1) - 1), true),
      voltageIn: clampNumber(rawAdc.voltageIn, 0, 0, Math.min(5.5, state.device.vddVoltage)),
      conversionRunning: rawAdc.conversionRunning === true,
      result10Bit: clampNumber(rawAdc.result10Bit, 0, 0, 1023, true)
    },
    pwm: {
      enabled: rawPwm.enabled === true,
      dutyPercent: clampNumber(rawPwm.dutyPercent, 0, 0, 100),
      frequencyHz: clampNumber(rawPwm.frequencyHz, state.mcu.pwm.frequencyHz, 1, 10_000_000, true),
      waveformBuffer: Array.isArray(rawPwm.waveformBuffer) ? rawPwm.waveformBuffer.slice(-512).map(x => clampNumber(x, 0, 0, 1)) : []
    },
    uart: {
      baudRate: clampNumber(rawUart.baudRate, 9600, 0, 10_000_000, true),
      txHistory: safeStringArray(rawUart.txHistory, 50, 1000),
      rxHistory: safeStringArray(rawUart.rxHistory, 50, 1000),
      txActive: rawUart.txActive === true
    }
  };

  const rawLearning = isRecord(parsed.learning) ? parsed.learning : {};
  const completedLessons = safeIdArray(rawLearning.completedLessons);
  const completedLabs = safeIdArray(rawLearning.completedLabs, 100);
  const completedChallenges = safeIdArray(rawLearning.completedChallenges, 500);
  const defaultTopics = state.learning.progressByTopic;
  const rawProgress = isRecord(rawLearning.progressByTopic) ? rawLearning.progressByTopic : {};
  const progressByTopic = { ...defaultTopics };
  for (const topic of Object.keys(defaultTopics)) {
    if (typeof rawProgress[topic] === 'number' && Number.isFinite(rawProgress[topic])) {
      progressByTopic[topic] = clampNumber(rawProgress[topic], 0, 0, 100);
    }
  }
  const rawScores = isRecord(rawLearning.quizScores) ? rawLearning.quizScores : {};
  const latestScore = isRecord(rawScores.latest) ? rawScores.latest : null;
  state.learning = {
    ...state.learning,
    completedLessons,
    activeLesson: null,
    completedLabs,
    completedChallenges,
    progressByTopic,
    quizScores: latestScore ? {
      latest: {
        score: clampNumber(latestScore.score, 0, 0, 100, true),
        total: clampNumber(latestScore.total, 0, 0, 100, true),
        bestScore: clampNumber(latestScore.bestScore ?? latestScore.score, 0, 0, 100, true),
        date: typeof latestScore.date === 'string' && !Number.isNaN(Date.parse(latestScore.date)) ? new Date(latestScore.date).toISOString() : null
      }
    } : {}
  };

  const rawGame = isRecord(parsed.gamification) ? parsed.gamification : {};
  const rawStreak = isRecord(rawGame.streak) ? rawGame.streak : {};
  const safeXp = clampNumber(rawGame.xp, 0, 0, 10_000_000, true);
  state.gamification = {
    xp: safeXp,
    level: Math.min(1000, Math.floor(safeXp / 250) + 1),
    levelTitle: safeText(rawGame.levelTitle, 'New Explorer', 60),
    streak: {
      current: clampNumber(rawStreak.current, 0, 0, 10000, true),
      best: clampNumber(rawStreak.best, 0, 0, 10000, true),
      lastDate: typeof rawStreak.lastDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawStreak.lastDate) ? rawStreak.lastDate : null
    },
    badges: safeIdArray(rawGame.badges, 100),
    recentAchievements: safeIdArray(rawGame.recentAchievements, 100)
  };

  const rawUi = isRecord(parsed.ui) ? parsed.ui : {};
  state.ui = {
    ...state.ui,
    currentTab: 'overview',
    subView: null,
    activeLessonId: null,
    activeLabId: safeText(rawUi.activeLabId, '', 80) || null,
    theme: ALLOWED_THEMES.has(rawUi.theme) ? rawUi.theme : 'dark',
    searchQuery: '',
    searchOpen: false,
    modalOpen: null,
    isMobileNavOpen: false,
    zoomLevel: 1
  };
  return state;
}


function resetProgressForAnonymousProfile(state) {
  const defaults = cloneDefaults();
  state.learning = defaults.learning;
  state.gamification = defaults.gamification;
  state.mcu = defaults.mcu;
  state.mcu.sfr = buildSfr({}, state.device.currentId);
  return state;
}

function extractPersistableState(fullState) {
  const u = fullState.ui || {};
  const m = fullState.mcu || {};
  const uart = m.uart || {};
  return {
    version: CURRENT_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    profile: fullState.profile,
    device: {
      currentId: fullState.device.currentId,
      clockFreqHz: fullState.device.clockFreqHz,
      vddVoltage: fullState.device.vddVoltage,
      powerState: fullState.device.powerState
    },
    mcu: {
      status: m.status,
      cycleCount: m.cycleCount,
      sfr: m.sfr,
      adc: m.adc,
      pwm: { ...m.pwm, waveformBuffer: (m.pwm?.waveformBuffer || []).slice(-512) },
      uart: {
        baudRate: uart.baudRate,
        txHistory: (uart.txHistory || []).slice(-50),
        rxHistory: (uart.rxHistory || []).slice(-50),
        txActive: uart.txActive === true
      }
    },
    learning: fullState.learning,
    gamification: fullState.gamification,
    ui: { theme: u.theme, activeLabId: u.activeLabId }
  };
}

export function saveState() {
  try {
    const raw = extractPersistableState(stateStore.getState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    eventBus.emit('storage:saved', { timestamp: raw.timestamp });
    return true;
  } catch (err) {
    console.error('[Storage] Failed to save state to LocalStorage:', err);
    eventBus.emit('storage:error', { action: 'save', message: 'Unable to save local progress. Browser storage may be disabled or full.' });
    return false;
  }
}

export function loadState() {
  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    if (saved.length > MAX_IMPORT_CHARS) throw new Error('Stored state exceeds the size limit.');
    const parsed = JSON.parse(saved);
    if (!isRecord(parsed)) throw new Error('Stored state is not a JSON object.');
    if (Number(parsed.version) > CURRENT_SCHEMA_VERSION) throw new Error('Stored state was created by a newer PICLAB version.');
    const normalized = normalizeState(parsed);
    if (!normalized.profile.loginId) resetProgressForAnonymousProfile(normalized);
    stateStore.replaceState(normalized);
    eventBus.emit('storage:loaded', { timestamp: safeText(parsed.timestamp, '', 40) });
    return true;
  } catch (err) {
    console.warn('[Storage] Saved state was invalid; application defaults will be used.', err.message);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* unavailable storage */ }
    eventBus.emit('storage:error', { action: 'load', message: 'Saved progress was invalid and was cleared. You can create a new local profile.' });
    return false;
  }
}

export function exportState() {
  return JSON.stringify(extractPersistableState(stateStore.getState()), null, 2);
}

export function importState(jsonString) {
  try {
    if (typeof jsonString !== 'string' || !jsonString.trim() || jsonString.length > MAX_IMPORT_CHARS) {
      throw new Error('Backup file is empty or exceeds the 2 MB size limit.');
    }
    const parsed = JSON.parse(jsonString);
    if (!isRecord(parsed) || !isRecord(parsed.device) || !isRecord(parsed.gamification) || !isRecord(parsed.mcu) || !isRecord(parsed.learning)) {
      throw new Error('Invalid PICLAB backup structure.');
    }
    if (Number(parsed.version) > CURRENT_SCHEMA_VERSION) throw new Error('This backup was created by a newer PICLAB version.');
    const normalized = normalizeState(parsed);
    if (!normalized.profile.loginId) resetProgressForAnonymousProfile(normalized);
    stateStore.replaceState(normalized);
    if (!saveState()) throw new Error('The imported state could not be saved to browser storage.');
    eventBus.emit('storage:imported');
    return true;
  } catch (err) {
    console.warn('[Storage] State import rejected:', err.message);
    eventBus.emit('storage:error', { action: 'import', message: err.message });
    return false;
  }
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    stateStore.replaceState(INITIAL_STATE);
    eventBus.emit('storage:reset');
    return true;
  } catch (err) {
    console.error('[Storage] State reset error:', err);
    return false;
  }
}

let saveTimeout = null;
export function setupAutoSave(debounceMs = 1500) {
  stateStore.subscribe(() => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveState(), debounceMs);
  });
}
