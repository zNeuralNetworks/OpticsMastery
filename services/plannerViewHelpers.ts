import type { MediaRecommendation } from './mediaAdvisor';
import type { PlannerInputs, PlannerModel } from '../features/ai-planner/types';

interface PlannerModelBase extends Omit<PlannerModel, 'view'> {}

export const buildPlannerWarnings = (
  inputs: PlannerInputs,
  current: PlannerModel['currentResult'],
  future: PlannerModel['futureResult'],
): string[] => {
  const warnings = [...current.warnings, ...current.computeFabric.warnings];
  const futureGpuTarget = Math.max(inputs.gpuCount, inputs.targetGpuCount ?? inputs.gpuCount);

  if (futureGpuTarget > inputs.gpuCount) {
    const additionalLeaves = Math.max(0, future.computeFabric.leafCount - current.computeFabric.leafCount);
    const additionalSpines = Math.max(0, future.computeFabric.spineCount - current.computeFabric.spineCount);
    const additionalRacks = Math.max(0, future.rackPlanning.rackCount - current.rackPlanning.rackCount);

    warnings.push(
      `Future capacity target of ${futureGpuTarget} GPUs adds ${additionalLeaves} compute leaves, ${additionalSpines} compute spines, and ${additionalRacks} racks.`,
    );
  }

  return warnings;
};

export const buildPlannerAssumptions = (
  model: PlannerModelBase,
  fabricMedia: MediaRecommendation,
  accessMedia: MediaRecommendation,
): string[] => [
  `${model.leafSwitch.name} selected as the compute leaf profile and ${model.spineSwitch.name} selected as the spine profile.`,
  'Planner remains assumption-driven; BOM lines tagged as assumed require customer-specific endpoint validation.',
  model.inputs.scope === 'COMPUTE_AND_STORAGE'
    ? `${model.storagePlatform?.name ?? 'Storage'} is modeled as a representative isolated storage fabric.`
    : 'Backend-only mode models a single compute fabric without explicit storage switching.',
  `Fabric interconnect uses ${fabricMedia.label}; compute access uses ${accessMedia.label} for representative media planning.`,
];

export const buildVisualMetrics = (model: PlannerModelBase) => ({
  leafLabel: `${model.leafSwitch.name} · ${model.leafSwitch.totalPorts}x${model.leafSwitch.portSpeed}`,
  spineLabel: `${model.spineSwitch.name} · ${model.spineSwitch.totalPorts}x${model.spineSwitch.portSpeed}`,
  fabricBandwidthLabel: `${(model.currentResult.computeFabric.usedUplinkPorts * 800 / 1000).toFixed(1)} Tbps active`,
  latencyLabel: `~${model.spineSwitch.representativeLatencyNs}ns representative`,
  bufferLabel: model.spineSwitch.bufferProfile,
  representativeNote: 'Representative topology only. Display compresses node and switch counts for readability.',
});
