
/**
 * Optics Master - Knowledge Base Content
 * Structured data for technical modules.
 * Moved from constants/knowledgeModules.ts
 */

export const LEVEL_METADATA = {
  Basics: "No prior optics knowledge required.",
  Intermediate: "Assumes familiarity with fiber and form factors.",
  Advanced: "Assumes signaling + platform constraints context."
};

export const CONTEXTUAL_ACTIONS = {
  LOSS_BUDGET: { label: "Open Link Budget Calc", pageKey: "LINK_BUDGET" },
  DOM_SCALE: { label: "Interpret dBm", pageKey: "DBM_INTERPRETER" },
  POLARITY: { label: "Validate Link Path", pageKey: "COMPATIBILITY_EXPLAINER" },
  BREAKOUT_LOGIC: { label: "Explore Breakout Logic", pageKey: "VISUALIZER" },
  FORM_FACTORS: { label: "Open 3D Form Factor Explorer", pageKey: "FORM_FACTOR_EXPLORER" },
  AI_STRATEGY: { label: "Open Topology Lab", pageKey: "TOPOLOGY" },
};

export interface LearningGuide {
  title: string;
  level: 'Basics' | 'Intermediate' | 'Advanced';
  mentalModel: string;
  whyItMatters: string;
  commonMistake: string;
  nextStep?: string;
}

