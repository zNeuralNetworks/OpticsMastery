import { PlannerModel, PlannerTopologyDecision } from '../features/ai-planner/types';

type PlannerBaseModel = Omit<PlannerModel, 'view'>;

export const buildTopologyDecision = (model: PlannerBaseModel): PlannerTopologyDecision => {
  const currentLeafs = model.currentResult.computeFabric.leafCount;
  const currentSpines = model.currentResult.computeFabric.spineCount;
  const futureLeafs = model.futureResult.computeFabric.leafCount;
  const futureSpines = model.futureResult.computeFabric.spineCount;
  const endpointScale = model.currentResult.nodeCount * model.gpuPlatform.computeNicsPerNode;
  const growthGpuTarget = Math.max(model.inputs.gpuCount, model.inputs.targetGpuCount ?? model.inputs.gpuCount);
  const exceedsTwoTierComfort =
    futureLeafs > 16 ||
    futureSpines > 16 ||
    growthGpuTarget > 4096 ||
    (model.inputs.distanceMeters > 200 && model.inputs.railMode === 'SINGLE_PLANE');

  if (model.inputs.railMode === 'RAIL_OPTIMIZED' && model.gpuPlatform.recommendedRailCount > 1) {
    return {
      recommendedTopology: 'rail-optimized-two-tier',
      decisionRationale: `Rail-optimized 2-tier Clos is the best fit because the platform already expects ${model.gpuPlatform.recommendedRailCount} rails, the live planner stays inside two-tier radix at ${currentLeafs} leafs / ${currentSpines} spines today, and AI training traffic benefits from keeping failure domains and collective paths aligned per rail.`,
      whenThisBreaks: `Move to 3-tier or super-spine once future scale pushes the fabric beyond clean two-tier economics, especially if growth to ${growthGpuTarget} GPUs or inter-hall expansion drives more than ${futureSpines} spines or a wider failure domain than independent rails can sustain.`,
      failureDomainNote: 'Rail optimization reduces blast radius if host attachment is actually spread across rails, but that remains assumption-driven until the host and cabling design are validated.',
    };
  }

  if (exceedsTwoTierComfort) {
    return {
      recommendedTopology: 'three-tier',
      decisionRationale: `3-tier Clos becomes the safer recommendation once future scale reaches ${futureLeafs} leafs / ${futureSpines} spines or the design must preserve structured growth and inter-hall expansion beyond a comfortable two-tier radix envelope.`,
      whenThisBreaks: 'A 3-tier recommendation still needs latency validation and a super-spine strategy; if the additional hop violates the target latency posture, the design must split into smaller fabrics or more explicit rails.',
      failureDomainNote: 'The tradeoff is scale headroom versus extra control-plane and failure-domain complexity. Super-spine failure domains must be called out explicitly.',
    };
  }

  return {
    recommendedTopology: 'two-tier',
    decisionRationale: `2-tier Clos remains valid because the current design fits inside a clean leaf-spine envelope at ${currentLeafs} leafs / ${currentSpines} spines with ${endpointScale} host-facing compute endpoints, keeping hop count and operational complexity lower than a super-spine design.`,
    whenThisBreaks: `Re-evaluate when growth toward ${growthGpuTarget} GPUs forces spine count or leaf count into an operationally awkward range, or when multi-hall expansion requires a broader failure domain than a flat two-tier fabric can support cleanly.`,
    failureDomainNote: 'Two-tier is simpler and lower-hop, but leaf failure domains remain local only if node attachment density per leaf stays acceptable for the workload.',
  };
};
