/**
 * PICLAB Interactive Pinout Explorer View
 * Accurate 40-Pin DIP package visualizer with live GPIO synchronization, filtering, and inspection.
 */

import { stateStore, setPath } from '../../core/state.js';
import { getCurrentDevice, getCurrentPins } from '../../core/deviceManager.js';
import { eventBus } from '../../core/eventBus.js';
import { escapeHtml } from '../../core/security.js';

let selectedPinId = "RB0";
let activePinFilter = "all";
let pinSearchQuery = "";
const PINOUT_TRIVIA = [
  {id:'multiply', title:'The tiny arithmetic engine', text:'Many classic PIC18 devices include an 8×8 hardware multiply instruction. That lets firmware perform small integer products without building the operation from a long software routine.', source:'Microchip PIC18F4520 product information', image:'assets/images/trivia/multiply.svg'},
  {id:'adc', title:'10 bits means 1024 codes', text:'A 10-bit ADC can represent 2^10 = 1024 distinct digital codes. For an ideal 0–VREF input range, the codes run from 0 to 1023.', source:'PIC18F4520 device documentation', image:'assets/images/trivia/adc.svg'},
  {id:'clock', title:'The clock is the heartbeat', text:'The oscillator does more than make the CPU run: clock assumptions influence instruction timing and several peripheral timing calculations. Always distinguish oscillator frequency from the clock actually used by a peripheral.', source:'PIC18F4520 datasheet', image:'assets/images/trivia/clock.svg'},
  {id:'memory', title:'Not all memory is the same', text:'Program memory stores firmware, RAM holds working data, and EEPROM provides non-volatile storage for data that must survive a power cycle. Mixing these roles is a common beginner mistake.', source:'PIC18F4520 datasheet', image:'assets/images/trivia/memory.svg'},
  {id:'uart', title:'UART has no shared clock line', text:'Asynchronous serial communication relies on both endpoints agreeing about timing and frame format. A clock mismatch can make perfectly valid transmitted bits look like garbage at the receiver.', source:'PIC18F4520 EUSART documentation', image:'assets/images/trivia/uart.svg'},
  {id:'timer', title:'Timers are hardware timekeepers', text:'A hardware timer can keep counting while the CPU works on something else. That makes timers a foundation for periodic events, delays, PWM timebases and interrupt-driven control.', source:'PIC18F4520 timer documentation', image:'assets/images/trivia/timer.svg'}
];
let activeTriviaId = null;
const pinWizardSelections = new Set();
const PERIPHERALS = {
  pwm: {label:'PWM (CCP1)', pins:['RC2'], code:'TRISCbits.TRISC2 = 0; CCP1CON = 0b00001100; PR2 = 249; T2CON = 0b00000111;'},
  adc0: {label:'ADC Channel 0 (AN0)', pins:['RA0'], code:'TRISAbits.TRISA0 = 1; ADCON0 = 0b00000001; ADCON1 = 0b00001110; ADCON2 = 0b10101110;'},
  uart: {label:'UART (EUSART)', pins:['RC6','RC7'], code:'TRISCbits.TRISC6 = 0; TRISCbits.TRISC7 = 1; TXSTA = 0b00100100; RCSTA = 0b10010000; SPBRG = 25;'},
  extint: {label:'External Interrupt INT0', pins:['RB0'], code:'TRISBbits.TRISB0 = 1; INTCON2bits.INTEDG0 = 1; INTCONbits.INT0IF = 0; INTCONbits.INT0IE = 1; INTCONbits.GIE = 1;'}
};
function pinConflicts(){const claims={};for(const key of pinWizardSelections){for(const pin of PERIPHERALS[key].pins)(claims[pin] ||= []).push(PERIPHERALS[key].label);}return Object.entries(claims).filter(([,owners])=>owners.length>1);}
function renderPinWizard(){const conflicts=pinConflicts();const code=[...pinWizardSelections].map(k=>`// ${PERIPHERALS[k].label}\n${PERIPHERALS[k].code}`).join('\n\n');return `<section class="card pin-wizard" aria-labelledby="pin-wizard-title"><div><span class="eyebrow">CONFIGURATION ASSISTANT</span><h2 id="pin-wizard-title">Pin Configuration Wizard</h2><p>Select peripherals to highlight their PIC18F4520 DIP-40 pins and generate an XC8 starting snippet.</p></div><div class="pin-wizard-options">${Object.entries(PERIPHERALS).map(([key,item])=>`<label><input type="checkbox" data-peripheral="${key}" ${pinWizardSelections.has(key)?'checked':''}> ${item.label}</label>`).join('')}</div><div class="pin-wizard-status ${conflicts.length?'has-conflicts':''}" role="status">${conflicts.length?`Pin conflict: ${conflicts.map(([pin,owners])=>`${pin} is claimed by ${owners.join(' and ')}`).join('; ')}. Review the peripheral muxing before use.`:pinWizardSelections.size?'No duplicate pin claims detected in this selection. Verify peripheral configuration against the datasheet.':'Choose one or more peripherals to begin.'}</div><button type="button" class="btn btn-primary" data-generate-init ${pinWizardSelections.size?'':'disabled'}>Generate Initialization Code</button><pre class="pin-wizard-code" ${code?'':'hidden'}><code>${escapeHtml(code)}</code></pre><button type="button" class="btn btn-secondary btn-sm" data-copy-init ${code?'':'hidden'}>Copy initialization code</button></section>`;}

