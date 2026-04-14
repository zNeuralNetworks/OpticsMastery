import { ArchitectureCard } from "@/components/ui/ArchitectureCard";

export function ReferencePlannerNoticePage() {
  return (
    <div className="grid gap-6">
      <ArchitectureCard accent="ember" elevated>
        <div className="space-y-4">
          <div>
            <p className="section-kicker text-amber-600">Reference Surface</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">
              The standalone cluster designer is no longer the shipped planner runtime.
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            The canonical AI Cluster Planner runs from the repository root application shell
            via <code>index.html</code>, <code>index.tsx</code>, and <code>App.tsx</code>.
            This <code>src/</code> route is kept only as a reference surface for planner
            ideas that have not been deliberately ported into the live planner yet.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-subtle p-4">
              <p className="data-label">Use for shipped changes</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Root-level <code>components/</code>, <code>hooks/</code>,{" "}
                <code>services/</code>, <code>features/ai-planner/</code>, and{" "}
                <code>data/</code>.
              </p>
            </div>
            <div className="card-subtle p-4">
              <p className="data-label">Use this surface for</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Reviewing reference heuristics, alternate UX ideas, and staged planner
                concepts before selective porting.
              </p>
            </div>
          </div>
        </div>
      </ArchitectureCard>
    </div>
  );
}
