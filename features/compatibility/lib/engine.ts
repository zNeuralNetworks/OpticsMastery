
import { CompatibilityResult, CompatibilityStatus, InterfaceDef } from '../types';
import { validateMediaCompatibility, validateConnectorCompatibility, computeTypicalWarnings } from './rules';

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

  // 4. FEC Rule (Intelligence)
  const sourceFec = source.modulation === 'PAM4' ? 'RS-FEC (KP4)' : 'None/Base-R';
  const destFec = dest.modulation === 'PAM4' ? 'RS-FEC (KP4)' : 'None/Base-R';
  
  if (sourceFec !== destFec) {
    status = 'Warning';
    reasons.push(`FEC Mismatch Risk: ${source.sku} expects ${sourceFec}, ${dest.sku} expects ${destFec}.`);
    warnings.push("Link flap risk: Ensure FEC is manually overridden to match on both switch ports.");
  }

  // 5. Power Class Check
  if (source.formFactor === 'QSFP-DD' && source.modulation === 'PAM4') {
    warnings.push("Power Density: Ensure the switch port is configured for high-power (Class 8) transceivers.");
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
