import type { DesignEngineResult } from "@/features/cluster-designer/types";

export function getOversubscriptionResult(design: DesignEngineResult) {
  return {
    target: `${design.derivedCapacity.targetOversubscriptionRatio}:1`,
    actual: `${design.derivedCapacity.actualOversubscriptionRatio}:1`,
    note:
      design.derivedCapacity.actualOversubscriptionRatio <=
      design.derivedCapacity.targetOversubscriptionRatio
        ? "Actual result meets or improves on the target."
        : "Actual result exceeds the target and should be reviewed.",
  };
}

export function getGrowthAdjustedDesignResult(design: DesignEngineResult) {
  return {
    baselineLeafPorts: design.derivedCapacity.baselineLeafPortRequirement,
    growthLeafPorts: design.derivedCapacity.growthAdjustedLeafPortRequirement,
    bufferPercent: design.derivedCapacity.growthBufferPercent,
    summary: `Base requirement is ${design.derivedCapacity.baselineLeafPortRequirement} leaf-facing ports. With a ${design.derivedCapacity.growthBufferPercent}% growth buffer, the design plans for ${design.derivedCapacity.growthAdjustedLeafPortRequirement} leaf-facing ports.`,
  };
}
