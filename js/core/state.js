/**
 * PICLAB Central Reactive State Store
 * Single source of truth for the entire application.
 */

import { eventBus } from './eventBus.js';

export const INITIAL_STATE = {
  profile: { loginId: '', displayName: '', createdAt: null },
  device: { currentId: 'PIC18F4520', clockFreqHz: 8000000, vddVoltage: 5.0, powerState: 'STOPPED' },
  mcu: { status: 'STOPPED', cycleCount: 0, sfr: {
    TRISA:255,PORTA:0,LATA:0,TRISB:255,PORTB:0,LATB:0,TRISC:255,PORTC:0,LATC:0,TRISD:255,PORTD:0,LATD:0,TRISE:7,PORTE:0,LATE:0,
    ADCON0:0,ADCON1:15,ADCON2:0,ADRESH:0,ADRESL:0,CCP1CON:0,CCPR1L:0,PR2:255,T2CON:0,TXSTA:2,RCSTA:0,SPBRG:51,TXREG:0,RCREG:0,INTCON:0,INTCON2:245,INTCON3:192
  }, pinLevels:{}, adc:{channel:0,voltageIn:0,conversionRunning:false,result10Bit:0}, pwm:{enabled:false,dutyPercent:0,frequencyHz:1953,waveformBuffer:[]}, uart:{baudRate:9600,txHistory:[],rxHistory:[],txActive:false}},
  ui:{currentTab:'overview',subView:null,activeLessonId:null,activeLabId:null,activeChallengeId:null,theme:'dark',searchQuery:'',searchOpen:false,modalOpen:null,isMobileNavOpen:false,zoomLevel:1},
  learning:{completedLessons:[],activeLesson:null,completedLabs:[],completedChallenges:[],quizScores:{},progressByTopic:{Architecture:0,GPIO:0,Registers:0,ADC:0,Timers:0,PWM:0,UART:0,MSSP:0}},
  gamification:{xp:0,level:1,levelTitle:'New Explorer',streak:{current:0,best:0,lastDate:null},badges:[],recentAchievements:[]},
  pico:{mood:'happy',speech:'',hintQueue:[],isVisible:true,activeNotification:null}
};

class StateStore {
  constructor(initialState) {
    this._state = JSON.parse(JSON.stringify(initialState));
    /** @type {Set<Function>} */
    this._subscribers = new Set();
  }

  /**
   * Get an immutable snapshot of current state
   * @returns {object}
   */
  getState() {
    return this._state;
  }

  /**
   * Subscribe to any state change
   * @param {Function} listener
   * @returns {() => void} Unsubscribe function
   */
  subscribe(listener) {
    this._subscribers.add(listener);
    return () => this._subscribers.delete(listener);
  }

  /**
   * Set a nested property using dot-notation path
   * @param {string} path - e.g. "ui.currentTab" or "mcu.status"
   * @param {*} value
   * @param {boolean} [notify=true]
   */
  setPath(path, value, notify = true) {
    if (typeof path !== 'string' || !path || path.length > 200) return false;
    const segments = path.split('.');
    const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
    if (segments.some(seg => !seg || forbidden.has(seg))) {
      console.warn('[StateStore] Rejected unsafe state path.');
      return false;
    }
    let current = this._state;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (!(seg in current) || typeof current[seg] !== 'object' || current[seg] === null) {
        current[seg] = {};
      }
      current = current[seg];
    }
    const finalKey = segments[segments.length - 1];
    const prevValue = current[finalKey];
    current[finalKey] = value;

    if (notify) {
      this._notify({ path, prevValue, value });
    }
    return true;
  }

  /**
   * Merge updates into the state tree
   * @param {object} partialState
   * @param {boolean} [notify=true]
   */
  update(partialState, notify = true) {
    if (!partialState || typeof partialState !== 'object' || Array.isArray(partialState)) return false;
    this._deepMerge(this._state, partialState);
    if (notify) {
      this._notify({ path: '*', value: this._state });
    }
    return true;
  }

  /**
   * Replace state entirely (e.g. on restore/import)
   * @param {object} newState
   */
  replaceState(newState) {
    if (!newState || typeof newState !== 'object' || Array.isArray(newState)) return false;
    this._state = this._safeClone(newState);
    this._notify({ path: '*', value: this._state });
    return true;
  }

  _safeClone(value) {
    if (Array.isArray(value)) return value.map(item => this._safeClone(item));
    if (value && typeof value === 'object') {
      const out = {};
      for (const [key, child] of Object.entries(value)) {
        if (key === '__proto__' || key === 'prototype' || key === 'constructor') continue;
        out[key] = this._safeClone(child);
      }
      return out;
    }
    return value;
  }

  _deepMerge(target, source) {
    if (!target || typeof target !== 'object' || Array.isArray(target) || !source || typeof source !== 'object' || Array.isArray(source)) return;
    for (const [key, value] of Object.entries(source)) {
      if (key === '__proto__' || key === 'prototype' || key === 'constructor') continue;
      const isPlainObject = value !== null && typeof value === 'object' && !Array.isArray(value);
      if (isPlainObject && target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        this._deepMerge(target[key], value);
      } else {
        target[key] = this._safeClone(value);
      }
    }
  }

  _notify(changeInfo) {
    // Notify local subscribers
    for (const listener of this._subscribers) {
      try {
        listener(this._state, changeInfo);
      } catch (err) {
        console.error('[StateStore] Subscriber error:', err);
      }
    }

    // Publish to eventBus for broad system awareness
    eventBus.emit('state:changed', { state: this._state, change: changeInfo });

    // Specialized event dispatches
    if (changeInfo.path === 'ui.currentTab') {
      eventBus.emit('ui:tab_changed', changeInfo.value);
    } else if (changeInfo.path === 'device.currentId') {
      eventBus.emit('device:changed', changeInfo.value);
    } else if (changeInfo.path === 'mcu.status') {
      eventBus.emit('mcu:status_changed', changeInfo.value);
    } else if (changeInfo.path === 'pico.mood') {
      eventBus.emit('pico:mood_changed', changeInfo.value);
    } else if (changeInfo.path === 'gamification.xp') {
      eventBus.emit('xp:earned', { totalXp: changeInfo.value });
    }
  }
}

export const stateStore = new StateStore(INITIAL_STATE);
export const getState = () => stateStore.getState();
export const setPath = (path, val, notify) => stateStore.setPath(path, val, notify);
export const updateState = (partial, notify) => stateStore.update(partial, notify);
