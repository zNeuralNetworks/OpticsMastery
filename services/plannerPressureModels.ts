import { PlannerCongestionAssessment, PlannerTrainingCommunicationAssessment } from '../features/ai-planner/types';
import { PlannerModel } from '../features/ai-planner/types';

type PlannerBaseModel = Omit<PlannerModel, 'view'>;

const levelToCeiling = {
  low: '>2:1 acceptable only with caution',
  moderate: '2:1',
  high: '1.5:1',
  severe: '1:1',
} as const;

export const assessTrainingCommunication = (model: PlannerBaseModel): PlannerTrainingCommunicationAssessment => {
  let pressureScore = 0;
  let burstScore = 0;

  if (model.inputs.gpuCount >= 1024) {
    pressureScore += 3;
    burstScore += 2;
  } else if (model.inputs.gpuCount >= 256) {
    pressureScore += 2;
    burstScore += 1;
  } else if (model.inputs.gpuCount >= 64) {
    pressureScore += 1;
  }

  if (model.inputs.oversubscription > 1) {
    pressureScore += 1;
    burstScore += 1;
  }

  if (model.inputs.oversubscription >= 4) {
    pressureScore += 2;
    burstScore += 1;
  }

  if (model.gpuPlatform.recommendedRailCount > 1) {
    pressureScore += 1;
    burstScore += 1;
  }

  if (model.currentResult.storageFabric) {
    pressureScore += 1;
    burstScore += 1;
  }

  if (model.gpuPlatform.computeNicSpeed === '800G') {
    pressureScore += 1;
  }

  const communicationPressure =
    pressureScore <= 1
      ? 'low'
      : pressureScore <= 3
        ? 'moderate'
        : pressureScore <= 6
          ? 'high'
          : 'severe';

  const eastWestBurstFactor =
    burstScore <= 0
      ? 'low'
      : burstScore <= 2
        ? 'medium'
        : burstScore <= 4
          ? 'high'
          : 'extreme';

  const topologyHint = model.gpuPlatform.recommendedRailCount > 1
    ? 'The platform already points toward rail-aware design, so synchronized traffic is more visible to the topology choice.'
    : 'The platform fits a simpler scale-out leaf-spine posture, but synchronized exchanges still become visible as the estate grows.';

  return {
    communicationPressure,
    eastWestBurstFactor,
    recommendedOversubscriptionCeiling: levelToCeiling[communicationPressure],
    patternSummary:
      model.inputs.gpuCount >= 256
        ? 'At this cluster scale, collective synchronization behaves more like repeated east-west pressure than ordinary enterprise burst traffic.'
        : 'The current cluster size keeps collective behavior more manageable, but oversubscription still affects how visible synchronized traffic becomes.',
    architectureNote: topologyHint,
    trainingRiskNote:
      communicationPressure === 'high' || communicationPressure === 'severe'
        ? 'Collective traffic can dominate design quality quickly once oversubscription and shared storage behavior stack together.'
        : 'Training sensitivity is present, but it does not yet dominate the entire architecture discussion if the current assumptions hold.',
    architectureImplications: [
      `Directional oversubscription ceiling: ${levelToCeiling[communicationPressure]}.`,
      'Protect spine bandwidth because AI fabrics repeatedly reuse the same east-west paths during synchronized phases.',
      model.currentResult.storageFabric
        ? 'Keep storage traffic visible as a separate pressure source during checkpoint or ingest windows.'
        : 'Even compute-only mode should not be mistaken for zero east-west sensitivity.',
    ],
  };
};

export const assessCongestion = (
  model: PlannerBaseModel,
  trainingCommunication: PlannerTrainingCommunicationAssessment,
): PlannerCongestionAssessment => {
  let score = 0;
  const primaryDrivers: string[] = [];

  if (model.inputs.oversubscription === 1) {
    primaryDrivers.push('Near-nonblocking posture reduces oversubscription pressure.');
  } else if (model.inputs.oversubscription === 2) {
    score += 1;
    primaryDrivers.push('Modeled oversubscription is above a near-nonblocking posture.');
  } else {
    score += 3;
    primaryDrivers.push('Aggressive oversubscription increases the chance of shared-fabric contention.');
  }

  if (trainingCommunication.communicationPressure === 'moderate') {
    score += 1;
    primaryDrivers.push('Collective behavior is likely to create noticeable east-west bursts.');
  } else if (trainingCommunication.communicationPressure === 'high') {
    score += 2;
    primaryDrivers.push('Collective synchronization is likely to make shared uplinks visible to job efficiency.');
  } else if (trainingCommunication.communicationPressure === 'severe') {
    score += 3;
    primaryDrivers.push('Synchronization behavior is severe enough to dominate fabric efficiency risk.');
  }

  if (model.currentResult.storageFabric) {
    score += 1;
    primaryDrivers.push('Storage traffic introduces a second pressure domain that still needs queueing and throughput validation.');
  }

  if (model.currentResult.rackPlanning.powerPerRackKw > 30) {
    primaryDrivers.push('Dense rack packing raises the cost of fixing cabling or topology mistakes later.');
  }

  if (model.inputs.gpuCount >= 1024) {
    score += 1;
    primaryDrivers.push('Large GPU estate magnifies contention when collective traffic is already synchronized.');
  }

  const level =
    score <= 1
      ? 'low'
      : score <= 3
        ? 'moderate'
        : score <= 5
          ? 'high'
          : 'severe';

  const summaryMap: Record<PlannerCongestionAssessment['level'], string> = {
    low: 'The modeled fabric should handle the current traffic posture without major congestion pressure if the planning assumptions hold.',
    moderate: 'Congestion is plausible during synchronized bursts or storage-heavy windows, but the design is still directionally workable.',
    high: 'The current design is likely to experience visible congestion during collective-heavy or checkpoint-heavy periods unless the posture is tightened.',
    severe: 'The current fabric posture is at material risk of congestion-driven inefficiency and should be reconsidered before being treated as the preferred direction.',
  };

  const mitigationMap: Record<PlannerCongestionAssessment['level'], string> = {
    low: 'Validate with telemetry, but no major mitigation is implied by the current architecture posture.',
    moderate: 'Confirm storage behavior, validate optics and queueing assumptions, and consider lowering oversubscription if the customer expects training-heavy usage.',
    high: 'Reduce oversubscription, protect spine bandwidth, or make storage behavior more explicit before presenting this as a preferred production direction.',
    severe: 'Rework the fabric posture before proceeding: lower oversubscription, isolate pressure domains more clearly, and validate the operations model for the scaled estate.',
  };

  return {
    level,
    summary: summaryMap[level],
    primaryDrivers: primaryDrivers.slice(0, 4),
    recommendedMitigation: mitigationMap[level],
  };
};
