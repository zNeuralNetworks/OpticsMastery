import type { PlannerBomSection } from './bom';
import type {
  PlannerArtifactMeta,
  PlannerDiagramBrief,
  PlannerRiskItem,
} from './artifacts';

export interface PlannerDecisionItem {
  title: string;
  decision: string;
  why: string;
  tradeoffs: string[];
  alternativesConsidered: string[];
  changeConditions: string[];
  implementationConsequences: string[];
  meta: PlannerArtifactMeta;
}

export interface PlannerDecisionRecord {
  items: PlannerDecisionItem[];
}

export interface PlannerDesignRecommendation {
  recommendation: string;
  topology: string;
  leafClass: string;
  spineClass: string;
  railPosture: string;
  scope: string;
  growthPosture: string;
  fitSummary: string;
  notClaimed: string[];
  keyRisks: PlannerRiskItem[];
  meta: PlannerArtifactMeta;
}

export interface PlannerImplementationReadiness {
  underlayPosture: string[];
  roceQosPosture: string[];
  hostRailPosture: string[];
  validationSequence: string[];
  configSkeletonLabels: string[];
  cliValidationCategories: string[];
  meta: PlannerArtifactMeta;
}

export interface PlannerHardwarePacket {
  bomSections: PlannerBomSection[];
  modularBreakdownNarrative: string;
  componentRoleSummary: string[];
  confidenceTags: string[];
  meta: PlannerArtifactMeta;
}

export interface PlannerPresentationPack {
  customerSummary: string;
  topologyStory: string;
  diagramBrief: PlannerDiagramBrief;
  proofChecklist: string[];
  objectionsAndCaveats: string[];
  meta: PlannerArtifactMeta;
}

export interface PlannerDesignPackage {
  recommendation: PlannerDesignRecommendation;
  decisionRecord: PlannerDecisionRecord;
  implementationReadiness: PlannerImplementationReadiness;
  hardwarePacket: PlannerHardwarePacket;
  presentationPack: PlannerPresentationPack;
}
