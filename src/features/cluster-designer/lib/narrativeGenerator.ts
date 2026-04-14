import type {
  CongestionRiskAssessment,
  DesignInputs,
  DerivedCapacity,
  StructuredNarrative,
  TopologyRecommendation,
  TrainingCommunicationAssessment,
} from "@/features/cluster-designer/types";

export function generateStructuredNarrative(
  inputs: DesignInputs,
  capacity: DerivedCapacity,
  topology: TopologyRecommendation,
  congestionRisk: CongestionRiskAssessment,
  trainingCommunication: TrainingCommunicationAssessment,
): StructuredNarrative {
  const workloadFit: Record<DesignInputs["workloadType"], string> = {
    training:
      "Training workloads usually need a more disciplined fabric because collective communication and checkpoint phases can expose oversubscription quickly.",
    inference:
      "Inference environments often tolerate more contention than training, but shared serving and data reload behavior can still create burst pressure on the fabric.",
    mixed:
      "Mixed environments need a compromise posture because training windows want cleaner east-west behavior while inference and analytics favor operational flexibility.",
    hpc:
      "HPC-style traffic usually rewards lower contention, cleaner failure domains, and stronger congestion visibility across the fabric.",
  };

  const researchContext: Record<DesignInputs["researchWorkloadProfile"], string> = {
    genomics:
      "The genomics profile assumes storage movement and staged pipeline behavior matter as much as pure GPU collective efficiency.",
    imaging:
      "The imaging profile assumes large dataset movement and preprocessing can put real pressure on the same fabric that serves the GPUs.",
    "drug-discovery":
      "The drug discovery profile assumes model training and checkpoint behavior are important enough to keep oversubscription and congestion visibility in focus.",
    "multimodal-research":
      "The multi-modal profile assumes multiple data domains share the fabric, which raises the value of visibility and repeatable operational control.",
    "clinical-inference":
      "The clinical inference profile assumes the customer cares about a stable operational model and predictable serving behavior more than maximizing theoretical fabric utilization.",
    simulation:
      "The simulation profile assumes east-west efficiency and congestion observability matter because parallel jobs often expose small fabric inefficiencies quickly.",
    "large-inference":
      "The large-scale inference profile assumes KV cache bandwidth and model weight distribution are the primary fabric demand drivers, with burst pressure during concurrent model reloads or token generation scaling events.",
  };

  const architectureSummary = `This design recommends a ${topology.switchingTiers}-tier Ethernet leaf-spine fabric sized for approximately ${capacity.totalRequiredHostFacingBandwidthTbps.toFixed(1)} Tbps of host-facing bandwidth. The modeled oversubscription ratio is ${capacity.actualOversubscriptionRatio.toFixed(2)}:1 after applying the selected ${capacity.growthBufferPercent}% growth buffer.`;

  const designTradeoffs = [
    `The selected oversubscription posture is intended to balance fabric efficiency against the ${inputs.workloadType} workload profile and ${inputs.eastWestTrafficIntensity} east-west traffic expectation. ${workloadFit[inputs.workloadType]}`,
    capacity.storageFabric.dedicated
      ? `Storage is modeled as a dedicated ${capacity.storageFabric.storagePortSpeedGb}G RoCE storage fabric with ${capacity.storageFabric.storageLeafCountEstimate} leafs and ${capacity.storageFabric.storageSpineCountEstimate} spines, so checkpoint and dataset movement stay visible without being collapsed into the GPU collective network.`
      : inputs.storageNetworkPresent
        ? `Storage traffic is included in the model as a ${inputs.storageType} interaction, which means storage behavior can materially affect shared-fabric performance during checkpoints or dataset movement.`
        : "Storage traffic is not explicitly modeled, so storage-related contention remains a validation item rather than a resolved design detail.",
    `The current congestion outlook is ${congestionRisk.level}, and the training communication model rates collective pressure as ${trainingCommunication.communicationPressureRating}. That means the customer should understand how scale, traffic synchronization, and operational simplicity were traded against each other in the recommendation. ${researchContext[inputs.researchWorkloadProfile]}`,
  ];

  const operationalConsiderations = [
    "Plan for staged cluster growth so additional servers can be added without forcing an immediate fabric redesign or disruptive cabling change.",
    `Validate optics and cabling reach against actual rack placement and row spacing before treating the fabric recommendation as implementation-ready. Passive DAC should stay intra-rack only, while the modeled ${inputs.representativeInterRackDistanceMeters} meter inter-rack paths should assume AOC or pluggable optics.`,
    "Confirm telemetry, congestion visibility, and automation readiness early. Arista EOS includes LANZ (Latency ANalyzer) for per-port queue depth monitoring without additional hardware, and CloudVision delivers topology-aware streaming telemetry for day-2 operations — both are relevant to AI fabric validation before production cutover.",
    capacity.storageFabric.dedicated
      ? "Treat dedicated storage-fabric queueing, checkpoint bursts, and RDMA behavior as follow-on engineering validation items. EOS port profiles for RoCEv2 traffic — ECN marking thresholds, PFC domains, and DCQCN parameters — should be explicit validation items rather than assumed defaults."
      : "Decide early whether storage and GPU traffic will share the same operational fabric so queueing policy, change control, and troubleshooting ownership stay clear. Shared-fabric RoCEv2 designs require EOS ECN and PFC configuration as a validation step, not a post-deployment cleanup.",
    `Use the training communication model as a conversation aid: it explains why the current design biases toward an oversubscription ceiling of ${trainingCommunication.recommendedOversubscriptionCeiling}, but it is not a packet or job-performance simulator.`,
  ];

  return {
    architectureSummary,
    designTradeoffs,
    operationalConsiderations,
  };
}
