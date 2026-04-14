import { CABLES, OPTICS } from '../data/catalog';
import { Cable, Optic } from '../types';

export type MediaPreferenceOption = 'AUTO' | 'PREFER_DAC' | 'PREFER_AOC' | 'PREFER_FIBER';
export type MediaRecommendationType = 'DAC' | 'AOC' | 'MMF' | 'SMF';
export type MediaRecommendationRole = 'fabric-interconnect' | 'compute-access';

interface MediaRecommendationInput {
  role: MediaRecommendationRole;
  distanceMeters: number;
  preference: MediaPreferenceOption;
  computeNicSpeed: '200G' | '400G' | '800G';
  breakoutRequired: boolean;
  scope: 'COMPUTE_FABRIC' | 'COMPUTE_AND_STORAGE';
}

export interface MediaRecommendation {
  type: MediaRecommendationType;
  role: MediaRecommendationRole;
  sourceDataset: 'catalog-optics' | 'catalog-cables';
  item: Optic | Cable;
  budgetAvailable: boolean;
  budgetValue?: number;
  validationEligible: boolean;
  rationale: string;
  assumptions: string[];
  assumptionTags: string[];
  confidence: 'high' | 'medium';
  color: string;
  label: string;
  quantityModel: 'link-count' | 'breakout-assembly' | 'endpoint-optics';
}

const MEDIA_PRESENTATION: Record<MediaRecommendationType, { color: string; label: string }> = {
  DAC: { color: 'text-orange-500', label: 'Passive copper' },
  AOC: { color: 'text-blue-500', label: 'Active optical cable' },
  MMF: { color: 'text-green-500', label: 'Multimode optics' },
  SMF: { color: 'text-yellow-500', label: 'Single-mode optics' },
};

const findOptic = (sku: string) => {
  const optic = OPTICS.find((item) => item.sku === sku);
  if (!optic) {
    throw new Error(`Unknown optic SKU: ${sku}`);
  }
  return optic;
};

const findCable = (sku: string) => {
  const cable = CABLES.find((item) => item.sku === sku);
  if (!cable) {
    throw new Error(`Unknown cable SKU: ${sku}`);
  }
  return cable;
};

const buildRecommendation = (
  type: MediaRecommendationType,
  role: MediaRecommendationRole,
  item: Optic | Cable,
  rationale: string,
  assumptions: string[],
  assumptionTags: string[],
  confidence: 'high' | 'medium',
  quantityModel: MediaRecommendation['quantityModel']
): MediaRecommendation => {
  const isOptic = 'media' in item;
  const budgetAvailable = isOptic && typeof item.opticBudgetDb === 'number';

  return {
    type,
    role,
    sourceDataset: isOptic ? 'catalog-optics' : 'catalog-cables',
    item,
    budgetAvailable,
    budgetValue: isOptic ? item.opticBudgetDb ?? undefined : undefined,
    validationEligible: isOptic && (item.media === 'SMF' || item.media === 'MMF') && budgetAvailable,
    rationale,
    assumptions,
    assumptionTags,
    confidence,
    color: MEDIA_PRESENTATION[type].color,
    label: MEDIA_PRESENTATION[type].label,
    quantityModel,
  };
};

const getFabricInterconnectRecommendation = (
  distanceMeters: number,
  preference: MediaPreferenceOption,
  scope: 'COMPUTE_FABRIC' | 'COMPUTE_AND_STORAGE'
): MediaRecommendation => {
  if (preference === 'PREFER_DAC' || distanceMeters <= 3) {
    return buildRecommendation(
      'DAC',
      'fabric-interconnect',
      findCable('C-O800-O800-xM'),
      'Fabric interconnects prefer passive copper when the backend is row-local and reach stays inside standard DAC lengths.',
      ['Assumes backend switches and racks are physically co-located within passive copper reach.'],
      ['distance', 'fabric-speed'],
      'high',
      'link-count'
    );
  }

  if (preference === 'PREFER_AOC' || distanceMeters <= 30) {
    return buildRecommendation(
      'AOC',
      'fabric-interconnect',
      findCable('A-O800-O800-xM'),
      'AOC is preferred when reach exceeds passive copper but the fabric still stays inside short-row optical distances.',
      ['Assumes direct-attached optical cabling is acceptable for the interconnect layer.'],
      ['distance', 'fabric-speed'],
      'high',
      'link-count'
    );
  }

  if (distanceMeters <= 100) {
    return buildRecommendation(
      'MMF',
      'fabric-interconnect',
      findOptic('OSFP-800G-SR8'),
      'MMF interconnects stay viable for short structured optical paths while preserving 800G lane integrity.',
      ['Assumes MPO-based MMF plant is acceptable for the selected spine-leaf topology.'],
      ['distance', 'structured-optics'],
      'high',
      'endpoint-optics'
    );
  }

  if (distanceMeters <= 500) {
    return buildRecommendation(
      'SMF',
      'fabric-interconnect',
      findOptic('OSFP-800G-DR8'),
      'Single-mode DR optics provide a conservative default for structured 800G fabric links beyond the MMF envelope.',
      [
        'Assumes structured parallel SMF for the fabric core.',
        scope === 'COMPUTE_AND_STORAGE'
          ? 'Full-stack mode keeps the same media family for representative storage-fabric interconnects.'
          : 'Backend-only mode assumes a single fabric domain.',
      ],
      ['distance', 'structured-optics', 'planning-mode'],
      'high',
      'endpoint-optics'
    );
  }

  return buildRecommendation(
    'SMF',
    'fabric-interconnect',
    findOptic('OSFP-800G-XDR8'),
    'XDR-class optics are used when the modeled fabric distance exceeds conservative DR reach assumptions.',
    ['Assumes structured parallel SMF and optics-qualified patching for longer interconnect paths.'],
    ['distance', 'long-reach'],
    'medium',
    'endpoint-optics'
  );
};

