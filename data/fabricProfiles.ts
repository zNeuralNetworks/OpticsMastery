import { FabricProfile } from '../features/ai-planner/types';

export const FABRIC_PROFILES: FabricProfile[] = [
  {
    id: 'balanced-fixed-modular',
    label: 'Balanced fixed leaf + modular spine',
    description: 'Default AI leaf-spine profile using 7060X6 leaves and auto-selecting a modular spine class from 7804R4 through 7816LR as scale grows.',
    defaultLeafSku: 'DCS-7060X6-64S',
    defaultSpineSku: 'DCS-7804R4',
    allowCustomOverride: false,
  },
  {
    id: 'high-scale-modular',
    label: 'High-scale modular spine',
    description: 'Use 7060X6 leaves with a higher modular spine floor, auto-selecting from 7808R4 through 7816LR for larger clusters and future headroom.',
    defaultLeafSku: 'DCS-7060X6-64S',
    defaultSpineSku: 'DCS-7808R4',
    allowCustomOverride: false,
  },
  {
    id: 'custom-profiles',
    label: 'Custom profiles',
    description: 'Manually select leaf and spine profiles for architecture-specific tuning.',
    defaultLeafSku: 'DCS-7060X6-64S',
    defaultSpineSku: 'DCS-7804R4',
    allowCustomOverride: true,
  },
];
