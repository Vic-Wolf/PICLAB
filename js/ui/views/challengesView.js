import { stateStore, setPath } from '../../core/state.js';
import { eventBus } from '../../core/eventBus.js';
import { escapeHtml } from '../../core/security.js';

const seeds=[
['gpio-01','LED stays off','TRISB0 is configured as input while LATB0 is high. What is the first fix?',['Clear TRISB0','Change ADCON0','Change SPBRG','Enable MSSP'],0,'A GPIO output needs its TRIS bit cleared.'],
['gpio-02','Button always reads low','RB1 is an input but the simulated button never changes PORTB1. What should you inspect?',['Input stimulus/wiring','PWM duty','PR2 only','TXSTA'],0,'The GPIO input can only report the level presented at the pin.'],
['gpio-03','Wrong pin direction','You write 0x00 to TRISD. What does that configure?',['All PORTD pins as outputs','All PORTD pins as inputs','Only RD0 as output','Analog inputs'],0,'A zero in each TRIS bit selects output for the corresponding pin.'],
['gpio-04','Output write looks unreliable','Which register is the preferred output-latch path?',['LATB','PORTB','TRISB','ADRESH'],0,'LAT is the output latch; PORT is used for pin reads.'],
['gpio-05','Bit mask check','What is 0xAA in binary?',['10101010','01010101','11110000','00001111'],0,'0xA is 1010, so 0xAA is 10101010.'],
['gpio-06','Read versus write','A firmware routine needs the physical RB0 level. Which register should it read?',['PORTB','LATB','TRISB','PR2'],0,'PORT reads the pin state in the classic GPIO model.'],
['gpio-07','Single bit clear','Which mask clears RB0 in LATB while preserving other bits?',['0xFE','0x01','0xF0','0x00'],0,'11111110 clears bit 0 and preserves bits 7:1.'],
['gpio-08','Single bit set','Which mask sets RB3 without changing other bits?',['0x08','0x04','0xF7','0x80'],0,'Bit 3 has weight 2³ = 8 = 0x08.'],
['gpio-09','GPIO debugging order','An LED is dark. Which sequence is most useful?',['Check pin mode → latch → wiring/load','Change UART baud → reset','Change ADC channel → timer','Increase XP'],0,'Start at the GPIO control path before changing unrelated peripherals.'],
['gpio-10','Output state','LATC = 0x01 and TRISC = 0x00. What is RC0 commanded to?',['HIGH','LOW','INPUT','ANALOG'],0,'RC0 is an output and its latch bit is one.'],
['gpio-11','Input configuration','TRISA = 0xFF means the port is configured as what in the basic model?',['Inputs','Outputs','PWM only','UART only'],0,'Every TRIS bit is one, so each corresponding pin is an input.'],
['gpio-12','Latch concept','Why use LAT rather than PORT for a digital output write?',['It provides an explicit output latch','It increases ADC resolution','It changes baud rate','It enables interrupts'],0,'The latch is the software-facing stored output value.'],
['adc-01','Mid-scale ADC','With an ideal 5 V reference, approximately what code represents 2.5 V on a 10-bit ADC?',['512','128','1023','50'],0,'2.5/5 × 1023 is approximately 511.5, commonly rounded near 512.'],
['adc-02','ADC channel','An analog sensor is on AN0 but firmware selects AN3. What is the likely problem?',['Wrong ADC channel selected','Wrong UART baud','Wrong PWM duty','Wrong timer prescaler'],0,'The converter must be pointed at the channel carrying the sensor signal.'],
['adc-03','Analog configuration','A pin is still configured as digital. What happens to an intended analog measurement?',['The ADC path may not behave as intended','UART stops','PWM frequency doubles','MCLR asserts'],0,'Analog/digital configuration is part of the ADC setup path.'],
['adc-04','Resolution','How many distinct codes are represented by 10 bits?',['1024','512','100','2048'],0,'2^10 = 1024 possible binary codes.'],
['timer-01','Timer purpose','Why use a hardware timer instead of a long software delay loop?',['It creates a deterministic hardware timebase','It increases RAM','It changes pin count','It disables interrupts'],0,'Timers count clock events independently of a busy-wait loop.'],
['pwm-01','Duty cycle','A 25% PWM duty cycle means the output is active for approximately what fraction of each period?',['One quarter','One half','Three quarters','The entire period'],0,'Duty cycle is the active-time fraction of one period.'],
['uart-01','UART fault','Serial output is gibberish while wiring is correct. What should be compared first?',['Baud rate and framing','ADC channel','LED resistor','Timer3 only'],0,'UART endpoints must agree on serial timing and framing.'],
['reg-01','Register bit','Which representation is easiest for inspecting individual control bits?',['Binary','Decimal only','ASCII only','Floating point'],0,'Binary maps directly to individual bit positions.'],
['reg-02','Reset state','Why inspect a register reset value before configuring it?',['It tells you the known starting hardware state','It changes the clock','It selects the compiler','It creates a wire'],0,'Reset values establish the baseline from which configuration begins.'],
['pwm-02','Frequency versus duty','Which parameter changes the proportion of time a PWM signal is high?',['Duty cycle','UART baud','ADC channel','TRIS direction'],0,'Duty cycle changes the high-time fraction.'],
['uart-02','TX path','Which register commonly holds transmit data before the EUSART sends it?',['TXREG','ADRESH','PR2','TRISB'],0,'TXREG is the software-facing transmit data register.'],
['mssp-01','SPI basics','Which signal provides the timing reference in SPI?',['Clock','Address byte','MCLR','ADC reference'],0,'SPI is synchronous and uses a clock signal.'],
['mssp-02','I2C basics','What makes I²C wiring different from a simple point-to-point UART link?',['Shared SDA/SCL bus with addressing','It requires a PWM output','It has no clock','It uses only one wire'],0,'I²C is a shared two-wire synchronous bus with addressing.'],
['int-01','Interrupt enable','What is the role of an interrupt-enable bit?',['It permits a particular interrupt source to request service','It changes ADC resolution','It sets PWM duty','It stores EEPROM'],0,'Enable bits gate individual interrupt sources.'],
['gpio-13','Floating input','A digital input is electrically undriven. What can happen?',['Its state may be undefined/noisy','It becomes a PWM output','It automatically becomes 0 V','It changes baud rate'],0,'Inputs need a defined external bias or driver.'],
['adc-05','Reference dependency','If Vref changes while Vin stays constant, what happens to the ideal ADC code?',['The code changes because the scale changes','Nothing can change','UART baud changes','TRIS changes'],0,'ADC code is proportional to Vin/Vref in the ideal model.'],
['timer-02','Prescaler','What does a prescaler do?',['Divides the incoming timer clock before counting','Stores UART bytes','Selects an ADC pin','Resets the MCU'],0,'A prescaler reduces the timer tick rate.'],
['pwm-03','LED dimming','Why can a higher PWM duty make an LED appear brighter?',['The average delivered power increases','ADC resolution increases','The pin becomes analog','UART gets faster'],0,'A larger active fraction generally increases average LED power.'],
['uart-03','Receive path','Which register is commonly associated with received EUSART data?',['RCREG','TXREG','PR2','LATA'],0,'RCREG provides the software-facing receive data path.'],
['mssp-03','SPI select','What commonly identifies which SPI peripheral should respond?',['Chip select','UART baud','TRIS only','ADC reference'],0,'Chip select or slave-select lines identify the intended SPI device.'],
['reg-03','Read-only bit','What should firmware do with a read-only status bit?',['Read it and act on its defined meaning','Blindly write it','Treat it as EEPROM','Use it as a PWM waveform'],0,'Read-only status fields report hardware state.'],
['system-01','Debugging principle','A fault appears in the simulator. What is a strong engineering approach?',['Trace the signal/control path from configuration to output','Change random registers','Ignore reset state','Rewrite every module'],0,'Systematic tracing reduces debugging time and isolates the abstraction layer.'],
['gpio-14','RMW awareness','What problem can arise from careless read-modify-write operations on GPIO?',['The read value may not represent the intended latch state','ADC becomes 12-bit','UART stops permanently','Flash is erased'],0,'The output latch path avoids many classic GPIO read-modify-write surprises.'],
['adc-06','Acquisition','Why does ADC acquisition time matter?',['The sampling capacitor needs time to settle toward the input voltage','It sets UART baud','It controls LED colour','It erases RAM'],0,'Insufficient acquisition can produce inaccurate conversions.'],
['timer-03','Timebase chain','Which chain is most useful for understanding a timer period?',['Oscillator → clock divider/prescaler → counter/period','UART → EEPROM → ADC','GPIO → LED → UART','MCLR → PWM → EEPROM'],0,'Timer timing is derived from the clock and divider/counting structure.'],
['pwm-04','Actuator driver','Why might a motor not be driven directly from a PIC pin?',['The MCU pin cannot necessarily supply the required motor current','PWM cannot control motors','LAT registers cannot change','Timers are analog'],0,'Real actuators often need a transistor, driver or power stage.'],
['uart-04','Clock dependency','Why can changing the MCU clock affect UART communication?',['Baud generation depends on clock timing','UART uses ADC voltage','TRIS controls baud directly','MSSP owns EUSART'],0,'The baud-rate generator derives timing from the MCU clock path.'],
['mssp-04','Bus topology','Why are pull-up resistors commonly associated with I²C?',['The bus uses open-drain/open-collector style signalling','I²C is a PWM output','Pull-ups set ADC resolution','They replace the oscillator'],0,'Pull-ups establish the logic-high state on the shared bus.'],
['int-02','Flag versus enable','What is the conceptual difference between an interrupt flag and an interrupt enable bit?',['The flag reports an event; the enable permits service of that source','They are identical','The flag stores ADC results','The enable controls PWM duty'],0,'Separating event detection from permission to service is fundamental to interrupt design.'],
['hard-01','GPIO fault isolation','RB0 is configured as output and LATB0 is high, but the external LED node remains low. What layer should you inspect next?',['Circuit connection/load model','UART baud','ADC channel','Instruction width'],0,'The register path is correct, so inspect the physical/simulated connection and load.'],
['hard-02','ADC diagnosis','AN0 conversion is stable but consistently 15% low. Which class of issue should be investigated?',['Reference, scaling, source impedance or calibration','UART framing','PWM duty','MCLR'],0,'A systematic gain error points beyond simple channel selection.'],
['hard-03','PWM diagnosis','PWM frequency is correct but an actuator response is weak. Which parameter is most directly related to average commanded power?',['Duty cycle and output driver','UART baud','ADC channel','MSSP address'],0,'Once frequency is correct, duty and the power stage dominate the command.'],
['hard-04','UART diagnosis','UART works at one clock setting but fails after changing FOSC. What is the most likely root cause?',['Baud generator configuration was not recalculated','TRISD became analog','ADC resolution changed','SPI chip select changed'],0,'Changing FOSC changes the timing basis used by the baud generator.'],
['hard-05','Register reasoning','A register reads back differently after writing it. What should you inspect before assuming the simulator is broken?',['Bit access type, reserved bits and hardware side effects','CSS styling','XP count','Search index'],0,'Not every bit is freely writable; reserved and self-clearing bits can change readback.'],
['hard-06','Integrated system','ADC, PWM and UART each work alone but fail together. What is the strongest next step?',['Check shared clock, pin multiplexing and resource conflicts','Increase XP','Change every register','Disable all peripherals'],0,'Integrated systems often fail through shared resources rather than isolated peripheral logic.'],
['hard-07','Interrupt race','An interrupt flag is set repeatedly before firmware clears/handles it. What should be examined?',['Flag clearing semantics and interrupt service timing','LED colour','ADC reference only','PICO mood'],0,'Interrupt flags and service timing can create repeated requests if handled incorrectly.'],
['hard-08','MSSP diagnosis','SPI data appears shifted by one bit. Which class of configuration should be checked?',['Clock polarity/phase and sampling mode','UART baud','ADC reference','TRIS of unrelated pins'],0,'SPI sampling edge and clock phase determine how bits are captured.'],
['hard-09','Pin multiplexing','A GPIO write appears ineffective after enabling a peripheral. What is a likely explanation?',['The peripheral has taken control of the multiplexed pin','The CPU became 16-bit','EEPROM erased itself','XP was reset'],0,'Alternate peripheral functions can override ordinary GPIO behaviour.'],
['hard-10','Power reasoning','A circuit works at 5 V in simulation but a real board resets under load. What should be considered?',['Supply droop, decoupling, grounding and load current','Quiz score','Register list order','CSS variables'],0,'Real power integrity can cause resets even when firmware is correct.'],
['hard-11','Timer design','A periodic event drifts over time. What should be checked first?',['Clock source accuracy and timer configuration','PICO tips','Button colour','Search filter'],0,'Timing accuracy begins with the clock source and timer configuration.'],
['hard-12','System architecture','Why should register values and the pin explorer share one state model?',['So pin direction and register state remain consistent across views','To make the CSS smaller','To remove all tests','To hide register values'],0,'A single source of truth prevents the register explorer and pinout from showing conflicting states.']
];

