
import React from 'react';
import Tooltip from '../../../components/Tooltip';

export interface BreakoutConfig {
  id: string;
  mode: string;
  title: string;
  switchSku: string;
  switchDesc: string;
  cableSku: string;
  cableDesc: string;
  hostSku: string;
  hostDesc: string;
  hostReq: string;
  color: 'blue' | 'orange' | 'red';
  description: React.ReactNode;
  fecMode: React.ReactNode;
}

export const BREAKOUT_CONFIGS: BreakoutConfig[] = [
  {
    id: 'SMF',
    mode: 'SMF',
    title: 'Optical Breakout (>5m)',
    switchSku: 'OSFP-400G-DR4',
    switchDesc: '400G Optical Module',
    cableSku: 'MPO-12 to 4x LC',
    cableDesc: 'Singlemode Fiber Splitter',
    hostSku: 'QSFP-100G-DR',
    hostDesc: 'Single Lambda 100G PAM4',
    hostReq: 'Host must support RS-FEC',
    color: 'blue',
    description: (
      <span>
        For distances &gt; 5m, optical fiber is required. The <span className="font-mono text-slate-900 dark:text-white">400G-DR4</span> transceiver breaks out into 4 individual fiber pairs (MPO-12 to 4x LC). The host side uses a standard <span className="font-mono text-slate-900 dark:text-white">100G-DR</span> optic which has an <Tooltip term="Internal Gearbox" definition="A chip inside the transceiver that converts 4x 25G electrical lanes to 1x 100G optical lane." className="border-slate-400 dark:border-slate-500" /> to convert the switch's <Tooltip term="50G PAM4" definition="Pulse Amplitude Modulation 4-level. Running at 50Gbps per lane." className="border-slate-400 dark:border-slate-500" /> lanes to the host's required format.
      </span>
    ),
    fecMode: <Tooltip term="RS-FEC (544,514)" definition="Reed-Solomon Forward Error Correction. Mandatory for PAM4 links to correct bit errors." className="border-slate-400 dark:border-slate-500" />
  },
  {
    id: 'DAC_PASSIVE',
    mode: 'DAC_PASSIVE',
    title: 'Passive Copper (<3m)',
    switchSku: '400G Port',
    switchDesc: 'OSFP / QSFP-DD Cage',
    cableSku: 'CAB-O-4Q-400G-xM',
    cableDesc: 'Passive Breakout DAC',
    hostSku: '100GBASE-CR2',
    hostDesc: '2x 50G PAM4 Lanes',
    hostReq: 'Modern NICs (ConnectX-6/7)',
    color: 'orange',
    description: (
      <span>
        Modern 100G NICs support 50G PAM4 signaling natively (<Tooltip term="100GBASE-CR2" definition="100G Ethernet over Copper (CR) using 2 lanes. Each lane is 50G PAM4." className="border-slate-400 dark:border-slate-500" />). This allows for a simple, passive copper cable which is the lowest cost and lowest power solution.
      </span>
    ),
    fecMode: <Tooltip term="RS-FEC (544,514)" definition="Reed-Solomon Forward Error Correction. Mandatory for PAM4 links to correct bit errors." className="border-slate-400 dark:border-slate-500" />
  },
  {
    id: 'DAC_ACTIVE',
    mode: 'DAC_ACTIVE',
    title: 'Active Gearbox (<5m)',
    switchSku: '400G Port',
    switchDesc: 'OSFP / QSFP-DD Cage',
    cableSku: 'H-O400-4Q100-xM',
    cableDesc: 'Active Copper (ACC)',
    hostSku: '100GBASE-CR4',
    hostDesc: '4x 25G NRZ Lanes',
    hostReq: 'Legacy 100G NICs',
    color: 'red',
    description: (
      <span>
        Older 100G NICs only understand <Tooltip term="25G NRZ" definition="Non-Return to Zero signaling at 25Gbps. Requires 4 lanes for 100G." className="border-slate-400 dark:border-slate-500" /> signaling (100GBASE-CR4). The switch transmits 50G PAM4. An 'Active Gearbox Cable' (H-series) is REQUIRED to place a chip in the cable path that converts the signal format.
      </span>
    ),
    fecMode: 'RS-FEC or FC-FEC'
  }
];
