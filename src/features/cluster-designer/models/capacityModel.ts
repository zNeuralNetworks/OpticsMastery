import {
  eastWestHeadroomFactors,
  minimumSpineCount,
  redundancyHeadroomFactor,
  roceStorageHeadroomFactor,
  storageLeafPortOverlayFactors,
  switchingTierCount,
} from "@/features/cluster-designer/data/fabricProfiles";
import { platformProfiles } from "@/features/cluster-designer/data/platformProfiles";
import { storageProfileFor } from "@/features/cluster-designer/data/storageProfiles";
import { workloadHeadroomFactors } from "@/features/cluster-designer/data/workloadProfiles";
import type {
  CapacityModelResult,
  FacilityEnvelope,
  HardwareBomItem,
  NormalizedDesignInputs,
  StorageFabricCapacity,
  SwitchModel,
  TopologyRecommendation,
} from "@/features/cluster-designer/types";

const ceilDiv = (value: number, divisor: number) => Math.ceil(value / divisor);

function scalePressureScore(inputs: Pick<NormalizedDesignInputs, "gpuServerCount" | "gpuCount" | "nicSpeedGb" | "targetOversubscription" | "eastWestTrafficIntensity" | "workloadType">) {
  let score = 0;

  if (inputs.gpuServerCount >= 96) score += 3;
  else if (inputs.gpuServerCount >= 48) score += 2;
  else if (inputs.gpuServerCount >= 16) score += 1;

  if (inputs.gpuCount >= 512) score += 2;
  else if (inputs.gpuCount >= 256) score += 1;

  if (inputs.nicSpeedGb === 400) score += 2;
  else if (inputs.nicSpeedGb === 200) score += 1;

  if (inputs.targetOversubscription === 1) score += 1;
  if (inputs.eastWestTrafficIntensity === "high") score += 1;
  if (inputs.workloadType === "training" || inputs.workloadType === "hpc") score += 1;

  return score;
}

function isWithinRecommendedRange(option: SwitchModel, serverCount: number, leafCount?: number) {
  const serverInRange =
    (option.recommendedMinServers === undefined || serverCount >= option.recommendedMinServers) &&
    (option.recommendedMaxServers === undefined || serverCount <= option.recommendedMaxServers);
  const leafInRange =
    leafCount === undefined ||
    ((option.recommendedMinLeafs === undefined || leafCount >= option.recommendedMinLeafs) &&
      (option.recommendedMaxLeafs === undefined || leafCount <= option.recommendedMaxLeafs));

  return serverInRange && leafInRange;
}

function selectionSource(manualId: string | undefined) {
  return manualId ? "manual-hardware-override" : "auto-hardware-policy";
}

function linecardPortsForSpeed(speedGb: number) {
  if (speedGb === 100) return 288;
  if (speedGb === 200) return 144;
  if (speedGb === 800) return 36;
  return 72; // 400G: 36-port 800G linecard broken out 2:1
}

function supportsRole(option: SwitchModel, role: "leaf" | "spine" | "single-tier") {
  return option.supportedRoles.includes(role);
}

export function pickLeafPlatform(inputs: Pick<NormalizedDesignInputs, "nicSpeedGb" | "preferredLeafModelId" | "gpuServerCount" | "gpuCount" | "targetOversubscription" | "eastWestTrafficIntensity" | "workloadType">): SwitchModel {
  const compatibleLeafs = platformProfiles.leafOptions.filter(
    (option) => option.portSpeedGb === inputs.nicSpeedGb && supportsRole(option, "leaf"),
  );

  if (inputs.preferredLeafModelId) {
    const preferred = compatibleLeafs.find((option) => option.id === inputs.preferredLeafModelId);
    if (preferred) {
      return preferred;
    }
  }

  const modularLeafs = compatibleLeafs.filter((option) => option.family === "7800R4");
  const fixedLeaf = compatibleLeafs.find((option) => option.family !== "7800R4") ?? compatibleLeafs[0];
  const pressureScore = scalePressureScore(inputs);

  if (!modularLeafs.length || inputs.nicSpeedGb === 100) {
    return fixedLeaf;
  }

  if (pressureScore <= 3 && fixedLeaf) {
    return fixedLeaf;
  }

  return (
    modularLeafs.find((option) => isWithinRecommendedRange(option, inputs.gpuServerCount)) ??
    modularLeafs[modularLeafs.length - 1]
  );
}

