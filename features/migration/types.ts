
export type FiberType = 'MMF_MPO' | 'SMF_LC' | 'SMF_MPO_APC' | 'MMF_LC';

export interface MigrationRecommendation {
  sku: string;
  name: string;
  desc: string;
  details: string;
  disruption: 'LOW' | 'MEDIUM' | 'HIGH';
  complexity: 1 | 2 | 3 | 4 | 5;
  cost: '$' | '$$' | '$$$';
  disruptionReason: string;
  action: string;
}

export interface MigrationScenario {
  id: FiberType;
  title: string;
  // We use string identifiers for icons to keep data files framework-agnostic
  iconKey: 'Cable'; 
  legacyExample: string;
  legacySpeed: string;
  recommendation: MigrationRecommendation;
}
