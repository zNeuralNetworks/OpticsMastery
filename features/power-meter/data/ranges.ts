
import { SignalMode, RangeConfig } from '../types';

export const SIGNAL_RANGES: Record<SignalMode, RangeConfig> = {
  PAM4_SMF: {
    min: -12, warnLow: -8, goodLow: -6, goodHigh: 3, warnHigh: 4.5, max: 6,
    label: '400G/100G PAM4 (DR/FR)',
    desc: 'Modern 100G/400G Single-Mode. Highly sensitive to low light due to PAM4 encoding.'
  },
  NRZ_SMF: {
    min: -16, warnLow: -12, goodLow: -10, goodHigh: 2, warnHigh: 4.5, max: 6,
    label: '100G/10G NRZ (LR/LR4)',
    desc: 'Legacy Single-Mode. More robust signal tolerance than PAM4.'
  },
  MMF_SR: {
    min: -14, warnLow: -11, goodLow: -9, goodHigh: 1, warnHigh: 2.4, max: 4,
    label: 'SR/SR4 Multimode',
    desc: 'Standard Short Range (850nm). Used for intra-rack or short campus runs.'
  },
  ZR_COHERENT: {
    min: -24, warnLow: -18, goodLow: -16, goodHigh: -2, warnHigh: 0, max: 2,
    label: '400G-ZR (Coherent)',
    desc: 'Long-haul DCI optics. Designed to operate at very low receive power levels.'
  }
};
