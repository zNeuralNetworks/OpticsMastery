import { GPUPlatform } from '../data/aiSpecs';
import { ARISTA_SWITCHES } from '../data/hardware';
import { PlannerInputs } from '../features/ai-planner/types';
import { AristaSwitch } from '../types';

const parseSpeed = (speed: string) => parseInt(speed.replace(/[^0-9]/g, ''), 10);

const getFanoutCount = (switchSpeed: string, endpointSpeed: string) => {
  const switchRate = parseSpeed(switchSpeed);
  const endpointRate = parseSpeed(endpointSpeed);

  if (!switchRate || !endpointRate || endpointRate > switchRate) {
    return 1;
  }

  return Math.max(1, Math.floor(switchRate / endpointRate));
};

const buildLeafDemandModel = (gpuCount: number, oversubscription: number, leafSwitch: AristaSwitch, gpuPlatform: GPUPlatform) => {
  const nodeCount = Math.ceil(gpuCount / gpuPlatform.defaultGpusPerNode);
  const nicsPerPort = getFanoutCount(leafSwitch.portSpeed, gpuPlatform.computeNicSpeed);
  const downlinksPerLeaf = Math.floor(leafSwitch.totalPorts / (oversubscription + 1));
  const uplinksPerLeaf = leafSwitch.totalPorts - downlinksPerLeaf;
  const nicsPerLeaf = downlinksPerLeaf * nicsPerPort;
  const totalComputeNics = nodeCount * gpuPlatform.computeNicsPerNode;
  const leafCount = Math.ceil(totalComputeNics / nicsPerLeaf);
  const totalUplinks = leafCount * uplinksPerLeaf;

  return {
    leafCount,
    totalUplinks,
  };
};

export const pickPlannerSpineModel = (
  inputs: PlannerInputs,
  leafSwitch: AristaSwitch,
  gpuPlatform: GPUPlatform,
  minimumSpineSku: string,
): AristaSwitch => {
  const spineCandidates = ARISTA_SWITCHES
    .filter((item) => item.role === 'SPINE')
    .sort((a, b) => a.totalPorts - b.totalPorts);

  const minimumIndex = Math.max(
    0,
    spineCandidates.findIndex((item) => item.sku === minimumSpineSku),
  );
  const allowedCandidates = spineCandidates.slice(minimumIndex);
  const futureGpuTarget = Math.max(inputs.gpuCount, inputs.targetGpuCount ?? inputs.gpuCount);
  const demand = buildLeafDemandModel(futureGpuTarget, inputs.oversubscription, leafSwitch, gpuPlatform);

  const targetMaxSpines =
    demand.leafCount > 40 ? 2 :
    demand.leafCount > 20 || inputs.maxOversubscriptionTarget <= 1.1 ? 3 :
    4;

  const preferred = allowedCandidates.find((candidate) => {
    const estimatedSpines = Math.ceil(demand.totalUplinks / candidate.totalPorts);
    return estimatedSpines <= targetMaxSpines;
  });

  return preferred ?? allowedCandidates[allowedCandidates.length - 1] ?? spineCandidates[0];
};