const challenges=seeds.map((x,i)=>({
  id:x[0], title:x[1], question:x[2], options:x[3], answer:x[4], explain:x[5],
  xp:i<15?50:i<38?90:140,
  difficulty:i<15?'Easy':i<38?'Medium':'Hard',
  category:x[0].split('-')[0].toUpperCase()
}));

let activeChallengeId = null;
const boundContainers = new WeakSet();
function completedChallengeIds(){
  const saved = stateStore.getState()?.learning?.completedChallenges;
  return Array.isArray(saved) ? saved : [];
}

function getActiveChallenge(){
  return challenges.find(challenge => challenge.id === activeChallengeId) || null;
}

function renderChallengeDetail(challenge, completed){
  if(!challenge) return `<div class="engineering-workspace"><section class="card"><p>Challenge not found.</p><button class="btn btn-secondary" id="back-to-challenges" type="button">← All challenges</button></section></div>`;
  const isCompleted = completed.includes(challenge.id);
  return `<div class="engineering-workspace challenge-detail-page">
    <button class="btn btn-secondary" id="back-to-challenges" type="button">← All challenges</button>
    <section class="card challenge-detail-hero">
      <div class="challenge-top"><span class="difficulty-tag ${challenge.difficulty.toLowerCase()}">${challenge.difficulty}</span><span class="xp-pill">+${challenge.xp} XP</span></div>
      <span class="eyebrow">${escapeHtml(challenge.category)} · FAULT DIAGNOSIS</span>
      <h1 id="active-challenge-title">${escapeHtml(challenge.title)}</h1>
      <p class="challenge-question">${escapeHtml(challenge.question)}</p>
      <div class="quiz-options">${challenge.options.map((option,index)=>
        `<button type="button" class="quiz-option" data-answer="${index}">${String.fromCharCode(65+index)}. ${escapeHtml(option)}</button>`
      ).join('')}</div>
      <div id="challenge-feedback" aria-live="polite"></div>
      <button class="btn btn-secondary" id="challenge-hint" type="button">💡 Hint</button>
      ${isCompleted?'<p class="challenge-completed-note">This challenge is already recorded in your progress. Reviewing it will not award XP again.</p>':''}
    </section>
  </div>`;
}

