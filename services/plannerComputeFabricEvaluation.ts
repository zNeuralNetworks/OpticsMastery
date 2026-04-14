import {
  PlannerComputeFabricEvaluation,
  PlannerFaultToleranceAssessment,
  PlannerModel,
  PlannerRequirementStatus,
  PlannerRequirementStatusType,
} from '../features/ai-planner/types';
import { PlannerCongestionAssessment, PlannerTrainingCommunicationAssessment } from '../features/ai-planner/types';
import { buildTopologyDecision } from './plannerTopologyDecision';
import { buildLosslessDesign } from './plannerLosslessDesign';
import { buildUnderlayDesign } from './plannerUnderlayDesign';

type PlannerBaseModel = Omit<PlannerModel, 'view'>;

const buildRequirement = (
  requirement: string,
  status: PlannerRequirementStatusType,
  summary: string,
  why: string,
  followUpValidation: string,
): PlannerRequirementStatus => ({ requirement, status, summary, why, followUpValidation });

const buildFaultToleranceAssessment = (
  model: PlannerBaseModel,
  topologyDecision: ReturnType<typeof buildTopologyDecision>,
): PlannerFaultToleranceAssessment => {
  const spineProportionalSharePct = model.currentResult.computeFabric.spineCount > 0
    ? Number((100 / model.currentResult.computeFabric.spineCount).toFixed(1))
    : 100;
  const noSingleIsolationPosture =
    model.inputs.railMode === 'RAIL_OPTIMIZED' && model.gpuPlatform.recommendedRailCount > 1
      ? 'No-single-isolation posture is assumption-driven: if compute nodes actually spread attachment across rails, a single leaf or rail event may degrade but not fully isolate all host paths.'
      : 'The current live planner does not model dual-homed compute-node attachment, so a single leaf failure can still isolate the nodes attached to that leaf.';
  const leafIsolationRisk =
    model.inputs.railMode === 'RAIL_OPTIMIZED' && model.gpuPlatform.recommendedRailCount > 1
      ? 'Assumption-driven reduced isolation risk if host NICs and cabling are actually spread across independent rails.'
      : 'Compute nodes attached to a failed single-plane leaf can be isolated because the live planner does not model dual-homed host attachment by default.';

  return {
    spineFailure: {
      scenario: 'Spine switch failure',
      impact: `Loss of one spine removes roughly ${spineProportionalSharePct}% of bisection bandwidth if the fabric is evenly built. Remaining paths stay available through the surviving spines.`,
      designResponse: topologyDecision.recommendedTopology === 'three-tier'
        ? 'In a broader fabric, spine and super-spine path symmetry must be validated so a single failure degrades proportionally rather than causing hidden hotspots.'
        : 'A correctly built Clos should degrade proportionally at the spine layer rather than isolating hosts.',
      operatorNote: 'Verify path redistribution, ECMP behavior, and post-failure congestion under load during POC validation.',
    },
    leafFailure: {
      scenario: 'Leaf switch failure',
      impact: 'A failed leaf removes the nodes directly attached to that leaf from the fabric unless host attachment is explicitly spread across independent failure domains.',
      designResponse: model.inputs.railMode === 'RAIL_OPTIMIZED'
        ? 'Rail-aware attachment can reduce the blast radius if each host is actually split across rails, but that remains an implementation validation item outside the current live topology abstraction.'
        : 'In a single-plane design, the leaf remains a local but real single-failure-domain boundary.',
      operatorNote: 'Validate host-to-leaf attachment, rail spread, and whether the customer requires strict no-isolation behavior before positioning the design as production-ready.',
    },
    gracefulDegradation: 'Graceful degradation is strongest at the spine layer and weakest at the host attachment layer. The planner should state that explicitly rather than implying full host-level redundancy by default.',
    noSingleIsolationPosture,
    spineProportionalSharePct,
    leafIsolationRisk,
  };
};

