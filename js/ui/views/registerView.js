import { stateStore, setPath } from '../../core/state.js';
import { getCurrentRegisters, getCurrentDevice } from '../../core/deviceManager.js';
import { eventBus } from '../../core/eventBus.js';
import { escapeHtml } from '../../core/security.js';

let selectedRegister = 'TRISB';
let query = '';
let category = 'ALL';

const categories = ['ALL','GPIO','ADC','TIMERS','CCP/PWM','EUSART','INTERRUPTS','SYSTEM'];

function regValue(name) { return stateStore.getState().mcu.sfr[name] ?? 0; }

function filteredRegisters() {
  const regs = getCurrentRegisters();
  return Object.values(regs).filter(r => {
    const matchesCat = category === 'ALL' || r.category === category;
    const q = query.toLowerCase();
    const matchesQuery = !q || [r.name, r.description, r.category, ...(r.bits || []).map(b => b.name)].join(' ').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });
}

export function renderRegistersView() {
  const regs = filteredRegisters();
  const device = getCurrentDevice();
  const selected = getCurrentRegisters()[selectedRegister] || regs[0] || Object.values(getCurrentRegisters())[0];
  if (selected) selectedRegister = selected.name;
  const value = selected ? regValue(selected.name) : 0;
  return `<div class="engineering-workspace">
    <section class="card hero-card">
      <div><span class="eyebrow">SFR / REGISTER LEARNING</span><h1>Register Explorer</h1><p>Inspect PIC18 special function registers and edit the local teaching model. Changes update PICLAB's views; they do not control a physical MCU.</p></div>
      <div class="hero-metric"><strong>${selected ? `0x${value.toString(16).padStart(2,'0').toUpperCase()}` : '--'}</strong><span>${selected?.name || 'REGISTER'}</span></div>
    </section>
    ${device.dataStatus === 'preview'
      ? `<div class="device-coverage-warning" role="alert"><strong>Preview register data — verify before use.</strong><span>${escapeHtml(device.dataCoverage || 'The selected device register map is not fully validated.')}</span></div>`
      : `<div class="device-coverage-note"><strong>Curated register set:</strong> this learning-oriented SFR subset updates PICLAB's local model only; it is not an exhaustive register catalogue. Verify bit access, reset values and addresses against the exact device datasheet.</div>`}
    <section class="tool-row card compact-card">
      <input id="register-search" class="input-text" placeholder="Search register, bit, peripheral…" value="${escapeHtml(query)}">
      <div class="chip-row">${categories.map(c=>`<button class="chip ${category===c?'active':''}" data-reg-cat="${c}">${c}</button>`).join('')}</div>
    </section>
    <section class="register-layout">
      <aside class="card register-list"><div class="section-label">REGISTERS · ${regs.length}</div>${regs.map(r=>`<button class="register-item ${selected?.name===r.name?'active':''}" data-reg="${r.name}"><span><b>${r.name}</b><small>${r.category} · ${r.address}</small></span><code>0x${regValue(r.name).toString(16).padStart(2,'0').toUpperCase()}</code></button>`).join('')}</aside>
      <article class="card register-detail" id="register-detail">${selected ? renderRegisterDetail(selected) : '<div class="empty-state">No registers match your search.</div>'}</article>
    </section>
  </div>`;
}

function explainRegisterType(reg){
  const c=(reg.category||'').toUpperCase();
  if(c==='GPIO') return 'GPIO registers form the software-to-pin control plane. Direction registers decide input/output behaviour; PORT reflects pin levels; LAT holds output latch values.';
  if(c==='ADC') return 'ADC registers configure the analog channel and conversion process, then expose the conversion result through the result registers.';
  if(c==='TIMERS') return 'Timer registers define how the hardware counter is clocked, prescaled and rolled over. Timer state can drive flags, interrupts or other peripherals.';
  if(c==='CCP/PWM') return 'CCP/PWM registers configure capture, compare or pulse-width modulation behaviour. Several fields work together with a timer timebase.';
  if(c==='EUSART') return 'EUSART registers configure the asynchronous serial transmitter/receiver and its baud-rate generation.';
  if(c==='MSSP') return 'MSSP registers configure synchronous serial operation such as SPI or I²C and expose status/data to firmware.';
  if(c==='INTERRUPTS') return 'Interrupt registers form a chain: an event sets a flag, an enable bit allows it through, and the interrupt controller routes it to the CPU.';
  return 'System registers control or report MCU-wide resources such as the working register, oscillator, resets, watchdog and memory-control functions.';
}
function interpretBit(bit){
  const d=String(bit.description||'');
  const m1=d.match(/(?:^|[.;\s])(\d)\s*=\s*([^,;.]+)/i);
  const pairs=[...d.matchAll(/(\d)\s*=\s*([^,;.]+)/gi)];
  if(pairs.length>=2) return `<span><b>0:</b> ${pairs.find(x=>x[1]==='0')?.[2]||'See description'}</span><span><b>1:</b> ${pairs.find(x=>x[1]==='1')?.[2]||'See description'}</span>`;
  if(pairs.length===1) return `<span><b>${pairs[0][1]}:</b> ${pairs[0][2]}</span>`;
  if(String(bit.access||'').includes('U-')) return '<span><b>Unimplemented:</b> treat as reserved; read behaviour follows the device documentation.</span>';
  return '<span><b>Meaning:</b> this bit contributes to the register field described above; use the bit description and datasheet to interpret its exact effect.</span>';
}
function bitContribution(value,pos){ return (value&(1<<pos)) ? `bit ${pos} contributes <b>${1<<pos}</b>` : `bit ${pos} contributes <b>0</b>`; }

function renderRegisterDetail(reg) {
  const value = regValue(reg.name);
  const sourceBits = reg.bits || [];
  const bits = Array.from({length:8}, (_,i)=>7-i).map(position => sourceBits.find(bit=>bit.position===position) || ({position,name:`RES${position}`,access:'R/W',description:'Reserved or undocumented bit in this curated learning map. This toggle changes only the local teaching byte; consult the datasheet before writing hardware.'}));
  const setBits=bits.filter(b=>((value>>b.position)&1)===1);
  return `<div class="register-detail-inner">
    <div class="detail-head">
      <div><span class="eyebrow">${reg.category}</span><h2>${reg.name}</h2><p>${reg.description}</p></div>
      <div class="register-value"><span>LIVE VALUE</span><strong>0x${value.toString(16).padStart(2,'0').toUpperCase()}</strong><small>Decimal: ${value} · Binary: ${value.toString(2).padStart(8,'0')}</small></div>
    </div>
    <div class="register-teaching-box">
      <div><span class="section-label">HOW TO READ THIS REGISTER</span><p>One register is an 8-bit value. Each position has a place value: bit 0 = 1, bit 1 = 2, bit 2 = 4 … bit 7 = 128. The byte value is the sum of the set-bit contributions.</p></div>
      <div class="register-formula"><code>0x${value.toString(16).padStart(2,'0').toUpperCase()} = ${value.toString(2).padStart(8,'0')}₂</code><span>${setBits.length ? setBits.map(b=>bitContribution(value,b.position)).join(' · ') : 'No bits are currently set.'}</span></div>
    </div>
    <p class="datasheet-ref"><span>DATASHEET REFERENCE</span> <a href="https://ww1.microchip.com/downloads/en/DeviceDoc/39631E.pdf" target="_blank" rel="noopener noreferrer">PIC18F4520 Datasheet — SFR and peripheral register descriptions</a></p><div class="register-role-box"><span class="section-label">WHAT THE REGISTER ACTUALLY DOES</span><p>${explainRegisterType(reg)}</p><div class="register-access-guide"><span><b>R/W</b> software can read and write</span><span><b>R</b> read/status information</span><span><b>W</b> write-only control</span></div></div>
    <div class="bit-editor"><div class="bit-numbers">${bits.map(b=>`<span>${b.position}</span>`).join('')}</div><div class="bit-buttons">${bits.map(b=>{const v=(value>>b.position)&1; const a=String(b.access||''); const editable=a.includes('W') && !/^(U|—|-)/i.test(a); return `<button class="bit-cell ${v?'on':''} ${editable?'editable':'locked'}" data-reg-bit="${b.position}" ${editable?'':'disabled'}><b>${v}</b><small>${b.name}</small></button>`}).join('')}</div></div>
    <div class="bit-help"><span class="section-label">BIT-BY-BIT MEANING · ACTIVE CONFIGURATION</span>${bits.map(b=>{const active=((value>>b.position)&1)===1;return `<div class="bit-row ${active?'bit-row-active':''}"><strong>bit ${b.position}</strong><b>${b.name}</b><span>${active?'SET (1)':'CLEAR (0)'} · ${b.access}</span><div class="bit-meaning"><p>${b.description}</p>${interpretBit(b)}<p class="bit-current-state">Current state: <b>${active?'1 — set':'0 — clear'}</b>; contribution: <b>${active?(1<<b.position):0}</b>.</p></div></div>`}).join('')}</div>
  </div>`;
}

eventBus.on('register:select', name => { selectedRegister = name; });

export function bindRegisterEvents(container) {
  const search = container.querySelector('#register-search');
  search?.addEventListener('input', e=>{ query=e.target.value; refresh(container); });
  container.querySelectorAll('[data-reg-cat]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.regCat;refresh(container);}));
  container.querySelectorAll('[data-reg]').forEach(btn=>btn.addEventListener('click',()=>{selectedRegister=btn.dataset.reg;refresh(container);}));
  container.querySelectorAll('[data-reg-bit]').forEach(btn=>btn.addEventListener('click',()=>{
    const bit=Number(btn.dataset.regBit); const old=regValue(selectedRegister); const next=old^(1<<bit);
    setPath(`mcu.sfr.${selectedRegister}`, next, true);
    eventBus.emit('mcu:register_changed',{register:selectedRegister,oldValue:old,newValue:next,bit});
    eventBus.emit('pico:speak',{mood:'happy',message:`${selectedRegister}<${bit}> is now ${(next>>bit)&1}. Watch the connected hardware respond.`});
    refresh(container);
  }));
}
function refresh(container){container.innerHTML=renderRegistersView();bindRegisterEvents(container);}