export function renderChallengesView(){
  const completed = completedChallengeIds();
  const active = getActiveChallenge();
  const counts = ['Easy','Medium','Hard'].map(difficulty => [
    difficulty,
    challenges.filter(challenge => challenge.difficulty === difficulty).length
  ]);
  return `<div class="engineering-workspace">
    <section class="card hero-card">
      <div><span class="eyebrow">DEBUGGING ARENA · ${challenges.length} MISSIONS</span>
        <h1>Fault Diagnosis</h1>
        <p>Diagnose realistic embedded-system faults. Challenges are sorted by difficulty and PICO can reveal a hint when you are stuck.</p>
      </div>
      <div class="hero-metric"><strong>${completed.length}/${challenges.length}</strong><span>SOLVED</span></div>
    </section>
    <div class="difficulty-strip">${counts.map(([difficulty,count])=>
      `<div class="difficulty-card ${difficulty.toLowerCase()}"><b>${difficulty}</b><span>${count} challenges</span></div>`
    ).join('')}</div>
    <div class="challenge-grid">${challenges.map(challenge=>
      `<article class="card challenge-card">
        <div class="challenge-top"><span class="difficulty-tag ${challenge.difficulty.toLowerCase()}">${challenge.difficulty}</span><span class="xp-pill">+${challenge.xp} XP</span></div>
        <span class="eyebrow">${escapeHtml(challenge.category)}</span>
        <h2>${escapeHtml(challenge.title)}</h2><p>${escapeHtml(challenge.question)}</p>
        <button class="btn btn-primary" type="button" data-challenge="${challenge.id}">${completed.includes(challenge.id)?'Review diagnosis':'Diagnose →'}</button>
      </article>`
    ).join('')}</div>
  </div>`;
}

