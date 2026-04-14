import type { DesignInputs, FabricProfileId, FabricProfileOption } from "@/features/cluster-designer/types";

export const designBoundary =
  "Early-stage enterprise Ethernet AI fabric assistant only. This tool estimates directional design choices and assumptions for customer architecture conversations; it is not a pricing tool or an exact validated SKU configurator.";

export const fabricProfileOptions: FabricProfileOption[] = [
  {
    id: "balanced-enterprise",
    label: "Balanced enterprise fabric",
    description: "200G fabric with moderate oversubscription and a stronger operational-simplicity bias.",
    defaults: {
      nicSpeedGb: 200,
      targetOversubscription: 2,
      redundancyPreference: "high",
      managementSimplicityPriority: "high",
    },
  },
  {
    id: "training-performance",
    label: "Training performance fabric",
    description: "200G fabric with 1:1 posture for collective-heavy training conversations.",
    defaults: {
      nicSpeedGb: 200,
      targetOversubscription: 1,
      redundancyPreference: "high",
      managementSimplicityPriority: "medium",
    },
  },
  {
    id: "high-scale-400g",
    label: "High-scale 400G fabric",
    description: "400G posture for denser, lower-oversubscription scale-out designs where growth pressure is expected.",
    defaults: {
      nicSpeedGb: 400,
      targetOversubscription: 1,
      redundancyPreference: "high",
      managementSimplicityPriority: "low",
    },
  },
  {
    id: "high-scale-800g",
    label: "High-scale 800G fabric",
    description: "800G native posture for B200-class GPU deployments. Requires dedicated datacenter power, cooling, and transceiver validation.",
    defaults: {
      nicSpeedGb: 800,
      targetOversubscription: 1,
      redundancyPreference: "high",
      managementSimplicityPriority: "low",
    },
  },
  {
    id: "custom",
    label: "Custom fabric override",
    description: "Use when the architecture conversation needs direct control of speed, oversubscription, or operational posture.",
    defaults: {
      nicSpeedGb: 200,
      targetOversubscription: 2,
      redundancyPreference: "high",
      managementSimplicityPriority: "medium",
    },
  },
];

export function detectFabricProfileId(
  inputs: Pick<
    DesignInputs,
    "nicSpeedGb" | "targetOversubscription" | "redundancyPreference" | "managementSimplicityPriority"
  >,
): FabricProfileId {
  const match = fabricProfileOptions.find(
    (profile) =>
      profile.id !== "custom" &&
      profile.defaults.nicSpeedGb === inputs.nicSpeedGb &&
      profile.defaults.targetOversubscription === inputs.targetOversubscription &&
      profile.defaults.redundancyPreference === inputs.redundancyPreference &&
      profile.defaults.managementSimplicityPriority === inputs.managementSimplicityPriority,
  );

  return match?.id ?? "custom";
}

export function applyFabricProfile(inputs: DesignInputs, profileId: FabricProfileId): DesignInputs {
  if (profileId === "custom") {
    return inputs;
  }

  const profile = fabricProfileOptions.find((option) => option.id === profileId) ?? fabricProfileOptions[0];

  return {
    ...inputs,
    ...profile.defaults,
  };
}

export const eastWestHeadroomFactors: Record<DesignInputs["eastWestTrafficIntensity"], number> = {
  low: 0.9,
  medium: 1,
  high: 1.15,
};

export const storageLeafPortOverlayFactors: Record<
  DesignInputs["storageType"],
  Record<DesignInputs["eastWestTrafficIntensity"], number>
> = {
  ethernet: { low: 0.15, medium: 0.25, high: 0.4 },
  roce: { low: 0.25, medium: 0.4, high: 0.6 },
  "nas-like": { low: 0.05, medium: 0.1, high: 0.2 },
};

export const opticsAssumptionCopy: Record<DesignInputs["opticsPreference"], string> = {
  dac: "Assume short-reach DAC only where rack adjacency, cable bulk, and serviceability are acceptable.",
  aoc: "Assume AOC for inter-rack short reach and cleaner handling where passive copper is no longer appropriate.",
  sr: "Assume SR optics on structured multimode short-reach plant.",
  dr: "Assume DR optics where single-mode reach and patching flexibility are preferred.",
  mixed: "Assume DAC for intra-rack attachment and AOC or pluggable optics for inter-rack paths depending on reach and patching.",
};

export function redundancyHeadroomFactor(preference: DesignInputs["redundancyPreference"]) {
  return preference === "high" ? 1.1 : 1;
}

export function roceStorageHeadroomFactor(inputs: Pick<DesignInputs, "storageNetworkPresent" | "storageType">) {
  return inputs.storageNetworkPresent && inputs.storageType === "roce" ? 1.05 : 1;
}

export function minimumSpineCount(inputs: Pick<DesignInputs, "redundancyPreference" | "targetOversubscription">) {
  if (inputs.redundancyPreference === "high") {
    return inputs.targetOversubscription === 1 ? 4 : 2;
  }

  return 2;
}

export function switchingTierCount(
  fabricDomainCount: number,
  inputs: Pick<DesignInputs, "gpuServerCount" | "managementSimplicityPriority">,
): 2 | 3 {
  // At >32 leafs or >512 servers, a single modular spine is unlikely to provide full-mesh
  // uplink coverage without a super-spine tier. Thresholds are conservative and directional;
  // exact tier decisions require validated spine port counts and uplink allocation review.
  if (fabricDomainCount > 32 || inputs.gpuServerCount > 512) {
    return 3;
  }

  return 2;
}
