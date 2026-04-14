import type {
  CongestionRiskAssessment,
  DesignConfidenceAssessment,
  NormalizedDesignInputs,
  CapacityModelResult,
  TrainingCommunicationAssessment,
} from "@/features/cluster-designer/types";

export function assessDesignConfidence(
  inputs: NormalizedDesignInputs,
  capacity: CapacityModelResult,
  congestionRisk: CongestionRiskAssessment,
  trainingCommunication: TrainingCommunicationAssessment,
): DesignConfidenceAssessment {
  let penalty = 0;
  const reasons: string[] = [];
  let heuristicWeight = 0;

  if (capacity.actualOversubscriptionRatio > 2) {
    penalty += 1;
    reasons.push("Higher oversubscription makes the model more sensitive to unknown application burst behavior.");
  }

  if (inputs.storageNetworkPresent && inputs.storageType === "nas-like") {
    penalty += 1;
    heuristicWeight += 1;
    reasons.push("Storage behavior is abstracted, so storage interaction is more assumption-driven than endpoint-driven.");
  }

  if (capacity.storageFabric.dedicated) {
    heuristicWeight += 1;
    reasons.push("The dedicated storage fabric is modeled explicitly, but checkpoint posture and RoCE queueing still need follow-on validation.");
  }

  if (inputs.eastWestTrafficIntensity === "high") {
    penalty += 1;
    reasons.push("High east-west intensity makes the recommendation more sensitive to queueing and contention assumptions.");
  }

  if (inputs.nicSpeedGb === 100 && inputs.gpuCount >= 128) {
    penalty += 1;
    reasons.push("100G host attachment is directionally light for the size of the modeled GPU estate.");
  }

  if (trainingCommunication.communicationPressureRating === "high") {
    penalty += 1;
    heuristicWeight += 1;
    reasons.push("Training communication pressure is high enough that the design depends more heavily on heuristic traffic assumptions.");
  }

  if (trainingCommunication.communicationPressureRating === "severe") {
    penalty += 2;
    heuristicWeight += 1;
    reasons.push("Severe communication pressure means small workload changes could move the design materially.");
  }

  if (inputs.workloadType === "training" || inputs.workloadType === "hpc") {
    heuristicWeight += 1;
  }

  if (congestionRisk.level === "high") {
    penalty += 1;
  }

  if (congestionRisk.level === "severe") {
    penalty += 2;
  }

  const level = penalty <= 1 ? "high" : penalty <= 3 ? "medium" : "low";
  const basis =
    heuristicWeight <= 1
      ? "mostly-input-driven"
      : heuristicWeight <= 3
        ? "mixed-inputs-and-heuristics"
        : "heuristic-heavy";

  const summaryMap = {
    high: "Model confidence is relatively high because the result is supported by consistent inputs and a conservative-enough fabric posture for early design discussion.",
    medium: "Model confidence is moderate because the result still depends on workload, storage, or communication assumptions that should be validated with the customer.",
    low: "Model confidence is low because the current recommendation depends heavily on heuristic assumptions or aggressive traffic posture, not because the design is automatically wrong.",
  } as const;

  return {
    level,
    summary: summaryMap[level],
    reasons: reasons.slice(0, 4),
    basis,
  };
}
