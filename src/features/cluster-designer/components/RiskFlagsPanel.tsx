import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult, DesignRisk } from "@/features/cluster-designer/types";

type RiskFlagsPanelProps = {
  design: DesignEngineResult;
};

const severityClasses: Record<DesignRisk["severity"], string> = {
  low: "border-line",
  medium: "border-warning/50",
  high: "border-warning bg-warning/10",
};

export function RiskFlagsPanel({ design }: RiskFlagsPanelProps) {
  const { showConversationLayer } = useConversationLayer();
  const [selectedRisk, setSelectedRisk] = useState(design.risks[0]?.title ?? "");
  const activeRisk = design.risks.find((flag) => flag.title === selectedRisk) ?? design.risks[0];

  useEffect(() => {
    setSelectedRisk(design.risks[0]?.title ?? "");
  }, [design.risks]);

  return (
    <Card eyebrow="Design Risks" title="Design risks" accent="ember">
      <div className="flex flex-wrap gap-2">
        {design.risks.map((flag) => (
          <Chip
            key={flag.title}
            tone={flag.severity === "high" ? "ember" : flag.severity === "medium" ? "amethyst" : "default"}
            active={activeRisk?.title === flag.title}
            onClick={() => setSelectedRisk(flag.title)}
          >
            {flag.title}
          </Chip>
        ))}
      </div>

      {activeRisk ? (
        <div className={`mt-4 rounded-[20px] border p-4 ${severityClasses[activeRisk.severity]}`}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-ink">{activeRisk.title}</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-muted">{activeRisk.severity}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{activeRisk.body}</p>
        </div>
      ) : null}

      <Disclosure label="Risk posture">
        <p>
          Risks highlight where the design may be sensitive to contention, unknown storage behavior, or heuristic assumptions.
          They are conversation guardrails, not automated rejection criteria.
        </p>
      </Disclosure>

      <ConversationHelper show={showConversationLayer}>
        {`Use these as architectural guardrails, not objections. The point is to show where the fabric could become inefficient or harder to operate if the workload profile, storage behavior, or oversubscription target is more aggressive than the current assumptions support. This is where telemetry, visibility, and operational discipline start to matter.`}
      </ConversationHelper>
    </Card>
  );
}
