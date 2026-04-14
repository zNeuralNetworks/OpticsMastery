import { motion, useReducedMotion } from "framer-motion";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { DesignConfidenceAssessment } from "@/features/cluster-designer/types";

type ConfidenceIndicatorProps = {
  confidence: DesignConfidenceAssessment;
};

const rungMap = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const activeRungs = rungMap[confidence.level];
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-[20px] border border-line/70 p-4">
      <div className="flex items-center gap-2">
        <p className="data-label">Confidence</p>
        <InfoTooltip label="Confidence">
          Confidence reflects input completeness and heuristic weight. Low confidence can come from missing information, not just from a weak design.
        </InfoTooltip>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["low", "medium", "high"].map((step, index) => (
          <motion.div
            key={step}
            className={`rounded-[14px] px-3 py-3 text-center text-xs uppercase tracking-[0.22em] ${
              index < activeRungs
                ? "border border-indigo/45 bg-indigo/12 text-ink"
                : "border border-border bg-space text-label"
            }`}
            initial={reduceMotion ? false : { opacity: 0.6, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : index * 0.04 }}
          >
            {step}
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {confidence.reasons.map((reason) => (
          <Chip key={reason} tone="indigo">
            {summarizeConfidenceReason(reason)}
          </Chip>
        ))}
      </div>
      <Disclosure className="mt-3" label="Confidence reasoning">
        <div className="space-y-3">
          <p>{confidence.summary}</p>
          <p>Basis: {confidence.basis.replaceAll("-", " ")}.</p>
          <ul className="space-y-2">
            {confidence.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </Disclosure>
    </div>
  );
}

function summarizeConfidenceReason(reason: string) {
  if (reason.includes("oversubscription")) return "Oversub sensitivity";
  if (reason.includes("Storage")) return "Storage assumptions";
  if (reason.includes("east-west")) return "East-west intensity";
  if (reason.includes("NIC bandwidth")) return "NIC bandwidth";
  if (reason.includes("Training communication")) return "Training heuristics";
  if (reason.includes("Severe communication")) return "Severe collectives";
  return "Model assumption";
}
