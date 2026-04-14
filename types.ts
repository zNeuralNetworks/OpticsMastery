
export enum Page {
  LEARN = 'LEARN',
  CATALOG = 'CATALOG',
  VISUALIZER = 'VISUALIZER',
  MIGRATION_WIZARD = 'MIGRATION_WIZARD',
  SMART_MATRIX = 'SMART_MATRIX',
  BOM_BUILDER = 'BOM_BUILDER',
  COMPATIBILITY_EXPLAINER = 'COMPATIBILITY_EXPLAINER',
  TOPOLOGY = 'TOPOLOGY',
  CONTENT_IMPROVEMENTS = 'CONTENT_IMPROVEMENTS',
  SETTINGS = 'SETTINGS',
  INTERACTIVE_DATASHEETS = 'INTERACTIVE_DATASHEETS',
  LINK_BUDGET = 'LINK_BUDGET',
  SFP_MATRIX = 'SFP_MATRIX',
  DBM_INTERPRETER = 'DBM_INTERPRETER',
  SIGNAL_INTEGRITY = 'SIGNAL_INTEGRITY',
  FORM_FACTOR_EXPLORER = 'FORM_FACTOR_EXPLORER',
  AI_PLANNER = 'AI_PLANNER'
}

export type LearnPageTab = 
  | 'STRATEGY'      // AI Fabrics, ECMP, Buffers
  | 'SIGNALING'     // NRZ/PAM4, FEC, Lane Math
  | 'CONNECTIVITY'  // SMF/MMF, Polarity, Polish
  | 'HARDWARE'      // Form Factors, Port Pools, SerDes
  | 'OPERATIONS'    // DDM, CLI, Troubleshooting
  | 'UPGRADES'      // Migration, ZR, Future Tech
  | 'PROJECT'       // About/DNA
  | 'OPTICS_FAQ';   // 800G FAQ

export interface PlannerTopologySeed {
  scope: 'COMPUTE_FABRIC' | 'COMPUTE_AND_STORAGE';
  leafCount: number;
  spineCount: number;
  mediaType: string;
  storageFabric: boolean;
}

export interface PlannerDatasheetSeed {
  sku: string;
  source: 'ai-planner';
}

export interface AppNavigationParams {
  budget?: number;
  fiberType?: 'SMF' | 'MMF';
  plannerTopologySeed?: PlannerTopologySeed;
  plannerDatasheetSeed?: PlannerDatasheetSeed;
  plannerSnapshotRef?: string;
}

/**
 * Chat message structure for AI interactions
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

// --- Normalized Data Layer Types ---

export type FormFactor = 'SFP' | 'SFP28' | 'SFP56' | 'QSFP+' | 'QSFP28' | 'QSFP56' | 'QSFP-DD' | 'OSFP' | 'DSFP' | 'QSFP112';
export type Media = 'SMF' | 'MMF' | 'COPPER' | 'DAC' | 'AOC' | 'AEC' | 'Unknown';
export type Connector = 'LC' | 'MPO-12' | 'MPO-16' | 'CS' | 'SN' | 'Integrated' | 'RJ45' | 'Unknown' | '2x LC Duplex' | '2x MPO-12';
export type Polish = 'APC' | 'UPC' | 'N/A';
export type Modulation = 'NRZ' | 'PAM4';
export type ReachClass = 'SR' | 'DR' | 'FR' | 'LR' | 'ER' | 'ZR' | 'Unknown';

export interface BreakoutMode {
  id: string;
  label: string;
  sourceSpeed: string;
  targetSpeed: string;
  multiplier: number;
}

export interface Optic {
  sku: string;
  description: string;
  speed: string;
  formFactor: FormFactor;
  media: Media;
  connector: Connector;
  polish: Polish;
  reach: string;
  wavelength: string;
  lanes: number;
  modulation: Modulation;
  breakoutModeIds: string[];
  powerTypical: number; // Watts
  powerMax: number; // Watts
  lossBudget?: number; // dB
  // New Enriched Metadata Fields
  reachClass?: ReachClass;
  wavelengthNm?: number | null;
  opticBudgetDb?: number | null;
}

export interface Cable {
  sku: string;
  description: string;
  type: 'DAC' | 'AOC' | 'AEC';
  speed: string;
  formFactorSource: FormFactor;
  formFactorDest: FormFactor;
  isBreakout: boolean;
  lengthOptions: string[];
  notes?: string;
  skuPrecision?: 'exact' | 'family-length-variable';
  // New Enriched Metadata Fields
  reachClass?: ReachClass;
}

// Keep legacy types for backward compatibility during transition
export enum TransceiverType {
  QSFP28 = 'QSFP28 (100G)',
  QSFP_DD = 'QSFP-DD (400G/800G)',
  OSFP = 'OSFP (400G/800G)',
  SFP28 = 'SFP28 (25G)',
  SFP_PLUS = 'SFP+ (10G)',
  QSFP_PLUS = 'QSFP+ (40G)',
  SFP = 'SFP (1G)',
  DSFP = 'DSFP (100G)'
}

export enum MediaType {
  COPPER = 'Copper (DAC)',
  ACTIVE_COPPER = 'Active Copper (ACC/Gearbox)',
  AOC = 'Active Optical Cable (AOC)',
  MMF = 'Multi-Mode Fiber',
  SMF = 'Single-Mode Fiber'
}

export interface Transceiver {
  id: string;
  sku: string;
  description: string;
  speed: string;
  type: TransceiverType;
  mediaType: MediaType;
  reach: string;
  connector: string;
  wavelength?: string;
  breakoutCapable: boolean;
  notes?: string;
}

export interface AristaSwitch {
  id: string;
  name: string;
  sku: string;
  series: '7060X6' | '7800R4';
  role: 'LEAF' | 'SPINE';
  totalPorts: number;
  portSpeed: '800G';
  formFactor: 'OSFP';
  serdesType: '100G-PAM4';
  maxPower: number;
  systemThroughputTbps: number;
  representativeLatencyNs: number;
  bufferProfile: string;
  description: string;
  chassisSku?: string;
  linecardSlots?: number;
  linecardSku?: string;
  linecardPorts?: number;
  supervisorSkuPrimary?: string;
  supervisorSkuSecureBoot?: string;
  fabricModuleSku?: string;
  fabricCoolingModuleSku?: string;
  powerSupplySkuPrimary?: string;
  powerSupplyCountDefault?: number;
  powerSupplyCountRedundant?: number;
}

export interface BomItem {
  id?: string;
  tier: string;
  type: string;
  sku: string;
  qty: number;
  desc: string;
}