const getComputeAccessRecommendation = (
  distanceMeters: number,
  preference: MediaPreferenceOption,
  computeNicSpeed: '200G' | '400G' | '800G',
  breakoutRequired: boolean
): MediaRecommendation => {
  if (breakoutRequired && computeNicSpeed === '400G') {
    if (preference === 'PREFER_DAC' || distanceMeters <= 2) {
      return buildRecommendation(
        'DAC',
        'compute-access',
        findCable('C-O800-2Q400-xM'),
        'Passive 800G-to-2x400G breakout copper is the cleanest access-media choice for very short rack-scale runs.',
        ['Assumes 400G NICs are cabled directly to 800G leaf downlinks via OSFP-to-2xQSFP112 breakouts.'],
        ['breakout', 'distance', 'access-layer'],
        'high',
        'breakout-assembly'
      );
    }

    if (preference === 'PREFER_AOC' || distanceMeters <= 30) {
      return buildRecommendation(
        'AOC',
        'compute-access',
        findCable('A-O800-2Q400-xM'),
        'AOC breakout assemblies are preferred when 400G access links extend beyond passive copper reach.',
        ['Assumes direct breakout AOCs are acceptable for server-facing 400G connections.'],
        ['breakout', 'distance', 'access-layer'],
        'high',
        'breakout-assembly'
      );
    }

    if (distanceMeters <= 50) {
      return buildRecommendation(
        'MMF',
        'compute-access',
        findOptic('OSFP-800G-2VSR4'),
        'VSR-class dual-rate optics fit short-reach 2x400G breakout access designs over MMF.',
        ['Assumes dual-MPO breakout optics are acceptable for the server-facing optical design.'],
        ['breakout', 'distance', 'structured-optics'],
        'medium',
        'endpoint-optics'
      );
    }

    return buildRecommendation(
      'SMF',
      'compute-access',
      findOptic('OSFP-800G-2FR4'),
      'Dual-rate FR4 optics provide a conservative optical default for 2x400G breakout access paths beyond short-reach MMF.',
      ['Assumes duplex-SMF breakout optics rather than direct-attach breakout assemblies.'],
      ['breakout', 'distance', 'structured-optics'],
      'medium',
      'endpoint-optics'
    );
  }

  if (computeNicSpeed === '800G') {
    return getFabricInterconnectRecommendation(distanceMeters, preference, 'COMPUTE_FABRIC');
  }

  return buildRecommendation(
    'SMF',
    'compute-access',
    findOptic('OSFP-800G-DR8'),
    'Compute access is modeled with 800G leaf-side optics because the current catalog does not include explicit 800G-to-lower-rate breakout media for this NIC profile.',
    [
      `Compute NIC speed is ${computeNicSpeed}; exact lower-rate access media is not fully modeled in the current catalog.`,
      'Use the BOM summary as an assumption-driven placeholder for server-facing optics in this profile.',
    ],
    ['catalog-gap', 'access-layer', 'assumption'],
    'medium',
    'endpoint-optics'
  );
};

export const getMediaRecommendation = (input: MediaRecommendationInput): MediaRecommendation =>
  input.role === 'fabric-interconnect'
    ? getFabricInterconnectRecommendation(input.distanceMeters, input.preference, input.scope)
    : getComputeAccessRecommendation(input.distanceMeters, input.preference, input.computeNicSpeed, input.breakoutRequired);
