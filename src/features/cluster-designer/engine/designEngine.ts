import { designBoundary, opticsAssumptionCopy } from "@/features/cluster-designer/data/fabricProfiles";
import { storageProfileFor } from "@/features/cluster-designer/data/storageProfiles";
import { generateDiscoveryQuestions } from "@/features/cluster-designer/lib/discoveryGenerator";
import { generateStructuredNarrative } from "@/features/cluster-designer/lib/narrativeGenerator";
import { assessCongestionRisk } from "@/features/cluster-designer/models/congestionModel";
import {
  buildHardwareBom,
  buildLeafSelectionRationale,
  buildSpineSelectionRationale,
  deriveCapacityModel,
  deriveTierCount,
  minimumSpineCount,
  pickLeafPlatform,
  pickSpinePlatform,
} from "@/features/cluster-designer/models/capacityModel";
import { assessDesignConfidence } from "@/features/cluster-designer/models/confidenceModel";
import { deriveTopologyModel } from "@/features/cluster-designer/models/topologyModel";
import {
  assessTrainingCommunication,
  deriveClusterScaleClass,
} from "@/features/cluster-designer/models/trainingCommunicationModel";
import type {
  DesignAssumption,
  DesignEngineResult,
  DesignInputs,
  DesignNote,
  DesignRisk,
  NormalizedDesignInputs,
  PortConsumption,
} from "@/features/cluster-designer/types";

function buildHostAttachmentMediaReasoning(inputs: NormalizedDesignInputs) {
  if (inputs.opticsPreference === "dac") {
    return "Assume passive DAC only for intra-rack links up to roughly 2 meters. Any host attachment that leaves the rack should move to AOC or pluggable optics.";
  }

  if (inputs.opticsPreference === "aoc") {
    return "Prefer AOC for short inter-rack runs and cleaner handling, while passive DAC remains acceptable for very short intra-rack attachment where serviceability permits.";
  }

  if (inputs.opticsPreference === "sr") {
    return "Prefer structured multimode optics for short inter-rack or row-adjacent runs, while very short intra-rack links can still stay on DAC if the final rack plan supports it.";
  }

  if (inputs.opticsPreference === "dr") {
    return "Prefer single-mode optics where patching flexibility or future row changes matter more than minimizing optic cost on short runs.";
  }

  return "Assume passive DAC for intra-rack links up to roughly 2 meters, then move to AOC or pluggable optics for inter-rack host attachment.";
}

function buildBreakoutReasoning(inputs: NormalizedDesignInputs, spinePortSpeedGb: number) {
  if (inputs.nicSpeedGb === spinePortSpeedGb) {
    return "No explicit breakout is assumed in the base recommendation because host-facing and fabric-facing speeds stay in the same native class. Validate breakout only if the final platform or port-mode decision forces speed conversion.";
  }

  return `Breakout should stay a validation item. The current model spans ${inputs.nicSpeedGb}G host-facing and ${spinePortSpeedGb}G fabric-facing links, so final platform and port-mode review must confirm whether breakout cables or breakout optics are required.`;
}

function normalizeDesignInputs(inputs: DesignInputs): NormalizedDesignInputs {
  return {
    ...inputs,
    derivedClusterScaleClass: deriveClusterScaleClass(inputs.gpuCount),
    clusterScaleClass: inputs.clusterScaleClass || deriveClusterScaleClass(inputs.gpuCount),
    designBoundary,
  };
}

function buildOpticsAssumptions(inputs: NormalizedDesignInputs, spinePortSpeedGb: number): DesignAssumption[] {
  return [
    {
      label: "Model boundary",
      value: designBoundary,
    },
    {
      label: "Intra-rack host attachment",
      value: `${inputs.nicSpeedGb}G host attachment assumes passive DAC is acceptable for intra-rack links up to roughly 2 meters.`,
    },
    {
      label: "Inter-rack media posture",
      value: `Representative inter-rack distance is ${inputs.representativeInterRackDistanceMeters} meters, so the planner assumes AOC or transceiver-based optics for inter-rack links rather than passive copper.`,
    },
    {
      label: "Media preference reasoning",
      value: `${inputs.nicSpeedGb}G ${opticsAssumptionCopy[inputs.opticsPreference]} ${buildHostAttachmentMediaReasoning(inputs)}`,
    },
    {
      label: "Breakout consideration",
      value: buildBreakoutReasoning(inputs, spinePortSpeedGb),
    },
    {
      label: "Fabric optics",
      value: `${spinePortSpeedGb}G inter-rack fabric optics remain assumption-driven until rack placement, row spacing, breakout policy, and platform-specific transceiver validation are reviewed.`,
    },
  ];
}

