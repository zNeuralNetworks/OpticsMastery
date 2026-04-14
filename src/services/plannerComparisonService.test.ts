import { describe, expect, it } from 'vitest';
import { DEFAULT_PLANNER_INPUTS } from '../../features/ai-planner/defaults';
import { buildAIPlannerModel } from '../../services/aiPlannerService';
import {
  buildPlannerChangeImpactRows,
  buildPlannerComparisonRows,
  buildPlannerPortConsumption,
} from '../../services/plannerComparisonService';

describe('plannerComparisonService', () => {
  it('builds scenario comparison rows from planner models', () => {
    const current = buildAIPlannerModel(DEFAULT_PLANNER_INPUTS);
    const comparison = buildAIPlannerModel({
      ...DEFAULT_PLANNER_INPUTS,
      gpuCount: 4096,
      targetGpuCount: 8192,
    });

    const rows = buildPlannerComparisonRows(current, comparison);

    expect(rows.some((row) => row.label === 'Leaf switches')).toBe(true);
    expect(rows.some((row) => row.label === 'Spine switches')).toBe(true);
    expect(rows.some((row) => row.label === 'Congestion risk')).toBe(true);
  });

  it('filters change impact rows to actual differences', () => {
    const previous = buildAIPlannerModel(DEFAULT_PLANNER_INPUTS);
    const current = buildAIPlannerModel({
      ...DEFAULT_PLANNER_INPUTS,
      gpuCount: 4096,
      targetGpuCount: 4096,
    });

    const rows = buildPlannerChangeImpactRows(current, previous);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.current !== row.previous)).toBe(true);
  });

  it('builds port-consumption rows for compute and storage', () => {
    const model = buildAIPlannerModel({
      ...DEFAULT_PLANNER_INPUTS,
      scope: 'COMPUTE_AND_STORAGE',
      selectedStorageId: 'WEKA',
    });

    const rows = buildPlannerPortConsumption(model);

    expect(rows.some((row) => row.category === 'Compute downlinks used')).toBe(true);
    expect(rows.some((row) => row.category === 'Storage downlinks used')).toBe(true);
    expect(rows.some((row) => row.category === 'Storage uplinks reserved')).toBe(true);
  });
});
