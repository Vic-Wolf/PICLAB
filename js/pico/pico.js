/**
 * PICLAB PICO Interactive Companion Component
 * Manages the rendered avatar, animated moods, speech balloon, and hint interactions.
 */

import { eventBus } from '../core/eventBus.js';
import { stateStore, setPath } from '../core/state.js';
import { getNextHint } from './hints.js';
import { escapeHtml } from '../core/security.js';
import { setupPicoReactions } from './reactions.js';

const ALLOWED_PICO_MOODS = new Set(['idle','happy','excited','thinking','confused','encouraging','celebrating','warning']);

class PicoController {
  constructor() {
    this.container = null;
    this.speechVisible = false;
    this.currentMood = 'happy';
    this.speechText = "Click me whenever you want a useful PIC18 tip.";
    this.context = 'general';
    this.allowHint = false;
  }

  init(containerElement) {
    this.container = containerElement;
    this.currentMood = stateStore.getState().pico.mood || 'happy';
    this.speechText = stateStore.getState().pico.speech || this.speechText;

    setupPicoReactions();
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    eventBus.on('pico:speak', ({ mood, message }) => {
      this.speak(message, mood);
    });

    eventBus.on('pico:mood_changed', (mood) => this.setMood(mood));
    eventBus.on('pico:context', ({context}) => this.setContext(context));
    eventBus.on('pico:tips', ({context='general'}={}) => this.showTip(context));
    eventBus.on('pico:hint_mode', ({context='general'}={}) => { this.allowHint=true; this.context=context; this.requestHint(); });
  }

  speak(message, mood = null) {
    this.speechText = String(message ?? '').slice(0, 600);
    if (ALLOWED_PICO_MOODS.has(mood)) {
      this.currentMood = mood;
    }
    this.speechVisible = true;
    setPath('pico.speech', message, false);
    if (ALLOWED_PICO_MOODS.has(mood)) {
      setPath('pico.mood', mood, false);
    }
    this.render();
  }

  setMood(mood) {
    if (!ALLOWED_PICO_MOODS.has(mood)) return;
    this.currentMood = mood;
    setPath('pico.mood', mood, false);
    this.render();
  }

  toggleSpeech() {
    this.speechVisible = !this.speechVisible;
    this.render();
  }

  setContext(context='general') {
    this.context=context;
    this.allowHint=['lesson','lab','challenge','quiz'].includes(context);
    if(this.allowHint){ this.speak(this.contextMessage(context),'happy'); } else { this.speechVisible=false; this.render(); }
  }

  contextMessage(context){
    return ({lesson:'You are in a lesson. Read the section, then ask me for a tip if you want a simpler explanation.',lab:'Lab mode is active. I can give you a hint about the procedure, code or expected behaviour.',challenge:'Challenge mode is active. Ask for a hint only after you have tried to diagnose the fault yourself.',quiz:'Quiz mode is active. I can give you a conceptual hint without revealing the answer.'})[context] || 'Click me for a PIC18 tip.';
  }

  showTip(context='general'){ this.context=context; this.speak(getNextHint(context), 'thinking'); }
  requestHint() { const hint = getNextHint(this.context==='quiz'?'general':this.context); this.speak(hint, 'thinking'); }

  dismissSpeech() {
    this.speechVisible = false;
    this.render();
  }

