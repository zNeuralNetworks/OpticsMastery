import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { ClusterInputForm } from "@/features/cluster-designer/components/ClusterInputForm";
import { defaultInput } from "@/features/cluster-designer/data/defaults";
import { ConversationLayerProvider } from "@/features/cluster-designer/context/ConversationLayerContext";
import { runDesignEngine } from "@/features/cluster-designer/engine/designEngine";
import { DesignSummary } from "@/features/cluster-designer/components/DesignSummary";
import { TopologyView } from "@/features/cluster-designer/components/TopologyView";
import { AssumptionsPanel } from "@/features/cluster-designer/components/AssumptionsPanel";
import { RiskFlagsPanel } from "@/features/cluster-designer/components/RiskFlagsPanel";
import { DesignNarrativePanel } from "@/features/cluster-designer/components/DesignNarrativePanel";
import { NextValidationStepsPanel } from "@/features/cluster-designer/components/NextValidationStepsPanel";
import { ExecutiveSummaryPanel } from "@/features/cluster-designer/components/ExecutiveSummaryPanel";
import { CompareSummaryPanel } from "@/features/cluster-designer/components/CompareSummaryPanel";
import { ChangeImpactPanel } from "@/features/cluster-designer/components/ChangeImpactPanel";
import { ResultsNav } from "@/features/cluster-designer/components/ResultsNav";
import { DiscoveryQuestionsPanel } from "@/features/cluster-designer/components/DiscoveryQuestionsPanel";
import { RecommendedArchitectureHero } from "@/features/cluster-designer/components/RecommendedArchitectureHero";
import { WhyThisDesignWorksPanel } from "@/features/cluster-designer/components/WhyThisDesignWorksPanel";
import { HardwareBomPanel } from "@/features/cluster-designer/components/HardwareBomPanel";
import { FabricPressureZone } from "@/features/cluster-designer/components/FabricPressureZone";
import { ArchitectureCanvas } from "@/features/cluster-designer/components/ArchitectureCanvas";
import { ArchitectureCard } from "@/components/ui/ArchitectureCard";
import { getScenarioPreset } from "@/features/cluster-designer/data/presets";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

const PortConsumptionChart = lazy(() =>
  import("@/features/cluster-designer/components/PortConsumptionChart").then((module) => ({
    default: module.PortConsumptionChart,
  })),
);

// Reference-only staging surface. The shipped planner runtime is the root-level AIClusterPlanner.
// This page is intentionally not mounted by the app-shell route.
export function ClusterDesignerPage() {
  const [input, setInput] = useLocalStorageState("cluster-designer-primary", defaultInput);
  const [comparisonInput, setComparisonInput] = useLocalStorageState(
    "cluster-designer-compare",
    getScenarioPreset("imaging").input,
  );
  const [compareMode, setCompareMode] = useLocalStorageState("cluster-designer-compare-mode", false);
  const [showConversationLayer, setShowConversationLayer] = useLocalStorageState(
    "cluster-designer-conversation-layer",
    true,
  );
  const design = useMemo(() => runDesignEngine(input), [input]);
  const comparisonDesign = useMemo(() => runDesignEngine(comparisonInput), [comparisonInput]);
  const previousDesignRef = useRef<typeof design | null>(null);

  useEffect(() => {
    previousDesignRef.current = design;
  }, [design]);

  return (
    <ConversationLayerProvider value={{ showConversationLayer }}>
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1.2fr)] 3xl:grid-cols-[400px_minmax(0,1.32fr)]">
          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <ClusterInputForm value={input} onChange={setInput} />
            {compareMode ? (
              <ClusterInputForm
                value={comparisonInput}
                onChange={setComparisonInput}
                eyebrow="Compare Scenario"
                title="Comparison scenario"
              />
            ) : null}
          </div>

          <div className="space-y-6">
            <ArchitectureCard accent="indigo" elevated active eyebrow="Architecture Review Surface" title="Directional Ethernet AI fabric workspace">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="card-subtle max-w-4xl p-4">
                  <p className="text-sm leading-6 text-muted">
                    Use this surface for live architecture review: recommended topology first, expanded FE/BE topology second, analytical pressure explanation third.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                  <button
                    type="button"
                    onClick={() => setShowConversationLayer((current) => !current)}
                    className={`inline-flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm font-medium transition ${
                      showConversationLayer
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-line bg-space/35 text-muted hover:text-ink"
                    }`}
                  >
                    <span>Conversation layer</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${showConversationLayer ? "bg-accent" : "bg-muted"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareMode((current) => !current)}
                    className={`inline-flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm font-medium transition ${
                      compareMode ? "border-success bg-success/10 text-ink" : "border-line bg-space/35 text-muted hover:text-ink"
                    }`}
                  >
                    <span>Compare mode</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${compareMode ? "bg-success" : "bg-muted"}`} />
                  </button>
                </div>
              </div>
            </ArchitectureCard>

            <ResultsNav design={design} />

            <div id="recommended-architecture">
              <RecommendedArchitectureHero design={design} />
            </div>

            <div id="topology-visualization">
              <TopologyView design={design} />
            </div>

            <div id="topology-canvas">
              <ArchitectureCanvas design={design} />
            </div>

            {compareMode ? (
              <CompareSummaryPanel current={design} comparison={comparisonDesign} />
            ) : (
              <ChangeImpactPanel current={design} previous={previousDesignRef.current} />
            )}

            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <ExecutiveSummaryPanel design={design} />
              <WhyThisDesignWorksPanel design={design} />
            </div>

            <DesignSummary design={design} />
          </div>
        </section>

        <section>
          <FabricPressureZone
            design={design}
            onTargetChange={(targetOversubscription) =>
              setInput((current) => ({ ...current, targetOversubscription }))
            }
            onPatternChange={(collectivePattern) =>
              setInput((current) => ({ ...current, collectivePattern }))
            }
          />
        </section>

        <section id="capacity-summary">
          <Suspense
            fallback={
              <div className="architecture-card flex min-h-[28rem] items-center justify-center p-6 text-sm text-muted">
                Loading capacity model...
              </div>
            }
          >
            <PortConsumptionChart design={design} />
          </Suspense>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div id="discovery-questions">
            <DiscoveryQuestionsPanel design={design} />
          </div>
          <div id="assumptions">
            <AssumptionsPanel design={design} />
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div id="design-risks">
            <RiskFlagsPanel design={design} />
          </div>
          <div id="design-narrative">
            <DesignNarrativePanel design={design} />
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div id="next-validation">
            <NextValidationStepsPanel design={design} />
          </div>
          {compareMode ? (
            <CompareSummaryPanel
              current={design}
              comparison={comparisonDesign}
              eyebrow="Scenario Comparison"
              title="A/B design comparison"
            />
          ) : (
            <HardwareBomPanel design={design} />
          )}
        </section>
      </div>
    </ConversationLayerProvider>
  );
}
