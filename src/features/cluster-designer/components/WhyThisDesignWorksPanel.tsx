import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type WhyThisDesignWorksPanelProps = {
  design: DesignEngineResult;
};

export function WhyThisDesignWorksPanel({ design }: WhyThisDesignWorksPanelProps) {
  const { showConversationLayer } = useConversationLayer();

  return (
    <Card eyebrow="Why This Design Works" title="Why this design works" accent="emerald">
      <div className="grid gap-3 md:grid-cols-2">
        {design.whyThisDesignWorks.map((item) => (
          <div key={item} className="card-subtle p-4">
            <p className="text-sm font-medium text-ink">{whyLabel(item)}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item}</p>
          </div>
        ))}
      </div>

      <Disclosure className="mt-4" label="Why this matters">
        <p>
          These are the specific reasons the recommendation is directionally defensible in an enterprise AI conversation.
          They are short on purpose, but each maps back to a real design tradeoff in bandwidth, growth, storage, or communication behavior.
        </p>
      </Disclosure>

      <ConversationHelper show={showConversationLayer}>
        This is the short customer answer: the design keeps the main fabric tradeoffs visible, protects east-west behavior where training communication matters, and makes the remaining validation items explicit instead of pretending the architecture is already implementation-complete.
      </ConversationHelper>
    </Card>
  );
}

function whyLabel(item: string) {
  if (item.includes("nonblocking")) return "Near nonblocking";
  if (item.includes("oversubscription")) return "Visible tradeoff";
  if (item.includes("Growth buffer")) return "Growth absorbed";
  if (item.includes("Storage")) return "Storage interaction";
  if (item.includes("spine bandwidth")) return "Spine protection";
  return "Validation-ready";
}