  getMascotSvg(mood) {
    // Dynamic crystal and visor colors based on mood
    let crystalColor = '#94DAFF';
    let eyeGlow = '#94DAFF';

    if (mood === 'happy') {
      crystalColor = '#4ade80';
      eyeGlow = '#86efac';
    } else if (mood === 'excited' || mood === 'celebrating') {
      crystalColor = '#facc15';
      eyeGlow = '#fde047';
    } else if (mood === 'warning') {
      crystalColor = '#ef4444';
      eyeGlow = '#f87171';
    } else if (mood === 'thinking') {
      crystalColor = '#94B3FD';
      eyeGlow = '#c7d2fe';
    }

    return `
      <svg class="pico-avatar-svg pico-mood-${mood}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PICO the Robot Mascot">
        <!-- Crystal Antenna Core -->
        <polygon points="50,6 56,18 50,26 44,18" fill="${crystalColor}" stroke="#FFFFFF" stroke-width="1.5" />
        <line x1="50" y1="26" x2="50" y2="34" stroke="#94B3FD" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="50" cy="16" r="3" fill="#FFFFFF" opacity="0.7"/>

        <!-- Robot Head Shell -->
        <rect x="22" y="34" width="56" height="42" rx="14" fill="#0e0354" stroke="#7d67ff" stroke-width="2.5" />
        <!-- Head Circuit Traces -->
        <path d="M 28 42 L 34 42 L 38 48" stroke="#4C3BCF" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M 72 42 L 66 42 L 62 48" stroke="#4C3BCF" stroke-width="1.5" fill="none" stroke-linecap="round"/>

        <!-- Digital Visor Screen -->
        <rect x="28" y="44" width="44" height="22" rx="8" fill="#050024" stroke="#94B3FD" stroke-width="1.5" />

        <!-- Emotive LED Eyes -->
        ${mood === 'excited' || mood === 'celebrating' ? `
          <!-- Starry Eyes -->
          <polygon points="40,51 42,55 46,55 43,57 44,61 40,58 36,61 37,57 34,55 38,55" fill="${eyeGlow}" />
          <polygon points="60,51 62,55 66,55 63,57 64,61 60,58 56,61 57,57 54,55 58,55" fill="${eyeGlow}" />
        ` : mood === 'thinking' ? `
          <!-- Tilted / Analyzing Eyes -->
          <circle cx="40" cy="54" r="5" fill="${eyeGlow}" />
          <circle cx="60" cy="52" r="6" fill="${eyeGlow}" />
          <circle cx="62" cy="51" r="2" fill="#FFFFFF" />
        ` : mood === 'warning' ? `
          <!-- Warning Slanted Eyes -->
          <line x1="36" y1="52" x2="44" y2="56" stroke="${eyeGlow}" stroke-width="3" stroke-linecap="round"/>
          <line x1="64" y1="52" x2="56" y2="56" stroke="${eyeGlow}" stroke-width="3" stroke-linecap="round"/>
        ` : `
          <!-- Happy / Friendly Round Glowing Eyes -->
          <circle cx="40" cy="55" r="4.5" fill="${eyeGlow}" />
          <circle cx="41.5" cy="53.5" r="1.5" fill="#FFFFFF" />
          <circle cx="60" cy="55" r="4.5" fill="${eyeGlow}" />
          <circle cx="61.5" cy="53.5" r="1.5" fill="#FFFFFF" />
        `}

        <!-- Cheek Glow / Audio Grille -->
        <circle cx="32" cy="62" r="1.5" fill="#4C3BCF" />
        <circle cx="68" cy="62" r="1.5" fill="#4C3BCF" />

        <!-- Floating Chassis Ring Base -->
        <ellipse cx="50" cy="84" rx="20" ry="5" fill="#4C3BCF" opacity="0.6" />
        <ellipse cx="50" cy="82" rx="14" ry="3.5" fill="${crystalColor}" opacity="0.8" />
      </svg>
    `;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="pico-hud-wrapper">
        ${this.speechVisible ? `
          <div class="pico-speech-card" role="region" aria-live="polite">
            <div class="pico-speech-header">
              <span class="pico-name-tag">
                <span class="status-dot running"></span> PICO
              </span>
              <span class="pico-mood-badge">${this.currentMood}</span>
            </div>
            <div class="pico-speech-text">
              ${escapeHtml(this.speechText)}
            </div>
            <div class="pico-speech-actions">
              ${this.allowHint ? `<button class="btn btn-secondary btn-sm" id="pico-hint-btn" title="Ask PICO for a hint">💡 Hint</button>` : `<button class="btn btn-secondary btn-sm" id="pico-tip-btn" title="Ask PICO for a tip">💬 Tips</button>`}
              <button class="btn btn-secondary btn-sm" id="pico-dismiss-btn" title="Dismiss speech bubble" aria-label="Dismiss">
                ✕ Close
              </button>
            </div>
          </div>
        ` : ''}

        <button class="pico-avatar-btn" id="pico-avatar-toggle" title="Click PICO to talk" aria-label="Interact with PICO learning companion">
          ${this.getMascotSvg(this.currentMood)}
        </button>
      </div>
    `;

    // Attach local button listeners
    const avatarBtn = this.container.querySelector('#pico-avatar-toggle');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => { if (!this.speechVisible) this.showTip(this.context); else this.dismissSpeech(); });
    }

    const hintBtn = this.container.querySelector('#pico-hint-btn'); if (hintBtn) hintBtn.addEventListener('click', () => this.requestHint());
    const tipBtn = this.container.querySelector('#pico-tip-btn'); if (tipBtn) tipBtn.addEventListener('click', () => this.showTip(this.context));

    const dismissBtn = this.container.querySelector('#pico-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => this.dismissSpeech());
    }
  }
}

export const picoController = new PicoController();
