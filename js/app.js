/**
 * PICLAB Application Master Entry Point
 * Orchestrates Core State, EventBus, Storage, Device Manager, PICO, Navigation, and UI.
 */

import { stateStore, getState, setPath } from './core/state.js';
import { eventBus } from './core/eventBus.js';
import { loadState, setupAutoSave, exportState, importState, resetState } from './core/storage.js';
import { deviceManager, getCurrentDevice, setCurrentDevice } from './core/deviceManager.js';
import { navigationController, navigateTo } from './ui/navigation.js';
import { picoController } from './pico/pico.js';
import { searchController } from './ui/search.js';
import { openModal, closeModal } from './ui/modal.js';
import { initTheme } from './ui/theme.js';

class PiclabApp {
  constructor() {
    this.initialized = false;
    this.deferredInstallPrompt = null;
  }

  init() {
    console.info('[PICLAB] Initializing architecture foundation...');

    // 1. Restore persisted state from LocalStorage if available
    loadState();
    deviceManager.ensureRegisterState();

    // 2. Initialize Theme System
    initTheme();

    // 3. Initialize UI Navigation & Master Shell
    const sidebarEl = document.getElementById('app-sidebar');
    const contentEl = document.getElementById('app-content');
    const mobileToggleEl = document.getElementById('mobile-nav-btn');
    const backdropEl = document.getElementById('sidebar-backdrop');

    navigationController.init(sidebarEl, contentEl, mobileToggleEl, backdropEl);

    // 4. Initialize PICO Mascot & Dialogue Engine
    const picoContainer = document.getElementById('pico-container');
    picoController.init(picoContainer);

    // 5. Initialize Global Search Controller
    searchController.init();

    this.bindKeyboardShortcuts();

    // 6. Bind Header Controls & Sync Dynamic Badges
    this.bindHeaderControls();
    this.syncHeaderBadges();
    this.bindProfileControls();
    this.ensureProfile();

    // 7. Bind Modals and install/offline experience
    this.bindModalControls();
    this.initInstallExperience();

    // 8. Start debounced LocalStorage auto-save
    setupAutoSave();

    // 9. Subscribe to global system events for header badge updates
    this.bindGlobalEvents();

    this.initialized = true;
    console.info('[PICLAB] Foundation & Design System successfully loaded. Ready.');
  }

