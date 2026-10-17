/**
 * PICLAB Navigation Controller
 * Manages active workspace view switching, sidebar state, mobile drawer, and URL state sync.
 */

import { stateStore, setPath } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';
import { renderOverviewView, bindOverviewEvents } from './views/overviewView.js';
import { renderLearnView, bindLearnEvents } from './views/learningView.js';
import { renderPinoutView, bindPinoutEvents } from './views/pinoutView.js';
import { renderRegistersView, bindRegisterEvents } from './views/registerView.js';
import { renderLabsView, bindLabsEvents } from './views/labsView.js';
import { renderChallengesView, renderChallengeDetailView, bindChallengesEvents } from './views/challengesView.js';
import { renderProgressView } from './views/progressView.js';
import { renderHelpView } from './views/helpView.js';
import { renderLessonDetailView, bindLessonDetailEvents } from './views/lessonDetailView.js';
import { renderLabDetailView, bindLabDetailEvents } from './views/labDetailView.js';
import { bindQuizEvents, renderQuizView } from './views/quizView.js';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '🏠', badge: null },
  { id: 'learn', label: 'Learn', icon: '📚', badge: '8' },
  { id: 'pinout', label: 'Pinout', icon: '📍', badge: '40-PIN' },
  { id: 'registers', label: 'Registers', icon: '📊', badge: 'SFR' },
  { id: 'labs', label: 'Labs', icon: '🧪', badge: '10' },
  { id: 'challenges', label: 'Challenges', icon: '🔍', badge: '53' },
  { id: 'progress', label: 'Progress', icon: '🏆', badge: null },
  { id: 'help', label: 'Help & Docs', icon: '📖', badge: null }
];

class NavigationController {
  constructor() {
    this.sidebarContainer = null;
    this.contentContainer = null;
    this.mobileToggleBtn = null;
    this.backdrop = null;
  }

