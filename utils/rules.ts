
import { InterfaceDef } from './compatibility';

/**
 * Validates if a specific breakout mode is physically and logically supported.
 */
export const validateBreakoutMode = (portFormFactor: string, portSpeed: string, targetSpeed: string, lanes: number) => {
  const reasons: string[] = [];
  let ok = true;

  // 400G logic
  if (portSpeed === '400G') {
    if (targetSpeed === '100G' && lanes !== 4) {
      ok = false;
      reasons.push("400G to 100G breakout typically requires a 4-lane mapping (4x 100G).");
    }
  }

  // 800G logic
  if (portSpeed === '800G') {
    if (portFormFactor !== 'OSFP' && portFormFactor !== 'QSFP-DD800') {
      ok = false;
      reasons.push("800G speeds require high-density OSFP or QSFP-DD800 form factors.");
    }
  }

  return { ok, reasons };
};

/**
 * Validates physical media and wavelength compatibility between two interfaces.
 */
export const validateMediaCompatibility = (source: InterfaceDef, dest: InterfaceDef) => {
  const reasons: string[] = [];
  let ok = true;

  if (source.media !== dest.media) {
    ok = false;
    reasons.push(`Physical Media Mismatch: ${source.media} cannot mate with ${dest.media}.`);
  }

  if (source.wavelength !== dest.wavelength) {
    // Special handling for wide-band 1310 receivers
    if (source.wavelength === 'CWDM' && dest.wavelength === '1310nm') {
      ok = false;
      reasons.push("Spectral Mismatch: A muxed CWDM signal cannot be correctly decoded by a standard 1310nm receiver.");
    } else {
      ok = false;
      reasons.push(`Wavelength Mismatch: ${source.wavelength} vs ${dest.wavelength}.`);
    }
  }

  return { ok, reasons };
};

/**
 * Validates connector types and critical polish safety rules.
 */
export const validateConnectorCompatibility = (source: InterfaceDef, dest: InterfaceDef) => {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let ok = true;

  const isMPO = (c: string) => c.includes('MPO');
  
  // Polish Check (Highest physical risk)
  if (isMPO(source.connector) && isMPO(dest.connector)) {
    if (source.polish !== dest.polish && source.polish !== 'N/A' && dest.polish !== 'N/A') {
      ok = false;
      reasons.push(`CRITICAL: Polish Mismatch (${source.polish} to ${dest.polish}).`);
      warnings.push("PHYSICAL DANGER: Mating APC (Angled) to UPC (Flat) MPO will permanently damage fiber cores.");
    }
  }

  // Physical Mating Check
  if (source.connector !== dest.connector) {
    if (isMPO(source.connector) && dest.connector.includes('LC')) {
      warnings.push("Breakout Required: Connection is only possible via a breakout cable or patch panel.");
    } else if (source.connector !== 'Integrated' && dest.connector !== 'Integrated') {
      ok = false;
      reasons.push(`Connector Mismatch: ${source.connector} to ${dest.connector}.`);
    }
  }

  return { ok, reasons, warnings };
};

/**
 * Generates standard engineering warnings based on the optic specification.
 */
export const computeTypicalWarnings = (optic: InterfaceDef): string[] => {
  const warnings: string[] = [];

  if (optic.modulation === 'PAM4') {
    warnings.push("RS-FEC Mandatory: Link will not come up if FEC is disabled on either end.");
  }

  if (optic.media === 'MMF') {
    warnings.push("Reach Constraint: Reach varies significantly between OM3 (70m) and OM4 (100m) grades.");
  }

  if (optic.connector.includes('APC')) {
    warnings.push("Polish Check: Ensure all patch cords and panels in the path are APC (Green).");
  }

  return warnings;
};
