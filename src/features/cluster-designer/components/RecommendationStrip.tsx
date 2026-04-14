import { Chip } from "@/components/ui/Chip";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type RecommendationStripProps = {
  design: DesignEngineResult;
};

export function RecommendationStrip({ design }: RecommendationStripProps) {
  const mainConcern = design.risks[0]?.title ?? "No critical blocker";

  return (
    <div className="card-subtle p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StripChip
          label="Topology"
          value={`${design.topologyRecommendation.switchingTiers}-tier`}
        />
        <StripChip
          label="Fabric"
          value={`${design.topologyRecommendation.leafSwitchCountEstimate}L / ${design.topologyRecommendation.spineSwitchCountEstimate}S`}
        />
        <StripChip label="Leaf class" value={design.topologyRecommendation.recommendedLeaf.family} />
        <StripChip label="Spine class" value={design.topologyRecommendation.recommendedSpine.family} />
        <StripChip label="Class" value={`${design.inputs.nicSpeedGb}G`} />
        <StripChip
          label="Oversub"
          value={`${design.derivedCapacity.actualOversubscriptionRatio}:1`}
          tooltip="Modeled oversubscription after workload, growth, storage, and headroom assumptions."
        />
        <StripChip label="Risk" value={design.congestionRisk.level} tone="ember" />
        <StripChip
          label="Confidence"
          value={design.confidence.level}
          tone="indigo"
          tooltip="Confidence reflects how complete and assumption-light the current model inputs are."
        />
        <StripChip label="Concern" value={mainConcern} tone="amethyst" />
      </div>
    </div>
  );
}

function StripChip({
  label,
  value,
  tone = "default",
  tooltip,
}: {
  label: string;
  value: string;
  tone?: "default" | "ember" | "indigo" | "amethyst";
  tooltip?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-space px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.24em] text-label">{label}</span>
      <Chip tone={tone}>{value}</Chip>
      {tooltip ? <InfoTooltip label={label}>{tooltip}</InfoTooltip> : null}
    </div>
  );
}