export const LEARNING_GUIDES: Record<string, LearningGuide> = {
  FIBER_TYPES: {
    title: 'Fiber Core Comparison',
    level: 'Basics',
    mentalModel: 'Choose the fiber family first. Reach, connector style, and optics class all inherit from that decision.',
    whyItMatters: 'Media choice is the first hard boundary in optics selection. Wrong media invalidates the rest of the design.',
    commonMistake: 'Treating SMF and MMF as interchangeable because the module speed matches.',
    nextStep: 'Learn connector safety and polarity before validating a physical link.',
  },
  SAFETY_RULES: {
    title: 'Connector Standards',
    level: 'Basics',
    mentalModel: 'Physical mating rules are binary constraints, not tuning knobs. Wrong polish pairing damages hardware.',
    whyItMatters: 'Connector mistakes can create permanent damage and confusing low-power symptoms.',
    commonMistake: 'Assuming green and blue connectors are just cosmetic variations.',
    nextStep: 'Use polarity logic to verify that the correct fibers land on the correct receivers.',
  },
  POLARITY: {
    title: 'MPO Polarity Logic',
    level: 'Intermediate',
    mentalModel: 'A link only works when Tx lands on Rx across the full path. Polarity is lane mapping, not just cabling style.',
    whyItMatters: 'Parallel optics can show healthy light yet still fail if the lane map is wrong.',
    commonMistake: 'Assuming a straight-through MPO trunk is valid for every parallel-optics use case.',
    nextStep: 'Use Link Validation to see how physical rules turn into a real pass or fail outcome.',
  },
  MODULATION: {
    title: 'Modulation Comparison',
    level: 'Basics',
    mentalModel: 'NRZ and PAM4 are different signaling systems. Matching speed does not mean matching signal behavior.',
    whyItMatters: 'This is the fastest way to understand why modern 100G, 400G, and 800G links require different assumptions.',
    commonMistake: 'Assuming every 100G optic is electrically interchangeable.',
    nextStep: 'Check FEC requirements next because PAM4 viability depends on error correction.',
  },
  FEC_TYPES: {
    title: 'FEC Validation Matrix',
    level: 'Intermediate',
    mentalModel: 'FEC is part of the link contract. Light alone does not prove the link will pass traffic.',
    whyItMatters: 'FEC mismatch is one of the most common causes of “light but no link” behavior.',
    commonMistake: 'Treating FEC as an optional post-deployment tuning detail on PAM4 links.',
    nextStep: 'Apply these rules in link validation and troubleshooting workflows.',
  },
  LANE_DENSITY: {
    title: 'Lane Density Comparison',
    level: 'Basics',
    mentalModel: 'Aggregate bandwidth comes from lane count times lane speed. Breakout logic follows the lane model.',
    whyItMatters: 'Understanding lane math is the bridge from optics to platform and breakout decisions.',
    commonMistake: 'Thinking of 400G and 800G as single-channel links instead of lane bundles.',
    nextStep: 'Move into form factors and breakout mapping.',
  },
  HARDWARE_REFERENCE: {
    title: 'Hardware Reference',
    level: 'Advanced',
    mentalModel: 'Interface type and gearbox behavior are channel-allocation rules. A speed label is not enough to prove breakout validity.',
    whyItMatters: 'Platform-facing optics decisions depend on electrical channel count, logical-port limits, gearbox domains, and adjacent-port impacts.',
    commonMistake: 'Assuming any QSFP-DD or QSFP56 optic can be used interchangeably because the printed aggregate speed looks compatible.',
    nextStep: 'Use the Hardware tab and Cable Configurator gearbox reference to inspect interface-type consequences.',
  },
  FORM_FACTORS: {
    title: 'Form Factor Hardware Note',
    level: 'Basics',
    mentalModel: 'Form factor is a platform and thermal decision as much as a connector decision.',
    whyItMatters: 'QSFP-DD and OSFP choices shape cooling, backward compatibility, and future speed ceilings.',
    commonMistake: 'Treating form factors as interchangeable shells with no operational impact.',
    nextStep: 'Use the 3D Explorer or Part Finder to connect physical packaging to actual products.',
  },
  BREAKOUT_LOGIC: {
    title: 'Cage Breakout Concept',
    level: 'Intermediate',
    mentalModel: 'Breakout is a lane-mapping decision in the switch and optics, not just a special cable.',
    whyItMatters: 'Understanding breakout prevents bad BOM assumptions and host-attachment errors.',
    commonMistake: 'Assuming any high-speed port can split any way you want if the cable exists.',
    nextStep: 'Use the cable visualizer or validation tools to confirm the exact breakout pattern.',
  },
  CONNECTOR_MAPPING: {
    title: 'Port-to-Connector Mapping',
    level: 'Intermediate',
    mentalModel: 'Connector type follows the optics engine. WDM typically means duplex; parallel optics typically mean MPO.',
    whyItMatters: 'This is what keeps a valid optics choice from becoming an invalid patching plan.',
    commonMistake: 'Choosing patch cords by speed label alone rather than by optics architecture.',
    nextStep: 'Use Part Finder to move from connector logic to specific part families.',
  },
  DOM_SCALE: {
    title: 'DOM Monitoring Scale',
    level: 'Intermediate',
    mentalModel: 'DOM metrics are trend indicators, not just pass/fail values.',
    whyItMatters: 'Operational confidence comes from knowing which metrics predict failure before a hard outage.',
    commonMistake: 'Only checking Rx power and ignoring bias current or temperature drift.',
    nextStep: 'Use dBm interpretation and troubleshooting flows to convert telemetry into action.',
  },
};

