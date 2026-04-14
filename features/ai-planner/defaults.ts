import { ARISTA_SWITCHES } from '../../data/hardware';
import { FABRIC_PROFILES } from '../../data/fabricProfiles';
import type { PlannerInputs } from './types';

export const DEFAULT_PLANNER_INPUTS: PlannerInputs = {
  selectedGpuId: 'h100-hgx',
  gpuCount: 2048,
  targetGpuCount: 4096,
  fabricProfileId: FABRIC_PROFILES[0]?.id ?? '',
  scope: 'COMPUTE_FABRIC',
  oversubscription: 1,
  distanceMeters: 10,
  mediaPreference: 'AUTO',
  selectedStorageId: undefined,
  customLeafSku: ARISTA_SWITCHES.find((item) => item.role === 'LEAF')?.sku ?? '',
  customSpineSku: ARISTA_SWITCHES.find((item) => item.role === 'SPINE')?.sku ?? '',
  fabricIntent: 'AI_TRAINING_CLUSTER',
  collectiveTrafficProfile: 'ALLREDUCE_HEAVY',
  railMode: 'SINGLE_PLANE',
  routingPreference: 'EBGP_UNNUMBERED',
  latencyTargetUsec: 1.5,
  maxOversubscriptionTarget: 1.1,
  failureDesignPriority: 'STANDARD',
  losslessProfile: 'ROCEV2_STANDARD',
};
