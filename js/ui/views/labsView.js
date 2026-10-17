import { stateStore, setPath } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { experiments } from '../../data/experiments.js';

export const labs = experiments.map(e => ({
  ...e,
  id: `exp${String(e.number).padStart(2,'0')}`,
  details: {
    aim: e.objectives[0] || e.title,
    objectives: e.objectives,
    apparatus: e.requirements,
    theory: e.theory,
    procedure: e.procedure,
    code: e.code,
    videoUrl: e.videoUrl,
    sourceCodeNote: e.sourceCodeNote,
    questions: e.questions,
    connections: e.connections,
    conclusion: e.piclab_conclusion,
    sourceFile: e.sourceFile
  }
}));

function award(lab){
  const s = stateStore.getState();
  const current = Array.isArray(s.learning.completedLabs) ? s.learning.completedLabs : [];
  if (current.includes(lab.id)) return false;
  setPath('learning.completedLabs', [...current, lab.id], true);
  setPath('gamification.xp', (s.gamification.xp || 0) + lab.xp, true);
  setPath('gamification.level', Math.max(1, Math.floor(((s.gamification.xp || 0) + lab.xp) / 250) + 1), true);
  eventBus.emit('lab:completed', lab);
  return true;
}

export function completeLab(labId){
  const lab = labs.find(item => item.id === labId);
  if (!lab) return false;
  return award(lab);
}

export function renderLabsView(){
  const s = stateStore.getState();
  const completed = new Set(s.learning.completedLabs || []);
  const count = labs.filter(l => completed.has(l.id)).length;

  return `
  <div class="engineering-workspace">
    <section class="card hero-card lab-index-hero">
      <div>
        <span class="eyebrow">MDM-ESD · ADVANCED MICROCONTROLLER & INTERFACING TECHNIQUES LAB</span>
        <h1>Experiment Laboratory</h1>
        <p>Experiments 1–10 from the supplied 2026–2027 laboratory manuals. Open an experiment to enter its dedicated lab-manual page.</p>
      </div>
      <div class="hero-metric"><strong>${count}/${labs.length}</strong><span>EXPERIMENTS COMPLETE</span></div>
    </section>

    <div class="lab-source-note card">
      <div><span class="eyebrow">HOW TO USE</span><p>Open any experiment to read the objective, apparatus, theory, connections, procedure, source code, code walkthrough, viva questions and conclusion. Marking an experiment complete records it in your local PICLAB progress.</p></div>
      <span class="xp-pill">10 EXPERIMENTS</span>
    </div>

    <div class="lab-filter-bar">
      <button class="chip active" data-lab-filter="all">All</button>
      <button class="chip" data-lab-filter="Foundation">Foundation</button>
      <button class="chip" data-lab-filter="Core">Core</button>
      <button class="chip" data-lab-filter="Intermediate">Intermediate</button>
      <button class="chip" data-lab-filter="Advanced">Advanced</button>
      <input class="input-text lab-search" id="lab-search" placeholder="Search experiments..." aria-label="Search experiments">
    </div>

    <div class="lesson-grid experiment-grid" id="experiment-grid">
      ${labs.map(l => {
        const done = completed.has(l.id);
        return `<article class="card lab-card experiment-card" data-level="${l.level}" data-search="${escapeHtml(`${l.number} ${l.title} ${l.topic} ${l.objectives.join(' ')}`)}">
          <div class="lesson-top">
            <span class="lab-icon">${l.icon}</span>
            <span class="xp-pill">+${l.xp} XP</span>
          </div>
          <span class="eyebrow">EXPERIMENT ${String(l.number).padStart(2,'0')} · ${escapeHtml(l.topic)} · ${escapeHtml(l.level)}</span>
          <h2>${escapeHtml(l.title)}</h2>
          <p>${escapeHtml(l.overview)}</p>
          <div class="lesson-meta"><span>${l.requirements.length} apparatus items</span><span>${done ? '✓ Completed' : 'Not started'}</span></div>
          <button class="btn ${done ? 'btn-secondary' : 'btn-primary'}" data-lab="${l.id}">${done ? 'Open experiment' : 'Open experiment →'}</button>
        </article>`;
      }).join('')}
    </div>
  </div>`;
}

export function bindLabsEvents(container){
  container.querySelectorAll('[data-lab]').forEach(btn => btn.addEventListener('click', () => eventBus.emit('labs:open_lab', btn.dataset.lab)));

  const chips = [...container.querySelectorAll('[data-lab-filter]')];
  const cards = [...container.querySelectorAll('.experiment-card')];
  const search = container.querySelector('#lab-search');
  let filter = 'all';

  const apply = () => {
    const q = (search?.value || '').toLowerCase().trim();
    cards.forEach(c => {
      const visibleLevel = filter === 'all' || c.dataset.level === filter;
      const visibleSearch = !q || c.dataset.search.toLowerCase().includes(q);
      c.style.display = visibleLevel && visibleSearch ? '' : 'none';
    });
  };

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    chip.classList.add('active');
    filter = chip.dataset.labFilter;
    apply();
  }));
  search?.addEventListener('input', apply);
}

function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
