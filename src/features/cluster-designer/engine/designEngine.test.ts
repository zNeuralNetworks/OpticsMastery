import { describe, expect, it } from "vitest";
import { defaultInput } from "@/features/cluster-designer/data/defaults";
import { runDesignEngine } from "@/features/cluster-designer/engine/designEngine";

describe("runDesignEngine", () => {
  it("produces a stable directional fabric recommendation for the default scenario", () => {
    const result = runDesignEngine(defaultInput);

    expect(result.derivedCapacity.hostPortCount).toBe(48);
    expect(result.derivedCapacity.leafSwitchCountEstimate).toBeGreaterThanOrEqual(2);
    expect(result.topologyRecommendation.spineSwitchCountEstimate).toBeGreaterThanOrEqual(2);
    expect(result.topologyRecommendation.nodes.some((node) => node.type === "storage")).toBe(true);
    expect(result.trainingCommunication.communicationPressureRating).toMatch(/^(moderate|high|severe)$/);
    expect(result.customerFacingExplanation).toContain("Ethernet leaf-spine fabric");
    expect(result.topologyRecommendation.hardwareBom.length).toBeGreaterThan(0);
    expect(result.topologyRecommendation.spineSelectionRationale).toContain("selected");
    expect(result.derivedCapacity.facilityEnvelope.requiredRacks).toBeGreaterThan(0);
  });

  it("steps to larger 400G spine classes as scale grows", () => {
    const compactScale = runDesignEngine({
      ...defaultInput,
      nicSpeedGb: 400,
      gpuCount: 128,
      gpuServerCount: 16,
      preferredSpineModelId: undefined,
    });
    const midScale = runDesignEngine({
      ...defaultInput,
      nicSpeedGb: 400,
      gpuCount: 512,
      gpuServerCount: 64,
      preferredSpineModelId: undefined,
    });
    const largeScale = runDesignEngine({
      ...defaultInput,
      nicSpeedGb: 400,
      gpuCount: 2048,
      gpuServerCount: 256,
      preferredSpineModelId: undefined,
    });

    expect(compactScale.topologyRecommendation.recommendedSpine.id).toBe("7808r4-spine-400g");
    expect(midScale.topologyRecommendation.recommendedSpine.id).toBe("7812r4-spine-400g");
    expect(largeScale.topologyRecommendation.recommendedSpine.id).toBe("7816l-spine-400g");
  });

  it("pins manual hardware overrides when specified", () => {
    const result = runDesignEngine({
      ...defaultInput,
      nicSpeedGb: 400,
      preferredLeafModelId: "7808r4-leaf-400g",
      preferredSpineModelId: "7812r4-spine-400g",
    });

    expect(result.topologyRecommendation.recommendedLeaf.id).toBe("7808r4-leaf-400g");
    expect(result.topologyRecommendation.recommendedSpine.id).toBe("7812r4-spine-400g");
    expect(result.topologyRecommendation.leafSelectionRationale).toContain("pinned manually");
    expect(result.topologyRecommendation.spineSelectionRationale).toContain("pinned manually");
  });

  it("surfaces rack and power constraints for the 256-node high-power example", () => {
    const result = runDesignEngine({
      ...defaultInput,
      gpuCount: 2048,
      gpuServerCount: 256,
      allocatedRackCount: 48,
      rackUnitsPerRack: 48,
      powerCapacityKwPerRack: 30,
      computeNodeRackUnits: 4,
      computeNodePowerKw: 10.2,
      thermalNodeCapPerRack: 8,
    });

    expect(result.derivedCapacity.facilityEnvelope.requiredRacksByPhysical).toBe(22);
    expect(result.derivedCapacity.facilityEnvelope.requiredRacksByThermal).toBe(32);
    expect(result.derivedCapacity.facilityEnvelope.requiredRacksByPower).toBe(128);
    expect(result.derivedCapacity.facilityEnvelope.requiredRacks).toBe(128);
    expect(result.derivedCapacity.facilityEnvelope.totalComputePowerKw).toBeCloseTo(2611.2, 1);
    expect(result.derivedCapacity.facilityEnvelope.totalAllocatedPowerKw).toBe(1440);
    expect(result.derivedCapacity.facilityEnvelope.fitStatus).toBe("facility-constrained");
    expect(result.risks.some((risk) => risk.title.includes("rack envelope"))).toBe(true);
    expect(result.risks.some((risk) => risk.title.includes("Rack power envelope"))).toBe(true);
  });
});
