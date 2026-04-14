export type WorkloadType = "training" | "inference" | "mixed" | "hpc";
export type FabricProfileId =
  | "balanced-enterprise"
  | "training-performance"
  | "high-scale-400g"
  | "high-scale-800g"
  | "custom";
export type ResearchWorkloadProfile =
  | "genomics"
  | "imaging"
  | "drug-discovery"
  | "multimodal-research"
  | "clinical-inference"
  | "simulation"
  | "large-inference";
export type StorageType = "ethernet" | "roce" | "nas-like";
export type StorageProfileId =
  | "none"
  | "generic-shared-ethernet"
  | "generic-shared-roce"
  | "generic-shared-nas"
  | "high-priority-roce-parallel-fs";
export type EastWestTrafficIntensity = "low" | "medium" | "high";
export type RedundancyPreference = "standard" | "high";
export type TargetOversubscription = 1 | 2 | 3;
export type FutureGrowthBuffer = 0 | 25 | 50;
export type OpticsPreference = "dac" | "aoc" | "sr" | "dr" | "mixed";
export type ManagementSimplicityPriority = "low" | "medium" | "high";
export type CommunicationPattern = "ring-all-reduce" | "tree-all-reduce" | "hierarchical" | "mixed-unknown" | "nccl-framework-managed";
export type TrainingCommunicationIntensity = "low" | "medium" | "high" | "extreme";
export type ModelSynchronizationSensitivity = "low" | "medium" | "high";
export type ClusterScaleClass = "small" | "medium" | "large";
export type PressureLevel = "low" | "moderate" | "high" | "severe";
export type EastWestBurstFactor = "low" | "medium" | "high" | "extreme";
export type OversubscriptionGuidance = "1:1" | "1.5:1" | "2:1" | ">2:1 acceptable only with caution";
export type DiagramBoundaryTag = "modeled" | "representative" | "assumption-driven";
export type SwitchScaleTier = "compact" | "mid" | "large" | "xlarge";
export type SwitchSupportedRole = "leaf" | "spine" | "single-tier";
export type HardwareBomComponentType =
  | "chassis"
  | "linecard"
  | "supervisor"
  | "fabric-module"
  | "fabric-cooling-module";

export interface DesignInputs {
  researchWorkloadProfile: ResearchWorkloadProfile;
  gpuCount: number;
  gpuServerCount: number;
  gpusPerServer: number;
  nicSpeedGb: 100 | 200 | 400 | 800;
  nicPortsPerServer: number;
  allocatedRackCount: number;
  rackUnitsPerRack: number;
  powerCapacityKwPerRack: number;
  computeNodeRackUnits: number;
  computeNodePowerKw: number;
  thermalNodeCapPerRack: number;
  preferredLeafModelId?: string;
  preferredSpineModelId?: string;
  storageNetworkPresent: boolean;
  storageType: StorageType;
  storageProfileId: StorageProfileId;
  storageComputePortsPerNode?: number;
  storagePortSpeedGb?: 100 | 200 | 400 | 800;
  storageServerCount?: number;
  storagePortsPerServer?: number;
  checkpointBurstProfile?: "light" | "moderate" | "high";
  eastWestTrafficIntensity: EastWestTrafficIntensity;
  workloadType: WorkloadType;
  redundancyPreference: RedundancyPreference;
  targetOversubscription: TargetOversubscription;
  futureGrowthBufferPercent: FutureGrowthBuffer;
  opticsPreference: OpticsPreference;
  representativeInterRackDistanceMeters: number;
  managementSimplicityPriority: ManagementSimplicityPriority;
  collectivePattern: CommunicationPattern;
  trainingCommunicationIntensity: TrainingCommunicationIntensity;
  modelSynchronizationSensitivity: ModelSynchronizationSensitivity;
  clusterScaleClass: ClusterScaleClass;
}

export interface ScenarioPreset {
  id: ResearchWorkloadProfile;
  name: string;
  workloadSummary: string;
  guidance: string;
  input: DesignInputs;
}

export interface FabricProfileOption {
  id: FabricProfileId;
  label: string;
  description: string;
  defaults: Pick<
    DesignInputs,
    "nicSpeedGb" | "targetOversubscription" | "redundancyPreference" | "managementSimplicityPriority"
  >;
}

