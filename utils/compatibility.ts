
import { validateMediaCompatibility, validateConnectorCompatibility, computeTypicalWarnings } from './rules';

export type CompatibilityStatus = 'Compatible' | 'Incompatible' | 'Warning';

export interface InterfaceDef {
  id: string;
  sku: string;
  name: string;
  media: 'SMF' | 'MMF' | 'COPPER';
  wavelength: string;
  connector: string;
  polish: 'APC' | 'UPC' | 'N/A';
  modulation: 'PAM4' | 'NRZ';
  lanes: number;
  speedPerLane: number;
  formFactor: string;
}

export interface CompatibilityResult {
  status: CompatibilityStatus;
  reasons: string[];
  warnings: string[];
  suggestedFixes: string[];
}

export const evaluateCompatibility = (source: InterfaceDef, dest: InterfaceDef): CompatibilityResult => {
  const reasons: string[] = [];
    const warnings: string[] = [];
  const suggestedFixes: string[] = [];
  let status: CompatibilityStatus = 'Compatible';

  // 1. Media & Wavelength Rule
  const mediaVal = validateMediaCompatibility(source, dest);
  if (!mediaVal.ok) {
    status = 'Incompatible';
    reasons.push(...mediaVal.reasons);
    suggestedFixes.push(`Ensure both ports use ${source.media} or ${dest.media} transceivers.`);
  }

  // 2. Connector & Polish Rule
  const connVal = validateConnectorCompatibility(source, dest);
  if (!connVal.ok) {
    status = 'Incompatible';
    reasons.push(...connVal.reasons);
  }
  warnings.push(...connVal.warnings);

  // 3. Modulation & Lane Rule
  if (source.modulation !== dest.modulation) {
    status = 'Incompatible';
    reasons.push(`Modulation Mismatch: ${source.modulation} vs ${dest.modulation}.`);
    suggestedFixes.push(`For ${source.modulation} to ${dest.modulation} transition, use an active gearbox component.`);
  }

  if (source.speedPerLane !== dest.speedPerLane) {
    if (source.speedPerLane === 100 && dest.speedPerLane === 25) {
      status = 'Warning';
      reasons.push("Speed/Lane Mismatch: 100G Single Lambda vs 25G NRZ lanes.");
      suggestedFixes.push("Requires an Active Electrical Cable (AEC) or H-Series Gearbox DAC.");
    } else {
      status = 'Incompatible';
      reasons.push(`Lane Speed Mismatch: ${source.speedPerLane}G vs ${dest.speedPerLane}G.`);
    }
  }

  // 4. Typical Engineering Warnings
  warnings.push(...computeTypicalWarnings(source));

  if (reasons.length === 0) {
    reasons.push("Port parameters are standard and theoretically compatible.");
  }

  return { status, reasons, warnings, suggestedFixes };
};