function renderInto(container){
  container.innerHTML = renderChallengesView();
}

function closeChallenge(container){
  activeChallengeId = null;
  eventBus.emit('challenges:back');
}

function showAnswerFeedback(container, answerIndex){
  const challenge = getActiveChallenge();
  if(!challenge) return;
  if(!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= challenge.options.length) return;
  const correct = answerIndex === challenge.answer;
  const alreadyCompleted = completedChallengeIds().includes(challenge.id);
  const feedback = container.querySelector('#challenge-feedback');
  if(!feedback) return;

  let message;
  if(correct && alreadyCompleted){
    message = `<div class="feedback success"><b>Correct diagnosis</b><p>${escapeHtml(challenge.explain)}</p><p>This challenge was completed earlier, so no additional XP is awarded.</p><div class="challenge-result-actions"><span class="challenge-xp-claimed">✓ XP already claimed</span><button class="btn btn-primary" id="next-challenge" type="button">Next challenge →</button></div></div>`;
  } else if(correct){
    message = `<div class="feedback success"><b>Correct diagnosis</b><p>${escapeHtml(challenge.explain)}</p><div class="challenge-result-actions"><button class="btn btn-primary" id="claim-xp" type="button">Claim +${challenge.xp} XP</button><button class="btn btn-secondary" id="next-challenge" type="button">Next challenge →</button></div></div>`;
  } else {
    message = `<div class="feedback error"><b>Not quite</b><p>${escapeHtml(challenge.explain)}</p><p>Review the reasoning and try another answer.</p></div>`;
  }
  feedback.innerHTML = message;
  if (feedback.dataset) feedback.dataset.correct = correct ? 'true' : 'false';
  container.querySelector('#challenge-hint')?.toggleAttribute('hidden', correct);
  container.querySelectorAll?.('[data-answer]')?.forEach(option => {
    option.disabled = correct;
    option.classList.toggle('selected', Number(option.dataset.answer) === answerIndex);
    option.setAttribute('aria-pressed', Number(option.dataset.answer) === answerIndex ? 'true' : 'false');
  });
  if(correct){
    eventBus.emit('pico:speak', {
      mood:'celebrating',
      message:'Excellent diagnosis. You traced the fault at the right engineering layer.'
    });
  }
}