const buildLatencyDetail = (model: PlannerBaseModel, topologyDecision: ReturnType<typeof buildTopologyDecision>) => {
  const hopCount = topologyDecision.recommendedTopology === 'three-tier' ? 4 : 3;
  const estimatedPathLatencyNs =
    topologyDecision.recommendedTopology === 'three-tier'
      ? (2 * model.leafSwitch.representativeLatencyNs) + (2 * model.spineSwitch.representativeLatencyNs)
      : (2 * model.leafSwitch.representativeLatencyNs) + model.spineSwitch.representativeLatencyNs;

  return {
    targetUsec: model.inputs.latencyTargetUsec,
    hopModel: topologyDecision.recommendedTopology === 'three-tier'
      ? 'Representative leaf -> spine -> super-spine equivalent -> leaf cut-through path'
      : 'Representative leaf -> spine -> leaf cut-through path',
    hopCount,
    leafLatencyNs: model.leafSwitch.representativeLatencyNs,
    spineLatencyNs: model.spineSwitch.representativeLatencyNs,
    estimatedPathLatencyUsec: Number((estimatedPathLatencyNs / 1000).toFixed(2)),
    assessment: topologyDecision.recommendedTopology === 'three-tier'
      ? '3-tier scale headroom increases pressure on the latency budget and must be validated explicitly against the final hardware path.'
      : '2-tier keeps the latency budget cleaner by limiting hop count, but queue behavior and exact platform implementation still require no-load validation.',
    openValidation: 'Validate end-to-end no-load GPU-to-GPU path latency on the final switch platform, optics choice, and queue policy rather than treating representative cut-through numbers as a guarantee.',
  };
};

const buildTopologyJustification = (model: PlannerBaseModel, topologyDecision: ReturnType<typeof buildTopologyDecision>) => {
  const currentEndpointCount = model.currentResult.nodeCount * model.gpuPlatform.computeNicsPerNode;
  const futureEndpointCount = model.futureResult.nodeCount * model.gpuPlatform.computeNicsPerNode;

  return {
    currentEndpointCount,
    futureEndpointCount,
    currentLeafCount: model.currentResult.computeFabric.leafCount,
    currentSpineCount: model.currentResult.computeFabric.spineCount,
    futureLeafCount: model.futureResult.computeFabric.leafCount,
    futureSpineCount: model.futureResult.computeFabric.spineCount,
    twoTierAssessment: topologyDecision.recommendedTopology === 'two-tier'
      ? `2-tier Clos is acceptable because ${currentEndpointCount} current compute endpoints fit inside a manageable ${model.currentResult.computeFabric.leafCount}-leaf / ${model.currentResult.computeFabric.spineCount}-spine fabric with lower hop count and cleaner operations than a super-spine design.`
      : `2-tier remains the lower-latency baseline, but projected growth to ${futureEndpointCount} endpoints and ${model.futureResult.computeFabric.leafCount} leaves / ${model.futureResult.computeFabric.spineCount} spines pushes the fabric beyond a comfortable flat leaf-spine posture.`,
    threeTierAssessment: topologyDecision.recommendedTopology === 'three-tier'
      ? `3-tier is justified because future scale and structured growth pressure exceed the planner’s comfortable two-tier radix envelope, so super-spine scale headroom is preferred over forcing an awkwardly wide flat fabric.`
      : '3-tier is not currently preferred because the modeled scale can still be defended inside a flatter Clos with lower latency and lower control-plane complexity.',
    railOptimizedAssessment: model.inputs.railMode === 'RAIL_OPTIMIZED'
      ? 'Rail optimization is acceptable if host NIC attachment, cabling, and failure domains are actually split across rails and validated during implementation.'
      : 'Rail optimization is not part of the current design recommendation, so failure-domain benefits from multi-rail host spread are not being claimed.',
  };
};