  init(sidebarEl, contentEl, mobileToggleEl, backdropEl) {
    this.sidebarContainer = sidebarEl;
    this.contentContainer = contentEl;
    this.mobileToggleBtn = mobileToggleEl;
    this.backdrop = backdropEl;

    this.bindEvents();
    this.renderSidebar();
    
    // Initial navigation / deep links. Preserve detail subviews when the URL points to one.
    const hash = (window.location.hash || '').replace(/^#/, '');
    let initialTab = stateStore.getState().ui.currentTab || 'overview';
    let preserveDetail = false;
    if (hash.startsWith('learn/')) {
      initialTab = 'learn';
      preserveDetail = true;
      const id = hash.split('/')[1];
      if (id === 'quiz') {
        setPath('ui.subView', 'quiz', false);
        setPath('ui.activeLessonId', null, false);
      } else {
        setPath('ui.subView', 'lesson', false);
        setPath('ui.activeLessonId', id, false);
      }
      setPath('ui.activeLabId', null, false);
    } else if (hash.startsWith('challenges/')) {
      initialTab = 'challenges';
      preserveDetail = true;
      setPath('ui.subView', 'challenge', false);
      setPath('ui.activeChallengeId', hash.split('/')[1], false);
      setPath('ui.activeLabId', null, false);
      setPath('ui.activeLessonId', null, false);
    } else if (hash.startsWith('labs/')) {
      initialTab = 'labs';
      preserveDetail = true;
      setPath('ui.subView', 'lab', false);
      setPath('ui.activeLabId', hash.split('/')[1], false);
      setPath('ui.activeLessonId', null, false);
    } else if (hash && NAV_ITEMS.some(x => x.id === hash)) {
      initialTab = hash;
    }
    this.navigateTo(initialTab, false, preserveDetail);
    window.addEventListener('popstate', () => this.handleRoute());
  }

  handleRoute() {
    const hash = (window.location.hash || '').replace(/^#/, '');
    if (hash.startsWith('learn/')) {
      const id = hash.split('/')[1];
      setPath('ui.subView', id === 'quiz' ? 'quiz' : 'lesson', false);
      setPath('ui.activeLessonId', id === 'quiz' ? null : id, false);
      setPath('ui.activeLabId', null, false);
      this.navigateTo('learn', false, true);
    } else if (hash.startsWith('challenges/')) {
      const id = hash.split('/')[1];
      setPath('ui.subView', 'challenge', false);
      setPath('ui.activeChallengeId', id, false);
      this.navigateTo('challenges', false, true);
    } else if (hash.startsWith('labs/')) {
      setPath('ui.subView', 'lab', false);
      setPath('ui.activeLabId', hash.split('/')[1], false);
      setPath('ui.activeLessonId', null, false);
      this.navigateTo('labs', false, true);
    } else if (NAV_ITEMS.some(x => x.id === hash)) {
      this.navigateTo(hash, false);
    }
  }

  bindEvents() {
    // Listen to global navigation events (from search, quick launcher, etc.)
    eventBus.on('ui:navigate', (tabId) => { this.navigateTo(tabId); });
    eventBus.on('learn:open_lesson', (lessonId) => { setPath('ui.subView','lesson',false); setPath('ui.activeLessonId',lessonId,false); setPath('ui.activeLabId',null,false); this.navigateTo('learn', true, true); });
    eventBus.on('learn:open_quiz', () => { setPath('ui.subView','quiz',false); setPath('ui.activeLessonId',null,false); setPath('ui.activeLabId',null,false); this.navigateTo('learn', true, true); });
    eventBus.on('labs:open_lab', (labId) => { setPath('ui.subView','lab',false); setPath('ui.activeLabId',labId,false); setPath('ui.activeLessonId',null,false); this.navigateTo('labs', true, true); });
    eventBus.on('challenges:open', (challengeId) => { setPath('ui.subView','challenge',false); setPath('ui.activeChallengeId',challengeId,false); setPath('ui.activeLabId',null,false); setPath('ui.activeLessonId',null,false); this.navigateTo('challenges', true, true); });
    eventBus.on('challenges:back', () => { setPath('ui.subView',null,false); setPath('ui.activeChallengeId',null,false); this.navigateTo('challenges', true); });

    // Mobile toggle
    if (this.mobileToggleBtn) {
      this.mobileToggleBtn.addEventListener('click', () => {
        this.toggleMobileNav();
      });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => {
        this.closeMobileNav();
      });
    }

    // Escape closes the drawer; resizing back to desktop restores regular navigation.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeMobileNav();
    });
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const syncNavigationMode = () => {
      if (!mobileQuery.matches) this.closeMobileNav();
      else if (!this.sidebarContainer?.classList.contains('mobile-open')) this.closeMobileNav();
    };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncNavigationMode);
    else mobileQuery.addListener(syncNavigationMode);
    syncNavigationMode();
  }

  toggleMobileNav() {
    if (!this.sidebarContainer) return;
    const isOpen = this.sidebarContainer.classList.contains('mobile-open');
    if (isOpen) {
      this.closeMobileNav();
    } else {
      this.sidebarContainer.classList.add('mobile-open');
      this.sidebarContainer.inert = false;
      if (this.backdrop) this.backdrop.classList.add('active');
      if (this.mobileToggleBtn) {
        this.mobileToggleBtn.setAttribute('aria-expanded', 'true');
        this.mobileToggleBtn.setAttribute('aria-label', 'Close navigation menu');
        this.mobileToggleBtn.setAttribute('title', 'Close Menu');
      }
      const firstLink = this.sidebarContainer.querySelector('.nav-link');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }
  }

  closeMobileNav() {
    if (this.sidebarContainer) {
      this.sidebarContainer.classList.remove('mobile-open');
      // Closed drawer links must not be reachable by keyboard on mobile.
      this.sidebarContainer.inert = window.matchMedia('(max-width: 768px)').matches;
    }
    if (this.backdrop) {
      this.backdrop.classList.remove('active');
    }
    if (this.mobileToggleBtn) {
      this.mobileToggleBtn.setAttribute('aria-expanded', 'false');
      this.mobileToggleBtn.setAttribute('aria-label', 'Open navigation menu');
      this.mobileToggleBtn.setAttribute('title', 'Open Menu');
    }
  }

  navigateTo(tabId, notify = true, preserveDetail = false) {
    const valid = NAV_ITEMS.some(item => item.id === tabId);
    const target = valid ? tabId : 'overview';

    // Update application state. Detail pages are preserved only for explicit detail routes/events.
    setPath('ui.currentTab', target, notify);
    if (preserveDetail) {
      if (target === 'learn') setPath('ui.activeLabId', null, false);
      if (target === 'labs') setPath('ui.activeLessonId', null, false);
      if (target === 'challenges') { setPath('ui.activeLabId', null, false); setPath('ui.activeLessonId', null, false); }
    } else {
      setPath('ui.subView', null, false);
      setPath('ui.activeLessonId', null, false);
      setPath('ui.activeLabId', null, false);
      setPath('ui.activeChallengeId', null, false);
    }
    if (notify) { const uiNow=stateStore.getState().ui; const route=(target==='learn'&&uiNow.subView==='lesson'&&uiNow.activeLessonId)?`#learn/${uiNow.activeLessonId}`:(target==='learn'&&uiNow.subView==='quiz')?'#learn/quiz':(target==='labs'&&uiNow.subView==='lab'&&uiNow.activeLabId)?`#labs/${uiNow.activeLabId}`:(target==='challenges'&&uiNow.subView==='challenge'&&uiNow.activeChallengeId)?`#challenges/${uiNow.activeChallengeId}`:`#${target}`; if(window.location.hash!==route) history.pushState({},'',route); }

    // Update sidebar link active classes
    if (this.sidebarContainer) {
      const links = this.sidebarContainer.querySelectorAll('.nav-link');
      links.forEach(link => {
        if (link.dataset.tab === target) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }

    // Render workspace view
    this.renderActiveWorkspace(target);

    // Auto-close mobile drawer
    this.closeMobileNav();
  }

  renderSidebar() {
    if (!this.sidebarContainer) return;

    this.sidebarContainer.innerHTML = `
      <div>
        <div class="nav-group-title">Navigation</div>
        <ul class="nav-list">
          ${NAV_ITEMS.map(item => `
            <li class="nav-item">
              <a class="nav-link" href="#${item.id}" data-tab="${item.id}" tabindex="0">
                <span class="nav-icon">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Quick System Info Footer in Sidebar -->
      <div style="padding: 1rem; border-top: 1px solid var(--border-subtle); font-size: 0.75rem; color: var(--preview);">
        <div style="font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem;">PICLAB v1.0</div>
        <div>PIC18 Architecture Lab</div>
        <div style="color: var(--active); margin-top: 0.4rem; font-family: var(--font-mono);">Harvard Architecture</div>
      </div>
    `;

    // Bind link click handlers
    const links = this.sidebarContainer.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        this.navigateTo(tab);
      });

    });
  }

  renderActiveWorkspace(tabId) {
    if (!this.contentContainer) return;

    let viewHtml = '';
    switch (tabId) {
      case 'overview':
        viewHtml = renderOverviewView();
        break;
      case 'learn':
        { const ui=stateStore.getState().ui; viewHtml = ui.subView==='lesson' && ui.activeLessonId ? renderLessonDetailView(ui.activeLessonId) : ui.subView==='quiz' ? renderQuizView() : renderLearnView(); }
        break;
      case 'pinout':
        viewHtml = renderPinoutView();
        break;
      case 'registers':
        viewHtml = renderRegistersView();
        break;
      case 'labs':
        { const ui=stateStore.getState().ui; viewHtml = ui.subView==='lab' && ui.activeLabId ? renderLabDetailView(ui.activeLabId) : renderLabsView(); }
        break;
      case 'challenges':
        { const ui=stateStore.getState().ui; viewHtml = ui.subView==='challenge' && ui.activeChallengeId ? renderChallengeDetailView(ui.activeChallengeId) : renderChallengesView(); }
        break;

      case 'progress':
        viewHtml = renderProgressView();
        break;
      case 'help':
        viewHtml = renderHelpView();
        break;
      default:
        viewHtml = renderOverviewView();
    }

    this.contentContainer.innerHTML = `
      <div class="workspace-panel active" id="panel-${tabId}" role="region" aria-label="${tabId} workspace">
        ${viewHtml}
      </div>
    `;

    // Post-render event bindings
    const panel = this.contentContainer.querySelector('.workspace-panel');
    if (tabId === 'overview') bindOverviewEvents(this.contentContainer);
    else if (tabId === 'learn') { const ui=stateStore.getState().ui; if(ui.subView==='lesson' && ui.activeLessonId) bindLessonDetailEvents(panel,ui.activeLessonId,()=>{setPath('ui.subView',null,false);setPath('ui.activeLessonId',null,false);this.navigateTo('learn')}); else if(ui.subView==='quiz') bindQuizEvents(panel,()=>{setPath('ui.subView',null,false);this.navigateTo('learn')}); else bindLearnEvents(panel); }
    else if (tabId === 'pinout') bindPinoutEvents(panel);
    else if (tabId === 'registers') bindRegisterEvents(panel);
    else if (tabId === 'labs') { const ui=stateStore.getState().ui; if(ui.subView==='lab' && ui.activeLabId) bindLabDetailEvents(panel,ui.activeLabId,()=>{setPath('ui.subView',null,false);setPath('ui.activeLabId',null,false);this.navigateTo('labs')}); else bindLabsEvents(panel); }
    else if (tabId === 'challenges') bindChallengesEvents(panel);

  }
}

export const navigationController = new NavigationController();
export const navigateTo = (tab) => navigationController.navigateTo(tab);
