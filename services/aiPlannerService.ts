import { GPU_PLATFORMS, STORAGE_PLATFORMS } from '../data/aiSpecs';
import { ARISTA_SWITCHES } from '../data/hardware';
import { FABRIC_PROFILES } from '../data/fabricProfiles';
import type { PlannerDesignPackage, PlannerInputs, PlannerModel, PlannerViewModel } from '../features/ai-planner/types';
import { calculateAICluster } from './sizerEngine';
import { getMediaRecommendation } from './mediaAdvisor';
import {
  buildAssumptionMap,
  buildConfidenceSummary,
  buildDesignNarrative,
  buildDesignPackage,
  buildDiagramBrief,
  buildDiscoveryQuestions,
  buildExecutiveSummary,
  buildFabricJustification,
  buildOperatorReadiness,
  buildRiskSummary,
  buildValidationChecklist,
} from './plannerArtifactService';
import { assessCongestion, assessTrainingCommunication } from './plannerPressureModels';
import { buildComputeFabricEvaluation } from './plannerComputeFabricEvaluation';
import { pickPlannerSpineModel } from './plannerSpineSelector';
import {
  appendPlannerPlaceholderBomLines,
  buildPlannerBomLines,
  buildPlannerBomSections,
} from './plannerBomBuilder';
import {
  buildPlannerAssumptions,
  buildPlannerWarnings,
  buildVisualMetrics,
} from './plannerViewHelpers';

const getGpuPlatform = (gpuId: string) => {
  const platform = GPU_PLATFORMS.find((item) => item.id === gpuId);
  if (!platform) {
    throw new Error(`Unknown GPU platform: ${gpuId}`);
  }
  return platform;
};

const getSwitchBySku = (sku: string, role: 'LEAF' | 'SPINE') => {
  const switchProfile = ARISTA_SWITCHES.find((item) => item.sku === sku && item.role === role);
  if (!switchProfile) {
    throw new Error(`Unknown ${role.toLowerCase()} switch profile: ${sku}`);
  }
  return switchProfile;
};

const getFabricProfile = (fabricProfileId: string) => {
  const profile = FABRIC_PROFILES.find((item) => item.id === fabricProfileId);
  if (!profile) {
    throw new Error(`Unknown fabric profile: ${fabricProfileId}`);
  }
  return profile;
};

const createPlannerModelBase = (inputs: PlannerInputs) => {
  const futureGpuTarget = Math.max(inputs.gpuCount, inputs.targetGpuCount ?? inputs.gpuCount);
  const gpuPlatform = getGpuPlatform(inputs.selectedGpuId);
  const storagePlatform = inputs.selectedStorageId ? STORAGE_PLATFORMS[inputs.selectedStorageId] : undefined;
  const fabricProfile = getFabricProfile(inputs.fabricProfileId);
  const leafSwitch = getSwitchBySku(
    fabricProfile.allowCustomOverride ? inputs.customLeafSku ?? fabricProfile.defaultLeafSku : fabricProfile.defaultLeafSku,
    'LEAF',
  );
  const spineSwitch = fabricProfile.allowCustomOverride
    ? getSwitchBySku(inputs.customSpineSku ?? fabricProfile.defaultSpineSku, 'SPINE')
    : pickPlannerSpineModel(inputs, leafSwitch, gpuPlatform, fabricProfile.defaultSpineSku);

  const currentResult = calculateAICluster(
    inputs.gpuCount,
    inputs.oversubscription,
    leafSwitch,
    spineSwitch,
    gpuPlatform,
    inputs.scope === 'COMPUTE_AND_STORAGE' ? storagePlatform : undefined,
  );

  const futureResult = calculateAICluster(
    futureGpuTarget,
    inputs.oversubscription,
    leafSwitch,
    spineSwitch,
    gpuPlatform,
    inputs.scope === 'COMPUTE_AND_STORAGE' ? storagePlatform : undefined,
  );

  return {
    inputs,
    gpuPlatform,
    storagePlatform: inputs.scope === 'COMPUTE_AND_STORAGE' ? storagePlatform : undefined,
    leafSwitch,
    spineSwitch,
    currentResult,
    futureResult,
    fabricProfile,
  };
};

