import type {
  PlannerArtifactAudience,
  PlannerArtifactSourceClass,
  PlannerArtifactValidationState,
  PlannerConfidenceLevel,
  PlannerSeverity,
} from './core';

export type PlannerValidationChecklist = string[];

export interface PlannerRiskItem {
  title: string;
  body: string;
  severity: PlannerSeverity;
}

export interface PlannerConfidenceSummary {
  level: PlannerConfidenceLevel;
  summary: string;
  reasons: string[];
  basis: 'mostly-input-driven' | 'mixed-inputs-and-heuristics' | 'heuristic-heavy';
}

export interface PlannerExecutiveSummary {
  recommendation: string;
  architectureSummary: string;
  primaryRisk: PlannerRiskItem;
  confidence: PlannerConfidenceSummary;
  topNotes: string[];
}

export interface PlannerDesignNarrative {
  architectureSummary: string;
  designTradeoffs: string[];
  operationalConsiderations: string[];
}

export interface PlannerDiscoveryQuestionGroup {
  category: string;
  questions: string[];
}

export interface PlannerOperatorReadiness {
  telemetryAndVisibility: string[];
  lifecycleAndChange: string[];
  followUpActions: string[];
}

export interface PlannerDiagramBrief {
  title: string;
  audience: 'SE' | 'Architect' | 'Operator';
  goal: string;
  topology: string;
  callouts: string[];
}

export interface PlannerFailureModeScenario {
  scenario: string;
  impact: string;
  designResponse: string;
  operatorNote: string;
}

export interface PlannerFabricJustification {
  topologyChoice: string;
  oversubscriptionAnalysis: string;
  latencyAndBandwidthFit: string;
  loadBalancingStrategy?: string;
  losslessDesignSummary?: string;
  routingUnderlaySummary?: string;
  assumptionsAndOpenValidations?: string[];
  failureModeAnalysis: PlannerFailureModeScenario[];
}

export interface PlannerArtifactMeta {
  confidence: PlannerConfidenceLevel;
  validationState: PlannerArtifactValidationState;
  sourceClass: PlannerArtifactSourceClass[];
  audience: PlannerArtifactAudience;
}

export interface PlannerComparisonRow {
  label: string;
  current: string | number;
  comparison: string | number;
  why: string;
}

export interface PlannerChangeImpactRow {
  label: string;
  current: string | number;
  previous: string | number;
  why: string;
}

export interface PlannerPortConsumptionItem {
  category: string;
  ports: number;
  speedGb: number;
  note: string;
}
