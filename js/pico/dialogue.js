/**
 * PICLAB PICO Dialogue Engine
 * Contextual speech generation for educational companion.
 */

export const PICO_DIALOGUES = {
  welcome: [
    "Hello! I'm PICO, your PIC18 learning companion. Ready to explore microcontrollers? Choose a section or quick launch a lab!",
    "Welcome back to PICLAB! Check your daily streak and let's master embedded systems.",
    "Greetings, future embedded engineer! Microchip PIC18 architecture awaits your exploration."
  ],
  nav: {
    overview: "Here's your mission dashboard. Track your learning progress, XP level, and quick launch core labs!",
    learn: "Explore interactive lessons on PIC18 architecture, memory organization, and peripherals.",
    pinout: "Interactive 40-Pin DIP Explorer! Click any pin to inspect multiplexed functions, alternate peripherals, and direction control.",
    registers: "Special Function Register (SFR) Explorer! In PIC18, registers like TRIS, PORT, and LAT control everything.",
        labs: "12 Structured Engineering Labs! From basic GPIO blinking to ADC sensors and PWM motor speed control.",
    challenges: "Troubleshooting Arena! Diagnose real hardware and code faults injected into simulated circuits.",
    quiz: "Test your PIC18 knowledge! Earn XP and level up from GPIO Explorer to PIC Architect.",
    progress: "View your earned badges, streak records, and peripheral mastery stats.",
    help: "Need assistance? Search the FAQ, technical references, or keyboard shortcuts anytime."
  },
  mcu: {
    running: "MCU oscillator is active! Clock pulses are advancing instructions and peripheral clocks.",
    paused: "MCU execution paused. You can inspect frozen register contents and pin logic states without missing a beat.",
    stopped: "Power rail disconnected (0V VDD). The microcontroller is unpowered.",
    reset: "MCLR Reset asserted! All SFR registers restored to their power-on reset (POR) default values."
  },
  device: {
    switched: (name) => `Switched active target to ${name}! Register maps and peripheral channels have updated.`
  }
};

/**
 * Retrieve contextual dialogue string
 * @param {string} category
 * @param {string} [subKey]
 * @returns {string}
 */
export function getDialogue(category, subKey) {
  if (category === 'welcome') {
    const list = PICO_DIALOGUES.welcome;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (category === 'nav' && subKey && PICO_DIALOGUES.nav[subKey]) {
    return PICO_DIALOGUES.nav[subKey];
  }
  if (category === 'mcu' && subKey && PICO_DIALOGUES.mcu[subKey]) {
    return PICO_DIALOGUES.mcu[subKey];
  }
  return "Keep learning! Every register change helps you understand how PIC microcontrollers work.";
}
