import { minimumSpineCount } from "@/features/cluster-designer/models/capacityModel";
import type {
  CapacityModelResult,
  NormalizedDesignInputs,
  SwitchModel,
  TopologyLink,
  TopologyModelResult,
  TopologyNode,
} from "@/features/cluster-designer/types";

const ceilDiv = (value: number, divisor: number) => Math.ceil(value / divisor);

export function deriveTopologyModel(
  inputs: NormalizedDesignInputs,
  capacity: CapacityModelResult,
  recommendedLeaf: SwitchModel,
  recommendedSpine: SwitchModel,
  switchingTiers: 2 | 3,
  hardwarePolicy: {
    autoSelectedLeafModelId: string;
    autoSelectedSpineModelId: string;
    leafSelectionRationale: string;
    spineSelectionRationale: string;
    hardwareBom: TopologyModelResult["hardwareBom"];
  },
): TopologyModelResult {
  const leafSwitchCountEstimate = capacity.leafSwitchCountEstimate;
  const spineSwitchCountEstimate = Math.max(
    minimumSpineCount(inputs),
    ceilDiv(capacity.estimatedSpineFacingUplinkRequirement, recommendedSpine.portsPerSwitch),
  );

  const spineNodes: TopologyNode[] = Array.from({ length: spineSwitchCountEstimate }, (_, index) => ({
    id: `spine-${index + 1}`,
    label: `Spine ${index + 1}`,
    detail: `${recommendedSpine.portSpeedGb}G fabric`,
    type: "spine",
  }));

  const leafNodes: TopologyNode[] = Array.from({ length: leafSwitchCountEstimate }, (_, index) => ({
    id: `leaf-${index + 1}`,
    label: `Leaf ${index + 1}`,
    detail: `${capacity.estimatedDownlinkCapacityPerLeaf} estimated downlinks/leaf`,
    type: "leaf",
  }));

  const nodes: TopologyNode[] = [
    ...spineNodes,
    ...leafNodes,
    {
      id: "compute-domain-1",
      label: `${inputs.gpuServerCount} GPU servers`,
      detail: `${inputs.gpusPerServer} GPUs/server, ${inputs.nicPortsPerServer} NIC ports/server`,
      type: "server",
    },
  ];

  if (inputs.storageNetworkPresent) {
    nodes.push({
      id: "storage-domain-1",
      label: "Storage attachment",
      detail: `${capacity.estimatedStorageFacingLeafPorts} assumption-driven storage-facing ports`,
      type: "storage",
    });
  }

  const links: TopologyLink[] = [];

  leafNodes.forEach((leaf) => {
    links.push({ from: "compute-domain-1", to: leaf.id, label: `${inputs.nicSpeedGb}G host links` });
    if (inputs.storageNetworkPresent) {
      links.push({ from: "storage-domain-1", to: leaf.id, label: `${inputs.storageType} storage attachment` });
    }

    spineNodes.forEach((spine) => {
      links.push({ from: leaf.id, to: spine.id, label: `${recommendedSpine.portSpeedGb}G uplink` });
    });
  });

  return {
    headline: `${leafSwitchCountEstimate} leaf / ${spineSwitchCountEstimate} spine Ethernet AI cluster`,
    detail: `${switchingTiers}-tier Clos-style enterprise Ethernet concept sized from server NIC bandwidth, growth buffer, and target oversubscription. Platform families remain assumption-driven placeholders for early architecture review, not final hardware commitments.`,
    switchingTiers,
    leafSwitchCountEstimate,
    spineSwitchCountEstimate,
    recommendedLeaf,
    recommendedSpine,
    autoSelectedLeafModelId: hardwarePolicy.autoSelectedLeafModelId,
    autoSelectedSpineModelId: hardwarePolicy.autoSelectedSpineModelId,
    leafSelectionRationale: hardwarePolicy.leafSelectionRationale,
    spineSelectionRationale: hardwarePolicy.spineSelectionRationale,
    hardwareBom: hardwarePolicy.hardwareBom,
    nodes,
    links,
  };
}
