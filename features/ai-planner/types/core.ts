import type { GPUPlatform, StoragePlatform } from '../../../data/aiSpecs';
import type { AIClusterResult } from '../../../services/sizerEngine';
import type { MediaPreferenceOption, MediaRecommendation } from '../../../services/mediaAdvisor';
import type { AristaSwitch } from '../../../types';
import type { PlannerBomLine, PlannerBomSection } from './bom';
import type {
  PlannerConfidenceSummary,
  PlannerDesignNarrative,
  PlannerDiagramBrief,
  PlannerDiscoveryQuestionGroup,
  PlannerExecutiveSummary,
  PlannerFabricJustification,
  PlannerOperatorReadiness,
  PlannerRiskItem,
  PlannerValidationChecklist,
} from './artifacts';
import type {
  PlannerComputeFabricEvaluation,
  PlannerCongestionAssessment,
  PlannerTrainingCommunicationAssessment,
} from './evaluation';
import type { PlannerDesignPackage } from './designPackage';

export type PlannerScope = 'COMPUTE_FABRIC' | 'COMPUTE_AND_STORAGE';
export type PlannerSeverity = 'low' | 'medium' | 'high';
export type PlannerConfidenceLevel = 'high' | 'medium' | 'low';
export type PlannerRailMode = 'SINGLE_PLANE' | 'RAIL_OPTIMIZED';
export type PlannerRoutingPreference = 'EBGP_UNNUMBERED' | 'EBGP_NUMBERED';
export type PlannerFailureDesignPriority = 'STANDARD' | 'STRICT_NO_ISOLATION';
export type PlannerArtifactAudience = 'SE' | 'Architect' | 'Customer' | 'Operator';
export type PlannerArtifactSourceClass =
  | 'input-derived'
  | 'policy-derived'
  | 'assumption-driven'
  | 'requires-validation';
export type PlannerArtifactValidationState =
  | 'ready-for-discussion'
  | 'requires-customer-input'
  | 'requires-poc-validation';

export interface FabricProfile {
  id: string;
  label: string;
  description: string;
  defaultLeafSku: string;
  defaultSpineSku: string;
  allowCustomOverride: boolean;
}

export interface PlannerInputs {
  selectedGpuId: string;
  gpuCount: number;
  targetGpuCount?: number;
  fabricProfileId: string;
  scope: PlannerScope;
  oversubscription: number;
  distanceMeters: number;
  mediaPreference: MediaPreferenceOption;
  selectedStorageId?: string;
  customLeafSku?: string;
  customSpineSku?: string;
  fabricIntent: 'AI_TRAINING_CLUSTER';
  collectiveTrafficProfile: 'ALLREDUCE_HEAVY';
  railMode: PlannerRailMode;
  routingPreference: PlannerRoutingPreference;
  latencyTargetUsec: number;
  maxOversubscriptionTarget: number;
  failureDesignPriority: PlannerFailureDesignPriority;
  losslessProfile: 'ROCEV2_STANDARD';
}

export type PlannerSnapshotState = PlannerInputs;

export interface CapacityPlan {
  futureNodeCount: number;
  additionalLeaves: number;
  additionalSpines: number;
  additionalRacks: number;
  futureWarnings: string[];
}

export interface PlannerAssumption {
  label: string;
  value: string;
  scope: 'fabric' | 'storage' | 'media' | 'physical' | 'operations';
}

export interface PlannerViewModel {
  title: string;
  subtitle: string;
  assumptions: string[];
  assumptionMap: PlannerAssumption[];
  warnings: string[];
  capacityPlan: CapacityPlan;
  bomLines: PlannerBomLine[];
  bomSections: PlannerBomSection[];
  fabricMedia: MediaRecommendation;
  accessMedia: MediaRecommendation;
  executiveSummary: PlannerExecutiveSummary;
  designNarrative: PlannerDesignNarrative;
  discoveryQuestions: PlannerDiscoveryQuestionGroup[];
  validationChecklist: PlannerValidationChecklist;
  riskSummary: PlannerRiskItem[];
  confidenceSummary: PlannerConfidenceSummary;
  congestionAssessment: PlannerCongestionAssessment;
  trainingCommunication: PlannerTrainingCommunicationAssessment;
  operatorReadiness: PlannerOperatorReadiness;
  diagramBrief: PlannerDiagramBrief;
  fabricJustification: PlannerFabricJustification;
  computeFabricEvaluation: PlannerComputeFabricEvaluation;
  designPackage: PlannerDesignPackage;
  visualMetrics: {
    leafLabel: string;
    spineLabel: string;
    fabricBandwidthLabel: string;
    latencyLabel: string;
    bufferLabel: string;
    representativeNote: string;
  };
}

export interface PlannerModel {
  inputs: PlannerInputs;
  gpuPlatform: GPUPlatform;
  storagePlatform?: StoragePlatform;
  leafSwitch: AristaSwitch;
  spineSwitch: AristaSwitch;
  currentResult: AIClusterResult;
  futureResult: AIClusterResult;
  view: PlannerViewModel;
}
