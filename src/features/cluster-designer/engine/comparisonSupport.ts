import type { DesignEngineResult } from "@/features/cluster-designer/types";

export interface ComparisonRow {
  label: string;
  current: number;
  comparison: number;
  why: string;
}

export interface ChangeImpactRow {
  label: string;
  current: number;
  previous: number;
  why: string;
}

export function buildComparisonRows(current: DesignEngineResult, comparison: DesignEngineResult): ComparisonRow[] {
  return [
    {
      label: "Leaf switches",
      current: current.topologyRecommendation.leafSwitchCountEstimate,
      comparison: comparison.topologyRecommendation.leafSwitchCountEstimate,
      why: "Reflects how much downlink demand and uplink reservation each scenario creates.",
    },
    {
      label: "Spine switches",
      current: current.topologyRecommendation.spineSwitchCountEstimate,
      comparison: comparison.topologyRecommendation.spineSwitchCountEstimate,
      why: "Shows how the northbound fabric changes when oversubscription or workload posture shifts.",
    },
    {
      label: "Host bandwidth (Tbps)",
      current: current.derivedCapacity.totalRequiredHostFacingBandwidthTbps,
      comparison: comparison.derivedCapacity.totalRequiredHostFacingBandwidthTbps,
      why: "The cleanest expression of how much server-facing throughput the fabric must absorb.",
    },
    {
      label: "Actual oversubscription",
      current: current.derivedCapacity.actualOversubscriptionRatio,
      comparison: comparison.derivedCapacity.actualOversubscriptionRatio,
      why: "Useful when discussing why one research workload needs a more conservative fabric posture than another.",
    },
  ];
}

export function buildChangeImpactRows(current: DesignEngineResult, previous: DesignEngineResult | null): ChangeImpactRow[] {
  if (!previous) {
    return [];
  }

  return [
    {
      label: "Leaf switches",
      current: current.topologyRecommendation.leafSwitchCountEstimate,
      previous: previous.topologyRecommendation.leafSwitchCountEstimate,
      why: "Usually changes when growth posture, research workload, or downlink pressure changes.",
    },
    {
      label: "Spine switches",
      current: current.topologyRecommendation.spineSwitchCountEstimate,
      previous: previous.topologyRecommendation.spineSwitchCountEstimate,
      why: "Usually changes when uplink demand or oversubscription posture changes.",
    },
    {
      label: "Actual oversubscription",
      current: current.derivedCapacity.actualOversubscriptionRatio,
      previous: previous.derivedCapacity.actualOversubscriptionRatio,
      why: "Shows how the fabric posture shifted after the latest input change.",
    },
  ].filter((item) => item.current !== item.previous);
}
