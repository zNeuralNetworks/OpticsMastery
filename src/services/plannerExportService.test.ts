import { describe, expect, it } from 'vitest';
import { DEFAULT_PLANNER_INPUTS } from '../../features/ai-planner/defaults';
import { buildAIPlannerModel } from '../../services/aiPlannerService';
import {
  buildPlannerBomExport,
  buildPlannerCalculationTrace,
  buildPlannerComputeFabricScorecardExport,
  buildPlannerDecisionExport,
  buildPlannerFailureAnalysisExport,
  buildPlannerInputTrace,
  buildPlannerTopologyJustificationExport,
  buildPlannerWorkbookSheets,
} from '../../services/plannerExportService';

describe('plannerExportService', () => {
  it('builds auditable input and calculation traces for the default design', () => {
    const model = buildAIPlannerModel(DEFAULT_PLANNER_INPUTS);
    const inputRows = buildPlannerInputTrace(model);
    const calculationRows = buildPlannerCalculationTrace(model);
    const workbook = buildPlannerWorkbookSheets(model);

    expect(inputRows.some((row) => row.field === 'GPU count' && row.value === DEFAULT_PLANNER_INPUTS.gpuCount)).toBe(true);
    expect(inputRows.some((row) => row.field === 'Spine switch' && row.source === 'planner-policy')).toBe(true);
    expect(calculationRows.some((row) => row.metric === 'Compute leaf count' && row.formulaLabel === 'ceil(totalComputeNics / nicsPerLeaf)')).toBe(true);
    expect(calculationRows.some((row) => row.metric === 'Selected spine estimated count')).toBe(true);
    expect(workbook.map((sheet) => sheet.name)).toEqual([
      'Design Inputs',
      'Sizing Logic',
      'Design Summary',
      'Decision Record',
      'Topology Justification',
      'Fabric Evaluation',
      'Failure Analysis',
      'Implementation Notes',
      'Hardware Summary',
      'Customer Summary',
      'Assumptions & Actions',
    ]);
    expect(calculationRows.some((row) => row.metric === 'Estimated path latency budget')).toBe(true);
    expect(calculationRows.some((row) => row.metric === 'Single-spine proportional bandwidth share')).toBe(true);
  });

  it('includes storage-fabric calculations when storage scope is enabled', () => {
    const model = buildAIPlannerModel({
      ...DEFAULT_PLANNER_INPUTS,
      scope: 'COMPUTE_AND_STORAGE',
      selectedStorageId: 'WEKA',
    });

    const calculationRows = buildPlannerCalculationTrace(model);

    expect(calculationRows.some((row) => row.group === 'Storage fabric' && row.metric === 'Storage leaf count')).toBe(true);
    expect(calculationRows.some((row) => row.group === 'Storage fabric' && row.metric === 'Storage spine count')).toBe(true);
  });

  it('builds flat export tables for decision, compute-fabric, and BOM data', () => {
    const model = buildAIPlannerModel(DEFAULT_PLANNER_INPUTS);
    const decisionTable = buildPlannerDecisionExport(model);
    const scorecardTable = buildPlannerComputeFabricScorecardExport(model);
    const topologyTable = buildPlannerTopologyJustificationExport(model);
    const failureTable = buildPlannerFailureAnalysisExport(model);
    const bomTable = buildPlannerBomExport(model);

    expect(decisionTable.rows.length).toBeGreaterThan(0);
    expect(scorecardTable.rows.some((row) => row.requirement === 'Max 1.1:1 oversubscription compliance')).toBe(true);
    expect(topologyTable.rows.some((row) => row.criterion === '2-tier Clos assessment')).toBe(true);
    expect(failureTable.rows.some((row) => row.scenario === 'Spine switch failure')).toBe(true);
    expect(bomTable.rows.some((row) => row.section === 'Compute fabric')).toBe(true);
  });
});
