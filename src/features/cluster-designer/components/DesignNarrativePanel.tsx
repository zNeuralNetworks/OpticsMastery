import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type DesignNarrativePanelProps = {
  design: DesignEngineResult;
};

export function DesignNarrativePanel({ design }: DesignNarrativePanelProps) {
  const { showConversationLayer } = useConversationLayer();
  return (
    <Card eyebrow="7. Design Narrative" title="Design narrative" accent="emerald">
      <div className="card-subtle p-4">
        <p className="data-label">Default summary</p>
        <p className="mt-3 text-sm leading-6 text-muted">{design.structuredNarrative.architectureSummary}</p>
      </div>

      <div className="mt-4 space-y-3">
        <Disclosure label="Design tradeoffs">
          <ul className="space-y-2">
            {design.structuredNarrative.designTradeoffs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure label="Operational considerations">
          <ul className="space-y-2">
            {design.structuredNarrative.operationalConsiderations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Disclosure>
      </div>

      <ConversationHelper show={showConversationLayer}>
        {`This is the live talk track. It lets you explain why an Ethernet fabric with RoCE can be credible for enterprise AI: the customer gets open standards networking, scale-out leaf-spine behavior, familiar operating practices, and room for telemetry and automation, while we stay explicit about where queueing, storage, and validation still matter.`}
      </ConversationHelper>
    </Card>
  );
}
