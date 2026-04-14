import {
  PlannerArtifactMeta,
  PlannerAssumption,
  PlannerBomSection,
  PlannerComputeFabricEvaluation,
  PlannerConfidenceSummary,
  PlannerDecisionItem,
  PlannerDecisionRecord,
  PlannerDesignNarrative,
  PlannerDesignPackage,
  PlannerDesignRecommendation,
  PlannerDiagramBrief,
  PlannerDiscoveryQuestionGroup,
  PlannerExecutiveSummary,
  PlannerFabricJustification,
  PlannerHardwarePacket,
  PlannerImplementationReadiness,
  PlannerOperatorReadiness,
  PlannerPresentationPack,
  PlannerRiskItem,
} from '../features/ai-planner/types';
import { PlannerModel } from '../features/ai-planner/types';
import { MediaRecommendation } from './mediaAdvisor';
import { PlannerCongestionAssessment, PlannerTrainingCommunicationAssessment } from '../features/ai-planner/types';

const severityRank: Record<PlannerRiskItem['severity'], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const firstSentence = (value: string) => {
  const sentence = value.split('. ')[0] ?? value;
  return sentence.endsWith('.') ? sentence : `${sentence}.`;
};

const buildArtifactMeta = (
  confidence: PlannerConfidenceSummary,
  audience: PlannerArtifactMeta['audience'],
  sourceClass: PlannerArtifactMeta['sourceClass'],
  validationState: PlannerArtifactMeta['validationState'],
): PlannerArtifactMeta => ({
  confidence: confidence.level,
  audience,
  sourceClass,
  validationState,
});

export const buildAssumptionMap = (
  model: Omit<PlannerModel, 'view'>,
  assumptions: string[],
  fabricMedia: MediaRecommendation,
  accessMedia: MediaRecommendation,
): PlannerAssumption[] => {
  const storageAssumption = model.storagePlatform
    ? `${model.storagePlatform.name} stays assumption-driven until checkpoint posture, storage concurrency, and exact attachment behavior are validated.`
    : 'No explicit storage network is modeled in compute-only mode.';

  return [
    {
      label: 'Compute fabric posture',
      value: assumptions[0] ?? `${model.leafSwitch.name} and ${model.spineSwitch.name} are used as representative compute fabric profiles.`,
      scope: 'fabric',
    },
    {
      label: 'Media and cabling posture',
      value: [...fabricMedia.assumptions, ...accessMedia.assumptions].join(' '),
      scope: 'media',
    },
    {
      label: 'Storage behavior',
      value: storageAssumption,
      scope: 'storage',
    },
    {
      label: 'Physical envelope',
      value: `Rack planning is directional only: ${model.currentResult.rackPlanning.rackCount} racks at ${model.currentResult.rackPlanning.nodesPerRack} nodes per rack and ${model.currentResult.rackPlanning.powerPerRackKw.toFixed(1)} kW per rack.`,
      scope: 'physical',
    },
    {
      label: 'Operational boundary',
      value: 'CloudVision workflow, telemetry thresholds, firmware lifecycle, and RoCE policy remain validation items rather than implementation-complete outputs.',
      scope: 'operations',
    },
  ];
};

