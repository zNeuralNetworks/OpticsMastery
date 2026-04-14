import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { RecommendationStrip } from "@/features/cluster-designer/components/RecommendationStrip";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type RecommendedArchitectureHeroProps = {
  design: DesignEngineResult;
};

export function RecommendedArchitectureHero({ design }: RecommendedArchitectureHeroProps) {
  return (
    <Card
      eyebrow="Recommended Architecture"
      title={`${design.topologyRecommendation.switchingTiers}-tier Ethernet AI fabric`}
      accent="sapphire"
      elevated
      active
    >
      <RecommendationStrip design={design} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:items-start">
        <div className="card-inset p-5">
          <p className="data-label">Main recommendation</p>
          <p className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-ink">
            {design.topologyRecommendation.leafSwitchCountEstimate} leaf / {design.topologyRecommendation.spineSwitchCountEstimate} spine
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {design.inputs.nicSpeedGb}G fabric class sized for {design.inputs.gpuCount} GPUs across {design.inputs.gpuServerCount} servers.
          </p>
          <div className="mt-4 rounded-[16px] border border-line/70 p-4 text-sm leading-6 text-muted">
            <p><span className="font-medium text-ink">Leaf class:</span> {design.topologyRecommendation.recommendedLeaf.name}</p>
            <p className="mt-2"><span className="font-medium text-ink">Why:</span> {design.topologyRecommendation.leafSelectionRationale}</p>
            <p className="mt-3"><span className="font-medium text-ink">Spine class:</span> {design.topologyRecommendation.recommendedSpine.name}</p>
            <p className="mt-2"><span className="font-medium text-ink">Why:</span> {design.topologyRecommendation.spineSelectionRationale}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[14px] border border-border/70 bg-space/35 px-3 py-3">
              <p className="data-label">Traffic posture</p>
              <p className="mt-2 text-sm text-ink">
                {design.trainingCommunication.communicationPressureRating === "severe" ||
                design.trainingCommunication.communicationPressureRating === "high"
                  ? "Collective-heavy"
                  : "Moderate east-west"}
              </p>
            </div>
            <div className="rounded-[14px] border border-border/70 bg-space/35 px-3 py-3">
              <p className="data-label">Main concern</p>
              <p className="mt-2 text-sm text-ink">{design.risks[0]?.title ?? "No major modeled concern"}</p>
            </div>
            <div className="rounded-[14px] border border-border/70 bg-space/35 px-3 py-3">
              <p className="data-label">Validation focus</p>
              <p className="mt-2 text-sm text-ink">
                {design.congestionRisk.level === "high" || design.congestionRisk.level === "severe"
                  ? "Validate queueing, ECN, and shared-fabric behavior."
                  : "Validate optics, inter-rack media, breakout, and traffic assumptions."}
              </p>
            </div>
          </div>
          <Disclosure className="mt-4" label="Recommendation context">
            {design.customerFacingExplanation}
          </Disclosure>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric label="Topology" value={`${design.topologyRecommendation.switchingTiers}-tier`} />
          <HeroMetric label="NIC speed" value={`${design.inputs.nicSpeedGb}G`} />
          <HeroMetric
            label="Modeled oversubscription"
            value={`${design.derivedCapacity.actualOversubscriptionRatio}:1`}
            info="Lower modeled oversubscription generally preserves more east-west headroom for training and HPC traffic."
          />
          <HeroMetric label="Congestion risk" value={design.congestionRisk.level} />
          <HeroMetric
            label="Model confidence"
            value={design.confidence.level}
            info="Confidence reflects how complete and assumption-light the current model inputs are."
          />
          <HeroMetric label="Training pressure" value={design.trainingCommunication.communicationPressureRating} />
        </div>
      </div>
    </Card>
  );
}

function HeroMetric({ label, value, info }: { label: string; value: string; info?: string }) {
  return (
    <div className="card-subtle p-4">
      <div className="flex items-center gap-2">
        <p className="data-label">{label}</p>
        {info ? <InfoTooltip label={label}>{info}</InfoTooltip> : null}
      </div>
      <p className="technical-value mt-3 text-[22px] font-semibold capitalize tracking-[-0.03em]">{value}</p>
    </div>
  );
}