const buildEcmpDetail = (
  model: PlannerBaseModel,
  training: PlannerTrainingCommunicationAssessment,
  congestion: PlannerCongestionAssessment,
) => ({
  currentPathCount: model.currentResult.computeFabric.spineCount,
  strategy: `Use flow-based ECMP across ${model.currentResult.computeFabric.spineCount} spine paths and validate that actual maximum-paths and uplink symmetry match the physical spine width.`,
  entropySource: 'Prefer inner-header entropy where overlays are present and ensure hashing uses stable RDMA-relevant flow fields rather than relying only on outer-header symmetry.',
  polarizationRisk: congestion.level === 'high' || congestion.level === 'severe'
    ? 'Current traffic posture has elevated polarization risk because collective-heavy elephant flows can align unevenly across uplinks.'
    : 'Polarization risk is present but moderate if path symmetry, entropy, and host flow spread are validated under collective traffic.',
  collectiveFit: `${training.patternSummary} Validate both all-reduce and all-to-all phases because they stress path distribution differently.`,
  validationChecklist: [
    'Validate ECMP next-hop count matches the actual spine width on every leaf.',
    'Validate per-uplink utilization under collective-heavy load, not just under synthetic small-flow tests.',
    'Confirm entropy source is sufficient for encapsulated or inner-flow-aware hashing where applicable.',
    'Check for path polarization across all-reduce and all-to-all communication phases.',
  ],
});

