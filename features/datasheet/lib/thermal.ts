
export interface ThermalPoint {
  temp: number;  // Celsius
  power: number; // Watts
}

/**
 * Generates a simulated power-over-temperature curve based on the transceiver speed class.
 * Used for visualizing thermal performance in the datasheet.
 */
export const simulatePowerCurve = (speed: string): ThermalPoint[] => {
  // 1. Determine Base Power Load
  let basePower = 3.5; // Default 100G/40G
  if (speed.includes('800G')) {
    basePower = 14.0;
  } else if (speed.includes('400G')) {
    basePower = 10.0;
  }
  
  // 2. Generate curve points (Linear increase with noise simulation)
  const points: ThermalPoint[] = [];
  const minTemp = 20;
  const maxTemp = 70;
  const step = 5;

  // Use a fixed seed-like behavior for deterministic output in this context 
  // (simplified by using a predictable modifier based on temp)
  for (let temp = minTemp; temp <= maxTemp; temp += step) {
    // Physics approximation: Leakage current increases with temp
    const thermalDrift = (temp - minTemp) * 0.05; 
    const variance = (Math.sin(temp) * 0.1) + 0.1; // Simulated fluctuation
    
    const power = basePower + thermalDrift + variance;
    points.push({ temp, power });
  }

  return points;
};

/**
 * Helper to normalize simulation data for SVG plotting (0-100 scale)
 */
export const normalizeForChart = (points: ThermalPoint[]) => {
  const values = points.map(p => p.power);
  const maxY = Math.ceil(Math.max(...values) + 2);
  const minTemp = 20;
  const maxTemp = 70;

  return {
    maxY,
    minTemp,
    maxTemp,
    getX: (t: number) => ((t - minTemp) / (maxTemp - minTemp)) * 100,
    getY: (p: number) => 100 - ((p / maxY) * 100)
  };
};