export const buildRiskSummary = (
  model: Omit<PlannerModel, 'view'>,
  congestion?: PlannerCongestionAssessment,
  training?: PlannerTrainingCommunicationAssessment,
): PlannerRiskItem[] => {
  const { inputs, currentResult, futureResult, gpuPlatform, storagePlatform } = model;
  const risks: PlannerRiskItem[] = [];

  if (congestion && (congestion.level === 'high' || congestion.level === 'severe')) {
    risks.push({
      title: 'Congestion posture needs architecture tightening',
      body: congestion.recommendedMitigation,
      severity: congestion.level === 'severe' ? 'high' : 'medium',
    });
  }

  if (currentResult.computeFabric.oversubscriptionRatio > 1 && inputs.gpuCount >= 512) {
    risks.push({
      title: 'Shared uplink pressure in a collective-sensitive fabric',
      body: `The live model is sizing ${inputs.gpuCount} GPUs with ${currentResult.computeFabric.oversubscriptionRatio}:1 oversubscription. For training-oriented traffic, that posture should be treated as a validation item rather than a default-safe setting.`,
      severity: currentResult.computeFabric.oversubscriptionRatio >= 4 ? 'high' : 'medium',
    });
  }

  if (storagePlatform && currentResult.storageFabric) {
    risks.push({
      title: 'Storage traffic remains directional, not fully behavior-aware',
      body: `${storagePlatform.name} is modeled as a representative storage fabric, but checkpoint burst concurrency, ECN/PFC posture, and storage-node throughput are not yet explicitly validated in this design package.`,
      severity: storagePlatform.designType === 'nvme-of' ? 'high' : 'medium',
    });
  }

  if (currentResult.rackPlanning.powerPerRackKw > 30) {
    risks.push({
      title: 'Rack power density needs facilities validation',
      body: `The current rack posture lands at ${currentResult.rackPlanning.powerPerRackKw.toFixed(1)} kW per rack. Cooling, liquid-readiness, and row-level power delivery should be explicitly checked before presenting this as deployment-ready.`,
      severity: currentResult.rackPlanning.powerPerRackKw > 35 ? 'high' : 'medium',
    });
  }

  if (futureResult.computeFabric.leafCount > currentResult.computeFabric.leafCount || futureResult.computeFabric.spineCount > currentResult.computeFabric.spineCount) {
    risks.push({
      title: 'Growth target changes the fabric shape',
      body: `The 18-month target shifts the compute fabric from ${currentResult.computeFabric.leafCount}L/${currentResult.computeFabric.spineCount}S to ${futureResult.computeFabric.leafCount}L/${futureResult.computeFabric.spineCount}S. Expansion sequencing should be part of the customer conversation, not an afterthought.`,
      severity: 'medium',
    });
  }

  if (gpuPlatform.recommendedRailCount > 1) {
    risks.push({
      title: 'Recommended rail count exceeds the current live topology abstraction',
      body: `${gpuPlatform.name} recommends ${gpuPlatform.recommendedRailCount} rails, but this design package still uses a simplified representative topology. Rail-aware placement and failure-domain reasoning should be validated outside the current graphic.`,
      severity: 'medium',
    });
  }

  if (training && (training.communicationPressure === 'high' || training.communicationPressure === 'severe')) {
    risks.push({
      title: 'Training communication pressure is high for the current posture',
      body: training.trainingRiskNote,
      severity: training.communicationPressure === 'severe' ? 'high' : 'medium',
    });
  }

  if (risks.length === 0) {
    risks.push({
      title: 'No critical blocker detected',
      body: 'The current result is usable for architecture discussion, but optics, operations, and deployment validation still remain follow-on work.',
      severity: 'low',
    });
  }

  return risks.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
};

export const buildConfidenceSummary = (model: Omit<PlannerModel, 'view'>, risks: PlannerRiskItem[]): PlannerConfidenceSummary => {
  const reasons: string[] = [];
  let penalty = 0;
  let heuristicWeight = 0;

  if (model.inputs.oversubscription > 1) {
    penalty += 1;
    reasons.push('Oversubscription above near-nonblocking makes the result more sensitive to actual workload behavior.');
  }

  if (model.storagePlatform) {
    heuristicWeight += 1;
    reasons.push('Storage is represented directionally rather than by full workload-specific throughput and checkpoint behavior.');
  }

  if (model.inputs.distanceMeters > 30) {
    heuristicWeight += 1;
    reasons.push('Longer inter-rack reach pushes more of the cabling design into assumption-driven optical territory.');
  }

  if (model.currentResult.rackPlanning.powerPerRackKw > 30) {
    penalty += 1;
    reasons.push('Facilities envelope becomes more material once rack power density rises above a conventional air-cooled posture.');
  }

  if (risks[0]?.severity === 'high') {
    penalty += 2;
  } else if (risks[0]?.severity === 'medium') {
    penalty += 1;
  }

  const level = penalty <= 1 ? 'high' : penalty <= 3 ? 'medium' : 'low';
  const basis = heuristicWeight === 0 ? 'mostly-input-driven' : heuristicWeight === 1 ? 'mixed-inputs-and-heuristics' : 'heuristic-heavy';

  const summaryMap = {
    high: 'Model confidence is relatively high for early architecture discussion because the current fabric posture stays inside the directional assumptions used for this design package.',
    medium: 'Model confidence is moderate because the recommendation still depends on storage, optics, or operational assumptions that should be validated with the customer.',
    low: 'Model confidence is low because the current direction depends materially on heuristic assumptions, not because the design is automatically wrong.',
  } as const;

  return {
    level,
    summary: summaryMap[level],
    reasons: reasons.slice(0, 4),
    basis,
  };
};

export const buildExecutiveSummary = (
  model: Omit<PlannerModel, 'view'>,
  risks: PlannerRiskItem[],
  confidence: PlannerConfidenceSummary,
): PlannerExecutiveSummary => {
  const storageClause = model.currentResult.storageFabric && model.storagePlatform
    ? ` It also includes a representative dedicated storage fabric for ${model.storagePlatform.name}.`
    : ' The current mode is compute-fabric-only, so storage remains outside the explicit network design.';

  return {
    recommendation: `${model.currentResult.computeFabric.leafCount} compute leafs on ${model.leafSwitch.name} and ${model.currentResult.computeFabric.spineCount} spines on ${model.spineSwitch.name} for ${model.inputs.gpuCount} GPUs.`,
    architectureSummary: `This is a scale-out Ethernet leaf-spine recommendation sized from host NIC demand, growth target, and a modeled ${model.currentResult.computeFabric.oversubscriptionRatio}:1 oversubscription posture.${storageClause}`,
    primaryRisk: risks[0],
    confidence,
    topNotes: [
      `Representative fabric bandwidth: ${(model.currentResult.computeFabric.usedUplinkPorts * 800 / 1000).toFixed(1)} Tbps active uplink capacity.`,
      `${model.currentResult.rackPlanning.rackCount} racks modeled at ${model.currentResult.rackPlanning.nodesPerRack} nodes per rack.`,
      confidence.summary,
    ],
  };
};