const evaluateStatusRows = (
  model: PlannerBaseModel,
  training: PlannerTrainingCommunicationAssessment,
  congestion: PlannerCongestionAssessment,
  topologyDecision: ReturnType<typeof buildTopologyDecision>,
  faultTolerance: PlannerFaultToleranceAssessment,
  underlay: ReturnType<typeof buildUnderlayDesign>,
): PlannerRequirementStatus[] => {
  const oversubPass = model.currentResult.computeFabric.oversubscriptionRatio <= model.inputs.maxOversubscriptionTarget;
  const latencyStatus: PlannerRequirementStatusType =
    topologyDecision.recommendedTopology === 'three-tier'
      ? 'caution'
      : model.leafSwitch.representativeLatencyNs <= 800 && model.spineSwitch.representativeLatencyNs <= 1200
        ? 'assumption-driven'
        : 'caution';
  const railStatus: PlannerRequirementStatusType =
    model.inputs.railMode === 'RAIL_OPTIMIZED'
      ? 'assumption-driven'
      : 'caution';
  const leafFailureStatus: PlannerRequirementStatusType =
    model.inputs.failureDesignPriority === 'STRICT_NO_ISOLATION'
      ? (model.inputs.railMode === 'RAIL_OPTIMIZED' ? 'assumption-driven' : 'fail')
      : (model.inputs.railMode === 'RAIL_OPTIMIZED' ? 'assumption-driven' : 'caution');

  return [
    buildRequirement(
      '400GbE + RoCEv2 posture',
      model.gpuPlatform.computeNicSpeed === '400G' || model.gpuPlatform.computeNicSpeed === '800G' ? 'pass' : 'caution',
      `${model.gpuPlatform.computeNicSpeed} host attachment is compatible with an AI fabric posture; RoCEv2 remains the intended transport profile.`,
      'The live planner uses AI-oriented Ethernet switch classes and a RoCEv2 evaluation profile, but transport behavior still depends on final QoS and host validation.',
      'Validate host NIC transport mode and the final lossless queue policy in lab or POC.',
    ),
    buildRequirement(
      'Lossless Ethernet support posture',
      'assumption-driven',
      'The planner now emits a full lossless design posture for PFC, ECN, and DCQCN.',
      'Lossless correctness depends on queue mapping, thresholds, and host participation, which the planner does not claim to validate exactly.',
      'Use the lossless validation checklist before production positioning.',
    ),
    buildRequirement(
      'Topology suitability at current scale',
      topologyDecision.recommendedTopology === 'three-tier' ? 'caution' : 'pass',
      `${topologyDecision.recommendedTopology} is the current recommendation for this scale and growth posture.`,
      topologyDecision.decisionRationale,
      topologyDecision.whenThisBreaks,
    ),
    buildRequirement(
      '2-tier vs 3-tier justification',
      'pass',
      `The planner makes an explicit ${topologyDecision.recommendedTopology} decision rather than treating Clos depth as implicit.`,
      topologyDecision.decisionRationale,
      topologyDecision.whenThisBreaks,
    ),
    buildRequirement(
      'Rail-optimized justification',
      railStatus,
      model.inputs.railMode === 'RAIL_OPTIMIZED'
        ? 'Rail-optimized topology is being used as a first-class design posture.'
        : 'Rail optimization is not selected in the current recommendation.',
      topologyDecision.failureDomainNote,
      'Validate host-to-rail attachment and failure-domain boundaries if rail optimization is part of the design story.',
    ),
    buildRequirement(
      'Max 1.1:1 oversubscription compliance',
      oversubPass ? 'pass' : 'fail',
      `Current modeled compute-fabric oversubscription is ${model.currentResult.computeFabric.oversubscriptionRatio}:1 against a target ceiling of ${model.inputs.maxOversubscriptionTarget}:1.`,
      oversubPass ? 'The current design stays inside the stated oversubscription ceiling.' : 'This fails the stated design requirement and would directly undermine AllReduce sensitivity.',
      'Lower oversubscription or change topology/platform class before using this as a compliant design.',
    ),
    buildRequirement(
      'Latency-fit against 1.5 µs target',
      latencyStatus,
      `The planner uses a representative latency target of ${model.inputs.latencyTargetUsec.toFixed(1)} µs and an AI-oriented switch class, but it remains directional rather than lab-validated.`,
      topologyDecision.recommendedTopology === 'three-tier'
        ? 'An extra tier increases pressure on the latency target and must be validated explicitly.'
        : 'Two-tier keeps hop count lower, but exact end-to-end path latency still requires hardware and queue-policy validation.',
      'Validate no-load port-to-port latency under the final topology and platform combination.',
    ),
    buildRequirement(
      'ECMP/hash/entropy posture for RDMA collectives',
      congestion.level === 'severe' ? 'fail' : 'caution',
      'The planner recommends ECMP as the baseline and explicitly calls out collective-traffic polarization as a design risk.',
      `${training.patternSummary} AllReduce-heavy traffic can create elephant flows and uneven path use if entropy and load balancing are weak.`,
      'Validate path balance, per-uplink utilization, and whether DLB/CLB or better entropy handling is needed.',
    ),
    buildRequirement(
      'PFC/ECN/DCQCN design completeness',
      'assumption-driven',
      'The planner emits a complete architecture-level lossless design posture with PFC scope, ECN strategy, DCQCN loop explanation, and validation steps.',
      'This is intentionally a design posture, not a claim of final threshold or NIC tuning correctness.',
      'Use switch and host counter validation to confirm the lossless design works as intended.',
    ),
    buildRequirement(
      'Deadlock avoidance posture',
      'pass',
      'PFC watchdog is treated as mandatory in the planner’s lossless design output.',
      'Deadlock avoidance is part of the base design posture, not an afterthought.',
      'Validate watchdog behavior and deadlock recovery during failure and stress testing.',
    ),
    buildRequirement(
      'Single-spine failure behavior',
      model.currentResult.computeFabric.spineCount > 1 ? 'pass' : 'fail',
      faultTolerance.spineFailure.impact,
      faultTolerance.spineFailure.designResponse,
      faultTolerance.spineFailure.operatorNote,
    ),
    buildRequirement(
      'Single-leaf failure behavior',
      leafFailureStatus,
      faultTolerance.leafFailure.impact,
      faultTolerance.leafFailure.designResponse,
      faultTolerance.leafFailure.operatorNote,
    ),
    buildRequirement(
      'BGP underlay posture',
      'pass',
      underlay.bgpRecommendation,
      underlay.asnAllocationStrategy,
      'Validate the final underlay implementation, maximum-paths posture, and neighbor policy before production.',
    ),
    buildRequirement(
      'BFD / convergence posture',
      'assumption-driven',
      underlay.bfdPosture,
      underlay.convergenceTarget,
      'Confirm optics stability and underlay behavior before tightening failure timers further.',
    ),
  ];
};