  bindHeaderControls() {
    // Header Device Selector
    const devSelect = document.getElementById('header-device-select');
    if (devSelect) {
      const currentDev = getCurrentDevice();
      devSelect.value = currentDev.id;
      devSelect.addEventListener('change', (e) => {
        setCurrentDevice(e.target.value);
      });
    }

    // Header Search Button
    const searchBtn = document.getElementById('header-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        openModal('search-modal');
        const input = document.getElementById('global-search-input');
        if (input) {
          input.value = '';
          searchController.performSearch('');
          input.focus();
        }
      });
    }

    const settingsBtn = document.getElementById('header-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        openModal('settings-modal');
      });
    }

    // Logo Click -> Dashboard
    const logoLink = document.getElementById('app-logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('overview');
      });
    }
  }



  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const typing = target && (target.matches('input, textarea, select') || target.isContentEditable);
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open, .modal-backdrop.active, .modal-backdrop[style*="display: flex"], [role="dialog"].is-open').forEach(modal => {
          if (modal.id) closeModal(modal.id); else modal.classList.remove('is-open');
        });
        document.querySelectorAll('[data-challenge-dialog], .challenge-diagnosis-modal').forEach(dialog => { if (dialog.open && typeof dialog.close === 'function') dialog.close(); else dialog.remove(); });
        return;
      }
      if ((event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        const modal = document.getElementById('search-modal');
        if (modal) openModal('search-modal');
        const input = document.getElementById('global-search-input');
        if (input) { input.focus(); input.select(); }
      }
    });
    document.addEventListener('click', event => {
      const term = event.target.closest('.term-tooltip');
      document.querySelectorAll('.term-tooltip.is-open').forEach(item => { if (item !== term) item.classList.remove('is-open'); });
      if (term && matchMedia('(hover: none)').matches) term.classList.toggle('is-open');
    });
  }

  bindProfileControls() {
    const btn=document.getElementById('header-profile-btn');
    const close=document.getElementById('profile-modal-close');
    const save=document.getElementById('profile-save-btn');
    const modal=document.getElementById('profile-modal');
    const open=()=>{const p=getState().profile||{};document.getElementById('profile-login-id').value=p.loginId||'';document.getElementById('profile-display-name').value=p.displayName||'';openModal('profile-modal');};
    btn?.addEventListener('click',open); close?.addEventListener('click',()=>closeModal('profile-modal'));
    modal?.addEventListener('click',e=>{if(e.target===modal)closeModal('profile-modal')});
    save?.addEventListener('click',()=>{const loginId=document.getElementById('profile-login-id').value.replace(/[\x00-\x1F\x7F]/g,'').trim().slice(0,64);const displayName=document.getElementById('profile-display-name').value.replace(/[\x00-\x1F\x7F]/g,'').trim().slice(0,80);const warning=document.getElementById('profile-warning');if(!loginId){warning.textContent='Please enter a Profile ID. This identifies your profile only in this browser.';return;}setPath('profile.loginId',loginId,true);setPath('profile.displayName',displayName||loginId,true);if(!getState().profile.createdAt)setPath('profile.createdAt',new Date().toISOString(),true);closeModal('profile-modal');this.syncHeaderBadges();eventBus.emit('pico:speak',{mood:'happy',message:`Profile saved. Welcome ${displayName||loginId}! Your PICLAB progress now belongs to this local profile.`});});
  }

  ensureProfile() {
    const p=getState().profile||{};
    if(!p.loginId){setTimeout(()=>openModal('profile-modal'),350);}
  }

  syncHeaderBadges() {
    const state = getState();
    const xpBadge = document.getElementById('header-xp-badge');
    if (xpBadge) {
      xpBadge.textContent = `⚡ ${state.gamification.xp} XP`;
    }

    const lvlBadge = document.getElementById('header-level-badge');
    if (lvlBadge) {
      lvlBadge.textContent = `LVL ${state.gamification.level}`;
    }

    const streakBadge = document.getElementById('header-streak-badge');
    if (streakBadge) {
      streakBadge.textContent = `🔥 ${state.gamification.streak.current}d`;
    }

    const devSelect = document.getElementById('header-device-select');
    if (devSelect) devSelect.value = state.device.currentId;
    const name=document.getElementById('header-profile-name'); if(name) name.textContent=state.profile?.displayName||state.profile?.loginId||'Profile';
    const themeBtn=document.getElementById('header-theme-btn'); if(themeBtn) themeBtn.textContent=state.ui.theme==='light'?'◐ Dark mode':'◐ Light mode';
  }

  bindModalControls() {
    // Search Modal Close
    const searchClose = document.getElementById('search-modal-close');
    if (searchClose) {
      searchClose.addEventListener('click', () => closeModal('search-modal'));
    }

    // Settings Modal Close
    const settingsClose = document.getElementById('settings-modal-close');
    if (settingsClose) {
      settingsClose.addEventListener('click', () => closeModal('settings-modal'));
    }

    // Settings Modal: Export State
    const modalExportBtn = document.getElementById('modal-export-btn');
    if (modalExportBtn) {
      modalExportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportState());
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `piclab_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        closeModal('settings-modal');
        eventBus.emit('pico:speak', { mood: 'happy', message: 'Backup file exported successfully!' });
      });
    }

    // Settings Modal: Import State
    const modalImportBtn = document.getElementById('modal-import-btn');
    if (modalImportBtn) {
      modalImportBtn.addEventListener('click', () => {
        const jsonStr = prompt("Paste your PICLAB exported JSON here:");
        if (jsonStr) {
          if (importState(jsonStr)) {
            alert("State imported successfully!");
            location.reload();
          } else {
            alert("Failed to parse JSON. Please check file formatting.");
          }
        }
      });
    }

    // Settings Modal: Reset State
    const modalResetBtn = document.getElementById('modal-reset-btn');
    if (modalResetBtn) {
      modalResetBtn.addEventListener('click', () => {
        if (confirm("Reset all progress, registers, MCU state, and lab state to defaults?")) {
          resetState();
          closeModal('settings-modal');
          location.reload();
        }
      });
    }

    // Click outside backdrop to close
    ['search-modal', 'settings-modal'].forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal(modalId);
          }
        });
      }
    });
  }

  initInstallExperience() {
    const installButton = document.getElementById('install-app-btn');
    const status = document.getElementById('install-app-status');

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredInstallPrompt = event;
      if (installButton) installButton.textContent = '📲 Install PICLAB on this device';
      if (status) status.textContent = 'Your browser supports installation. Choose Install to add PICLAB to your home screen or app launcher.';
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      if (installButton) installButton.textContent = '✓ PICLAB installed';
      if (status) status.textContent = 'PICLAB is installed on this device. Open it from your home screen or app launcher.';
    });

    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (this.deferredInstallPrompt) {
          const promptEvent = this.deferredInstallPrompt;
          this.deferredInstallPrompt = null;
          try {
            await promptEvent.prompt();
            const result = await promptEvent.userChoice;
            if (status) status.textContent = result?.outcome === 'accepted'
              ? 'Installation accepted. Open PICLAB from your home screen or app launcher.'
              : 'Installation was dismissed. You can install PICLAB later from your browser menu.';
          } catch {
            if (status) status.textContent = 'Your browser could not open the install prompt. Use the browser menu to install this site.';
          }
          return;
        }

        const ua = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
        if (isIOS && isSafari && !navigator.standalone) {
          if (status) status.textContent = 'On iPhone/iPad: open this page in Safari, tap Share, then choose “Add to Home Screen”. Open PICLAB online once before relying on offline access.';
        } else if (navigator.standalone) {
          if (status) status.textContent = 'PICLAB is already running as an installed home-screen app.';
        } else if (status) {
          status.textContent = 'Open your browser menu and choose “Install app” or “Add to Home Screen”. Install and offline support require a secure HTTPS site (or localhost for testing).';
        }
      });
    }

    // Service workers require HTTPS, except localhost development.
    if ('serviceWorker' in navigator && (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      const swUrl = new URL('../service-worker.js', import.meta.url);
      const appScope = new URL('../', import.meta.url);
      navigator.serviceWorker.register(swUrl, { scope: appScope.pathname })
        .then(() => navigator.serviceWorker.ready)
        .then(() => {
          if (status && !this.deferredInstallPrompt) status.textContent = 'Install PICLAB on this device for a home-screen shortcut. The app shell and bundled lessons are cached for later offline visits.';
        })
        .catch((error) => {
          console.warn('[PICLAB] Offline support could not be registered:', error);
          if (status) status.textContent = 'Offline caching is unavailable in this browser or host. PICLAB still works online; serve the site over HTTPS to enable it.';
        });
    } else if (status) {
      status.textContent = 'Install and offline caching require HTTPS hosting. GitHub Pages, Vercel and Cloudflare Pages support secure hosting.';
    }
  }

  bindGlobalEvents() {
    eventBus.on('device:changed', () => {
      this.syncHeaderBadges();
      if (this.initialized) navigationController.navigateTo(getState().ui.currentTab, false);
    });

    eventBus.on('xp:earned', () => {
      this.syncHeaderBadges();
    });

  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new PiclabApp();
  app.init();
});