export const CONCEPT_DEFINITIONS: Record<string, string> = {
  FIBER_CORE: "Distinguishing between Singlemode (SMF) and Multimode (MMF) glass core diameters and their respective distance capabilities.",
  REACH_TABLE: "Standardized naming conventions (SR/DR/LR/ZR) that define the distance limits and optical wavelength grids for transceivers.",
  CLEANING: "Standard inspection and decontamination procedures to prevent signal loss or hardware damage caused by debris.",
  LOSS_BUDGET: "The calculation of total signal attenuation across a link to ensure the receiver receives sufficient light power.",
  SAFETY_RULES: "Physical mating constraints, specifically regarding the incompatible flat (UPC) and angled (APC) fiber polish types.",
  POLARITY: "The alignment of Tx and Rx fibers across a cable plant to ensure the laser on one end hits the detector on the other.",
  LANE_DENSITY: "Comparison of electrical lane counts (1, 4, or 8) used in different transceiver generations (100G-800G) to drive aggregate bandwidth.",
  FORM_FACTORS: "Physical module shapes (SFP/QSFP/OSFP) and their specific thermal and SerDes speed constraints.",
  BREAKOUT_LOGIC: "The ability of a single high-speed switch cage to be logically partitioned into multiple lower-speed host ports.",
  HARDWARE_REFERENCE: "Dense reference for channel/SerDes terminology, interface types such as 100G-2 and 100G-4, gearbox domains, logical-port limits, and RA-1G optics.",
  CONNECTOR_MAPPING: "Defining the required physical interface (LC vs MPO) based on the transceiver optics engine (Parallel vs WDM).",
  MODULATION: "The evolution from binary NRZ signaling (common in 100G) to multi-level PAM4 (400G+) to increase data throughput.",
  FEC_MODES: "Mathematical error correction algorithms used to maintain link stability on noise-sensitive high-speed links.",
  AI_STRATEGY: "Architectural guidelines for building lossless, low-latency fabrics for high-performance clusters.",
  OVERSUB: "Calculations for Spine-to-Leaf bandwidth ratios to prevent fabric congestion.",
  DOM_SCALE: "Reading transceiver telemetry including Tx/Rx power, bias current, and temperature metrics.",
  DEBUG_FLOW: "Structured step-by-step methodology for isolating physical layer link failures.",
  ZR_TECH: "Advanced coherent optics that eliminate the need for external DCI transponder systems."
};

export const KB_KEYWORDS: Record<string, string[]> = {
  FIBER_CORE: ["smf", "mmf", "yellow", "aqua", "core", "9um", "50um", "singlemode", "multimode", "om4", "om3", "os2"],
  REACH_TABLE: ["sr", "dr", "fr", "lr", "zr", "er", "distance", "reach", "10km", "100m", "500m", "40km", "suffix"],
  CLEANING: ["ibc", "dust", "scope", "cleaning", "contamination", "inspection", "end-face", "dirt", "click-cleaner"],
  LOSS_BUDGET: ["db", "dbm", "loss", "attenuation", "budget", "power", "link", "sensitivity", "margin", "padding"],
  SAFETY_RULES: ["apc", "upc", "polish", "green", "blue", "angled", "flat", "damage", "mating", "connector"],
  POLARITY: ["type b", "crossover", "flip", "mpo", "polarity", "alignment", "tx", "rx"],
  LANE_DENSITY: ["lanes", "serdes", "sfp", "qsfp", "osfp", "density", "1-lane", "4-lane", "8-lane", "octal", "100g", "400g"],
  FORM_FACTORS: ["sfp", "qsfp", "osfp", "heatsink", "form factor", "physical", "cage", "thermal", "dd", "double density"],
  BREAKOUT_LOGIC: ["breakout", "serdes", "4x100g", "8x100g", "split", "fanout", "channelization"],
  HARDWARE_REFERENCE: ["gearbox", "gear box", "interface type", "100g-2", "100g-4", "50g-1", "50g-2", "logical port", "asic channel", "serdes", "ra-1g", "1g in 10g interface", "sfp-10g-ra-1g-sx", "sfp-10g-ra-1g-lx", "sfp-10g-mra-t", "dsfp", "osfp-xd", "7280cr3-36s"],
  CONNECTOR_MAPPING: ["lc", "mpo", "duplex", "parallel", "connector", "patch", "mating", "psm4", "cwdm4"],
  MODULATION: ["nrz", "pam4", "symbol", "bit", "signaling", "modulation", "snr", "noise"],
  FEC_MODES: ["rs-fec", "firecode", "error correction", "fec", "latency", "bit error", "ber"],
  AI_STRATEGY: ["ai", "ml", "gpu", "leaf", "spine", "voq", "fabric", "h100", "clos", "non-blocking"],
  OVERSUB: ["oversubscription", "ratio", "spine", "fabric", "congestion", "blocking", "bandwidth"],
  DOM_SCALE: ["dom", "ddm", "monitoring", "telemetry", "rx power", "tx power", "bias", "health", "metrics"],
  DEBUG_FLOW: ["debug", "troubleshooting", "mttr", "failure", "isolate", "down", "flapping", "errors"],
  ZR_TECH: ["coherent", "zr", "dci", "long-haul", "80km", "16qam", "dsp", "amplification"]
};