function deriveStorageFabricCapacity(inputs: NormalizedDesignInputs): StorageFabricCapacity {
  const profile = storageProfileFor(inputs.storageProfileId);

  if (!profile.enabled || !inputs.storageNetworkPresent) {
    return {
      enabled: false,
      dedicated: false,
      profileId: inputs.storageProfileId,
      profileLabel: profile.label,
      computeNodeCount: 0,
      storageServerCount: 0,
      computePortsPerNode: 0,
      storagePortsPerServer: 0,
      storagePortSpeedGb: 0,
      aggregateReadThroughputTbps: 0,
      aggregateWriteThroughputTbps: 0,
      computeFacingPortRequirement: 0,
      storageFacingPortRequirement: 0,
      storageLeafPortRequirement: 0,
      storageLeafCountEstimate: 0,
      storageSpineCountEstimate: 0,
      checkpointBurstProfile: inputs.checkpointBurstProfile,
    };
  }

  const computeNodeCount = inputs.gpuServerCount;
  const computePortsPerNode = inputs.storageComputePortsPerNode ?? profile.defaultComputePortsPerNode;
  const storageServerCount = inputs.storageServerCount ?? profile.defaultStorageServerCount;
  const storagePortsPerServer = inputs.storagePortsPerServer ?? profile.defaultStoragePortsPerServer;
  const storagePortSpeedGb = inputs.storagePortSpeedGb ?? profile.defaultStoragePortSpeedGb;
  const computeFacingPortRequirement = computeNodeCount * computePortsPerNode;
  const storageFacingPortRequirement = storageServerCount * storagePortsPerServer;
  const storageLeafPortRequirement = computeFacingPortRequirement + storageFacingPortRequirement;
  const storageLeafPlatform =
    platformProfiles.leafOptions.find((option) => option.portSpeedGb === storagePortSpeedGb) ??
    platformProfiles.leafOptions[platformProfiles.leafOptions.length - 1];
  const storageSpinePlatform =
    platformProfiles.spineOptions.find((option) => option.portSpeedGb === storagePortSpeedGb) ??
    platformProfiles.spineOptions[platformProfiles.spineOptions.length - 1];
  const storageLeafCountEstimate =
    storageLeafPortRequirement > 0
      ? Math.max(2, ceilDiv(storageLeafPortRequirement, storageLeafPlatform.portsPerSwitch))
      : 0;
  const storageSpineUplinkRequirement = profile.dedicated
    ? computeFacingPortRequirement
    : Math.ceil(
        computeFacingPortRequirement * storageLeafPortOverlayFactors[inputs.storageType][inputs.eastWestTrafficIntensity],
      );
  const storageSpineCountEstimate =
    storageSpineUplinkRequirement > 0
      ? Math.max(2, ceilDiv(storageSpineUplinkRequirement, storageSpinePlatform.portsPerSwitch))
      : 0;

  return {
    enabled: true,
    dedicated: profile.dedicated,
    profileId: profile.id,
    profileLabel: profile.label,
    computeNodeCount,
    storageServerCount,
    computePortsPerNode,
    storagePortsPerServer,
    storagePortSpeedGb,
    aggregateReadThroughputTbps: profile.aggregateReadThroughputTbps,
    aggregateWriteThroughputTbps: profile.aggregateWriteThroughputTbps,
    computeFacingPortRequirement,
    storageFacingPortRequirement,
    storageLeafPortRequirement,
    storageLeafCountEstimate,
    storageSpineCountEstimate,
    checkpointBurstProfile: inputs.checkpointBurstProfile ?? profile.defaultCheckpointBurstProfile,
  };
}

function estimateStorageFacingLeafPorts(inputs: NormalizedDesignInputs, hostPortCount: number) {
  if (!inputs.storageNetworkPresent || inputs.storageProfileId === "high-priority-roce-parallel-fs") {
    return 0;
  }

  return Math.ceil(hostPortCount * storageLeafPortOverlayFactors[inputs.storageType][inputs.eastWestTrafficIntensity]);
}

function estimateFabricHeadroomFactor(inputs: NormalizedDesignInputs) {
  return Math.max(
    1,
    redundancyHeadroomFactor(inputs.redundancyPreference) *
      roceStorageHeadroomFactor(inputs) *
      workloadHeadroomFactors[inputs.workloadType] *
      eastWestHeadroomFactors[inputs.eastWestTrafficIntensity],
  );
}

