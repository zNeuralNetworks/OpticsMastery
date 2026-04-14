
export interface LinkBudgetInputs {
  fiberType: 'SMF' | 'MMF';
  distanceMeters: number;
  connectorPairs: number;
  spliceCount: number;
  includeMarginDb: number;
  opticBudgetDb: number;
  // Advanced overrides
  attenuationOverride?: number; // dB/km
  connectorLossOverride?: number; // dB per pair
  spliceLossOverride?: number; // dB per splice
}

export interface LinkBudgetResult {
  fiberLossDb: number;
  connectorLossDb: number;
  spliceLossDb: number;
  totalLossDb: number;
  marginDb: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  notes: string[];
}
