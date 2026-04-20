export interface ObscureOpticProfile {
  sku: string;
  hostPresentation: string;
  frontEndBehavior: string;
  useCase: string;
  caveat: string;
  searchTerms: string[];
}

export interface FormFactorProfile {
  formFactor: string;
  nominalSpeed: string;
  electricalLanes: number;
  laneRate: string;
  modulation: string;
  supportedBreakoutModes: string[];
  backwardCompatibility: string;
  notes: string;
}

export interface InterfaceTypeRule {
  notation: string;
  channelCount: number;
  laneRate: string;
  moduleFamily: string;
  breakoutResult: string;
  disabledPortImpact: string;
  consumedChannels: number;
  searchTerms: string[];
}

export interface PlatformGearboxDomain {
  id: string;
  portRange: string;
  asicChannelInput: string;
  frontPanelChannelOutput: string;
  supportedExamples: string[];
  practicalConstraints: string[];
}

export interface PlatformGearboxProfile {
  platform: string;
  scope: string;
  chipsetContext: string;
  logicalPortLimit: string;
  architectureNote: string;
  domains: PlatformGearboxDomain[];
}

export const OBSCURE_OPTIC_PROFILES: ObscureOpticProfile[] = [
  {
    sku: 'SFP-10G-RA-1G-SX',
    hostPresentation: 'Presents to a 10G switch interface as a 10G SFP.',
    frontEndBehavior: 'Front end runs at 1G SX toward the attached device.',
    useCase: 'Use when a 10G switch does not support native 1G interfaces but a few 1G optical ports are required.',
    caveat: 'Reference note from the source document; verify platform support before treating this as a deployment-ready selection.',
    searchTerms: ['ra-1g', '1g in 10g interface', 'sfp 10g ra 1g sx', 'obscure optic'],
  },
  {
    sku: 'SFP-10G-RA-1G-LX',
    hostPresentation: 'Presents to a 10G switch interface as a 10G SFP.',
    frontEndBehavior: 'Front end runs at 1G LX toward the attached device.',
    useCase: 'Use when a 10G switch does not support native 1G interfaces but a few 1G optical ports are required.',
    caveat: 'Reference note from the source document; verify platform support before treating this as a deployment-ready selection.',
    searchTerms: ['ra-1g', '1g in 10g interface', 'sfp 10g ra 1g lx', 'obscure optic'],
  },
  {
    sku: 'SFP-10G-MRA-T',
    hostPresentation: 'Presents to a 10G switch interface as a 10G SFP.',
    frontEndBehavior: 'Front end runs as a 1G copper/RJ45-style attachment toward the attached device.',
    useCase: 'Use when a 10G switch does not support native 1G interfaces but a few 1G copper ports are required.',
    caveat: 'Reference note from the source document; verify platform support before treating this as a deployment-ready selection.',
    searchTerms: ['mra-t', 'ra-1g', '1g in 10g interface', 'sfp 10g mra t', 'obscure optic'],
  },
];

