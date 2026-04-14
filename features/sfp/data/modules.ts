
import { SfpType } from '../types';

export const SFP_DATA: SfpType[] = [
  {
    id: 'sfp',
    name: 'SFP',
    speed: '1 Gbps',
    modulation: 'NRZ',
    lanes: 1,
    baudRate: '1.25 GBd',
    backCompat: 'N/A',
    aristaUsage: 'Switch Management, Legacy Edge',
    color: 'bg-slate-400',
    description: 'The foundational Small Form-factor Pluggable. Used primarily for 1000BASE-T/SX/LX/EX.'
  },
  {
    id: 'sfp-plus',
    name: 'SFP+',
    speed: '10 Gbps',
    modulation: 'NRZ',
    lanes: 1,
    baudRate: '10.31 GBd',
    backCompat: 'SFP (1G)',
    aristaUsage: 'Campus, 7050X Series Downlinks',
    color: 'bg-blue-500',
    description: 'The ubiquitous 10G standard. Physically identical to SFP but supports 10.3Gbps NRZ signaling.'
  },
  {
    id: 'sfp28',
    name: 'SFP28',
    speed: '25 Gbps',
    modulation: 'NRZ',
    lanes: 1,
    baudRate: '25.78 GBd',
    backCompat: 'SFP+ (10G)',
    aristaUsage: 'Server Nic Connectivity, HFT Links',
    color: 'bg-indigo-600',
    description: 'Optimized for 25GbE. Leverages the same footprint but requires enhanced SerDes stability.'
  },
  {
    id: 'sfp56',
    name: 'SFP56',
    speed: '50 Gbps',
    modulation: 'PAM4',
    lanes: 1,
    baudRate: '26.56 GBd',
    backCompat: 'SFP28, SFP+',
    aristaUsage: 'Next-Gen 50G Server Connections',
    color: 'bg-purple-600',
    description: 'The first SFP to utilize 4-level modulation (PAM4), doubling capacity without doubling baud rate.'
  },
  {
    id: 'sfp-dd',
    name: 'SFP-DD',
    speed: '100 Gbps',
    modulation: 'PAM4',
    lanes: 2,
    baudRate: '2x 26.56 GBd',
    backCompat: 'SFP56/28/+',
    aristaUsage: 'High Density 400G Breakouts',
    color: 'bg-rose-600',
    description: 'Double Density. Uses a dual-row contact pin layout to provide 2 lanes of 50G PAM4.'
  }
];
