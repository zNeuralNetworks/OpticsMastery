import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CongestionRiskPanel } from "@/features/cluster-designer/components/CongestionRiskPanel";
import { OversubscriptionView } from "@/features/cluster-designer/components/OversubscriptionView";
import { TrainingCommunicationPanel } from "@/features/cluster-designer/components/TrainingCommunicationPanel";
import type { CommunicationPattern, DesignEngineResult } from "@/features/cluster-designer/types";

type FabricPressureZoneProps = {
  design: DesignEngineResult;
  onTargetChange: (target: 1 | 2 | 3) => void;
  onPatternChange: (pattern: CommunicationPattern) => void;
};

export function FabricPressureZone({
  design,
  onTargetChange,
  onPatternChange,
}: FabricPressureZoneProps) {
  return (
    <section className="space-y-4">
      <Card eyebrow="Fabric Pressure" title="East-west fabric pressure zone" accent="amethyst" elevated>
        <div className="flex flex-wrap gap-2">
          <Chip tone="sapphire">Oversub {design.derivedCapacity.actualOversubscriptionRatio}:1</Chip>
          <Chip tone="ember">Congestion {design.congestionRisk.level}</Chip>
          <Chip tone="amethyst">Collectives {design.trainingCommunication.communicationPressureRating}</Chip>
          <Chip tone="indigo">Burst {design.trainingCommunication.eastWestBurstFactor}</Chip>
          <Chip tone="emerald">Ceiling {design.trainingCommunication.recommendedOversubscriptionCeiling}</Chip>
        </div>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[0.9fr_0.9fr_1.2fr]">
        <div id="oversubscription-view">
          <OversubscriptionView design={design} onTargetChange={onTargetChange} />
        </div>
        <div id="congestion-risk">
          <CongestionRiskPanel design={design} />
        </div>
        <div id="training-communication">
          <TrainingCommunicationPanel design={design} onPatternChange={onPatternChange} />
        </div>
      </div>
    </section>
  );
}
