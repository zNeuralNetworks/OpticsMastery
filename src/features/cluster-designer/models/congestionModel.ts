import type {
  CongestionRiskAssessment,
  NormalizedDesignInputs,
  CapacityModelResult,
  TrainingCommunicationAssessment,
} from "@/features/cluster-designer/types";

function hasHighCollectiveLikelihood(inputs: NormalizedDesignInputs) {
  return (
    inputs.workloadType === "training" ||
    inputs.workloadType === "hpc" ||
    inputs.eastWestTrafficIntensity === "high"
  );
}

export function assessCongestionRisk(
  inputs: NormalizedDesignInputs,
  capacity: CapacityModelResult,
  trainingCommunication: TrainingCommunicationAssessment,
): CongestionRiskAssessment {
  let score = 0;
  const primaryDrivers: string[] = [];

  if (capacity.actualOversubscriptionRatio <= 1.2) {
    score += 0;
  } else if (capacity.actualOversubscriptionRatio <= 2) {
    score += 1;
    primaryDrivers.push("Modeled oversubscription is above a near-nonblocking posture.");
  } else if (capacity.actualOversubscriptionRatio <= 3) {
    score += 2;
    primaryDrivers.push("Higher oversubscription increases the chance of shared-fabric contention.");
  } else {
    score += 3;
    primaryDrivers.push("Aggressive oversubscription leaves limited room for collective traffic bursts.");
  }

  if (inputs.eastWestTrafficIntensity === "medium") {
    score += 1;
    primaryDrivers.push("Moderate east-west traffic adds pressure to the leaf-spine uplink pool.");
  }

  if (inputs.eastWestTrafficIntensity === "high") {
    score += 2;
    primaryDrivers.push("High east-west traffic raises the likelihood of congestion around collective operations.");
  }

  if (inputs.storageNetworkPresent) {
    if (capacity.storageFabric.dedicated) {
      primaryDrivers.push("Storage is isolated on a dedicated front-end fabric, which reduces shared-path contention with GPU collective traffic.");
    } else {
      score += 1;
      primaryDrivers.push("Storage traffic shares fabric capacity with GPU communication.");
    }
  }

  if (inputs.storageNetworkPresent && inputs.storageType === "roce") {
    score += 1;
    primaryDrivers.push(
      capacity.storageFabric.dedicated
        ? "Dedicated RoCE storage still requires tighter congestion and queueing discipline on the storage fabric."
        : "RoCE-based storage requires tighter congestion and queueing discipline.",
    );
  }

  if (inputs.storageNetworkPresent && inputs.storageType === "ethernet") {
    primaryDrivers.push("Shared Ethernet storage can create checkpoint bursts that compete with GPU traffic.");
  }

  if (capacity.storageFabric.dedicated && capacity.storageFabric.checkpointBurstProfile === "high") {
    score += 1;
    primaryDrivers.push("High checkpoint bursts still make the dedicated storage fabric sensitive to queueing and throughput validation.");
  }

  if (inputs.nicSpeedGb === 100 && inputs.gpuCount >= 128) {
    score += 1;
    primaryDrivers.push("100G host attachment may become a limiting factor for larger GPU estates.");
  }

  if (inputs.nicPortsPerServer >= 4) {
    score += 1;
    primaryDrivers.push("Higher NIC port count per server drives more host-facing demand into each leaf.");
  }

  if (hasHighCollectiveLikelihood(inputs)) {
    score += 1;
    primaryDrivers.push("The workload profile implies higher likelihood of GPU collective traffic.");
  }

  if (trainingCommunication.communicationPressureRating === "moderate") {
    score += 1;
    primaryDrivers.push("The training communication model expects noticeable synchronization pressure on east-west paths.");
  }

  if (trainingCommunication.communicationPressureRating === "high") {
    score += 2;
    primaryDrivers.push("The training communication model expects collective traffic to make shared uplinks more visible.");
  }

  if (trainingCommunication.communicationPressureRating === "severe") {
    score += 3;
    primaryDrivers.push("The training communication model expects synchronization behavior to dominate fabric efficiency risk.");
  }

  if (trainingCommunication.eastWestBurstFactor === "high") {
    score += 1;
  }

  if (trainingCommunication.eastWestBurstFactor === "extreme") {
    score += 2;
  }

  if (inputs.gpuCount >= 256 && inputs.eastWestTrafficIntensity === "high") {
    score += 2;
    primaryDrivers.push("Larger GPU clusters amplify congestion risk when east-west traffic is already high.");
  }

  const level =
    score <= 2
      ? "low"
      : score <= 5
        ? "moderate"
        : score <= 8
          ? "high"
          : "severe";

  const summaryMap: Record<CongestionRiskAssessment["level"], string> = {
    low: "The modeled fabric should handle the current traffic posture without major congestion pressure if assumptions hold.",
    moderate: "Congestion is plausible under bursty or synchronized traffic, but the design is still directionally workable for enterprise deployment.",
    high: "The design is likely to experience material congestion during collective-heavy or checkpoint-heavy periods unless the fabric posture is improved.",
    severe: "The modeled fabric is at meaningful risk of congestion-driven inefficiency and should be reconsidered before being presented as a stable direction.",
  };

  const mitigationMap: Record<CongestionRiskAssessment["level"], string> = {
    low: "Validate telemetry and queue-policy behavior, but no major mitigation is implied by the current model.",
    moderate: capacity.storageFabric.dedicated
      ? "Validate the dedicated storage-fabric throughput and queueing posture before changing the GPU collective design. The main mitigation may live on the storage side rather than on the collective fabric."
      : "Consider reducing oversubscription or increasing spine bandwidth if collective GPU traffic or checkpoint bursts become more dominant than expected.",
    high: capacity.storageFabric.dedicated
      ? "Reduce oversubscription on the collective fabric if needed, but also validate storage-fabric buffering, queueing, and checkpoint concurrency before treating the design as a preferred production direction."
      : "Reduce oversubscription, add more spine bandwidth, or move to higher-radix leaf options before treating the design as a preferred production direction.",
    severe: capacity.storageFabric.dedicated
      ? "Rework both fabrics: lower collective oversubscription where needed and validate the dedicated storage-fabric queue-policy and throughput posture before proceeding."
      : "Rework the fabric assumptions: lower oversubscription, increase bandwidth per host, and validate storage traffic separation or queue-policy design before proceeding.",
  };

  return {
    level,
    summary: summaryMap[level],
    primaryDrivers: primaryDrivers.slice(0, 4),
    recommendedMitigation: mitigationMap[level],
  };
}