export const buildComputeFabricEvaluation = (
  model: PlannerBaseModel,
  training: PlannerTrainingCommunicationAssessment,
  congestion: PlannerCongestionAssessment,
): PlannerComputeFabricEvaluation => {
  const topologyDecision = buildTopologyDecision(model);
  const topologyJustification = buildTopologyJustification(model, topologyDecision);
  const latencyDetail = buildLatencyDetail(model, topologyDecision);
  const ecmpDetail = buildEcmpDetail(model, training, congestion);
  const losslessDesign = buildLosslessDesign(model);
  const routingUnderlay = buildUnderlayDesign(model);
  const faultToleranceAssessment = buildFaultToleranceAssessment(model, topologyDecision);
  const requirementScorecard = evaluateStatusRows(model, training, congestion, topologyDecision, faultToleranceAssessment, routingUnderlay);

  const writtenJustification = [
    `Topology choice: ${topologyDecision.decisionRationale}`,
    `Oversubscription analysis: Current compute-fabric posture is ${model.currentResult.computeFabric.oversubscriptionRatio}:1 against a target ceiling of ${model.inputs.maxOversubscriptionTarget}:1, and the training-communication model recommends a directional ceiling of ${training.recommendedOversubscriptionCeiling}.`,
    `Latency and bandwidth fit: The recommendation uses ${model.leafSwitch.name} leafs and ${model.spineSwitch.name} spines with ${((model.currentResult.computeFabric.usedUplinkPorts * 800) / 1000).toFixed(1)} Tbps of representative active uplink bandwidth. The planner models a ${latencyDetail.hopCount}-hop cut-through path at approximately ${latencyDetail.estimatedPathLatencyUsec.toFixed(2)} µs and treats the ${model.inputs.latencyTargetUsec.toFixed(1)} µs latency target as a design requirement that still needs hardware and topology validation.`,
    `ECMP and load balancing: ${ecmpDetail.strategy} ${ecmpDetail.entropySource} ${ecmpDetail.polarizationRisk}`,
    `Lossless design: ${losslessDesign.pfcStrategy} ${losslessDesign.ecnStrategy} ${losslessDesign.deadlockAvoidance}`,
    `Routing underlay: ${routingUnderlay.bgpRecommendation} ${routingUnderlay.asnAllocationStrategy} ${routingUnderlay.bfdPosture}`,
    `Failure analysis: ${faultToleranceAssessment.spineFailure.impact} ${faultToleranceAssessment.leafFailure.impact}`,
    `Open validations: ${requirementScorecard.filter((item) => item.status !== 'pass').slice(0, 4).map((item) => item.followUpValidation).join(' ')}`,
  ].join(' ');

  return {
    protocolProfile: '400GbE Ethernet AI fabric with RoCEv2, lossless queue discipline, and AI-oriented cut-through switch classes.',
    topologyDecision,
    topologyJustification,
    oversubscriptionAssessment: `Compute fabric is modeled at ${model.currentResult.computeFabric.oversubscriptionRatio}:1 versus a target ceiling of ${model.inputs.maxOversubscriptionTarget}:1.`,
    latencyAssessment: `Latency posture is directional against a ${model.inputs.latencyTargetUsec.toFixed(1)} µs requirement. The current modeled path budget is about ${latencyDetail.estimatedPathLatencyUsec.toFixed(2)} µs under a representative cut-through hop model, but exact no-load validation still depends on final platform and path testing.`,
    latencyDetail,
    ecmpAndLoadBalancing: `${ecmpDetail.strategy} ${ecmpDetail.polarizationRisk}`,
    ecmpDetail,
    losslessDesign,
    faultToleranceAssessment,
    routingUnderlay,
    requirementScorecard,
    writtenJustification,
  };
};