export const CONCEPT_TAB_MAP: Record<string, string> = {
  FIBER_CORE: "CONNECTIVITY", REACH_TABLE: "CONNECTIVITY", CLEANING: "CONNECTIVITY", LOSS_BUDGET: "CONNECTIVITY", SAFETY_RULES: "CONNECTIVITY", POLARITY: "CONNECTIVITY",
  LANE_DENSITY: "HARDWARE", FORM_FACTORS: "HARDWARE", BREAKOUT_LOGIC: "HARDWARE", HARDWARE_REFERENCE: "HARDWARE", CONNECTOR_MAPPING: "HARDWARE",
  MODULATION: "SIGNALING", FEC_MODES: "SIGNALING",
  AI_STRATEGY: "STRATEGY", OVERSUB: "STRATEGY",
  DOM_SCALE: "OPERATIONS", DEBUG_FLOW: "OPERATIONS",
  ZR_TECH: "UPGRADES"
};

export const RULES_OF_THUMB: Record<string, string[]> = {
  FIBER_CORE: ["SMF (Yellow) = 9µm core for long distance.", "MMF (Aqua/Violet) = 50µm core for short distance.", "Never mix SMF transceivers with MMF fiber."],
  REACH_TABLE: ["SR = Short Reach (100m).", "DR = Datacenter Reach (500m).", "LR = Long Reach (10km).", "ZR = Coherent DCI (80km+)."],
  CLEANING: ["Always 'Inspect Before Connect' (IBC).", "Dry cleaning is preferred over wet cleaning.", "One contaminated connector can damage the transceiver OSA."],
  LOSS_BUDGET: ["Budget (dB) = Tx Power (dBm) - Rx Sensitivity (dBm).", "Allow ~0.5dB loss per mated connector pair.", "Always include a 1-2dB safety margin."],
  SAFETY_RULES: ["APC (Green) is angled at 8 degrees.", "UPC (Blue) is flat.", "Mating APC to UPC causes permanent glass core pits."],
  POLARITY: ["Type B (Crossover) is the standard for MPO parallel trunks.", "Tx must always land on Rx.", "Incorrect polarity is a top cause of 'down/down' links."],
  LANE_DENSITY: ["SFP = 1 Lane.", "QSFP = 4 Lanes.", "OSFP = 8 Lanes.", "100G QSFP28 uses 4x 25G NRZ lanes."],
  FORM_FACTORS: ["OSFP handles higher heat than QSFP-DD.", "QSFP-DD is backward compatible with QSFP28.", "800G requires 112G SerDes lanes."],
  BREAKOUT_LOGIC: ["400G can split to 4x 100G.", "800G can split to 2x 400G or 8x 100G.", "Breakout requires compatible software configuration."],
  HARDWARE_REFERENCE: ["100G-2 means two electrical channels at 50G each.", "100G-4 means four electrical channels at 25G each.", "QSFP-DD consumes eight electrical channels in the documented gearbox architecture example."],
  CONNECTOR_MAPPING: ["100G-PSM4 uses MPO-12 (Parallel).", "100G-CWDM4 uses Duplex LC (WDM).", "Always check the connector type before ordering patch cords."],
  MODULATION: ["NRZ = 1 bit per symbol (Standard for 100G legacy).", "PAM4 = 2 bits per symbol (Standard for 400G+).", "PAM4 is more sensitive to noise (SNR penalty)."],
  FEC_MODES: ["RS-FEC is mandatory for PAM4 links.", "100G links may use Firecode or No-FEC depending on reach.", "FEC adds ~100-200ns of fixed latency."]
};

