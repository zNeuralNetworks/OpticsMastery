import { Outlet } from "react-router-dom";
import { ArchitectureCard } from "@/components/ui/ArchitectureCard";

export function AppLayout() {
  return (
    <div className="workspace-shell">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <ArchitectureCard
          className="mb-8 workspace-header"
          accent="sapphire"
          elevated
          active
        >
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker text-sapphire">Arista Enterprise AI</p>
              <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-ink lg:text-[32px]">
                AI Fabric Architecture Studio
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                Principal architect workspace for enterprise Ethernet AI fabric design, tradeoff explanation, and customer-ready architecture review.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:min-w-[520px]">
              <div className="card-subtle p-4">
                <p className="data-label">Workspace posture</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Assumption-driven sizing with explicit boundaries, readable tradeoffs, and infrastructure-grade presentation.
                </p>
              </div>
              <div className="card-subtle p-4">
                <p className="data-label">Design bias</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Enterprise Ethernet leaf-spine fabrics, operational visibility, and disciplined customer architecture conversation.
                </p>
              </div>
            </div>
          </header>
        </ArchitectureCard>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
