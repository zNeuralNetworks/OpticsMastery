import type { PlannerBomLine, PlannerBomSection, PlannerModel } from '../features/ai-planner/types';
import type { MediaRecommendation } from './mediaAdvisor';

interface PlannerModelBase extends Omit<PlannerModel, 'view'> {}

const buildModularChassisBom = (
  model: PlannerModelBase,
  prefix: 'compute' | 'storage',
  switchCount: number,
  totalPortDemand: number,
): PlannerBomLine[] => {
  const { spineSwitch } = model;

  if (
    spineSwitch.series !== '7800R4' ||
    !spineSwitch.linecardSku ||
    !spineSwitch.linecardSlots ||
    !spineSwitch.linecardPorts ||
    !spineSwitch.fabricModuleSku ||
    !spineSwitch.fabricCoolingModuleSku
  ) {
    return [];
  }

  const totalLinecards = Math.min(
    switchCount * spineSwitch.linecardSlots,
    Math.max(switchCount, Math.ceil(totalPortDemand / spineSwitch.linecardPorts)),
  );
  const supervisorsPerChassis = model.inputs.failureDesignPriority === 'STRICT_NO_ISOLATION' ? 2 : 1;
  const supervisorSku = spineSwitch.supervisorSkuPrimary ?? spineSwitch.supervisorSkuSecureBoot;
  const powerSupplyCount =
    model.inputs.failureDesignPriority === 'STRICT_NO_ISOLATION'
      ? spineSwitch.powerSupplyCountRedundant ?? spineSwitch.powerSupplyCountDefault ?? 0
      : spineSwitch.powerSupplyCountDefault ?? 0;

  const modularLines: PlannerBomLine[] = [
    {
      id: `${prefix}-spine-linecard::${spineSwitch.linecardSku}`,
      sku: spineSwitch.linecardSku,
      description: `${spineSwitch.name} AI linecard`,
      quantity: totalLinecards,
      category: 'Switches',
      role: `${prefix}-spine-linecard`,
      quantitySource: 'deterministic',
      note: `${totalLinecards} occupied linecard slots derived from ${totalPortDemand} required spine-facing ${spineSwitch.portSpeed} ports.`,
    },
    {
      id: `${prefix}-spine-power-supply::${spineSwitch.powerSupplySkuPrimary ?? 'ASSUMED-MODULAR-PSU'}`,
      sku: spineSwitch.powerSupplySkuPrimary ?? 'ASSUMED-MODULAR-PSU',
      description: `${spineSwitch.name} power supply`,
      quantity: switchCount * powerSupplyCount,
      category: 'Switches',
      role: `${prefix}-spine-power-supply`,
      quantitySource: spineSwitch.powerSupplySkuPrimary ? 'assumed' : 'assumed',
      note: `${powerSupplyCount} power supply unit(s) per chassis are modeled as a representative placeholder tied to the current redundancy posture. Validate final PSU SKU and count against the exact chassis build before procurement.`,
    },
    {
      id: `${prefix}-spine-fabric-module::${spineSwitch.fabricModuleSku}`,
      sku: spineSwitch.fabricModuleSku,
      description: `${spineSwitch.name} fabric module`,
      quantity: switchCount * 5,
      category: 'Switches',
      role: `${prefix}-spine-fabric-module`,
      quantitySource: 'deterministic',
      note: '7800R4 chassis are modeled with 5 active fabric modules per chassis in the live planner.',
    },
    {
      id: `${prefix}-spine-fabric-cooling::${spineSwitch.fabricCoolingModuleSku}`,
      sku: spineSwitch.fabricCoolingModuleSku,
      description: `${spineSwitch.name} fabric cooling module`,
      quantity: switchCount,
      category: 'Switches',
      role: `${prefix}-spine-fabric-cooling`,
      quantitySource: 'deterministic',
      note: 'One fabric cooling module per 7800R4 chassis is included in the directional hardware BOM.',
    },
  ];

  if (supervisorSku) {
    modularLines.splice(1, 0, {
      id: `${prefix}-spine-supervisor::${supervisorSku}`,
      sku: supervisorSku,
      description: `${spineSwitch.name} supervisor module`,
      quantity: switchCount * supervisorsPerChassis,
      category: 'Switches',
      role: `${prefix}-spine-supervisor`,
      quantitySource: 'deterministic',
      note: `${supervisorsPerChassis} supervisor module(s) per chassis based on the current failure-domain posture.`,
    });
  }

  return modularLines;
};