function buildStorageAssumptions(
  inputs: NormalizedDesignInputs,
  storageFabric: DesignEngineResult["derivedCapacity"]["storageFabric"],
): DesignAssumption[] {
  const profile = storageProfileFor(inputs.storageProfileId);

  if (!storageFabric.enabled) {
    return profile.assumptions;
  }

  const assumptions = [...profile.assumptions];

  assumptions.push(
    {
      label: "Modeled storage fabric scale",
      value: `${storageFabric.computeNodeCount} compute nodes, ${storageFabric.storageServerCount} storage nodes, ${storageFabric.storageLeafCountEstimate} storage leafs, and ${storageFabric.storageSpineCountEstimate} storage spines at ${storageFabric.storagePortSpeedGb}G.`,
    },
    {
      label: "Storage-facing port demand",
      value: `${storageFabric.computeFacingPortRequirement} compute-facing ports plus ${storageFabric.storageFacingPortRequirement} storage-node ports are carried into the storage-fabric estimate.`,
    },
  );

  if (storageFabric.checkpointBurstProfile) {
    assumptions.push({
      label: "Checkpoint burst posture",
      value: `${storageFabric.checkpointBurstProfile} checkpoint-burst posture is still assumption-driven and should be validated against actual checkpoint interval and checkpoint size.`,
    });
  }

  if (profile.id === "high-priority-roce-parallel-fs" && storageFabric.computeNodeCount !== 256) {
    assumptions.push({
      label: "Profile divergence",
      value: `The attached storage profile was sourced around 256 compute nodes. The planner scales directionally for ${storageFabric.computeNodeCount} nodes, so validate that the dedicated 400G/node storage posture still holds for the target estate.`,
    });
  }

  return assumptions;
}

