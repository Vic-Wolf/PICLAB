import { stateStore, setPath } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { lessons } from '../../data/lessons.js';

const LESSON_GLOSSARY={'Prescaler':'A divider that reduces a clock rate.','Tristate':'A high-impedance pin state.','Baud Rate':'The serial communication symbol rate.','Interrupt Vector':'The defined interrupt entry point.','Duty Cycle':'The active portion of one PWM period, expressed as a percentage.'};
function numberedLessonCode(code){return code.split('\n').map((line,i)=>`<span class="lesson-code-line" data-line="${i+1}">${esc(line)}</span>`).join('\n');}
function glossaryMarkup(html){return html.replace(/\b(Prescaler|Tristate|Baud Rate|Interrupt Vector|Duty Cycle)\b/gi,t=>{const k=Object.keys(LESSON_GLOSSARY).find(x=>x.toLowerCase()===t.toLowerCase())||t;return `<span class="term-tooltip" tabindex="0" data-definition="${LESSON_GLOSSARY[k]}">${t}<span class="term-tooltip-popover" role="tooltip">${LESSON_GLOSSARY[k]}</span></span>`;});}
function esc(s=''){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}

export function renderLessonDetailView(lessonId){
  const lesson=lessons.find(x=>x.id===lessonId)||lessons[0];
  const s=stateStore.getState();
  const progress=s.learning.progressByTopic[lesson.topic]||0;
  const isLessonCompleted=(s.learning.completedLessons||[]).includes(lesson.id);
  const sections=lesson.sections||[];
  return `<div class="engineering-workspace detail-page">
    <div class="detail-toolbar"><button class="btn btn-secondary" id="back-to-learn">← Back to Learn</button><span class="eyebrow">LESSON · ${esc(lesson.level)}</span><span class="detail-progress">${progress}% complete</span></div>
    <section class="card lesson-hero"><div><span class="eyebrow">${esc(lesson.topic)}</span><h1>${esc(lesson.title)}</h1><p>${esc(lesson.summary)}</p></div><div class="lesson-hero-meta"><span class="xp-pill">+${lesson.xp} XP</span><div class="progress-track"><span style="width:${progress}%"></span></div></div></section>
    <div class="lesson-detail-grid"><article class="card reading-content">
      ${sections.map((sec,i)=>`<section class="reading-section"><span class="eyebrow">${String(i+1).padStart(2,'0')}</span><h2>${esc(sec.title)}</h2>${sec.paragraphs.map(p=>`<p>${glossaryMarkup(esc(p))}</p>`).join('')}${sec.bullets?`<ul>${sec.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}${sec.code?`<pre class="numbered-code lesson-code"><code>${numberedLessonCode(sec.code)}</code></pre>`:''}<p class="datasheet-ref"><span>DATASHEET REFERENCE</span> <a href="https://ww1.microchip.com/downloads/en/DeviceDoc/39631E.pdf" target="_blank" rel="noopener noreferrer">PIC18F4520 Datasheet §${/adc|analog/i.test(sec.title)?'19.0 — ADC':/interrupt/i.test(sec.title)?'9.0 — Interrupts':/serial|uart|eusart/i.test(sec.title)?'18.0 — EUSART':'I/O and peripheral reference'}</a></p></section>`).join('')}
      <section class="lesson-takeaway"><strong>Engineering takeaway</strong><p>${esc(lesson.takeaway)}</p></section>
    </article><aside class="lesson-side"><div class="card"><span class="eyebrow">LEARNING PATH</span><h3>${esc(lesson.title)}</h3><div class="side-progress"><span style="width:${progress}%"></span></div><p>${progress}% of this topic recorded in your profile.</p><button class="btn btn-primary" id="complete-lesson">${isLessonCompleted?'✓ Lesson completed':'Mark lesson complete'}</button></div><div class="card"><span class="eyebrow">PICO</span><p>Open PICO for tips while you read. Hints become available when you enter an active challenge, quiz, or lab.</p><button class="btn btn-secondary" id="lesson-pico-tip">💬 PICO tip</button></div></aside></div>
  </div>`;
}

export function bindLessonDetailEvents(container, lessonId, navigateBack){
  const lesson=lessons.find(x=>x.id===lessonId)||lessons[0];
  container.querySelector('#back-to-learn')?.addEventListener('click',navigateBack);
  container.querySelector('#complete-lesson')?.addEventListener('click',()=>{
    const s=stateStore.getState();
    const completed = Array.isArray(s.learning.completedLessons) ? s.learning.completedLessons : [];
    const isNewCompletion = !completed.includes(lesson.id);
    const nextCompleted = isNewCompletion ? [...completed, lesson.id] : completed;
    if (isNewCompletion) {
      setPath('learning.completedLessons', nextCompleted, true);
      setPath('gamification.xp', s.gamification.xp + lesson.xp, true);
      setPath('gamification.level', Math.floor((s.gamification.xp + lesson.xp) / 250) + 1, true);
    }
    const topicLessons = lessons.filter(item => item.topic === lesson.topic);
    const topicCompleted = topicLessons.filter(item => nextCompleted.includes(item.id)).length;
    const topicProgress = topicLessons.length ? Math.round(topicCompleted / topicLessons.length * 100) : 0;
    setPath(`learning.progressByTopic.${lesson.topic}`, topicProgress, true);
    eventBus.emit('pico:speak', {
      mood: isNewCompletion ? 'celebrating' : 'happy',
      message: isNewCompletion
        ? `Lesson completed! You earned ${lesson.xp} XP.`
        : 'This lesson is already recorded as complete. Revisit it to refresh your knowledge.'
    });
    eventBus.emit('pico:context',{context:'lesson',lessonId:lesson.id});
    container.innerHTML=renderLessonDetailView(lesson.id);
    bindLessonDetailEvents(container,lesson.id,navigateBack);
  });
  container.querySelector('#lesson-pico-tip')?.addEventListener('click',()=>eventBus.emit('pico:tips',{context:'lesson'}));
  eventBus.emit('pico:context',{context:'lesson',lessonId:lesson.id});
}
