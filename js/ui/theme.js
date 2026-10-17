import { stateStore, setPath } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';

// PICLAB uses a single dark engineering theme; old saved light preferences are normalized.
export function initTheme(){ applyTheme('dark'); }
export function applyTheme(){
  const theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  setPath('ui.theme', theme, true);
  eventBus.emit('theme:changed', theme);
}
export function toggleTheme(){ applyTheme('dark'); return 'dark'; }