function buildArchitectureNotes(result: Pick<DesignEngineResult, "inputs" | "derivedCapacity" | "trainingCommunication">): DesignNote[] {
  const notes: DesignNote[] = [
    {
      title: "Early-stage design posture",
      body: designBoundary,
      emphasis: "warning",
    },
    {
      title: "Why Arista Ethernet leaf-spine here",
      body: "The recommendation assumes a standards-based Arista Ethernet leaf-spine fabric because it delivers ECMP-based per-packet load distribution, built-in EOS telemetry including LANZ latency monitoring, and CloudVision for day-2 automation — all within the same enterprise change control workflow rather than requiring a specialist fabric overlay.",
      emphasis: "positive",
    },
    {
      title: "Visibility and operations",
      body: "This design posture assumes the customer values built-in telemetry, congestion observability, and automation as part of the fabric architecture. Arista EOS provides LANZ for per-port queue depth monitoring, streaming telemetry via TerminAttr, and CloudVision for topology-aware day-2 operations — all relevant to AI fabric validation before production cutover.",
      emphasis: "positive",
    },
    {
      title: "Training communication model",
      body: `The heuristic training communication model rates collective pressure as ${result.trainingCommunication.communicationPressureRating} with an east-west burst factor of ${result.trainingCommunication.eastWestBurstFactor}. Use that to explain why training traffic can reshape oversubscription decisions even when simple host bandwidth math looks reasonable.`,
      emphasis:
        result.trainingCommunication.communicationPressureRating === "high" ||
        result.trainingCommunication.communicationPressureRating === "severe"
          ? "warning"
          : "neutral",
    },
  ];

  if (result.inputs.storageNetworkPresent) {
    if (result.derivedCapacity.storageFabric.dedicated) {
      notes.push(
        {
          title: "Dedicated storage fabric",
          body: `Storage is modeled as a separate ${result.derivedCapacity.storageFabric.storagePortSpeedGb}G RoCE front-end fabric with ${result.derivedCapacity.storageFabric.storageLeafCountEstimate} storage leafs and ${result.derivedCapacity.storageFabric.storageSpineCountEstimate} storage spines. That keeps checkpoint and dataset movement visible without claiming final validated queue-policy or hardware implementation.`,
        },
        {
          title: "RoCE storage discipline",
          body: "The dedicated storage profile assumes RoCEv2 queueing discipline remains part of follow-on engineering work. Treat ECN, PFC, and DCQCN as validation items rather than as already-solved policy.",
          emphasis: "warning",
        },
      );
    } else {
      notes.push({
        title: "Storage interaction",
        body: `Storage is represented as ${result.inputs.storageType} and translated into additional leaf-facing demand using assumptions rather than exact endpoint inventory. Review checkpoint behavior, burst concurrency, and how storage and GPU traffic share the fabric before treating this as a committed design.`,
      });
    }
  }

  if (result.inputs.redundancyPreference === "high") {
    notes.push({
      title: "Leaf redundancy and MLAG",
      body: "High redundancy posture assumes MLAG-capable leaf pairs for dual-homed server attachment. Validate MLAG domain sizing and inter-chassis link (ICL) bandwidth against the expected east-west traffic profile before treating spine count as the only redundancy variable.",
      emphasis: "neutral",
    });
  }

  notes.push({
    title: "Cabling posture",
    body: `Assume passive DAC only for intra-rack links up to roughly 2 meters. With a representative inter-rack distance of ${result.inputs.representativeInterRackDistanceMeters} meters, the model expects AOC or pluggable optics for inter-rack attachment and fabric links, with breakout held as a validation item instead of an implied design decision.`,
  });

  const { facilityEnvelope } = result.derivedCapacity;
  notes.push({
    title: "Rack and power envelope",
    body: `Facility fit is modeled against ${facilityEnvelope.allocatedRackCount} allocated racks at ${facilityEnvelope.rackUnitsPerRack}U and ${facilityEnvelope.powerCapacityKwPerRack} kW per rack. With ${facilityEnvelope.computeNodeRackUnits}U and ${facilityEnvelope.computeNodePowerKw} kW per compute node, the current estate needs ${facilityEnvelope.requiredRacks} racks and ${facilityEnvelope.totalComputePowerKw} kW of compute power, so rack and power headroom stay part of the architecture conversation instead of being deferred.`,
    emphasis: facilityEnvelope.fitStatus === "fits" ? "neutral" : "warning",
  });

  return notes;
}

