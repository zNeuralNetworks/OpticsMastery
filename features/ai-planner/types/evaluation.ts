import type { PlannerFailureModeScenario } from './artifacts';

export type PlannerRequirementStatusType = 'pass' | 'caution' | 'fail' | 'assumption-driven';

export interface PlannerCongestionAssessment {
  level: 'low' | 'moderate' | 'high' | 'severe';
  summary: string;
  primaryDrivers: string[];
  recommendedMitigation: string;
}

export interface PlannerTrainingCommunicationAssessment {
  communicationPressure: 'low' | 'moderate' | 'high' | 'severe';
  eastWestBurstFactor: 'low' | 'medium' | 'high' | 'extreme';
  recommendedOversubscriptionCeiling: '1:1' | '1.5:1' | '2:1' | '>2:1 acceptable only with caution';
  patternSummary: string;
  architectureNote: string;
  trainingRiskNote: string;
  architectureImplications: string[];
}

export interface PlannerRequirementStatus {
  requirement: string;
  status: PlannerRequirementStatusType;
  summary: string;
  why: string;
  followUpValidation: string;
}

export interface PlannerTopologyDecision {
  recommendedTopology: 'two-tier' | 'three-tier' | 'rail-optimized-two-tier';
  decisionRationale: string;
  whenThisBreaks: string;
  failureDomainNote: string;
}

export interface PlannerTopologyJustification {
  currentEndpointCount: number;
  futureEndpointCount: number;
  currentLeafCount: number;
  currentSpineCount: number;
  futureLeafCount: number;
  futureSpineCount: number;
  twoTierAssessment: string;
  threeTierAssessment: string;
  railOptimizedAssessment: string;
}

export interface PlannerLatencyAssessmentDetail {
  targetUsec: number;
  hopModel: string;
  hopCount: number;
  leafLatencyNs: number;
  spineLatencyNs: number;
  estimatedPathLatencyUsec: number;
  assessment: string;
  openValidation: string;
}

export interface PlannerEcmpAssessmentDetail {
  currentPathCount: number;
  strategy: string;
  entropySource: string;
  polarizationRisk: string;
  collectiveFit: string;
  validationChecklist: string[];
}

export interface PlannerLosslessDesign {
  classificationModel: string;
  pfcStrategy: string;
  ecnStrategy: string;
  dcqcnStrategy: string;
  deadlockAvoidance: string;
  validationChecklist: string[];
}

export interface PlannerUnderlayDesign {
  bgpRecommendation: string;
  asnAllocationStrategy: string;
  bfdPosture: string;
  convergenceTarget: string;
  ecmpPosture: string;
}

export interface PlannerFaultToleranceAssessment {
  spineFailure: PlannerFailureModeScenario;
  leafFailure: PlannerFailureModeScenario;
  gracefulDegradation: string;
  noSingleIsolationPosture: string;
  spineProportionalSharePct: number;
  leafIsolationRisk: string;
}

export interface PlannerComputeFabricEvaluation {
  protocolProfile: string;
  topologyDecision: PlannerTopologyDecision;
  topologyJustification: PlannerTopologyJustification;
  oversubscriptionAssessment: string;
  latencyAssessment: string;
  latencyDetail: PlannerLatencyAssessmentDetail;
  ecmpAndLoadBalancing: string;
  ecmpDetail: PlannerEcmpAssessmentDetail;
  losslessDesign: PlannerLosslessDesign;
  faultToleranceAssessment: PlannerFaultToleranceAssessment;
  routingUnderlay: PlannerUnderlayDesign;
  requirementScorecard: PlannerRequirementStatus[];
  writtenJustification: string;
}
