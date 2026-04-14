import { Card } from "@/components/ui/Card";
import { ConfidenceIndicator } from "@/features/cluster-designer/components/ConfidenceIndicator";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { getGrowthAdjustedDesignResult, getOversubscriptionResult } from "@/features/cluster-designer/lib/designSelectors";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type ExecutiveSummaryPanelProps = {
  design: DesignEngineResult;
};

export function ExecutiveSummaryPanel({ design }: ExecutiveSummaryPanelProps) {
  const topRisk = design.risks[0];
  const oversubscription = getOversubscriptionResult(design);
  const growth = getGrowthAdjustedDesignResult(design);
  const architectureNotes = design.architectureNotes.slice(0, 3);
  const confidenceBasisLabel = formatConfidenceBasis(design.confidence.basis);

  return (
    <Card eyebrow="Architecture Detail" title="Recommendation detail" accent="cyan" elevated>
      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryBlock
          label="Recommendation"
          value={design.topologyRecommendation.headline}
          detail={`Host bandwidth ${design.derivedCapacity.totalRequiredHostFacingBandwidthTbps} Tbps, oversubscription ${oversubscription.actual}, growth buffer +${growth.bufferPercent}%.`}
        />
        <SummaryBlock
          label="Architecture summary"
          value={`${design.topologyRecommendation.switchingTiers}-tier scale-out fabric`}
          detail={design.structuredNarrative.architectureSummary}
        />
        <SummaryBlock
          label="Primary risk"
          value={topRisk?.title ?? "No critical blocker detected"}
          detail={topRisk?.body ?? "The current design direction appears usable for early architecture discussion."}
        />
        <SummaryBlock
          label="Model confidence"
          value={design.confidence.level}
          detail={`${design.confidence.summary} Basis: ${confidenceBasisLabel}.`}
          info="Low confidence can mean missing information or heuristic-heavy assumptions. It does not automatically mean the design direction is wrong."
        />
      </div>
      <div className="mt-5">
        <ConfidenceIndicator confidence={design.confidence} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {architectureNotes.map((note) => (
          <div key={note.title} className="rounded-[20px] border border-line/70 bg-canvas/40 p-4">
            <p className="data-label">{note.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{shorten(note.body)}</p>
          </div>
        ))}
      </div>
      <Disclosure label="Architecture notes">
        <div className="space-y-3">
          {architectureNotes.map((note) => (
            <div key={note.title}>
              <p className="text-sm font-medium text-ink">{note.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{note.body}</p>
            </div>
          ))}
        </div>
      </Disclosure>
    </Card>
  );
}

function SummaryBlock({ label, value, detail, info }: { label: string; value: string; detail: string; info?: string }) {
  return (
    <div className="card-subtle p-4">
      <div className="flex items-center gap-2">
        <p className="data-label">{label}</p>
        {info ? <InfoTooltip label={label}>{info}</InfoTooltip> : null}
      </div>
      <p className="mt-3 text-base font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function formatConfidenceBasis(basis: DesignEngineResult["confidence"]["basis"]) {
  return {
    "mostly-input-driven": "mostly input-driven",
    "mixed-inputs-and-heuristics": "mixed inputs and heuristics",
    "heuristic-heavy": "heuristic-heavy",
  }[basis];
}

function shorten(copy: string) {
  const sentence = copy.split(". ")[0];
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}
