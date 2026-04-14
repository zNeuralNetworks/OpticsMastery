
import { LinkBudgetInputs, LinkBudgetResult } from '../types';

export const calculateLinkBudget = (inputs: LinkBudgetInputs): LinkBudgetResult => {
  const {
    fiberType,
    distanceMeters,
    connectorPairs,
    spliceCount,
    includeMarginDb,
    opticBudgetDb,
    attenuationOverride,
    connectorLossOverride,
    spliceLossOverride
  } = inputs;

  // Typical Assumptions based on TIA-568 standards vs Real-world Conservative
  const defaultAttenuation = fiberType === 'SMF' ? 0.35 : 3.0; // dB/km (1310nm vs 850nm)
  const defaultConnectorLoss = 0.5; // dB per pair (Conservative)
  const defaultSpliceLoss = 0.1; // dB

  const attenuation = attenuationOverride ?? defaultAttenuation;
  const connectorLoss = connectorLossOverride ?? defaultConnectorLoss;
  const spliceLoss = spliceLossOverride ?? defaultSpliceLoss;

  const fiberLossDb = (distanceMeters / 1000) * attenuation;
  const connLossDbTotal = connectorPairs * connectorLoss;
  const spliceLossDbTotal = spliceCount * spliceLoss;

  const totalLossDb = fiberLossDb + connLossDbTotal + spliceLossDbTotal + includeMarginDb;
  const marginDb = opticBudgetDb - totalLossDb;

  let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
  if (marginDb < 0) {
    status = 'FAIL';
  } else if (marginDb < 2.0) {
    status = 'WARN';
  }

  const notes = [
    `Fiber attenuation assumed at ${attenuation.toFixed(2)} dB/km.`,
    `Each connector pair contributes ${connectorLoss.toFixed(2)} dB typical loss.`,
    `Safety margin of ${includeMarginDb.toFixed(1)} dB included in total.`
  ];

  return {
    fiberLossDb,
    connectorLossDb: connLossDbTotal,
    spliceLossDb: spliceLossDbTotal,
    totalLossDb,
    marginDb,
    status,
    notes
  };
};
