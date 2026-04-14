import { describe, expect, it } from 'vitest';
import { CABLES } from '../../data/catalog';
import { GPU_PLATFORMS } from '../../data/aiSpecs';
import { TRANSCEIVERS } from '../../features/datasheet/data/transceivers';
import { DEFAULT_PLANNER_INPUTS } from '../../features/ai-planner/defaults';
import { buildAIPlannerModel } from '../../services/aiPlannerService';

describe('800G media catalog accuracy', () => {
  it('uses canonical 800G family SKUs in the live cable catalog', () => {
    expect(CABLES.some((item) => item.sku === 'C-O800-O800-xM')).toBe(true);
    expect(CABLES.some((item) => item.sku === 'A-O800-O800-xM')).toBe(true);
    expect(CABLES.some((item) => item.sku === 'C-O800-2Q400-xM')).toBe(true);
    expect(CABLES.some((item) => item.sku === 'A-O800-2Q400-xM')).toBe(true);

    expect(CABLES.some((item) => item.sku === 'CAB-O-O-800G-xM')).toBe(false);
    expect(CABLES.some((item) => item.sku === 'AOC-O-O-800G-xM')).toBe(false);
    expect(CABLES.some((item) => item.sku === 'CAB-O-2Q-800G-xM')).toBe(false);
  });

  it('keeps datasheet cable families aligned with the live 800G cable catalog', () => {
    expect(TRANSCEIVERS.some((item) => item.sku === 'C-O800-O800-xM')).toBe(true);
    expect(TRANSCEIVERS.some((item) => item.sku === 'A-O800-O800-xM')).toBe(true);
    expect(TRANSCEIVERS.some((item) => item.sku === 'C-O800-2Q400-xM')).toBe(true);
    expect(TRANSCEIVERS.some((item) => item.sku === 'A-O800-2Q400-xM')).toBe(true);
  });

  it('recommends corrected 800G family SKUs in the planner for both straight and breakout media', () => {
    const b200Model = buildAIPlannerModel({
      ...DEFAULT_PLANNER_INPUTS,
      selectedGpuId: GPU_PLATFORMS.find((item) => item.id === 'b200-nvl72')!.id,
      gpuCount: 144,
      targetGpuCount: 288,
      distanceMeters: 10,
      mediaPreference: 'PREFER_AOC',
    });

    expect(b200Model.view.fabricMedia.item.sku).toBe('A-O800-O800-xM');
    expect(b200Model.view.fabricMedia.item.description).toContain('800G OSFP to OSFP Active Optical Cable');

    const h100Model = buildAIPlannerModel({
      ...DEFAULT_PLANNER_INPUTS,
      selectedGpuId: 'h100-hgx',
      distanceMeters: 10,
      mediaPreference: 'PREFER_AOC',
    });

    expect(h100Model.view.accessMedia.item.sku).toBe('A-O800-2Q400-xM');
  });

  it('decomposes modular 7800R4 spine BOMs with supervisors and representative PSU placeholders', () => {
    const model = buildAIPlannerModel(DEFAULT_PLANNER_INPUTS);
    const computeFabricSection = model.view.bomSections.find((section) => section.title === 'Compute fabric');

    expect(computeFabricSection).toBeDefined();
    expect(computeFabricSection?.lines.some((line) => line.role === 'compute-spine-linecard')).toBe(true);
    expect(computeFabricSection?.lines.some((line) => line.role === 'compute-spine-supervisor')).toBe(true);
    expect(computeFabricSection?.lines.some((line) => line.role === 'compute-spine-power-supply')).toBe(true);
    expect(computeFabricSection?.lines.find((line) => line.role === 'compute-spine-power-supply')?.quantitySource).toBe('assumed');
  });
});