export interface SwitchModel {
  id: string;
  name: string;
  role: "leaf" | "spine";
  family: string;
  supportedRoles: SwitchSupportedRole[];
  scaleTier: SwitchScaleTier;
  portSpeedGb: 100 | 200 | 400 | 800;
  portsPerSwitch: number;
  chassisSku?: string;
  linecardSlots?: number;
  linecardSku?: string;
  supervisorSkuPrimary?: string;
  supervisorSkuSecureBoot?: string;
  fabricModuleSku?: string;
  fabricCoolingModuleSku?: string;
  recommendedMinServers?: number;
  recommendedMaxServers?: number;
  recommendedMinLeafs?: number;
  recommendedMaxLeafs?: number;
  designNote: string;
}

export interface CatalogAssumptions {
  leafOptions: SwitchModel[];
  spineOptions: SwitchModel[];
}

export interface DesignAssumption {
  label: string;
  value: string;
}

export interface FacilityEnvelope {
  allocatedRackCount: number;
  rackUnitsPerRack: number;
  powerCapacityKwPerRack: number;
  computeNodeRackUnits: number;
  computeNodePowerKw: number;
  physicalNodeCapPerRack: number;
  thermalNodeCapPerRack: number;
  powerNodeCapPerRack: number;
  recommendedNodeCapPerRack: number;
  requiredRacksByPhysical: number;
  requiredRacksByThermal: number;
  requiredRacksByPower: number;
  requiredRacks: number;
  remainingRackHeadroom: number;
  totalComputePowerKw: number;
  totalAllocatedPowerKw: number;
  powerHeadroomKw: number;
  fitStatus: "fits" | "rack-constrained" | "power-constrained" | "facility-constrained";
}

export interface PortConsumption {
  category: string;
  ports: number;
  speedGb: number;
  note: string;
}

export interface HardwareBomItem {
  sku: string;
  description: string;
  quantity: number;
  componentType: HardwareBomComponentType;
  source: "auto-hardware-policy" | "manual-hardware-override";
  role: "leaf" | "spine";
  note: string;
}

export interface DesignNote {
  title: string;
  body: string;
  emphasis?: "neutral" | "warning" | "positive";
}

export interface DesignRisk {
  title: string;
  body: string;
  severity: "low" | "medium" | "high";
}

export type CongestionRiskLevel = "low" | "moderate" | "high" | "severe";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface CongestionRiskAssessment {
  level: CongestionRiskLevel;
  summary: string;
  primaryDrivers: string[];
  recommendedMitigation: string;
}

export interface DiscoveryQuestionGroup {
  category: string;
  questions: string[];
}

export interface StructuredNarrative {
  architectureSummary: string;
  designTradeoffs: string[];
  operationalConsiderations: string[];
}

export interface NormalizedDesignInputs extends DesignInputs {
  derivedClusterScaleClass: ClusterScaleClass;
  designBoundary: string;
}

export interface TrainingCommunicationInputs {
  gpuCount: number;
  collectivePattern: CommunicationPattern;
  trainingCommunicationIntensity: TrainingCommunicationIntensity;
  modelSynchronizationSensitivity: ModelSynchronizationSensitivity;
  clusterScaleClass: ClusterScaleClass;
  actualOversubscriptionRatio: number;
  storageNetworkPresent: boolean;
  storageType: StorageType;
  storageProfileId: StorageProfileId;
  eastWestTrafficIntensity: EastWestTrafficIntensity;
  workloadType: WorkloadType;
}

export interface TrainingCommunicationAssessment {
  communicationPressureRating: PressureLevel;
  eastWestBurstFactor: EastWestBurstFactor;
  recommendedOversubscriptionCeiling: OversubscriptionGuidance;
  patternSummary: string;
  eastWestImpact: string;
  architectureNote: string;
  trainingRiskNote: string;
  architectureImplications: string[];
  primaryDrivers: string[];
  modelBoundary: string;
}

export interface DesignConfidenceAssessment {
  level: ConfidenceLevel;
  summary: string;
  reasons: string[];
  basis: "mostly-input-driven" | "mixed-inputs-and-heuristics" | "heuristic-heavy";
}

export interface TopologyNode {
  id: string;
  label: string;
  detail: string;
  type: "spine" | "leaf" | "server" | "storage";
}

export interface TopologyLink {
  from: string;
  to: string;
  label: string;
}

export interface TopologyRecommendation {
  headline: string;
  detail: string;
  switchingTiers: 2 | 3;
  leafSwitchCountEstimate: number;
  spineSwitchCountEstimate: number;
  recommendedLeaf: SwitchModel;
  recommendedSpine: SwitchModel;
  autoSelectedLeafModelId: string;
  autoSelectedSpineModelId: string;
  leafSelectionRationale: string;
  spineSelectionRationale: string;
  hardwareBom: HardwareBomItem[];
  nodes: TopologyNode[];
  links: TopologyLink[];
}

