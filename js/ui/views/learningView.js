import { stateStore, setPath } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { lessons } from '../../data/lessons.js';


function renderQuizEntry(){return `<section class="card learning-quiz-entry"><div><span class="eyebrow">KNOWLEDGE CHECK</span><h2>Quiz missions</h2><p>Quizzes now live inside the Learning path. Finish lessons, then test your understanding with PICO-guided missions.</p></div><button class="btn btn-primary" id="open-learning-quiz">Start a quiz mission →</button></section>`}

export function renderLearnView(){
 const state=stateStore.getState();
 const avg=Math.round(Object.values(state.learning.progressByTopic).reduce((a,b)=>a+b,0)/Object.keys(state.learning.progressByTopic).length);
 return `<div class="engineering-workspace"><section class="card hero-card"><div><span class="eyebrow">GUIDED CURRICULUM</span><h1>Learn PIC18</h1><p>Structured reading, interactive hardware exploration and knowledge checks. Your progress is recorded against your local profile.</p></div><div class="hero-metric"><strong>${avg}%</strong><span>CURRICULUM</span></div></section>
 <div class="lesson-grid">${lessons.map(l=>{const p=state.learning.progressByTopic[l.topic]||0;const done=p>=100;return `<article class="card lesson-card"><div class="lesson-top"><span class="badge">${l.level}</span><span class="xp-pill">+${l.xp} XP</span></div><span class="eyebrow">${l.topic}</span><h2>${l.title}</h2><div class="progress-track"><span style="width:${p}%"></span></div><div class="lesson-meta"><span>${p}% complete</span><span>${done?'MASTERED':'READY TO STUDY'}</span></div><p>${l.summary}</p><button class="btn ${done?'btn-secondary':'btn-primary'}" data-lesson="${l.id}">${done?'Open lesson':'Study lesson →'}</button></article>`}).join('')}</div>
 ${renderQuizEntry()}
</div>`;
}

export function bindLearnEvents(container){
 container.querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>eventBus.emit('learn:open_lesson',b.dataset.lesson)));
 container.querySelector('#open-learning-quiz')?.addEventListener('click',()=>eventBus.emit('learn:open_quiz'));
}
