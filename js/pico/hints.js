/**
 * PICLAB PICO Pedagogical Hints System
 * Context-aware engineering tips and guidance.
 */

export const HINTS_DATABASE = {
  overview: [
    "Tip: Completing labs and answering quizzes earns XP to promote you from GPIO Explorer to PIC Architect!",
    "Did you know? PIC18 instructions are 16 bits wide, but data registers operate on 8-bit bytes (Harvard Architecture).",
    "Start with the Pin Explorer or open an experiment to connect the concepts to hardware."
  ],
  pinout: [
    "Tip: Many PIC18 pins are multiplexed. Pin 2 (RA0), for instance, can serve as digital GPIO or analog channel AN0.",
    "Pins labeled MCLR act as the active-low Master Clear reset. Pulling MCLR to Ground restarts the microcontroller.",
    "Look out for external interrupt pins: INT0, INT1, and INT2 can wake the MCU from sleep on voltage edges."
  ],
  registers: [
    "Golden Rule: TRIS bit = 1 means INPUT (looks like 'I'). TRIS bit = 0 means OUTPUT (looks like 'O')!",
    "ADCON1 register controls whether PORTA and PORTB pins act as analog inputs or digital I/O.",
    "Writing to LATx instead of PORTx prevents the classic Read-Modify-Write (RMW) race condition on high-speed outputs."
  ],
  lesson: [
    'Tip: Read one section at a time, then trace the concept into the Pinout or Register Explorer.',
    'Tip: Try to predict the register or peripheral involved before opening the relevant experiment.',
    'Tip: When a concept feels abstract, connect it to a lab and observe the state change.'
  ],
  lab: [
    'Tip: Before running the experiment, identify the input, processing path and expected output.',
    'Tip: Use the Register Explorer after the activity to understand why the result occurred.',
    'Tip: If the result is unexpected, check configuration before changing the circuit.'
  ],
  labs: [
    'Tip: Before running the lab, identify the input, processing path and expected output.',
    'Tip: Use the Register Explorer after the activity to understand why the result occurred.',
    'Tip: If the result is unexpected, check configuration before changing the circuit.'
  ],
  challenges: [
    'Hint: Start with the symptom and trace backward through circuit, pin, peripheral and register configuration.',
    'Hint: Eliminate unrelated peripherals before changing the register that directly controls the symptom.',
    'Hint: Ask which layer first contradicts the expected signal path.'
  ],
  quiz: [
    'Hint: Recall the signal path before choosing an answer.',
    'Hint: Eliminate options belonging to unrelated peripherals.',
    'Hint: Think in terms of direction, data, timing and configuration.'
  ],
  general: [
    "Engineering Insight: Embedded systems thrive on deterministic state machines and low-latency interrupt routines.",
    "Curious about a register? Click any bit in the Register Explorer to read its exact datasheet definition.",
    "You can export your progress and circuits anytime as JSON in the Help section."
  ]
};

let hintIndices = {};

/**
 * Get next sequential pedagogical hint for active context
 * @param {string} context
 * @returns {string}
 */
export function getNextHint(context = 'general') {
  const hints = HINTS_DATABASE[context] || HINTS_DATABASE.general;
  if (hintIndices[context] === undefined) {
    hintIndices[context] = 0;
  }
  const hint = hints[hintIndices[context] % hints.length];
  hintIndices[context]++;
  return hint;
}