export const buildDesignNarrative = (model: Omit<PlannerModel, 'view'>, risks: PlannerRiskItem[]): PlannerDesignNarrative => {
  const storageLine = model.currentResult.storageFabric && model.storagePlatform
    ? `${model.storagePlatform.name} is represented as an isolated storage network so checkpoint and dataset traffic do not automatically share the GPU collective fabric.`
    : 'Storage is not explicitly modeled in the fabric recommendation, so backend-only mode should not be interpreted as a full-stack deployment plan.';

  return {
    architectureSummary: `This design recommends a ${model.currentResult.computeFabric.leafCount}L/${model.currentResult.computeFabric.spineCount}S Ethernet fabric using ${model.leafSwitch.name} leafs and ${model.spineSwitch.name} spines, with media selected from the local optics and cabling catalog rather than guessed ad hoc.`,
    designTradeoffs: [
      `Oversubscription is currently set to ${model.inputs.oversubscription}:1, which improves switch efficiency but makes training sensitivity a follow-on validation topic.`,
      storageLine,
      `Growth to ${Math.max(model.inputs.gpuCount, model.inputs.targetGpuCount ?? model.inputs.gpuCount)} GPUs changes the fabric shape and should be discussed as part of the initial recommendation.`,
    ],
    operationalConsiderations: [
      'Treat RoCE queueing, ECN, and PFC policy as explicit engineering follow-up, not as solved by this package alone.',
      'Use CloudVision telemetry and change controls to validate congestion posture, optics health, and expansion sequencing before deployment.',
      firstSentence(risks[0]?.body ?? 'Validate optics, workload behavior, and facilities assumptions before turning this into a customer recommendation.'),
    ],
  };
};

export const buildDiscoveryQuestions = (model: Omit<PlannerModel, 'view'>): PlannerDiscoveryQuestionGroup[] => {
  const groups: PlannerDiscoveryQuestionGroup[] = [
    {
      category: 'Workload and traffic',
      questions: [
        'Is this primarily training, inference, or mixed AI infrastructure?',
        'How sensitive is the workload to oversubscription and east-west congestion during synchronized phases?',
      ],
    },
    {
      category: 'Storage behavior',
      questions: [
        model.storagePlatform
          ? `What checkpoint interval, checkpoint size, and storage concurrency are expected for ${model.storagePlatform.name}?`
          : 'Does the customer need a separate storage network, or is the current request strictly compute-fabric-only?',
        'Will storage stay on Ethernet/RoCE, or is there a different storage attachment posture that should reshape the design?',
      ],
    },
    {
      category: 'Facilities and cabling',
      questions: [
        `Are the modeled ${model.inputs.distanceMeters} meter inter-rack paths realistic for the target hall, or should optics reach assumptions change?`,
        'Is the customer constrained by rack power, liquid cooling readiness, or cable plant design in a way that changes the topology recommendation?',
      ],
    },
    {
      category: 'Operations and proof',
      questions: [
        'What telemetry, validation, and lifecycle requirements must be satisfied before the customer will trust the fabric direction?',
        'Is the immediate goal a concept design, a POC design, or a customer-ready architecture recommendation?',
      ],
    },
  ];

  if (model.gpuPlatform.recommendedRailCount > 1) {
    groups.push({
      category: 'Rail and failure domain posture',
      questions: [
        `The selected GPU platform recommends ${model.gpuPlatform.recommendedRailCount} rails. Does the customer expect explicit rail separation, or is a simplified representative fabric sufficient for this phase?`,
      ],
    });
  }

  return groups;
};

export const buildValidationChecklist = (model: Omit<PlannerModel, 'view'>): string[] => {
  return [
    `Validate exact Arista platform families, linecard density, and port-mode constraints for ${model.leafSwitch.name} and ${model.spineSwitch.name}.`,
    `Confirm host-facing optics and breakout strategy against the modeled ${model.inputs.distanceMeters} meter inter-rack distance and rack-local attachment plan.`,
    model.storagePlatform
      ? `Review ${model.storagePlatform.name} checkpoint behavior, burst concurrency, and whether the dedicated storage-fabric posture is still correct for the customer environment.`
      : 'Confirm whether the customer will keep storage outside the modeled compute fabric or needs an explicit front-end storage design.',
    'Validate ECN, PFC, and congestion-control requirements before treating the design as implementation-ready.',
    'Use telemetry and change control to test oversubscription, optics health, and expansion sequencing before production.',
  ];
};

