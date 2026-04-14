
import { AristaSwitch } from '../types';
import { GPUPlatform, StoragePlatform } from '../data/aiSpecs';

export interface FabricSizing {
  leafCount: number;
  spineCount: number;
  totalLeafPorts: number;
  totalSpinePorts: number;
  uplinksPerLeaf: number;
  downlinksPerLeaf: number;
  nicsPerPort: number;
  breakoutRequired: boolean;
  breakoutType?: string;
  usedDownlinkPorts: number;
  usedUplinkPorts: number;
  oversubscriptionRatio: number;
  warnings: string[];
}

export interface RackSizing {
  rackCount: number;
  nodesPerRack: number;
  powerPerRackKw: number;
  totalPowerKw: number;
  ruPerNode: number;
  mgmtNicsPerRack: number;
}

export interface AIClusterResult {
  gpuCount: number;
  nodeCount: number;
  computeFabric: FabricSizing;
  storageFabric?: FabricSizing;
  rackPlanning: RackSizing;
  warnings: string[];
}

const parseSpeed = (speed: string) => parseInt(speed.replace(/[^0-9]/g, ''), 10);

const getFanoutCount = (switchSpeed: string, endpointSpeed: string) => {
  const switchRate = parseSpeed(switchSpeed);
  const endpointRate = parseSpeed(endpointSpeed);

  if (!switchRate || !endpointRate || endpointRate > switchRate) {
    return 1;
  }

  return Math.max(1, Math.floor(switchRate / endpointRate));
};

export function calculateAICluster(
  gpuCount: number,
  oversubscription: number,
  leafModel: AristaSwitch,
  spineModel: AristaSwitch,
  gpuPlatform: GPUPlatform,
  storagePlatform?: StoragePlatform
): AIClusterResult {
  const warnings: string[] = [];
  const nodeCount = Math.ceil(gpuCount / gpuPlatform.defaultGpusPerNode);

  // 1. Compute Fabric Sizing (Backend)
  const nicsPerPort = getFanoutCount(leafModel.portSpeed, gpuPlatform.computeNicSpeed);
  const breakoutRequired = nicsPerPort > 1;
  const breakoutType = breakoutRequired ? `1x${leafModel.portSpeed} to ${nicsPerPort}x${gpuPlatform.computeNicSpeed}` : undefined;

  const effectiveDownlinkPortsPerLeaf = Math.floor(leafModel.totalPorts / (oversubscription + 1));
  const uplinksPerLeaf = leafModel.totalPorts - effectiveDownlinkPortsPerLeaf;
  
  const totalComputeNics = nodeCount * gpuPlatform.computeNicsPerNode;
  const nicsPerLeaf = effectiveDownlinkPortsPerLeaf * nicsPerPort;
  const leafCount = Math.ceil(totalComputeNics / nicsPerLeaf);
  const usedDownlinkPorts = Math.ceil(totalComputeNics / nicsPerPort);
  
  const totalUplinks = leafCount * uplinksPerLeaf;
  const spineCount = Math.ceil(totalUplinks / spineModel.totalPorts);

  const computeFabric: FabricSizing = {
    leafCount,
    spineCount,
    totalLeafPorts: leafCount * leafModel.totalPorts,
    totalSpinePorts: spineCount * spineModel.totalPorts,
    uplinksPerLeaf,
    downlinksPerLeaf: effectiveDownlinkPortsPerLeaf,
    nicsPerPort,
    breakoutRequired,
    breakoutType,
    usedDownlinkPorts,
    usedUplinkPorts: totalUplinks,
    oversubscriptionRatio: oversubscription,
    warnings: []
  };

  if (breakoutRequired) {
    computeFabric.warnings.push(`Breakout cables required: ${breakoutType}. Each 800G port serves 2x 400G NICs.`);
  }

  if (spineCount > 16) {
    computeFabric.warnings.push('High spine count. Verify if 7800R4 modular density is fully utilized.');
  }

  // 2. Storage Fabric Sizing (Frontend)
  let storageFabric: FabricSizing | undefined;
  if (storagePlatform && storagePlatform.id !== 'NONE') {
    const totalStorageNics = (nodeCount * gpuPlatform.storageNicsPerNode) + 
                             (storagePlatform.nodesPerCluster * storagePlatform.nicsPerStorageNode);
    
    const storageNicsPerPort = getFanoutCount(leafModel.portSpeed, storagePlatform.nicSpeed);
    const storageUplinksPerLeaf = Math.floor(leafModel.totalPorts / 2);
    const storageDownlinksPerLeaf = leafModel.totalPorts - storageUplinksPerLeaf;
    
    const storageLeafCount = Math.ceil(totalStorageNics / (storageDownlinksPerLeaf * storageNicsPerPort));
    const totalStorageUplinks = storageLeafCount * storageUplinksPerLeaf;
    const storageSpineCount = Math.ceil(totalStorageUplinks / spineModel.totalPorts);

    storageFabric = {
      leafCount: storageLeafCount,
      spineCount: storageSpineCount,
      totalLeafPorts: storageLeafCount * leafModel.totalPorts,
      totalSpinePorts: storageSpineCount * spineModel.totalPorts,
      uplinksPerLeaf: storageUplinksPerLeaf,
      downlinksPerLeaf: storageDownlinksPerLeaf,
      nicsPerPort: storageNicsPerPort,
      breakoutRequired: storageNicsPerPort > 1,
      breakoutType: storageNicsPerPort > 1 ? `1x${leafModel.portSpeed} to ${storageNicsPerPort}x${storagePlatform.nicSpeed}` : undefined,
      usedDownlinkPorts: Math.ceil(totalStorageNics / storageNicsPerPort),
      usedUplinkPorts: totalStorageUplinks,
      oversubscriptionRatio: 1,
      warnings: []
    };
  }

  // 3. Rack & Power Planning
  const ruPerNode = gpuPlatform.rackUnits;
  const powerPerNodeKw = gpuPlatform.nodePowerKw;
  
  let nodesPerRack = 1;
  if (ruPerNode < 42) {
    nodesPerRack = Math.min(Math.floor(42 / (ruPerNode + 1)), Math.floor(40 / powerPerNodeKw));
  }
  
  const rackCount = Math.ceil(nodeCount / nodesPerRack);
  const totalPowerKw = nodeCount * powerPerNodeKw + 
                       (leafCount * (leafModel.maxPower / 1000)) + 
                       (spineCount * (spineModel.maxPower / 1000));

  const rackPlanning: RackSizing = {
    rackCount,
    nodesPerRack,
    powerPerRackKw: nodesPerRack * powerPerNodeKw,
    totalPowerKw,
    ruPerNode,
    mgmtNicsPerRack: nodesPerRack * gpuPlatform.mgmtNicsPerNode
  };

  if (rackPlanning.powerPerRackKw > 35) {
    warnings.push('High rack power density (>35kW). Verify liquid cooling or high-airflow containment.');
  }

  if (gpuCount > 32768) {
    warnings.push('Cluster size exceeds standard L3 fabric guidance. Consider 3-tier topology.');
  }

  return {
    gpuCount,
    nodeCount,
    computeFabric,
    storageFabric,
    rackPlanning,
    warnings
  };
}