const createPlannerViewModel = (modelBase: ReturnType<typeof createPlannerModelBase>): PlannerViewModel => {
  const { inputs, currentResult, futureResult, gpuPlatform, fabricProfile } = modelBase;

  const fabricMedia = getMediaRecommendation({
    role: 'fabric-interconnect',
    distanceMeters: inputs.distanceMeters,
    preference: inputs.mediaPreference,
    computeNicSpeed: gpuPlatform.computeNicSpeed,
    breakoutRequired: false,
    scope: inputs.scope,
  });

  const accessMedia = getMediaRecommendation({
    role: 'compute-access',
    distanceMeters: inputs.distanceMeters,
    preference: inputs.mediaPreference,
    computeNicSpeed: gpuPlatform.computeNicSpeed,
    breakoutRequired: currentResult.computeFabric.breakoutRequired,
    scope: inputs.scope,
  });

  const warnings = buildPlannerWarnings(inputs, currentResult, futureResult);
  const assumptions = buildPlannerAssumptions(modelBase, fabricMedia, accessMedia);
  const assumptionMap = buildAssumptionMap(modelBase, assumptions, fabricMedia, accessMedia);
  const trainingCommunication = assessTrainingCommunication(modelBase);
  const congestionAssessment = assessCongestion(modelBase, trainingCommunication);
  const riskSummary = buildRiskSummary(modelBase, congestionAssessment, trainingCommunication);
  const confidenceSummary = buildConfidenceSummary(modelBase, riskSummary);
  const designNarrative = buildDesignNarrative(modelBase, riskSummary);
  const discoveryQuestions = buildDiscoveryQuestions(modelBase);
  const validationChecklist = buildValidationChecklist(modelBase);
  const operatorReadiness = buildOperatorReadiness(modelBase);
  const diagramBrief = buildDiagramBrief(modelBase);
  const fabricJustification = buildFabricJustification(modelBase, congestionAssessment, trainingCommunication);
  const computeFabricEvaluation = buildComputeFabricEvaluation(modelBase, trainingCommunication, congestionAssessment);

  return {
    title: `${gpuPlatform.name} on ${modelBase.leafSwitch.name} + ${modelBase.spineSwitch.name}`,
    subtitle: `${fabricProfile.label} with ${inputs.oversubscription}:1 oversubscription and ${inputs.scope === 'COMPUTE_AND_STORAGE' ? 'compute + storage scope' : 'compute-only scope'}.`,
    assumptions,
    assumptionMap,
    warnings,
    capacityPlan: {
      futureNodeCount: futureResult.nodeCount,
      additionalLeaves: Math.max(0, futureResult.computeFabric.leafCount - currentResult.computeFabric.leafCount),
      additionalSpines: Math.max(0, futureResult.computeFabric.spineCount - currentResult.computeFabric.spineCount),
      additionalRacks: Math.max(0, futureResult.rackPlanning.rackCount - currentResult.rackPlanning.rackCount),
      futureWarnings: [...futureResult.warnings, ...futureResult.computeFabric.warnings],
    },
    bomLines: [],
    bomSections: [],
    fabricMedia,
    accessMedia,
    executiveSummary: buildExecutiveSummary(modelBase, riskSummary, confidenceSummary),
    designNarrative,
    discoveryQuestions,
    validationChecklist,
    riskSummary,
    confidenceSummary,
    congestionAssessment,
    trainingCommunication,
    operatorReadiness,
    diagramBrief,
    fabricJustification,
    computeFabricEvaluation,
    designPackage: {} as PlannerDesignPackage,
    visualMetrics: buildVisualMetrics(modelBase),
  };
};

export const buildAIPlannerModel = (inputs: PlannerInputs): PlannerModel => {
  const modelBase = createPlannerModelBase(inputs);
  const view = createPlannerViewModel(modelBase);
  const model: PlannerModel = { ...modelBase, view };

  const baseBomLines = buildPlannerBomLines(model, view.fabricMedia, view.accessMedia);
  view.bomLines = appendPlannerPlaceholderBomLines(model, baseBomLines);
  view.bomSections = buildPlannerBomSections(view.bomLines);
  view.designPackage = buildDesignPackage(
    modelBase,
    view.confidenceSummary,
    view.riskSummary,
    view.executiveSummary,
    view.designNarrative,
    view.validationChecklist,
    view.diagramBrief,
    view.fabricJustification,
    view.computeFabricEvaluation,
    view.assumptionMap,
    view.bomSections,
  );

  return model;
};