function deriveFacilityEnvelope(inputs: NormalizedDesignInputs): FacilityEnvelope {
  const physicalNodeCapPerRack = Math.max(1, Math.floor(inputs.rackUnitsPerRack / Math.max(1, inputs.computeNodeRackUnits)));
  const thermalNodeCapPerRack = Math.max(1, inputs.thermalNodeCapPerRack);
  const powerNodeCapPerRack = Math.max(1, Math.floor(inputs.powerCapacityKwPerRack / Math.max(0.1, inputs.computeNodePowerKw)));
  const recommendedNodeCapPerRack = Math.min(physicalNodeCapPerRack, thermalNodeCapPerRack, powerNodeCapPerRack);
  const requiredRacksByPhysical = ceilDiv(inputs.gpuServerCount, physicalNodeCapPerRack);
  const requiredRacksByThermal = ceilDiv(inputs.gpuServerCount, thermalNodeCapPerRack);
  const requiredRacksByPower = ceilDiv(inputs.gpuServerCount, powerNodeCapPerRack);
  const requiredRacks = Math.max(requiredRacksByPhysical, requiredRacksByThermal, requiredRacksByPower);
  const totalComputePowerKw = Number((inputs.gpuServerCount * inputs.computeNodePowerKw).toFixed(1));
  const totalAllocatedPowerKw = Number((inputs.allocatedRackCount * inputs.powerCapacityKwPerRack).toFixed(1));
  const powerHeadroomKw = Number((totalAllocatedPowerKw - totalComputePowerKw).toFixed(1));
  const remainingRackHeadroom = inputs.allocatedRackCount - requiredRacks;

  let fitStatus: FacilityEnvelope["fitStatus"] = "fits";

  if (requiredRacks > inputs.allocatedRackCount && totalComputePowerKw > totalAllocatedPowerKw) {
    fitStatus = "facility-constrained";
  } else if (totalComputePowerKw > totalAllocatedPowerKw) {
    fitStatus = "power-constrained";
  } else if (requiredRacks > inputs.allocatedRackCount) {
    fitStatus = "rack-constrained";
  }

  return {
    allocatedRackCount: inputs.allocatedRackCount,
    rackUnitsPerRack: inputs.rackUnitsPerRack,
    powerCapacityKwPerRack: inputs.powerCapacityKwPerRack,
    computeNodeRackUnits: inputs.computeNodeRackUnits,
    computeNodePowerKw: inputs.computeNodePowerKw,
    physicalNodeCapPerRack,
    thermalNodeCapPerRack,
    powerNodeCapPerRack,
    recommendedNodeCapPerRack,
    requiredRacksByPhysical,
    requiredRacksByThermal,
    requiredRacksByPower,
    requiredRacks,
    remainingRackHeadroom,
    totalComputePowerKw,
    totalAllocatedPowerKw,
    powerHeadroomKw,
    fitStatus,
  };
}

export function deriveCapacityModel(inputs: NormalizedDesignInputs, recommendedLeaf: SwitchModel): CapacityModelResult {
  const hostPortCount = inputs.gpuServerCount * inputs.nicPortsPerServer;
  const totalRequiredHostFacingBandwidthTbps = Number(((hostPortCount * inputs.nicSpeedGb) / 1000).toFixed(1));
  const estimatedStorageFacingLeafPorts = estimateStorageFacingLeafPorts(inputs, hostPortCount);
  const storageFabric = deriveStorageFabricCapacity(inputs);
  const baselineLeafPortRequirement = hostPortCount + estimatedStorageFacingLeafPorts;
  const growthAdjustedLeafPortRequirement = Math.ceil(
    baselineLeafPortRequirement * (1 + inputs.futureGrowthBufferPercent / 100),
  );
  const targetSpineFacingUplinkRequirement = ceilDiv(growthAdjustedLeafPortRequirement, inputs.targetOversubscription);
  const estimatedSpineFacingUplinkRequirement = Math.ceil(
    targetSpineFacingUplinkRequirement * estimateFabricHeadroomFactor(inputs),
  );

  let leafSwitchCountEstimate = Math.max(
    2,
    ceilDiv(
      growthAdjustedLeafPortRequirement,
      Math.floor(recommendedLeaf.portsPerSwitch / (1 + 1 / inputs.targetOversubscription)),
    ),
  );

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const uplinksPerLeaf = Math.ceil(estimatedSpineFacingUplinkRequirement / leafSwitchCountEstimate);
    const estimatedDownlinkCapacityPerLeaf = Math.max(1, recommendedLeaf.portsPerSwitch - uplinksPerLeaf);
    const nextLeafCount = Math.max(2, ceilDiv(growthAdjustedLeafPortRequirement, estimatedDownlinkCapacityPerLeaf));
    if (nextLeafCount === leafSwitchCountEstimate) {
      break;
    }
    leafSwitchCountEstimate = nextLeafCount;
  }

  const uplinksPerLeaf = Math.ceil(estimatedSpineFacingUplinkRequirement / leafSwitchCountEstimate);
  const estimatedDownlinkCapacityPerLeaf = Math.max(1, recommendedLeaf.portsPerSwitch - uplinksPerLeaf);
  const actualUplinkPorts = uplinksPerLeaf * leafSwitchCountEstimate;
  const facilityEnvelope = deriveFacilityEnvelope(inputs);

  return {
    totalRequiredHostFacingBandwidthTbps,
    hostPortCount,
    estimatedStorageFacingLeafPorts,
    baselineLeafPortRequirement,
    growthAdjustedLeafPortRequirement,
    leafSwitchCountEstimate,
    estimatedDownlinkCapacityPerLeaf,
    uplinksPerLeaf,
    estimatedLeafPortRequirement: growthAdjustedLeafPortRequirement,
    targetSpineFacingUplinkRequirement,
    estimatedSpineFacingUplinkRequirement: actualUplinkPorts,
    targetOversubscriptionRatio: inputs.targetOversubscription,
    actualOversubscriptionRatio: Number((growthAdjustedLeafPortRequirement / actualUplinkPorts).toFixed(2)),
    growthBufferPercent: inputs.futureGrowthBufferPercent,
    storageFabric,
    facilityEnvelope,
  };
}

