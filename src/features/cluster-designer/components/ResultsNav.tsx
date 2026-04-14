import { useEffect, useMemo, useState } from "react";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

const anchors = [
  { href: "#recommended-architecture", label: "Recommended" },
  { href: "#oversubscription-view", label: "Fabric Pressure" },
  { href: "#topology-visualization", label: "Topology" },
  { href: "#capacity-summary", label: "Capacity" },
  { href: "#discovery-questions", label: "Discovery" },
  { href: "#assumptions", label: "Assumptions" },
  { href: "#design-narrative", label: "Narrative" },
  { href: "#next-validation", label: "Validation" },
] as const;

type ResultsNavProps = {
  design: DesignEngineResult;
};

export function ResultsNav({ design }: ResultsNavProps) {
  const [activeHref, setActiveHref] = useState<string>(anchors[0].href);

  useEffect(() => {
    const observers = anchors
      .map((anchor) => {
        const id = anchor.href.slice(1);
        const element = document.getElementById(id);

        if (!element) {
          return null;
        }

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              setActiveHref(anchor.href);
            }
          },
          { rootMargin: "-30% 0px -55% 0px", threshold: 0.2 },
        );

        observer.observe(element);
        return observer;
      })
      .filter(Boolean) as IntersectionObserver[];

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const statusByHref = useMemo<Record<string, "neutral" | "warning" | "critical">>(
    () => ({
      "#recommended-architecture": design.confidence.level === "low" ? "warning" : "neutral",
      "#oversubscription-view":
        design.congestionRisk.level === "high" || design.congestionRisk.level === "severe" ? "critical" : "neutral",
      "#topology-visualization": "neutral",
      "#capacity-summary":
        design.inputs.futureGrowthBufferPercent >= 25 ? "warning" : "neutral",
      "#discovery-questions": design.discoveryQuestions.length > 3 ? "warning" : "neutral",
      "#assumptions": design.opticsAssumptions.length > 0 ? "warning" : "neutral",
      "#design-narrative": "neutral",
      "#next-validation": "warning",
    }),
    [design],
  );

  return (
    <nav className="hidden sticky top-4 z-10 rounded-[22px] border border-border/80 bg-surface/88 p-3 shadow-surface backdrop-blur xl:block">
      <div className="flex flex-wrap gap-2">
        {anchors.map((anchor) => (
          <a
            key={anchor.href}
            href={anchor.href}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
              activeHref === anchor.href
                ? "border-sapphire/70 bg-sapphire/12 text-ink"
                : "border-border/80 bg-space/35 text-muted hover:border-sapphire/60 hover:text-ink"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                statusByHref[anchor.href] === "critical"
                  ? "bg-ember"
                  : statusByHref[anchor.href] === "warning"
                    ? "bg-amethyst"
                    : "bg-sapphire/70"
              }`}
            />
            {anchor.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