export const FORM_FACTOR_PROFILES: FormFactorProfile[] = [
  {
    formFactor: 'SFP',
    nominalSpeed: '1G',
    electricalLanes: 1,
    laneRate: '1G',
    modulation: 'Simple optical modulation / OOK-class signaling',
    supportedBreakoutModes: ['1x1G'],
    backwardCompatibility: 'Original SFP family member.',
    notes: 'One electrical channel from host to module.',
  },
  {
    formFactor: 'SFP+',
    nominalSpeed: '10G',
    electricalLanes: 1,
    laneRate: '10G',
    modulation: 'NRZ',
    supportedBreakoutModes: ['1x10G'],
    backwardCompatibility: 'Commonly accepted in newer SFP28-capable ports when the platform supports downshift.',
    notes: 'Still one electrical channel; the channel rate increases from 1G to 10G.',
  },
  {
    formFactor: 'SFP28',
    nominalSpeed: '25G',
    electricalLanes: 1,
    laneRate: '25G',
    modulation: 'NRZ',
    supportedBreakoutModes: ['1x25G'],
    backwardCompatibility: 'Often supports SFP+ downshift where the platform allows it.',
    notes: 'One electrical channel at 25G.',
  },
  {
    formFactor: 'QSFP',
    nominalSpeed: '4G',
    electricalLanes: 4,
    laneRate: '1G',
    modulation: 'Legacy signaling',
    supportedBreakoutModes: ['4x1G'],
    backwardCompatibility: 'Obsolete foundation of the QSFP family.',
    notes: 'Included for historical lane-model continuity.',
  },
  {
    formFactor: 'QSFP+',
    nominalSpeed: '40G',
    electricalLanes: 4,
    laneRate: '10G',
    modulation: 'NRZ',
    supportedBreakoutModes: ['1x40G', '4x10G'],
    backwardCompatibility: 'Common legacy module type in QSFP28-capable environments when supported.',
    notes: 'Four 10G electrical channels aggregate into 40G.',
  },
  {
    formFactor: 'QSFP28',
    nominalSpeed: '100G',
    electricalLanes: 4,
    laneRate: '25G',
    modulation: 'NRZ',
    supportedBreakoutModes: ['1x100G', '2x50G', '4x25G'],
    backwardCompatibility: 'Successor to QSFP+ in the same broad mechanical family.',
    notes: 'Original 100G form factor using four 25G channels.',
  },
  {
    formFactor: 'DSFP',
    nominalSpeed: '100G',
    electricalLanes: 2,
    laneRate: '50G',
    modulation: 'PAM4',
    supportedBreakoutModes: ['1x100G', '2x50G'],
    backwardCompatibility: 'SFP-sized high-density 100G form factor.',
    notes: 'Uses two 50G electrical channels to reduce 100G optics back toward an SFP footprint.',
  },
  {
    formFactor: 'QSFP56',
    nominalSpeed: '200G',
    electricalLanes: 4,
    laneRate: '50G',
    modulation: 'PAM4',
    supportedBreakoutModes: ['1x200G', '2x100G', '4x50G'],
    backwardCompatibility: 'Backward compatible with older QSFP+ and QSFP28 where the platform supports it.',
    notes: 'Four 50G electrical channels aggregate into 200G.',
  },
  {
    formFactor: 'QSFP-DD',
    nominalSpeed: '200G / 400G / 800G',
    electricalLanes: 8,
    laneRate: '50G or 100G',
    modulation: 'PAM4',
    supportedBreakoutModes: ['1x400G', '2x200G', '4x100G', '8x100G'],
    backwardCompatibility: 'Backward compatible with QSFP+ and QSFP28 in compatible cages.',
    notes: 'Double-density QSFP doubles the electrical channels from four to eight.',
  },
  {
    formFactor: 'OSFP',
    nominalSpeed: '800G / 1.6T',
    electricalLanes: 8,
    laneRate: '50G, 100G, or higher',
    modulation: 'PAM4',
    supportedBreakoutModes: ['1x800G', '2x400G', '8x100G'],
    backwardCompatibility: 'Different mechanical footprint from QSFP-DD.',
    notes: 'Slightly wider and deeper than QSFP-DD with stronger thermal headroom for high-power optics.',
  },
  {
    formFactor: 'OSFP-XD',
    nominalSpeed: '1.6T / 3.2T',
    electricalLanes: 16,
    laneRate: '100G or higher',
    modulation: 'PAM4 / future high-speed signaling',
    supportedBreakoutModes: ['Future 1.6T and 3.2T modes'],
    backwardCompatibility: 'Future-facing extra-dense OSFP evolution.',
    notes: 'Expands OSFP from eight channels to sixteen channels.',
  },
];

