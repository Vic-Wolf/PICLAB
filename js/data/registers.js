import { COMMON_PIC18F4520_REGISTERS } from './registerExtensions.js';
/**
 * PICLAB curated educational Special Function Register (SFR) dataset.
 * PIC18F4520 is the primary reference target; this is a curated SFR subset,
 * not an exhaustive register catalogue. PIC18F4550 and PIC18F45K22 maps are
 * preview datasets. Verify addresses, access rules, reset values and bit
 * semantics against the exact device datasheet before hardware use.
 * Reference: Microchip PIC18F2420/2520/4420/4520 Data Sheet (DS39631E).
 */

export const REGISTERS_PIC18F4520 = {
  // ==========================================
  // 1. GPIO DIRECTION REGISTERS (TRIS)
  // ==========================================
  TRISA: {
    name: "TRISA",
    address: "0xF92",
    resetValue: "0xFF",
    width: 8,
    category: "GPIO",
    description: "PORTA Tri-State / Direction Control Register. 1 = Input (pin buffer high-impedance), 0 = Output (pin driven by LATA).",
    bits: [
      { position: 7, name: "TRISA7", access: "R/W", reset: 1, description: "RA7 Direction bit (when configured as I/O in INTOSC modes). 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" },
      { position: 6, name: "TRISA6", access: "R/W", reset: 1, description: "RA6 Direction bit (when configured as I/O in INTOSC modes). 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" },
      { position: 5, name: "TRISA5", access: "R/W", reset: 1, description: "RA5 Direction bit. 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" },
      { position: 4, name: "TRISA4", access: "R/W", reset: 1, description: "RA4 Direction bit. 1 = Input, 0 = Output (Open-drain driver).", affectedPeripheral: "PORTA" },
      { position: 3, name: "TRISA3", access: "R/W", reset: 1, description: "RA3 Direction bit. 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" },
      { position: 2, name: "TRISA2", access: "R/W", reset: 1, description: "RA2 Direction bit. 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" },
      { position: 1, name: "TRISA1", access: "R/W", reset: 1, description: "RA1 Direction bit. 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" },
      { position: 0, name: "TRISA0", access: "R/W", reset: 1, description: "RA0 Direction bit. 1 = Input, 0 = Output.", affectedPeripheral: "PORTA" }
    ]
  },
  TRISB: {
    name: "TRISB",
    address: "0xF93",
    resetValue: "0xFF",
    width: 8,
    category: "GPIO",
    description: "PORTB Tri-State / Direction Control Register. 1 = Input, 0 = Output.",
    bits: [
      { position: 7, name: "TRISB7", access: "R/W", reset: 1, description: "RB7 Direction bit (ICSP Data). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 6, name: "TRISB6", access: "R/W", reset: 1, description: "RB6 Direction bit (ICSP Clock). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 5, name: "TRISB5", access: "R/W", reset: 1, description: "RB5 Direction bit (PGM / KBI1). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 4, name: "TRISB4", access: "R/W", reset: 1, description: "RB4 Direction bit (KBI0). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 3, name: "TRISB3", access: "R/W", reset: 1, description: "RB3 Direction bit (CCP2 alternate / AN9). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 2, name: "TRISB2", access: "R/W", reset: 1, description: "RB2 Direction bit (INT2 / AN8). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 1, name: "TRISB1", access: "R/W", reset: 1, description: "RB1 Direction bit (INT1 / AN10). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" },
      { position: 0, name: "TRISB0", access: "R/W", reset: 1, description: "RB0 Direction bit (INT0 / AN12). 1 = Input, 0 = Output.", affectedPeripheral: "PORTB" }
    ]
  },
  TRISC: {
    name: "TRISC",
    address: "0xF94",
    resetValue: "0xFF",
    width: 8,
    category: "GPIO",
    description: "PORTC Tri-State / Direction Control Register. 1 = Input, 0 = Output.",
    bits: [
      { position: 7, name: "TRISC7", access: "R/W", reset: 1, description: "RC7 Direction bit (RX / DT). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / EUSART" },
      { position: 6, name: "TRISC6", access: "R/W", reset: 1, description: "RC6 Direction bit (TX / CK). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / EUSART" },
      { position: 5, name: "TRISC5", access: "R/W", reset: 1, description: "RC5 Direction bit (SDO). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / MSSP" },
      { position: 4, name: "TRISC4", access: "R/W", reset: 1, description: "RC4 Direction bit (SDI / SDA). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / MSSP" },
      { position: 3, name: "TRISC3", access: "R/W", reset: 1, description: "RC3 Direction bit (SCK / SCL). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / MSSP" },
      { position: 2, name: "TRISC2", access: "R/W", reset: 1, description: "RC2 Direction bit (CCP1 / P1A). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / CCP1" },
      { position: 1, name: "TRISC1", access: "R/W", reset: 1, description: "RC1 Direction bit (CCP2 / T1OSI). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / CCP2" },
      { position: 0, name: "TRISC0", access: "R/W", reset: 1, description: "RC0 Direction bit (T1OSO / T1CKI). 1 = Input, 0 = Output.", affectedPeripheral: "PORTC / Timer1" }
    ]
  },
  TRISD: {
    name: "TRISD",
    address: "0xF95",
    resetValue: "0xFF",
    width: 8,
    category: "GPIO",
    description: "PORTD Tri-State / Direction Control Register. 1 = Input, 0 = Output.",
    bits: [
      { position: 7, name: "TRISD7", access: "R/W", reset: 1, description: "RD7 Direction bit (PSP7 / P1D). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 6, name: "TRISD6", access: "R/W", reset: 1, description: "RD6 Direction bit (PSP6 / P1C). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 5, name: "TRISD5", access: "R/W", reset: 1, description: "RD5 Direction bit (PSP5 / P1B). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 4, name: "TRISD4", access: "R/W", reset: 1, description: "RD4 Direction bit (PSP4). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 3, name: "TRISD3", access: "R/W", reset: 1, description: "RD3 Direction bit (PSP3). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 2, name: "TRISD2", access: "R/W", reset: 1, description: "RD2 Direction bit (PSP2). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 1, name: "TRISD1", access: "R/W", reset: 1, description: "RD1 Direction bit (PSP1). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" },
      { position: 0, name: "TRISD0", access: "R/W", reset: 1, description: "RD0 Direction bit (PSP0). 1 = Input, 0 = Output.", affectedPeripheral: "PORTD" }
    ]
  },
  TRISE: {
    name: "TRISE",
    address: "0xF96",
    resetValue: "0x07",
    width: 8,
    category: "GPIO",
    description: "PORTE Tri-State / Direction Control & Parallel Slave Port Control Register.",
    bits: [
      { position: 7, name: "IBF", access: "R", reset: 0, description: "Input Buffer Full Status bit (PSP mode).", affectedPeripheral: "PSP" },
      { position: 6, name: "OBF", access: "R", reset: 0, description: "Output Buffer Full Status bit (PSP mode).", affectedPeripheral: "PSP" },
      { position: 5, name: "IBOV", access: "R/W", reset: 0, description: "Input Buffer Overflow Detect bit (PSP mode).", affectedPeripheral: "PSP" },
      { position: 4, name: "PSPMODE", access: "R/W", reset: 0, description: "Parallel Slave Port Mode Enable bit. 1 = PORTD operates as PSP, 0 = PORTD is GPIO.", affectedPeripheral: "PSP" },
      { position: 3, name: "—", access: "U-0", reset: 0, description: "Unimplemented: Read as '0'.", affectedPeripheral: "None" },
      { position: 2, name: "TRISE2", access: "R/W", reset: 1, description: "RE2 Direction bit (CS / AN7). 1 = Input, 0 = Output.", affectedPeripheral: "PORTE" },
      { position: 1, name: "TRISE1", access: "R/W", reset: 1, description: "RE1 Direction bit (WR / AN6). 1 = Input, 0 = Output.", affectedPeripheral: "PORTE" },
      { position: 0, name: "TRISE0", access: "R/W", reset: 1, description: "RE0 Direction bit (RD / AN5). 1 = Input, 0 = Output.", affectedPeripheral: "PORTE" }
    ]
  },

  // ==========================================
  // 2. GPIO LATCH REGISTERS (LAT)
  // ==========================================
  LATA: {
    name: "LATA",
    address: "0xF89",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTA Output Latch Register. Holds data driven out to physical PORTA pins when configured as outputs.",
    bits: [
      { position: 7, name: "LATA7", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 7.", affectedPeripheral: "PORTA" },
      { position: 6, name: "LATA6", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 6.", affectedPeripheral: "PORTA" },
      { position: 5, name: "LATA5", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 5.", affectedPeripheral: "PORTA" },
      { position: 4, name: "LATA4", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 4.", affectedPeripheral: "PORTA" },
      { position: 3, name: "LATA3", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 3.", affectedPeripheral: "PORTA" },
      { position: 2, name: "LATA2", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 2.", affectedPeripheral: "PORTA" },
      { position: 1, name: "LATA1", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 1.", affectedPeripheral: "PORTA" },
      { position: 0, name: "LATA0", access: "R/W", reset: 0, description: "LATA Data Output Latch bit 0.", affectedPeripheral: "PORTA" }
    ]
  },
  LATB: {
    name: "LATB",
    address: "0xF8A",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTB Output Latch Register. Prevents Read-Modify-Write issues by modifying flip-flops directly.",
    bits: [
      { position: 7, name: "LATB7", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 7.", affectedPeripheral: "PORTB" },
      { position: 6, name: "LATB6", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 6.", affectedPeripheral: "PORTB" },
      { position: 5, name: "LATB5", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 5.", affectedPeripheral: "PORTB" },
      { position: 4, name: "LATB4", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 4.", affectedPeripheral: "PORTB" },
      { position: 3, name: "LATB3", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 3.", affectedPeripheral: "PORTB" },
      { position: 2, name: "LATB2", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 2.", affectedPeripheral: "PORTB" },
      { position: 1, name: "LATB1", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 1.", affectedPeripheral: "PORTB" },
      { position: 0, name: "LATB0", access: "R/W", reset: 0, description: "LATB Data Output Latch bit 0.", affectedPeripheral: "PORTB" }
    ]
  },
  LATC: {
    name: "LATC",
    address: "0xF8B",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTC Output Latch Register.",
    bits: [
      { position: 7, name: "LATC7", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 7.", affectedPeripheral: "PORTC" },
      { position: 6, name: "LATC6", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 6.", affectedPeripheral: "PORTC" },
      { position: 5, name: "LATC5", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 5.", affectedPeripheral: "PORTC" },
      { position: 4, name: "LATC4", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 4.", affectedPeripheral: "PORTC" },
      { position: 3, name: "LATC3", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 3.", affectedPeripheral: "PORTC" },
      { position: 2, name: "LATC2", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 2.", affectedPeripheral: "PORTC" },
      { position: 1, name: "LATC1", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 1.", affectedPeripheral: "PORTC" },
      { position: 0, name: "LATC0", access: "R/W", reset: 0, description: "LATC Data Output Latch bit 0.", affectedPeripheral: "PORTC" }
    ]
  },
  LATD: {
    name: "LATD",
    address: "0xF8C",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTD Output Latch Register.",
    bits: [
      { position: 7, name: "LATD7", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 7.", affectedPeripheral: "PORTD" },
      { position: 6, name: "LATD6", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 6.", affectedPeripheral: "PORTD" },
      { position: 5, name: "LATD5", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 5.", affectedPeripheral: "PORTD" },
      { position: 4, name: "LATD4", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 4.", affectedPeripheral: "PORTD" },
      { position: 3, name: "LATD3", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 3.", affectedPeripheral: "PORTD" },
      { position: 2, name: "LATD2", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 2.", affectedPeripheral: "PORTD" },
      { position: 1, name: "LATD1", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 1.", affectedPeripheral: "PORTD" },
      { position: 0, name: "LATD0", access: "R/W", reset: 0, description: "LATD Data Output Latch bit 0.", affectedPeripheral: "PORTD" }
    ]
  },
  LATE: {
    name: "LATE",
    address: "0xF8D",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTE Output Latch Register.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 4, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 3, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 2, name: "LATE2", access: "R/W", reset: 0, description: "LATE Data Output Latch bit 2.", affectedPeripheral: "PORTE" },
      { position: 1, name: "LATE1", access: "R/W", reset: 0, description: "LATE Data Output Latch bit 1.", affectedPeripheral: "PORTE" },
      { position: 0, name: "LATE0", access: "R/W", reset: 0, description: "LATE Data Output Latch bit 0.", affectedPeripheral: "PORTE" }
    ]
  },

  // ==========================================
  // 3. GPIO PIN VOLTAGE REGISTERS (PORT)
  // ==========================================
  PORTA: {
    name: "PORTA",
    address: "0xF80",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTA Physical Input Pin Register. Reading PORTA reads the actual digital voltage level on RA0..RA7.",
    bits: [
      { position: 7, name: "RA7", access: "R/W", reset: 0, description: "PORTA Pin 7 logic level.", affectedPeripheral: "PORTA" },
      { position: 6, name: "RA6", access: "R/W", reset: 0, description: "PORTA Pin 6 logic level.", affectedPeripheral: "PORTA" },
      { position: 5, name: "RA5", access: "R/W", reset: 0, description: "PORTA Pin 5 logic level.", affectedPeripheral: "PORTA" },
      { position: 4, name: "RA4", access: "R/W", reset: 0, description: "PORTA Pin 4 logic level.", affectedPeripheral: "PORTA" },
      { position: 3, name: "RA3", access: "R/W", reset: 0, description: "PORTA Pin 3 logic level.", affectedPeripheral: "PORTA" },
      { position: 2, name: "RA2", access: "R/W", reset: 0, description: "PORTA Pin 2 logic level.", affectedPeripheral: "PORTA" },
      { position: 1, name: "RA1", access: "R/W", reset: 0, description: "PORTA Pin 1 logic level.", affectedPeripheral: "PORTA" },
      { position: 0, name: "RA0", access: "R/W", reset: 0, description: "PORTA Pin 0 logic level.", affectedPeripheral: "PORTA" }
    ]
  },
  PORTB: {
    name: "PORTB",
    address: "0xF81",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTB Physical Input Pin Register. Reading PORTB reads the digital voltage levels on RB0..RB7.",
    bits: [
      { position: 7, name: "RB7", access: "R/W", reset: 0, description: "PORTB Pin 7 logic level.", affectedPeripheral: "PORTB" },
      { position: 6, name: "RB6", access: "R/W", reset: 0, description: "PORTB Pin 6 logic level.", affectedPeripheral: "PORTB" },
      { position: 5, name: "RB5", access: "R/W", reset: 0, description: "PORTB Pin 5 logic level.", affectedPeripheral: "PORTB" },
      { position: 4, name: "RB4", access: "R/W", reset: 0, description: "PORTB Pin 4 logic level.", affectedPeripheral: "PORTB" },
      { position: 3, name: "RB3", access: "R/W", reset: 0, description: "PORTB Pin 3 logic level.", affectedPeripheral: "PORTB" },
      { position: 2, name: "RB2", access: "R/W", reset: 0, description: "PORTB Pin 2 logic level.", affectedPeripheral: "PORTB" },
      { position: 1, name: "RB1", access: "R/W", reset: 0, description: "PORTB Pin 1 logic level.", affectedPeripheral: "PORTB" },
      { position: 0, name: "RB0", access: "R/W", reset: 0, description: "PORTB Pin 0 logic level.", affectedPeripheral: "PORTB" }
    ]
  },
  PORTC: {
    name: "PORTC",
    address: "0xF82",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTC Physical Input Pin Register.",
    bits: [
      { position: 7, name: "RC7", access: "R/W", reset: 0, description: "PORTC Pin 7 logic level.", affectedPeripheral: "PORTC" },
      { position: 6, name: "RC6", access: "R/W", reset: 0, description: "PORTC Pin 6 logic level.", affectedPeripheral: "PORTC" },
      { position: 5, name: "RC5", access: "R/W", reset: 0, description: "PORTC Pin 5 logic level.", affectedPeripheral: "PORTC" },
      { position: 4, name: "RC4", access: "R/W", reset: 0, description: "PORTC Pin 4 logic level.", affectedPeripheral: "PORTC" },
      { position: 3, name: "RC3", access: "R/W", reset: 0, description: "PORTC Pin 3 logic level.", affectedPeripheral: "PORTC" },
      { position: 2, name: "RC2", access: "R/W", reset: 0, description: "PORTC Pin 2 logic level.", affectedPeripheral: "PORTC" },
      { position: 1, name: "RC1", access: "R/W", reset: 0, description: "PORTC Pin 1 logic level.", affectedPeripheral: "PORTC" },
      { position: 0, name: "RC0", access: "R/W", reset: 0, description: "PORTC Pin 0 logic level.", affectedPeripheral: "PORTC" }
    ]
  },
  PORTD: {
    name: "PORTD",
    address: "0xF83",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTD Physical Input Pin Register.",
    bits: [
      { position: 7, name: "RD7", access: "R/W", reset: 0, description: "PORTD Pin 7 logic level.", affectedPeripheral: "PORTD" },
      { position: 6, name: "RD6", access: "R/W", reset: 0, description: "PORTD Pin 6 logic level.", affectedPeripheral: "PORTD" },
      { position: 5, name: "RD5", access: "R/W", reset: 0, description: "PORTD Pin 5 logic level.", affectedPeripheral: "PORTD" },
      { position: 4, name: "RD4", access: "R/W", reset: 0, description: "PORTD Pin 4 logic level.", affectedPeripheral: "PORTD" },
      { position: 3, name: "RD3", access: "R/W", reset: 0, description: "PORTD Pin 3 logic level.", affectedPeripheral: "PORTD" },
      { position: 2, name: "RD2", access: "R/W", reset: 0, description: "PORTD Pin 2 logic level.", affectedPeripheral: "PORTD" },
      { position: 1, name: "RD1", access: "R/W", reset: 0, description: "PORTD Pin 1 logic level.", affectedPeripheral: "PORTD" },
      { position: 0, name: "RD0", access: "R/W", reset: 0, description: "PORTD Pin 0 logic level.", affectedPeripheral: "PORTD" }
    ]
  },
  PORTE: {
    name: "PORTE",
    address: "0xF84",
    resetValue: "0x00",
    width: 8,
    category: "GPIO",
    description: "PORTE Physical Input Pin Register.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 4, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 3, name: "RE3", access: "R", reset: 0, description: "PORTE Pin 3 logic level (MCLR pin digital input).", affectedPeripheral: "PORTE" },
      { position: 2, name: "RE2", access: "R/W", reset: 0, description: "PORTE Pin 2 logic level.", affectedPeripheral: "PORTE" },
      { position: 1, name: "RE1", access: "R/W", reset: 0, description: "PORTE Pin 1 logic level.", affectedPeripheral: "PORTE" },
      { position: 0, name: "RE0", access: "R/W", reset: 0, description: "PORTE Pin 0 logic level.", affectedPeripheral: "PORTE" }
    ]
  },

  // ==========================================
  // 4. ANALOG-TO-DIGITAL CONVERTER (ADC)
  // ==========================================
  ADCON0: {
    name: "ADCON0",
    address: "0xFC2",
    resetValue: "0x00",
    width: 8,
    category: "ADC",
    description: "A/D Control Register 0. Controls analog channel selection, GO/DONE conversion trigger, and module enable.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "CHS3", access: "R/W", reset: 0, description: "Analog Channel Select bit 3.", affectedPeripheral: "ADC" },
      { position: 4, name: "CHS2", access: "R/W", reset: 0, description: "Analog Channel Select bit 2.", affectedPeripheral: "ADC" },
      { position: 3, name: "CHS1", access: "R/W", reset: 0, description: "Analog Channel Select bit 1.", affectedPeripheral: "ADC" },
      { position: 2, name: "CHS0", access: "R/W", reset: 0, description: "Analog Channel Select bit 0. CHS<3:0> selects AN0 to AN12.", affectedPeripheral: "ADC" },
      { position: 1, name: "GO/DONE", access: "R/W", reset: 0, description: "A/D Conversion Status bit. 1 = A/D conversion in progress (setting this starts conversion); 0 = A/D idle (cleared automatically by hardware when conversion finishes).", affectedPeripheral: "ADC" },
      { position: 0, name: "ADON", access: "R/W", reset: 0, description: "A/D Module On/Off bit. 1 = A/D module enabled, 0 = A/D module shut down.", affectedPeripheral: "ADC" }
    ]
  },
  ADCON1: {
    name: "ADCON1",
    address: "0xFC1",
    resetValue: "0x0F",
    width: 8,
    category: "ADC",
    description: "A/D Control Register 1. Configures port pins as analog or digital inputs (PCFG3:PCFG0) and selects voltage references.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "VCFG1", access: "R/W", reset: 0, description: "Voltage Reference Configuration (Negative). 0 = VSS, 1 = External VREF- (AN2).", affectedPeripheral: "ADC" },
      { position: 4, name: "VCFG0", access: "R/W", reset: 0, description: "Voltage Reference Configuration (Positive). 0 = VDD, 1 = External VREF+ (AN3).", affectedPeripheral: "ADC" },
      { position: 3, name: "PCFG3", access: "R/W", reset: 1, description: "A/D Port Configuration Control bit 3.", affectedPeripheral: "ADC" },
      { position: 2, name: "PCFG2", access: "R/W", reset: 1, description: "A/D Port Configuration Control bit 2.", affectedPeripheral: "ADC" },
      { position: 1, name: "PCFG1", access: "R/W", reset: 1, description: "A/D Port Configuration Control bit 1.", affectedPeripheral: "ADC" },
      { position: 0, name: "PCFG0", access: "R/W", reset: 1, description: "A/D Port Configuration Control bit 0. PCFG=0000 enables all analog channels; PCFG=1111 configures all pins as digital I/O.", affectedPeripheral: "ADC" }
    ]
  },
  ADCON2: {
    name: "ADCON2",
    address: "0xFC0",
    resetValue: "0x00",
    width: 8,
    category: "ADC",
    description: "A/D Control Register 2. Sets result formatting (Right/Left justified), acquisition time, and conversion clock source.",
    bits: [
      { position: 7, name: "ADFM", access: "R/W", reset: 0, description: "A/D Result Format Select. 1 = Right justified, 0 = Left justified.", affectedPeripheral: "ADC" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "ACQT2", access: "R/W", reset: 0, description: "A/D Acquisition Time Select bit 2.", affectedPeripheral: "ADC" },
      { position: 4, name: "ACQT1", access: "R/W", reset: 0, description: "A/D Acquisition Time Select bit 1.", affectedPeripheral: "ADC" },
      { position: 3, name: "ACQT0", access: "R/W", reset: 0, description: "A/D Acquisition Time Select bit 0. Selects 0 to 20 TAD acquisition time.", affectedPeripheral: "ADC" },
      { position: 2, name: "ADCS2", access: "R/W", reset: 0, description: "A/D Conversion Clock Select bit 2.", affectedPeripheral: "ADC" },
      { position: 1, name: "ADCS1", access: "R/W", reset: 0, description: "A/D Conversion Clock Select bit 1.", affectedPeripheral: "ADC" },
      { position: 0, name: "ADCS0", access: "R/W", reset: 0, description: "A/D Conversion Clock Select bit 0. Selects FOSC divider (FOSC/2 to FOSC/64, or FRC).", affectedPeripheral: "ADC" }
    ]
  },
  ADRESH: {
    name: "ADRESH",
    address: "0xFC4",
    resetValue: "0x00",
    width: 8,
    category: "ADC",
    description: "A/D Result High Byte Register. Contains high-order bits of the 10-bit conversion result.",
    bits: [
      { position: 7, name: "ADRESH7", access: "R", reset: 0, description: "A/D High Byte bit 7.", affectedPeripheral: "ADC" },
      { position: 6, name: "ADRESH6", access: "R", reset: 0, description: "A/D High Byte bit 6.", affectedPeripheral: "ADC" },
      { position: 5, name: "ADRESH5", access: "R", reset: 0, description: "A/D High Byte bit 5.", affectedPeripheral: "ADC" },
      { position: 4, name: "ADRESH4", access: "R", reset: 0, description: "A/D High Byte bit 4.", affectedPeripheral: "ADC" },
      { position: 3, name: "ADRESH3", access: "R", reset: 0, description: "A/D High Byte bit 3.", affectedPeripheral: "ADC" },
      { position: 2, name: "ADRESH2", access: "R", reset: 0, description: "A/D High Byte bit 2.", affectedPeripheral: "ADC" },
      { position: 1, name: "ADRESH1", access: "R", reset: 0, description: "A/D High Byte bit 1.", affectedPeripheral: "ADC" },
      { position: 0, name: "ADRESH0", access: "R", reset: 0, description: "A/D High Byte bit 0.", affectedPeripheral: "ADC" }
    ]
  },
  ADRESL: {
    name: "ADRESL",
    address: "0xFC3",
    resetValue: "0x00",
    width: 8,
    category: "ADC",
    description: "A/D Result Low Byte Register. Contains low-order bits of the 10-bit conversion result.",
    bits: [
      { position: 7, name: "ADRESL7", access: "R", reset: 0, description: "A/D Low Byte bit 7.", affectedPeripheral: "ADC" },
      { position: 6, name: "ADRESL6", access: "R", reset: 0, description: "A/D Low Byte bit 6.", affectedPeripheral: "ADC" },
      { position: 5, name: "ADRESL5", access: "R", reset: 0, description: "A/D Low Byte bit 5.", affectedPeripheral: "ADC" },
      { position: 4, name: "ADRESL4", access: "R", reset: 0, description: "A/D Low Byte bit 4.", affectedPeripheral: "ADC" },
      { position: 3, name: "ADRESL3", access: "R", reset: 0, description: "A/D Low Byte bit 3.", affectedPeripheral: "ADC" },
      { position: 2, name: "ADRESL2", access: "R", reset: 0, description: "A/D Low Byte bit 2.", affectedPeripheral: "ADC" },
      { position: 1, name: "ADRESL1", access: "R", reset: 0, description: "A/D Low Byte bit 1.", affectedPeripheral: "ADC" },
      { position: 0, name: "ADRESL0", access: "R", reset: 0, description: "A/D Low Byte bit 0.", affectedPeripheral: "ADC" }
    ]
  },

  // ==========================================
  // 5. HARDWARE TIMERS (TMR0, TMR1, TMR2)
  // ==========================================
  T0CON: {
    name: "T0CON",
    address: "0xFD5",
    resetValue: "0xFF",
    width: 8,
    category: "TIMERS",
    description: "Timer0 Control Register. Configures 8/16-bit operation, clock source, and prescaler assignment.",
    bits: [
      { position: 7, name: "TMR0ON", access: "R/W", reset: 1, description: "Timer0 On/Off Control bit. 1 = Enables Timer0, 0 = Stops Timer0.", affectedPeripheral: "Timer0" },
      { position: 6, name: "T08BIT", access: "R/W", reset: 1, description: "Timer0 8-Bit/16-Bit Control. 1 = 8-bit timer/counter, 0 = 16-bit timer/counter.", affectedPeripheral: "Timer0" },
      { position: 5, name: "T0CS", access: "R/W", reset: 1, description: "Timer0 Clock Source Select. 1 = Transition on T0CKI pin, 0 = Internal instruction cycle (FOSC/4).", affectedPeripheral: "Timer0" },
      { position: 4, name: "T0SE", access: "R/W", reset: 1, description: "Timer0 Source Edge Select. 1 = Increment on high-to-low transition, 0 = low-to-high transition.", affectedPeripheral: "Timer0" },
      { position: 3, name: "PSA", access: "R/W", reset: 1, description: "Timer0 Prescaler Assignment. 1 = Prescaler NOT assigned (1:1), 0 = Prescaler assigned.", affectedPeripheral: "Timer0" },
      { position: 2, name: "T0PS2", access: "R/W", reset: 1, description: "Timer0 Prescaler Select bit 2.", affectedPeripheral: "Timer0" },
      { position: 1, name: "T0PS1", access: "R/W", reset: 1, description: "Timer0 Prescaler Select bit 1.", affectedPeripheral: "Timer0" },
      { position: 0, name: "T0PS0", access: "R/W", reset: 1, description: "Timer0 Prescaler Select bit 0. T0PS<2:0> selects 1:2 to 1:256.", affectedPeripheral: "Timer0" }
    ]
  },
  TMR0L: {
    name: "TMR0L",
    address: "0xFD6",
    resetValue: "0x00",
    width: 8,
    category: "TIMERS",
    description: "Timer0 Low Byte Register. Holds the lower 8 bits of Timer0 count.",
    bits: [
      { position: 7, name: "TMR0L7", access: "R/W", reset: 0, description: "Timer0 Low bit 7.", affectedPeripheral: "Timer0" },
      { position: 6, name: "TMR0L6", access: "R/W", reset: 0, description: "Timer0 Low bit 6.", affectedPeripheral: "Timer0" },
      { position: 5, name: "TMR0L5", access: "R/W", reset: 0, description: "Timer0 Low bit 5.", affectedPeripheral: "Timer0" },
      { position: 4, name: "TMR0L4", access: "R/W", reset: 0, description: "Timer0 Low bit 4.", affectedPeripheral: "Timer0" },
      { position: 3, name: "TMR0L3", access: "R/W", reset: 0, description: "Timer0 Low bit 3.", affectedPeripheral: "Timer0" },
      { position: 2, name: "TMR0L2", access: "R/W", reset: 0, description: "Timer0 Low bit 2.", affectedPeripheral: "Timer0" },
      { position: 1, name: "TMR0L1", access: "R/W", reset: 0, description: "Timer0 Low bit 1.", affectedPeripheral: "Timer0" },
      { position: 0, name: "TMR0L0", access: "R/W", reset: 0, description: "Timer0 Low bit 0.", affectedPeripheral: "Timer0" }
    ]
  },
  TMR0H: {
    name: "TMR0H",
    address: "0xFD7",
    resetValue: "0x00",
    width: 8,
    category: "TIMERS",
    description: "Timer0 High Byte Holding Register. Holds high byte during 16-bit read/write.",
    bits: [
      { position: 7, name: "TMR0H7", access: "R/W", reset: 0, description: "Timer0 High bit 7.", affectedPeripheral: "Timer0" },
      { position: 6, name: "TMR0H6", access: "R/W", reset: 0, description: "Timer0 High bit 6.", affectedPeripheral: "Timer0" },
      { position: 5, name: "TMR0H5", access: "R/W", reset: 0, description: "Timer0 High bit 5.", affectedPeripheral: "Timer0" },
      { position: 4, name: "TMR0H4", access: "R/W", reset: 0, description: "Timer0 High bit 4.", affectedPeripheral: "Timer0" },
      { position: 3, name: "TMR0H3", access: "R/W", reset: 0, description: "Timer0 High bit 3.", affectedPeripheral: "Timer0" },
      { position: 2, name: "TMR0H2", access: "R/W", reset: 0, description: "Timer0 High bit 2.", affectedPeripheral: "Timer0" },
      { position: 1, name: "TMR0H1", access: "R/W", reset: 0, description: "Timer0 High bit 1.", affectedPeripheral: "Timer0" },
      { position: 0, name: "TMR0H0", access: "R/W", reset: 0, description: "Timer0 High bit 0.", affectedPeripheral: "Timer0" }
    ]
  },
  T1CON: {
    name: "T1CON",
    address: "0xFCD",
    resetValue: "0x00",
    width: 8,
    category: "TIMERS",
    description: "Timer1 Control Register. Configures 16-bit Timer1, oscillator enable, and prescaler.",
    bits: [
      { position: 7, name: "RD16", access: "R/W", reset: 0, description: "16-Bit Read/Write Mode Enable. 1 = Enables read/write in one 16-bit operation, 0 = 8-bit operations.", affectedPeripheral: "Timer1" },
      { position: 6, name: "T1RUN", access: "R", reset: 0, description: "Timer1 System Clock Status. 1 = Device clock derived from Timer1 oscillator, 0 = other source.", affectedPeripheral: "Timer1" },
      { position: 5, name: "T1CKPS1", access: "R/W", reset: 0, description: "Timer1 Input Clock Prescale Select bit 1.", affectedPeripheral: "Timer1" },
      { position: 4, name: "T1CKPS0", access: "R/W", reset: 0, description: "Timer1 Input Clock Prescale Select bit 0. Selects 1:1, 1:2, 1:4, or 1:8.", affectedPeripheral: "Timer1" },
      { position: 3, name: "T1OSCEN", access: "R/W", reset: 0, description: "Timer1 Oscillator Enable. 1 = Timer1 crystal oscillator is enabled, 0 = shut off.", affectedPeripheral: "Timer1" },
      { position: 2, name: "T1SYNC", access: "R/W", reset: 0, description: "Timer1 External Clock Input Synchronization Select. 1 = Do not synchronize, 0 = Synchronize.", affectedPeripheral: "Timer1" },
      { position: 1, name: "TMR1CS", access: "R/W", reset: 0, description: "Timer1 Clock Source Select. 1 = External clock from T1CKI pin, 0 = Internal clock (FOSC/4).", affectedPeripheral: "Timer1" },
      { position: 0, name: "TMR1ON", access: "R/W", reset: 0, description: "Timer1 On bit. 1 = Enables Timer1, 0 = Stops Timer1.", affectedPeripheral: "Timer1" }
    ]
  },
  T2CON: {
    name: "T2CON",
    address: "0xFCA",
    resetValue: "0x00",
    width: 8,
    category: "TIMERS",
    description: "Timer2 Control Register. Configures Timer2 prescaler and postscaler. Provides timebase for PWM.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "TOUTPS3", access: "R/W", reset: 0, description: "Timer2 Output Postscale Select bit 3.", affectedPeripheral: "Timer2" },
      { position: 5, name: "TOUTPS2", access: "R/W", reset: 0, description: "Timer2 Output Postscale Select bit 2.", affectedPeripheral: "Timer2" },
      { position: 4, name: "TOUTPS1", access: "R/W", reset: 0, description: "Timer2 Output Postscale Select bit 1.", affectedPeripheral: "Timer2" },
      { position: 3, name: "TOUTPS0", access: "R/W", reset: 0, description: "Timer2 Output Postscale Select bit 0. Selects 1:1 to 1:16 postscale.", affectedPeripheral: "Timer2" },
      { position: 2, name: "TMR2ON", access: "R/W", reset: 0, description: "Timer2 On bit. 1 = Timer2 is on, 0 = Timer2 is off.", affectedPeripheral: "Timer2" },
      { position: 1, name: "T2CKPS1", access: "R/W", reset: 0, description: "Timer2 Clock Prescale Select bit 1.", affectedPeripheral: "Timer2" },
      { position: 0, name: "T2CKPS0", access: "R/W", reset: 0, description: "Timer2 Clock Prescale Select bit 0. 00 = Prescaler 1:1, 01 = 1:4, 1x = 1:16.", affectedPeripheral: "Timer2" }
    ]
  },
  PR2: {
    name: "PR2",
    address: "0xFCC",
    resetValue: "0xFF",
    width: 8,
    category: "TIMERS",
    description: "Timer2 Period Register. Determines the PWM period according to formula: PWM Period = [(PR2) + 1] * 4 * TOSC * (TMR2 Prescale).",
    bits: [
      { position: 7, name: "PR2_7", access: "R/W", reset: 1, description: "Period Register bit 7.", affectedPeripheral: "Timer2 / PWM" },
      { position: 6, name: "PR2_6", access: "R/W", reset: 1, description: "Period Register bit 6.", affectedPeripheral: "Timer2 / PWM" },
      { position: 5, name: "PR2_5", access: "R/W", reset: 1, description: "Period Register bit 5.", affectedPeripheral: "Timer2 / PWM" },
      { position: 4, name: "PR2_4", access: "R/W", reset: 1, description: "Period Register bit 4.", affectedPeripheral: "Timer2 / PWM" },
      { position: 3, name: "PR2_3", access: "R/W", reset: 1, description: "Period Register bit 3.", affectedPeripheral: "Timer2 / PWM" },
      { position: 2, name: "PR2_2", access: "R/W", reset: 1, description: "Period Register bit 2.", affectedPeripheral: "Timer2 / PWM" },
      { position: 1, name: "PR2_1", access: "R/W", reset: 1, description: "Period Register bit 1.", affectedPeripheral: "Timer2 / PWM" },
      { position: 0, name: "PR2_0", access: "R/W", reset: 1, description: "Period Register bit 0.", affectedPeripheral: "Timer2 / PWM" }
    ]
  },

  // ==========================================
  // 6. CAPTURE / COMPARE / PWM (CCP)
  // ==========================================
  CCP1CON: {
    name: "CCP1CON",
    address: "0xFBD",
    resetValue: "0x00",
    width: 8,
    category: "PWM/CCP",
    description: "Enhanced Capture/Compare/PWM 1 Control Register. Selects PWM mode, output configuration, and 2 LSBs of duty cycle.",
    bits: [
      { position: 7, name: "P1M1", access: "R/W", reset: 0, description: "Enhanced PWM Output Configuration bit 1.", affectedPeripheral: "ECCP1" },
      { position: 6, name: "P1M0", access: "R/W", reset: 0, description: "Enhanced PWM Output Configuration bit 0. 00 = Single output (P1A active), 01 = Full-bridge forward, 10 = Half-bridge, 11 = Full-bridge reverse.", affectedPeripheral: "ECCP1" },
      { position: 5, name: "DC1B1", access: "R/W", reset: 0, description: "PWM Duty Cycle bit 1 (LSB bit 1 of 10-bit duty).", affectedPeripheral: "PWM" },
      { position: 4, name: "DC1B0", access: "R/W", reset: 0, description: "PWM Duty Cycle bit 0 (LSB bit 0 of 10-bit duty).", affectedPeripheral: "PWM" },
      { position: 3, name: "CCP1M3", access: "R/W", reset: 0, description: "CCP1 Mode Select bit 3.", affectedPeripheral: "CCP1" },
      { position: 2, name: "CCP1M2", access: "R/W", reset: 0, description: "CCP1 Mode Select bit 2.", affectedPeripheral: "CCP1" },
      { position: 1, name: "CCP1M1", access: "R/W", reset: 0, description: "CCP1 Mode Select bit 1.", affectedPeripheral: "CCP1" },
      { position: 0, name: "CCP1M0", access: "R/W", reset: 0, description: "CCP1 Mode Select bit 0. 11xx = PWM mode; 0101 = Capture every rising edge; 1000 = Compare toggle output.", affectedPeripheral: "CCP1" }
    ]
  },
  CCPR1L: {
    name: "CCPR1L",
    address: "0xFBE",
    resetValue: "0x00",
    width: 8,
    category: "PWM/CCP",
    description: "Capture/Compare/PWM Register 1 Low Byte. In PWM mode, holds upper 8 bits of 10-bit duty cycle.",
    bits: [
      { position: 7, name: "CCPR1L7", access: "R/W", reset: 0, description: "Duty cycle bit 9 (MSB).", affectedPeripheral: "PWM" },
      { position: 6, name: "CCPR1L6", access: "R/W", reset: 0, description: "Duty cycle bit 8.", affectedPeripheral: "PWM" },
      { position: 5, name: "CCPR1L5", access: "R/W", reset: 0, description: "Duty cycle bit 7.", affectedPeripheral: "PWM" },
      { position: 4, name: "CCPR1L4", access: "R/W", reset: 0, description: "Duty cycle bit 6.", affectedPeripheral: "PWM" },
      { position: 3, name: "CCPR1L3", access: "R/W", reset: 0, description: "Duty cycle bit 5.", affectedPeripheral: "PWM" },
      { position: 2, name: "CCPR1L2", access: "R/W", reset: 0, description: "Duty cycle bit 4.", affectedPeripheral: "PWM" },
      { position: 1, name: "CCPR1L1", access: "R/W", reset: 0, description: "Duty cycle bit 3.", affectedPeripheral: "PWM" },
      { position: 0, name: "CCPR1L0", access: "R/W", reset: 0, description: "Duty cycle bit 2.", affectedPeripheral: "PWM" }
    ]
  },
  CCP2CON: {
    name: "CCP2CON",
    address: "0xFBA",
    resetValue: "0x00",
    width: 8,
    category: "PWM/CCP",
    description: "Standard Capture/Compare/PWM 2 Control Register.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "DC2B1", access: "R/W", reset: 0, description: "PWM Duty Cycle bit 1 (LSB).", affectedPeripheral: "PWM" },
      { position: 4, name: "DC2B0", access: "R/W", reset: 0, description: "PWM Duty Cycle bit 0 (LSB).", affectedPeripheral: "PWM" },
      { position: 3, name: "CCP2M3", access: "R/W", reset: 0, description: "CCP2 Mode Select bit 3.", affectedPeripheral: "CCP2" },
      { position: 2, name: "CCP2M2", access: "R/W", reset: 0, description: "CCP2 Mode Select bit 2.", affectedPeripheral: "CCP2" },
      { position: 1, name: "CCP2M1", access: "R/W", reset: 0, description: "CCP2 Mode Select bit 1.", affectedPeripheral: "CCP2" },
      { position: 0, name: "CCP2M0", access: "R/W", reset: 0, description: "CCP2 Mode Select bit 0. 11xx = PWM mode.", affectedPeripheral: "CCP2" }
    ]
  },

  // ==========================================
  // 7. EUSART SERIAL COMMUNICATIONS
  // ==========================================
  TXSTA: {
    name: "TXSTA",
    address: "0xFAC",
    resetValue: "0x02",
    width: 8,
    category: "EUSART",
    description: "Transmit Status and Control Register. Configures baud rate high-speed mode, 8/9-bit transmit, and TX enable.",
    bits: [
      { position: 7, name: "CSRC", access: "R/W", reset: 0, description: "Clock Source Select bit (Synchronous mode).", affectedPeripheral: "EUSART" },
      { position: 6, name: "TX9", access: "R/W", reset: 0, description: "9-Bit Transmit Enable bit. 1 = 9-bit transmission, 0 = 8-bit transmission.", affectedPeripheral: "EUSART" },
      { position: 5, name: "TXEN", access: "R/W", reset: 0, description: "Transmit Enable bit. 1 = Transmit enabled, 0 = Transmit disabled.", affectedPeripheral: "EUSART" },
      { position: 4, name: "SYNC", access: "R/W", reset: 0, description: "EUSART Mode Select bit. 1 = Synchronous mode, 0 = Asynchronous mode.", affectedPeripheral: "EUSART" },
      { position: 3, name: "SENDB", access: "R/W", reset: 0, description: "Send Break Character bit.", affectedPeripheral: "EUSART" },
      { position: 2, name: "BRGH", access: "R/W", reset: 0, description: "High Baud Rate Select bit. 1 = High speed (divisor 16 or 4), 0 = Low speed (divisor 64 or 16).", affectedPeripheral: "EUSART" },
      { position: 1, name: "TRMT", access: "R", reset: 1, description: "Transmit Shift Register Status. 1 = TSR empty, 0 = TSR full.", affectedPeripheral: "EUSART" },
      { position: 0, name: "TX9D", access: "R/W", reset: 0, description: "9th bit of Transmit Data (can be used for parity).", affectedPeripheral: "EUSART" }
    ]
  },
  RCSTA: {
    name: "RCSTA",
    address: "0xFAB",
    resetValue: "0x00",
    width: 8,
    category: "EUSART",
    description: "Receive Status and Control Register. Configures serial port enable (SPEN), continuous receive (CREN), and error flags.",
    bits: [
      { position: 7, name: "SPEN", access: "R/W", reset: 0, description: "Serial Port Enable bit. 1 = Serial port enabled (configures RX/DT and TX/CK pins as serial port pins).", affectedPeripheral: "EUSART" },
      { position: 6, name: "RX9", access: "R/W", reset: 0, description: "9-Bit Receive Enable bit. 1 = 9-bit reception, 0 = 8-bit reception.", affectedPeripheral: "EUSART" },
      { position: 5, name: "SREN", access: "R/W", reset: 0, description: "Single Receive Enable bit (Synchronous mode).", affectedPeripheral: "EUSART" },
      { position: 4, name: "CREN", access: "R/W", reset: 0, description: "Continuous Receive Enable bit. 1 = Enables receiver continuously, 0 = Disables receiver.", affectedPeripheral: "EUSART" },
      { position: 3, name: "ADDEN", access: "R/W", reset: 0, description: "Address Detect Enable bit (9-bit mode).", affectedPeripheral: "EUSART" },
      { position: 2, name: "FERR", access: "R", reset: 0, description: "Framing Error bit. 1 = Framing error has occurred, 0 = No framing error.", affectedPeripheral: "EUSART" },
      { position: 1, name: "OERR", access: "R", reset: 0, description: "Overrun Error bit. 1 = Overrun error has occurred (can be cleared by toggling CREN), 0 = No overrun.", affectedPeripheral: "EUSART" },
      { position: 0, name: "RX9D", access: "R", reset: 0, description: "9th bit of Received Data.", affectedPeripheral: "EUSART" }
    ]
  },
  SPBRG: {
    name: "SPBRG",
    address: "0xFAF",
    resetValue: "0x00",
    width: 8,
    category: "EUSART",
    description: "Baud Rate Generator Low Byte Register. Controls UART transmission speed.",
    bits: [
      { position: 7, name: "SPBRG7", access: "R/W", reset: 0, description: "Baud Rate divisor bit 7.", affectedPeripheral: "EUSART" },
      { position: 6, name: "SPBRG6", access: "R/W", reset: 0, description: "Baud Rate divisor bit 6.", affectedPeripheral: "EUSART" },
      { position: 5, name: "SPBRG5", access: "R/W", reset: 0, description: "Baud Rate divisor bit 5.", affectedPeripheral: "EUSART" },
      { position: 4, name: "SPBRG4", access: "R/W", reset: 0, description: "Baud Rate divisor bit 4.", affectedPeripheral: "EUSART" },
      { position: 3, name: "SPBRG3", access: "R/W", reset: 0, description: "Baud Rate divisor bit 3.", affectedPeripheral: "EUSART" },
      { position: 2, name: "SPBRG2", access: "R/W", reset: 0, description: "Baud Rate divisor bit 2.", affectedPeripheral: "EUSART" },
      { position: 1, name: "SPBRG1", access: "R/W", reset: 0, description: "Baud Rate divisor bit 1.", affectedPeripheral: "EUSART" },
      { position: 0, name: "SPBRG0", access: "R/W", reset: 0, description: "Baud Rate divisor bit 0.", affectedPeripheral: "EUSART" }
    ]
  },
  TXREG: {
    name: "TXREG",
    address: "0xFAD",
    resetValue: "0x00",
    width: 8,
    category: "EUSART",
    description: "EUSART Transmit Data Register. Writing a byte to TXREG initiates serial transmission.",
    bits: [
      { position: 7, name: "TXD7", access: "W", reset: 0, description: "Transmit data bit 7.", affectedPeripheral: "EUSART" },
      { position: 6, name: "TXD6", access: "W", reset: 0, description: "Transmit data bit 6.", affectedPeripheral: "EUSART" },
      { position: 5, name: "TXD5", access: "W", reset: 0, description: "Transmit data bit 5.", affectedPeripheral: "EUSART" },
      { position: 4, name: "TXD4", access: "W", reset: 0, description: "Transmit data bit 4.", affectedPeripheral: "EUSART" },
      { position: 3, name: "TXD3", access: "W", reset: 0, description: "Transmit data bit 3.", affectedPeripheral: "EUSART" },
      { position: 2, name: "TXD2", access: "W", reset: 0, description: "Transmit data bit 2.", affectedPeripheral: "EUSART" },
      { position: 1, name: "TXD1", access: "W", reset: 0, description: "Transmit data bit 1.", affectedPeripheral: "EUSART" },
      { position: 0, name: "TXD0", access: "W", reset: 0, description: "Transmit data bit 0.", affectedPeripheral: "EUSART" }
    ]
  },
  RCREG: {
    name: "RCREG",
    address: "0xFAE",
    resetValue: "0x00",
    width: 8,
    category: "EUSART",
    description: "EUSART Receive Data Register. Reading RCREG retrieves the oldest byte from the 2-byte FIFO buffer.",
    bits: [
      { position: 7, name: "RXD7", access: "R", reset: 0, description: "Received data bit 7.", affectedPeripheral: "EUSART" },
      { position: 6, name: "RXD6", access: "R", reset: 0, description: "Received data bit 6.", affectedPeripheral: "EUSART" },
      { position: 5, name: "RXD5", access: "R", reset: 0, description: "Received data bit 5.", affectedPeripheral: "EUSART" },
      { position: 4, name: "RXD4", access: "R", reset: 0, description: "Received data bit 4.", affectedPeripheral: "EUSART" },
      { position: 3, name: "RXD3", access: "R", reset: 0, description: "Received data bit 3.", affectedPeripheral: "EUSART" },
      { position: 2, name: "RXD2", access: "R", reset: 0, description: "Received data bit 2.", affectedPeripheral: "EUSART" },
      { position: 1, name: "RXD1", access: "R", reset: 0, description: "Received data bit 1.", affectedPeripheral: "EUSART" },
      { position: 0, name: "RXD0", access: "R", reset: 0, description: "Received data bit 0.", affectedPeripheral: "EUSART" }
    ]
  },

  // ==========================================
  // 8. INTERRUPT CONTROL REGISTERS
  // ==========================================
  INTCON: {
    name: "INTCON",
    address: "0xFF2",
    resetValue: "0x00",
    width: 8,
    category: "INTERRUPTS",
    description: "Interrupt Control Register. Master enable for high/low priority interrupts, peripheral interrupts, TMR0, and INT0.",
    bits: [
      { position: 7, name: "GIE/GIEH", access: "R/W", reset: 0, description: "Global Interrupt Enable bit. 1 = Enables all unmasked interrupts (or high priority when IPEN=1).", affectedPeripheral: "Interrupts" },
      { position: 6, name: "PEIE/GIEL", access: "R/W", reset: 0, description: "Peripheral Interrupt Enable bit / Low Priority Global Interrupt Enable bit.", affectedPeripheral: "Interrupts" },
      { position: 5, name: "TMR0IE", access: "R/W", reset: 0, description: "TMR0 Overflow Interrupt Enable bit. 1 = Enables TMR0 interrupt.", affectedPeripheral: "Timer0" },
      { position: 4, name: "INT0IE", access: "R/W", reset: 0, description: "INT0 External Interrupt Enable bit. 1 = Enables INT0 external interrupt on RB0.", affectedPeripheral: "Interrupts" },
      { position: 3, name: "RBIE", access: "R/W", reset: 0, description: "RB Port Change Interrupt Enable bit. 1 = Enables interrupt on change for RB4..RB7.", affectedPeripheral: "PORTB" },
      { position: 2, name: "TMR0IF", access: "R/W", reset: 0, description: "TMR0 Overflow Interrupt Flag bit. 1 = TMR0 register has overflowed (must be cleared in software).", affectedPeripheral: "Timer0" },
      { position: 1, name: "INT0IF", access: "R/W", reset: 0, description: "INT0 External Interrupt Flag bit. 1 = INT0 external interrupt occurred.", affectedPeripheral: "Interrupts" },
      { position: 0, name: "RBIF", access: "R/W", reset: 0, description: "RB Port Change Interrupt Flag bit. 1 = At least one pin RB4..RB7 changed state.", affectedPeripheral: "PORTB" }
    ]
  },
  INTCON2: {
    name: "INTCON2",
    address: "0xFF1",
    resetValue: "0xF5",
    width: 8,
    category: "INTERRUPTS",
    description: "Interrupt Control Register 2. PORTB pull-ups enable, interrupt edge triggers, and priority assignments.",
    bits: [
      { position: 7, name: "RBPU", access: "R/W", reset: 1, description: "PORTB Pull-up Enable bit. 1 = All PORTB pull-ups disabled, 0 = Pull-ups enabled by individual port latch values.", affectedPeripheral: "PORTB" },
      { position: 6, name: "INTEDG0", access: "R/W", reset: 1, description: "External Interrupt 0 Edge Select. 1 = Interrupt on rising edge, 0 = Interrupt on falling edge.", affectedPeripheral: "Interrupts" },
      { position: 5, name: "INTEDG1", access: "R/W", reset: 1, description: "External Interrupt 1 Edge Select. 1 = Rising edge, 0 = Falling edge.", affectedPeripheral: "Interrupts" },
      { position: 4, name: "INTEDG2", access: "R/W", reset: 1, description: "External Interrupt 2 Edge Select. 1 = Rising edge, 0 = Falling edge.", affectedPeripheral: "Interrupts" },
      { position: 3, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 2, name: "TMR0IP", access: "R/W", reset: 1, description: "TMR0 Overflow Interrupt Priority bit. 1 = High priority, 0 = Low priority.", affectedPeripheral: "Timer0" },
      { position: 1, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 0, name: "RBIP", access: "R/W", reset: 1, description: "RB Port Change Interrupt Priority bit. 1 = High priority, 0 = Low priority.", affectedPeripheral: "PORTB" }
    ]
  },
  INTCON3: {
    name: "INTCON3",
    address: "0xFF0",
    resetValue: "0xC0",
    width: 8,
    category: "INTERRUPTS",
    description: "Interrupt Control Register 3. External interrupt INT1 & INT2 enables, priorities, and flags.",
    bits: [
      { position: 7, name: "INT2IP", access: "R/W", reset: 1, description: "INT2 External Interrupt Priority bit. 1 = High priority, 0 = Low priority.", affectedPeripheral: "Interrupts" },
      { position: 6, name: "INT1IP", access: "R/W", reset: 1, description: "INT1 External Interrupt Priority bit. 1 = High priority, 0 = Low priority.", affectedPeripheral: "Interrupts" },
      { position: 5, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 4, name: "INT2IE", access: "R/W", reset: 0, description: "INT2 External Interrupt Enable bit. 1 = Enables INT2 interrupt.", affectedPeripheral: "Interrupts" },
      { position: 3, name: "INT1IE", access: "R/W", reset: 0, description: "INT1 External Interrupt Enable bit. 1 = Enables INT1 interrupt.", affectedPeripheral: "Interrupts" },
      { position: 2, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 1, name: "INT2IF", access: "R/W", reset: 0, description: "INT2 External Interrupt Flag bit. 1 = INT2 occurred.", affectedPeripheral: "Interrupts" },
      { position: 0, name: "INT1IF", access: "R/W", reset: 0, description: "INT1 External Interrupt Flag bit. 1 = INT1 occurred.", affectedPeripheral: "Interrupts" }
    ]
  },

  // ==========================================
  // 9. CORE SYSTEM & STATUS REGISTERS
  // ==========================================
  STATUS: {
    name: "STATUS",
    address: "0xFD8",
    resetValue: "0x00",
    width: 8,
    category: "SYSTEM",
    description: "ALU Status Register. Contains Zero (Z), Carry (C), Negative (N), Overflow (OV), and Digit Carry (DC) flags.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "ALU" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "ALU" },
      { position: 5, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "ALU" },
      { position: 4, name: "N", access: "R/W", reset: 0, description: "Negative bit. Set if most significant bit of result is 1.", affectedPeripheral: "ALU" },
      { position: 3, name: "OV", access: "R/W", reset: 0, description: "Overflow bit. Set if signed overflow occurred.", affectedPeripheral: "ALU" },
      { position: 2, name: "Z", access: "R/W", reset: 0, description: "Zero bit. Set if arithmetic/logic result is 0.", affectedPeripheral: "ALU" },
      { position: 1, name: "DC", access: "R/W", reset: 0, description: "Digit Carry bit (nibble carry).", affectedPeripheral: "ALU" },
      { position: 0, name: "C", access: "R/W", reset: 0, description: "Carry/Borrow bit.", affectedPeripheral: "ALU" }
    ]
  },
  OSCCON: {
    name: "OSCCON",
    address: "0xFD3",
    resetValue: "0x00",
    width: 8,
    category: "SYSTEM",
    description: "Oscillator Control Register. Configures internal oscillator frequency (31 kHz to 8 MHz) and system clock select.",
    bits: [
      { position: 7, name: "IDLEN", access: "R/W", reset: 0, description: "Idle Enable bit. 1 = Device enters Idle on SLEEP, 0 = Device enters Sleep.", affectedPeripheral: "System" },
      { position: 6, name: "IRCF2", access: "R/W", reset: 0, description: "Internal Oscillator Frequency Select bit 2.", affectedPeripheral: "Oscillator" },
      { position: 5, name: "IRCF1", access: "R/W", reset: 0, description: "Internal Oscillator Frequency Select bit 1.", affectedPeripheral: "Oscillator" },
      { position: 4, name: "IRCF0", access: "R/W", reset: 0, description: "Internal Oscillator Frequency Select bit 0. 111 = 8 MHz, 110 = 4 MHz, 101 = 2 MHz, etc.", affectedPeripheral: "Oscillator" },
      { position: 3, name: "OSTS", access: "R", reset: 0, description: "Oscillator Start-up Time-out Status bit.", affectedPeripheral: "Oscillator" },
      { position: 2, name: "IOFS", access: "R", reset: 0, description: "INTOSC Frequency Stable bit.", affectedPeripheral: "Oscillator" },
      { position: 1, name: "SCS1", access: "R/W", reset: 0, description: "System Clock Select bit 1.", affectedPeripheral: "Oscillator" },
      { position: 0, name: "SCS0", access: "R/W", reset: 0, description: "System Clock Select bit 0. 1x = Internal oscillator block, 01 = Timer1 oscillator, 00 = Primary oscillator.", affectedPeripheral: "Oscillator" }
    ]
  },
  RCON: {
    name: "RCON",
    address: "0xFD0",
    resetValue: "0x1F",
    width: 8,
    category: "SYSTEM",
    description: "Reset Control Register. Identifies Power-on Reset, Brown-out Reset, Watchdog Timeout, and enables Interrupt Priority.",
    bits: [
      { position: 7, name: "IPEN", access: "R/W", reset: 0, description: "Interrupt Priority Enable bit. 1 = Enable priority levels on interrupts, 0 = Disable priority levels (PIC16 compatibility mode).", affectedPeripheral: "Interrupts" },
      { position: 6, name: "SBOREN", access: "R/W", reset: 1, description: "Software BOR Enable bit.", affectedPeripheral: "System" },
      { position: 5, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 4, name: "RI", access: "R/W", reset: 1, description: "RESET Instruction Flag bit. 0 = The RESET instruction was executed.", affectedPeripheral: "System" },
      { position: 3, name: "TO", access: "R", reset: 1, description: "Watchdog Time-out Flag bit.", affectedPeripheral: "WDT" },
      { position: 2, name: "PD", access: "R", reset: 1, description: "Power-down Detection Flag bit.", affectedPeripheral: "System" },
      { position: 1, name: "POR", access: "R/W", reset: 0, description: "Power-on Reset Status bit. Must be cleared in software after power up.", affectedPeripheral: "System" },
      { position: 0, name: "BOR", access: "R/W", reset: 0, description: "Brown-out Reset Status bit.", affectedPeripheral: "System" }
    ]
  }
};

// ==========================================
// PIC18F4550 SPECIFIC REGISTERS (USB)
// ==========================================
export const REGISTERS_PIC18F4550 = {
  ...REGISTERS_PIC18F4520,
  UCON: {
    name: "UCON",
    address: "0xF6D",
    resetValue: "0x00",
    width: 8,
    category: "SYSTEM",
    description: "USB Control Register (PIC18F4550 Specific). Controls USB module enable, suspend state, and packet transmission.",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "USB" },
      { position: 6, name: "PPBRST", access: "R/W", reset: 0, description: "Ping-Pong Buffers Reset bit.", affectedPeripheral: "USB" },
      { position: 5, name: "SE0", access: "R", reset: 0, description: "Live Single-Ended Zero Flag bit.", affectedPeripheral: "USB" },
      { position: 4, name: "PKTDIS", access: "R/W", reset: 0, description: "Packet Transfer Disable bit.", affectedPeripheral: "USB" },
      { position: 3, name: "USBEN", access: "R/W", reset: 0, description: "USB Module Enable bit. 1 = USB module enabled, 0 = USB module disabled.", affectedPeripheral: "USB" },
      { position: 2, name: "RESUME", access: "R/W", reset: 0, description: "Resume Signaling Enable bit.", affectedPeripheral: "USB" },
      { position: 1, name: "SUSPND", access: "R/W", reset: 0, description: "USB Suspend Mode Enable bit.", affectedPeripheral: "USB" },
      { position: 0, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" }
    ]
  },
  UCFG: {
    name: "UCFG",
    address: "0xF6F",
    resetValue: "0x00",
    width: 8,
    category: "SYSTEM",
    description: "USB Configuration Register (PIC18F4550 Specific). Controls on-chip pull-ups, transceiver speed, and eye pattern test.",
    bits: [
      { position: 7, name: "UTEYE", access: "R/W", reset: 0, description: "USB Eye Pattern Test Enable bit.", affectedPeripheral: "USB" },
      { position: 6, name: "UOEMON", access: "R/W", reset: 0, description: "USB OE Monitor Enable bit.", affectedPeripheral: "USB" },
      { position: 5, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 4, name: "UPUEN", access: "R/W", reset: 0, description: "USB On-Chip Pull-up Enable bit. 1 = Pull-ups enabled.", affectedPeripheral: "USB" },
      { position: 3, name: "UTRDIS", access: "R/W", reset: 0, description: "On-Chip Transceiver Disable bit.", affectedPeripheral: "USB" },
      { position: 2, name: "FSEN", access: "R/W", reset: 0, description: "Full-Speed Enable bit. 1 = Full-speed (12 Mbps), 0 = Low-speed (1.5 Mbps).", affectedPeripheral: "USB" },
      { position: 1, name: "PPB1", access: "R/W", reset: 0, description: "Ping-Pong Buffer Configuration bit 1.", affectedPeripheral: "USB" },
      { position: 0, name: "PPB0", access: "R/W", reset: 0, description: "Ping-Pong Buffer Configuration bit 0.", affectedPeripheral: "USB" }
    ]
  }
};

// ==========================================
// PIC18F45K22 SPECIFIC REGISTERS (ANSELx)
// ==========================================
export const REGISTERS_PIC18F45K22 = {
  ...REGISTERS_PIC18F4520,
  ANSELB: {
    name: "ANSELB",
    address: "0xF39",
    resetValue: "0xFF",
    width: 8,
    category: "ADC",
    description: "PORTB Analog Select Register (PIC18F45K22 Specific). Dedicated digital/analog pin control per bit (replaces PCFG bits in ADCON1).",
    bits: [
      { position: 7, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 6, name: "—", access: "U-0", reset: 0, description: "Unimplemented.", affectedPeripheral: "None" },
      { position: 5, name: "ANSB5", access: "R/W", reset: 1, description: "RB5 Analog Select bit. 1 = Analog input, 0 = Digital I/O.", affectedPeripheral: "PORTB / ADC" },
      { position: 4, name: "ANSB4", access: "R/W", reset: 1, description: "RB4 Analog Select bit. 1 = Analog input, 0 = Digital I/O.", affectedPeripheral: "PORTB / ADC" },
      { position: 3, name: "ANSB3", access: "R/W", reset: 1, description: "RB3 Analog Select bit. 1 = Analog input, 0 = Digital I/O.", affectedPeripheral: "PORTB / ADC" },
      { position: 2, name: "ANSB2", access: "R/W", reset: 1, description: "RB2 Analog Select bit. 1 = Analog input, 0 = Digital I/O.", affectedPeripheral: "PORTB / ADC" },
      { position: 1, name: "ANSB1", access: "R/W", reset: 1, description: "RB1 Analog Select bit. 1 = Analog input, 0 = Digital I/O.", affectedPeripheral: "PORTB / ADC" },
      { position: 0, name: "ANSB0", access: "R/W", reset: 1, description: "RB0 Analog Select bit. 1 = Analog input, 0 = Digital I/O.", affectedPeripheral: "PORTB / ADC" }
    ]
  }
};

/**
 * Retrieve curated educational SFR data for the selected device
 * @param {string} deviceId
 * @returns {object} Curated dictionary of register definitions
 */
export function getRegistersForDevice(deviceId = "PIC18F4520") {
  // The 4520 extension set adds important common SFRs that the learning UI relies on.
  if (deviceId === "PIC18F4550") return { ...REGISTERS_PIC18F4550, ...COMMON_PIC18F4520_REGISTERS };
  if (deviceId === "PIC18F45K22") return { ...REGISTERS_PIC18F45K22, ...COMMON_PIC18F4520_REGISTERS };
  return { ...REGISTERS_PIC18F4520, ...COMMON_PIC18F4520_REGISTERS };
}