export const buildOperatorReadiness = (model: Omit<PlannerModel, 'view'>): PlannerOperatorReadiness => {
  return {
    telemetryAndVisibility: [
      'Track optics health, fabric utilization, and congestion visibility from day 0 rather than treating them as post-deployment cleanup.',
      model.storagePlatform
        ? 'Observe storage and compute fabrics separately so checkpoint or ingest bursts do not get hidden inside aggregate backbone counters.'
        : 'Use CloudVision and switch telemetry to confirm the compute fabric behaves as expected under representative load.',
    ],
    lifecycleAndChange: [
      'Plan firmware and hardware validation around fabric-wide consistency, not one-off switch upgrades.',
      'Treat growth to the target GPU count as a controlled change sequence with explicit capacity rechecks.',
    ],
    followUpActions: [
      'Document final optics reach and patching posture from the actual rack plan.',
      'Create a day-0 validation checklist for lossless behavior, media health, and rack-power fit.',
    ],
  };
};

export const buildDiagramBrief = (model: Omit<PlannerModel, 'view'>): PlannerDiagramBrief => {
  return {
    title: `AI cluster fabric for ${model.inputs.gpuCount} GPUs`,
    audience: 'Architect',
    goal: 'Explain the recommended compute fabric, optional storage fabric, and the main validation boundaries without implying rack-exact deployment detail.',
    topology: model.currentResult.storageFabric
      ? `Show a back-end leaf-spine fabric with ${model.currentResult.computeFabric.leafCount} compute leafs and ${model.currentResult.computeFabric.spineCount} spines, plus a separate front-end storage fabric with ${model.currentResult.storageFabric.leafCount} leafs and ${model.currentResult.storageFabric.spineCount} spines.`
      : `Show a back-end leaf-spine fabric with ${model.currentResult.computeFabric.leafCount} compute leafs and ${model.currentResult.computeFabric.spineCount} spines, attached to representative GPU rack groups only.`,
    callouts: [
      `Highlight ${model.inputs.oversubscription}:1 oversubscription and why it matters for training-sensitive workloads.`,
      `Call out ${model.inputs.distanceMeters} meter representative inter-rack distance and the resulting media posture.`,
      'Label the diagram as representative and assumption-driven rather than deployment-exact.',
    ],
  };
};

export const buildFabricJustification = (
  model: Omit<PlannerModel, 'view'>,
  congestion?: PlannerCongestionAssessment,
  training?: PlannerTrainingCommunicationAssessment,
): PlannerFabricJustification => {
  const topologyChoice = model.currentResult.storageFabric
    ? `This recommendation uses a back-end leaf-spine compute fabric plus a separate representative storage fabric because the current scope includes both GPU collective traffic and explicit storage-network demand. That keeps storage behavior visible instead of implicitly assuming it can share the same pressure envelope as the compute fabric.`
    : `This recommendation uses a single back-end leaf-spine compute fabric because the current request is compute-fabric-first. This keeps the design focused on GPU east-west bandwidth and growth posture without pretending to have a finalized storage topology.`;

  const oversubscriptionAnalysis = `The compute fabric is modeled at ${model.currentResult.computeFabric.oversubscriptionRatio}:1 oversubscription with ${model.currentResult.computeFabric.leafCount} leafs and ${model.currentResult.computeFabric.spineCount} spines. This makes the design intentionally directional: it shows whether the current switch class and uplink budget are structurally aligned to the requested GPU estate, while ${training ? `the communication model recommends keeping effective posture near ${training.recommendedOversubscriptionCeiling} for training-sensitive workloads.` : 'final workload validation still determines whether this oversubscription posture is acceptable.'}`;

  const latencyAndBandwidthFit = `Representative active fabric bandwidth is ${((model.currentResult.computeFabric.usedUplinkPorts * 800) / 1000).toFixed(1)} Tbps with ${model.spineSwitch.name} carrying a representative latency class of ~${model.spineSwitch.representativeLatencyNs}ns and ${model.spineSwitch.bufferProfile}. This does not claim packet-level performance, but it does show that the recommendation is using an AI-oriented leaf/spine class rather than a generic enterprise switch posture.${congestion ? ` The current congestion assessment is ${congestion.level}, so latency and bandwidth fit should be interpreted together with the modeled traffic pressure rather than from raw bandwidth alone.` : ''}`;

  return {
    topologyChoice,
    oversubscriptionAnalysis,
    latencyAndBandwidthFit,
    loadBalancingStrategy: 'Use ECMP as the baseline and validate entropy quality under AllReduce-heavy traffic; do not assume static hashing is sufficient without path-balance evidence.',
    losslessDesignSummary: 'Lossless RoCE posture requires PFC only on the no-drop RoCE queue, early ECN marking, NIC-side DCQCN response, and explicit PFC deadlock avoidance with watchdog enabled.',
    routingUnderlaySummary: `Use ${model.inputs.routingPreference === 'EBGP_UNNUMBERED' ? 'eBGP unnumbered' : 'numbered eBGP'} with a common spine ASN, unique leaf ASNs, BFD-based fast failover, and ECMP sized to actual spine width.`,
    assumptionsAndOpenValidations: [
      'End-to-end path latency remains directional until the final topology and hardware are validated under no-load conditions.',
      'ECN thresholds and DCQCN behavior remain workload- and NIC-specific validation items.',
      'No-single-isolation posture depends on actual rail-aware host attachment rather than on the conceptual fabric view alone.',
    ],
    failureModeAnalysis: [
      {
        scenario: 'Spine switch failure',
        impact: `A spine failure removes one northbound path from every attached leaf. East-west bandwidth drops and any oversubscribed design becomes more sensitive to synchronized traffic until the spine is restored.`,
        designResponse: `Because the fabric is leaf-spine, traffic can still use the remaining spines. The practical design question is whether the remaining spine set preserves enough path diversity for the target AI workload and growth posture.`,
        operatorNote: 'Validate degraded-fabric behavior with telemetry and path-visibility tooling before presenting the design as production-ready.',
      },
      {
        scenario: 'Leaf switch failure',
        impact: `A leaf failure isolates the compute nodes attached to that leaf from the fabric. In a GPU cluster this is a localized but high-impact event because it can remove a set of servers from the collective domain outright.`,
        designResponse: `This fabric recommendation assumes failure domains stay bounded at the leaf. That is why leaf count, node attachment density, and any rail-aware placement discussion matter for larger GPU estates.`,
        operatorNote: 'Review how many servers are attached per leaf and whether the platform’s recommended rail count should drive a more explicit failure-domain design before deployment.',
      },
    ],
  };
};

