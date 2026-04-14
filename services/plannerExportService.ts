import { DEFAULT_PLANNER_INPUTS } from '../features/ai-planner/defaults';
import { FABRIC_PROFILES } from '../data/fabricProfiles';
import type {
  PlannerCalculationTrace,
  PlannerComputeFabricEvaluation,
  PlannerFailureAnalysisRow,
  PlannerInputTrace,
  PlannerModel,
  PlannerRequirementStatus,
  PlannerTopologyJustificationRow,
} from '../features/ai-planner/types';
import { buildDatedFilename, downloadCSV, downloadWorkbook, type WorkbookSheetDefinition } from '../shared/lib/export';

type CsvPrimitive = string | number | boolean;

interface PlannerExportTable<T extends Record<string, CsvPrimitive>> {
  headers: string[];
  rows: T[];
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

const stringifyList = (items: string[]) => items.join(' | ');

const stringifySourceClasses = (items: string[]) => items.join(', ');

const formatInputSource = (source: string) => {
  switch (source) {
    case 'user-selected':
      return 'Specified';
    case 'defaulted':
      return 'Default';
    case 'planner-policy':
      return 'Design standard';
    default:
      return source;
  }
};

const formatCalculationResult = (value: string | number, unit: string) => {
  if (!unit || unit === 'topology' || unit === 'posture' || unit === 'assumption') {
    return `${value}`;
  }

  return `${value} ${unit}`;
};

const toCsvMatrix = <T extends Record<string, CsvPrimitive>>(table: PlannerExportTable<T>) =>
  table.rows.map((row) => table.headers.map((header) => row[header]));

const createTable = <T extends Record<string, CsvPrimitive>>(headers: string[], rows: T[]): PlannerExportTable<T> => ({
  headers,
  rows,
});

const createSectionRows = (title: string, values: string[]) => [
  [title],
  ...values.map((value) => ['', value]),
  [''],
];

const createKeyValueRows = (title: string, entries: Array<[string, CsvPrimitive]>) => [
  [title],
  ['Field', 'Value'],
  ...entries.map(([field, value]) => [field, value]),
  [''],
];

const getSpineSelectionPolicyTarget = (leafCount: number, maxOversubscriptionTarget: number) => {
  if (leafCount > 40) {
    return 2;
  }

  if (leafCount > 20 || maxOversubscriptionTarget <= 1.1) {
    return 3;
  }

  return 4;
};

const buildInputRows = (model: PlannerModel): PlannerInputTrace[] => {
  const { inputs, gpuPlatform, storagePlatform, leafSwitch, spineSwitch } = model;
  const fabricProfile = FABRIC_PROFILES.find((profile) => profile.id === inputs.fabricProfileId);
  const isCustomProfile = fabricProfile?.allowCustomOverride ?? false;
  const selectedStorage = inputs.scope === 'COMPUTE_AND_STORAGE' ? storagePlatform?.name ?? 'None' : 'Not enabled';

  return [
    {
      field: 'GPU platform',
      value: gpuPlatform.name,
      source: inputs.selectedGpuId === DEFAULT_PLANNER_INPUTS.selectedGpuId ? 'defaulted' : 'user-selected',
      note: `${gpuPlatform.defaultGpusPerNode} GPUs per node, ${gpuPlatform.computeNicsPerNode}x ${gpuPlatform.computeNicSpeed} compute NICs`,
    },
    {
      field: 'GPU count',
      value: inputs.gpuCount,
      source: inputs.gpuCount === DEFAULT_PLANNER_INPUTS.gpuCount ? 'defaulted' : 'user-selected',
      note: 'Current-scale planning target',
    },
    {
      field: 'Target GPU count',
      value: inputs.targetGpuCount ?? inputs.gpuCount,
      source: (inputs.targetGpuCount ?? DEFAULT_PLANNER_INPUTS.targetGpuCount) === DEFAULT_PLANNER_INPUTS.targetGpuCount ? 'defaulted' : 'user-selected',
      note: 'Growth planning target used for capacity deltas and auto spine selection',
    },
    {
      field: 'NICs per node',
      value: gpuPlatform.computeNicsPerNode,
      source: 'planner-policy',
      note: `Derived from ${gpuPlatform.name}`,
    },
    {
      field: 'Scope',
      value: inputs.scope,
      source: inputs.scope === DEFAULT_PLANNER_INPUTS.scope ? 'defaulted' : 'user-selected',
      note: 'Controls whether storage fabric sizing is included',
    },
    {
      field: 'Rail mode',
      value: inputs.railMode,
      source: inputs.railMode === DEFAULT_PLANNER_INPUTS.railMode ? 'defaulted' : 'user-selected',
      note: `Platform native rail design: ${gpuPlatform.railDesign}`,
    },
    {
      field: 'Fabric profile',
      value: fabricProfile?.label ?? inputs.fabricProfileId,
      source: inputs.fabricProfileId === DEFAULT_PLANNER_INPUTS.fabricProfileId ? 'defaulted' : 'user-selected',
      note: fabricProfile?.description ?? 'Selected design profile',
    },
    {
      field: 'Leaf switch',
      value: leafSwitch.name,
      source: isCustomProfile
        ? (inputs.customLeafSku ? 'user-selected' : 'defaulted')
        : 'planner-policy',
      note: `${leafSwitch.sku} · ${leafSwitch.totalPorts}x ${leafSwitch.portSpeed}`,
    },
    {
      field: 'Spine switch',
      value: spineSwitch.name,
      source: isCustomProfile
        ? (inputs.customSpineSku ? 'user-selected' : 'defaulted')
        : 'planner-policy',
      note: isCustomProfile
        ? `${spineSwitch.sku} selected in custom mode`
        : `${spineSwitch.sku} auto-selected from future leaf demand and target spine count policy`,
    },
    {
      field: 'Oversubscription target',
      value: inputs.oversubscription,
      source: inputs.oversubscription === DEFAULT_PLANNER_INPUTS.oversubscription ? 'defaulted' : 'user-selected',
      note: 'Used for downlink/uplink split on each compute leaf',
    },
    {
      field: 'Latency target (usec)',
      value: inputs.latencyTargetUsec,
      source: inputs.latencyTargetUsec === DEFAULT_PLANNER_INPUTS.latencyTargetUsec ? 'defaulted' : 'user-selected',
      note: 'Directional cut-through target for compute-fabric evaluation',
    },
    {
      field: 'Routing preference',
      value: inputs.routingPreference,
      source: inputs.routingPreference === DEFAULT_PLANNER_INPUTS.routingPreference ? 'defaulted' : 'user-selected',
      note: 'Feeds underlay posture and convergence guidance',
    },
    {
      field: 'Storage platform',
      value: selectedStorage,
      source: selectedStorage === 'Not enabled'
        ? 'planner-policy'
        : (inputs.selectedStorageId === DEFAULT_PLANNER_INPUTS.selectedStorageId ? 'defaulted' : 'user-selected'),
      note: inputs.scope === 'COMPUTE_AND_STORAGE' ? 'Included in storage-fabric sizing' : 'No storage-fabric sizing in compute-only scope',
    },
    {
      field: 'Inter-rack distance (m)',
      value: inputs.distanceMeters,
      source: inputs.distanceMeters === DEFAULT_PLANNER_INPUTS.distanceMeters ? 'defaulted' : 'user-selected',
      note: 'Used by media advisor and optics assumptions',
    },
    {
      field: 'Media preference',
      value: inputs.mediaPreference,
      source: inputs.mediaPreference === DEFAULT_PLANNER_INPUTS.mediaPreference ? 'defaulted' : 'user-selected',
      note: 'Biases recommendation between optics, AOC, DAC, and AUTO mode',
    },
    {
      field: 'Failure-domain posture',
      value: inputs.failureDesignPriority,
      source: inputs.failureDesignPriority === DEFAULT_PLANNER_INPUTS.failureDesignPriority ? 'defaulted' : 'user-selected',
      note: 'Affects redundancy posture and supervisor assumptions',
    },
    {
      field: 'Fabric intent',
      value: inputs.fabricIntent,
      source: 'planner-policy',
      note: 'Design package scoped for AI training fabrics',
    },
    {
      field: 'Collective traffic profile',
      value: inputs.collectiveTrafficProfile,
      source: 'planner-policy',
      note: 'Drives all-reduce-sensitive evaluation outputs',
    },
    {
      field: 'Max oversubscription policy',
      value: inputs.maxOversubscriptionTarget,
      source: 'planner-policy',
      note: 'Used for spine selection and fabric evaluation',
    },
    {
      field: 'Lossless profile',
      value: inputs.losslessProfile,
      source: 'planner-policy',
      note: 'RoCEv2 directional design posture used for compute-fabric evaluation',
    },
  ];
};

const buildCalculationRows = (model: PlannerModel): PlannerCalculationTrace[] => {
  const { inputs, gpuPlatform, storagePlatform, leafSwitch, spineSwitch, currentResult, futureResult } = model;
  const rows: PlannerCalculationTrace[] = [];
  const futureGpuTarget = Math.max(inputs.gpuCount, inputs.targetGpuCount ?? inputs.gpuCount);
  const currentNodeCount = currentResult.nodeCount;
  const futureNodeCount = futureResult.nodeCount;
  const computeNicsPerPort = getFanoutCount(leafSwitch.portSpeed, gpuPlatform.computeNicSpeed);
  const computeDownlinksPerLeaf = Math.floor(leafSwitch.totalPorts / (inputs.oversubscription + 1));
  const computeUplinksPerLeaf = leafSwitch.totalPorts - computeDownlinksPerLeaf;
  const computeNicsPerLeaf = computeDownlinksPerLeaf * computeNicsPerPort;
  const currentTotalComputeNics = currentNodeCount * gpuPlatform.computeNicsPerNode;
  const futureTotalComputeNics = futureNodeCount * gpuPlatform.computeNicsPerNode;
  const futureLeafDemand = futureResult.computeFabric.leafCount;
  const futureTotalUplinks = futureLeafDemand * computeUplinksPerLeaf;
  const targetMaxSpines = getSpineSelectionPolicyTarget(futureLeafDemand, inputs.maxOversubscriptionTarget);
  const selectedSpineEstimate = Math.ceil(futureTotalUplinks / spineSwitch.totalPorts);
  const currentEndpointCount = currentNodeCount * gpuPlatform.computeNicsPerNode;
  const futureEndpointCount = futureNodeCount * gpuPlatform.computeNicsPerNode;
  const topologyRecommendation = model.view.computeFabricEvaluation.topologyDecision.recommendedTopology;
  const hopCount = model.view.computeFabricEvaluation.latencyDetail.hopCount;
  const estimatedPathLatencyUsec = model.view.computeFabricEvaluation.latencyDetail.estimatedPathLatencyUsec;

  rows.push(
    {
      group: 'Topology',
      metric: 'Current compute endpoint count',
      formulaLabel: 'nodeCount * computeNicsPerNode',
      expression: `${currentNodeCount} * ${gpuPlatform.computeNicsPerNode}`,
      value: currentEndpointCount,
      unit: 'endpoints',
      note: 'Host-facing compute NIC endpoints presented to the backend fabric at current scale',
    },
    {
      group: 'Topology',
      metric: 'Future compute endpoint count',
      formulaLabel: 'futureNodeCount * computeNicsPerNode',
      expression: `${futureNodeCount} * ${gpuPlatform.computeNicsPerNode}`,
      value: futureEndpointCount,
      unit: 'endpoints',
      note: 'Projected host-facing compute NIC endpoints at the growth target',
    },
    {
      group: 'Inputs',
      metric: 'GPUs per node',
      formulaLabel: 'platform default',
      expression: `${gpuPlatform.defaultGpusPerNode}`,
      value: gpuPlatform.defaultGpusPerNode,
      unit: 'gpus/node',
      note: `Platform basis for ${gpuPlatform.name}`,
    },
    {
      group: 'Current scale',
      metric: 'Node count',
      formulaLabel: 'ceil(gpuCount / gpusPerNode)',
      expression: `ceil(${inputs.gpuCount} / ${gpuPlatform.defaultGpusPerNode})`,
      value: currentNodeCount,
      unit: 'nodes',
      note: 'Compute node count at current planning scale',
    },
    {
      group: 'Current scale',
      metric: 'Total compute NICs',
      formulaLabel: 'nodeCount * computeNicsPerNode',
      expression: `${currentNodeCount} * ${gpuPlatform.computeNicsPerNode}`,
      value: currentTotalComputeNics,
      unit: 'nics',
      note: 'Total backend NIC endpoints presented to compute fabric',
    },
    {
      group: 'Latency',
      metric: 'Topology recommendation',
      formulaLabel: 'fabric evaluation output',
      expression: topologyRecommendation,
      value: topologyRecommendation,
      unit: 'topology',
      note: 'Explicit export of current 2-tier / 3-tier / rail-optimized recommendation',
    },
    {
      group: 'Latency',
      metric: 'Hop count assumption',
      formulaLabel: 'topology model',
      expression: `${hopCount}`,
      value: hopCount,
      unit: 'hops',
      note: model.view.computeFabricEvaluation.latencyDetail.hopModel,
    },
    {
      group: 'Latency',
      metric: 'Estimated path latency budget',
      formulaLabel: 'representative cut-through hop sum',
      expression: `${model.view.computeFabricEvaluation.latencyDetail.leafLatencyNs}ns leaf + ${model.view.computeFabricEvaluation.latencyDetail.spineLatencyNs}ns spine components`,
      value: estimatedPathLatencyUsec,
      unit: 'usec',
      note: `Directional estimate against ${inputs.latencyTargetUsec.toFixed(1)} usec target`,
    },
    {
      group: 'Compute leaf math',
      metric: 'NICs per leaf port',
      formulaLabel: 'floor(leafPortSpeed / nicSpeed)',
      expression: `floor(${parseSpeed(leafSwitch.portSpeed)} / ${parseSpeed(gpuPlatform.computeNicSpeed)})`,
      value: computeNicsPerPort,
      unit: 'nics/port',
      note: computeNicsPerPort > 1 ? `Breakout required: ${currentResult.computeFabric.breakoutType ?? 'yes'}` : 'Native port match, no breakout required',
    },
    {
      group: 'Compute leaf math',
      metric: 'Usable downlinks per leaf',
      formulaLabel: 'floor(totalPorts / (oversubscription + 1))',
      expression: `floor(${leafSwitch.totalPorts} / (${inputs.oversubscription} + 1))`,
      value: computeDownlinksPerLeaf,
      unit: 'ports',
      note: 'Leaf ports allocated to GPU-facing downlinks',
    },
    {
      group: 'Compute leaf math',
      metric: 'Uplinks per leaf',
      formulaLabel: 'totalPorts - downlinksPerLeaf',
      expression: `${leafSwitch.totalPorts} - ${computeDownlinksPerLeaf}`,
      value: computeUplinksPerLeaf,
      unit: 'ports',
      note: 'Remaining leaf ports reserved for spine uplinks',
    },
    {
      group: 'Compute leaf math',
      metric: 'NICs served per leaf',
      formulaLabel: 'downlinksPerLeaf * nicsPerPort',
      expression: `${computeDownlinksPerLeaf} * ${computeNicsPerPort}`,
      value: computeNicsPerLeaf,
      unit: 'nics/leaf',
      note: 'Effective NIC fanout capacity per compute leaf',
    },
    {
      group: 'Current scale',
      metric: 'Compute leaf count',
      formulaLabel: 'ceil(totalComputeNics / nicsPerLeaf)',
      expression: `ceil(${currentTotalComputeNics} / ${computeNicsPerLeaf})`,
      value: currentResult.computeFabric.leafCount,
      unit: 'leaves',
      note: 'Current compute-fabric leaf requirement',
    },
    {
      group: 'Current scale',
      metric: 'Used downlink ports',
      formulaLabel: 'ceil(totalComputeNics / nicsPerPort)',
      expression: `ceil(${currentTotalComputeNics} / ${computeNicsPerPort})`,
      value: currentResult.computeFabric.usedDownlinkPorts,
      unit: 'ports',
      note: 'Total leaf downlink ports consumed by compute NICs',
    },
    {
      group: 'Current scale',
      metric: 'Total leaf uplinks',
      formulaLabel: 'leafCount * uplinksPerLeaf',
      expression: `${currentResult.computeFabric.leafCount} * ${computeUplinksPerLeaf}`,
      value: currentResult.computeFabric.usedUplinkPorts,
      unit: 'ports',
      note: 'Aggregate compute uplinks presented to the spine tier',
    },
    {
      group: 'Current scale',
      metric: 'Spine count',
      formulaLabel: 'ceil(totalLeafUplinks / spinePorts)',
      expression: `ceil(${currentResult.computeFabric.usedUplinkPorts} / ${spineSwitch.totalPorts})`,
      value: currentResult.computeFabric.spineCount,
      unit: 'spines',
      note: 'Current compute-fabric spine requirement',
    },
    {
      group: 'Current scale',
      metric: 'Oversubscription result',
      formulaLabel: 'specified design target',
      expression: `${inputs.oversubscription}:1`,
      value: currentResult.computeFabric.oversubscriptionRatio,
      unit: 'ratio',
      note: 'Applied to leaf downlink/uplink split',
    },
    {
      group: 'ECMP',
      metric: 'Current ECMP path count',
      formulaLabel: 'spineCount',
      expression: `${currentResult.computeFabric.spineCount}`,
      value: model.view.computeFabricEvaluation.ecmpDetail.currentPathCount,
      unit: 'paths',
      note: 'Equal-cost path count available from each leaf under current spine width',
    },
    {
      group: 'Spine selection policy',
      metric: 'Future node count',
      formulaLabel: 'ceil(targetGpuCount / gpusPerNode)',
      expression: `ceil(${futureGpuTarget} / ${gpuPlatform.defaultGpusPerNode})`,
      value: futureNodeCount,
      unit: 'nodes',
      note: 'Growth target used for spine auto-selection',
    },
    {
      group: 'Spine selection policy',
      metric: 'Future compute leaf count',
      formulaLabel: 'ceil(futureComputeNics / nicsPerLeaf)',
      expression: `ceil(${futureTotalComputeNics} / ${computeNicsPerLeaf})`,
      value: futureLeafDemand,
      unit: 'leaves',
      note: 'Leaf demand forecast used in spine-class selection',
    },
    {
      group: 'Spine selection policy',
      metric: 'Future total uplinks',
      formulaLabel: 'futureLeafCount * uplinksPerLeaf',
      expression: `${futureLeafDemand} * ${computeUplinksPerLeaf}`,
      value: futureTotalUplinks,
      unit: 'ports',
      note: 'Projected spine-facing uplink demand at growth target',
    },
    {
      group: 'Spine selection policy',
      metric: 'Target max spines',
      formulaLabel: 'policy(leafCount, maxOversubscriptionTarget)',
      expression: futureLeafDemand > 40
        ? 'leafCount > 40 -> 2'
        : futureLeafDemand > 20 || inputs.maxOversubscriptionTarget <= 1.1
          ? 'leafCount > 20 or maxOversubscriptionTarget <= 1.1 -> 3'
          : 'otherwise -> 4',
      value: targetMaxSpines,
      unit: 'spines',
      note: 'Design standard used to prefer larger modular spine classes as scale grows',
    },
    {
      group: 'Spine selection policy',
      metric: 'Selected spine estimated count',
      formulaLabel: 'ceil(futureUplinks / selectedSpinePorts)',
      expression: `ceil(${futureTotalUplinks} / ${spineSwitch.totalPorts})`,
      value: selectedSpineEstimate,
      unit: 'spines',
      note: `${spineSwitch.name} selected because estimated spine count stays within policy target where possible`,
    },
    {
      group: 'Fault tolerance',
      metric: 'Single-spine proportional bandwidth share',
      formulaLabel: '100 / spineCount',
      expression: `100 / ${Math.max(1, currentResult.computeFabric.spineCount)}`,
      value: model.view.computeFabricEvaluation.faultToleranceAssessment.spineProportionalSharePct,
      unit: 'percent',
      note: 'Expected proportional bisection loss for one evenly loaded spine failure',
    },
    {
      group: 'Fault tolerance',
      metric: 'Leaf isolation posture',
      formulaLabel: 'failure-domain assessment',
      expression: model.inputs.railMode,
      value: model.view.computeFabricEvaluation.faultToleranceAssessment.leafIsolationRisk,
      unit: 'posture',
      note: 'Exported isolation-risk statement for single-leaf failure',
    },
    {
      group: 'Rail posture',
      metric: 'Host spread assumption',
      formulaLabel: 'rail posture',
      expression: model.inputs.railMode,
      value: model.view.computeFabricEvaluation.topologyDecision.failureDomainNote,
      unit: 'assumption',
      note: 'Makes the rail / host-attachment dependency explicit in the audit trail',
    },
    {
      group: 'Rack planning',
      metric: 'Nodes per rack',
      formulaLabel: 'min(floor(42 / (ruPerNode + 1)), floor(40 / nodePowerKw))',
      expression: `min(floor(42 / (${gpuPlatform.rackUnits} + 1)), floor(40 / ${gpuPlatform.nodePowerKw}))`,
      value: currentResult.rackPlanning.nodesPerRack,
      unit: 'nodes/rack',
      note: 'Representative rack envelope using RU and power heuristics',
    },
    {
      group: 'Rack planning',
      metric: 'Rack count',
      formulaLabel: 'ceil(nodeCount / nodesPerRack)',
      expression: `ceil(${currentNodeCount} / ${currentResult.rackPlanning.nodesPerRack})`,
      value: currentResult.rackPlanning.rackCount,
      unit: 'racks',
      note: 'Representative rack requirement for current scale',
    },
    {
      group: 'Rack planning',
      metric: 'Power per rack',
      formulaLabel: 'nodesPerRack * nodePowerKw',
      expression: `${currentResult.rackPlanning.nodesPerRack} * ${gpuPlatform.nodePowerKw}`,
      value: currentResult.rackPlanning.powerPerRackKw,
      unit: 'kW',
      note: 'GPU node power only; fabric power is added to total power',
    },
    {
      group: 'Rack planning',
      metric: 'Total power',
      formulaLabel: 'nodePower + leafPower + spinePower',
      expression: `(${currentNodeCount} * ${gpuPlatform.nodePowerKw}) + (${currentResult.computeFabric.leafCount} * ${leafSwitch.maxPower / 1000}) + (${currentResult.computeFabric.spineCount} * ${spineSwitch.maxPower / 1000})`,
      value: currentResult.rackPlanning.totalPowerKw,
      unit: 'kW',
      note: 'Representative total power envelope for current cluster design',
    },
    {
      group: 'Growth deltas',
      metric: 'Additional leaves',
      formulaLabel: 'futureLeafCount - currentLeafCount',
      expression: `${futureResult.computeFabric.leafCount} - ${currentResult.computeFabric.leafCount}`,
      value: Math.max(0, futureResult.computeFabric.leafCount - currentResult.computeFabric.leafCount),
      unit: 'leaves',
      note: 'Compute-fabric growth delta',
    },
    {
      group: 'Growth deltas',
      metric: 'Additional spines',
      formulaLabel: 'futureSpineCount - currentSpineCount',
      expression: `${futureResult.computeFabric.spineCount} - ${currentResult.computeFabric.spineCount}`,
      value: Math.max(0, futureResult.computeFabric.spineCount - currentResult.computeFabric.spineCount),
      unit: 'spines',
      note: 'Compute-fabric growth delta',
    },
    {
      group: 'Growth deltas',
      metric: 'Additional racks',
      formulaLabel: 'futureRackCount - currentRackCount',
      expression: `${futureResult.rackPlanning.rackCount} - ${currentResult.rackPlanning.rackCount}`,
      value: Math.max(0, futureResult.rackPlanning.rackCount - currentResult.rackPlanning.rackCount),
      unit: 'racks',
      note: 'Representative rack growth delta',
    },
  );

  if (currentResult.storageFabric && storagePlatform) {
    const totalStorageNics =
      (currentNodeCount * gpuPlatform.storageNicsPerNode) +
      (storagePlatform.nodesPerCluster * storagePlatform.nicsPerStorageNode);
    const storageNicsPerPort = getFanoutCount(leafSwitch.portSpeed, storagePlatform.nicSpeed);
    const storageUplinksPerLeaf = Math.floor(leafSwitch.totalPorts / 2);
    const storageDownlinksPerLeaf = leafSwitch.totalPorts - storageUplinksPerLeaf;

    rows.push(
      {
        group: 'Storage fabric',
        metric: 'Total storage NICs',
        formulaLabel: '(nodeCount * storageNicsPerNode) + (storageNodes * nicsPerStorageNode)',
        expression: `(${currentNodeCount} * ${gpuPlatform.storageNicsPerNode}) + (${storagePlatform.nodesPerCluster} * ${storagePlatform.nicsPerStorageNode})`,
        value: totalStorageNics,
        unit: 'nics',
        note: `${storagePlatform.name} storage-fabric attachment demand`,
      },
      {
        group: 'Storage fabric',
        metric: 'Storage NICs per leaf port',
        formulaLabel: 'floor(leafPortSpeed / storageNicSpeed)',
        expression: `floor(${parseSpeed(leafSwitch.portSpeed)} / ${parseSpeed(storagePlatform.nicSpeed)})`,
        value: storageNicsPerPort,
        unit: 'nics/port',
        note: 'Frontend storage fanout per leaf port',
      },
      {
        group: 'Storage fabric',
        metric: 'Storage downlinks per leaf',
        formulaLabel: 'totalPorts - floor(totalPorts / 2)',
        expression: `${leafSwitch.totalPorts} - floor(${leafSwitch.totalPorts} / 2)`,
        value: storageDownlinksPerLeaf,
        unit: 'ports',
        note: 'Frontend design uses a 50/50 split between storage downlinks and uplinks',
      },
      {
        group: 'Storage fabric',
        metric: 'Storage uplinks per leaf',
        formulaLabel: 'floor(totalPorts / 2)',
        expression: `floor(${leafSwitch.totalPorts} / 2)`,
        value: storageUplinksPerLeaf,
        unit: 'ports',
        note: 'Storage leaf uplinks reserved toward storage spines',
      },
      {
        group: 'Storage fabric',
        metric: 'Storage leaf count',
        formulaLabel: 'ceil(totalStorageNics / (storageDownlinksPerLeaf * storageNicsPerPort))',
        expression: `ceil(${totalStorageNics} / (${storageDownlinksPerLeaf} * ${storageNicsPerPort}))`,
        value: currentResult.storageFabric.leafCount,
        unit: 'leaves',
        note: 'Dedicated storage leaf requirement',
      },
      {
        group: 'Storage fabric',
        metric: 'Storage spine count',
        formulaLabel: 'ceil(totalStorageUplinks / spinePorts)',
        expression: `ceil(${currentResult.storageFabric.usedUplinkPorts} / ${spineSwitch.totalPorts})`,
        value: currentResult.storageFabric.spineCount,
        unit: 'spines',
        note: 'Dedicated storage spine requirement',
      },
    );
  }

  return rows;
};

const buildDecisionTable = (model: PlannerModel) => createTable(
  [
    'title',
    'decision',
    'why',
    'tradeoffs',
    'alternatives',
    'changeConditions',
    'implementationConsequences',
    'confidence',
    'validationState',
    'sourceClass',
    'audience',
  ],
  model.view.designPackage.decisionRecord.items.map((item) => ({
    title: item.title,
    decision: item.decision,
    why: item.why,
    tradeoffs: stringifyList(item.tradeoffs),
    alternatives: stringifyList(item.alternativesConsidered),
    changeConditions: stringifyList(item.changeConditions),
    implementationConsequences: stringifyList(item.implementationConsequences),
    confidence: item.meta.confidence,
    validationState: item.meta.validationState,
    sourceClass: stringifySourceClasses(item.meta.sourceClass),
    audience: item.meta.audience,
  })),
);

const buildScorecardTable = (scorecard: PlannerRequirementStatus[]) => createTable(
  ['requirement', 'status', 'summary', 'why', 'followUpValidation'],
  scorecard.map((item) => ({
    requirement: item.requirement,
    status: item.status,
    summary: item.summary,
    why: item.why,
    followUpValidation: item.followUpValidation,
  })),
);

const buildTopologyJustificationTable = (model: PlannerModel) => {
  const evaluation = model.view.computeFabricEvaluation;
  const topology = evaluation.topologyJustification;

  return createTable(
    ['criterion', 'currentValue', 'assessment', 'why', 'followUpValidation'],
    [
      {
        criterion: 'Current compute endpoint count',
        currentValue: topology.currentEndpointCount,
        assessment: evaluation.topologyDecision.recommendedTopology,
        why: `Current compute endpoint scale is modeled as ${topology.currentEndpointCount} host-facing NIC endpoints.`,
        followUpValidation: 'Confirm host NIC count and rail attachment model match the customer design intent.',
      },
      {
        criterion: 'Future compute endpoint count',
        currentValue: topology.futureEndpointCount,
        assessment: evaluation.topologyDecision.recommendedTopology,
        why: `Growth planning pushes the fabric toward ${topology.futureEndpointCount} compute endpoints.`,
        followUpValidation: evaluation.topologyDecision.whenThisBreaks,
      },
      {
        criterion: '2-tier Clos assessment',
        currentValue: `${topology.currentLeafCount} leaves / ${topology.currentSpineCount} spines`,
        assessment: topology.twoTierAssessment,
        why: evaluation.topologyDecision.decisionRationale,
        followUpValidation: evaluation.topologyDecision.whenThisBreaks,
      },
      {
        criterion: '3-tier Clos assessment',
        currentValue: `${topology.futureLeafCount} leaves / ${topology.futureSpineCount} spines`,
        assessment: topology.threeTierAssessment,
        why: 'Super-spine justification must be explicit at larger radix, inter-hall, or structured growth scales.',
        followUpValidation: 'Validate latency and control-plane complexity before defending a 3-tier architecture.',
      },
      {
        criterion: 'Rail-optimized posture',
        currentValue: model.inputs.railMode,
        assessment: topology.railOptimizedAssessment,
        why: evaluation.topologyDecision.failureDomainNote,
        followUpValidation: 'Validate host-to-rail spread, cabling locality, and failure boundaries during implementation.',
      },
    ] satisfies PlannerTopologyJustificationRow[],
  );
};

const buildFailureAnalysisTable = (model: PlannerModel) => {
  const fault = model.view.computeFabricEvaluation.faultToleranceAssessment;

  return createTable(
    [
      'scenario',
      'failureDomain',
      'reachabilityImpact',
      'bandwidthImpact',
      'isolationRisk',
      'gracefulDegradation',
      'designResponse',
      'validationAction',
    ],
    [
      {
        scenario: fault.spineFailure.scenario,
        failureDomain: 'Spine tier',
        reachabilityImpact: 'Remaining leaf-to-leaf reachability should persist through surviving spines if ECMP and path symmetry are correct.',
        bandwidthImpact: `Expected loss is roughly ${fault.spineProportionalSharePct}% of bisection bandwidth for a single evenly loaded spine failure.`,
        isolationRisk: 'No compute node should be isolated by a spine failure in a correctly built Clos.',
        gracefulDegradation: fault.gracefulDegradation,
        designResponse: fault.spineFailure.designResponse,
        validationAction: fault.spineFailure.operatorNote,
      },
      {
        scenario: fault.leafFailure.scenario,
        failureDomain: 'Leaf / host-attachment tier',
        reachabilityImpact: fault.leafFailure.impact,
        bandwidthImpact: 'Bandwidth loss is localized to hosts attached to the failed leaf rather than proportional across the entire fabric.',
        isolationRisk: fault.leafIsolationRisk,
        gracefulDegradation: fault.noSingleIsolationPosture,
        designResponse: fault.leafFailure.designResponse,
        validationAction: fault.leafFailure.operatorNote,
      },
    ] satisfies PlannerFailureAnalysisRow[],
  );
};

const buildBomTable = (model: PlannerModel) => createTable(
  ['section', 'sku', 'description', 'category', 'role', 'quantity', 'quantitySource', 'note'],
  model.view.bomSections.flatMap((section) =>
    section.lines.map((line) => ({
      section: section.title,
      sku: line.sku,
      description: line.description,
      category: line.category,
      role: line.role,
      quantity: line.quantity,
      quantitySource: line.quantitySource,
      note: line.note ?? '',
    })),
  ),
);

export const buildPlannerInputTrace = (model: PlannerModel) => buildInputRows(model);

export const buildPlannerCalculationTrace = (model: PlannerModel) => buildCalculationRows(model);

export const buildPlannerDecisionExport = (model: PlannerModel) => buildDecisionTable(model);

export const buildPlannerComputeFabricScorecardExport = (model: PlannerModel) =>
  buildScorecardTable(model.view.computeFabricEvaluation.requirementScorecard);

export const buildPlannerTopologyJustificationExport = (model: PlannerModel) =>
  buildTopologyJustificationTable(model);

export const buildPlannerFailureAnalysisExport = (model: PlannerModel) =>
  buildFailureAnalysisTable(model);

export const buildPlannerBomExport = (model: PlannerModel) => buildBomTable(model);

export const buildPlannerWorkbookSheets = (model: PlannerModel): WorkbookSheetDefinition[] => {
  const inputRows = buildPlannerInputTrace(model);
  const calculationRows = buildPlannerCalculationTrace(model);
  const decisionTable = buildPlannerDecisionExport(model);
  const scorecardTable = buildPlannerComputeFabricScorecardExport(model);
  const topologyTable = buildPlannerTopologyJustificationExport(model);
  const failureTable = buildPlannerFailureAnalysisExport(model);
  const bomTable = buildPlannerBomExport(model);
  const recommendation = model.view.designPackage.recommendation;
  const implementation = model.view.designPackage.implementationReadiness;
  const presentation = model.view.designPackage.presentationPack;
  const hardwarePacket = model.view.designPackage.hardwarePacket;
  const evaluation: PlannerComputeFabricEvaluation = model.view.computeFabricEvaluation;

  return [
    {
      name: 'Design Inputs',
      rows: [
        ['Parameter', 'Value', 'Basis', 'Engineering note'],
        ...inputRows.map((row) => [row.field, row.value, formatInputSource(row.source), row.note]),
      ],
    },
    {
      name: 'Sizing Logic',
      rows: [
        ['Domain', 'Measure', 'How derived', 'Result', 'Engineering note'],
        ...calculationRows.map((row) => [
          row.group,
          row.metric,
          `${row.formulaLabel}: ${row.expression}`,
          formatCalculationResult(row.value, row.unit),
          row.note,
        ]),
      ],
    },
    {
      name: 'Design Summary',
      rows: [
        ...createKeyValueRows('Recommended Architecture', [
          ['Recommendation', recommendation.recommendation],
          ['Architecture fit', recommendation.fitSummary],
          ['Topology', recommendation.topology],
          ['Leaf platform', recommendation.leafClass],
          ['Spine platform', recommendation.spineClass],
          ['Rail posture', recommendation.railPosture],
          ['Scope', recommendation.scope],
          ['Growth plan', recommendation.growthPosture],
          ['Readiness', recommendation.meta.validationState],
        ]),
        ...createSectionRows('Design risks', recommendation.keyRisks.map((risk) => `${risk.title}: ${risk.body}`)),
        ...createSectionRows('Validation boundaries', recommendation.notClaimed),
      ],
    },
    {
      name: 'Decision Record',
      rows: [decisionTable.headers, ...toCsvMatrix(decisionTable)],
    },
    {
      name: 'Topology Justification',
      rows: [
        topologyTable.headers,
        ...toCsvMatrix(topologyTable),
      ],
    },
    {
      name: 'Fabric Evaluation',
      rows: [
        ...createKeyValueRows('Fabric Evaluation Summary', [
          ['Protocol profile', evaluation.protocolProfile],
          ['Recommended topology', evaluation.topologyDecision.recommendedTopology],
          ['Topology rationale', evaluation.topologyDecision.decisionRationale],
          ['Scale break condition', evaluation.topologyDecision.whenThisBreaks],
          ['Failure-domain note', evaluation.topologyDecision.failureDomainNote],
          ['Oversubscription assessment', evaluation.oversubscriptionAssessment],
          ['Latency assessment', evaluation.latencyAssessment],
          ['ECMP and load balancing', evaluation.ecmpAndLoadBalancing],
          ['Lossless classification model', evaluation.losslessDesign.classificationModel],
          ['PFC strategy', evaluation.losslessDesign.pfcStrategy],
          ['ECN strategy', evaluation.losslessDesign.ecnStrategy],
          ['DCQCN strategy', evaluation.losslessDesign.dcqcnStrategy],
          ['Deadlock avoidance', evaluation.losslessDesign.deadlockAvoidance],
          ['BGP recommendation', evaluation.routingUnderlay.bgpRecommendation],
          ['ASN allocation', evaluation.routingUnderlay.asnAllocationStrategy],
          ['BFD posture', evaluation.routingUnderlay.bfdPosture],
          ['Convergence target', evaluation.routingUnderlay.convergenceTarget],
          ['ECMP posture', evaluation.routingUnderlay.ecmpPosture],
          ['Graceful degradation', evaluation.faultToleranceAssessment.gracefulDegradation],
          ['Node isolation posture', evaluation.faultToleranceAssessment.noSingleIsolationPosture],
          ['Design justification', evaluation.writtenJustification],
        ]),
        ...createSectionRows('Lossless validation priorities', evaluation.losslessDesign.validationChecklist),
        ...createSectionRows('Spine failure analysis', [
          `Scenario: ${evaluation.faultToleranceAssessment.spineFailure.scenario}`,
          `Impact: ${evaluation.faultToleranceAssessment.spineFailure.impact}`,
          `Design response: ${evaluation.faultToleranceAssessment.spineFailure.designResponse}`,
          `Operator note: ${evaluation.faultToleranceAssessment.spineFailure.operatorNote}`,
        ]),
        ...createSectionRows('Leaf failure analysis', [
          `Scenario: ${evaluation.faultToleranceAssessment.leafFailure.scenario}`,
          `Impact: ${evaluation.faultToleranceAssessment.leafFailure.impact}`,
          `Design response: ${evaluation.faultToleranceAssessment.leafFailure.designResponse}`,
          `Operator note: ${evaluation.faultToleranceAssessment.leafFailure.operatorNote}`,
        ]),
        ['Requirement', 'Status', 'Summary', 'Why', 'Follow-up validation'],
        ...toCsvMatrix(scorecardTable),
      ],
    },
    {
      name: 'Failure Analysis',
      rows: [
        ...createKeyValueRows('Failure Analysis Summary', [
          ['Graceful degradation', evaluation.faultToleranceAssessment.gracefulDegradation],
          ['No single isolation posture', evaluation.faultToleranceAssessment.noSingleIsolationPosture],
          ['Spine proportional share', `${evaluation.faultToleranceAssessment.spineProportionalSharePct}%`],
          ['Leaf isolation risk', evaluation.faultToleranceAssessment.leafIsolationRisk],
        ]),
        failureTable.headers,
        ...toCsvMatrix(failureTable),
      ],
    },
    {
      name: 'Implementation Notes',
      rows: [
        ...createKeyValueRows('Implementation Posture', [
          ['Readiness', implementation.meta.validationState],
          ['Confidence', implementation.meta.confidence],
        ]),
        ...createSectionRows('Underlay posture', implementation.underlayPosture),
        ...createSectionRows('RoCE / QoS posture', implementation.roceQosPosture),
        ...createSectionRows('Host / rail posture', implementation.hostRailPosture),
        ...createSectionRows('Validation sequence', implementation.validationSequence),
        ...createSectionRows('CLI validation categories', implementation.cliValidationCategories),
        ...createSectionRows('Config skeleton labels', implementation.configSkeletonLabels),
      ],
    },
    {
      name: 'Hardware Summary',
      rows: [
        ...createKeyValueRows('Hardware Summary', [
          ['Modular breakdown narrative', hardwarePacket.modularBreakdownNarrative],
          ['Readiness', hardwarePacket.meta.validationState],
          ['Confidence', hardwarePacket.meta.confidence],
        ]),
        ...createSectionRows('Component role summary', hardwarePacket.componentRoleSummary),
        ...createSectionRows('Quantity posture', hardwarePacket.confidenceTags),
        bomTable.headers,
        ...toCsvMatrix(bomTable),
      ],
    },
    {
      name: 'Customer Summary',
      rows: [
        ...createKeyValueRows('External Summary', [
          ['Summary', presentation.customerSummary],
          ['Topology story', presentation.topologyStory],
          ['Diagram title', presentation.diagramBrief.title],
          ['Diagram audience', presentation.diagramBrief.audience],
          ['Diagram goal', presentation.diagramBrief.goal],
          ['Diagram topology', presentation.diagramBrief.topology],
          ['Readiness', presentation.meta.validationState],
        ]),
        ...createSectionRows('Diagram callouts', presentation.diagramBrief.callouts),
        ...createSectionRows('Proof checklist', presentation.proofChecklist),
        ...createSectionRows('Caveats and follow-up', presentation.objectionsAndCaveats),
      ],
    },
    {
      name: 'Assumptions & Actions',
      rows: [
        ...createSectionRows('Key assumptions', model.view.assumptions),
        ...createSectionRows('Assumption map', model.view.assumptionMap.map((item) => `${item.scope}: ${item.label} = ${item.value}`)),
        ...createSectionRows('Design cautions', model.view.warnings),
        ...createSectionRows('Open questions', model.view.discoveryQuestions.flatMap((group) => group.questions.map((question) => `${group.category}: ${question}`))),
        ...createSectionRows('Validation actions', model.view.validationChecklist),
      ],
    },
  ];
};

export const exportPlannerWorkbook = async (model: PlannerModel) => {
  await downloadWorkbook(
    buildDatedFilename('ai-cluster-design-package', 'xlsx'),
    buildPlannerWorkbookSheets(model),
  );
};

export const exportPlannerInputsCsv = (model: PlannerModel) => {
  const rows = buildPlannerInputTrace(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-inputs', 'csv'),
    ['Field', 'Value', 'Source', 'Note'],
    rows.map((row) => [row.field, row.value, formatInputSource(row.source), row.note]),
  );
};

export const exportPlannerCalculationsCsv = (model: PlannerModel) => {
  const rows = buildPlannerCalculationTrace(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-calculations', 'csv'),
    ['Group', 'Metric', 'Formula Label', 'Expression', 'Value', 'Unit', 'Note'],
    rows.map((row) => [row.group, row.metric, row.formulaLabel, row.expression, row.value, row.unit, row.note]),
  );
};

export const exportPlannerDecisionCsv = (model: PlannerModel) => {
  const table = buildPlannerDecisionExport(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-decision-record', 'csv'),
    table.headers,
    toCsvMatrix(table),
  );
};

export const exportPlannerComputeFabricCsv = (model: PlannerModel) => {
  const table = buildPlannerComputeFabricScorecardExport(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-compute-fabric-scorecard', 'csv'),
    table.headers,
    toCsvMatrix(table),
  );
};

export const exportPlannerTopologyJustificationCsv = (model: PlannerModel) => {
  const table = buildPlannerTopologyJustificationExport(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-topology-justification', 'csv'),
    table.headers,
    toCsvMatrix(table),
  );
};

export const exportPlannerFailureAnalysisCsv = (model: PlannerModel) => {
  const table = buildPlannerFailureAnalysisExport(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-failure-analysis', 'csv'),
    table.headers,
    toCsvMatrix(table),
  );
};

export const exportPlannerBomCsv = (model: PlannerModel) => {
  const table = buildPlannerBomExport(model);
  downloadCSV(
    buildDatedFilename('ai-cluster-bom', 'csv'),
    table.headers,
    toCsvMatrix(table),
  );
};
