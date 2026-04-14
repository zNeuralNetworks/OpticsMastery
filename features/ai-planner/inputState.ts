import { FABRIC_PROFILES } from '../../data/fabricProfiles';
import type { PlannerInputs } from './types';

export const applyPlannerInputChange = <K extends keyof PlannerInputs>(
  current: PlannerInputs,
  key: K,
  value: PlannerInputs[K],
): PlannerInputs => {
  const next = { ...current, [key]: value };

  if (key === 'scope') {
    next.selectedStorageId = value === 'COMPUTE_AND_STORAGE' ? current.selectedStorageId ?? 'WEKA' : undefined;
  }

  if (key === 'fabricProfileId') {
    const profile = FABRIC_PROFILES.find((item) => item.id === value);
    if (profile && !profile.allowCustomOverride) {
      next.customLeafSku = profile.defaultLeafSku;
      next.customSpineSku = profile.defaultSpineSku;
    }
  }

  return next;
};

export const normalizePlannerInputsForPlatform = (
  current: PlannerInputs,
  defaultGpusPerNode: number,
): PlannerInputs => {
  if (current.gpuCount >= defaultGpusPerNode) {
    return current;
  }

  return {
    ...current,
    gpuCount: defaultGpusPerNode,
    targetGpuCount: Math.max(current.targetGpuCount ?? defaultGpusPerNode, defaultGpusPerNode),
  };
};