function chooseTrivia(forceNext=false){
  let last = '';
  try { last = localStorage.getItem('piclab_pin_trivia') || ''; } catch { /* storage may be disabled */ }
  let pool = PINOUT_TRIVIA.filter(x=>x.id!==last);
  if (!pool.length) pool = PINOUT_TRIVIA;
  let item = forceNext ? pool[Math.floor(Math.random()*pool.length)] : pool[Math.floor(Math.random()*pool.length)];
  try { localStorage.setItem('piclab_pin_trivia',item.id); } catch { /* trivia still works without storage */ }
  activeTriviaId=item.id;
  return item;
}

function getActiveTrivia(){
  if(!activeTriviaId){ return chooseTrivia(false); }
  return PINOUT_TRIVIA.find(x=>x.id===activeTriviaId) || chooseTrivia(false);
}

function renderPinoutTrivia(){
  const tr=getActiveTrivia();
  return `<section class="pin-trivia-card" id="pinout-trivia">
    <div class="pin-trivia-art"><img src="${tr.image}" alt="Original PICLAB illustration for ${tr.title}"></div>
    <div class="pin-trivia-copy"><span class="eyebrow">DID YOU KNOW?</span><h3>${tr.title}</h3><p>${tr.text}</p><small>Technical reference: ${tr.source}</small></div>
    <button class="btn btn-secondary btn-sm" id="next-pin-trivia" type="button">Next trivia ↻</button>
  </section>`;
}


