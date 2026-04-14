
import { RangeConfig, SignalStatus } from '../types';

/**
 * Determines the health status of a signal based on dBm value and transceiver thresholds.
 */
export const analyzeSignalStatus = (value: number, range: RangeConfig): SignalStatus => {
  if (isNaN(value)) return 'GOOD'; // Default safe state for empty input

  if (value < range.min) return 'CRITICAL';
  if (value < range.goodLow) return 'WARNING';
  if (value > range.max) return 'DAMAGE';
  if (value > range.goodHigh) return 'HIGH';
  return 'GOOD';
};

/**
 * Calculates the percentage position (0-100) for the gauge needle.
 * Maps the input value onto a visual scale that extends slightly beyond the min/max limits.
 */
export const calculateGaugePosition = (value: number, range: RangeConfig): number => {
  const graphMin = range.min - 3;
  const graphMax = range.max + 3;
  const totalSpan = graphMax - graphMin;
  
  // Use goodLow as default anchor if input is invalid
  const targetVal = isNaN(value) ? range.goodLow : value;
  
  return Math.max(0, Math.min(100, ((targetVal - graphMin) / totalSpan) * 100));
};

/**
 * Helper to calculate width percentages for the colored bands on the gauge.
 */
export const getBandWidth = (startVal: number, endVal: number, range: RangeConfig): string => {
  const start = calculateGaugePosition(startVal, range);
  const end = calculateGaugePosition(endVal, range);
  return `${end - start}%`;
};
