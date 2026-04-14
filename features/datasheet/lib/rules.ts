
export type CompatibilityStatus = 'Supported' | 'Unsupported';

export interface EosCompatibilityResult {
  status: CompatibilityStatus;
  message: string;
}

/**
 * Determines if a specific transceiver SKU is compatible with a given EOS version.
 * Logic based on platform hardware constraints and software release cycles.
 */
export const checkEosCompatibility = (sku: string, eosVersion: string): EosCompatibilityResult => {
  // Parse version (e.g. "4.32.0" -> 4.32)
  const parts = eosVersion.split('.');
  const major = parseFloat(`${parts[0]}.${parts[1]}`);
  
  if (sku.includes('800G')) {
      if (major >= 4.29) {
        return { status: 'Supported', message: 'Supported' };
      }
      return { status: 'Unsupported', message: 'Unsupported (Requires EOS 4.29.2+)' };
  }
  
  if (sku.includes('400G')) {
      if (major >= 4.23) {
        return { status: 'Supported', message: 'Supported' };
      }
      return { status: 'Unsupported', message: 'Unsupported (Requires EOS 4.23.0+)' };
  }
  
  // Default to supported for legacy 100G/40G/10G if not explicitly restricted
  return { status: 'Supported', message: 'Supported' };
};
