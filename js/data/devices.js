/**
 * PICLAB device registry. This learning site is dedicated exclusively to PIC18F4520.
 */
export const PIC18_DEVICES = {
  PIC18F4520: {
    id: 'PIC18F4520',
    name: 'PIC18F4520',
    title: 'Microchip PIC18F4520 (High-Performance 8-Bit RISC)',
    family: 'PIC18F Standard',
    dataStatus: 'reference',
    dataCoverage: 'PIC18F4520 is the only supported target. Pinout data is mapped for the 40-pin DIP package; the SFR explorer is a curated educational subset, not an exhaustive silicon register catalogue.',
    package: 'DIP-40',
    pinCount: 40,
    specs: {
      programMemoryKB: 32,
      ramBytes: 1536,
      eepromBytes: 256,
      maxFreqMHz: 40,
      adcChannels: 13,
      adcResolution: 10,
      ccpModules: 2,
      timers: 4,
      eusart: 1,
      operatingVoltage: '2.0V - 5.5V'
    },
    ports: ['PORTA', 'PORTB', 'PORTC', 'PORTD', 'PORTE'],
    defaultClockHz: 8000000,
    description: 'PIC18F4520 educational reference target featuring 32 KB Flash, a 10-bit ADC, CCP modules for PWM, and GPIO ports.'
  }
};