function buildRisks(result: Pick<DesignEngineResult, "inputs" | "derivedCapacity" | "trainingCommunication">): DesignRisk[] {
  const { inputs, derivedCapacity, trainingCommunication } = result;
  const risks: DesignRisk[] = [];
  const impliedGpuCount = inputs.gpuServerCount * inputs.gpusPerServer;

  if (impliedGpuCount !== inputs.gpuCount) {
    risks.push({
      title: "GPU inventory mismatch",
      body: `GPU count (${inputs.gpuCount}) does not match servers x GPUs per server (${impliedGpuCount}). The model still produces a directional result, but this should be reconciled before sharing the design externally.`,
      severity: "medium",
    });
  }

  if (inputs.targetOversubscription === 3 && (inputs.workloadType === "training" || inputs.workloadType === "hpc")) {
    risks.push({
      title: "Aggressive oversubscription for training-class traffic",
      body: "A 3:1 target is generally unrealistic for collective-heavy training or HPC-style east-west communication unless the workload is known to tolerate contention.",
      severity: "high",
    });
  }

  if (
    trainingCommunication.communicationPressureRating === "severe" &&
    inputs.targetOversubscription === 3
  ) {
    risks.push({
      title: "Communication posture conflicts with target oversubscription",
      body: "The communication model expects severe collective pressure, so the current oversubscription target should be treated as a design risk rather than a neutral preference.",
      severity: "high",
    });
  }

  if (
    (trainingCommunication.communicationPressureRating === "high" ||
      trainingCommunication.communicationPressureRating === "severe") &&
    inputs.storageNetworkPresent &&
    !derivedCapacity.storageFabric.dedicated
  ) {
    risks.push({
      title: "Storage and training may share the same bottleneck",
      body: "The current inputs suggest training synchronization and storage behavior could compete for the same fabric paths. Validate checkpoint timing, queueing policy, and whether storage should stay on the shared fabric.",
      severity: "medium",
    });
  }

  if (derivedCapacity.storageFabric.dedicated && derivedCapacity.storageFabric.computeNodeCount !== 256) {
    risks.push({
      title: "Dedicated storage profile is being scaled away from its reference size",
      body: `The high-priority storage profile was sourced around 256 compute nodes, but the current model carries ${derivedCapacity.storageFabric.computeNodeCount}. Treat storage leaf/spine counts as directional until the dedicated 400G/node storage posture is validated for the target estate.`,
      severity: "medium",
    });
  }

  if (
    derivedCapacity.storageFabric.dedicated &&
    derivedCapacity.storageFabric.checkpointBurstProfile === "high" &&
    (trainingCommunication.communicationPressureRating === "high" ||
      trainingCommunication.communicationPressureRating === "severe")
  ) {
    risks.push({
      title: "Checkpoint bursts still need storage-fabric validation",
      body: "The design isolates storage away from the GPU collective fabric, but high checkpoint bursts can still drive queueing sensitivity on the dedicated storage network. Validate burst concurrency, RDMA behavior, and storage-system throughput against the architecture assumptions.",
      severity: "medium",
    });
  }

  if (inputs.opticsPreference === "dac" && inputs.representativeInterRackDistanceMeters > 2) {
    risks.push({
      title: "Passive copper preference conflicts with inter-rack reach",
      body: `The current physical assumption uses a ${inputs.representativeInterRackDistanceMeters} meter inter-rack run, so passive DAC should not be treated as the inter-rack default. Shift inter-rack links to AOC or pluggable optics before presenting this as a physically credible cabling posture.`,
      severity: "medium",
    });
  }

  if (derivedCapacity.estimatedDownlinkCapacityPerLeaf < 8) {
    risks.push({
      title: "Leaf downlink budget is tight",
      body: "The current assumptions leave little downlink capacity per leaf after uplinks are reserved. This usually means the fabric should move to higher-radix hardware or lower oversubscription.",
      severity: "high",
    });
  }

  const { facilityEnvelope } = derivedCapacity;

  if (facilityEnvelope.requiredRacks > facilityEnvelope.allocatedRackCount) {
    risks.push({
      title: "Allocated rack envelope is too small for the current node count",
      body: `The current hall envelope allocates ${facilityEnvelope.allocatedRackCount} racks, but the compute footprint needs ${facilityEnvelope.requiredRacks} racks once physical, thermal, and per-rack power limits are applied. At ${facilityEnvelope.computeNodeRackUnits}U per node and a recommended cap of ${facilityEnvelope.recommendedNodeCapPerRack} nodes per rack, this should be treated as a hard facility constraint.`,
      severity: "high",
    });
  }

  if (facilityEnvelope.totalComputePowerKw > facilityEnvelope.totalAllocatedPowerKw) {
    risks.push({
      title: "Rack power envelope is undersized for the compute estate",
      body: `Compute-only draw is modeled at ${facilityEnvelope.totalComputePowerKw} kW, while the allocated hall power is ${facilityEnvelope.totalAllocatedPowerKw} kW. With ${facilityEnvelope.powerCapacityKwPerRack} kW per rack and ${facilityEnvelope.computeNodePowerKw} kW per node, rack power becomes the binding limit before thermal density does.`,
      severity: "high",
    });
  }

  if (facilityEnvelope.powerNodeCapPerRack < facilityEnvelope.thermalNodeCapPerRack) {
    risks.push({
      title: "Per-rack power binds before thermal density",
      body: `Thermal guidance allows ${facilityEnvelope.thermalNodeCapPerRack} nodes per rack, but the modeled ${facilityEnvelope.computeNodePowerKw} kW per node and ${facilityEnvelope.powerCapacityKwPerRack} kW rack budget only support ${facilityEnvelope.powerNodeCapPerRack}. The rack layout discussion should start from power delivery, not just RU or cooling headroom.`,
      severity:
        facilityEnvelope.powerNodeCapPerRack <= Math.max(2, Math.floor(facilityEnvelope.thermalNodeCapPerRack / 2))
          ? "high"
          : "medium",
    });
  }

  if (risks.length === 0) {
    risks.push({
      title: "No critical blocker detected",
      body: "The current input set yields a reasonable directional design, but platform and workload validation are still required before it becomes a customer-ready implementation plan.",
      severity: "low",
    });
  }

  return risks;
}

