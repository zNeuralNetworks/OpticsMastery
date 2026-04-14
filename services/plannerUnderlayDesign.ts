import { PlannerModel, PlannerUnderlayDesign } from '../features/ai-planner/types';

type PlannerBaseModel = Omit<PlannerModel, 'view'>;

export const buildUnderlayDesign = (model: PlannerBaseModel): PlannerUnderlayDesign => {
  const pathCount = model.currentResult.computeFabric.spineCount;
  const routingLabel = model.inputs.routingPreference === 'EBGP_UNNUMBERED' ? 'eBGP unnumbered' : 'numbered eBGP';

  return {
    bgpRecommendation: `${routingLabel} is the default underlay posture because it keeps leaf and spine identity explicit, simplifies point-to-point L3 fabric links, and aligns with operationally legible routed AI fabrics.`,
    asnAllocationStrategy: 'Use a common spine ASN and unique leaf ASNs by default. This keeps troubleshooting clear, preserves clean failure boundaries, and avoids unnecessary shared-AS complexity in the underlay.',
    bfdPosture: 'Use BFD for fast underlay failure detection. A practical default posture is 300ms transmit / 300ms receive with multiplier 3, then tune only if the physical layer and optics behavior justify more aggressive settings.',
    convergenceTarget: 'Target sub-second neighbor-loss visibility for ordinary underlay failures and keep convergence goals directional rather than promising a hard deterministic number from the planner alone.',
    ecmpPosture: `Install ECMP intentionally to match the fabric width. With ${pathCount} current spines, the design should surface equal-path visibility as part of the underlay recommendation rather than assuming multipath is automatically active.`,
  };
};
