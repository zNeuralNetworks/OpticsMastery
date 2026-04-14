export interface GPUPlatform {
  id: string;
  name: string;
  nodeModelSku: string;
  computeNicsPerNode: number;
  computeNicSpeed: '200G' | '400G' | '800G';
  storageNicsPerNode: number;
  storageNicSpeed: '100G' | '200G' | '400G';
  mgmtNicSpeed?: '1G' | '10G' | '25G';
  mgmtNicsPerNode: number;
  defaultGpusPerNode: number;
  railDesign: 'single-rail' | 'dual-rail';
  recommendedRailCount: 1 | 2;
  storageType: 'GPU' | 'CPU-only';
  supportedFabricTopology: 'backend-leaf-spine' | 'dual-fabric-leaf-spine';
  breakoutProfile: 'native-800g' | '2x400g' | '4x200g';
  storageAttachmentModel: 'cpu-storage' | 'gpu-direct';
  rackUnits: number;
  nodePowerKw: number;
}

export interface StoragePlatform {
  id: 'WEKA' | 'VAST' | 'NONE';
  name: string;
  nodesPerCluster: number;
  nicsPerStorageNode: number;
  nicSpeed: '100G' | '200G' | '400G';
  designType: 'shared' | 'separate' | 'nvme-of';
  attachmentModel: 'shared-services' | 'dedicated-storage-fabric' | 'gpu-direct-storage';
}

export const GPU_PLATFORMS: GPUPlatform[] = [
  {
    id: 'h100-hgx',
    name: 'Nvidia H100 HGX (8-GPU)',
    nodeModelSku: 'HGX-H100-8-GPU',
    computeNicsPerNode: 8,
    computeNicSpeed: '400G',
    storageNicsPerNode: 2,
    storageNicSpeed: '200G',
    mgmtNicSpeed: '25G',
    mgmtNicsPerNode: 1,
    defaultGpusPerNode: 8,
    railDesign: 'single-rail',
    recommendedRailCount: 1,
    storageType: 'CPU-only',
    supportedFabricTopology: 'backend-leaf-spine',
    breakoutProfile: '2x400g',
    storageAttachmentModel: 'cpu-storage',
    rackUnits: 4,
    nodePowerKw: 10.2
  },
  {
    id: 'a100-hgx',
    name: 'Nvidia A100 HGX (8-GPU)',
    nodeModelSku: 'HGX-A100-8-GPU',
    computeNicsPerNode: 8,
    computeNicSpeed: '200G',
    storageNicsPerNode: 1,
    storageNicSpeed: '100G',
    mgmtNicsPerNode: 1,
    defaultGpusPerNode: 8,
    railDesign: 'single-rail',
    recommendedRailCount: 1,
    storageType: 'CPU-only',
    supportedFabricTopology: 'backend-leaf-spine',
    breakoutProfile: '4x200g',
    storageAttachmentModel: 'cpu-storage',
    rackUnits: 4,
    nodePowerKw: 8.5
  },
  {
    id: 'h200-hgx',
    name: 'Nvidia H200 HGX (8-GPU)',
    nodeModelSku: 'HGX-H200-8-GPU',
    computeNicsPerNode: 8,
    computeNicSpeed: '400G',
    storageNicsPerNode: 2,
    storageNicSpeed: '400G',
    mgmtNicsPerNode: 1,
    defaultGpusPerNode: 8,
    railDesign: 'dual-rail',
    recommendedRailCount: 2,
    storageType: 'CPU-only',
    supportedFabricTopology: 'dual-fabric-leaf-spine',
    breakoutProfile: '2x400g',
    storageAttachmentModel: 'cpu-storage',
    rackUnits: 4,
    nodePowerKw: 11.5
  },
  {
    id: 'b200-nvl72',
    name: 'Nvidia B200 NVL72 (Rack)',
    nodeModelSku: 'NVL72-RACK-SYSTEM',
    computeNicsPerNode: 72,
    computeNicSpeed: '800G',
    storageNicsPerNode: 18,
    storageNicSpeed: '400G',
    mgmtNicsPerNode: 1,
    defaultGpusPerNode: 72,
    railDesign: 'dual-rail',
    recommendedRailCount: 2,
    storageType: 'GPU',
    supportedFabricTopology: 'dual-fabric-leaf-spine',
    breakoutProfile: 'native-800g',
    storageAttachmentModel: 'gpu-direct',
    rackUnits: 42,
    nodePowerKw: 120
  }
];

export const STORAGE_PLATFORMS: Record<string, StoragePlatform> = {
  'NONE': {
    id: 'NONE',
    name: 'None',
    nodesPerCluster: 0,
    nicsPerStorageNode: 0,
    nicSpeed: '100G',
    designType: 'shared',
    attachmentModel: 'shared-services'
  },
  'WEKA': {
    id: 'WEKA',
    name: 'Weka Data Platform',
    nodesPerCluster: 16,
    nicsPerStorageNode: 2,
    nicSpeed: '200G',
    designType: 'separate',
    attachmentModel: 'dedicated-storage-fabric'
  },
  'VAST': {
    id: 'VAST',
    name: 'VAST Data Platform',
    nodesPerCluster: 8,
    nicsPerStorageNode: 4,
    nicSpeed: '100G',
    designType: 'nvme-of',
    attachmentModel: 'gpu-direct-storage'
  }
};