export function renderPinoutView() {
  const device = getCurrentDevice();
  const pins = getCurrentPins();
  const state = stateStore.getState();
  const sfr = state.mcu.sfr;
  const deviceCoverageNotice = device.dataStatus === 'preview'
    ? `<div class="device-coverage-warning" role="alert"><strong>Preview device data — verify before use.</strong><span>${escapeHtml(device.dataCoverage || 'The selected device mapping is not fully validated.')}</span></div>`
    : `<div class="device-coverage-note"><strong>Reference target:</strong> PIC18F4520 DIP-40 pinout. Displayed logic levels are register-derived teaching indicators, not a circuit/electrical simulation. Check the datasheet for package variants and electrical limits.</div>`;

  // Split pins into physical Left Side (1 to 20) and Right Side (40 down to 21)
  const leftPins = pins.filter(p => p.physicalPin >= 1 && p.physicalPin <= 20).sort((a,b) => a.physicalPin - b.physicalPin);
  const rightPins = pins.filter(p => p.physicalPin >= 21 && p.physicalPin <= 40).sort((a,b) => b.physicalPin - a.physicalPin);

  // Find currently selected pin
  const selectedPin = pins.find(p => p.id === selectedPinId) || pins.find(p => p.id === "RB0") || pins[0];

  return `
    <div class="pinout-workspace" style="display: flex; flex-direction: column; gap: 1.25rem; max-width: 1350px; margin: 0 auto; width: 100%;">
      
      <!-- Top Header & Filter Bar -->
      <div class="card" style="background: var(--bg-surface);">
        <div class="card-header" style="flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="card-title">
              📍 40-Pin DIP Package Visualizer — <span style="color: var(--active);">${device.name}</span>
            </span>
            <span class="card-subtitle">Pin functions, alternate multiplexing, and register-derived logic state</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <input type="text" id="pinout-search-input" class="input-text" placeholder="Search pin (e.g. RB0, AN0, TX, INT)..." value="${escapeHtml(pinSearchQuery)}" style="width: 240px; padding: 0.35rem 0.65rem; font-size: 0.85rem;">
          </div>
        </div>

        <!-- Filter Buttons -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
          ${[
            { id: "all", label: "All Pins (40)" },
            { id: "gpio", label: "GPIO" },
            { id: "analog", label: "Analog / ADC" },
            { id: "pwm", label: "PWM / CCP" },
            { id: "eusart", label: "EUSART (TX/RX)" },
            { id: "interrupt", label: "Interrupts" },
            { id: "power", label: "Power & Ground" }
          ].map(f => `
            <button class="btn btn-sm ${activePinFilter === f.id ? 'btn-active' : 'btn-secondary'} pin-filter-btn" data-filter="${f.id}">
              ${f.label}
            </button>
          `).join('')}
        </div>
      </div>

      ${deviceCoverageNotice}

      <!-- Main Layout: Physical DIP-40 Package (Left) + Detailed Pin Inspector (Right) -->
      <div style="display: grid; grid-template-columns: minmax(580px, 1.4fr) minmax(360px, 1fr); gap: 1.25rem; align-items: start;">
        
        <!-- Left column: DIP-40 diagram with configuration wizard directly beneath it -->
        <div class="pinout-diagram-column" style="display: flex; flex-direction: column; gap: 1.25rem; min-width: 0;">
        <div class="card" style="background: var(--bg-deep); padding: 1.5rem; overflow-x: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--preview);">PINS 1 — 20 (LEFT)</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--active); letter-spacing: 0.05em;">PDIP-40 DUAL IN-LINE PACKAGE</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--preview);">PINS 40 — 21 (RIGHT)</span>
          </div>

          <!-- IC Chip Package Layout -->
          <div style="display: flex; justify-content: center; position: relative;">
            
            <!-- Left Pin Column -->
            <div style="display: flex; flex-direction: column; gap: 6px; z-index: 2;">
              ${leftPins.map(p => renderPinRow(p, sfr, selectedPin.id, true)).join('')}
            </div>

            <!-- IC Plastic Body -->
            <div style="width: 140px; background: #07022e; border: 2px solid #7d67ff; border-radius: 6px; margin: 0 -4px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 12px 0; box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 0 15px rgba(76,59,207,0.4);">
              <!-- Top Notch (Pin 1 Indicator) -->
              <div style="width: 32px; height: 16px; background: var(--bg-deep); border: 2px solid #7d67ff; border-top: none; border-radius: 0 0 16px 16px; position: absolute; top: 0; left: 50%; transform: translateX(-50%);"></div>

              <!-- Orientation Dot next to Pin 1 -->
              <div style="width: 8px; height: 8px; background: #94DAFF; border-radius: 50%; position: absolute; top: 18px; left: 14px; opacity: 0.8;"></div>

              <div style="writing-mode: vertical-rl; transform: rotate(180deg); color: #94B3FD; font-family: var(--font-mono); font-weight: 800; font-size: 0.82rem; letter-spacing: 0.25em; text-align: center; margin-top: 50px;">
                MICROCHIP
              </div>

              <div style="writing-mode: vertical-rl; transform: rotate(180deg); color: #FFFFFF; font-family: var(--font-mono); font-weight: 800; font-size: 0.92rem; letter-spacing: 0.2em; text-align: center; margin-bottom: 50px;">
                ${device.name}-I/P
              </div>
            </div>

            <!-- Right Pin Column -->
            <div style="display: flex; flex-direction: column; gap: 6px; z-index: 2;">
              ${rightPins.map(p => renderPinRow(p, sfr, selectedPin.id, false)).join('')}
            </div>

          </div>
        </div>
        ${renderPinWizard()}
        </div>

        <!-- Right: Detailed Pin Inspection Drawer -->
        <div class="card" style="background: var(--bg-surface); position: sticky; top: 1rem;" id="pin-detail-panel">
          ${renderPinDetail(selectedPin, sfr)}
        </div>

      </div>

      <!-- Dynamic technical trivia fills the lower pinout workspace -->
      ${renderPinoutTrivia()}

    </div>
  `;
}