export const INTERFACE_TYPE_RULES: InterfaceTypeRule[] = [
  {
    notation: '100G-2 on QSFP-DD',
    channelCount: 2,
    laneRate: '50G',
    moduleFamily: 'QSFP-DD',
    breakoutResult: '4 breakout ports at 100G',
    disabledPortImpact: 'Adjacent even port disabled in the documented 7280CR3-36S architecture example.',
    consumedChannels: 8,
    searchTerms: ['100g-2', 'qsfp-dd', 'even port disabled', 'interface type', 'gearbox'],
  },
  {
    notation: '100G-2 on QSFP56',
    channelCount: 2,
    laneRate: '50G',
    moduleFamily: 'QSFP56',
    breakoutResult: '2 breakout ports at 100G',
    disabledPortImpact: 'No adjacent channels are stolen in the documented example.',
    consumedChannels: 4,
    searchTerms: ['100g-2', 'qsfp56', 'qsfp-56', 'interface type'],
  },
  {
    notation: '100G-4 on QSFP-DD',
    channelCount: 4,
    laneRate: '25G',
    moduleFamily: 'QSFP-DD',
    breakoutResult: '2 breakout ports at 100G',
    disabledPortImpact: 'Adjacent even port disabled in the documented 7280CR3-36S architecture example.',
    consumedChannels: 8,
    searchTerms: ['100g-4', 'qsfp-dd', 'even port disabled', 'interface type', 'gearbox'],
  },
  {
    notation: '100G-4 on QSFP28',
    channelCount: 4,
    laneRate: '25G',
    moduleFamily: 'QSFP28',
    breakoutResult: '1 port at 100G',
    disabledPortImpact: 'No adjacent-port disablement in the documented example.',
    consumedChannels: 4,
    searchTerms: ['100g-4', 'qsfp28', 'qsfp-28', 'interface type'],
  },
  {
    notation: '50G-1',
    channelCount: 1,
    laneRate: '50G',
    moduleFamily: 'Single-channel 50G optic/interface mode',
    breakoutResult: 'One 50G logical port per electrical channel.',
    disabledPortImpact: 'Port impact depends on the containing cage and gearbox domain.',
    consumedChannels: 1,
    searchTerms: ['50g-1', 'interface type', 'single channel'],
  },
  {
    notation: '50G-2',
    channelCount: 2,
    laneRate: '25G',
    moduleFamily: 'Two-channel 50G optic/interface mode',
    breakoutResult: 'One 50G logical port using two electrical channels.',
    disabledPortImpact: 'Port impact depends on the containing cage and gearbox domain.',
    consumedChannels: 2,
    searchTerms: ['50g-2', 'interface type', 'two channel'],
  },
];

export const PLATFORM_GEARBOX_PROFILES: PlatformGearboxProfile[] = [
  {
    platform: '7280CR3-36S',
    scope: 'Architecture example from the source document, not a universal switch rule.',
    chipsetContext: 'Jericho2C with 96 direct 25G channels plus 32 50G channels feeding four gearbox domains.',
    logicalPortLimit: '36 physical interfaces, up to 120 logical ports in the source-document example.',
    architectureNote: 'Ports 1-24 map directly with 4x25G per QSFP28 port. Ports 25-36 sit behind gearbox domains whose capabilities govern breakout and channel allocation behavior.',
    domains: [
      {
        id: 'Gearbox 0',
        portRange: 'Ports 25-28',
        asicChannelInput: '8x50G from ASIC side',
        frontPanelChannelOutput: '16x25G or equivalent 50G allocations',
        supportedExamples: ['Four QSFP28 100G ports', 'Two QSFP56 200G ports'],
        practicalConstraints: [
          'A 200G QSFP56 consumes the equivalent of eight 25G gearbox channels.',
          'The gearbox domain determines which lower-speed optics and breakouts are valid.',
        ],
      },
      {
        id: 'Gearbox 1',
        portRange: 'Ports 29-32',
        asicChannelInput: '8x50G from ASIC side',
        frontPanelChannelOutput: '16x25G or equivalent 50G allocations',
        supportedExamples: ['Four QSFP28 100G ports', 'Two QSFP56 200G ports'],
        practicalConstraints: [
          'The domain behaves like a local channel pool.',
          'Optic electrical channel count must match available port allocation.',
        ],
      },
      {
        id: 'Gearbox 2',
        portRange: 'Ports 33-34',
        asicChannelInput: '8x50G from ASIC side',
        frontPanelChannelOutput: '8x50G shared across the two-port domain',
        supportedExamples: ['Two QSFP56 200G ports', 'One QSFP-DD 400G port with adjacent-port impact'],
        practicalConstraints: [
          'QSFP-DD consumes all eight electrical channels in this architecture example.',
          'Installing QSFP-DD can require the adjacent port in the domain to be shut down.',
        ],
      },
      {
        id: 'Gearbox 3',
        portRange: 'Ports 35-36',
        asicChannelInput: '8x50G from ASIC side',
        frontPanelChannelOutput: '8x50G shared across the two-port domain',
        supportedExamples: ['Two QSFP56 200G ports', 'One QSFP-DD 400G port with adjacent-port impact'],
        practicalConstraints: [
          'The gearbox provides enough channels for one 8-channel optic across the two-port pool.',
          'Breakout planning must account for the shared-domain channel pool.',
        ],
      },
    ],
  },
];

