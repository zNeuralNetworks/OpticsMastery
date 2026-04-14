import type {
  ClusterScaleClass,
  CommunicationPattern,
  EastWestBurstFactor,
  OversubscriptionGuidance,
  PressureLevel,
  TrainingCommunicationAssessment,
  TrainingCommunicationInputs,
} from "@/features/cluster-designer/types";

const pressureOrder: PressureLevel[] = ["low", "moderate", "high", "severe"];

const patternSummaryMap: Record<CommunicationPattern, string> = {
  "ring-all-reduce":
    "Ring all-reduce keeps every participant in the exchange path, so oversubscription and shared-fabric contention tend to show up quickly as the cluster grows.",
  "tree-all-reduce":
    "Tree all-reduce can reduce some scaling pressure relative to a flat ring, but it still drives meaningful east-west demand through the fabric during synchronization phases.",
  hierarchical:
    "Hierarchical communication usually localizes part of the exchange before pushing traffic across the broader fabric, which can help, but only if the topology preserves enough northbound bandwidth.",
  "mixed-unknown":
    "Mixed or unknown collective behavior should be treated conservatively because the fabric still has to tolerate synchronized exchanges even when the exact training stack is not yet pinned down.",
  "nccl-framework-managed":
    "NCCL-managed collectives adapt communication patterns dynamically based on job size and topology hints. The fabric should be sized to tolerate ring-class east-west behavior during peak training windows, since NCCL may select ring-allreduce for large jobs unless SHARP or topology-aware tuning overrides it.",
};

const oversubscriptionGuidanceMap: Record<PressureLevel, OversubscriptionGuidance> = {
  low: ">2:1 acceptable only with caution",
  moderate: "2:1",
  high: "1.5:1",
  severe: "1:1",
};

const architectureNoteMap: Record<PressureLevel, string> = {
  low: "The communication model suggests ordinary enterprise design guardrails are still relevant, but training synchronization should remain visible in the architecture conversation.",
  moderate: "The fabric should stay close to near-nonblocking behavior once synchronized training jobs become routine, even if the estate is still enterprise-sized.",
  high: "Protect spine bandwidth and keep oversubscription disciplined because training communication is likely to make leaf-spine contention visible to job performance.",
  severe: "Treat the fabric like a communication-sensitive training system, not a generic enterprise network: preserve nonblocking behavior where possible and challenge any shared-fabric assumptions aggressively.",
};

const riskNoteMap: Record<PressureLevel, string> = {
  low: "The current training communication posture is unlikely to dominate design risk if the workload remains light and synchronization events are limited.",
  moderate: "Communication pressure can become visible during synchronized training windows, especially if storage and training bursts overlap.",
  high: "The main risk is that collective synchronization and checkpoint movement compete for the same east-west fabric capacity and expose oversubscription quickly.",
  severe: "The main risk is that synchronized training behavior turns oversubscription and shared-fabric contention into a first-order performance issue rather than a background efficiency tradeoff.",
};

export function deriveClusterScaleClass(gpuCount: number): ClusterScaleClass {
  if (gpuCount < 64) {
    return "small";
  }

  if (gpuCount <= 512) {
    return "medium";
  }

  return "large";
}

function levelFromScore(score: number): PressureLevel {
  if (score <= 2) return "low";
  if (score <= 5) return "moderate";
  if (score <= 8) return "high";
  return "severe";
}

function bumpPressure(current: PressureLevel, steps: number): PressureLevel {
  return pressureOrder[Math.min(pressureOrder.length - 1, pressureOrder.indexOf(current) + steps)];
}

function burstFromScore(score: number): EastWestBurstFactor {
  if (score <= 1) return "low";
  if (score <= 3) return "medium";
  if (score <= 5) return "high";
  return "extreme";
}