export const DECISION_IMPACTS = {
  FIBER_CORE: "Decision impact: Core choice determines reuse potential for 100G/400G/800G. USED IN: Part Finder",
  REACH_TABLE: "Decision impact: Suffix selection is the primary filter for 100G+ catalog. USED IN: Part Finder",
  CLEANING: "Decision impact: Prevents signal degradation on sensitive 100G+ links. USED IN: Engineering Ops",
  LOSS_BUDGET: "Decision impact: Prevents 'no-link' on extended 100G/400G spans. USED IN: Link Budget Calc",
  SAFETY_RULES: "Decision impact: Prevents non-reversible hardware damage. USED IN: Smart Matrix",
  POLARITY: "Decision impact: Corrects Rx/Tx mismatch for 100G/400G MPO links. USED IN: Smart Matrix",
  LANE_DENSITY: "Decision impact: Determines breakout options (e.g., 100G to 4x25G). USED IN: Cable Configurator",
  FORM_FACTORS: "Decision impact: Dictates platform compatibility (QSFP28 vs QSFP-DD). USED IN: Part Finder",
  BREAKOUT_LOGIC: "Decision impact: Maps high-speed switch cages to server ports. USED IN: Cable Configurator",
  HARDWARE_REFERENCE: "Decision impact: Prevents invalid breakout and adjacent-port assumptions on gearbox-based port groups. USED IN: Cable Configurator",
  CONNECTOR_MAPPING: "Decision impact: Defines exact patch cable for the BOM. USED IN: Cable Configurator",
  MODULATION: "Decision impact: Matches 100G NRZ vs 100G Single Lambda (PAM4). USED IN: Smart Matrix",
  FEC_MODES: "Decision impact: Prevents 'light but no link' scenarios. USED IN: Smart Matrix",
  AI_STRATEGY: "Decision impact: Optimizes 100G/400G GPU fabrics. USED IN: Architecture Lab",
  STRATEGY_1: "Decision impact: Core framework for all high-speed optics decisions. USED IN: Architecture Lab",
  OVERSUB: "Decision impact: Determines Spine count for 100G+ fabrics. USED IN: Architecture Lab",
  DOM_SCALE: "Decision impact: Primary source for 100G+ health alerts. USED IN: Engineering Ops",
  DEBUG_FLOW: "Decision impact: Reduces MTTR on 100G+ datacenter fabrics.",
  ZR_TECH: "Decision impact: Simplifies 100G/400G/800G long-haul design. USED IN: Part Finder"
};

export const ADVANCED_NOTES: Record<string, string[]> = {
  FIBER_CORE: [
    "MMF uses OM3/OM4/OM5 standards where OM5 (Lime) supports WBMMF for BIDI applications.",
    "SMF attenuation is typically ~0.35dB/km at 1310nm.",
    "100G-SR4 is limited to 100m over OM4 due to modal dispersion."
  ],
  REACH_TABLE: [
    "100G-CWDM4 (2km) vs 100G-LR4 (10km) use different WDM grids (20nm vs 4.5nm spacing).",
    "Single Lambda 100G (DR/FR/LR) uses PAM4 modulation to reduce lane count to one.",
    "100G-PSM4 uses 8 fibers (4 Tx, 4 Rx) over parallel SMF."
  ],
  FORM_FACTORS: [
    "QSFP28 is the standard for 100G; QSFP-DD adds a second row of contacts for 400G+.",
    "100G Single Lambda modules allow high-density 400G-to-100G breakouts.",
    "DSFP (Dual SFP) provides two 100G lanes in an SFP footprint for specific high-density applications."
  ],
  MODULATION: [
    "100G NRZ (4x25G) vs 100G PAM4 (1x100G) are electrically incompatible.",
    "PAM4 maps 2 bits into one symbol, requiring better SNR than NRZ.",
    "The 9.5dB SNR penalty of PAM4 necessitates FEC on most links."
  ],
  FEC_MODES: [
    "100GBASE-LR4 (NRZ) typically requires NO FEC.",
    "100GBASE-DR (PAM4) REQUIRE RS-FEC (544, 514).",
    "Mismatched FEC results in 100% frame loss even with perfect light."
  ]
};

