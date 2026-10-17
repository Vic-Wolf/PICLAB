import { eventBus } from '../core/eventBus.js';

/* PICO stays quiet during ordinary navigation. Contextual prompts are emitted by
   lesson, lab, challenge and quiz views only. */
export function setupPicoReactions(){
  eventBus.on('mcu:status_changed', status=>{
    const mood=status==='RUNNING'?'excited':status==='PAUSED'?'thinking':'warning';
    eventBus.emit('pico:mood_changed',mood);
  });
  eventBus.on('xp:earned',()=>eventBus.emit('pico:mood_changed','celebrating'));
}
