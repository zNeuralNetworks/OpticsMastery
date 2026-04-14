import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { TopologyRenderer } from "@/features/cluster-designer/components/topologyRenderer";
import { buildTopologyVisualModel, getPressureComparison } from "@/features/cluster-designer/lib/topologyVisualModel";
import type { DesignEngineResult, DiagramBoundaryTag } from "@/features/cluster-designer/types";

type ArchitectureCanvasProps = {
  design: DesignEngineResult;
};

export function ArchitectureCanvas({ design }: ArchitectureCanvasProps) {
  const reduceMotion = useReducedMotion();
  const visualModel = useMemo(() => buildTopologyVisualModel(design), [design]);
  const [activeBlock, setActiveBlock] = useState<string>("Fabric overview");
  const flowStrength = {
    low: 28,
    moderate: 48,
    high: 72,
    severe: 94,
  }[design.trainingCommunication.communicationPressureRating];
  const pressureComparison = getPressureComparison(design);

  return (
    <Card
      eyebrow="Architecture Canvas"
      title="FE/BE AI fabric canvas"
      accent="sapphire"
      elevated
      active
      actions={
        <div className="flex flex-wrap justify-end gap-2">
          {visualModel.boundaryTags.map((tag) => (
            <Chip key={tag} tone={boundaryTone(tag)}>
              {boundaryLabel(tag)}
            </Chip>
          ))}
        </div>
      }
    >
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <motion.div
          layout
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex flex-wrap gap-2">
            <Chip tone="sapphire">{visualModel.layoutMode === "full-stack" ? "Full-stack FE/BE analysis" : "Back-end fabric analysis"}</Chip>
            <Chip tone="cyan">{design.topologyRecommendation.leafSwitchCountEstimate} BE leaf / {design.topologyRecommendation.spineSwitchCountEstimate} BE spine</Chip>
            <Chip tone="amethyst">{design.trainingCommunication.communicationPressureRating} collective pressure</Chip>
            <Chip tone="ember">{design.congestionRisk.level} congestion</Chip>
          </div>
          <div className="h-[460px]">
            <TopologyRenderer
              model={visualModel}
              animated
              highlightStrength={flowStrength}
              mode="analytical"
              onActiveBlockChange={(block) => setActiveBlock(block ? `${block.label}: ${block.description}` : "Fabric overview")}
            />
          </div>
          <div className="card-subtle p-4">
            <p className="data-label">Current inspection focus</p>
            <p className="mt-3 text-sm leading-6 text-muted">{activeBlock}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {visualModel.callouts.map((annotation) => (
              <AnnotationCard key={annotation.title} title={annotation.title} body={annotation.body} />
            ))}
          </div>
        </motion.div>

        <motion.div
          layout
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
          className="grid gap-4"
        >
          <div className="card-subtle p-5">
            <div className="flex items-center gap-2">
              <p className="data-label">Capacity comparisons</p>
              <InfoTooltip label="Capacity comparisons">
                These paired comparisons expose where the current design is aligned versus stretched instead of showing isolated bars without context.
              </InfoTooltip>
            </div>
            <div className="mt-4 space-y-4">
              <ComparisonTrack
                label="Leaf-facing demand vs fabric uplinks"
                leftLabel={`${design.derivedCapacity.growthAdjustedLeafPortRequirement} leaf-facing ports`}
                rightLabel={`${design.derivedCapacity.estimatedSpineFacingUplinkRequirement} uplink ports`}
                leftValue={design.derivedCapacity.growthAdjustedLeafPortRequirement}
                rightValue={design.derivedCapacity.estimatedSpineFacingUplinkRequirement}
                leftTone="bg-cyan/85"
                rightTone="bg-sapphire/85"
                note="This shows how much downlink demand the design pushes into the shared fabric pool."
              />
              <ComparisonTrack
                label="Target vs actual oversubscription"
                leftLabel={`Target ${design.derivedCapacity.targetOversubscriptionRatio}:1`}
                rightLabel={`Actual ${design.derivedCapacity.actualOversubscriptionRatio}:1`}
                leftValue={design.derivedCapacity.targetOversubscriptionRatio}
                rightValue={design.derivedCapacity.actualOversubscriptionRatio}
                leftTone="bg-emerald/85"
                rightTone="bg-indigo/85"
                note={
                  design.derivedCapacity.actualOversubscriptionRatio <= design.derivedCapacity.targetOversubscriptionRatio
                    ? "The current topology meets or improves on the requested oversubscription posture."
                    : "The modeled result is looser than the requested posture and should be reviewed."
                }
              />
              <ComparisonTrack
                label="Pressure vs ceiling guidance"
                leftLabel={`Pressure ${pressureComparison.actualLabel}`}
                rightLabel={`Ceiling ${pressureComparison.targetLabel}`}
                leftValue={pressureComparison.actualValue}
                rightValue={pressureComparison.targetValue}
                leftTone="bg-amethyst/85"
                rightTone="bg-warning/80"
                note={pressureComparison.note}
              />
            </div>
          </div>

          <div className="card-subtle p-5">
            <div className="flex items-center gap-2">
              <p className="data-label">Why pressure concentrates</p>
              <InfoTooltip label="Pressure explanation">
                These indicators summarize the main east-west drivers that explain why the recommendation leans more or less conservative.
              </InfoTooltip>
            </div>
            <div className="mt-4 grid gap-4">
              <FlowRow
                label="Collective pressure"
                value={design.trainingCommunication.communicationPressureRating}
                percent={flowStrength}
                tone="bg-amethyst/85"
              />
              <FlowRow
                label="East-west burst"
                value={design.trainingCommunication.eastWestBurstFactor}
                percent={{ low: 30, medium: 50, high: 74, extreme: 96 }[design.trainingCommunication.eastWestBurstFactor]}
                tone="bg-indigo/85"
              />
              <FlowRow
                label="Oversub ceiling"
                value={design.trainingCommunication.recommendedOversubscriptionCeiling}
                percent={{ "1:1": 28, "1.5:1": 44, "2:1": 62, ">2:1 acceptable only with caution": 86 }[design.trainingCommunication.recommendedOversubscriptionCeiling]}
                tone="bg-warning/80"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SignalCard label="Traffic posture" value={design.inputs.eastWestTrafficIntensity} detail="Base east-west posture" />
            <SignalCard label="Growth reserve" value={`+${design.inputs.futureGrowthBufferPercent}%`} detail="Reserved before final fabric count" />
            <SignalCard label="Confidence" value={design.confidence.level} detail={design.confidence.basis.replaceAll("-", " ")} />
            <SignalCard label="Main risk" value={design.risks[0]?.severity ?? "low"} detail={design.risks[0]?.title ?? "No major blocker"} />
          </div>
        </motion.div>
      </div>

      <Disclosure label="Why this matters">
        The analytical canvas keeps the topology readable while exposing the pressure, comparison, and rationale layers that explain why the recommendation landed where it did.
      </Disclosure>
    </Card>
  );
}