export const FAILURE_SYMPTOMS: Record<string, string[]> = {
  FIBER_CORE: [
    "Unexpected reach failures or signal dropouts",
    "High attenuation on MMF spans exceeding 100m",
    "Total link loss if SMF transceivers mate with MMF plant"
  ],
  SAFETY_RULES: [
    "Severe optical back-reflection and link instability",
    "Permanent physical damage to fiber end-faces",
    "Consistently low Rx power despite new optics"
  ],
  POLARITY: [
    "Link status remains 'Down' (Tx hitting Tx)",
    "Correct light levels observed but zero traffic flow",
    "Mismatched lane assignments on parallel breakouts"
  ],
  MODULATION: [
    "No Link Up due to SerDes signaling mismatch (e.g., NRZ vs PAM4)",
    "High BER (Bit Error Rate) if SNR is insufficient",
    "Flapping links during initial clock recovery"
  ],
  FEC_MODES: [
    "Link Up state but 100% packet loss (Zero throughput)",
    "Incrementing Pre-FEC error counts in interface counters",
    "Total failure to establish link at 100G/400G speeds"
  ]
};

/**
 * Shared utility for Knowledge Base formatting.
 */
export const formatConceptNote = (id: string, level: string, title: string) => {
  const guide = LEARNING_GUIDES[id];
  const concept = CONCEPT_DEFINITIONS[id] || "";
  const rules = RULES_OF_THUMB[id] || [];
  const impactText = DECISION_IMPACTS[id as keyof typeof DECISION_IMPACTS] || "";
  const symptoms = FAILURE_SYMPTOMS[id] || [];
  const resolvedTitle = guide?.title ?? title;
  const resolvedLevel = guide?.level ?? level;
  const conceptText = concept || guide?.mentalModel || '';

  const [impactProse, toolPart] = impactText.split("USED IN:");
  const tools = toolPart ? toolPart.trim() : "";

  let note = `${resolvedTitle.toUpperCase()}\n`;
  note += `Level: ${resolvedLevel}\n\n`;
  note += `Core model: ${conceptText}\n\n`;

  if (guide?.whyItMatters) {
    note += `Why it matters: ${guide.whyItMatters}\n\n`;
  }

  if (rules.length > 0) {
    note += `Rules of thumb:\n`;
    rules.forEach(r => note += `• ${r}\n`);
    note += `\n`;
  }

  if (guide?.commonMistake) {
    note += `Common mistake: ${guide.commonMistake}\n\n`;
  }

  if (impactProse.trim()) {
    note += `Decision impact: ${impactProse.trim()}\n`;
  }
  
  if (symptoms.length > 0) {
    note += `\nIf this breaks:\n`;
    symptoms.forEach(s => note += `• ${s}\n`);
  }

  if (guide?.nextStep) {
    note += `\nNext step: ${guide.nextStep}\n`;
  }

  if (tools) {
    note += `\nUsed in: ${tools}\n`;
  }

  return note.trim();
};