function buildCustomerFacingExplanation(result: Pick<DesignEngineResult, "inputs" | "derivedCapacity" | "topologyRecommendation">) {
  const storageClause = result.derivedCapacity.storageFabric.dedicated
    ? ` The design also keeps storage on a separate ${result.derivedCapacity.storageFabric.storagePortSpeedGb}G RoCE front-end storage fabric sized directionally at ${result.derivedCapacity.storageFabric.storageLeafCountEstimate} leafs and ${result.derivedCapacity.storageFabric.storageSpineCountEstimate} spines.`
    : result.inputs.storageNetworkPresent
      ? " Storage remains part of the shared-fabric discussion rather than a separately modeled storage network."
      : "";
  const mediaClause = ` Cabling posture assumes passive DAC only for intra-rack links up to roughly 2 meters, with AOC or pluggable optics used for the modeled ${result.inputs.representativeInterRackDistanceMeters} meter inter-rack paths. Breakout remains a validation item rather than a committed cable plan.`;
  const facilityClause =
    result.derivedCapacity.facilityEnvelope.fitStatus === "fits"
      ? ` The current hall envelope can directionally support the compute estate within ${result.derivedCapacity.facilityEnvelope.allocatedRackCount} racks and ${result.derivedCapacity.facilityEnvelope.totalAllocatedPowerKw} kW of allocated rack power.`
      : ` The current hall envelope does not cleanly fit the compute estate: ${result.derivedCapacity.facilityEnvelope.requiredRacks} racks and ${result.derivedCapacity.facilityEnvelope.totalComputePowerKw} kW are modeled against ${result.derivedCapacity.facilityEnvelope.allocatedRackCount} allocated racks and ${result.derivedCapacity.facilityEnvelope.totalAllocatedPowerKw} kW of rack power.`;

  return `This recommendation uses a scale-out Ethernet leaf-spine fabric with ${result.topologyRecommendation.leafSwitchCountEstimate} leafs and ${result.topologyRecommendation.spineSwitchCountEstimate} spines to support ${result.inputs.gpuCount} GPUs across ${result.inputs.gpuServerCount} servers. It is sized from host bandwidth, growth headroom, and a modeled ${result.derivedCapacity.actualOversubscriptionRatio.toFixed(2)}:1 oversubscription result, with exact platform choice, optics, and RoCE policy left for follow-on validation.${storageClause}${mediaClause}${facilityClause}`;
}