const buildDecisionRecord = (
  model: Omit<PlannerModel, 'view'>,
  confidence: PlannerConfidenceSummary,
  evaluation: PlannerComputeFabricEvaluation,
): PlannerDecisionRecord => {
  const futureGpuTarget = Math.max(model.inputs.gpuCount, model.inputs.targetGpuCount ?? model.inputs.gpuCount);
  const storageDecision = model.storagePlatform && model.currentResult.storageFabric
    ? `${model.storagePlatform.name} is kept on a dedicated representative storage fabric.`
    : 'Storage remains outside the explicit compute-fabric design package.';
  const storageAlternatives = model.storagePlatform
    ? ['Share storage and compute paths to reduce switching footprint.', 'Move storage to a dedicated front-end fabric to isolate checkpoint and dataset traffic.']
    : ['Keep the current package compute-only.', 'Add a dedicated storage fabric if checkpoint and dataset traffic must be modeled.'];

  const baseMeta = buildArtifactMeta(confidence, 'Architect', ['policy-derived', 'assumption-driven', 'requires-validation'], 'requires-poc-validation');

  const items: PlannerDecisionItem[] = [
    {
      title: 'Topology depth',
      decision: evaluation.topologyDecision.recommendedTopology.replace(/-/g, ' '),
      why: evaluation.topologyDecision.decisionRationale,
      tradeoffs: [
        evaluation.topologyDecision.failureDomainNote,
        evaluation.latencyAssessment,
      ],
      alternativesConsidered: [
        'Keep a smaller two-tier Clos when hop count and simplicity matter most.',
        'Move to a deeper scale posture when radix pressure and future leaf count justify it.',
      ],
      changeConditions: [
        evaluation.topologyDecision.whenThisBreaks,
        'Revisit the topology if future scale materially increases leaf count or if stricter failure-domain isolation becomes mandatory.',
      ],
      implementationConsequences: [
        'The underlay, ECMP width, and validation plan must match the selected topology depth.',
        'The topology recommendation should drive the diagram and failure-test plan, not just the switch count.',
      ],
      meta: baseMeta,
    },
    {
      title: 'Spine class',
      decision: model.spineSwitch.name,
      why: `${model.spineSwitch.name} was selected because ${model.futureResult.computeFabric.leafCount} projected leafs and ${model.futureResult.computeFabric.usedUplinkPorts} projected spine-facing uplinks justify this chassis class better than a smaller modular spine.`,
      tradeoffs: [
        'A larger spine class reduces the number of spine chassis but increases modular BOM depth and chassis-level planning complexity.',
        'A smaller spine class may look cheaper initially but can push the design into more spines or earlier redesign.',
      ],
      alternativesConsidered: [
        'Use a smaller modular spine and accept more spine chassis or less headroom.',
        'Use a larger modular spine to preserve radix headroom and cleaner expansion posture.',
      ],
      changeConditions: [
        'Change spine class if projected leaf count drops enough to fit a smaller chassis cleanly.',
        `Change spine class if the future target moves materially away from ${futureGpuTarget} GPUs.`,
      ],
      implementationConsequences: [
        '7800R4-class spine selection directly affects chassis decomposition, occupied linecards, supervisor count, fabric modules, and cooling modules.',
        'Spine class also shapes ECMP width, failure-share math, rack placement, and optics planning.',
      ],
      meta: baseMeta,
    },
    {
      title: 'Oversubscription posture',
      decision: `${model.currentResult.computeFabric.oversubscriptionRatio}:1 target`,
      why: evaluation.oversubscriptionAssessment,
      tradeoffs: [
        'Tighter oversubscription improves AllReduce posture but increases switching footprint.',
        'Looser oversubscription reduces switching cost but raises collective sensitivity and proof burden.',
      ],
      alternativesConsidered: [
        'Keep the fabric near non-blocking for training-heavy workloads.',
        'Accept more oversubscription only when workload evidence shows the traffic can tolerate contention.',
      ],
      changeConditions: [
        'Reduce oversubscription if proof points show congestion or poor collective scaling.',
        'Revisit if the workload becomes less synchronization-heavy than assumed.',
      ],
      implementationConsequences: [
        'Oversubscription posture changes the ECMP/load-balance validation plan and the strength of customer-safe claims.',
      ],
      meta: buildArtifactMeta(confidence, 'SE', ['input-derived', 'policy-derived', 'requires-validation'], 'requires-poc-validation'),
    },
    {
      title: 'Underlay and load balancing',
      decision: model.inputs.routingPreference === 'EBGP_UNNUMBERED' ? 'eBGP unnumbered underlay' : 'numbered eBGP underlay',
      why: `${evaluation.routingUnderlay.bgpRecommendation} ${evaluation.routingUnderlay.ecmpPosture}`,
      tradeoffs: [
        'eBGP unnumbered simplifies link addressing and is a cleaner scale-out fabric posture.',
        'Numbered eBGP can align better with environments that need explicit addressing conventions.',
      ],
      alternativesConsidered: [
        'Use eBGP unnumbered as the default Clos underlay posture.',
        'Use numbered eBGP where operational conventions or toolchains require it.',
      ],
      changeConditions: [
        'Change if the customer’s operational model or automation stack requires numbered links.',
        'Tighten the underlay validation if convergence sensitivity becomes a top customer concern.',
      ],
      implementationConsequences: [
        'The routing choice affects ASN planning, BFD posture, and the CLI validation packet handed to operators.',
      ],
      meta: buildArtifactMeta(confidence, 'Operator', ['policy-derived', 'requires-validation'], 'requires-poc-validation'),
    },
    {
      title: 'Lossless RoCE posture',
      decision: 'No-drop RoCE class with ECN, DCQCN, and watchdog-backed PFC discipline',
      why: `${evaluation.losslessDesign.pfcStrategy} ${evaluation.losslessDesign.ecnStrategy}`,
      tradeoffs: [
        'Lossless posture is necessary for RoCEv2 but increases validation burden and operational sensitivity.',
        'Over-broad PFC scope creates avoidable blast radius and deadlock risk.',
      ],
      alternativesConsidered: [
        'Scope PFC to the RoCE no-drop class only.',
        'Avoid broader pause domains or default queue assumptions.',
      ],
      changeConditions: [
        'Revisit only if the transport model changes away from RoCEv2 or host/NIC behavior differs materially from assumptions.',
      ],
      implementationConsequences: [
        'Implementation requires EOS QoS scaffolding, host validation, and explicit deadlock testing instead of generic Ethernet defaults.',
      ],
      meta: buildArtifactMeta(confidence, 'Architect', ['policy-derived', 'assumption-driven', 'requires-validation'], 'requires-poc-validation'),
    },
    {
      title: 'Storage isolation',
      decision: storageDecision,
      why: model.currentResult.storageFabric
        ? 'Storage isolation keeps checkpoint and dataset traffic visible and prevents the design package from pretending those flows can safely share the exact same pressure envelope as GPU collectives.'
        : 'The current request is compute-first, so this package avoids inventing a storage topology without explicit demand.',
      tradeoffs: [
        'Dedicated storage switching increases design complexity but clarifies traffic isolation.',
        'Shared fabrics can reduce footprint but increase contention risk and make proof harder.',
      ],
      alternativesConsidered: storageAlternatives,
      changeConditions: [
        'Add storage isolation if checkpoint behavior or storage concurrency becomes a first-class requirement.',
        'Remove it only if storage is truly out of scope for the current design conversation.',
      ],
      implementationConsequences: [
        'Storage isolation changes optics demand, BOM scope, validation sequences, and operator telemetry expectations.',
      ],
      meta: buildArtifactMeta(confidence, 'SE', ['assumption-driven', 'requires-validation'], model.currentResult.storageFabric ? 'requires-poc-validation' : 'requires-customer-input'),
    },
    {
      title: 'Growth posture',
      decision: `Plan current scale at ${model.inputs.gpuCount} GPUs with a future target of ${futureGpuTarget} GPUs`,
      why: `The design package uses the future target to avoid selecting a spine or topology posture that becomes obsolete immediately after the first growth cycle.`,
      tradeoffs: [
        'Designing for growth increases current hardware footprint but improves decision durability.',
        'Designing only for day-0 can reduce immediate cost but creates earlier redesign pressure.',
      ],
      alternativesConsidered: [
        'Design only for current GPU count.',
        'Use the future target as the real selection boundary for spine class and expansion posture.',
      ],
      changeConditions: [
        'If the growth target changes, rerun the package and re-evaluate spine class, rack count, and BOM decomposition.',
      ],
      implementationConsequences: [
        'Growth posture should be reflected in the BOM packet, validation plan, and customer-facing expansion story.',
      ],
      meta: buildArtifactMeta(confidence, 'SE', ['input-derived', 'policy-derived'], 'ready-for-discussion'),
    },
  ];

  return { items };
};

