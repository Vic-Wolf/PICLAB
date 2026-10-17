import { stateStore } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { labs, completeLab } from './labsView.js';

function esc(s=''){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const GLOSSARY = {
  'Prescaler':'A divider that reduces the clock rate delivered to a timer or peripheral.',
  'Tristate':'A high-impedance pin state that electrically disconnects the output driver.',
  'Baud Rate':'The symbol rate used by a serial link; UART bit rate is commonly expressed in baud.',
  'Interrupt Vector':'The defined program address or entry point used to dispatch an interrupt.',
  'Duty Cycle':'The percentage of one PWM period for which the signal is active/high.'
};
function glossaryMarkup(html){
  return html.replace(/\b(Prescaler|Tristate|Baud Rate|Interrupt Vector|Duty Cycle)\b/gi, term => {
    const key=Object.keys(GLOSSARY).find(k=>k.toLowerCase()===term.toLowerCase())||term;
    return `<span class="term-tooltip" tabindex="0" data-definition="${GLOSSARY[key]}">${term}<span class="term-tooltip-popover" role="tooltip">${GLOSSARY[key]}</span></span>`;
  });
}

function explainLine(line=''){
  const t=line.trim();
  if(!t) return 'Blank line used for visual separation.';
  if(t.startsWith('#include')) return 'Imports the XC8/PIC header needed for device registers and compiler extensions.';
  if(t.includes('#pragma config')) return 'Sets device configuration fuses such as oscillator, watchdog or programming mode.';
  if(t.includes('_XTAL_FREQ')) return 'Tells XC8 the oscillator frequency so delay macros can be calculated.';
  if(t.includes('TRIS')) return 'Configures GPIO direction: a TRIS bit of 0 is output and 1 is input in the classic PIC18 GPIO model.';
  if(t.includes('LAT')) return 'Writes an output latch or changes a digital output state.';
  if(t.includes('PORT')) return 'Reads the current port/pin logic state.';
  if(t.includes('ADCON')) return 'Configures or controls ADC channel/operation.';
  if(t.includes('ADRESH') || t.includes('ADRESL')) return 'Reads the ADC result registers that together hold the converted value.';
  if(t.includes('CCP') || t.includes('PR2') || t.includes('T2CON')) return 'Configures the CCP/PWM path and/or its Timer2 timebase.';
  if(t.includes('TXSTA') || t.includes('RCSTA') || t.includes('SPBRG') || t.includes('TXREG') || t.includes('RCREG')) return 'Configures or transfers data through the EUSART/UART path.';
  if(t.includes('INTCON') || t.includes('PIE') || t.includes('PIR')) return 'Configures, enables or services an interrupt source/flag.';
  if(t.includes('SSP')) return 'Configures the MSSP synchronous serial peripheral.';
  if(t.includes('__delay')) return 'Creates a software delay; its accuracy depends on the oscillator definition and compiler timing.';
  if(t.includes('while')) return 'Creates repeated firmware behaviour.';
  if(t.includes('if')) return 'Tests a condition and chooses the corresponding control path.';
  if(t.includes('switch')) return 'Selects a hardware output/state based on the current step or mode.';
  if(t.includes('sprintf') || t.includes('LCD_')) return 'Formats or sends data to the LCD interface.';
  if(t.includes('PWM_') || t.includes('Set_Servo')) return 'Updates the PWM command used by the experiment.';
  return 'Application-specific firmware logic for this experiment.';
}

function highlightCode(code){
  // Tokenize source while escaping every unmatched character; textContent remains the original source for copy.
  const tokenPattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[A-Za-z_]+|\b(?:void|int|char|long|unsigned|const|static|return|while|for|if|else|switch|case|break|continue)\b|\b(?:0x[\da-fA-F]+|\d+)\b|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  let output=''; let last=0; let match;
  while((match=tokenPattern.exec(code))!==null){
    output += esc(code.slice(last,match.index));
    const token=match[0];
    let cls='syntax-number';
    if(token.startsWith('//')||token.startsWith('/*')) cls='syntax-comment';
    else if(token.startsWith('#')) cls='syntax-preprocessor';
    else if(token.startsWith('"')||token.startsWith("'")) cls='syntax-string';
    else if(/^(void|int|char|long|unsigned|const|static|return|while|for|if|else|switch|case|break|continue)$/.test(token)) cls='syntax-keyword';
    output += `<span class="${cls}">${esc(token)}</span>`;
    last=tokenPattern.lastIndex;
  }
  return output+esc(code.slice(last));
}

function numberedHighlight(code){return code.split('\n').map((line,i)=>`<span class="code-line" data-line="${i+1}">${highlightCode(line)}</span>`).join('\n');}

function codeBlock(code, note){
  if(!code){
    return `<div class="source-code-note"><b>Source manual note</b><p>${esc(note || 'No code listing was available in the supplied file.')}</p></div>`;
  }
  return `<div class="lab-code-shell">
    <div class="lab-code-toolbar"><span class="code-language-label">C <i>·</i> XC8 SOURCE</span><button class="lab-copy-icon" type="button" data-copy-lab-code aria-label="Copy source code" title="Copy code"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="12" height="15" rx="2"></rect><path d="M5 7v13a2 2 0 0 0 2 2h10"></path></svg><span>Copy Code</span></button><button class="btn btn-secondary btn-sm" type="button" data-download-lab-code>Download .c File</button><span class="copy-code-status" aria-live="polite"></span></div>
    <pre class="lab-code" tabindex="0"><code>${numberedHighlight(code)}</code></pre>
  </div>`;
}

function diagramFor(lab){
  const title = `EXP ${String(lab.number).padStart(2,'0')} CONNECTION FLOW`;
  return `<div class="connection-graphic" aria-label="${esc(title)}">
    <div class="connection-node source-node"><b>PIC18F4520</b><span>MCU / registers</span></div>
    <div class="connection-lines">
      ${lab.connections.map((r,i)=>`<div class="connection-line"><span>${esc(r[0])}</span><i></i><span>${esc(r[2])}</span><small>${esc(r[3])}</small></div>`).join('')}
    </div>
  </div>`;
}

export function renderLabDetailView(labId){
  const lab=labs.find(x=>x.id===labId) || labs[0];
  const s=stateStore.getState();
  const done=(s.learning.completedLabs||[]).includes(lab.id);
  const d=lab.details;
  return `<div class="engineering-workspace detail-page">
    <div class="detail-toolbar"><button class="btn btn-secondary" id="back-to-labs">← Back to Experiments</button><span class="eyebrow">EXPERIMENT ${String(lab.number).padStart(2,'0')} · ${esc(lab.topic)}</span><span class="detail-progress ${done?'done':''}">${done?'COMPLETED':'IN PROGRESS'}</span></div>

    <section class="card lesson-hero lab-manual-hero">
      <div><span class="eyebrow">${lab.icon} ${esc(lab.level)} · ${esc(lab.topic)}</span><h1>${esc(lab.title)}</h1><p>${esc(lab.overview)}</p></div>
      <div class="lab-hero-stack"><span class="xp-pill">+${lab.xp} XP</span><span>Source: <code>${esc(d.sourceFile)}</code></span><a class="btn btn-primary lab-video-link" href="${esc(d.videoUrl)}" target="_blank" rel="noopener noreferrer">▶ Watch experiment video</a></div>
    </section>

    <nav class="manual-nav card" aria-label="Experiment sections">
      <a href="#lab-aim">Aim</a><a href="#lab-apparatus">Apparatus</a><a href="#lab-theory">Theory</a><a href="#lab-connections">Connections</a><a href="#lab-procedure">Procedure</a><a href="#lab-code">Code</a><a href="#lab-video">Video</a><a href="#lab-viva">Viva</a>
    </nav>

    <div class="lab-manual-layout">
      <article class="card reading-content lab-manual-paper">
        <section class="reading-section" id="lab-aim"><span class="section-number">01</span><h2>Aim & Objectives</h2><ul>${d.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>

        <section class="reading-section" id="lab-apparatus"><span class="section-number">02</span><h2>Apparatus / Components</h2><ul>${d.apparatus.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>

        <section class="reading-section" id="lab-theory"><span class="section-number">03</span><h2>Theory</h2>
          <div class="theory-stack">${d.theory.map(p=>`<p>${glossaryMarkup(esc(p))}</p>`).join('')}</div><p class="datasheet-ref"><span>DATASHEET REFERENCE</span> <a href="https://ww1.microchip.com/downloads/en/DeviceDoc/39631E.pdf" target="_blank" rel="noopener noreferrer">PIC18F4520 Datasheet §${/ADC|analog/i.test(lab.topic+" "+lab.title)?"19.0 — ADC":/PWM|CCP|motor/i.test(lab.topic+" "+lab.title)?"16.0 — CCP/PWM":/UART|serial|EUSART/i.test(lab.topic+" "+lab.title)?"18.0 — EUSART":"I/O and peripheral reference"}</a></p>
        </section>

        <section class="reading-section" id="lab-connections"><span class="section-number">04</span><h2>Connections</h2>
          ${diagramFor(lab)}
          <div class="connection-table"><div class="connection-head"><span>Source</span><span>Pin / Node</span><span>Destination</span><span>Purpose</span></div>${d.connections.map(r=>`<div class="connection-row">${r.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div>
        </section>

        <section class="reading-section" id="lab-procedure"><span class="section-number">05</span><h2>Procedure</h2>
          <ol class="manual-steps">${d.procedure.map((x,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div>${esc(x)}</div></li>`).join('')}</ol>
        </section>

        <section class="reading-section" id="lab-code"><span class="section-number">06</span><h2>Example Code</h2>
          <p class="code-format-note">Copy the code directly from this block. Line breaks and indentation are preserved; no code-editor extension is required to paste it into a document.</p>
          ${codeBlock(d.code,d.sourceCodeNote)}
        </section>

        <section class="reading-section" id="lab-video"><span class="section-number">07</span><h2>Experiment Video</h2>
          <p>Watch the demonstration for this experiment.</p>
          <a class="btn btn-primary lab-video-link" href="${esc(d.videoUrl)}" target="_blank" rel="noopener noreferrer">▶ Watch Experiment ${String(lab.number).padStart(2,'0')} on YouTube</a>
        </section>

        <section class="reading-section"><span class="section-number">08</span><h2>Code Understanding</h2>
          <div class="code-understanding-note"><b>How to read the program</b><p>PICLAB adds this walkthrough layer to connect the source program to the hardware behaviour. The explanations are educational annotations, not additional text from the supplied manuals.</p></div>
          ${d.code ? `<div class="code-map"><div><b>Firmware</b><span>configuration + control logic</span></div><div>↓</div><div><b>SFRs</b><span>registers and bitfields</span></div><div>↓</div><div><b>Peripheral</b><span>GPIO / ADC / PWM / UART / motor interface</span></div><div>↓</div><div><b>Physical effect</b><span>LED / LCD / motor / terminal</span></div></div>` : ''}
        </section>

        <section class="reading-section" id="lab-viva"><span class="section-number">09</span><h2>Viva Voce / Questions</h2>
          <div class="viva-grid">${d.questions.map((q,i)=>`<div><b>Q${i+1}</b><span>${esc(q)}</span></div>`).join('')}</div>
        </section>

        <section class="reading-section"><span class="section-number">10</span><h2>Conclusion / Result</h2>
          <p>${esc(d.conclusion)}</p>
          <div class="result-box"><b>PICLAB result</b><span id="lab-result">${done?'Experiment already completed in this local profile.':'Review the procedure, connections and code, then mark the experiment complete.'}</span></div>
        </section>
      </article>

      <aside class="lab-side">
        <div class="card lab-checklist-card sticky-lab-card"><span class="eyebrow">EXPERIMENT CHECKLIST</span><h3>${esc(lab.title)}</h3><p>Review the aim, required components, connections, procedure and code before recording the experiment as complete.</p><button class="btn btn-secondary" id="complete-lab" ${done?'disabled':''}>${done?'✓ Completed':'Mark as completed'}</button><div class="lab-live-status" id="lab-live-status">${done?'This experiment is recorded in your progress.':'Ready for review.'}</div></div>
        <div class="card"><span class="eyebrow">PICO</span><p>PICO stays quiet while you read. Use Tips for general guidance or Hint when you want help reasoning through the experiment.</p><div class="button-row"><button class="btn btn-secondary" id="lab-tip">💬 Tips</button><button class="btn btn-secondary" id="lab-hint">💡 Hint</button></div></div>
        <div class="card lab-score-card"><span class="eyebrow">EXPERIMENT VALUE</span><div class="lab-progress-line"><span>XP</span><b>+${lab.xp}</b></div><div class="lab-progress-line"><span>Level</span><b>${esc(lab.level)}</b></div><div class="lab-progress-line"><span>Topic</span><b>${esc(lab.topic)}</b></div></div>
      </aside>
    </div>
  </div>`;
}

export function bindLabDetailEvents(container,labId,navigateBack){
  const lab=labs.find(x=>x.id===labId)||labs[0];
  container.querySelector('#back-to-labs')?.addEventListener('click',navigateBack);

  container.querySelector('#complete-lab')?.addEventListener('click',()=>{
    const btn=container.querySelector('#complete-lab');
    const newlyCompleted = completeLab(lab.id);
    if(btn){btn.disabled=true;btn.textContent='✓ Completed'}
    container.querySelector('#lab-live-status').textContent = newlyCompleted
      ? 'Experiment completed and added to your local PICLAB progress.'
      : 'This experiment was already recorded in your local PICLAB progress.';
    container.querySelector('#lab-result').textContent='Completed. Your local profile now records this experiment.';
    eventBus.emit('pico:speak',{mood:'celebrating',message:`Excellent! Experiment ${lab.number} is now part of your PICLAB progress.`});
  });

  container.querySelector('[data-copy-lab-code]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const originalMarkup = button.innerHTML;
    const code = container.querySelector('.lab-code code')?.textContent ?? '';
    const status = container.querySelector('.copy-code-status');
    try {
      await navigator.clipboard.writeText(code);
      button.innerHTML = '✓ Copied';
      if (status) status.textContent = 'Code copied with original line breaks and indentation.';
    } catch {
      // Fallback keeps the exact source text selected for manual copy on older browsers.
      const range = document.createRange();
      const codeNode = container.querySelector('.lab-code code');
      if (codeNode) {
        range.selectNodeContents(codeNode);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      if (status) status.textContent = 'Select the highlighted code and copy it.';
    }
    window.setTimeout(() => { if (button.isConnected) button.innerHTML = originalMarkup; }, 1800);
  });

  container.querySelector('[data-download-lab-code]')?.addEventListener('click', () => {
    const code = container.querySelector('.lab-code code')?.textContent ?? '';
    const blob = new Blob([code], { type: 'text/x-csrc;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `PIC18F4520_Experiment_${String(lab.number).padStart(2,'0')}.c`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    const status = container.querySelector('.copy-code-status');
    if (status) status.textContent = 'C source downloaded with original indentation and line breaks.';
  });

  container.querySelector('#lab-tip')?.addEventListener('click',()=>eventBus.emit('pico:tips',{context:'labs'}));
  container.querySelector('#lab-hint')?.addEventListener('click',()=>eventBus.emit('pico:hint_mode',{context:'labs'}));
}

