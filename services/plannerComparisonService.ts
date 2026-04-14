import type {
  PlannerChangeImpactRow,
  PlannerComparisonRow,
  PlannerModel,
  PlannerPortConsumptionItem,
} from '../features/ai-planner/types';

export const buildPlannerComparisonRows = (
  current: PlannerModel,
  comparison: PlannerModel,
): PlannerComparisonRow[] => [
  {
    label: 'Leaf switches',
    current: current.currentResult.computeFabric.leafCount,
    comparison: comparison.currentResult.computeFabric.leafCount,
    why: 'Reflects the change in compute downlink demand and uplink reservation across scenarios.',
  },
  {
    label: 'Spine switches',
    current: current.currentResult.computeFabric.spineCount,
    comparison: comparison.currentResult.computeFabric.spineCount,
    why: 'Shows how the northbound fabric changes when scale, oversubscription, or rail posture shifts.',
  },
  {
    label: 'Rack count',
    current: current.currentResult.rackPlanning.rackCount,
    comparison: comparison.currentResult.rackPlanning.rackCount,
    why: 'Captures facility impact instead of treating fabric design as a switch-only conversation.',
  },
  {
    label: 'Power per rack (kW)',
    current: current.currentResult.rackPlanning.powerPerRackKw.toFixed(1),
    comparison: comparison.currentResult.rackPlanning.powerPerRackKw.toFixed(1),
    why: 'Useful when design changes move the constraint from topology to facility readiness.',
  },
  {
    label: 'Oversubscription target',
    current: `${current.inputs.oversubscription}:1`,
    comparison: `${comparison.inputs.oversubscription}:1`,
    why: 'Lets an SE explain whether the fabric posture is being made more conservative or more aggressive.',
  },
  {
    label: 'Congestion risk',
    current: current.view.congestionAssessment.level,
    comparison: comparison.view.congestionAssessment.level,
    why: 'Summarizes how each scenario behaves under collective-heavy east-west pressure.',
  },
];

export const buildPlannerChangeImpactRows = (
  current: PlannerModel,
  previous: PlannerModel | null,
): PlannerChangeImpactRow[] => {
  if (!previous) {
    return [];
  }

  return [
    {
      label: 'Leaf switches',
      current: current.currentResult.computeFabric.leafCount,
      previous: previous.currentResult.computeFabric.leafCount,
      why: 'Usually changes when GPU count, breakout posture, or effective downlink demand shifts.',
    },
    {
      label: 'Spine switches',
      current: current.currentResult.computeFabric.spineCount,
      previous: previous.currentResult.computeFabric.spineCount,
      why: 'Usually changes when uplink demand or oversubscription posture changes.',
    },
    {
      label: 'Rack count',
      current: current.currentResult.rackPlanning.rackCount,
      previous: previous.currentResult.rackPlanning.rackCount,
      why: 'Shows whether the latest input change materially moved the physical footprint.',
    },
    {
      label: 'Power per rack (kW)',
      current: current.currentResult.rackPlanning.powerPerRackKw.toFixed(1),
      previous: previous.currentResult.rackPlanning.powerPerRackKw.toFixed(1),
      why: 'Useful when the latest change affects facility density more than switch count.',
    },
    {
      label: 'Congestion risk',
      current: current.view.congestionAssessment.level,
      previous: previous.view.congestionAssessment.level,
      why: 'Highlights whether the new input materially changed collective-traffic stress on the fabric.',
    },
  ].filter((row) => row.current !== row.previous);
};

export const buildPlannerPortConsumption = (model: PlannerModel): PlannerPortConsumptionItem[] => {
  const { currentResult, gpuPlatform, storagePlatform, leafSwitch } = model;
  const rows: PlannerPortConsumptionItem[] = [
    {
      category: 'Compute downlinks used',
      ports: currentResult.computeFabric.usedDownlinkPorts,
      speedGb: parseInt(gpuPlatform.computeNicSpeed, 10),
      note: 'GPU-facing downlink ports consumed by the current compute node count.',
    },
    {
      category: 'Compute uplinks reserved',
      ports: currentResult.computeFabric.usedUplinkPorts,
      speedGb: parseInt(leafSwitch.portSpeed, 10),
      note: 'Leaf-to-spine uplink ports reserved to maintain the modeled oversubscription posture.',
    },
    {
      category: 'Spine ports presented',
      ports: currentResult.computeFabric.totalSpinePorts,
      speedGb: parseInt(leafSwitch.portSpeed, 10),
      note: 'Total available spine-facing port pool based on the selected modular or fixed spine class.',
    },
  ];

  if (currentResult.storageFabric) {
    rows.push(
      {
        category: 'Storage downlinks used',
        ports: currentResult.storageFabric.usedDownlinkPorts,
        speedGb: storagePlatform ? parseInt(storagePlatform.nicSpeed, 10) : parseInt(leafSwitch.portSpeed, 10),
        note: 'Storage-facing leaf downlinks consumed by compute storage ports and storage nodes.',
      },
      {
        category: 'Storage uplinks reserved',
        ports: currentResult.storageFabric.usedUplinkPorts,
        speedGb: parseInt(leafSwitch.portSpeed, 10),
        note: 'Storage leaf uplinks reserved toward the dedicated or representative storage spine tier.',
      },
    );
  }

  return rows;
};