const buildImplementationReadiness = (
  model: Omit<PlannerModel, 'view'>,
  confidence: PlannerConfidenceSummary,
  evaluation: PlannerComputeFabricEvaluation,
  validationChecklist: string[],
): PlannerImplementationReadiness => ({
  underlayPosture: [
    evaluation.routingUnderlay.bgpRecommendation,
    evaluation.routingUnderlay.asnAllocationStrategy,
    evaluation.routingUnderlay.bfdPosture,
    evaluation.routingUnderlay.convergenceTarget,
    evaluation.routingUnderlay.ecmpPosture,
  ],
  roceQosPosture: [
    evaluation.losslessDesign.classificationModel,
    evaluation.losslessDesign.pfcStrategy,
    evaluation.losslessDesign.ecnStrategy,
    evaluation.losslessDesign.dcqcnStrategy,
    evaluation.losslessDesign.deadlockAvoidance,
  ],
  hostRailPosture: [
    model.inputs.railMode === 'RAIL_OPTIMIZED'
      ? 'Rail-optimized posture assumes host-facing attachment is deliberately split across independent rails where the platform supports it.'
      : 'Single-plane posture keeps the live design simpler, but host-facing failure domains remain bounded at the leaf unless a later rail-aware design is adopted.',
    `${model.gpuPlatform.name} is modeled with ${model.gpuPlatform.computeNicsPerNode} compute NICs at ${model.gpuPlatform.computeNicSpeed} and a recommended rail count of ${model.gpuPlatform.recommendedRailCount}.`,
    'NIC locality and host attachment remain implementation validation items; this package does not claim the host-side wiring has been finalized.',
  ],
  validationSequence: validationChecklist,
  configSkeletonLabels: [
    'EOS underlay BGP skeleton',
    'EOS QoS / RoCE policy skeleton',
    'EOS interface and optics bring-up skeleton',
    'Host NIC / DCQCN validation skeleton',
    'Failure-test and telemetry capture skeleton',
  ],
  cliValidationCategories: [
    'BGP adjacency and convergence checks',
    'ECMP path and utilization checks',
    'PFC / ECN / CNP counter checks',
    'Interface optics and error-health checks',
    'Rail and host-attachment validation checks',
    'Failure-domain and degraded-fabric verification checks',
  ],
  meta: buildArtifactMeta(confidence, 'Operator', ['policy-derived', 'assumption-driven', 'requires-validation'], 'requires-poc-validation'),
});