export const TRANSITION_TEXTS = {
  CONNECTIVITY_1: "Understanding fiber types is a prerequisite for calculating 100G+ physical link reach.",
  CONNECTIVITY_2: "Maintenance and budget planning are critical for stable high-speed 100G/400G operation.",
  CONNECTIVITY_3: "Final layer validation ensures physical connectors and polarity match for the chosen optic.",
  HARDWARE_1: "Form factor evolution (QSFP28 to OSFP) informs platform density and power envelopes.",
  HARDWARE_2: "Breakout logic enables mapping of 400G/800G ports to 100G host interfaces.",
  SIGNALING_1: "Signaling evolution from 100G NRZ to PAM4 requires new error correction logic.",
  OPERATIONS_1: "Standardized workflows reduce downtime on mission-critical 100G+ datacenter fabrics.",
  UPGRADES_1: "Foundational knowledge scales to advanced long-haul and AI-driven networking breakthroughs.",
  STRATEGY_1: "Strategic alignment is the first step towards a decidable optics architecture."
};

export const APP_CONTEXT = {
  intent: ["Empower engineers with clear, decidable optics strategies."],
  definitionOfSuccess: "Engineers confidently select and deploy high-speed optics without ambiguity.",
  behavioralRules: [
    "Always verify fiber core compatibility.",
    "Inspect and clean before every connection.",
    "Calculate link budgets for all extended spans.",
    "Validate FEC modes for PAM4 links."
  ],
  boundaries: {
    allowed: ["100G", "400G", "800G", "SMF", "MMF", "QSFP", "OSFP"],
    prohibited: ["Legacy 1G/10G", "Copper Cat5e", "Proprietary non-MSA modules"]
  }
};

export interface FiberType {
  name: string;
  core: string;
  desc: string;
}

export interface PolarityMode {
  type: string;
  logic: string;
  usage: string;
}

export interface DdmMetric {
  metric: string;
  unit: string;
  desc: string;
}

export interface ModulationType {
  type: string;
  speed: string;
  desc: string;
}

export interface StrategyPillar {
  label: string;
  value: string;
}

export interface FecType {
  mode: string;
  usage: string;
  desc: string;
}

export const TERMINOLOGY_MAP = [
  { term: 'dB', type: 'Ratio', desc: 'Relative unit measuring loss or gain. (e.g., -2.0 dB loss)' },
  { term: 'dBm', type: 'Power', desc: 'Absolute unit measuring optical power relative to 1mW. (e.g., +3.0 dBm Tx)' },
  { term: 'SMF', type: 'Media', desc: 'Singlemode (9µm). Yellow jacket. Standard for 100G+ long-reach.' },
  { term: 'MMF', type: 'Media', desc: 'Multimode (50µm). Aqua/Violet jacket. Used for 100G/400G short-reach.' },
  { term: 'LC', type: 'Conn.', desc: 'Duplex connector used for single fiber pairs (e.g. 100G-CWDM4).' },
  { term: 'MPO', type: 'Conn.', desc: 'Multi-fiber Push-On. Parallel fibers for 100G-SR4 / 400G-DR4.' }
];

export const REACH_SUFFIXES = [
  { suffix: 'SR / SR4 / SR8', name: 'Short Reach', typical: '70m - 100m', fiber: 'Multimode (OM3/OM4)', tech: '850nm VCSEL' },
  { suffix: 'DR / DR4', name: 'Datacenter Reach', typical: '500m', fiber: 'Singlemode (OS2)', tech: '1310nm Parallel' },
  { suffix: 'FR / FR4 / CWDM4', name: 'Campus Reach', typical: '2km', fiber: 'Singlemode (OS2)', tech: '1310nm / CWDM' },
  { suffix: 'LR / LR4', name: 'Long Reach', typical: '10km', fiber: 'Singlemode (OS2)', tech: '1310nm / LAN-WDM' },
  { suffix: 'ER / ER4', name: 'Extended Reach', typical: '40km', fiber: 'Singlemode (OS2)', tech: '1310nm + SOA' },
  { suffix: 'ZR', name: 'Coherent Reach', typical: '80km - 120km', fiber: 'Singlemode (OS2)', tech: 'Coherent (DCI)' },
];