/**
 * Render individual pin lead & contact button
 */
function renderPinRow(pin, sfr, currentSelectedId, isLeft) {
  const isSelected = pin.id === currentSelectedId;
  const isPeripheralPin = [...pinWizardSelections].some(key => PERIPHERALS[key].pins.includes(pin.id));
  const isMatch = checkPinFilterAndSearch(pin);
  const opacity = isMatch ? '1' : '0.25';

  // Determine live GPIO direction and voltage
  let directionTag = null;
  let voltageTag = null;

  if (pin.gpio.available && pin.gpio.directionRegister) {
    const trisVal = sfr[pin.gpio.directionRegister] !== undefined ? sfr[pin.gpio.directionRegister] : 0xFF;
    const isInput = Boolean((trisVal >> pin.bit) & 1);
    directionTag = isInput ? 'IN' : 'OUT';

    // Logic voltage level
    if (!isInput && pin.gpio.latchRegister) {
      const latVal = sfr[pin.gpio.latchRegister] !== undefined ? sfr[pin.gpio.latchRegister] : 0;
      const isHigh = Boolean((latVal >> pin.bit) & 1);
      voltageTag = isHigh ? '5V' : '0V';
    } else if (pin.gpio.portRegister) {
      const portVal = sfr[pin.gpio.portRegister] !== undefined ? sfr[pin.gpio.portRegister] : 0;
      const isHigh = Boolean((portVal >> pin.bit) & 1);
      voltageTag = isHigh ? '5V' : '0V';
    }
  } else if (pin.electrical.power) {
    directionTag = 'PWR';
    voltageTag = '5V';
  } else if (pin.electrical.ground) {
    directionTag = 'GND';
    voltageTag = '0V';
  }

  return `
    <div class="pin-lead-row ${isSelected ? 'selected' : ''} ${isPeripheralPin ? 'peripheral-highlight' : ''}" data-pin-id="${pin.id}" style="
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      opacity: ${opacity}; transition: all 0.15s ease;
      flex-direction: ${isLeft ? 'row' : 'row-reverse'};
    ">
      <!-- Pin Label & Badges -->
      <div style="
        display: flex; align-items: center; gap: 5px;
        flex-direction: ${isLeft ? 'row' : 'row-reverse'};
        min-width: 135px; justify-content: ${isLeft ? 'flex-end' : 'flex-start'};
      ">
        ${directionTag ? `
          <span style="
            font-size: 0.65rem; font-weight: 700; font-family: var(--font-mono);
            padding: 1px 4px; border-radius: 3px;
            background: ${directionTag === 'OUT' ? 'rgba(34, 197, 94, 0.2)' : directionTag === 'PWR' ? 'rgba(234, 179, 8, 0.2)' : directionTag === 'GND' ? 'rgba(148, 179, 253, 0.2)' : 'rgba(148, 218, 255, 0.2)'};
            color: ${directionTag === 'OUT' ? '#86efac' : directionTag === 'PWR' ? '#fde047' : directionTag === 'GND' ? '#94B3FD' : '#94DAFF'};
            border: 1px solid ${directionTag === 'OUT' ? '#22c55e' : directionTag === 'PWR' ? '#eab308' : directionTag === 'GND' ? '#94B3FD' : '#94DAFF'};
          ">${directionTag}</span>
        ` : ''}

        ${voltageTag ? `
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--preview);">${voltageTag}</span>
        ` : ''}

        <span style="font-size: 0.78rem; font-weight: 600; color: ${isSelected ? 'var(--active)' : 'var(--text-main)'}; white-space: nowrap;">
          ${pin.id}
        </span>
      </div>

      <!-- Physical Pin Number Lead Button -->
      <div class="pin-contact-btn" style="
        width: 32px; height: 20px;
        background: ${isSelected ? 'var(--active)' : '#4C3BCF'};
        color: ${isSelected ? '#090040' : '#FFFFFF'};
        border: 1px solid ${isSelected ? '#FFFFFF' : '#94B3FD'};
        border-radius: 3px; display: flex; align-items: center; justify-content: center;
        font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
        box-shadow: ${isSelected ? '0 0 10px rgba(148, 218, 255, 0.8)' : 'none'};
      " title="Pin ${pin.physicalPin}: ${pin.name}">
        ${pin.physicalPin}
      </div>

      <!-- Metal Lead Connector Bar -->
      <div style="width: 14px; height: 4px; background: ${isSelected ? 'var(--active)' : '#8b9bb4'}; border-radius: 1px;"></div>
    </div>
  `;
}