export const HARDWARE_REFERENCE_SEARCH_TERMS = [
  'gearbox',
  'gear box',
  'interface type',
  '100G-2',
  '100G-4',
  '50G-1',
  '50G-2',
  'logical port',
  'ASIC channel',
  'SerDes',
  'RA-1G',
  'SFP-10G-RA-1G-SX',
  'SFP-10G-RA-1G-LX',
  'SFP-10G-MRA-T',
  'DSFP',
  'OSFP-XD',
  '7280CR3-36S',
];

export const getInterfaceTypeRule = (notation: string, moduleFamily?: string) => {
  const normalizedNotation = notation.toLowerCase();
  const normalizedFamily = moduleFamily?.toLowerCase();
  return INTERFACE_TYPE_RULES.find((rule) => {
    const notationMatch = rule.notation.toLowerCase().includes(normalizedNotation);
    const familyMatch = normalizedFamily ? rule.moduleFamily.toLowerCase().includes(normalizedFamily) : true;
    return notationMatch && familyMatch;
  });
};

export const getFormFactorProfile = (formFactor: string) => {
  const exact = formFactor.toLowerCase();
  const exactMatch = FORM_FACTOR_PROFILES.find((profile) => profile.formFactor.toLowerCase() === exact);
  if (exactMatch) return exactMatch;

  const normalized = formFactor.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return FORM_FACTOR_PROFILES.find((profile) => (
    profile.formFactor.replace(/[^a-z0-9]/gi, '').toLowerCase() === normalized
  ));
};

export const getObscureOpticProfile = (sku: string) => (
  OBSCURE_OPTIC_PROFILES.find((profile) => profile.sku.toLowerCase() === sku.toLowerCase())
);

export const searchHardwareReference = (query: string) => {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const obscureMatches = OBSCURE_OPTIC_PROFILES.filter((profile) => (
    profile.sku.toLowerCase().includes(normalized)
    || profile.hostPresentation.toLowerCase().includes(normalized)
    || profile.frontEndBehavior.toLowerCase().includes(normalized)
    || profile.searchTerms.some((term) => term.toLowerCase().includes(normalized))
  ));

  const interfaceMatches = INTERFACE_TYPE_RULES.filter((rule) => (
    rule.notation.toLowerCase().includes(normalized)
    || rule.moduleFamily.toLowerCase().includes(normalized)
    || rule.breakoutResult.toLowerCase().includes(normalized)
    || rule.disabledPortImpact.toLowerCase().includes(normalized)
    || rule.searchTerms.some((term) => term.toLowerCase().includes(normalized))
  ));

  const formFactorMatches = FORM_FACTOR_PROFILES.filter((profile) => (
    profile.formFactor.toLowerCase().includes(normalized)
    || profile.notes.toLowerCase().includes(normalized)
    || profile.supportedBreakoutModes.some((mode) => mode.toLowerCase().includes(normalized))
  ));

  return [...obscureMatches, ...interfaceMatches, ...formFactorMatches];
};