export function pickSpinePlatform(
  inputs: Pick<NormalizedDesignInputs, "nicSpeedGb" | "preferredSpineModelId" | "gpuServerCount" | "gpuCount" | "targetOversubscription" | "eastWestTrafficIntensity" | "workloadType">,
  capacity: Pick<CapacityModelResult, "leafSwitchCountEstimate" | "estimatedSpineFacingUplinkRequirement">,
): SwitchModel {
  const compatibleSpines = platformProfiles.spineOptions.filter(
    (option) => option.portSpeedGb === inputs.nicSpeedGb && supportsRole(option, "spine"),
  );

  if (inputs.preferredSpineModelId) {
    const preferred = compatibleSpines.find((option) => option.id === inputs.preferredSpineModelId);
    if (preferred) {
      return preferred;
    }
  }

  const viable = compatibleSpines.filter((option) =>
    isWithinRecommendedRange(option, inputs.gpuServerCount, capacity.leafSwitchCountEstimate),
  );
  const shortlist = viable.length ? viable : compatibleSpines;

  if (inputs.nicSpeedGb === 400) {
    if (inputs.gpuServerCount >= 193) {
      return compatibleSpines.find((option) => option.id === "7816l-spine-400g") ?? shortlist[shortlist.length - 1];
    }

    if (inputs.gpuServerCount >= 49 || capacity.leafSwitchCountEstimate >= 17) {
      return compatibleSpines.find((option) => option.id === "7812r4-spine-400g") ?? shortlist[shortlist.length - 1];
    }
  }

  return shortlist[0] ?? compatibleSpines[compatibleSpines.length - 1];
}

export function buildLeafSelectionRationale(
  inputs: Pick<NormalizedDesignInputs, "gpuServerCount" | "nicSpeedGb" | "preferredLeafModelId" | "workloadType" | "eastWestTrafficIntensity" | "targetOversubscription" | "gpuCount">,
  selectedLeaf: SwitchModel,
) {
  if (inputs.preferredLeafModelId === selectedLeaf.id) {
    return `Leaf class pinned manually to ${selectedLeaf.name}.`;
  }

  if (selectedLeaf.family === "7060X6") {
    return "Leaf class stayed on the smaller fixed-radix profile because the current server count and traffic posture do not yet justify a modular fabric block.";
  }

  return `Leaf class moved to ${selectedLeaf.name} because ${inputs.nicSpeedGb}G plus current scale and traffic pressure justify a stronger modular fabric posture.`;
}

