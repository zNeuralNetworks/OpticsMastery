
export interface OpticSpec {
  partNumber: string;
  altPartNumber?: string;
  type: 'TRANSCEIVER' | 'AOC' | 'DAC' | 'AEC';
  reach: string;
  reachMeters: number;
  fiberType: 'SMF' | 'MMF' | 'COPPER';
  connector: string;
  lanes: number;
  modulation: string;
  description: string;
  powerMax?: number;
  opticBudgetDb?: number;
  interopNotes?: string[];
}

export const ARISTA_800G_OPTICS: OpticSpec[] = [
  {
    partNumber: 'OSFP-800G-2FR4',
    altPartNumber: 'QDD-800G-2FR4',
    type: 'TRANSCEIVER',
    reach: '2km',
    reachMeters: 2000,
    fiberType: 'SMF',
    connector: '2x LC Duplex',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '2x 400GBASE-FR4 / 200GBASE-FR4 Dual-Rate Transceiver, dual LC connectors.',
    powerMax: 16,
    interopNotes: ['Supports 2x 400G-FR4 breakout or 2x 200G-FR4 attachment with the matching optics family.']
  },
  {
    partNumber: 'OSFP-800G-2LR4',
    altPartNumber: 'QDD-800G-2LR4',
    type: 'TRANSCEIVER',
    reach: '10km',
    reachMeters: 10000,
    fiberType: 'SMF',
    connector: '2x LC Duplex',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '2x 400GBASE-LR4 / 200GBASE-LR4 Dual-Rate Transceiver, dual LC connectors.',
    powerMax: 16,
    interopNotes: ['Supports 2x 400G-LR4 breakout or 2x 200G-LR4 attachment with the matching optics family.']
  },
  {
    partNumber: 'OSFP-800G-2XDR4',
    altPartNumber: 'QDD-800G-2XDR4',
    type: 'TRANSCEIVER',
    reach: '2km',
    reachMeters: 2000,
    fiberType: 'SMF',
    connector: '2x MPO-12 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '2x 400GBASE-XDR4 Transceiver, Dual MPO-12 APC connector.',
    powerMax: 16,
    interopNotes: ['Supports 2x 400G-XDR4 breakout and can fan out to 8x 100G-FR with the matching architecture.']
  },
  {
    partNumber: 'OSFP-800G-2PLR4',
    altPartNumber: 'QDD-800G-2PLR4',
    type: 'TRANSCEIVER',
    reach: '10km',
    reachMeters: 10000,
    fiberType: 'SMF',
    connector: '2x MPO-12 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '2x 400GBASE-PLR4 Transceiver, Dual MPO-12 APC connector.',
    powerMax: 16,
    interopNotes: ['Supports 2x 400G-PLR4 breakout and can fan out to 8x 100G-LR with the matching architecture.']
  },
  {
    partNumber: 'OSFP-800G-2VSR4',
    altPartNumber: 'QDD-800G-2VSR4',
    type: 'TRANSCEIVER',
    reach: '50m',
    reachMeters: 50,
    fiberType: 'MMF',
    connector: '2x MPO-12 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '2x 400GBASE-VSR4 Transceiver, Dual MPO-12 APC connector.',
    powerMax: 16,
    interopNotes: ['Supports 2x 400G-VSR4 breakout with the matching optics family.']
  },
  {
    partNumber: 'LPO-800G-2DR4',
    type: 'TRANSCEIVER',
    reach: '500m',
    reachMeters: 500,
    fiberType: 'SMF',
    connector: '2x MPO-12 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '2x 400GBASE-DR4 Linear Pluggable OSFP Transceiver, Dual MPO-12.',
    powerMax: 16
  },
  {
    partNumber: 'LPO-800G-DR8',
    type: 'TRANSCEIVER',
    reach: '500m',
    reachMeters: 500,
    fiberType: 'SMF',
    connector: 'MPO-16 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '800GBASE-DR8 Linear Pluggable OSFP Transceiver, MPO-16 APC connector.',
    powerMax: 16
  },
  {
    partNumber: 'OSFP-800G-XDR8',
    type: 'TRANSCEIVER',
    reach: '2km',
    reachMeters: 2000,
    fiberType: 'SMF',
    connector: 'MPO-16 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '800GBASE-XDR8 OSFP Transceiver, MPO-16 APC connector.',
    powerMax: 16
  },
  {
    partNumber: 'OSFP-800G-VSR8',
    type: 'TRANSCEIVER',
    reach: '50m',
    reachMeters: 50,
    fiberType: 'MMF',
    connector: 'MPO-16 APC',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '800GBASE-VSR8 OSFP Transceiver, MPO-16 APC connector.',
    powerMax: 16
  },
  {
    partNumber: 'C-O800-O800-xM',
    altPartNumber: 'C-D800-D800-xM',
    type: 'DAC',
    reach: '1-2m',
    reachMeters: 2,
    fiberType: 'COPPER',
    connector: 'OSFP-OSFP / QDD-QDD',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '800G Passive DAC, Straight Through.',
    interopNotes: ['Supports 1m and 2m lengths.']
  },
  {
    partNumber: 'A-O800-O800-xM',
    altPartNumber: 'A-D800-D800-xM',
    type: 'AOC',
    reach: '1-30m',
    reachMeters: 30,
    fiberType: 'MMF',
    connector: 'OSFP-OSFP / QDD-QDD',
    lanes: 8,
    modulation: '100G PAM-4',
    description: '800G Active Optical Cable, Straight Through.',
    interopNotes: ['Supports 1, 3, 5, 7, 10, 15, 20, 25, 30m lengths.']
  }
];

export const OPTICS_FAQ_KNOWLEDGE = {
  power: {
    max: '16W per port',
    note: '800G client transceivers draw up to 16W. Ensure switch cooling capacity.'
  },
  thermal: {
    osfp_vs_qsfpdd: 'OSFP runs 5C-15C cooler than QSFP-DD due to integrated heatsink and 50% more surface area.',
    advantage: 'Lower operating temperature improves reliability and allows a larger range of optics.'
  },
  suffixes: {
    XDR: 'Extended Reach DR (2km)',
    PLR: 'Parallel Long Reach (10km)',
    FR: '2km reach over Duplex SMF',
    LR: '10km reach over Duplex SMF',
    VSR: 'Very Short Reach (50m over MMF)'
  },
  cli: {
    '2x400G': 'switch(config-if-Et1/1,1/5)#speed 400g-4',
    '4x200G': 'switch(config-if-Et1/1,1/3,1/5,1/7)#speed 200g-2',
    '8x100G': 'switch(config-if-Et1/1-8)#speed 100g-1'
  }
};