function claimChallengeXp(container){
  const challenge = getActiveChallenge();
  if(!challenge) return;
  const state = stateStore.getState();
  const completed = completedChallengeIds();
  if(completed.includes(challenge.id)){
    showAnswerFeedback(container, challenge.answer);
    return;
  }
  const currentXp = Math.max(0, Number(state.gamification?.xp) || 0);
  const reward = Math.max(0, Number(challenge.xp) || 0);
  setPath('learning.completedChallenges', [...completed, challenge.id], true);
  setPath('gamification.xp', currentXp + reward, true);
  setPath('gamification.level', Math.floor((currentXp + reward) / 250) + 1, true);
  showAnswerFeedback(container, challenge.answer);
}

function advanceChallenge(container){
  const current = getActiveChallenge();
  if(!current) return;
  const feedback = container.querySelector('#challenge-feedback');
  if(feedback?.dataset?.correct !== 'true') return;
  // Moving forward also claims the current reward, preventing accidental XP loss.
  if(!completedChallengeIds().includes(current.id)) claimChallengeXp(container);
  const currentIndex = challenges.findIndex(item => item.id === current.id);
  const next = challenges.slice(currentIndex + 1).find(item => !completedChallengeIds().includes(item.id))
    || challenges.find(item => !completedChallengeIds().includes(item.id));
  if(!next){ activeChallengeId = null; eventBus.emit('challenges:back'); return; }
  activeChallengeId = next.id;
  eventBus.emit('pico:context', {context:'challenge', challengeId:next.id});
  eventBus.emit('challenges:open', next.id);
}

function handleChallengeClick(container, event){
  const target = event.target;
  const button = target?.closest?.('button');
  if(!button || !container.contains?.(button)) return;
  if(button.matches('[data-challenge]')){
    const challenge = challenges.find(item => item.id === button.dataset.challenge);
    if(!challenge) return;
    activeChallengeId = challenge.id;
    eventBus.emit('pico:context', {context:'challenge', challengeId:challenge.id});
    eventBus.emit('challenges:open', challenge.id);
    return;
  }
  if(button.id === 'back-to-challenges' || button.id === 'close-challenge'){
    closeChallenge(container);
    return;
  }
  if(button.id === 'challenge-hint'){
    eventBus.emit('pico:hint_mode', {context:'challenges'});
    return;
  }
  if(button.matches('[data-answer]')){
    if(container.querySelector('#challenge-feedback')?.dataset?.correct === 'true') return;
    showAnswerFeedback(container, Number(button.dataset.answer));
    return;
  }
  if(button.id === 'claim-xp') claimChallengeXp(container);
  if(button.id === 'next-challenge') advanceChallenge(container);
}

export function renderChallengeDetailView(challengeId){
  activeChallengeId = challengeId;
  const challenge = challenges.find(item => item.id === challengeId);
  return renderChallengeDetail(challenge, completedChallengeIds());
}

export function bindChallengesEvents(container){
  if(!container || boundContainers.has(container)) return;
  boundContainers.add(container);
  // One delegated listener handles the challenge list and the full-page challenge detail.
  container.addEventListener('click', event => handleChallengeClick(container, event));
}