export function buildSpineSelectionRationale(
  inputs: Pick<NormalizedDesignInputs, "gpuServerCount" | "nicSpeedGb" | "preferredSpineModelId">,
  capacity: Pick<CapacityModelResult, "leafSwitchCountEstimate" | "estimatedSpineFacingUplinkRequirement">,
  selectedSpine: SwitchModel,
) {
  if (inputs.preferredSpineModelId === selectedSpine.id) {
    return `Spine class pinned manually to ${selectedSpine.name}.`;
  }

  return `${selectedSpine.name} was selected because ${capacity.leafSwitchCountEstimate} modeled leafs and ${capacity.estimatedSpineFacingUplinkRequirement} required uplinks justify the ${selectedSpine.scaleTier} chassis class at ${inputs.nicSpeedGb}G.`;
}

function chassisBomForRole(
  role: "leaf" | "spine",
  model: SwitchModel,
  switchCount: number,
  totalPortDemand: number,
  redundancyPreference: NormalizedDesignInputs["redundancyPreference"],
  source: "auto-hardware-policy" | "manual-hardware-override",
): HardwareBomItem[] {
  if (!model.chassisSku || !model.linecardSlots || !model.linecardSku || !model.fabricModuleSku || !model.fabricCoolingModuleSku) {
    return [];
  }

  const linecardCapacity = linecardPortsForSpeed(model.portSpeedGb);
  const totalLinecards = Math.min(
    switchCount * model.linecardSlots,
    Math.max(switchCount, ceilDiv(totalPortDemand, linecardCapacity)),
  );
  const supervisorQtyPerChassis = redundancyPreference === "high" ? 2 : 1;
  const supervisorSku = model.supervisorSkuPrimary;

  const items: HardwareBomItem[] = [
    {
      sku: model.chassisSku,
      description: `${model.name} chassis`,
      quantity: switchCount,
      componentType: "chassis",
      source,
      role,
      note: `${switchCount} ${role} chassis from the current hardware policy.`,
    },
    {
      sku: model.linecardSku,
      description: `${model.name} AI line card`,
      quantity: totalLinecards,
      componentType: "linecard",
      source,
      role,
      note: `${totalLinecards} occupied line card slots derived from ${totalPortDemand} required ${model.portSpeedGb}G ports.`,
    },
  ];

  if (supervisorSku) {
    items.push({
      sku: supervisorSku,
      description: `${model.name} supervisor module`,
      quantity: switchCount * supervisorQtyPerChassis,
      componentType: "supervisor",
      source,
      role,
      note: `${supervisorQtyPerChassis} supervisor module(s) per chassis based on ${redundancyPreference} redundancy posture.`,
    });
  }

  items.push(
    {
      sku: model.fabricModuleSku,
      description: `${model.name} fabric module`,
      quantity: switchCount * 5,
      componentType: "fabric-module",
      source,
      role,
      note: `${model.chassisSku} requires 5 active fabric modules per chassis. Validate the exact quantity against the current platform datasheet before final BOM submission.`,
    },
    {
      sku: model.fabricCoolingModuleSku,
      description: `${model.name} fabric cooling module`,
      quantity: switchCount,
      componentType: "fabric-cooling-module",
      source,
      role,
      note: "7800R4 chassis require 1 fabric cooling module per chassis.",
    },
  );

  return items;
}

export function buildHardwareBom(
  inputs: NormalizedDesignInputs,
  capacity: CapacityModelResult,
  topology: Pick<TopologyRecommendation, "leafSwitchCountEstimate" | "spineSwitchCountEstimate" | "recommendedLeaf" | "recommendedSpine">,
): HardwareBomItem[] {
  const items: HardwareBomItem[] = [];

  if (topology.recommendedLeaf.family === "7800R4") {
    items.push(
      ...chassisBomForRole(
        "leaf",
        topology.recommendedLeaf,
        topology.leafSwitchCountEstimate,
        capacity.growthAdjustedLeafPortRequirement,
        inputs.redundancyPreference,
        selectionSource(inputs.preferredLeafModelId),
      ),
    );
  }

  if (topology.recommendedSpine.family === "7800R4") {
    items.push(
      ...chassisBomForRole(
        "spine",
        topology.recommendedSpine,
        topology.spineSwitchCountEstimate,
        capacity.estimatedSpineFacingUplinkRequirement,
        inputs.redundancyPreference,
        selectionSource(inputs.preferredSpineModelId),
      ),
    );
  }

  return items;
}

export function deriveTierCount(
  inputs: Pick<NormalizedDesignInputs, "gpuServerCount" | "managementSimplicityPriority">,
  leafSwitchCountEstimate: number,
) {
  return switchingTierCount(leafSwitchCountEstimate, inputs);
}

export { minimumSpineCount };
