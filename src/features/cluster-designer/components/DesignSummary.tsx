import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { MetricTile } from "@/components/ui/MetricTile";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import { getGrowthAdjustedDesignResult, getOversubscriptionResult } from "@/features/cluster-designer/lib/designSelectors";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type DesignSummaryProps = {
  design: DesignEngineResult;
};

export function DesignSummary({ design }: DesignSummaryProps) {
  const { showConversationLayer } = useConversationLayer();
  const oversubscriptionResult = getOversubscriptionResult(design);
  const growthAdjustedDesignResult = getGrowthAdjustedDesignResult(design);

  return (
    <Card eyebrow="3. Capacity Summary" title="Executive capacity summary" accent="cyan" elevated>
      <div className="mb-5 card-inset p-4">
        <div className="flex items-center gap-2">
          <p className="data-label">Growth buffer visual</p>
          <InfoTooltip label="Growth buffer">
            Growth reserve is applied before the final leaf count is derived so expansion posture is part of the model, not an afterthought.
          </InfoTooltip>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-label">Base</p>
            <p className="technical-value mt-2 text-[24px] font-semibold">{growthAdjustedDesignResult.baselineLeafPorts}</p>
          </div>
          <div className="text-center text-label">→</div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-label">With growth</p>
            <p className="technical-value mt-2 text-[24px] font-semibold">{growthAdjustedDesignResult.growthLeafPorts}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Host bandwidth"
          value={`${design.derivedCapacity.totalRequiredHostFacingBandwidthTbps} Tbps`}
          detail="Total required host-facing bandwidth"
        />
        <MetricTile
          label="Leaf port requirement"
          value={`${design.derivedCapacity.estimatedLeafPortRequirement}`}
          detail="Growth-adjusted host and storage-facing leaf ports"
        />
        <MetricTile
          label="Fabric uplinks"
          value={`${design.derivedCapacity.estimatedSpineFacingUplinkRequirement}`}
          detail="Estimated spine-facing uplink requirement"
        />
        <MetricTile
          label="Oversubscription"
          value={oversubscriptionResult.actual}
          detail={`Target ${oversubscriptionResult.target}`}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Leaf switches"
          value={`${design.topologyRecommendation.leafSwitchCountEstimate}`}
          detail={design.topologyRecommendation.recommendedLeaf.name}
        />
        <MetricTile
          label="Spine switches"
          value={`${design.topologyRecommendation.spineSwitchCountEstimate}`}
          detail={design.topologyRecommendation.recommendedSpine.name}
        />
        <MetricTile
          label="Topology"
          value={`${design.topologyRecommendation.switchingTiers}-tier`}
          detail={design.topologyRecommendation.headline}
        />
        <MetricTile
          label="Growth result"
          value={`+${growthAdjustedDesignResult.bufferPercent}%`}
          detail={growthAdjustedDesignResult.summary}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Required racks"
          value={`${design.derivedCapacity.facilityEnvelope.requiredRacks}`}
          detail={`${design.derivedCapacity.facilityEnvelope.allocatedRackCount} allocated`}
        />
        <MetricTile
          label="Rack fit"
          value={design.derivedCapacity.facilityEnvelope.fitStatus === "fits" ? "Fits" : "Constraint"}
          detail={`${design.derivedCapacity.facilityEnvelope.recommendedNodeCapPerRack} nodes/rack recommended`}
        />
        <MetricTile
          label="Compute power"
          value={`${design.derivedCapacity.facilityEnvelope.totalComputePowerKw.toFixed(0)} kW`}
          detail={`${design.derivedCapacity.facilityEnvelope.totalAllocatedPowerKw.toFixed(0)} kW allocated`}
        />
        <MetricTile
          label="Binding limit"
          value={`${design.derivedCapacity.facilityEnvelope.powerNodeCapPerRack} power • ${design.derivedCapacity.facilityEnvelope.thermalNodeCapPerRack} thermal`}
          detail="Nodes per rack under current hall assumptions"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="card-subtle p-4">
          <p className="data-label">Leaf selection rationale</p>
          <p className="mt-3 text-sm leading-6 text-muted">{design.topologyRecommendation.leafSelectionRationale}</p>
        </div>
        <div className="card-subtle p-4">
          <p className="data-label">Spine selection rationale</p>
          <p className="mt-3 text-sm leading-6 text-muted">{design.topologyRecommendation.spineSelectionRationale}</p>
        </div>
      </div>

      <Disclosure label="Design boundary">
        {design.designBoundary}
      </Disclosure>

      <ConversationHelper show={showConversationLayer}>
        {`Frame this as demand and headroom, not box count. The servers ask for ${design.derivedCapacity.totalRequiredHostFacingBandwidthTbps} Tbps of host-facing bandwidth, and we are carrying a ${growthAdjustedDesignResult.bufferPercent}% growth buffer so the fabric can scale cleanly as the deployment matures. In enterprise environments, that kind of repeatability matters as much as the initial footprint.`}
      </ConversationHelper>
    </Card>
  );
}