const buildHardwarePacket = (
  confidence: PlannerConfidenceSummary,
  bomSections: PlannerBomSection[],
): PlannerHardwarePacket => {
  const hasModularBreakdown = bomSections.some((section) =>
    section.lines.some((line) =>
      line.role.includes('linecard') ||
      line.role.includes('supervisor') ||
      line.role.includes('power-supply') ||
      line.role.includes('fabric-module') ||
      line.role.includes('fabric-cooling'),
    ),
  );

  return {
    bomSections,
    modularBreakdownNarrative: hasModularBreakdown
      ? 'Modular 7800R4 spine planning is decomposed into chassis, occupied linecards, supervisors, representative power supplies, fabric modules, and cooling modules so the hardware packet reflects the actual architectural consequence of choosing a larger spine class. Linecard counts are driven by occupied spine-facing demand, not by assuming every slot is populated, while PSU lines remain assumption-driven placeholders until the final chassis build is validated.'
      : 'No modular 7800R4 decomposition is required in the current recommendation, so spine hardware remains a simpler fixed-system packet.',
    componentRoleSummary: [
      'Chassis lines show the number of modular switch shells required.',
      'Linecard lines reflect occupied port demand rather than full-slot population.',
      'Supervisor lines follow the current failure-domain posture and redundancy expectation.',
      'Power-supply lines are representative placeholders tied to redundancy posture and must be validated against the exact chassis build.',
      'Fabric module and cooling module lines make modular spine class consequences visible early in the design process.',
      'Optics, cabling, and OOB lines remain a mix of deterministic and assumption-driven items until the rack plan is finalized.',
    ],
    confidenceTags: [
      'Deterministic: node, switch, and occupied-port-derived quantities',
      'Policy-derived: modular decomposition and redundancy posture',
      'Assumed: OOB, structured cabling, and spares placeholders',
      'Requires validation: exact optics reach, rack placement, and customer-specific media strategy',
    ],
    meta: buildArtifactMeta(confidence, 'SE', ['input-derived', 'policy-derived', 'assumption-driven'], 'requires-poc-validation'),
  };
};

