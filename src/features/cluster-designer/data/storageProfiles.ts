import type { DesignAssumption, StorageProfileId, StorageType } from "@/features/cluster-designer/types";

export interface StorageProfileDefinition {
  id: StorageProfileId;
  label: string;
  storageType: StorageType;
  dedicated: boolean;
  enabled: boolean;
  defaultComputePortsPerNode: number;
  defaultStoragePortSpeedGb: 100 | 200 | 400;
  defaultStorageServerCount: number;
  defaultStoragePortsPerServer: number;
  aggregateReadThroughputTbps: number;
  aggregateWriteThroughputTbps: number;
  defaultCheckpointBurstProfile?: "light" | "moderate" | "high";
  queueingControls?: string[];
  assumptions: DesignAssumption[];
}

export const storageProfiles: Record<StorageProfileId, StorageProfileDefinition> = {
  none: {
    id: "none",
    label: "No storage fabric",
    storageType: "ethernet",
    dedicated: false,
    enabled: false,
    defaultComputePortsPerNode: 0,
    defaultStoragePortSpeedGb: 100,
    defaultStorageServerCount: 0,
    defaultStoragePortsPerServer: 0,
    aggregateReadThroughputTbps: 0,
    aggregateWriteThroughputTbps: 0,
    assumptions: [{ label: "Storage fabric", value: "No explicit storage fabric modeled." }],
  },
  "generic-shared-ethernet": {
    id: "generic-shared-ethernet",
    label: "Generic shared storage",
    storageType: "ethernet",
    dedicated: false,
    enabled: true,
    defaultComputePortsPerNode: 0,
    defaultStoragePortSpeedGb: 200,
    defaultStorageServerCount: 0,
    defaultStoragePortsPerServer: 0,
    aggregateReadThroughputTbps: 0,
    aggregateWriteThroughputTbps: 0,
    defaultCheckpointBurstProfile: "moderate",
    assumptions: [{ label: "Storage fabric", value: "Shared Ethernet storage modeled directionally through a generic overlay." }],
  },
  "generic-shared-roce": {
    id: "generic-shared-roce",
    label: "Generic shared storage",
    storageType: "roce",
    dedicated: false,
    enabled: true,
    defaultComputePortsPerNode: 0,
    defaultStoragePortSpeedGb: 200,
    defaultStorageServerCount: 0,
    defaultStoragePortsPerServer: 0,
    aggregateReadThroughputTbps: 0,
    aggregateWriteThroughputTbps: 0,
    defaultCheckpointBurstProfile: "moderate",
    assumptions: [{ label: "Storage fabric", value: "Shared RoCE-attached storage modeled directionally through a generic overlay." }],
  },
  "generic-shared-nas": {
    id: "generic-shared-nas",
    label: "Generic shared storage",
    storageType: "nas-like",
    dedicated: false,
    enabled: true,
    defaultComputePortsPerNode: 0,
    defaultStoragePortSpeedGb: 100,
    defaultStorageServerCount: 0,
    defaultStoragePortsPerServer: 0,
    aggregateReadThroughputTbps: 0,
    aggregateWriteThroughputTbps: 0,
    defaultCheckpointBurstProfile: "light",
    assumptions: [{ label: "Storage fabric", value: "NAS-like storage interaction remains highly abstracted and assumption-driven." }],
  },
  "high-priority-roce-parallel-fs": {
    id: "high-priority-roce-parallel-fs",
    label: "Dedicated high-priority RoCE storage fabric",
    storageType: "roce",
    dedicated: true,
    enabled: true,
    defaultComputePortsPerNode: 1,
    defaultStoragePortSpeedGb: 400,
    defaultStorageServerCount: 24,
    defaultStoragePortsPerServer: 4,
    aggregateReadThroughputTbps: 16.0,
    aggregateWriteThroughputTbps: 9.6,
    defaultCheckpointBurstProfile: "high",
    queueingControls: ["ECN", "PFC", "DCQCN"],
    assumptions: [
      { label: "Storage fabric", value: "Dedicated 400GbE RoCEv2 storage leaf-spine fabric separate from the GPU collective fabric." },
      { label: "Compute attachment", value: "256 compute nodes with one dedicated 400G storage network port per node." },
      { label: "Storage backend", value: "24 storage backend nodes with 4 x 400G RoCEv2 ports per server." },
      { label: "Throughput target", value: ">2 TB/s sustained read and >1.2 TB/s sustained write." },
      { label: "Queueing controls", value: "Queueing and congestion discipline should include ECN, PFC, and DCQCN as validation items." },
      { label: "Checkpoint posture", value: "Checkpoint bursts every ~15 minutes with 200-400 GB per checkpoint should remain visible in the architecture review." },
    ],
  },
};

export function storageProfileFor(id: StorageProfileId) {
  return storageProfiles[id];
}
