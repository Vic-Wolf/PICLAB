/**
 * PICLAB Global Search System
 * Quick command palette and index search across devices, navigation, registers, and labs.
 */

import { eventBus } from '../core/eventBus.js';
import { deviceManager, getCurrentPins, getCurrentRegisters } from '../core/deviceManager.js';
import { openModal, closeModal } from './modal.js';
import { escapeHtml } from '../core/security.js';

export const SEARCH_INDEX = [
  // Navigation & Workspaces
  { id: 'nav-overview', title: 'Dashboard / Overview', category: 'Navigation', keywords: 'home dashboard progress status stats', action: { type: 'nav', target: 'overview' } },
  { id: 'nav-learn', title: 'Learn Lessons', category: 'Navigation', keywords: 'tutorials courses theory architecture memory', action: { type: 'nav', target: 'learn' } },
  { id: 'nav-pinout', title: 'Pinout & Pin Explorer', category: 'Navigation', keywords: 'pins package dip40 mclr vdd vss ra0 rb0 multiplexing', action: { type: 'nav', target: 'pinout' } },
  { id: 'nav-registers', title: 'SFR Register Explorer', category: 'Navigation', keywords: 'sfr tris port lat adcon ccp timer status registers bits', action: { type: 'nav', target: 'registers' } },
  { id: 'nav-labs', title: 'Engineering Experiments 1-10', category: 'Navigation', keywords: 'labs experiments gpio adc pwm uart sensors actuators', action: { type: 'nav', target: 'labs' } },
  { id: 'nav-challenges', title: 'Fault Troubleshooting Arena — 53 Missions', category: 'Navigation', keywords: 'challenges bugs faults debug diagnose broken circuits', action: { type: 'nav', target: 'challenges' } },
  { id: 'nav-progress', title: 'Learning Progress & Badges', category: 'Navigation', keywords: 'achievements badges streak levels statistics', action: { type: 'nav', target: 'progress' } },
  { id: 'nav-help', title: 'Help, FAQ & Documentation', category: 'Navigation', keywords: 'help faq docs microchip datasheet export import reset shortcuts', action: { type: 'nav', target: 'help' } },

  // Supported Microcontroller Target
  { id: 'dev-pic18f4520', title: 'Device: PIC18F4520 (Reference Target)', category: 'Devices', keywords: '4520 microchip 32kb flash 13 adc dip40 standard', action: { type: 'device', target: 'PIC18F4520' } },

  // Core Hardware Concepts & Quick Launchers
  { id: 'concept-gpio', title: 'GPIO: TRIS vs PORT vs LAT', category: 'Theory', keywords: 'tris port lat direction input output digital rmw', action: { type: 'nav', target: 'registers' } },
  { id: 'concept-adc', title: 'ADC: 10-Bit Successive Approximation', category: 'Peripherals', keywords: 'analog digital adresh adresl adcon0 adcon1 vref 1023', action: { type: 'nav', target: 'labs' } },
  { id: 'concept-pwm', title: 'PWM: CCP Modules & Duty Cycle', category: 'Peripherals', keywords: 'ccp ccp1con pr2 tmr2 frequency modulation motor led', action: { type: 'nav', target: 'labs' } }
];

class SearchController {
  constructor() {
    this.resultsContainer = null;
    this.searchInput = null;
    this.selectedIndex = 0;
    this.currentMatches = [];
  }

  init() {
    this.searchInput = document.getElementById('global-search-input');
    this.resultsContainer = document.getElementById('search-results-list');

    // Global keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openModal('search-modal');
        if (this.searchInput) {
          this.searchInput.value = '';
          this.performSearch('');
          this.searchInput.focus();
        }
      }
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelection();
        }
      });
    }
  }

  performSearch(query) {
    const dynamic = [
      ...Object.values(getCurrentRegisters()),
      ...getCurrentPins()
    ].map(item => {
      if (item.name && item.address) return { id:`reg-${item.name}`, title:`Register: ${item.name}`, category:'SFR', keywords:`${item.category} ${item.description}`, action:{type:'nav',target:'registers'} };
      return { id:`pin-${item.id}`, title:`Pin: ${item.name}`, category:'Pinout', keywords:`${item.id} ${item.alternateFunctions?.join(' ')||''}`, action:{type:'nav',target:'pinout'} };
    });
    const index=[...SEARCH_INDEX,...dynamic];
    if (!query) {
      this.currentMatches = index.slice(0, 8);
    } else {
      const q = query.trim().toLowerCase();
      this.currentMatches = index.filter(item => item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)).slice(0, 12);
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  moveSelection(direction) {
    if (this.currentMatches.length === 0) return;
    this.selectedIndex = (this.selectedIndex + direction + this.currentMatches.length) % this.currentMatches.length;
    this.renderResults();
  }

  executeSelection() {
    const selected = this.currentMatches[this.selectedIndex];
    if (!selected) return;

    closeModal('search-modal');

    if (selected.action.type === 'nav') {
      eventBus.emit('ui:navigate', selected.action.target);
    } else if (selected.action.type === 'device') {
      deviceManager.setCurrentDevice(selected.action.target);
    }
  }

  renderResults() {
    if (!this.resultsContainer) return;

    if (this.currentMatches.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--preview);">
          No matching items found. Try searching for "GPIO", "ADC", "PIC18F4520", or a register name.
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = this.currentMatches.map((item, index) => `
      <li class="search-result-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}" style="
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.65rem 1rem; border-radius: var(--radius-md); cursor: pointer;
        background: ${index === this.selectedIndex ? 'var(--interactive)' : 'transparent'};
        border: 1px solid ${index === this.selectedIndex ? 'var(--active)' : 'transparent'};
        margin-bottom: 0.3rem; transition: all 0.15s ease;
      ">
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 600; color: ${index === this.selectedIndex ? '#FFFFFF' : 'var(--text-main)'}; font-size: 0.9rem;">${escapeHtml(item.title)}</span>
          <span style="font-size: 0.75rem; color: var(--preview);">${escapeHtml(item.keywords)}</span>
        </div>
        <span class="badge" style="background: rgba(148, 218, 255, 0.15); color: var(--active); border: 1px solid rgba(148, 218, 255, 0.3);">
          ${item.category}
        </span>
      </li>
    `).join('');

    // Attach click events
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach(el => {
      el.addEventListener('click', () => {
        this.selectedIndex = parseInt(el.dataset.index, 10);
        this.executeSelection();
      });
    });
  }
}

export const searchController = new SearchController();