const buildPresentationPack = (
  confidence: PlannerConfidenceSummary,
  designNarrative: PlannerDesignNarrative,
  diagramBrief: PlannerDiagramBrief,
  fabricJustification: PlannerFabricJustification,
  evaluation: PlannerComputeFabricEvaluation,
  assumptionMap: PlannerAssumption[],
  risks: PlannerRiskItem[],
): PlannerPresentationPack => ({
  customerSummary: evaluation.writtenJustification,
  topologyStory: `${designNarrative.architectureSummary} ${fabricJustification.topologyChoice}`,
  diagramBrief,
  proofChecklist: [
    ...evaluation.requirementScorecard
      .filter((item) => item.status !== 'pass')
      .slice(0, 6)
      .map((item) => `${item.requirement}: ${item.followUpValidation}`),
    ...evaluation.losslessDesign.validationChecklist.slice(0, 3),
  ],
  objectionsAndCaveats: [
    ...risks.slice(0, 3).map((risk) => `${risk.title}: ${risk.body}`),
    ...assumptionMap.slice(0, 2).map((assumption) => `${assumption.label}: ${assumption.value}`),
  ],
  meta: buildArtifactMeta(confidence, 'Customer', ['policy-derived', 'assumption-driven', 'requires-validation'], 'requires-poc-validation'),
});

const buildDesignRecommendation = (
  model: Omit<PlannerModel, 'view'>,
  confidence: PlannerConfidenceSummary,
  risks: PlannerRiskItem[],
  executiveSummary: PlannerExecutiveSummary,
  evaluation: PlannerComputeFabricEvaluation,
): PlannerDesignRecommendation => ({
  recommendation: executiveSummary.recommendation,
  topology: evaluation.topologyDecision.recommendedTopology.replace(/-/g, ' '),
  leafClass: model.leafSwitch.name,
  spineClass: model.spineSwitch.name,
  railPosture: model.inputs.railMode === 'RAIL_OPTIMIZED' ? 'Rail optimized' : 'Single plane',
  scope: model.inputs.scope === 'COMPUTE_AND_STORAGE' ? 'Compute plus storage' : 'Compute fabric only',
  growthPosture: `Current ${model.inputs.gpuCount} GPUs, future target ${Math.max(model.inputs.gpuCount, model.inputs.targetGpuCount ?? model.inputs.gpuCount)} GPUs`,
  fitSummary: executiveSummary.architectureSummary,
  notClaimed: [
    'This package does not claim final queue-threshold correctness.',
    'This package does not claim rack-exact placement or final optics validation.',
    'This package does not replace host-NIC, workload, or POC validation.',
  ],
  keyRisks: risks.slice(0, 3),
  meta: buildArtifactMeta(confidence, 'SE', ['input-derived', 'policy-derived', 'assumption-driven'], 'ready-for-discussion'),
});

export const buildDesignPackage = (
  model: Omit<PlannerModel, 'view'>,
  confidence: PlannerConfidenceSummary,
  risks: PlannerRiskItem[],
  executiveSummary: PlannerExecutiveSummary,
  designNarrative: PlannerDesignNarrative,
  validationChecklist: string[],
  diagramBrief: PlannerDiagramBrief,
  fabricJustification: PlannerFabricJustification,
  evaluation: PlannerComputeFabricEvaluation,
  assumptionMap: PlannerAssumption[],
  bomSections: PlannerBomSection[],
): PlannerDesignPackage => ({
  recommendation: buildDesignRecommendation(model, confidence, risks, executiveSummary, evaluation),
  decisionRecord: buildDecisionRecord(model, confidence, evaluation),
  implementationReadiness: buildImplementationReadiness(model, confidence, evaluation, validationChecklist),
  hardwarePacket: buildHardwarePacket(confidence, bomSections),
  presentationPack: buildPresentationPack(confidence, designNarrative, diagramBrief, fabricJustification, evaluation, assumptionMap, risks),
});
