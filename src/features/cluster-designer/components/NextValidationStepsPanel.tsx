import { Card } from "@/components/ui/Card";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import { getOversubscriptionResult } from "@/features/cluster-designer/lib/designSelectors";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type NextValidationStepsPanelProps = {
  design: DesignEngineResult;
};

export function NextValidationStepsPanel({ design }: NextValidationStepsPanelProps) {
  const { showConversationLayer } = useConversationLayer();
  const oversubscriptionResult = getOversubscriptionResult(design);
  const steps = [
    "Validate exact Arista platform families, port modes, and any breakout constraints against the latest supported hardware guidance.",
    `Confirm optics and cabling reach assumptions from rack plan, row spacing, and preferred media policy. Keep passive DAC intra-rack only and treat the modeled ${design.inputs.representativeInterRackDistanceMeters}m inter-rack paths as AOC or pluggable-optics territory.`,
    "Review storage interaction, especially checkpoint behavior and burst concurrency, against the modeled traffic profile.",
    "Validate queueing, ECN, and any RoCE-related policy requirements before treating the design as implementation-ready.",
    `Pressure-test the ${oversubscriptionResult.actual} modeled oversubscription result with the customer’s actual training, inference, or HPC traffic expectations.`,
  ];

  return (
    <Card eyebrow="8. Validation Checklist" title="Validation checklist" accent="indigo">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4 rounded-[20px] border border-line/70 p-4">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line text-sm font-semibold text-ink">
              {index + 1}
            </div>
            <p className="text-sm leading-6 text-muted">{step}</p>
          </div>
        ))}
      </div>

      <ConversationHelper show={showConversationLayer}>
        {`Close with this: the Ethernet fabric direction is sound, and these are the engineering checks that turn it into a deployable design. That shows the customer we are being precise about what is decided now versus what still needs validation around operations, visibility, automation, and RoCE behavior.`}
      </ConversationHelper>
    </Card>
  );
}
