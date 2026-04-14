import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import { TopologyRenderer } from "@/features/cluster-designer/components/topologyRenderer";
import { buildTopologyVisualModel } from "@/features/cluster-designer/lib/topologyVisualModel";
import type { AiFabricDiagramBlock, DesignEngineResult, DiagramBoundaryTag, TopologyVisualLegendItem } from "@/features/cluster-designer/types";

type TopologyViewProps = {
  design: DesignEngineResult;
};

export function TopologyView({ design }: TopologyViewProps) {
  const { showConversationLayer } = useConversationLayer();
  const visualModel = useMemo(() => buildTopologyVisualModel(design), [design]);
  const [activeBlock, setActiveBlock] = useState<AiFabricDiagramBlock | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card
        eyebrow="2. Topology Visualization"
        title={visualModel.layoutMode === "full-stack" ? "Full-stack FE/BE topology preview" : "Back-end topology preview"}
        accent="indigo"
        elevated
        active
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {visualModel.boundaryTags.map((tag) => (
              <Chip key={tag} tone={boundaryTone(tag)}>
                {boundaryLabel(tag)}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Open full topology review"
              className="inline-flex items-center gap-2 rounded-full border border-sapphire bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sapphire transition hover:scale-[1.01] hover:bg-sapphire/90"
            >
              <span className="text-base leading-none">⤢</span>
              <span>Open Full Topology View</span>
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)]">
            <div className="space-y-4">
              <div className="rounded-[20px] border border-sapphire/30 bg-sapphire/10 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="data-label text-sapphire">Recommended next step</p>
                    <p className="mt-2 text-sm leading-6 text-ink">
                      This inline diagram is only a compact preview. Open the full topology view for a larger FE/BE network diagram with readable labels, callouts, and selection details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-sapphire bg-sapphire px-4 py-3 text-sm font-semibold text-white shadow-glow-sapphire transition hover:scale-[1.01] hover:bg-sapphire/90"
                  >
                    <span className="text-base leading-none">⤢</span>
                    <span>Open Full View</span>
                  </button>
                </div>
              </div>
              <div className="h-[380px]">
                <TopologyRenderer model={visualModel} mode="preview" onActiveBlockChange={setActiveBlock} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="card-subtle p-4">
                <p className="data-label">Selected topology item</p>
                <p className="mt-3 text-base font-semibold text-ink">{activeBlock?.label ?? "Overview"}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {activeBlock?.description ??
                    "Use hover, focus, or click to inspect FE, BE, storage, and compute blocks without crowding the diagram itself."}
                </p>
              </div>

              <div className="card-subtle p-4">
                <p className="data-label">Counts and notes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {visualModel.countLabels.map((label) => (
                    <span key={label} className="info-chip border-border/70 bg-space/45 text-ink">
                      {label}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{visualModel.representativeNote}</p>
              </div>

              <div className="card-subtle p-4">
                <p className="data-label">Legend</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {visualModel.legend.map((item) => (
                    <LegendItem key={item.label} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConversationHelper show={showConversationLayer}>
          {`Position this as a clean architecture preview rather than a literal cabling map. The front-end side explains services and storage adjacency, while the back-end side explains GPU collective behavior and shared fabric pressure.`}
        </ConversationHelper>
      </Card>

      {expanded ? (
        <TopologyOverlay
          design={design}
          activeBlock={activeBlock}
          setActiveBlock={setActiveBlock}
          onClose={() => setExpanded(false)}
        />
      ) : null}
    </>
  );
}

function TopologyOverlay({
  design,
  activeBlock,
  setActiveBlock,
  onClose,
}: {
  design: DesignEngineResult;
  activeBlock: AiFabricDiagramBlock | null;
  setActiveBlock: (block: AiFabricDiagramBlock | null) => void;
  onClose: () => void;
}) {
  const visualModel = useMemo(() => buildTopologyVisualModel(design), [design]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-space/70 p-4 backdrop-blur-sm xl:p-8">
      <div className="flex h-full w-full max-w-[1560px] flex-col overflow-hidden rounded-[28px] border border-border bg-surface shadow-surface">
        <div className="flex items-start justify-between gap-4 border-b border-border/80 px-6 py-5">
          <div>
            <p className="section-kicker text-indigo">Expanded topology review</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">
              {visualModel.layoutMode === "full-stack" ? "Full-stack FE/BE architecture review" : "Back-end topology review"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use this view for customer-facing architecture walkthroughs. The canvas is larger, and the explanation lives beside it instead of on top of it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-border/80 bg-space/35 px-4 py-2 text-sm font-medium text-ink transition hover:border-sapphire/60 hover:text-sapphire"
          >
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 overflow-hidden p-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.7fr)]">
          <div className="min-h-0 space-y-4">
            <div className="flex flex-wrap gap-2">
              {visualModel.boundaryTags.map((tag) => (
                <Chip key={tag} tone={boundaryTone(tag)}>
                  {boundaryLabel(tag)}
                </Chip>
              ))}
              {visualModel.countLabels.map((label) => (
                <span key={label} className="info-chip border-border/70 bg-space/45 text-ink">
                  {label}
                </span>
              ))}
            </div>
            <div className="h-[min(72vh,760px)]">
              <TopologyRenderer model={visualModel} mode="overlay" onActiveBlockChange={setActiveBlock} />
            </div>
          </div>

          <div className="min-h-0 space-y-4 overflow-auto pr-1">
            <div className="card-subtle p-5">
              <p className="data-label">Selected topology item</p>
              <p className="mt-3 text-lg font-semibold text-ink">{activeBlock?.label ?? "Architecture overview"}</p>
              <p className="mt-2 text-sm text-label">{activeBlock?.compactDetail ?? visualModel.representativeNote}</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {activeBlock?.description ??
                  "Select a block to inspect its role without adding more text inside the topology drawing itself."}
              </p>
            </div>

            <div className="card-subtle p-5">
              <p className="data-label">Architecture callouts</p>
              <div className="mt-4 grid gap-3">
                {visualModel.callouts.map((annotation) => (
                  <div key={annotation.title} className="rounded-[16px] border border-border/80 bg-space/35 p-4">
                    <p className="data-label">{annotation.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{annotation.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-subtle p-5">
              <p className="data-label">Legend</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {visualModel.legend.map((item) => (
                  <LegendItem key={item.label} item={item} />
                ))}
              </div>
            </div>

            <div className="card-subtle p-5">
              <p className="data-label">Diagram boundary</p>
              <p className="mt-3 text-sm leading-6 text-muted">{visualModel.representativeNote}</p>
            </div>
          </div>
        </div>
      </div>
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

function legendToneClass(tone: TopologyVisualLegendItem["tone"]) {
  return {
    "fe-core": "border-sapphire/40 bg-sapphire/10 text-ink",
    "fe-access": "border-cyan/40 bg-cyan/10 text-ink",
    "be-spine": "border-emerald/40 bg-emerald/10 text-ink",
    "be-leaf": "border-success/40 bg-success/10 text-ink",
    "gpu-rack": "border-border/80 bg-space/45 text-ink",
    "storage-domain": "border-warning/40 bg-warning/10 text-ink",
    "service-domain": "border-amethyst/40 bg-amethyst/10 text-ink",
    "modeled-link": "border-emerald/40 bg-emerald/10 text-ink",
    "representative-link": "border-indigo/40 bg-indigo/10 text-ink",
    "assumption-link": "border-warning/40 bg-warning/10 text-ink",
  }[tone];
}

function LegendItem({ item }: { item: TopologyVisualLegendItem }) {
  return <span className={`info-chip ${legendToneClass(item.tone)}`}>{item.label}</span>;
}