export const buildPlannerBomLines = (
  model: PlannerModelBase,
  fabricMedia: MediaRecommendation,
  accessMedia: MediaRecommendation,
): PlannerBomLine[] => {
  const { currentResult, leafSwitch, spineSwitch, gpuPlatform, storagePlatform } = model;
  const totalComputeLinks = currentResult.nodeCount * gpuPlatform.computeNicsPerNode;
  const totalStorageLinks = currentResult.storageFabric
    ? (currentResult.nodeCount * gpuPlatform.storageNicsPerNode) +
      ((storagePlatform?.nodesPerCluster ?? 0) * (storagePlatform?.nicsPerStorageNode ?? 0))
    : 0;

  const lines: PlannerBomLine[] = [
    {
      id: `compute-leaf::${leafSwitch.sku}`,
      sku: leafSwitch.sku,
      description: `${leafSwitch.name} compute leaf`,
      quantity: currentResult.computeFabric.leafCount,
      category: 'Switches',
      role: 'compute-leaf',
      quantitySource: 'deterministic',
    },
    {
      id: `compute-spine::${spineSwitch.chassisSku ?? spineSwitch.sku}`,
      sku: spineSwitch.chassisSku ?? spineSwitch.sku,
      description: `${spineSwitch.name} compute spine chassis`,
      quantity: currentResult.computeFabric.spineCount,
      category: 'Switches',
      role: 'compute-spine-chassis',
      quantitySource: 'deterministic',
      note:
        spineSwitch.series === '7800R4'
          ? '7800R4 spines are decomposed below into chassis components based on occupied spine-facing port demand.'
          : undefined,
    },
    {
      id: `compute-node::${gpuPlatform.nodeModelSku}`,
      sku: gpuPlatform.nodeModelSku,
      description: `${gpuPlatform.name} compute node`,
      quantity: currentResult.nodeCount,
      category: 'Compute',
      role: 'compute-node',
      quantitySource: 'deterministic',
    },
    {
      id: 'rack::RACK-42RU-AI',
      sku: 'RACK-42RU-AI',
      description: '42RU AI server rack',
      quantity: currentResult.rackPlanning.rackCount,
      category: 'Infrastructure',
      role: 'rack',
      quantitySource: 'deterministic',
    },
    {
      id: `fabric-interconnect::${fabricMedia.item.sku}`,
      sku: fabricMedia.item.sku,
      description: `${fabricMedia.item.description} for leaf-to-spine fabric links`,
      quantity:
        fabricMedia.quantityModel === 'link-count'
          ? currentResult.computeFabric.usedUplinkPorts
          : currentResult.computeFabric.usedUplinkPorts * 2,
      category: 'Optics',
      role: 'fabric-interconnect',
      quantitySource: fabricMedia.quantityModel === 'link-count' ? 'deterministic' : 'assumed',
      note:
        fabricMedia.quantityModel === 'link-count'
          ? `One assembly per physical link.${'skuPrecision' in fabricMedia.item && fabricMedia.item.skuPrecision === 'family-length-variable' ? ' Base cable family SKU shown; exact length suffix must be selected from the allowed length set.' : ''}`
          : `Two optical endpoints assumed per physical interconnect.${'skuPrecision' in fabricMedia.item && fabricMedia.item.skuPrecision === 'family-length-variable' ? ' Base cable family SKU shown; exact length suffix must be selected from the allowed length set.' : ''}`,
    },
    {
      id: `compute-access::${accessMedia.item.sku}`,
      sku: accessMedia.item.sku,
      description: `${accessMedia.item.description} for compute access links`,
      quantity:
        accessMedia.quantityModel === 'breakout-assembly'
          ? currentResult.computeFabric.usedDownlinkPorts
          : totalComputeLinks,
      category: 'Optics',
      role: 'compute-access',
      quantitySource: accessMedia.quantityModel === 'endpoint-optics' ? 'assumed' : 'deterministic',
      note:
        accessMedia.quantityModel === 'endpoint-optics'
          ? 'Represents logical endpoint media; exact NIC-side optic count depends on server optical strategy.'
          : ('skuPrecision' in accessMedia.item && accessMedia.item.skuPrecision === 'family-length-variable'
            ? 'Base cable family SKU shown; exact length suffix must be selected from the allowed length set.'
            : undefined),
    },
  ];

  lines.push(
    ...buildModularChassisBom(
      model,
      'compute',
      currentResult.computeFabric.spineCount,
      currentResult.computeFabric.usedUplinkPorts,
    ),
  );

  if (currentResult.computeFabric.breakoutRequired) {
    lines.push({
      id: `breakout-assembly::${leafSwitch.sku}`,
      sku: `${leafSwitch.portSpeed}-BREAKOUT`,
      description: `Breakout assemblies required for ${currentResult.computeFabric.breakoutType}`,
      quantity: currentResult.computeFabric.usedDownlinkPorts,
      category: 'Cabling',
      role: 'breakout-assembly',
      quantitySource: 'deterministic',
      note: 'One breakout assembly per active downlink port.',
    });
  }

  if (currentResult.storageFabric && storagePlatform && storagePlatform.id !== 'NONE') {
    lines.push(
      {
        id: `storage-leaf::${leafSwitch.sku}`,
        sku: leafSwitch.sku,
        description: `${leafSwitch.name} storage leaf`,
        quantity: currentResult.storageFabric.leafCount,
        category: 'Switches',
        role: 'storage-leaf',
        quantitySource: 'deterministic',
      },
      {
        id: `storage-spine::${spineSwitch.chassisSku ?? spineSwitch.sku}`,
        sku: spineSwitch.chassisSku ?? spineSwitch.sku,
        description: `${spineSwitch.name} storage spine chassis`,
        quantity: currentResult.storageFabric.spineCount,
        category: 'Switches',
        role: 'storage-spine-chassis',
        quantitySource: 'deterministic',
      },
      {
        id: `storage-node::${storagePlatform.id}`,
        sku: storagePlatform.id,
        description: `${storagePlatform.name} storage node`,
        quantity: storagePlatform.nodesPerCluster,
        category: 'Storage',
        role: 'storage-node',
        quantitySource: 'deterministic',
      },
      {
        id: `storage-media::${fabricMedia.item.sku}`,
        sku: fabricMedia.item.sku,
        description: `${fabricMedia.item.description} for storage fabric links`,
        quantity: totalStorageLinks,
        category: 'Optics',
        role: 'storage-fabric-media',
        quantitySource: fabricMedia.quantityModel === 'endpoint-optics' ? 'assumed' : 'deterministic',
        note: 'Storage media mirrors the representative fabric media family in full-stack mode.',
      },
    );

    lines.push(
      ...buildModularChassisBom(
        model,
        'storage',
        currentResult.storageFabric.spineCount,
        currentResult.storageFabric.usedUplinkPorts,
      ),
    );
  }

  return lines;
};