function buildPortConsumption(result: Pick<DesignEngineResult, "inputs" | "derivedCapacity" | "topologyRecommendation">): PortConsumption[] {
  const ports: PortConsumption[] = [
    {
      category: "GPU host ports",
      ports: result.derivedCapacity.hostPortCount,
      speedGb: result.inputs.nicSpeedGb,
      note: `${result.inputs.gpuServerCount} servers x ${result.inputs.nicPortsPerServer} NIC ports. Assume passive DAC only for intra-rack host links up to ~2m.`,
    },
    {
      category: "Storage-facing ports",
      ports: result.derivedCapacity.storageFabric.dedicated
        ? result.derivedCapacity.storageFabric.computeFacingPortRequirement
        : result.derivedCapacity.estimatedStorageFacingLeafPorts,
      speedGb: result.derivedCapacity.storageFabric.dedicated
        ? result.derivedCapacity.storageFabric.storagePortSpeedGb
        : result.inputs.nicSpeedGb,
      note: result.derivedCapacity.storageFabric.dedicated
        ? `Dedicated storage compute-facing ports on ${result.derivedCapacity.storageFabric.profileLabel}`
        : result.inputs.storageNetworkPresent
          ? `${result.inputs.storageType} storage estimate`
          : "No storage network modeled",
    },
    {
      category: "Growth buffer",
      ports: result.derivedCapacity.growthAdjustedLeafPortRequirement - result.derivedCapacity.baselineLeafPortRequirement,
      speedGb: result.inputs.nicSpeedGb,
      note: `${result.derivedCapacity.growthBufferPercent}% growth reserve applied to downlink demand`,
    },
    {
      category: "Leaf-spine uplinks",
      ports: result.derivedCapacity.estimatedSpineFacingUplinkRequirement,
      speedGb: result.topologyRecommendation.recommendedSpine.portSpeedGb,
      note: `Uplink pool after target oversubscription and workload headroom adjustment. Use AOC or transceiver optics for the modeled ${result.inputs.representativeInterRackDistanceMeters}m inter-rack runs.`,
    },
  ];

  if (result.derivedCapacity.storageFabric.dedicated) {
    ports.push(
      {
        category: "Storage backend ports",
        ports: result.derivedCapacity.storageFabric.storageFacingPortRequirement,
        speedGb: result.derivedCapacity.storageFabric.storagePortSpeedGb,
        note: `${result.derivedCapacity.storageFabric.storageServerCount} storage nodes x ${result.derivedCapacity.storageFabric.storagePortsPerServer} ports`,
      },
      {
        category: "Storage fabric uplinks",
        ports: result.derivedCapacity.storageFabric.storageLeafPortRequirement,
        speedGb: result.derivedCapacity.storageFabric.storagePortSpeedGb,
        note: `${result.derivedCapacity.storageFabric.storageLeafCountEstimate} storage leafs feeding ${result.derivedCapacity.storageFabric.storageSpineCountEstimate} storage spines. Treat breakout and storage transceiver selection as follow-on validation.`,
      },
    );
  }

  return ports;
}

function buildWhyThisDesignWorks(result: Pick<
  DesignEngineResult,
  "inputs" | "derivedCapacity" | "trainingCommunication" | "congestionRisk"
>): string[] {
  const bullets = [
    result.derivedCapacity.actualOversubscriptionRatio <= 1.2
      ? "This design stays close to nonblocking behavior for collective-heavy east-west traffic."
      : "This design makes the oversubscription tradeoff explicit so the customer can decide how much contention is acceptable.",
    "Growth buffer is applied to the downlink pool before final switch counts are derived, which keeps expansion posture visible instead of hidden.",
    result.derivedCapacity.facilityEnvelope.fitStatus === "fits"
      ? `Rack and power planning stays within the modeled hall envelope at ${result.derivedCapacity.facilityEnvelope.requiredRacks} required racks and ${result.derivedCapacity.facilityEnvelope.totalComputePowerKw} kW of compute power.`
      : `Rack and power are explicit constraints here: the model needs ${result.derivedCapacity.facilityEnvelope.requiredRacks} racks and ${result.derivedCapacity.facilityEnvelope.totalComputePowerKw} kW, which exceeds the current hall envelope and should drive a facility discussion.`,
    result.derivedCapacity.storageFabric.dedicated
      ? "Checkpoint and dataset movement stay visible through a dedicated storage-fabric model, which keeps storage assumptions explicit without polluting the GPU collective explanation."
      : result.inputs.storageNetworkPresent
        ? "Storage and training traffic are treated as shared-fabric considerations, so checkpoint behavior remains part of the architecture conversation."
        : "Even without explicit storage on the fabric, the model preserves enough structure to explain east-west pressure from training communication.",
    result.trainingCommunication.communicationPressureRating === "high" ||
    result.trainingCommunication.communicationPressureRating === "severe"
      ? "Training communication pressure is high enough that protecting spine bandwidth becomes part of the primary recommendation."
      : "The communication model suggests the current training posture is still manageable within an enterprise Ethernet operating model.",
    "The result is suitable for early enterprise AI architecture discussion, but queueing, storage behavior, and rack-level implementation still need validation.",
  ];

  return bullets.slice(0, 5);
}

