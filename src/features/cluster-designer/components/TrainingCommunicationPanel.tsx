import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { TrainingCommunicationDiagram } from "@/features/cluster-designer/components/TrainingCommunicationDiagram";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { CommunicationPattern, DesignEngineResult } from "@/features/cluster-designer/types";

type TrainingCommunicationPanelProps = {
  design: DesignEngineResult;
  onPatternChange?: (pattern: CommunicationPattern) => void;
};

const pressureTone = {
  low: "border-success/40 bg-success/10",
  moderate: "border-accent/40 bg-accent/10",
  high: "border-warning/50 bg-warning/10",
  severe: "border-warning bg-warning/20",
} as const;

const patternLabels = {
  "nccl-framework-managed": "NCCL / framework-managed",
  "ring-all-reduce": "Ring all-reduce",
  "tree-all-reduce": "Tree all-reduce",
  hierarchical: "Hierarchical",
  "mixed-unknown": "Mixed / unknown",
} as const;

export function TrainingCommunicationPanel({ design, onPatternChange }: TrainingCommunicationPanelProps) {
  const { showConversationLayer } = useConversationLayer();
  const assessment = design.trainingCommunication;
  const [selectedPattern, setSelectedPattern] = useState<CommunicationPattern>(design.inputs.collectivePattern);
  const previewPattern = selectedPattern;

  useEffect(() => {
    setSelectedPattern(design.inputs.collectivePattern);
  }, [design.inputs.collectivePattern]);

  const handlePatternSelect = (pattern: CommunicationPattern) => {
    setSelectedPattern(pattern);
    onPatternChange?.(pattern);
  };

  return (
    <Card
      eyebrow="AI Training Communication Model"
      title="AI training communication model"
      accent="amethyst"
      elevated
      actions={<p className="text-sm leading-6 text-muted">Heuristic advisory only. Not a packet simulator or benchmark tool.</p>}
    >
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <div className="card-inset p-5">
            <div className="flex items-center gap-2">
              <p className="data-label">1. Collective Pattern</p>
              <InfoTooltip label="Collective communication pattern">
                This is a learning aid for how model synchronization uses the fabric. It is not claiming exact framework behavior.
              </InfoTooltip>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(patternLabels).map(([pattern, label]) => (
                <Chip
                  key={pattern}
                  active={previewPattern === pattern}
                  tone={previewPattern === pattern ? "amethyst" : "default"}
                  onClick={() => handlePatternSelect(pattern as CommunicationPattern)}
                >
                  {label}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium text-ink">{patternLabels[previewPattern]}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{assessment.patternSummary}</p>
          </div>

          <div className={`rounded-[20px] border p-5 ${pressureTone[assessment.communicationPressureRating]}`}>
            <p className="data-label">2. Communication Pressure Assessment</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-[34px] font-semibold capitalize tracking-[-0.03em] text-ink">
                {assessment.communicationPressureRating}
              </p>
              <p className="pb-2 text-sm text-muted">pressure</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {assessment.primaryDrivers.map((driver) => (
                <Chip key={driver} tone="amethyst">
                  {driverLabel(driver)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-line/70 p-4">
              <p className="data-label">3. East-West Traffic Impact</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Expected burst factor: <span className="font-medium capitalize text-ink">{assessment.eastWestBurstFactor}</span>.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{assessment.eastWestImpact}</p>
            </div>
            <div className="rounded-[20px] border border-line/70 p-4">
              <p className="data-label">4. Recommended Oversubscription Ceiling</p>
              <div className="mt-3 metric-bar">
                <div
                  className="metric-bar-fill bg-amethyst/80"
                  style={{ width: `${{ "1:1": 33, "1.5:1": 50, "2:1": 66, ">2:1 acceptable only with caution": 90 }[assessment.recommendedOversubscriptionCeiling]}%` }}
                />
              </div>
              <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink">
                {assessment.recommendedOversubscriptionCeiling}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                This is a directional ceiling for training-sensitive traffic, not a validated production guarantee.
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-line/70 p-4">
            <p className="data-label">5. Architecture Implications</p>
            <p className="mt-2 text-sm leading-6 text-muted">{assessment.architectureNote}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {assessment.architectureImplications.map((item) => (
                <Chip key={item}>{implicationLabel(item)}</Chip>
              ))}
            </div>
            <div className="mt-4 rounded-[16px] border border-dashed border-line p-3 text-sm leading-6 text-muted">
              <span className="font-medium text-ink">Training risk note:</span> {assessment.trainingRiskNote}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-[260px]">
            <TrainingCommunicationDiagram pattern={previewPattern} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="sapphire">Modeled: {design.inputs.clusterScaleClass} cluster scale</Chip>
            <Chip tone="indigo">Modeled: {design.derivedCapacity.actualOversubscriptionRatio}:1 oversubscription</Chip>
            <Chip tone={design.inputs.storageNetworkPresent ? "ember" : "emerald"}>
              {design.derivedCapacity.storageFabric.dedicated
                ? `Assumption-driven: dedicated ${design.derivedCapacity.storageFabric.storagePortSpeedGb}G storage fabric present`
                : design.inputs.storageNetworkPresent
                  ? `Assumption-driven: ${storageLabel(design.inputs.storageType)} storage present`
                  : "Modeled: compute-only fabric"}
            </Chip>
            <Chip tone="amethyst">Representative: communication sketch</Chip>
          </div>
          <div className="card-inset p-4">
            <p className="data-label">Pattern-to-architecture link</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {buildPatternDesignSummary(design)}
            </p>
          </div>
          <div className="rounded-[20px] border border-dashed border-line p-4 text-sm leading-6 text-muted">
            {assessment.modelBoundary}
          </div>
        </div>
      </div>

      <Disclosure label="Why this matters">
        <p>{assessment.eastWestImpact}</p>
        <p className="mt-3">{assessment.trainingRiskNote}</p>
      </Disclosure>

      <ConversationHelper show={showConversationLayer}>
        Training traffic is different from ordinary enterprise traffic because GPUs repeatedly synchronize model state across the fabric. As that synchronization grows, oversubscription becomes much more visible to job performance, so the fabric conversation has to focus on east-west bandwidth, storage behavior, and how cleanly the leaf-spine design protects collective traffic.
      </ConversationHelper>
    </Card>
  );
}

function driverLabel(driver: string) {
  if (driver.includes("Oversubscription")) return "Oversub visibility";
  if (driver.includes("Storage")) return "Storage overlap";
  if (driver.includes("high east-west")) return "High base EW";
  if (driver.includes("workload profile")) return "Training sensitivity";
  if (driver.includes("GPU scale")) return "Scale expansion";
  if (driver.includes("Ring")) return "Ring pattern";
  return "Collective factor";
}

function implicationLabel(item: string) {
  if (item.includes("oversubscription ceiling")) return "Ceiling guidance";
  if (item.includes("spine bandwidth")) return "Protect spines";
  if (item.includes("Checkpoint and storage")) return "Shared checkpoints";
  if (item.includes("Cluster growth")) return "Growth multiplier";
  return "Architecture effect";
}

function buildPatternDesignSummary(design: DesignEngineResult) {
  const storageNote = design.derivedCapacity.storageFabric.dedicated
    ? ` Dedicated ${design.derivedCapacity.storageFabric.storagePortSpeedGb}G storage keeps checkpoint behavior visible without mixing it into the back-end collective path.`
    : design.inputs.storageNetworkPresent
      ? ` Shared ${storageLabel(design.inputs.storageType)} storage keeps storage overlap visible in the architecture discussion.`
      : " No shared storage domain is modeled, so the explanation stays focused on compute fabric behavior.";

  return `${patternLabels[design.inputs.collectivePattern]} at ${design.inputs.clusterScaleClass} scale with ${design.derivedCapacity.actualOversubscriptionRatio}:1 modeled oversubscription is why the recommendation ${design.trainingCommunication.communicationPressureRating === "high" || design.trainingCommunication.communicationPressureRating === "severe" ? "stays conservative around spine bandwidth and shared-fabric contention." : "can tolerate a more moderate enterprise Ethernet posture."}${storageNote}`;
}

function storageLabel(storageType: DesignEngineResult["inputs"]["storageType"]) {
  return {
    ethernet: "Ethernet",
    roce: "RoCE",
    "nas-like": "NAS-like",
  }[storageType];
}
