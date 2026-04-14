export type PlannerInputTraceSource = 'user-selected' | 'defaulted' | 'planner-policy';

export interface PlannerInputTrace {
  field: string;
  value: string | number;
  source: PlannerInputTraceSource;
  note: string;
}

export interface PlannerCalculationTrace {
  group: string;
  metric: string;
  formulaLabel: string;
  expression: string;
  value: string | number;
  unit: string;
  note: string;
}

export interface PlannerTopologyJustificationRow {
  criterion: string;
  currentValue: string | number;
  assessment: string;
  why: string;
  followUpValidation: string;
}

export interface PlannerFailureAnalysisRow {
  scenario: string;
  failureDomain: string;
  reachabilityImpact: string;
  bandwidthImpact: string;
  isolationRisk: string;
  gracefulDegradation: string;
  designResponse: string;
  validationAction: string;
}
