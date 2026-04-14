import { Card } from "@/components/ui/Card";
import { AssumptionMap } from "@/features/cluster-designer/components/AssumptionMap";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type AssumptionsPanelProps = {
  design: DesignEngineResult;
};

export function AssumptionsPanel({ design }: AssumptionsPanelProps) {
  const { showConversationLayer } = useConversationLayer();
  return (
    <Card eyebrow="Optics / Storage Assumptions" title="Optics and storage assumptions" accent="cyan">
      <div className="space-y-6">
        <div>
          <p className="data-label">Optics and cabling</p>
          <div className="mt-3">
            <AssumptionMap assumptions={design.opticsAssumptions} />
          </div>
        </div>

        {design.storageAssumptions.length > 0 ? (
          <div>
            <p className="data-label">Storage fabric</p>
            <div className="mt-3">
              <AssumptionMap assumptions={design.storageAssumptions} />
            </div>
          </div>
        ) : null}
      </div>

      <ConversationHelper show={showConversationLayer}>
        {`The right customer message is that we already know the Ethernet fabric class we need, but optics, cabling, and storage behavior still depend on reach, rack layout, checkpoint posture, and media policy. That is why this section stays assumption-driven instead of pretending we have final validated hardware or queue-policy choices.`}
      </ConversationHelper>
    </Card>
  );
}