export const COPPER_STANDARDS = [
  { cat: 'Cat 6', speed: '1 Gbps', distance: '100m', note: 'Typical Enterprise baseline' },
  { cat: 'Cat 6A', speed: '10 Gbps', distance: '100m', note: 'Generally recommended for 10GBASE-T' },
  { cat: 'Cat 8', speed: '25/40 Gbps', distance: 'Typical 30m', note: 'ToR only for 25G+ over Copper' },
];

export const DDM_METRICS = [
  { metric: 'Tx Power', unit: 'dBm / mW', desc: 'Optical output power from the laser' },
  { metric: 'Rx Power', unit: 'dBm / mW', desc: 'Optical power received at the photo-detector' },
  { metric: 'Temperature', unit: '°C', desc: 'Internal module temperature' },
  { metric: 'Bias Current', unit: 'mA', desc: 'Laser drive current (health indicator)' },
  { metric: 'Voltage', unit: 'V', desc: 'Supply voltage to the module' },
];

export const POLARITY_MODES = [
  { type: 'Type A', logic: 'Straight-through', usage: 'Common for Duplex LC / 100G-LR4' },
  { type: 'Type B', logic: 'Flipped / Crossover', usage: 'Standard for MPO parallel trunks (SR4/DR4)' },
  { type: 'Type C', logic: 'Pair-flipped', usage: 'Used in specific legacy structured cabling' },
];

export const CLEANING_RULES = [
  { title: 'Inspect Before Connect (IBC)', rule: 'Standard practice for all high-speed 100G+ links.' },
  { title: 'Dry Cleaning First', rule: 'Uses click-style cleaners. Avoid solvents unless required.' },
  { title: 'Zero Trust Policy', rule: 'Contamination is the #1 cause of 100G+ link instability.' }
];

export const LOSS_BUDGET_FACTORS = [
  { factor: 'Fiber Attenuation', typical: '0.35 dB/km (SMF)', desc: 'Typical loss over distance.' },
  { factor: 'Mated Connectors', typical: '0.2 - 0.75 dB', desc: 'Loss at patch points.' },
  { factor: 'Fusion Splices', typical: '0.05 - 0.1 dB', desc: 'Loss at fiber joints.' },
  { factor: 'Safety Margin', typical: '2.0 dB', desc: 'Recommended padding for aging plant.' }
];

export const FEC_TYPES = [
  { mode: 'No FEC', usage: 'Legacy 1G/10G / 100G-LR4', desc: 'Direct signaling with zero overhead.' },
  { mode: 'Base-R FEC (Firecode)', usage: '25G/40G / 100G-SR4', desc: 'Lightweight error correction.' },
  { mode: 'RS-FEC (Reed-Solomon)', usage: '100G (PAM4) / 400G / 800G', desc: 'Standard for PAM4 signaling.' }
];

export const STRATEGY_PILLARS = [
  { label: 'Standardization', value: 'Minimizing SKU sprawl' },
  { label: 'Validation', value: 'Physical and signaling fit' },
  { label: 'Performance', value: 'Optimizing reach & power' },
  { label: 'Decidability', value: 'Clear next steps' }
];

export const MODULATION_TYPES = [
  { type: 'NRZ', speed: 'Up to 25G/lane', desc: 'Binary signaling (0 or 1). Standard for legacy 10G/25G and 100G-LR4.' },
  { type: 'PAM4', speed: '50G/100G/lane', desc: '4-level signaling. Standard for 400G/800G and 100G Single Lambda.' }
];

export const FIBER_TYPES = [
  { name: 'Singlemode (OS2)', core: '9µm', desc: 'Yellow jacket. Used for long distance (500m to 80km+).' },
  { name: 'Multimode (OM4)', core: '50µm', desc: 'Aqua/Violet jacket. Used for short distance (up to 100m).' }
];
