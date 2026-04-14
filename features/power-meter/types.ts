
export type SignalMode = 'PAM4_SMF' | 'NRZ_SMF' | 'MMF_SR' | 'ZR_COHERENT';

export type SignalStatus = 'CRITICAL' | 'WARNING' | 'GOOD' | 'HIGH' | 'DAMAGE';

export interface RangeConfig {
  min: number;      // Absolute min (LOS)
  warnLow: number;  // Warning threshold
  goodLow: number;  // Start of good range
  goodHigh: number; // End of good range
  warnHigh: number; // High warning
  max: number;      // Absolute max (Damage)
  label: string;
  desc: string;
}