export interface TopologyVisualGroup {
  id: "spine" | "leaf" | "compute" | "storage";
  label: string;
  detail: string;
  description: string;
}

export interface TopologyVisualAnnotation {
  title: string;
  body: string;
}

export type AiFabricDiagramBlockType =
  | "fe-spine"
  | "fe-leaf"
  | "be-spine"
  | "be-leaf"
  | "gpu-rack-group"
  | "storage-domain"
  | "service-domain";

export type AiFabricDiagramLinkSemantic = "modeled" | "representative" | "assumption-driven";

export interface AiFabricDiagramBlock {
  id: string;
  type: AiFabricDiagramBlockType;
  label: string;
  shortLabel?: string;
  compactDetail: string;
  description: string;
  visibility?: ReadonlyArray<"compute-only" | "full-stack">;
}

export interface AiFabricDiagramLink {
  from: string;
  to: string;
  semantic: AiFabricDiagramLinkSemantic;
  bandwidthLabel?: string;
  description: string;
}

export interface TopologyVisualLegendItem {
  label: string;
  tone:
    | "fe-core"
    | "fe-access"
    | "be-spine"
    | "be-leaf"
    | "gpu-rack"
    | "storage-domain"
    | "service-domain"
    | "modeled-link"
    | "representative-link"
    | "assumption-link";
}

export interface TopologyVisualModel {
  layoutMode: "compute-only" | "full-stack";
  boundaryTags: DiagramBoundaryTag[];
  representativeNote: string;
  frontEndTitle: string;
  frontEndSubtitle: string;
  backEndTitle: string;
  backEndSubtitle: string;
  frontEndBlocks: AiFabricDiagramBlock[];
  backEndBlocks: AiFabricDiagramBlock[];
  storageBlocks: AiFabricDiagramBlock[];
  computeBlocks: AiFabricDiagramBlock[];
  representativeLinks: AiFabricDiagramLink[];
  countLabels: string[];
  callouts: TopologyVisualAnnotation[];
  legend: TopologyVisualLegendItem[];
}

export interface StorageFabricCapacity {
  enabled: boolean;
  dedicated: boolean;
  profileId?: StorageProfileId;
  profileLabel?: string;
  computeNodeCount: number;
  storageServerCount: number;
  computePortsPerNode: number;
  storagePortsPerServer: number;
  storagePortSpeedGb: number;
  aggregateReadThroughputTbps: number;
  aggregateWriteThroughputTbps: number;
  computeFacingPortRequirement: number;
  storageFacingPortRequirement: number;
  storageLeafPortRequirement: number;
  storageLeafCountEstimate: number;
  storageSpineCountEstimate: number;
  checkpointBurstProfile?: "light" | "moderate" | "high";
}

export interface DerivedCapacity {
  totalRequiredHostFacingBandwidthTbps: number;
  hostPortCount: number;
  estimatedStorageFacingLeafPorts: number;
  baselineLeafPortRequirement: number;
  growthAdjustedLeafPortRequirement: number;
  leafSwitchCountEstimate: number;
  estimatedDownlinkCapacityPerLeaf: number;
  uplinksPerLeaf: number;
  estimatedLeafPortRequirement: number;
  targetSpineFacingUplinkRequirement: number;
  estimatedSpineFacingUplinkRequirement: number;
  targetOversubscriptionRatio: TargetOversubscription;
  actualOversubscriptionRatio: number;
  growthBufferPercent: FutureGrowthBuffer;
  storageFabric: StorageFabricCapacity;
  facilityEnvelope: FacilityEnvelope;
}

export type CapacityModelResult = DerivedCapacity;
export type TopologyModelResult = TopologyRecommendation;

export interface DesignEngineResult {
  inputs: NormalizedDesignInputs;
  derivedCapacity: CapacityModelResult;
  topologyRecommendation: TopologyModelResult;
  trainingCommunication: TrainingCommunicationAssessment;
  congestionRisk: CongestionRiskAssessment;
  confidence: DesignConfidenceAssessment;
  discoveryQuestions: DiscoveryQuestionGroup[];
  structuredNarrative: StructuredNarrative;
  whyThisDesignWorks: string[];
  opticsAssumptions: DesignAssumption[];
  storageAssumptions: DesignAssumption[];
  architectureNotes: DesignNote[];
  risks: DesignRisk[];
  customerFacingExplanation: string;
  portConsumption: PortConsumption[];
  designBoundary: string;
}

export type ClusterInput = DesignInputs;
