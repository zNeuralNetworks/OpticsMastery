import { Card } from "@/components/ui/Card";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type HardwareBomPanelProps = {
  design: DesignEngineResult;
};

export function HardwareBomPanel({ design }: HardwareBomPanelProps) {
  const { showConversationLayer } = useConversationLayer();
  const bom = design.topologyRecommendation.hardwareBom;

  return (
    <Card eyebrow="Hardware BOM" title="Modular chassis BOM summary" accent="indigo">
      {bom.length === 0 ? (
        <div className="card-subtle p-4 text-sm leading-6 text-muted">
          No modular 7800R4 chassis BOM is being decomposed in the current recommendation.
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <SummaryFact label="Leaf class" value={design.topologyRecommendation.recommendedLeaf.name} />
            <SummaryFact label="Spine class" value={design.topologyRecommendation.recommendedSpine.name} />
            <SummaryFact label="Leaf selection" value={design.topologyRecommendation.leafSelectionRationale} />
            <SummaryFact label="Spine selection" value={design.topologyRecommendation.spineSelectionRationale} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Component</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {bom.map((item) => (
                  <tr key={`${item.role}-${item.componentType}-${item.sku}`} className="border-t border-line/70">
                    <td className="py-3.5 capitalize text-ink">{item.role}</td>
                    <td className="py-3.5 capitalize text-ink">{item.componentType.replaceAll("-", " ")}</td>
                    <td className="py-3.5 text-ink">{item.sku}</td>
                    <td className="py-3.5 text-ink">{item.quantity}</td>
                    <td className="py-3.5 text-muted">{item.source === "auto-hardware-policy" ? "Auto" : "Manual"}</td>
                    <td className="py-3.5 text-muted">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConversationHelper show={showConversationLayer}>
        {`Use this as a directional modular hardware decomposition, not as a final orderable bill. The planner is intentionally surfacing chassis, supervisors, AI linecards, fabric modules, and cooling modules so the customer sees the impact of moving to a larger modular spine class before PSU, rack, and final platform validation work begins.`}
      </ConversationHelper>
    </Card>
  );
}

function SummaryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-subtle p-4">
      <p className="data-label">{label}</p>
      <p className="mt-3 text-sm leading-6 text-ink">{value}</p>
    </div>
  );
}
