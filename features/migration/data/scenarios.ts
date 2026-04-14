
import { MigrationScenario } from '../types';

export const SCENARIOS: MigrationScenario[] = [
  {
    id: 'MMF_MPO',
    title: 'Multimode (OM3/OM4) + MPO-12',
    iconKey: 'Cable',
    legacyExample: '40G-SR4 or 100G-SR4',
    legacySpeed: '40G / 100G',
    recommendation: {
      sku: 'OSFP-400G-SRBD',
      name: '400G-SRBD (BiDi)',
      desc: 'Short Reach Bi-Directional',
      details: 'This transceiver uses two wavelengths (850nm/908nm) to transmit 400G over the exact same MMF strands used by your legacy SR4 optics.',
      disruption: 'LOW',
      complexity: 1,
      cost: '$$',
      disruptionReason: 'Direct Drop-in Replacement',
      action: 'Reuse existing fiber. Ensure connectors are MPO-12 UPC (Flat).'
    }
  },
  {
    id: 'SMF_LC',
    title: 'Singlemode (OS2) + Duplex LC',
    iconKey: 'Cable',
    legacyExample: '10G-LR or 100G-LR4',
    legacySpeed: '10G / 100G',
    recommendation: {
      sku: 'OSFP-400G-FR4',
      name: '400G-FR4',
      desc: '2km CWDM4',
      details: 'Uses internal mux/demux to send 400G over a single pair of fiber (Duplex LC). Compatible with standard patch panels.',
      disruption: 'LOW',
      complexity: 1,
      cost: '$$$',
      disruptionReason: 'Direct Drop-in Replacement',
      action: 'Reuse existing fiber. No changes needed.'
    }
  },
  {
    id: 'SMF_MPO_APC',
    title: 'Singlemode (OS2) + MPO-12 (APC)',
    iconKey: 'Cable',
    legacyExample: '100G-PSM4 or 100G-DR',
    legacySpeed: '100G',
    recommendation: {
      sku: 'OSFP-400G-DR4',
      name: '400G-DR4',
      desc: '500m Parallel SMF',
      details: 'Uses 4 parallel pairs. Matches the cabling architecture of modern PSM4/DR deployments.',
      disruption: 'LOW',
      complexity: 2,
      cost: '$$',
      disruptionReason: 'Compatible Architecture',
      action: 'Verify connector polish is APC (Angled) Green.'
    }
  },
  {
    id: 'MMF_LC',
    title: 'Multimode (OM3/OM4) + Duplex LC',
    iconKey: 'Cable',
    legacyExample: '10G-SR',
    legacySpeed: '10G',
    recommendation: {
      sku: 'N/A',
      name: 'New Cabling Required',
      desc: 'Infrastructure Upgrade',
      details: 'There is no standard 400G transceiver that runs over Duplex Multimode Fiber. The physics of 50G PAM4 requires higher bandwidth than legacy OM3 allows on 2 strands.',
      disruption: 'HIGH',
      complexity: 5,
      cost: '$$$',
      disruptionReason: 'Rip-and-Replace',
      action: 'Upgrade to SMF (OS2) for long term, or pull new MPO-12 MMF for SRBD.'
    }
  }
];
