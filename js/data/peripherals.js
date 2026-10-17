/**
 * PICLAB Microcontroller Peripherals Dataset
 * Authoritative peripheral specifications, channel mappings, and capabilities.
 */

export const PERIPHERALS_PIC18F4520 = {
  gpio: {
    name: "General Purpose Input/Output (GPIO)",
    ports: ["PORTA", "PORTB", "PORTC", "PORTD", "PORTE"],
    totalPins: 36,
    registers: ["TRIS", "PORT", "LAT"],
    description: "Bidirectional I/O ports. TRIS registers configure input (1) or output (0) direction. LAT registers hold output latch values to prevent Read-Modify-Write hazards.",
    features: [
      "High current sink/source: 25 mA on all pins",
      "PORTA: 7 I/O pins (RA0..RA5, RA7; RA6 is CLKO)",
      "PORTB: 8 bidirectional pins with internal weak pull-ups and interrupt-on-change (RB4..RB7)",
      "PORTC: 8 multiplexed peripheral communication pins",
      "PORTD: 8 pins, dual-purposed as 8-bit Parallel Slave Port (PSP)",
      "PORTE: 3 analog/digital I/O pins (RE0..RE2) + RE3 input-only (MCLR)"
    ]
  },
  adc: {
    name: "10-Bit Analog-to-Digital Converter",
    channels: 13,
    resolutionBits: 10,
    maxResolutionSteps: 1024,
    registers: ["ADCON0", "ADCON1", "ADCON2", "ADRESH", "ADRESL"],
    pinMapping: ["AN0 (RA0)", "AN1 (RA1)", "AN2 (RA2)", "AN3 (RA3)", "AN4 (RA5)", "AN5 (RE0)", "AN6 (RE1)", "AN7 (RE2)", "AN8 (RB2)", "AN9 (RB3)", "AN10 (RB1)", "AN11 (RB4)", "AN12 (RB0)"],
    voltageReference: "Configurable via ADCON1 (VSS to VDD or external VREF- / VREF+)",
    description: "Successive Approximation Register (SAR) converter. Converts an analog input signal to a corresponding 10-bit digital number stored in ADRESH:ADRESL."
  },
  ccp: {
    name: "Capture / Compare / PWM (CCP) Modules",
    modules: ["CCP1 (Enhanced ECCP)", "CCP2 (Standard CCP)"],
    maxPwmResolutionBits: 10,
    registers: ["CCP1CON", "CCPR1L", "CCPR1H", "CCP2CON", "CCPR2L", "CCPR2H", "PR2", "T2CON"],
    pins: ["RC2 (CCP1 / P1A)", "RC1 or RB3 (CCP2)", "RD5 (P1B)", "RD6 (P1C)", "RD7 (P1D)"],
    description: "16-bit Capture/Compare and 10-bit Pulse-Width Modulation. ECCP1 supports full-bridge and half-bridge drive with programmable dead-band delay."
  },
  timers: {
    name: "Hardware Timers Subsystem",
    timerList: [
      { id: "TMR0", width: "8 or 16-bit", prescaler: "1:2 to 1:256", clockSource: "Internal (FOSC/4) or External (T0CKI)" },
      { id: "TMR1", width: "16-bit", prescaler: "1:1 to 1:8", clockSource: "Internal (FOSC/4), External (T1CKI), or 32.768 kHz LP Oscillator" },
      { id: "TMR2", width: "8-bit with PR2 Period match", prescaler: "1:1, 1:4, 1:16", postscaler: "1:1 to 1:16", clockSource: "FOSC/4 (drives PWM timebase)" },
      { id: "TMR3", width: "16-bit", prescaler: "1:1 to 1:8", clockSource: "Internal or External synchronized with TMR1" }
    ],
    description: "Four flexible hardware timer/counter modules supporting periodic interrupts, real-time clock timebases, and frequency measurement."
  },
  eusart: {
    name: "Enhanced Universal Synchronous Asynchronous Receiver Transmitter (EUSART)",
    modes: ["Asynchronous (Full-Duplex UART)", "Synchronous Master/Slave"],
    baudRateGenerator: "8-bit or 16-bit dedicated baud rate timer with auto-baud detect",
    pins: { tx: "RC6 (TX/CK)", rx: "RC7 (RX/DT)" },
    registers: ["TXSTA", "RCSTA", "BAUDCON", "SPBRG", "SPBRGH", "TXREG", "RCREG"],
    description: "Supports RS-232, RS-485, and LIN bus serial communications with hardware framing error and overrun detection."
  },
  mssp: {
    name: "Master Synchronous Serial Port (MSSP)",
    modes: ["SPI Master / Slave (4 modes)", "I2C Master / Slave (7-bit and 10-bit addressing)"],
    pins: { sck: "RC3 (SCK/SCL)", sdo: "RC5 (SDO)", sdi: "RC4 (SDI/SDA)", ss: "RA5 (SS)" },
    registers: ["SSPCON1", "SSPCON2", "SSPSTAT", "SSPBUF", "SSPADD"],
    description: "High-speed synchronous serial interface connecting sensors, EEPROMs, LCDs, and external microcontrollers."
  },
  interrupts: {
    name: "Two-Level Priority Interrupt Engine",
    vectors: { high: "0x0008", low: "0x0018" },
    externalSources: ["INT0 (RB0 - always high priority)", "INT1 (RB1)", "INT2 (RB2)", "Port B Interrupt-On-Change (RB4..RB7)"],
    registers: ["INTCON", "INTCON2", "INTCON3", "RCON", "PIR1", "PIR2", "PIE1", "PIE2", "IPR1", "IPR2"],
    description: "Supports up to 20 interrupt sources with fast hardware context saving (WREG, BSR, STATUS) on high-priority interrupts."
  }
};

export function getPeripheralsForDevice(deviceId = "PIC18F4520") {
  // Can be extended for device-specific peripheral differences
  return PERIPHERALS_PIC18F4520;
}
