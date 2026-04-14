
import { BomItem } from '../../../types';

export const TOPOLOGY_BOM: BomItem[] = [
  // Switches
  { tier: 'Spine', type: 'Switch', sku: 'DCS-7060DX5-64S', qty: 2, desc: '32x 400G OSFP, 25.6T' },
  { tier: 'Leaf', type: 'Switch', sku: 'DCS-7280DR3-24', qty: 2, desc: '24x 400G QSFP-DD, Deep Buffer' },
  
  // Fabric (Spine <-> Leaf)
  { tier: 'Fabric', type: 'Optic (Spine)', sku: 'OSFP-400G-FR4', qty: 4, desc: '400G Duplex LC, 2km (CWDM4)' },
  { tier: 'Fabric', type: 'Optic (Leaf)', sku: 'QDD-400G-FR4', qty: 4, desc: '400G Duplex LC, 2km (CWDM4)' },
  { tier: 'Fabric', type: 'Fiber Cable', sku: 'CAB-SMF-LC-LC-15M', qty: 4, desc: 'LC-LC SMF Patch Cable (OS2)' },

  // MLAG (Leaf <-> Leaf)
  { tier: 'MLAG', type: 'DAC Cable', sku: 'CAB-D-D-400G-1M', qty: 2, desc: 'Primary: 400G Peer Link DAC' },
  { tier: 'MLAG', type: 'Keepalive', sku: 'CAB-C6A-YEL-3M', qty: 2, desc: 'Critical: Cat6a MLAG Heartbeat' },
  { tier: 'MLAG', type: 'Optic (Alt)', sku: 'QDD-400G-SR8', qty: 4, desc: 'Alternative: MMF Optics (if >3m)' },
  { tier: 'MLAG', type: 'Fiber (Alt)', sku: 'CAB-MPO16-5M', qty: 2, desc: 'Alternative: MPO-16 Cables' },

  // Downlinks (Leaf <-> Host)
  { tier: 'Storage', type: 'AOC Breakout', sku: 'A-D400-2Q200-5M', qty: 17, desc: '400G to 2x 200G AOC (VAST)' },
  { tier: 'HPC', type: 'AOC Breakout', sku: 'A-D400-2Q200-10M', qty: 14, desc: '400G to 2x 200G AOC (High Perf GPU)' },
  { tier: 'General', type: 'DAC Breakout', sku: 'CAB-D-4Q-400G-3M', qty: 6, desc: '400G to 4x 100G DAC (HA)' },

  // Accessories
  { tier: 'Mgmt', type: 'Copper', sku: 'CAB-C6A-BLUE-3M', qty: 4, desc: 'Mgmt Network Patch' },
  { tier: 'Acc', type: 'Cleaning', sku: 'FIBER-CLEANER-LC', qty: 4, desc: 'Click Cleaner for LC' },
  { tier: 'Acc', type: 'Mounting', sku: 'KIT-RACK-4POST', qty: 4, desc: '4-Post Rail Kit' }
];