export const appendPlannerPlaceholderBomLines = (model: PlannerModelBase, lines: PlannerBomLine[]): PlannerBomLine[] => [
  ...lines,
  {
    id: 'management-control::ASSUMED-OOB-FABRIC',
    sku: 'ASSUMED-OOB-FABRIC',
    description: 'Representative out-of-band management and control-plane bundle',
    quantity: Math.max(2, model.currentResult.rackPlanning.rackCount > 8 ? 4 : 2),
    category: 'Infrastructure',
    role: 'management-control',
    quantitySource: 'assumed',
    note: 'Validate OOB switching, management uplinks, and any control-plane segregation requirements before quoting.',
  },
  {
    id: 'structured-cabling::ASSUMED-OPTICAL-PATCHING',
    sku: 'ASSUMED-OPTICAL-PATCHING',
    description: 'Representative structured cabling and patching allowance for inter-rack optical runs',
    quantity: Math.max(model.currentResult.computeFabric.usedUplinkPorts, model.currentResult.computeFabric.usedDownlinkPorts),
    category: 'Cabling',
    role: 'structured-cabling',
    quantitySource: 'assumed',
    note: 'Placeholder for patch panels, trunks, and structured optical pathing derived from the final rack plan.',
  },
  {
    id: 'ops-spares::ASSUMED-SPARES',
    sku: 'ASSUMED-SPARES',
    description: 'Representative spare optics and break-fix allowance',
    quantity: Math.max(2, Math.ceil(model.currentResult.computeFabric.leafCount / 4)),
    category: 'Infrastructure',
    role: 'ops-spares',
    quantitySource: 'assumed',
    note: 'Directional spares placeholder for operations readiness, not a validated sparing policy.',
  },
];

export const buildPlannerBomSections = (lines: PlannerBomLine[]): PlannerBomSection[] => {
  const sections: Array<{ title: string; description: string; roles: string[] }> = [
    {
      title: 'Compute fabric',
      description: 'Deterministic compute switching and node inventory derived from the current planner result.',
      roles: ['compute-leaf', 'compute-spine-chassis', 'compute-spine-linecard', 'compute-spine-supervisor', 'compute-spine-power-supply', 'compute-spine-fabric-module', 'compute-spine-fabric-cooling', 'compute-node'],
    },
    {
      title: 'Storage fabric',
      description: 'Representative storage-switching and storage-node lines when compute + storage mode is enabled.',
      roles: ['storage-leaf', 'storage-spine-chassis', 'storage-spine-linecard', 'storage-spine-supervisor', 'storage-spine-power-supply', 'storage-spine-fabric-module', 'storage-spine-fabric-cooling', 'storage-node'],
    },
    {
      title: 'Optics and cabling',
      description: 'Fabric and access media, breakout assemblies, and structured-cabling placeholders.',
      roles: ['fabric-interconnect', 'compute-access', 'breakout-assembly', 'storage-fabric-media', 'structured-cabling', 'management-cabling'],
    },
    {
      title: 'Infrastructure and operations',
      description: 'Directional racks, OOB, and lifecycle-support placeholders that should be validated before quoting.',
      roles: ['rack', 'management-control', 'ops-spares'],
    },
  ];

  return sections
    .map((section) => ({
      title: section.title,
      description: section.description,
      lines: lines.filter((line) => section.roles.includes(line.role)),
    }))
    .filter((section) => section.lines.length > 0);
};