export function runDesignEngine(rawInputs: DesignInputs): DesignEngineResult {
  // Stage 1: normalize raw user input into a stable domain object that can evolve later.
  const inputs = normalizeDesignInputs(rawInputs);

  // Stage 2: derive the base capacity model from host demand, storage overlay, and headroom assumptions.
  const recommendedLeaf = pickLeafPlatform(inputs);
  const derivedCapacity = deriveCapacityModel(inputs, recommendedLeaf);
  const recommendedSpine = pickSpinePlatform(inputs, derivedCapacity);
  const hardwareBom = buildHardwareBom(inputs, derivedCapacity, {
    leafSwitchCountEstimate: derivedCapacity.leafSwitchCountEstimate,
    spineSwitchCountEstimate: Math.max(
      minimumSpineCount(inputs),
      Math.ceil(derivedCapacity.estimatedSpineFacingUplinkRequirement / recommendedSpine.portsPerSwitch),
    ),
    recommendedLeaf,
    recommendedSpine,
  });
  const leafSelectionRationale = buildLeafSelectionRationale(inputs, recommendedLeaf);
  const spineSelectionRationale = buildSpineSelectionRationale(inputs, derivedCapacity, recommendedSpine);

  // Stage 3: translate capacity into a directional topology posture.
  const switchingTiers = deriveTierCount(inputs, derivedCapacity.leafSwitchCountEstimate);
  const topologyRecommendation = deriveTopologyModel(
    inputs,
    derivedCapacity,
    recommendedLeaf,
    recommendedSpine,
    switchingTiers,
    {
      autoSelectedLeafModelId: recommendedLeaf.id,
      autoSelectedSpineModelId: recommendedSpine.id,
      leafSelectionRationale,
      spineSelectionRationale,
      hardwareBom,
    },
  );

  // Stage 4: assess training communication before congestion, because it explains east-west pressure drivers.
  const trainingCommunication = assessTrainingCommunication({
    gpuCount: inputs.gpuCount,
    collectivePattern: inputs.collectivePattern,
    trainingCommunicationIntensity: inputs.trainingCommunicationIntensity,
    modelSynchronizationSensitivity: inputs.modelSynchronizationSensitivity,
    clusterScaleClass: inputs.clusterScaleClass,
    actualOversubscriptionRatio: derivedCapacity.actualOversubscriptionRatio,
    storageNetworkPresent: inputs.storageNetworkPresent,
    storageType: inputs.storageType,
    storageProfileId: inputs.storageProfileId,
    eastWestTrafficIntensity: inputs.eastWestTrafficIntensity,
    workloadType: inputs.workloadType,
  });

  // Stage 5: turn topology and communication posture into congestion and confidence guidance.
  const congestionRisk = assessCongestionRisk(inputs, derivedCapacity, trainingCommunication);
  const confidence = assessDesignConfidence(inputs, derivedCapacity, congestionRisk, trainingCommunication);

  // Stage 6: generate customer-conversation outputs from the already-derived technical posture.
  const structuredNarrative = generateStructuredNarrative(
    inputs,
    derivedCapacity,
    topologyRecommendation,
    congestionRisk,
    trainingCommunication,
  );
  const discoveryQuestions = generateDiscoveryQuestions(inputs, trainingCommunication);

  const baseResult = {
    inputs,
    derivedCapacity,
    topologyRecommendation,
    trainingCommunication,
    congestionRisk,
    confidence,
    discoveryQuestions,
    structuredNarrative,
    designBoundary,
  } as const;

  return {
    ...baseResult,
    whyThisDesignWorks: buildWhyThisDesignWorks(baseResult),
    opticsAssumptions: buildOpticsAssumptions(inputs, topologyRecommendation.recommendedSpine.portSpeedGb),
    storageAssumptions: buildStorageAssumptions(inputs, derivedCapacity.storageFabric),
    architectureNotes: buildArchitectureNotes(baseResult),
    risks: buildRisks(baseResult),
    customerFacingExplanation: buildCustomerFacingExplanation(baseResult),
    portConsumption: buildPortConsumption(baseResult),
  };
}
