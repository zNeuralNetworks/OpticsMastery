
import { OPTICS, CABLES, BREAKOUT_MODES } from './catalog';
import { FormFactor, Optic, Cable, BreakoutMode } from '../types';

/**
 * Finds an optic by its exact SKU.
 */
export const findOpticBySku = (sku: string): Optic | undefined => {
  return OPTICS.find(o => o.sku === sku);
};

/**
 * Lists all optics for a specific form factor.
 */
export const listOpticsByFormFactor = (formFactor: FormFactor): Optic[] => {
  return OPTICS.filter(o => o.formFactor === formFactor);
};

/**
 * Lists all optics for a specific speed.
 */
export const listOpticsBySpeed = (speed: string): Optic[] => {
  return OPTICS.filter(o => o.speed === speed);
};

/**
 * Finds a cable by its exact SKU.
 */
export const findCableBySku = (sku: string): Cable | undefined => {
  return CABLES.find(c => c.sku === sku);
};

/**
 * Lists breakout modes for a specific speed.
 */
export const getBreakoutModesBySpeed = (speed: string): BreakoutMode[] => {
  return BREAKOUT_MODES.filter(m => m.sourceSpeed === speed);
};

/**
 * Finds all compatible cables for a source port configuration.
 */
export const listCompatibleCablesForPort = (formFactor: FormFactor, speed: string): Cable[] => {
  return CABLES.filter(c => c.formFactorSource === formFactor && c.speed === speed);
};

/**
 * Resolves a list of BreakoutMode objects from their IDs.
 */
export const resolveBreakoutModes = (ids: string[]): BreakoutMode[] => {
  return BREAKOUT_MODES.filter(m => ids.includes(m.id));
};
