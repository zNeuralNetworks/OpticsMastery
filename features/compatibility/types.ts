
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