export function assessTrainingCommunication(inputs: TrainingCommunicationInputs): TrainingCommunicationAssessment {
  let pressureScore = 0;
  let burstScore = 0;
  const primaryDrivers: string[] = [];

  const scaleScore: Record<ClusterScaleClass, number> = { small: 0, medium: 2, large: 4 };
  const patternScore: Record<CommunicationPattern, number> = {
    "ring-all-reduce": 3,
    "tree-all-reduce": 2,
    hierarchical: 2,
    "mixed-unknown": 3,
    "nccl-framework-managed": 3,
  };
  const intensityScore: Record<TrainingCommunicationInputs["trainingCommunicationIntensity"], number> = {
    low: 0,
    medium: 1,
    high: 2,
    extreme: 3,
  };
  const syncScore: Record<TrainingCommunicationInputs["modelSynchronizationSensitivity"], number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  pressureScore += scaleScore[inputs.clusterScaleClass];
  burstScore += Math.max(0, scaleScore[inputs.clusterScaleClass] - 1);
  pressureScore += patternScore[inputs.collectivePattern];
  burstScore += patternScore[inputs.collectivePattern] - 1;
  pressureScore += intensityScore[inputs.trainingCommunicationIntensity];
  burstScore += intensityScore[inputs.trainingCommunicationIntensity];
  pressureScore += syncScore[inputs.modelSynchronizationSensitivity];
  burstScore += syncScore[inputs.modelSynchronizationSensitivity];

  if (inputs.actualOversubscriptionRatio > 1) {
    pressureScore += 1;
    primaryDrivers.push("Oversubscription makes synchronized training exchanges more visible to the fabric.");
  }

  if (inputs.actualOversubscriptionRatio > 2) {
    pressureScore += 2;
    burstScore += 1;
    primaryDrivers.push("Oversubscription above 2:1 increases the chance that collective traffic will compete for shared uplinks.");
  }

  if (inputs.storageNetworkPresent) {
    pressureScore += 1;
    primaryDrivers.push(
      inputs.storageProfileId === "high-priority-roce-parallel-fs"
        ? "Checkpoint behavior still matters, but the storage path is modeled as a separate front-end fabric rather than shared collective capacity."
        : "Storage traffic can overlap with model synchronization and create shared east-west pressure.",
    );
  }

  if (inputs.storageNetworkPresent && inputs.storageType !== "nas-like" && inputs.storageProfileId !== "high-priority-roce-parallel-fs") {
    burstScore += 1;
  }

  if (inputs.eastWestTrafficIntensity === "high") {
    pressureScore += 2;
    burstScore += 2;
    primaryDrivers.push("The base workload already expects high east-west movement before training collectives are added.");
  }

  if (inputs.workloadType === "training" || inputs.workloadType === "hpc") {
    pressureScore += 1;
    primaryDrivers.push("The selected workload profile is already sensitive to synchronized east-west communication.");
  }

  let communicationPressureRating = levelFromScore(pressureScore);

  if (
    inputs.clusterScaleClass === "large" &&
    inputs.trainingCommunicationIntensity !== "low" &&
    inputs.modelSynchronizationSensitivity === "high" &&
    inputs.actualOversubscriptionRatio > 2
  ) {
    communicationPressureRating = "severe";
  }

  if (
    inputs.collectivePattern === "ring-all-reduce" &&
    inputs.clusterScaleClass !== "small" &&
    inputs.actualOversubscriptionRatio > 1
  ) {
    communicationPressureRating = bumpPressure(communicationPressureRating, 1);
  }

  const eastWestBurstFactor = burstFromScore(burstScore);
  const recommendedOversubscriptionCeiling = oversubscriptionGuidanceMap[communicationPressureRating];

  if (inputs.clusterScaleClass !== "small") {
    primaryDrivers.push("As GPU scale increases, collective exchanges touch more of the fabric and reduce tolerance for contention.");
  }

  primaryDrivers.push(patternSummaryMap[inputs.collectivePattern]);

  return {
    communicationPressureRating,
    eastWestBurstFactor,
    recommendedOversubscriptionCeiling,
    patternSummary: patternSummaryMap[inputs.collectivePattern],
    eastWestImpact:
      eastWestBurstFactor === "low"
        ? "Training communication should create limited east-west bursts if the current assumptions hold, but synchronized phases should still be validated."
        : eastWestBurstFactor === "medium"
          ? "Expect noticeable east-west bursts during synchronization phases. The fabric should stay close to near-nonblocking if training becomes routine."
          : eastWestBurstFactor === "high"
            ? "Expect material east-west stress during training synchronization. Leaf-spine uplinks and shared storage paths become more important design constraints."
            : "Expect strong east-west burst behavior that can dominate fabric design decisions. Shared-fabric oversubscription is likely to become visible to training efficiency.",
    architectureNote: architectureNoteMap[communicationPressureRating],
    trainingRiskNote: riskNoteMap[communicationPressureRating],
    architectureImplications: [
      `Recommended oversubscription ceiling from this heuristic view: ${recommendedOversubscriptionCeiling}.`,
      "Protect spine bandwidth because training communication reuses the same east-west paths repeatedly rather than behaving like ordinary north-south enterprise traffic.",
      inputs.storageNetworkPresent
        ? inputs.storageProfileId === "high-priority-roce-parallel-fs"
          ? "Checkpoint and storage behavior stay visible, but the planner keeps them on a dedicated storage fabric instead of mixing them into the back-end collective network."
          : "Checkpoint and storage traffic may compete with gradient synchronization if they share the same fabric paths."
        : "Even without explicit storage on the fabric, collective synchronization still needs predictable leaf-spine capacity.",
      "Cluster growth can raise communication pressure faster than simple server-port growth would suggest because synchronized jobs expand east-west dependency.",
    ],
    primaryDrivers: primaryDrivers.slice(0, 4),
    modelBoundary:
      "Heuristic advisory model only. This section explains training communication pressure for architecture discussion; it does not simulate packets, benchmark jobs, or predict completion time.",
  };
}