function ComparisonTrack({
  label,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftTone,
  rightTone,
  note,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  leftTone: string;
  rightTone: string;
  note: string;
}) {
  const reduceMotion = useReducedMotion();
  const maxValue = Math.max(leftValue, rightValue, 1);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
      </div>
      <div className="mt-3 grid gap-3">
        <TrackBar label={leftLabel} width={(leftValue / maxValue) * 100} tone={leftTone} reduceMotion={reduceMotion} />
        <TrackBar label={rightLabel} width={(rightValue / maxValue) * 100} tone={rightTone} reduceMotion={reduceMotion} />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{note}</p>
    </div>
  );
}

function FlowRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-[16px] border border-border/80 bg-space/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        <p className="text-sm font-medium capitalize text-ink">{value}</p>
      </div>
      <div className="metric-bar mt-3 overflow-hidden">
        <motion.div
          className={`metric-bar-fill ${tone}`}
          initial={{ width: 0, opacity: 0.6 }}
          animate={{ width: `${percent}%`, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function SignalCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[16px] border border-border/80 bg-space/35 p-4">
      <p className="data-label">{label}</p>
      <p className="technical-value mt-3 text-[22px] font-semibold capitalize">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}

function TrackBar({
  label,
  width,
  tone,
  reduceMotion,
}: {
  label: string;
  width: number;
  tone: string;
  reduceMotion: boolean | null;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="technical-value text-sm text-ink">{label}</p>
      </div>
      <div className="metric-bar mt-2">
        <motion.div
          className={`metric-bar-fill ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, width)}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function AnnotationCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[16px] border border-border/80 bg-space/35 p-4">
      <p className="data-label">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}

function boundaryTone(tag: DiagramBoundaryTag): "sapphire" | "indigo" | "ember" {
  const toneMap = {
    modeled: "sapphire",
    representative: "indigo",
    "assumption-driven": "ember",
  } as const;

  return toneMap[tag];
}

function boundaryLabel(tag: DiagramBoundaryTag) {
  return {
    modeled: "Modeled",
    representative: "Representative",
    "assumption-driven": "Assumption-driven",
  }[tag];
}