/**
 * Render detailed pin inspection drawer
 */
function renderPinDetail(pin, sfr) {
  if (!pin) return `<div style="padding: 1rem;">Select a pin to inspect.</div>`;

  let trisBit = null;
  let latBit = null;
  let portBit = null;

  if (pin.gpio.available && pin.gpio.directionRegister) {
    const trisVal = sfr[pin.gpio.directionRegister] !== undefined ? sfr[pin.gpio.directionRegister] : 0xFF;
    trisBit = (trisVal >> pin.bit) & 1;

    if (pin.gpio.latchRegister) {
      const latVal = sfr[pin.gpio.latchRegister] !== undefined ? sfr[pin.gpio.latchRegister] : 0;
      latBit = (latVal >> pin.bit) & 1;
    }

    if (pin.gpio.portRegister) {
      const portVal = sfr[pin.gpio.portRegister] !== undefined ? sfr[pin.gpio.portRegister] : 0;
      portBit = (portVal >> pin.bit) & 1;
    }
  }

  const isOutput = trisBit === 0;

  return `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="card-header" style="margin-bottom: 0;">
        <div>
          <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--preview); font-weight: 700;">
            PHYSICAL PIN ${pin.physicalPin} OF 40
          </span>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--active); font-family: var(--font-mono); margin-top: 0.15rem;">
            ${pin.name}
          </h2>
        </div>
        <span class="badge ${isOutput ? 'badge-running' : 'badge-level'}">
          ${pin.electrical.power ? 'POWER RAIL' : pin.electrical.ground ? 'GROUND' : isOutput ? 'ACTIVE OUTPUT' : 'DIGITAL INPUT'}
        </span>
      </div>

      <!-- Live Hardware Status Box -->
      <div class="interactive-panel" style="padding: 0.85rem;">
        <span style="font-size: 0.72rem; color: var(--preview); font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 0.4rem;">
          ⚡ Live Microcontroller State
        </span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">
          <div>
            <span style="color: var(--preview); font-size: 0.75rem;">DIRECTION:</span>
            <strong style="color: ${isOutput ? '#86efac' : '#94DAFF'}; display: block;">
              ${trisBit !== null ? (isOutput ? 'OUTPUT (TRIS=0)' : 'INPUT (TRIS=1)') : (pin.electrical.power ? 'VDD (+5V)' : pin.electrical.ground ? 'VSS (0V)' : 'N/A')}
            </strong>
          </div>
          <div>
            <span style="color: var(--preview); font-size: 0.75rem;">LOGIC VOLTAGE:</span>
            <strong style="color: #FFFFFF; font-family: var(--font-mono); display: block;">
              ${pin.electrical.power ? '5.00 V' : pin.electrical.ground ? '0.00 V' : latBit !== null ? (latBit ? '5.00 V (HIGH)' : '0.00 V (LOW)') : 'HIGH-Z (Input)'}
            </strong>
          </div>
        </div>

        ${pin.gpio.available && pin.gpio.directionRegister ? `
          <button class="btn btn-secondary btn-sm" id="btn-toggle-pin-dir" style="margin-top: 0.75rem; width: 100%;">
            Toggle ${pin.gpio.directionRegister}<${pin.bit}> (${isOutput ? 'Set as Input' : 'Set as Output'})
          </button>
        ` : ''}
      </div>

      <!-- Engineering Explanation -->
      <div class="pin-education">
        <div class="pin-education-block"><span class="eyebrow">WHAT THIS PIN DOES</span><p>${getPinExplanation(pin)}</p></div>
        <div class="pin-education-grid"><div><strong>How it behaves</strong><p>${getPinBehaviour(pin)}</p></div><div><strong>Typical use cases</strong><p>${getPinUseCases(pin)}</p></div></div>
        <div class="pin-signal-path"><strong>Configuration path</strong><div>${getPinPath(pin)}</div></div>
      </div>

      <!-- Multiplexed Alternate Subsystems -->
      <div>
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--preview); text-transform: uppercase; display: block; margin-bottom: 0.4rem;">
          Multiplexed Alternate Functions
        </span>
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          ${pin.alternateFunctions.map(fn => `
            <span class="badge" style="background: rgba(148, 179, 253, 0.15); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.25rem 0.5rem;">
              ${fn}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Specific Peripheral Modules Breakdown -->
      <div style="display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.82rem;">
        <div class="sub-card" style="padding: 0.6rem 0.75rem;">
          <strong style="color: var(--active);">GPIO Port & Bit:</strong>
          <span>${pin.port ? `${pin.port} (Bit ${pin.bit})` : 'Dedicated Power/Oscillator Pin'}</span>
        </div>

        <div class="sub-card" style="padding: 0.6rem 0.75rem;">
          <strong style="color: var(--active);">Analog / ADC:</strong>
          <span>${pin.analog.available ? `Channel AN${pin.analog.channel} (10-bit successive approximation)` : 'Not available on this pin'}</span>
        </div>

        <div class="sub-card" style="padding: 0.6rem 0.75rem;">
          <strong style="color: var(--active);">Interrupt Capability:</strong>
          <span>${pin.interrupt.available ? `External Interrupt ${pin.interrupt.source}` : 'None'}</span>
        </div>

        <div class="sub-card" style="padding: 0.6rem 0.75rem;">
          <strong style="color: var(--active);">PWM / CCP:</strong>
          <span>${pin.pwm.available ? `${pin.pwm.module} (${pin.pwm.notes || 'PWM Output'})` : 'None'}</span>
        </div>

        <div class="sub-card" style="padding: 0.6rem 0.75rem;">
          <strong style="color: var(--active);">EUSART / Serial:</strong>
          <span>${pin.eusart.available ? pin.eusart.role : 'None'}</span>
        </div>

        <div class="sub-card" style="padding: 0.6rem 0.75rem;">
          <strong style="color: var(--active);">MSSP (SPI / I2C):</strong>
          <span>${pin.mssp.available ? pin.mssp.role : 'None'}</span>
        </div>
      </div>

      <!-- Electrical Notes -->
      <div class="preview-panel" style="font-size: 0.78rem; line-height: 1.4;">
        <strong>Datasheet Electrical Note:</strong> ${pin.electrical.notes || 'Standard CMOS/TTL bidirectional buffer with 25mA sink/source.'}
      </div>
    </div>
  `;
}

function getPinExplanation(pin){
  if(pin.electrical?.power) return `${pin.name} supplies or receives the device supply rail. It is not a normal GPIO and should be treated as part of the power network.`;
  if(pin.electrical?.ground) return `${pin.name} is a ground connection. It establishes the reference potential for the MCU and external circuitry.`;
  const f=pin.alternateFunctions||[];
  if(pin.analog?.available) return `${pin.name} can act as a digital GPIO or as analog channel AN${pin.analog.channel}. When the analog function is selected, the ADC measures the pin voltage rather than treating it as an ordinary digital input.`;
  if(f.some(x=>/TX|RX|EUSART|USART/i.test(x))) return `${pin.name} can participate in asynchronous serial communication. When the EUSART function owns the pin, the peripheral controls the serial signal instead of ordinary GPIO writes.`;
  if(f.some(x=>/CCP|PWM/i.test(x))) return `${pin.name} can carry a CCP/PWM signal. The waveform is generated by the peripheral timebase and duty-cycle configuration.`;
  if(f.some(x=>/SCK|SDA|SDI|SDO|SS|SPI|I2C/i.test(x))) return `${pin.name} participates in the MSSP synchronous serial interface. Its behaviour depends on whether SPI or I²C mode is selected.`;
  if(pin.interrupt?.available) return `${pin.name} supports digital GPIO and can also act as an external interrupt input. The interrupt controller reacts to the configured edge/level condition.`;
  return `${pin.name} is a general-purpose digital connection in the selected device. Its direction is controlled through the associated TRIS bit and its digital state through PORT/LAT.`;
}
function getPinBehaviour(pin){
  if(!pin.gpio?.available) return 'Dedicated power or oscillator pins do not behave like ordinary GPIO.';
  return `TRIS${pin.port?.slice(-1)||''}<${pin.bit}> = 1 selects input behaviour; clearing the bit selects output behaviour. As an output, the LAT bit commands the logic level. As an input, PORT reports the pin state represented by the external circuit.`;
}
function getPinUseCases(pin){
  const f=pin.alternateFunctions||[]; const uses=[]; if(pin.analog?.available)uses.push('potentiometers and analog sensors'); if(f.some(x=>/PWM|CCP/i.test(x)))uses.push('LED dimming or actuator control'); if(f.some(x=>/TX|RX/i.test(x)))uses.push('UART debugging and serial devices'); if(f.some(x=>/SCK|SDA|SDI|SDO|SS/i.test(x)))uses.push('sensors, displays and external memory'); if(pin.interrupt?.available)uses.push('buttons and event-driven inputs'); if(!uses.length)uses.push('LEDs, buttons, digital sensors and control signals'); return uses.join('; ')+'.';
}
function getPinPath(pin){
  if(pin.electrical?.power||pin.electrical?.ground) return 'Power network → package pin → MCU supply/reference';
  if(pin.analog?.available) return `TRIS → analog/digital selection → AN${pin.analog.channel} channel → ADCONx → ADRESH:ADRESL`;
  if((pin.alternateFunctions||[]).some(x=>/TX|RX/i.test(x))) return `TRIS/multiplexer → EUSART → TXREG/RCREG → serial pin`;
  if((pin.alternateFunctions||[]).some(x=>/CCP|PWM/i.test(x))) return `TRIS/multiplexer → CCP → timer timebase → PWM pin`;
  return `TRIS${pin.port?.slice(-1)||''}<${pin.bit}> → ${pin.gpio?.latchRegister||'LAT'}<${pin.bit}> / ${pin.gpio?.portRegister||'PORT'}<${pin.bit}> → external circuit`;
}

/**
 * Filter and search evaluator
 */
function checkPinFilterAndSearch(pin) {
  if (pinSearchQuery) {
    const q = pinSearchQuery.toLowerCase();
    const matchesName = pin.name.toLowerCase().includes(q);
    const matchesId = pin.id.toLowerCase().includes(q);
    const matchesPinNum = pin.physicalPin.toString() === q;
    const matchesFn = pin.alternateFunctions.some(fn => fn.toLowerCase().includes(q));
    if (!matchesName && !matchesId && !matchesPinNum && !matchesFn) return false;
  }

  if (activePinFilter === "all") return true;
  if (activePinFilter === "gpio") return pin.gpio.available;
  if (activePinFilter === "analog") return pin.analog.available;
  if (activePinFilter === "pwm") return pin.pwm.available;
  if (activePinFilter === "eusart") return pin.eusart.available;
  if (activePinFilter === "interrupt") return pin.interrupt.available;
  if (activePinFilter === "power") return Boolean(pin.electrical.power || pin.electrical.ground);
  return true;
}

/**
 * Bind interactive events for Pinout View
 */

function bindTriviaNext(card, container) {
  if (!card || card.dataset.listenerReady === '1') return;
  card.dataset.listenerReady = '1';
  card.addEventListener('click', (event) => {
    if (!event.target.closest('#next-pin-trivia')) return;
    chooseTrivia(true);
    const current = container.querySelector('#pinout-trivia');
    if (!current) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderPinoutTrivia();
    const replacement = wrapper.firstElementChild;
    current.replaceWith(replacement);
    bindTriviaNext(replacement, container);
  });
}

export function bindPinoutEvents(container) {
  container.querySelectorAll('[data-peripheral]').forEach(input=>input.addEventListener('change',()=>{if(input.checked)pinWizardSelections.add(input.dataset.peripheral);else pinWizardSelections.delete(input.dataset.peripheral);refreshPinoutView(container);}));
  container.querySelector('[data-generate-init]')?.addEventListener('click',()=>{const code=container.querySelector('.pin-wizard-code');if(code){code.hidden=false;code.scrollIntoView({block:'nearest',behavior:'smooth'});}const copy=container.querySelector('[data-copy-init]');if(copy)copy.hidden=false;});
  container.querySelector('[data-copy-init]')?.addEventListener('click',async()=>{const code=container.querySelector('.pin-wizard-code code')?.textContent||'';try{await navigator.clipboard.writeText(code);}catch{const range=document.createRange();range.selectNodeContents(container.querySelector('.pin-wizard-code code'));const sel=window.getSelection();sel?.removeAllRanges();sel?.addRange(range);}});
  // Pin contact click handler
  const pinRows = container.querySelectorAll('.pin-lead-row');
  pinRows.forEach(row => {
    row.addEventListener('click', () => {
      selectedPinId = row.dataset.pinId;
      refreshPinoutView(container);

      // PICO guidance
      eventBus.emit('pico:speak', {
        mood: 'happy',
        message: `Inspecting Pin ${selectedPinId}. Check out its alternate multiplexed functions in the panel!`
      });
    });
  });

  // Filter buttons click
  const filterBtns = container.querySelectorAll('.pin-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activePinFilter = btn.dataset.filter;
      refreshPinoutView(container);
    });
  });

  // Search input change
  const searchInput = container.querySelector('#pinout-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      pinSearchQuery = e.target.value.trim();
      refreshPinoutView(container);
      // Retain input focus and caret position
      const reSearch = container.querySelector('#pinout-search-input');
      if (reSearch) {
        reSearch.focus();
        reSearch.setSelectionRange(reSearch.value.length, reSearch.value.length);
      }
    });
  }

  // Rebind the trivia control after each dynamic card replacement.
  bindTriviaNext(container.querySelector('#pinout-trivia'), container);

  // Toggle Direction button in Inspector
  const toggleDirBtn = container.querySelector('#btn-toggle-pin-dir');
  if (toggleDirBtn) {
    toggleDirBtn.addEventListener('click', () => {
      const pins = getCurrentPins();
      const pin = pins.find(p => p.id === selectedPinId);
      if (!pin || !pin.gpio.available || !pin.gpio.directionRegister) return;

      const state = stateStore.getState();
      const currentTris = state.mcu.sfr[pin.gpio.directionRegister] !== undefined ? state.mcu.sfr[pin.gpio.directionRegister] : 0xFF;
      const newTris = currentTris ^ (1 << pin.bit); // Flip bit

      setPath(`mcu.sfr.${pin.gpio.directionRegister}`, newTris, true);
      eventBus.emit('mcu:register_changed', {
        register: pin.gpio.directionRegister,
        oldValue: currentTris,
        newValue: newTris,
        bit: pin.bit
      });

      const isNowOutput = ((newTris >> pin.bit) & 1) === 0;
      eventBus.emit('pico:speak', {
        mood: isNowOutput ? 'excited' : 'happy',
        message: `Direction changed! ${pin.id} is now an ${isNowOutput ? 'OUTPUT (TRIS=0)' : 'INPUT (TRIS=1)'}.`
      });

      refreshPinoutView(container);
    });
  }
}

function refreshPinoutView(container) {
  container.innerHTML = renderPinoutView();
  bindPinoutEvents(container);
}
